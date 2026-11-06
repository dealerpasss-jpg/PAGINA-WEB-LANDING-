import test from 'node:test';
import assert from 'node:assert/strict';
import { amount, date, localDate, money, parseEntry, sameEntry, summarize, uuid, version, type Entry } from '../lib/personal-finances/model.ts';

const base: Entry = { id: '11111111-1111-4111-8111-111111111111', kind: 'income', amount_cents: 10000, currency: 'USD', occurred_on: '2026-11-05', description: 'Ingreso', category: 'personal', payment_method: 'cash', status: 'paid', notes: '', version: 1, archived_at: null };
function form() {
  const data = new FormData();
  for (const [key, value] of Object.entries(base)) if (value !== null) data.set(key, String(value));
  data.set('amount', '100.00'); return data;
}
test('money parses exact positive cents with one decimal separator and no thousands', () => {
  assert.equal(amount('12,34'), 1234); assert.equal(amount('0.01'), 1); assert.equal(amount('999999999.99'), 99999999999);
  for (const invalid of ['0', '-1', '1,000.50', '1.000,50', '1e3', 'Infinity', '1.001', '', '1000000000']) assert.throws(() => amount(invalid));
});
test('dates reject rollovers and preserve literal calendar day', () => {
  assert.equal(date('2024-02-29'), '2024-02-29');
  for (const invalid of ['2026-02-29', '2026-04-31', '2026-13-01', '2026-1-01', '2101-01-01']) assert.throws(() => date(invalid));
  assert.equal(localDate(new Date(2026, 0, 2, 1, 0)), '2026-01-02');
});
test('validation never accepts owner, version, or arbitrary fields as entry content', () => {
  const data = form(); data.set('user_id', 'someone-else'); data.set('version', '200'); data.set('archived_at', 'now');
  const result = parseEntry(data);
  assert.equal('user_id' in result, false); assert.equal('version' in result, false); assert.equal('archived_at' in result, false);
  assert.equal(result.amount_cents, 10000);
  for (const key of ['kind', 'currency', 'category', 'payment_method', 'status']) { const invalid = form(); invalid.set(key, '__proto__'); assert.throws(() => parseEntry(invalid)); }
  const long = form(); long.set('notes', 'x'.repeat(2001)); assert.throws(() => parseEntry(long));
  const blank = form(); blank.set('description', '   '); assert.throws(() => parseEntry(blank));
});
test('identifiers and optimistic versions are strict', () => {
  assert.equal(uuid(base.id), base.id); assert.equal(version('10'), 10);
  for (const invalid of ['1', '', '11111111-1111-0111-0111-111111111111']) assert.throws(() => uuid(invalid));
  for (const invalid of ['0', '1.5', '-2', '1e2', '1000000000']) assert.throws(() => version(invalid));
});
test('balances exclude pending, archived, other currencies, and other periods', () => {
  const entries: Entry[] = [base, { ...base, kind: 'expense', amount_cents: 2501 }, { ...base, status: 'pending', amount_cents: 500 }, { ...base, kind: 'expense', status: 'pending', amount_cents: 901 }, { ...base, archived_at: '2026-11-05', amount_cents: 100 }, { ...base, currency: 'COP', amount_cents: 50000 }, { ...base, occurred_on: '2026-10-01', amount_cents: 100 }];
  assert.deepEqual(summarize(entries, 'USD', '2026-11'), { income: BigInt(10000), expense: BigInt(2501), balance: BigInt(7499), pendingIncome: BigInt(500), pendingExpense: BigInt(901) });
  assert.equal(summarize(entries, 'USD').income, BigInt(10100));
  assert.equal(summarize(entries, 'COP').balance, BigInt(50000));
});
test('formatting is exact for negatives and totals exceeding safe integer', () => {
  assert.equal(money(-1, 'USD'), '−USD 0,01');
  assert.equal(money(BigInt('90071992547409931'), 'COP'), 'COP 900.719.925.474.099,31');
});
test('idempotent retries require every input field to match', () => {
  const input = parseEntry(form());
  assert.equal(sameEntry(input, input), true);
  assert.equal(sameEntry(input, { ...input, amount_cents: 10001 }), false);
  assert.equal(sameEntry(input, { ...input, notes: 'changed' }), false);
});
