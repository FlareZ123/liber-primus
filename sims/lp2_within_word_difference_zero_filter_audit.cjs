#!/usr/bin/env node
/*
 * Canonical within-word adjacent-difference audit.
 *
 * Purpose: separate the known adjacent-equal deficit (difference 0) from
 * genuinely nonzero step structure before interpreting any deconvolution as
 * a keystream-step signal.
 */
const assert = require("assert/strict");
const fs = require("fs");
const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const text = fs.readFileSync("resources/liber-primus/lp2-transcription.txt", "utf8");
const rune = new Map(corpus.runes.map((r, i) => [r, i]));

const words = [];
let cur = [];
for (const part of text.split("%").slice(0, 55)) {
  for (const ch of part) {
    if (rune.has(ch)) cur.push(rune.get(ch));
    else if (ch === "-" || ch === "." || ch === "&" || ch === "$") {
      if (cur.length) { words.push(cur); cur = []; }
    }
  }
}
if (cur.length) words.push(cur);

const fullStream = corpus.pages
  .filter(page => page.page <= 55 && page.indices.length > 0)
  .flatMap(page => page.indices);
assert.equal(fullStream.length, 12956);

const externalStepCounts = Array(29).fill(0);
const previousVsStep = Array.from({length: 29}, () => Array(29).fill(0));
for (let i = 1; i < fullStream.length; i++) {
  const previous = fullStream[i - 1];
  const step = (fullStream[i] - previous + 29) % 29;
  externalStepCounts[step]++;
  previousVsStep[previous][step]++;
}
assert.deepEqual(externalStepCounts, [
  86, 459, 504, 440, 438, 446, 430, 470, 426, 510,
  497, 455, 449, 504, 474, 470, 449, 404, 434, 474,
  467, 463, 421, 486, 468, 467, 457, 476, 431
]);

const externalNonzeroN = externalStepCounts.slice(1)
  .reduce((sum, count) => sum + count, 0);
const externalNonzeroExpected = externalNonzeroN / 28;
const externalNonzeroChiSquare = externalStepCounts.slice(1).reduce(
  (sum, count) =>
    sum + (count - externalNonzeroExpected) ** 2 / externalNonzeroExpected,
  0
);

function independenceChiSquare(table) {
  const rows = table.map(row => row.reduce((sum, value) => sum + value, 0));
  const cols = Array(table[0].length).fill(0);
  for (let row = 0; row < table.length; row++) {
    for (let col = 0; col < table[row].length; col++) {
      cols[col] += table[row][col];
    }
  }
  const total = rows.reduce((sum, value) => sum + value, 0);
  let chiSquare = 0;
  for (let row = 0; row < table.length; row++) {
    for (let col = 0; col < table[row].length; col++) {
      const expected = rows[row] * cols[col] / total;
      if (expected > 0) {
        chiSquare += (table[row][col] - expected) ** 2 / expected;
      }
    }
  }
  return chiSquare;
}

const externalPreviousStepIndependenceChiSquare =
  independenceChiSquare(previousVsStep);

const previousVsNonzeroStep = previousVsStep.map(row => row.slice(1));
const externalNonzeroPreviousStepIndependenceChiSquare =
  independenceChiSquare(previousVsNonzeroStep);

const reconstructed = [fullStream[0]];
for (let i = 1; i < fullStream.length; i++) {
  const step = (fullStream[i] - fullStream[i - 1] + 29) % 29;
  reconstructed.push((reconstructed[i - 1] + step) % 29);
}
assert.deepEqual(reconstructed, fullStream);

const d = Array(29).fill(0);
for (const w of words)
  for (let i = 1; i < w.length; i++)
    d[(w[i] - w[i - 1] + 29) % 29]++;

const N = d.reduce((a, b) => a + b, 0);
const expectedZero = N / 29;
const observedZeroFraction = d[0] / expectedZero;
const repairFraction = 1 - observedZeroFraction;
const nonzeroN = N - d[0];
const expectedNonzero = nonzeroN / 28;
const nonzeroChi = d.slice(1).reduce(
  (s, o) => s + (o - expectedNonzero) ** 2 / expectedNonzero, 0
);

const z = d.slice(1).map((o, i) => ({
  difference: i + 1,
  observed: o,
  z: (o - expectedNonzero) / Math.sqrt(expectedNonzero)
})).sort((a, b) => Math.abs(b.z) - Math.abs(a.z));

// Matched null: uniform base differences with the observed zero-suppression rate.
// A deterministic xorshift is sufficient because this is only a Monte Carlo null calibration.
let seed = 0x9e3779b9 >>> 0;
const rnd = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) / 4294967296; };
const reps = 10000, observedChi = nonzeroChi;
let ge = 0, meanChi = 0, maxChi = 0;
for (let r = 0; r < reps; r++) {
  const c = Array(28).fill(0);
  for (let i = 0; i < N; i++) {
    let x = Math.floor(rnd() * 29);
    if (x === 0 && rnd() < repairFraction) x = 1 + Math.floor(rnd() * 28);
    if (x !== 0) c[x - 1]++;
  }
  const nz = c.reduce((a, b) => a + b, 0), e = nz / 28;
  let chi = 0;
  for (const o of c) chi += (o - e) ** 2 / e;
  meanChi += chi;
  if (chi >= observedChi) ge++;
  if (chi > maxChi) maxChi = chi;
}
const monteCarlo = { reps, observedChi, meanChi: meanChi / reps, pValue: ge / reps, maxChi };

console.log(JSON.stringify({
  externalSeptember2026ChainFingerprint: {
    pinnedExternalCommit: "c0875c8df069245d83d576243696a8d2f0faacc4",
    fullContinuousTransitions: fullStream.length - 1,
    stepCounts: externalStepCounts,
    nonzeroStepChiSquare: externalNonzeroChiSquare,
    nonzeroStepDegreesOfFreedom: 27,
    nonzeroStepPValueApprox: 0.03784583245,
    previousVsStepIndependenceChiSquare:
      externalPreviousStepIndependenceChiSquare,
    previousVsStepIndependenceDegreesOfFreedom: 784,
    previousVsStepIndependencePValueApprox: 0.3250624029,
    previousVsNonzeroStepIndependenceChiSquare:
      externalNonzeroPreviousStepIndependenceChiSquare,
    previousVsNonzeroStepIndependenceDegreesOfFreedom: 756,
    previousVsNonzeroStepIndependencePValueApprox: 0.3115569070,
    chainIdentityRoundTrip: true
  },
  words: words.length,
  runes: words.reduce((a, w) => a + w.length, 0),
  withinWordTransitions: N,
  counts: d,
  zero: {
    observed: d[0],
    uniformExpected: expectedZero,
    retainedFraction: observedZeroFraction,
    effectiveZeroDeficitFromUniform: repairFraction
  },
  monteCarlo,
  nonzero: {
    observedTotal: nonzeroN,
    expectedPerDifferenceUnderUniformCollisionRepair: expectedNonzero,
    chiSquare: nonzeroChi,
    degreesOfFreedom: 27,
    largestStandardizedDeviation: z[0],
    pValueApprox: 0.1792
  },
  interpretation:
    "The broad difference anomaly is dominated by difference=0. Once zero is excluded, the 28 nonzero differences are compatible with a uniform distribution at the stated chi-square test. Do not deconvolve the zero-deficit distribution into a putative keystream-step law without explicitly modeling the collision repair."
}, null, 2));
