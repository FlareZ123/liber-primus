'use strict';
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

const T = 29 ** 4, M = 29 * 28 ** 3;
/** @param {number} x @returns {number[]} */
function digits(x) {
  const a = [];
  for (let j = 0; j < 4; j++) { a.unshift(x % 29); x = Math.floor(x / 29); }
  return a;
}
/** @param {number[]} a @returns {number} */
function rank(a) {
  let n = a[0];
  for (let i = 1; i < 4; i++) {
    if (a[i] === a[i - 1]) return -1;
    n = n * 28 + (a[i] - a[i - 1] + 29) % 29 - 1;
  }
  return n;
}
/** @param {number} n @returns {number[]} */
function unrank(n) {
  const d = [];
  for (let i = 0; i < 3; i++) { d.unshift(n % 28 + 1); n = Math.floor(n / 28); }
  const a = [n];
  for (const v of d) a.push((a.at(-1) + v) % 29);
  return a;
}
/** @param {number[]} a @returns {number} */
function num(a) { return a.reduce((x, d) => x * 29 + d, 0); }

const valid = Uint8Array.from({ length: T }, (_, i) => Number(rank(digits(i)) >= 0));
assert.equal(valid.reduce((a, b) => a + b, 0), M);

/** A deliberately simple complete-cycle permutation, for correctness only.
 * @param {number} x @param {1|-1} sign @returns {number} */
function walk(x, sign) {
  let t = x;
  do { t = (t + sign + T) % T; } while (!valid[t]);
  return t;
}

for (let i = 0; i < M; i++) {
  const x = num(unrank(i));
  assert.equal(rank(digits(x)), i);
  assert.equal(walk(walk(x, 1), -1), x);
}
const y = walk(0, 1), x = walk(y, -1);
assert.equal(valid[0], 0);
assert.equal(valid[x], 1);
assert.notEqual(x, 0);
assert.equal(walk(x, 1), y);

const primes = [];
for (let n = 2; primes.length < 85; n++)
  if (primes.every(p => n % p)) primes.push(n);
let keyPos = 0;
const p56 = corpus.pages.find(p => p.page === 56).indices
  .map((c, i) => i === 56 ? 0 : (c - (primes[keyPos++] - 1) % 29 + 29) % 29);
const expected = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const alphabet = corpus.translit.map((token, index) => ({token, index}))
  .sort((a,b)=>b.token.length-a.token.length);
const plain = [];
for (const word of expected.split(' ')) {
  for (let j = 0; j < word.length;) {
    const a = alphabet.find(({token})=>word.startsWith(token,j));
    assert.ok(a);
    plain.push(a.index);
    j += a.token.length;
  }
}
assert.deepEqual(p56, plain);

/** @param {number[]} a @param {number} phase */
function score(a, phase) {
  let blocks = 0, bad = 0, badPairs = 0;
  for (let i = phase; i + 4 <= a.length; i += 4) {
    const b = a.slice(i, i + 4);
    const reps = b.filter((v,j)=>j>0&&v===b[j-1]).length;
    blocks++;
    if (reps) { bad++; badPairs += reps; }
  }
  return {blocks,bad,badPairs};
}
const phases = [0,1,2,3];
const pp = corpus.pages.filter(p=>p.page<56&&p.indices.length);
const original = phases.map(phase=>pp.reduce((sum,p)=>{
  const s=score(p.indices,phase);
  return {blocks:sum.blocks+s.blocks,bad:sum.bad+s.bad,badPairs:sum.badPairs+s.badPairs};
},{blocks:0,bad:0,badPairs:0}));
const minima = pp.map(p=>Math.min(...phases.map(phase=>score(p.indices,phase).bad)));
assert.deepEqual(original.map(x=>x.bad),[54,72,65,63]);
assert.equal(minima.reduce((a,b)=>a+b,0),30);
assert.equal(minima.filter(x=>x>0).length,20);
const controls=[p56,corpus.pages.find(p=>p.page===57).indices].map(a=>phases.map(p=>score(a,p)));
assert.deepEqual(controls[0].map(x=>x.bad),[3,2,2,2]);
assert.deepEqual(controls[1].map(x=>x.bad),[1,1,0,1]);
console.log(JSON.stringify({T,M,roundtrips:M,collision:{outside:digits(0),inside:digits(x),output:digits(y)},original,minimumBadBlocks:minima.reduce((a,b)=>a+b,0),minimumFailingPages:minima.filter(x=>x>0).length,controls,status:'PASS'},null,2));
