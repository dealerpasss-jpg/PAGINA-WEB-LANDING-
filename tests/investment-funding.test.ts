import test from 'node:test';
import assert from 'node:assert/strict';
import { equalInput, fundBalance, fundingTotals, parseFund, parseRepayment, type InvestmentFund, type InvestmentRepayment } from '../lib/personal-finances/funding.ts';

const fund: InvestmentFund = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', person_name: 'Persona de prueba', description: 'Capital para invertir', principal_cents: 100000, currency: 'USD', received_on: '2026-11-01', notes: '', version: 1 };
const payment: InvestmentRepayment = { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', fund_id: fund.id, amount_cents: 25025, paid_on: '2026-11-06', payment_method: 'transfer', notes: '', voided_at: null, version: 1 };
function form(values: Record<string, string>) { const data = new FormData(); Object.entries(values).forEach(([key, value]) => data.set(key, value)); return data; }
const fundForm = () => form({ person_name: fund.person_name, description: fund.description, principal: '1000', currency: 'USD', received_on: fund.received_on, notes: '' });
const paymentForm = () => form({ amount: '250,25', paid_on: '2026-11-06', payment_method: 'transfer', notes: '' });
test('investment capital validates exact principal without accepting ownership or balances', () => {
  const data = fundForm(); data.set('user_id', 'other'); data.set('remaining_cents', '999999'); data.set('version', '20');
  const input = parseFund(data); assert.equal(input.principal_cents, 100000); assert.equal('user_id' in input, false); assert.equal('remaining_cents' in input, false); assert.equal('version' in input, false);
  for (const [key, value] of [['principal', '0'], ['currency', 'EUR'], ['person_name', '  '], ['description', ''], ['received_on', '2026-02-29'], ['notes', 'x'.repeat(2001)]]) { const invalid = fundForm(); invalid.set(key, value); assert.throws(() => parseFund(invalid)); }
});
test('partial repayment validates amount, date and method without accepting relation/owner mutations', () => {
  const data = paymentForm(); data.set('user_id', 'other'); data.set('fund_id', 'other'); data.set('voided_at', 'now');
  const input = parseRepayment(data); assert.equal(input.amount_cents, 25025); assert.equal('fund_id' in input, false); assert.equal('user_id' in input, false); assert.equal('voided_at' in input, false);
  for (const [key, value] of [['amount', '-5'], ['amount', '1,000.50'], ['payment_method', '__proto__'], ['paid_on', '2026-11-31']]) { const invalid = paymentForm(); invalid.set(key, value); assert.throws(() => parseRepayment(invalid)); }
});
test('capital balance tracks partial returns, excludes voids and unrelated funds', () => {
  const payments = [payment, { ...payment, id: 'second', amount_cents: 5000 }, { ...payment, id: 'voided', amount_cents: 40000, voided_at: '2026-11-06' }, { ...payment, id: 'other', fund_id: 'other', amount_cents: 60000 }];
  assert.deepEqual(fundBalance(fund, payments), { received: BigInt(100000), returned: BigInt(30025), remaining: BigInt(69975) });
  assert.equal(fundBalance(fund, [{ ...payment, amount_cents: 100000 }]).remaining, BigInt(0));
  assert.equal(fundBalance(fund, []).remaining, BigInt(100000));
});
test('funding totals never mix USD and COP or calculate interest and profit', () => {
  const snapshot = { funds: [fund, { ...fund, id: 'cop', currency: 'COP' as const, principal_cents: 500000000 }], repayments: [payment, { ...payment, fund_id: 'cop', amount_cents: 125000000 }] };
  assert.deepEqual(fundingTotals(snapshot, 'USD'), { received: BigInt(100000), returned: BigInt(25025), remaining: BigInt(74975) });
  assert.deepEqual(fundingTotals(snapshot, 'COP'), { received: BigInt(500000000), returned: BigInt(125000000), remaining: BigInt(375000000) });
  assert.equal('profit' in fundingTotals(snapshot, 'USD'), false);
});
test('retries require all original input fields to match', () => {
  const input = parseRepayment(paymentForm()); assert.equal(equalInput(input, payment), true);
  assert.equal(equalInput(input, { ...payment, amount_cents: 1 }), false);
  assert.equal(equalInput(input, { ...payment, paid_on: '2026-11-07' }), false);
});
