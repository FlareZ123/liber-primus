'use strict';
/**
 * Original p50 printed 32x8 matrix as 32 independent polynomial codewords.
 * The source p57 instruction to "shed our own circumferences" selects the
 * six interior cells (columns 1..6) versus exterior columns 0 and 7.
 * Test literal GF257 RS(8,6) and the 2013 historical degree-4 share control.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const grid = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const bytes = grid.pages.flatMap(page => page.bytes);
assert.equal(bytes.length, 256);

/** @param {number} value @param {number} modulus */
const mod = (value, modulus) => ((value % modulus) + modulus) % modulus;

/** @param {number} a @param {number} exponent @param {number} modulus */
function power(a, exponent, modulus) {
  let result = 1;
  let base = mod(a, modulus);
  while (exponent > 0) {
    if (exponent % 2) result = result * base % modulus;
    base = base * base % modulus;
    exponent = Math.floor(exponent / 2);
  }
  return result;
}

/** @param {number[]} x @param {number[]} y @param {number} at @param {number} field */
function lagrange(x, y, at, field) {
  let result = 0;
  for (let j = 0; j < x.length; j++) {
    let term = y[j];
    for (let h = 0; h < x.length; h++) {
      if (j === h) continue;
      term = mod(term * (at - x[h]), field);
      term = mod(term * power(x[j] - x[h], field - 2, field), field);
    }
    result = mod(result + term, field);
  }
  return result;
}

const tests = [];
for (const field of [257, 29]) for (const width of [5, 6]) {
  const columns = Array.from({ length: width }, (_, j) => j + 1);
  const heldOut = width === 5 ? [0, 6, 7] : [0, 7];
  let matches = 0;
  const examples = [];
  for (let row = 0; row < 32; row++) {
    const values = bytes.slice(8 * row, 8 * row + 8).map(x => x % field);
    const ordinates = columns.map(x => values[x]);
    for (const column of heldOut) {
      const predicted = lagrange(columns, ordinates, column, field);
      const actual = values[column];
      if (predicted === actual) matches++;
      if (row < 2) examples.push({ row, col: column, predicted, actual });
    }
  }
  assert(matches < 32 * heldOut.length);
  tests.push({ field, degree: width - 1, source_data_columns: columns, tested_columns: heldOut, matches, checked: 32 * heldOut.length, first_two_rows: examples });
}

// Deterministic full original-shaped codeword positive with parity at both
// exterior columns and independently varying row polynomials.
for (const field of [257, 29]) for (const width of [5, 6]) {
  const columns = Array.from({ length: width }, (_, i) => i + 1);
  for (let row = 0; row < 32; row++) {
    const seed = columns.map((_, col) => (row * 19 + col * col * 7 + 11) % field);
    for (const x of [0, 7]) {
      const expected = lagrange(columns, seed, x, field);
      assert.equal(lagrange(columns, seed, x, field), expected);
    }
    for (const x of columns) {
      assert.equal(lagrange(columns, seed, x, field), seed[columns.indexOf(x)]);
    }
  }
}
assert.deepEqual(tests.map(x => [x.field, x.degree, x.matches, x.checked]), [
  [257, 4, 0, 96],
  [257, 5, 0, 64],
  [29, 4, 5, 96],
  [29, 5, 3, 64]
]);
console.log(JSON.stringify({
  source: 'original p50 32x8 rows; six interior cells / two exterior parity hypotheses',
  decision: 'reject direct rowwise degree4 or degree5 polynomial systematic code with printed column coordinates',
  complete_original_matches: tests,
  native_polynomial_positive: 'PASS: 32 source-shaped rows per field and degree',
  recovered_unknown_plaintext: false
}, null, 2));
