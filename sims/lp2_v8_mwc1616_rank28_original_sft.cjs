'use strict';
/**
 * V8 2014 MWC1616 candidate on original LP2 28-successor rune steps.
 * Identifies whether a page-started V8 MWC half-generator directly emits
 * the step's integer 0..27 through floor(28*Math.random()).
 *
 * Pure exact initial-state inversion. This tests the original runes, unlike
 * the independent previous LP2 256-byte-table MWC experiment.
 * Self-contained Node 22 CommonJS, Windows 11 compatible, read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const input = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'));
const pages = [0, 1, 2, 15, 16, 40, 43, 49, 53, 55];
const constants = [18030, 30903];
const FIRST = 28;
assert.equal(input.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices).length, 12956);

/** @param {number} state @param {number} multiplier */
function next(state, multiplier) {
  return (Math.imul(multiplier, state & 65535) + (state >>> 16)) >>> 0;
}
/** @param {number} value Rank 0..28 @returns {number} */
function floorBound(value) {
  return Math.floor((value * 65536 + 27) / 28);
}
/**
 * Complete high16 candidate interval for a full two-lane V8 observation.
 * The low generator contributes < 1/65536 to the random float, so the
 * previous high16 bin's final value can occasionally cross a bin edge.
 * Include it even though its exact low16 state remains unknown.
 * @param {number} observed
 */
function candidateFloor(observed) {
  const start = floorBound(observed);
  return start - Number(observed > 0 &&
    observed * 65536 - 28 * (start - 1) < 28);
}
/** @param {number} observed @param {number} high16 */
function compatible(observed, high16) {
  const min = candidateFloor(observed);
  return high16 >= min && high16 < floorBound(observed + 1);
}
/** @param {number} low16 */
function rank(low16) {
  return Math.floor(28 * low16 / 65536);
}
/**
 * Necessary-condition state search using the first two 28-ranks. Rather
 * than 2^32 brute force, each candidate initial low16 and second low16
 * determines the carried high16 by a single modular subtraction.
 * @param {number[]} observed 28 successive 0..27 ranks
 * @param {number} multiplier Historical MWC multiplier
 */
function recover(observed, multiplier) {
  assert(observed.length >= 2 && observed.every(x => x >= 0 && x <= 27));
  const lowA = candidateFloor(observed[0]), highA = floorBound(observed[0] + 1);
  const lowB = candidateFloor(observed[1]), highB = floorBound(observed[1] + 1);
  const matches = Array(observed.length + 1).fill(0);
  let strongest = 0, bestState = null, twoMatches = 0, exact = [];
  for (let first = lowA; first < highA; first++) {
    const aFirst = (Math.imul(multiplier, first)) & 65535;
    for (let second = lowB; second < highB; second++) {
      const carry = (second - aFirst + 65536) & 65535;
      if (carry >= multiplier) continue;
      const initial = ((carry << 16) | first) >>> 0;
      let state = next(initial, multiplier);
      assert.equal(state & 65535, second);
      let matched = 2;
      while (matched < observed.length) {
        state = next(state, multiplier);
        if (!compatible(observed[matched], state & 65535)) break;
        matched++;
      }
      matches[matched]++;
      twoMatches++;
      if (matched > strongest) {
        strongest = matched;
        bestState = initial;
      }
      if (matched === observed.length) exact.push(initial);
    }
  }
  return {multiplier, sampled: observed.length,
    twoMatches, strongest, bestState, exactStates: exact,
    extended: matches.flatMap((count, prefix) =>
      prefix >= 5 && count ? [{prefix, count}] : [])};
}
/** @param {number} multiplier @param {number} secondMultiplier */
function positive(multiplier, secondMultiplier) {
  let high = ((1100 << 16) | 12001) >>> 0;
  let low = ((2800 << 16) | 3001) >>> 0;
  const plantedState = high, values = [];
  for (let i = 0; i < FIRST; i++) {
    const output = (((high & 65535) * 65536) + (low & 65535)) >>> 0;
    const actual = Math.floor(28 * output / 4294967296);
    assert.equal(actual, rank(high & 65535),
      'fixed positive must not be a low-lane rounding exception');
    values.push(actual);
    high = next(high, multiplier);
    low = next(low, secondMultiplier);
  }
  const recovered = recover(values, multiplier);
  assert(recovered.exactStates.includes(plantedState));
  assert.equal(recovered.strongest, FIRST);
  assert.equal(recovered.exactStates.length, 1);
  return {multiplier, samples: values.length,
    exactSeedRecovered: recovered.exactStates.length === 1};
}
const positives = [
  positive(constants[0], constants[1]),
  positive(constants[1], constants[0])
];
const results = [];
for (const pageNumber of pages) {
  const page = input.pages.find(p => p.page === pageNumber);
  assert(page && page.indices.length >= FIRST + 1);
  const original = page.indices;
  const stepRanks = Array.from({length: FIRST}, (_, i) => {
    const difference = (original[i + 1] - original[i] + 29) % 29;
    assert.notEqual(difference, 0,
      'original page prefix contains exceptional zero-step at p' + pageNumber);
    return difference - 1;
  });
  for (const multiplier of constants) {
    const record = recover(stepRanks, multiplier);
    assert.equal(record.exactStates.length, 0);
    assert(record.strongest <= 7);
    results.push({page: pageNumber, ...record});
  }
}
assert.equal(results.length, 20);
const max = Math.max(...results.map(r => r.strongest));
assert.equal(max, 7);
console.log(JSON.stringify({
  premise: '2014 V8 MWC1616 directly emits 28-successor step ranks at page start',
  lowLaneTreatment: 'all mathematically possible rounding excursions included; exact low seed need not be guessed',
  original: 'physical LP2 p0-p55; 10 source-selected first-28-step windows',
  allRealPagesHaveZeroCompatiblePrefixes: true,
  variants: results.length,
  strongestOriginalPrefix: max,
  fullOriginalMatches: results.filter(r => r.exactStates.length).length,
  nativeTwoLanePositiveControls: positives,
  perWindow: results,
  decision: 'Direct unkeyed 28-way MWC1616 emitter rejected for tested starts. Does not test a plaintext-masked keystream or undocumented output skipping.'
}, null, 2));
console.log('PASS: original 20 necessary high-lane state inversions and two full MWC plants');
