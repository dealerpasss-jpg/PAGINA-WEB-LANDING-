# Guided purchase calculator

## Scope

Shared public `/metodo-margen` and authorized workspace calculator presentation. No change to authentication, plans, payments, data storage or account writes. The original `calculator.ts` parser and `calculatorScenario`/`purchaseBudget` functions are unchanged.

## Fast path

Three questions: realistic resale estimate → additional operating costs → desired profit. The result is the maximum **hammer bid for the vehicle**, not a sale-price prediction. A single additional-cost total requires an explicit confirmation that applicable auction/dealer fees, transport, repairs, taxes, documents and contingency are included. It excludes the vehicle price and target profit.

The optional detailed mode uses the existing six cost fields. Each must contain a valid explicit amount, including zero only when known/not applicable. Blank or invalid is pending, never assumed zero. The displayed partial subtotal labels missing costs and cannot unlock a final bid. Unknown costs can be left pending while continuing to the objective and review.

Total and detailed drafts are independent: switching never overwrites manual totals, adds both modes, or copies incomplete sums. Editing the total invalidates its confirmation. The aggregate adapter sends the one explicit reviewed total through the existing exact-cent calculation; internal zero placeholders are not represented as confirmed individual categories.

## Interaction

Native form Enter validates the current question and advances without navigation. Back, step navigation and review edits retain raw input strings. Headings receive focus after navigation; mobile review brings the result above editing controls and offers a direct focus action back to them. No input auto-focus on initial mount. Decimal mobile keyboard, comma/point decimal support, no thousand separators; validation errors remain visible. Example and Clear keep one-step Undo for raw detailed fields, total, mode, review checkbox and optional bid. Further edits invalidate Undo. Example remains labeled illustrative.

No persistence added: the UI states values are lost on reload/leave. Optional offer evaluation remains available; no final evaluation with incomplete inputs. Negative/zero maximum is not presented as a usable bid. Fee amounts must be rechecked for the resulting bid range. No invented fee presets, rates or guaranteed profit.

## Verification

Regression tests cover original/aggregate parity, unknown vs explicit zero, review confirmation invalidation, mode isolation, exact raw Undo, malformed inputs, negative budgets and cents. Actual component SSR checks initial one-question semantics. Full build and browser interaction checks are recorded in the release checkpoint, not inferred from these unit tests. Real-phone and authenticated workspace rendering require separate QA.

## Sticky-header focus correction

Public browser QA found that native `focus()` could put the mobile result amount behind the sticky header. Explicit step/review navigation now focuses without automatic scrolling, then reveals the heading at the start of the viewport with a scoped 110px scroll margin. Scrolling is instant (no motion added), initial mount does not scroll, and typing does not trigger navigation. The same helper is used by “Editar mis valores”. Math, values, layout and permissions are unchanged.
