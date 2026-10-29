import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import postcss from 'postcss';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('approved portraits remain byte-identical, full-frame and honestly described', () => {
  for (const [file, hash] of [
    ['academy-brand-scene.webp', 'e5e28c87be45990670557214b9684bfbdcacb3f5b874fbfd5acc754e5dd6caaf'],
    ['academy-inspection-scene.webp', 'd3b522ce32b2a34b47e472730262827fb87fbebafe5cb5dd419ee3350ba44660'],
  ]) assert.equal(createHash('sha256').update(readFileSync(new URL(`../public/brand/${file}`, import.meta.url))).digest('hex'), hash);
  assert.match(read('app/page.tsx'), /className="brand-photo-soft-edge" src="\/brand\/academy-brand-scene.webp" alt="Imagen editada/);
  assert.match(read('components/SalesJourney.tsx'), /className="brand-photo-soft-edge" src="\/brand\/academy-inspection-scene.webp" alt="Escena generada con IA/);
  for (const file of ['app/home-editorial.css', 'app/academy/academy.module.css']) {
    assert.match(read(file), /width:100%; height:auto; aspect-ratio:9\/16/);
  }
});

test('bottom softening never masks, overlays or blurs the photograph', () => {
  const css = read('app/globals.css');
  const rules: postcss.Rule[] = [];
  postcss.parse(css).walkRules(rule => { if (rule.selector.includes('brand-photo-soft-edge')) rules.push(rule); });
  assert.equal(rules.length, 2);
  for (const rule of rules) {
    assert.equal(rule.selector, 'img.brand-photo-soft-edge');
    rule.walkDecls(declaration => assert.equal(declaration.prop, 'box-shadow'));
  }
  assert.ok(!rules[0].toString().includes('inset'));
  assert.match(rules[1].parent!.toString(), /prefers-reduced-transparency: reduce/);
  assert.match(rules[1].parent!.toString(), /forced-colors: active/);
  assert.equal(rules[1].nodes[0].type === 'decl' && rules[1].nodes[0].value, 'none');
});
