# Workspace visual layer

The internal workspace uses a light neutral canvas with a slow, soft DealerPass orange atmosphere. This layer is intentionally separate from public-page styling and account/business logic.

- `app/workspace-tech.css` follows the structural workspace stylesheet and precedes the approved shared button system.
- `WorkspaceAtmosphere` is decorative, `aria-hidden`, pointer-transparent and mounted only inside the existing private-page frame. It reads document visibility only, not account/session data.
- One bounded gradient moves with a 48-second transform-only animation. It pauses in hidden tabs. Reduced motion freezes it; reduced transparency and forced colors remove it.
- Readable opaque surfaces are the baseline. Supported browsers add selective glass to the first metric and team welcome panel, with pale translucent backgrounds on other cards. Inputs remain opaque.
- Existing dashboard content, metrics, routes, permissions, forms, calculations and the five-item mobile navigation remain unchanged.
- The original public hero, approved buttons/menu and marked brand photo assets remain unchanged.

## Profile composition

`ProfileEditor` is presentation-only: one existing `/api/profile` POST form, with the same hidden return destination, personal/contact inputs, required learning preferences and optional promotion checkboxes. The existing identity guard and server validation are unchanged. Two balanced desktop panels use the workspace width; at1100px and below they become one column. A shared save row follows both groups. Registration retains the original620px form and the default `ProfileFields` output, including unchecked-by-default consent.

The orange atmosphere has a more concentrated upper-right bloom and a softer second warm lobe, rather than a uniform wash. Inputs remain opaque. The configuration-empty state uses a compact real panel, not fabricated dashboard metrics or an authentication bypass.

## Verification

Run `npm run verify`. `tests/workspace-tech.test.ts` checks private scope/import order, decorative animation restrictions, fallback preferences and preservation of mobile layout constraints. `tests/profile-layout.test.ts` renders the actual presentation components with local synthetic values to verify the POST/field contract, required fields, selected values and explicit opt-in behavior; this is not authenticated browser QA.

Actual authenticated browser QA is a separate step: use an existing authorized account through the supported secure browser authentication flow. No demo route, authentication shortcut or public test fixture is shipped. A local static component fixture is not evidence that account access or live data flows were tested.
