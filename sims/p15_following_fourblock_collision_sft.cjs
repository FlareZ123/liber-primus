"use strict";
/**
 * A key-independent four-rune block-collision gate for the original 4x4
 * p15 matrix's immediately following seven physical LP2 pages, p16..p22.
 *
 * Run from repository root: node sims/p15_following_fourblock_collision_sft.cjs
 * Requires only checked-in corpora and Node.js; no CLI parameters or network.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const load = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const corpus = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter((p) => p.page >= 16 && p.page <= 22);
assert.deepEqual(pages.map((p) => p.page), [16, 17, 18, 19, 20, 21, 22]);

const original = pages.flatMap((p) => p.indices);
const WIDTH = 4;
const LENGTH = 1744;
assert.equal(original.length, LENGTH);
assert.equal(LENGTH % WIDTH, 0);
assert(original.every((n) => Number.isInteger(n) && n >= 0 && n < 29));

/**
 * Count all unordered pairs of equal aligned four-rune blocks.
 * Any one fixed, injective mapping of four-vectors preserves this number.
 *
 * @param {number[]} sequence - Flattened GP29 rune indices.
 * @returns {{pairs:number, repeats:Array<{key:number,offsets:number[]}>}}
 */
function blockCollisions(sequence, phase = 0) {
  const buckets = new Map();
  for (let i = phase; i + WIDTH <= sequence.length; i += WIDTH) {
    const key = ((sequence[i] * 29 + sequence[i + 1]) * 29 +
      sequence[i + 2]) * 29 + sequence[i + 3];
    const offsets = buckets.get(key) || [];
    offsets.push(i);
    buckets.set(key, offsets);
  }
  let pairs = 0;
  const repeats = [];
  for (const [key, offsets] of buckets) {
    if (offsets.length < 2) continue;
    pairs += offsets.length * (offsets.length - 1) / 2;
    repeats.push({key, offsets});
  }
  return {pairs, repeats};
}

/**
 * Preserve the GP mapper used by earlier repo language controls.
 * K/Q collapse to C, V to U, Z to S, and digraphs are greedy.
 *
 * @param {string} text - Latin-letter source prose.
 * @returns {number[]} GP29 indices.
 */
function encodeGP(text) {
  const cleaned = text.toUpperCase().replace(/[^A-Z]/g, "");
  const tokens = corpus.translit.map((token, index) => [token, index])
    .sort((a, b) => b[0].length - a[0].length);
  const result = [];
  for (let i = 0; i < cleaned.length;) {
    const match = tokens.find(([token]) => cleaned.startsWith(token, i));
    if (match) {
      result.push(match[1]);
      i += match[0].length;
    } else {
      const character = cleaned[i++];
      if (character === "K" || character === "Q") result.push(5);
      if (character === "V") result.push(1);
      if (character === "Z") result.push(15);
    }
  }
  return result;
}

/**
 * The source-visible p15 numerical square reduced modulo GP29.
 * This independent key sanity check tests an actual bijective Hill map.
 */
const M = [
  [10, 3, 20, 22],
  [1, 22, 21, 25],
  [11, 17, 19, 7],
  [21, 17, 12, 22]
];
const MINV = [
  [19, 1, 6, 3],
  [11, 7, 8, 22],
  [2, 10, 15, 28],
  [25, 4, 1, 15]
];
const mod = (n) => (n % 29 + 29) % 29;

/** @param {number[]} a @param {number[][]} matrix */
function applyMatrix(a, matrix) {
  assert.equal(a.length % WIDTH, 0);
  const out = [];
  for (let i = 0; i < a.length; i += WIDTH) {
    for (let row = 0; row < WIDTH; row++) {
      let value = 0;
      for (let col = 0; col < WIDTH; col++) {
        value += matrix[row][col] * a[i + col];
      }
      out.push(mod(value));
    }
  }
  return out;
}
assert.deepEqual(applyMatrix(applyMatrix(original, M), MINV), original);
const observed = blockCollisions(original);
assert.equal(observed.pairs, 1);
assert.deepEqual(observed.repeats[0].offsets, [604, 1100]);
const allPhasePairs = [0, 1, 2, 3].map((phase) =>
  blockCollisions(original, phase).pairs);
assert.deepEqual(allPhasePairs, [1, 0, 0, 0]);
assert.equal(blockCollisions(applyMatrix(original, M)).pairs, observed.pairs);

const shakespeare = encodeGP(load("resources/control/shakespeare_first300k.txt"));
const gutenberg = load("resources/control/gibran_prophet_58585.txt");
const beginning = gutenberg.indexOf("THE PROPHET", 2400);
const ending = gutenberg.indexOf("*** END", beginning);
assert(beginning >= 0 && ending > beginning);
const gibran = encodeGP(gutenberg.slice(beginning, ending));
const latin = JSON.parse(load("resources/control/latin-vulgate-heldout-gp.json")).runes;
assert.equal(shakespeare.length, 216874);
assert.equal(gibran.length, 46778);
assert.equal(latin.length, 2400);
assert.equal(blockCollisions(applyMatrix(shakespeare.slice(0, LENGTH), M)).pairs,
  blockCollisions(shakespeare.slice(0, LENGTH)).pairs);

/**
 * Compare locked, original-length source windows with no key searches.
 * The overlapping windows give finite-corpus bounds, not independent p-values.
 *
 * @param {number[]} a
 * @param {number} stride
 * @returns {{count:number,min:number,median:number,max:number,atMostOriginal:number}}
 */
function controls(a, stride, phase = 0) {
  const values = [];
  for (let start = 0; start + LENGTH <= a.length; start += stride) {
    values.push(blockCollisions(a.slice(start, start + LENGTH), phase).pairs);
  }
  values.sort((x, y) => x - y);
  return {
    count: values.length,
    min: values[0],
    median: values[Math.floor(values.length / 2)],
    max: values[values.length - 1],
    atMostOriginal: values.filter((n) => n <= observed.pairs).length
  };
}
const sets = {
  Shakespeare: {sequence: shakespeare, overlappingStride: 100},
  Gibran: {sequence: gibran, overlappingStride: 50},
  Latin: {sequence: latin, overlappingStride: 50}
};
const report = {
  original: {pages: pages.map((p) => p.page), runes: LENGTH,
    blocks: LENGTH / WIDTH, collisions: observed.pairs,
    repeats: observed.repeats},
  controls: {},
  phasePairs: allPhasePairs,
  phaseControlMin: {}
};
for (const [label, {sequence, overlappingStride}] of Object.entries(sets)) {
  const independent = controls(sequence, LENGTH);
  const overlapping = controls(sequence, overlappingStride);
  assert(independent.min > observed.pairs);
  assert(overlapping.min > observed.pairs);
  report.controls[label] = {sourceRunes: sequence.length, independent, overlapping};
  const perPhaseMin = allPhasePairs.map((_, phase) =>
    controls(sequence, overlappingStride, phase).min);
  assert(perPhaseMin.every((min, phase) => min > allPhasePairs[phase]));
  report.phaseControlMin[label] = perPhaseMin;
}
assert.equal(report.controls.Shakespeare.independent.count, 124);
assert.equal(report.controls.Shakespeare.independent.min, 14);
assert.equal(report.controls.Gibran.independent.count, 26);
assert.equal(report.controls.Gibran.independent.min, 24);
assert.equal(report.controls.Latin.independent.min, 40);

// Stronger key-independent test: the same source-p15 four-vector mapping
// hypothesized to stay fixed across all subsequent physical pages p16–55.
// The whole unknown manuscript is a further stationarity sensitivity control.
const fullUnknown = corpus.pages.filter((p) => p.page <= 55)
  .flatMap((p) => p.indices);
const afterP15 = corpus.pages.filter((p) => p.page >= 16 && p.page <= 55)
  .flatMap((p) => p.indices);
assert.equal(fullUnknown.length, 12956);
assert.equal(afterP15.length, 9194);
assert.equal(blockCollisions(applyMatrix(fullUnknown, M)).pairs,
  blockCollisions(fullUnknown).pairs);

/**
 * Count all four-phase collision pairs in matched real prose source windows.
 * The stride uses overlapping windows deliberately; do not claim trial
 * independence or a calibrated discovery-wide p-value.
 * @param {number[]} sequence
 * @param {number} windowLength
 * @returns {{n:number, minByPhase:number[], medianByPhase:number[]}}
 */
function extendedControls(sequence, windowLength) {
  const buckets = Array.from({length: WIDTH}, () => []);
  for (let start = 0; start + windowLength <= sequence.length; start += 200) {
    const window = sequence.slice(start, start + windowLength);
    for (let phase = 0; phase < WIDTH; phase++) {
      buckets[phase].push(blockCollisions(window, phase).pairs);
    }
  }
  for (const bucket of buckets) bucket.sort((a, b) => a - b);
  return {
    n: buckets[0].length,
    minByPhase: buckets.map((a) => a[0]),
    medianByPhase: buckets.map((a) => a[Math.floor(a.length / 2)])
  };
}
report.extended = {};
for (const [label, cipher] of [
  ["p16-p55", afterP15],
  ["p0-p55", fullUnknown]
]) {
  const originalByPhase = [0, 1, 2, 3]
    .map((phase) => blockCollisions(cipher, phase).pairs);
  const controlResults = {};
  for (const [sourceName, sequence] of [
    ["Shakespeare", shakespeare], ["Gibran", gibran]
  ]) {
    const comparison = extendedControls(sequence, cipher.length);
    assert(comparison.minByPhase.every((value, i) =>
      value > originalByPhase[i]));
    controlResults[sourceName] = comparison;
  }
  report.extended[label] = {
    runes: cipher.length, originalByPhase, controls: controlResults
  };
}
assert.deepEqual(report.extended["p16-p55"].originalByPhase, [8, 1, 1, 1]);
assert.deepEqual(report.extended["p0-p55"].originalByPhase, [5, 6, 10, 11]);
assert.deepEqual(report.extended["p16-p55"].controls.Shakespeare.minByPhase,
  [456, 489, 478, 502]);
assert.deepEqual(report.extended["p16-p55"].controls.Gibran.minByPhase,
  [782, 840, 782, 832]);
assert.deepEqual(report.extended["p0-p55"].controls.Shakespeare.minByPhase,
  [1018, 1029, 960, 1014]);
assert.deepEqual(report.extended["p0-p55"].controls.Gibran.minByPhase,
  [1702, 1661, 1558, 1638]);

console.log(JSON.stringify(report, null, 2));
console.log("PASS: p16..p55 and whole LP2 all-secret four-block equality obstruction");
