import { purchaseBudget } from './dashboard.ts';
export const calculatorFields = [
  { key: 'sale', label: '¿En cuánto crees que lo venderás?', hint: 'Precio de venta realista según carros similares, no el precio más alto anunciado.' },
  { key: 'fees', label: 'Comisiones de subasta y dealer', hint: 'Lo que te cobran además del precio de martillo.' },
  { key: 'transport', label: 'Transporte o grúa', hint: 'Desde la subasta hasta tu taller o punto de entrega.' },
  { key: 'repairs', label: 'Reparaciones y preparación', hint: 'Piezas, mano de obra, limpieza y detalles para venderlo.' },
  { key: 'taxes', label: 'Impuestos', hint: 'Usa el monto que aplique a tu operación.' },
  { key: 'documents', label: 'Título, documentos y otros gastos', hint: 'Incluye aquí los gastos que no contaste arriba.' },
  { key: 'reserve', label: 'Reserva para imprevistos', hint: 'Un colchón para daños o gastos que aún no conoces.' },
  { key: 'profit', label: '¿Cuánto quieres ganar?', hint: 'Tu ganancia objetivo en dólares, no un porcentaje.' },
] as const;
export const calculatorExample = ['12000','900','450','1800','600','150','400','1500'];
export function parseCalculatorAmount(raw: string): number | null {
  const value = raw.trim();
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(value)) return null;
  const number = Number(value.replace(',', '.'));
  return Number.isFinite(number) && number <= 999999999 ? Math.round(number * 100) : null;
}
export function calculatorScenario(raw: string[]) {
  if (raw.length !== 8) return null;
  const cents = raw.map(parseCalculatorAmount);
  if (cents.some(value => value === null)) return null;
  const [sale,fees,transport,repairs,taxes,documents,reserve,profit] = cents as number[];
  if (sale <= 0) return null;
  const budget = purchaseBudget([sale,fees,transport,repairs,taxes+documents,reserve,profit]);
  if (!budget) return null;
  return { sale, profit, costs: budget.costs, maximum: budget.maximum };
}
