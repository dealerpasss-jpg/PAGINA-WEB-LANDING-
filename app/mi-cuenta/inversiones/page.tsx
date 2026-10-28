import ArrowIcon from "@/components/ArrowIcon";
import Link from 'next/link';
import AccountShell from '@/components/AccountShell';
import VehicleForm, {type Vehicle} from '@/components/investments/VehicleForm';
import { investmentIdentity, allRows } from '@/lib/investments/server';
import { usd, totals, statuses } from '@/lib/investments/money';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{message?:string}>}) {
 const {db,admin}=await investmentIdentity();const {message}=await searchParams;
 const [vehicles,expenses]=await Promise.all([
 allRows<Vehicle>((from,to)=>db.from('investment_vehicles').select('*').order('created_at',{ascending:false}).order('id').range(from,to)),
 allRows<{vehicle_id:string;amount_cents:number}>((from,to)=>db.from('investment_expenses').select('vehicle_id,amount_cents').is('voided_at',null).order('id').range(from,to))
 ]);
 const rows=vehicles.map(v=>({...v,summary:totals(v.purchase_cents,expenses.filter(e=>e.vehicle_id===v.id).map(e=>e.amount_cents),v.asking_cents,v.sale_cents)}));
 return <AccountShell kicker="DEALERPASS / VEHÍCULOS E INVERSIONES" title={admin?'Las cuentas de cada carro.':'Mis vehículos e inversiones.'}>
 <p>{admin?'Administra compras, gastos, fotos y participantes en un solo lugar.':'Consulta únicamente los vehículos que el administrador ha compartido contigo.'}</p>
 <p className="investment-note">Montos en USD. El resultado se calcula con los gastos registrados; los aportes de socios no son ganancias ni gastos del vehículo.</p>
 {message&&<p className="account-notice" role="status">{message}</p>}
 <div className="investment-stats"><article><span>VEHÍCULOS VISIBLES</span><strong>{rows.length}</strong></article><article><span>COSTO DE LOS NO VENDIDOS</span><strong>{usd(rows.filter(v=>v.status!=='sold').reduce((s,v)=>s+v.summary.cost,0))}</strong></article><article><span>RESULTADO DE LOS VENDIDOS</span><strong>{usd(rows.filter(v=>v.status==='sold').reduce((s,v)=>s+(v.summary.realized||0),0))}</strong></article></div>
 {!admin&&<p className="investment-note">Estos totales corresponden a los vehículos completos que puedes ver, no a tu parte de las ganancias.</p>}
 {admin&&<details className="account-card"><summary>+ Registrar un vehículo</summary><VehicleForm/></details>}
 {!rows.length&&<div className="investment-empty"><h2>{admin?'Registra tu primer carro.':'Todavía no tienes vehículos asignados.'}</h2><p>{admin?'Empieza por el costo de compra; después añade fotos, gastos y participantes.':'Pide al administrador que te asigne con el mismo correo confirmado de tu cuenta.'}</p></div>}
 <div className="investment-grid">{rows.map(v=><article className="account-card" key={v.id}><span className="investment-status">{statuses[v.status]}</span><h2>{v.title}</h2><p>{v.auction||'Sin subasta registrada'} · {v.purchased_on}</p><dl className="investment-finance"><div><dt>Inversión total</dt><dd>{usd(v.summary.cost)}</dd></div><div><dt>{v.status==='sold'?'Precio de cierre':'Precio publicado'}</dt><dd>{usd(v.status==='sold'?v.sale_cents:v.asking_cents)}</dd></div><div><dt>{v.status==='sold'?'Resultado registrado':'Ganancia estimada'}</dt><dd>{usd(v.status==='sold'?v.summary.realized:v.summary.estimated)}</dd></div></dl><div className="investment-actions"><Link href={'/mi-cuenta/inversiones/'+v.id}>Ver fotos y cuentas <ArrowIcon direction="right" /></Link></div></article>)}</div>
 </AccountShell>;
}
