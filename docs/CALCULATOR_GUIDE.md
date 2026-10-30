# DealerPass Calc

## Scope and math

Shared public `/metodo-margen` and authorized workspace component. No auth, plans, payment, account data or persistence changes. Original `calculator.ts`, `purchaseBudget`, guide adapter and draft reducer are unchanged.

Three main questions: realistic resale estimate → additional expenses → target profit. The final answer is the maximum **hammer bid**, not a predicted sale price or guaranteed gain. The aggregate cost shortcut requires explicit confirmation of applicable auction/dealer, transport, repairs, tax, documents and contingency; it excludes vehicle purchase price and profit. Optional detail mode asks each of six costs on the same display/keypad. Blank/invalid stays pending, never zero. Switching modes preserves independent raw drafts and cannot double-count; modifying the total resets confirmation.

## Device interaction

The device is named **DealerPass Calc** in plain text. It does not create a new DP symbol or replace the site's official DealerPass logo.

One compact device: question/amount display, integrated0–9/decimal/backspace keypad, C for current amount, and Siguiente. No persistent result sidebar or final price while entering values, even when the underlying fields are complete. Only the final action mounts the result receipt; incomplete costs show a pending state without a bid. The optional offer evaluator reuses the keypad and cannot alter scenario fields.

The display remains an accessible editable text input with decimal inputMode and native keyboard/paste/selection support. Keypad edits preserve the logical caret/selection and synchronize input selection without focusing it or opening a phone keyboard. Key handling is scoped to the active form, not the document. Digits/backspace work from within that form; Enter on the display/question advances; buttons, checkboxes, links and summaries keep native activation. There is no operation submission, navigation or network call.

Keypad rejects duplicate separators, more than2decimal places, overlong/raw or out-of-range amounts. Native pasted invalid text is retained for correction and cannot advance. Decimal comma/point and exact-cent parser remain unchanged. C clears only the active entry; Borrar todo clears all values and offers Undo. Example begins at question1 with illustrative values (not an instant price). Undo restores raw values, mode/review/bid and the previous step/detail/editing context; later edits invalidate stale Undo.

Explicit question/result navigation uses focus preventScroll then instant scrollIntoView(start), with110px scoped heading margin to clear sticky navigation. No autofocus on initial mount or digit input. Reduced-motion/transparency and forced-color fallbacks are scoped. Key targets are at least44px, keypad50–57px, Next54–56px.

## Result

A receipt replaces the keypad only at the end: maximum bid, editable sale/cost/profit rows, investment at maximum, optional formula and alternate offer. A zero/negative budget says no margin rather than presenting a usable bid. Unknown expenses never unlock a final answer. Reminders require actual applicable fee amounts and checking the fee for the resulting bid range. No invented rates or presets. Values are not saved on leaving/reloading.

## Verification limits

Unit tests cover core math parity, invalid/blank/zero, mode isolation, Undo, keypad selection/decimal/bounds and UI tool restoration. Actual component SSR confirms a single input/keypad and no premature result DOM. Full aggregate checks and actual preview/browser outcomes are recorded separately in the release checkpoint; source tests do not imply browser/phone/authenticated visual verification.
