"use strict";
/**
 * Exact capacity of original LP2 red-rune span placements as a proposed
 * universal anti-repeat cipher sidecar. Runs on Windows Node.js 22.
 *
 * Frozen model: 56 original unknown pages, fixed rune lengths and a
 * hypothetical universal GP29 input. Allow red spans to move freely and
 * even to change lengths. This does not model auxiliary punctuation or
 * non-red physical channels, and proves no Cicada cipher.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const pages = corpus.pages.filter(page => page.page <= 55);
const N = pages.reduce((acc, page) => acc + page.indices.length, 0);
const nonempty = pages.filter(page => page.indices.length).length;
const T = N - nonempty;
let doubles = 0;
for (const page of pages) {
  for (let j = 1; j < page.indices.length; j++) {
    if (page.indices[j] === page.indices[j - 1]) doubles++;
  }
}
const red = ink.pages.filter(page => page.page <= 55)
  .flatMap(page => (page.red_spans || []).map(span => ({
    page: page.page, start: span.start, length: span.length
  })));
const R = red.reduce((acc, span) => acc + span.length, 0);
const S = red.length;
assert.deepEqual([N, nonempty, T, doubles, R, S], [12956, 55, 12901, 86, 213, 16]);

// Precompute exact log-factorials once, avoiding numerical binomial overflow.
const logFact = new Float64Array(N + 2);
for (let i = 2; i < logFact.length; i++) {
  logFact[i] = logFact[i - 1] + Math.log(i);
}
/** @param {number} n @param {number} k */
const logChoose = (n, k) => logFact[n] - logFact[k] - logFact[n - k];
/** @param {number[]} logs */
function logSum(logs) {
  const peak = Math.max(...logs);
  return peak + Math.log(logs.reduce((sum, term) => sum + Math.exp(term - peak), 0));
}

// At most S binary red runs anywhere; no fixed red coverage count.
// Choose 2s ordered run boundaries among N+1 possible gap coordinates.
const arbitraryCoverageLogs = [0];
for (let s = 1; s <= S; s++) {
  arbitraryCoverageLogs.push(logChoose(N + 1, 2 * s));
}
const arbitraryCoverageBits = logSum(arbitraryCoverageLogs) / Math.LN2;

// Original red coverage R fixed but runs may split/merge up to S.
// Compose R colored symbols into s positive lengths, and place the
// runs among N-R noncolored symbols with at least one between runs.
const originalCoverageLogs = [];
for (let s = 1; s <= S; s++) {
  originalCoverageLogs.push(logChoose(R - 1, s - 1) +
    logChoose(N - R + 1, s));
}
const originalCoverageBits = logSum(originalCoverageLogs) / Math.LN2;

// Universal 29-symbol fixed-length output-space deficit for <=86 repeats.
const q = 1 / 29;
let logPk = T * Math.log1p(-q);
const repeatLogs = [];
for (let k = 0; k <= doubles; k++) {
  repeatLogs.push(logPk);
  logPk += Math.log(T - k) - Math.log(k + 1) + Math.log(q / (1 - q));
}
const requiredBits = -logSum(repeatLogs) / Math.LN2;
const freeShortfall = requiredBits - arbitraryCoverageBits;
const sourceShortfall = requiredBits - originalCoverageBits;
assert.ok(Math.abs(requiredBits - 325.450254) < 0.00001);
assert.ok(Math.abs(arbitraryCoverageBits - 319.44768432665) < 0.00001);
assert.ok(Math.abs(originalCoverageBits - 248.87414851929) < 0.00001);
assert.equal(Math.ceil(freeShortfall), 7);
assert.equal(Math.ceil(sourceShortfall), 77);
console.log(JSON.stringify({
  originalUnknownRuneCount: N,
  successorPositions: T,
  identicalSuccessors: doubles,
  originalRedRuneCount: R,
  annotatedRedSpanCount: S,
  universalAtMost86RepeatDeficitBits: requiredBits,
  redMaskBitsEvenWithArbitraryCoverageAtMost16Runs: arbitraryCoverageBits,
  extraBitsStillNeededIfRedCoverageFree: Math.ceil(freeShortfall),
  redMaskBitsWith213RedRunesAtMost16Runs: originalCoverageBits,
  extraBitsStillNeededIfRedCoverageFixed: Math.ceil(sourceShortfall),
  decision: "Red-rune span placement alone cannot supply the full universal sidecar"
}, null, 2));
