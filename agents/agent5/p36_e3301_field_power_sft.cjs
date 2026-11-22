"use strict";

/**
 * Source-fixed e=3301 finite-field inverse of original LP2 physical page 36.
 * Run from any directory: node agents/agent5/p36_e3301_field_power_sft.cjs
 *
 * Uses the conventional, still conditional, base60 table encoding and the
 * independently established monic GF(29) factor of degree 238.
 * This is a bounded negative decipherment experiment, not a solved page.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..", "..");
const grid = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/base60-grid.json"), "utf8"));
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));

const modulus = 29;
const degree = 238;
const exponent = 3301n;
/** @param {number} x @returns {number} */
const reduce = x => ((x % modulus) + modulus) % modulus;

/**
 * Divide a polynomial by a monic divisor in ascending coefficient order.
 * @param {number[]} polynomial
 * @param {number[]} factor
 * @returns {number[]}
 */
function divideExact(polynomial, factor) {
  assert.equal(factor.at(-1), 1, "factor must be monic");
  const remainder = polynomial.slice();
  const quotient = new Array(polynomial.length - factor.length + 1).fill(0);
  for (let i = polynomial.length - 1; i >= factor.length - 1; i--) {
    const coefficient = reduce(remainder[i]);
    quotient[i - factor.length + 1] = coefficient;
    for (let j = 0; j < factor.length; j++) {
      remainder[i - factor.length + j + 1] =
        reduce(remainder[i - factor.length + j + 1] - coefficient * factor[j]);
    }
  }
  assert.ok(remainder.slice(0, factor.length - 1).every(x => x === 0), "nonzero field remainder");
  return quotient;
}

/** @returns {number[]} Monic irreducible degree-238 factor. */
function getModulus() {
  let coefficients = grid.rows.flat().map(token => {
    assert.equal(token.length, 2);
    const a = grid.alphabet.indexOf(token[0]);
    const b = grid.alphabet.indexOf(token[1]);
    assert.ok(a >= 0 && b >= 0, "unknown base60 digit");
    return reduce(60 * a + b);
  }).reverse();
  assert.equal(coefficients.length, 256);
  while (coefficients.length > 1 && coefficients.at(-1) === 0) coefficients.pop();

  // Factorization of the complete original GF29 table polynomial,
  // previously established in im-results/lp2-grid-complete-gf29-factorization.md.
  for (const factor of [
    [5, 1],
    [5, 1],
    [11, 18, 1],
    [24, 16, 14, 1],
    [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
  ]) coefficients = divideExact(coefficients, factor);

  assert.equal(coefficients.length, degree + 1);
  assert.equal(coefficients[degree], 28);
  // Original leading scalar is -1 (mod29). Negate to make Q238 monic.
  const monic = coefficients.map(x => reduce(-x));
  assert.equal(monic[degree], 1);
  return monic;
}

const fieldPolynomial = getModulus();

/**
 * Multiply in GF(29)[X] / Q238, ascending polynomial order.
 * Floating-point intermediates remain exact: each product coefficient
 * is bounded far below the 53-bit integer precision limit.
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {Uint8Array}
 */
function multiply(a, b) {
  assert.equal(a.length, degree);
  assert.equal(b.length, degree);
  const temp = new Float64Array(2 * degree - 1);
  for (let i = 0; i < degree; i++) {
    if (!a[i]) continue;
    for (let j = 0; j < degree; j++) if (b[j]) temp[i + j] += a[i] * b[j];
  }
  for (let k = 2 * degree - 2; k >= degree; k--) {
    const coefficient = reduce(temp[k]);
    if (!coefficient) continue;
    for (let j = 0; j < degree; j++) {
      temp[k - degree + j] -= coefficient * fieldPolynomial[j];
    }
  }
  const result = new Uint8Array(degree);
  for (let j = 0; j < degree; j++) result[j] = reduce(temp[j]);
  return result;
}

/**
 * Exponentiate an element in the exact finite field.
 * @param {Uint8Array} base
 * @param {bigint} power
 * @returns {Uint8Array}
 */
function fieldPower(base, power) {
  assert.ok(power >= 0n);
  let result = new Uint8Array(degree);
  result[0] = 1;
  while (power > 0n) {
    if ((power & 1n) !== 0n) result = multiply(result, base);
    power >>= 1n;
    if (power > 0n) base = multiply(base, base);
  }
  return result;
}

/**
 * Modular inverse through the extended Euclidean algorithm.
 * @param {bigint} a
 * @param {bigint} modulus
 * @returns {bigint}
 */
function inverse(a, modulus) {
  let u = 0n, v = 1n, r = modulus, s = a;
  while (s !== 0n) {
    const q = r / s;
    [u, v] = [v, u - q * v];
    [r, s] = [s, r - q * s];
  }
  assert.equal(r, 1n, "noninvertible exponent");
  return (u % modulus + modulus) % modulus;
}

/** @param {Uint8Array} word @returns {number} */
function coincidence(word) {
  const counts = new Uint32Array(modulus);
  for (const value of word) counts[value]++;
  return counts.reduce((sum, x) => sum + x * (x - 1), 0) / (word.length * (word.length - 1));
}

const phi = 29n ** BigInt(degree) - 1n;
const inverseExponent = inverse(exponent, phi);
const original = corpus.pages[36].indices;
assert.equal(original.length, degree);
assert.equal(corpus.pages.slice(0, 56).reduce((sum, page) => sum + page.indices.length, 0), 12956);

const results = [];
for (const orientation of ["original", "reversed"]) {
  const input = Uint8Array.from(orientation === "original" ? original : [...original].reverse());
  for (const [direction, power] of [
    ["power3301", exponent],
    ["inverse3301", inverseExponent]
  ]) {
    const candidate = fieldPower(input, power);
    const printable = orientation === "reversed" ? [...candidate].reverse() : [...candidate];
    const prefix = printable.slice(0, 60).map(value => corpus.translit[value]).join(" ");
    results.push({orientation, direction, ioc: coincidence(candidate), prefix});
  }
}

const seed = corpus.pages[57].indices;
assert.equal(seed.length, 95);
const plant = Uint8Array.from(Array.from({length: degree}, (_, i) => seed[i % seed.length]));
const ciphertext = fieldPower(plant, exponent);
const recovered = fieldPower(ciphertext, inverseExponent);
assert.deepEqual([...recovered], [...plant], "positive-control plaintext is not recovered");

// For the exact source input, the no-key original candidate is still
// histogram-flat; no parameter was chosen by fitting to expected plaintext.
const rounded = results.map(row => ({...row, ioc: +row.ioc.toFixed(12)}));
assert.deepEqual(rounded.map(x => x.ioc), [
  0.033861645924, 0.035102648654, 0.034393504237, 0.034428961458
]);
console.log(JSON.stringify({
  input: "LP2 physical p36, 238 original GP29 runes",
  exponent: exponent.toString(),
  inverseExponentBits: inverseExponent.toString(2).length,
  irreducibleFieldDegree: degree,
  positiveControlRecovered: recovered.length,
  original: rounded,
  conclusion: "No readable GP29 plaintext; a narrow, source-motivated direct field-power inverse is negative."
}, null, 2));
