import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatorExample, calculatorScenario, parseCalculatorAmount } from '../lib/academy/calculator.ts';
test('calculator accepts explicit decimal amounts and never silently changes invalid values',()=>{
 assert.equal(parseCalculatorAmount('0'),0);assert.equal(parseCalculatorAmount('12.34'),1234);assert.equal(parseCalculatorAmount('12,34'),1234);
 for(const invalid of ['', ' ', '-500', '1e4', '1,000', '12.000', '12,000', '$500', 'abc', '5.123', 'Infinity', '1000000000']) assert.equal(parseCalculatorAmount(invalid),null);
});
test('calculator preserves the existing budget formula with separate taxes and documents',()=>{
 assert.deepEqual(calculatorScenario(calculatorExample),{sale:1200000,profit:150000,costs:430000,maximum:620000});
});
test('calculator requires every reviewed field and a positive sale estimate',()=>{
 assert.equal(calculatorScenario(Array(8).fill('')),null);assert.equal(calculatorScenario(Array(8).fill('0')),null);assert.equal(calculatorScenario(['10000','0','0','0','0','0','','1500']),null);
 assert.deepEqual(calculatorScenario(['10000','0','0','0','0','0','0','1500']),{sale:1000000,profit:150000,costs:0,maximum:850000});
});
test('calculator keeps negative budgets and exact cents visible',()=>{
 assert.equal(calculatorScenario(['1000','0','0','1200','0','0','0','100'])?.maximum,-30000);
 assert.equal(calculatorScenario(['1.00','0.10','0.20','0','0','0','0','0.30'])?.maximum,40);
});
