import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';

const read = (path:string) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const css = read('app/workspace-tech.css');
const sheet = postcss.parse(css);

test('tech skin is exclusively workspace-scoped and leaves approved buttons last', () => {
  sheet.walkRules(rule => {
    if (rule.parent?.type === 'atrule' && rule.parent.name.endsWith('keyframes')) return;
    for (const selector of rule.selectors) assert.match(selector, /workspace-(shell|atmosphere)/, selector);
  });
  const layout = read('app/layout.tsx');
  assert.ok(layout.indexOf('"./workspace-tech.css"') > layout.indexOf('"./workspace.css"'));
  assert.ok(layout.indexOf('"./buttons.css"') > layout.indexOf('"./workspace-tech.css"'));
  const frame = read('components/WorkspaceFrame.tsx');
  assert.ok(frame.indexOf('if (!privatePage)') < frame.indexOf('<WorkspaceAtmosphere />'));
});

test('ambient movement is decorative, transform-only, slow and bounded off the layout', () => {
  sheet.walkAtRules('keyframes', rule => {
    assert.equal(rule.params, 'workspace-ambient-drift');
    rule.walkDecls(decl => assert.equal(decl.prop, 'transform'));
  });
  assert.match(css, /animation:workspace-ambient-drift 48s/);
  for (const guard of ['position:fixed','pointer-events:none','contain:strict','overflow:hidden','prefers-reduced-motion:reduce','animation:none','prefers-reduced-transparency:reduce','forced-colors:active','animation-play-state:paused']) assert.ok(css.includes(guard), guard);
  const component = read('components/WorkspaceAtmosphere.tsx');
  assert.match(component, /aria-hidden="true"/);
  assert.match(component, /addEventListener\("visibilitychange", syncVisibility\)/);
  assert.match(component, /removeEventListener\("visibilitychange", syncVisibility\)/);
  assert.doesNotMatch(component, /fetch\(|setInterval|requestAnimationFrame|supabase|localStorage/);
});

test('workspace glass keeps opaque fallback, static input surfaces and mobile nav geometry', () => {
  assert.ok(css.indexOf('background:#fff;') < css.indexOf('@supports (backdrop-filter'));
  assert.match(css, /@media\(max-width:800px\)/);
  assert.match(css, /workspace-atmosphere \{ inset:60px 0 0/);
  assert.match(css, /background:#fcfdfa; border-color:#aeb8aa/);
  sheet.walkDecls(decl => assert.notEqual(decl.prop, 'grid-template-columns'));
  sheet.walkRules('.workspace-shell', rule => {
    assert.ok(!rule.nodes.some(node => node.type === 'decl' && node.prop === 'padding-bottom'));
  });
  const base = read('app/workspace.css');
  assert.match(base, /grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
  assert.match(base, /padding-bottom:calc\(82px \+ env\(safe-area-inset-bottom,0px\)\)/);
  assert.match(base, /article:first-child>strong \{ flex:0 0 auto; text-align:right/);
});
