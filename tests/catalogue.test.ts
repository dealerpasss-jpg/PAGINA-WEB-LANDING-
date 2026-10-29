import test from 'node:test';
import assert from 'node:assert/strict';
import { vehicleCatalogue } from '../data/vehicle-catalogue.ts';
import { defaultCatalogueFilters, filterCatalogue, readCatalogueFilters } from '../lib/vehicles/catalogue.ts';

test('catalogue preserves all six real vehicles and original ordering by default', () => {
  assert.equal(vehicleCatalogue.length, 6);
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
  assert.equal(filterCatalogue(vehicleCatalogue, { ...defaultCatalogueFilters, sort: 'price-desc' })[0].price, 1080000);
  assert.equal(filterCatalogue(vehicleCatalogue, { ...defaultCatalogueFilters, sort: 'year-desc' })[0].slug, 'ford-edge-2021');
  assert.equal(filterCatalogue(vehicleCatalogue, { ...defaultCatalogueFilters, sort: 'mileage-asc' })[0].slug, 'ford-escape-se-2016');
  assert.deepEqual(vehicleCatalogue.map(vehicle => vehicle.slug), order);
});
test('shared filter URLs validate sort and bound input length', () => {
  assert.deepEqual(readCatalogueFilters(new URLSearchParams()), defaultCatalogueFilters);
  assert.deepEqual(readCatalogueFilters(new URLSearchParams('marca=Ford&buscar=2016&orden=price-asc')), { query: '2016', make: 'Ford', sort: 'price-asc' });
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
