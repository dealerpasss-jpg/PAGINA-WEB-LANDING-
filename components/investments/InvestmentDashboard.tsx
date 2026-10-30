import Link from 'next/link';
import ArrowIcon from '@/components/ArrowIcon';
import { usd, statuses } from '@/lib/investments/money';
import type { InvestmentDashboardState } from '@/lib/investments/dashboard-server';
import PortfolioOverview from './PortfolioOverview';
import styles from './InvestmentDashboard.module.css';

export default function InvestmentDashboard({ data }: { data:InvestmentDashboardState }) {
  if(data.state==='hidden') return null;
  return <section className={styles.section} aria-labelledby="vehicle-dashboard-title">
    <div className={styles.heading}><div><span className="dashboard-eyebrow">ADMINISTRACIÓN / DATOS REGISTRADOS</span><h2 id="vehicle-dashboard-title">Tus vehículos, en números.</h2><p>Compra, gastos y cierre de tus fichas privadas. Sin mezclarlo con el catálogo público.</p></div><Link className="dashboard-cta" href="/mi-cuenta/inversiones">Ver inversiones <ArrowIcon /></Link></div>
    {data.state==='unavailable' ? <div className={styles.empty} role="alert"><h3>No pudimos cargar tus inversiones.</h3><p>No se muestran ceros ni totales parciales ante un error. Vuelve a cargar el panel o entra a tus fichas.</p><Link href="/mi-cuenta/inversiones">Abrir inversiones <ArrowIcon /></Link></div> : <>
      <PortfolioOverview summary={data.snapshot.portfolio} />
      <div className={styles.stages} aria-label="Vehículos por estado">{data.snapshot.stages.map(stage=><div key={stage.key}><span>{stage.label}</span><strong>{stage.count}</strong></div>)}</div>
      {data.snapshot.count ? <div className={styles.recent}><div className={styles.recentHeading}><h3>Últimos carros registrados</h3><span>{Math.min(data.snapshot.count,4)} de {data.snapshot.count}</span></div><div className={styles.cards}>{data.snapshot.recent.map(vehicle=><article key={vehicle.id}><div className={styles.cardHeading}><span>{statuses[vehicle.status]}</span><h4>{vehicle.title}</h4></div><dl><div><dt>Inversión registrada</dt><dd>{vehicle.summary.cost===null?'Pendiente':usd(vehicle.summary.cost)}</dd></div><div><dt>Gastos vigentes</dt><dd>{usd(vehicle.summary.expensesTotal)}</dd></div><div><dt>{vehicle.status==='sold'?'Resultado realizado¹':'Ganancia estimada¹'}</dt><dd>{usd(vehicle.status==='sold'?vehicle.summary.realized:vehicle.summary.estimated)}</dd></div></dl>{vehicle.purchase_cents===null&&<p>Falta el precio de compra; sus gastos no se pierden ni se supone compra en cero.</p>}<Link className="dashboard-cta" href={'/mi-cuenta/inversiones/'+vehicle.id}>Abrir ficha <ArrowIcon /></Link></article>)}</div><p className={styles.disclaimer}>¹ Según compra y gastos registrados. La ganancia estimada depende del precio de venta de referencia registrado; no es una venta realizada ni dinero cobrado.</p></div> : <div className={styles.empty}><h3>Aún no has registrado compras.</h3><p>Tu primer carro y sus gastos aparecerán aquí cuando los guardes.</p><Link className="dashboard-cta" href="/mi-cuenta/inversiones#nuevo-vehiculo">Registrar una compra <ArrowIcon /></Link></div>}
    </>}
  </section>;
}
