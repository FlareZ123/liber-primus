"use strict";

/**
 * Exact original 256-cell GF(29) joint-code study.
 * Sources: lp2 original base60-grid.json, signed 2013 BASE29 3301,
 * p39 original GP red triad [27,5,15], and the distinct p13 four-jet
 * hypothesis. The p13 double root / target 8 remain POSTSELECTED.
 *
 * SFT: node sims/lp2_grid_sixcheck_affine_code_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const grid = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, "../resources/liber-primus/base60-grid.json"), "utf8"));
const bytes = grid.byte_rows.flat();
assert.deepEqual(grid.page_row_counts, [10, 13, 9]);
assert.equal(bytes.length, 256);
for (const value of bytes) assert.ok(Number.isInteger(value) && value >= 0 && value <= 255);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const F = 29;
/** @param {number} x @returns {number} */
const mod = x => (x % F + F) % F;
/** @param {number} a @param {number} e @returns {number} */
function power(a, e) {
  let out = 1;
  while (e > 0) {
    if (e % 2) out = out * a % F;
    a = a * a % F;
    e = Math.floor(e / 2);
  }
  return out;
}
/** @param {number} x @returns {number} */
function reciprocal(x) {
  const value = mod(x);
  for (let k = 1; k < F; k++) if (value * k % F === 1) return k;
  throw Error("Noninvertible field element");
}
/**
 * Multiply descending-power polynomials over GF29.
 * @param {number[]} a @param {number[]} b @returns {number[]}
 */
function multiply(a, b) {
  const result = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      result[i + j] = mod(result[i + j] + a[i] * b[j]);
  return result;
}
/**
 * Polynomial long division retaining formal leading-zero slots.
 * @param {number[]} input @param {number[]} divisor
 * @returns {{quotient:number[],remainder:number[]}}
 */
function divide(input, divisor) {
  const rest = input.slice();
  const quotient = Array(input.length - divisor.length + 1).fill(0);
  const inverseLeading = reciprocal(divisor[0]);
  for (let i = 0; i < quotient.length; i++) {
    const coeff = mod(rest[i] * inverseLeading);
    quotient[i] = coeff;
    for (let j = 0; j < divisor.length; j++)
      rest[i + j] = mod(rest[i + j] - coeff * divisor[j]);
  }
  return {quotient, remainder: rest.slice(quotient.length)};
}

/* BASE29 3301 source -> H descending [24,26,3], p39 source ->
 * 15*(X-24)^2, plus analyst-derived p13 double-root term. */
const H = [24, 26, 3];
const G = [1, 10, 25];
const J = [1, 3, 24];
const D = multiply(multiply(H, G), J);
assert.deepEqual(D, [24, 19, 4, 25, 4, 15, 2]);
const residues = bytes.map(n => n % F);
const {quotient, remainder} = divide(residues, D);
assert.equal(quotient.length, 250);
assert.equal(quotient[0], 0);
assert.deepEqual(remainder, [5, 23, 8, 3, 3, 15]);
const reconstructed = multiply(quotient, D);
for (let i = 0; i < remainder.length; i++)
  reconstructed[reconstructed.length - remainder.length + i] =
    mod(reconstructed[reconstructed.length - remainder.length + i] + remainder[i]);
assert.deepEqual(reconstructed, residues);

/* Six linearly independent field syndrome rows:
 * P(24), P'(24), P(13), P'(13), and the two GP29 H-remainder slots.
 * Coefficients of P are read high-degree first, so column e is X^e. */
const checks = Array.from({length: 6}, () => Array(256).fill(0));
let h0 = 1;
let h1 = 0;
for (let e = 0; e < 256; e++) {
  checks[0][e] = power(24, e);
  checks[1][e] = e === 0 ? 0 : mod(e * power(24, e - 1));
  checks[2][e] = power(13, e);
  checks[3][e] = e === 0 ? 0 : mod(e * power(13, e - 1));
  checks[4][e] = h0;
  checks[5][e] = h1;
  [h0, h1] = [mod(-11 * h1), mod(h0 - 18 * h1)];
}
/** @param {number[]} descending @returns {number[]} */
function syndrome(descending) {
  return checks.map(row => mod(descending.reduce(
    (total, a, i) => total + a * row[255 - i], 0)));
}
const expected = [0, 0, 8, 0, 0, 0];
assert.deepEqual(syndrome(residues), expected);

/**
 * Solve a square GF29 linear system in row-major form.
 * @param {number[][]} matrix @param {number[]} rhs @returns {number[]}
 */
function solve(matrix, rhs) {
  const n = rhs.length;
  const m = matrix.map((row, i) => [...row, rhs[i]]);
  for (let k = 0; k < n; k++) {
    const pivot = m.findIndex((row, i) => i >= k && row[k] !== 0);
    assert.notEqual(pivot, -1, "The six parity coordinates must be independent");
    [m[k], m[pivot]] = [m[pivot], m[k]];
    const inv = reciprocal(m[k][k]);
    for (let j = k; j <= n; j++) m[k][j] = mod(m[k][j] * inv);
    for (let i = 0; i < n; i++) if (i !== k) {
      const multiplier = m[i][k];
      for (let j = k; j <= n; j++)
        m[i][j] = mod(m[i][j] - multiplier * m[k][j]);
    }
  }
  return m.map(row => row[n]);
}
/**
 * Given any 250 source-order GF29 information slots, compute the six
 * conditional parity residues. This never recovers the ORIGINAL BYTES,
 * which may differ by multiples of 29.
 * @param {number[]} prefix @returns {number[]}
 */
function finalSix(prefix) {
  assert.equal(prefix.length, 250);
  const matrix = checks.map(row => [5, 4, 3, 2, 1, 0].map(e => row[e]));
  const rhs = checks.map((row, i) => mod(expected[i] -
    prefix.reduce((sum, x, j) => sum + x * row[255 - j], 0)));
  return solve(matrix, rhs);
}
assert.deepEqual(finalSix(residues.slice(0, 250)), [27, 27, 6, 7, 15, 22]);
const changed = residues.slice(0, 250);
changed[0] = mod(changed[0] + 1);
const planted = changed.concat(finalSix(changed));
assert.deepEqual(syndrome(planted), expected);
assert.notDeepEqual(planted.slice(-6), residues.slice(-6));
assert.notDeepEqual(syndrome([...changed, ...residues.slice(-6)]), expected);

/* A code difference must have all six syndromes zero.
 * Exhaust every 256 choose 2 pair and 256 choose 3 triple of positions:
 * a triple is dependent iff its third check column is in the span of
 * its first two. This proves a lower distance bound of four. */
let pairs = 0;
let triples = 0;
for (let a = 0; a < 255; a++) {
  for (let b = a + 1; b < 256; b++) {
    pairs++;
    let pivotI = -1, pivotJ = -1, determinant = 0;
    for (let i = 0; i < 6 && determinant === 0; i++) {
      for (let j = i + 1; j < 6; j++) {
        const d = mod(checks[i][a] * checks[j][b] -
          checks[j][a] * checks[i][b]);
        if (d !== 0) {pivotI = i; pivotJ = j; determinant = d; break;}
      }
    }
    assert.notEqual(determinant, 0, "A weight-2 zero-syndrome word");
    const inv = reciprocal(determinant);
    for (let c = b + 1; c < 256; c++) {
      triples++;
      const x = mod((checks[pivotI][c] * checks[pivotJ][b] -
        checks[pivotJ][c] * checks[pivotI][b]) * inv);
      const y = mod((checks[pivotI][a] * checks[pivotJ][c] -
        checks[pivotJ][a] * checks[pivotI][c]) * inv);
      let dependent = true;
      for (let r = 0; r < 6; r++) {
        if (mod(x * checks[r][a] + y * checks[r][b] -
          checks[r][c]) !== 0) {dependent = false; break;}
      }
      assert.ok(!dependent, "A zero-syndrome word of weight at most three");
    }
  }
}
assert.equal(pairs, 32640);
assert.equal(triples, 2763520);

/* This explicit positive control establishes the minimum distance as
 * EXACTLY four rather than merely at least four. */
const weightFour = [{e:72,c:8}, {e:135,c:21}, {e:158,c:13}, {e:190,c:1}];
assert.deepEqual(checks.map(row => mod(weightFour.reduce(
  (sum, term) => sum + term.c * row[term.e], 0))), Array(6).fill(0));
const fourChanged = residues.slice();
for (const {e, c} of weightFour) fourChanged[255 - e] =
  mod(fourChanged[255 - e] + c);
assert.deepEqual(syndrome(fourChanged), expected);
assert.equal(fourChanged.filter((n, i) => n !== residues[i]).length, 4);

console.log(JSON.stringify({
  sourceSha256: "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290",
  divisorDescending: D,
  originalSixCheckSyndrome: expected,
  affineRemainderDescending: remainder,
  quotientSlots: quotient.length,
  quotientLeadingZero: quotient[0] === 0,
  recoveredLastSixResidues: finalSix(residues.slice(0,250)),
  exhaustiveWeight2Checks: pairs,
  exhaustiveWeight3Checks: triples,
  firstWeight4Witness: weightFour,
  conditionalCode: "[256,250,4] affine GF29 residue code",
  plaintext: "NONE; the x=13 double-root and 8-column target were postselected"
}, null, 2));
