'use strict';

/**
 * Source-root GF29 cubic syndrome across original p28, p33 and p29.
 * Reads only checked-in LP2 corpus. Windows/Node.js 22, read-only.
 * The source selection and packet interpretation remain provisional.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const pages = corpus.pages;
const M = x => ((x % 29) + 29) % 29;

/** @param {number} v @param {number} mod @returns {number} */
function inverse(v, mod) {
  for (let a = 1; a < mod; a++) if ((v * a) % mod === 1) return a;
  throw new Error('nonunit');
}
/** @param {number} x @param {number} e @param {number} mod @returns {number} */
function power(x, e, mod) {
  let y = 1;
  for (let i = 0; i < e; i++) y = (y * x) % mod;
  return y;
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a, b) {
  const c = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) c[i + j] = M(c[i + j] + a[i] * b[j]);
  return c;
}
/** @param {number[]} a @param {number[]} b @returns {{quotient:number[],remainder:number[]}} */
function divide(a, b) {
  const r = a.slice(), q = [], b0 = inverse(b[0], 29);
  for (let i = 0; i <= a.length - b.length; i++) {
    const z = M(r[i] * b0);
    q.push(z);
    for (let j = 0; j < b.length; j++) r[i + j] = M(r[i + j] - z * b[j]);
  }
  return {quotient: q, remainder: r.slice(-b.length + 1)};
}
/** @param {number[]} a @param {number} x @returns {[number,number]} */
function jet(a, x) {
  let v = 0, dv = 0;
  for (const c of a) { dv = M(dv * x + v); v = M(v * x + c); }
  return [v, dv];
}
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const freq = Array(29).fill(0);
  for (const v of values) freq[v]++;
  return freq.reduce((n, v) => n + v * (v - 1), 0) / (values.length * (values.length - 1));
}
/** @param {number[]} q @param {number[]} r @param {number[]} g @returns {number[]} */
function restore(q, r, g) {
  const a = multiply(q, g);
  for (let i = 0; i < r.length; i++) a[a.length - r.length + i] = M(a[a.length - r.length + i] + r[i]);
  return a;
}

// Original p39 red triple is GP indices [27,5,15] at 119..121.
assert.deepEqual(pages[39].indices.slice(119, 122), [27, 5, 15]);
const root = 24;
const G = [15, 5, 27];
assert.deepEqual(jet(G, root), [0, 0]);

// Previous signed-DH23 bridge selects reversible GP29 exponent 3.
const p = 23, expectedG = 5, expectedK = 2, expectedA = 8, expectedB = 19;
const aDH = 6;
const e = M(expectedG - expectedK);
assert.equal(e, M(aDH * inverse(expectedK, 29)));
assert.equal(e, 3);
assert.deepEqual([power(expectedK, e, 29), power(expectedA, e, 29), power(expectedB, e, 29)], [8, 19, 15]);
const Q = multiply(G, [1, M(-e)]);
assert.deepEqual(Q, [15, 18, 12, 6]);

const r28 = divide(pages[28].indices, Q);
const r33 = divide(pages[33].indices, Q);
const r29 = divide(pages[29].indices, Q);
assert.deepEqual(r28.remainder, [17, 27, 12]);
assert.deepEqual(r33.remainder, r28.remainder);
assert.deepEqual(r29.remainder, [0, 0, 0]);
assert.deepEqual(jet(pages[28].indices, root), [12, 2]);
assert.deepEqual(jet(pages[33].indices, root), [12, 2]);
assert.deepEqual(jet(pages[29].indices, root), [0, 0]);
for (const [pnum, r] of [[28, r28], [33, r33], [29, r29]]) {
  assert.deepEqual(restore(r.quotient, r.remainder, Q), pages[pnum].indices);
}

const reduced = pages.slice(0, 56).filter(q => q.indices.length >= 4).map(q => ({page: q.page, R: divide(q.indices, Q).remainder}));
const families = new Map();
for (const entry of reduced) {
  const key = entry.R.join(',');
  const list = families.get(key) || [];
  list.push(entry.page);
  families.set(key, list);
}
assert.deepEqual([...families].filter(([key, nums]) => nums.length > 1), [['17,27,12', [28, 33]]]);
assert.deepEqual([...families].filter(([key]) => key === '0,0,0').map(([key, nums]) => nums), [[29]]);

// Recover all seven toy DH fields via a retrospectively interpreted packet.
const R = r28.remainder;
const ka = R[2];
const g = M(R[0] - ka);
const bDH = M(R[1] - ka);
const K = jet(pages[28].indices, root)[1];
const recoveredA = M(ka * inverse(K, 29));
const A = power(g, recoveredA, p);
const B = power(g, bDH, p);
assert.deepEqual({p, g, a: recoveredA, b: bDH, A, B, K, ka},
  {p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, ka: 12});
assert.equal(power(A, bDH, p), K);
assert.equal(power(B, recoveredA, p), K);

const p29 = pages[29].indices;
assert.deepEqual(p29.slice(0, 3), [K, p, recoveredA]);
assert.deepEqual(p29.slice(-6), [g, M(A - B), ka, recoveredA, A, B]);

// G parity predicts the two original p29 terminal GP runes from first 275.
const prediction = p29.slice();
prediction[prediction.length - 2] = 0;
prediction[prediction.length - 1] = 0;
const last = divide(prediction, G).remainder.map(x => M(-x));
assert.deepEqual(last, [A, B]);

// Independent full-native solved-p57 positive controls of cubic quotient.
const solved = pages[57].indices;
for (const [num, original] of [[28, r28], [33, r33], [29, r29]]) {
  const plant = Array.from({length: original.quotient.length}, (_, i) => solved[i % solved.length]);
  const encrypted = restore(plant, original.remainder, Q);
  assert.deepEqual(divide(encrypted, Q), {quotient: plant, remainder: original.remainder});
  console.log('page', num, 'Q quotient length', original.quotient.length,
    'original quotient IoC', ioc(original.quotient).toFixed(9),
    'solved-p57 plant IoC', ioc(plant).toFixed(9));
}
console.log('Q(X)=', Q.join(','), 'p28/p33 unique R=', R.join(','), 'p29 R=0');
console.log('recovered historical DH:', JSON.stringify({p, g, a: recoveredA, b: bDH, A, B, K, ka}));
console.log('p29 original prefix predicts terminal A,B:', JSON.stringify(last));
console.log('PASS: 55-page syndrome census, original replay, three native plants');
