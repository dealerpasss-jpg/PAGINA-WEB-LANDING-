export const currencies = ['USD', 'COP'] as const;
export type Currency = typeof currencies[number];
export const categories = {
  personal: 'Personal', vehicle_sale: 'Venta de vehículo', salary: 'Trabajo e ingresos',
  home: 'Hogar', food: 'Alimentación', transport: 'Transporte', services: 'Servicios',
  debt: 'Pago de deuda', health: 'Salud', other: 'Otro',
} as const;
export const methods = { cash: 'Efectivo', transfer: 'Transferencia', card: 'Tarjeta', other: 'Otro' } as const;
export type Entry = {
  id: string; kind: 'income' | 'expense'; amount_cents: number; currency: Currency;
  occurred_on: string; description: string; category: keyof typeof categories;
  payment_method: keyof typeof methods; status: 'paid' | 'pending'; notes: string;
  version: number; archived_at: string | null;
};
export type EntryInput = Omit<Entry, 'id' | 'version' | 'archived_at'>;
export type SaveResult = { ok: true; message: string } | { ok: false; error: string };
export const entryColumns = 'id,kind,amount_cents,currency,occurred_on,description,category,payment_method,status,notes,version,archived_at';
export function uuid(value: unknown): string {
  const text = String(value ?? '');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text)) throw new Error('El movimiento no es válido. Actualiza la página.');
  return text.toLowerCase();
}
export function version(value: unknown): number {
  if (!/^[1-9]\d{0,8}$/.test(String(value ?? ''))) throw new Error('La versión no es válida. Actualiza la página.');
  return Number(value);
}
function field(form: FormData, key: string, max: number, required = false): string {
  const value = form.get(key);
  if (value !== null && typeof value !== 'string') throw new Error('Revisa los campos del movimiento.');
  const text = (value ?? '').trim();
  if (text.length > max || (required && !text)) throw new Error('Completa los campos obligatorios y respeta su longitud máxima.');
  return text;
}
function option<T extends string>(value: string, options: readonly T[], message: string): T {
  if (!(options as readonly string[]).includes(value)) throw new Error(message);
  return value as T;
}
export function amount(value: string): number {
  if (!/^\d{1,9}([.,]\d{1,2})?$/.test(value)) throw new Error('Escribe un monto mayor que cero, sin separadores de miles y con máximo dos decimales.');
  const [whole, fraction = ''] = value.replace(',', '.').split('.');
  const result = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (result <= 0) throw new Error('El monto debe ser mayor que cero.');
  return result;
}
export function date(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '1900-01-01' || value > '2100-12-31') throw new Error('Elige una fecha válida entre 1900 y 2100.');
  const parsed = new Date(value + 'T12:00:00Z');
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new Error('Elige una fecha válida.');
  return value;
}
export function parseEntry(form: FormData): EntryInput {
  return {
    kind: option(field(form, 'kind', 10), ['income', 'expense'], 'Selecciona ingreso o gasto.'),
    amount_cents: amount(field(form, 'amount', 20, true)),
    currency: option(field(form, 'currency', 3), currencies, 'Selecciona USD o COP.'),
    occurred_on: date(field(form, 'occurred_on', 10, true)),
    description: field(form, 'description', 160, true),
    category: option(field(form, 'category', 30), Object.keys(categories) as (keyof typeof categories)[], 'Selecciona una categoría válida.'),
    payment_method: option(field(form, 'payment_method', 20), Object.keys(methods) as (keyof typeof methods)[], 'Selecciona un medio de pago válido.'),
    status: option(field(form, 'status', 10), ['paid', 'pending'], 'Selecciona el estado del movimiento.'),
    notes: field(form, 'notes', 2000),
  };
}
export function sameEntry(a: EntryInput, b: EntryInput): boolean {
  return (Object.keys(a) as (keyof EntryInput)[]).every(key => a[key] === b[key]);
}
export function summarize(entries: Entry[], currency: Currency, month = '') {
  let income = BigInt(0), expense = BigInt(0), pendingIncome = BigInt(0), pendingExpense = BigInt(0);
  for (const entry of entries) {
    if (entry.archived_at || entry.currency !== currency || (month && !entry.occurred_on.startsWith(month + '-'))) continue;
    const value = BigInt(entry.amount_cents);
    if (entry.status === 'pending') { if (entry.kind === 'income') pendingIncome += value; else pendingExpense += value; }
    else if (entry.kind === 'income') income += value; else expense += value;
  }
  return { income, expense, balance: income - expense, pendingIncome, pendingExpense };
}
export function money(cents: number | bigint, currency: Currency): string {
  const value = BigInt(cents), negative = value < BigInt(0), absolute = negative ? -value : value;
  return `${negative ? '−' : ''}${currency} ${new Intl.NumberFormat('es-CO').format(absolute / BigInt(100))},${String(absolute % BigInt(100)).padStart(2, '0')}`;
}
export function localDate(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
