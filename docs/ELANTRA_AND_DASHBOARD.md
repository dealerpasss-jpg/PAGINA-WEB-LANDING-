# Approved Elantra publication and live investment summary

## Public catalogue
- One new static listing: `/vehiculos/hyundai-elantra-eco-2018`.
- Asking price USD8,200; 2018 ECO, white, 104,609 miles, sedan. Exact transmission specification is not confirmed and is omitted, not guessed.
- Clean title / engine, transmission and AC condition are attributed to the owner's report, not independent inspection. Vehicle remains in painting. No assertion of finished actual paintwork.
- Exactly one approved edited image, labelled “Visualización de pintura”. Separate readable notice: “Foto provisional: visualización de pintura. Fotos actualizadas próximamente.” No hidden implication of original additional photos. The single-image gallery omits irrelevant previous/next/thumbnail controls; enlarge/close remains.
- Full 1448×1086 derivative, no crop or watermark removal. Source `exec-711429e9-5066-4bc7-87e0-42e163afa87b.png`, SHA256 `838b8222458e9c9fa4bf226de29620924f76997d9d7b54070f5d718579e59c80`; WebP `438c2d9799b07658b42cc8da3bd4d736c66c8dee89f5c345f69476e3fde2c86b`,202702bytes. Cover badge moves away from embedded lower-left label, zoom disabled on this provisional cover.
- No purchase, dealer/auction expenses, financial notes, private record ID or VIN exported in this listing. The existing financial record is not duplicated or changed. `catalogue_slug` is not written: current application has no supported admin editing action for that association.

## Main dashboard
The existing verified server identity is reused. Only exact admin role loads or renders private investment data; staff/student/unknown roles return hidden before creating the privileged client. No `investmentIdentity` call, membership linking, new auth flow, policy, grant or migration.

Two read-only paginated queries fetch minimal investment vehicle fields and active expenses. Integer-cent totals and the existing phase1 portfolio semantics are reused: active vs sold, partial known cost if purchase missing, closing prices not cash collections, realized vs estimated result. Recent cards show the four newest registrations while summary totals use all rows. No fixtures, fake charts or hardcoded financial metrics. Errors render unavailable rather than zero, and successful empty state is distinct. Existing investment mutations invalidate `/mi-cuenta` after success, alongside the investment layout.

Tests execute real loader/actions with isolated mocks and real rendered components with synthetic local values. Full verification and independent source review precede export. Live main-route read QA may use the existing administrator session with no financial form submission; investment detail navigation remains separate because its legacy identity helper can claim pending memberships. No live test records or incidental finance updates are authorized by this implementation.
