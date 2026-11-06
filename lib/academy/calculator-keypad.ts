export type CalculatorKey = `${number}` | 'decimal' | 'backspace' | 'clear';
export type CalculatorSelection = { start: number; end: number };

/** A keypad edit, not a calculation: preserve raw cents and the user's selection. */
export function calculatorKeypadEdit(value: string, key: CalculatorKey, selection?: CalculatorSelection | null) {
  const start = Math.max(0, Math.min(value.length, selection?.start ?? value.length));
  const end = Math.max(start, Math.min(value.length, selection?.end ?? start));
  if (key === 'clear') return { value: '', caret: 0, accepted: true };
  if (key === 'backspace') {
    const from = start === end ? Math.max(0, start - 1) : start;
    return { value: value.slice(0, from) + value.slice(end), caret: from, accepted: true };
  }
  const insert = key === 'decimal' ? (start === 0 && end === value.length ? '0.' : '.') : key;
  const next = value.slice(0, start) + insert + value.slice(end);
  const accepted = /^\d*(?:[.,]\d{0,2})?$/.test(next) && next.length <= 12 && Number(next.replace(',', '.')) <= 999999999;
  return accepted ? { value: next, caret: start + insert.length, accepted: true } : { value, caret: start, accepted: false };
}
