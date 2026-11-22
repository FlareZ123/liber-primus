"use strict";

/**
 * Projective-scale-safe Segre readout gate for the p32/cuneiform 210-state route.
 *
 * The three evolving P1(F29) coordinates define a point of P7 through the
 * Segre embedding. Normalize each eight-coordinate row by its first nonzero
 * coordinate, once in canonical binary order and once after the pre-existing
 * PATIENCE order, then test the three direct additive GP29 actions on the
 * unchanged pp33-39 ciphertext.
 *
 * Run: node sims/p32_cuneiform_segre_normalization_sft.cjs
 * Node.js 22, built-ins only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
/** @param {string} file */
const json = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const corpus = json("resources/liber-primus/lp2-corpus.json");
const native = json("resources/control/latin-vulgate-heldout-gp.json").runes;
const MOD = 29;
/** @param {number} n */
const mod = n => (n % MOD + MOD) % MOD;
/** @param {number} a */
function inv(a) {
  for (let x = 1; x < MOD; x++) if (mod(a * x) === 1) return x;
  throw new Error("noninvertible field element");
}
/** @param {number[][]} a @param {number[][]} b */
function matMul(a, b) {
  return [
    [mod(a[0][0] * b[0][0] + a[0][1] * b[1][0]), mod(a[0][0] * b[0][1] + a[0][1] * b[1][1])],
    [mod(a[1][0] * b[0][0] + a[1][1] * b[1][0]), mod(a[1][0] * b[0][1] + a[1][1] * b[1][1])],
  ];
}
/** @param {number[][]} a @param {number|null} x @returns {number|null} */
function applyPGL(a, x) {
  if (x === null) return a[1][0] === 0 ? null : mod(a[0][0] * inv(a[1][0]));
  const denominator = mod(a[1][0] * x + a[1][1]);
  return denominator === 0 ? null : mod((a[0][0] * x + a[0][1]) * inv(denominator));
}
/** @param {number|null} x @returns {[number, number]} */
const hom = x => x === null ? [1, 0] : [x, 1];
/** @param {(number|null)[]} state */
function tensor8(state) {
  const point = state.map(hom);
  const row = [];
  for (let bits = 0; bits < 8; bits++) {
    let value = 1;
    for (let i = 0; i < 3; i++) value = mod(value * point[i][(bits >> (2 - i)) & 1]);
    row.push(value);
  }
  return row;
}
/** @param {number[]} row */
function normalize(row) {
  const pivot = row.find(value => value !== 0);
  assert.notEqual(pivot, undefined);
  const scale = inv(pivot);
  return row.map(value => mod(value * scale));
}
/** @param {number[]} values */
function ioc(values) {
  const counts = Array(MOD).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (values.length * (values.length - 1));
}

const M7 = [[14, 25], [25, 28]];
const correction = [3, 0, 8];
const maps = correction.map(n => matMul([[1, n], [0, 1]], M7));
const states = [];
let state = [13, 23, 2];
for (let n = 0; n < 210; n++) {
  states.push(state.slice());
  state = state.map((x, i) => applyPGL(maps[i], x));
}
assert.deepEqual(state, [13, 23, 2]);

const patience = [6, 5, 3, 0, 2, 4, 7, 1];
const canonicalKey = states.flatMap(s => normalize(tensor8(s)));
const patienceAfterKey = states.flatMap(s => patience.map(i => normalize(tensor8(s))[i]));
const patienceBeforeKey = states.flatMap(s => normalize(patience.map(i => tensor8(s)[i])));
assert.equal(canonicalKey.length, 1680);
assert.equal(patienceAfterKey.length, 1680);
assert.equal(patienceBeforeKey.length, 1680);

const section = corpus.pages.filter(page => page.page >= 33 && page.page <= 39).flatMap(page => page.indices);
assert.equal(section.length, 1680);

const trigrams = new Uint32Array(MOD ** 3);
let trigramCount = 0;
for (let i = 0; i + 2 < native.length; i++) {
  trigrams[(native[i] * MOD + native[i + 1]) * MOD + native[i + 2]]++;
  trigramCount++;
}
const alpha = 0.1;
const denominator = trigramCount + alpha * trigrams.length;
/** @param {number[]} values */
function trigramScore(values) {
  let score = 0;
  for (let i = 0; i + 2 < values.length; i++) {
    const count = trigrams[(values[i] * MOD + values[i + 1]) * MOD + values[i + 2]];
    score += Math.log((count + alpha) / denominator);
  }
  return score / (values.length - 2);
}

const keys = [
  ["canonical-normalized", canonicalKey],
  ["canonical-normalized-then-patience", patienceAfterKey],
  ["patience-then-normalized", patienceBeforeKey],
];
const operations = [
  ["C-K", (c, k) => mod(c - k)],
  ["C+K", (c, k) => mod(c + k)],
  ["K-C", (c, k) => mod(k - c)],
];
const runs = [];
for (const [name, key] of keys) {
  for (const [operation, fn] of operations) {
    const plain = section.map((cipher, i) => fn(cipher, key[i]));
    runs.push({
      name,
      operation,
      keyIoc:ioc(key),
      ioc:ioc(plain),
      trigramScore:trigramScore(plain),
      prefix:plain.slice(0, 100).map(i => corpus.translit[i]).join(""),
    });
  }
}
runs.sort((a, b) => b.trigramScore - a.trigramScore);
const raw = {ioc:ioc(section), trigramScore:trigramScore(section)};
const nativeControl = {ioc:ioc(native), trigramScore:trigramScore(native)};

assert.ok(runs.every(run => run.ioc < 0.035));
assert.ok(runs.every(run => run.trigramScore < -10.5));
assert.ok(nativeControl.ioc > 0.06);
assert.ok(nativeControl.trigramScore > -8);

console.log(JSON.stringify({
  classification:"bounded negative: scale-invariant Segre P7 normalization",
  source:{pages:[33,39], states:210, outputsPerState:8, runes:section.length},
  raw,
  nativeControl,
  runs,
  verdict:"Canonical first-nonzero P7 normalization, including both source-natural PATIENCE placements, remains ciphertext-like under the three direct additive GP29 actions.",
}, null, 2));
