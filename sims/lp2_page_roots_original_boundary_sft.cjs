"use strict";

/**
 * Original 55 page boundaries as a GF(29) polynomial-root selector.
 *
 * This SFT tests the exact cyclic-rotation null over the original 12,956
 * GP29 symbols and all eight independently source-visible visual chapter
 * boundaries. No ciphertext rune is moved or altered for the observed test.
 * The source-native positive plant below is independent of this result.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname,
  "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const pages = corpus.pages.filter(page => page.status === "unsolved");
const alphabet = 29;
const book = Uint8Array.from(pages.flatMap(page => page.indices));
const N = book.length;
const K = pages.length;
const lengths = pages.map(page => page.indices.length);
const offsets = [];
let seen = 0;
for (const length of lengths) {
  offsets.push(seen);
  seen += length;
}
assert.equal(K, 55);
assert.equal(N, 12956);
assert.equal(seen, N);
assert(!pages.some(page => page.page === 50));

/** GP29 polynomial in original printed descending-coefficient order. */
function roots(coefficients) {
  const found = [];
  for (let x = 0; x < alphabet; x++) {
    let value = 0;
    for (const coefficient of coefficients) {
      value = (value * x + coefficient) % alphabet;
    }
    if (!value) found.push(x);
  }
  return found;
}

// A source-native non-root page becomes exactly divisible by X-1 by changing
// only its final GP index. The plant shows that a genuine source-sized root
// can be detected without fitting a secret key or editing observed ciphertext.
const p9 = pages.find(page => page.page === 9);
assert.deepEqual(roots(p9.indices), []);
const plant = p9.indices.slice();
plant[plant.length - 1] = (alphabet -
  plant.slice(0, -1).reduce((sum, c) => (sum + c) % alphabet, 0)) % alphabet;
assert(roots(plant).includes(1));
assert.deepEqual(roots(p9.indices), []);
const naive = pages.map(page => roots(page.indices).length);
assert.equal(naive.reduce((sum, count) => sum + count, 0), 74);

/**
 * A maximally literal inverse candidate for a page with factor (X-r):
 * divide out every actual GF29 linear root in ascending root order,
 * including the four repeated roots. No unknown key, source phrase or
 * fitted root is permitted. This is deliberately tested once, then retired
 * if the result is not GP-native language.
 */
function divideByRoot(coefficients, root) {
  assert(coefficients.length > 1);
  const quotient = Array(coefficients.length - 1);
  quotient[0] = coefficients[0];
  for (let i = 1; i < quotient.length; i++) {
    quotient[i] = (coefficients[i] + root * quotient[i - 1]) % alphabet;
  }
  assert.equal((coefficients.at(-1) +
    root * quotient.at(-1)) % alphabet, 0);
  return quotient;
}

/** @param {number[]} indices */
function ioc(indices) {
  const frequencies = Array(alphabet).fill(0);
  for (const value of indices) frequencies[value]++;
  return frequencies.reduce((sum, n) => sum + n * (n - 1), 0) /
    (indices.length * (indices.length - 1));
}

const stripped = [];
const removedByPage = [];
for (const page of pages) {
  let current = page.indices.slice();
  const removed = [];
  for (let root = 0; root < alphabet; root++) {
    while (current.length > 1 && roots(current).includes(root)) {
      removed.push(root);
      current = divideByRoot(current, root);
    }
  }
  stripped.push({page: page.page, indices: current});
  removedByPage.push({page: page.page, roots: removed});
}
const strippedText = stripped.flatMap(page => page.indices);
const originalIoC = ioc([...book]);
const strippedIoC = ioc(strippedText);
const post27Original = pages.filter(page => page.page >= 27)
  .flatMap(page => page.indices);
const post27Stripped = stripped.filter(page => page.page >= 27)
  .flatMap(page => page.indices);
assert.equal(removedByPage.reduce((sum, page) => sum +
  page.roots.length, 0), 78);
assert.equal(strippedText.length, N - 78);
assert(Math.abs(originalIoC - 0.03447839786450569) < 1e-12);
assert(Math.abs(strippedIoC - 0.03447605254262609) < 1e-12);
assert(Math.abs(ioc(post27Stripped) - 0.03455396880752661) < 1e-12);

const chapterStarts = [3, 8, 15, 23, 27, 33, 40, 54];
const chapterIndexes = chapterStarts.map(physical => {
  const i = pages.findIndex(page => page.page === physical);
  assert(i >= 0);
  return i;
});

// At root x, use Horner prefix H[n] on book||book. Every original page of
// length L starting at s satisfies
//   P_s,L(x) = H[s+L] - x^L * H[s] (mod29).
// This computes all 12,956 rotations exactly, including every original
// within-page rune. Source lengths and page order are held constant.
const hit = Array.from({length: K}, () => new Uint8Array(N));
for (let x = 0; x < alphabet; x++) {
  const powers = new Uint8Array(Math.max(...lengths) + 1);
  powers[0] = 1;
  for (let j = 1; j < powers.length; j++) {
    powers[j] = powers[j - 1] * x % alphabet;
  }
  const prefix = new Uint8Array(2 * N + 1);
  for (let j = 0; j < 2 * N; j++) {
    prefix[j + 1] = (prefix[j] * x + book[j % N]) % alphabet;
  }
  for (let k = 0; k < K; k++) {
    const values = hit[k];
    const prefixOffset = offsets[k];
    const power = powers[lengths[k]];
    for (let shift = 0; shift < N; shift++) {
      const start = shift + prefixOffset;
      const h = (prefix[start + lengths[k]] -
        prefix[start] * power % alphabet + alphabet) % alphabet;
      if (h === 0) values[shift]++;
    }
  }
}

assert.deepEqual(hit.map(values => values[0]), naive);
const chapterSuffix = chapterIndexes.map(start => {
  const rootCounts = new Uint16Array(N);
  for (let k = start; k < K; k++) {
    for (let shift = 0; shift < N; shift++) {
      rootCounts[shift] += hit[k][shift];
    }
  }
  return rootCounts;
});

/** @param {Uint16Array} values */
function summarize(values) {
  let sum = 0;
  for (const value of values) sum += value;
  const mean = sum / N;
  let squared = 0;
  let ge = 0;
  const actual = values[0];
  for (const value of values) {
    squared += (value - mean) ** 2;
    if (value >= actual) ge++;
  }
  const sd = Math.sqrt(squared / N);
  return {actual, nullMean: mean, nullSd: sd,
    standardizedExcess: (actual - mean) / sd,
    tailCount: ge, exactConditionalTail: ge / N};
}

const summaries = chapterSuffix.map((values, i) => ({
  fromPhysicalPage: chapterStarts[i],
  nPages: K - chapterIndexes[i],
  ...summarize(values)
}));
const observedMax = Math.max(...summaries.map(s => s.standardizedExcess));
let familywiseCount = 0;
for (let shift = 0; shift < N; shift++) {
  let shiftMax = -Infinity;
  for (let i = 0; i < summaries.length; i++) {
    const s = summaries[i];
    const z = (chapterSuffix[i][shift] - s.nullMean) / s.nullSd;
    shiftMax = Math.max(shiftMax, z);
  }
  if (shiftMax >= observedMax - 1e-12) familywiseCount++;
}
assert.equal(summaries.find(s => s.fromPhysicalPage === 27).actual, 45);
assert.equal(summaries.find(s => s.fromPhysicalPage === 27).tailCount, 20);
assert.equal(familywiseCount, 107);
assert.equal(observedMax, summaries[4].standardizedExcess);

console.log(JSON.stringify({
  purpose: "Physical page-root enrichment, not a plaintext decoding",
  field: "GF29",
  rule: "whole-page polynomial P(x) in source rune order, count roots x=0..28",
  pageCount: K,
  ciphertextRunes: N,
  plantedPageRootAt1: "PASS",
  directAllLinearFactorQuotient: {
    factorsRemoved: 78,
    quotientRunes: strippedText.length,
    originalIoC,
    quotientIoC: strippedIoC,
    post27OriginalIoC: ioc(post27Original),
    post27QuotientIoC: ioc(post27Stripped),
    first120GP: strippedText.slice(0, 120).map(index =>
      corpus.translit[index]).join("")
  },
  exactPageRoots: naive,
  totalOriginalRootIncidences: 74,
  sourceChapterBreaksTested: chapterStarts,
  sourceChapterSuffixes: summaries,
  familywiseBoundarySelection: {
    observedMaximumZ: observedMax,
    cyclicRotationsTested: N,
    exceedancesIncludingOriginal: familywiseCount,
    exactConditionalTail: familywiseCount / N
  },
  interpretation: "Source chapter starting at p27 has a root-rich " +
    "second-half register; there is no source-identified root selector, " +
    "plaintext, secret key or cipher step, and exploratory tests need " +
    "protection against wider hypothesis-selection bias."
}, null, 2));
