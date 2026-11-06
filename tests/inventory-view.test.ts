import test from 'node:test';
import assert from 'node:assert/strict';
import { filterInvestmentView } from '../lib/investments/view.ts';
const items = [{ id:'1', title:'Ford Escape 2016', status:'purchased' }, { id:'2', title:'Ford Edge 2021', status:'listed' }, { id:'3', title:'Vehículo de prueba', status:'repairing' }];
test('inventory display filters do not change totals, source data or order', () => {
  const copy = structuredClone(items);
  assert.deepEqual(filterInvestmentView(items, '', ''), items);
  assert.deepEqual(filterInvestmentView(items, 'FORD', ''), items.slice(0, 2));
  assert.deepEqual(items, copy);
});
test('inventory combines normalized text and exact workflow status', () => {
  assert.deepEqual(filterInvestmentView(items, 'ford 2021', 'listed'), [items[1]]);
  assert.deepEqual(filterInvestmentView(items, 'vehiculo', 'repairing'), [items[2]]);
  assert.deepEqual(filterInvestmentView(items, 'ford', 'sold'), []);
  assert.deepEqual(filterInvestmentView([], '', ''), []);
});
