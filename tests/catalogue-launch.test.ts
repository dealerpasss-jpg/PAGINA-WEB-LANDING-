import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { vehicleCatalogue } from '../data/vehicle-catalogue.ts';
import * as catalogue from '../lib/vehicles/catalogue.ts';
import * as publication from '../lib/vehicles/publication.ts';
const require=createRequire(import.meta.url);
const css=new Proxy({},{get:(_,key)=>String(key)});
const Link=({children,prefetch,...props}:any)=>React.createElement('a',props,children);
const Image=({priority,fill,sizes,...props}:any)=>React.createElement('img',props);
const Arrow=()=>React.createElement('svg',{'aria-hidden':true,className:'dp-arrow'});
function load(file:string,extra:Record<string,unknown>={}) {
 const imports:Record<string,unknown>={'react/jsx-runtime':require('react/jsx-runtime'),'next/image':Image,'next/link':Link,'@/components/ArrowIcon':Arrow,'./ArrowIcon':Arrow,'@/lib/vehicles/catalogue':catalogue,'@/lib/vehicles/publication':publication,'@/app/vehiculos/vehicles.module.css':css,'./CatalogueAvailability':({status}:any)=>React.createElement('span',null,publication.availabilityCopy[status as publication.Availability].label),...extra};
 const code=ts.transpileModule(readFileSync(new URL('../'+file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const module={exports:{} as any};new Function('require','module','exports',code)((key:string)=>{assert.ok(key in imports,key);return imports[key];},module,module.exports);return module.exports;
}
const cards=load('components/VehicleCards.tsx');
const elantra=vehicleCatalogue.find(v=>v.slug==='hyundai-elantra-eco-2018')!;
const render=(availability:publication.Availability)=>renderToStaticMarkup(React.createElement(cards.VehicleCard,{vehicle:{...elantra,availability,price:availability==='sold'||availability==='unverified'?null:750000},search:'marca=Hyundai'}));
test('coming-soon gets its own launch header and honest exploration CTA without a transaction',()=>{
 const html=render('coming-soon');assert.match(html,/ADELANTO DEALERPASS/);assert.match(html,/Próximamente\./);assert.match(html,/No disponible para compra todavía/);assert.match(html,/Ver adelanto/);assert.match(html,/aria-label="Ver adelanto: Hyundai Elantra ECO 2018"/);assert.match(html,/\$7,500/);assert.match(html,/href="\/vehiculos\/hyundai-elantra-eco-2018\?marca=Hyundai"/);
 assert.match(html,/<svg[^>]*aria-hidden="true"[^>]*focusable="false"/);assert.doesNotMatch(html,/<form|type="submit"|reservar|pre-?order|cuenta regresiva|últimas unidades|garantiz/i);
 assert.match(html,/visualizacion-pintura\.webp/);assert.match(html,/Visualización de pintura · imagen editada/);assert.match(html,/Foto provisional: visualización de pintura/);
});
test('available, sold and uncertain cards never borrow the launch treatment',()=>{
 for(const state of ['available','sold','unverified'] as const){const html=render(state);assert.doesNotMatch(html,/ADELANTO DEALERPASS|launchHeader|launchAction|No disponible para compra todavía/);assert.match(html,new RegExp(publication.availabilityCopy[state].label));if(state!=='available')assert.doesNotMatch(html,/\$7,500/);}
});
test('home reuses the exact same coming-soon card and keeps the other editorial cards',()=>{
 const Home=load('components/HomeInventory.tsx',{'./VehicleCards':cards,'./Reveal':({children,className}:any)=>React.createElement('div',{className},children),'@/lib/vehicles/use-live-catalogue':{useLiveCatalogue:(initial:unknown)=>initial}}).default;
 const html=renderToStaticMarkup(React.createElement(Home,{initial:[{...vehicleCatalogue[0],availability:'available'},{...elantra,availability:'coming-soon'}]}));
 assert.equal((html.match(/ADELANTO DEALERPASS/g)||[]).length,1);assert.equal((html.match(/class="he-vehicle"/g)||[]).length,1);assert.match(html,/data-availability="coming-soon"/);assert.match(html,/Ver adelanto/);assert.match(html,/Foto provisional/);
});
test('launch styling preserves photo provenance, narrow layouts and reduced-effects fallbacks',()=>{
 const styles=readFileSync(new URL('../app/vehiculos/vehicles.module.css',import.meta.url),'utf8');
 const patch=styles.slice(styles.indexOf('/* A launch-style preview'));
 assert.match(patch,/\.card\[data-availability=coming-soon\] \.cover img \{ object-fit:contain; transform:none;/);
 assert.match(patch,/\.photoBadge \{ top:10px; right:10px; bottom:auto; left:auto;/);assert.match(patch,/max-width:380px/);assert.match(patch,/prefers-reduced-motion:reduce/);assert.match(patch,/prefers-reduced-transparency:reduce/);assert.match(patch,/forced-colors:active/);assert.equal((patch.match(/\.launchAction\[data-dp-button=primary\] svg:global\(\.dp-arrow\)/g)||[]).length,2);
 assert.doesNotMatch(patch,/animation:|filter:|opacity:|\.cover::(?:before|after)/);
});
