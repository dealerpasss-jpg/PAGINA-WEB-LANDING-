import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import * as model from '../lib/personal-finances/model.ts';
import * as funding from '../lib/personal-finances/funding.ts';

const source = (path: string) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const owner = '11111111-1111-4111-8111-111111111111', other = '22222222-2222-4222-8222-222222222222';
const fundId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', repaymentId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
function setup() {
  const rows: Record<string, Record<string, any>> = { personal_investment_funds: {}, personal_investment_repayments: {} };
  let active: string | null = owner, uncertain = false;
  class Query {
    operation = 'select'; data: any; filters: ((row: any) => boolean)[] = []; single = false;
    readonly table: string;
    constructor(table: string) { this.table = table; }
    select() { return this; }
    insert(data: any) { this.operation = 'insert'; this.data = data; return this; }
    update(data: any) { this.operation = 'update'; this.data = data; return this; }
    eq(key: string, value: unknown) { this.filters.push(row => row[key] === value); return this; }
    is(key: string) { this.filters.push(row => row[key] === null); return this; }
    not(key: string) { this.filters.push(row => row[key] !== null); return this; }
    maybeSingle() { this.single = true; return this; }
    async then(resolve: (value: any) => unknown) {
      const table = rows[this.table];
      if (this.operation === 'insert') {
        // Simulate a duplicate hitting the balance trigger before the unique index.
        if (table[this.data.id]) return resolve({ data: null, error: { code: this.table.includes('repayments') ? '23514' : '23505' } });
        if (this.data.user_id !== active) return resolve({ data: null, error: { code: '42501' } });
        const parent = this.table.includes('repayments') ? rows.personal_investment_funds[this.data.fund_id] : null;
        if (this.table.includes('repayments') && (!parent || parent.user_id !== active)) return resolve({ data: null, error: { code: '42501' } });
        table[this.data.id] = { ...this.data, version: 1, voided_at: null };
        if (parent) parent.version++;
        if (uncertain) { uncertain = false; return resolve({ data: null, error: { code: 'NETWORK' } }); }
        return resolve({ data: [table[this.data.id]], error: null });
      }
      const found = Object.values(table).filter(row => row.user_id === active && this.filters.every(filter => filter(row)));
      if (this.operation === 'update') found.forEach(row => Object.assign(row, this.data, { version: row.version + 1 }));
      return resolve({ data: this.single ? found[0] ?? null : found, error: null });
    }
  }
  const imports: Record<string, unknown> = {
    'next/cache': { revalidatePath: (path: string) => assert.equal(path, '/mi-cuenta/finanzas/capital') },
    '@/lib/personal-finances/model': model, '@/lib/personal-finances/funding': funding,
    '@/lib/personal-finances/server': { personalIdentity: async (next: string) => {
      assert.equal(next, '/mi-cuenta/finanzas/capital');
      if (!active) throw new Error('AUTH_REDIRECT');
      return { user: { id: active }, db: { from: (table: string) => { assert.ok(table in rows); return new Query(table); } } };
    } },
  };
  const code = ts.transpileModule(source('app/mi-cuenta/finanzas/capital/actions.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} as any };
  new Function('require', 'module', 'exports', code)((key: string) => { assert.ok(key in imports, key); return imports[key]; }, module, module.exports);
  return { save: module.exports.saveInvestmentFunding as (data: FormData) => Promise<model.SaveResult>, rows, login: (user: string | null) => { active = user; }, uncertain: () => { uncertain = true; } };
}
function input(action = 'fund-create') {
  const data = new FormData();
  Object.entries({ action, owner_id: owner, id: action.startsWith('fund') ? fundId : repaymentId, fund_id: fundId, person_name: 'Synthetic investor', description: 'Investment capital', principal: '1000', currency: 'USD', received_on: '2026-11-01', amount: '250.25', paid_on: '2026-11-06', payment_method: 'transfer', notes: '', version: '1' }).forEach(([key, value]) => data.set(key, value));
  return data;
}
test('fund create is idempotent and does not accept changed payload under same UUID', async () => {
  const app = setup(); app.uncertain();
  assert.equal((await app.save(input())).ok, true); // Persisted uncertain response reconciles immediately.
  assert.equal((await app.save(input())).ok, true); assert.equal(Object.keys(app.rows.personal_investment_funds).length, 1);
  const changed = input(); changed.set('principal', '1500'); assert.equal((await app.save(changed)).ok, false);
});
test('repayment retries reconcile trigger errors and uncertain response without doubling capital returned', async () => {
  const app = setup(); await app.save(input()); app.uncertain();
  assert.equal((await app.save(input('repayment-create'))).ok, true);
  assert.equal((await app.save(input('repayment-create'))).ok, true);
  assert.equal(Object.keys(app.rows.personal_investment_repayments).length, 1); assert.equal(app.rows.personal_investment_funds[fundId].version, 2);
  const changed = input('repayment-create'); changed.set('amount', '300'); assert.equal((await app.save(changed)).ok, false);
});
test('auth and owner filters reject account switches, foreign fund linkage and foreign row edits', async () => {
  const app = setup(); await app.save(input()); app.login(other);
  assert.equal((await app.save(input('fund-update'))).ok, false);
  const forged = input('repayment-create'); forged.set('owner_id', other); assert.equal((await app.save(forged)).ok, false);
  const edit = input('fund-update'); edit.set('owner_id', other); assert.equal((await app.save(edit)).ok, false);
  assert.equal(Object.keys(app.rows.personal_investment_repayments).length, 0);
  app.login(null); await assert.rejects(app.save(input()), /AUTH_REDIRECT/);
});
test('fund updates preserve currency and reject stale versions', async () => {
  const app = setup(); await app.save(input());
  const edit = input('fund-update'); edit.set('currency', 'COP'); assert.equal((await app.save(edit)).ok, false);
  edit.set('currency', 'USD'); edit.set('person_name', 'Corrected person'); assert.equal((await app.save(edit)).ok, true);
  assert.equal((await app.save(edit)).ok, false); assert.equal(app.rows.personal_investment_funds[fundId].person_name, 'Corrected person');
});
test('repayment void is versioned and reversible; voided duplicate cannot report new payment', async () => {
  const app = setup(); await app.save(input()); await app.save(input('repayment-create'));
  assert.equal((await app.save(input('repayment-void'))).ok, true);
  assert.equal((await app.save(input('repayment-void'))).ok, false);
  assert.equal((await app.save(input('repayment-create'))).ok, false);
  const restore = input('repayment-restore'); restore.set('version', '2'); assert.equal((await app.save(restore)).ok, true);
  assert.equal(app.rows.personal_investment_repayments[repaymentId].voided_at, null);
});
test('funding actions never use service role, cash transactions, vehicle data, or authorization from metadata', () => {
  const code = source('app/mi-cuenta/finanzas/capital/actions.ts');
  assert.doesNotMatch(code, /database\(|SERVICE_ROLE|investment_vehicles|personal_finance_transactions|user_metadata|profile\.role|\.delete\(/);
  assert.match(code, /\.eq\('user_id', user.id\)/);
  assert.match(source('lib/personal-finances/server.ts'), /\.rpc\('personal_investment_snapshot'\)/);
});
