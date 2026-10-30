import { totals, statuses } from './money.ts';
import { portfolioSummary } from './portfolio.ts';

export type DashboardVehicle = { id:string; title:string; status:keyof typeof statuses; purchase_cents:number|null; asking_cents:number|null; sale_cents:number|null; created_at:string };
export type DashboardExpense = { vehicle_id:string; amount_cents:number };

export function dashboardInvestmentSummary(vehicles:DashboardVehicle[], activeExpenses:DashboardExpense[]) {
  const costs=new Map<string,number[]>();
  for(const expense of activeExpenses) {
    const items=costs.get(expense.vehicle_id)??[];
    items.push(expense.amount_cents);costs.set(expense.vehicle_id,items);
  }
  const rows=vehicles.map(vehicle=>({...vehicle,summary:totals(vehicle.purchase_cents,costs.get(vehicle.id)??[],vehicle.asking_cents,vehicle.sale_cents)}));
  return {
    portfolio:portfolioSummary(rows),
    stages:Object.entries(statuses).map(([key,label])=>({key,label,count:rows.filter(row=>row.status===key).length})),
    // Query supplies a stable newest-first order; do not invent activity dates.
    recent:rows.slice(0,4),
    count:rows.length,
  };
}
