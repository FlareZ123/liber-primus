"use strict";

// Original-source GF(29) three-of-three Shamir reconstruction, no file writes.
// Run as a single Node.js 22 file from the repository's sims/ directory.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @typedef {number[]} RuneTape */

/** @param {number} n @returns {number} */
function mod29(n) {
  return ((n % 29) + 29) % 29;
}

/** @param {RuneTape} a @returns {number} */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const rune of a) counts[rune]++;
  return counts.reduce((n, c) => n + c * (c - 1), 0) / (a.length * (a.length - 1));
}

/**
 * Reconstruct the constant term of a quadratic polynomial from its values
 * at x=1,2,3 over GF(29): f(0)=3*f(1)-3*f(2)+f(3).
 * @param {[RuneTape,RuneTape,RuneTape]} shares
 * @returns {RuneTape}
 */
function reconstruct(shares) {
  const [x1, x2, x3] = shares;
  assert.equal(x1.length, x2.length);
  assert.equal(x1.length, x3.length);
  return x1.map((_, i) => mod29(3 * x1[i] - 3 * x2[i] + x3[i]));
}

const root = path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json");
const corpus = JSON.parse(fs.readFileSync(root, "utf8"));
const page = (number) => corpus.pages.find((p) => p.page === number).indices;
const p0 = page(0);
const a = p0.slice(20, 141);
const b = p0.slice(141);
const c = page(32);
assert.equal(p0.length, 262);
assert.deepEqual([a.length, b.length, c.length], [121, 121, 121]);

// A constructive native-GP solved-p57 plant: the source is short, so its
// beginning is repeated to fill 121 symbols. No language fitted to a key.
const known = Array.from({ length: 121 }, (_, i) => page(57)[i % page(57).length]);
const plantA = known.map((v, i) => mod29(10 * (v + 3 * b[i] - c[i])));
assert.deepEqual(reconstruct([plantA, b, c]), known);
const corrupted = c.slice();
corrupted[37] = mod29(corrupted[37] + 1);
const bad = reconstruct([plantA, b, corrupted]);
assert.equal(bad.filter((v, i) => v !== known[i]).length, 1);

const permutations = [
  [0, 1, 2], [0, 2, 1], [1, 0, 2],
  [1, 2, 0], [2, 0, 1], [2, 1, 0],
];
const results = [];
for (const order of permutations) {
  for (const reverseB of [false, true]) {
    for (const reverseC of [false, true]) {
      const shares = [a, reverseB ? b.slice().reverse() : b,
        reverseC ? c.slice().reverse() : c];
      const tape = reconstruct(order.map((index) => shares[index]));
      results.push({ order: order.join(""), reverseB, reverseC,
        ioc: ioc(tape), tape });
    }
  }
}

results.sort((x, y) => y.ioc - x.ioc);
const best = results[0];
const translit = (tape) => tape.map((i) => corpus.translit[i]).join("");
assert.equal(results.length, 24);
assert.equal(best.order, "021");
assert.equal(best.reverseB, false);
assert.equal(best.reverseC, true);
assert.ok(Math.abs(best.ioc - 0.04104683195592287) < 1e-12);
assert.ok(best.ioc < 0.04752066116); // Earlier nine-thousand-window GP-English minimum.

console.log("Original p0 / p32 GF(29) Shamir three-share test");
console.log("Original slice lengths:", a.length, b.length, c.length);
console.log("All 24 fixed original orders and half-turns tested:");
for (const r of results) {
  console.log("  "+r.order+" reverseB="+r.reverseB+" reverseC="+r.reverseC+" IoC="+r.ioc.toFixed(12));
}
console.log("Maximum-IoC original GP transliteration:", translit(best.tape));
console.log("Native solved-text plant and single-corrupted-share controls: PASS");
console.log("No authentic unknown LP2 plaintext or cipher is claimed. PASS");
