# Expense shortcuts — schema-free entry UI

## What changes
The administrator's per-car “Añadir gasto o reparación” form now has native radio tiles with decorative SVG icons. Choose a concept, enter the USD amount and calendar date, then explicitly save. No option or amount is preselected. “Usar hoy” is an explicit client-local date action; there is no UTC-derived automatic date. “Otro” requires a custom concept. Other concepts accept optional detail, retained separately when switching selections. Amount/date inputs remain mounted and preserve entries. The existing form keeps inputs after a failed save and disables them while pending.

## Storage compatibility
No schema, RLS, auth, audit, financial-record or arithmetic changes. Existing five stored categories and all historical descriptions remain untouched. New shortcuts are validated and mapped on the server, not trusted from a hidden category input:

| Shortcut | Stored group | Stored description |
| --- | --- | --- |
| Reparación mecánica | repair | Reparación mecánica + optional detail |
| Compra de repuestos | repair | Compra de repuestos + optional detail |
| Pintura | repair | Pintura + optional detail |
| Lavado | other | Lavado + optional detail |
| Cargo de dealer | other | Cargo de dealer + optional detail |
| Transporte | transport | Transporte + optional detail |
| Cargos de subasta | auction | Cargos de subasta + optional detail |
| Título y documentos | title | Título y documentos + optional detail |
| Otro | other | Required custom concept |

The UI explicitly names the broad summary group for the chosen concept. It does not pretend that old “repair” records are mechanical rather than paint, or that old “other” records are dealer/wash expenses. Summary totals continue using the unchanged broad categories. Narrow subtype reporting would require an explicit structured-data design, not inference from historical free text.

Previously opened forms without the new preset field retain the existing allowlisted category + required description path. An unknown or prototype-key preset fails; it never falls back to legacy. Server descriptions are bounded to 500 characters including the selected concept prefix, with no silent truncation. Existing integer-cent USD and strict calendar validators, admin check, authenticated insert and audit mechanism remain unchanged.

## Verification boundary
Unit tests cover canonical mappings, custom/unknown/blank concepts, max-length prefixes, legacy compatibility, amount/date validation and server insert payloads using an isolated query double. Real component SSR/hook tests cover native radio fields, one explicit submit, decorative icons and per-concept draft retention. Full repository verification is required before release. Tests do not write live financial records or create a public fixture. Authenticated browser layout, actual device keyboard and save/reload persistence are not established by these local tests. No code export or production publication is implied by implementing this revision.
