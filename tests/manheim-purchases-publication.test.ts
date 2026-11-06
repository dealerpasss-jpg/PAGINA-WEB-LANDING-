import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { vehicleCatalogue } from '../data/vehicle-catalogue.ts';
import { photoCredits } from '../data/photo-credits.ts';
import { projectCatalogue, publicPrice, validCatalogueResponse, type Publication } from '../lib/vehicles/publication.ts';

const slugs=['jeep-wrangler-2017','ford-escape-2014','mercedes-benz-gla-250-2016'];
const cars=slugs.map(slug=>vehicleCatalogue.find(v=>v.slug===slug)!);
const manifest:Publication[]=cars.map(v=>({slug:v.slug,inventorySlug:v.slug,enabled:true,photoSources:v.photos.map(p=>p.src)}));
const rows=manifest.map((v,i)=>({id:'private-manheim-'+i,catalogue_slug:v.slug,status:'purchased',asking_cents:null}));

test('three Manheim previews use verified years and mileage without invented price, condition or title',()=>{
 assert.deepEqual(cars.map(v=>v.title),['Jeep Wrangler 2017','Ford Escape 2014','Mercedes-Benz GLA 250 2016']);
 assert.deepEqual(cars.map(v=>v.specs.find(([key])=>key==='Millaje')?.[1]),['155.965 mi','160.383 mi','108.119 mi']);
 assert.deepEqual(cars.map(v=>v.price),[null,null,null]);
 for(const car of cars){
  assert.ok(!car.originalPhotos);assert.ok(car.referenceImage);assert.equal(car.photos.length,2);assert.equal(car.photos[0].src,'/vehicles/'+car.slug+'/portada.webp');assert.equal(car.photos[1].src,'/vehicles/'+car.slug+'/original.jpeg');assert.match(car.photos[1].caption,/fotografía original de esta unidad/);
  assert.match(car.photoNotice??'',/no (?:es )?esta unidad ni su condición actual/);
  if(car.slug==='ford-escape-2014'){
   assert.match(car.photoNotice??'',/Portada de referencia con fondo editado/);assert.match(car.photos[0].caption,/fondo editado, no es esta unidad/);
  }else{
   assert.match(car.photoNotice??'',/referencia recreada con IA/);assert.match(car.photos[0].caption,/Referencia recreada con IA/);assert.match(car.description,/visualización de referencia recreada con IA/);
  }
  assert.match(car.description,/estado mecánico y la documentación están pendientes de confirmar/);assert.ok(!car.specs.some(([key])=>['Título','Transmisión','Reparaciones','Exterior'].includes(key)));assert.doesNotMatch(JSON.stringify(car),/VIN|purchase_cents|asking_cents|fee|expenses/);
 }
});
test('purchased Manheim vehicles show coming soon with price to confirm and leak no private fields',()=>{
 const output=projectCatalogue(cars,manifest,rows);
 assert.deepEqual(output.map(v=>v.availability),['coming-soon','coming-soon','coming-soon']);
 assert.deepEqual(output.map(v=>publicPrice(v)),['Precio por confirmar','Precio por confirmar','Precio por confirmar']);
 assert.ok(validCatalogueResponse(output));
 assert.doesNotMatch(JSON.stringify(output),/private-manheim|vehicleId|inventorySlug|asking_cents|catalogue_slug|api\/investments|storage\/v1/);
 for(const status of ['purchased','repairing'])assert.ok(projectCatalogue(cars,manifest,rows.map(row=>({...row,status}))).every(v=>v.availability==='coming-soon'&&v.price===null));
 assert.ok(projectCatalogue(cars,manifest,null).every(v=>v.availability==='unverified'&&v.price===null));
 assert.ok(projectCatalogue(cars,manifest,rows.map(row=>({...row,status:'sold'}))).every(v=>v.availability==='sold'&&v.price===null));
});
test('each preview has a public route and an exact original image without embedded EXIF/XMP',()=>{
 const assets=JSON.parse(readFileSync(new URL('../docs/manheim-original-assets.json',import.meta.url),'utf8')) as {slug:string;file:string;sha256:string;bytes:number;width:number;height:number;originalUnedited:boolean}[];
 assert.deepEqual(assets.map(v=>v.slug),slugs);
 for(const a of assets){
  const route=readFileSync(new URL('../app/vehiculos/'+a.slug+'/page.tsx',import.meta.url),'utf8');assert.match(route,/generateMetadata/);assert.ok(route.includes('VehicleDetail slug="'+a.slug+'"'));
  const bytes=readFileSync(new URL('../public/vehicles/'+a.slug+'/'+a.file,import.meta.url));assert.equal(bytes.length,a.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256);assert.equal(bytes.readUInt16BE(0),0xffd8);assert.ok(!bytes.includes(Buffer.from('Exif\0\0')));assert.ok(!bytes.includes(Buffer.from('http://ns.adobe.com/xap/')));assert.equal(a.width,1152);assert.equal(a.height,1536);assert.equal(a.originalUnedited,true);
 }
});

test('slug publication fails closed for mismatches, duplicate rows and ambiguous selectors',()=>{
 for(const input of [[],[rows[0],rows[0]],rows.map(row=>({...row,catalogue_slug:'different-slug'}))]){const output=projectCatalogue(cars,[manifest[0]],input);assert.equal(output[0].availability,'unverified');assert.equal(output[0].price,null);}
 for(const entry of [{...manifest[0],inventorySlug:'other'},{...manifest[0],vehicleId:'must-not-mix'},{...manifest[0],inventorySlug:undefined}])assert.equal(projectCatalogue(cars,[entry],rows).length,0);
 assert.equal(projectCatalogue(cars,[manifest[0],manifest[0]],rows).length,0);
});
test('new publication registry stores only approved public slugs, never new private record IDs',()=>{
 const source=readFileSync(new URL('../lib/vehicles/publication-registry.ts',import.meta.url),'utf8');
 assert.match(source,/import 'server-only'/);assert.match(source,/inventorySlug:slug/);assert.doesNotMatch(source,/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f-]{23}/);
 for(const slug of slugs)assert.ok(source.includes("'"+slug+"'"));
});

test('presentation covers are disclosed and preserve exact source originals as the second photo',()=>{
 const assets=JSON.parse(readFileSync(new URL('../docs/manheim-presentation-assets.json',import.meta.url),'utf8')) as {slug:string;file:string;sha256:string;bytes:number;width:number;height:number;backgroundEdited:boolean;referenceImage:boolean;originalFile:string;author:string;sourceUrl:string;licenseUrl:string}[];
 assert.deepEqual(assets.map(v=>v.slug),slugs);
 for(const a of assets){
  const bytes=readFileSync(new URL('../public/vehicles/'+a.slug+'/'+a.file,import.meta.url));assert.equal(bytes.length,a.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.equal(a.width/a.height,4/3);assert.equal(a.backgroundEdited,true);assert.equal(a.referenceImage,true);assert.equal(a.originalFile,'original.jpeg');const credit=photoCredits['/vehicles/'+a.slug+'/'+a.file];assert.equal(credit.author,a.author);assert.equal(credit.sourceUrl,a.sourceUrl);assert.equal(credit.licenseUrl,a.licenseUrl);assert.match(credit.changes,/editado|recreada con IA/);
  const car=cars.find(v=>v.slug===a.slug)!;assert.match(car.description,/fondo de presentación editado|Se adaptaron el fondo/);assert.match(car.description,/fotografía original de esta unidad está disponible/);assert.equal(car.photos[1].src,'/vehicles/'+a.slug+'/'+a.originalFile);
 }
});

test('temporary reference covers disclose unit differences and render source attribution',()=>{
 const car=cars[1];assert.match(car.description,/Titanium 2014 plateada/);assert.match(car.photoNotice??'',/otro ejemplar, no esta unidad ni su condición actual/);assert.match(car.description,/pueden diferir/);
 assert.match(cars[0].description,/Wrangler JK Unlimited 2018/);assert.match(cars[0].description,/techo, los rines, los estribos y la apariencia del parachoques/);assert.match(cars[2].description,/GLA 250 4MATIC 2015/);assert.match(cars[2].description,/fondo, el color, los rines y el techo/);
 const gallery=readFileSync(new URL('../components/VehicleGallery.tsx',import.meta.url),'utf8');assert.match(gallery,/href=\{credit.sourceUrl\}/);assert.match(gallery,/href=\{credit.licenseUrl\}/);assert.equal((gallery.match(/<PhotoAttribution src=\{photo.src\}/g)||[]).length,2);
});
