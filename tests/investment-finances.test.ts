import test from 'node:test';
import assert from 'node:assert/strict';
import { totals } from '../lib/investments/money.ts';
import { portfolioSummary } from '../lib/investments/portfolio.ts';
const row=(status:string,purchase:number|null,expenses:number[],sale:number|null=null,asking:number|null=null)=>({status,purchase_cents:purchase,sale_cents:sale,summary:totals(purchase,expenses,asking,sale)});

test('portfolio separates active and sold, registered sales and realized result',()=>{
 const s=portfolioSummary([row('purchased',10000,[500],null,20000),row('repairing',20000,[1000]),row('sold',10000,[2000],15000)]);
 assert.deepEqual(s,{activeCount:2,soldCount:1,activeRecordedCost:31500,activeMissingPurchase:0,registeredSales:15000,soldMissingSale:0,realizedRecorded:3000,realizedKnownCount:1,realizedPendingCount:0});
});
test('missing purchases retain known expense subtotal but never invent profit',()=>{
 const s=portfolioSummary([row('listed',null,[700],null,50000),row('sold',null,[100],30000),row('sold',10000,[2000],15000)]);
 assert.equal(s.activeRecordedCost,700);assert.equal(s.activeMissingPurchase,1);
 assert.equal(s.registeredSales,45000);assert.equal(s.realizedRecorded,3000);assert.equal(s.realizedKnownCount,1);assert.equal(s.realizedPendingCount,1);
});
test('explicit zero and negative closed results remain valid exact cents',()=>{
 const s=portfolioSummary([row('sold',0,[],0),row('sold',10001,[199],9000),row('listed',0,[])]);
 assert.equal(s.activeMissingPurchase,0);assert.equal(s.realizedRecorded,-1200);assert.equal(s.realizedKnownCount,2);assert.equal(s.realizedPendingCount,0);assert.equal(s.registeredSales,9000);
});
test('missing sale is not a completed result and unsold sale values never count',()=>{
 const s=portfolioSummary([row('sold',100,[],null),row('listed',100,[],500,1000)]);
 assert.equal(s.registeredSales,0);assert.equal(s.soldMissingSale,1);assert.equal(s.realizedKnownCount,0);assert.equal(s.realizedPendingCount,1);assert.equal(s.realizedRecorded,0);
});
test('empty portfolio has zero counts without fabricated records',()=>{
 assert.deepEqual(portfolioSummary([]),{activeCount:0,soldCount:0,activeRecordedCost:0,activeMissingPurchase:0,registeredSales:0,soldMissingSale:0,realizedRecorded:0,realizedKnownCount:0,realizedPendingCount:0});
});
