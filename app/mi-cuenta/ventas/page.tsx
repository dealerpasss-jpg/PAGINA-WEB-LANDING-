import Link from 'next/link';
import { redirect } from 'next/navigation';
import AccountShell from '@/components/AccountShell';
import SalesRefresh from '@/components/investments/SalesRefresh';
import { requireIdentity, database } from '@/lib/academy/server';
import { allRows } from '@/lib/investments/server';
import { salesHistory } from '@/lib/investments/sales-history';
import { usd } from '@/lib/investments/money';
import type { DashboardVehicle, DashboardExpense } from '@/lib/investments/dashboard-summary';
import styles from './sales.module.css';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{mes?:string}>}) {
  const who=await requireIdentity('/mi-cuenta/ventas');
  if(who.profile.role!=='admin')redirect('/mi-cuenta');
  const {mes}=await searchParams;
  let history:ReturnType<typeof salesHistory>|null=null;
  try {
    const db=database();
    const [vehicles,expenses]=await Promise.all([
      allRows<DashboardVehicle>((from,to)=>db.from('investment_vehicles').select('id,title,status,purchase_cents,asking_cents,sale_cents,sold_on,created_at').eq('status','sold').order('id').range(from,to)),
      allRows<DashboardExpense>((from,to)=>db.from('investment_expenses').select('vehicle_id,amount_cents').is('voided_at',null).order('id').range(from,to)),
    ]);
    history=salesHistory(vehicles,expenses,mes);
  }catch{/* A failed read is not a zero balance. */}
  const refreshed=new Intl.DateTimeFormat('es-US',{timeZone:'America/New_York',dateStyle:'short',timeStyle:'medium'}).format(new Date());
  return <AccountShell team kicker="DEALERPASS / HISTORIAL PRIVADO" title="Tus ventas. Tu ganancia.">
    <p>Cada carro vendido, su fecha de cierre y el resultado según los costos registrados. Solo visible para administración.</p>
    <div className={styles.toolbar}><Link className="dashboard-text-link" href="/mi-cuenta/inversiones">← Volver a Inversiones</Link><SalesRefresh/></div>
    {!history?<p role="alert" className="investment-pending">No pudimos cargar el historial. Vuelve a actualizar; no se han modificado tus registros.</p>:<>
      <p className={styles.sync}>Consultado: {refreshed} · hora de Tampa. Se actualiza cada 30 segundos mientras esta página está visible y tienes conexión.</p>
      <form className={styles.filter} action="/mi-cuenta/ventas" method="get"><label>Filtrar por mes<input type="month" name="mes" defaultValue={history.month??''}/></label><button type="submit" className="dashboard-cta">Ver ventas</button><Link href="/mi-cuenta/ventas">Ver todas</Link></form>
      <div className={styles.metrics}><article><span>CARROS VENDIDOS</span><strong>{history.rows.length}</strong><small>{history.month?'En el mes seleccionado':'Todo el historial'}</small></article><article><span>{history.missingSale?'VENTAS · SUBTOTAL CONOCIDO':'VENTAS REGISTRADAS'}</span><strong>{history.rows.length&&history.missingSale===history.rows.length?'Pendiente':usd(history.revenue)}</strong><small>Precio de cierre, no cobros recibidos</small></article><article><span>{history.missingResult?'GANANCIA · RESULTADO PARCIAL':'GANANCIA SEGÚN REGISTROS'}</span><strong>{history.rows.length&&history.missingResult===history.rows.length?'Pendiente':usd(history.profit)}</strong><small>Venta − compra − gastos registrados</small></article></div>
      {history.undated>0&&<p className="investment-pending">{history.undated} {history.undated===1?'venta sin fecha confirmada':'ventas sin fecha confirmada'}. Se muestran en «Ver todas», pero no en el filtro por mes. Completa la fecha real desde la ficha del carro.</p>}
      {(history.missingResult>0||history.missingSale>0)&&<p className="investment-pending">Hay importes pendientes. Los subtotales incluyen solo los valores conocidos; un costo desconocido no se considera cero.</p>}
      <section aria-label="Ventas por vehículo" className={styles.list}>{!history.rows.length?<div className="account-card"><h2>{history.totalCount?'No hay ventas en este mes.':'Todavía no hay ventas registradas.'}</h2><p>Los cierres aparecerán aquí cuando marques el vehículo como vendido en su ficha.</p></div>:history.rows.map(v=><article className={styles.card} key={v.id}><header><div><span className={styles.date}>{v.sold_on?<time dateTime={v.sold_on}>{new Intl.DateTimeFormat('es-US',{timeZone:'UTC',day:'numeric',month:'long',year:'numeric'}).format(new Date(v.sold_on+'T12:00:00Z'))}</time>:'Fecha de venta pendiente'}</span><h2>{v.title}</h2></div><span className={styles.badge}>Vendido</span></header><dl><div><dt>Precio de venta</dt><dd>{usd(v.sale_cents)}</dd></div><div><dt>Compra registrada</dt><dd>{usd(v.purchase_cents)}</dd></div><div><dt>Gastos registrados</dt><dd>{usd(v.summary.expensesTotal)}</dd></div><div><dt>Inversión registrada</dt><dd>{usd(v.summary.cost)}</dd></div><div className={styles.result} data-negative={v.summary.realized!==null&&v.summary.realized<0}><dt>{v.summary.realized!==null&&v.summary.realized<0?'Pérdida según registros':'Ganancia según registros'}</dt><dd>{usd(v.summary.realized)}</dd></div></dl><Link href={'/mi-cuenta/inversiones/'+v.id}>Ver ficha, gastos y corregir fecha →</Link></article>)}</section>
      <p className="investment-note">USD · La ganancia se recalcula si corriges la compra, la venta o los gastos. No incluye gastos sin registrar ni confirma dinero cobrado, saldo de caja o repartos a socios. Conserva los comprobantes y completa todos los costos.</p>
    </>}
  </AccountShell>;
}
