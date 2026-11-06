import { calculatorScenario, parseCalculatorAmount } from './calculator.ts';
import type { CalculatorDraft } from './calculator-draft.ts';

export const costIndexes = [1, 2, 3, 4, 5, 6] as const;
export const calculatorLabels = ['Venta estimada', 'Subasta y dealer', 'Transporte', 'Reparaciones', 'Impuestos', 'Título y otros gastos', 'Imprevistos', 'Ganancia objetivo'];
export const calculatorSources = [
  'Compara carros de año, millas, versión y condición similares. Usa una venta realista, no el anuncio más alto.',
  'Busca la cotización o tabla de tarifas de la subasta y de tu dealer. Confirma el monto para el rango de puja calculado.',
  'Usa la cotización de la grúa o transportista, desde la subasta hasta el taller o punto de entrega.',
  'Suma el presupuesto del taller, piezas y preparación para vender. No repitas importes incluidos en otra cotización.',
  'Usa el importe aplicable confirmado para tu operación. Aquí no suponemos ninguna tasa.',
  'Revisa título, trámites y otros cargos. Incluye solo lo que no hayas contado en los demás campos.',
  'El monto que decides separar para posibles daños o gastos adicionales. No es una tarifa ni una garantía.',
  'El dinero que quieres que quede después de la compra y todos los gastos. Escríbelo en dólares, no en porcentaje.',
] as const;

export function calculatorGuide(draft: CalculatorDraft) {
  const sale = parseCalculatorAmount(draft.values[0]);
  const profit = parseCalculatorAmount(draft.values[7]);
  const detailAmounts = costIndexes.map(index => parseCalculatorAmount(draft.values[index]));
  const missingCosts = costIndexes.filter((_, index) => detailAmounts[index] === null);
  const knownCosts = detailAmounts.reduce<number>((sum, value) => sum + (value ?? 0), 0);
  const total = parseCalculatorAmount(draft.totalCosts);
  const costsComplete = draft.costsMode === 'total' ? total !== null && draft.costsReviewed : missingCosts.length === 0;
  const costs = draft.costsMode === 'total' ? total : knownCosts;
  const ready = [sale !== null && sale > 0, costsComplete, profit !== null];
  // Aggregate mode represents one explicitly reviewed total, not six assumed $0 costs.
  // The existing cents/parser/budget calculation remains the single source of truth.
  const result = ready.every(Boolean)
    ? calculatorScenario(draft.costsMode === 'details' ? draft.values : [draft.values[0], draft.totalCosts, '0', '0', '0', '0', '0', draft.values[7]])
    : null;
  return { sale, profit, costs, knownCosts, missingCosts, costsComplete, ready, result };
}
