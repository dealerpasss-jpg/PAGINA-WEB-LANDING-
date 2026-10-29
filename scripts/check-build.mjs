import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

// A structural build check, not a substitute for interactive browser or phone QA.
const root = process.cwd();
const output = path.join(root, '.next/server/app');
assert.ok(existsSync(output), 'Run npm run build first.');
function walk(folder) { return readdirSync(folder, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(folder, entry.name)) : [path.join(folder, entry.name)]); }
const pages = walk(output).filter(file => file.endsWith('.html') && !path.basename(file).startsWith('_'));
const sourceRoutes = walk(path.join(root, 'app')).filter(file => /\/page\.tsx$/.test(file)).map(file => '/' + path.relative(path.join(root, 'app'), path.dirname(file)).split(path.sep).filter(Boolean).join('/'));
const routePatterns = sourceRoutes.map(route => new RegExp('^' + route.replace(/\[[^\]]+\]/g, '[^/]+') + '$'));
const decode = value => value.replaceAll('&amp;', '&').replaceAll('&#x27;', "'").replaceAll('&quot;', '"');
let checkedLinks = 0;
let checkedImages = 0;
const errors = [];
const documents = new Map(pages.map(file => {
  const route = '/' + path.relative(output, file).replace(/\.html$/, '').replace(/^index$/, '');
  const html = readFileSync(file, 'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => decode(match[1]));
  return [route, { html, ids }];
}));
for (const [route, { html, ids }] of documents) {
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) errors.push(`${route}: duplicate element IDs`);
  const h1 = [...html.matchAll(/<h1\b/g)].length;
  if (h1 !== 1) errors.push(`${route}: expected one h1, found ${h1}`);
  for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    const href = decode(match[1]);
    if (!href.startsWith('/') && !href.startsWith('#')) continue;
    const url = new URL(href, `https://dealerpasss.com${route}`);
    if (url.origin !== 'https://dealerpasss.com') continue;
    const pathname = decodeURIComponent(url.pathname).replace(/\/$/, '') || '/';
    const target = documents.get(pathname);
    const publicFile = existsSync(path.join(root, 'public', pathname));
    if (!routePatterns.some(pattern => pattern.test(pathname)) && !publicFile && !pathname.startsWith('/api/')) errors.push(`${route}: missing route ${href}`);
    if (url.hash && target && !target.ids.includes(decodeURIComponent(url.hash.slice(1)))) errors.push(`${route}: missing anchor ${href}`);
    checkedLinks++;
  }
  for (const match of html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)) {
    const src = decode(match[1]);
    const url = new URL(src, 'https://dealerpasss.com');
    const image = url.pathname === '/_next/image' ? url.searchParams.get('url') : url.pathname;
    if (image?.startsWith('/') && !image.startsWith('/_next/') && !existsSync(path.join(root, 'public', image))) errors.push(`${route}: missing image ${image}`);
    checkedImages++;
  }
}
// Initial HTML is usable without motion and must not fetch six unused animation assets.
const film = documents.get('/')?.html.match(/<section\b[^>]*class="film-track"[^>]*>[\s\S]*?<\/section>/)?.[0];
assert.ok(film, 'Homepage must retain the original film hero.');
assert.match(film, /data-static="false"/, 'Eligible hero track geometry must not change during hydration.');
assert.match(film, /<noscript>[\s\S]*<style>[\s\S]*height:auto/, 'No-JS visitors must retain a compact native fallback.');
const filmImages = [...film.matchAll(/<img\b[^>]*\bsrc="(\/brand\/film-[^"]+)"/g)].map(match => match[1]);
assert.deepEqual(filmImages.sort(), ['/brand/film-open.webp', '/brand/film-road.webp'], 'Initial hero must only request the original opening artwork.');
for (const asset of ['road', 'open', 'eighth', 'quarter', 'half', 'three-quarter', 'closed', 'car']) {
  assert.ok(existsSync(path.join(root, 'public/brand', `film-${asset}.webp`)), `Missing original film asset: ${asset}`);
}
// The approved edited brand portrait is not a student testimonial and keeps its full frame.
const academyHome = documents.get('/')?.html.match(/<section\b[^>]*aria-labelledby="academy-home-title"[^>]*>[\s\S]*?<\/section>/)?.[0];
assert.ok(academyHome, 'Homepage must retain its formation section.');
assert.match(academyHome, /academy-brand-scene.webp/, 'Formation must use the specifically approved portrait.');
const portrait = readFileSync(path.join(root, 'public/brand/academy-brand-scene.webp'));
assert.equal(createHash('sha256').update(portrait).digest('hex'), 'e5e28c87be45990670557214b9684bfbdcacb3f5b874fbfd5acc754e5dd6caaf', 'Use the exact reviewed full-frame portrait derivative.');
assert.ok(portrait.length < 250 * 1024, 'Portrait must remain optimized for mobile delivery.');
assert.match(academyHome, /width="1152" height="2048"/, 'Portrait must reserve its original full-frame aspect ratio.');
assert.match(academyHome, /Imagen editada de marca/, 'Edited brand scene must be visibly identified.');
assert.match(academyHome, /editorial-academy.webp/, 'The complementary brand illustration must remain.');
assert.match(academyHome, /Ilustración de marca/, 'Illustration must remain explicitly identified.');
const academyPage = documents.get('/academy')?.html;
assert.match(academyPage, /academy-inspection-scene.webp/, 'Academy must include the approved inspection scene.');
assert.match(academyPage, /width="864" height="1536"/, 'Inspection scene must reserve its full-frame aspect ratio.');
assert.match(academyPage, /Escena ilustrativa generada con IA/, 'Generated scene needs its visible disclosure.');
assert.ok(!documents.get('/planes')?.html.includes('academy-inspection-scene.webp'), 'Inspection image is scoped to Academy, not the shared plans preview.');
const inspection = readFileSync(path.join(root, 'public/brand/academy-inspection-scene.webp'));
assert.equal(createHash('sha256').update(inspection).digest('hex'), 'd3b522ce32b2a34b47e472730262827fb87fbebafe5cb5dd419ee3350ba44660', 'Use the exact reviewed inspection scene derivative.');
assert.ok(inspection.length < 320 * 1024, 'Inspection scene must remain optimized for mobile delivery.');
const menu = documents.get('/')?.html.match(/<dialog\b[^>]*id="mobile-navigation"[^>]*>[\s\S]*?<\/dialog>/)?.[0];
assert.ok(menu, 'Mobile navigation must be a native modal, not a layout-pushing dropdown.');
assert.match(menu, /aria-label="Cerrar menú"/, 'Mobile navigation needs a clearly labeled close action.');
assert.match(menu, /EXPLORAR DEALERPASS/, 'Primary exploration links must remain grouped.');
assert.match(menu, /aria-label="Acceso a tu cuenta"/, 'Account actions must have their own distinct group.');
for (const href of ['/academy', '/vehiculos', '/metodo-margen', '/planes', '/mi-cuenta', '/contacto']) {
  assert.ok(menu.includes(`href="${href}"`), `Mobile navigation lost destination: ${href}`);
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Build structure passed: ${documents.size} static pages, ${checkedLinks} internal links, ${checkedImages} image references. No missing static anchors or duplicate IDs.`);
console.log('Hero fallback passed: only road/open hand in initial HTML; stable eligible geometry and native no-JS fallback; original motion assets available.');
console.log('Not covered: hydration, visual layout, responsive interaction, authenticated data, form delivery, payment or phone/browser QA.');
