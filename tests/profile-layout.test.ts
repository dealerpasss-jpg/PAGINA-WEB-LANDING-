import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Render the real presentation components with local synthetic values only.
// No page/server/auth/database module is loaded or mocked into a public route.
const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));
const cache = new Map<string,{exports:Record<string,unknown>}>();
function componentModule(filename:string): Record<string,unknown> {
  const cached = cache.get(filename);
  if (cached) return cached.exports;
  const module = {exports:{} as Record<string,unknown>};
  cache.set(filename,module);
  const code = ts.transpileModule(readFileSync(filename,'utf8'), {compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  function localRequire(id:string): unknown {
    if (['react','react/jsx-runtime'].includes(id)) return require(id);
    const path = id.startsWith('@/') ? resolve(root,id.slice(2)) : resolve(dirname(filename),id);
    assert.ok(id.startsWith('.') || id.startsWith('@/'), 'Only local presentation imports');
    assert.ok(!path.includes('/server'), 'No server dependency in profile presentation');
    const actual = [path,path+'.tsx',path+'.ts'].find(existsSync);
    assert.ok(actual);
    return componentModule(actual);
  }
  new Function('require','module','exports',code)(localRequire,module,module.exports);
  return module.exports;
}
const Editor = componentModule(resolve(root,'components/ProfileEditor.tsx')).default as React.ComponentType<{values:Record<string,unknown>;next:string}>;
const Fields = componentModule(resolve(root,'components/ProfileFields.tsx')).default as React.ComponentType<{values?:Record<string,unknown>}>;
const render = (values:Record<string,unknown> = {}) => renderToStaticMarkup(React.createElement(Editor,{values,next:'/mi-cuenta'}));

test('profile layout preserves one exact POST form and every existing field once', () => {
  const html = render();
  assert.match(html, /<form[^>]*action="\/api\/profile"[^>]*method="post"/);
  const names = [...html.matchAll(/ name="([^"]+)"/g)].map(match=>match[1]).sort();
  assert.deepEqual(names,['next','nickname','first_name','last_name','country','region','phone','marketing_email','marketing_whatsapp','experience','goal','language'].sort());
  assert.equal((html.match(/<form/g)||[]).length,1);
  assert.equal((html.match(/type="submit"/g)||[]).length,1);
  for (const name of ['first_name','last_name','country','region','experience','goal','language']) {
    const control = html.match(new RegExp(`<(?:input|select)[^>]*name="${name}"[^>]*>`))?.[0];
    assert.ok(control); assert.match(control,/required=""/);
  }
  const page = readFileSync(resolve(root,'app/mi-cuenta/perfil/page.tsx'),'utf8');
  assert.match(page,/await requireIdentity\("\/mi-cuenta\/perfil\?next=" \+ encodeURIComponent\(next\)\)/);
  assert.match(page,/const next = safeNext\(query.next\)/);
});

test('profile and signup consent defaults remain optional and preserve explicit true only', () => {
  for (const html of [render(),renderToStaticMarkup(React.createElement(Fields,{}))]) {
    for (const name of ['marketing_email','marketing_whatsapp']) {
      const input = html.match(new RegExp(`<input[^>]*name="${name}"[^>]*>`))?.[0];
      assert.ok(input); assert.match(input,/type="checkbox"/); assert.match(input,/value="yes"/); assert.doesNotMatch(input,/checked|required/);
    }
  }
  assert.equal((render({marketing_email:true,marketing_whatsapp:true}).match(/checked=""/g)||[]).length,2);
  assert.equal((render({marketing_email:'true',marketing_whatsapp:'yes'}).match(/checked=""/g)||[]).length,0);
  const filled = render({nickname:'Mi nombre',first_name:'Ana',experience:'learning',goal:'personal',language:'es'});
  assert.match(filled,/name="nickname"[^>]*value="Mi nombre"/);
  for (const value of ['learning','personal','es']) assert.match(filled,new RegExp(`<option[^>]*value="${value}"[^>]*selected=""`));
});

test('profile uses two named groups, wide desktop layout and single-column mobile without widening signup', () => {
  const html=render();
  assert.match(html,/aria-labelledby="profile-personal-title"/);
  assert.match(html,/aria-labelledby="profile-preferences-title"/);
  const css=readFileSync(resolve(root,'app/workspace-tech.css'),'utf8');
  assert.match(css,/workspace-profile-form[\s\S]*?grid-template-columns:minmax\(0,1.05fr\) minmax\(0,1fr\)/);
  assert.match(css,/workspace-profile-form[\s\S]*?max-width:none/);
  assert.match(css,/@media\(max-width:1100px\)[\s\S]*?workspace-profile-form \{ grid-template-columns:1fr/);
  assert.match(readFileSync(resolve(root,'app/account.css'),'utf8'),/\.account-form \{\s*max-width: 620px/);
});
