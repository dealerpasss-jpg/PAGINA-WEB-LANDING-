import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import * as publication from '../lib/vehicles/publication.ts';
import { vehicleCatalogue } from '../data/vehicle-catalogue.ts';
const source=readFileSync(new URL('../lib/vehicles/use-live-catalogue.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
test('visible refresh replaces status, failure removes stale asking, hidden tabs and cleanup stop reads',async()=>{
 const initial=publication.unverifiedCatalogue(vehicleCatalogue.slice(0,1));let state={source:initial,values:initial};let effect:(()=>()=>void)|undefined;let interval:(()=>void)|undefined;let calls=0;let response:any={...initial[0],availability:'available',price:750000};let failed=false;
 const window=new EventTarget();const document=Object.assign(new EventTarget(),{visibilityState:'visible'});let clock=10000;
 const globals:Record<string,unknown>={window,document,fetch:async(_url:string,options:{cache:string;signal:AbortSignal})=>{calls++;assert.equal(_url,'/api/catalogue');assert.equal(options.cache,'no-store');if(failed)throw new Error('network');return{ok:true,json:async()=>[response]};},setInterval:(fn:()=>void,ms:number)=>{assert.equal(ms,60000);interval=fn;return 11;},clearInterval:()=>{interval=undefined;}};
 const descriptors=Object.fromEntries(Object.keys(globals).map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));const originalNow=Date.now;
 try {
  for(const [key,value] of Object.entries(globals))Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});Date.now=()=>clock;
  const imports:Record<string,unknown>={react:{useState:()=>[state,(next:any)=>{state=typeof next==='function'?next(state):next;}],useEffect:(fn:()=>()=>void)=>{effect=fn;}},'@/lib/vehicles/publication':publication};
  const module={exports:{} as any};new Function('require','module','exports',code)((key:string)=>{assert.ok(key in imports,key);return imports[key];},module,module.exports);
  module.exports.useLiveCatalogue(initial);const stop=effect!();await new Promise(resolve=>setTimeout(resolve,0));assert.equal(state.values[0].price,750000);assert.equal(calls,1);
  response={...response,availability:'sold',price:null};clock+=2000;window.dispatchEvent(new Event('focus'));await new Promise(resolve=>setTimeout(resolve,0));assert.equal(state.values[0].availability,'sold');
  failed=true;clock+=2000;interval!();await new Promise(resolve=>setTimeout(resolve,0));assert.equal(state.values[0].availability,'unverified');assert.equal(state.values[0].price,null);
  document.visibilityState='hidden';clock+=2000;const before=calls;interval!();window.dispatchEvent(new Event('focus'));await new Promise(resolve=>setTimeout(resolve,0));assert.equal(calls,before);
  stop();assert.equal(interval,undefined);document.visibilityState='visible';window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));assert.equal(calls,before);
 } finally {Date.now=originalNow;for(const key of Object.keys(globals)){const descriptor=descriptors[key];if(descriptor)Object.defineProperty(globalThis,key,descriptor);else Reflect.deleteProperty(globalThis,key);}}
});
