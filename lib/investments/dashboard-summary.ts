import { totals, statuses, categories } from './money.ts';
import { portfolioSummary } from './portfolio.ts';

export type DashboardVehicle = { id:string; title:string; status:keyof typeof statuses; purchase_cents:number|null; asking_cents:number|null; sale_cents:number|null; created_at:string };
export type DashboardExpense = { vehicle_id:string; amount_cents:number; category?:string };

export function dashboardInvestmentSummary(vehicles:DashboardVehicle[], activeExpenses:DashboardExpense[]) {
  const costs=new Map<string,number[]>();
  for(const expense of activeExpenses) {
    const items=costs.get(expense.vehicle_id)??[];
    items.push(expense.amount_cents);costs.set(expense.vehicle_id,items);
  }
  const rows=vehicles.map(vehicle=>({...vehicle,summary:totals(vehicle.purchase_cents,costs.get(vehicle.id)??[],vehicle.asking_cents,vehicle.sale_cents)}));
  const activeRows=rows.filter(row=>row.status!=='sold');
  const activeIds=new Set(activeRows.map(row=>row.id));
  const activeCosts=activeExpenses.filter(expense=>activeIds.has(expense.vehicle_id));
  const byCategory=new Map<string,number>();
  for(const expense of activeCosts) {
    const category=expense.category && Object.hasOwn(categories,expense.category) ? expense.category : 'unclassified';
    byCategory.set(category,(byCategory.get(category)??0)+expense.amount_cents);
  }
  return {
    activePurchase:activeRows.reduce((sum,row)=>sum+(row.purchase_cents??0),0),
    activeExpenses:activeRows.reduce((sum,row)=>sum+row.summary.expensesTotal,0),
    expenseCategories:[...Object.entries(categories),['unclassified','Sin clasificar']].map(([key,label])=>({key,label,amount:byCategory.get(key)??0})),
    portfolio:portfolioSummary(rows),
    stages:Object.entries(statuses).map(([key,label])=>({key,label,count:rows.filter(row=>row.status===key).length})),
    // Query supplies a stable newest-first order; do not invent activity dates.
    recent:rows.slice(0,4),
    count:rows.length,
  };
}

// Each vehicle uses the same zero-origin scale for its two bars. Missing values
// stay missing and losses never become a made-up positive percentage.
export function comparisonWidths(cost:number|null, reference:number|null) {
  if(cost===null || reference===null) return null;
  const scale=Math.max(cost,reference,1);
  return { cost:cost/scale*100, reference:reference/scale*100 };
}
