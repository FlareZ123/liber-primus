"use strict";

/**
 * Original LP2 p8 source-typed GF(256) RS(255,243) test.
 *
 * The unchanged physical p8 has 255 runes, the first 12 in red and the
 * remaining 243 in black. A systematic RS(255,243) code could put its
 * 12 parity symbols in those source-marked slots. Test the standard
 * one-byte encodings with every possible cyclic starting root, retaining
 * all 255 source rune positions. Root-agnostic rejection does not
 * assume an encoded English message or a secret plaintext key.
 *
 * SFT: node sims/lp2_p8_red12_black243_rs255243_original_sft.cjs
 * Node 20+ CommonJS; no dependencies or file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const load = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const gp = load("resources/liber-primus/lp2-corpus.json");
const ink = load("resources/liber-primus/lp2-ink-annotations.json");
const page = gp.pages.find((item) => item.page === 8);
const original = page.indices;
const mark = ink.pages.find((item) => item.page === 8);
assert.equal(original.length, 255);
assert.equal(mark.rune_count, 255);
assert.equal(mark.red_spans.length, 1);
assert.equal(mark.red_spans[0].start, 0);
assert.equal(mark.red_spans[0].length, 12);
assert.equal(original.slice(0, 12).map((x) => gp.runes[x]).join(""),
  mark.red_spans[0].runes);
const NSYM = 12;

/**
 * GF(2^8) multiplication with reduction by a monic degree-eight polynomial.
 * @param {number} a Eight-bit field element.
 * @param {number} b Eight-bit field element.
 * @param {number} poly Field polynomial including its 9th bit.
 * @returns {number}
 */
function mul(a, b, poly) {
  let result = 0;
  while (b !== 0) {
    if (b & 1) result ^= a;
    b >>>= 1;
    a <<= 1;
    if (a & 256) a ^= poly;
  }
  return result;
}

/**
 * @param {number} a
 * @param {number} exponent
 * @param {number} poly
 * @returns {number}
 */
function power(a, exponent, poly) {
  let out = 1;
  while (exponent !== 0) {
    if (exponent & 1) out = mul(out, a, poly);
    a = mul(a, a, poly);
    exponent >>>= 1;
  }
  return out;
}

/**
 * @param {number} a Nonzero element.
 * @param {number} poly
 * @returns {number}
 */
function inverse(a, poly) {
  assert(a !== 0, "GF(256) zero has no multiplicative inverse");
  return power(a, 254, poly);
}

/**
 * Evaluate the codeword high coefficient first at x in GF(256).
 * @param {number[]} bytes
 * @param {number} x
 * @param {number} poly
 * @returns {number}
 */
function evaluate(bytes, x, poly) {
  let value = 0;
  for (const byte of bytes) value = mul(value, x, poly) ^ byte;
  return value;
}

/**
 * @param {number[]} bytes 255 complete byte symbols.
 * @param {number} poly
 * @param {number} primitive Primitive generator of GF(256)*.
 * @returns {number[]}
 */
function zeroExponents(bytes, poly, primitive) {
  const zero = [];
  for (let exponent = 0; exponent < 255; exponent++) {
    const x = power(primitive, exponent, poly);
    if (evaluate(bytes, x, poly) === 0) zero.push(exponent);
  }
  return zero;
}

/**
 * Find the longest cyclic interval of consecutive zero-root exponents.
 * @param {number[]} exponents
 * @returns {number}
 */
function longestRun(exponents) {
  const seen = new Set(exponents);
  let best = 0;
  for (let start = 0; start < 255; start++) {
    let current = 0;
    while (current < 255 && seen.has((start + current) % 255)) current++;
    best = Math.max(best, current);
  }
  return best;
}

/**
 * Solve the twelve systematic leading parity bytes over GF(256) from
 * the fixed remaining 243 bytes and twelve consecutive RS roots.
 *
 * @param {number[]} bytes Existing 255 symbols.
 * @param {number} poly
 * @param {number} primitive
 * @param {number} firstRoot 0 or 1 in this positive.
 * @returns {number[]}
 */
function systematicParity(bytes, poly, primitive, firstRoot) {
  const rows = [];
  const rhs = [];
  for (let k = 0; k < NSYM; k++) {
    const x = power(primitive, firstRoot + k, poly);
    const weight = new Array(255);
    weight[254] = 1;
    for (let i = 253; i >= 0; i--) weight[i] = mul(weight[i + 1], x, poly);
    rows.push(weight.slice(0, NSYM));
    let sum = 0;
    for (let j = NSYM; j < 255; j++)
      sum ^= mul(bytes[j], weight[j], poly);
    rhs.push(sum);
  }

  // Standard GF(256) Gauss-Jordan elimination, including row swaps.
  for (let k = 0; k < NSYM; k++) {
    let pivot = k;
    while (pivot < NSYM && rows[pivot][k] === 0) pivot++;
    assert(pivot < NSYM, "parity matrix must be invertible");
    [rows[k], rows[pivot]] = [rows[pivot], rows[k]];
    [rhs[k], rhs[pivot]] = [rhs[pivot], rhs[k]];
    const scale = inverse(rows[k][k], poly);
    for (let j = k; j < NSYM; j++) rows[k][j] = mul(rows[k][j], scale, poly);
    rhs[k] = mul(rhs[k], scale, poly);
    for (let i = 0; i < NSYM; i++) {
      if (i === k || rows[i][k] === 0) continue;
      const factor = rows[i][k];
      for (let j = k; j < NSYM; j++)
        rows[i][j] ^= mul(factor, rows[k][j], poly);
      rhs[i] ^= mul(factor, rhs[k], poly);
    }
  }
  return rhs;
}

const fields = [
  {label: "GF256-11D-generator2", poly: 0x11d, primitive: 2},
  {label: "GF256-11B-generator3", poly: 0x11b, primitive: 3}
];
const encodings = [
  {label: "zero-based GP index", values: original},
  {label: "one-based GP ordinal", values: original.map((value) => value + 1)},
  {label: "GP printed prime", values: original.map((value) => gp.prime[value])},
  {label: "GP printed prime mod29", values: original.map((value) => gp.prime[value] % 29)}
];
const results = [];
for (const encoding of encodings) {
  assert(encoding.values.every((value) => value >= 0 && value <= 255));
  for (const field of fields) {
    assert.equal(power(field.primitive, 255, field.poly), 1);
    for (const direction of ["printed", "reversed"]) {
      const values = direction === "printed" ?
        encoding.values : [...encoding.values].reverse();
      const zeros = zeroExponents(values, field.poly, field.primitive);
      results.push({
        encoding: encoding.label,
        field: field.label,
        direction,
        zeroRoots: zeros.length,
        zeroExponents: zeros,
        maximumConsecutiveZeroRoots: longestRun(zeros)
      });
    }
  }
}
assert.equal(results.length, 16);
assert.equal(Math.max(...results.map((item) => item.zeroRoots)), 2);
assert(results.every((item) => item.maximumConsecutiveZeroRoots < NSYM),
  "no native-byte RS(255,243) model may have 12 consecutive roots");

const parityControls = [];
for (const firstRoot of [0, 1]) {
  const {poly, primitive} = fields[0];
  const required = systematicParity(original, poly, primitive, firstRoot);
  const synthetic = [...required, ...original.slice(NSYM)];
  const rootSyndromes = Array.from({length: NSYM}, (_, k) => {
    const x = power(primitive, firstRoot + k, poly);
    return evaluate(synthetic, x, poly);
  });
  assert(rootSyndromes.every((value) => value === 0),
    "real GF256 RS parity plant must pass all 12 tests");
  const altered = [...synthetic];
  altered[0] ^= 1;
  assert(Array.from({length: NSYM}, (_, k) =>
    evaluate(altered, power(primitive, firstRoot + k, poly), poly)
  ).some((value) => value !== 0));
  const printed = original.slice(0, NSYM);
  const matching = required.filter((value, i) => value === printed[i]).length;
  assert.equal(matching, 0);
  assert.equal(required.filter((value) => value <= 28).length, 2);
  parityControls.push({firstRoot, printedRed: printed, required,
    printedMatches: matching, requiredNativeGPValues: 2,
    syntheticAll12RootSyndromesZero: true});
}
assert.deepEqual(parityControls[0].required,
  [151, 44, 121, 95, 118, 112, 78, 67, 210, 6, 16, 85]);
assert.deepEqual(parityControls[1].required,
  [50, 21, 181, 83, 42, 23, 182, 231, 104, 227, 65, 219]);

console.log(JSON.stringify({
  originalPhysicalPage: 8,
  sourceOriginalImage: "resources/liber-primus/25.jpg",
  completeOriginalRuneCount: original.length,
  contiguousRedRunes: NSYM,
  contiguousBlackRunes: original.length - NSYM,
  candidate: "systematic GF256 RS(255,243), native GP rune byte representations",
  cases: results,
  sourceMarkedParityChecks: parityControls,
  recoveredUnknownPlaintextRunes: 0,
  conclusion: "No 12-consecutive-root codeword among 16 source-typed cases; exact 243-data/12-parity codewords recover in synthetic plants."
}, null, 2));
