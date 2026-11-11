"use strict";

/**
 * SFT: literal 2013 BASE29/DH ElGamal transfer to the source-divided LP2 grid.
 * Run: node sims/2013_base29_dh_elgamal_source_sft.cjs
 *
 * The 2013 worked DH exchange has private client exponent 15. This test
 * treats the 252-symbol quotient of the unchanged printed 32x8 table as
 * 63 pairs of elements in the p3-red-triad GF(29^2) field. It makes no
 * arbitrary key search, original-cipher plaintext claim, or cipher
 * identification. A complete native-GP plaintext plant validates the model.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} relative @returns {any} */
function json(relative) {
  return JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
}

const grid = json("resources/liber-primus/base60-grid.json");
const corpus = json("resources/liber-primus/lp2-corpus.json");
const bytes = grid.byte_rows.flat();
assert.equal(grid.byte_rows.length, 32);
assert(grid.byte_rows.every((row) => row.length === 8));
assert.equal(bytes.length, 256);
assert.deepEqual(bytes.slice(0, 4), [203, 231, 167, 186]);

/** @param {number} value @returns {number} */
const mod = (value) => ((value % 29) + 29) % 29;

/** @param {number} value @returns {number} */
function inverse29(value) {
  for (let i = 1; i < 29; i++) {
    if (mod(value * i) === 1) return i;
  }
  throw new Error("Zero element has no inverse");
}

/**
 * Multiply increasing-power coefficient polynomials over GF29.
 * @param {number[]} a @param {number[]} b @returns {number[]}
 */
function multiplyPolynomial(a, b) {
  const result = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] = mod(result[i + j] + a[i] * b[j]);
    }
  }
  return result;
}

const historicalBASE29 = [3, 26, 24]; // "BASE29 3301" -> 3QO
const historicalDHAndP39 = [27, 5, 15]; // 15*(X-24)^2
const divisor = multiplyPolynomial(historicalBASE29, historicalDHAndP39);
assert.deepEqual(divisor, [23, 21, 11, 17, 12]);

// The published byte order is descending-power. Work with ascending powers.
const remainder = bytes.slice().reverse().map(mod);
const quotient = Array(252).fill(0);
const topInverse = inverse29(divisor[4]);
for (let i = 255; i >= 4; i--) {
  const coefficient = mod(remainder[i] * topInverse);
  quotient[i - 4] = coefficient;
  for (let j = 0; j < divisor.length; j++) {
    remainder[i - 4 + j] = mod(remainder[i - 4 + j] - coefficient * divisor[j]);
  }
}
assert.deepEqual(remainder.slice(0, 4), [0, 0, 0, 0]);
assert.equal(quotient.length, 252);
assert.equal(quotient[251], 0); // original printed leading byte is 203=7*29

/** @typedef {[number,number]} FieldElement */

/**
 * GF(29^2) using p3's marked triad 13+23u+2u^2=0,
 * which yields u^2=3u+8.
 * @param {FieldElement} a @param {FieldElement} b
 * @returns {FieldElement}
 */
function mul(a, b) {
  return [
    mod(a[0] * b[0] + 8 * a[1] * b[1]),
    mod(a[0] * b[1] + a[1] * b[0] + 3 * a[1] * b[1]),
  ];
}

/** @param {FieldElement} element @param {number} exponent
 * @returns {FieldElement}
 */
function pow(element, exponent) {
  let result = /** @type {FieldElement} */ ([1, 0]);
  let base = element;
  let k = exponent;
  while (k > 0) {
    if (k % 2) result = mul(result, base);
    base = mul(base, base);
    k = Math.floor(k / 2);
  }
  return result;
}

const originalSolvedGP = corpus.pages[57].indices.slice(0, 63);
assert.equal(originalSolvedGP.length, 63);

/**
 * Pair the exact 252 remainder-free quotient coefficients into 126 field
 * elements. Two historical-source-natural pair clocks: consecutive
 * coefficients, or two equal 126-coefficient lanes.
 * @param {number[]} q @param {"adjacent"|"halves"} pairing
 * @returns {FieldElement[]}
 */
function fieldElements(q, pairing) {
  if (pairing === "adjacent") {
    return Array.from({length:126}, (_, i) => [q[2 * i], q[2 * i + 1]]);
  }
  return Array.from({length:126}, (_, i) => [q[i], q[i + 126]]);
}

const models = [];
for (const pairing of ["adjacent", "halves"]) {
  for (const reversed of [false, true]) {
    const q = reversed ? quotient.slice().reverse() : quotient;
    const elements = fieldElements(q, pairing);
    let zeroFirst = 0;
    let gpSubfield = 0;
    let literalByte = 0;
    let positive = 0;
    for (let i = 0; i < 63; i++) {
      const c1 = elements[2 * i];
      const c2 = elements[2 * i + 1];
      if (c1[0] === 0 && c1[1] === 0) {
        zeroFirst++;
        continue;
      }

      // Standard ElGamal: m = c2 * c1^(-x), with x=15 and |GF841*|=840.
      const original = mul(c2, pow(c1, 825));
      assert.deepEqual(mul(original, pow(c1, 15)), c2);
      if (original[1] === 0) gpSubfield++;
      if (original[0] + 29 * original[1] <= 255) literalByte++;

      // Fully controlled native solved-page GP field message with the same
      // actual c1 and the exact source-selected client exponent.
      const planted = /** @type {FieldElement} */ ([originalSolvedGP[i], 0]);
      const encrypted = mul(planted, pow(c1, 15));
      assert.deepEqual(mul(encrypted, pow(c1, 825)), planted);
      assert.deepEqual(mul(planted, pow(c1, 15)), encrypted);
      positive++;
    }
    assert.equal(zeroFirst, 0);
    assert.equal(positive, 63);
    models.push({pairing, reversed, zeroFirst, gpSubfield, literalByte,
      positiveNativeGP: positive});
  }
}

assert.deepEqual(models.map((row) => row.gpSubfield), [4,1,2,2]);
assert.deepEqual(models.map((row) => row.literalByte), [19,19,23,22]);
console.log(JSON.stringify({
  claim:"literal ElGamal transfer only; no LP2 plaintext or authentic key",
  input:"256 unchanged original row-major base60 table bytes",
  factorProduct:divisor,
  quotientSymbols:quotient.length,
  privateExponent:15,
  field:"u^2=3u+8 over GF29, |GF841*|=840",
  outputLengthEach:63,
  models,
}, null, 2));
