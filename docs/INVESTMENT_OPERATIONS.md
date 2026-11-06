# Investment operations — first usability batch

## Scope
- Summary keeps its financial metrics, estimated/realized distinction and collapsed week/month report. The new collapsed work queue lists only missing purchase/reference/closing price/closing date fields from actual records. Explicit zero is complete. Missing expense entries are not inferred.
- Inventory defaults to photo cards at every width. A labelled Tarjetas con fotos / Tabla toggle lets every authorized viewer choose either layout on PC or phone. The table scrolls inside its own keyboard-accessible region on small screens; resizing never changes the selected view. Known public catalogue facts and existing photo notices accompany cards, with no invented technical data. Search, status, pending-field filter and ordering are URL state; only bounded/allowlisted context is carried to details and the return link. Totals above the inventory are unchanged by filtering. Context is retained when opening, returning and after a successful save. Submission reads current URL state; the server independently allows only bounded search/status/pending/sort/view fields and always redirects to the existing local vehicle destination. Errors preserve the draft without redirecting.
- Unknown costs/results/purchase dates sort after known values, including zero and losses. Purchase age uses `purchased_on`, never record creation. Default registration order remains the server order.
- Detail actions reveal existing sections and focus the requested field/section. They do not save or change data. The expense entry is before the expense history. Closing still uses the existing state, amount/date rules and optimistic version check.
- `asking_cents` is labelled an internal reference, not a guaranteed published catalogue price. Public listing is independent.

## Data/privacy boundary
No migration, schema, permissions, auth or financial arithmetic changes. The server action changes only the success redirect query, never mutation values, authorization, validation, optimistic locking or audit behavior. Only the existing verified-admin server branch serializes financial inventory props. Non-admin payloads retain title/status/photo/id and known public catalogue facts/photo notice only. No notes, participant email or financial records are added to public assets. Detail links disable speculative prefetch; actual route identity behavior remains unchanged.

The isolated public Elantra correction to USD7,500 is incorporated unchanged, including its metadata and regression test. The operations bundle must not restore the previous public price.

## Verification
Pure tests cover missing vs zero, sales-only closing requirements, immutable sorting including losses/nulls, query bounds/encoding, synchronous rapid typing/history cleanup, and allowlisted section focus/reveal without value changes. SSR tests exercise the real table/cards and non-admin display. Action/client-form tests cover safe save-and-return context, malicious destinations, validation failures, current browser query and untouched raw form values. Full verify includes the existing financial/action/RBAC regressions and calculator mobile-byte-identity test.

Runtime QA still required after an approved accessible deployment:
1. On authenticated admin summary, expand queue and follow each available field. Correct existing details should open, focus should clear the header, and no fields should be changed.
2. Inventory: rapid typing/paste, status+pending+sort combination, detail and Back/Forward/return link restore context. The selected view is stored as allowlisted URL state (`vista=table`, default cards), follows detail links and successful saves, and is not lost when resetting filters. Clear resets only list controls and restores focus to the search input, including from the zero-results state. No-data results are distinct from a load error.
3. Wide PC table and narrow cards: long title, large amounts, negative result and pending amounts remain readable; table keyboard navigation has visible focus.
4. Detail: navigate among summary, purchase/closing, expenses, photos and participants. Expand add-expense while preserving an unsaved draft; do not submit live records for QA.
5. Physical-phone/touch and live role-specific behavior are not established by source/build tests. Do not claim these from local verification.
