'use strict';

/**
 * Original-source, all-secret GP29 LFSR test using the p29/p39/DH cubic.
 * Windows 11 / Node.js 22. Run: node sims/lp2_p29_dh_q_cubic_lfsr_allstates_sft.cjs
 *
 * Candidate ONLY: Q(x)=15(x-3)(x-24)^2 over GF(29) is treated as
 * a characteristic polynomial for an additive mask, with arbitrary
 * independent private three-symbol initial states on each page.
 * This is not a historically authenticated encryption operation.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const pages = corpus.pages;
const MOD = 29;
/** @param {number} x @returns {number} */
function mod(x) { return ((x % MOD) + MOD) % MOD; }

/** @param {number[]} seed @param {number} n @returns {number[]} */
function keystream(seed, n) {
  const out = seed.slice();
  for (let i = 3; i < n; i++) {
    out.push(mod(22 * out[i - 1] + 5 * out[i - 2] + 17 * out[i - 3]));
  }
  return out.slice(0, n);
}

/** @param {number[]} cipher @param {number[]} key @returns {number[]} */
function decode(cipher, key) {
  return cipher.map((x, i) => mod(x - key[i]));
}

/** @param {number[]} plain @param {number[]} key @returns {number[]} */
function encode(plain, key) {
  return plain.map((x, i) => mod(x + key[i]));
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const freq = Array(MOD).fill(0);
  for (const value of values) freq[value]++;
  return freq.reduce((sum, v) => sum + v * (v - 1), 0)
    / (values.length * (values.length - 1));
}

/**
 * IOC after exact GP29 additive inverse, evaluated without allocating
 * decoded sequences.
 * @param {number[]} cipher
 * @param {number[]} key
 * @returns {number}
 */
function decodedIoc(cipher, key) {
  const freq = Array(MOD).fill(0);
  for (let i = 0; i < cipher.length; i++) freq[mod(cipher[i] - key[i])]++;
  return freq.reduce((sum, v) => sum + v * (v - 1), 0)
    / (cipher.length * (cipher.length - 1));
}

// Source: p39 red [27,5,15], p29 edge, and signed 2013 toy DH.
// Q(X) = 15X^3+18X^2+12X+6 in high-first coefficient order.
// Its order-three recurrence is k[n+3]=22k[n+2]+5k[n+1]+17k[n] (mod29).
assert.deepEqual(pages[39].indices.slice(119, 122), [27, 5, 15]);
assert.deepEqual(pages[29].indices.slice(0, 3), [2, 23, 6]);
assert.deepEqual(pages[29].indices.slice(-6), [5, 18, 12, 6, 8, 19]);

const targets = [
  { page: 28, data: pages[28].indices },
  { page: 29, data: pages[29].indices.slice(3, 272) },
  { page: 33, data: pages[33].indices }
];
assert.deepEqual(targets.map(t => t.data.length), [269, 269, 214]);

const maxLen = Math.max(...targets.map(t => t.data.length));
const answers = targets.map(t => ({
  page: t.page, length: t.data.length,
  bestIoc: -1, bestSeed: null, above0045: 0, above005: 0
}));

let total = 0;
for (let k0 = 0; k0 < MOD; k0++) {
  for (let k1 = 0; k1 < MOD; k1++) {
    for (let k2 = 0; k2 < MOD; k2++) {
      const seed = [k0, k1, k2];
      const key = keystream(seed, maxLen);
      total++;
      for (let t = 0; t < targets.length; t++) {
        const stat = answers[t];
        const score = decodedIoc(targets[t].data, key);
        if (score > stat.bestIoc) {
          stat.bestIoc = score;
          stat.bestSeed = seed;
        }
        if (score >= 0.045) stat.above0045++;
        if (score >= 0.05) stat.above005++;
      }
    }
  }
}
assert.equal(total, 24389);
assert.deepEqual(answers.map(x => x.bestSeed), [
  [6, 4, 28], [5, 16, 3], [8, 14, 14]
]);
const expectedMax = [
  0.03911668423680852, 0.03972701548021972, 0.04159536659207582
];
answers.forEach((v, i) => {
  assert.ok(Math.abs(v.bestIoc - expectedMax[i]) < 1e-12);
  assert.equal(v.above0045, 0);
  assert.equal(v.above005, 0);
});

// Independent original solved p57 PARABLE ciphertext-free GP29 source-native
// English, cycled only to fill the same target lengths for coding controls.
const p57 = pages[57].indices;
assert.equal(p57.length, 95);
const control = targets.map((t, i) => {
  const plain = Array.from({ length: t.data.length },
    (_, j) => p57[(j + i * 13) % p57.length]);
  const key = keystream([2, 23, 6], plain.length);
  const cipher = encode(plain, key);
  assert.deepEqual(decode(cipher, key), plain);
  const nativeIoc = ioc(plain);
  assert.ok(nativeIoc >= 0.06);
  assert.ok(Math.abs(decodedIoc(cipher, key) - nativeIoc) < 1e-12);
  return { page: t.page, nativeIoc, maskedIoc: ioc(cipher),
    recovered: plain.length };
});
assert.deepEqual(control.map(x => x.recovered), [269, 269, 214]);

// Any global nonzero GP29 affine change of an output is a permutation
// and preserves IOC. Any nonzero mask scale, sign or stream phase is
// represented by some already-enumerated three-symbol initial state,
// because the Q recurrence has invertible last coefficient 17.
console.log(JSON.stringify({
  hypothesis: 'Q cubic LFSR GP29 additive / global affine output',
  seedCount: total, answers, solvedP57NativePlants: control
}, null, 2));
console.log('PASS original 3-page exhaustive IV and positive-control replay');
