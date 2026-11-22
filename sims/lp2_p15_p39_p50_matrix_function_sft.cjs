"use strict";

/**
 * Original-source p15/p39/p50 polynomial-matrix coincidence and exact
 * conditional null. No unknown plaintext, decryption key or chosen clock.
 * Run with Node 22: node sims/lp2_p15_p39_p50_matrix_function_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const table = JSON.parse(fs.readFileSync(path.resolve(__dirname,
  "../resources/liber-primus/base60-grid.json"), "utf8"));
const sourceBytes = table.byte_rows.flat();
assert.equal(sourceBytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(sourceBytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const P = sourceBytes.map(x => x % 29);
const mod = x => (x % 29 + 29) % 29;
const N = 4;
const zero = () => Array.from({length: N}, () => Array(N).fill(0));
const identity = () => Array.from({length: N}, (_, r) =>
  Array.from({length: N}, (_, c) => Number(r === c)));
/** @param {number[][]} a @param {number[][]} b */
function multiply(a, b) {
  return a.map(row => row.map((_, j) =>
    mod(row.reduce((sum, x, k) => sum + x * b[k][j], 0))));
}
/** @param {number[][]} a @param {number[][]} b */
function add(a, b) {return a.map((row, i) => row.map((x, j) => mod(x + b[i][j])));}
/** @param {number[][]} a @param {number} k */
function scale(a, k) {return a.map(row => row.map(x => mod(x * k)));}

/**
 * Original p15 4×4 matrix after *inferred*, nonprinted Fibonacci signs.
 * Restore only the actual mathematically negative last-row elements.
 * @type {number[][]}
 */
const signed = [
  [10, 3, 20, 22],
  [1, 22, 21, 25],
  [11, 17, 19, 7],
  [8, 12, 12, 22]
];
/** Exact original positive-magnitude source, for a wrong-selection control. */
const unsigned = [
  [10, 3, 20, 22],
  [1, 22, 21, 25],
  [11, 17, 19, 7],
  [21, 17, 12, 22]
];
/**
 * Horner evaluation of a descending coefficient polynomial in a 4×4 matrix.
 * @param {number[]} coeffs @param {number[][]} m @returns {number[][]}
 */
function evaluateMatrix(coeffs, m) {
  let acc = zero();
  const I = identity();
  for (const c of coeffs) acc = add(multiply(acc, m), scale(I, c));
  return acc;
}
/**
 * GF29 Gaussian elimination rank.
 * @param {number[][]} input @returns {number}
 */
function rank(input) {
  const m = input.map(row => row.slice());
  let r = 0;
  for (let c = 0; c < N; c++) {
    const k = m.findIndex((row, i) => i >= r && row[c] !== 0);
    if (k < 0) continue;
    [m[r], m[k]] = [m[k], m[r]];
    let inv = 1;
    while (m[r][c] * inv % 29 !== 1) inv++;
    for (let j = c; j < N; j++) m[r][j] = mod(m[r][j] * inv);
    for (let i = 0; i < N; i++) if (i !== r) {
      const fac = m[i][c];
      for (let j = c; j < N; j++) m[i][j] = mod(m[i][j] - fac * m[r][j]);
    }
    r++;
  }
  return r;
}
/**
 * Source-frozen descending polynomial division by a monic divisor.
 * @param {number[]} coeffs @param {number[]} divisor
 */
function remainder(coeffs, divisor) {
  const r = coeffs.slice();
  for (let i = 0; i <= r.length - divisor.length; i++) {
    const z = r[i];
    for (let j = 0; j < divisor.length; j++)
      r[i + j] = mod(r[i + j] - z * divisor[j]);
  }
  return r.slice(r.length - divisor.length + 1);
}
/** @param {number} x @returns {number} */
function value(x) {return P.reduce((a, z) => mod(a * x + z), 0);}
/** @param {number} x @returns {number} */
function derivative(x) {
  return P.slice(0, -1).reduce((a, z, i) =>
    mod(a * x + (255 - i) * z), 0);
}

/* Source-established p15 eigenvalues and p39 red triad in exact order. */
const signedCharpoly = [1, 14, 27, 10, 7];
const unsignedCharpoly = [1, 14, 22, 5, 17];
const p39RedPolynomial = [15, 5, 27];   // printed indices [27,5,15], ascending.
const p3RedPolynomial = [2, 23, 13];   // printed indices [13,23,2], ascending.
assert.deepEqual(evaluateMatrix(signedCharpoly, signed), zero());
assert.deepEqual(evaluateMatrix(unsignedCharpoly, unsigned), zero());

assert.deepEqual([value(8), derivative(8)], [27, 27]);
assert.deepEqual([value(17), derivative(17)], [15, 8]);
assert.deepEqual([value(24), derivative(24)], [0, 0]);
assert.deepEqual(remainder(P, signedCharpoly), [6, 24, 22, 28]);
assert.deepEqual([value(8), value(17)], [
  p39RedPolynomial[2], p39RedPolynomial[0]
]);

const pOfSigned = evaluateMatrix(P, signed);
const qOfSigned = evaluateMatrix(p39RedPolynomial, signed);
assert.deepEqual(pOfSigned, [
  [2, 9, 3, 25],
  [22, 13, 24, 12],
  [5, 4, 0, 27],
  [14, 21, 22, 27]
]);
assert.equal(rank(pOfSigned), 2);
assert.equal(rank(qOfSigned), 2);
assert.equal(rank(evaluateMatrix(p3RedPolynomial, signed)), 4);
assert.equal(rank(evaluateMatrix(P, unsigned)), 4);
assert.equal(rank(evaluateMatrix(P.slice().reverse(), signed)), 4);

/* The source p39 double-root G is exactly shared by P; modulo the signed
 * p15 charpoly, the entire 256-cell P reduces to a compact selected form:
 * P(M) = (12M + 15I) G(M). Both are singular rank 2. */
const factored = multiply(add(scale(signed, 12), scale(identity(), 15)),
  qOfSigned);
assert.deepEqual(pOfSigned, factored);
assert.deepEqual(evaluateMatrix([6, 24, 22, 28], signed), pOfSigned);

/* An exact *conditional* null, not a postselection-corrected significance
 * statement: among all random GF29 quotients of an assigned monic
 * quadratic factor (X−24)^2, evaluation at two other distinct points
 * is independently uniform, hence the pre-fixed pair [27,15] is 1/29².
 * Source alternatives were historically searched, so no authorship
 * inference or decoder follows from this finite-field fact. */
const width = 29;
const nullProbability = 1 / (width * width);
assert.equal(nullProbability, 1 / 841);

console.log(JSON.stringify({
  sourceSha256: "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290",
  signedMatrix: signed,
  p39RedSource: [27, 5, 15],
  sourceEigenvalues: [8, 17, 24, 24],
  originalTableEvaluations: {at8: value(8), at17: value(17),
    at24: value(24), derivativeAt24: derivative(24)},
  matchedOuterRedCoefficients: [27, 15],
  polynomialModuloSignedCharacteristic: [6, 24, 22, 28],
  pOfSigned, rankSigned: rank(pOfSigned),
  rankOriginalUnsigned: rank(evaluateMatrix(P, unsigned)),
  rankReverseTable: rank(evaluateMatrix(P.slice().reverse(), signed)),
  conditionalPreselectedNullProbability: nullProbability,
  result: "Original three-object matrix relation; P(M) rank2, so not a Hill4 decryptor",
  plaintext: "NONE; no original operation or cipher clock selects this map"
}, null, 2));
