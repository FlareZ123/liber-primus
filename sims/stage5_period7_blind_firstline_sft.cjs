'use strict';
/**
 * Stage5 held-out line test; period 7 comes from the period participant record,
 * not the original message. No historical plaintext or key in the scorer.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const first = 'TL BE IE OV UT HT RE ID TS EO ST PO SO YR'.replace(/\s/g, '');
const held = 'SL BT II IY T4 DG UQ IM NU 44 2I 15 33 9M'.replace(/\s/g, '');
const corpus = fs.readFileSync(path.join(__dirname, '../resources/control/gibran_prophet_58585.txt'), 'utf8').toUpperCase().replace(/[^A-Z]/g, '');
/** @param {number[]} a @param {number[]} p @returns {Generator<number[]>} */
function* perms(a, p = []) {
  if (!a.length) { yield p; return; }
  for (let i = 0; i < a.length; i++) yield* perms(a.filter((_, j) => j !== i), [...p, a[i]]);
}
/** @param {string} s @param {number[]} k */
function decode(s, k) {
  assert.equal(s.length % k.length, 0);
  return Array.from({length:s.length/k.length}, (_, i) => k.map(j => s[i*k.length+j]).join('')).join('');
}
/** @param {string} s @param {number} n */
function model(s, n) {
  const counts = new Map();
  for (let i = 0; i+n <= s.length; i++) {
    const gram = s.slice(i,i+n);
    counts.set(gram, (counts.get(gram) || 0)+1);
  }
  return t => {
    let score=0;
    for(let i=0;i+n<=t.length;i++) score+=Math.log((counts.get(t.slice(i,i+n))||0)+0.01);
    return score;
  };
}
assert.equal(first.length,28);assert.equal(held.length,28);assert.equal(corpus.length,66521);
for(const n of [3,4,5]) {
  const score=model(corpus,n);
  const ranked=[...perms([0,1,2,3,4,5,6])].map(k=>({k, train:decode(first,k), score:score(decode(first,k))})).sort((a,b)=>b.score-a.score);
  const historicalRank=ranked.findIndex(x=>x.k.map(j=>j+1).join('')==='1736254')+1;
  const winner=ranked[0];
  console.log(JSON.stringify({n, count:ranked.length, historicalRank, key:winner.k.map(j=>j+1).join(''), train:winner.train, score:winner.score, secondScore:ranked[1].score, withheld:decode(held,winner.k)}));
  if(n===4||n===5) {
    assert.equal(winner.k.map(j=>j+1).join(''),'1736254');
    assert.equal(winner.train+decode(held,winner.k),'TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133');
  }
}
