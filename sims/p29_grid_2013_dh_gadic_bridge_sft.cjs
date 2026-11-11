"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * Original-input test of a shared G-adic congruence between physical LP2 p29
 * and the 32x8 number table, with 2013 signed BASE29 and DH constants.
 * No decipherment or authorial instruction is presumed.
 */

const M = 29;
const G = [15, 5, 27]; // physical LP2 p39 red GP-index triple, descending
const H = [24, 26, 3]; // 2013 BASE29 3301 -> 3QO, coefficient order
const DH = { modulus: 23, exampleSharedSecret: 2 };
const mod = (n) => (n % M + M) % M;

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function mul(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
  return out;
}

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function add(a, b) {
  const n = Math.max(a.length, b.length);
  const x = Array(n - a.length).fill(0).concat(a);
  const y = Array(n - b.length).fill(0).concat(b);
  return x.map((v, i) => mod(v + y[i]));
}

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function sub(a, b) {
  const n = Math.max(a.length, b.length);
  const x = Array(n - a.length).fill(0).concat(a);
  const y = Array(n - b.length).fill(0).concat(b);
  return x.map((v, i) => mod(v - y[i]));
}

/**
 * Long division in GF(29), coefficients highest degree first.
 * @param {number[]} a Dividend
 * @param {number[]} b Nonzero divisor
 * @returns {{q:number[],r:number[]}}
 */
function div(a, b) {
  assert.ok(a.length >= b.length && b[0] !== 0);
  const r = a.map(mod);
  const inverse = Array.from({length: M - 1}, (_, i) => i + 1)
    .find((v) => mod(v * b[0]) === 1);
  assert.notEqual(inverse, undefined);
  const q = [];
  for (let i = 0; i <= a.length - b.length; i++) {
    const x = mod(r[i] * inverse);
    q.push(x);
    for (let j = 0; j < b.length; j++)
      r[i + j] = mod(r[i + j] - x * b[j]);
  }
  return {q, r: r.slice(q.length)};
}

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = Array(M).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const table = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
const P = corpus.pages.find((p) => p.page === 29).indices;
const S = table.bytes.map(mod);
assert.equal(P.length, 277);
assert.equal(S.length, 256);

const F = mul(H, G);
const G2 = mul(G, G);
assert.deepEqual(F, [12, 17, 11, 21, 23]);
assert.deepEqual(G2, [22, 5, 23, 9, 4]);

const pageG = div(P, G);
const gridF = div(S, F);
assert.deepEqual(pageG.r, [0, 0]);
assert.deepEqual(gridF.r, [0, 0, 0, 0]);
assert.equal(pageG.q.length - gridF.q.length, DH.modulus);
assert.deepEqual(mul(H, gridF.q), div(S, G).q);

const qDifference = sub(sub(pageG.q, mul(H, gridF.q)), [DH.exampleSharedSecret]);
const residual = div(qDifference, G);
assert.deepEqual(residual.r, [0, 0]);
assert.equal(residual.q.length, 273);
assert.deepEqual(
  div(sub(P, S), G2).r,
  [0, 1, 10, 25]
);
assert.deepEqual(
  add(add(S, mul([DH.exampleSharedSecret], G)), mul(G2, residual.q)),
  P
);

/**
 * Formal Hasse-free ordinary derivatives in GF(29); the source's
 * enlarged Ac (GP index 24) fixes the evaluation point.
 * @param {number[]} coefficients High-degree-first source polynomial
 * @param {number} point GP index
 * @param {number} maxOrder Number of derivatives inclusive
 * @returns {number[]}
 */
function derivativesAt(coefficients, point, maxOrder) {
  let coefficientsAtOrder = coefficients.map(mod);
  const out = [];
  for (let order = 0; order <= maxOrder; order++) {
    out.push(coefficientsAtOrder.reduce((value, coefficient) =>
      mod(value * point + coefficient), 0));
    const degree = coefficientsAtOrder.length - 1;
    coefficientsAtOrder = coefficientsAtOrder.slice(0, -1)
      .map((coefficient, i) => mod(coefficient * (degree - i)));
  }
  return out;
}

// Additional exploratory DH fingerprint, tested without fitting GP29 output:
const signedDHFull = {modulus: 23, base: 5, serverShare: 8,
  clientShare: 19, exampleSharedSecret: 2};
assert.equal(G[1], signedDHFull.base);
assert.equal(F[F.length - 1], signedDHFull.modulus);
const root24 = 24; // enlarged p54 Ac and the exact root of marked p39 G.
const sourcePageJet = derivativesAt(P, root24, 6);
const sourceGridJet = derivativesAt(S, root24, 6);
assert.deepEqual(sourcePageJet.slice(0, 4), [0, 0, 25, 7]);
assert.deepEqual(sourceGridJet.slice(0, 4), [0, 0, 23, 7]);
assert.equal(mod(sourcePageJet[2] - sourceGridJet[2]),
  signedDHFull.exampleSharedSecret);
assert.equal(sourceGridJet[2], signedDHFull.modulus);
assert.equal(sourcePageJet[3], mod(
  signedDHFull.serverShare * signedDHFull.clientShare));
assert.equal(sourceGridJet[3], mod(
  signedDHFull.serverShare * signedDHFull.clientShare));
assert.deepEqual(sourcePageJet.slice(4, 7), [20, 14, 6]);
assert.deepEqual(sourceGridJet.slice(4, 7), [23, 28, 26]);

// The signed 2013 BASE29 convention supplies a separate fixed binary reading:
// interpret the recovered 273 GF29 coefficients as one big-endian base-29 integer.
const packedNumber = residual.q.reduce((acc, digit) => acc * 29n + BigInt(digit), 0n);
let packedHex = packedNumber.toString(16);
if (packedHex.length % 2) packedHex = "0" + packedHex;
const packedBinary = Buffer.from(packedHex, "hex");
assert.equal(packedBinary.length, 166);
assert.equal(packedBinary.subarray(0, 16).toString("hex"), "166a370a936ebaf8dc6c0cdc798dee98");
const printableBytes = [...packedBinary].filter((v) => v >= 32 && v < 127).length;
assert.equal(printableBytes, 52);

// Page-wide original-source uniqueness, holding the signed constants and table fixed.
const matchingPages = corpus.pages.filter((x) => x.page <= 55 && x.indices.length >= 5)
  .filter((x) => {
    const r = div(sub(x.indices, S), G2).r;
    return r.length === 4 && r.every((v, i) => v === [0, 1, 10, 25][i]);
  })
  .map((x) => x.page);
assert.deepEqual(matchingPages, [29]);

// Wrong-source byte conventions must not silently pass the same relation.
const radix60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const radix59 = radix60.replace("f", "");
const tokens = table.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256);
const alternative59 = tokens.map((x) =>
  59 * radix59.indexOf(x[0]) + radix59.indexOf(x[1]));
assert.deepEqual(div(sub(P, alternative59.map(mod)), G2).r, [17, 13, 3, 26]);
assert.deepEqual(div(sub(P, S.slice().reverse()), G2).r, [5, 7, 10, 20]);

// Genuine GP-native plant: this exact algebraic encoder really recovers plaintext.
const known = corpus.pages.find((p) => p.page === 57).indices;
const plant = Array.from({length: 273}, (_, i) => known[i % known.length]);
const planted = add(add(S, mul([DH.exampleSharedSecret], G)), mul(G2, plant));
assert.equal(planted.length, 277);
assert.deepEqual(div(sub(sub(planted, S), mul([DH.exampleSharedSecret], G)), G2).q, plant);
const bad = P.slice();
bad[bad.length - 1] = mod(bad[bad.length - 1] + 1);
assert.notDeepEqual(div(sub(bad, S), G2).r, [0, 1, 10, 25]);

// Conditional randomization: preserve every GP29 quotient symbol's histogram
// and the fact that multiplication by G creates a G-divisible p29-sized word.
let seed = 0x29022013;
function next32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const shuffled = pageG.q.slice();
const sourceGridQuotient = mul(H, gridF.q);
let hits = 0;
const trials = 50000;
for (let t = 0; t < trials; t++) {
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = next32() % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  if (div(sub(sub(shuffled, sourceGridQuotient), [DH.exampleSharedSecret]), G)
    .r.every((x) => x === 0)) hits++;
}
assert.equal(hits, 60);

console.log(JSON.stringify({
  input: {page: 29, runes: P.length, tableCells: S.length},
  signedParameters: {H, DH}, originalTriad: G, product: F,
  exploratoryDHJet: {root24, sourcePageJet: sourcePageJet.slice(0, 7),
    sourceGridJet: sourceGridJet.slice(0, 7), signedDHFull},
  exactCongruence: "P29 - S - 2G = G^2 R over GF(29)",
  originalDifferenceModuloG2: [0, 1, 10, 25],
  RLength: residual.q.length, RIoC: ioc(residual.q), base29Binary: {bytes: packedBinary.length, printableBytes},
  nativePlantRecovered: plant.length,
  matchingPages,
  conditionalShuffles: {trials, hits, pAddOne: (hits + 1) / (trials + 1)}
}, null, 2));
