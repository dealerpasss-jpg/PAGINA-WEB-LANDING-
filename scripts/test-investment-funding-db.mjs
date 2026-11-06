// Local-only PostgreSQL engine, no hosted data or real Auth users.
// npm install --prefix /tmp/investment-db-tools --save-exact @electric-sql/pglite@0.3.14
// PGLITE_MODULE=/tmp/investment-db-tools/node_modules/@electric-sql/pglite/dist/index.js node scripts/test-investment-funding-db.mjs
// PGlite has one connection: this tests SQL invariants, not concurrent sessions.
const { PGlite } = await import(process.env.PGLITE_MODULE || '@electric-sql/pglite');
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const db = new PGlite();
const users = { a:'11111111-1111-4111-8111-111111111111', b:'22222222-2222-4222-8222-222222222222', admin:'33333333-3333-4333-8333-333333333333' };
const ids = { a:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', b:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', admin:'cccccccc-cccc-4ccc-8ccc-cccccccccccc' };
const p1='dddddddd-dddd-4ddd-8ddd-dddddddddddd', p2='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid$$; create function auth.jwt() returns jsonb language sql as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$; grant usage on schema public,auth to anon,authenticated,service_role; insert into auth.users values ('${users.a}'),('${users.b}'),('${users.admin}');`);
await db.exec(await readFile(new URL('../supabase/migrations/20261106023811_personal_investment_funding.sql', import.meta.url),'utf8'));
await db.exec(await readFile(new URL('../supabase/migrations/20261106024102_personal_investment_policy_indexes.sql', import.meta.url),'utf8'));
let count=0;
function equal(actual,expected) { assert.deepEqual(actual,expected); count++; }
async function as(user,role='authenticated',extra={}) { await db.exec(`reset role; select set_config('request.jwt.claim.sub','${user??''}',false); select set_config('request.jwt.claims','${JSON.stringify({sub:user,role,is_anonymous:false,...extra})}',false); set role ${role};`); }
async function denied(sql,code='42501') {await assert.rejects(db.query(sql),e=>e.code===code);count++;}
async function snap() {return (await db.query('select personal_investment_snapshot() as data')).rows[0].data;}
function fund(id,user,amount=10000) {return `insert into personal_investment_funds(id,user_id,person_name,description,principal_cents,currency,received_on) values ('${id}','${user}','Synthetic person','Synthetic investment',${amount},'USD','2026-11-01')`;}
function repay(id=p1,user=users.a,fundId=ids.a,amount=4000,date='2026-11-02') {return `insert into personal_investment_repayments(id,user_id,fund_id,amount_cents,paid_on,payment_method) values ('${id}','${user}','${fundId}',${amount},'${date}','transfer')`;}
for (const key of ['a','b','admin']) {await as(users[key]);await db.query(fund(ids[key],users[key]));equal((await snap()).funds.map(x=>x.id),[ids[key]]);}
await as(users.a);
equal((await snap()).repayments,[]);
await denied(fund(p1,users.b));
await denied(`update personal_investment_funds set user_id='${users.b}'`);
await denied('update personal_investment_funds set version=99');
await denied('update personal_investment_funds set id=gen_random_uuid()');
await denied("update personal_investment_funds set currency='COP'");
await denied('delete from personal_investment_funds');
await denied('select personal_investment_fund_guard()');
await denied('select personal_investment_repayment_guard()');
await denied(fund(ids.a,users.a),'23505');
await denied(repay(p1,users.a,ids.b),'23503');
await denied(repay(p1,users.b,ids.b),'23503');
await denied(repay(p1,users.a,ids.a,0),'23514');
await denied(repay(p1,users.a,ids.a,10001),'23514');
await denied(repay(p1,users.a,ids.a,1,'2026-10-31'),'23514');
await db.query(repay());
let data=await snap();equal(data.funds[0].version,2);equal(data.repayments[0].amount_cents,4000);equal(data.repayments[0].version,1);
await denied(repay(),'23505');
equal((await snap()).repayments.length,1);
equal((await snap()).funds[0].version,2); // failed statements roll back parent touch too
await denied(repay(p2,users.a,ids.a,6001),'23514');
await denied(`update personal_investment_funds set principal_cents=3999 where id='${ids.a}'`,'23514');
await denied(`update personal_investment_funds set received_on='2026-11-03' where id='${ids.a}'`,'23514');
equal((await db.query(`update personal_investment_funds set description='stale' where id='${ids.a}' and version=1 returning id`)).rows.length,0);
equal((await db.query(`update personal_investment_funds set description='valid' where id='${ids.a}' and version=2 returning version`)).rows[0].version,3);
for (const change of ["amount_cents=1","paid_on='2026-11-01'",`fund_id='${ids.b}'`,`user_id='${users.b}'`,'version=99',"notes='rewritten'","payment_method='cash'",'id=gen_random_uuid()']) await denied(`update personal_investment_repayments set ${change} where id='${p1}'`);
await denied('delete from personal_investment_repayments');
await db.query(repay(p2,users.a,ids.a,6000));
equal((await snap()).funds[0].version,4);
await denied(repay(p2,users.a,ids.a,6000),'23514'); // duplicate at full balance: trigger rejects before unique check
await denied(repay('ffffffff-ffff-4fff-8fff-ffffffffffff',users.a,ids.a,1),'23514');
equal((await snap()).repayments.length,2);
const voidResult=await db.query(`update personal_investment_repayments set voided_at=now() where id='${p1}' and version=1 returning version,voided_at`);
equal(voidResult.rows[0].version,2);assert.ok(voidResult.rows[0].voided_at);count++;
equal((await db.query(`update personal_investment_repayments set voided_at=null where id='${p1}' and version=1 returning id`)).rows.length,0);
await db.query(`update personal_investment_funds set principal_cents=6000 where id='${ids.a}'`);
await denied(`update personal_investment_repayments set voided_at=null where id='${p1}' and version=2`,'23514');
equal((await snap()).repayments.find(x=>x.id===p1).version,2);
await db.query(`update personal_investment_funds set principal_cents=10000 where id='${ids.a}'`);
equal((await db.query(`update personal_investment_repayments set voided_at=null where id='${p1}' and version=2 returning version`)).rows[0].version,3);
await db.query(`update personal_investment_repayments set voided_at=now() where id in ('${p1}','${p2}')`);
await denied(`update personal_investment_funds set received_on='2026-11-03' where id='${ids.a}'`,'23514'); // voided history still counts
await db.query(`update personal_investment_funds set principal_cents=1 where id='${ids.a}'`);
// Two individually valid rows in one statement must not bypass the aggregate.
await denied(`insert into personal_investment_repayments(user_id,fund_id,amount_cents,paid_on,payment_method) select '${users.a}','${ids.a}',1,'2026-11-02','cash' from generate_series(1,2)`,'23514');
equal((await snap()).repayments.length,2);
// Restore two voided rows together: second row rejects and the entire statement rolls back.
await db.query(`update personal_investment_funds set principal_cents=6000 where id='${ids.a}'`);
await denied(`update personal_investment_repayments set voided_at=null where id in ('${p1}','${p2}')`,'23514');
equal((await snap()).repayments.filter(x=>x.voided_at===null).length,0);
await as(users.b);equal((await snap()).funds.map(x=>x.id),[ids.b]);equal((await snap()).repayments,[]);
equal((await db.query(`update personal_investment_repayments set voided_at=null where id='${p1}' returning id`)).rows,[]);
equal((await db.query(`update personal_investment_funds set principal_cents=1 where id='${ids.a}' returning id`)).rows,[]);
await as(users.admin,'authenticated',{app_metadata:{role:'admin'},user_metadata:{role:'admin'}});equal((await snap()).funds.map(x=>x.id),[ids.admin]);equal((await snap()).repayments,[]);
equal((await db.query(`update personal_investment_funds set principal_cents=1 where id='${ids.a}' returning id`)).rows,[]);
await as(users.a,'authenticated',{is_anonymous:true});equal(await snap(),{funds:[],repayments:[]});await denied(fund(p1,users.a));
await as(undefined,'authenticated');equal(await snap(),{funds:[],repayments:[]});
for(const role of ['anon','service_role']) {await as(undefined,role);await denied('select personal_investment_snapshot()');for(const table of ['personal_investment_funds','personal_investment_repayments']) {await denied(`select * from ${table}`);await denied(`delete from ${table}`);}await denied(fund(p1,users.a));await denied(repay());}
await as(users.a);
// Boundary and constraint coverage, including exact cents larger than 32-bit integers.
for(const amount of [0,-1,100000000000]) await denied(fund(p1,users.a,amount),'23514');
await denied(fund(p1,users.a).replace("'USD'","'EUR'"),'23514');
await denied(fund(p1,users.a).replace("'2026-11-01'","'1899-12-31'"),'23514');
await denied(fund(p1,users.a).replace("'Synthetic person'","repeat('x',121)"),'23514');
await denied(`update personal_investment_funds set notes=repeat('x',2001)`,'23514');
await denied(fund(p1,users.a).replace("'Synthetic person'","repeat(' ',120)||'x'"),'23514');
await denied(fund(p1,users.a).replace("'Synthetic investment'","repeat(' ',160)||'x'"),'23514');
await denied(fund(p1,users.a).replace("'Synthetic person'","'   '"),'23514');
await db.query(fund(p1,users.a,99999999999));
await db.query(repay('ffffffff-ffff-4fff-8fff-ffffffffffff',users.a,p1,99999999999));
equal((await snap()).repayments.find(x=>x.fund_id===p1).amount_cents,99999999999);
// Snapshot is a scalar JSON result, so REST max_rows=1000 cannot truncate its arrays.
await db.query(`insert into personal_investment_funds(user_id,person_name,description,principal_cents,currency,received_on) select '${users.a}','Synthetic person','Bulk '||i,10,'COP','2026-11-01' from generate_series(1,1100) i`);
await db.query(`insert into personal_investment_repayments(user_id,fund_id,amount_cents,paid_on,payment_method) select user_id,id,1,'2026-11-02','cash' from personal_investment_funds where description like 'Bulk %'`);
data=await snap();equal(data.funds.length,1102);equal(data.repayments.length,1103);equal(new Set(data.funds.map(x=>x.id)).size,1102);equal(new Set(data.repayments.map(x=>x.id)).size,1103);equal([...data.funds,...data.repayments].some(x=>'user_id' in x),false);
await as(users.b);equal((await snap()).funds.length,1);equal((await snap()).repayments.length,0);
await db.exec('reset role');
equal((await db.query("select count(*)::int n from pg_class where relname in ('personal_investment_funds','personal_investment_repayments') and relrowsecurity and relforcerowsecurity")).rows[0].n,2);
equal((await db.query("select count(*)::int n from pg_proc where proname like 'personal_investment_%' and prosecdef")).rows[0].n,0);
console.log(`PASS ${count} local PostgreSQL assertions: owner isolation, no admin/anon/service bypass, column grants, exact cents, overpayment, multi-row atomicity, stale versions, void/restore, history, duplicates and >1000-row snapshots. No hosted changes. For genuine multi-session races, also run scripts/test-investment-funding-concurrency.mjs against its isolated local PostgreSQL server.`);
await db.close();
