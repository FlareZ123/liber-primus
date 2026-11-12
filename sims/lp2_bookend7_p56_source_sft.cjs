"use strict";
/**
 * Original complete-LP2 seven-rune boundary echo and calibrated null.
 * SFT: node sims/lp2_bookend7_p56_source_sft.cjs
 * Source indices are physical LP2 pages, including runeless p50.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const gp = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const pages = gp.pages;
const unsolved = pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
const firstSolvedCipher = pages.find((p) => p.page === 56).indices[0];
const complete = pages.flatMap((p) => p.indices);
assert.equal(unsolved.length, 12956);
assert.equal(complete.length, 13136);
assert.equal(firstSolvedCipher, 25); // AE, decrypted as A by known p56 +1 key
const target = [23, 11, 1, 17, 18, 10, 25]; // DJU BEI AE
assert.deepEqual(pages.find((p) => p.page === 27).indices.slice(28, 35), target);
assert.deepEqual(pages.find((p) => p.page === 55).indices.slice(70, 76), target.slice(0, 6));
assert.equal(pages.find((p) => p.page === 56).indices[0], target[6]);
const starts = [];
let total = 0;
for (const p of pages) { starts[p.page] = total; total += p.indices.length; }
assert.equal(starts[27] + 28, 6555);
assert.equal(starts[55] + 70, 12950);
assert.equal(starts[56], 12956);
assert.equal((55 - 27) % 7, 0);
assert.equal(28 % 7, 0);
assert.equal(70 % 7, 0);
/** @param {number[]} sequence @param {number} n */
function repeated(sequence, n) {
  const seen = new Map();
  const matches = [];
  for (let i = 0; i + n <= sequence.length; i++) {
    const key = sequence.slice(i, i + n).join(",");
    if (seen.has(key)) matches.push([seen.get(key), i]);
    else seen.set(key, i);
  }
  return matches;
}
assert.deepEqual(repeated(unsolved, 7), []);
assert.deepEqual(repeated(complete, 7), [[6555, 12950]]);
assert.deepEqual(repeated(complete, 8), []);
// A planted cross-boundary seven-rune repeat must be found, even when
// input phrase and positions are independently chosen.
const plant = complete.slice();
plant.splice(1200, 7, ...complete.slice(2300, 2307));
assert.ok(repeated(plant, 7).some(([a, b]) => a === 1200 && b === 2300));

// First-order uniform GP29 null conditioned on observed doublet survival.
// This is a descriptive model check, not an author-cipher hypothesis.
const experiment = unsolved.concat(firstSolvedCipher);
const L = 7, power = 29 ** (L - 1), rate = 86 / (experiment.length - 1);
let seed = 0x33012026;
/** @returns {number} */
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}
/** @param {Uint8Array|number[]} a */
function containsSevenRepeat(a) {
  const seen = new Set();
  let h = 0;
  for (let i = 0; i < L; i++) h = h * 29 + a[i];
  seen.add(h);
  for (let i = L; i < a.length; i++) {
    h = (h - a[i - L] * power) * 29 + a[i];
    if (seen.has(h)) return true;
    seen.add(h);
  }
  return false;
}
let hits = 0, generatedDoublets = 0;
for (let trial = 0; trial < 3000; trial++) {
  const simulated = new Uint8Array(experiment.length);
  simulated[0] = Math.floor(random() * 29);
  for (let i = 1; i < simulated.length; i++) {
    let value;
    if (random() < rate) {
      value = simulated[i - 1];
      generatedDoublets++;
    } else {
      value = Math.floor(random() * 28);
      if (value >= simulated[i - 1]) value++;
    }
    simulated[i] = value;
  }
  hits += Number(containsSevenRepeat(simulated));
}
assert.equal(hits, 10);
assert.equal(experiment.slice(1).filter((v, i) => v === experiment[i]).length, 86);
console.log(JSON.stringify({
  originalRunes: complete.length,
  unknownRunes: unsolved.length,
  seventhRune: {cipher: "AE", knownP56Plain: "A", solvedKeyShift: 1},
  uniqueRepeatedSeven: {offsets: [6555, 12950], pages: ["p27:28-34", "p55:70-75 + p56:0"],
    transliteration: "DJU-BEI-AE", pageDelta: 28, sourceLocalStartPhaseMod7: [0, 0]},
  longestRepeatedOriginalLength: 7,
  markovNull: {seed: "0x33012026", trials: 3000, anyLength7Repeats: hits,
    rate: hits / 3000, meanDoublets: generatedDoublets / 3000,
    model: "uniform GP29 first-order, empirical adjacent-repeat survival"}
}, null, 2));
