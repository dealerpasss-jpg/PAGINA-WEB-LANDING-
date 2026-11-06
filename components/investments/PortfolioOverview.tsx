import { usd } from '@/lib/investments/money';
import { portfolioSummary } from '@/lib/investments/portfolio';

type Summary = ReturnType<typeof portfolioSummary>;
export default function PortfolioOverview({ summary: s }: { summary: Summary }) {
  return <section aria-label="Resumen financiero administrativo">
    <div className="investment-stats investment-portfolio-stats">
      <article><span>CARROS ACTIVOS</span><strong>{s.activeCount}</strong><small>{s.soldCount} vendidos · {s.activeCount + s.soldCount} registrados</small></article>
      <article><span>{s.activeMissingPurchase ? 'SUBTOTAL REGISTRADO · ACTIVOS' : 'COMPRA + GASTOS REGISTRADOS · ACTIVOS'}</span><strong>{usd(s.activeRecordedCost)}</strong><small>{s.activeMissingPurchase ? `${s.activeMissingPurchase} compras pendientes de completar; incluye sus gastos registrados.` : 'Solo carros sin vender. No es saldo de caja.'}</small></article>
      <article><span>VENTAS REGISTRADAS</span><strong>{s.soldCount ? s.soldMissingSale===s.soldCount ? 'Pendiente' : usd(s.registeredSales) : 'Sin ventas'}</strong><small>{s.soldMissingSale ? `${s.soldMissingSale} cierres sin precio. Subtotal de importes conocidos.` : 'Precios de cierre. No confirma cobros recibidos.'}</small></article>
      <article><span>{s.realizedPendingCount ? 'RESULTADO PARCIAL · VENDIDOS' : 'RESULTADO REALIZADO · REGISTRADO'}</span><strong>{s.realizedKnownCount ? usd(s.realizedRecorded) : s.soldCount ? 'Pendiente' : 'Sin ventas'}</strong><small>{s.realizedPendingCount ? `${s.realizedKnownCount} cierres calculables; ${s.realizedPendingCount} pendientes de compra o venta.` : 'Venta menos compra y gastos registrados. No equivale a dinero cobrado o repartido.'}</small></article>
    </div>
    <p className="investment-note">Las ventas registradas no confirman cobros recibidos. Todos los montos están en USD. Los costos y resultados son privados de administración. Un gasto no registrado no está incluido; los aportes de socios no son ventas ni ganancias.</p>
  </section>;
}
