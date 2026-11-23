'use strict';

/**
 * Exact, key-independent GP29 test of every fixed 5-to-5 linear mixer
 * on the five authentic red-numbered LP2 p36–p38 passages.
 *
 * Run with Node.js 22. The test is read-only and uses no dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const lp1Raw = fs.readFileSync(
  path.join(root, 'resources', 'transcriptions', 'lp1_wulfic_canonical.txt'), 'utf8'
);
const page = (number) => corpus.pages.find((item) => item.page === number).indices;
const length = 91;
const modulus = 29;
const mod = (value) => ((value % modulus) + modulus) % modulus;

/**
 * @param {readonly number[]} sequence GP29 rune indices.
 * @returns {{ distinct: number, pairCount: number, ioc: number }}
 */
function profile(sequence) {
  const hist = new Uint8Array(modulus);
  for (const rune of sequence) hist[rune]++;
  let distinct = 0;
  let pairCount = 0;
  for (const count of hist) {
    if (count > 0) distinct++;
    pairCount += count * (count - 1);
  }
  return {
    distinct,
    pairCount,
    ioc: pairCount / (sequence.length * (sequence.length - 1)),
  };
}

/** @param {readonly number[][]} matrix */
function invertMatrix(matrix) {
  const work = matrix.map((row, i) => [
    ...row.map(mod),
    ...Array.from({ length: 5 }, (_, j) => Number(i === j)),
  ]);
  const reciprocal = (value) => {
    for (let i = 1; i < modulus; i++) {
      if (mod(value * i) === 1) return i;
    }
    throw new Error('Non-invertible nonzero pivot');
  };
  for (let col = 0; col < 5; col++) {
    const pivotRow = work.findIndex((row, i) => i >= col && row[col] !== 0);
    assert(pivotRow >= 0, 'Source matrix must be invertible modulo 29');
    [work[pivotRow], work[col]] = [work[col], work[pivotRow]];
    const inverse = reciprocal(work[col][col]);
    for (let k = 0; k < 10; k++) work[col][k] = mod(work[col][k] * inverse);
    for (let i = 0; i < 5; i++) {
      if (i === col) continue;
      const ratio = work[i][col];
      for (let k = 0; k < 10; k++) {
        work[i][k] = mod(work[i][k] - ratio * work[col][k]);
      }
    }
  }
  return work.map((row) => row.slice(5));
}

/** @param {readonly number[][]} matrix @param {readonly number[][]} lanes */
function applyMatrix(matrix, lanes) {
  return matrix.map((row) => Array.from({ length }, (_, at) => mod(
    row.reduce((sum, weight, k) => sum + weight * lanes[k][at], 0)
  )));
}

const units = [
  page(36).slice(99, 238),
  page(37).slice(0, 91),
  page(37).slice(91, 189),
  [...page(37).slice(189, 228), ...page(38).slice(0, 57)],
  page(38).slice(57, 186),
];
assert.deepEqual(units.map((unit) => unit.length), [139, 91, 98, 96, 129]);
const original = units.map((unit) => unit.slice(0, length));
assert.equal(original.flat().length, 455);

// Projective GF29 directions: every nonzero 5-vector up to one common
// nonzero scalar has exactly one representative with first nonzero entry = 1.
// This enumerates (29**5-1)/(29-1) = 732,541 directions, exactly once.
let directions = 0;
let minimumDistinct = 29;
let maximumIoC = -Infinity;
let minimumWitness = [];
let maximumWitness = [];
const distinctHistogram = {};
for (let lead = 0; lead < 5; lead++) {
  for (let code = 0; code < modulus ** (4 - lead); code++) {
    let encoded = code;
    const coefficients = [0, 0, 0, 0, 0];
    coefficients[lead] = 1;
    for (let k = 4; k > lead; k--) {
      coefficients[k] = encoded % modulus;
      encoded = Math.floor(encoded / modulus);
    }
    const counts = new Uint8Array(modulus);
    for (let at = 0; at < length; at++) {
      const value = (
        coefficients[0] * original[0][at]
        + coefficients[1] * original[1][at]
        + coefficients[2] * original[2][at]
        + coefficients[3] * original[3][at]
        + coefficients[4] * original[4][at]
      ) % modulus;
      counts[value]++;
    }
    let distinct = 0;
    let collisions = 0;
    for (const count of counts) {
      distinct += Number(count > 0);
      collisions += count * (count - 1);
    }
    const ioc = collisions / (length * (length - 1));
    directions++;
    distinctHistogram[distinct] = (distinctHistogram[distinct] || 0) + 1;
    if (distinct < minimumDistinct) {
      minimumDistinct = distinct;
      minimumWitness = coefficients.slice();
    }
    if (ioc > maximumIoC) {
      maximumIoC = ioc;
      maximumWitness = coefficients.slice();
    }
  }
}
assert.equal(directions, 732541);
assert.equal(minimumDistinct, 22);
assert(Math.abs(maximumIoC - 0.05616605616605617) < 1e-12);
assert.deepEqual(
  distinctHistogram,
  { 22: 8, 23: 145, 24: 1713, 25: 12491, 26: 59305,
    27: 174363, 28: 286201, 29: 198315 }
);

// The LP1 canonical transcript is abbreviated to 15 rune-bearing records.
// Its physical p10–p13 plaintext "THE LOSS OF DIVINITY" is records 8–11.
// The contemporary artifact is direct unencrypted runes, not Latin re-encoding.
const runeIndex = new Map(corpus.runes.map((rune, at) => [rune, at]));
const records = lp1Raw.split('%').map((part) => Array.from(part)
  .filter((rune) => runeIndex.has(rune))
  .map((rune) => runeIndex.get(rune)));
assert.equal(records.length, 16);
const authorNative = records.slice(8, 12).flat();
assert.equal(authorNative.length, 755);
assert.deepEqual(authorNative.slice(0, 4), [2, 18, 20, 3]);

let nativeWindows = 0;
let nativeLowDistinct = 0;
const nativeDistinctHistogram = {};
for (let at = 0; at + length <= authorNative.length; at++) {
  const data = profile(authorNative.slice(at, at + length));
  nativeWindows++;
  nativeDistinctHistogram[data.distinct] =
    (nativeDistinctHistogram[data.distinct] || 0) + 1;
  if (data.distinct <= 21) nativeLowDistinct++;
}
assert.equal(nativeWindows, 665);
assert.equal(nativeLowDistinct, 372);
assert.deepEqual(nativeDistinctHistogram,
  { 19: 19, 20: 109, 21: 244, 22: 245, 23: 48 });

// Five intact author-native 91-rune lanes on five disjoint source positions,
// shifted together by each possible start. This measures the source-like
// precondition that at least one lane uses at most 21 distinct rune symbols.
let fiveWindowControls = 0;
let controlsWithLow = 0;
for (let start = 0; start + 5 * length <= authorNative.length; start++) {
  const distinct = Array.from({ length: 5 }, (_, k) =>
    profile(authorNative.slice(start + k * length, start + (k + 1) * length))
      .distinct);
  fiveWindowControls++;
  if (distinct.some((value) => value <= 21)) controlsWithLow++;
}
assert.equal(fiveWindowControls, 301);
assert.equal(controlsWithLow, 296);

// Independent source-native positive: the original, already-decrypted
// 95-rune LP2 p57 has five contiguous 91-rune windows, all with <=21 glyphs.
const solvedP57 = page(57);
assert.equal(solvedP57.length, 95);
const solvedWindowDistinct = Array.from({ length: 5 }, (_, start) =>
  profile(solvedP57.slice(start, start + length)).distinct);
assert.deepEqual(solvedWindowDistinct, [21, 20, 20, 21, 21]);

// A first-party 2014 order-five sum-3301 square provides a genuine,
// nontrivial, invertible mixing plant. Its exact inverse restores all 455
// source-native GP29 runes; at least one true projector has <=21 symbols.
const firstPartySquare3301 = [
  [434, 1311, 312, 278, 966],
  [204, 812, 934, 280, 1071],
  [626, 620, 809, 620, 626],
  [1071, 280, 934, 812, 204],
  [966, 278, 312, 1311, 434],
];
const fiveNative = Array.from({ length: 5 }, (_, k) =>
  authorNative.slice(k * length, (k + 1) * length));
const plantedCiphertext = applyMatrix(firstPartySquare3301, fiveNative);
const plantedRecovered = applyMatrix(
  invertMatrix(firstPartySquare3301), plantedCiphertext
);
assert.deepEqual(plantedRecovered, fiveNative);
assert(fiveNative.some((lane) => profile(lane).distinct <= 21));

const conclusion = {
  originalSourceLengths: units.map((unit) => unit.length),
  alignedRunesPerLane: length,
  completeProjectiveDirections: directions,
  minimumOriginalProjectedDistinct: minimumDistinct,
  minimumWitness,
  maximumOriginalProjectedIoC: maximumIoC,
  maximumWitness,
  originalProjectionDistinctHistogram: distinctHistogram,
  authorNative91Windows: nativeWindows,
  authorNativeWindowsWithAtMost21Glyphs: nativeLowDistinct,
  authorNativeFiveLaneWindows: fiveWindowControls,
  authorNativeFiveLaneWindowsWithAtLeastOneAtMost21: controlsWithLow,
  solvedP57WindowDistinct: solvedWindowDistinct,
  plantedNontrivialSquareRoundTrip: '455/455',
};
process.stdout.write(JSON.stringify(conclusion, null, 2) + '\n');
process.stdout.write('PASS: exact original 732541-direction gate and both native controls\n');
