'use strict';

/**
 * Original source-conditioned test for one terminal 32x8 separable additive
 * decoding architecture. Uses authenticated p56 plaintext, literal p57 and
 * the derived 256 byte table; all 76 original p55 rune values stay withheld.
 *
 * SFT (Windows Node.js 20+): node sims/lp2_terminal256_separable_interior_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} file */
const readJson = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const grid = readJson('resources/liber-primus/lp2-grid-256.json');
/** @param {number} a */
const mod = a => ((a % 29) + 29) % 29;

/** @param {number} count */
function firstPrimes(count) {
  /** @type {number[]} */
  const out = [];
  for (let value = 2; out.length < count; value++) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= value; divisor++) {
      if (value % divisor === 0) { prime = false; break; }
    }
    if (prime) out.push(value);
  }
  return out;
}

const keys = firstPrimes(85);
const sourceP56 = corpus.pages[56].indices;
const sourceP57 = corpus.pages[57].indices;
assert.equal(sourceP56.length, 85);
assert.equal(sourceP57.length, 95);
assert.equal(sourceP56[56], 0, 'original literal-F skip');
let keyCursor = 0;
const decodedP56 = sourceP56.map((c, pos) => pos === 56
  ? c : mod(c - (keys[keyCursor++] - 1)));
assert.equal(keyCursor, 84);
assert.deepEqual(decodedP56.slice(0, 5), [24, 9, 18, 9, 23], 'AN END');
const known = [...decodedP56, ...sourceP57];
assert.equal(known.length, 180);
assert.equal(grid.bytes.length, 256);

/**
 * Lay the 180 known runes into the 30x6 interior of the printed 32x8
 * table, in original row-major order. A hypothetical cipher
 * B[r,c] = P[r,c] + rowKey[r] + colKey[c] (mod 29) must have vanishing
 * curvature R[r,c]+R[r+1,c+1]-R[r+1,c]-R[r,c+1].
 * @param {number[]} knownRunes
 * @param {number[]} tableBytes
 */
function testSeparable(knownRunes, tableBytes) {
  let cursor = 0;
  const residuals = Array.from({length: 30}, (_, r) =>
    Array.from({length: 6}, (_, c) =>
      mod(tableBytes[(r + 1) * 8 + c + 1] - knownRunes[cursor++])));
  const first = residuals[0][0];
  const rowKeys = residuals.map(row => row[0]);
  const colKeys = residuals[0].map(v => mod(v - first));
  let matchingCells = 0;
  for (let r = 0; r < 30; r++) {
    for (let c = 0; c < 6; c++) {
      matchingCells += Number(residuals[r][c] === mod(rowKeys[r] + colKeys[c]));
    }
  }
  let matchingRectangles = 0;
  for (let r = 0; r < 29; r++) {
    for (let c = 0; c < 5; c++) {
      matchingRectangles += Number(mod(
        residuals[r][c] + residuals[r + 1][c + 1]
        - residuals[r + 1][c] - residuals[r][c + 1]) === 0);
    }
  }
  return {matchingCells, totalCells: 180, matchingRectangles,
    totalRectangles: 145};
}

const original = testSeparable(known, grid.bytes);
assert.deepEqual(original, {matchingCells: 37, totalCells: 180,
  matchingRectangles: 3, totalRectangles: 145});
const printedP56Alternative = testSeparable([...sourceP56, ...sourceP57], grid.bytes);
assert.equal(printedP56Alternative.matchingRectangles, 9);

// Positive plant: exact same source-known 180-symbol register, but
// the table's interior is deliberately enciphered by a row+column key.
const plant = grid.bytes.slice();
for (let r = 0; r < 30; r++) {
  for (let c = 0; c < 6; c++) {
    const i = r * 6 + c;
    plant[(r + 1) * 8 + c + 1] =
      mod(known[i] + mod(7 * r + 3) + mod(11 * c + 5));
  }
}
const positive = testSeparable(known, plant);
assert.deepEqual(positive, {matchingCells: 180, totalCells: 180,
  matchingRectangles: 145, totalRectangles: 145});
console.log(JSON.stringify({
  register: 'genuine p56 prime-totient/F plaintext + clear p57',
  original, printedP56Alternative, positive,
  conclusion: 'No row+column additive GP29 inverse in frozen 32x8 perimeter/interior map'
}, null, 2));
