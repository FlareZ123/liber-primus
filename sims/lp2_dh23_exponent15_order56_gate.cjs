#!/usr/bin/env node
"use strict";

// One frozen source-derived test: the authenticated 2013 DH23 client
// exponent is 15; p39's red triad independently supplies scalar 15; p3
// defines GF(29^2), whose 15th-power image has order 56. If original
// adjacent GP29 pairs were encrypted/decrypted bijectively by this
// 15th-power map on the order-56 subgroup, every nonzero ciphertext pair
// would have to satisfy z^56 = 1. This script tests that necessary condition
// on the untouched original LP2 stream. No exponent/basis/phase sweep.
//
// Run from repository root:
//   node sims/lp2_dh23_exponent15_order56_gate.cjs

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const mod = (x, q) => ((x % q) + q) % q;

function powModInt(a, n, p) {
  let out = 1;
  while (n > 0) {
    if (n & 1) out = (out * a) % p;
    a = (a * a) % p;
    n = Math.floor(n / 2);
  }
  return out;
}

// The signed 2013 worked exchange: p=23, g=5, server share=8,
// client share=19, shared secret=2. The private exponents are derived
// from the signed public values: 5^6=8 and 5^15=19 (mod 23).
const dh = {
  modulus: 23,
  base: 5,
  serverShare: 8,
  clientShare: 19,
  sharedSecret: 2,
  serverExponent: 6,
  clientExponent: 15,
};
assert.equal(powModInt(dh.base, dh.serverExponent, dh.modulus), dh.serverShare);
assert.equal(powModInt(dh.base, dh.clientExponent, dh.modulus), dh.clientShare);
assert.equal(powModInt(dh.serverShare, dh.clientExponent, dh.modulus), dh.sharedSecret);
assert.equal(powModInt(dh.clientShare, dh.serverExponent, dh.modulus), dh.sharedSecret);
let dhOrder = 1;
while (powModInt(dh.base, dhOrder, dh.modulus) !== 1) dhOrder += 1;
assert.equal(dhOrder, 22);

// Original p3 red triad [13,23,2] fixes u^2 = 3u + 8 over GF(29).
// Encode a+bu as a+29b.
const Q = 29;
const mod29 = (x) => mod(x, Q);
function mul(x, y) {
  const a = x % Q;
  const b = Math.floor(x / Q);
  const c = y % Q;
  const d = Math.floor(y / Q);
  return mod29(a * c + 8 * b * d) + Q * mod29(a * d + b * c + 3 * b * d);
}
function pow(x, n) {
  let out = 1;
  while (n > 0) {
    if (n % 2) out = mul(out, x);
    x = mul(x, x);
    n = Math.floor(n / 2);
  }
  return out;
}
function exactOrder(x, order, primeFactors) {
  if (pow(x, order) !== 1) return false;
  return primeFactors.every((p) => pow(x, order / p) !== 1);
}
const u = 29;
assert(exactOrder(u, 840, [2, 3, 5, 7]), "p3 field root must have order840");
const exponent = dh.clientExponent;
const hGenerator = pow(u, exponent);
const subgroupOrder = 840 / gcd(840, exponent);
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}
assert.equal(subgroupOrder, 56);
assert(exactOrder(hGenerator, 56, [2, 7]), "u^15 must generate H56");

// Exhaustively verify that x -> x^15 maps all 840 nonzero field elements
// into H56, and that exponent15 is self-inverse on H56.
const image = new Set();
for (let z = 1; z < 841; z += 1) {
  const y = pow(z, exponent);
  assert.equal(pow(y, subgroupOrder), 1, "15th power must lie in H56");
  image.add(y);
}
assert.equal(image.size, subgroupOrder);
for (let k = 0; k < subgroupOrder; k += 1) {
  const x = pow(hGenerator, k);
  assert.equal(pow(pow(x, exponent), exponent), x, "15 is its own inverse mod56");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter((p) => p.page >= 0 && p.page < 56).sort((a, b) => a.page - b.page);
assert.equal(pages.length, 56);
const p3 = pages.find((p) => p.page === 3).indices;
const p39 = pages.find((p) => p.page === 39).indices;
assert.deepEqual(p3.slice(119, 122), [13, 23, 2]);
assert.deepEqual(p39.slice(119, 122), [27, 5, 15]);
const all = pages.flatMap((p) => p.indices);
assert.equal(all.length, 12956);

function stats(pairs) {
  const freq = new Map();
  let zeroPairs = 0;
  let nonzeroPairs = 0;
  let inH = 0;
  const outliers = [];
  for (let i = 0; i < pairs.length; i += 1) {
    const z = pairs[i];
    freq.set(z, (freq.get(z) || 0) + 1);
    if (z === 0) {
      zeroPairs += 1;
      continue;
    }
    nonzeroPairs += 1;
    if (pow(z, subgroupOrder) === 1) inH += 1;
    else if (outliers.length < 12) {
      outliers.push({ pairIndex: i, value: z, a: z % Q, b: Math.floor(z / Q) });
    }
  }
  return {
    pairCount: pairs.length,
    distinctPairs: freq.size,
    zeroPairs,
    nonzeroPairs,
    inH,
    outsideH: nonzeroPairs - inH,
    nonzeroMembershipRate: inH / nonzeroPairs,
    expectedUniformMembershipRate: subgroupOrder / 840,
    allNonzeroPairsInH: inH === nonzeroPairs,
    firstOutliers: outliers,
  };
}

const globalPairs = [];
for (let i = 0; i + 1 < all.length; i += 2) globalPairs.push(all[i] + Q * all[i + 1]);
const pagePairs = [];
let oddPages = 0;
for (const p of pages) {
  if (p.indices.length % 2) oddPages += 1;
  for (let i = 0; i + 1 < p.indices.length; i += 2) {
    pagePairs.push(p.indices[i] + Q * p.indices[i + 1]);
  }
}
const global = stats(globalPairs);
const pageLocal = stats(pagePairs);

// A reversible pairwise 15th-power transport on H56 requires every
// nonzero ciphertext pair to lie in H56. This necessary condition fails.
assert.equal(global.pairCount, 6478);
assert.equal(global.nonzeroPairs, 6477);
assert.equal(global.inH, 465);
assert.equal(global.allNonzeroPairsInH, false);
assert.equal(pageLocal.pairCount, 6462);
assert.equal(pageLocal.nonzeroPairs, 6461);
assert.equal(pageLocal.inH, 442);
assert.equal(pageLocal.allNonzeroPairsInH, false);

console.log(JSON.stringify({
  hypothesis: "pairwise GF(29^2) 15th-power transport selected by the signed DH23 client exponent, p39 scalar 15, and 56-page LP2",
  sourceArithmetic: {
    signedDH: dh,
    dhBaseOrder: dhOrder,
    p3Field: "GF(29)[u]/(u^2 - 3u - 8)",
    p3FieldRootOrder: 840,
    p39RedTriad: [27, 5, 15],
    p39Scalar: 15,
    unsolvedPages: pages.length,
    powerImageOrder: subgroupOrder,
    imageGenerator: hGenerator,
    powerMapImageSize: image.size,
    exponent15SelfInverseOnH56: true,
  },
  untouchedOriginalCipher: {
    runes: all.length,
    globalPairing: global,
    pageLocalPairing: { oddPages, ...pageLocal },
  },
  decision: "REJECT: 6012 of 6477 nonzero global ciphertext pairs are outside H56; the 15th-power map cannot be a reversible pairwise encryption/decryption on the canonical p3 field pairing.",
}, null, 2));
