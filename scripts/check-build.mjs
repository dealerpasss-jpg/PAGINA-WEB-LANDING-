import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

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
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Build structure passed: ${documents.size} static pages, ${checkedLinks} internal links, ${checkedImages} image references. No missing static anchors or duplicate IDs.`);
console.log('Not covered: hydration, visual layout, responsive interaction, authenticated data, form delivery, payment or phone/browser QA.');
