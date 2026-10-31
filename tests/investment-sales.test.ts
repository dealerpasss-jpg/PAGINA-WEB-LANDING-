import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as sales from '../lib/investments/sales.ts';
import * as money from '../lib/investments/money.ts';
import { dashboardInvestmentSummary, type DashboardVehicle } from '../lib/investments/dashboard-summary.ts';
const today='2026-10-31';
test('Tampa business date handles midnight and daylight saving without date-only timezone shifts',()=>{
  assert.equal(sales.businessDate(new Date('2026-10-31T03:30:00Z')),'2026-10-30');
  assert.equal(sales.businessDate(new Date('2026-10-31T04:30:00Z')),'2026-10-31');
  assert.equal(sales.businessDate(new Date('2026-11-02T04:30:00Z')),'2026-11-01');
});
test('weeks are Monday–Sunday and span years correctly; calendar months preserve leap day',()=>{
  const week=sales.salesPeriod('week','2026-01-01',today);assert.equal(week.start,'2025-12-29');assert.equal(week.end,'2026-01-04');assert.equal(week.days.length,7);
  const leap=sales.salesPeriod('month','2024-02-29',today);assert.equal(leap.days.length,29);assert.equal(leap.end,'2024-02-29');
  const sunday=sales.salesPeriod('week','2026-10-25',today);assert.equal(sunday.start,'2026-10-19');
});
test('invalid, malformed and future period input safely returns current period; next stops at current',()=>{
  for(const anchor of ['bad','2026-02-30','2027-01-01','0000-01-01',undefined]) assert.equal(sales.salesPeriod('month',anchor,today).anchor,today);
  assert.equal(sales.salesPeriod('evil',today,today).period,'month');assert.equal(sales.salesPeriod('month',today,today).next,null);
  assert.equal(sales.salesPeriod('month','2026-09-10',today).next,'2026-10-01');
});
test('period totals exclude undated, future and out-of-period sales; missing cost is not zero',()=>{
  const s=sales.periodSales([{sold_on:'2026-10-01',sale_cents:20025,realized:5025},{sold_on:'2026-10-31',sale_cents:10000,realized:-2000},{sold_on:'2026-10-10',sale_cents:15000,realized:null},{sold_on:null,sale_cents:99000,realized:100},{sold_on:'2026-11-01',sale_cents:88000,realized:200},{sold_on:'2026-09-30',sale_cents:77000,realized:300}], 'month',today,today);
  assert.equal(s.count,3);assert.equal(s.revenue,45025);assert.equal(s.profit,3025);assert.equal(s.missingCost,1);assert.equal(s.undated,1);assert.equal(s.future,1);
  assert.equal(s.days.reduce((sum,day)=>sum+day.revenue,0),s.revenue);assert.equal(s.days.find(day=>day.date==='2026-10-31')?.profit,-2000);
});
test('explicit zero sales and costs count as known, missing sale stays incomplete; future buckets stay marked',()=>{
  const s=sales.periodSales([{sold_on:'2026-10-30',sale_cents:0,realized:0},{sold_on:'2026-10-30',sale_cents:null,realized:null}],'week','2026-10-30','2026-10-30');
  assert.equal(s.count,2);assert.equal(s.missingSale,1);assert.equal(s.missingCost,1);assert.equal(s.days.filter(day=>day.future).length,2);
});
test('only actual sold status enters sales history; every active expense of sold car affects original closing period',()=>{
  const base:DashboardVehicle={id:'sold',title:'Synthetic',status:'sold',purchase_cents:10000,asking_cents:90000,sale_cents:20000,sold_on:'2026-09-30',created_at:'2026-10-30'};
  const snapshot=dashboardInvestmentSummary([base,{...base,id:'active',status:'listed',sale_cents:null,sold_on:null}],[{vehicle_id:'sold',amount_cents:3000},{vehicle_id:'sold',amount_cents:1000},{vehicle_id:'active',amount_cents:9000}]);
  assert.equal(snapshot.sales.length,1);assert.equal(sales.periodSales(snapshot.sales,'month','2026-09-01',today).profit,6000);assert.equal(sales.periodSales(snapshot.sales,'month',today,today).count,0);
});
test('closing validation preserves legacy missing date but never manufactures one for a new close',()=>{
  assert.throws(()=>sales.closingDate('','sold',null,null,today),/fecha real/);
  assert.equal(sales.closingDate('','sold',{status:'sold',sold_on:null},null,today),null);
  assert.equal(sales.closingDate('2026-10-31','sold',null,'2026-10-31',today),'2026-10-31');
  assert.throws(()=>sales.closingDate('2026-11-01','sold',null,null,today),/futuro/);
  assert.throws(()=>sales.closingDate('2026-10-30','sold',null,'2026-10-31',today),/anterior/);
});
const require=createRequire(import.meta.url);
const source=readFileSync(new URL('../components/investments/SalesPerformance.tsx',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
const imports:Record<string,unknown>={'react/jsx-runtime':require('react/jsx-runtime'),'next/link':({children,...props}:any)=>React.createElement('a',props,children),'@/lib/investments/sales':sales,'@/lib/investments/money':money,'./SalesPerformance.module.css':new Proxy({},{get:(_,key)=>String(key)})};
const module={exports:{} as any};new Function('require','module','exports',code)((id:string)=>{assert.ok(id in imports);return imports[id];},module,module.exports);
const render=(rows:sales.RecordedSale[])=>renderToStaticMarkup(React.createElement(module.exports.default,{sales:rows,today,period:'month'}));
test('actual sales UI empty state draws no invented graph and labels receipts limitation',()=>{
  const html=render([]);assert.match(html,/Sin ventas registradas en este período/);assert.doesNotMatch(html,/<polyline|<svg/);assert.match(html,/no cobros/);assert.match(html,/No confirma cobros/);assert.match(html,/aria-current="page">Mes/);assert.match(html,/name="fecha"/);
});
test('actual sales UI preserves losses and date warnings with exact accessible day table',()=>{
  const html=render([{sold_on:'2026-10-30',sale_cents:10000,realized:-5000},{sold_on:null,sale_cents:99000,realized:999}]);
  assert.match(html,/-\$50.00/);assert.match(html,/data-negative="true"/);assert.match(html,/1 ventas sin fecha válida/);assert.match(html,/Ver cifras por día/);assert.match(html,/scope="col"/);assert.doesNotMatch(html,/NaN|Infinity|\$990.00/);
});
test('incomplete costs do not become a zero result or plotted zero profit point',()=>{
  const html=render([{sold_on:'2026-10-30',sale_cents:10000,realized:null}]);assert.match(html,/Resultado parcial/);assert.match(html,/Pendiente/);assert.match(html,/puntos incompletos no se dibujan como cero/);assert.doesNotMatch(html,/class="profitPoint"/);
});

test('early calendar years stay bounded to one month and lower navigation never produces year zero',()=>{
 for(const year of ['0001','0099']) {const p=sales.salesPeriod('month',year+'-01-01',today);assert.equal(p.days.length,31);assert.equal(p.end,year+'-01-31');}
 const first=sales.salesPeriod('month','0001-01-01',today);assert.equal(first.previous,null);assert.equal(first.next,'0001-02-01');
 assert.equal(sales.salesPeriod('week','0001-01-01',today).days.length,7);
});
