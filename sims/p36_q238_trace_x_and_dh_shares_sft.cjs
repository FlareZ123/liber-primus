"use strict";

/**
 * Original-source GF(29^238) DH-share and trace-stream gate.
 * Run: node sims/p36_q238_trace_x_and_dh_shares_sft.cjs
 *
 * The original p50 polynomial supplies Q238; original p36 supplies a field
 * element; the two 119-rune prefixes before p3/p39 red triads supply a
 * second 238-rune candidate element. The signed 2013 DH23 example fixes
 * illustrative exponents 6 and 15. No random or secret key is fitted.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
/** @param {string} name */
const source = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const corpus = source("resources/liber-primus/lp2-corpus.json");
const table = source("resources/liber-primus/base60-grid.json");
const bytes = table.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const pages = corpus.pages;
const runes = pages.filter(p => p.page < 56).flatMap(p => p.indices);
assert.equal(runes.length, 12956);
const mod = x => ((x % 29) + 29) % 29;

/** Exact monic-polynomial long division in descending coefficient order.
 * @param {number[]} values
 * @param {number[]} divisor
 * @returns {number[]}
 */
function divide(values, divisor) {
  const rem = values.slice(), quo = [];
  for (let i = 0; i <= values.length - divisor.length; i++) {
    const a = rem[i];
    quo.push(a);
    for (let j = 0; j < divisor.length; j++)
      rem[i + j] = mod(rem[i + j] - a * divisor[j]);
  }
  assert(rem.slice(-(divisor.length - 1)).every(x => x === 0));
  return quo;
}
let coeffs = bytes.map(mod).slice(1);
for (const factor of [
  [1, 5], [1, 5], [1, 18, 11], [1, 14, 16, 24],
  [1, 12, 20, 10, 5, 1, 9, 0, 15, 11]
]) coeffs = divide(coeffs, factor);
assert.equal(coeffs.length, 239);
assert.equal(coeffs[0], 28);
const q = coeffs.map(x => mod(28 * x)).reverse();
const degree = 238;
assert.equal(q.length, degree + 1);
assert.equal(q[degree], 1);

/** Multiply two field elements represented by ascending GP coefficients.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
function multiply(a, b) {
  const out = Array(2 * degree - 1).fill(0);
  for (let i = 0; i < degree; i++) {
    if (a[i] === 0) continue;
    for (let j = 0; j < degree; j++) {
      if (b[j] !== 0) out[i + j] = (out[i + j] + a[i] * b[j]) % 29;
    }
  }
  for (let k = 2 * degree - 2; k >= degree; k--) {
    const v = out[k];
    if (v === 0) continue;
    for (let j = 0; j < degree; j++)
      out[k - degree + j] = mod(out[k - degree + j] - v * q[j]);
  }
  return out.slice(0, degree);
}
/** @param {number[]} a @param {number} exponent */
function power(a, exponent) {
  let out = Array(degree).fill(0);
  out[0] = 1;
  while (exponent > 0) {
    if (exponent % 2) out = multiply(out, a);
    exponent = Math.floor(exponent / 2);
    if (exponent) a = multiply(a, a);
  }
  return out;
}
const p3 = pages[3].indices.slice(0, 119);
const p39 = pages[39].indices.slice(0, 119);
const p36 = pages[36].indices;
assert.equal(p3.length, 119);
assert.equal(p39.length, 119);
assert.equal(p36.length, 238);
const equality = (a, b) => a.reduce((t, x, i) => t + (x === b[i]), 0);
/**
 * Canonical finite-field norm of a GP coefficient vector via the resultant
 * Res(Q238, source polynomial). This is independent of the field power test.
 * @param {number[]} digits Ascending field coefficients, padded implicitly.
 */
function fieldNorm(digits) {
  /** @param {number} v @param {number} exponent */
  function pow29(v, exponent) {
    let out = 1;
    while (exponent) {
      if (exponent % 2) out = mod(out * v);
      v = mod(v * v);
      exponent = Math.floor(exponent / 2);
    }
    return out;
  }
  let A = q.slice().reverse(), B = digits.slice().reverse(), value = 1;
  while (true) {
    while (B.length && B[0] === 0) B.shift();
    if (B.length === 0) return 0;
    if (B.length === 1) return mod(value * pow29(B[0], A.length - 1));
    const a = A.length - 1, b = B.length - 1;
    assert(a >= b);
    const inv = pow29(B[0], 27);
    let rem = A.slice();
    for (let i = 0; i <= a - b; i++) {
      const digit = mod(rem[i] * inv);
      for (let j = 0; j < B.length; j++)
        rem[i + j] = mod(rem[i + j] - digit * B[j]);
    }
    rem = rem.slice(a - b + 1);
    while (rem.length && rem[0] === 0) rem.shift();
    if (rem.length === 0) return 0;
    value = mod(value * pow29(-1, a * b) *
      pow29(B[0], a - (rem.length - 1)));
    A = B;
    B = rem;
  }
}
const fieldNorms = {
  p36: fieldNorm(p36),
  p3ThenP39: fieldNorm(p3.concat(p39)),
  p39ThenP3: fieldNorm(p39.concat(p3))
};
assert.deepEqual(fieldNorms, {p36: 2, p3ThenP39: 23, p39ThenP3: 6});

/*
 * Source-prefix permutation null. Only the two original 119-rune multisets
 * change order; the signed-DH 23/6 target and all field rules stay fixed.
 * This finite conditional calibration does not account for prior model search.
 */
let rng = 0x7f330123;
/** @returns {number} */
function randomWord() {
  rng ^= rng << 13;
  rng ^= rng >>> 17;
  rng ^= rng << 5;
  return rng >>> 0;
}
/** @param {number[]} digits */
function shuffle(digits) {
  const result = digits.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomWord() % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
const normNull = {sampleCount: 1500, matching23: 0,
  matching6: 0, simultaneous: 0, seed: "0x7f330123"};
for (let i = 0; i < normNull.sampleCount; i++) {
  const a = shuffle(p3), b = shuffle(p39);
  const match23 = fieldNorm(a.concat(b)) === 23;
  const match6 = fieldNorm(b.concat(a)) === 6;
  normNull.matching23 += Number(match23);
  normNull.matching6 += Number(match6);
  normNull.simultaneous += Number(match23 && match6);
}
assert.deepEqual(normNull, {sampleCount: 1500,
  matching23: 56, matching6: 50, simultaneous: 2, seed: "0x7f330123"});

const DH = [];
for (const [orientation, transform] of [
  ["ascending", x => x.slice()], ["descending", x => x.slice().reverse()]
]) {
  const A = transform(p36);
  for (const [prefixOrder, prefix] of [
    ["p3-p39", p3.concat(p39)], ["p39-p3", p39.concat(p3)]
  ]) {
    const B = transform(prefix);
    const test6_15 = equality(power(A, 15), power(B, 6));
    const test15_6 = equality(power(A, 6), power(B, 15));
    const test11_331 = equality(power(A, 11), power(B, 331));
    assert(test6_15 < degree && test15_6 < degree && test11_331 < degree);
    DH.push({ orientation, prefixOrder, exponent15vs6: test6_15,
      exponent6vs15: test15_6, archived11vs331: test11_331 });
  }
}
const X = Array(degree).fill(0);
X[1] = 1;
assert.deepEqual(power(power(X, 6), 15), power(power(X, 15), 6));

// Newton power sums: trace(X^j) for j < 238.
const traceBasis = Array(degree).fill(0);
traceBasis[0] = degree % 29;
for (let k = 1; k < degree; k++) {
  let total = k * q[degree - k];
  for (let j = 1; j < k; j++)
    total += q[degree - j] * traceBasis[k - j];
  traceBasis[k] = mod(-total);
}
assert.deepEqual(traceBasis.slice(0, 3), [6, 18, 4]);

/** @param {number[]} seed */
function traceStream(seed) {
  const state = seed.slice(), out = [];
  for (let i = 0; i < runes.length; i++) {
    let v = 0;
    for (let j = 0; j < degree; j++) v += state[j] * traceBasis[j];
    out.push(mod(v));
    const high = state[degree - 1];
    for (let j = degree - 1; j > 0; j--)
      state[j] = mod(state[j - 1] - high * q[j]);
    state[0] = mod(-high * q[0]);
  }
  return out;
}
/** @param {number[]} input */
function ioc(input) {
  const freq = Array(29).fill(0);
  for (const x of input) freq[x]++;
  return freq.reduce((s, n) => s + n * (n - 1), 0) /
    (input.length * (input.length - 1));
}
const traceTests = [];
for (const [orientation, seed] of [
  ["ascending", p36], ["descending", p36.slice().reverse()]
]) {
  const key = traceStream(seed);
  for (const sign of [-1, 1]) {
    const plain = runes.map((x, i) => mod(x + sign * key[i]));
    assert(plain.every((x, i) => mod(x - sign * key[i]) === runes[i]));
    // A solved native-GP planted text with the same key is inverted exactly.
    const native = Array.from({length: runes.length},
      (_, i) => pages[57].indices[i % pages[57].indices.length]);
    const planted = native.map((x, i) => mod(x - sign * key[i]));
    assert(planted.every((x, i) => mod(x + sign * key[i]) === native[i]));
    traceTests.push({orientation, sign,
      originalIoC: ioc(plain), keyIoC: ioc(key),
      originalECount: plain.filter(x => x === 18).length,
      plantedControlRecovered: native.length});
  }
}
console.log(JSON.stringify({
  source: "LP2 p36 238 runes, p3/p39 119-prefixes, p50 GF29 Q238",
  field: "GF(29^238)", modulusVerified: true,
  DH_exponents: DH,
  fieldNorms, fieldNormShuffleNull: normNull,
  tracePowerX: traceTests,
  rawOriginalIoC: ioc(runes),
  finding: "No exact DH-share power equality; direct trace(S*X^i) keystream does not recover GP plaintext."
}, null, 2));
