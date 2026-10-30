import { calculatorExample } from './calculator.ts';

type Snapshot = { values: string[]; bid: string; example: boolean; costsMode: 'total' | 'details'; totalCosts: string; costsReviewed: boolean };
export type CalculatorDraft = Snapshot & { undo: Snapshot | null; notice: 'cleared' | 'example' | 'restored' | null };
export type CalculatorDraftAction = { type: 'field'; index: number; value: string } | { type: 'bid' | 'cost-total'; value: string } | { type: 'cost-mode'; value: 'total' | 'details' } | { type: 'cost-reviewed'; value: boolean } | { type: 'clear' | 'example' | 'undo' };
export function emptyCalculatorDraft(): CalculatorDraft {
  return { values: Array(8).fill(''), bid: '', example: false, costsMode: 'total', totalCosts: '', costsReviewed: false, undo: null, notice: null };
}
export function hasCalculatorInput(draft: Snapshot) {
  return draft.values.some(value => value !== '') || draft.bid !== '' || draft.totalCosts !== '' || draft.costsReviewed;
}
export function calculatorDraftReducer(state: CalculatorDraft, action: CalculatorDraftAction): CalculatorDraft {
  if (action.type === 'field') return { ...state, values: state.values.map((value, index) => index === action.index ? action.value : value), undo: null, notice: null };
  if (action.type === 'bid') return { ...state, bid: action.value, undo: null, notice: null };
  if (action.type === 'cost-total') return { ...state, totalCosts: action.value, costsReviewed: false, undo: null, notice: null };
  if (action.type === 'cost-mode') return { ...state, costsMode: action.value, undo: null, notice: null };
  if (action.type === 'cost-reviewed') return { ...state, costsReviewed: action.value, undo: null, notice: null };
  if (action.type === 'undo') return state.undo ? { ...state.undo, values: [...state.undo.values], undo: null, notice: 'restored' } : state;
  if (action.type === 'clear' && !hasCalculatorInput(state)) return state;
  if (action.type === 'example' && state.example && state.costsMode === 'details' && state.totalCosts === '' && !state.costsReviewed && state.bid === '' && state.values.every((value, index) => value === calculatorExample[index])) return state;
  const undo = hasCalculatorInput(state) ? { values: [...state.values], bid: state.bid, example: state.example, costsMode: state.costsMode, totalCosts: state.totalCosts, costsReviewed: state.costsReviewed } : null;
  return action.type === 'clear'
    ? { ...emptyCalculatorDraft(), undo, notice: 'cleared' }
    : { values: [...calculatorExample], bid: '', example: true, costsMode: 'details', totalCosts: '', costsReviewed: false, undo, notice: 'example' };
}
