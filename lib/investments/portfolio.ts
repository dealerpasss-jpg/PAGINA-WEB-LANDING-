import type { totals } from './money';

type PortfolioRow = {
  status: string;
  purchase_cents: number | null;
  sale_cents: number | null;
  summary: ReturnType<typeof totals>;
};

// Recorded vehicle economics, not a cash ledger. Missing amounts stay missing;
// known subtotals remain useful without implying the portfolio is complete.
export function portfolioSummary(rows: PortfolioRow[]) {
  const active = rows.filter(row => row.status !== 'sold');
  const sold = rows.filter(row => row.status === 'sold');
  return {
    activeCount: active.length,
    soldCount: sold.length,
    activeRecordedCost: active.reduce((sum, row) => sum + (row.summary.cost ?? row.summary.expensesTotal), 0),
    activeMissingPurchase: active.filter(row => row.purchase_cents === null).length,
    registeredSales: sold.reduce((sum, row) => sum + (row.sale_cents ?? 0), 0),
    soldMissingSale: sold.filter(row => row.sale_cents === null).length,
    realizedRecorded: sold.reduce((sum, row) => sum + (row.summary.realized ?? 0), 0),
    realizedKnownCount: sold.filter(row => row.summary.realized !== null).length,
    realizedPendingCount: sold.filter(row => row.summary.realized === null).length,
  };
}
