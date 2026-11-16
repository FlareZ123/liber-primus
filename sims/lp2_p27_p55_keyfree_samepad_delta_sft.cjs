"use strict";

/**
 * LP2 p27/p55 six-rune echo: key-free long-reuse discriminator.
 *
 * The authentic two-word "DJU-BEI" ciphertext appears at the p27 local
 * 28..33 and p55 local 70..75. If both appearances share the same
 * positionwise GP29 additive keystream for the preceding 302 runes, the
 * keystream cancels under ciphertext subtraction. The result must equal
 * the difference between two source-native GP29 plaintext streams.
 *
 * This SFT tests that exact extended-pad-reuse premise without selecting
 * or estimating a key, using three independent source-English controls.
 * It explicitly excludes the selected six-rune anchor from scoring.
 *
 * Run: node sims/lp2_p27_p55_keyfree_samepad_delta_sft.cjs
 * Read-only; Node.js 20+; no network access or third-party packages.
 * No unknown LP2 plaintext or authentic key is recovered by this test.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} =
  require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
const source = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(source("resources/liber-primus/lp2-corpus.json"));
const unsolved = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const stream = unsolved.flatMap(p => p.indices);
assert.equal(stream.length, 12956);
const pageStart = page => unsolved
  .filter(p => p.page < page)
  .reduce((sum, p) => sum + p.indices.length, 0);
const endpoint27 = pageStart(27) + 34;
const endpoint55 = pageStart(55) + 76;
assert.deepEqual([endpoint27, endpoint55, endpoint55 - endpoint27],
  [6561, 12956, 6395]);

const width = 308;
const anchor = 6;
const tested = width - anchor;
const p27 = stream.slice(endpoint27 - width, endpoint27);
const p55 = stream.slice(endpoint55 - width, endpoint55);
assert.equal(p27.length, width);
assert.equal(p55.length, width);
assert.deepEqual(p27.slice(-anchor), [23, 11, 1, 17, 18, 10]);
assert.deepEqual(p27.slice(-anchor), p55.slice(-anchor));
const pre27 = p27.slice(0, tested);
const pre55 = p55.slice(0, tested);

/**
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
const delta = (a, b) => {
  assert.equal(a.length, b.length);
  return a.map((v, i) => (v - b[i] + 29) % 29);
};

/** @param {number[]} a @returns {number[]} */
const histogram = a => {
  const counts = Array(29).fill(0);
  for (const index of a) {
    assert(Number.isInteger(index) && index >= 0 && index < 29);
    counts[index]++;
  }
  return counts;
};

/** @param {number[]} training @returns {number[]} */
function differenceModel(training) {
  const frequencies = histogram(training).map(n => n / training.length);
  return Array.from({length: 29}, (_, d) =>
    frequencies.reduce((sum, f, i) =>
      sum + f * frequencies[(i - d + 29) % 29], 0));
}

/** @param {number[]} diffs @param {number[]} model @returns {number} */
const logRatio = (diffs, model) =>
  diffs.reduce((sum, d) => sum + Math.log(29 * model[d]), 0);

const originalDelta = delta(pre27, pre55);
const originalCounts = histogram(originalDelta);
assert.equal(originalCounts.reduce((s, x) => s + x, 0), tested);
assert.equal(originalCounts[0], 11);

// Positive control: cancel a genuine nonperiodic key shared by two texts.
// The key is intentionally independent from both plaintext controls.
/** @param {number[]} a @param {number[]} b */
function keyCancellationControl(a, b) {
  const key = Array.from({length: tested}, (_, i) =>
    (3 * i * i + 17 * i + 7) % 29);
  const encryptedA = a.map((v, i) => (v + key[i]) % 29);
  const encryptedB = b.map((v, i) => (v + key[i]) % 29);
  assert.deepEqual(delta(encryptedA, encryptedB), delta(a, b));
  assert.deepEqual(encryptedA.map((v, i) => (v - key[i] + 29) % 29), a);
  assert.deepEqual(encryptedB.map((v, i) => (v - key[i] + 29) % 29), b);
}

const corpora = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
const trials = 1500;
const results = [];
for (const [name, file] of corpora) {
  const text = encodeSourceNativeGP(source(file));
  assert(text.length > 1000);
  const model = differenceModel(text);
  const originalScore = logRatio(originalDelta, model);
  const syntheticScores = [];
  const maxStart = text.length - tested + 1;
  for (let i = 0; i < trials; i++) {
    const first = (23 + i * 191) % maxStart;
    let second = (Math.floor(text.length / 3) + i * 1579) % maxStart;
    if (Math.abs(first - second) < tested) {
      second = (second + tested + 1500) % maxStart;
    }
    const a = text.slice(first, first + tested);
    const b = text.slice(second, second + tested);
    if (i === 0) keyCancellationControl(a, b);
    syntheticScores.push(logRatio(delta(a, b), model));
  }
  syntheticScores.sort((a, b) => a - b);
  results.push({
    name, sourceNativeRunes: text.length,
    probabilityTwoEnglishRunesCoincide: model[0],
    originalDeltaScore: originalScore,
    syntheticLowest: syntheticScores[0],
    syntheticLower5Pct: syntheticScores[Math.floor(trials * 0.05)],
    syntheticMedian: syntheticScores[Math.floor(trials / 2)],
    syntheticAtOrBelowOriginal:
      syntheticScores.filter(score => score <= originalScore).length,
    syntheticTrials: trials
  });
}

// Incorrect-key/wrong-location controls use untouched original LP2 data.
// Their purpose is scale calibration, not a global author-intent p-value.
const gibran = encodeSourceNativeGP(
  source("resources/control/gibran_prophet_58585.txt"));
const gibranModel = differenceModel(gibran);
const observedScore = logRatio(originalDelta, gibranModel);
const wrongLocations = [];
for (let i = 0; i < 2000; i++) {
  const candidateStart = (i * 4999) % (stream.length - tested + 1);
  const alternative = stream.slice(candidateStart, candidateStart + tested);
  wrongLocations.push(logRatio(delta(alternative, pre55), gibranModel));
}
wrongLocations.sort((a, b) => a - b);
const summary = {
  source: "Unchanged canonical LP2 GP29 source runes; five original pages across p25..27 and p54..55",
  keyReuseHypothesis: "Identical positionwise GP29 additive key over 302 rune positions immediately before the six-rune echo",
  originalEndpoints: [endpoint27, endpoint55],
  physicalLocalEcho: {p27:[28, 33], p55:[70, 75]},
  excludedSharedAnchorRunes: anchor,
  testedRunes: tested,
  originalPairwiseEquality: originalCounts[0],
  originalDeltaHistogram: originalCounts,
  sourceNativeEnglishPairs: results,
  wrongOriginalAlignment: {
    samples: wrongLocations.length,
    lower: wrongLocations[0],
    median: wrongLocations[1000],
    upper95Pct: wrongLocations[1900],
    atOrAboveObserved: wrongLocations.filter(s => s >= observedScore).length
  },
  authenticUnknownPlaintextRecovered: false
};
console.log(JSON.stringify(summary, null, 2));
