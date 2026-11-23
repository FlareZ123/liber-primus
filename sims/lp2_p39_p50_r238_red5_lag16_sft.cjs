#!/usr/bin/env node
'use strict';

/**
 * LP2 p39/p50 degree-238 coefficient bridge, exact original-source SFT.
 * Windows Node.js 22: node sims/lp2_p39_p50_r238_red5_lag16_sft.cjs
 *
 * Source-selected operands:
 * - p50 base60 printed 256-byte row-major table, reduced to GF(29)
 * - its degree-16 small-factor product and degree-238 quotient
 * - p39 red middle rune index 5, p39 after shedding first/last rune
 * - p15 16 printed Fibonacci-prime values, giving the lag 16
 *
 * The 22/222 lag-16 equality is an exploratory correlation, not plaintext.
 * This reproducer preserves original ciphertext, reads files, and writes none.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} p @returns {any} */
const load = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
/** @param {number} x @returns {number} */
const mod = x => ((x % 29) + 29) % 29;
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function mul(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
    }
  }
  return out;
}
/** @param {number[]} a @param {number[]} divisor @returns {{quotient:number[],remainder:number[]}} */
function divMonic(a, divisor) {
  assert.equal(divisor.at(-1), 1);
  const remainder = a.slice();
  const quotient = Array(a.length - divisor.length + 1).fill(0);
  for (let i = quotient.length - 1; i >= 0; i--) {
    const x = remainder[i + divisor.length - 1];
    quotient[i] = x;
    for (let j = 0; j < divisor.length; j++) {
      remainder[i + j] = mod(remainder[i + j] - x * divisor[j]);
    }
  }
  return { quotient, remainder };
}
/** @param {number[]} a @param {number[]} b @param {number} lag @param {number} scalar @returns {number[]} */
function matchingIndices(a, b, lag, scalar) {
  assert.equal(a.length, b.length);
  const hits = [];
  for (let i = lag; i < a.length; i++) {
    if (mod(a[i] - a[i - lag]) === mod(scalar * (b[i] - b[i - lag]))) {
      hits.push(i);
    }
  }
  return hits;
}
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const count = Array(29).fill(0);
  for (const value of values) count[value]++;
  return count.reduce((sum, n) => sum + n * (n - 1), 0)
    / (values.length * (values.length - 1));
}
/** @param {number[]} observed @param {number[]} other @returns {number} */
function bestStaticMap(observed, other) {
  const rows = Array.from({ length: 29 }, () => Array(29).fill(0));
  for (let i = 0; i < observed.length; i++) rows[observed[i]][other[i]]++;
  return rows.reduce((sum, counts) => sum + Math.max(...counts), 0);
}
/** @param {number[]} seq @param {number[]} coefficients @returns {number[]} */
function recurrenceMatches(seq, coefficients) {
  const out = [];
  for (let i = 16; i < seq.length; i++) {
    let predicted = 0;
    for (let j = 0; j < 16; j++) {
      predicted -= coefficients[j] * seq[i - 16 + j];
    }
    if (mod(predicted) === seq[i]) out.push(i);
  }
  return out;
}
/** @param {number[]} seed @param {number[]} coefficients @param {number} length @returns {number[]} */
function expandRecurrence(seed, coefficients, length) {
  const result = seed.slice();
  for (let i = result.length; i < length; i++) {
    let x = 0;
    for (let j = 0; j < 16; j++) x -= coefficients[j] * result[i - 16 + j];
    result.push(mod(x));
  }
  return result;
}

const corpus = load('resources/liber-primus/lp2-corpus.json');
const grid = load('resources/liber-primus/lp2-grid-256.json');
const allPages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const book = allPages.flatMap(p => p.indices);
const page39 = corpus.pages.find(p => p.page === 39).indices;
const page36 = corpus.pages.find(p => p.page === 36).indices;
const solved57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(book.length, 12956);
assert.equal(grid.bytes.length, 256);
assert.equal(page39.length, 240);
assert.equal(page36.length, 238);
assert.deepEqual(page39.slice(119, 122), [27, 5, 15]);
assert.equal(crypto.createHash('sha256').update(Buffer.from(grid.bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

// Original source p15 printed 4-by-4 table: 16 magnitudes.
const p15Rows = [3258, 3222, 3152, 3038, 3278, 3299, 3298, 2838,
  3288, 3294, 3296, 2472, 4516, 1206, 708, 1820];
assert.equal(p15Rows.length, 16);
assert.equal(p15Rows[5], 3299);

// The 203 entry disappears modulo29. The 231 entry is 28 mod29;
// multiplying by -1 normalizes the remaining degree254 polynomial to monic.
assert.equal(mod(grid.bytes[0]), 0);
assert.equal(mod(grid.bytes[1]), 28);
const originalMonic = grid.bytes.slice(1).reverse().map(x => mod(-x));
const smallFactors = [
  [5, 1], [5, 1], [11, 18, 1], [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
];
const F16 = smallFactors.reduce((acc, f) => mul(acc, f), [1]);
assert.deepEqual(F16, [13, 20, 26, 12, 6, 2, 13, 26, 6,
  26, 11, 7, 15, 11, 17, 25, 1]);
const { quotient: R238, remainder } = divMonic(originalMonic, F16);
assert.equal(R238.length, 239);
assert.equal(R238.at(-1), 1);
assert.ok(remainder.every(x => x === 0));
assert.deepEqual(mul(F16, R238), originalMonic);

const originalOrder = R238.slice(0, -1).reverse();
const reverseOrder = R238.slice(0, -1);
const originalTrim = page39.slice(1, -1);
assert.equal(originalOrder.length, 238);
assert.equal(originalTrim.length, 238);

// A printed, reproducible, source-constrained lag16 difference criterion.
const alpha = 5;
const lag = 16;
const hits = matchingIndices(originalTrim, originalOrder, lag, alpha);
const knownHits = [30, 32, 59, 74, 91, 94, 97, 111, 127, 128, 146,
  148, 152, 164, 174, 177, 195, 215, 225, 227, 228, 235];
assert.deepEqual(hits, knownHits);
assert.equal(matchingIndices(page39.slice(0, 238), originalOrder, lag, alpha).length, 6);
assert.equal(matchingIndices(page39.slice(2, 240), originalOrder, lag, alpha).length, 7);
assert.equal(matchingIndices(page36, originalOrder, lag, alpha).length, 11);
assert.equal(matchingIndices(originalTrim, reverseOrder, lag, alpha).length, 7);

// Exact all-source-window comparison: preserve the 12,956 original runes.
const delta = Array.from({ length: 238 - lag }, (_, j) =>
  mod(alpha * (originalOrder[j + lag] - originalOrder[j])));
let windows = 0;
const qualifyingWindows = [];
let bestOther = 0;
for (let start = 0; start + 238 <= book.length; start++) {
  windows++;
  let count = 0;
  for (let j = 0; j < delta.length; j++) {
    if (mod(book[start + j + lag] - book[start + j]) === delta[j]) count++;
  }
  if (count >= hits.length) qualifyingWindows.push({ start, count });
  if (start !== 9401 && count > bestOther) bestOther = count;
}
const p39Global = allPages.filter(p => p.page < 39)
  .reduce((sum, p) => sum + p.indices.length, 0);
assert.equal(p39Global, 9400);
assert.equal(windows, 12719);
assert.deepEqual(qualifyingWindows, [{ start: p39Global + 1, count: 22 }]);
assert.equal(bestOther, 19);

// Allow all 29 secret multipliers at the otherwise frozen original p39 trim.
// This is a deliberately more permissive competitor than the red source 5.
const multipliers = Array.from({ length: 29 }, (_, a) =>
  ({ scalar: a, hits: matchingIndices(originalTrim, originalOrder, lag, a).length }));
multipliers.sort((a, b) => b.hits - a.hits || a.scalar - b.scalar);
assert.deepEqual(multipliers[0], { scalar: 5, hits: 22 });
assert.equal(multipliers[1].hits, 12);

const p36Matches = originalOrder.filter((c, i) => c === page36[i]).length;
const p39Matches = originalOrder.filter((c, i) => c === originalTrim[i]).length;
assert.equal(p36Matches, 14);
assert.equal(p39Matches, 10);
assert.equal(bestStaticMap(page36, originalOrder), 54);
assert.equal(bestStaticMap(originalTrim, originalOrder), 50);

// A full 16-periodic pad would satisfy every lag16 equation, which does not happen.
const residual = originalTrim.map((x, i) => mod(x - alpha * originalOrder[i]));
const f16RecurrenceHits = recurrenceMatches(residual, F16);
assert.equal(f16RecurrenceHits.length, 5);
const plantedPeriodicKey = p15Rows.map(mod);
const plantedPeriodic = originalOrder.map((x, i) =>
  mod(alpha * x + plantedPeriodicKey[i % 16]));
assert.equal(matchingIndices(plantedPeriodic, originalOrder, lag, alpha).length, 222);
assert.deepEqual(plantedPeriodic.map((x, i) => mod(x - alpha * originalOrder[i])),
  originalOrder.map((_, i) => plantedPeriodicKey[i % 16]));
const plantedRecKey = expandRecurrence(plantedPeriodicKey, F16, 238);
const plantedRec = originalOrder.map((x, i) => mod(alpha * x + plantedRecKey[i]));
assert.equal(recurrenceMatches(plantedRec.map((x, i) =>
  mod(x - alpha * originalOrder[i])), F16).length, 222);

const report = {
  sources: { p50Bytes: grid.bytes.length, p50MonicDegree: originalMonic.length - 1,
    factorDegrees: [F16.length - 1, R238.length - 1],
    p39Runes: page39.length, p39TrimmedRunes: originalTrim.length,
    p15PrintedNumerals: p15Rows.length, unknownRunes: book.length },
  coefficientCopy: { p36Exact: p36Matches, p39TrimmedExact: p39Matches,
    p36BestArbitrarySubstitution: 54, p39BestArbitrarySubstitution: 50 },
  sourceSelectedLag16: { multiplier: alpha, matches: hits.length,
    trials: originalTrim.length - lag, indexPositions: hits,
    allUnsolvedBookWindows: windows, windowsAtOrAbove22: qualifyingWindows,
    secondBestWindowScore: bestOther,
    otherMultiplierMax: multipliers[1] },
  candidateDecode: { p39InverseIoC: ioc(residual), solvedP57IoC: ioc(solved57),
    p39InverseTransliterationPrefix: residual.slice(0, 80).map(i => corpus.translit[i]).join(''),
    p39F16RecurrencePredictionsCorrect: f16RecurrenceHits.length, recurrenceTrials: 222 },
  positivePlants: { periodicMatches: 222, F16RecurrenceMatches: 222 },
  status: 'Intermediate alignment only; no direct decipherment, authentic key, or plaintext recovered.'
};
console.log(JSON.stringify(report, null, 2));
