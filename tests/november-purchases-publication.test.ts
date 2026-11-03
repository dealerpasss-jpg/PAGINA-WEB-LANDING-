import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { vehicleCatalogue } from '../data/vehicle-catalogue.ts';
import { projectCatalogue, unverifiedCatalogue, validCatalogueResponse, publicPrice, type Publication } from '../lib/vehicles/publication.ts';
const slugs=['nissan-versa-sr-2020','audi-a4-premium-2017','volvo-s60-inscription-2019'];
const cars=slugs.map(slug=>vehicleCatalogue.find(v=>v.slug===slug)!);
const manifest:Publication[]=cars.map((v,i)=>({slug:v.slug,vehicleId:'private-'+i,enabled:true,photoSources:v.photos.map(p=>p.src),...(i===2?{previewPriceCents:1290000}:{})}));
const rows=manifest.map((v,i)=>({id:v.vehicleId,catalogue_slug:null,status:'purchased',asking_cents:[790000,1090000,null][i]}));
test('three explicitly approved entries retain known mileage and label real reference photos with edited backgrounds',()=>{
 assert.deepEqual(cars.map(v=>v.specs.find(([key])=>key==='Millaje')?.[1]),['128.541 mi','107.203 mi','134.820 mi']);
 assert.deepEqual(cars.map(v=>v.price),[790000,1090000,1290000]);
 for(const car of cars){assert.ok(car.referenceImage);assert.equal(car.photos.length,1);assert.match(car.photoNotice!,/Foto de referencia con fondo de presentación editado/);assert.match(car.photos[0].caption,/fondo editado, no es esta unidad/);assert.ok(!car.specs.some(([key])=>['Título','Transmisión','Exterior'].includes(key)));assert.doesNotMatch(JSON.stringify(car),/VIN|purchase_cents|buyer fee|dealer fee|expenses|valuation|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f-]{23}/);}
});
test('Volvo public preview price stays independent of private asking and cannot enable purchasing',()=>{
 for(const status of ['purchased','repairing','listed']){
  for(const asking_cents of [null,1234500,0]){
   const v=projectCatalogue(cars,[manifest[2]],[{...rows[2],status,asking_cents}])[0];
   assert.equal(v.availability,'coming-soon');assert.equal(v.price,1290000);assert.equal(publicPrice(v),'$12,900');assert.ok(validCatalogueResponse([v]));
   assert.doesNotMatch(JSON.stringify(v),/uso del equipo|propietario.*uso|not-for-sale|previewPriceCents/i);
  }
 }
 assert.equal(rows[2].asking_cents,null);
});
test('Volvo preview honors sold and fails closed on missing, duplicate, mismatched or unexpected source',()=>{
 const sold=projectCatalogue(cars,[manifest[2]],[{...rows[2],status:'sold'}])[0];assert.equal(sold.availability,'sold');assert.equal(sold.price,null);assert.doesNotMatch(sold.description,/próximamente|todavía no está disponible/i);
 for(const input of [null,[],[rows[2],rows[2]],[{...rows[2],catalogue_slug:'other'}],[{...rows[2],status:'unexpected'}]]){
  const v=projectCatalogue(cars,[manifest[2]],input)[0];assert.equal(v.availability,'unverified');assert.equal(v.price,null);assert.ok(validCatalogueResponse([v]));assert.doesNotMatch(v.description,/próximamente|todavía no está disponible/i);
 }
 const v=projectCatalogue(cars,[manifest[2]],rows)[0];assert.deepEqual(unverifiedCatalogue([v]).map(v=>[v.availability,v.price]),[['unverified',null]]);
 for(const previewPriceCents of [0,-1,NaN,Infinity,1.1,100_000_000_000])assert.equal(projectCatalogue(cars,[{...manifest[2],previewPriceCents}],rows)[0].availability,'unverified');
});
test('new purchased cars remain previews until the existing inventory state permits availability',()=>{
 const projected=projectCatalogue(cars,manifest,rows);assert.deepEqual(projected.map(v=>v.availability),['coming-soon','coming-soon','coming-soon']);assert.deepEqual(projected.map(v=>v.price),[790000,1090000,1290000]);
 const noPrice=projectCatalogue(cars,manifest,rows.map(v=>({...v,asking_cents:null})));assert.equal(noPrice[0].availability,'coming-soon');assert.equal(noPrice[0].price,null);
 assert.doesNotMatch(JSON.stringify(projected),/private-|vehicleId|asking_cents|catalogue_slug/);
});
test('routes, neutral non-sale copy and private image reuse are wired without financial mutations',()=>{
 for(const slug of slugs){const route=readFileSync(new URL('../app/vehiculos/'+slug+'/page.tsx',import.meta.url),'utf8');assert.match(route,/generateMetadata/);assert.ok(route.includes('VehicleDetail slug="'+slug+'"'));}
 const detail=readFileSync(new URL('../components/VehicleDetailView.tsx',import.meta.url),'utf8');assert.doesNotMatch(detail,/VEHÍCULO DEL EQUIPO|uso del equipo/i);assert.match(detail,/vehicle.availability==='available'\?<><Link href="\/contacto"/);
 for(const file of ['page.tsx','[id]/page.tsx']){const page=readFileSync(new URL('../app/mi-cuenta/inversiones/'+file,import.meta.url),'utf8');assert.match(page,/publishedVehicleForInvestment/);assert.doesNotMatch(page,/\.insert\(|\.update\(/);}
 const card=readFileSync(new URL('../components/VehicleCards.tsx',import.meta.url),'utf8');assert.match(card,/referenceBadge}>Imagen de referencia/);
});
test('reference assets preserve the inspected full frames and contain no embedded private metadata',()=>{
 const assets=JSON.parse(readFileSync(new URL('../docs/november-reference-assets.json',import.meta.url),'utf8')) as {slug:string;sha256:string;bytes:number}[];
 assert.equal(assets.length,3);for(const a of assets){const bytes=readFileSync(new URL('../public/vehicles/'+a.slug+'/referencia-real.webp',import.meta.url));assert.equal(bytes.length,a.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256);assert.equal(bytes.subarray(8,12).toString(),'WEBP');assert.ok(!bytes.includes(Buffer.from('EXIF')));assert.ok(!bytes.includes(Buffer.from('XMP ')));}
});

test('Audi mirror is image-only, global across public/private surfaces, with unchanged source bytes',()=>{
 const css=readFileSync(new URL('../app/globals.css',import.meta.url),'utf8');
 assert.match(css,/img\[src\*="audi-a4-premium-2017"\]\[src\*="referencia-real.webp"\]\s*\{\s*scale:-1 1;/);
 assert.equal((css.match(/scale:-1 1/g)||[]).length,1);
 for(const surface of ['components/VehicleCards.tsx','components/VehicleGallery.tsx']){const source=readFileSync(new URL('../'+surface,import.meta.url),'utf8');assert.doesNotMatch(source,/scaleX\(-1\)|scale:-1/);}
 for(const file of ['lib/vehicles/publication.ts','components/VehicleCards.tsx','components/VehicleDetailView.tsx'])assert.doesNotMatch(readFileSync(new URL('../'+file,import.meta.url),'utf8'),/Uso del equipo|VEHÍCULO DEL EQUIPO|not-for-sale/i);
});
