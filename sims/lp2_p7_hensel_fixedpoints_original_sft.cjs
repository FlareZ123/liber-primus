'use strict';
// Read-only SFT: p7 integer polynomial fixed-point lifts, original p8 heading seeds.
// Run from repository root: node sims/lp2_p7_hensel_fixedpoints_original_sft.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const j = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
/** @param {number} n @returns {number[]} */
const pg = n => j.pages.find(p => p.page === n).indices;
/** @param {number[]} a @param {number[]} lens */
function products(a,lens) {
  let i=0;
  const out=lens.map(n=>{const v=a.slice(i,i+n).reduce((x,y)=>x*y%29,1);i+=n;return v;});
  assert.equal(i,a.length);return out;
}
const coeff=products(pg(7).slice(-14),[2,4,3,2,3]);
const roots=products(pg(8).slice(0,12),[4,8]);
assert.deepEqual(coeff,[11,26,8,15,2]);
assert.deepEqual(roots,[4,3]);
const q=coeff.map((x,i)=>BigInt(x-(i===1?1:0)));
const der=q.slice(1).map((v,i)=>v*BigInt(i+1));
/** @param {bigint} x @param {bigint} m */
const mod=(x,m)=>(x%m+m)%m;
/** @param {bigint[]} c @param {bigint} x @param {bigint} m */
const ev=(c,x,m)=>c.reduceRight((a,v)=>mod(a*x+v,m),0n);
/** @param {bigint} a @param {bigint} m */
function inv(a,m) {
  let r=m,s=mod(a,m),t=0n,u=1n;
  while(s){const k=r/s;[r,s]=[s,r-k*s];[t,u]=[u,t-k*u];}
  assert.equal(r,1n);return mod(t,m);
}
/** @param {number} seed @param {number} n @returns {number[]} */
function lift(seed,n) {
  let x=BigInt(seed),m=29n,k=1;
  assert.equal(ev(q,x,m),0n);
  while(k<n){
    const old=x,oldMod=m;
    m*=m;k*=2;
    x=mod(x-ev(q,x,m)*inv(ev(der,x,m),m),m);
    assert.equal(ev(q,x,m),0n);
    assert.equal(x%oldMod,old);
  }
  const d=[];
  for(let i=0;i<n;i++){d.push(Number(x%29n));x/=29n;}
  return d;
}
assert.deepEqual(Array.from({length:29},(_,i)=>i).filter(i=>ev(q,BigInt(i),29n)===0n),[3,4]);
assert.deepEqual(roots.map(r=>Number(ev(der,BigInt(r),29n))),[16,27]);
const starts={};let C=[];
for(let p=8;p<=55;p++){starts[p]=C.length;C.push(...pg(p).slice(p===8?12:0));}
assert.equal(C.length,11070);
assert.equal(starts[15],1717);
assert.equal(starts[54]-starts[40],3008);
const [a,b]=roots.map(r=>lift(r,C.length));
assert.deepEqual(a.slice(0,16),[4,9,8,9,7,23,12,10,3,8,12,7,27,0,22,27]);
assert.deepEqual(b.slice(0,16),[3,27,28,19,27,0,22,1,5,8,18,8,27,28,8,19]);
const keys={root4:a,root3:b,interleave43:Array.from({length:C.length},(_,i)=>i%2?b[i>>1]:a[i>>1])};
/** @param {number[]} x */
function ic(x){
  const f=Array(29).fill(0);for(const v of x)f[v]++;
  return f.reduce((s,v)=>s+v*(v-1),0)/(x.length*(x.length-1));
}
/**
 * Exact reachability over consumed key symbols. Histories sharing a clock have
 * identical future choices, so merging them loses no feasible path.
 * @param {number[]} c @param {number[]} key @param {number} sign
 * @param {number[]} [track] Known plant's true clocks, used only on control.
 */
function check(c,key,sign,track){
  let clocks=new Set([0]),max=1;
  for(let i=0;i<c.length;i++){
    const next=new Set();
    for(const t of clocks){
      if(c[i]===0)next.add(t);
      if((c[i]+sign*key[t]+29)%29!==0)next.add(t+1);
    }
    clocks=next;max=Math.max(max,clocks.size);
    if(track)assert.ok(clocks.has(track[i+1]));
    if(!clocks.size)return {firstImpossible:i,max};
  }
  return {firstImpossible:null,max,endStates:clocks.size};
}
const expected=[1,71,47,17,95,21];
const native=pg(57);
assert.equal(native.length,95);assert.ok(native.includes(0));
const plant=Array.from({length:1717},(_,i)=>native[i%native.length]);
let row=0;
for(const [name,key] of Object.entries(keys))for(const sign of [-1,1]){
  const p=C.map((c,i)=>(c+sign*key[i]+29)%29);
  assert.deepEqual(p.map((v,i)=>(v-sign*key[i]+29)%29),C);
  const direct=plant.map((v,i)=>(v-sign*key[i]+29)%29);
  assert.deepEqual(direct.map((v,i)=>(v+sign*key[i]+29)%29),plant);
  let t=0;const track=[0];
  const enc=plant.map(v=>{const c=v===0?0:(v-sign*key[t++]+29)%29;track.push(t);return c;});
  const positive=check(enc,key,sign,track);
  assert.equal(positive.firstImpossible,null);
  const orig=check(C,key,sign);
  assert.equal(orig.firstImpossible,expected[row++]);
  const chapter=ic(p.slice(0,starts[15])),holdout=ic(p.slice(starts[40],starts[54]));
  assert.ok(chapter<0.05&&holdout<0.05);
  console.log(JSON.stringify({name,sign,chapter,holdout,all:ic(p),opening:p.slice(0,60).map(i=>j.translit[i]).join(' '),original:orig,planted:positive}));
}
console.log('PASS: six complete original direct inverses and exact F-clock exclusions; source-native plants pass.');
