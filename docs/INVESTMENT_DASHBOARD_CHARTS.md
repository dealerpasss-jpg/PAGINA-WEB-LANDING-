# Administrative overview: financial chart revision

Local review scope requested 2026-10-30 after actual mobile screenshot IMG_8676.

## Presentation
- Compact greeting and no duplicate role/training introduction only on the main admin overview with no selected purchase plan. Other account routes and student/staff pages retain their layout.
- Four compact metrics: active recorded investment (explicitly partial when purchase prices are missing), included active expenses, active cars, sold cars. Mobile uses two columns rather than four oversized full-width cards.
- Purchase-versus-expense donut uses only recorded amounts for active cars. Adjacent visible monetary labels carry every amount; SVG is decorative. Empty/zero totals do not produce a fake filled chart.
- Canonical expense category bars use each amount divided by total active expenses. Unknown future category values are retained under Sin clasificar; historical records are not reinterpreted as mechanical/paint/etc.
- Inventory chart counts current states across all returned cars. Visible category labels/counts, not colors alone. It is not a historical trend or cash flow.
- Recent vehicle comparisons share one zero-origin scale within each car: investment vs asking reference (active) or registered sale (sold). Missing values suppress the comparison, never create zero purchase/profit. Negative results stay negative. Each card identifies its own scale.
- Registered sales and realized results remain separate from estimated profits, and never claim collections or cash on hand. Contributions remain excluded.
- Gallery hint on a provisional photo moves to the top, preserving its existing bottom-left provenance label. Image bytes unchanged.

## Privacy / behavior
- Exact admin gate and server-only loader unchanged. One additional column, category, in the existing admin-only active expense SELECT. No new tables, functions, migrations, grants, cookies, auth calls, membership linking or writes.
- No chart dependency, client chart hydration or number animation. Native details permits keyboard-readable category disclosure. Every visual has adjacent textual data, reduced-transparency and forced-colors fallbacks.
- Existing money/portfolio semantics unchanged. AccountShell adds a presentation-only overview class. No financial records altered.

## Verification
- Pure cases: active/sold separation; orphan expenses excluded; missing purchases; canonical/unknown categories; category/purchase/expense reconciliation; zero, missing and loss comparison scales.
- Real components rendered in tests: hidden/error/empty vs ready, labels, complete/missing comparisons, negative results, no fictional timeline. Server mocks assert exact admin role and allowlisted SELECTs.
- Full verify must pass exact final tree before publication.
- Actual new chart layout has NOT been browser-verified yet. Existing production's data semantics/admin state and desktop/mobile layout were verified before this revision. No new UI screenshot or physical-phone claim is made. Preview access remains separately constrained; no auth bypass/test fixture published.
- Export/production not authorized for this new revision yet. Previous production is cffeae1d19106da48aeb8c890ceded75effe045d.
