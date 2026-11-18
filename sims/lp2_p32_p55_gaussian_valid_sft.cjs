'use strict';
/**
 * Original p32 (49.jpg) 11x11 -> p55 (72.jpg) candidate 9x9 Gaussian
 * source-only test. Run: node sims/lp2_p32_p55_gaussian_valid_sft.cjs
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const p32 = corpus.pages.find(p => p.page === 32).indices;
const p55 = corpus.pages.find(p => p.page === 55).indices;
assert.equal(p32.length, 121);
assert.equal(p55.length, 76);
const mod = x => (x % 29 + 29) % 29;
const kernel = [[1,2,1],[2,4,2],[1,2,1]];
const gaussian = Array.from({length:9}, (_,r) =>
  Array.from({length:9}, (_,c) => {
    let sum = 0;
    for (let i=0;i<3;i++) for (let j=0;j<3;j++)
      sum += kernel[i][j] * p32[(r+i)*11+c+j];
    return mod(sum*20); // 20 = inverse of the kernel sum 16 mod29
  }));
const x = gaussian.flat();
/** @param {number[]} seq @returns {number[]} */
function histogram(seq) {
  const counts = Array(29).fill(0);
  for (const symbol of seq) counts[symbol]++;
  return counts.sort((a,b) => b-a);
}
/** @param {number[]} seq @returns {number} */
function equalPairs(seq) {
  return histogram(seq).reduce((s,n) => s + n*(n-1)/2,0);
}
/** @param {number[]} source @param {number[]} target @returns {boolean} */
function frequencyDominates(source,target) {
  const a=histogram(source),b=histogram(target);
  return a.every((v,i) => v>=b[i]);
}
/** @param {number[]} a @param {number[]} b @returns {number} */
function lcs(a,b) {
  const dp = new Uint8Array(b.length+1);
  for (const v of a) {
    let prev=0;
    for (let j=1;j<=b.length;j++) {
      const old=dp[j];
      dp[j]=v===b[j-1]?prev+1:Math.max(dp[j],dp[j-1]);
      prev=old;
    }
  }
  return dp[b.length];
}
/** @param {number[][]} input @param {number} rotation @param {boolean} mirror @returns {number[]} */
function d4(input,rotation,mirror) {
  let a=input.map(row=>mirror?[...row].reverse():[...row]);
  for (let i=0;i<rotation;i++) a=a[0].map((_,j)=>a.map(row=>row[j]).reverse());
  return a.flat();
}
assert.equal(equalPairs(x),91);
assert.equal(equalPairs(p55),108);
assert.equal(equalPairs(p55.slice(1)),107);
assert.deepEqual(histogram(x).slice(0,2),[5,5]);
assert.deepEqual(histogram(p55).slice(0,7),[6,5,5,5,5,5,5]);
assert.equal(frequencyDominates(x,p55),false);
assert.equal(frequencyDominates(x,p55.slice(1)),false);
let maxLcs=0;
for(let r=0;r<4;r++) for(const mirror of [false,true])
  for(const body of [p55,p55.slice(1)])
    for(const direction of [body,[...body].reverse()])
      maxLcs=Math.max(maxLcs,lcs(d4(gaussian,r,mirror),direction));
assert.equal(maxLcs,23);
const inset=Array.from({length:9},(_,r)=>
  p32.slice((r+1)*11+1,(r+1)*11+10)).flat();
assert.equal(lcs(inset,p55),24);
for (const deletes of [[3,18,39,58,77],[3,18,39,58,65,77]]) {
  const omitted=new Set(deletes);
  const plant=x.filter((_,i)=>!omitted.has(i));
  const encrypted=plant.map(v=>mod(7*v+13));
  assert.ok(encrypted.length===76||encrypted.length===75);
  assert.equal(frequencyDominates(x,encrypted),true);
  const recovered=encrypted.map(v=>mod(25*(v-13)));
  assert.deepEqual(recovered,plant);
  assert.equal(lcs(x,recovered),recovered.length);
}
console.log(JSON.stringify({
  status:'PASS',
  source:'original p32=121 runes and p55=76 runes',
  operator:'3x3 valid Gaussian 1-2-1 outer product /16 over GF29',
  output:81,identicalPairs:{gaussian:91,p55:108,p55Body:107},
  allSecretStationaryDeletionFeasible:false,
  bestD4AndDirectionLCS:maxLcs,
  positives:'two exact 5-/6-symbol deletion + affine alphabet plants',
  decision:'No literal p32 Gaussian projection can produce p55 by deleting 5/6 cells, regardless of source traversal or independent stationary GP29 substitution.'
},null,2));
