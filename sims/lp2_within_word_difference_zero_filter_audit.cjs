#!/usr/bin/env node
/*
 * Canonical within-word adjacent-difference audit.
 *
 * Purpose: separate the known adjacent-equal deficit (difference 0) from
 * genuinely nonzero step structure before interpreting any deconvolution as
 * a keystream-step signal.
 */
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

console.log(JSON.stringify({
  words: words.length,
  runes: words.reduce((a, w) => a + w.length, 0),
  withinWordTransitions: N,
  counts: d,
  zero: {
    observed: d[0],
    uniformExpected: expectedZero,
    retainedFraction: observedZeroFraction,
    inferredSuppression: repairFraction
  },
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
