'use strict';

/**
 * Agent23 Issue #785: red119 prime-page links as a two-time GP29 pad.
 * Source-selected pairs: p3->p33 and p39->p40. Test original page-start
 * and red119-to-page-start alignments against independent source-native
 * English differences. A reused additive pad cancels exactly in C1-C2.
 * Run Windows / Node 22: node sims/lp2_red119_pointed_pairs_twotimepad_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const native = [
  ['Shakespeare', encodeSourceNativeGP(read('resources/control/shakespeare_first300k.txt'))],
  ['Gibran', encodeSourceNativeGP(read('resources/control/gibran_prophet_58585.txt'))],
  ['Emerson', encodeSourceNativeGP(read('resources/control/emerson_essays_2944.txt'))],
];
const count = Array(29).fill(0);
for (const x of native[0][1].slice(0, 100000)) count[x]++;
const N = count.reduce((a,b)=>a+b,0);
assert.equal(N, 100000);
const q = Array(29).fill(0);
for (let a=0;a<29;a++) for (let b=0;b<29;b++)
  q[(a-b+29)%29] += count[a]*count[b]/(N*N);
assert.ok(q.every(v=>v>0));
/**
 * Signed log likelihood of a shared-key-cancelled native English pair
 * versus independent uniform GP29 differences. Purely a registered
 * one-symbol score, and never used to infer a key or plaintext.
 * @param {number[]} a @param {number[]} b
 * @returns {number}
 */
function llr(a,b) {
  assert.equal(a.length,b.length);
  return a.reduce((s,x,i) => s + Math.log(q[(x-b[i]+29)%29]*29),0);
}
const pairs = [
 {a:3,b:33,start:0},
 {a:3,b:33,start:119},
 {a:39,b:40,start:0},
 {a:39,b:40,start:119},
];
const results=[];
for (const pair of pairs) {
  const left=corpus.pages[pair.a].indices.slice(pair.start);
  const right=corpus.pages[pair.b].indices;
  const n=Math.min(left.length,right.length);
  const sourceA=left.slice(0,n),sourceB=right.slice(0,n);
  const real=llr(sourceA,sourceB);
  const shifted = Array.from({length:right.length},(_,shift) => {
    const shiftedB=Array.from({length:n},(_,i)=>right[(i+shift)%right.length]);
    return llr(sourceA,shiftedB);
  });
  const rank=shifted.filter(x=>x>=real-1e-9).length;

  // An exact source-native shared-pad encryption plant cancels algebraically
  // for the same original fragment lengths, with its 29-symbol key withheld
  // from the scoring and score distribution.
  const controls=[];
  for (const [name,txt] of native) {
    const atStart = name==='Shakespeare'?100000:0; // independent train/test
    const slice=txt.slice(atStart),span=slice.length-n;
    assert.ok(span>6000);
    const sample=[];
    for(let j=0;j<250;j++){
      const offset=(j*7919 + 733)%span;
      const a=slice.slice(offset,offset+n);
      const b=slice.slice((offset+5033)%span,(offset+5033)%span+n);
      assert.equal(a.length,n);
      assert.equal(b.length,n);
      const key=a.map((_,i)=>(17*i+7)%29);
      const encA=a.map((x,i)=>(x+key[i])%29);
      const encB=b.map((x,i)=>(x+key[i])%29);
      const score=llr(encA,encB);
      assert.ok(Math.abs(score-llr(a,b))<1e-7);
      sample.push(score);
    }
    sample.sort((a,b)=>a-b);
    controls.push({corpus:name,n:sample.length,belowOrEqualOriginal:sample.filter(x=>x<=real).length,
      min:sample[0],q05:sample[12],median:sample[125],q95:sample[237],max:sample.at(-1)});
  }
  results.push({...pair,n,originalLLR:real,perRune:real/n,
    shiftRank:rank,shiftCount:shifted.length,cyclicMean:shifted.reduce((a,b)=>a+b,0)/shifted.length,
    controls});
}
console.log(JSON.stringify({
 status:'No source-exact two-time-pad original plaintext is established',
 sourceGPCounts:{p3:corpus.pages[3].indices.length,p33:corpus.pages[33].indices.length,
   p39:corpus.pages[39].indices.length,p40:corpus.pages[40].indices.length},
 knownPositive:['genuine LP1 orthography calibrated in module','native source pairs with exact shared key cancellation'],
 train:'100000 Shakespeare GP29 runes; heldout 250 fixed windows in each of 3 native English corpora',
 note:'Source-linked page relation and shared key are both unverified; no union p-value across hypothesized pairs',
 results},null,2));
