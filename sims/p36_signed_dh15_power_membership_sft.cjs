#!/usr/bin/env node
"use strict";

/**
 * Source-fixed GF(29^238) 15th/6th-power gate for the original LP2 p36 page
 * and the p39/p3 marked 119+119-rune prefixes.
 *
 * Node.js 22 or newer, no third-party dependencies.
 * Run from repository root: node sims/p36_signed_dh15_power_membership_sft.cjs
 *
 * This tests an independent, reversible 2013-DH-exponent consumer and does not
 * assume or claim that the original cipher uses extension-field exponentiation.
 */

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const resource = (name) => JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", name), "utf8"
));
const corpus = resource("lp2-corpus.json");
const grid = resource("base60-grid.json");
const bytes = grid.byte_rows.flat();

const MOD = 29;
const DIM = 238;
const N = 29n ** 238n - 1n;
const ONE = [1, ...Array(DIM - 1).fill(0)];
const mod = (a) => ((a % MOD) + MOD) % MOD;
const sha256 = (data) => crypto.createHash("sha256").update(data).digest("hex");
const eq = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

assert.equal(grid.byte_rows.length, 32);
assert(grid.byte_rows.every((row) => row.length === 8));
assert(bytes.every((v) => Number.isInteger(v) && v >= 0 && v < 256));
assert.equal(sha256(Buffer.from(bytes)),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
assert.equal(corpus.pages[36].indices.length, 238);
assert.equal(corpus.translit.length, 29);
assert.equal(corpus.pages[3].indices.length, 217);
assert.equal(corpus.pages[39].indices.length, 240);

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function polyMul(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
  return out;
}

/** Monic exact division over GF29, coefficients in ascending power order. */
function polyDivMonic(numerator, denominator) {
  const r = numerator.slice();
  assert.equal(denominator.at(-1), 1);
  const q = Array(r.length - denominator.length + 1).fill(0);
  for (let k = r.length - 1; k >= denominator.length - 1; k--) {
    const c = mod(r[k]);
    q[k - denominator.length + 1] = c;
    for (let j = 0; j < denominator.length; j++) {
      const where = k - denominator.length + 1 + j;
      r[where] = mod(r[where] - c * denominator[j]);
    }
  }
  assert(r.slice(0, denominator.length - 1).every((v) => v === 0),
    "the original table must divide exactly by all source factors");
  while (q.at(-1) === 0) q.pop();
  return q;
}

// All four documented small factors (including the double root), reproduced
// verbatim as monic GF29 polynomials, low coefficient first.
const small = [
  [5, 1], [5, 1],
  [11, 18, 1],
  [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
].reduce((acc, f) => polyMul(acc, f), [1]);
assert.equal(small.length, 17);
const p = bytes.map((v) => v % MOD).reverse();
const nonmonicQ = polyDivMonic(p, small);
assert.equal(nonmonicQ.length, 239);
assert.equal(nonmonicQ.at(-1), 28);
const R = nonmonicQ.map((v) => mod(-v));
assert.equal(R.length, DIM + 1);
assert.equal(R.at(-1), 1);
assert.equal(R[0], 5);
const reconstructed = polyMul(small, R).map((v) => mod(-v));
assert(eq(reconstructed, p.slice(0, reconstructed.length)),
  "whole-table polynomial did not reconstruct");
/** @type {number[]} */
const x = Array(DIM).fill(0);
x[1] = 1;

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a, b) {
  const terms = new Float64Array(2 * DIM - 1);
  for (let i = 0; i < DIM; i++) if (a[i] !== 0) {
    for (let j = 0; j < DIM; j++)
      terms[i + j] += a[i] * b[j];
  }
  for (let k = 2 * DIM - 2; k >= DIM; k--) {
    const top = mod(terms[k]);
    if (top !== 0) {
      for (let j = 0; j < DIM; j++)
        terms[k - DIM + j] -= top * R[j];
    }
  }
  return Array.from(terms.slice(0, DIM), mod);
}

/** @param {number[]} base @param {bigint} exponent @returns {number[]} */
function power(base, exponent) {
  let result = ONE;
  while (exponent > 0n) {
    if (exponent & 1n) result = multiply(result, base);
    exponent >>= 1n;
    if (exponent > 0n) base = multiply(base, base);
  }
  return result;
}

/** @param {bigint} a @param {bigint} n @returns {bigint} */
function inverseMod(a, n) {
  let [t, nextT, r, nextR] = [0n, 1n, n, a % n];
  while (nextR !== 0n) {
    const q = r / nextR;
    [t, nextT] = [nextT, t - q * nextT];
    [r, nextR] = [nextR, r - q * nextR];
  }
  assert.equal(r, 1n);
  return (t % n + n) % n;
}

const A = corpus.pages[36].indices;
const ARev = A.slice().reverse();
const p3 = corpus.pages[3].indices.slice(0, 119);
const p39 = corpus.pages[39].indices.slice(0, 119);
const B = [...p39, ...p3].reverse();
assert.equal(B.length, DIM);

// These are necessary-and-sufficient subgroup criteria because 3 and 5 each
// divide 29^238-1 exactly once. For a general sixth power one needs
// membership in both the square and cube subgroups.
assert(N % 15n === 0n);
assert((N / 15n) % 3n !== 0n && (N / 15n) % 5n !== 0n);
const aCube = eq(power(A, N / 3n), ONE);
const aFifth = eq(power(A, N / 5n), ONE);
const reversedA15 = eq(power(ARev, N / 3n), ONE)
  && eq(power(ARev, N / 5n), ONE);
const bSquare = eq(power(B, N / 2n), ONE);
const bCube = eq(power(B, N / 3n), ONE);
assert(aCube && aFifth, "printed p36 must be a 15th power");
assert(!reversedA15, "reverse p36 must fail 15th-power membership");
assert(bSquare && bCube, "reversed p39+p3 must be a sixth power");
assert(!eq(power(A, 6n), power(B, 15n)),
  "the two actual source blocks must fail a common-base DH equation");

// The norm to GF29 is x^((29^238-1)/28).
const norm = (y) => power(y, N / 28n);
assert(eq(norm(A), [2, ...Array(DIM - 1).fill(0)]));
assert(eq(norm(x), [5, ...Array(DIM - 1).fill(0)]));
// 5 has multiplicative order 14 in GF29; 2 has order 28.
// Consequently no X^e = A for ANY exponent e, even outside the 3301 range.
assert.equal((5 ** 14) % MOD, 1);
assert.equal((2 ** 14) % MOD, 28);
assert.equal(5 ** 7 % MOD, 28);

// Recover every fifteenth root, with no secret base or fitted exponent.
// Since gcd(15,(29^238-1)/15)=1, A^inv(15,N/15) is one canonical root.
const M = N / 15n;
const root0 = power(A, inverseMod(15n, M));
assert(eq(power(root0, 15n), A));
assert(eq(norm(root0), [27, ...Array(DIM - 1).fill(0)]));
const xPlusOne = x.slice(); xPlusOne[0] = 1;
const zeta = power(xPlusOne, N / 15n);
assert(eq(power(zeta, 15n), ONE));
assert(!eq(power(zeta, 3n), ONE));
assert(!eq(power(zeta, 5n), ONE));

const ic = (arr) => {
  const counts = Array(29).fill(0);
  for (const v of arr) counts[v]++;
  return counts.reduce((s, count) => s + count * (count - 1), 0)
    / (arr.length * (arr.length - 1));
};
let beta = root0;
const roots = [];
for (let i = 0; i < 15; i++) {
  assert(eq(power(beta, 15n), A));
  const stat = ic(beta);
  roots.push({ root: i, ic: stat,
    initial: beta.slice(0, 16).map((v) => corpus.translit[v]).join(".") });
  beta = multiply(beta, zeta);
}
assert(eq(beta, root0));
assert.equal(new Set(roots.map((v) => v.initial)).size, 15);
assert(roots.every((v) => v.ic > 0.03 && v.ic < 0.04));

// The other signed DH exponent admits a complete six-root inverse as well.
// Since N=8*odd, use Tonelli-Shanks for square roots after the unique
// cube-root representative in the subgroup of index 3.
/** @param {number[]} value @returns {number[]} */
function squareRoot(value) {
  assert(eq(power(value, N / 2n), ONE));
  const odd = N / 8n;
  const nonresidue = xPlusOne;
  assert(!eq(power(nonresidue, N / 2n), ONE));
  let c = power(nonresidue, odd);
  let t = power(value, odd);
  let r = power(value, (odd + 1n) / 2n);
  let m = 3;
  while (!eq(t, ONE)) {
    let i = 0;
    let v = t;
    while (!eq(v, ONE)) {
      v = multiply(v, v);
      i++;
    }
    assert(i < m);
    const b = power(c, 1n << BigInt(m - i - 1));
    const b2 = multiply(b, b);
    r = multiply(r, b);
    t = multiply(t, b2);
    c = b2;
    m = i;
  }
  assert(eq(multiply(r, r), value));
  return r;
}
const cubeRootB = power(B, inverseMod(3n, N / 3n));
assert(eq(power(cubeRootB, 3n), B));
const sixthRootB = squareRoot(cubeRootB);
assert(eq(power(sixthRootB, 6n), B));
const zeta3 = power(xPlusOne, N / 3n);
assert(eq(power(zeta3, 3n), ONE) && !eq(zeta3, ONE));
let bRoot = sixthRootB;
const roots6 = [];
for (let j = 0; j < 3; j++) {
  for (const sign of [1, -1]) {
    const betaB = bRoot.map((v) => mod(v * sign));
    assert(eq(power(betaB, 6n), B));
    roots6.push({ root: j, sign, ic: ic(betaB),
      initial: betaB.slice(0, 16).map((v) => corpus.translit[v]).join('.') });
  }
  bRoot = multiply(bRoot, zeta3);
}
assert.equal(roots6.length, 6);
assert(eq(bRoot, sixthRootB));
assert(roots6.every((v) => v.ic > 0.03 && v.ic < 0.04));

// One frozen direct plaintext consumer: after p36, emit the canonical
// coefficient or absolute-field trace of successive powers of each of the
// fifteen roots. Test +/- GP29 addition on the *unaltered* pp37-39 runes.
// This is not a hidden-key search: both outputs are canonical power-basis
// readouts, the clock begins at the next physical page, and every root is
// required by the exact exponent-15 inverse.
const following = corpus.pages.slice(37, 40).flatMap((p) => p.indices);
assert.equal(following.length, 696);
const tracesOfX = Array(DIM).fill(0);
tracesOfX[0] = DIM % MOD;
for (let k = 1; k < DIM; k++) {
  let sum = k * R[DIM - k];
  for (let j = 1; j < k; j++)
    sum += R[DIM - j] * tracesOfX[k - j];
  tracesOfX[k] = mod(-sum);
}
assert.equal(mod(A.reduce((s, v, i) => s + v * tracesOfX[i], 0)), 11);
const fieldTrace = (v) =>
  mod(v.reduce((s, val, i) => s + val * tracesOfX[i], 0));
const followingRawIc = ic(following);
let minDecodedIc = Infinity;
let maxDecodedIc = -Infinity;
let seed = root0;
for (let r = 0; r < 15; r++) {
  let powerState = seed;
  const traceStream = [], coordinateStream = [];
  for (let i = 0; i < following.length; i++) {
    coordinateStream.push(powerState[0]);
    traceStream.push(fieldTrace(powerState));
    powerState = multiply(powerState, seed);
  }
  for (const key of [traceStream, coordinateStream])
    for (const sign of [-1, 1]) {
      const decoded = following.map((v, i) => mod(v + sign * key[i]));
      const rate = ic(decoded);
      minDecodedIc = Math.min(minDecodedIc, rate);
      maxDecodedIc = Math.max(maxDecodedIc, rate);
    }
  seed = multiply(seed, zeta);
}
assert(Math.abs(followingRawIc - 0.034466220127346396) < 1e-12);
assert(minDecodedIc > 0.033 && maxDecodedIc < 0.036);

// New source-to-source embedding: project X+1 into the unique GF(29^2)
// subfield by raising it to (29^238-1)/(29^2-1). This lands on one
// exact root of the original p3 red quadratic 2u^2+23u+13=0.
const subfieldOrder = 29n ** 2n - 1n;
assert.equal(subfieldOrder, 840n);
assert.equal(N % subfieldOrder, 0n);
const smallFieldElement = power(xPlusOne, N / subfieldOrder);
const zeroVector = Array(DIM).fill(0);
const addScalar = (a, b) => a.map((v, i) => mod(v + (i === 0 ? b : 0)));
const p3Quadratic = (y) => {
  const square = multiply(y, y);
  return square.map((v, i) => mod(v - 3 * y[i] - (i === 0 ? 8 : 0)));
};
assert(eq(p3Quadratic(smallFieldElement), zeroVector));
assert(eq(power(smallFieldElement, subfieldOrder), ONE));
assert(!eq(power(smallFieldElement, subfieldOrder / 2n), ONE));
const signedBase29Root = smallFieldElement.map((v, i) =>
  mod(-2 * v + (i === 0 ? 23 : 0)));
const signedQuadraticCheck = multiply(signedBase29Root, signedBase29Root)
  .map((v, i) => mod(v + 18 * signedBase29Root[i] + (i === 0 ? 11 : 0)));
assert(eq(signedQuadraticCheck, zeroVector),
  "2013 signed BASE29 quadratic root must follow from p3 root");
// Every smallest possible scalar shift is checked, with no output-fitting.
const exactShiftMatches = [];
for (let shift = 0; shift < MOD; shift++) {
  const projected = power(addScalar(x, shift), N / subfieldOrder);
  if (eq(p3Quadratic(projected), zeroVector)) exactShiftMatches.push(shift);
}
assert.deepEqual(exactShiftMatches, [1]);

console.log(JSON.stringify({
  source: { bytes: 256, original_page36: A.length, p3_prefix: p3.length,
    p39_prefix: p39.length, irreducible_degree: DIM },
  field: { norm_x: 5, norm_p36: 2, trace_p36: 11 },
  membership: { p36_is_15th_power: true, reversed_p36_is_15th_power: false,
    reversed_p39_p3_is_6th_power: true,
    common_DH_base_with_6_15: false },
  root_count: roots.length, root0_norm: 27, roots,
  exact_p3_subfield_projection: { source_shift: 1, matched_shifts: exactShiftMatches,
    extension_degree: 238, subfield_multiplicative_order: 840,
    signed_2013_base29_quadratic_root: true },
  sixth_root_count: roots6.length, roots6,
  subsequent_page_gate: { runes: following.length, models: 60,
    original_ic: followingRawIc, minimum_decoded_ic: minDecodedIc,
    maximum_decoded_ic: maxDecodedIc },
  result: "No original unknown-page plaintext or authenticated decoder recovered"
}, null, 2));
