# Sales periods and vehicle status — 2026-10-31

## Meaning
- Only `status='sold'` is a realized sale. Asking prices, active cars, partner contributions and repayments never enter period sales.
- Explicit `sold_on DATE` controls attribution. No use of purchase date, creation/audit timestamp, guessed date or automatic backfill.
- Week = Monday–Sunday; month = calendar month. Current date uses `America/New_York` (Tampa). Calendar arithmetic uses date-only UTC representations, avoiding DST day shifts.
- Revenue = registered closing prices, not received cash. Result = sale minus purchase and **all current non-voided expenses of that car**, irrespective of expense date. Later corrections can revise historical results; this is not an immutable accounting ledger or bank balance.
- Unknown purchase/sale stays incomplete. Known subtotal, pending count and undated/future exclusions are visible. Incomplete daily graph points are omitted, never fabricated as zero. Negative results and explicit zeros remain valid.
- Main admin-only server summary uses existing exact role gate. Native GET week/month, previous/next, date picker and accessible daily table; no client chart library or private data sent to public routes.

## Additive migration and release order
The migration scaffold was created with Supabase CLI `migration new investment_sale_dates` (pinned temporary CLI; no repo dependency change).
1. Apply reviewed additive migration before releasing source that selects `sold_on`.
2. Verify nullable date/no default, three constraints, unchanged RLS/column grants and recorded migration.
3. Export exact tested source tree and deploy; verify exact production alias, admin read-only week/month/filter and public regression.
4. No live sale/expense fixtures or financial writes during QA.

SQL adds one nullable column and constraints: only sold rows may have a date; closing cannot precede known purchase; calendar range0001–9999. It changes no existing field values and has no DML, defaults, backfill, policies, grants or new triggers. Existing audit trigger naturally records later authorized edits. Future-date validation is at the action boundary (not a time-dependent SQL CHECK); future records from other sources are excluded/flagged.

Existing sold/null records can be edited without an invented date. Newly marking sold requires a real date and price. An existing confirmed date cannot be silently erased while sold. Reopening requires explicitly clearing date and price. Existing optimistic version check still protects writes; a fresh read of status/date/version is made only after admin authorization. Actual mutations continue through the authenticated RLS client, not the service client.

Old application remains compatible immediately after the additive migration. Roll back application to53832f0f if necessary; keep the column and any later confirmed dates rather than dropping financial metadata. If an old application tries to reopen a newly dated sale without clearing its date, the new constraint safely rejects that change.

## Status presentation
All four existing states retain original meanings: Comprado (blue car), En reparación (orange wrench), En venta (green tag), Vendido (violet check). Text remains visible and SVGs decorative. Same component on main cards/legend, investment cards/pipeline and detail; stack chart colors match. No new states or record reclassification.

## Verification
Pure calendar/totals tests: DST midnight, leap year, week/year crossings, early years, future/invalid dates, unknown values, losses, zero, period reconciliation and all-cost attribution. Mocked real actions: new closure required date, legacy undated, optimistic conflict, no unauthorized reads/writes, reopening explicit clears. Actual JSX SSR tests verify labels, daily table, no fake graph for empty data and icon semantics. Full verify and independent source review required before release. Authenticated date-form submission is not tested on live data.
