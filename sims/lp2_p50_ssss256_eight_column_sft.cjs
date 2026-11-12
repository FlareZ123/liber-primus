"use strict";

/**
 * Original pp49-51 eight vertical 32-byte table columns as 2013-style
 * ssss v0.5 whole-secret Shamir shares, threshold 5 of 8.
 *
 * Exact historical algorithm: GF(2^256), irreducible polynomial
 * x^256+x^10+x^5+x^2+1 and MONIC degree-5 sharing polynomial
 *   y(x) = x^5 + c4*x^4 + c3*x^3 + c2*x^2 + c1*x + c0.
 * Columns assigned natural share IDs x=1..8 from left to right;
 * original 32 bytes per column read top-to-bottom, big-endian.
 * Test 3 withheld columns, no fitting, alternate IDs, or rescoring.
 *
 * Source: ssss v0.5 original ssss.c (B. Poettering, GPLv2+),
 * https://github.com/osresearch/ssss/blob/master/ssss.c .
 * Reproduces mathematics only; does not incorporate its implementation.
 * Node.js 22 CommonJS standalone test.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const bytes = grid.bytes;
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const SHIFT = 256n;
const LIMIT = 1n << SHIFT;
const MODULUS = LIMIT | (1n << 10n) | (1n << 5n) | (1n << 2n) | 1n;

/** @param {bigint} a @param {bigint} b */
function multiply(a, b) {
  let out = 0n;
  while (b) {
    if (b & 1n) out ^= a;
    b >>= 1n;
    a <<= 1n;
    if (a & LIMIT) a ^= MODULUS;
  }
  return out;
}

/** @param {bigint} value */
function inverse(value) {
  assert.notEqual(value, 0n);
  let u = value, v = MODULUS, g = 1n, h = 0n;
  while (u !== 1n) {
    assert.notEqual(u, 0n, "Noninvertible field value");
    let step = BigInt(u.toString(2).length - v.toString(2).length);
    if (step < 0n) {
      [u, v] = [v, u];
      [g, h] = [h, g];
      step = -step;
    }
    u ^= v << step;
    g ^= h << step;
  }
  while (g >= LIMIT) {
    g ^= MODULUS << BigInt(g.toString(2).length - 257);
  }
  assert.equal(multiply(value, g), 1n);
  return g;
}

/** @param {bigint} base @param {number} exponent */
function power(base, exponent) {
  let result = 1n;
  for (let i = 0; i < exponent; i++) result = multiply(result, base);
  return result;
}

const xs = Array.from({length: 8}, (_, i) => BigInt(i + 1));
const barycentric = xs.slice(0, 5).map((x, i) => {
  let denom = 1n;
  for (let j = 0; j < 5; j++) if (i !== j)
    denom = multiply(denom, x ^ xs[j]);
  return inverse(denom);
});

/**
 * Degree <= 4 interpolation on the first five share values.
 * @param {bigint[]} samples @param {bigint} x
 */
function interpolate(samples, x) {
  assert.equal(samples.length, 5);
  let value = 0n;
  for (let i = 0; i < 5; i++) {
    let numer = 1n;
    for (let j = 0; j < 5; j++) if (i !== j)
      numer = multiply(numer, x ^ xs[j]);
    value ^= multiply(samples[i], multiply(numer, barycentric[i]));
  }
  return value;
}

/** @param {bigint} value */
const hex = value => value.toString(16).padStart(64, "0");
/** @param {bigint} value */
function popcount(value) {
  return value.toString(2).replaceAll("0", "").length;
}

/** Exactly 32 original bytes per column in printed top-to-bottom order. */
const shares = xs.map((_, col) => {
  let packed = 0n;
  for (let row = 0; row < 32; row++)
    packed = (packed << 8n) | BigInt(bytes[8 * row + col]);
  return packed;
});
assert.deepEqual(shares.map(s => hex(s).length), Array(8).fill(64));

const adjusted = shares.slice(0, 5).map((y, i) => y ^ power(xs[i], 5));
const reconstructed = xs.slice(5).map(x =>
  interpolate(adjusted, x) ^ power(x, 5));
const bitsMatched = reconstructed.map((prediction, j) =>
  256 - popcount(prediction ^ shares[5 + j]));

assert.deepEqual(bitsMatched, [125, 132, 135],
  "Original-grid withheld 256-bit check should be immutable");
assert(reconstructed.every((prediction, j) => prediction !== shares[5 + j]),
  "No withheld natural-ID table column must pass");
console.log("original withheld x6,x7,x8 equalities:", [false,false,false]);
console.log("source original matching bits out of 256:", bitsMatched);
console.log("original candidate c0 from first five:",
  hex(interpolate(adjusted, 0n)), "(UNAUTHENTICATED; withheld shares FAIL)");

/**
 * Exhaust exactly all original 2013 identifiers 01..10, without assuming
 * any share-to-column mapping. Any eight genuine 2013 shares would require
 * the first six printed columns to satisfy a single MONIC quintic under
 * some injection of six IDs from 01..10. There are 10P6 = 151,200 such
 * assignments. For each six-ID set S, the degree-five leading coefficient
 * of its Lagrange interpolation is
 *   XOR_i y_i / product_(j != i) (x_i XOR x_j).
 * It MUST equal 1 (historical ssss monic leading coefficient).
 * Check every assignment by precomputing only 36 multiplications for each
 * six-ID subset, then XORing six coefficients per permutation.
 *
 * @param {bigint[]} input Six unedited 256-bit field elements
 */
function censusHistoricalShareIDs(input) {
  assert.equal(input.length, 6);
  let assignments = 0, subsets = 0, bestErrors = 257;
  const hits = [];
  const bitDiff = value => popcount(value ^ 1n);
  for (let a = 1; a <= 5; a++)
    for (let b = a + 1; b <= 6; b++)
      for (let c = b + 1; c <= 7; c++)
        for (let d = c + 1; d <= 8; d++)
          for (let e = d + 1; e <= 9; e++)
            for (let f = e + 1; f <= 10; f++) {
              const ids = [a, b, c, d, e, f].map(BigInt);
              const weights = ids.map(x => {
                let denominator = 1n;
                for (const z of ids) if (z !== x)
                  denominator = multiply(denominator, x ^ z);
                return inverse(denominator);
              });
              const products = input.map(v => weights.map(w => multiply(v, w)));
              subsets++;
              const permutation = [0, 1, 2, 3, 4, 5];
              while (true) {
                let leading = 0n;
                for (let i = 0; i < 6; i++)
                  leading ^= products[i][permutation[i]];
                const errors = bitDiff(leading);
                if (errors < bestErrors) bestErrors = errors;
                if (errors === 0)
                  hits.push(permutation.map(index => Number(ids[index])));
                assignments++;

                let k = 4;
                while (k >= 0 && permutation[k] >= permutation[k + 1]) k--;
                if (k < 0) break;
                let j = 5;
                while (permutation[j] <= permutation[k]) j--;
                [permutation[k], permutation[j]] = [permutation[j], permutation[k]];
                for (let left = k + 1, right = 5; left < right; left++, right--)
                  [permutation[left], permutation[right]] =
                    [permutation[right], permutation[left]];
              }
            }
  assert.equal(subsets, 210);
  assert.equal(assignments, 151200);
  return {assignments, subsets, matches: hits, fewestWrongBits: bestErrors};
}

const exhaustedIDGate = censusHistoricalShareIDs(shares.slice(0, 6));
assert.equal(exhaustedIDGate.matches.length, 0,
  "No six original table columns can be 2013 share IDs 01..10");
assert.equal(exhaustedIDGate.fewestWrongBits, 93);
console.log("all 10P6 original first-six share ID assignments:",
  exhaustedIDGate.assignments, "exact matches 0",
  "smallest failed 256-bit relation:", exhaustedIDGate.fewestWrongBits,
  "bits");

// Any valid eight-column secret-sharing format under historical 01..10 IDs
// would contain a valid first-six assignment, so this is a rigorous all-ID
// exclusion of the entire natural 8-column format, independent of label order.

// Exact 2013-style positive plant with a source-native 32-byte constant c0.
// Its other four coefficients are deterministic 32-byte values, and its
// x^5 lead is literally 1 (not an unknown sixth coefficient).
const clear = Buffer.from("A SECRET KEPT IN PLAIN SIGHT3301");
assert.equal(clear.length, 32);
const coeff = [BigInt("0x" + clear.toString("hex"))];
for (let i = 1; i < 5; i++)
  coeff.push(BigInt("0x" + crypto.createHash("sha256")
    .update("LIBER PRIMUS SHARE COEFFICIENT " + i).digest("hex")));
/** @param {bigint} x */
function evaluatePlanted(x) {
  let y = power(x, 5);
  for (let i = 0; i < 5; i++) y ^= multiply(coeff[i], power(x, i));
  return y;
}
const plantedShares = xs.map(evaluatePlanted);
const plantedAdjusted = plantedShares.slice(0, 5)
  .map((v, i) => v ^ power(xs[i], 5));
for (let i = 0; i < 8; i++) {
  assert.equal(interpolate(plantedAdjusted, xs[i]) ^ power(xs[i], 5),
    plantedShares[i], "Planted original 5-of-8 share " + (i + 1));
}
assert.equal(interpolate(plantedAdjusted, 0n), coeff[0]);
const plantedIds = [9, 3, 10, 1, 5, 7, 2, 6];
const scrambledPlantedShares = plantedIds.map(x => evaluatePlanted(BigInt(x)));
const plantedIDGate = censusHistoricalShareIDs(scrambledPlantedShares.slice(0, 6));
assert(plantedIDGate.matches.some(ids =>
  ids.every((id, i) => id === plantedIds[i])),
  "Historically valid scrambled 2013 share IDs must survive exhaustive check");
console.log("PASS: known original-style arbitrary share-ID plant recovered.",
  "Candidate ID mappings:", plantedIDGate.matches.length);
console.log("PASS 256-bit historical whole-field monic-degree5 planted sharing.");
