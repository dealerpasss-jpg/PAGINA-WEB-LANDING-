import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import * as model from '../lib/personal-finances/model.ts';

const source = (path: string) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const owner = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
function setup() {
  const rows: Record<string, any> = {};
  let active: string | null = owner;
  let uncertain = false;
  class Query {
    operation = 'select'; data: any; filters: ((row: any) => boolean)[] = []; single = false;
    select() { return this; }
    insert(data: any) { this.operation = 'insert'; this.data = data; return this; }
    update(data: any) { this.operation = 'update'; this.data = data; return this; }
    eq(key: string, value: unknown) { this.filters.push(row => row[key] === value); return this; }
    is(key: string) { this.filters.push(row => row[key] === null); return this; }
    not(key: string) { this.filters.push(row => row[key] !== null); return this; }
    maybeSingle() { this.single = true; return this; }
    async then(resolve: (value: any) => unknown) {
      if (this.operation === 'insert') {
        if (rows[this.data.id]) return resolve({ data: null, error: { code: '23505' } });
        if (this.data.user_id !== active) return resolve({ data: null, error: { code: '42501' } });
        rows[this.data.id] = { ...this.data, version: 1, archived_at: null };
        if (uncertain) { uncertain = false; return resolve({ data: null, error: { code: 'NETWORK' } }); }
        return resolve({ data: [rows[this.data.id]], error: null });
      }
      const found = Object.values(rows).filter(row => row.user_id === active && this.filters.every(filter => filter(row)));
      if (this.operation === 'update') found.forEach(row => Object.assign(row, this.data, { version: row.version + 1 }));
      return resolve({ data: this.single ? found[0] ?? null : found, error: null });
    }
  }
  const imports: Record<string, unknown> = {
    'next/cache': { revalidatePath: () => undefined },
    '@/lib/personal-finances/model': model,
    '@/lib/personal-finances/server': { personalIdentity: async () => {
      if (!active) throw new Error('AUTH_REDIRECT');
      return { user: { id: active }, db: { from: (table: string) => { assert.equal(table, 'personal_finance_transactions'); return new Query(); } } };
    } },
  };
  const code = ts.transpileModule(source('app/mi-cuenta/finanzas/actions.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} as any };
  new Function('require', 'module', 'exports', code)((key: string) => { assert.ok(key in imports, key); return imports[key]; }, module, module.exports);
  return { save: module.exports.savePersonalEntry as (form: FormData) => Promise<model.SaveResult>, rows, login: (user: string | null) => { active = user; }, uncertain: () => { uncertain = true; } };
}
function input(action = 'create') {
  const data = new FormData();
  Object.entries({ action, owner_id: owner, id, kind: 'income', amount: '12.34', currency: 'USD', occurred_on: '2026-11-05', description: 'Synthetic unit test', category: 'personal', payment_method: 'cash', status: 'paid', notes: '', version: '1' }).forEach(([key, value]) => data.set(key, value));
  return data;
}
test('create, uncertain-response retry and repeated click produce one movement', async () => {
  const app = setup(); app.uncertain();
  assert.equal((await app.save(input())).ok, false);
  assert.equal((await app.save(input())).ok, true);
  assert.equal((await app.save(input())).ok, true);
  assert.equal(Object.keys(app.rows).length, 1); assert.equal(app.rows[id].amount_cents, 1234);
  const changed = input(); changed.set('amount', '99'); assert.equal((await app.save(changed)).ok, false);
});
test('cross-account row IDs and stale forms cannot change another user data', async () => {
  const app = setup(); await app.save(input()); app.login(other);
  assert.equal((await app.save(input('update'))).ok, false);
  const attack = input('update'); attack.set('owner_id', other);
  assert.equal((await app.save(attack)).ok, false); assert.equal(app.rows[id].version, 1);
  app.login(null); await assert.rejects(app.save(input()), /AUTH_REDIRECT/);
});
test('edit uses optimistic version and archive is reversible with no delete', async () => {
  const app = setup(); await app.save(input());
  const edit = input('update'); edit.set('status', 'pending'); assert.equal((await app.save(edit)).ok, true);
  assert.equal((await app.save(edit)).ok, false); assert.equal(app.rows[id].version, 2);
  const archive = input('archive'); archive.set('version', '2'); assert.equal((await app.save(archive)).ok, true);
  assert.ok(app.rows[id].archived_at);
  const restore = input('restore'); restore.set('version', '3'); assert.equal((await app.save(restore)).ok, true);
  assert.equal(app.rows[id].archived_at, null); assert.equal(app.rows[id].version, 4);
});
test('private finance routes never use service-role DB, browser storage or role overrides', () => {
  for (const path of ['lib/personal-finances/server.ts', 'app/mi-cuenta/finanzas/actions.ts']) {
    const code = source(path); assert.doesNotMatch(code, /database\(|SERVICE_ROLE|\.profile\.role|user_metadata|console\./);
  }
  assert.match(source('app/mi-cuenta/finanzas/actions.ts'), /\.eq\('user_id', user.id\)/);
  assert.match(source('lib/personal-finances/server.ts'), /\.rpc\('personal_finance_entries'\)/);
  assert.doesNotMatch(source('lib/personal-finances/server.ts'), /\.range\(/);
  assert.match(source('lib/personal-finances/server.ts'), /auth\.getUser\(\)/);
  assert.match(source('app/mi-cuenta/finanzas/page.tsx'), /force-dynamic/);
  assert.doesNotMatch(source('components/personal-finances/PersonalFinances.tsx'), /localStorage|sessionStorage|dangerouslySetInnerHTML/);
});
