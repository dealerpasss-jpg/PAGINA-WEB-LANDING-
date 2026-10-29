import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatorDraftReducer as reduce, emptyCalculatorDraft, hasCalculatorInput } from '../lib/academy/calculator-draft.ts';

test('clear is a no-op on a blank calculator', () => {
  const blank = emptyCalculatorDraft();
  assert.equal(hasCalculatorInput(blank), false);
  assert.equal(reduce(blank, { type: 'clear' }), blank);
});
test('clear can restore exact raw strings and the proposed bid', () => {
  let state = reduce(emptyCalculatorDraft(), { type: 'field', index: 0, value: '12000,25' });
  state = reduce(state, { type: 'field', index: 7, value: '0100' });
  state = reduce(state, { type: 'bid', value: '2500.20' });
  const previous = state;
  state = reduce(state, { type: 'clear' });
  assert.equal(hasCalculatorInput(state), false);
  state = reduce(state, { type: 'undo' });
  assert.deepEqual(state.values, previous.values);
  assert.equal(state.bid, previous.bid);
  assert.equal(state.undo, null);
  assert.equal(state.notice, 'restored');
});
test('an illustrative example can be undone without changing the previous scenario', () => {
  const typed = reduce(emptyCalculatorDraft(), { type: 'field', index: 0, value: '9500' });
  const example = reduce(typed, { type: 'example' });
  assert.equal(example.example, true);
  assert.equal(example.bid, '');
  assert.equal(reduce(example, { type: 'example' }), example);
  const restored = reduce(example, { type: 'undo' });
  assert.deepEqual(restored.values, typed.values);
  assert.equal(restored.example, false);
});
test('later edits invalidate undo so newer work cannot be overwritten', () => {
  const populated = reduce(emptyCalculatorDraft(), { type: 'example' });
  const cleared = reduce(populated, { type: 'clear' });
  for (const edited of [reduce(cleared, { type: 'field', index: 1, value: '12' }), reduce(cleared, { type: 'bid', value: '55' })]) {
    assert.equal(edited.undo, null);
    assert.equal(reduce(edited, { type: 'undo' }), edited);
  }
});
test('a repeated clear preserves its existing undo snapshot', () => {
  const populated = reduce(emptyCalculatorDraft(), { type: 'example' });
  const cleared = reduce(populated, { type: 'clear' });
  assert.equal(reduce(cleared, { type: 'clear' }), cleared);
  assert.equal(reduce(cleared, { type: 'undo' }).example, true);
});
