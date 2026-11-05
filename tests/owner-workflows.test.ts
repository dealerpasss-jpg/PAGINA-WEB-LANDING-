import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ts from 'typescript';
import {vehicleCatalogue} from '../data/vehicle-catalogue.ts';
import * as publication from '../lib/vehicles/publication.ts';
const require=createRequire(import.meta.url);
const source=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
function load(path:string,overrides:Record<string,unknown>={}) {
 const code=ts.transpileModule(source(path),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const imports:Record<string,unknown>={'server-only':{},react:React,'react/jsx-runtime':require('react/jsx-runtime'),'next/link':({children,...props}:any)=>React.createElement('a',props,children),'@/data/vehicle-catalogue':{vehicleCatalogue},'@/lib/vehicles/publication':publication,...overrides};
 const module={exports:{} as any};new Function('require','module','exports',code)((key:string)=>{assert.ok(key in imports,key);return imports[key];},module,module.exports);return module.exports.default;
}
const volvo=vehicleCatalogue.find(v=>v.slug==='volvo-s60-inscription-2019')!;
const normal=vehicleCatalogue[0];
const entries=[{slug:volvo.slug,vehicleId:'volvo-private',enabled:true,previewPriceCents:1290000,photoSources:volvo.photos.map(p=>p.src)},{slug:normal.slug,vehicleId:'normal-private',enabled:true,photoSources:normal.photos.map(p=>p.src)},{slug:'jeep-wrangler-2017',inventorySlug:'jeep-wrangler-2017',enabled:true,photoSources:vehicleCatalogue.find(v=>v.slug==='jeep-wrangler-2017')!.photos.map(p=>p.src)}];
const Panel=load('components/investments/PublicationStatus.tsx',{'@/lib/vehicles/publication-registry':{publicationManifest:entries}});
test('admin publication panel projects current state and explicitly distinguishes approved preview price',()=>{
 const html=renderToStaticMarkup(React.createElement(Panel,{id:'volvo-private',catalogueSlug:null,status:'purchased',asking:null}));
 assert.match(html,/Próximamente · No disponible/);assert.match(html,/\$12,900/);assert.match(html,/aprobado por separado/);assert.match(html,/No utiliza tu referencia privada/);assert.doesNotMatch(html,/volvo-private|asking_cents|photoSources/);
 const available=renderToStaticMarkup(React.createElement(Panel,{id:'normal-private',catalogueSlug:null,status:'listed',asking:765432}));assert.match(available,/Disponible/);assert.match(available,/\$7,654.32/);assert.match(available,/cada minuto y al regresar/);
 const unmapped=renderToStaticMarkup(React.createElement(Panel,{id:'not-approved',catalogueSlug:null,status:'listed',asking:123}));assert.match(unmapped,/Solo en tu inventario privado/);assert.doesNotMatch(unmapped,/href=|\$1.23/);
 const page=source('app/mi-cuenta/inversiones/[id]/page.tsx');assert.match(page,/\{admin&&<PublicationStatus/);assert.doesNotMatch(source('components/investments/PublicationStatus.tsx'),/database\(|fetch\(|\.insert\(|\.update\(/);
});
test('vehicle contact context is allowlisted, escaped and returns to inventory without course diversion',async()=>{
 const Page=load('app/contacto/page.tsx',{'@/components/ArrowIcon':()=>null,'@/components/LeadForm':()=>React.createElement('div',null,'GENERIC FORM'),'@/lib/analytics':{getWhatsappUrl:()=>'/contacto'},'@/lib/vehicles/publication-server':{readPublicCatalogue:async()=>[{...normal,availability:'available',title:'Mazda <script>car</script>'}]}});
 const html=renderToStaticMarkup(await Page({searchParams:Promise.resolve({vehiculo:normal.slug})}));assert.match(html,/Mazda &lt;script&gt;car&lt;\/script&gt;/);assert.match(html,/canal comercial todavía está en preparación/);assert.match(html,new RegExp('href="/vehiculos/'+normal.slug+'"'));assert.match(html,/disponibilidad=available/);assert.doesNotMatch(html,/href="\/planes|href="\/academy|GENERIC FORM|<script>/);
 const invalid=renderToStaticMarkup(await Page({searchParams:Promise.resolve({vehiculo:'https://evil.test'})}));assert.match(invalid,/Ficha no disponible/);assert.doesNotMatch(invalid,/evil.test|GENERIC FORM|href="\/planes|href="\/academy/);
});
test('availability reset targets the mounted search input and touch controls remain accessible',()=>{
 const explorer=source('components/VehicleExplorer.tsx');assert.match(explorer,/aria-label="Filtrar por disponibilidad"/);assert.match(explorer,/aria-pressed=\{filters.availability === status\}/);assert.match(explorer,/\['buscar', 'marca', 'orden', 'disponibilidad'\]/);assert.match(explorer,/searchInput.current\?\.focus\(\{preventScroll:true\}\)/);assert.match(explorer,/searchInput.current\?\.scrollIntoView/);assert.match(source('app/vehiculos/vehicles.module.css'),/availabilityFilters button\{min-height:44px/);
});
test('vehicle contact respects every public state and never opens an inquiry for unavailable cars',async()=>{
 for(const availability of ['available','coming-soon','sold','unverified'] as const) {
  let messages:(string|undefined)[]=[];
  const Page=load('app/contacto/page.tsx',{'@/components/ArrowIcon':()=>null,'@/components/LeadForm':()=>React.createElement('div',null,'GENERIC FORM'),'@/lib/analytics':{getWhatsappUrl:(message?:string)=>{messages.push(message);return 'https://wa.me/TEST';}},'@/lib/vehicles/publication-server':{readPublicCatalogue:async()=>[{...normal,availability}]}});
  const html=renderToStaticMarkup(await Page({searchParams:Promise.resolve({vehiculo:normal.slug})}));
  assert.ok(html.includes(publication.availabilityCopy[availability].label));
  assert.equal(html.includes('https://wa.me/TEST'),availability==='available');
  assert.equal(messages.length,availability==='available'?1:0);
  if(availability==='available')assert.ok(messages[0]?.includes('https://dealerpasss.com/vehiculos/'+normal.slug));
  assert.doesNotMatch(html,/GENERIC FORM|href="\/planes|href="\/academy/);
 }
});
test('invalid or duplicate vehicle context is not echoed or converted to an unrelated form',async()=>{
 let reads=0;
 const Page=load('app/contacto/page.tsx',{'@/components/ArrowIcon':()=>null,'@/components/LeadForm':()=>React.createElement('div',null,'GENERIC FORM'),'@/lib/analytics':{getWhatsappUrl:()=>'/contacto'},'@/lib/vehicles/publication-server':{readPublicCatalogue:async()=>{reads++;return [];}}});
 for(const vehiculo of ['', 'x'.repeat(101), ['one','two']]) {
  const html=renderToStaticMarkup(await Page({searchParams:Promise.resolve({vehiculo})}));
  assert.match(html,/Ficha no disponible/);assert.doesNotMatch(html,/GENERIC FORM|href="\/planes|href="\/academy/);
 }
 assert.equal(reads,1);
 const Lead=load('components/LeadForm.tsx',{'@/lib/analytics':{track:()=>{}}});
 const html=renderToStaticMarkup(React.createElement(Lead,{available:false}));
 assert.match(html,/href="\/vehiculos\?disponibilidad=available"/);assert.doesNotMatch(html,/href="\/planes|href="\/academy|<form/);
});

test('admin publication status recognizes a slug-linked record without serializing its private ID',()=>{
 const html=renderToStaticMarkup(React.createElement(Panel,{id:'private-new-record',catalogueSlug:'jeep-wrangler-2017',status:'purchased',asking:null}));
 assert.match(html,/Así aparece en la página/);assert.match(html,/Próximamente/);assert.match(html,/Precio por confirmar/);assert.match(html,/href="\/vehiculos\/jeep-wrangler-2017"/);assert.doesNotMatch(html,/private-new-record|inventorySlug/);
});
