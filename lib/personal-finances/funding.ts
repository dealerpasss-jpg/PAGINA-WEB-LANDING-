import { amount, currencies, date, methods, type Currency } from './model.ts';

export type InvestmentFund = {
  id: string; person_name: string; description: string; principal_cents: number;
  currency: Currency; received_on: string; notes: string; version: number;
};
export type InvestmentRepayment = {
  id: string; fund_id: string; amount_cents: number; paid_on: string;
  payment_method: keyof typeof methods; notes: string; voided_at: string | null; version: number;
};
export type FundInput = Omit<InvestmentFund, 'id' | 'version'>;
export type RepaymentInput = Omit<InvestmentRepayment, 'id' | 'fund_id' | 'voided_at' | 'version'>;
export type FundingSnapshot = { funds: InvestmentFund[]; repayments: InvestmentRepayment[] };
export const fundColumns = 'id,person_name,description,principal_cents,currency,received_on,notes,version';
export const repaymentColumns = 'id,fund_id,amount_cents,paid_on,payment_method,notes,voided_at,version';

function text(form: FormData, key: string, max: number, required = false): string {
  const raw = form.get(key);
  if (raw !== null && typeof raw !== 'string') throw new Error('Revisa los campos del registro.');
  const value = (raw ?? '').trim();
  if (value.length > max || (required && !value)) throw new Error('Completa los campos obligatorios y revisa su longitud.');
  return value;
}
export function parseFund(form: FormData): FundInput {
  const currency = text(form, 'currency', 3);
  if (!(currencies as readonly string[]).includes(currency)) throw new Error('Selecciona USD o COP.');
  return {
    person_name: text(form, 'person_name', 120, true), description: text(form, 'description', 160, true),
    principal_cents: amount(text(form, 'principal', 20, true)), currency: currency as Currency,
    received_on: date(text(form, 'received_on', 10, true)), notes: text(form, 'notes', 2000),
  };
}
export function parseRepayment(form: FormData): RepaymentInput {
  const method = text(form, 'payment_method', 20);
  if (!Object.prototype.hasOwnProperty.call(methods, method)) throw new Error('Selecciona un medio de pago válido.');
  return { amount_cents: amount(text(form, 'amount', 20, true)), paid_on: date(text(form, 'paid_on', 10, true)), payment_method: method as keyof typeof methods, notes: text(form, 'notes', 2000) };
}
export function equalInput<T extends object>(input: T, record: T): boolean {
  return (Object.keys(input) as (keyof T)[]).every(key => input[key] === record[key]);
}
export function fundBalance(fund: InvestmentFund, repayments: InvestmentRepayment[]) {
  const returned = repayments.filter(row => row.fund_id === fund.id && !row.voided_at).reduce((sum, row) => sum + BigInt(row.amount_cents), BigInt(0));
  const received = BigInt(fund.principal_cents);
  return { received, returned, remaining: received - returned };
}
export function fundingTotals(snapshot: FundingSnapshot, currency: Currency) {
  return snapshot.funds.filter(fund => fund.currency === currency).reduce((totals, fund) => {
    const values = fundBalance(fund, snapshot.repayments);
    return { received: totals.received + values.received, returned: totals.returned + values.returned, remaining: totals.remaining + values.remaining };
  }, { received: BigInt(0), returned: BigInt(0), remaining: BigInt(0) });
}
