"use strict";

/**
 * Source-fixed GF29 polynomial quotient for original LP2 physical page29.
 *
 * This tests the strongest literal GP29 plaintext interpretation of an
 * observation identified independently by Agent21: the one unknown
 * rune-bearing page exactly divisible by G(X)=15X^2+5X+27 from p39's
 * red GP ordinal triple. The quotient itself is not source-authenticated
 * plaintext and was selected after observing which original page divides.
 *
 * Run from the repository: node sims/lp2_p29_g_polynomial_quotient_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(
  root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const page = corpus.pages.find((p) => p.page === 29);
const solved = corpus.pages.find((p) => p.page === 57);
assert(page && solved, "Original and solved controls must exist");
const C = page.indices;
const G = [15, 5, 27]; // p39 red-triad source, descending
const H = [24, 26, 3]; // 2013 signed BASE29 3301 -> 3QO, descending

/** @param {number} x @returns {number} */
const mod = (x) => ((x % 29) + 29) % 29;

/** @param {number} n @returns {number} */
function inverse(n) {
  for (let candidate = 1; candidate < 29; candidate++) {
    if (mod(n * candidate) === 1) return candidate;
  }
  throw new Error("Non-invertible leading polynomial coefficient");
}

/**
 * Divide highest-degree-first F29 coefficient arrays. All input positions
 * and both remaining parity positions are retained exactly.
 * @param {number[]} dividend
 * @param {number[]} divisor
 * @returns {{quotient:number[],remainder:number[]}}
 */
function divide(dividend, divisor) {
  const remaining = dividend.slice();
  const quotient = [];
  const multiplier = inverse(divisor[0]);
  for (let i = 0; i <= dividend.length - divisor.length; i++) {
    const factor = mod(remaining[i] * multiplier);
    quotient.push(factor);
    for (let j = 0; j < divisor.length; j++) {
      remaining[i + j] = mod(remaining[i + j] - factor * divisor[j]);
    }
    assert.equal(remaining[i], 0);
  }
  return {quotient, remainder: remaining.slice(-(divisor.length - 1))};
}

/**
 * Highest-degree-first polynomial multiplication in F29.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
function multiply(a, b) {
  const result = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] = mod(result[i + j] + a[i] * b[j]);
    }
  }
  return result;
}

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const digit of symbols) counts[digit]++;
  return counts.reduce((n, c) => n + c * (c - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/** @param {number[]} symbols @returns {string} */
function transliterate(symbols) {
  return symbols.map((symbol) => corpus.translit[symbol]).join("");
}

assert.equal(C.length, 277);
const direct = divide(C, G);
assert.equal(direct.quotient.length, 275);
assert.deepEqual(direct.remainder, [0, 0]);
assert.deepEqual(multiply(direct.quotient, G), C);
assert.equal(direct.quotient.reduce((n, x, i, q) =>
  n + Number(i > 0 && x === q[i - 1]), 0), 11);
assert(Math.abs(ioc(direct.quotient) - 0.034054412740544125) < 1e-12);

const wrong = divide(C, H);
assert.deepEqual(wrong.remainder, [16, 20]);

// Solved original p57 supplied as GP-language input to a forward cipher
// plant. Multiplication and division must recover every GP rune exactly.
const plain = Array.from({length: 275}, (_, i) =>
  solved.indices[i % solved.indices.length]);
const encrypted = multiply(plain, G);
const recovered = divide(encrypted, G);
assert.equal(encrypted.length, 277);
assert.deepEqual(recovered.remainder, [0, 0]);
assert.deepEqual(recovered.quotient, plain);
assert.deepEqual(multiply(recovered.quotient, G), encrypted);

console.log(JSON.stringify({
  source: "LP2 page29 GP29 coefficients, original printed order",
  sourceKey: "p39 red triple G(X)=15X^2+5X+27",
  originalInputRunes: C.length,
  quotientRunes: direct.quotient.length,
  sourceRemainder: direct.remainder,
  quotientIoC: ioc(direct.quotient),
  originalIoC: ioc(C),
  quotientFirst90: transliterate(direct.quotient.slice(0, 90)),
  wrongSigned2013H: {divisor: H, remainder: wrong.remainder},
  sourceNativePlant: {
    source: "Solved original LP2 p57 GP symbols",
    recoveredRunes: recovered.quotient.length,
    exactRecovered: true,
    plantedIoC: ioc(plain)
  },
  interpretation: "Literal G-multiplication route has exact arithmetic and a correct inverse, but its original p29 quotient is uniform-looking GP29, with no recovered plaintext."
}, null, 2));
