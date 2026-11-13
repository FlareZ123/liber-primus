#!/usr/bin/env node
'use strict';

/**
 * Source-fixed GP29 product-code extension of the final 180 solved LP2 runes.
 *
 * Human-readable decision: im-results/lp2-terminal-hg-product-code-parity.md
 * Run: node sims/lp2_terminal_hg_product_code_parity_sft.cjs
 *
 * No secret keys, fitted plaintext, position offsets, or corpus scores are used.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

/** @param {number} x @returns {number} */
const mod = (x) => ((x % 29) + 29) % 29;

/** @param {number} a @returns {number} */
function inverse(a) {
  for (let x = 1; x < 29; x++) {
    if (mod(x * a) === 1) return x;
  }
  throw new Error('Nonunit in GF29: ' + a);
}

/**
 * X^n reduced modulo quadratic f(X)=f[0]+f[1]X+f[2]X^2.
 * @param {number} n
 * @param {number[]} f
 * @returns {number[]}
 */
function powerRemainder(n, f) {
  const inv = inverse(f[2]);
  let lo = 1;
  let hi = 0;
  for (let i = 0; i < n; i++) {
    [lo, hi] = [mod(-f[0] * inv * hi), mod(lo - f[1] * inv * hi)];
  }
  return [lo, hi];
}

/**
 * Restore the leading and trailing GF29 parity cells of a length-n codeword.
 * Known interior slots are in printed left-to-right or top-to-bottom order.
 * @param {number[]} interior
 * @param {number[]} factor
 * @returns {number[]}
 */
function extendEndpoints(interior, factor) {
  const n = interior.length + 2;
  const powers = Array.from({ length: n }, (_, j) =>
    powerRemainder(n - j - 1, factor));
  let r0 = 0;
  let r1 = 0;
  for (let j = 0; j < interior.length; j++) {
    r0 = mod(r0 + interior[j] * powers[j + 1][0]);
    r1 = mod(r1 + interior[j] * powers[j + 1][1]);
  }
  const first = mod(-r1 * inverse(powers[0][1]));
  const last = mod(-r0 - first * powers[0][0]);
  return [first, ...interior, last];
}

/**
 * Evaluate descending-order coefficient sequence in GF29[X]/(factor).
 * @param {number[]} word
 * @param {number[]} factor
 * @returns {number[]}
 */
function remainder(word, factor) {
  const inv = inverse(factor[2]);
  let lo = 0;
  let hi = 0;
  for (const symbol of word) {
    [lo, hi] = [
      mod(-factor[0] * inv * hi + symbol),
      mod(lo - factor[1] * inv * hi),
    ];
  }
  return [lo, hi];
}

/**
 * Unique 32-by-8 product-code extension from the 30-by-6 known interior.
 * @param {number[]} known180
 * @param {number[]} horizontal
 * @param {number[]} vertical
 * @returns {number[][]}
 */
function productExtend(known180, horizontal, vertical) {
  assert.equal(known180.length, 180);
  const matrix = Array.from({ length: 32 }, () => Array(8).fill(0));
  for (let row = 1; row <= 30; row++) {
    matrix[row] = extendEndpoints(
      known180.slice((row - 1) * 6, row * 6), horizontal);
  }
  for (let col = 0; col < 8; col++) {
    const column = extendEndpoints(
      Array.from({ length: 30 }, (_, row) => matrix[row + 1][col]),
      vertical);
    matrix[0][col] = column[0];
    matrix[31][col] = column[31];
  }
  for (const row of matrix) {
    assert.deepEqual(remainder(row, horizontal), [0, 0]);
  }
  for (let col = 0; col < 8; col++) {
    assert.deepEqual(remainder(matrix.map((row) => row[col]), vertical), [0, 0]);
  }
  assert.deepEqual(
    matrix.slice(1, 31).flatMap((row) => row.slice(1, 7)), known180);
  return matrix;
}

/**
 * Geometric top-left clockwise perimeter, retaining every original corner once.
 * @param {number[][]} matrix
 * @returns {number[]}
 */
function clockwiseBorder(matrix) {
  assert.equal(matrix.length, 32);
  assert.ok(matrix.every((row) => row.length === 8));
  const out = [...matrix[0]];
  for (let row = 1; row < 32; row++) out.push(matrix[row][7]);
  for (let col = 6; col >= 0; col--) out.push(matrix[31][col]);
  for (let row = 30; row >= 1; row--) out.push(matrix[row][0]);
  assert.equal(out.length, 76);
  return out;
}

/**
 * GP29 lexical encoding, longest available digraph first, within each word.
 * @param {string} text
 * @param {string[]} glyphNames
 * @returns {number[]}
 */
function encodeGP(text, glyphNames) {
  const ranked = glyphNames.map((name, index) => ({ name, index }))
    .sort((a, b) => b.name.length - a.name.length);
  const result = [];
  for (const word of text.split(/\s+/)) {
    for (let i = 0; i < word.length;) {
      const token = ranked.find((entry) => word.startsWith(entry.name, i));
      assert.ok(token, 'Unrepresentable GP sequence: ' + word.slice(i));
      result.push(token.index);
      i += token.name.length;
    }
  }
  return result;
}

/** @param {number[]} data @returns {number} */
function ioc(data) {
  const counts = Array(29).fill(0);
  data.forEach((x) => counts[x]++);
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (data.length * (data.length - 1));
}

/** @param {number[]} a @param {number[]} b @returns {number} */
function matches(a, b) {
  assert.equal(a.length, b.length);
  return a.filter((v, i) => v === b[i]).length;
}

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const table = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));

assert.equal(table.bytes.length, 256);
assert.equal(
  createHash('sha256').update(Buffer.from(table.bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const original55 = corpus.pages.find((page) => page.page === 55).indices;
const solved57 = corpus.pages.find((page) => page.page === 57).indices;
const solved56text =
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO ' +
  'IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const solved56 = encodeGP(solved56text, corpus.translit);
assert.deepEqual([original55.length, solved56.length, solved57.length],
  [76, 85, 95]);
const known180 = solved56.concat(solved57);
const grid = Array.from({ length: 32 }, (_, row) =>
  table.bytes.slice(row * 8, (row + 1) * 8).map((byte) => byte % 29));
const originalBorder = clockwiseBorder(grid);
const H = [3, 26, 24]; // signed 2013 BASE29(3301) = 3QO
const G = [27, 5, 15]; // original p39 marked red 3-rune inscription
// The printed p50 table has a *global* H*G factor. That is distinct
// from the much stronger row-by-row / column-by-column product code.
const originalRowCodewords = grid.filter((row) =>
  remainder(row, H).every((x) => x === 0)).length;
const originalColumnCodewords = Array.from({ length: 8 }, (_, col) =>
  remainder(grid.map((row) => row[col]), G).every((x) => x === 0))
  .filter(Boolean).length;
assert.equal(originalRowCodewords, 0);
assert.equal(originalColumnCodewords, 0);
assert.deepEqual(remainder(grid[0], H), [8, 19]);
assert.deepEqual(remainder(grid.map((row) => row[0]), G), [9, 8]);

const rows = [];
for (const [name, horizontal0, vertical0] of [
  ['H/G', H, G], ['G/H', G, H],
]) {
  for (let horizontalReverse = 0; horizontalReverse < 2; horizontalReverse++) {
    for (let verticalReverse = 0; verticalReverse < 2; verticalReverse++) {
      const horizontal = horizontalReverse ? horizontal0.slice().reverse() : horizontal0;
      const vertical = verticalReverse ? vertical0.slice().reverse() : vertical0;
      const reconstructed = productExtend(known180, horizontal, vertical);
      const parity = clockwiseBorder(reconstructed);
      const difference = originalBorder.map((v, i) => mod(v - parity[i]));
      const inverseDifference = difference.map((v) => mod(-v));
      const decoded = original55.map((v, i) => mod(v - parity[i]));
      rows.push({
        model: name, horizontalReverse, verticalReverse,
        borderMatches: matches(original55, parity),
        subtractiveMatches: matches(original55, difference),
        additiveMatches: matches(original55, inverseDifference),
        outputIoc: ioc(decoded),
        firstSymbols: decoded.slice(0, 30)
          .map((x) => corpus.translit[x]).join(''),
      });
      // A genuine word created by this exact product code survives the
      // same extension and all 32 row and 8 column parity checks.
      if (rows.length === 1) {
        const altered = reconstructed.map((row) => row.slice());
        altered[0][0] = mod(altered[0][0] + 1);
        assert.notDeepEqual(remainder(altered[0], horizontal), [0, 0]);
      }
    }
  }
}
assert.deepEqual(rows.slice(0, 1).map(({ borderMatches, subtractiveMatches, additiveMatches }) =>
  [borderMatches, subtractiveMatches, additiveMatches]), [[5, 1, 1]]);
assert.ok(Math.abs(rows[0].outputIoc - 0.034035087719298245) < 1e-13);
assert.ok(rows.every((row) => row.borderMatches <= 6 && row.subtractiveMatches <= 3 &&
  row.additiveMatches <= 5 && row.outputIoc < 0.04));
console.log(JSON.stringify({
  source: { known180: known180.length, ciphertext55: original55.length,
    tableCells: table.bytes.length, original55Ioc: ioc(original55),
    originalRowCodewords, originalColumnCodewords },
  models: rows,
  decision: 'No 76-rune p55 recovery or literal parity-to-ciphertext match.',
}, null, 2));
