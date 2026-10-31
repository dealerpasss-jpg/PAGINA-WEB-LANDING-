# Inventory → public catalogue connection

## Phase 1 — local implementation; publication approval pending
Connect **only the eight already approved public listings**, by exact private UUID in a server-only manifest. Recovered baseline matches live `61988b72` / tree `fefc931f5eb2a5d428120f2eb49746cce4b69e18`; the cash prototype is not part of this worktree.

- Current `asking_cents` is the public reference/advertised price. Never use purchase, expenses or the actual negotiated closing price. A missing/invalid price stays unknown; never substitute zero or an old static price.
- `purchased`/`repairing`: **Próximamente · No disponible**. Photos/details remain discoverable with a “Ver adelanto” action, without implying a completion date or accepting a purchase/reservation.
- `listed`: **Disponible** when the current asking price is valid.
- `sold`: **Vendido**, no asking/closing price and no sale/contact CTA; retain the historical URL and photos, with a link to explore other vehicles.
- Missing/mismatched/duplicate source, unknown state or failed read: **Disponibilidad por confirmar**, no current price or sale CTA. Do not fall back to a stale available car.

## Privacy/publication boundary
The manifest is server-only and explicitly enables each existing slug and selects/reorders only its already approved `/vehicles/` photos. It never draws from private photo uploads. Creating a private vehicle, adding photos or changing a title does not publish new content. Public titles/specs/captions/descriptions remain their approved editorial source. The Elantra paint visualization retains its mark and edited-image disclosure; its caption no longer asserts a forever-current repair state.

Server query selects only `id,catalogue_slug,status,asking_cents` for exact allowlisted IDs. The fresh public DTO contains only slug/title/specs/description/body style/approved photos/photo notice/original-photo flag plus availability and current asking price. No raw row spread, private UUID, VIN, notes, purchased/sold amount, expenses, participant or signed/private media URL is serialized. No credential or privileged client is imported into a client component. No database write, migration, grant, policy or bucket change is needed for phase 1.

The public API GET `/api/catalogue` returns only these DTOs with no-store headers. Server-rendered detail/list/metadata are request-time and fail closed. Home keeps its original static hero/photos; only the inventory block hydrates current public data, initially displaying unverified state rather than a stale price. Visible pages refresh on focus/pageshow and at most every 60 seconds, with an 8-second client timeout and cleanup. This is periodic freshness, **not an instantaneous realtime guarantee**. Errors remove previous available states/prices. Gallery and search state are not reset by status refresh. Successful vehicle edits invalidate home/catalogue pages; no financial mutation contract changes.

## Phase 2 — NOT implemented or activated
To publish/hide and select new photos from the dashboard requires persistent settings and an approval boundary, not a fake toggle:
1. An admin-only publication record (unique vehicle/slug, enabled flag, version, approved public copy, ordered selected photos/cover). Stable existing URLs; optimistic writes and authenticated actor audit.
2. Explicit review/confirmation that chosen pictures and public fields may be disclosed. New uploads stay private by default. Public derivatives must be allowlisted, metadata-safe and distinct from private storage. Do not open the existing private bucket.
3. A fresh, limited public projection/read path and public-media delivery that checks current publication; define revocation/caching behavior before implementation. Hiding removes it from home/search/related/direct URLs, but cannot retract copies already viewed/downloaded.
4. Seed only approved existing listings using verified IDs; no fuzzy title matching, no duplicate financial records or automatic publishing of historical private data.
5. Independent SQL/RLS/storage/concurrency review and isolated tests before applying any new schema/permission changes. The current environment cannot yet install/run PostgreSQL: prior authorized setup was blocked before execution by sandbox infrastructure. Do not substitute production tests or claim these gates passed.

Exact cloud schema/media/RPC scope and GitHub/production publication need separate approval. Phase 1 does not expose an admin Publish/Hide or photo-picker UI and must not be described as delivering those controls.

## Verification plan
- Pure projection: repair→listed→sold→repair, unknown/null/zero/invalid price, failed/missing/duplicate/mismatched source, explicit hide, unapproved/reordered photos, no newly added private car exposure.
- Data contracts: serialized DTO denylist; strict SELECT; server-only manifest; dynamic metadata and all display surfaces use same source; network failure degrades rather than retaining availability.
- UI/source: text+SVG state indicators, accessible color contrast/forced colors, sold/nonavailable CTA rules; unchanged gallery and URL filter behavior.
- Release gates: full lint/test/typecheck/build, independent review, then actual approved deployment browser QA on desktop/narrow widths. No live financial edits for QA. State transition coverage uses synthetic isolated tests unless owner explicitly changes a real state for their own business.

## Coming-soon visual refinement — local, release approval pending
Only `coming-soon` cards get the dedicated charcoal/orange preview header, warm framed photograph and “Ver adelanto” action. Home reuses the same card component as the catalogue and related listings rather than a different label-only teaser. Visible copy still says it is not available to buy. No preorder, reservation, date, scarcity, waiting list or financial claim is introduced. Available/sold/unverified cards retain their previous treatment; transitions use the existing projection unchanged. The approved image itself is untouched, rendered without zoom/filter/crop and the provisional-image note stays visible. Motion, transparency and forced-color preferences remain supported.
