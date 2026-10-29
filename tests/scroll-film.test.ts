import test from 'node:test';
import assert from 'node:assert/strict';
import { filmState, dampProgress, scrollProgress } from '../lib/animation/scroll-film.ts';
test('film scroll range uses actual sticky stage height and clamps endpoints',()=>{
 assert.equal(scrollProgress(100,100,2100,700),0);assert.equal(scrollProgress(1500,100,2100,700),1);
 assert.equal(scrollProgress(800,100,2100,700),.5);assert.equal(scrollProgress(0,100,2100,700),0);
 assert.equal(scrollProgress(900,100,2100,900),2/3);
});
test('film poses remain a normalized adjacent blend throughout sequence',()=>{
 for(let i=0;i<=1000;i++){const s=filmState(i/1000);assert.ok(Math.abs(s.poses.reduce((a,b)=>a+b,0)-1)<1e-12);assert.ok(s.poses.every(v=>v>=0&&v<=1));const active=s.poses.flatMap((v,i)=>v>0?[i]:[]);assert.ok(active.length<=2);if(active.length===2)assert.equal(active[1]-active[0],1);}
 assert.equal(filmState(0).poses[0],1);assert.equal(filmState(1).poses[5],1);
});
test('film timing is refresh-rate independent, bounded and converges in both directions',()=>{
 const a=dampProgress(0,1,32),b=dampProgress(dampProgress(0,1,16),1,16);assert.ok(Math.abs(a-b)<1e-12);
 let forward=0,back=1;for(let i=0;i<100;i++){forward=dampProgress(forward,1,16);back=dampProgress(back,0,16);}assert.equal(forward,1);assert.equal(back,0);
 assert.ok(dampProgress(0,1,10000)<=1);assert.equal(dampProgress(.5,1,0),.5);
});
