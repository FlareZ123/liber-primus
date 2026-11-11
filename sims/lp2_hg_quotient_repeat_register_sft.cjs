'use strict';

/**
 * SFT: does the independently sourced 2013 BASE29 and p39 red-triad
 * polynomial quotient resemble the low-doublet original LP2 rune channel?
 * All comparisons are source-fixed; no plaintext or key is fitted.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'
));
const FIELD = 29;
const H2013 = [3, 26, 24]; // Historical BASE29 3301: digits 3,Q,O
const GP39 = [27, 5, 15]; // Original p39 red-triad GP indices

/** @param {number} x @returns {number} */
function inverse(x) {
  for (let i = 1; i < FIELD; i++) if (x * i % FIELD === 1) return i;
  throw new Error('Noninvertible coefficient: ' + x);
}

/**
 * Divide high-degree-first coefficients by low-degree-first polynomial.
 * Retain leading zero slots and require zero remainder.
 * @param {number[]} high
 * @param {number[]} lowFactor
 * @returns {number[]}
 */
function divideExact(high, lowFactor) {
  const work = high.map(n => n % FIELD).reverse();
  const quotient = Array(work.length - lowFactor.length + 1).fill(0);
  const invLead = inverse(lowFactor[lowFactor.length - 1]);
  for (let q = quotient.length - 1; q >= 0; q--) {
    const multiple = work[q + lowFactor.length - 1] * invLead % FIELD;
    quotient[q] = multiple;
    for (let j = 0; j < lowFactor.length; j++) {
      work[q + j] = (work[q + j] - multiple * lowFactor[j] + FIELD * FIELD) % FIELD;
    }
  }
  assert.deepEqual(work.slice(0, lowFactor.length - 1),
    Array(lowFactor.length - 1).fill(0), 'Historical factor must divide source grid');
  return quotient.reverse();
}

/**
 * Multiply two coefficient sequences high degree first.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
function multiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      out[i + j] = (out[i + j] + a[i] * b[j]) % FIELD;
    }
  }
  return out;
}

/** @param {number[]} series @returns {number} */
function repeatCount(series) {
  let n = 0;
  for (let i = 1; i < series.length; i++) if (series[i] === series[i - 1]) n++;
  return n;
}

/**
 * Exact adjacent-equality histogram of every contiguous window.
 * No Monte Carlo or distributional assumption is used.
 * @param {number[]} series
 * @param {number} length
 * @returns {{windows:number, histogram:Record<string,number>, maximum:number}}
 */
function windowCounts(series, length) {
  assert.ok(series.length >= length);
  const edge = series.map((v, i) => i > 0 && v === series[i - 1] ? 1 : 0);
  let equals = 0;
  for (let i = 1; i < length; i++) equals += edge[i];
  /** @type {Record<string,number>} */
  const histogram = {};
  for (let first = 0; first + length <= series.length; first++) {
    if (first) equals += edge[first + length - 1] - edge[first];
    histogram[equals] = (histogram[equals] || 0) + 1;
  }
  return {
    windows: series.length - length + 1,
    histogram,
    maximum: Math.max(...Object.keys(histogram).map(Number))
  };
}

const alphabet = grid.alphabet;
const bytes = grid.rows.flat().map(token =>
  60 * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1])
);
assert.equal(bytes.length, 256);
assert.ok(bytes.every(n => n >= 0 && n <= 255));
const originalResidues = bytes.map(n => n % FIELD);
assert.equal(originalResidues[0], 0);

const quotientAfterH = divideExact(originalResidues, H2013);
const quotientFixed = divideExact(quotientAfterH, GP39);
assert.equal(quotientFixed.length, 252);
assert.equal(quotientFixed[0], 0);
assert.deepEqual(multiply(
  multiply(quotientFixed, GP39.slice().reverse()), H2013.slice().reverse()
), originalResidues, 'Exact original table re-enciphering');
assert.deepEqual(divideExact(divideExact(originalResidues, GP39), H2013),
  quotientFixed, 'Division order must commute');

const canonical = quotientFixed.slice(1);
assert.equal(canonical.length, 251);
assert.equal(repeatCount(canonical), 8);
assert.equal(repeatCount(quotientFixed), 8);

const pages = corpus.pages.filter(p => p.page <= 55 && p.runic_count > 0);
const unknown = pages.flatMap(p => p.indices);
assert.equal(pages.length, 55);
assert.equal(unknown.length, 12956);
const withinPageTransitions = pages.reduce((n, p) => n + p.indices.length - 1, 0);
const withinPageRepeats = pages.reduce((n, p) => n + repeatCount(p.indices), 0);
assert.equal(withinPageTransitions, 12901);
assert.equal(withinPageRepeats, 86);

// The 54 cross-page joins have no doublet, so the flattened sliding-window
// panel gives a second comparator with much wider coverage.
assert.equal(repeatCount(unknown), withinPageRepeats);
const joined = windowCounts(unknown, canonical.length);
assert.equal(joined.windows, 12706);
assert.equal(joined.maximum, 6);
const local = {windows: 0, maximum: 0, histogram: {}};
for (const page of pages) {
  if (page.indices.length < canonical.length) continue;
  const w = windowCounts(page.indices, canonical.length);
  local.windows += w.windows;
  local.maximum = Math.max(local.maximum, w.maximum);
  for (const [count, n] of Object.entries(w.histogram)) {
    local.histogram[count] = (local.histogram[count] || 0) + n;
  }
}
assert.equal(local.windows, 615);
assert.equal(local.maximum, 5);

// Source-native positive: a true contiguous 251-rune original window survives
// the same H×G GF(29) forward encoder and exact inverse unchanged.
const nativeWindow = pages[0].indices.slice(0, canonical.length);
const sourcePlant = multiply(
  multiply([0, ...nativeWindow], GP39.slice().reverse()), H2013.slice().reverse()
);
assert.equal(sourcePlant.length, 256);
assert.deepEqual(divideExact(divideExact(sourcePlant, H2013), GP39).slice(1),
  nativeWindow);

const result = {
  hypothesis: 'H2013×Gp39 quotient as LP2-style anti-repeat rune register',
  sourceCoefficients: {H2013, GP39},
  originalGrid: {bytes: bytes.length, firstByte: bytes[0]},
  quotient: {fixedWidth: quotientFixed.length, canonical: canonical.length,
    adjacentRepeats: repeatCount(canonical), eligibleEdges: canonical.length - 1},
  manuscript: {runes: unknown.length, originalWithinPageRepeats: withinPageRepeats,
    originalWithinPageEdges: withinPageTransitions},
  originalWindows: {joined, withinPage: local},
  sourceTruePlant: 'Exact 251/251 quotient recovery and 256/256 forward reconstruction',
  conclusion: 'No original anti-repeat fingerprint in quotient; not a plaintext recovery'
};
console.log(JSON.stringify(result, null, 2));
