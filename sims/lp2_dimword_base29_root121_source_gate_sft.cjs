'use strict';

/**
 * Original-source p0/p1 dimension-word BASE29 address test.
 * Run: node sims/lp2_dimword_base29_root121_source_gate_sft.cjs
 * Uses repository source files and no network or third-party packages.
 * The output is a candidate navigation clue, never a decryption claim.
 * @module lp2_dimword_base29_root121_source_gate_sft
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const segments = transcription.split(/\s*%\s*/);
assert.equal(segments.length, 57);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

/** @param {string} source @returns {number[][]} */
function words(source) {
  const units = source.replaceAll('/', '').replace(/\s/gu, '')
    .match(/\p{Script=Runic}+/gu) || [];
  return units.map(unit => [...unit].map(r => {
    assert.ok(runeIndex.has(r), 'Unknown original-source rune');
    return runeIndex.get(r);
  }));
}
/** @param {number[]} digits @returns {bigint} */
function positionalBase29(digits) {
  return digits.reduce((n, d) => n * 29n + BigInt(d), 0n);
}
/** @param {number[]} digits @returns {number} */
function residue121(digits) {
  return Number(positionalBase29(digits) % 121n);
}
/** @param {number[]} digits @returns {number} */
function primeSum(digits) {
  return digits.reduce((s, d) => s + corpus.prime[d], 0);
}
/** @param {number[]} digits @returns {string} */
function roman(digits) {
  return digits.map(d => corpus.translit[d]).join('');
}

const widthWord = words(segments[0])[5];
const heightWord = words(segments[1])[32];
assert.deepEqual(widthWord, [9, 18, 7, 17, 24, 15, 22, 12, 10, 21, 1]);
assert.deepEqual(heightWord, [11, 0, 10, 9, 28, 5, 26, 27, 10, 28]);
assert.deepEqual([primeSum(widthWord), primeSum(heightWord)], [563, 569]);
assert.deepEqual([roman(widthWord), roman(heightWord)],
  ['NEWBASOEEOINGU', 'JFINIACYEAIIA']);
const unknown = segments.slice(0, 55).flatMap(words);
assert.deepEqual([563, 569].map(n =>
  unknown.filter(w => primeSum(w) === n).length), [1, 1]);

assert.equal(positionalBase29(widthWord), 4051303299344240n);
assert.equal(positionalBase29(heightWord), 159757036413254n);
assert.deepEqual([residue121(widthWord), residue121(heightWord)],
  [115, 115]);
assert.deepEqual([
  residue121([...widthWord].reverse()),
  residue121([...heightWord].reverse())
], [42, 23]);
assert.deepEqual([
  residue121(widthWord.map(x => x + 1)),
  residue121(heightWord.map(x => x + 1))
], [17, 49]);

const grid = corpus.pages.find(p => p.page === 32).indices;
assert.equal(grid.length, 121);
assert.equal(grid[115], 11);
assert.equal(corpus.translit[grid[115]], 'J');
assert.equal(115 % 11, 5);
assert.equal(Math.floor(115 / 11), 10);
assert.equal(93 % 11, 5);
assert.equal(Math.floor(93 / 11), 8);
assert.equal(roman(grid.slice(93, 97)), 'BUDS');

/**
 * Exhaustive position-permutation residual distribution.
 * Distinct input slots remain distinguishable; repeated values therefore
 * receive the correct multiplicity weighting for a uniform random shuffle.
 * The full 11! and 10! totals fit exactly within Number's 53-bit precision.
 * @param {number[]} digits @returns {Float64Array}
 */
function residueDistribution(digits) {
  const totalMasks = 1 << digits.length;
  const dp = Array.from({length: totalMasks}, () => new Float64Array(121));
  dp[0][0] = 1;
  for (let mask = 0; mask < totalMasks; mask++) {
    const src = dp[mask];
    for (let k = 0; k < digits.length; k++) {
      if (mask & (1 << k)) continue;
      const dst = dp[mask | (1 << k)];
      for (let r = 0; r < 121; r++) {
        if (src[r]) dst[(29 * r + digits[k]) % 121] += src[r];
      }
    }
  }
  return dp[totalMasks - 1];
}
const distA = residueDistribution(widthWord);
const distB = residueDistribution(heightWord);
const totalA = distA.reduce((s, n) => s + n, 0);
const totalB = distB.reduce((s, n) => s + n, 0);
assert.deepEqual([totalA, totalB], [39916800, 3628800]);
assert.deepEqual([distA[115], distB[115]], [329116, 29756]);
const samePairs = distA.reduce((s, n, i) => s + n * distB[i], 0);

/**
 * Rune-prime graph on the original 11x11 p32 reflow. Stops at first
 * repeated position; no language search or fitted parameters.
 * @param {number} start
 * @param {'absolute'|'forward'} mode
 */
function walk(start, mode) {
  const seen = new Map();
  let i = start;
  const out = [];
  while (!seen.has(i)) {
    seen.set(i, out.length);
    const d = grid[i];
    out.push({position: i, rune: corpus.translit[d]});
    i = mode === 'absolute' ? corpus.prime[d] :
      (i + corpus.prime[d]) % 121;
  }
  return {
    path: out.map(x => x.position),
    runes: out.map(x => x.rune).join(''),
    preperiod: seen.get(i),
    cycleLength: out.length - seen.get(i)
  };
}
const direct = walk(115, 'absolute');
const forward = walk(115, 'forward');
assert.equal(direct.runes, 'JXIAUWIA');
assert.equal(forward.runes, 'JOWMIAFTXOETHX');

console.log(JSON.stringify({
  status: 'Provisional source-constrained address, no plaintext/key recovered',
  dimensionPair: [563, 569],
  selectedPhysicalWords: ['p0 word6', 'p1 word33'],
  base29Integers: [
    positionalBase29(widthWord).toString(),
    positionalBase29(heightWord).toString()
  ],
  residue121: [115, 115],
  p32Destination: {
    index: 115, row: 10, column: 5, rune: 'J',
    separateLiteralBUDS: {start: 93, row: 8, column: 5}
  },
  conditionalExactPermutationNull: {
    independentWithinWordSlotShuffles: true,
    probabilities: {
      matchingAnyResidue: samePairs / (totalA * totalB),
      bothResidue115: (distA[115] / totalA) * (distB[115] / totalB)
    },
    warning: 'Hypothesis developed after examining source coincidences; no discovery-wide p-value'
  },
  naturalSourcePrimeWalks: {direct, forward}
}, null, 2));
