// Run with PGLITE_MODULE set to an installed @electric-sql/pglite module URL.
const { PGlite } = await import(process.env.PGLITE_MODULE || '@electric-sql/pglite');
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const db = new PGlite();
const users = { a:'11111111-1111-4111-8111-111111111111', b:'22222222-2222-4222-8222-222222222222', admin:'33333333-3333-4333-8333-333333333333' };
const ids = { a:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', b:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', admin:'cccccccc-cccc-4ccc-8ccc-cccccccccccc' };
await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid$$; create function auth.jwt() returns jsonb language sql as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$; grant usage on schema public,auth to anon,authenticated,service_role; insert into auth.users values ('${users.a}'),('${users.b}'),('${users.admin}');`);
await db.exec(await readFile(new URL('../supabase/migrations/20261105233019_personal_finances.sql', import.meta.url),'utf8'));
let count = 0;
async function as(user, role='authenticated', extra={}) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub','${user ?? ''}',false); select set_config('request.jwt.claims','${JSON.stringify({sub:user,role,is_anonymous:false,...extra})}',false); set role ${role};`);
}
async function denied(sql, code='42501') { await assert.rejects(db.query(sql),error=>error.code===code); count++; }
function insert(id,user) {return `insert into public.personal_finance_transactions(id,user_id,kind,amount_cents,currency,occurred_on,description,category,payment_method,status,notes) values ('${id}','${user}','income',10001,'USD','2026-11-05','Synthetic local test','personal','cash','paid','')`;}
for (const user of ['a','b','admin']) { await as(users[user]); await db.query(insert(ids[user],users[user])); assert.equal((await db.query('select id from personal_finance_transactions')).rows.length,1); count++; }
await as(users.a);
assert.equal((await db.query('select public.personal_finance_entries() as entries')).rows[0].entries.length,1); count++;
assert.deepEqual((await db.query('select id from personal_finance_transactions')).rows.map(x=>x.id),[ids.a]); count++;
assert.equal((await db.query(`update personal_finance_transactions set description='attack' where id='${ids.b}' returning id`)).rows.length,0); count++;
await denied(insert('dddddddd-dddd-4ddd-8ddd-dddddddddddd',users.b));
await denied(`update personal_finance_transactions set user_id='${users.b}' where id='${ids.a}'`);
await denied(`update personal_finance_transactions set version=99 where id='${ids.a}'`);
await denied(`delete from personal_finance_transactions where id='${ids.a}'`);
await denied(`select personal_finance_touch()`);
await denied(insert(ids.a,users.a),'23505');
assert.equal((await db.query('select count(*)::int as n from personal_finance_transactions')).rows[0].n,1); count++;
const update=await db.query(`update personal_finance_transactions set description='updated' where id='${ids.a}' and version=1 returning version`);assert.equal(update.rows[0].version,2);count++;
assert.equal((await db.query(`update personal_finance_transactions set description='stale' where id='${ids.a}' and version=1 returning id`)).rows.length,0);count++;
assert.equal((await db.query(`update personal_finance_transactions set archived_at=now() where id='${ids.a}' and version=2 returning version`)).rows[0].version,3);count++;
assert.equal((await db.query(`update personal_finance_transactions set archived_at=null where id='${ids.a}' and version=3 returning version`)).rows[0].version,4);count++;
await denied(`update personal_finance_transactions set amount_cents=0 where id='${ids.a}'`,'23514');
await denied(`update personal_finance_transactions set currency='EUR' where id='${ids.a}'`,'23514');
await as(users.admin,'authenticated',{app_metadata:{role:'admin'}});
assert.deepEqual((await db.query('select id from personal_finance_transactions')).rows.map(x=>x.id),[ids.admin]); count++;
assert.equal((await db.query(`update personal_finance_transactions set amount_cents=2 where id='${ids.a}' returning id`)).rows.length,0); count++;
await as(users.a,'authenticated',{is_anonymous:true});
assert.equal((await db.query('select id from personal_finance_transactions')).rows.length,0);count++;
await denied(insert('dddddddd-dddd-4ddd-8ddd-dddddddddddd',users.a));
await as(undefined,'anon');await denied('select public.personal_finance_entries()');await denied('select * from personal_finance_transactions');await denied(insert('dddddddd-dddd-4ddd-8ddd-dddddddddddd',users.a));
await as(undefined,'authenticated');assert.equal((await db.query('select * from personal_finance_transactions')).rows.length,0);count++;
await as(undefined,'service_role');await denied('select * from personal_finance_transactions');
await db.exec('reset role');
assert.equal((await db.query('select count(*)::int as n from personal_finance_transactions')).rows[0].n,3); count++;
await as(users.a);
await db.query(`insert into personal_finance_transactions(user_id,kind,amount_cents,currency,occurred_on,description,category,payment_method,status,notes) select '${users.a}','income',1,'USD','2026-11-05','Bulk synthetic '||i,'personal','cash','paid','' from generate_series(1,1100) i`);
const snapshot=(await db.query('select public.personal_finance_entries() as entries')).rows[0].entries;
assert.equal(snapshot.length,1101);assert.equal(new Set(snapshot.map(row=>row.id)).size,1101);assert.ok(snapshot.every(row=>!('user_id' in row)));count+=3;
await db.query(insert('dddddddd-dddd-4ddd-8ddd-dddddddddddd',users.a));
assert.equal(snapshot.length,1101);assert.equal((await db.query('select public.personal_finance_entries() as entries')).rows[0].entries.length,1102);count+=2;
await as(users.b);assert.equal((await db.query('select public.personal_finance_entries() as entries')).rows[0].entries.length,1);count++;
console.log(`PASS ${count} local PostgreSQL RLS/permissions/mutation assertions with A, B, application-admin, anonymous JWT, anon and service roles. No hosted data or auth accounts created.`);
await db.close();
