// Local-only regression. Installs are deliberately external to the application.
// npm install --prefix /tmp/investment-postgres-tools --cache=/tmp/investment-npm-cache --save-exact @embedded-postgres/linux-x64@17.7.0-beta.16 pg@8.16.3
// PG_TOOLS=/tmp/investment-postgres-tools node scripts/test-investment-funding-concurrency.mjs
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { spawn, execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:net';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const root=process.env.PG_TOOLS || '/tmp/investment-postgres-tools';
const require=createRequire(resolve(root,'package.json'));
const { Client }=require('pg');
const bin=resolve(root,'node_modules/@embedded-postgres/linux-x64/native/bin');
const dir=await mkdtemp('/tmp/investment-concurrency-');
const listener=createServer();
await new Promise((ok,fail)=>listener.once('error',fail).listen(0,'127.0.0.1',ok));
const port=listener.address().port;
await new Promise(ok=>listener.close(ok));
let processDB; let log=''; const clients=[];
const delay=ms=>new Promise(ok=>setTimeout(ok,ms));
try {
  execFileSync(resolve(bin,'initdb'),['-D',dir,'-U','synthetic_admin','--auth=trust','--encoding=UTF8','--no-locale'],{stdio:'pipe'});
  processDB=spawn(resolve(bin,'postgres'),['-D',dir,'-h','127.0.0.1','-p',String(port),'-c','unix_socket_directories=','-c','max_connections=10'],{stdio:['ignore','pipe','pipe']});
  processDB.stdout.on('data',x=>log+=x); processDB.stderr.on('data',x=>log+=x);
  let launchError; processDB.on('error',e=>launchError=e);
  for(let i=0;i<100 && !log.includes('database system is ready to accept connections');i++) {
    if(launchError || processDB.exitCode!==null) throw new Error('Local PostgreSQL launch failed: '+(launchError?.message||log));
    await delay(50);
  }
  if(!log.includes('database system is ready to accept connections')) throw new Error('Local PostgreSQL readiness timeout: '+log);
  const connect=async()=>{const c=new Client({host:'127.0.0.1',port,user:'synthetic_admin',database:'postgres'});await c.connect();clients.push(c);return c;};
  const admin=await connect(),a=await connect(),b=await connect();
  const user='11111111-1111-4111-8111-111111111111';
  await admin.query(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; create function auth.jwt() returns jsonb language sql as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$; grant usage on schema public,auth to anon,authenticated,service_role; insert into auth.users values ('${user}');`);
  await admin.query(await readFile(resolve(process.cwd(),'supabase/migrations/20261106023811_personal_investment_funding.sql'),'utf8'));
  await admin.query(await readFile(resolve(process.cwd(),'supabase/migrations/20261106024102_personal_investment_policy_indexes.sql'),'utf8'));
  for(const c of [a,b]) await c.query(`select set_config('request.jwt.claim.sub','${user}',false); select set_config('request.jwt.claims','{"is_anonymous":false}',false); set role authenticated; set statement_timeout='10s'`);
  const pid=(await b.query('select pg_backend_pid() pid')).rows[0].pid;
  let passed=0;
  for(const isolation of ['READ COMMITTED','REPEATABLE READ']) {
    for(const scenario of ['overpayment','payment-principal','principal-payment','payment-date','date-payment','restore-payment','payment-restore','stale-parent']) {
      const fund=randomUUID(),repayment=randomUUID();
      await a.query(`insert into personal_investment_funds(id,user_id,person_name,description,principal_cents,currency,received_on) values ('${fund}','${user}','Synthetic','Concurrency',100,'USD','2026-11-01')`);
      const pay=(amount,id=randomUUID())=>`insert into personal_investment_repayments(id,user_id,fund_id,amount_cents,paid_on,payment_method) values ('${id}','${user}','${fund}',${amount},'2026-11-02','cash')`;
      const parent=changes=>`update personal_investment_funds set ${changes} where id='${fund}'`;
      const restore=`update personal_investment_repayments set voided_at=null where id='${repayment}'`;
      if(scenario.includes('restore')) {await a.query(pay(70,repayment));await a.query(`update personal_investment_repayments set voided_at=now() where id='${repayment}'`);}
      const operations={
        overpayment:[pay(70),pay(40)],
        'payment-principal':[pay(70),parent('principal_cents=60')],
        'principal-payment':[parent('principal_cents=60'),pay(70)],
        'payment-date':[pay(70),parent("received_on='2026-11-03'")],
        'date-payment':[parent("received_on='2026-11-03'"),pay(70)],
        'restore-payment':[restore,pay(40)],
        'payment-restore':[pay(40),restore],
        'stale-parent':[pay(70),parent("description='stale'")+" and version=1 returning id"],
      };
      await a.query('BEGIN ISOLATION LEVEL '+isolation);await b.query('BEGIN ISOLATION LEVEL '+isolation);
      // Establish B's snapshot before A writes, particularly at REPEATABLE READ.
      await b.query(`select * from personal_investment_funds where id='${fund}'`);
      await a.query(operations[scenario][0]);
      let settled=false;
      const pending=b.query(operations[scenario][1]).then(result=>({result}),error=>({error})).finally(()=>settled=true);
      let blocked=false;
      for(let i=0;i<100;i++) {
        const status=await admin.query('select wait_event_type from pg_stat_activity where pid=$1',[pid]);
        if(status.rows[0]?.wait_event_type==='Lock') {blocked=true;break;}
        if(settled) break;
        await delay(10);
      }
      assert.equal(blocked,true,`${isolation} ${scenario}: competitor must wait for A's row lock`);
      await a.query('COMMIT');
      const outcome=await pending;
      if(isolation==='READ COMMITTED' && scenario==='stale-parent') {
        assert.equal(outcome.error,undefined);assert.equal(outcome.result.rowCount,0);
      } else assert.equal(outcome.error?.code,isolation==='READ COMMITTED'?'23514':'40001',`${isolation} ${scenario}: ${outcome.error?.message||'unexpected success'}`);
      await b.query('ROLLBACK');
      const check=await a.query(`select f.principal_cents,f.received_on,f.description,coalesce(sum(r.amount_cents) filter (where r.voided_at is null),0) as total,count(*) filter (where r.paid_on<f.received_on) as bad_dates from personal_investment_funds f left join personal_investment_repayments r on r.fund_id=f.id where f.id='${fund}' group by f.id`);
      assert.ok(BigInt(check.rows[0].total)<=BigInt(check.rows[0].principal_cents));assert.equal(check.rows[0].bad_dates,'0');assert.equal(check.rows[0].description,'Concurrency');
      passed++;console.log(`PASS ${isolation}: ${scenario}`);
    }
  }
  console.log(`PASS ${passed} genuine two-session PostgreSQL 17 races; lock waits observed, expected constraint/serialization failures and final invariants verified. Synthetic local data only.`);
} finally {
  await Promise.allSettled(clients.map(c=>c.end()));
  if(processDB && processDB.exitCode===null) {processDB.kill('SIGTERM');await new Promise(ok=>processDB.once('exit',ok));}
  await rm(dir,{recursive:true,force:true});
}
