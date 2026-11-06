export const missingFields = {
  purchase: { label: 'Precio de compra', target: 'compra-precio' },
  reference: { label: 'Precio de referencia', target: 'venta-referencia' },
  sale: { label: 'Precio de cierre', target: 'venta-precio' },
  date: { label: 'Fecha de venta', target: 'venta-fecha' },
} as const;
export type MissingField = keyof typeof missingFields;
type FinancialFields = { status:string; purchase_cents:number|null; asking_cents:number|null; sale_cents:number|null; sold_on?:string|null };

// Only known omissions. No expense history does not imply an omitted expense.
// Zero is a recorded amount, not a missing value.
export function missingInvestmentFields(vehicle:FinancialFields):MissingField[] {
  const fields:MissingField[]=[];
  if(vehicle.purchase_cents==null) fields.push('purchase');
  if(vehicle.status==='sold') {
    if(vehicle.sale_cents==null) fields.push('sale');
    if(!vehicle.sold_on) fields.push('date');
  } else if(vehicle.asking_cents==null) fields.push('reference');
  return fields;
}
