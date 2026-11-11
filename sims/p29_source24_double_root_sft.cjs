"use strict";
/**
 * Source-selected shared (X-24)^2 factor test on every original LP2 page.
 * The selector is original p39's red triad [27,5,15] and p54's enlarged A.
 * Page29 quotient is an exact original-cipher inverse, without native text.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/base60-grid.json"), "utf8"));
const mod = (n) => (n % 29 + 29) % 29;
const unknown = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
assert.equal(unknown.length, 55);
assert.deepEqual(corpus.pages[39].indices.slice(119, 122), [27, 5, 15]);
assert.equal(corpus.pages[54].indices[0], 24);

/**
 * Evaluate polynomial and formal derivative at a field point, reading
 * the natural source rune order as highest-to-lowest coefficients.
 * @param {number[]} coefficients
 * @param {number} x
 * @returns {[number,number]}
 */
function valueDerivative(coefficients, x) {
  let value = 0;
  let derivative = 0;
  for (const c of coefficients) {
    derivative = mod(derivative * x + value);
    value = mod(value * x + c);
  }
  return [value, derivative];
}

const ROOT = 24;
const square = [25, 10, 1]; // 2*[27,5,15] = (X-24)^2 in GF29
assert.deepEqual(valueDerivative(square.slice().reverse(), ROOT), [0, 0]);
assert.deepEqual(valueDerivative(grid.byte_rows.flat().map(mod), ROOT), [0, 0]);

/**
 * Divide a high-to-low polynomial by monic polynomial in low-to-high
 * representation, returning a high-to-low quotient and low-degree remainder.
 * @param {number[]} highCoefficients
 * @param {number[]} lowFactor
 */
function divide(highCoefficients, lowFactor) {
  const rest = highCoefficients.slice().reverse();
  const m = lowFactor.length - 1;
  assert.equal(lowFactor[m], 1);
  const quotient = Array(rest.length - m).fill(0);
  for (let k = quotient.length - 1; k >= 0; k--) {
    const factor = rest[k + m];
    quotient[k] = factor;
    for (let j = 0; j <= m; j++) {
      rest[k + j] = mod(rest[k + j] - factor * lowFactor[j]);
    }
  }
  return {quotient: quotient.reverse(), remainder: rest.slice(0, m)};
}

/** @param {number[]} a */
function ioc(a) {
  const count = Array(29).fill(0);
  for (const c of a) count[c]++;
  return count.reduce((sum, value) =>
    sum + value * (value - 1), 0) / (a.length * (a.length - 1));
}

const roots24 = [];
const allDoubleRoots = [];
for (const page of unknown) {
  const [v, dv] = valueDerivative(page.indices, ROOT);
  if (v === 0) roots24.push({page: page.page, derivative: dv});
  for (let candidate = 0; candidate < 29; candidate++) {
    const [x, dx] = valueDerivative(page.indices, candidate);
    if (x === 0 && dx === 0) {
      allDoubleRoots.push([page.page, candidate]);
    }
  }
}
assert.deepEqual(roots24, [
  {page: 10, derivative: 6}, {page: 11, derivative: 9},
  {page: 29, derivative: 0}, {page: 36, derivative: 27}
]);
assert.deepEqual(allDoubleRoots,
  [[0, 10], [6, 3], [29, 24], [32, 27]]);

const p29 = corpus.pages[29].indices;
const quotient = divide(p29, square);
assert.equal(p29.length, 277);
assert.equal(quotient.quotient.length, 275);
assert.deepEqual(quotient.remainder, [0, 0]);
assert(ioc(quotient.quotient) > 0.0340 &&
  ioc(quotient.quotient) < 0.0341);
// Known solved-GP synthetic control: polynomial multiplication is invertible.
const plant = corpus.pages[57].indices;
const lowPlain = plant.slice().reverse();
const lowEncrypted = Array(plant.length + 2).fill(0);
for (let i = 0; i < lowPlain.length; i++) {
  for (let j = 0; j < square.length; j++) {
    lowEncrypted[i + j] = mod(lowEncrypted[i + j] +
      lowPlain[i] * square[j]);
  }
}
const decodedPlant = divide(lowEncrypted.reverse(), square);
assert.deepEqual(decodedPlant.remainder, [0, 0]);
assert.deepEqual(decodedPlant.quotient, plant);

console.log(JSON.stringify({
  source: "p39 red triad and p54 enlarged A -> root 24",
  root24_page_hits: roots24,
  all_page_double_root_pairs: allDoubleRoots,
  p29_original_length: p29.length,
  p29_quotient_length: quotient.quotient.length,
  p29_original_ioc: ioc(p29),
  p29_quotient_ioc: ioc(quotient.quotient),
  p29_quotient_first40: quotient.quotient.slice(0, 40)
    .map((v) => corpus.translit[v]).join(" ")
}, null, 2));
console.log("PASS: exact p29 source-root quotient, no language recovery");
