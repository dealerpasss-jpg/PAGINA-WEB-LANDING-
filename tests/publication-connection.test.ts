import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { vehicleCatalogue } from '../data/vehicle-catalogue.ts';
import { availabilityFor, projectCatalogue, publicPrice, validCatalogueResponse, unverifiedCatalogue, type PublicInventoryRow, type Publication } from '../lib/vehicles/publication.ts';
import { filterCatalogue, defaultCatalogueFilters } from '../lib/vehicles/catalogue.ts';
const approved=vehicleCatalogue.slice(0,2);
const manifest:Publication[]=approved.map((v,i)=>({slug:v.slug,vehicleId:'private-'+i,enabled:true,photoSources:v.photos.map(p=>p.src)}));
const rows:PublicInventoryRow[]=manifest.map(p=>({id:p.vehicleId,catalogue_slug:null,status:'listed',asking_cents:750000}));
test('availability follows current status, never equates purchased or repair with available',()=>{
 assert.deepEqual(['repairing','listed','sold','repairing','purchased','unknown'].map(status=>availabilityFor(status,750000)),['coming-soon','available','sold','coming-soon','coming-soon','unverified']);
 for(const value of [null,0,-1,1.01,NaN,Infinity,'750000',100_000_000_000])assert.equal(availabilityFor('listed',value),'unverified');
 assert.equal(availabilityFor('sold',null),'sold');
});
test('projection serializes only explicit public keys and approved photos, never private fields or IDs',()=>{
 const sensitive=rows.map(r=>({...r,purchase_cents:123456,sale_cents:999999,vin:'SECRET',notes:'private note',photos:[{src:'/api/investments/photo?id=private'}],expenses:[1],members:['private-email']}));
 const result=projectCatalogue(approved,manifest,sensitive);assert.equal(result.length,2);assert.equal(result[0].price,750000);assert.equal(result[0].availability,'available');
 assert.deepEqual(result[0].photos,approved[0].photos);assert.doesNotMatch(JSON.stringify(result),/private-|purchase_cents|sale_cents|SECRET|private note|private-email|expenses|members|vehicleId|catalogue_slug|asking_cents/);
 assert.notEqual(result[0].photos,approved[0].photos);assert.notEqual(result[0].specs,approved[0].specs);
});
test('missing, duplicate, mismatched and failed reads never reuse static price/availability',()=>{
 for(const input of [null,[],[...rows,rows[0]],rows.map(r=>({...r,catalogue_slug:'another-car'}))]){
  const result=projectCatalogue(approved,manifest,input);assert.equal(result[0].price,null);assert.equal(result[0].availability,'unverified');
 }
 const result=projectCatalogue(approved,manifest,[rows[1]]);assert.equal(result[0].availability,'unverified');assert.equal(result[1].availability,'available');
});
test('publication is explicit: hidden, new private cars and unapproved photos never surface',()=>{
 assert.equal(projectCatalogue(approved,[{...manifest[0],enabled:false}],rows).length,0);
 assert.equal(projectCatalogue(approved,manifest,[...rows,{id:'new-private',catalogue_slug:null,status:'listed',asking_cents:1}]).length,2);
 for(const photoSources of [[],['/api/investments/photo?id=private'],['https://private.test/photo'],[manifest[0].photoSources[0],manifest[0].photoSources[0]]])assert.equal(projectCatalogue(approved,[{...manifest[0],photoSources}],rows).length,0);
 assert.equal(projectCatalogue(approved,[manifest[0],manifest[0]],rows).length,0);
 const reversed={...manifest[0],photoSources:[...manifest[0].photoSources].reverse()};assert.equal(projectCatalogue(approved,[reversed],rows)[0].photos[0].src,reversed.photoSources[0]);
});
test('sold hides asking price and never derives closed sale; unknown prices sort last in both directions',()=>{
 const result=projectCatalogue(approved,manifest,[{...rows[0],status:'sold'},rows[1]]);assert.equal(result[0].price,null);assert.equal(publicPrice(result[0]),'Vendido');
 for(const sort of ['price-asc','price-desc'] as const)assert.equal(filterCatalogue(result,{...defaultCatalogueFilters,sort})[1].availability,'sold');
 assert.equal(publicPrice({...result[1],price:750025}),'$7,500.25');assert.equal(publicPrice({...result[1],price:null}),'Precio por confirmar');
});
test('API validation and network degradation cannot retain available stale prices',()=>{
 const result=projectCatalogue(approved,manifest,rows);assert.equal(validCatalogueResponse(result),true);assert.equal(validCatalogueResponse({...result}),false);
 assert.equal(validCatalogueResponse([{...result[0],price:null}]),false);assert.equal(validCatalogueResponse([{...result[0],availability:'sold'}]),false);
 assert.deepEqual(unverifiedCatalogue(result).map(v=>[v.price,v.availability]),[[null,'unverified'],[null,'unverified']]);
});
test('all public surfaces use the projection and never serialize server manifest/private rows',()=>{
 const server=readFileSync(new URL('../lib/vehicles/publication-server.ts',import.meta.url),'utf8');assert.match(server,/import 'server-only'/);assert.match(server,/select\('id,catalogue_slug,status,asking_cents'\)/);assert.match(server,/await connection\(\)/);assert.doesNotMatch(server,/select\('\*'\)|sale_cents|purchase_cents|investment_photos/);
 for(const p of ['components/VehicleExplorer.tsx','components/VehicleDetailView.tsx','components/HomeInventory.tsx']){const source=readFileSync(new URL('../'+p,import.meta.url),'utf8');assert.match(source,/useLiveCatalogue/);assert.doesNotMatch(source,/publication-manifest|investment_vehicles|SUPABASE|service_role/);}
 const endpoint=readFileSync(new URL('../app/api/catalogue/route.ts',import.meta.url),'utf8');assert.match(endpoint,/'Cache-Control':'no-store, max-age=0'/);
 const detail=readFileSync(new URL('../components/VehicleDetailView.tsx',import.meta.url),'utf8');assert.match(detail,/vehicle.availability==='available'\?<><Link href="\/contacto"/);
 const source=readFileSync(new URL('../lib/vehicles/use-live-catalogue.ts',import.meta.url),'utf8');assert.match(source,/visibilityState==='hidden'/);assert.match(source,/60000/);assert.match(source,/pending\?\.abort\(\)/);assert.match(source,/unverifiedCatalogue\(previous.source===initial\?previous.values:initial\)/);assert.match(source,/cache:'no-store'/);
});

test('Elantra disclosure survives status changes without asserting a stale current repair',()=>{
 for(const status of ['repairing','listed','sold']){
  const result=projectCatalogue(approved,manifest,rows.map(r=>({...r,status})));const elantra=result[1];
  assert.doesNotMatch(elantra.description,/actualmente en proceso de pintura/);assert.doesNotMatch(elantra.photos[0].caption,/sigue en proceso/);assert.match(elantra.photos[0].caption,/imagen editada/);assert.match(elantra.photoNotice??'',/visualización de pintura/);assert.ok(!elantra.specs.some(([key])=>key==='Estado actual'));
 }
});
test('gallery selection survives approved reordering and safely falls back when a photo is removed',()=>{
 const source=readFileSync(new URL('../components/VehicleGallery.tsx',import.meta.url),'utf8');
 assert.match(source,/Math.max\(0,photos.findIndex\(item=>item.src===selectedSrc\)\)/);assert.match(source,/if\(!photo\)return/);
 const selection=(photos:{src:string}[],src:string)=>Math.max(0,photos.findIndex(item=>item.src===src));
 assert.equal(selection([{src:'b'},{src:'a'}],'b'),0);assert.equal(selection([{src:'a'}],'b'),0);assert.equal(selection([{src:'c'},{src:'b'}],'b'),1);
});
