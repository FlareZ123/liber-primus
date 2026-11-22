"use strict";

/**
 * Source-original 32x8 LP2 numeral-table GF256 Shamir/share gate.
 * Run: node sims/lp2_grid_shamir_8x32_source_sft.cjs
 *
 * The eight "shares" are only an analyst hypothesis, not an identified
 * original 2014 secret-sharing artifact. No ciphertext plaintext is claimed.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const grid = JSON.parse(fs.readFileSync(path.join(__dirname, "..",
  "resources", "liber-primus", "base60-grid.json"), "utf8"));
assert.equal(grid.byte_rows.length, 32);
for (const row of grid.byte_rows) {
  assert.equal(row.length, 8);
  for (const n of row) assert(Number.isInteger(n) && n >= 0 && n <= 255);
}
const source = grid.byte_rows.flat();
assert.equal(source.length, 256);

/**
 * Multiplication in GF(256) with the supplied irreducible polynomial.
 * @param {number} a
 * @param {number} b
 * @param {number} irreducible Either standard 0x11b or 0x11d.
 * @returns {number}
 */
function mul(a, b, irreducible) {
  let result = 0;
  for (let bit = 0; bit < 8; bit++) {
    if (b & 1) result ^= a;
    b >>>= 1;
    const high = a & 128;
    a = (a << 1) & 255;
    if (high) a ^= irreducible & 255;
  }
  return result;
}

/**
 * Powers in the 256-element field. Nonzero multiplicative inverses
 * are a^254, valid for both irreducible polynomial conventions.
 * @param {number} value
 * @param {number} exponent
 * @param {number} irreducible
 * @returns {number}
 */
function pow(value, exponent, irreducible) {
  let result = 1, a = value;
  while (exponent > 0) {
    if (exponent & 1) result = mul(result, a, irreducible);
    a = mul(a, a, irreducible);
    exponent >>>= 1;
  }
  return result;
}

/**
 * Lagrange reconstruction from unique nonzero GF256 x coordinates.
 * @param {[number,number][]} shares
 * @param {number} x
 * @param {number} irreducible
 * @returns {number}
 */
function interpolate(shares, x, irreducible) {
  let value = 0;
  for (let i = 0; i < shares.length; i++) {
    const [xi, yi] = shares[i];
    let scale = 1;
    for (let j = 0; j < shares.length; j++) {
      if (i === j) continue;
      const xj = shares[j][0];
      const inverseDen = pow(xi ^ xj, 254, irreducible);
      scale = mul(scale,
        mul(x ^ xj, inverseDen, irreducible), irreducible);
    }
    value ^= mul(yi, scale, irreducible);
  }
  return value;
}

/**
 * Evaluate an arbitrary field polynomial for independent planted controls.
 * @param {number[]} coefficients
 * @param {number} x
 * @param {number} irreducible
 * @returns {number}
 */
function evaluate(coefficients, x, irreducible) {
  let y = 0;
  for (let i = coefficients.length - 1; i >= 0; i--) {
    y = mul(y, x, irreducible) ^ coefficients[i];
  }
  return y;
}

/**
 * Eight column-shares (eight original printed columns) or eight
 * consecutive 32-byte shares (alternative printed source block grammar).
 * @param {"columns"|"eightBlocks"} orientation
 * @returns {number[][]} 32 byte-position rows, each eight potential shares.
 */
function sourceRows(orientation) {
  return Array.from({length:32}, (_, offset) =>
    Array.from({length:8}, (_, share) => orientation === "columns" ?
      source[offset * 8 + share] : source[share * 32 + offset]));
}

/**
 * Require all eight supposed share values at a given byte position to lie
 * on a polynomial of degree less than the freely granted threshold t.
 * @param {number[][]} bytes
 * @param {number} threshold
 * @param {number} irreducible
 * @returns {{matchingRows:number, matchedChecks:number, checks:number}}
 */
function testRows(bytes, threshold, irreducible) {
  let matchingRows = 0, matchedChecks = 0;
  for (const row of bytes) {
    const points = row.slice(0, threshold).map((v, i) => [i + 1, v]);
    let matched = 0;
    for (let i = threshold; i < 8; i++) {
      if (interpolate(points, i + 1, irreducible) === row[i]) matched++;
    }
    matchedChecks += matched;
    matchingRows += Number(matched === 8 - threshold);
  }
  return {matchingRows, matchedChecks, checks:32 * (8 - threshold)};
}

// Establish a genuine 5-of-8 GF256 secret-share positive control for both
// field conventions. Its 32 independent 256-bit secret bytes are exact.
for (const irreducible of [0x11b, 0x11d]) {
  const secrets = Array.from({length:32}, (_, i) => (11 + 37 * i) & 255);
  const planted = secrets.map((secret, i) => {
    const coefficients = [secret,
      (17 * i + 13) & 255, (49 * i + 29) & 255,
      (19 * i + 43) & 255, (31 * i + 53) & 255];
    return Array.from({length:8}, (_, j) =>
      evaluate(coefficients, j + 1, irreducible));
  });
  assert.deepEqual(testRows(planted, 5, irreducible),
    {matchingRows:32, matchedChecks:96, checks:96});
  const recovered = planted.map(row => interpolate(
    row.slice(0, 5).map((v, i) => [i + 1, v]), 0, irreducible));
  assert.deepEqual(recovered, secrets);
}

// Exact original input, both source-natural orientations, two real
// GF256 field polynomial conventions and all thresholds 2 through 7.
// The threshold is not optimized after discovering any lucky row.
const results = [];
const expected = {
  "columns/283": [2, 0, 0, 2, 0, 0],
  "columns/285": [1, 1, 0, 0, 0, 0],
  "eightBlocks/283": [2, 1, 1, 0, 0, 0],
  "eightBlocks/285": [1, 1, 1, 1, 1, 0]
};
for (const orientation of ["columns", "eightBlocks"]) {
  for (const irreducible of [0x11b, 0x11d]) {
    const rows = sourceRows(orientation);
    const thresholds = [2, 3, 4, 5, 6, 7].map(threshold =>
      ({threshold, ...testRows(rows, threshold, irreducible)}));
    assert.deepEqual(thresholds.map(t => t.matchedChecks),
      expected[orientation + "/" + irreducible]);
    assert(thresholds.every(t => t.matchingRows === 0));
    results.push({orientation, irreducible, thresholds});
  }
}
console.log(JSON.stringify({
  source: "original physical p49-51 32x8 byte grid",
  originalRow1: source.slice(0, 8),
  positiveControl: "32/32 exact genuine 5-of-8 source-length reconstructions",
  results,
  decision: "No original byte row is consistent with direct eight-share Shamir under any tested natural field/layout/threshold. No original LP2 key or plaintext identified."
}, null, 2));
