// Validate calendar dates before Postgres so users get a useful, local error.
export function investmentDate(value: string, required = false): string | null {
  if (!value && !required) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Selecciona una fecha válida.');
  const date = new Date(value + 'T00:00:00Z');
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value || value.startsWith('0000')) {
    throw new Error('Selecciona una fecha válida.');
  }
  return value;
}
export function ownKey<T extends object>(options: T, value: string): value is Extract<keyof T, string> {
  return Object.prototype.hasOwnProperty.call(options, value);
}
export function investmentVersion(value: FormDataEntryValue | null): number {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) throw new Error('Recarga la ficha antes de guardar.');
  const version = Number(value);
  if (!Number.isSafeInteger(version) || version >= 2147483647) throw new Error('Recarga la ficha antes de guardar.');
  return version;
}
