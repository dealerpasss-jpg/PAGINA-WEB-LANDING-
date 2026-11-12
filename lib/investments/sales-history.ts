import { totals } from './money.ts';
import { investmentDate } from './validation.ts';
import type { DashboardVehicle, DashboardExpense } from './dashboard-summary.ts';

export function salesHistory(vehicles:DashboardVehicle[], expenses:DashboardExpense[], month?:string) {
  const validMonth=month&&/^\d{4}-(0[1-9]|1[0-2])$/.test(month)?month:null;
  const byVehicle=new Map<string,number[]>();
  for(const expense of expenses) {const values=byVehicle.get(expense.vehicle_id)??[];values.push(expense.amount_cents);byVehicle.set(expense.vehicle_id,values);}
  const all=vehicles.filter(v=>v.status==='sold').map(v=>{
    let date:string|null=null;try{date=investmentDate(v.sold_on??'');}catch{/* Preserve unknown dates as unknown. */}
    return {...v,sold_on:date,summary:totals(v.purchase_cents,byVehicle.get(v.id)??[],v.asking_cents,v.sale_cents)};
  }).sort((a,b)=>(b.sold_on??'').localeCompare(a.sold_on??'')||a.title.localeCompare(b.title)||a.id.localeCompare(b.id));
  const rows=validMonth?all.filter(v=>v.sold_on?.startsWith(validMonth)):all;
  return {rows,month:validMonth,undated:all.filter(v=>!v.sold_on).length,totalCount:all.length,
    revenue:rows.reduce((s,v)=>s+(v.sale_cents??0),0),profit:rows.reduce((s,v)=>s+(v.summary.realized??0),0),
    missingSale:rows.filter(v=>v.sale_cents===null).length,missingResult:rows.filter(v=>v.summary.realized===null).length};
}
