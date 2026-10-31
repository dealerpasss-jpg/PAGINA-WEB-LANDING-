import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import postcss, { type AnyNode } from 'postcss';

const css = readFileSync(new URL('../components/PurchaseCalculator.module.css', import.meta.url), 'utf8');
const marker = '\n/* Desktop composition only.';
const extension = css.slice(css.indexOf(marker));

test('approved mobile calculator styles remain byte-identical before desktop extension', () => {
  const original = css.slice(0, css.indexOf(marker));
  assert.equal(createHash('sha256').update(original).digest('hex'), 'd7ed860eb73f34fe223942702257383082d1785a0e5e3994356c6f3479e5fba6');
});

test('every new calculator declaration is desktop scoped, with available-width gating for columns', () => {
  const root = postcss.parse(extension);
  root.walkDecls(decl => {
    const ancestors: AnyNode[] = []; let p: AnyNode | undefined = decl.parent;
    while (p) { ancestors.push(p); p = p.parent; }
    assert.ok(ancestors.some(a => a.type === 'atrule' && a.name === 'media' && a.params === '(min-width:1024px)'), decl.toString());
    if (decl.prop === 'grid-template-columns') {
      assert.ok(ancestors.some(a => a.type === 'atrule' && a.name === 'container' && a.params === 'dp-calc (min-width:720px)'));
      assert.equal(decl.value, 'minmax(0,1.05fr) minmax(0,1fr)');
    }
    assert.notEqual(decl.prop, 'order');
  });
  assert.match(extension, /width:min\(100%,960px\)/);
  assert.match(extension, /\.device \{ max-width:520px; margin-inline:auto; \}/);
  assert.match(extension, /\.device > form,\.result/);
  assert.match(extension, /font-size:clamp\(42px,6\.25cqi,60px\)!important/);
  assert.match(extension, /input\[data-long=true\] \{ font-size:34px!important; \}/);
});
