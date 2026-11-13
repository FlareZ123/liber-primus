'use strict';

/**
 * Solved p56 AN END + four solved p57 text units -> one-based prime ordinals
 * -> five untouched p49-51 numeric-table bytes -> 2016-style 8-way compass
 * -> original p32 11x11 HOME -> X.
 *
 * Original pages/cells only. Reader-independent navigation hypothesis,
 * with fixed zero-based/one-based and 256 cyclic-rotation counterfactuals.
 *
 * SFT (Node.js 22): node sims/lp2_terminal_fiveunit_grid_compass_homex_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(
  root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(
  root, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
assert.equal(grid.bytes.length, 256);
const page = (n) => corpus.pages.find((p) => p.page === n).indices;
const p32 = page(32), p56 = page(56), p57 = page(57);
assert.deepEqual([p32.length, p56.length, p57.length], [121, 85, 95]);
const mod = (x, n) => ((x % n) + n) % n;

/** @param {number} x @returns {boolean} */
function isPrime(x) {
  if (x < 2) return false;
  for (let k = 2; k * k <= x; k++) if (x % k === 0) return false;
  return true;
}
const ordinaryPrimes = [];
for (let n = 2; ordinaryPrimes.length < 220; n++) {
  if (isPrime(n)) ordinaryPrimes.push(n);
}

/** @param {number[]} runes @returns {number} */
function gpPrimeSum(runes) {
  return runes.reduce((sum, r) => sum + corpus.prime[r], 0);
}

/** Authentic historical source positive: p56 first five phi(prime) steps. */
const p56PlainTitle = p56.slice(0, 5).map((c, i) =>
  mod(c - (ordinaryPrimes[i] - 1), 29));
assert.deepEqual(p56PlainTitle, [24, 9, 18, 9, 23]);
assert.equal(p56PlainTitle.map((i) => corpus.translit[i]).join(''), 'ANEND');

// The four original printed p57 units are title and its three sentences,
// period-delimited at native rune lengths 7, 30, 30, 28, with no invented cuts.
assert.equal(p57.length, 95);
const units = [
  p56PlainTitle,
  p57.slice(0, 7),
  p57.slice(7, 37),
  p57.slice(37, 67),
  p57.slice(67, 95)
];
assert.deepEqual(units.map((a) => a.length), [5, 7, 30, 30, 28]);
const sums = units.map(gpPrimeSum);
assert.deepEqual(sums, [311, 449, 1259, 1031, 1229]);
const ordinals = sums.map((n) => ordinaryPrimes.indexOf(n) + 1);
assert.deepEqual(ordinals, [64, 87, 205, 173, 201]);
const sourceBytes = ordinals.map((oneBased) => grid.bytes[oneBased - 1]);
assert.deepEqual(sourceBytes, [51, 111, 194, 148, 110]);
assert.equal(sourceBytes.slice(1).reduce((a, b) => a + b, 0), 563);
assert.equal(sourceBytes[1] - sourceBytes[0], 60);
assert.equal(p32.slice(0, 11).reduce((a, i) => a + corpus.prime[i], 0), 563);
assert.equal(p32.filter((_, i) => i % 11 === 0)
  .reduce((a, i) => a + corpus.prime[i], 0), 569);
assert.equal(p32.slice(33, 38).map((i) => corpus.translit[i]).join(''),
  'HOMEX');

// Source-printed 32 rows x 8 columns: high five bits are distance,
// low three bits select N, NE, E, SE, S, SW, W, NW.
// Start of original HOME marker is row3 col0, and X is row3 col4.
const dirs = [[-1, 0], [-1, 1], [0, 1], [1, 1],
  [1, 0], [1, -1], [0, -1], [-1, -1]];

/**
 * @param {number[]} bytes
 * @returns {{visited:number[],delta:number[],runes:string[]}}
 */
function walk(bytes) {
  let row = 3, col = 0, dr = 0, dc = 0;
  const visited = [];
  for (const byte of bytes) {
    const distance = byte >> 3;
    const [y, x] = dirs[byte & 7];
    dr += y * distance;
    dc += x * distance;
    row = mod(row + y * distance, 11);
    col = mod(col + x * distance, 11);
    visited.push(row * 11 + col);
  }
  return {
    visited, delta: [dr, dc],
    runes: visited.map((pos) => corpus.translit[p32[pos]])
  };
}

const route = walk(sourceBytes);
assert.deepEqual(route.visited, [105, 81, 83, 39, 37]);
assert.deepEqual(route.runes, ['W', 'NG', 'EA', 'D', 'X']);
const fourOnly = walk(sourceBytes.slice(1));
assert.equal(fourOnly.visited.at(-1), 97); // p57 alone does not end at X
const zeroBasedBytes = ordinals.map((n) => grid.bytes[n]);
assert.equal(walk(zeroBasedBytes).visited.at(-1), 84);
assert.equal(route.visited.at(-1), 37);

// Reordering only affects intermediate route cells: compass displacements
// sum commutatively. Avoid claiming the printed order itself fixes endpoint.
assert.equal(walk(sourceBytes.slice().reverse()).visited.at(-1), 37);

// Conditioned 256-member *cyclic shift* diagnostic, not an authorial p-value.
// Preserve all actual table bytes, topology, relative five address positions
// and named original targets, change only the common table address origin.
const rotation = {
  total: 256, endpointOnly: 0, fourByteSum563: 0,
  firstTwoDifference60: 0, endpointAndSum: 0
};
for (let shift = 0; shift < 256; shift++) {
  const bytes = ordinals.map((n) => grid.bytes[(n - 1 + shift) % 256]);
  const end = walk(bytes).visited.at(-1) === 37;
  const sum = bytes.slice(1).reduce((a, b) => a + b, 0) === 563;
  const diff = bytes[1] - bytes[0] === 60;
  rotation.endpointOnly += Number(end);
  rotation.fourByteSum563 += Number(sum);
  rotation.firstTwoDifference60 += Number(diff);
  rotation.endpointAndSum += Number(end && sum);
}
assert.deepEqual(rotation, {
  total: 256, endpointOnly: 4, fourByteSum563: 1,
  firstTwoDifference60: 2, endpointAndSum: 1
});

console.log(JSON.stringify({
  mode: 'source-fixed p56+p57 five-unit prime-ordinal compass route',
  sourcePageUnits: units.map((u) => u.length),
  sums, ordinals, sourceBytes,
  compassFromHomeCell33: route,
  sourceFourP57OnlyEnd: fourOnly.visited.at(-1),
  zeroBasedTableEndpoint: walk(zeroBasedBytes).visited.at(-1),
  cyclicShiftNull: rotation,
  note: 'navigation coincidence/hypothesis; not unknown plaintext or key'
}, null, 2));
