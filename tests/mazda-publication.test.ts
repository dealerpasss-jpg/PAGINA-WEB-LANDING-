import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { vehicleCatalogue } from '../data/vehicle-catalogue.ts';
import { defaultCatalogueFilters, filterCatalogue, vehicleSpec } from '../lib/vehicles/catalogue.ts';

test('Mazda public listing contains approved facts, eight originals, and no private financial record', () => {
  const rows = vehicleCatalogue.filter(v => v.slug === 'mazda6-grand-touring-2016');
  assert.equal(rows.length, 1);
  const v = rows[0];
  assert.equal(v.price, 850000);
  assert.equal(v.photos.length, 8);
  assert.equal(new Set(v.photos.map(p => p.src)).size, 8);
  assert.equal(v.originalPhotos, true);
  assert.equal(v.photoNotice, undefined);
  assert.equal(v.bodyStyle, 'Sedán');
  assert.equal(vehicleSpec(v, 'Millaje'), '161.000 mi');
  assert.equal(vehicleSpec(v, 'Interior'), 'Crema / marfil');
  assert.equal(vehicleSpec(v, 'Transmisión'), '');
  assert.match(v.description, /propietario reporta título limpio y ausencia de fallas mecánicas/);
  assert.match(v.description, /no sustituye una inspección independiente ni certifica el historial de accidentes/);
  assert.doesNotMatch(JSON.stringify(v), /purchase_cents|sale_cents|expenses|contribution_cents|vehicle_id|VIN|\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f-]{23}\b/);
  assert.equal(filterCatalogue(vehicleCatalogue, {...defaultCatalogueFilters, make:'Mazda', query:'2016 Grand Touring blanco'})[0].slug, v.slug);
});

test('all eight approved optimized photo files match their full-frame publication manifest', () => {
  const manifest = JSON.parse(readFileSync(new URL('../docs/mazda-public-assets.json', import.meta.url), 'utf8')) as {file:string;sha256:string;width:number;height:number;bytes:number}[];
  assert.equal(manifest.length, 8);
  for (const item of manifest) {
    const bytes = readFileSync(new URL(`../public/vehicles/mazda6-grand-touring-2016/${item.file}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256);
    assert.equal(bytes.length, item.bytes);
    assert.ok(bytes.length < 500 * 1024);
    assert.equal(item.width, 1448); assert.equal(item.height, 1086);
    assert.equal(bytes.subarray(8,12).toString(), 'WEBP');
    assert.equal(bytes.includes(Buffer.from('EXIF')), false);
    assert.equal(bytes.includes(Buffer.from('XMP ')), false);
  }
});

test('Mazda route, metadata, sitemap and original-photo notice are correctly wired', () => {
  const route = readFileSync(new URL('../app/vehiculos/mazda6-grand-touring-2016/page.tsx', import.meta.url), 'utf8');
  assert.match(route, /VehicleDetail slug="mazda6-grand-touring-2016"/);
  assert.match(route, /US\$8\.500/);
  assert.match(route, /161\.000 millas/);
  assert.match(readFileSync(new URL('../app/sitemap.ts', import.meta.url), 'utf8'), /\/vehiculos\/mazda6-grand-touring-2016/);
  const gallery = readFileSync(new URL('../components/VehicleGallery.tsx', import.meta.url), 'utf8');
  assert.match(gallery, /originalPhotos = false/);
  assert.match(gallery, /Fotografías originales proporcionadas por el vendedor/);
  assert.match(gallery, /La portada tiene el fondo editado/);
  assert.match(readFileSync(new URL('../components/VehicleDetail.tsx', import.meta.url), 'utf8'), /originalPhotos=\{vehicle.originalPhotos\}/);
});
