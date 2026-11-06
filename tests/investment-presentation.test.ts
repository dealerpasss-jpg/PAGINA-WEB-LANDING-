import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as view from '../lib/investments/view.ts';
import * as money from '../lib/investments/money.ts';
import { portfolioSummary } from '../lib/investments/portfolio.ts';
const require=createRequire(import.meta.url);
function load(path:string,overrides:Record<string,unknown>={}) {
 const code=ts.transpileModule(readFileSync(new URL('../'+path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const imports:Record<string,unknown>={'react':React,'react/jsx-runtime':require('react/jsx-runtime'),'@/lib/investments/money':money,'@/lib/investments/view':view,'@/lib/investments/portfolio':{portfolioSummary},...overrides};
 const module={exports:{} as Record<string,unknown>};
 new Function('require','module','exports','window','FormData',code)((id:string)=>{assert.ok(id in imports,'Unexpected import '+id);return imports[id];},module,module.exports,overrides.window,overrides.FormData??FormData);
 return module.exports.default as React.ComponentType<any>;
}
const Overview=load('components/investments/PortfolioOverview.tsx');
const SaleFields=load('components/investments/SaleFields.tsx');
const Vehicle=load('components/investments/VehicleForm.tsx',{
 './SaleFields':SaleFields,
 '@/lib/investments/sales':{businessDate:()=> '2026-10-31'},
 './InvestmentForm':({children,...props}:any)=>React.createElement('form',props,children),
 './Submit':({children}:any)=>React.createElement('button',{type:'submit'},children),
});
test('real finance overview names sales not collections, and marks all unknown closes pending',()=>{
 const summary=portfolioSummary([{status:'sold',purchase_cents:null,sale_cents:null,summary:money.totals(null,[],null,null)}]);
 const html=renderToStaticMarkup(React.createElement(Overview,{summary}));
 assert.match(html,/CARROS ACTIVOS/);assert.match(html,/1 vendidos/);assert.match(html,/VENTAS REGISTRADAS/);assert.match(html,/RESULTADO PARCIAL/);assert.match(html,/Pendiente/);assert.match(html,/no confirma|No confirma/);assert.doesNotMatch(html,/\$0\.00<\/strong><small>1 cierres/);
});
test('grouped vehicle form preserves exact fields once, raw defaults and pending purchases',()=>{
 const vehicle={id:'synthetic',title:'Test car',vin:'',auction:'',purchased_on:null,purchase_cents:null,asking_cents:123456,sale_cents:0,status:'sold',notes:'Test only',version:7};
 const html=renderToStaticMarkup(React.createElement(Vehicle,{vehicle}));
 const names=[...html.matchAll(/ name="([^"]+)"/g)].map(m=>m[1]).sort();
 assert.deepEqual(names,['action','vehicle_id','version','title','vin','auction','purchased_on','purchase_cents','asking_cents','sale_cents','sold_on','status','notes'].sort());
 assert.equal((html.match(/<form/g)||[]).length,1);assert.equal((html.match(/type="submit"/g)||[]).length,1);
 assert.match(html,/name="purchase_cents"[^>]*value=""/);assert.match(html,/name="sale_cents"[^>]*value="0.00"/);assert.match(html,/name="asking_cents"[^>]*value="1234.56"/);assert.match(html,/name="version"[^>]*value="7"/);
 assert.match(html,/01 \/ Identifica/);assert.match(html,/02 \/ Registra/);assert.match(html,/03 \/ Venta/);assert.match(html,/inputMode="decimal"/);assert.match(html,/no el cobro/);
});
test('destructive confirmation cancellation and pending guard never call the server action',()=>{
 for(const pending of [false,true]) {
  let confirms=0,transitions=0,saves=0,prevented=false;
  const Form=load('components/investments/InvestmentForm.tsx',{
   react:{...React,useRef:(value:unknown)=>({current:value}),useEffect:()=>{},useTransition:()=>[pending,()=>{transitions++;}],useState:()=>['',()=>{}]},
   'next/navigation':{unstable_rethrow:()=>{}},
   '@/app/mi-cuenta/inversiones/actions':{saveInvestment:()=>{saves++;}},
   window:{confirm:()=>{confirms++;return false;}},
  }) as (props:unknown)=>React.ReactElement<any>;
  const tree=Form({children:null,confirmMessage:'Confirm?'});
  const form=tree.props.children;
  form.props.onSubmit({preventDefault:()=>{prevented=true;},currentTarget:{}});
  assert.equal(prevented,true);assert.equal(confirms,pending?0:1);assert.equal(transitions,0);assert.equal(saves,0);
 }
});
test('destructive forms are confirmed and administrative financial data stays gated',()=>{
 const detail=readFileSync(new URL('../app/mi-cuenta/inversiones/[id]/page.tsx',import.meta.url),'utf8');
 const list=readFileSync(new URL('../app/mi-cuenta/inversiones/page.tsx',import.meta.url),'utf8');
 assert.match(detail,/confirmMessage=\{"¿Anular este gasto/);assert.match(detail,/confirmMessage="¿Retirar el acceso/);
 assert.match(list,/const readDb=admin\?database\(\):db/);assert.match(list,/const portfolio=admin\?portfolioSummary/);assert.match(list,/summary:admin\?totals/);
 assert.match(detail,/admin\?allRows<\{id:string;category/);assert.match(detail,/\.filter\(e=>!e.voided_at\)/);
 const css=readFileSync(new URL('../app/mi-cuenta/inversiones/investments.css',import.meta.url),'utf8');
 assert.match(css,/@media\(max-width:700px\)[\s\S]*investment-vehicle-form[\s\S]*grid-template-columns:1fr/);
});

const Status=load('components/investments/VehicleStatus.tsx',{'./VehicleStatus.module.css':new Proxy({},{get:(_,key)=>String(key)})});
test('all four canonical vehicle states have consistent accessible text and decorative real icons',()=>{
 for(const [status,label] of Object.entries(money.statuses)) {
  const html=renderToStaticMarkup(React.createElement(Status,{status}));assert.match(html,new RegExp(label));assert.match(html,new RegExp('data-status="'+status+'"'));assert.match(html,/<svg[^>]*aria-hidden="true"[^>]*focusable="false"/);assert.doesNotMatch(html,/<button/);
 }
 const css=readFileSync(new URL('../components/investments/VehicleStatus.module.css',import.meta.url),'utf8');for(const status of ['repairing','listed','sold'])assert.ok(css.includes('[data-status='+status+']'));assert.match(css,/forced-colors/);assert.match(css,/color:inherit/);
});
test('reopening an existing close keeps its values enabled for explicit clearing, not silent omission',()=>{
 const Reopening=load('components/investments/SaleFields.tsx',{react:{...React,useState:()=>['listed',()=>{}]}});
 const html=renderToStaticMarkup(React.createElement(Reopening,{status:'sold',asking:'300.00',sale:'200.50',soldOn:'2026-10-30',today:'2026-10-31'}));
 for(const name of ['sale_cents','sold_on']) {const input=html.match(new RegExp('<input[^>]*name="'+name+'"[^>]*>'))?.[0]??'';assert.ok(input);assert.doesNotMatch(input,/disabled|required/);}
 assert.match(html,/value="200.50"/);assert.match(html,/value="2026-10-30"/);assert.match(html,/borra explícitamente/);
});
test('new close requires date while legacy undated stays editable and active-only fields are disabled',()=>{
 for(const [status,soldOn,required] of [['sold','2026-10-30',true],['sold',null,false],['purchased',null,false]] as const) {
  const html=renderToStaticMarkup(React.createElement(SaleFields,{status,asking:'',sale:'',soldOn,today:'2026-10-31'}));const input=html.match(/<input[^>]*name="sold_on"[^>]*>/)?.[0]??'';
  assert.equal(input.includes('required='),required);assert.equal(input.includes('disabled='),status==='purchased');
 }
});

test('submit captures current allowlisted filters without losing typed cents or version',async()=>{
 let saved:FormData|undefined;let run:Promise<void>|undefined;const values=new FormData();values.set('amount_cents','150,25');values.set('version','7');values.set('inventory_query','next=https://evil.test');
 const location={search:'?buscar=Ford&estado=listed&orden=cost-desc&message=old'};
 const Form=load('components/investments/InvestmentForm.tsx',{
  react:{...React,useRef:(value:unknown)=>({current:value}),useEffect:()=>{},useTransition:()=>[false,(callback:()=>Promise<void>)=>{run=callback();}],useState:()=>['',()=>{}]},
  'next/navigation':{unstable_rethrow:()=>{}},'@/app/mi-cuenta/inversiones/actions':{saveInvestment:async(data:FormData)=>{saved=data;}},
  window:{location},FormData:function(){return values;},
 }) as (props:unknown)=>React.ReactElement<any>;
 const tree=Form({children:null});location.search='?buscar=Mazda+%26+blanco&estado=repairing&pendientes=all&orden=result-desc&next=https://evil.test&message=old';
 tree.props.children.props.onSubmit({preventDefault:()=>{},currentTarget:{}});await run;
 assert.equal(saved?.get('amount_cents'),'150,25');assert.equal(saved?.get('version'),'7');assert.equal(saved?.get('inventory_query'),'buscar=Mazda+%26+blanco&estado=repairing&pendientes=all&orden=result-desc');
});

test('same-tick duplicate submit is locked until settlement, then failed save remains retryable',async()=>{
 let saves=0;let resolve:(value:{error:string})=>void=()=>{};let run:Promise<void>|undefined;const states:unknown[]=[];
 const Form=load('components/investments/InvestmentForm.tsx',{
  react:{...React,useRef:(value:unknown)=>({current:value}),useEffect:()=>{},useState:(value:unknown)=>[value,(next:unknown)=>states.push(next)],useTransition:()=>[false,(callback:()=>Promise<void>)=>{run=callback();}]},
  'next/navigation':{unstable_rethrow:()=>{}},'@/app/mi-cuenta/inversiones/actions':{saveInvestment:()=>{saves++;return new Promise(r=>{resolve=r;});}},
  window:{location:{search:'?vista=table'}},FormData:function(){const data=new FormData();data.set('amount_cents','150,25');return data;},
 }) as (props:unknown)=>React.ReactElement<any>;
 const form=Form({children:null}).props.children;const event={preventDefault(){},currentTarget:{}};
 form.props.onSubmit(event);form.props.onSubmit(event);assert.equal(saves,1);
 resolve({error:'Revisa el importe.'});await run;assert.ok(states.includes('Revisa el importe.'));
 form.props.onSubmit(event);assert.equal(saves,2);resolve({error:'Revisa el importe.'});await run;
});
test('error focus uses a live alert target, preserves input fields, and clears the sticky header',()=>{
 const calls:unknown[][]=[];const target={focus:(o:unknown)=>calls.push(['focus',o]),scrollIntoView:(o:unknown)=>calls.push(['scroll',o])};let refs=0;let states=0;const effects:Array<()=>void>=[];
 const Form=load('components/investments/InvestmentForm.tsx',{
  react:{...React,useRef:()=>({current:++refs===1?false:target}),useEffect:(effect:()=>void)=>effects.push(effect),useState:()=>[++states===1?'Error de prueba':1,()=>{}],useTransition:()=>[false,()=>{}]},
  'next/navigation':{unstable_rethrow:()=>{}},'@/app/mi-cuenta/inversiones/actions':{saveInvestment:()=>{}},
 }) as (props:unknown)=>React.ReactElement<any>;
 const field=React.createElement('input',{defaultValue:'150,25'});const tree=Form({children:field});effects.forEach(effect=>effect());
 assert.deepEqual(calls,[['focus',{preventScroll:true}],['scroll',{block:'start',behavior:'instant'}]]);
 const children=tree.props.children.props.children;assert.equal(children[0].props.children,field);assert.equal(children[1].props.role,'alert');assert.equal(children[1].props.tabIndex,-1);assert.equal(children[1].props.style.scrollMarginTop,110);
});
