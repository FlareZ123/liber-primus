'use strict';

/**
 * Source-motivated 32x64 binary-image gate for the LP2 32x8 byte table.
 * Original bytes: resources/liber-primus/base60-grid.json.
 *
 * Test natural printed row order and a provisional 5-dot/LFSR de Bruijn
 * order. For each cycle, choose the best of 32 break points (31 row joins).
 * Compare with 30,000 uniformly shuffled 32-row cycles, applying that same
 * best-break rule to every null. Neither order is fitted to the ciphertext.
 *
 * This detects a smooth, unencrypted binary image in these fixed readings,
 * not an arbitrary, encrypted, permuted or per-column encoded image.
 *
 * Run: node sims/lp2_grid_bitplane_source_order_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.join(__dirname, '..');
const source = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/base60-grid.json'), 'utf8'
));
const original = source.byte_rows;
assert.equal(original.length, 32);
for (const row of original) {
  assert.equal(row.length, 8);
  for (const value of row) assert(Number.isInteger(value) && value >= 0 && value < 256);
}
const deBruijn = [
  31, 30, 28, 25, 19, 6, 13, 26, 20, 9, 18, 4, 8, 16, 0, 1,
  2, 5, 10, 21, 11, 23, 14, 29, 27, 22, 12, 24, 17, 3, 7, 15
];
assert.deepEqual([...deBruijn].sort((a, b) => a - b),
  Array.from({length: 32}, (_, i) => i));
const natural = Array.from({length: 32}, (_, i) => i);
const corrected = original.map(row => row.slice());
// Alternative five-cell image-audited table, without changing the canonical resource.
for (const [index, value] of [[45, 81], [50, 21], [165, 47],
  [172, 174], [246, 224]]) {
  corrected[Math.floor(index / 8)][index % 8] = value;
}
const popcount = Array.from({length: 256}, (_, i) => {
  let bits = i, n = 0;
  while (bits) { n += bits & 1; bits >>>= 1; }
  return n;
});

/** @param {number[][]} rows */
function pairScores(rows) {
  return rows.map(a => rows.map(b => a.reduce((sum, byte, i) =>
    sum + 8 - popcount[byte ^ b[i]], 0)));
}

/**
 * Sum circular vertical bit agreements and choose the strongest 31 joins.
 * Vertical bit agreements are invariant to reversing bit order within bytes.
 * @param {number[][]} pairs
 * @param {number[]} order
 */
function cycleScore(pairs, order) {
  let sum = 0, weakest = 65;
  for (let i = 0; i < 32; i++) {
    const same = pairs[order[i]][order[(i + 1) % 32]];
    sum += same;
    weakest = Math.min(weakest, same);
  }
  return {cycle32: sum, best31: sum - weakest};
}

/** @param {number} seed */
function randomUint32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * @param {number[][]} rows
 * @param {number} trials
 */
function screen(rows, trials = 30000) {
  const pairs = pairScores(rows);
  const raw = cycleScore(pairs, natural);
  const debruijn = cycleScore(pairs, deBruijn);
  const next = randomUint32(0x3301);
  let atLeastRaw = 0, atLeastDeBruijn = 0, sum = 0, squares = 0;
  for (let trial = 0; trial < trials; trial++) {
    const order = natural.slice();
    for (let i = 31; i > 0; i--) {
      const j = next() % (i + 1);
      [order[i], order[j]] = [order[j], order[i]];
    }
    const nullScore = cycleScore(pairs, order).best31;
    sum += nullScore;
    squares += nullScore * nullScore;
    atLeastRaw += Number(nullScore >= raw.best31);
    atLeastDeBruijn += Number(nullScore >= debruijn.best31);
  }
  const mean = sum / trials;
  return {
    bytesSha256: crypto.createHash('sha256').update(
      Buffer.from(rows.flat())).digest('hex'),
    raw, debruijn, trials, nullMean: mean,
    nullSd: Math.sqrt(squares / trials - mean * mean),
    rawCount: atLeastRaw, deBruijnCount: atLeastDeBruijn,
    rawTail: (atLeastRaw + 1) / (trials + 1),
    deBruijnTail: (atLeastDeBruijn + 1) / (trials + 1)
  };
}

const output = {canonical: screen(original), alternateFiveCell: screen(corrected)};
assert.deepEqual(
  [output.canonical.raw.best31, output.canonical.debruijn.best31,
    output.alternateFiveCell.raw.best31, output.alternateFiveCell.debruijn.best31],
  [1027, 1032, 1032, 1028]
);
assert.deepEqual(
  [output.canonical.rawCount, output.canonical.deBruijnCount,
    output.alternateFiveCell.rawCount, output.alternateFiveCell.deBruijnCount],
  [8509, 6331, 7346, 9195]
);
// Positive plant: a 64-bit raster whose next row changes exactly one bit.
const plant = Array.from({length: 32}, () => original[0].slice());
for (let i = 1; i < 32; i++) {
  plant[i] = plant[i - 1].slice();
  const position = (i * 17) % 64;
  plant[i][Math.floor(position / 8)] ^= 1 << (7 - position % 8);
}
const plantScore = cycleScore(pairScores(plant), natural);
assert.equal(plantScore.best31, 1953);
console.log(JSON.stringify({
  classification: 'source-order binary-image correlation only; no decryption',
  source: 'original 32x8 table as 32 rows of 64 monochrome pixels',
  null: 'uniform 32-row permutations, maximum over 32 possible circular breaks',
  plantedBest31: plantScore.best31,
  ...output
}, null, 2));
