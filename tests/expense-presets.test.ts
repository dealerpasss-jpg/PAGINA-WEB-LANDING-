import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as presets from '../lib/investments/expense-presets.ts';
import * as money from '../lib/investments/money.ts';

test('UI shortcuts preserve the five historical stored category meanings',()=>{
 assert.deepEqual(money.categories,{auction:'Cargos de subasta',repair:'Reparación',transport:'Transporte',title:'Título y documentación',other:'Otro gasto'});
 const expected={mechanical:'repair',wash:'other',parts:'repair',paint:'repair',transport:'transport',auction:'auction',dealer:'other',documents:'title',other:'other'};
 for(const [key,category] of Object.entries(expected)) {
  const result=presets.expenseConcept(key,'untrusted',key==='other'?'Custom':'');
  if(key!=='other') assert.equal(result.category,category);
 }
});
test('preset descriptions keep the selected concept, require Otro and reject prototype/unknown keys',()=>{
 assert.deepEqual(presets.expenseConcept('paint','auction',''),{category:'repair',description:'Pintura'});
 assert.deepEqual(presets.expenseConcept('wash','','  Interior  '),{category:'other',description:'Lavado · Interior'});
 assert.deepEqual(presets.expenseConcept('other','','  Parqueadero  '),{category:'other',description:'Parqueadero'});
 for(const preset of ['bogus','constructor','__proto__','toString']) assert.throws(()=>presets.expenseConcept(preset,'repair','detail'),/tipo de gasto/);
 assert.throws(()=>presets.expenseConcept('other','other','  '),/concepto/);
 assert.throws(()=>presets.expenseConcept('','constructor','x'),/Categoría/);
 assert.throws(()=>presets.expenseConcept('','repair',''),/concepto/);
});
test('description maximum is enforced with prefix included, never silently truncated',()=>{
 for(const key of Object.keys(presets.expensePresets) as presets.ExpensePreset[]) {
  const max=presets.expenseDetailLimit(key);
  assert.equal(presets.expenseConcept(key,'','x'.repeat(max)).description.length,500);
  assert.throws(()=>presets.expenseConcept(key,'','x'.repeat(max+1)),/Acorta/);
 }
 assert.throws(()=>presets.expenseConcept('','repair','x'.repeat(501)),/500/);
});

const require=createRequire(import.meta.url);
function load(path:string,overrides:Record<string,unknown>={}) {
 const code=ts.transpileModule(readFileSync(new URL('../'+path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const imports:Record<string,unknown>={'react':React,'react/jsx-runtime':require('react/jsx-runtime'),'@/lib/investments/money':money,'@/lib/investments/expense-presets':presets,...overrides};
 const module={exports:{} as {default:React.ComponentType<any>}};
 new Function('require','module','exports',code)((id:string)=>{assert.ok(id in imports,'Unexpected import '+id);return imports[id];},module,module.exports);
 return module.exports.default;
}
const Icon=load('components/investments/ExpenseIcon.tsx');
const substitutes={
 './InvestmentForm':({children,...props}:any)=>React.createElement('form',props,children),
 './Submit':({children}:any)=>React.createElement('button',{type:'submit'},children),
 './ExpenseIcon':Icon,
};
test('actual expense form exposes native required radio group, labels, cents/date fields and decorative SVGs',()=>{
 const Form=load('components/investments/ExpenseForm.tsx',substitutes);
 const html=renderToStaticMarkup(React.createElement(Form,{vehicleId:'synthetic-local-only'}));
 assert.equal((html.match(/type="radio"/g)||[]).length,9);
 assert.equal((html.match(/name="expense_preset"/g)||[]).length,9);
 assert.equal((html.match(/<svg[^>]*aria-hidden="true"/g)||[]).length,9);
 assert.equal((html.match(/type="submit"/g)||[]).length,1);
 assert.match(html,/01 \/ ¿En qué gastaste/);assert.match(html,/name="amount_cents"/);assert.match(html,/inputMode="decimal"/);assert.match(html,/name="incurred_on"/);assert.match(html,/Usar hoy/);
 assert.doesNotMatch(html,/name="category"|name="description"| checked=""/);
});
test('selection changes retain individual concept drafts and native amount/date inputs',()=>{
 const state:unknown[]=['',{},'2026-10-29'];let index=0;
 const Form=load('components/investments/ExpenseForm.tsx',{...substitutes,react:{...React,useId:()=>':fixture:',useState:()=>{const slot=index++;return[state[slot],(value:any)=>{state[slot]=typeof value==='function'?value(state[slot]):value;}];}}}) as (props:any)=>React.ReactElement<any>;
 const render=()=>{index=0;return Form({vehicleId:'synthetic-local-only'});};
 function nodes(node:any):any[] {if(!node||typeof node!=='object')return[];if(Array.isArray(node))return node.flatMap(nodes);return[node,...nodes(node.props?.children)];}
 const find=(tree:any,match:(n:any)=>boolean)=>{const result=nodes(tree).find(match);assert.ok(result);return result;};
 let tree=render();find(tree,n=>n.props?.value==='other').props.onChange();tree=render();
 let input=find(tree,n=>n.props?.name==='description');assert.equal(input.props.required,true);input.props.onChange({target:{value:'Parking'}});
 tree=render();find(tree,n=>n.props?.value==='paint').props.onChange();tree=render();input=find(tree,n=>n.props?.name==='description');assert.equal(input.props.required,false);assert.equal(input.props.value,'');input.props.onChange({target:{value:'Puerta'}});
 tree=render();find(tree,n=>n.props?.value==='other').props.onChange();tree=render();assert.equal(find(tree,n=>n.props?.name==='description').props.value,'Parking');
 assert.equal(find(tree,n=>n.props?.name==='incurred_on').props.value,'2026-10-29');assert.equal(find(tree,n=>n.props?.name==='amount_cents').props.value,undefined);
});
test('expense styling keeps keyboard focus, touch geometry, responsive and reduced effects',()=>{
 const css=readFileSync(new URL('../app/mi-cuenta/inversiones/investments.css',import.meta.url),'utf8');
 assert.match(css,/input:focus-visible\+\.expense-option-surface/);assert.match(css,/min-height:76px/);assert.match(css,/expense-entry-grid \{ grid-template-columns:1fr/);assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/forced-colors:active/);
});
