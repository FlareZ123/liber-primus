"use strict";

/**
 * Independent LP2 adjacent-doublet ordering gate.
 *
 * Reproduces the externally reported lag-1 autocorrelation of inter-doublet
 * gaps, then conditions it on source-native page boundaries, the exact p50
 * literal-leading-zero mask, and coarse 1000-rune event counts.
 *
 * Read-only SFT. No language scoring and no unknown plaintext claim.
 * Node.js 22 CommonJS:
 *   node sims/lp2_doublet_gap_nonstationarity_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));

const pages = corpus.pages.filter(page =>
  page.page <= 55 && page.indices.length > 0);
const stream = pages.flatMap(page => page.indices);
const tokens = grid.pages.flatMap(page => page.tokens);
const zeroMask = tokens.map(token => token[0] === "0");
assert.equal(stream.length, 12956);
assert.equal(pages.length, 55);
assert.equal(tokens.length, 256);
assert.equal(zeroMask.filter(Boolean).length, 60);

/** @param {number[]} positions @returns {number} */
function gapAutocorrelation(positions) {
  const gaps = [];
  for (let i = 1; i < positions.length; i++) {
    gaps.push(positions[i] - positions[i - 1]);
  }
  const n = gaps.length - 1;
  let leftMean = 0;
  let rightMean = 0;
  for (let i = 0; i < n; i++) {
    leftMean += gaps[i];
    rightMean += gaps[i + 1];
  }
  leftMean /= n;
  rightMean /= n;
  let cross = 0;
  let leftSq = 0;
  let rightSq = 0;
  for (let i = 0; i < n; i++) {
    const left = gaps[i] - leftMean;
    const right = gaps[i + 1] - rightMean;
    cross += left * right;
    leftSq += left * left;
    rightSq += right * right;
  }
  return cross / Math.sqrt(leftSq * rightSq);
}

/**
 * @param {number[]} left
 * @param {number[]} right
 * @returns {number}
 */
function correlation(left, right) {
  assert.equal(left.length, right.length);
  const n = left.length;
  const leftMean = left.reduce((sum, value) => sum + value, 0) / n;
  const rightMean = right.reduce((sum, value) => sum + value, 0) / n;
  let cross = 0;
  let leftSq = 0;
  let rightSq = 0;
  for (let i = 0; i < n; i++) {
    const a = left[i] - leftMean;
    const b = right[i] - rightMean;
    cross += a * b;
    leftSq += a * a;
    rightSq += b * b;
  }
  return cross / Math.sqrt(leftSq * rightSq);
}

/** @param {number} seed @returns {() => number} */
function makeRng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * Small-k sampling without replacement. The xorshift modulo reduction has
 * negligible (<3e-6 relative) bias at these pool sizes and is frozen only to
 * make this Monte Carlo exactly repeatable.
 * @param {number[]} pool
 * @param {number} count
 * @param {() => number} random
 * @returns {number[]}
 */
function sample(pool, count, random) {
  const chosen = new Set();
  while (chosen.size < count) chosen.add(random() % pool.length);
  return [...chosen].map(index => pool[index]);
}

/**
 * @typedef {{pool:number[], count:number}} Stratum
 */

/**
 * @param {Stratum[]} strata
 * @param {number} seed
 * @param {number} trials
 * @param {number} observed
 */
function conditionalNull(strata, seed, trials, observed) {
  const random = makeRng(seed);
  const values = new Array(trials);
  let sum = 0;
  let squared = 0;
  let atLeastObserved = 0;
  for (let trial = 0; trial < trials; trial++) {
    const positions = [];
    for (const stratum of strata) {
      positions.push(...sample(stratum.pool, stratum.count, random));
    }
    positions.sort((a, b) => a - b);
    const value = gapAutocorrelation(positions);
    values[trial] = value;
    sum += value;
    squared += value * value;
    if (value >= observed) atLeastObserved++;
  }
  values.sort((a, b) => a - b);
  const mean = sum / trials;
  return {
    seed: "0x" + seed.toString(16),
    trials,
    mean,
    sd: Math.sqrt(squared / trials - mean * mean),
    q95: values[Math.floor(0.95 * trials)],
    q99: values[Math.floor(0.99 * trials)],
    q999: values[Math.floor(0.999 * trials)],
    atLeastObserved,
    plusOneTail: (atLeastObserved + 1) / (trials + 1)
  };
}

const doublets = [];
for (let i = 1; i < stream.length; i++) {
  if (stream[i] === stream[i - 1]) doublets.push(i);
}
assert.equal(doublets.length, 86);
const observed = gapAutocorrelation(doublets);
assert(Math.abs(observed - 0.38001968924100965) < 1e-15);

const pageStrata = [];
const pageMaskStrata = [];
const withinPageLeft = [];
const withinPageRight = [];
let offset = 0;
let maskedEvents = 0;
let unmaskedEvents = 0;
for (const page of pages) {
  const all = [];
  const masked = [];
  const unmasked = [];
  const localEvents = [];
  let pageEventCount = 0;
  let pageMaskedCount = 0;
  let pageUnmaskedCount = 0;
  for (let local = 1; local < page.indices.length; local++) {
    const global = offset + local;
    const isMasked = zeroMask[(global - 1) & 255];
    all.push(global);
    (isMasked ? masked : unmasked).push(global);
    if (page.indices[local] === page.indices[local - 1]) {
      localEvents.push(local);
      pageEventCount++;
      if (isMasked) {
        pageMaskedCount++;
        maskedEvents++;
      } else {
        pageUnmaskedCount++;
        unmaskedEvents++;
      }
    }
  }
  if (pageEventCount) pageStrata.push({pool: all, count: pageEventCount});
  if (pageMaskedCount) pageMaskStrata.push({pool: masked, count: pageMaskedCount});
  if (pageUnmaskedCount) {
    pageMaskStrata.push({pool: unmasked, count: pageUnmaskedCount});
  }
  for (let i = 0; i + 2 < localEvents.length; i++) {
    withinPageLeft.push(localEvents[i + 1] - localEvents[i]);
    withinPageRight.push(localEvents[i + 2] - localEvents[i + 1]);
  }
  offset += page.indices.length;
}
assert.equal(offset, stream.length);
assert.deepEqual([maskedEvents, unmaskedEvents], [33, 53]);
assert.equal(withinPageLeft.length, 21);
const withinPageGapCorrelation = correlation(withinPageLeft, withinPageRight);
assert(Math.abs(withinPageGapCorrelation - (-0.04937177711923867)) < 1e-15);

const blockStrata = [];
const blockCounts = [];
for (let start = 1; start < stream.length; start += 1000) {
  const end = Math.min(stream.length, start + 1000);
  const pool = [];
  let count = 0;
  for (let i = start; i < end; i++) {
    pool.push(i);
    if (stream[i] === stream[i - 1]) count++;
  }
  blockCounts.push(count);
  if (count) blockStrata.push({pool, count});
}
assert.deepEqual(blockCounts, [8, 3, 7, 2, 6, 9, 10, 8, 11, 2, 9, 6, 5]);

const maskPools = [[], []];
for (let i = 1; i < stream.length; i++) {
  maskPools[zeroMask[(i - 1) & 255] ? 0 : 1].push(i);
}
const maskStrata = [
  {pool: maskPools[0], count: maskedEvents},
  {pool: maskPools[1], count: unmaskedEvents}
];

const trials = 100000;
const controls = {
  exactPageCounts: conditionalNull(
    pageStrata, 0x33010001, trials, observed),
  exactThousandRuneBlockCounts: conditionalNull(
    blockStrata, 0x33010002, trials, observed),
  exactLeadingZeroClassCounts: conditionalNull(
    maskStrata, 0x33010003, trials, observed),
  exactPageAndLeadingZeroCounts: conditionalNull(
    pageMaskStrata, 0x33010004, trials, observed)
};

assert.deepEqual(Object.values(controls).map(x => x.atLeastObserved),
  [518, 57, 38, 523]);

console.log(JSON.stringify({
  status: "PASS",
  sourceRunes: stream.length,
  doubletSites: doublets.length,
  observedGapLag1Correlation: observed,
  withinPageConsecutiveGapPairs: withinPageLeft.length,
  withinPageGapLag1Correlation: withinPageGapCorrelation,
  p50LeadingZeroCells: zeroMask.filter(Boolean).length,
  doubletsByLeadingZeroClass: [maskedEvents, unmaskedEvents],
  thousandRuneBlockCounts: blockCounts,
  controls,
  interpretation:
    "global doublet ordering survives page/block/p50-mask exposure controls; " +
    "positive correlation is absent within individual pages",
  unknownPlaintextOrKeyRecovered: false
}, null, 2));
