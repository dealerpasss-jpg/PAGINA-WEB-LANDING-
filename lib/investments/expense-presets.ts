import { categories } from './money.ts';
import { ownKey } from './validation.ts';

// UI shortcuts, not new database categories. Existing records keep their meaning.
export const expensePresets = {
  mechanical: { label: 'Reparación mecánica', category: 'repair' },
  wash: { label: 'Lavado', category: 'other' },
  parts: { label: 'Compra de repuestos', category: 'repair' },
  paint: { label: 'Pintura', category: 'repair' },
  transport: { label: 'Transporte', category: 'transport' },
  auction: { label: 'Cargos de subasta', category: 'auction' },
  dealer: { label: 'Cargo de dealer', category: 'other' },
  documents: { label: 'Título y documentos', category: 'title' },
  other: { label: 'Otro', category: 'other' },
} as const satisfies Record<string, { label: string; category: keyof typeof categories }>;
export type ExpensePreset = keyof typeof expensePresets;

export function expenseDetailLimit(preset: ExpensePreset) {
  return preset === 'other' ? 500 : 500 - expensePresets[preset].label.length - 3;
}

export function expenseConcept(preset: string, category: string, detail: string) {
  const trimmed = detail.trim();
  if (!preset) {
    // Keep forms opened before this release compatible; never infer a subtype.
    if (!ownKey(categories, category)) throw new Error('Categoría inválida.');
    if (!trimmed || trimmed.length > 500) throw new Error('Escribe un concepto de hasta 500 caracteres.');
    return { category, description: trimmed };
  }
  if (!ownKey(expensePresets, preset)) throw new Error('Selecciona un tipo de gasto válido.');
  if (preset === 'other' && !trimmed) throw new Error('Escribe el concepto del otro gasto.');
  if (trimmed.length > expenseDetailLimit(preset)) throw new Error('Acorta el detalle del gasto antes de guardar.');
  const option = expensePresets[preset];
  return { category: option.category, description: preset === 'other' ? trimmed : option.label + (trimmed ? ' · ' + trimmed : '') };
}
