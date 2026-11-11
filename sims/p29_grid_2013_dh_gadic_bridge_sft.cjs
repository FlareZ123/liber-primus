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

// Page-wide original-source uniqueness, holding the signed constants and table fixed.
const matchingPages = corpus.pages.filter((x) => x.page <= 55 && x.indices.length >= 5)
  .filter((x) => {
    const r = div(sub(x.indices, S), G2).r;
    return r.length === 4 && r.every((v, i) => v === [0, 1, 10, 25][i]);
  })
  .map((x) => x.page);
assert.deepEqual(matchingPages, [29]);

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
  exactCongruence: "P29 - S - 2G = G^2 R over GF(29)",
  originalDifferenceModuloG2: [0, 1, 10, 25],
  RLength: residual.q.length, RIoC: ioc(residual.q),
  nativePlantRecovered: plant.length,
  matchingPages,
  conditionalShuffles: {trials, hits, pAddOne: (hits + 1) / (trials + 1)}
}, null, 2));
