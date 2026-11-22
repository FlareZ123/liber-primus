"use strict";

/**
 * Label-permutation-calibrated affine-ratio probe for all LP2 rune pages.
 *
 * For a triplet of distinct ciphertext runes x=C[i-2s], y=C[i-s],
 * z=C[i], the modular slope r=(z-x)/(y-x) mod 29 is in {2,...,28}.
 * A high count for a slope would identify a candidate finite-field
 * three-rune relation not implied by symbol equality alone.
 *
 * The null repeatedly permutes the 29 rune labels globally and records
 * the maximum chi-square across strides 1..8; it thereby preserves
 * page lengths, exact equality structure, and every ordered triplet.
 *
 * This is a statistical screen, not a decryption or cipher oracle.
 * Reproduce: node sims/affine_triplet_order.cjs
 */

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const MOD = 29;
const MAX_STEP = 8;
const NULL_ITERATIONS = 1000;
const SEED = 0x332ea01d;
const INV = new Uint8Array(MOD);

for (let d = 1; d < MOD; d++) {
  for (let n = 1; n < MOD; n++) {
    if ((d * n) % MOD === 1) INV[d] = n;
  }
  assert.notEqual(INV[d], 0);
}

/** @param {number} seed Unsigned 32-bit seed. @returns {() => number} */
function randomGenerator(seed) {
  let state = seed >>> 0;
  return function draw() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/** @returns {number[]} */
function identity() {
  return Array.from({ length: MOD }, (_, i) => i);
}

/** @param {number[]} permutation @param {() => number} random */
function shuffle(permutation, random) {
  for (let j = permutation.length - 1; j > 0; --j) {
    const k = Math.floor(random() * (j + 1));
    [permutation[j], permutation[k]] = [permutation[k], permutation[j]];
  }
}

/**
 * Build ordered triplet-count tensors separately for every stride.
 * @param {number[][]} pages Numeric indices with physical page splits.
 * @returns {Uint32Array[]}
 */
function collect(pages) {
  const tables = Array.from(
    { length: MAX_STEP }, () => new Uint32Array(MOD * MOD * MOD));
  for (const page of pages) {
    for (let step = 1; step <= MAX_STEP; step++) {
      const counts = tables[step - 1];
      for (let i = 2 * step; i < page.length; i++) {
        const x = page[i - 2 * step];
        const y = page[i - step];
        const z = page[i];
        if (x !== y && x !== z && y !== z) {
          counts[(x * MOD + y) * MOD + z]++;
        }
      }
    }
  }
  return tables;
}

/**
 * Chi-square across slopes 2..28 under one alphabet relabeling.
 * The six degenerate conditions are removed by excluding equal entries.
 * @param {Uint32Array} table
 * @param {number[]} permutation Maps canonical rune labels to trial labels.
 * @returns {{chi:number,n:number,counts:number[]}}
 */
function score(table, permutation) {
  const bins = new Float64Array(MOD);
  let n = 0;
  for (let x = 0; x < MOD; x++) {
    for (let y = 0; y < MOD; y++) {
      if (x === y) continue;
      const inverse = INV[
        (permutation[y] - permutation[x] + MOD) % MOD];
      const base = (x * MOD + y) * MOD;
      for (let z = 0; z < MOD; z++) {
        if (z === x || z === y) continue;
        const count = table[base + z];
        if (!count) continue;
        const slope = (
          (permutation[z] - permutation[x] + MOD) * inverse) % MOD;
        bins[slope] += count;
        n += count;
      }
    }
  }
  const expected = n / (MOD - 2);
  let chi = 0;
  for (let slope = 2; slope < MOD; slope++) {
    chi += (bins[slope] - expected) ** 2 / expected;
  }
  return { chi, n, counts: Array.from(bins) };
}

/**
 * Exact same search is applied to observed and null-label corpora.
 * @param {number[][]} pages
 * @param {number} draws
 * @param {number} seed
 * @returns {object}
 */
function probe(pages, draws = NULL_ITERATIONS, seed = SEED) {
  const tables = collect(pages);
  const labels = identity();
  const observed = tables.map(table => score(table, labels));
  const maxObserved = Math.max(...observed.map(item => item.chi));
  const random = randomGenerator(seed);
  const exceed = Array(MAX_STEP).fill(0);
  const maxima = [];

  for (let sample = 0; sample < draws; sample++) {
    const permutation = identity();
    shuffle(permutation, random);
    let max = 0;
    for (let step = 0; step < MAX_STEP; step++) {
      const result = score(tables[step], permutation);
      if (result.chi >= observed[step].chi) exceed[step]++;
      if (result.chi > max) max = result.chi;
    }
    maxima.push(max);
  }
  maxima.sort((a, b) => a - b);
  return {
    seed: "0x" + (seed >>> 0).toString(16),
    permutations: draws,
    strides: observed.map((item, i) => ({
      step: i + 1,
      distinctTriples: item.n,
      chiSquare: item.chi,
      unadjustedPermutationP: (exceed[i] + 1) / (draws + 1),
      mostFrequentSlopes: item.counts.map((count, slope) => ({
        slope, count })).slice(2).sort((a, b) => b.count - a.count).slice(0, 3)
    })),
    maximumObserved: maxObserved,
    familywiseP: (
      1 + maxima.filter(value => value >= maxObserved).length
    ) / (draws + 1),
    maxNullQuantiles: [0.5, 0.95, 0.99].map(q =>
      maxima[Math.floor(q * (draws - 1))])
  };
}

/**
 * A known, strong affine-recurrence signature. To test a detecting
 * instrument rather than a null alone, every third rune has a chance
 * to obey C[i]=C[i-2]+2(C[i-1]-C[i-2]) modulo 29.
 * @returns {number[][]}
 */
function plantedPages() {
  const random = randomGenerator(0x71ec3301);
  const pages = [];
  for (let pageIndex = 0; pageIndex < 55; pageIndex++) {
    const page = [];
    for (let i = 0; i < 240; i++) {
      let value = Math.floor(random() * MOD);
      if (i >= 2 && random() < 0.2) {
        value = (2 * page[i - 1] - page[i - 2] + MOD) % MOD;
      }
      if (i && value === page[i - 1]) {
        value = (value + 1 + Math.floor(random() * 28)) % MOD;
      }
      page.push(value);
    }
    pages.push(page);
  }
  return pages;
}

function main() {
  const corpus = JSON.parse(fs.readFileSync(path.join(
    __dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
  const pages = corpus.pages.filter(page =>
    page.page <= 55 && page.indices.length > 0).map(page => page.indices);
  assert.equal(pages.length, 55);
  assert.equal(pages.reduce((sum, page) => sum + page.length, 0), 12956);
  const observed = probe(pages);
  console.log("LP2", JSON.stringify(observed));

  const positive = probe(plantedPages(), 150, 0x33011209);
  console.log("CONTROL", JSON.stringify({
    seed: positive.seed,
    maxChiSquare: positive.maximumObserved,
    familywiseP: positive.familywiseP,
    leadingStep: positive.strides[0]
  }));
  assert.ok(positive.familywiseP < 0.05);
  assert.equal(positive.strides[0].mostFrequentSlopes[0].slope, 2);
}

if (require.main === module) main();
module.exports = { collect, score, probe, plantedPages };
