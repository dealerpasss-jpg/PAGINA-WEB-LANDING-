import 'server-only';
import { database } from '@/lib/academy/server';
import { allRows } from './server';
import { dashboardInvestmentSummary, type DashboardVehicle, type DashboardExpense } from './dashboard-summary';

export type InvestmentDashboardState =
  | { state:'hidden' }
  | { state:'unavailable' }
  | { state:'ready'; snapshot:ReturnType<typeof dashboardInvestmentSummary> };

// Role comes only from the profile verified by requireIdentity in the server page.
// Do not call investmentIdentity: reading the summary must not claim memberships.
export async function investmentDashboardFor(role:string):Promise<InvestmentDashboardState> {
  if(role!=='admin') return {state:'hidden'};
  try {
    const db=database();
    const [vehicles,expenses]=await Promise.all([
      allRows<DashboardVehicle>((from,to)=>db.from('investment_vehicles').select('id,title,status,purchase_cents,asking_cents,sale_cents,created_at').order('created_at',{ascending:false}).order('id').range(from,to)),
      allRows<DashboardExpense>((from,to)=>db.from('investment_expenses').select('vehicle_id,amount_cents,category').is('voided_at',null).order('id').range(from,to)),
    ]);
    return {state:'ready',snapshot:dashboardInvestmentSummary(vehicles,expenses)};
  } catch {
    // A failed query is not an empty portfolio or a zero balance.
    return {state:'unavailable'};
  }
}
