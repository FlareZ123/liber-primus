'use strict';

/**
 * Original-source HxG quotient vs. LP2 encrypted-stream adjacent-repeat gate.
 * A measurable cipher-register discriminator, not a plaintext decoder.
 * Windows Node.js 22, CommonJS, no dependencies, no writes.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} filename @returns {unknown} */
function json(filename) {
  return JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', filename), 'utf8'));
}
/** @param {number} x @returns {number} */
function gf(x) { return ((x % 29) + 29) % 29; }
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) out[i + j] = gf(out[i + j] + a[i] * b[j]);
  }
  return out;
}
/** @param {number[]} a @returns {number} */
function adjacentPairs(a) {
  return a.slice(1).reduce((n, x, i) => n + Number(x === a[i]), 0);
}

const book = json('resources/liber-primus/lp2-corpus.json');
const grid = json('resources/liber-primus/lp2-grid-256.json');
const original = book.pages.slice(0, 56).flatMap((page) => page.indices);
const bytes = grid.pages.flatMap((p) => p.bytes);
assert.equal(original.length, 12956);
assert.equal(bytes.length, 256);
assert.equal(bytes[0], 203);
assert.equal(adjacentPairs(original), 86);

const Hhigh = [24, 26, 3];  // signed 2013 BASE29 3301=3QO, high-first
const Ghigh = [15, 5, 27];  // original p39 red triad, high-first
const D = multiply(Hhigh, Ghigh);
assert.deepEqual(D, [12, 17, 11, 21, 23]);
const residual = bytes.map(gf);
const quotient = [];
const inverseLeading = 17;  // 12*17 = 1 mod29
for (let i = 0; i < 252; i++) {
  const digit = gf(residual[i] * inverseLeading);
  quotient.push(digit);
  for (let j = 0; j < 5; j++) {
    residual[i + j] = gf(residual[i + j] - digit * D[j]);
  }
}
assert.deepEqual(residual.slice(-4), [0, 0, 0, 0]);
assert.deepEqual(quotient.slice(0, 10), [0, 12, 9, 28, 2, 25, 23, 21, 18, 28]);
assert.equal(quotient.length, 252);
assert.equal(adjacentPairs(quotient), 8);
assert.equal(adjacentPairs(bytes.map(gf)), 13);

const length = quotient.length;
const repeatFlags = original.slice(1).map((v, i) => Number(v === original[i]));
let seen = repeatFlags.slice(0, length - 1).reduce((s, b) => s + b, 0);
/** @type {number[]} */
const counts = [seen];
for (let start = 1; start <= original.length - length; start++) {
  seen += repeatFlags[start + length - 2] - repeatFlags[start - 1];
  counts.push(seen);
}
const histogram = {};
for (const n of counts) histogram[n] = (histogram[n] || 0) + 1;
assert.equal(counts.length, 12705);
assert.deepEqual(histogram, {
  0: 2193, 1: 4692, 2: 2767, 3: 1668, 4: 1077, 5: 306, 6: 2
});
assert.equal(Math.max(...counts), 6);
assert.ok(counts.every((v) => v < adjacentPairs(quotient)));

console.log(JSON.stringify({
  class: 'original-cipher-register-comparison-no-unknown-plaintext',
  originalUnknownRunes: original.length,
  quotientGP29Runes: quotient.length,
  quotientAdjacentEqual: adjacentPairs(quotient),
  base60ByteGPResidueAdjacentEqual: adjacentPairs(bytes.map(gf)),
  sourceUnknownBookAdjacentEqual: adjacentPairs(original),
  original252RuneWindows: counts.length,
  originalWindowAdjacentEqualHistogram: histogram,
  maximumOriginalWindowEqual: 6,
  interpretation: 'Q252 has ordinary random-like adjacency, unlike known LP2 unknown ciphertext; not a cipher-method or key proof.'
}, null, 2));
