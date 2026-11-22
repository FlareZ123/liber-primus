'use strict';

/**
 * Source-conditioned zero-sum audit of all original LP2 red rune spans.
 *
 * Original image annotations remain fixed. For each source page with red
 * text, rotate the whole GP ciphertext tape by one uniform page-local
 * offset. Each red span then samples a contiguous equal-length interval
 * on that same page. Rotations are shared across spans on the same page.
 *
 * Run with Node.js 22; reads only existing versioned repository inputs.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} name */
function load(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/liber-primus', name), 'utf8'));
}

const corpus = load('lp2-corpus.json');
const ink = load('lp2-ink-annotations.json');
const spans = ink.pages.flatMap(page =>
  (page.red_spans || []).map(span => ({
    page: page.page, start: span.start, length: span.length
  }))
);
assert.equal(spans.length, 18);
assert.equal(ink.counts.red, 225);
assert.equal(ink.counts.runes, 13136);
assert.equal(corpus.pages.length, 58);

const redPages = [...new Set(spans.map(e => e.page))];
const shifts = new Int32Array(58);

/**
 * @param {Int32Array} positions Physical-page shifts.
 * @param {boolean} usePrime Whether to use GP prime weights instead of GP indices.
 * @returns {number} Number of red spans summing to zero modulo 29.
 */
function zeroCount(positions, usePrime) {
  let matches = 0;
  for (const span of spans) {
    const page = corpus.pages[span.page].indices;
    let sum = 0;
    for (let j = 0; j < span.length; j++) {
      const index = page[(span.start + j + positions[span.page]) % page.length];
      sum += usePrime ? corpus.prime[index] : index;
    }
    if (sum % 29 === 0) matches++;
  }
  return matches;
}

const truePrime = zeroCount(shifts, true);
const trueIndex = zeroCount(shifts, false);
assert.equal(truePrime, 3);
assert.equal(trueIndex, 1);

const trueZeroSpans = spans.filter(span => {
  const tape = corpus.pages[span.page].indices;
  let sum = 0;
  for (let j = 0; j < span.length; j++) sum += corpus.prime[tape[span.start + j]];
  return sum % 29 === 0;
}).map(span => span.page);
assert.deepEqual(trueZeroSpans, [15, 40, 53]);

let rng = 0x14ad2026;
/** @returns {number} A seeded uniform fraction in [0,1). */
function randomFraction() {
  rng ^= rng << 13;
  rng ^= rng >>> 17;
  rng ^= rng << 5;
  return (rng >>> 0) / 4294967296;
}

const trials = 100000;
const hPrime = new Int32Array(spans.length + 1);
const hIndex = new Int32Array(spans.length + 1);
let highPrime = 0;
let highIndex = 0;
let highEither = 0;
for (let t = 0; t < trials; t++) {
  for (const page of redPages) {
    shifts[page] = Math.floor(randomFraction() * corpus.pages[page].indices.length);
  }
  const a = zeroCount(shifts, true);
  const b = zeroCount(shifts, false);
  hPrime[a]++;
  hIndex[b]++;
  if (a >= truePrime) highPrime++;
  if (b >= trueIndex) highIndex++;
  if (Math.max(a, b) >= Math.max(truePrime, trueIndex)) highEither++;
}

const expectedPrime = [...hPrime].reduce((sum, count, n) => sum + n * count, 0) / trials;
const expectedIndex = [...hIndex].reduce((sum, count, n) => sum + n * count, 0) / trials;
const outcome = {
  source: 'lp2-corpus.json / lp2-ink-annotations.json',
  trials,
  seed: '0x14ad2026',
  original: {
    redSpans: spans.length,
    gpPrimeZero: truePrime,
    gpIndexZero: trueIndex,
    gpPrimeZeroPages: trueZeroSpans
  },
  conditionedOn: 'Fixed page rune tapes, red span lengths/positions, shared per-page circular offsets',
  null: {
    expectedPrime,
    expectedIndex,
    histogramPrime: [...hPrime],
    histogramIndex: [...hIndex],
    primeAtLeastObserved: highPrime,
    indexAtLeastObserved: highIndex,
    eitherFamilyAtLeastPrimeObserved: highEither,
    primePlusOneTail: (highPrime + 1) / (trials + 1),
    indexPlusOneTail: (highIndex + 1) / (trials + 1),
    eitherFamilyPlusOneTail: (highEither + 1) / (trials + 1)
  }
};
console.log(JSON.stringify(outcome, null, 2));
