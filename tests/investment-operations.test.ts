import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as pending from '../lib/investments/pending.ts';
import * as view from '../lib/investments/view.ts';
import * as history from '../lib/investments/history.ts';
import * as money from '../lib/investments/money.ts';
import { investmentSectionId,revealInvestmentSection } from '../lib/investments/sections.ts';
import { dashboardInvestmentSummary } from '../lib/investments/dashboard-summary.ts';
const car={id:'car',title:'Carro de prueba',status:'listed' as const,purchase_cents:0,asking_cents:0,sale_cents:null,sold_on:null,created_at:'2026-10-31'};

test('pending queue uses known missing fields, explicit zeros are complete, sold reference is not required',()=>{
 assert.deepEqual(pending.missingInvestmentFields(car),[]);
 assert.deepEqual(pending.missingInvestmentFields({...car,purchase_cents:null,asking_cents:null}),['purchase','reference']);
 assert.deepEqual(pending.missingInvestmentFields({...car,status:'sold',asking_cents:null,sale_cents:0,sold_on:'2026-10-30'}),[]);
 assert.deepEqual(pending.missingInvestmentFields({...car,status:'sold',purchase_cents:null}),['purchase','sale','date']);
 const s=dashboardInvestmentSummary([car,{...car,id:'missing',purchase_cents:null}],[]);
 assert.deepEqual(s.pending,[{id:'missing',title:car.title,fields:['purchase']}]);assert.equal(s.estimated.knownCount,1);
});
test('inventory URL state whitelists fields, bounds search, encodes delimiters and ignores redirect destinations',()=>{
 const q=new URLSearchParams('buscar=Ford+%26+blanco&estado=listed&pendientes=all&orden=result-desc&next=https://evil.test&message=secret');
 assert.deepEqual(view.readInvestmentFilters(q),{query:'Ford & blanco',status:'listed',pending:'all',sort:'result-desc'});
 const round=new URLSearchParams(view.investmentQuery(q));assert.equal(round.get('buscar'),'Ford & blanco');assert.deepEqual([...round.keys()],['buscar','estado','pendientes','orden']);
 assert.deepEqual(view.readInvestmentFilters(new URLSearchParams('estado=constructor&pendientes=__proto__&orden=bogus')),{query:'',status:'',pending:'',sort:'recent'});
 assert.equal(view.readInvestmentFilters(new URLSearchParams({buscar:'x'.repeat(1000)})).query.length,100);
 assert.equal(view.updateInvestmentParams(new URLSearchParams(),'buscar','recent').get('buscar'),'recent');
});
const rows=[
 {id:'missing',title:'Ford unknown',status:'listed',financial:{cost:null,result:null,purchasedOn:null,missing:['purchase' as const]}},
 {id:'loss',title:'Ford loss',status:'listed',financial:{cost:500,result:-100,purchasedOn:'2026-10-29',missing:[]}},
 {id:'zero',title:'Cero',status:'purchased',financial:{cost:0,result:0,purchasedOn:'2026-10-27',missing:[]}},
 {id:'gain',title:'Ford gain',status:'sold',financial:{cost:200,result:100,purchasedOn:'2026-10-30',missing:['date' as const]}},
];
test('investment ordering preserves negative and zero amounts, missing values last and original order immutable',()=>{
 const copy=structuredClone(rows);const f=view.readInvestmentFilters(new URLSearchParams());
 assert.deepEqual(view.selectInvestmentView(rows,{...f,sort:'result-desc'}).map(x=>x.id),['gain','zero','loss','missing']);
 assert.deepEqual(view.selectInvestmentView(rows,{...f,sort:'cost-desc'}).map(x=>x.id),['loss','gain','zero','missing']);
 assert.deepEqual(view.selectInvestmentView(rows,{...f,sort:'purchase-oldest'}).map(x=>x.id),['zero','loss','gain','missing']);
 assert.deepEqual(view.selectInvestmentView(rows,{...f,query:'ford',status:'listed',pending:'purchase'}).map(x=>x.id),['missing']);
 assert.deepEqual(view.selectInvestmentView(rows,{...f,pending:'all'}).map(x=>x.id),['missing','gain']);assert.deepEqual(rows,copy);
});
test('new history store supports synchronous typing, preserved filters and Back/Forward, then cleans listeners',()=>{
 const browser=new EventTarget();let url=new URL('https://dealerpasss.com/mi-cuenta/inversiones?estado=listed#inventario');
 Object.defineProperty(browser,'location',{get:()=>url});Object.defineProperty(browser,'history',{value:{replaceState:(_a:unknown,_b:unknown,next:string)=>{url=new URL(next,url);}}});
 const previous=Object.getOwnPropertyDescriptor(globalThis,'window');Object.defineProperty(globalThis,'window',{value:browser,configurable:true});let rendered='';let count=0;
 const unsubscribe=history.subscribeInvestmentHistory(()=>{rendered=view.readInvestmentFilters(new URLSearchParams(history.investmentHistorySnapshot())).query;count++;});
 try {
  for(const c of 'Ford 2016') {const next=rendered+c;history.replaceInvestmentHistory(view.updateInvestmentParams(new URLSearchParams(history.investmentHistorySnapshot()),'buscar',next));assert.equal(rendered,next);}
  assert.equal(url.searchParams.get('estado'),'listed');assert.equal(url.hash,'#inventario');
  url=new URL('/mi-cuenta/inversiones?buscar=Mazda&orden=cost-desc',url);browser.dispatchEvent(new Event('popstate'));assert.equal(rendered,'Mazda');
  unsubscribe();const before=count;browser.dispatchEvent(new Event('popstate'));assert.equal(count,before);
 } finally {unsubscribe();if(previous)Object.defineProperty(globalThis,'window',previous);else Reflect.deleteProperty(globalThis,'window');}
});
test('section navigation only opens known targets and ancestors, focuses without scroll then clears sticky header',()=>{
 const calls:unknown[]=[];const outer={tagName:'DETAILS',open:false,parentElement:null};const inner={tagName:'DETAILS',open:false,parentElement:outer};const target={tagName:'INPUT',value:'123.45',parentElement:inner,focus:(options:unknown)=>calls.push(['focus',options]),scrollIntoView:(options:unknown)=>calls.push(['scroll',options])};
 const root={getElementById:(id:string)=>id==='compra-precio'?target:null} as unknown as Pick<Document,'getElementById'>;
 assert.equal(revealInvestmentSection('#compra-precio',root),true);assert.equal(inner.open,true);assert.equal(outer.open,true);assert.equal(target.value,'123.45');
 assert.deepEqual(calls,[['focus',{preventScroll:true}],['scroll',{behavior:'instant',block:'start'}]]);
 assert.equal(investmentSectionId('#%E0%A4%A'),null);assert.equal(revealInvestmentSection('#unknown',root),false);assert.equal(revealInvestmentSection('#venta-fecha',root),false);
});
const require=createRequire(import.meta.url);
function component(path:string,params='',overrides:Record<string,unknown>={}) {
 const imports:Record<string,unknown>={react:React,'react/jsx-runtime':require('react/jsx-runtime'),'next/navigation':{useSearchParams:()=>new URLSearchParams(params)},'next/link':({children,prefetch,...props}:any)=>React.createElement('a',props,children),'next/image':({unoptimized,...props}:any)=>React.createElement('img',props),'@/lib/investments/money':money,'@/lib/investments/pending':pending,'@/lib/investments/view':view,'@/lib/investments/history':history,'./VehicleStatus':({status}:any)=>React.createElement('span',null,money.statuses[status as keyof typeof money.statuses]),'@/components/ArrowIcon':()=>React.createElement('span',{'aria-hidden':true},'→'),...overrides};
 const code=ts.transpileModule(readFileSync(new URL('../'+path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const module={exports:{} as any};new Function('require','module','exports',code)((id:string)=>{assert.ok(id in imports,'Unexpected import '+id);return imports[id];},module,module.exports);return module.exports.default;
}
test('actual inventory renders semantic desktop table and mobile cards with filtered safe return context',()=>{
 const C=component('components/investments/InventoryCollection.tsx','buscar=Ford&estado=listed&orden=result-desc&message=not-carried');
 const items=rows.map(row=>({...row,photo:null,financial:{...row.financial,purchase:row.financial.cost,expenses:0,reference:1000}}));
 const html=renderToStaticMarkup(React.createElement(C,{items,admin:true}));
 assert.match(html,/<table/);assert.match(html,/scope="col"/);assert.match(html,/inventory-cards-admin/);assert.match(html,/2 de 4 vehículos/);assert.match(html,/-\$1.00/);assert.match(html,/data-negative="true"/);assert.match(html,/buscar=Ford&amp;estado=listed&amp;orden=result-desc/);assert.doesNotMatch(html,/not-carried/);assert.match(html,/No confirma cobros/);
});
test('nonadmin display never renders financial columns or missing-data tools, even with a crafted URL',()=>{
 const C=component('components/investments/InventoryCollection.tsx','pendientes=all&orden=cost-desc');
 const html=renderToStaticMarkup(React.createElement(C,{items:[{id:'safe',title:'Carro asignado',status:'listed',photo:null}],admin:false}));
 assert.match(html,/Carro asignado/);assert.doesNotMatch(html,/<table|Datos por completar|Mayor inversión|Ganancia|\$|financial/);
 const source=readFileSync(new URL('../app/mi-cuenta/inversiones/page.tsx',import.meta.url),'utf8');assert.match(source,/\.\.\.\(admin&&v.summary\?\{financial:/);
 assert.match(source,/admin\?'\*':'id,title,status,asking_cents,catalogue_slug,created_at'/);
});
test('return link retains only inventory context, never accepts arbitrary next or vehicle data',()=>{
 const C=component('components/investments/InventoryReturnLink.tsx','buscar=Ford&estado=listed&pendientes=purchase&next=https://evil.test');
 const html=renderToStaticMarkup(React.createElement(C));assert.match(html,/Volver a mis resultados/);assert.match(html,/href="\/mi-cuenta\/inversiones\?buscar=Ford&amp;estado=listed&amp;pendientes=purchase#inventario"/);assert.doesNotMatch(html,/evil/);
});
test('detail quick actions preserve real form contracts and place expense entry before expense history',()=>{
 const page=readFileSync(new URL('../app/mi-cuenta/inversiones/[id]/page.tsx',import.meta.url),'utf8');
 assert.ok(page.indexOf('id="nuevo-gasto"')<page.indexOf('expenses.map(e=>')); assert.match(page,/Precio de referencia:/);assert.doesNotMatch(page,/Precio publicado:/);
 for(const id of ['resumen-vehiculo','editar-compra','fotos-vehiculo','gastos-vehiculo','nuevo-gasto','participantes-vehiculo'])assert.match(page,new RegExp('id="'+id+'"'));
 const actions=readFileSync(new URL('../components/investments/VehicleActions.tsx',import.meta.url),'utf8');assert.match(actions,/admin&&/);assert.doesNotMatch(actions,/saveInvestment|fetch\(|\.submit\(|requestSubmit|\.value\s*=/);
 const css=readFileSync(new URL('../app/mi-cuenta/inversiones/investments.css',import.meta.url),'utf8');assert.match(css,/@media\(min-width:1100px\)/);assert.match(css,/scroll-margin-top:110px/);assert.match(css,/forced-colors/);assert.match(css,/\.inventory-table :is\(td,th,small\),\.inventory-table td\[data-negative=true\],\.inventory-missing \{ color:CanvasText; \}/);
});

test('empty filtered inventory stays actionable and reset returns keyboard focus to search',()=>{
 const noResults=component('components/investments/InventoryCollection.tsx','buscar=does-not-exist&estado=listed');
 const html=renderToStaticMarkup(React.createElement(noResults,{items:rows.map(r=>({...r,photo:null})),admin:true}));assert.match(html,/No hay vehículos con estos filtros/);assert.match(html,/Ver todo el inventario/);assert.doesNotMatch(html,/<table/);
 const browser=new EventTarget();let url=new URL('https://dealerpasss.com/mi-cuenta/inversiones?buscar=missing&estado=listed&pendientes=all&orden=cost-desc&message=known#inventario');
 Object.defineProperty(browser,'location',{get:()=>url});Object.defineProperty(browser,'history',{value:{replaceState:(_a:unknown,_b:unknown,next:string)=>{url=new URL(next,url);}}});
 const previous=Object.getOwnPropertyDescriptor(globalThis,'window');Object.defineProperty(globalThis,'window',{value:browser,configurable:true});let focused=0;
 try {
  const C=component('components/investments/InventoryCollection.tsx',url.search,{react:{...React,useId:()=> 'reset-test',useRef:()=>({current:{focus:()=>{focused++;}}}),useSyncExternalStore:(_sub:unknown,_snap:unknown,ssr:()=>string)=>ssr()}});
  const tree=C({items:rows.map(r=>({...r,photo:null})),admin:true});
  const find=(node:any):any=>!node||typeof node!=='object'?null:node.type==='button'&&node.props.children==='Ver todo el inventario'?node:React.Children.toArray(node.props?.children).map(find).find(Boolean);
  const reset=find(tree);assert.ok(reset);reset.props.onClick();assert.equal(focused,1);assert.equal(url.search,'?message=known');assert.equal(url.hash,'#inventario');
 } finally {if(previous)Object.defineProperty(globalThis,'window',previous);else Reflect.deleteProperty(globalThis,'window');}
});
