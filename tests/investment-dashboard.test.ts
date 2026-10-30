import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { dashboardInvestmentSummary, type DashboardVehicle } from '../lib/investments/dashboard-summary.ts';
import { portfolioSummary } from '../lib/investments/portfolio.ts';
import * as money from '../lib/investments/money.ts';
const require=createRequire(import.meta.url);
function moduleAt(path:string,overrides:Record<string,unknown>={}) {
 const code=ts.transpileModule(readFileSync(new URL('../'+path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const imports:Record<string,unknown>={'react':React,'react/jsx-runtime':require('react/jsx-runtime'),'server-only':{},...overrides};
 const module={exports:{} as Record<string,any>};new Function('require','module','exports',code)((id:string)=>{assert.ok(id in imports,'Unexpected import '+id);return imports[id];},module,module.exports);return module.exports;
}
const car=(id:string,overrides:Partial<DashboardVehicle>={}):DashboardVehicle=>({id,title:'Synthetic '+id,status:'repairing',purchase_cents:10000,asking_cents:20000,sale_cents:null,created_at:'2026-10-30',...overrides});
test('main summary aggregates active expenses per real ID without mixing registered sale or realized profit',()=>{
 const snapshot=dashboardInvestmentSummary([car('a'),car('b',{status:'sold',sale_cents:17000}),car('c',{purchase_cents:null})],[{vehicle_id:'a',amount_cents:2000},{vehicle_id:'a',amount_cents:500},{vehicle_id:'b',amount_cents:3000},{vehicle_id:'c',amount_cents:600},{vehicle_id:'unrelated',amount_cents:999999}]);
 assert.equal(snapshot.portfolio.activeCount,2);assert.equal(snapshot.portfolio.soldCount,1);assert.equal(snapshot.portfolio.activeRecordedCost,13100);assert.equal(snapshot.portfolio.activeMissingPurchase,1);assert.equal(snapshot.portfolio.registeredSales,17000);assert.equal(snapshot.portfolio.realizedRecorded,4000);
 assert.equal(snapshot.recent[0].summary.estimated,7500);assert.equal(snapshot.recent[2].summary.cost,null);assert.equal(snapshot.stages.reduce((sum,s)=>sum+s.count,0),3);
});
test('recent cards cap at four while summary totals use every returned vehicle',()=>{
 const snapshot=dashboardInvestmentSummary(Array.from({length:501},(_,i)=>car('local'+i)),[]);assert.equal(snapshot.recent.length,4);assert.equal(snapshot.count,501);assert.equal(snapshot.portfolio.activeRecordedCost,5010000);
});
function serverHarness(fail=false,vehicles:DashboardVehicle[]=[car('a')]) {
 const calls:unknown[][]=[];
 const all=moduleAt('lib/investments/server.ts',{'@/lib/academy/server':{checked:(r:any)=>{if(r.error)throw r.error;return r;}}}).allRows;
 const db={from(table:string){calls.push(['from',table]);const query={select:(columns:string)=>{calls.push(['select',table,columns]);return query;},order:(...args:unknown[])=>{calls.push(['order',...args]);return query;},is:(...args:unknown[])=>{calls.push(['is',...args]);return query;},range:async(from:number,to:number)=>{calls.push(['range',table,from,to]);return{data:table==='investment_vehicles'?vehicles.slice(from,to+1):[],error:fail?new Error('PRIVATE DB DETAIL'):null};}};return query;}};
 const load=moduleAt('lib/investments/dashboard-server.ts',{'@/lib/academy/server':{database:()=>{calls.push(['database']);return db;}},'./server':{allRows:all},'./dashboard-summary':{dashboardInvestmentSummary}}).investmentDashboardFor;
 return {calls,load};
}
test('only exact verified admin role reaches private queries; reading has no membership/auth mutation',async()=>{
 const h=serverHarness();for(const role of ['student','staff','team','Admin',''])assert.deepEqual(await h.load(role),{state:'hidden'});assert.deepEqual(h.calls,[]);
 const result=await h.load('admin');assert.equal(result.state,'ready');assert.ok(h.calls.some(c=>JSON.stringify(c)===JSON.stringify(['is','voided_at',null])));
 assert.deepEqual(h.calls.filter(c=>c[0]==='select'),[['select','investment_vehicles','id,title,status,purchase_cents,asking_cents,sale_cents,created_at'],['select','investment_expenses','vehicle_id,amount_cents']]);
});
test('database failure stays unavailable, not an empty/zero portfolio; successful empty is distinct',async()=>{
 assert.deepEqual(await serverHarness(true).load('admin'),{state:'unavailable'});const empty=await serverHarness(false,[]).load('admin');assert.equal(empty.state,'ready');assert.equal(empty.snapshot.count,0);
});
test('server pagination reaches beyond first 500 vehicles with stable order',async()=>{
 const h=serverHarness(false,Array.from({length:501},(_,i)=>car('local'+i)));const result=await h.load('admin');assert.equal(result.snapshot.count,501);assert.ok(h.calls.some(c=>JSON.stringify(c)===JSON.stringify(['range','investment_vehicles',500,999])));
});
const Overview=moduleAt('components/investments/PortfolioOverview.tsx',{'@/lib/investments/money':money,'@/lib/investments/portfolio':{portfolioSummary}}).default;
const Dashboard=moduleAt('components/investments/InvestmentDashboard.tsx',{'next/link':({children,...props}:any)=>React.createElement('a',props,children),'@/components/ArrowIcon':()=>React.createElement('span',{'aria-hidden':true},'→'),'@/lib/investments/money':money,'./PortfolioOverview':Overview,'./InvestmentDashboard.module.css':new Proxy({},{get:(_,key)=>String(key)})}).default;
test('real main component hides nonadmin data and clearly distinguishes unavailable/empty/registered figures',()=>{
 assert.equal(renderToStaticMarkup(React.createElement(Dashboard,{data:{state:'hidden'}})),'');
 const error=renderToStaticMarkup(React.createElement(Dashboard,{data:{state:'unavailable'}}));assert.match(error,/No pudimos cargar/);assert.doesNotMatch(error,/\$0|CARROS ACTIVOS/);
 const empty=renderToStaticMarkup(React.createElement(Dashboard,{data:{state:'ready',snapshot:dashboardInvestmentSummary([],[])}}));assert.match(empty,/Aún no has registrado compras/);
 const ready=renderToStaticMarkup(React.createElement(Dashboard,{data:{state:'ready',snapshot:dashboardInvestmentSummary([car('local-car')],[{vehicle_id:'local-car',amount_cents:2500}])}}));assert.match(ready,/\$125.00/);assert.match(ready,/\$25.00/);assert.match(ready,/Ganancia estimada/);assert.match(ready,/no confirman cobros/);assert.match(ready,/href="\/mi-cuenta\/inversiones\/local-car"/);
});
test('main page guards the server snapshot and data render by exact admin role, leaving public catalogue independent',()=>{
 const source=readFileSync(new URL('../app/mi-cuenta/page.tsx',import.meta.url),'utf8');assert.match(source,/who.profile.role === 'admin' \? investmentDashboardFor\(who.profile.role\)/);assert.match(source,/who.profile.role === 'admin' && <InvestmentDashboard/);assert.doesNotMatch(source,/investmentIdentity/);
 const publicSource=readFileSync(new URL('../data/vehicle-catalogue.ts',import.meta.url),'utf8');assert.doesNotMatch(publicSource,/purchase_cents|sale_cents|contribution_cents|investment_expenses|SUPABASE/);
});
