import test from 'node:test';
import assert from 'node:assert/strict';
import { catalogueHistorySnapshot, replaceCatalogueHistory, subscribeCatalogueHistory } from '../lib/vehicles/catalogue-history.ts';
import { catalogueQuery, readCatalogueFilters, updateCatalogueParams } from '../lib/vehicles/catalogue.ts';

function browserFixture() {
  const browser = new EventTarget();
  let url = new URL('https://dealerpasss.com/vehiculos?marca=Subaru#inventario');
  Object.defineProperty(browser, 'location', { get: () => url });
  Object.defineProperty(browser, 'history', { value: { replaceState: (_data: unknown, _title: string, next: string) => { url = new URL(next, url); } } });
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', { value: browser, configurable: true });
  return {
    restore() { if (previous) Object.defineProperty(globalThis, 'window', previous); else Reflect.deleteProperty(globalThis, 'window'); },
    navigate(search: string) { url = new URL(`/vehiculos${search}`, url); browser.dispatchEvent(new Event('popstate')); },
    url: () => url,
  };
}

test('rapid sequential edits synchronously reflect every character before router updates', () => {
  const browser = browserFixture();
  let renderedQuery = '';
  const unsubscribe = subscribeCatalogueHistory(() => { renderedQuery = readCatalogueFilters(new URLSearchParams(catalogueHistorySnapshot())).query; });
  try {
    for (const target of ['featured', 'Subaru 2016']) {
      replaceCatalogueHistory(updateCatalogueParams(new URLSearchParams(catalogueHistorySnapshot()), 'buscar', ''));
      for (const character of target) {
        const entered = renderedQuery + character;
        replaceCatalogueHistory(updateCatalogueParams(new URLSearchParams(catalogueHistorySnapshot()), 'buscar', entered));
        assert.equal(renderedQuery, entered, 'controlled value must update in the input event, without a router tick');
      }
      assert.equal(renderedQuery, target);
      assert.equal(new URLSearchParams(catalogueHistorySnapshot()).get('marca'), 'Subaru');
    }
    assert.equal(browser.url().hash, '#inventario');
  } finally { unsubscribe(); browser.restore(); }
});

test('paste, deletion, subsequent make/sort updates and detail query keep current input', () => {
  const browser = browserFixture();
  try {
    for (const value of ['Subaru 2016', 'Subaru 201', '', 'featured', 'Ford & blanco']) {
      replaceCatalogueHistory(updateCatalogueParams(new URLSearchParams(catalogueHistorySnapshot()), 'buscar', value));
      assert.equal(readCatalogueFilters(new URLSearchParams(catalogueHistorySnapshot())).query, value);
    }
    replaceCatalogueHistory(updateCatalogueParams(new URLSearchParams(catalogueHistorySnapshot()), 'marca', 'Ford'));
    replaceCatalogueHistory(updateCatalogueParams(new URLSearchParams(catalogueHistorySnapshot()), 'orden', 'price-asc'));
    const snapshot = new URLSearchParams(catalogueHistorySnapshot());
    assert.deepEqual(readCatalogueFilters(snapshot), { query: 'Ford & blanco', make: 'Ford', sort: 'price-asc' });
    assert.equal(new URLSearchParams(catalogueQuery(snapshot)).get('buscar'), 'Ford & blanco');
  } finally { browser.restore(); }
});

test('Back/Forward notifications restore snapshots and cleanup removes listeners', () => {
  const browser = browserFixture();
  const seen: string[] = [];
  const unsubscribe = subscribeCatalogueHistory(() => seen.push(catalogueHistorySnapshot()));
  try {
    browser.navigate('?buscar=Ford&orden=price-asc');
    browser.navigate('?buscar=Subaru+2016');
    assert.deepEqual(seen, ['buscar=Ford&orden=price-asc', 'buscar=Subaru+2016']);
    unsubscribe();
    browser.navigate('?buscar=ignored');
    replaceCatalogueHistory(new URLSearchParams('buscar=also-ignored'));
    assert.equal(seen.length, 2);
  } finally { unsubscribe(); browser.restore(); }
});
