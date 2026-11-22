"use strict";
/**
 * Source-motivated GF(29^238) p36 field-power inversion gate.
 * Standalone Node 22 SFT. Run from repository root:
 * node sims/lp2_q238_p36_gf29dh_fieldpower_sft.cjs
 *
 * The original pp49-51 256-cell table supplies a monic irreducible
 * degree-238 factor Q238. Physical page p36 has exactly 238 original
 * ciphertext runes. The 2013 DH3301 protocol's conditionally selected
 * private exponent 1661 motivates a complete finite-field permutation.
 * This experiment freezes the two literal coefficient orders and both
 * exponent directions, without fitting a symbol shift, IV or English key.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const read = (p) => JSON.parse(fs.readFileSync(
  path.resolve(__dirname, "..", p), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/lp2-grid-256.json");
assert.equal(grid.bytes.length, 256);
assert.equal(corpus.pages[36].indices.length, 238);
assert.equal(corpus.pages[57].indices.length, 95);
const mod = (v) => (v % 29 + 29) % 29;
/** @param {number[]} a @param {number[]} b */
function polyMultiply(a, b) {
  const p = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      p[i + j] = mod(p[i + j] + a[i] * b[j]);
    }
  }
  return p;
}
/** Divide exactly by a monic polynomial, checking the remainder. */
function divideMonic(a, b) {
  assert.equal(b[b.length - 1], 1);
  const r = a.slice();
  const quotient = Array(a.length - b.length + 1).fill(0);
  for (let i = quotient.length - 1; i >= 0; i--) {
    const term = r[i + b.length - 1];
    quotient[i] = term;
    for (let j = 0; j < b.length; j++) {
      r[i + j] = mod(r[i + j] - term * b[j]);
    }
  }
  assert.ok(r.slice(0, b.length - 1).every((n) => n === 0),
    "Original table must be divisible by the fixed source factors");
  return quotient;
}
const monicFactors = [
  [5, 1], [5, 1],
  [11, 18, 1],
  [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
];
let product = [1];
for (const f of monicFactors) product = polyMultiply(product, f);
assert.equal(product.length, 17);
const polynomial = grid.bytes.slice().reverse().map((v) => v % 29);
while (polynomial[polynomial.length - 1] === 0) polynomial.pop();
assert.equal(polynomial.length, 255);
assert.equal(polynomial[polynomial.length - 1], 28);
const modulus = divideMonic(polynomial, product).map((v) => mod(28 * v));
assert.equal(modulus.length, 239);
assert.equal(modulus[238], 1);
assert.equal(crypto.createHash("sha256").update(
  Buffer.from(modulus.slice().reverse())).digest("hex"),
  "9cb443bed228623bbd522efcd73888d3a4870c3db0ddcc147011765f3c8a9eb3");
const degree = 238;
/** Multiplication in F29[X]/Q238 using full exact 32-bit-safe coefficients. */
function multiply(a, b) {
  const polynomialProduct = new Float64Array(2 * degree - 1);
  for (let i = 0; i < degree; i++) {
    const scalar = a[i];
    if (!scalar) continue;
    for (let j = 0; j < degree; j++) {
      polynomialProduct[i + j] += scalar * b[j];
    }
  }
  for (let power = 2 * degree - 2; power >= degree; power--) {
    const scalar = mod(polynomialProduct[power]);
    if (!scalar) continue;
    for (let i = 0; i < degree; i++) {
      polynomialProduct[power - degree + i] -= scalar * modulus[i];
    }
  }
  return Uint8Array.from({length: degree}, (_, i) =>
    mod(polynomialProduct[i]));
}
/** @param {Uint8Array} input @param {bigint} exponent */
function pow(input, exponent) {
  let base = input;
  let e = exponent;
  let result = new Uint8Array(degree);
  result[0] = 1;
  while (e > 0n) {
    if (e & 1n) result = multiply(result, base);
    e >>= 1n;
    if (e) base = multiply(base, base);
  }
  return result;
}
function inverseExponent(a, order) {
  let [left, right, u, v] = [order, a, 0n, 1n];
  while (right) {
    const z = left / right;
    [left, right] = [right, left - z * right];
    [u, v] = [v, u - z * v];
  }
  assert.equal(left, 1n);
  return (u % order + order) % order;
}
const exponent = 1661n;
const order = 29n ** 238n - 1n;
const inverse = inverseExponent(exponent, order);
assert.equal((exponent * inverse) % order, 1n);
assert.equal(inverse.toString(2).length, 1153);
const raw = corpus.pages[36].indices;
function coincidence(seq) {
  const freq = Array(29).fill(0);
  for (const x of seq) {
    assert.ok(Number.isInteger(x) && x >= 0 && x <= 28);
    freq[x]++;
  }
  return freq.reduce((sum, f) => sum + f * (f - 1), 0) /
    (seq.length * (seq.length - 1));
}
const report = {
  source: {tableCoefficients: 256, modulusDegree: degree,
    tableSHA256: crypto.createHash("sha256").update(
      Buffer.from(grid.bytes)).digest("hex"),
    modulusSHA256: crypto.createHash("sha256").update(
      Buffer.from(modulus.slice().reverse())).digest("hex"),
    p36Runes: 238, rawIOC: coincidence(raw),
    exponent: exponent.toString(),
    inverseBitLength: inverse.toString(2).length},
  candidates: []
};
assert.equal(report.source.tableSHA256,
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
// An independently known native-GP plaintext, length-matched without
// using any unknown-page rune identities, is a positive control.
const p57 = corpus.pages[57].indices;
const planted = Uint8Array.from({length: degree}, (_, i) =>
  p57[i % p57.length]);
const plantCipher = pow(planted, exponent);
const plantRecovered = pow(plantCipher, inverse);
assert.deepEqual([...plantRecovered], [...planted],
  "Full reversible field-power plant must recover all 238 native GP runes");
for (const orderName of ["printed-as-high-coefficients",
  "printed-as-low-coefficients"]) {
  const toField = orderName === "printed-as-high-coefficients" ?
    raw.slice().reverse() : raw.slice();
  const field = Uint8Array.from(toField);
  for (const [operation, e] of [["raise-to-1661", exponent],
    ["raise-to-inverse-1661", inverse]]) {
    const output = pow(field, e);
    const roundTrip = pow(output, operation === "raise-to-1661" ?
      inverse : exponent);
    assert.deepEqual([...roundTrip], [...field],
      "Actual original p36 finite-field input must reencrypt exactly");
    const outputInPageOrder = orderName ===
      "printed-as-high-coefficients" ?
      [...output].reverse() : [...output];
    report.candidates.push({
      order: orderName, operation,
      recoveredIOC: coincidence(outputInPageOrder),
      previewGP: outputInPageOrder.slice(0, 80).map(
        (v) => corpus.translit[v]).join(""),
      recoveredAllRunes: outputInPageOrder.length,
      exactReencryption: true
    });
  }
}
report.positive = {plantedOriginalSolvedRunes: degree,
  recovered: plantRecovered.length,
  recoveredIOC: coincidence(plantRecovered)};
assert.ok(report.candidates.every((row) =>
  row.recoveredIOC < 0.04));
assert.ok(report.positive.recoveredIOC > 0.055);
console.log(JSON.stringify(report, null, 2));
console.log("PASS: field-power original inverse and 238/238 source-native plant");
