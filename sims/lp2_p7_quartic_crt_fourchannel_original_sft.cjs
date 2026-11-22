"use strict";
/**
 * Source-derived GP29 polynomial CRT readout on the exact original LP2 corpus.
 * Windows 11 / Node.js 22: node sims/lp2_p7_quartic_crt_fourchannel_original_sft.cjs
 *
 * The original p7 five-red-word polynomial has
 * P(X)-X = 2 (X-3)(X-4)(X^2-8) mod 29.
 * The adjacent p8 red whole-word products are printed 4,3.
 * A cubic coefficient vector is mapped to evaluations at 4, 3 and the
 * constant/linear coefficients modulo X^2-8. A canonical complete CRT
 * coordinate transform, and its inverse, are tested without a fitted key.
 *
 * This is a bounded negative direct original-cipher experiment, not
 * a claim that a first-party instruction orders CRT or p8 word resegmentation.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
  "utf8"
));

const forward = [
  [1, 4, 16, 6],
  [1, 3, 9, 27],
  [1, 0, 8, 0],
  [0, 1, 0, 8]
];
const inverse = [
  [3, 26, 1, 26],
  [28, 8, 22, 10],
  [25, 4, 0, 4],
  [11, 28, 19, 17]
];

/**
 * @param {number[]} source GP29 indices
 * @param {number[][]} matrix A four-by-four GF29 transformation
 * @returns {number[]} Full reversible output with unchanged tail of 0..3 symbols
 */
function transform(source, matrix) {
  const output = [];
  for (let start = 0; start < source.length; start += 4) {
    const block = source.slice(start, start + 4);
    if (block.length < 4) {
      output.push(...block);
      continue;
    }
    for (const row of matrix) {
      const value = row.reduce((acc, coefficient, j) => acc + coefficient * block[j], 0) % 29;
      output.push(value);
    }
  }
  return output;
}

/**
 * @param {number[]} stream
 * @returns {number}
 */
function ioc(stream) {
  const counts = Array(29).fill(0);
  for (const value of stream) counts[value]++;
  return counts.reduce((total, count) => total + count * (count - 1), 0) /
    (stream.length * (stream.length - 1));
}

/** @param {number} lo @param {number} hi @returns {number[]} */
function pages(lo, hi) {
  return corpus.pages.filter(p => p.page >= lo && p.page <= hi)
    .flatMap(p => p.indices);
}

/** @param {number[]} a @param {number[]} b */
function same(a, b) {
  assert.deepEqual(a, b);
}

for (let base = 0; base < 4; base++) {
  const e = Array.from({ length: 4 }, (_, i) => Number(i === base));
  same(transform(transform(e, forward), inverse), e);
  same(transform(transform(e, inverse), forward), e);
}

// Genuine solved p57 source GP indices, with one extra p56 rune to fill a block.
const native = corpus.pages[57].indices.concat(corpus.pages[56].indices.slice(0, 1));
assert.equal(native.length, 96);
const ciphertextPlant = transform(native, inverse);
same(transform(ciphertextPlant, forward), native);
same(transform(transform(native, forward), inverse), native);

const register = [
  [8, 14, 1729, 0.03426033031296189, 0.034420318959792646],
  [16, 21, 1613, 0.03438485998532396, 0.0346033084168796],
  [33, 39, 1680, 0.034596131484160075, 0.03435576732181854],
  [40, 53, 3008, 0.03442300412512648, 0.03446368933481451],
  [54, 55, 308, 0.03413849993654554, 0.03396928804094928]
];

for (const [lo, hi, n, expectedForward, expectedInverse] of register) {
  const original = pages(lo, hi);
  assert.equal(original.length, n);
  const decoded = transform(original, forward);
  const inverseDecoded = transform(original, inverse);
  same(transform(decoded, inverse), original);
  same(transform(inverseDecoded, forward), original);
  assert.ok(Math.abs(ioc(decoded) - expectedForward) < 1e-12);
  assert.ok(Math.abs(ioc(inverseDecoded) - expectedInverse) < 1e-12);
  console.log(JSON.stringify({
    pages: lo + "-" + hi,
    originalRunes: n,
    originalIoC: ioc(original),
    crtIoC: ioc(decoded),
    inverseCrtIoC: ioc(inverseDecoded),
    crtPrefix: decoded.slice(0, 35).map(value => corpus.translit[value]).join("")
  }));
}

console.log("PASS: p7 CRT direct fixed-operation original inverses remain nonprose; positive solved rune replay exact.");
