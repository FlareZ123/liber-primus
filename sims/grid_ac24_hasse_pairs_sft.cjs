'use strict';
/**
 * SFT: original LP2 Ac24 double-root polynomial Hasse translation.
 * Test source-fixed 254->127 coefficient pairings against original p53-red/p55
 * ciphertext under ANY stationary pair->GP29 table. No plaintext is claimed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
/** @param {string} p */
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
/** @param {number} x */
const m = (x) => (x % 29 + 29) % 29;
/** Hasse shift: ascending polynomial coefficients of P(X+a).
 * @param {number[]} c
 * @param {number} a
 * @returns {number[]}
 */
function translate(c, a) {
  const out = Array(c.length).fill(0);
  const powers = Array(c.length).fill(1);
  for (let i=1; i<c.length; i++) powers[i] = m(powers[i-1]*a);
  let row = [1];
  for (let i=0; i<c.length; i++) {
    if(i) {
      const next = Array(i+1).fill(1);
      for(let j=1; j<i; j++) next[j] = m(row[j-1]+row[j]);
      row = next;
    }
    for(let j=0; j<=i; j++) out[j] = m(out[j]+c[i]*row[j]*powers[i-j]);
  }
  return out;
}
/** @param {number[]} nums */
function ioc(nums) {
  const counts = Array(29).fill(0);
  for (const n of nums) counts[n]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(nums.length*(nums.length-1));
}
/** @param {number[]} z @param {'adjacent'|'halves'} layout */
function pairs(z, layout) {
  return Array.from({length:127},(_,i)=>layout==='adjacent'
    ? [z[2*i],z[2*i+1]] : [z[i],z[i+127]]);
}
/** Exact minimal edit count under any fixed two-input/one-output table.
 * @param {number[][]} pairs
 * @param {number[]} target
 */
function gate(pairs, target) {
  assert.equal(pairs.length,target.length);
  const buckets = new Map();
  for(let i=0;i<pairs.length;i++){
    const key=pairs[i].join(',');
    if(!buckets.has(key)) buckets.set(key,new Map());
    const h=buckets.get(key);
    h.set(target[i],(h.get(target[i])||0)+1);
  }
  let repeats=0, mismatches=0, contradictoryTypes=0;
  for(const h of buckets.values()){
    const n=[...h.values()].reduce((s,v)=>s+v,0);
    repeats+=n-1;
    mismatches+=n-Math.max(...h.values());
    if(h.size>1) contradictoryTypes++;
  }
  return {repeatedPairOccurrences:repeats,contradictoryPairTypes:contradictoryTypes,
    minimumTargetEdits:mismatches};
}
const bytes=read('resources/liber-primus/lp2-grid-256.json').bytes;
const corpus=read('resources/liber-primus/lp2-corpus.json');
const red=read('resources/liber-primus/lp2-page53-red-span.json');
assert.equal(bytes.length,256);
const original=bytes.slice().reverse().map(m);
const t=translate(original,24);
assert.deepEqual(t.slice(0,4),[0,0,26,6]);
assert.deepEqual(translate(t,-24),original);
const z=t.slice(2);
assert.equal(z.length,254);
const lookup=new Map(corpus.runes.map((r,i)=>[r,i]));
const p55=corpus.pages.find(p=>p.page===55);
assert.ok(p55);
const target=[...red.red_text.runes].map(r=>lookup.get(r)).concat(p55.indices);
assert.equal(red.red_text.rune_count,51);
assert.equal(p55.indices.length,76);
assert.equal(target.length,127);
assert.ok(target.every(v=>Number.isInteger(v)&&v>=0&&v<29));
const layouts={};
for(const name of ['adjacent','halves']){
  const p=pairs(z,name);
  const native=gate(p,target);
  const plant=p.map(([a,b])=>m(7*a+13*b+5));
  assert.equal(gate(p,plant).minimumTargetEdits,0);
  assert.ok(native.minimumTargetEdits>0);
  layouts[name]=native;
}
assert.equal(layouts.adjacent.repeatedPairOccurrences,13);
assert.equal(layouts.halves.repeatedPairOccurrences,7);

// The simplest stateful two-lane interpretation: each F29 pair (a,b)
// acts as x -> a*x+b, starting at the oversized Ac=24.
const affineRecurrences = [];
for (const orientation of ['asc','desc']) {
  const source = orientation === 'asc' ? z : z.slice().reverse();
  for (const layout of ['adjacent','halves']) {
    for (const swap of [false,true]) {
      const entries = pairs(source,layout).map(([a,b])=>swap?[b,a]:[a,b]);
      let state=24, freeMatches=0, teacherMatches=0;
      const planted=[];
      let plantedState=24;
      for(let i=0;i<127;i++) {
        const [a,b]=entries[i];
        const teacherPrev=i===0?24:target[i-1];
        if(m(a*teacherPrev+b)===target[i]) teacherMatches++;
        state=m(a*state+b);
        if(state===target[i]) freeMatches++;
        plantedState=m(a*plantedState+b);
        planted.push(plantedState);
      }
      assert.equal(planted.length,127);
      let recovered=24;
      for(let i=0;i<127;i++){
        const [a,b]=entries[i];
        recovered=m(a*recovered+b);
        assert.equal(recovered,planted[i]);
      }
      assert.ok(teacherMatches<127);
      affineRecurrences.push({orientation,layout,swap,teacherMatches,freeMatches});
    }
  }
}
assert.equal(Math.max(...affineRecurrences.map(x=>x.teacherMatches)),8);
console.log(JSON.stringify({
  source:'LP2 32x8 grid; p53 red 51 runes; p55 76 runes',
  gridSha256:crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  root:24, taylorFirstFour:t.slice(0,4),
  taylorPayloadLength:z.length,taylorPayloadIoC:ioc(z),
  originalTargetLength:target.length,originalTargetIoC:ioc(target),
  layouts,affineRecurrences,positivePlant:'both pair maps and eight affine state plants exact',
  inverseShift:'all 256 F29 coefficients exact'
},null,2));
