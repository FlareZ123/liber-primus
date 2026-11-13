"use strict";
/**
 * Fixed-pair 2012-postscript length gate for the 262 original p0 runes.
 * Standalone regression: node sims/lp2_p0_2012_ps_131_reuse_keyless_sft.cjs
 * Source-native English controls are Shakespeare, Gibran and Emerson.
 * No external packages, network requests or file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const original = corpus.pages.find((page) => page.page === 0).indices;
const HALF = 131;
assert.equal(original.length, 2 * HALF);
assert.equal(corpus.translit.length, 29);

const differences = Array.from({ length: HALF }, (_, i) =>
  (original[i] - original[i + HALF] + 29) % 29
);
const equalityCount = differences.filter((value) => value === 0).length;
assert.equal(equalityCount, 4);

const labelToIndex = new Map(corpus.translit.map((label, i) => [label, i]));
const labels = corpus.translit.slice().sort((a, b) => b.length - a.length);

/** @param {string} raw @returns {number[]} */
function encodeGP(raw) {
  const source = raw.toUpperCase().replace(/QU/g, "CW")
    .replace(/K/g, "C").replace(/V/g, "U").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < source.length;) {
    // Historical GP transliteration represents ING as NG.
    if (source.startsWith("ING", i)) {
      out.push(labelToIndex.get("NG"));
      i += 3;
      continue;
    }
    const label = labels.find((entry) => source.startsWith(entry, i));
    if (label === undefined) {
      i += 1;
      continue;
    }
    out.push(labelToIndex.get(label));
    i += label.length;
  }
  return out;
}

/** @param {number[]} gp @returns {number[]} */
function independentPairDifferenceLaw(gp) {
  const counts = Array(29).fill(0);
  for (const value of gp) counts[value]++;
  const probability = counts.map((count) => count / gp.length);
  return Array.from({ length: 29 }, (_, d) =>
    probability.reduce((sum, p, index) =>
      sum + p * probability[(index - d + 29) % 29], 0)
  );
}

/** @param {number[]} deltas @param {number[]} law */
function logLikelihoodRatio(deltas, law) {
  return deltas.reduce((sum, d) => sum + Math.log(29 * law[d]), 0);
}

const paths = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt",
];
const summary = [];
for (const file of paths) {
  const gp = encodeGP(read(file));
  assert(gp.length > 2 * HALF);
  const law = independentPairDifferenceLaw(gp);
  const observedLLR = logLikelihoodRatio(differences, law);
  const scores = [];
  for (let start = 0; start + 2 * HALF < gp.length; start += 17) {
    const candidate = Array.from({ length: HALF }, (_, i) =>
      (gp[start + i] - gp[start + i + HALF] + 29) % 29
    );
    scores.push(logLikelihoodRatio(candidate, law));
  }
  scores.sort((a, b) => a - b);
  const atOrBelow = scores.filter((score) => score <= observedLLR).length;
  const percentile = atOrBelow / scores.length;
  assert(percentile < 0.01, `Unexpected control score for ${file}`);
  summary.push({
    source: file,
    encodedRunes: gp.length,
    expectedSameRunePairs: HALF * law[0],
    observedSameRunePairs: equalityCount,
    observedLLR,
    nativeControlWindows: scores.length,
    controlWindowsAtOrBelow: atOrBelow,
    empiricalLowerFraction: percentile,
    medianControlLLR: scores[Math.floor(scores.length / 2)],
  });

  // Plant a 131-symbol one-time pad and reuse it across two adjacent GP-native
  // controls. Recovered C1-C2 differences must equal original P1-P2 exactly.
  const pad = Array.from({ length: HALF }, (_, i) => (7 * i + 13) % 29);
  const plantedDifference = Array.from({ length: HALF }, (_, i) => {
    const c1 = (gp[500 + i] + pad[i]) % 29;
    const c2 = (gp[500 + HALF + i] + pad[i]) % 29;
    return (c1 - c2 + 29) % 29;
  });
  for (let i = 0; i < HALF; i++) {
    assert.equal(plantedDifference[i], (gp[500 + i] - gp[500 + HALF + i] + 29) % 29);
  }
}
console.log(JSON.stringify({
  originalPage: 0,
  originalRunes: original.length,
  split: [HALF, HALF],
  originalRepeatedHalfPairs: equalityCount,
  scope: "fixed same GP29 additive pad aligned across two 131-rune halves; GP English",
  controls: summary,
}, null, 2));
