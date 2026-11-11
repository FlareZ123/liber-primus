"use strict";

/**
 * Original LP2 page29 / p50 table / p39 red quadratic factor SFT.
 *
 * Tests a source-constrained algebraic link from the manuscript's red GP29
 * 3-rune mark to one actual unsolved ciphertext page. Page indices are
 * original physical page numbers; p50 is the numeric-only 32×8 table.
 *
 * No inferred key, phase, arbitrary language fit or hidden file is used.
 *
 * Node22: node sims/lp2_p29_p50_red_quadratic_factor_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");

/** @param {string} rel */
function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
}

const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const annotations = readJson("resources/liber-primus/lp2-ink-annotations.json");
const printed = readJson("resources/liber-primus/base60-grid.json");
const originalPages = corpus.pages.filter(
  (page) => page.status === "unsolved" && page.indices.length
);
assert.equal(originalPages.length, 55);

const runeToIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const sourceRed = annotations.pages
  .find((p) => p.page === 39).red_spans.find((span) => span.length === 3);
assert.equal(sourceRed.start, 119);
assert.equal(sourceRed.runes, "ᛡᚳᛋ");
const redAscending = [...sourceRed.runes].map((rune) => runeToIndex.get(rune));
assert.deepEqual(redAscending, [27, 5, 15]);
assert.deepEqual(printed.page_row_counts, [10, 13, 9]);

const alphabet = printed.alphabet;
const printedGrid = printed.rows.flat().map(
  (token) => (alphabet.indexOf(token[0]) * 60 + alphabet.indexOf(token[1])) % 29
);
assert.equal(printedGrid.length, 256);

/** @param {number} x */
function mod(x) {
  return ((x % 29) + 29) % 29;
}

/** @param {number} x */
function inverse(x) {
  for (let i = 1; i < 29; i++) if (mod(x * i) === 1) return i;
  throw new Error("Division by zero in GF29");
}

/** @param {number[]} a */
function trim(a) {
  const first = a.findIndex((v) => v !== 0);
  return first < 0 ? [] : a.slice(first);
}

/**
 * Descending exact GF29 polynomial division.
 * @param {number[]} dividend
 * @param {number[]} divisor
 * @returns {{quotient:number[],remainder:number[]}}
 */
function divide(dividend, divisor) {
  const a = trim(dividend.map(mod));
  const b = trim(divisor.map(mod));
  assert(b.length);
  if (a.length < b.length) return { quotient: [], remainder: a };
  const work = [...a];
  const quotient = [];
  const leadingInverse = inverse(b[0]);
  const count = a.length - b.length + 1;
  for (let i = 0; i < count; i++) {
    const coefficient = mod(work[i] * leadingInverse);
    quotient.push(coefficient);
    for (let j = 0; j < b.length; j++) {
      work[i + j] = mod(work[i + j] - coefficient * b[j]);
    }
  }
  return { quotient, remainder: trim(work.slice(count)) };
}

/** @param {number[]} a @param {number[]} b */
function gcd(a, b) {
  let u = trim(a.map(mod));
  let v = trim(b.map(mod));
  while (v.length) {
    const next = divide(u, v).remainder;
    u = v;
    v = next;
  }
  const multiplier = inverse(u[0]);
  return u.map((x) => mod(x * multiplier));
}

/** @param {number[]} coefficients @param {number} x */
function jet(coefficients, x) {
  let value = 0;
  let derivative = 0;
  for (const coefficient of coefficients) {
    derivative = mod(derivative * x + value);
    value = mod(value * x + coefficient);
  }
  return [value, derivative];
}

/** @param {number[]} a */
function coincidence(a) {
  const counts = Array(29).fill(0);
  for (const rune of a) counts[rune]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (a.length * (a.length - 1));
}

/** @param {number[]} a @param {number[]} b */
function multiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
    }
  }
  return out;
}

function main() {
  // Source ink supplies p39 ascending [27,5,15] => 15X²+5X+27,
  // monic 15^-1 * [15,5,27] = (X−24)² = X²+10X+25 in F29.
  const redDescending = [...redAscending].reverse();
  const monic = redDescending.map((v) => mod(v * inverse(redDescending[0])));
  assert.deepEqual(monic, [1, 10, 25]);
  assert.deepEqual(jet(monic, 24), [0, 0]);

  const p29 = originalPages.find((page) => page.page === 29);
  assert(p29);
  assert.equal(p29.indices.length, 277);
  const actual = divide(p29.indices, monic);
  assert.deepEqual(actual.remainder, []);
  assert.equal(actual.quotient.length, 275);
  assert.deepEqual(jet(p29.indices, 24), [0, 0]);
  assert.deepEqual(jet(printedGrid, 24), [0, 0]);
  assert.deepEqual(jet(p29.indices, 13), [8, 17]);
  assert.deepEqual(jet(printedGrid, 13), [8, 0]);
  assert.equal(coincidence(p29.indices), 0.03369434416365824);
  assert.equal(coincidence(actual.quotient), 0.034054412740544125);

  /** @type {Array<{page:number,degree:number}>} */
  const commonFactorDegrees = originalPages.map((page) => ({
    page: page.page,
    degree: gcd(page.indices, printedGrid).length - 1
  }));
  const onlyDouble = commonFactorDegrees.filter((x) => x.degree >= 2);
  const onlySingle = commonFactorDegrees.filter((x) => x.degree === 1);
  assert.deepEqual(onlyDouble, [{page:29, degree:2}]);
  assert.deepEqual(onlySingle.map((x) => x.page), [10, 11, 36]);
  assert.equal(commonFactorDegrees.filter((x) => x.degree === 0).length, 51);
  assert.deepEqual(gcd(p29.indices, printedGrid), monic);

  // Source-registered exact circular-origin control, preserving all original
  // rune adjacencies except the single wrap boundary and marginal histogram.
  // Rotation is an analysis null, not an author-permitted page reading.
  let countDouble = 0;
  /** @type {Array<{page:number,rotation:number}>} */
  const sourceJointCandidates = [];
  let totalOrigins = 0;
  for (const page of originalPages) {
    for (let rotation = 0; rotation < page.indices.length; rotation++) {
      const src = rotation === 0 ? page.indices :
        page.indices.slice(rotation).concat(page.indices.slice(0, rotation));
      const [v24, d24] = jet(src, 24);
      if (v24 === 0 && d24 === 0) {
        countDouble++;
        const [v13] = jet(src, 13);
        if (v13 === 8) sourceJointCandidates.push({page:page.page, rotation});
      }
      totalOrigins++;
    }
  }
  assert.equal(totalOrigins, 12956);
  assert.equal(countDouble, 29);
  assert.deepEqual(sourceJointCandidates, [
    {page:29,rotation:0}, {page:36,rotation:201}
  ]);

  // A positive plant must be exactly divided, preserving both arithmetic
  // and the GP29 solved-register message; it is explicitly not LP2 plaintext.
  const solved = corpus.pages.find((p) => p.page === 57).indices;
  const text = Array.from({length:275}, (_, i) => solved[i % solved.length]);
  const encrypted = multiply(text, monic);
  assert.deepEqual(divide(encrypted, monic).quotient, text);
  assert.deepEqual(divide(encrypted, monic).remainder, []);

  console.log(JSON.stringify({
    sourceRedAscending: redAscending,
    monicRedQuadratic: monic,
    p29OriginalLength: p29.indices.length,
    p29AtAc24: jet(p29.indices, 24),
    p29AtDot13: jet(p29.indices, 13),
    p50AtAc24: jet(printedGrid, 24),
    p50AtDot13: jet(printedGrid, 13),
    originalPageGcdDegrees: {degree0:51,degree1:onlySingle,degree2:onlyDouble},
    p29QuotientLength: actual.quotient.length,
    p29QuotientIoC: coincidence(actual.quotient),
    totalCyclicOrigins: totalOrigins,
    originsWithDoubleAc24: countDouble,
    originsWithDoubleAc24AndValue13Eight: sourceJointCandidates,
    syntheticGP29MessageRecovered: true
  }, null, 2));
  console.log("PASS: p29 alone among 55 original page starts shares the full p39/p50 quadratic.");
}

main();
