export type CalculatorView = { step: number; detail: number; editing: boolean };

/** Example starts the keypad journey; Undo restores where the user was entering data. */
export function calculatorToolNavigation(view: CalculatorView, undo: CalculatorView | null, type: 'example' | 'clear' | 'undo', changesDraft: boolean, hasInput: boolean) {
  if (type === 'undo') return { view: undo ?? view, undo: null };
  return {
    view: { step: 0, detail: 0, editing: false },
    undo: changesDraft ? hasInput ? { ...view } : null : undo,
  };
}
