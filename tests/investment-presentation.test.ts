import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as money from '../lib/investments/money.ts';
import { portfolioSummary } from '../lib/investments/portfolio.ts';
const require=createRequire(import.meta.url);
function load(path:string,overrides:Record<string,unknown>={}) {
 const code=ts.transpileModule(readFileSync(new URL('../'+path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const imports:Record<string,unknown>={'react':React,'react/jsx-runtime':require('react/jsx-runtime'),'@/lib/investments/money':money,'@/lib/investments/portfolio':{portfolioSummary},...overrides};
 const module={exports:{} as Record<string,unknown>};
 new Function('require','module','exports','window',code)((id:string)=>{assert.ok(id in imports,'Unexpected import '+id);return imports[id];},module,module.exports,overrides.window);
 return module.exports.default as React.ComponentType<any>;
}
const Overview=load('components/investments/PortfolioOverview.tsx');
const Vehicle=load('components/investments/VehicleForm.tsx',{
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
 assert.deepEqual(names,['action','vehicle_id','version','title','vin','auction','purchased_on','purchase_cents','asking_cents','sale_cents','status','notes'].sort());
 assert.equal((html.match(/<form/g)||[]).length,1);assert.equal((html.match(/type="submit"/g)||[]).length,1);
 assert.match(html,/name="purchase_cents"[^>]*value=""/);assert.match(html,/name="sale_cents"[^>]*value="0.00"/);assert.match(html,/name="asking_cents"[^>]*value="1234.56"/);assert.match(html,/name="version"[^>]*value="7"/);
 assert.match(html,/01 \/ Identifica/);assert.match(html,/02 \/ Registra/);assert.match(html,/03 \/ Venta/);assert.match(html,/inputMode="decimal"/);assert.match(html,/no confirma cuánto te han pagado/);
});
test('destructive confirmation cancellation and pending guard never call the server action',()=>{
 for(const pending of [false,true]) {
  let confirms=0,transitions=0,saves=0,prevented=false;
  const Form=load('components/investments/InvestmentForm.tsx',{
   react:{...React,useTransition:()=>[pending,()=>{transitions++;}],useState:()=>['',()=>{}]},
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
