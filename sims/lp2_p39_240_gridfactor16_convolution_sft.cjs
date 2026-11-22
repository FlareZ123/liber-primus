"use strict";

/**
 * Source-exact p39 / full-grid degree-16 factor gate.
 *
 * This targets a reversible whole-page equation, not a best-scoring key search:
 *   P_grid(X) = F_16(X) * C_p39(X)  (mod 29),
 * with any additional unknown 17-tap multiplier also tested algebraically.
 *
 * Node.js 22, CommonJS, no third-party dependencies. Read-only SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");

const root = path.resolve(__dirname, "..");
const load = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const corpus = load("resources/liber-primus/lp2-corpus.json");
const grid = load("resources/liber-primus/base60-grid.json").byte_rows.flat();
const mod = x => (x % 29 + 29) % 29;

/** @param {number[]} a @param {number[]} b */
function multiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
  return out;
}

/** @param {number[]} a */
function trim(a) {
  const out = a.slice();
  while (out.length && out.at(-1) === 0) out.pop();
  return out;
}

/** @param {number} v */
function inverse(v) {
  const result = Array.from({ length: 28 }, (_, i) => i + 1)
    .find(i => mod(i * v) === 1);
  assert.notEqual(result, undefined);
  return result;
}

/**
 * Polynomial division in ascending-power order.
 * @param {number[]} original
 * @param {number[]} divisor
 */
function division(original, divisor) {
  const a = trim(original);
  const f = trim(divisor);
  assert(f.length > 0);
  const quotient = Array(Math.max(0, a.length - f.length + 1)).fill(0);
  const inv = inverse(f.at(-1));
  while (a.length >= f.length) {
    const offset = a.length - f.length;
    const k = mod(a.at(-1) * inv);
    quotient[offset] = k;
    for (let i = 0; i < f.length; i++)
      a[offset + i] = mod(a[offset + i] - k * f[i]);
    while (a.length && a.at(-1) === 0) a.pop();
  }
  return { quotient, remainder: a };
}

/** @param {number[]} originalA @param {number[]} originalB */
function gcd(originalA, originalB) {
  let a = trim(originalA), b = trim(originalB);
  while (b.length) {
    const remainder = division(a, b).remainder;
    a = b; b = remainder;
  }
  return a.map(x => mod(x * inverse(a.at(-1))));
}

/** @param {number[]} a */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (a.length * (a.length - 1));
}

/**
 * Minimum necessary edits to make each key value select a unique output.
 * Any arbitrary 29-way function must incur at least this many errors.
 * @param {number[]} key
 * @param {number[]} target
 */
function mappingConflicts(key, target) {
  const counts = Array.from({ length: 29 }, () => Array(29).fill(0));
  for (let i = 0; i < key.length; i++) counts[key[i]][target[i]]++;
  return counts.reduce((n, row) =>
    n + row.reduce((a, b) => a + b, 0) - Math.max(...row), 0);
}

assert.equal(grid.length, 256);
assert.equal(
  createHash("sha256").update(Buffer.from(grid)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
assert.equal(pages.length, 55);
assert.deepEqual(pages.filter(p => p.indices.length === 240).map(p => p.page), [39]);
const p39 = corpus.pages[39].indices;
assert.equal(p39.length, 240);
assert.deepEqual(p39.slice(119, 122), [27, 5, 15]);

const factor16 = [
  [25, 10, 1], // (X+5)^2 = X^2+10X+25
  [11, 18, 1], // quadratic from signed 2013 BASE29
  [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
].reduce(multiply, [1]);
assert.equal(factor16.length, 17);
assert.deepEqual(factor16.slice(0, 5), [13, 20, 26, 12, 6]);

// Preserve the original 256 coefficient slots, including one zero leading
// coefficient: formal quotient 240 slots = 256 - degree16.
const original = grid.map(mod).reverse();
const quotient = division(original, factor16);
assert.deepEqual(quotient.remainder, []);
const q = quotient.quotient;
while (q.length < 240) q.push(0);
assert.equal(q.length, 240);
assert.equal(q[239], 0);
assert.equal(q[238], 28);
assert.equal(q[0], 24);
assert.deepEqual(multiply(q, factor16), original);
assert.deepEqual(q.slice().reverse().slice(0, 12),
  [0, 28, 18, 14, 3, 2, 14, 21, 7, 27, 23, 2]);

// Exact all-secret obstruction: polynomial multiplication by any
// GF(29) 17-tap kernel is impossible if the original page is coprime
// to the original printed table. Synthetic constructed p39 is a
// passing full-length positive control.
const p39Poly = p39.slice().reverse();
assert.deepEqual(gcd(original, p39Poly), [1]);
const synthetic = q.slice().reverse();
assert.equal(synthetic.length, p39.length);
assert.ok(gcd(original, synthetic.slice().reverse()).length > 1);
const x24 = coeff => coeff.reduceRight((acc, v) => mod(24 * acc + v), 0);
assert.equal(x24(original), 0);
assert.equal(x24(p39Poly), 7);

// Secondary direct-key and stationary all-secret codebook gates.
// These four IoCs stay near uniform, unlike native GP prose.
const orientations = [
  ["high-to-low", q.slice().reverse()],
  ["low-to-high", q]
];
const direct = [];
for (const [name, key] of orientations) {
  assert.equal(key.length, p39.length);
  for (const sign of [-1, 1]) {
    const decoded = p39.map((v, i) => mod(v + sign * key[i]));
    direct.push({ order: name, sign, ioc: ioc(decoded) });
  }
}
assert.deepEqual(direct.map(x => Number(x.ioc.toFixed(9))),
  [0.034797768, 0.033612273, 0.032775453, 0.034693166]);
const conflicts = orientations.map(([name, key]) =>
  ({ order: name, conflicts: mappingConflicts(key, p39) }));
assert.deepEqual(conflicts.map(x => x.conflicts), [188, 189]);

// A synthetic affine 29-way codebook must be exactly representable.
const plant = orientations[0][1].map(x => mod(7 * x + 13));
assert.equal(mappingConflicts(orientations[0][1], plant), 0);
console.log(JSON.stringify({
  source: "all 256 table cells and physical p39 (240 runes)",
  quotientSlots: q.length,
  factorDegree: factor16.length - 1,
  p39AtRoot24: x24(p39Poly),
  polynomialGcd: [1],
  allSecretConvolution: "EXCLUDED",
  stationaryCodebook: conflicts,
  directPadIoCs: direct,
  originalP39IoC: ioc(p39),
  positiveControl: "PASS (240-coefficient factor product and affine map)",
  recoveredPlaintext: false
}, null, 2));
