import test from 'node:test';
import assert from 'node:assert/strict';
import { vehicleCatalogue } from '../data/vehicle-catalogue.ts';
import { defaultCatalogueFilters, filterCatalogue, readCatalogueFilters } from '../lib/vehicles/catalogue.ts';

test('catalogue includes the three approved November references and preserves previous vehicle order', () => {
  assert.equal(vehicleCatalogue.length, 11);
  assert.equal(vehicleCatalogue[0].slug,'mazda6-grand-touring-2016');
  assert.deepEqual(vehicleCatalogue.filter(v=>!['nissan-versa-sr-2020','audi-a4-premium-2017','volvo-s60-inscription-2019'].includes(v.slug)).slice(1).map(v=>v.slug),['hyundai-elantra-eco-2018','ford-escape-se-2016','ford-edge-2021','ford-edge-titanium-2018','ford-explorer-xlt-2013','subaru-forester-2015','subaru-impreza-2016']);
  assert.deepEqual(filterCatalogue(vehicleCatalogue, defaultCatalogueFilters), vehicleCatalogue);
});
test('search is accent insensitive, case insensitive, and matches every word', () => {
  assert.equal(filterCatalogue(vehicleCatalogue, { ...defaultCatalogueFilters, query: '  FORD blanco  ' }).length, 2);
  assert.equal(filterCatalogue(vehicleCatalogue, { ...defaultCatalogueFilters, query: 'automatica' }).length, 6);
  assert.equal(filterCatalogue(vehicleCatalogue, { ...defaultCatalogueFilters, query: '2016 subaru' })[0].slug, 'subaru-impreza-2016');
});
test('make combines with search and unknown matches remain honest empty results', () => {
  assert.equal(filterCatalogue(vehicleCatalogue, { ...defaultCatalogueFilters, make: 'Subaru' }).length, 2);
  assert.equal(filterCatalogue(vehicleCatalogue, { ...defaultCatalogueFilters, make: 'Ford', query: 'Subaru' }).length, 0);
  assert.equal(filterCatalogue(vehicleCatalogue, { ...defaultCatalogueFilters, make: 'Other' }).length, 0);
});
test('sort uses cents and numerical years/mileage without mutating source', () => {
  const order = vehicleCatalogue.map(vehicle => vehicle.slug);
  assert.equal(filterCatalogue(vehicleCatalogue, { ...defaultCatalogueFilters, sort: 'price-asc' })[0].price, 365000);
  assert.equal(filterCatalogue(vehicleCatalogue, { ...defaultCatalogueFilters, sort: 'price-desc' })[0].price, 1290000);
  assert.equal(filterCatalogue(vehicleCatalogue, { ...defaultCatalogueFilters, sort: 'year-desc' })[0].slug, 'ford-edge-2021');
  assert.equal(filterCatalogue(vehicleCatalogue, { ...defaultCatalogueFilters, sort: 'mileage-asc' })[0].slug, 'ford-escape-se-2016');
  const withUnknown=vehicleCatalogue.map(v=>v.slug==='volvo-s60-inscription-2019'?{...v,price:null}:v);
  assert.equal(filterCatalogue(withUnknown, { ...defaultCatalogueFilters, sort: 'price-desc' }).at(-1)?.slug, 'volvo-s60-inscription-2019');
  assert.equal(filterCatalogue(withUnknown, { ...defaultCatalogueFilters, sort: 'price-asc' }).at(-1)?.slug, 'volvo-s60-inscription-2019');
  assert.deepEqual(vehicleCatalogue.map(vehicle => vehicle.slug), order);
});
test('shared filter URLs validate sort and bound input length', () => {
  assert.deepEqual(readCatalogueFilters(new URLSearchParams()), defaultCatalogueFilters);
  assert.deepEqual(readCatalogueFilters(new URLSearchParams('marca=Ford&buscar=2016&orden=price-asc')), { query: '2016', make: 'Ford', sort: 'price-asc', availability:'' });
  assert.equal(readCatalogueFilters(new URLSearchParams('orden=invalid')).sort, 'featured');
  assert.equal(readCatalogueFilters(new URLSearchParams({ buscar: 'a'.repeat(1000) })).query.length, 100);
});

test('URL updates only treat featured as the sort default, never as search text', async () => {
  const { updateCatalogueParams, catalogueQuery } = await import('../lib/vehicles/catalogue.ts');
  const initial = new URLSearchParams('marca=Ford&orden=price-asc');
  const searched = updateCatalogueParams(initial, 'buscar', 'featured');
  assert.equal(searched.get('buscar'), 'featured');
  assert.equal(searched.get('orden'), 'price-asc');
  const resetSort = updateCatalogueParams(searched, 'orden', 'featured');
  assert.equal(resetSort.get('orden'), null);
  assert.equal(resetSort.get('buscar'), 'featured');
  assert.equal(initial.get('buscar'), null);
  assert.equal(catalogueQuery(new URLSearchParams('buscar=Ford&marca=Ford&orden=price-asc&next=https://example.com')), 'buscar=Ford&marca=Ford&orden=price-asc');
  assert.equal(catalogueQuery(new URLSearchParams('orden=invalid&next=//example.com')), '');
});

test('availability combines with make/search and URL returns while rejecting unknown states',async()=>{
 const {catalogueQuery,updateCatalogueParams}=await import('../lib/vehicles/catalogue.ts');
 const cars=vehicleCatalogue.map((v,i)=>({...v,availability:i<2?'coming-soon' as const:'available' as const}));
 const params=new URLSearchParams('disponibilidad=available&marca=Ford&buscar=blanco&orden=price-asc&next=https://evil.test');
 const filtered=filterCatalogue(cars,readCatalogueFilters(params));assert.equal(filtered.length,2);assert.ok(filtered.every(v=>v.availability==='available'));
 assert.equal(catalogueQuery(params),'buscar=blanco&marca=Ford&disponibilidad=available&orden=price-asc');
 assert.equal(readCatalogueFilters(new URLSearchParams('disponibilidad=constructor')).availability,'');
 assert.equal(updateCatalogueParams(params,'disponibilidad','').has('disponibilidad'),false);
 assert.equal(filterCatalogue(cars,{...defaultCatalogueFilters,availability:'sold'}).length,0);
 assert.equal(filterCatalogue([{...cars[0],availability:undefined}],{...defaultCatalogueFilters,availability:'unverified'}).length,1);
});
test('available related cars rank availability before make without mutating catalogue or inventing alternatives',async()=>{
 const {relatedVehicles}=await import('../lib/vehicles/catalogue.ts');
 const current={...vehicleCatalogue[0],availability:'available' as const};
 const soon={...current,slug:'same-make-soon',availability:'coming-soon' as const};
 const available=vehicleCatalogue.slice(-3).map(v=>({...v,availability:'available' as const}));
 const source=[current,soon,...available];assert.deepEqual(relatedVehicles(source,current),available);assert.equal(source[1],soon);
 assert.deepEqual(relatedVehicles([current,soon],current),[soon]);
 assert.deepEqual(relatedVehicles(source,{...current,availability:'coming-soon'}),available);
});
