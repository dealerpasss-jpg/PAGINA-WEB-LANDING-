import test from 'node:test';import assert from 'node:assert/strict';
import { cents, totals } from '../lib/investments/money.ts';
test('amounts use exact cents and reject malformed or negative input',()=>{assert.equal(cents('4200.15'),420015);assert.equal(cents('0'),0);assert.equal(cents('',true),null);for(const v of ['-5','1.001','NaN','1e4','4,200',''])assert.throws(()=>cents(v));});
test('costs, estimated profit and closed-sale margins remain separate',()=>{const s=totals(420000,[43000,13000],600000,null);assert.equal(s.cost,476000);assert.equal(s.estimated,124000);assert.equal(s.realized,null);assert.equal(s.margin,null);const sold=totals(420000,[43000,13000],600000,450000);assert.equal(sold.realized,-26000);assert.equal(sold.margin,-26000/450000*100);});
test('zero or unset asking price never creates infinite margin',()=>{assert.equal(totals(100,[],0,null).estimatedMargin,null);assert.equal(totals(100,[],null,null).estimated,null);});

test('unknown purchase cost is not a zero investment or fictitious profit',()=>{const s=totals(null,[25000],600000,null);assert.equal(s.expensesTotal,25000);assert.equal(s.cost,null);assert.equal(s.estimated,null);assert.equal(s.realized,null);assert.equal(s.estimatedMargin,null);});

import { investmentDate, investmentVersion, ownKey } from '../lib/investments/validation.ts';
import { statuses, categories } from '../lib/investments/money.ts';
test('investment dates reject impossible days and preserve optional purchase dates',()=>{
 assert.equal(investmentDate(''),null);
 assert.equal(investmentDate('2024-02-29'),'2024-02-29');
 for(const value of ['2026-02-29','2026-04-31','2026-13-01','0000-01-01','10/28/2026','']) assert.throws(()=>investmentDate(value,true));
});
test('investment choices reject inherited object names',()=>{
 assert.equal(ownKey(statuses,'sold'),true);assert.equal(ownKey(categories,'repair'),true);
 for(const value of ['toString','constructor','__proto__','invalid']) {assert.equal(ownKey(statuses,value),false);assert.equal(ownKey(categories,value),false);}
});
test('investment versions require a positive integer within the database range',()=>{
 assert.equal(investmentVersion('1'),1);
 for(const value of [null,'','0','-1','1.5','1e2','2147483647']) assert.throws(()=>investmentVersion(value));
});
