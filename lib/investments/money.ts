export function cents(value: unknown, optional = false): number | null {
  const text = String(value ?? '').trim();
  if (!text && optional) return null;
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(text)) throw new Error('Usa un monto positivo con máximo dos decimales, sin comas.');
  const [whole, fraction = ''] = text.split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}
export function totals(purchase: number | null, expenses: number[], asking: number | null, sold: number | null) {
  const expensesTotal = expenses.reduce((a,b)=>a+b,0);
  const cost = purchase === null ? null : purchase + expensesTotal;
  const estimated = asking === null || cost === null ? null : asking-cost;
  const realized = sold === null || cost === null ? null : sold-cost;
  return { expensesTotal, cost, estimated, realized, margin: sold && realized !== null ? realized/sold*100 : null, estimatedMargin: asking && estimated !== null ? estimated/asking*100 : null };
}
export function usd(value: number | null) { return value === null ? 'Sin definir' : new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value/100); }
export const statuses = { purchased:'Comprado', repairing:'En reparación', listed:'En venta', sold:'Vendido' } as const;
export const categories = { auction:'Cargos de subasta', repair:'Reparación', transport:'Transporte', title:'Título y documentación', other:'Otro gasto' } as const;
