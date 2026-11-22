'use strict';

/**
 * Original LP2 dual-quadratic polynomial division gate.
 *
 * Source-selected F(X) is the monic product of the signed-2013 BASE29
 * 3QO quadratic and the original p39 red quadratic (ascending GP coefficients).
 * Reproduces the exact 256-table codeword and tests all nine unmodified
 * visual LP2 chapters without a fitted phase/key.
 *
 * Run: node sims/lp2_dualquadratic_allchapter_division_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const load = name => JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus', name), 'utf8'));
const corpus = load('lp2-corpus.json');
const table = load('lp2-grid-256.json');
const mod = n => ((n % 29) + 29) % 29;
const multiply = (a, b) => {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) out[i + j] = mod(out[i + j] + a[i] * b[j]);
  }
  return out;
};
// Signed-2013 BASE29 3301 = [3,26,24] and original p39 red = [27,5,15].
const rawProduct = multiply([3,26,24], [27,5,15]);
assert.deepEqual(rawProduct, [23,21,11,17,12]);
const F = rawProduct.map(v => mod(v * 17)); // inverse of leading coefficient 12
assert.deepEqual(F, [14,9,13,28,1]);
const descending = [...F].reverse();
const asSource = seq => seq.map(mod);

/** @param {number[]} sequence */
function divide(sequence) {
  const residual = asSource(sequence);
  const quotient = [];
  for (let i = 0; i < sequence.length - 4; i++) {
    const pivot = residual[i];
    quotient.push(pivot);
    for (let j = 0; j < 5; j++) {
      residual[i + j] = mod(residual[i + j] - pivot * descending[j]);
    }
  }
  return {quotient, remainder: residual.slice(-4)};
}

/** @param {number[]} arr */
function ioc(arr) {
  const counts = Array(29).fill(0);
  for (const n of arr) counts[n]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (arr.length * (arr.length - 1));
}

const tableDiv = divide(table.bytes);
assert.equal(table.bytes.length, 256);
assert.deepEqual(tableDiv.remainder, [0,0,0,0], 'Dual-quadratic exact table factor');

const starts = [0,3,8,15,23,27,33,40,54,56];
const expectedLengths = [729,1145,1729,1903,1021,1433,1680,3008,308];
const expectedRemainders = [
  [9,3,17,26], [14,10,1,19], [16,21,1,7],
  [26,3,20,15], [9,6,13,4], [27,2,11,5],
  [7,7,8,0], [20,14,8,28], [9,3,19,21],
];
let trueSymbolCount = 0;
const chapterResults = starts.slice(0,-1).map((lo, k) => {
  const sequence = corpus.pages.filter(p => p.page >= lo && p.page < starts[k+1])
    .flatMap(p => p.indices);
  assert.equal(sequence.length, expectedLengths[k]);
  trueSymbolCount += sequence.length;
  const divided = divide(sequence);
  const reversed = divide([...sequence].reverse());
  assert.deepEqual(divided.remainder, expectedRemainders[k]);
  assert.ok(divided.remainder.some(v => v !== 0), 'Original chapter fails exact F codeword');
  // If direct original GP29 chapter had been made by multiplying a shorter
  // plaintext polynomial by F, its remainder would be zero.
  const originalControl = Array.from({length:sequence.length-4},
    (_, i) => corpus.pages[57].indices[i % corpus.pages[57].indices.length]);
  const plantedCipher = multiply([...originalControl].reverse(), F).reverse();
  assert.equal(plantedCipher.length, sequence.length);
  const planted = divide(plantedCipher);
  assert.deepEqual(planted.remainder, [0,0,0,0]);
  assert.deepEqual(planted.quotient, originalControl, 'Full-length original GP positive');
  return {
    chapter: k+1, firstPage: lo, lastPage: starts[k+1]-1,
    runes: sequence.length, originalIoC: ioc(sequence),
    dividedIoC: ioc(divided.quotient),
    reversedDividedIoC: ioc(reversed.quotient),
    remainder: divided.remainder,
  };
});
assert.equal(trueSymbolCount, 12956);
assert.equal(chapterResults.length, 9);
console.log('Signed-2013 3QO times p39 red factor, monic ascending:', F);
console.log('Original table: length 256, exact F remainder:', tableDiv.remainder);
console.log(JSON.stringify(chapterResults, null, 2));
console.log('PASS: 9/9 original chapters incompatible with direct shortened F-codeword,');
console.log('and neither direct division orientation yields a GP-English collision excess.');
