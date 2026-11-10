'use strict';

/**
 * SFT: original-source Data Matrix ECC200 finder-pattern obstruction.
 * Uses canonical physical LP2 rune indices, source-specific 81^2 + (80^2-5)
 * split, 16 ECC200 18x18 data regions, and 5 arbitrary unprinted cells.
 * Runnable from any working directory with Node.js 22.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SIDE = 80;
const BAND = 10 * SIDE;
const REGION = 20; // 18x18 data, one-module-wide finder perimeter.
const OMITTED = SIDE * SIDE - 6395;
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));

/** @param {number} row @param {number} col @returns {number | null} */
function finderBit(row, col) {
  const y = row % REGION;
  const x = col % REGION;
  if (x === 0 || y === REGION - 1) return 1;
  if (y === 0) return x % 2 === 0 ? 1 : 0;
  if (x === REGION - 1) return y % 2 === 1 ? 1 : 0;
  return null;
}

/**
 * @param {number} pos
 * @param {number} route 0: row, 1: row snake, 2: column, 3: column snake
 * @returns {[number, number]}
 */
function routeCell(pos, route) {
  const a = pos % SIDE;
  const b = Math.floor(pos / SIDE);
  switch (route) {
    case 0: return [b, a];
    case 1: return [b, b % 2 === 0 ? a : SIDE - 1 - a];
    case 2: return [a, b];
    case 3: return [b % 2 === 0 ? a : SIDE - 1 - a, b];
    default: throw new RangeError('unknown route');
  }
}

/** @param {number} row @param {number} col @param {number} sym @returns {[number, number]} */
function orient(row, col, sym) {
  const end = SIDE - 1;
  switch (sym) {
    case 0: return [row, col];
    case 1: return [row, end - col];
    case 2: return [end - row, col];
    case 3: return [end - row, end - col];
    case 4: return [col, row];
    case 5: return [col, end - row];
    case 6: return [end - col, row];
    case 7: return [end - col, end - row];
    default: throw new RangeError('unknown symmetry');
  }
}

/**
 * Exact minimum number of finder-module corrections for a given band and
 * prefix missing-cell count, allowing each rune its own arbitrary secret bit.
 * @param {number[]} runes
 * @param {number} route
 * @param {number} sym
 * @param {number} band
 * @param {number} omittedBefore
 * @returns {number}
 */
function bandCost(runes, route, sym, band, omittedBefore) {
  /** @type {number[][]} */
  const counts = Array.from({ length: 29 }, () => [0, 0]);
  for (let pos = band * BAND; pos < (band + 1) * BAND; pos++) {
    const original = pos - omittedBefore;
    // Impossible assignments are only *relaxed* by omitting source limits.
    if (original < 0 || original >= runes.length) continue;
    const [row, col] = orient(...routeCell(pos, route), sym);
    const expected = finderBit(row, col);
    if (expected !== null) counts[runes[original]][expected]++;
  }
  return counts.reduce((total, row) => total + Math.min(row[0], row[1]), 0);
}

/**
 * Exact lower bound with up to five missing modules at any positions.
 * Eight disjoint 800-module bands mean at least three bands have no omission.
 * Each omission-free band has a constant prefix omission count 0...5.
 * @param {number[]} runes 6395 symbols in original order
 */
function analyze(runes) {
  assert.equal(runes.length, 6395);
  let best = Number.POSITIVE_INFINITY;
  let bestCase = null;
  let universalMinimumBand = Number.POSITIVE_INFINITY;
  for (let route = 0; route < 4; route++) {
    for (let symmetry = 0; symmetry < 8; symmetry++) {
      const minima = [];
      for (let band = 0; band < 8; band++) {
        let minimum = Number.POSITIVE_INFINITY;
        for (let missingBefore = 0; missingBefore <= OMITTED; missingBefore++) {
          minimum = Math.min(minimum,
            bandCost(runes, route, symmetry, band, missingBefore));
        }
        minima.push(minimum);
        universalMinimumBand = Math.min(universalMinimumBand, minimum);
      }
      const smallest = [...minima].sort((a, b) => a - b);
      const minimumEdits = smallest.slice(0, 8 - OMITTED).reduce((a, b) => a + b, 0);
      if (minimumEdits < best) {
        best = minimumEdits;
        bestCase = { route, symmetry, minima };
      }
    }
  }
  return { lowerBound: best, minimumUnbrokenBand: universalMinimumBand, bestCase };
}

const allUnsolved = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(allUnsolved.length, 12956);
assert.equal(12956 - 81 * 81, 6395);
assert.equal(80 * 80 - 6395, 5);
const source = allUnsolved.slice(81 * 81);
const observed = analyze(source);
assert.equal(observed.lowerBound, 51);
assert.equal(observed.minimumUnbrokenBand, 16);

let seed = 3301;
/** @returns {number} */
function randomUint32() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed;
}
const glyphsByBit = [
  Array.from({ length: 29 }, (_, i) => i).filter(i => i % 2 === 0),
  Array.from({ length: 29 }, (_, i) => i).filter(i => i % 2 === 1)
];
// Fixed true ECC200 pattern, synthetic random interior and secret static bit
// assignment (GP rune parity), then five hidden omissions.
const plantedFull = Array.from({ length: SIDE * SIDE }, (_, i) => {
  const row = Math.floor(i / SIDE);
  const col = i % SIDE;
  const bit = finderBit(row, col) ?? (randomUint32() & 1);
  const group = glyphsByBit[bit];
  return group[randomUint32() % group.length];
});
const deleted = new Set([13, 499, 1207, 3456, 6383]);
const planted = plantedFull.filter((_, index) => !deleted.has(index));
const control = analyze(planted);
assert.equal(control.lowerBound, 0);
console.log('[SFT] Original unsolved:', allUnsolved.length,
  'first square:', 81 * 81, 'terminal:', source.length, 'missing:', OMITTED);
console.log('[SFT] 80x80 ECC200: 16 source-defined 20x20 bordered regions');
console.log('[SFT] All 32 orientations/routes and all 6 prefix insert states');
console.log('[SFT] Original minimum intact-band correction:', observed.minimumUnbrokenBand);
console.log('[SFT] Original arbitrary-secret-rune-bit global lower bound:',
  observed.lowerBound, 'finder-module mismatches');
console.log('[SFT] Original best case:', JSON.stringify(observed.bestCase));
console.log('[SFT] Fully secret planted bit alphabet, five omissions:',
  JSON.stringify([...deleted]), 'bound:', control.lowerBound);
console.log('[SFT] PASS: no static rune-to-bit ECC200 Data Matrix encoding of original terminal square');
