import Link from 'next/link';
import VehicleStatus from './VehicleStatus';
import SalesPerformance from './SalesPerformance';
import ArrowIcon from '@/components/ArrowIcon';
import { usd, statuses } from '@/lib/investments/money';
import { comparisonWidths } from '@/lib/investments/dashboard-summary';
import type { InvestmentDashboardState } from '@/lib/investments/dashboard-server';
import styles from './InvestmentDashboard.module.css';

type Snapshot = Extract<InvestmentDashboardState,{state:'ready'}>['snapshot'];

function FinancialCharts({ snapshot:s }: { snapshot:Snapshot }) {
  const total=s.portfolio.activeRecordedCost;
  const purchaseShare=total>0?s.activePurchase/total*100:0;
  const expenseShare=total>0?s.activeExpenses/total*100:0;
  return <div className={styles.charts}>
    <figure className={styles.costChart} aria-labelledby="cost-chart-title">
      <figcaption><span className={styles.eyebrow}>CAPITAL REGISTRADO · ACTIVOS</span><h3 id="cost-chart-title">¿Dónde está tu inversión?</h3></figcaption>
      <div className={styles.costComposition}>
        <div className={styles.donut} aria-hidden="true">
          <svg viewBox="0 0 120 120" fill="none"><circle className={styles.track} cx="60" cy="60" r="48" pathLength="100" />{purchaseShare>0&&<circle className={styles.purchaseArc} cx="60" cy="60" r="48" pathLength="100" strokeDasharray={`${purchaseShare} ${100-purchaseShare}`} />}{expenseShare>0&&<circle className={styles.expenseArc} cx="60" cy="60" r="48" pathLength="100" strokeDasharray={`${expenseShare} ${100-expenseShare}`} strokeDashoffset={-purchaseShare} />}</svg>
          <div><strong>USD</strong><span>registrados</span></div>
        </div>
        <dl className={styles.legend}><div><dt><i className={styles.purchaseDot} aria-hidden="true" />Compras registradas</dt><dd>{usd(s.activePurchase)}</dd></div><div><dt><i className={styles.expenseDot} aria-hidden="true" />Gastos vigentes</dt><dd>{usd(s.activeExpenses)}</dd></div></dl>
      </div>
      <p className={styles.chartNote}>{total===0?'No hay importes registrados para dibujar la distribución.':s.portfolio.activeMissingPurchase?'Distribución del subtotal conocido; faltan precios de compra.':'Proporción de compra y gastos registrados, solo de carros activos.'}</p>
      <details className={styles.breakdown}><summary>Ver gastos por categoría <ArrowIcon direction="down" /></summary><div>{s.expenseCategories.map(category=><div className={styles.category} key={category.key}><div><span>{category.label}</span><strong>{usd(category.amount)}</strong></div><div className={styles.categoryTrack} aria-hidden="true"><i style={{width:`${s.activeExpenses>0?category.amount/s.activeExpenses*100:0}%`}} /></div></div>)}</div><p>Proporción de los gastos vigentes de carros activos. Se conservan las categorías originales; no se deducen conceptos de registros anteriores.</p></details>
    </figure>
    <figure className={styles.statusChart} aria-labelledby="status-chart-title">
      <figcaption><span className={styles.eyebrow}>INVENTARIO PRIVADO</span><h3 id="status-chart-title">De compra a venta.</h3></figcaption>
      <div className={styles.inventoryTotal}><strong>{s.count}</strong><span>carros registrados<br />{s.portfolio.activeCount} activos · {s.portfolio.soldCount} vendidos</span></div>
      <div className={styles.statusTrack} aria-hidden="true">{s.stages.filter(stage=>stage.count>0).map(stage=><i key={stage.key} data-stage={stage.key} style={{width:`${stage.count/s.count*100}%`}} />)}</div>
      <dl className={styles.stageList}>{s.stages.map(stage=><div key={stage.key}><dt><VehicleStatus status={stage.key as keyof typeof statuses} dark/></dt><dd>{stage.count}</dd></div>)}</dl>
      <p className={styles.chartNote}>Distribución actual por estado. No es una gráfica de crecimiento ni de cobros.</p>
    </figure>
  </div>;
}

function VehicleComparison({ vehicle }: { vehicle:Snapshot['recent'][number] }) {
  const sold=vehicle.status==='sold';
  const reference=sold?vehicle.sale_cents:vehicle.asking_cents;
  const bars=comparisonWidths(vehicle.summary.cost,reference);
  const result=sold?vehicle.summary.realized:vehicle.summary.estimated;
  return <>
    <dl className={styles.vehicleNumbers}><div><dt>Inversión registrada</dt><dd>{vehicle.summary.cost===null?'Pendiente':usd(vehicle.summary.cost)}</dd></div><div><dt>Gastos incluidos</dt><dd>{usd(vehicle.summary.expensesTotal)}</dd></div></dl>
    {bars ? <div className={styles.comparison}><div className={styles.comparisonLabel}><span>Inversión</span><span>{sold?'Venta registrada':'Venta de referencia'}</span></div><div className={styles.compareTrack} aria-hidden="true"><i style={{width:`${bars.cost}%`}} /></div><div className={`${styles.compareTrack} ${styles.referenceTrack}`} aria-hidden="true"><i style={{width:`${bars.reference}%`}} /></div><div className={styles.referenceValue}><span>{sold?'Precio de cierre':'Precio de referencia'}</span><strong>{usd(reference)}</strong></div><small>Escala propia por carro · desde $0</small></div> : <p className={styles.pending}>{vehicle.purchase_cents===null?'Falta el precio de compra. No se estima ganancia con costos incompletos.':sold?'Falta el precio de cierre.':'Falta el precio de venta de referencia.'}</p>}
    <div className={styles.vehicleResult} data-negative={result!==null&&result<0}><span>{sold?'Resultado realizado¹':'Ganancia estimada¹'}</span><strong>{result===null?'Pendiente':usd(result)}</strong></div>
  </>;
}

export default function InvestmentDashboard({ data, today, period, anchor }: { data:InvestmentDashboardState; today?:string; period?:string; anchor?:string }) {
  if(data.state==='hidden') return null;
  const s=data.state==='ready'?data.snapshot:null;
  const p=s?.portfolio;
  return <section className={styles.section} aria-labelledby="vehicle-dashboard-title">
    <div className={styles.heading}><div><span className={styles.eyebrow}>CONTROL FINANCIERO · PRIVADO</span><h2 id="vehicle-dashboard-title">Tus inversiones.</h2></div><Link className={styles.manageLink} href="/mi-cuenta/inversiones">Ver fichas <ArrowIcon direction="right" /></Link></div>
    {data.state==='unavailable' ? <div className={styles.empty} role="alert"><h3>No pudimos cargar tus inversiones.</h3><p>No se muestran ceros ni totales parciales ante un error. Vuelve a cargar el panel o entra a tus fichas.</p><Link href="/mi-cuenta/inversiones">Abrir inversiones <ArrowIcon /></Link></div> : s&&p ? <>
      {today&&<SalesPerformance sales={s.sales} today={today} period={period} anchor={anchor}/>}
      <dl className={styles.metrics} aria-label="Resumen financiero administrativo">
        <div className={styles.capitalMetric}><dt>{p.activeMissingPurchase?'Inversión parcial':'Inversión registrada'}</dt><dd>{usd(p.activeRecordedCost)}</dd><small>Compra + gastos · activos</small></div>
        <div><dt>Gastos registrados</dt><dd>{usd(s.activeExpenses)}</dd><small>Incluidos en inversión · activos</small></div>
        <div><dt>Carros activos</dt><dd>{p.activeCount}</dd><small>Comprados, reparación y venta</small></div>
        <div><dt>Carros vendidos</dt><dd>{p.soldCount}</dd><small>{s.count} registrados en total</small></div>
      </dl>
      {p.activeMissingPurchase>0&&<p className={styles.coverage}><span aria-hidden="true">!</span><span><strong>{p.activeMissingPurchase} {p.activeMissingPurchase===1?'compra pendiente':'compras pendientes'} de completar.</strong> El subtotal incluye sus gastos, no compras en cero.</span></p>}
      {s.count>0 ? <FinancialCharts snapshot={s} /> : <div className={styles.empty}><h3>Aún no has registrado compras.</h3><p>Tu primer carro y sus gastos aparecerán aquí cuando los guardes.</p><Link className="dashboard-cta" href="/mi-cuenta/inversiones#nuevo-vehiculo">Registrar una compra <ArrowIcon /></Link></div>}
      <div className={styles.closing}><div><span>Ventas registradas</span><strong>{p.soldCount?p.soldMissingSale===p.soldCount?'Pendiente':usd(p.registeredSales):'Sin ventas'}</strong>{p.soldMissingSale>0&&<small>{p.soldMissingSale} precios de cierre pendientes</small>}</div><div><span>{p.realizedPendingCount?'Resultado parcial · vendidos':'Resultado realizado · vendidos'}</span><strong>{p.realizedKnownCount?usd(p.realizedRecorded):p.soldCount?'Pendiente':'Sin ventas'}</strong>{p.realizedPendingCount>0&&<small>{p.realizedPendingCount} cierres sin compra o venta completas</small>}</div></div>
      <p className={styles.disclaimer}>USD · Las ventas registradas no confirman cobros recibidos. No es saldo de caja. Solo costos registrados; los aportes de socios no son ventas ni ganancias.</p>
      {s.count>0&&<div className={styles.recent}><div className={styles.recentHeading}><h3>Inversión por carro</h3><span>Últimos {s.recent.length} de {s.count}</span></div><div className={styles.cards}>{s.recent.map(vehicle=><article key={vehicle.id}><div className={styles.cardHeading}><VehicleStatus status={vehicle.status}/><h4>{vehicle.title}</h4></div><VehicleComparison vehicle={vehicle} /><Link className={styles.cardLink} href={'/mi-cuenta/inversiones/'+vehicle.id}>Abrir ficha <ArrowIcon /></Link></article>)}</div><p className={styles.disclaimer}>¹ Según compra y gastos registrados. La ganancia estimada depende del precio de venta de referencia registrado; no es una venta realizada ni dinero cobrado. Puede cambiar con nuevos gastos.</p></div>}
    </> : null}
  </section>;
}
