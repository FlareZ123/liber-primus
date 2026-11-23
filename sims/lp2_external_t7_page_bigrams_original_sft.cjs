'use strict';

/**
 * Source-native replication of independent Round44 T7 LP2 doublet-gap result.
 * Explicitly conditions on the 2014 original page bigram tables and page order;
 * demonstrates how the apparent nonstationary residue changes when legitimate
 * original first-order structure is retained. No decipherment is claimed.
 *
 * Windows Node.js 22:
 *   node sims/lp2_external_t7_page_bigrams_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const originalPages = corpus.pages
  .filter(page => page.page <= 55 && page.indices.length > 0)
  .map(page => page.indices);
assert.equal(originalPages.length, 55);
assert.equal(originalPages.reduce((n, p) => n + p.length, 0), 12956);
assert.equal(corpus.pages.find(p => p.page === 56).runic_count, 85);
assert.equal(corpus.pages.find(p => p.page === 57).runic_count, 95);

/** @param {number[][]} pages @returns {number[]} */
function sites(pages) {
  const out = [];
  let origin = 0;
  for (const p of pages) {
    for (let i = 1; i < p.length; i++) {
      if (p[i] === p[i - 1]) out.push(origin + i - 1);
    }
    origin += p.length;
  }
  return out;
}

/**
 * Pearson correlation of consecutive successive doublet gaps.
 * @param {number[]} positions
 */
function gapAc1(positions) {
  const gaps = [];
  for (let i = 1; i < positions.length; i++) {
    gaps.push(positions[i] - positions[i - 1]);
  }
  const n = gaps.length - 1;
  assert.ok(n > 3);
  let meanX = 0, meanY = 0;
  for (let i = 0; i < n; i++) {
    meanX += gaps[i];
    meanY += gaps[i + 1];
  }
  meanX /= n;
  meanY /= n;
  let numerator = 0, xx = 0, yy = 0;
  for (let i = 0; i < n; i++) {
    const x = gaps[i] - meanX;
    const y = gaps[i + 1] - meanY;
    numerator += x * y;
    xx += x * x;
    yy += y * y;
  }
  return numerator / Math.sqrt(xx * yy);
}

/** Simple reproducible PRNG; no cryptographic use. */
class Rng {
  /** @param {number} seed */
  constructor(seed) { this.state = seed >>> 0; }
  next() {
    this.state ^= this.state << 13;
    this.state ^= this.state >>> 17;
    this.state ^= this.state << 5;
    return this.state >>> 0;
  }
  /** @param {number} exclusive */
  below(exclusive) { return this.next() % exclusive; }
}

/** @param {number[]} a @param {Rng} rng */
function shuffled(a, rng) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = rng.below(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Exact-inventory directed Eulerian shuffle of a genuine source page.
 * Preserves every directed GP29 bigram, 29x29 table, start/end rune,
 * page rune length, and the number of doublets on that physical page.
 * Hierholzer randomized-outgoing-edge order is not asserted uniform over
 * all possible Eulerian trails.
 * @param {number[]} original
 * @param {Rng} rng
 */
function reshufflePage(original, rng) {
  const outgoing = Array.from({length: 29}, () => []);
  for (let i = 1; i < original.length; i++) {
    outgoing[original[i - 1]].push(original[i]);
  }
  for (const row of outgoing) shuffled(row, rng);
  const stack = [original[0]], reversed = [];
  while (stack.length) {
    const u = stack[stack.length - 1];
    const row = outgoing[u];
    if (row.length) stack.push(row.pop());
    else reversed.push(stack.pop());
  }
  reversed.reverse();
  assert.equal(reversed.length, original.length);
  assert.equal(reversed[0], original[0]);
  assert.equal(reversed[reversed.length - 1], original[original.length - 1]);
  return reversed;
}

/** @param {number[]} p */
function edgeHistogram(p) {
  const bins = new Array(841).fill(0);
  for (let i = 1; i < p.length; i++) bins[29 * p[i - 1] + p[i]]++;
  return bins;
}
const originals = sites(originalPages);
assert.equal(originals.length, 86);
const observed = gapAc1(originals);
assert.ok(Math.abs(observed - 0.38001968924100965) < 1e-12);
const perPageCounts = originalPages.map(p => sites([p]).length);
assert.equal(perPageCounts.reduce((a, b) => a + b, 0), 86);
const rng = new Rng(0x330142);
const independent = originalPages.map(p => reshufflePage(p, rng));
for (let k = 0; k < originalPages.length; k++) {
  assert.deepEqual(edgeHistogram(independent[k]), edgeHistogram(originalPages[k]));
}
assert.deepEqual(sites(independent).length, originals.length);

const N_EULER = 20000;
let eulerGE = 0, eulerSum = 0, eulerSumSquares = 0;
for (let trial = 0; trial < N_EULER; trial++) {
  const trialPages = originalPages.map(p => reshufflePage(p, rng));
  const sitePositions = sites(trialPages);
  assert.equal(sitePositions.length, originals.length);
  const statistic = gapAc1(sitePositions);
  eulerGE += statistic >= observed ? 1 : 0;
  eulerSum += statistic;
  eulerSumSquares += statistic * statistic;
}
const eulerP = (eulerGE + 1) / (N_EULER + 1);
const eulerMu = eulerSum / N_EULER;
const eulerSd = Math.sqrt(eulerSumSquares / N_EULER - eulerMu ** 2);

// Page-order null: shuffle all 55 physically complete page blocks, keeping
// each block's original internal rune stream and all within-page doublets.
// The original has zero across-page repeated runes, so count only *within*
// each physical page in both original and this null, without injecting new
// artificial joins between the shuffled endpoints.
const nativePageSiteOffsets = originalPages.map(p => sites([p]));
const order = originalPages.map((_, i) => i);
const pageRng = new Rng(0x20261123);
const N_ORDER = 50000;
let orderGE = 0, orderSum = 0, orderSumSquares = 0;
for (let trial = 0; trial < N_ORDER; trial++) {
  shuffled(order, pageRng);
  const positions = [];
  let origin = 0;
  for (const i of order) {
    for (const local of nativePageSiteOffsets[i]) {
      positions.push(origin + local);
    }
    origin += originalPages[i].length;
  }
  assert.equal(positions.length, 86);
  const statistic = gapAc1(positions);
  orderGE += statistic >= observed ? 1 : 0;
  orderSum += statistic;
  orderSumSquares += statistic * statistic;
}
const orderP = (orderGE + 1) / (N_ORDER + 1);
const orderMu = orderSum / N_ORDER;
const orderSd = Math.sqrt(orderSumSquares / N_ORDER - orderMu ** 2);
console.log(JSON.stringify({
  source: 'original GP29 p0..55; solved p56+p57 as count controls',
  runes: originalPages.reduce((n, p) => n + p.length, 0),
  pages: originalPages.length,
  siteCount: originals.length,
  observedPearsonGapAc1: observed,
  frozenPageBigrams: {
    samples: N_EULER, exceedances: eulerGE,
    upperTailP: eulerP, mean: eulerMu, sd: eulerSd
  },
  physicalPageOrder: {
    samples: N_ORDER, exceedances: orderGE,
    upperTailP: orderP, mean: orderMu, sd: orderSd
  }
}, null, 2));
assert.ok(eulerP > 0.002 && eulerP < 0.02);
assert.ok(orderP > 0.0005 && orderP < 0.01);
console.log('PASS: exact source bigrams, page-order null, and native controls.');
console.log('No source-selected LP2 cipher state, key or unknown plaintext.');
