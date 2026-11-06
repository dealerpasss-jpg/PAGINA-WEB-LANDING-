import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatorGuide, costIndexes } from '../lib/academy/calculator-guide.ts';
import { calculatorDraftReducer as reduce, emptyCalculatorDraft } from '../lib/academy/calculator-draft.ts';
import { calculatorScenario } from '../lib/academy/calculator.ts';

function quick(sale='12000', costs='4300', profit='1500') {
  let state=emptyCalculatorDraft();
  state=reduce(state,{type:'field',index:0,value:sale});
  state=reduce(state,{type:'cost-total',value:costs});
  state=reduce(state,{type:'cost-reviewed',value:true});
  return reduce(state,{type:'field',index:7,value:profit});
}

test('three-question total and original detailed example have exactly the same calculation',()=>{
  const detailed=reduce(emptyCalculatorDraft(),{type:'example'});
  assert.deepEqual(calculatorGuide(quick()).result,calculatorScenario(detailed.values));
  assert.deepEqual(calculatorGuide(quick()).result,{sale:1200000,profit:150000,costs:430000,maximum:620000});
  assert.deepEqual(calculatorGuide(quick()).ready,[true,true,true]);
});
test('a valid total is not reviewed automatically; editing it removes confirmation',()=>{
  let state=quick();
  state=reduce(state,{type:'cost-total',value:'4300,25'});
  assert.equal(state.costsReviewed,false);
  assert.equal(calculatorGuide(state).costs,430025);
  assert.equal(calculatorGuide(state).result,null);
  state=reduce(state,{type:'cost-reviewed',value:true});
  assert.equal(calculatorGuide(state).result?.maximum,619975);
});
test('unknown and invalid costs never become zero or a final bid, but explicit reviewed zero works',()=>{
  for (const raw of ['', ' ', 'abc', '-5','1,000','1000000000']) {
    assert.equal(calculatorGuide(quick('10000',raw,'1000')).result,null);
  }
  const zero=calculatorGuide(quick('10000','0','1000'));
  assert.equal(zero.result?.costs,0);
  assert.equal(zero.result?.maximum,900000);
  let state=reduce(quick(),{type:'cost-mode',value:'details'});
  assert.equal(calculatorGuide(state).result,null);
  assert.deepEqual(calculatorGuide(state).missingCosts,[...costIndexes]);
  for(const index of costIndexes) state=reduce(state,{type:'field',index,value:'0'});
  assert.equal(calculatorGuide(state).result?.maximum,1050000);
});
test('partial detail subtotal clearly tracks all missing costs without enabling a bid',()=>{
  let state=reduce(quick(),{type:'cost-mode',value:'details'});
  state=reduce(state,{type:'field',index:1,value:'123,45'});
  const guide=calculatorGuide(state);
  assert.equal(guide.knownCosts,12345);
  assert.deepEqual(guide.missingCosts,[2,3,4,5,6]);
  assert.equal(guide.costsComplete,false);
  assert.equal(guide.result,null);
});
test('switching modes keeps raw totals and all detailed values without adding or overwriting either',()=>{
  let state=quick('12000,25','05000,10','0100');
  state=reduce(state,{type:'cost-mode',value:'details'});
  for (const index of costIndexes) state=reduce(state,{type:'field',index,value:String(index*100)});
  assert.equal(calculatorGuide(state).result?.costs,210000);
  state=reduce(state,{type:'cost-mode',value:'total'});
  assert.equal(state.totalCosts,'05000,10');
  assert.equal(state.values[0],'12000,25');
  assert.equal(state.values[7],'0100');
  assert.equal(calculatorGuide(state).result?.costs,500010);
  state=reduce(state,{type:'cost-mode',value:'details'});
  assert.deepEqual(state.values.slice(1,7),['100','200','300','400','500','600']);
  assert.equal(calculatorGuide(state).result?.costs,210000);
});
test('clear/example undo restores exact mode, raw fields, total, review confirmation and bid',()=>{
  const original=reduce(quick('012000,50','04300,25','01500'),{type:'bid',value:'06000,20'});
  for(const action of ['clear','example'] as const) {
    const changed=reduce(original,{type:action});
    const restored=reduce(changed,{type:'undo'});
    for(const key of ['values','bid','totalCosts','costsMode','costsReviewed','example'] as const) assert.deepEqual(restored[key],original[key]);
    assert.deepEqual(calculatorGuide(restored).result,calculatorGuide(original).result);
  }
  for(const action of [{type:'cost-mode',value:'details'},{type:'cost-total',value:'3'},{type:'cost-reviewed',value:true}] as const) {
    const changed=reduce(reduce(original,{type:'clear'}),action);
    assert.equal(changed.undo,null);
    assert.equal(reduce(changed,{type:'undo'}),changed);
  }
});
test('sale must be positive, profit can be zero, negative budgets and cents remain exact',()=>{
  for(const raw of ['0','','-1','1e4','abc']) assert.equal(calculatorGuide(quick(raw)).result,null);
  assert.equal(calculatorGuide(quick('1,00','0,30','0,30')).result?.maximum,40);
  assert.equal(calculatorGuide(quick('1000','1200','100')).result?.maximum,-30000);
  assert.equal(calculatorGuide(quick('1000','200','0')).result?.maximum,80000);
  assert.equal(calculatorGuide(quick('1000','200','')).result,null);
});
test('unselected cost mode never contaminates the selected calculation',()=>{
  let total=quick();
  total=reduce(total,{type:'field',index:1,value:'not a number'});
  assert.equal(calculatorGuide(total).result?.maximum,620000);
  let details=reduce(emptyCalculatorDraft(),{type:'example'});
  details=reduce(details,{type:'cost-total',value:'invalid'});
  assert.equal(calculatorGuide(details).result?.maximum,620000);
});
test('every missing or malformed detailed category blocks the result and unchecked zero is pending',()=>{
  const example=reduce(emptyCalculatorDraft(),{type:'example'});
  for(const index of costIndexes) for(const value of ['',' ','1,000','-1','invalid']) {
    const state=reduce(example,{type:'field',index,value});
    assert.equal(calculatorGuide(state).result,null,`${index}: ${value}`);
    assert.ok(calculatorGuide(state).missingCosts.includes(index));
  }
  const unchecked=reduce(quick('10000','0','0'),{type:'cost-reviewed',value:false});
  assert.equal(calculatorGuide(unchecked).result,null);
  assert.equal(calculatorGuide(unchecked).costsComplete,false);
});
