#!/usr/bin/env node
"use strict";
/**
 * A source-motivated three-of-five share gate for original LP2 pp23-26.
 *
 * Node.js 22 CommonJS, no packages, deterministic SFT.
 * Inputs are the unmodified GP29 corpus and the historical ssss v0.5
 * 984-bit binary field. This is a HYPOTHESIS: Cicada's documented 2013
 * SSSS round was five-of-ten, not three-of-five.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const sourcePages = corpus.pages.filter(p => p.page >= 23 && p.page <= 26);
assert.deepEqual(sourcePages.map(p => p.indices.length), [213, 270, 273, 265]);
const symbols = sourcePages.flatMap(p => p.indices);
assert.deepEqual(symbols.slice(0, 16),
  [1, 24, 7, 21, 6, 14, 23, 6, 10, 17, 10, 12, 16, 17, 10, 26]);
const body = symbols.slice(16);
assert.equal(body.length, 1005);
const p2 = corpus.pages.find(p => p.page === 2).indices;
assert.equal(p2.length, 201);

const TOP = 1n << 984n;
const MODULUS = TOP | (1n << 24n) | (1n << 9n) | (1n << 3n) | 1n;
const LIMIT = 29n ** 201n;

/** @param {number[]} digits @returns {bigint} */
function base29(digits) {
  return digits.reduce((value, digit) => value * 29n + BigInt(digit), 0n);
}

/** GF(2) polynomial multiplication of short binary-polynomial coefficients.
 * @param {number} x @param {number} y @returns {number}
 */
function shortProduct(x, y) {
  let product = 0;
  while (y) {
    if (y & 1) product ^= x;
    x <<= 1;
    y >>>= 1;
  }
  return product >>> 0;
}

/** Field multiplication when right operand has at most 28 bits.
 * @param {bigint} x @param {number} y @returns {bigint}
 */
function multiplyShort(x, y) {
  let product = 0n;
  while (y) {
    if (y & 1) product ^= x;
    y >>>= 1;
    x <<= 1n;
    if (x & TOP) x ^= MODULUS;
  }
  return product;
}

/** General field multiplication, used for the positive secret reconstruction.
 * @param {bigint} x @param {bigint} y @returns {bigint}
 */
function multiply(x, y) {
  let product = 0n;
  while (y) {
    if (y & 1n) product ^= x;
    y >>= 1n;
    x <<= 1n;
    if (x & TOP) x ^= MODULUS;
  }
  return product;
}

/** Multiplicative inverse in the historical GF(2^984) polynomial field.
 * @param {bigint} a @returns {bigint}
 */
function inverse(a) {
  assert.notEqual(a, 0n);
  let u = a, v = MODULUS, g = 1n, h = 0n;
  while (u !== 1n) {
    assert.notEqual(u, 0n);
    let shift = u.toString(2).length - v.toString(2).length;
    if (shift < 0) {
      [u, v] = [v, u];
      [g, h] = [h, g];
      shift = -shift;
    }
    u ^= v << BigInt(shift);
    g ^= h << BigInt(shift);
  }
  while (g >= TOP) {
    g ^= MODULUS << BigInt(g.toString(2).length - 985);
  }
  return g;
}

/** Clear denominators in the highest (cubic) Lagrange coefficient.
 * For four distinct share IDs, these coefficients detect exactly whether
 * all four y-values lie on one degree-at-most-two field polynomial.
 * @param {number[]} xs @returns {number[]}
 */
function parityCoefficients(xs) {
  assert.equal(xs.length, 4);
  assert.equal(new Set(xs).size, 4);
  const denominators = xs.map((x, i) =>
    xs.reduce((p, xj, j) => i === j ? p : shortProduct(p, x ^ xj), 1));
  const coefficients = denominators.map((_, i) =>
    denominators.reduce((p, d, j) => i === j ? p : shortProduct(p, d), 1));
  assert.ok(coefficients.every(x => x > 0 && x < (1 << 28)));
  return coefficients;
}

/** @param {number[]} xs @param {bigint[]} ys @returns {boolean} */
function fourSharesFitQuadratic(xs, ys) {
  const w = parityCoefficients(xs);
  return (multiplyShort(ys[0], w[0]) ^
    multiplyShort(ys[1], w[1]) ^
    multiplyShort(ys[2], w[2]) ^
    multiplyShort(ys[3], w[3])) === 0n;
}

/** Interpolate the constant term of a quadratic from three genuine shares.
 * @param {number[]} xs @param {bigint[]} ys @returns {bigint}
 */
function recoverConstant(xs, ys) {
  assert.equal(xs.length, 3);
  assert.equal(ys.length, 3);
  let answer = 0n;
  for (let i = 0; i < 3; i++) {
    let weight = 1n;
    for (let j = 0; j < 3; j++) {
      if (i === j) continue;
      weight = multiply(weight, BigInt(xs[j]));
      weight = multiply(weight, inverse(BigInt(xs[i] ^ xs[j])));
    }
    answer ^= multiply(ys[i], weight);
  }
  return answer;
}

const layouts = [
  Array.from({ length: 5 }, (_, lane) => body.filter((_, i) => i % 5 === lane)),
  Array.from({ length: 5 }, (_, lane) => body.slice(lane * 201, (lane + 1) * 201))
];
const views = layouts.flatMap((lanes, i) => [
  { name: (i ? "blocks" : "quintets") + "-forward", ys: lanes.map(base29) },
  { name: (i ? "blocks" : "quintets") + "-reversed",
    ys: lanes.map(lane => base29([...lane].reverse())) }
]);
for (const v of views) {
  assert.equal(v.ys.length, 5);
  assert.ok(v.ys.every(y => y >= 0n && y < LIMIT && y < TOP));
}

// Source-independent positive plant using the actual length-201 p2 value
// only as a *synthetic* secret; no claim that original p2 is this secret.
const secret = base29(p2);
const c1 = 124581358313n, c2 = 12121n;
const xsPlant = [1, 2, 3, 4, 5];
const ysPlant = xsPlant.map(x =>
  secret ^ multiplyShort(c1, x) ^ multiplyShort(c2, shortProduct(x, x)));
assert.ok(ysPlant.every(y => y >= 0n && y < LIMIT));
assert.equal(recoverConstant(xsPlant.slice(0, 3), ysPlant.slice(0, 3)), secret);
for (let i = 0; i < 5; i++) {
  const ix = xsPlant.filter((_, j) => i !== j);
  const iy = ysPlant.filter((_, j) => i !== j);
  assert.ok(fourSharesFitQuadratic(ix, iy));
}
const altered = ysPlant.slice();
altered[0] ^= 1n;
assert.equal(fourSharesFitQuadratic(xsPlant.slice(0, 4),
  altered.slice(0, 4)), false);

const idSets = [];
for (let a = 1; a <= 7; a++)
  for (let b = a + 1; b <= 8; b++)
    for (let c = b + 1; c <= 9; c++)
      for (let d = c + 1; d <= 10; d++)
        idSets.push([a, b, c, d]);
assert.equal(idSets.length, 210);

const bijections = [];
/** @param {number[]} left @param {number[]} prefix */
function permute(left, prefix) {
  if (!left.length) {
    bijections.push(prefix);
    return;
  }
  for (let i = 0; i < left.length; i++)
    permute(left.filter((_, j) => j !== i), [...prefix, left[i]]);
}
permute([0, 1, 2, 3], []);
assert.equal(bijections.length, 24);

const stats = views.map(v => ({ view: v.name, fourShareTests: 0,
  exactQuadraticMatches: 0 }));
for (const ids of idSets) {
  const weights = parityCoefficients(ids);
  for (let omitted = 0; omitted < 5; omitted++) {
    const trial = views.map(v => v.ys.filter((_, j) => j !== omitted));
    for (const order of bijections) {
      for (let h = 0; h < views.length; h++) {
        const ys = trial[h];
        stats[h].fourShareTests++;
        let parity = 0n;
        for (let j = 0; j < 4; j++)
          parity ^= multiplyShort(ys[order[j]], weights[j]);
        if (parity === 0n) stats[h].exactQuadraticMatches++;
      }
    }
  }
}
assert.deepEqual(stats.map(s => s.fourShareTests), [25200,25200,25200,25200]);
assert.deepEqual(stats.map(s => s.exactQuadraticMatches), [0,0,0,0]);
console.log(JSON.stringify({
  status: "PASS",
  scope: "all 4-of-5 lane subsets and all four-ID assignments from 01..10",
  layouts: views.map(v => v.name),
  originalChecks: 100800,
  matches: 0,
  recoveredSyntheticP2Runes: 201,
  seededQuadraticPlant: "5/5 shares exact, three-share secret exact",
  conclusion: "No five-strand source reading is consistent even at four shares with any 3-of-5 quadratic over the authentic 984-bit field. No LP2 plaintext or key."
}, null, 2));
