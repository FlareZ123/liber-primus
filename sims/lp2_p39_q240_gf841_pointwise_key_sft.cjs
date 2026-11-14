#!/usr/bin/env node
"use strict";

// Source-pinned direct GF(841) pointwise-key test.
// p50's 240-slot quotient is paired against the 240-rune p39 page in
// GF(29)[u]/(u^2 - 3u - 8). No offset, phase, basis, coordinate-swap,
// or reverse search is performed.

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = process.cwd();
const grid = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const MOD = 29;
const mod = (x) => ((x % MOD) + MOD) % MOD;

function inv29(x) {
  x = mod(x);
  assert.notEqual(x, 0, "GF(29) inverse of zero");
  let a = x, n = 27, out = 1;
  while (n) {
    if (n & 1) out = mod(out * a);
    a = mod(a * a);
    n >>= 1;
  }
  return out;
}

function mulPolyHigh(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
    }
  }
  return out;
}

function divPolyHigh(dividend, divisor) {
  const a = dividend.map(mod);
  const b = divisor.map(mod);
  assert.notEqual(b[0], 0, "divisor must have a nonzero leading coefficient");
  const q = Array(a.length - b.length + 1).fill(0);
  const leadingInverse = inv29(b[0]);
  for (let i = 0; i < q.length; i++) {
    q[i] = mod(a[i] * leadingInverse);
    for (let j = 0; j < b.length; j++) {
      a[i + j] = mod(a[i + j] - q[i] * b[j]);
    }
  }
  return { quotient: q, remainder: a.slice(q.length) };
}

// High-to-low coefficients of (X+5)^2, H2, F3, and F9.
const factor16 = [
  [1, 10, 25],
  [1, 18, 11],
  [1, 14, 16, 24],
  [1, 12, 20, 10, 5, 1, 9, 0, 15, 11],
].reduce((acc, factor) => mulPolyHigh(acc, factor), [1]);

const expectedFactor16 = [1, 25, 17, 11, 15, 7, 11, 26, 6, 26, 13, 2, 6, 12, 26, 20, 13];
assert.deepStrictEqual(factor16, expectedFactor16, "source factor-16 product changed");
assert.equal(grid.bytes.length, 256, "p50 table must contain 256 source bytes");

const p50Polynomial = grid.bytes.map(mod);
const division = divPolyHigh(p50Polynomial, factor16);
const q240 = division.quotient;
const remainder = division.remainder;
assert.equal(q240.length, 240, "full 256-slot quotient must retain 240 slots");
assert(remainder.every((x) => mod(x) === 0), "p50 polynomial is not exactly divisible by F16");
assert.deepStrictEqual(q240.slice(0, 4), [0, 28, 18, 14]);

const page = (n) => corpus.pages.find((p) => p.page === n);
const p3 = page(3).indices;
const p39 = page(39).indices;
const p57 = page(57).indices;
assert.equal(p39.length, 240, "p39 must be the 240-rune target");
assert.deepStrictEqual(p3.slice(119, 122), [13, 23, 2], "p3 red field triad changed");
assert.deepStrictEqual(p39.slice(119, 122), [27, 5, 15], "p39 red quadratic triad changed");

function pairs(a) {
  assert.equal(a.length % 2, 0, "pairing requires an even symbol count");
  return Array.from({ length: a.length / 2 }, (_, i) => [a[2 * i], a[2 * i + 1]]);
}
function flatten(a) { return a.flat(); }

// GF(841) = GF(29)[u]/(u^2 - 3u - 8), selected by the p3 red triad.
// Elements are represented in fixed printed order as a + b*u.
const fAdd = (x, y) => [mod(x[0] + y[0]), mod(x[1] + y[1])];
const fSub = (x, y) => [mod(x[0] - y[0]), mod(x[1] - y[1])];
const fMul = (x, y) => [
  mod(x[0] * y[0] + 8 * x[1] * y[1]),
  mod(x[0] * y[1] + x[1] * y[0] + 3 * x[1] * y[1]),
];
function fInv(x) {
  const a = x[0], b = x[1];
  const norm = mod(a * a + 3 * a * b - 8 * b * b);
  assert.notEqual(norm, 0, "nonzero GF(841) element must have nonzero norm");
  const ni = inv29(norm);
  return [mod((a + 3 * b) * ni), mod(-b * ni)];
}
const fDiv = (x, y) => fMul(x, fInv(y));
const identity = [1, 0];

const keyPairs = pairs(q240);
const cipherPairs = pairs(p39);
assert.equal(keyPairs.length, 120);
assert.equal(keyPairs.filter((x) => x[0] === 0 && x[1] === 0).length, 0,
  "division by the source-derived key must be defined at every position");
for (const k of keyPairs) assert.deepStrictEqual(fMul(k, fInv(k)), identity);

const operations = {
  "C-K": { decode: fSub, encode: fAdd },
  "C+K": { decode: fAdd, encode: fSub },
  "C*K": { decode: fMul, encode: fDiv },
  "C/K": { decode: fDiv, encode: fMul },
};

function ioc(a) {
  const counts = Array(MOD).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (a.length * (a.length - 1));
}
function preview(a, n = 72) {
  return a.slice(0, n).map((i) => corpus.translit[i]).join("");
}
const syntheticPlain = Array.from({ length: 240 }, (_, i) => p57[i % p57.length]);

const results = {};
for (const [name, op] of Object.entries(operations)) {
  const decodedPairs = cipherPairs.map((c, i) => op.decode(c, keyPairs[i]));
  const decoded = flatten(decodedPairs);
  const reencrypted = flatten(decodedPairs.map((p, i) => op.encode(p, keyPairs[i])));
  assert.deepStrictEqual(reencrypted, p39, name + ": original-cipher round trip failed");

  const syntheticPairs = pairs(syntheticPlain);
  const syntheticCipher = syntheticPairs.map((p, i) => op.encode(p, keyPairs[i]));
  const syntheticRecovered = flatten(syntheticCipher.map((c, i) => op.decode(c, keyPairs[i])));
  assert.deepStrictEqual(syntheticRecovered, syntheticPlain, name + ": synthetic positive control failed");

  results[name] = {
    ioc: ioc(decoded),
    preview: preview(decoded),
    originalRoundTrip: true,
    syntheticP57RoundTrip: true,
  };
}

console.log(JSON.stringify({
  source: "resources/liber-primus/lp2-grid-256.json + lp2-corpus.json",
  field: "GF(29)[u]/(u^2 - 3u - 8)",
  p3RedTriad119: p3.slice(119, 122),
  p39RedTriad119: p39.slice(119, 122),
  factor16,
  q240Length: q240.length,
  q240Leading: q240.slice(0, 4),
  q240Trailing: q240.slice(-4),
  remainderNonzero: remainder.filter((x) => mod(x) !== 0).length,
  keyPairs: keyPairs.length,
  zeroKeyPairs: 0,
  p39Ioc: ioc(p39),
  p57Ioc: ioc(p57),
  results,
}, null, 2));
