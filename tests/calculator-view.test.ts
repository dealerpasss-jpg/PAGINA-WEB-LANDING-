import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { focusCalculatorHeading } from '../lib/academy/calculator-focus.ts';
const require=createRequire(import.meta.url);
const root=fileURLToPath(new URL('../',import.meta.url));
const cache=new Map<string,{exports:Record<string,unknown>}>();
function componentModule(filename:string):Record<string,unknown> {
  const cached=cache.get(filename); if(cached) return cached.exports;
  const module={exports:{} as Record<string,unknown>};cache.set(filename,module);
  const code=ts.transpileModule(readFileSync(filename,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  function localRequire(id:string):unknown {
    if(['react','react/jsx-runtime'].includes(id)) return require(id);
    if(id.endsWith('.module.css')) return {__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};
    assert.ok(id.startsWith('.')||id.startsWith('@/'),'Local calculator imports only');
    const path=id.startsWith('@/')?resolve(root,id.slice(2)):resolve(dirname(filename),id);
    const actual=[path,path+'.tsx',path+'.ts'].find(existsSync);assert.ok(actual);return componentModule(actual);
  }
  new Function('require','module','exports',code)(localRequire,module,module.exports);return module.exports;
}
const Calculator=componentModule(resolve(root,'components/PurchaseCalculator.tsx')).default as React.ComponentType;
test('real calculator initially presents one question, mobile numeric input and no invented result',()=>{
  const html=renderToStaticMarkup(React.createElement(Calculator));
  assert.match(html,/PREGUNTA 1 DE 3/);
  assert.match(html,/<span class="deviceName">DealerPass Calc<\/span>/);
  assert.doesNotMatch(html,/<b>DP<\/b>|\/ MARGEN/);
  assert.match(html,/¿En cuánto lo venderías\?/);
  assert.match(html,/inputMode="decimal"/);
  assert.match(html,/aria-label="Teclado numérico"/);
  assert.match(html,/aria-label="Borrar último dígito"/);
  assert.match(html,/aria-label="Borrar monto actual"/);
  assert.match(html,/>Siguiente</);
  assert.match(html,/No se guardan al salir o recargar/);
  assert.doesNotMatch(html,/Resultado de la calculadora|Tu límite de puja|<aside/);
  assert.doesNotMatch(html,/\$6,200|\$0\.00/);
  assert.equal((html.match(/<form/g)||[]).length,1);
  assert.equal((html.match(/type="submit"/g)||[]).length,1);
});
test('calculator retains explicit total confirmation, unknown exit and native optional offer details',()=>{
  const source=readFileSync(resolve(root,'components/PurchaseCalculator.tsx'),'utf8');
  assert.match(source,/event.preventDefault\(\)/);
  assert.match(source,/if \(!currentValid/);
  assert.match(source,/no incluyas el precio del carro/);
  assert.match(source,/Todavía no lo sé/);
  assert.match(source,/checked=\{draft.costsReviewed\}/);
  assert.match(source,/Confirma las comisiones para la puja calculada/);
  assert.match(source,/const result = step === 3 \? guide.result : null/);
  assert.match(source,/step !== 3 \? <form/);
  assert.match(source,/step === 4 \? draft.bid/);
  assert.match(source,/calculatorKeypadEdit\(raw, key, selection.current\)/);
  assert.doesNotMatch(source,/localStorage|sessionStorage|fetch\(/);
});
test('explicit calculator navigation focuses without native scrolling then reveals the heading instantly',()=>{
  const calls:unknown[]=[];
  focusCalculatorHeading({focus:options=>{calls.push(['focus',options]);},scrollIntoView:options=>{calls.push(['scroll',options]);}});
  assert.deepEqual(calls,[['focus',{preventScroll:true}],['scroll',{block:'start',behavior:'instant'}]]);
  focusCalculatorHeading(null);
  assert.equal(calls.length,2);
  const source=readFileSync(resolve(root,'components/PurchaseCalculator.tsx'),'utf8');
  const css=readFileSync(resolve(root,'components/PurchaseCalculator.module.css'),'utf8');
  assert.match(source,/if \(mounted.current\) focusCalculatorHeading\(heading.current\); else mounted.current = true/);
  assert.match(source,/\[step, detail, focusRevision\]/);
  assert.match(source,/move\(index,true\)/);
  assert.match(css,/\.question,\.resultTitle\{scroll-margin-top:110px/);
});
