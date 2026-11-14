"use strict";
/**
 * Exploratory source-derived dual-number inverse on untouched LP2 GP29 runes.
 *
 * In GF(29)[epsilon]/epsilon^2 the element 19+13epsilon (from the original
 * numeral-table/p39 factor chain) generates the 812 unit elements. An ordered
 * unequal GP29 ciphertext pair (x,y) determines the unit
 * (y-x)+x*epsilon. The discrete logarithm's mod-29 coordinate is exactly
 * 26*x/(y-x) modulo 29. This tests the absolute coordinate and consecutive
 * group-quotient coordinates without fitting a key or plaintext.
 *
 * Node.js 22/CommonJS; source reads only; no external dependencies or writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const source = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const N = 29;
const ORDER = 812;
const mod = n => ((n % N) + N) % N;
/** @param {number} a */
function inverse(a) {
  assert.notEqual(mod(a), 0);
  for (let i = 1; i < N; i++) if (mod(a * i) === 1) return i;
  throw new Error("No modular inverse");
}
/** @param {number[]} a @param {number} n */
function ioc(a, n) {
  const hist = Array(n).fill(0);
  for (const v of a) hist[v]++;
  return hist.reduce((sum, v) => sum + v * (v - 1), 0) /
    (a.length * (a.length - 1));
}

/** @type {Map<number,number>} */
const logarithm = new Map();
let real = 1;
let eps = 0;
for (let k = 0; k < ORDER; k++) {
  const key = real * N + eps;
  assert.equal(logarithm.has(key), false, "Generator repeats prematurely");
  logarithm.set(key, k);
  [real, eps] = [mod(real * 19), mod(real * 13 + eps * 19)];
}
assert.equal(logarithm.size, ORDER);
assert.deepEqual([real, eps], [1, 0]);
assert.equal(mod(19 * inverse(13)), 26);

const pages = source.pages
  .filter(p => p.page < 56 && p.indices.length > 0)
  .map(p => p.indices);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((sum, p) => sum + p.length, 0), 12956);

const absolute = [];
const difference = [];
const mod28 = [];
let doubles = 0;
let compared = 0;
for (const page of pages) {
  let previousLog = undefined;
  for (let i = 1; i < page.length; i++) {
    const x = page[i - 1];
    const y = page[i];
    const d = mod(y - x);
    compared++;
    if (d === 0) {
      doubles++;
      previousLog = undefined;
      continue;
    }
    const k = logarithm.get(d * N + x);
    assert.notEqual(k, undefined);
    const direct = mod(26 * x * inverse(d));
    assert.equal(k % N, direct, "Exact dual-unit logarithm identity");
    absolute.push(k % N);
    mod28.push(k % 28);
    if (previousLog !== undefined) {
      difference.push((k - previousLog + ORDER) % N);
    }
    previousLog = k;
  }
}
assert.equal(compared, 12901);
assert.equal(doubles, 86);
assert.equal(absolute.length, 12815);
assert.equal(difference.length, 12676);

const originalIoc = ioc(pages.flat(), N);
const decodedIoc = ioc(absolute, N);
const diffIoc = ioc(difference, N);
const rankIoc = ioc(mod28, 28);
assert.ok(Math.abs(decodedIoc - 0.03446061391227321) < 1e-12);
assert.ok(Math.abs(diffIoc - 0.035659965282510614) < 1e-12);
assert.ok(Math.abs(rankIoc - 0.03575624860659804) < 1e-12);

console.log(JSON.stringify({
  model: "19+13 epsilon order812; log((C_i-C_prev)+C_prev epsilon)",
  ciphertextRunes: 12956,
  withinPageTransitions: compared,
  unequalPairs: absolute.length,
  repeatedPairs: doubles,
  originalIoc,
  absoluteMod29Ioc: decodedIoc,
  consecutiveGroupRatioMod29Ioc: diffIoc,
  mod28Ioc: rankIoc,
  absoluteFirst100Gp: absolute.slice(0, 100).map(i => source.translit[i]).join(""),
  verdict: "Neither direct inverse recovers native-GP prose; no unknown key or plaintext"
}, null, 2));
