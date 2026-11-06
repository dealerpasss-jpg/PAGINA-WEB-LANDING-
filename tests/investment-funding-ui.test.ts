import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import * as model from '../lib/personal-finances/model.ts';
import * as funding from '../lib/personal-finances/funding.ts';

const require = createRequire(import.meta.url);
const source = (path: string) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const ownerId = 'private-owner-must-not-appear-in-html';
const styles = new Proxy({}, { get: (_target, key) => String(key) });
function load(path: string, overrides: Record<string, unknown> = {}) {
  const code = ts.transpileModule(source(path), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  const imports: Record<string, unknown> = {
    react: React, 'react/jsx-runtime': require('react/jsx-runtime'),
    'next/link': ({ children, ...props }: React.ComponentProps<'a'>) => React.createElement('a', props, children),
    'next/navigation': { useRouter: () => ({ refresh: () => assert.fail('Static rendering must not refresh') }) },
    '@/app/mi-cuenta/finanzas/capital/actions': { saveInvestmentFunding: () => assert.fail('Static rendering must not mutate') },
    '@/lib/personal-finances/model': model, '@/lib/personal-finances/funding': funding,
    './InvestmentFunding.module.css': { __esModule: true, default: styles },
    ...overrides,
  };
  const module = { exports: {} as Record<string, any> };
  new Function('require', 'module', 'exports', code)((key: string) => { assert.ok(key in imports, `Unexpected import: ${key}`); return imports[key]; }, module, module.exports);
  return module.exports;
}
const componentPath = 'components/personal-finances/InvestmentFunding.tsx';
const Panel = load(componentPath).default;
const fund = (values: Partial<funding.InvestmentFund> = {}): funding.InvestmentFund => ({ id: 'fund-a', person_name: 'Persona A', description: 'Aporte A', principal_cents: 100001, currency: 'USD', received_on: '2026-11-01', notes: '', version: 1, ...values });
const repayment = (values: Partial<funding.InvestmentRepayment> = {}): funding.InvestmentRepayment => ({ id: 'repayment-a', fund_id: 'fund-a', amount_cents: 25025, paid_on: '2026-11-06', payment_method: 'transfer', notes: '', voided_at: null, version: 1, ...values });
const render = (funds: funding.InvestmentFund[] = [], repayments: funding.InvestmentRepayment[] = [], component = Panel) => renderToStaticMarkup(React.createElement(component, { funds, repayments, ownerId }));
const articles = (html: string) => [...html.matchAll(/<article class="fund">([\s\S]*?)<\/article>/g)].map(match => match[1]);
const summary = (html: string) => html.match(/<section class="stats"[^>]*>([\s\S]*?)<\/section>/)?.[1] ?? assert.fail('Summary section missing');

test('funding empty state shows zero balances and no sample records or private owner markup', () => {
  const html = render();
  assert.match(html, /Empieza con el dinero que recibiste/);
  assert.match(html, /Registrar el primer aporte/);
  assert.match(html, /0 registros/);
  assert.equal(articles(html).length, 0);
  assert.equal((summary(html).match(/USD 0,00/g) ?? []).length, 3);
  assert.doesNotMatch(html, /Persona A|Aporte A|private-owner-must-not-appear-in-html|owner_id|<form/);
  assert.match(html, /independiente de tus ingresos y gastos/);
  assert.match(html, /no crea movimientos bancarios/);
  assert.match(html, /No calculamos intereses ni rendimientos/);
});

test('funding renders exact cent balances independently for each person and total', () => {
  const html = render([fund(), fund({ id: 'fund-b', person_name: 'Persona B', principal_cents: 20303 })], [repayment(), repayment({ id: 'repayment-b', fund_id: 'fund-b', amount_cents: 102 })]);
  const [a, b] = articles(html);
  assert.equal(articles(html).length, 2);
  assert.match(a, /Persona A/); assert.match(a, /<dt>Capital recibido<\/dt><dd>USD 1\.000,01/); assert.match(a, /<dt>Devuelto<\/dt><dd>USD 250,25/); assert.match(a, /<dt>Por devolver<\/dt><dd>USD 749,76/);
  assert.match(b, /Persona B/); assert.match(b, /<dt>Capital recibido<\/dt><dd>USD 203,03/); assert.match(b, /<dt>Devuelto<\/dt><dd>USD 1,02/); assert.match(b, /<dt>Por devolver<\/dt><dd>USD 202,01/);
  assert.match(summary(html), /USD 1\.203,04/); assert.match(summary(html), /USD 251,27/); assert.match(summary(html), /USD 951,77/);
});

test('funding summaries and records never mix USD and COP on either selected currency', () => {
  const funds = [fund(), fund({ id: 'cop', person_name: 'Persona COP', currency: 'COP', principal_cents: 500000001 })];
  const repayments = [repayment(), repayment({ id: 'cop-payment', fund_id: 'cop', amount_cents: 125000025 })];
  const usd = render(funds, repayments);
  assert.match(summary(usd), /USD 749,76/); assert.doesNotMatch(summary(usd), /COP /); assert.doesNotMatch(usd, /Persona COP/);
  // Change only the initial currency hook for a second static render, without mocking balances or source text.
  const CopPanel = load(componentPath, { react: { ...React, useState: (initial: unknown) => React.useState(initial === 'USD' ? 'COP' : initial) } }).default;
  const cop = render(funds, repayments, CopPanel);
  assert.match(cop, /aria-label="Resumen total en COP"/); assert.match(cop, /Persona COP/); assert.doesNotMatch(cop, /Persona A/);
  assert.match(summary(cop), /COP 5\.000\.000,01/); assert.match(summary(cop), /COP 1\.250\.000,25/); assert.match(summary(cop), /COP 3\.749\.999,76/); assert.doesNotMatch(summary(cop), /USD /);
  assert.match(cop, /Las monedas se muestran por separado/);
});

test('partially returned and fully returned funds show correct status and repayment availability', () => {
  const html = render([fund(), fund({ id: 'completed', person_name: 'Persona completada' })], [repayment(), repayment({ id: 'complete-payment', fund_id: 'completed', amount_cents: 100001 })]);
  const [partial, completed] = articles(html);
  assert.match(partial, /class="badge">Por devolver/); assert.match(partial, /<button>Registrar abono<\/button>/);
  assert.match(completed, /class="badgeDone">Capital devuelto/); assert.match(completed, /<dt>Por devolver<\/dt><dd>USD 0,00/); assert.match(completed, /<button disabled="">Registrar abono<\/button>/);
  assert.match(completed, /<button>Editar aporte<\/button>/);
});

test('voided repayments remain visible and restorable but never count toward returned capital', () => {
  const html = render([fund()], [repayment(), repayment({ id: 'voided', amount_cents: 9999, voided_at: '2026-11-06T12:00:00Z', notes: 'Corrección de prueba' })]);
  assert.match(summary(html), /USD 250,25/); assert.match(summary(html), /USD 749,76/); assert.doesNotMatch(summary(html), /USD 350,24/);
  const [record] = articles(html);
  assert.match(record, /Historial de abonos \(2\)/); assert.match(record, /USD 99,99/); assert.match(record, /Anulado · no suma/); assert.match(record, /Corrección de prueba/); assert.match(record, /Restaurar abono/); assert.match(record, /Anular abono/); assert.match(record, /Vigente/);
  assert.match(record, /Transferencia/); assert.ok(record.includes(new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date('2026-11-06T12:00:00Z'))));
  assert.match(record, /Para corregir un importe o una fecha, anula el abono y registra uno nuevo/);
});

test('funding escapes untrusted person names and notes without serializing owner identity', () => {
  const html = render([fund({ person_name: '<script>alert("name")</script>', description: '<img src=x onerror=alert(1)>', notes: '<iframe src="https://invalid.test"></iframe>' })], [repayment({ notes: '<svg onload="alert(2)"> & repayment' })]);
  assert.match(html, /&lt;script&gt;alert\(&quot;name&quot;\)&lt;\/script&gt;/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(html, /&lt;iframe src=&quot;https:\/\/invalid.test&quot;&gt;&lt;\/iframe&gt;/);
  assert.match(html, /&lt;svg onload=&quot;alert\(2\)&quot;&gt; &amp; repayment/);
  assert.doesNotMatch(html, /<script|<img|<iframe|<svg|private-owner-must-not-appear-in-html|owner_id/);
});

test('capital route uses private dynamic metadata, owner-keyed data and reciprocal finance navigation', async () => {
  let reads = 0;
  const Shell = ({ title, children }: { title: string; children: React.ReactNode }) => React.createElement('section', null, React.createElement('h1', null, title), children);
  const capital = load('app/mi-cuenta/finanzas/capital/page.tsx', { '@/components/AccountShell': Shell, '@/components/personal-finances/InvestmentFunding': Panel, '@/lib/personal-finances/server': { personalFunding: async () => { reads++; return { funds: [], repayments: [], ownerId }; } } });
  assert.equal(capital.dynamic, 'force-dynamic'); assert.deepEqual(capital.metadata.robots, { index: false, follow: false });
  const element = await capital.default();
  assert.equal(element.props.children.key, ownerId); assert.equal(element.props.children.props.ownerId, ownerId); assert.equal(reads, 1);
  const html = renderToStaticMarkup(element);
  assert.match(html, /<h1>Dinero recibido para invertir\.<\/h1>/); assert.match(html, /href="\/mi-cuenta\/finanzas"/); assert.doesNotMatch(html, /private-owner-must-not-appear-in-html/);
  const finance = load('app/mi-cuenta/finanzas/page.tsx', { '@/components/AccountShell': Shell, '@/components/personal-finances/PersonalFinances': () => null, '@/lib/personal-finances/server': { personalEntries: async () => ({ entries: [], ownerId }) } });
  const financeHtml = renderToStaticMarkup(await finance.default());
  assert.match(financeHtml, /href="\/mi-cuenta\/finanzas\/capital"/); assert.match(financeHtml, /Dinero recibido para invertir/);
});
