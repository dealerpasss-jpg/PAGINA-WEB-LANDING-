# Inversiones — recorded vehicle economics (phase 1)

## Scope
Schema-free UI/action revision. No financial rows, auth/session, credentials, grants, RLS, migrations or storage changes. Existing purchase/expense/sale fields remain the source of truth. Existing integer-cent USD parser and per-car arithmetic are unchanged.

- Active cars exclude sold cars; sold count is stated separately.
- Active investment uses known purchase plus non-annulled expenses. If a purchase is missing, its known expenses contribute only to an explicitly labelled partial subtotal.
- Registered sales are the stored closing prices for sold cars, **not money received**.
- Realized recorded result is closing price minus purchase minus active expenses. Unknown purchases/closing prices are excluded from the known-result subtotal and counted as pending. Estimated unsold gains do not enter realized results.
- All results exclude unregistered expenses. Participant contributions/returns are neither revenue nor profit, and their difference is not asserted to be an enforceable balance.
- Grouped car form retains one submit, exact existing field names/defaults/version lock. Purchase, extra expenses and sale are explained without double counting.
- Annul/revoke retains audit rows and requires a confirmed UI action. Updates filter by record ID, vehicle ID and currently-active null timestamp, returning only ID. Zero/mismatched/multiple returned rows are errors, not success; no revalidation/redirect on failure. Authorization still runs first with existing identity helper.

## Verification boundary
Tests execute real server-action code with strictly isolated query doubles, not live Supabase. Presentation tests use real components and synthetic local values, not a public fixture route or an auth bypass. No authenticated route entry during QA because investmentIdentity may assign a membership/user ID as a side effect. Live save/reload persistence, role separation in browser and phone UI still need a separately authorized test scenario/session.

Supabase metadata was reviewed read-only by the independent auditor: hardening migration present, five investment tables have RLS enabled, expense select admin-only, sensitive cost/notes/provider columns unavailable to anon/authenticated column selects. This is not end-to-end role verification. No security change is needed for phase1.

## Phase 2 — proposal only; requires schema and test-plan approval
A full cash ledger needs a separate durable transaction model, not more labels over closing-price fields:
1. Distinguish sale agreement/closing date from individual customer receipts (date, cents, method, reference), reversals and refunds. Calculate collected and outstanding amounts from entries; define overpayments and refunds explicitly.
2. Track vendor expenses and payments separately if unpaid bills/payables are required. Avoid treating recorded cost as paid cash.
3. Store participant cash contributions/returns as immutable entries; maintain allocation agreements separately from distributions. Decide who can view each record.
4. Add persistent unique idempotency keys/transactional operations for create/expense/receipt writes, with audited correction/reversal semantics. Current disabled buttons cannot guarantee network-retry deduplication.
5. Attach receipts privately with scoped authorization, size/type rules, retention and audit policy. Never upload financial documents to the public vehicle catalogue.
6. Specify cent precision/currency, opening balances, reconciliation and export requirements; approve schema/RLS migration, rollback and isolated test project before any application to live data.

No phase2 migration, live fixture, cash ledger or collection tracking has been implemented or claimed complete.

## Source references
- Supabase update return rows: https://supabase.com/docs/reference/javascript/update
- Next installed16.4.2 documentation: app guides forms/server-actions.
