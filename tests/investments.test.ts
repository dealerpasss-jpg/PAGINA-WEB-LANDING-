import test from 'node:test';import assert from 'node:assert/strict';
import { cents, totals } from '../lib/investments/money.ts';
test('amounts use exact cents and reject malformed or negative input',()=>{assert.equal(cents('4200.15'),420015);assert.equal(cents('0'),0);assert.equal(cents('',true),null);for(const v of ['-5','1.001','NaN','1e4','4,200',''])assert.throws(()=>cents(v));});
test('costs, estimated profit and closed-sale margins remain separate',()=>{const s=totals(420000,[43000,13000],600000,null);assert.equal(s.cost,476000);assert.equal(s.estimated,124000);assert.equal(s.realized,null);assert.equal(s.margin,null);const sold=totals(420000,[43000,13000],600000,450000);assert.equal(sold.realized,-26000);assert.equal(sold.margin,-26000/450000*100);});
test('zero or unset asking price never creates infinite margin',()=>{assert.equal(totals(100,[],0,null).estimatedMargin,null);assert.equal(totals(100,[],null,null).estimated,null);});

test('unknown purchase cost is not a zero investment or fictitious profit',()=>{const s=totals(null,[25000],600000,null);assert.equal(s.expensesTotal,25000);assert.equal(s.cost,null);assert.equal(s.estimated,null);assert.equal(s.realized,null);assert.equal(s.estimatedMargin,null);});
