import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';

const css = readFileSync(new URL('../app/buttons.css', import.meta.url), 'utf8');
const sheet = postcss.parse(css);

test('button palette aliases stay zero-specificity so selected, quiet and destructive variants win', () => {
  const lightPalettes: string[] = [];
  sheet.walkRules(rule => {
    if (rule.nodes.some(node => node.type === 'decl' && node.prop === '--action-bg' && node.value === 'var(--dp-action-light)')) lightPalettes.push(rule.selector);
  });
  assert.equal(lightPalettes.length, 1);
  assert.ok(lightPalettes[0].startsWith('body :where('));
  for (const state of ['[aria-pressed="true"]', '[data-dp-button="destructive"]', '[data-dp-button="quiet"]']) assert.ok(css.includes(state));
});

test('button states retain opaque fallback, reduced effects, focus and native disabled treatment', () => {
  assert.match(css, /--dp-action-light:linear-gradient\(130deg,#fff,#f2f1eb\)/);
  for (const preference of ['prefers-reduced-motion:reduce','prefers-reduced-transparency:reduce','forced-colors:active']) assert.ok(css.includes(preference));
  assert.ok(css.includes(':focus-visible'));
  assert.ok(css.includes(':is(:hover,:active):not(:disabled):not([aria-disabled="true"]) { transform:none; }'));
  assert.ok(css.includes('--action-height:52px')); 
  assert.ok(css.includes(':is(:disabled,[aria-disabled="true"])'));
  assert.ok(css.includes('[aria-busy="true"]'));
  const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
  assert.ok(layout.indexOf('"./buttons.css"') > layout.indexOf('"./workspace.css"'));
});

function contrast(a:string,b:string) {
  const luminance = (hex:string) => {
    const c = hex.match(/\w\w/g)!.map(part => parseInt(part,16)/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4);
    return .2126*c[0]+.7152*c[1]+.0722*c[2];
  };
  const [lo,hi] = [luminance(a),luminance(b)].sort((x,y)=>x-y);
  return (hi+.05)/(lo+.05);
}
test('core button label palettes meet normal-text contrast on their least-contrasting solid stop', () => {
  for (const [name,ink,background] of [['primary','ffffff','2d352d'],['secondary','171d18','f2f1eb'],['destructive','972d1b','fae9e4'],['disabled','62695b','e6e7e1'],['orange arrow','171d18','ff4d00']]) {
    assert.ok(contrast(ink,background) >= 4.5, `${name}: ${contrast(ink,background)}`);
  }
});
