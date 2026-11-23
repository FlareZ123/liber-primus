"use strict";
/**
 * LP2 original punctuation-type-only sidecar capacity gate.
 *
 * Physical mark locations are held fixed; only the distinguishable visible
 * punctuation categories are permuted while retaining original class counts.
 * This deliberately does not bound channels encoded by mark POSITIONS, ink
 * microstructure, central drawings, JPEG coefficients, or external material.
 *
 * Run from a repository checkout with Node.js 22.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const punct = read("resources/liber-primus/lp2-punctuation-identity.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const corpus = read("resources/liber-primus/lp2-corpus.json");

const originalPages = corpus.pages.filter(page => page.page <= 55);
const runeCount = originalPages.reduce((n, page) => n + page.indices.length, 0);
const nonemptyPageCount = originalPages.filter(page => page.indices.length).length;
const transitions = runeCount - nonemptyPageCount;
assert.equal(runeCount, 12956);
assert.equal(nonemptyPageCount, 55);
assert.equal(transitions, 12901);

let repeats = 0;
for (const page of originalPages) {
  for (let j = 1; j < page.indices.length; j++) {
    if (page.indices[j] === page.indices[j - 1]) repeats++;
  }
}
assert.equal(repeats, 86);

const sourceAudit = punct.source_audit;
const morphological = sourceAudit.morphology;
assert.deepEqual(sourceAudit.audited_scope.excluded_editorial_stop_indices, [57, 58, 59, 60]);
assert.deepEqual(punct.image_audit.editorial_event_indices, [57, 58, 59, 60]);
assert.equal(punct.counts["⁘"], 145);
assert.equal(punct.counts["⁚"], 4);
assert.equal(punct.counts["⁜"], 31);
assert.equal(morphological.stop_absent, 1);
assert.equal(morphological.stop_four_dot_diamonds.count, 138);
assert.equal(morphological.stop_four_dot_diamonds.black, 137);
assert.equal(morphological.stop_four_dot_diamonds.red, 1);
assert.equal(morphological.stop_three_dot_comma_form, 1);
assert.equal(morphological.stop_single_dot_ambiguous, 1);
assert.equal(morphological.comma_three_dot_zigzags, 4);

const originalLarge = ink.pages
  .filter(page => page.page <= 55)
  .flatMap(page => page.large_punctuation || []);
assert.equal(originalLarge.length, 31);
const largeHist = new Map();
for (const [, count, color] of originalLarge) {
  const label = `${count}-dot:${color}`;
  largeHist.set(label, (largeHist.get(label) || 0) + 1);
}
assert.equal(largeHist.get("13-dot:red"), 27);
assert.equal(largeHist.get("13-dot:black"), 1);
assert.equal(largeHist.get("10-dot:red"), 3);

const physicalStops = punct.counts["⁘"]
  - punct.image_audit.editorial_event_indices.length
  - morphological.stop_absent;
assert.equal(physicalStops, 140);
const physicalMarkCount = physicalStops + punct.counts["⁚"] + originalLarge.length;
assert.equal(physicalMarkCount, 175);
assert.equal(sourceAudit.counts.visible_all_marks_including_31_large, physicalMarkCount);

// Grant an intentionally generous category distinction to all observed kinds.
const categoryCounts = [
  morphological.stop_four_dot_diamonds.black,
  morphological.stop_four_dot_diamonds.red,
  morphological.stop_three_dot_comma_form,
  morphological.stop_single_dot_ambiguous,
  morphological.comma_three_dot_zigzags,
  largeHist.get("13-dot:red"),
  largeHist.get("13-dot:black"),
  largeHist.get("10-dot:red")
];
assert.equal(categoryCounts.reduce((a, b) => a + b, 0), physicalMarkCount);

/** @param {number} n */
function logFactorial(n) {
  let sum = 0;
  for (let k = 2; k <= n; k++) sum += Math.log(k);
  return sum;
}
/** @param {number[]} groups */
function log2Multinomial(groups) {
  const total = groups.reduce((a, b) => a + b, 0);
  return (logFactorial(total) -
    groups.reduce((sum, count) => sum + logFactorial(count), 0)) / Math.LN2;
}

/** Numerically stable CDF of X~Binomial(n,1/29) up to k repeats. */
function logBinomialCdf(n, maxRepeats) {
  const success = 1 / 29;
  let logTerm = n * Math.log1p(-success);
  let maxLog = -Infinity;
  const logs = [];
  for (let k = 0; k <= maxRepeats; k++) {
    logs.push(logTerm);
    maxLog = Math.max(maxLog, logTerm);
    logTerm += Math.log(n - k) - Math.log(k + 1) +
      Math.log(success / (1 - success));
  }
  return maxLog + Math.log(logs.reduce(
    (sum, item) => sum + Math.exp(item - maxLog), 0
  ));
}

const neededBits = -logBinomialCdf(transitions, repeats) / Math.LN2;
const typedBits = log2Multinomial(categoryCounts);
const remainingBits = neededBits - typedBits;
assert.ok(Math.abs(neededBits - 325.450254) < 0.00001, neededBits);
assert.ok(Math.abs(typedBits - 176.57877078182) < 0.00001, typedBits);
assert.equal(Math.ceil(neededBits), 326);
assert.equal(Math.ceil(remainingBits), 149);
console.log(JSON.stringify({
  originalRuneCount: runeCount,
  originalTransitionCount: transitions,
  originalRepeatedTransitions: repeats,
  physicalVisibleMarkCount: physicalMarkCount,
  physicalVisibleCategoryCounts: categoryCounts,
  universalAtMost86RepeatDeficitBits: neededBits,
  fixedSiteTypedMarkPermutationCapacityBits: typedBits,
  minimumAdditionalBitsBeyondMarks: Math.ceil(remainingBits),
  decision: "Fixed-site punctuation TYPE permutations cannot be the entire sidecar"
}, null, 2));
