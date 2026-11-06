import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatorKeypadEdit, type CalculatorKey } from '../lib/academy/calculator-keypad.ts';
import { parseCalculatorAmount } from '../lib/academy/calculator.ts';
function enter(keys:CalculatorKey[]) { return keys.reduce((value,key)=>calculatorKeypadEdit(value,key).value,''); }
test('keypad enters dollars and exact cents without calculating a result',()=>{
  assert.equal(enter(['1','2','0','0','0']),'12000');
  assert.equal(enter(['decimal','5','0']),'0.50');
  assert.equal(parseCalculatorAmount(enter(['1','2','decimal','3','4'])),1234);
});
test('keypad keeps blank and explicit zero distinct',()=>{
  assert.equal(parseCalculatorAmount(enter([])),null);
  assert.equal(parseCalculatorAmount(enter(['0'])),0);
  assert.equal(enter(['0','clear']),'');
});
test('keypad rejects repeated separators and excess decimals without corrupting raw text',()=>{
  assert.equal(calculatorKeypadEdit('12.34','5').accepted,false);
  assert.equal(calculatorKeypadEdit('12.3','decimal').value,'12.3');
  assert.equal(calculatorKeypadEdit('12,3','4').value,'12,34');
  assert.equal(calculatorKeypadEdit('12,34','decimal').accepted,false);
});
test('keypad respects the existing maximum and raw length',()=>{
  assert.equal(calculatorKeypadEdit('999999999','0').accepted,false);
  assert.equal(calculatorKeypadEdit('999999999.','1').accepted,false);
  assert.equal(calculatorKeypadEdit('000000000000','0').accepted,false);
});
test('keypad replaces a selected range and inserts at the caret',()=>{
  assert.deepEqual(calculatorKeypadEdit('12000','5',{start:1,end:2}),{value:'15000',caret:2,accepted:true});
  assert.deepEqual(calculatorKeypadEdit('12000','3',{start:2,end:2}),{value:'123000',caret:3,accepted:true});
  assert.equal(calculatorKeypadEdit('12000','decimal',{start:0,end:5}).value,'0.');
});
test('backspace erases a selection or the previous character and never invents zero',()=>{
  assert.deepEqual(calculatorKeypadEdit('12000','backspace',{start:1,end:4}),{value:'10',caret:1,accepted:true});
  assert.equal(calculatorKeypadEdit('12.3','backspace').value,'12.');
  assert.equal(calculatorKeypadEdit('1','backspace').value,'');
  assert.equal(calculatorKeypadEdit('','backspace').value,'');
  assert.equal(calculatorKeypadEdit('12','backspace',{start:0,end:0}).value,'12');
});
test('invalid pasted text can be cleared or repaired without silent normalization',()=>{
  assert.equal(calculatorKeypadEdit('1,000','2').accepted,false);
  assert.equal(calculatorKeypadEdit('1,000','backspace').value,'1,00');
  assert.equal(calculatorKeypadEdit('-12','backspace',{start:0,end:1}).value,'12');
  assert.equal(calculatorKeypadEdit('no','clear').value,'');
});

test('tool navigation starts examples at the keypad and Undo restores the exact entry context',async()=>{
  const { calculatorToolNavigation }=await import('../lib/academy/calculator-device.ts');
  const current={step:1,detail:4,editing:true};
  const example=calculatorToolNavigation(current,null,'example',true,true);
  assert.deepEqual(example,{view:{step:0,detail:0,editing:false},undo:current});
  const repeated=calculatorToolNavigation(example.view,example.undo,'example',false,true);
  assert.deepEqual(repeated.undo,current);
  assert.deepEqual(calculatorToolNavigation(repeated.view,repeated.undo,'undo',true,true).view,current);
  const clear=calculatorToolNavigation(current,null,'clear',true,true);
  assert.deepEqual(clear.view,{step:0,detail:0,editing:false});
  assert.deepEqual(calculatorToolNavigation(clear.view,clear.undo,'undo',true,false).view,current);
  assert.equal(calculatorToolNavigation(current,null,'example',true,false).undo,null);
});
