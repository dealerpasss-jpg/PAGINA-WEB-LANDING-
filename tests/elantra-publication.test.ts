import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { vehicleCatalogue } from '../data/vehicle-catalogue.ts';
import { defaultCatalogueFilters, filterCatalogue, vehicleSpec } from '../lib/vehicles/catalogue.ts';
test('approved Elantra has one labelled paint visualization and owner-attributed condition, no private finances',()=>{
 const rows=vehicleCatalogue.filter(v=>v.slug==='hyundai-elantra-eco-2018');assert.equal(rows.length,1);const v=rows[0];assert.equal(v.price,820000);assert.equal(v.photos.length,1);assert.equal(v.bodyStyle,'Sedán');assert.equal(vehicleSpec(v,'Millaje'),'104.609 mi');assert.equal(vehicleSpec(v,'Estado actual'),'En proceso de pintura');assert.match(v.photoNotice??'',/Foto provisional: visualización de pintura/);assert.match(v.photos[0].caption,/imagen editada/);assert.match(v.description,/propietario reporta/);assert.match(v.description,/no una fotografía del acabado actual/);assert.doesNotMatch(JSON.stringify(v),/purchase_cents|sale_cents|expenses|2820|1800|270|150|600|5NPD|4a3a2492/);
 assert.equal(filterCatalogue(vehicleCatalogue,{...defaultCatalogueFilters,make:'Hyundai',query:'2018 ECO blanco'})[0].slug,v.slug);
});
test('optimized exact approved full-frame asset and real public route/sitemap exist',()=>{
 const image=readFileSync(new URL('../public/vehicles/hyundai-elantra-eco-2018/visualizacion-pintura.webp',import.meta.url));assert.equal(createHash('sha256').update(image).digest('hex'),'438c2d9799b07658b42cc8da3bd4d736c66c8dee89f5c345f69476e3fde2c86b');assert.ok(image.length<250*1024);
 assert.match(readFileSync(new URL('../app/vehiculos/hyundai-elantra-eco-2018/page.tsx',import.meta.url),'utf8'),/VehicleDetail slug="hyundai-elantra-eco-2018"/);
 assert.match(readFileSync(new URL('../app/sitemap.ts',import.meta.url),'utf8'),/\/vehiculos\/hyundai-elantra-eco-2018/);
});
