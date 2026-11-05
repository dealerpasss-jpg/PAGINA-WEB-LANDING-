import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { vehicleCatalogue } from '../data/vehicle-catalogue.ts';
import * as publication from '../lib/vehicles/publication.ts';
const approved=vehicleCatalogue[0];
const manifest=[{slug:approved.slug,vehicleId:'private-id',enabled:true,photoSources:approved.photos.map(p=>p.src)}];
const source=readFileSync(new URL('../lib/vehicles/publication-server.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function harness(result:{data:unknown;error:unknown}, selectedManifest:publication.Publication[]=manifest){
 const calls:unknown[][]=[];
 const query={select:(v:string)=>{calls.push(['select',v]);return query;},in:(key:string,values:string[])=>{calls.push(['in',key,values]);return query;},limit:(v:number)=>{calls.push(['limit',v]);return query;},abortSignal:async(signal:AbortSignal)=>{assert.ok(signal instanceof AbortSignal);return result;}};
 const imports:Record<string,unknown>={'server-only':{},react:{cache:(f:unknown)=>f},'next/server':{connection:async()=>calls.push(['connection'])},'@/lib/academy/server':{database:()=>({from:(name:string)=>{calls.push(['from',name]);return query;}})},'@/data/vehicle-catalogue':{vehicleCatalogue},'./publication-registry':{publicationManifest:selectedManifest},'./publication':publication};
 const module={exports:{} as any};new Function('require','module','exports',code)((key:string)=>{assert.ok(key in imports,key);return imports[key];},module,module.exports);
 return {calls,...module.exports};
}
test('public request reads only the allowlisted IDs and columns and metadata follows live asking',async()=>{
 const h=harness({error:null,data:[{id:'private-id',catalogue_slug:null,status:'listed',asking_cents:812345,purchase_cents:1,notes:'secret'}]});
 const result=await h.readPublicCatalogue();assert.equal(result[0].price,812345);assert.deepEqual(h.calls.slice(0,4),[['connection'],['from','investment_vehicles'],['select','id,catalogue_slug,status,asking_cents'],['in','id',['private-id']]]);
 const metadata=await h.publicVehicleMetadata(approved.slug,'Approved description');assert.match(metadata.title,/\$8,123.45/);assert.match(metadata.description,/Disponible/);assert.doesNotMatch(JSON.stringify(result),/secret|private-id|purchase_cents/);
});
test('server error/missing source returns unverified metadata and never old advertised price',async()=>{
 for(const input of [{data:null,error:{message:'private backend reason'}},{data:[],error:null}]){
  const h=harness(input);const result=await h.readPublicCatalogue();assert.equal(result[0].availability,'unverified');assert.equal(result[0].price,null);
  const metadata=await h.publicVehicleMetadata(approved.slug,'Approved description');assert.match(metadata.title,/Precio por confirmar/);assert.doesNotMatch(JSON.stringify(metadata),/private backend|8,500/);
 }
});
test('sold metadata suppresses both asking and closing amounts and hidden slugs do not index',async()=>{
 const h=harness({data:[{id:'private-id',catalogue_slug:null,status:'sold',asking_cents:850000,sale_cents:123456}],error:null});
 const metadata=await h.publicVehicleMetadata(approved.slug,'Approved description');assert.match(metadata.title,/Vendido/);assert.doesNotMatch(metadata.title,/\$/);
 assert.equal((await h.publicVehicleMetadata('not-published','')).robots.index,false);
});
test('manifest is server-only, exact unique eleven legacy links, and selects only reviewed static public photos',()=>{
 const file=readFileSync(new URL('../lib/vehicles/publication-manifest.ts',import.meta.url),'utf8');assert.match(file,/import 'server-only'/);
 const links=[...file.matchAll(/\['([^']+)','([a-f0-9-]{36})'\]/g)].map(m=>[m[1],m[2]]);assert.equal(links.length,11);assert.equal(new Set(links.map(r=>r[0] )).size,11);assert.equal(new Set(links.map(r=>r[1] )).size,11);assert.deepEqual(links.map(r=>r[0]),vehicleCatalogue.filter(v=>!['jeep-wrangler-2017','ford-escape-2014','mercedes-benz-gla-250-2016'].includes(v.slug)).map(v=>v.slug));
 assert.match(file,/photoSources:vehicleCatalogue\.find/);assert.doesNotMatch(file,/investment_photos|storage\.from|api\/investments/);
});
test('sitemap derives only enabled public slugs rather than keeping hidden static URLs',()=>{
 const source=readFileSync(new URL('../app/sitemap.ts',import.meta.url),'utf8');assert.match(source,/publicCatalogueFallback\(\)\.map/);assert.doesNotMatch(source,/investment_vehicles|vehicleId|sale_cents/);
});

test('Volvo metadata follows approved public preview without disclosing private owner use',async()=>{
 const car=vehicleCatalogue.find(v=>v.slug==='volvo-s60-inscription-2019')!;
 const entry={slug:car.slug,vehicleId:'private-volvo',enabled:true,photoSources:car.photos.map(p=>p.src),previewPriceCents:1290000};
 const h=harness({data:[{id:entry.vehicleId,catalogue_slug:null,status:'purchased',asking_cents:null}],error:null},[entry]);
 const meta=await h.publicVehicleMetadata(car.slug,'Volvo S60 Inscription 2019. Imagen de referencia.');
 assert.match(meta.title,/\$12,900/);assert.match(meta.description,/Próximamente/);assert.doesNotMatch(JSON.stringify(meta),/equipo|private-volvo|No está en venta/);
 assert.equal((await h.readPublicCatalogue())[0].availability,'coming-soon');
});

test('slug-only publication reads exact public slugs without requiring private IDs in source',async()=>{
 const car=vehicleCatalogue.find(v=>v.slug==='jeep-wrangler-2017')!;
 const entry={slug:car.slug,inventorySlug:car.slug,enabled:true,photoSources:car.photos.map(p=>p.src)};
 const h=harness({data:[{id:'not-in-source',catalogue_slug:car.slug,status:'purchased',asking_cents:null}],error:null},[entry]);
 const result=await h.readPublicCatalogue();assert.equal(result[0].availability,'coming-soon');assert.equal(result[0].price,null);
 assert.deepEqual(h.calls.slice(0,4),[['connection'],['from','investment_vehicles'],['select','id,catalogue_slug,status,asking_cents'],['in','catalogue_slug',[car.slug]]]);
 assert.doesNotMatch(JSON.stringify(result),/not-in-source|inventorySlug|vehicleId/);
 const metadata=await h.publicVehicleMetadata(car.slug,'Jeep Wrangler 2017. Fotografía original.');assert.match(metadata.title,/Precio por confirmar/);assert.match(metadata.description,/Próximamente/);
});
