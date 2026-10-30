import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import * as money from '../lib/investments/money.ts';
import * as validation from '../lib/investments/validation.ts';
import * as expensePresets from '../lib/investments/expense-presets.ts';

// Execute the real server-action module with an isolated in-memory query double.
// No Next auth/session module, Supabase client, network or live financial row loads.
const vehicle='11111111-1111-4111-8111-111111111111';
const record='abcdefab-2222-4222-8222-222222222222';
const source=readFileSync(new URL('../app/mi-cuenta/inversiones/actions.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function harness(options:{admin?:boolean;data?:{id:string}[]|null;error?:unknown;repeat?:boolean}={}) {
 const calls:unknown[][]=[];let updated=false;
 const db={from(table:string){calls.push(['from',table]);const query={
  async insert(values:unknown){calls.push(['insert',values]);return{error:options.error??null};},
  update(values:unknown){calls.push(['update',values]);return query;},
  eq(key:string,value:unknown){calls.push(['eq',key,value]);return query;},
  is(key:string,value:unknown){calls.push(['is',key,value]);return query;},
  async select(columns:string){calls.push(['select',columns]);const data=options.repeat&&updated?[]:('data' in options?options.data:[{id:record}]);updated=true;return {data,error:options.error??null};},
 };return query;}};
 const imports:Record<string,unknown>={
  'next/cache':{revalidatePath:(...args:unknown[])=>calls.push(['revalidate',...args])},
  'next/navigation':{redirect:(url:string)=>{calls.push(['redirect',url]);throw new Error('TEST_REDIRECT');}},
  '@/lib/investments/server':{investmentIdentity:async()=>{calls.push(['identity']);return{db,admin:options.admin??true};}},
  '@/lib/investments/money':money,
  '@/lib/investments/validation':validation,
  '@/lib/investments/expense-presets':expensePresets,
  '@/lib/academy/server':{checked:<T extends {error:unknown}>(r:T)=>{if(r.error)throw r.error;return r;}},
 };
 const module={exports:{} as {saveInvestment:(form:FormData)=>Promise<{error:string}|undefined>}};
 new Function('require','module','exports',code)((id:string)=>{assert.ok(id in imports,'Unexpected server import '+id);return imports[id];},module,module.exports);
 const form=(action:string)=>{const f=new FormData();f.set('action',action);f.set('vehicle_id',vehicle);f.set(action==='revoke'?'member_id':'expense_id',record);return f;};
 return {calls,save:module.exports.saveInvestment,form};
}
for(const [action,table,field] of [['void-expense','investment_expenses','voided_at'],['revoke','investment_members','revoked_at']]) {
 test(`${action} updates one active row scoped to vehicle then revalidates`,async()=>{
  const h=harness();await assert.rejects(h.save(h.form(action)),/TEST_REDIRECT/);
  assert.deepEqual(h.calls[0],['identity']);
  for(const call of [['from',table],['eq','id',record],['eq','vehicle_id',vehicle],['is',field,null],['select','id']]) assert.ok(h.calls.some(x=>JSON.stringify(x)===JSON.stringify(call)));
  assert.deepEqual(h.calls.filter(x=>x[0]==='revalidate'),[['revalidate','/mi-cuenta/inversiones','layout'],['revalidate','/mi-cuenta']]);assert.equal(h.calls.filter(x=>x[0]==='redirect').length,1);
 });
 test(`${action} accepts uppercase UUID input with canonical returned ID`,async()=>{
  const h=harness();const f=h.form(action);f.set(action==='revoke'?'member_id':'expense_id',record.toUpperCase());await assert.rejects(h.save(f),/TEST_REDIRECT/);assert.ok(h.calls.some(x=>x[0]==='eq'&&x[1]==='id'&&x[2]===record));
 });
 test(`${action} rejects zero, null, wrong or multiple returned records without success`,async()=>{
  for(const data of [[],null,[{id:vehicle}],[{id:record},{id:record}]]) {const h=harness({data});const r=await h.save(h.form(action));assert.ok(r?.error);assert.equal(h.calls.some(x=>['revalidate','redirect'].includes(String(x[0]))),false);}
 });
 test(`${action} repeated operation cannot claim a second success`,async()=>{
  const h=harness({repeat:true});await assert.rejects(h.save(h.form(action)),/TEST_REDIRECT/);assert.ok((await h.save(h.form(action)))?.error);assert.equal(h.calls.filter(x=>x[0]==='redirect').length,1);
 });
 test(`${action} database error is safe and does not revalidate`,async()=>{
  const h=harness({error:{code:'42501',message:'private backend detail'}});const r=await h.save(h.form(action));assert.match(r?.error??'',/No se pudo guardar/);assert.doesNotMatch(r?.error??'',/private backend/);assert.equal(h.calls.some(x=>x[0]==='revalidate'),false);
 });
}
test('nonadmin cannot reach any investment mutation query',async()=>{
 for(const action of ['create','vehicle','expense','void-expense','member','revoke']) {const h=harness({admin:false});await assert.rejects(h.save(h.form(action)),/Solo el administrador/);assert.deepEqual(h.calls,[['identity']]);}
});
test('malformed vehicle or destructive record id never reaches update',async()=>{
 for(const key of ['vehicle_id','expense_id']) {const h=harness();const f=h.form('void-expense');f.set(key,'bad');assert.ok((await h.save(f))?.error);assert.equal(h.calls.some(x=>x[0]==='from'),false);}
});
test('expense shortcuts insert only canonical category, exact cents and chosen calendar date',async()=>{
 for(const [preset,option] of Object.entries(expensePresets.expensePresets)) {
  const h=harness();const f=h.form('expense');f.set('expense_preset',preset);f.set('category','auction');f.set('description',preset==='other'?'Estacionamiento':'Proveedor local');f.set('amount_cents','150.25');f.set('incurred_on','2026-10-29');
  await assert.rejects(h.save(f),/TEST_REDIRECT/);
  assert.deepEqual(h.calls.find(x=>x[0]==='insert'),['insert',{vehicle_id:vehicle,category:option.category,description:preset==='other'?'Estacionamiento':option.label+' · Proveedor local',amount_cents:15025,incurred_on:'2026-10-29'}]);
 }
});
test('invalid preset, missing custom concept, invalid amount or date never insert an expense',async()=>{
 for(const [key,value] of [['expense_preset','unknown'],['expense_preset','constructor'],['description','   '],['amount_cents',''],['amount_cents','1.001'],['amount_cents','-1'],['incurred_on','2026-02-30'],['incurred_on','']]) {
  const h=harness();const f=h.form('expense');f.set('expense_preset','other');f.set('description','Local only');f.set('amount_cents','0');f.set('incurred_on','2026-10-29');f.set(key,value);
  assert.ok((await h.save(f))?.error);assert.equal(h.calls.some(x=>['insert','revalidate','redirect'].includes(String(x[0]))),false);
 }
});
test('expense legacy forms retain category and description; blank is not assumed zero',async()=>{
 const h=harness();const f=h.form('expense');f.set('category','repair');f.set('description','Existing broad repair description');f.set('amount_cents','0');f.set('incurred_on','2026-10-29');
 await assert.rejects(h.save(f),/TEST_REDIRECT/);assert.deepEqual(h.calls.find(x=>x[0]==='insert'),['insert',{vehicle_id:vehicle,category:'repair',description:'Existing broad repair description',amount_cents:0,incurred_on:'2026-10-29'}]);
});
