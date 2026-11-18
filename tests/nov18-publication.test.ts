import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { vehicleCatalogue } from '../data/vehicle-catalogue.ts';
import { photoCredits } from '../data/photo-credits.ts';
import { projectCatalogue, publicPrice } from '../lib/vehicles/publication.ts';

test('Nov 18 purchases retain unspecified prices, exact mileage, and disclosed photo provenance',()=>{
 const cars=['toyota-c-hr-xle-2018','honda-civic-dx-vp-2010'].map(slug=>vehicleCatalogue.find(v=>v.slug===slug)!);
 assert.deepEqual(cars.map(c=>c.price),[null,null]);
 assert.deepEqual(cars.map(c=>c.specs.find(([k])=>k==='Millaje')?.[1]),['130.763 mi','146.093 mi']);
 assert.ok(cars[0].originalPhotos); assert.equal(cars[0].photos.length,2); assert.match(cars[0].photoNotice!,/fondo industrial editado/); assert.match(cars[0].photos[1].caption,/Fotografía original/); assert.ok(cars[1].referenceImage);
 assert.match(cars[1].photoNotice!,/No corresponde a la unidad DX-VP/);
 for(const c of cars){
  assert.doesNotMatch(JSON.stringify(c),/NMTKHMBX6JR061269|2HGFA1F37AH503165|6,425|985|purchase_cents|title date/i);
  assert.ok(existsSync('public'+c.photos[0].src));
 }
 const credit=photoCredits[cars[1].photos[0].src]; assert.equal(credit.author,'RL GNZLZ');assert.equal(credit.license,'CC BY-SA 2.0');
 const manifest=cars.map((c,i)=>({slug:c.slug,vehicleId:'fixture'+i,enabled:true,photoSources:c.photos.map(p=>p.src)}));
 const rows=manifest.map(m=>({id:m.vehicleId,catalogue_slug:null,status:'purchased',asking_cents:null}));
 const projected=projectCatalogue(cars,manifest,rows);
 assert.deepEqual(projected.map(c=>c.availability),['coming-soon','coming-soon']);
 assert.deepEqual(projected.map(publicPrice),['Precio por confirmar','Precio por confirmar']);
});
