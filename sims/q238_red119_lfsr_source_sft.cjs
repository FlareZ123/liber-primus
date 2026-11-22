"use strict";
/**
 * Source-constrained LFSR test:
 * 256 printed LP2 table bytes -> Q238 factor over GP29;
 * two independently source-marked 119-rune prefixes (p3, p39) -> 238-rune seed.
 *
 * Measures the eight direct stream masks on the exact original 12,956 runes.
 * This is a bounded decoder gate, not a historically authenticated cipher.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const original = corpus.pages.filter((p) => p.page <= 55)
  .flatMap((p) => p.indices);
const mod = (a) => (a % 29 + 29) % 29;
assert.equal(original.length, 12956);
assert.equal(grid.byte_rows.flat().length, 256);

/**
 * @param {number[]} a Low-to-high polynomial coefficients.
 * @param {number[]} b Low-to-high polynomial coefficients.
 * @returns {number[]} Product over GF29.
 */
function multiply(a, b) {
  const product = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      product[i + j] = mod(product[i + j] + a[i] * b[j]);
    }
  }
  return product;
}

// Exactly the source table's published full GF29 factorization, except Q238.
// (X+5)^2; X^2+18X+11; X^3+14X^2+16X+24; and the degree-9 factor.
const small = [
  [25, 10, 1],
  [11, 18, 1],
  [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
];
const divisor = small.reduce(multiply, [28]);
assert.equal(divisor.length, 17);
assert.equal(divisor[16], 28);
const divided = grid.byte_rows.flat().map(mod).reverse(); // P(X) descending byte table
const q = Array(239).fill(0);
for (let i = 238; i >= 0; i--) {
  const digit = mod(divided[i + 16] * 28); // inverse(28) = 28 in GF29
  q[i] = digit;
  for (let j = 0; j < divisor.length; j++) {
    divided[i + j] = mod(divided[i + j] - digit * divisor[j]);
  }
}
assert.equal(q[238], 1);
assert(divided.every((x) => x === 0)); // complete factor identity

const p3 = corpus.pages[3].indices.slice(0, 119);
const p39 = corpus.pages[39].indices.slice(0, 119);
assert.equal(p3.length, 119);
assert.equal(p39.length, 119);

/**
 * @param {number[]} seed Exactly 238 original runes.
 * @param {number[]} coefficients Exactly 239 GF29 coefficients.
 * @returns {number[]} 12,956 generated rune masks, including seed positions.
 */
function lfsr(seed, coefficients) {
  const values = seed.slice();
  assert.equal(seed.length, 238);
  assert.equal(coefficients.length, 239);
  for (let i = 0; i < original.length - 238; i++) {
    let sum = 0;
    for (let j = 0; j < 238; j++) {
      sum += coefficients[j] * values[i + j];
    }
    values.push(mod(-sum));
  }
  return values;
}

/** @param {number[]} data @returns {number} GP29 IoC */
function ioc(data) {
  const count = Array(29).fill(0);
  for (const rune of data) count[rune]++;
  return count.reduce((sum, n) => sum + n * (n - 1), 0) /
    (data.length * (data.length - 1));
}

const observed = [];
for (const [order, seed] of [
  ["p3||p39", [...p3, ...p39]],
  ["p39||p3", [...p39, ...p3]]
]) {
  for (const [direction, polynomial] of [
    ["forward", q],
    ["reciprocal", q.slice().reverse()]
  ]) {
    const stream = lfsr(seed, polynomial);
    assert.equal(stream.length, original.length);
    for (const sign of [-1, 1]) {
      const plain = original.map((cipher, i) => mod(cipher + sign * stream[i]));
      assert(plain.every((r) => r >= 0 && r < 29));
      const replay = plain.map((r, i) => mod(r - sign * stream[i]));
      assert.deepEqual(replay, original);
      // A known native-GP plant under the *identical* declared mask must recover.
      const native = Array.from({length: original.length}, (_, i) =>
        corpus.pages[57].indices[i % corpus.pages[57].indices.length]);
      const syntheticCipher = native.map((r, i) => mod(r - sign * stream[i]));
      assert.deepEqual(syntheticCipher.map((r, i) =>
        mod(r + sign * stream[i])), native);
      observed.push({order, direction, sign,
        decoded_ioc: Number(ioc(plain).toFixed(9))});
    }
  }
}
assert.equal(observed.length, 8);
assert(observed.every((x) => x.decoded_ioc > 0.0344 &&
  x.decoded_ioc < 0.0346));
console.log(JSON.stringify({
  original_runes: original.length,
  source_prime_polynomial_degree: 238,
  source_prefix_lengths: [p3.length, p39.length],
  original_ioc: ioc(original),
  cases: observed
}, null, 2));
console.log("PASS: eight source-paired Q238 LFSR masks remain nonlinguistic");
