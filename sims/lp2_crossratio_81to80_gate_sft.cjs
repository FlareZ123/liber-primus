"use strict";

/**
 * SFT: exact 81x81-to-80x80 cross-ratio/undefined-cell gate on original LP2.
 * Run in repository root with Node.js 22: node sims/lp2_crossratio_81to80_gate_sft.cjs
 * Exploratory source-square comparison; it is not a lossless LP2 decoder.
 */
const assert = require("node:assert/strict");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const MOD = 29;
const input = corpus.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
assert.equal(input.length, 12956);
const first = input.slice(0, 81 * 81);
const second = input.slice(81 * 81);
assert.equal(second.length, 80 * 80 - 5);

const inverse = Array.from({length: MOD}, () => 0);
for (let a = 1; a < MOD; a++) {
  for (let b = 1; b < MOD; b++) {
    if ((a * b) % MOD === 1) inverse[a] = b;
  }
}

/** @param {number} x Signed integer. @returns {number} Nonnegative residue. */
function mod(x) {
  return ((x % MOD) + MOD) % MOD;
}

/**
 * Projective ratio of the four 81-square corners. 29 represents infinity,
 * 30 represents a genuinely undefined 0/0 ratio.
 * @param {number} a Top-left. @param {number} b Top-right.
 * @param {number} c Bottom-left. @param {number} d Bottom-right.
 * @returns {number} Ratio-state index 0..30.
 */
function crossRatio(a, b, c, d) {
  const numerator = mod((a - b) * (c - d));
  const denominator = mod((a - d) * (c - b));
  if (!denominator) return numerator ? 29 : 30;
  return mod(numerator * inverse[denominator]);
}

const ratios = [];
for (let row = 0; row < 80; row++) {
  for (let col = 0; col < 80; col++) {
    const p = row * 81 + col;
    ratios.push(crossRatio(first[p], first[p + 1],
      first[p + 81], first[p + 82]));
  }
}
const counts = [
  ratios.filter((n) => n < 29).length,
  ratios.filter((n) => n === 29).length,
  ratios.filter((n) => n === 30).length,
];
assert.deepEqual(counts, [5997, 398, 5]);

/**
 * @param {number} orientation Zero to seven dihedral orientations.
 * @returns {{states:number[], undefinedPositions:number[]}} Ratio-state stream.
 */
function oriented(orientation) {
  const states = [];
  const undefinedPositions = [];
  for (let i = 0; i < 6400; i++) {
    const row = Math.floor(i / 80);
    const col = i % 80;
    const r = orientation & 1 ? col : row;
    const c = orientation & 1 ? row : col;
    const rr = orientation & 2 ? 79 - r : r;
    const cc = orientation & 4 ? 79 - c : c;
    const value = ratios[rr * 80 + cc];
    if (value === 30) undefinedPositions.push(i);
    else states.push(value);
  }
  assert.equal(states.length, second.length);
  assert.equal(undefinedPositions.length, 5);
  return {states, undefinedPositions};
}

const orientedStreams = Array.from({length: 8}, (_, i) => oriented(i));

/**
 * Exact all-secret optimum: each of 30 ratio states may output any of 29
 * ciphertext runes, including a many-to-one map. This is more permissive
 * than a reversible fixed map and therefore an upper bound.
 * @param {number[]} source Ratio states, excluding the 5 undefined positions.
 * @param {number[]} target LP2 target runes.
 * @returns {number} Maximum exact position matches under any 30-to-29 map.
 */
function maxMatches(source, target) {
  const histograms = Array.from({length: 30}, () => new Uint16Array(29));
  for (let i = 0; i < target.length; i++) {
    histograms[source[i]][target[i]]++;
  }
  let matches = 0;
  for (const hist of histograms) {
    let max = 0;
    for (const n of hist) if (n > max) max = n;
    matches += max;
  }
  return matches;
}

/** @param {number[]} target Target stream. @returns {number} Best of eight. */
function bestScore(target) {
  return Math.max(...orientedStreams.map((item) =>
    maxMatches(item.states, target)));
}

const originalScores = orientedStreams.map((item) =>
  maxMatches(item.states, second));
assert.deepEqual(originalScores, [394, 402, 389, 404, 400, 398, 404, 403]);
assert.equal(bestScore(second), 404);

/* Source-shaped positive: an independent fixed 30-to-29 map reproduces all. */
const planted = orientedStreams[3].states.map((s) => (7 * s + 11) % 29);
assert.equal(maxMatches(orientedStreams[3].states, planted), second.length);

/* Preserves the original second-half histogram, refits orientation and map. */
let randomState = 0x33222133;
/** @returns {number} Deterministic test random fraction in [0,1). */
function random() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return (randomState >>> 0) / 0x100000000;
}
const nullScores = [];
for (let trial = 0; trial < 200; trial++) {
  const shuffled = second.slice();
  for (let j = shuffled.length - 1; j > 0; j--) {
    const k = Math.floor(random() * (j + 1));
    [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
  }
  nullScores.push(bestScore(shuffled));
}
const sorted = nullScores.slice().sort((a, b) => a - b);
assert.equal(sorted[100], 410);
assert.equal(sorted[0], 399);
assert.equal(sorted[199], 433);
const report = {
  originalRunes: input.length,
  sourceSquare: "81x81",
  targetPrintedRunes: second.length,
  contractionStates: {finite: counts[0], infinite: counts[1], undefined: counts[2]},
  originalScores,
  bestOriginal: bestScore(second),
  minimumUnavoidableOriginalChanges: second.length - bestScore(second),
  matchedNull: {replicates: 200, median: sorted[100],
    minimum: sorted[0], maximum: sorted[199],
    greaterOrEqual: nullScores.filter((n) => n >= bestScore(second)).length},
  plantedExactMatches: second.length,
};
console.log(JSON.stringify(report, null, 2));
