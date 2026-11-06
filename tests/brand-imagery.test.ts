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
  assert.match(read('app/page.tsx'), /className="brand-photo-frame"><Image src="\/brand\/academy-brand-scene.webp" alt="Imagen editada/);
  assert.match(read('components/SalesJourney.tsx'), /className="brand-photo-frame brand-photo-frame--inspection"><Image src="\/brand\/academy-inspection-scene.webp" alt="Escena generada con IA/);
  for (const file of ['app/home-editorial.css', 'app/academy/academy.module.css']) {
    assert.match(read(file), /width:100%; height:auto; aspect-ratio:9\/16/);
  }
});

test('ground fade leaves the original provenance corner physically outside the overlay', () => {
  const css = read('app/globals.css');
  const rules: postcss.Rule[] = [];
  postcss.parse(css).walkRules(rule => { if (rule.selector.includes('brand-photo-frame')) rules.push(rule); });
  assert.equal(rules.length, 4);
  for (const rule of rules) {
    assert.ok(!rule.selector.includes('img'), 'Never fade or mask the source photograph itself.');
    rule.walkDecls(declaration => assert.ok(!['filter','backdrop-filter','opacity','overflow','clip-path'].includes(declaration.prop)));
  }
  const overlay = rules.find(rule => rule.selector === '.brand-photo-frame::after' && rule.parent?.type === 'atrule' && rule.parent.name === 'supports')!;
  assert.ok(overlay, 'Unsupported masks must fall back to the untouched photo.');
  const values = Object.fromEntries(overlay.nodes.filter(node => node.type === 'decl').map(node => [node.prop,node.value]));
  assert.equal(values.left, '0');
  assert.equal(values.bottom, '0');
  assert.equal(values.width, '84%');
  assert.equal(values.height, 'var(--brand-photo-fade-height)');
  assert.equal(values['pointer-events'], 'none');
  assert.equal(values['mask-image'], 'linear-gradient(to right,#000 66%,transparent 100%)');
  assert.match(rules[0].toString(), /--brand-photo-fade-height:24%/);
  assert.match(rules[1].toString(), /--brand-photo-fade-height:30%/);
  assert.match(rules[3].parent!.toString(), /prefers-reduced-transparency:reduce/);
  assert.match(rules[3].parent!.toString(), /forced-colors:active/);
  assert.equal(rules[3].nodes[0].type === 'decl' && rules[3].nodes[0].value, 'none');
});
