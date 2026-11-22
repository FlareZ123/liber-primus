'use strict';
/**
 * Original moth/p05 phrase versus LP2 p55 terminal 30-rune conditional crib.
 * Exhaust all stationary secret total-degree <=2 GF29 key recurrences with
 * unrestricted initial state and 1..5 previous symbols. No fitted parameters.
 * Run: node sims/lp2_moth_terminal30_quadratic_state_sft.cjs
 * Uses Node22 built-ins; no writes or network.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const db = JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const reference = fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8');
assert.match(reference, /THE TOTIENT FUNCTION IS SACRED\s+ALL THINGS SHOULD BE ENCRYPTED/);
const C = db.pages.find(p => p.page === 55).indices;
assert.equal(C.length, 76);
const phrase = 'THE TOTIENT FUNCTION IS SACRED ALL THINGS';
const tokens = db.translit.map((t, i) => ({t, i})).sort((a, b) => b.t.length - a.t.length);

/**
 * Source-native GP spelling; ING -> NG rune, IO -> IA rune.
 * @param {string} input
 * @returns {number[]}
 */
function toGP(input) {
  const normalized = input.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const result = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const rest = word.slice(i);
      if (rest.startsWith('ING')) {
        result.push(db.translit.indexOf('NG')); i += 3;
      } else if (rest.startsWith('IO')) {
        result.push(db.translit.indexOf('IA')); i += 2;
      } else {
        const token = tokens.find(x => rest.startsWith(x.t));
        assert(token, 'Unmapped GP source spelling ' + rest);
        result.push(token.i); i += token.t.length;
      }
    }
  }
  return result;
}
const P = toGP(phrase);
assert.equal(P.length, 30);
const ciphertext = C.slice(-30);
const mod = x => (x % 29 + 29) % 29;

/** @param {number} v @returns {number} */
function inverse(v) {
  assert(v !== 0);
  for (let x = 1; x < 29; x++) if (mod(v * x) === 1) return x;
  throw new Error('No GF29 inverse');
}

/** Basis 1,X1..Xn,Xi*Xj for i<=j, with newest state variable first.
 * @param {number[]} v
 * @returns {number[]}
 */
function terms(v) {
  const result = [1, ...v];
  for (let i = 0; i < v.length; i++) {
    for (let j = i; j < v.length; j++) result.push(mod(v[i] * v[j]));
  }
  return result;
}

/** Exact Gaussian rank, over GF29, on a rectangular matrix.
 * @param {number[][]} rows
 * @returns {number}
 */
function rank(rows) {
  const a = rows.map(row => row.slice()), cols = a[0].length;
  let r = 0;
  for (let col = 0; col < cols && r < a.length; col++) {
    let p = r;
    while (p < a.length && a[p][col] === 0) p++;
    if (p === a.length) continue;
    [a[r], a[p]] = [a[p], a[r]];
    const inv = inverse(a[r][col]);
    for (let j = col; j < cols; j++) a[r][j] = mod(a[r][j] * inv);
    for (let k = r + 1; k < a.length; k++) {
      const factor = a[k][col];
      if (!factor) continue;
      for (let j = col; j < cols; j++) a[k][j] = mod(a[k][j] - factor * a[r][j]);
    }
    r++;
  }
  return r;
}

/** Unknown stationary GF29 polynomial and unrestricted initial state.
 * @param {number[]} key
 * @param {number} order
 */
function test(key, order) {
  const rows = [], rhs = [];
  for (let t = order; t < key.length; t++) {
    rows.push(terms(key.slice(t - order, t).reverse()));
    rhs.push(key[t]);
  }
  const r = rank(rows);
  const augmented = rank(rows.map((row, i) => [...row, rhs[i]]));
  return {order, coefficients: rows[0].length, equations: rows.length,
    rank: r, augmentedRank: augmented, consistent: r === augmented};
}

// Plant a source-independent, genuinely reversible nonlinear five-state
// recurrence: K_t = 1 + K_(t-5) + 2*K_(t-1)^2 mod 29.
const plant = [3, 5, 7, 11, 13];
for (let t = 5; t < 30; t++) plant.push(mod(1 + plant[t-5] + 2*plant[t-1]**2));
assert(test(plant, 5).consistent);
const reconstructed = plant.slice();
for (let t = 29; t >= 5; t--)
  reconstructed[t-5] = mod(reconstructed[t] - 1 - 2*reconstructed[t-1]**2);
assert.deepEqual(reconstructed, plant);

// Both standard additive sign conventions are included. All secret
// polynomial coefficients and first 1..5 states are granted.
const keys = [
  {model: 'C-P', values: ciphertext.map((x, i) => mod(x - P[i]))},
  {model: 'C+P', values: ciphertext.map((x, i) => mod(x + P[i]))}
];
const results = keys.map(k => ({
  model: k.model, requiredKey: k.values,
  tests: Array.from({length: 5}, (_, i) => test(k.values, i + 1))
}));
for (const record of results) {
  assert.deepEqual(record.tests.map(t => t.consistent), Array(5).fill(false));
  assert.deepEqual(record.tests.map(t => t.augmentedRank - t.rank), Array(5).fill(1));
}
console.log(JSON.stringify({
  source: 'LP1 p05 moth + exact printed source phrase; LP2 p55 original 76 runes',
  originalLast30: ciphertext,
  conditionalCrib: phrase, cribRuneIndices: P,
  syntheticFiveStateReversiblePlant: true,
  results,
  conclusion: '0/10 arbitrary secret degree<=2 GF29 recurrences, orders 1..5, fit the conditional crib. No unknown plaintext or author-selected key.'
}, null, 2));
