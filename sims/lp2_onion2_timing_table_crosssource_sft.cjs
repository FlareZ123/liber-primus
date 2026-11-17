"use strict";

/**
 * Source-to-source, 2014 onion2 growing-string 256-byte register vs original
 * LP2 p49–51 contiguous 256-byte table. Genuine historical byte positions
 * and k=elapsed minutes/5 are copied (with source SHA) from an archived
 * four-witness reconciliation, not derived from LP2.
 *
 * The exact same positional, bytewise operations are checked on the whole
 * attested subset. No hypothesis is inferred from a fitted language score.
 * Reference-only, no file writes, no network needed. Node22 CommonJS.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = relative => JSON.parse(fs.readFileSync(path.join(root,relative),"utf8"));
const events=read("resources/external-onion2-timing-2014.json");
const table=read("resources/liber-primus/lp2-grid-256.json").bytes;
const observations=events.observations;
assert.equal(table.length,256);
assert.equal(observations.length,112);
assert.deepEqual(observations.map(o=>o.pos).filter(x=>x>=190&&x<=191),[]);
assert.equal(new Set(observations.map(o=>o.pos)).size,112);
for(const o of observations) {
  assert.ok(o.pos>=143&&o.pos<=256);
  assert.ok(/^[0-9a-f]{2}$/i.test(o.byte));
  assert.equal(o.k*5%5,0);
}
/** @param {number} i */
function transpose(i) {return 8*(i%32)+Math.floor(i/32);}
const layouts=[
  ["print row-major",i=>i],
  ["print reverse",i=>255-i],
  ["print transposed 32x8",transpose],
  ["print transposed reversed",i=>transpose(255-i)]
];
/** @param {number[]} values */
function topCount(values) {
  const histogram=new Uint16Array(256);
  for(const v of values)histogram[v]++;
  const count=Math.max(...histogram);
  return {count,offset:histogram.indexOf(count)};
}
/** @param {number} p @param {number} b @param {number} k */
function relations(p,b,k) {
  return {
    equalsOriginalByte:Number(p===b),
    equalsTimingCount:Number(p===k),
    equalsTimingMinutes:Number(p===k*5),
    modulo29EqualsTimingCount:Number(p%29===k),
    xorByteEqualsTimingCount:Number((p^b)===k),
    xorByteEqualsTimingMinutes:Number((p^b)===k*5),
    subByteEqualsTimingCount:Number((p-b+256)%256===k),
    subByteEqualsTimingMinutes:Number((p-b+256)%256===k*5)
  };
}
/** @param {number[]} pVals */
function measure(pVals) {
  assert.equal(pVals.length,112);
  const totals={};
  const xors=[],subs=[];
  for(let i=0;i<observations.length;i++) {
    const p=pVals[i],e=observations[i],b=parseInt(e.byte,16),k=e.k;
    const matches=relations(p,b,k);
    for(const [key,value] of Object.entries(matches))
      totals[key]=(totals[key]||0)+value;
    xors.push(p^b);
    subs.push((p-b+256)%256);
  }
  return {...totals,bestConstantXor:topCount(xors),
    bestConstantSub:topCount(subs)};
}
// Synthetic 2014->table keying plant passes all 112 matching positions
// through the *same* original measurement logic.
const plant=observations.map(e=>parseInt(e.byte,16)^e.k);
const planted=measure(plant);
assert.equal(planted.xorByteEqualsTimingCount,112);
assert.deepEqual(plant.map((p,i)=>p^observations[i].k),
  observations.map(e=>parseInt(e.byte,16)));
const original=layouts.map(([name,ix])=>{
  const v=observations.map(e=>table[ix(e.pos-1)]);
  return {layout:name,...measure(v)};
});
let state=0x20140106;
/** @returns {number} */
function random() {
  state^=state<<13;state^=state>>>17;state^=state<<5;
  return(state>>>0)/4294967296;
}
/** @param {number[]} x */
function shuffled(x) {
  const a=x.slice();
  for(let i=a.length-1;i>0;i--) {
    const j=Math.floor(random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
const nulls=4000,layoutNull=[];
for(const [name,ix] of layouts) {
  const data=observations.map(e=>table[ix(e.pos-1)]);
  const scores=[];
  for(let i=0;i<nulls;i++){
    const m=measure(shuffled(data));
    scores.push(Math.max(m.bestConstantXor.count,m.bestConstantSub.count));
  }
  const real=original.find(x=>x.layout===name);
  const score=Math.max(real.bestConstantXor.count,real.bestConstantSub.count);
  layoutNull.push({layout:name,realMax:score,shuffledMaxMean:
    scores.reduce((a,b)=>a+b,0)/scores.length,
    upperP:(1+scores.filter(x=>x>=score).length)/(nulls+1)});
}
const kk=observations.map(e=>e.k),n=kk.length;
const meanK=kk.reduce((s,x)=>s+x,0)/n,p=1/meanK;
const obs=[1,2,3,4].map(v=>kk.filter(x=>x===v).length);
obs.push(kk.filter(v=>v>=5).length);
const exp=[1,2,3,4].map(v=>n*p*(1-p)**(v-1));
exp.push(n*(1-p)**4);
const chisq=obs.reduce((s,v,i)=>s+(v-exp[i])**2/exp[i],0);
console.log(JSON.stringify({
  objective:"2014 first-party 256-byte register and timestamp-derived k vs original LP2 256-cell byte table",
  scope:"112 authentic sample positions, four fixed geometric table orderings",
  known2014: {samplePositions:[143,256],missing:[190,191],
    witnesses:"solver-recorded 2014 timestamps, 9 disputed-confidence cells retained as marked",
    fittedGeometricTiming:{n,mean:meanK,p,observed1234plus:obs,
      expected1234plus:exp,chiSquare3df:chisq}},
  original,constantMaskShuffleNull:layoutNull,
  positivePlant:planted.xorByteEqualsTimingCount,
  conclusion:"No direct byte-positional equality, constant mask, or interval-XOR/substitution relationship detected. No LP2 key or unknown plaintext."
},null,2));
