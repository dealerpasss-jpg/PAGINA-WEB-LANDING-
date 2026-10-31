import { investmentDate } from './validation.ts';

export const salesTimeZone = 'America/New_York';
export function businessDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone:salesTimeZone, year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(now);
  return ['year','month','day'].map(type=>parts.find(part=>part.type===type)!.value).join('-');
}
function validDate(value:string|null|undefined): value is string {
  try { return !!value && investmentDate(value)===value; } catch { return false; }
}
export function closingDate(value:string, status:string, previous:{status:string;sold_on:string|null}|null, purchasedOn:string|null, today:string):string|null {
  const date=investmentDate(value);
  if(status!=='sold') {
    if(date) throw new Error('La fecha de venta corresponde solo a un carro vendido.');
    return null;
  }
  if(!date && (previous?.status!=='sold' || previous.sold_on)) throw new Error('Selecciona la fecha real de venta para registrar este cierre.');
  if(date && date>today) throw new Error('La fecha de venta no puede estar en el futuro.');
  if(date && purchasedOn && date<purchasedOn) throw new Error('La venta no puede ser anterior a la compra.');
  return date;
}
function shift(date:string, days:number):string {
  const value=new Date(date+'T12:00:00Z');value.setUTCDate(value.getUTCDate()+days);return value.toISOString().slice(0,10);
}
export function salesPeriod(mode:string|undefined, requested:string|undefined, today:string) {
  const period=mode==='week'?'week':'month';
  const anchor=validDate(requested)&&requested<=today?requested:today;
  const date=new Date(anchor+'T12:00:00Z');
  const start=period==='week'?shift(anchor,-((date.getUTCDay()+6)%7)):anchor.slice(0,7)+'-01';
  const monthEnd=new Date(date);monthEnd.setUTCMonth(date.getUTCMonth()+1,0);
  const end=period==='week'?shift(start,6):monthEnd.toISOString().slice(0,10);
  const days:string[]=[];for(let day=start;day<=end;day=shift(day,1))days.push(day);
  return {period,anchor,start,end,days,previous:validDate(shift(start,-1))?shift(start,-1):null,next:end<today?shift(end,1):null};
}
export type RecordedSale = { sold_on:string|null; sale_cents:number|null; realized:number|null };
export function periodSales(sales:RecordedSale[], mode:string|undefined, anchor:string|undefined, today:string) {
  const bounds=salesPeriod(mode,anchor,today);
  const undated=sales.filter(sale=>!validDate(sale.sold_on)).length;
  const future=sales.filter(sale=>validDate(sale.sold_on)&&sale.sold_on>today).length;
  const inPeriod=sales.filter(sale=>validDate(sale.sold_on)&&sale.sold_on>=bounds.start&&sale.sold_on<=bounds.end&&sale.sold_on<=today);
  const summarize=(rows:RecordedSale[])=>({count:rows.length,revenue:rows.reduce((sum,row)=>sum+(row.sale_cents??0),0),profit:rows.reduce((sum,row)=>sum+(row.realized??0),0),missingSale:rows.filter(row=>row.sale_cents===null).length,missingCost:rows.filter(row=>row.realized===null).length});
  return {...bounds,...summarize(inPeriod),undated,future,days:bounds.days.map(date=>({date,future:date>today,...summarize(inPeriod.filter(row=>row.sold_on===date))}))};
}
