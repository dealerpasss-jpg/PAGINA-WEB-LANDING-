import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { salesHistory } from '../lib/investments/sales-history.ts';
import type { DashboardVehicle } from '../lib/investments/dashboard-summary.ts';
const car=(id:string,overrides:Partial<DashboardVehicle>={}):DashboardVehicle=>({id,title:id,status:'sold',purchase_cents:350000,asking_cents:850000,sale_cents:700000,sold_on:null,created_at:'2026-10-30',...overrides});
test('sale result uses actual closing price and recorded costs, not asking or registration date',()=>{
 const s=salesHistory([car('mazda')],[{vehicle_id:'mazda',amount_cents:41250}]);
 assert.equal(s.rows[0].sold_on,null);assert.equal(s.undated,1);assert.equal(s.profit,308750);assert.equal(s.revenue,700000);assert.equal(s.rows[0].summary.cost,391250);
});
test('month filter excludes unknown dates but all history preserves them, newest first',()=>{
 const cars=[car('undated'),car('oct',{sold_on:'2026-10-31'}),car('nov',{sold_on:'2026-11-01'}),car('invalid',{sold_on:'2026-02-30'})];
 assert.deepEqual(salesHistory(cars,[]).rows.map(v=>v.id),['nov','oct','invalid','undated']);
 const s=salesHistory(cars,[],'2026-11');assert.deepEqual(s.rows.map(v=>v.id),['nov']);assert.equal(s.undated,2);assert.equal(s.totalCount,4);
 assert.equal(salesHistory(cars,[],'bad').rows.length,4);
});
test('missing values never become cost zero, zeros and losses remain exact',()=>{
 const s=salesHistory([car('unknown',{purchase_cents:null}),car('loss',{sale_cents:100000}),car('zero',{purchase_cents:0,sale_cents:0}),car('no-sale',{sale_cents:null}),car('active',{status:'listed'})],[]);
 assert.equal(s.rows.length,4);assert.equal(s.missingResult,2);assert.equal(s.missingSale,1);assert.equal(s.profit,-250000);assert.equal(s.rows.find(v=>v.id==='unknown')?.summary.realized,null);assert.equal(s.rows.find(v=>v.id==='zero')?.summary.realized,0);
});
test('history keeps all rows beyond page size and ignores expenses of other vehicles',()=>{
 const s=salesHistory(Array.from({length:501},(_,i)=>car('v'+i)),[{vehicle_id:'unrelated',amount_cents:9900000}]);assert.equal(s.rows.length,501);assert.equal(s.profit,501*350000);
});
test('route verifies admin before private reads, rejects failed query instead of showing zero',()=>{
 const source=readFileSync(new URL('../app/mi-cuenta/ventas/page.tsx',import.meta.url),'utf8');
 assert.ok(source.indexOf("who.profile.role!=='admin'")<source.indexOf('const db=database()'));
 assert.match(source,/requireIdentity\('\/mi-cuenta\/ventas'\)/);assert.match(source,/force-dynamic/);assert.match(source,/allRows<DashboardVehicle>/);assert.match(source,/allRows<DashboardExpense>/);assert.match(source,/\.is\('voided_at',null\)/);assert.match(source,/\.eq\('status','sold'\)/);assert.match(source,/!history\?<p role="alert"/);assert.match(source,/Fecha de venta pendiente/);
});
test('refresh is bounded visible-only, cleans up and preserves URL filters',()=>{
 const source=readFileSync(new URL('../components/investments/SalesRefresh.tsx',import.meta.url),'utf8');assert.match(source,/visibilityState==='visible'/);assert.match(source,/navigator.onLine/);assert.match(source,/setInterval\(refresh,30000\)/);assert.match(source,/clearInterval/);assert.match(source,/removeEventListener/);assert.match(source,/router.refresh/);assert.doesNotMatch(source,/router.push|router.replace/);
});

// Execute the actual async server page with isolated dependencies, including auth failures.
import ts from 'typescript';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as money from '../lib/investments/money.ts';
const require=createRequire(import.meta.url);
function pageHarness(role:string,vehicles:DashboardVehicle[]=[],fail=false) {
 const calls:string[]=[];
 const query:any={select(){return query;},eq(){return query;},order(){return query;},is(){return query;},range:async()=>({data:vehicles,error:null})};
 const deps:Record<string,unknown>={
 'react/jsx-runtime':require('react/jsx-runtime'),'next/link':({children,...p}:any)=>React.createElement('a',p,children),
 'next/navigation':{redirect:(to:string)=>{throw new Error('REDIRECT:'+to);}},
 '@/components/AccountShell':({children,title}:any)=>React.createElement('main',null,React.createElement('h1',null,title),children),
 '@/components/investments/SalesRefresh':()=>React.createElement('button',null,'Actualizar ahora'),
 '@/lib/academy/server':{requireIdentity:async()=>{if(role==='anonymous')throw new Error('LOGIN');return{profile:{role}};},database:()=>{calls.push('database');return{from:()=>query};}},
 '@/lib/investments/server':{allRows:async()=>{if(fail)throw new Error('SECRET_DB_ERROR');return calls.push('read')===2?vehicles:[];}},
 '@/lib/investments/sales-history':{salesHistory},'@/lib/investments/money':money,
 './sales.module.css':{__esModule:true,default:new Proxy({},{get:(_,k)=>String(k)})},
 };
 const code=ts.transpileModule(readFileSync(new URL('../app/mi-cuenta/ventas/page.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const module={exports:{} as any};new Function('require','module','exports',code)((id:string)=>{assert.ok(id in deps,'Unexpected import '+id);return deps[id];},module,module.exports);
 return{calls,render:async(mes?:string)=>renderToStaticMarkup(await module.exports.default({searchParams:Promise.resolve({mes})}))};
}
test('actual page denies anonymous and nonadmin before any private database call',async()=>{
 for(const role of ['anonymous','student','Admin','staff']){const h=pageHarness(role);await assert.rejects(h.render());assert.deepEqual(h.calls,[]);}
});
test('actual page renders real row, undated notice and known result; month filter does not invent date',async()=>{
 const h=pageHarness('admin',[car('test-car')]);const html=await h.render();assert.match(html,/test-car/);assert.match(html,/Fecha de venta pendiente/);assert.match(html,/\$7,000.00/);assert.match(html,/\$3,500.00/);assert.match(html,/href="\/mi-cuenta\/inversiones\/test-car"/);
 const filtered=await pageHarness('admin',[car('test-car')]).render('2026-11');assert.match(filtered,/No hay ventas en este mes/);assert.doesNotMatch(filtered,/<h2>test-car/);
});
test('actual page distinguishes query failure from empty data, without leaking database errors',async()=>{
 const failed=await pageHarness('admin',[],true).render();assert.match(failed,/No pudimos cargar/);assert.doesNotMatch(failed,/\$0.00|SECRET_DB_ERROR|Todavía no hay ventas/);
 const empty=await pageHarness('admin').render();assert.match(empty,/Todavía no hay ventas/);
});
