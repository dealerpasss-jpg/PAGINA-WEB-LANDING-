import { calculatorExample } from './calculator.ts';

type Snapshot = { values: string[]; bid: string; example: boolean };
export type CalculatorDraft = Snapshot & { undo: Snapshot | null; notice: 'cleared' | 'example' | 'restored' | null };
export type CalculatorDraftAction = { type: 'field'; index: number; value: string } | { type: 'bid'; value: string } | { type: 'clear' | 'example' | 'undo' };
export function emptyCalculatorDraft(): CalculatorDraft {
  return { values: Array(8).fill(''), bid: '', example: false, undo: null, notice: null };
}
export function hasCalculatorInput(draft: Snapshot) {
  return draft.values.some(value => value !== '') || draft.bid !== '';
}
export function calculatorDraftReducer(state: CalculatorDraft, action: CalculatorDraftAction): CalculatorDraft {
  if (action.type === 'field') return { ...state, values: state.values.map((value, index) => index === action.index ? action.value : value), undo: null, notice: null };
  if (action.type === 'bid') return { ...state, bid: action.value, undo: null, notice: null };
  if (action.type === 'undo') return state.undo ? { ...state.undo, values: [...state.undo.values], undo: null, notice: 'restored' } : state;
  if (action.type === 'clear' && !hasCalculatorInput(state)) return state;
  if (action.type === 'example' && state.example && state.bid === '' && state.values.every((value, index) => value === calculatorExample[index])) return state;
  const undo = hasCalculatorInput(state) ? { values: [...state.values], bid: state.bid, example: state.example } : null;
  return action.type === 'clear'
    ? { ...emptyCalculatorDraft(), undo, notice: 'cleared' }
    : { values: [...calculatorExample], bid: '', example: true, undo, notice: 'example' };
}
