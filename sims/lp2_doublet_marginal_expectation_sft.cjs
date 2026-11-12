#!/usr/bin/env node
"use strict";

// Test whether the LP2 block-scale doublet-rate anomaly is explained by
// changes in the 29-symbol marginal distribution alone.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const raw = fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-transcription.txt"), "utf8")
  .replace(/\r/g, "").split("%").slice(0, 55).join("%");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const sequence = [];
for (const ch of raw) if (runeIndex.has(ch)) sequence.push(runeIndex.get(ch));
assert.equal(sequence.length, 12956, "canonical original LP2 rune count");

const blocks = [];
for (let start = 0; start < sequence.length; start += 1000) {
  const end = Math.min(sequence.length, start + 1000);
  const n = end - start;
  const counts = Array(29).fill(0);
  let observed = 0;
  for (let i = start; i < end; i++) {
    counts[sequence[i]]++;
    if (i + 1 < end && sequence[i] === sequence[i + 1]) observed++;
  }

  // For a uniform random permutation of a block with fixed symbol counts,
  // E[adjacent equal pairs] = sum_a n_a(n_a-1) / N.
  const expected = counts.reduce((sum, c) => sum + c * (c - 1), 0) / n;
  const pEqual = counts.reduce((sum, c) => sum + (c / n) ** 2, 0);
  blocks.push({
    block: blocks.length + 1,
    start,
    end,
    n,
    observedDoublets: observed,
    expectedFromMarginals: Number(expected.toFixed(3)),
    marginalEqualProbability: Number(pEqual.toFixed(5)),
    observedOverExpected: Number((observed / expected).toFixed(3))
  });
}

const expectedObserved = [8, 3, 7, 2, 6, 9, 10, 8, 11, 2, 9, 6, 5];
assert.deepEqual(blocks.map((b) => b.observedDoublets), expectedObserved,
  "fixed 1000-rune block counts reproduce the external Round44 profile");
assert.equal(blocks.reduce((s, b) => s + b.observedDoublets, 0), 86, "86 total doublets");

const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
const pearson = (xs, ys) => {
  const mx = mean(xs), my = mean(ys);
  let xy = 0, xx = 0, yy = 0;
  for (let i = 0; i < xs.length; i++) {
    xy += (xs[i] - mx) * (ys[i] - my);
    xx += (xs[i] - mx) ** 2;
    yy += (ys[i] - my) ** 2;
  }
  return xy / Math.sqrt(xx * yy);
};
const observed = blocks.map((b) => b.observedDoublets);
const expected = blocks.map((b) => b.expectedFromMarginals);
const ratio = blocks.map((b) => b.observedOverExpected);
const summary = {
  runeCount: sequence.length,
  blockSize: 1000,
  observedDoublets: observed,
  expectedFromBlockMarginals: expected,
  marginalEqualProbability: blocks.map((b) => b.marginalEqualProbability),
  observedOverExpected: ratio,
  expectedRange: [Math.min(...expected), Math.max(...expected)],
  observedRange: [Math.min(...observed), Math.max(...observed)],
  ratioRange: [Math.min(...ratio), Math.max(...ratio)],
  observedExpectedPearson: Number(pearson(observed, expected).toFixed(3)),
  blocks
};
console.log(JSON.stringify(summary, null, 2));
