"use strict";

/**
 * SFT: evaluate a stationary first-order GP29 transition decoder on authentic
 * LP2 ciphertext. The baseline knows the rate of repeated adjacent glyphs.
 * All comparisons use five fixed disjoint folds of physical pages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const SOURCE = path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json");
const ALPHAS = [100, 300, 841];
const corpus = JSON.parse(fs.readFileSync(SOURCE, "utf8"));
const pages = corpus.pages
  .filter((page) => page.page < 56 && page.indices.length > 1)
  .map((page) => ({page: page.page, c: page.indices}));

let randomState = 3301;
/** @returns {number} Reproducible [0,1) variate from xorshift32. */
function random() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return (randomState >>> 0) / 4294967296;
}

/** @param {Array<{page:number,c:number[]}>} data */
function counts(data) {
  const pairs = new Float64Array(29 * 29);
  const next = new Float64Array(29);
  let n = 0;
  let equal = 0;
  for (const page of data) {
    for (let i = 1; i < page.c.length; i++) {
      const previous = page.c[i - 1];
      const current = page.c[i];
      pairs[previous * 29 + current]++;
      next[current]++;
      equal += Number(previous === current);
      n++;
    }
  }
  return {pairs, next, n, equal};
}

/**
 * Predict withheld page-fold transitions from the other four folds.
 * Model: 29x29 stationary Markov matrix with a Dirichlet prior centered
 * at a no-repeat-aware, unigram-conditioned independence null.
 * @param {Array<{page:number,c:number[]}>} data
 * @param {number} alpha
 * @returns {number} Cross-validated model gain in nats per transition.
 */
function gain(data, alpha) {
  let improvement = 0;
  let heldCount = 0;
  for (let fold = 0; fold < 5; fold++) {
    const training = counts(data.filter((page) => page.page % 5 !== fold));
    const held = counts(data.filter((page) => page.page % 5 === fold));
    const marginal = Array.from(training.next,
      (value) => (value + 0.5) / (training.n + 14.5));
    const equalRate = (training.equal + 0.5) / (training.n + 1);
    for (let previous = 0; previous < 29; previous++) {
      let nPrevious = 0;
      for (let current = 0; current < 29; current++) {
        nPrevious += training.pairs[previous * 29 + current];
      }
      for (let current = 0; current < 29; current++) {
        const q = previous === current
          ? equalRate
          : (1 - equalRate) * marginal[current] / (1 - marginal[previous]);
        const learned = (training.pairs[previous * 29 + current] + alpha * q) /
          (nPrevious + alpha);
        improvement += held.pairs[previous * 29 + current] *
          Math.log(learned / q);
      }
    }
    heldCount += held.n;
  }
  return improvement / heldCount;
}

/**
 * Null retaining every page's glyph inventory and exact equality pattern:
 * independently apply a uniformly shuffled GP29 alphabet to each page.
 * @param {Array<{page:number,c:number[]}>} data
 */
function perPageRelabel(data) {
  return data.map((page) => {
    const permutation = Array.from({length: 29}, (_, i) => i);
    for (let i = 28; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
    }
    return {page: page.page, c: page.c.map((value) => permutation[value])};
  });
}

/**
 * Positive plant: same page lengths and EXACT original immediate-repeat
 * positions; the remaining transitions have fourfold preference for
 * residue +1 relative to all other nonzero GP29 differences.
 * @param {Array<{page:number,c:number[]}>} data
 */
function plant(data) {
  return data.map((page) => {
    const c = [page.c[0]];
    for (let i = 1; i < page.c.length; i++) {
      if (page.c[i] === page.c[i - 1]) {
        c.push(c[i - 1]);
      } else {
        const draw = Math.floor(random() * 31);
        const difference = draw < 4 ? 1 : draw - 2;
        c.push((c[i - 1] + difference) % 29);
      }
    }
    return {page: page.page, c};
  });
}

/** @param {number[][]} samples @param {number[]} original */
function describe(samples, original) {
  return ALPHAS.map((alpha, index) => {
    const values = samples.map((row) => row[index]).sort((a, b) => a - b);
    const atLeastOriginal = values.filter((v) => v >= original[index]).length;
    return {
      alpha,
      min: values[0],
      median: values[Math.floor(values.length / 2)],
      max: values[values.length - 1],
      atLeastOriginal,
      plusOneTail: (atLeastOriginal + 1) / (values.length + 1),
    };
  });
}

const originalCounts = counts(pages);
assert.equal(pages.length, 55);
assert.equal(originalCounts.n, 12901);
assert.equal(originalCounts.equal, 86);
const original = ALPHAS.map((alpha) => gain(pages, alpha));
const relabeled = [];
for (let i = 0; i < 128; i++) {
  const shuffled = perPageRelabel(pages);
  relabeled.push(ALPHAS.map((alpha) => gain(shuffled, alpha)));
}
const planted = [];
for (let i = 0; i < 8; i++) {
  const generated = plant(pages);
  const generatedCounts = counts(generated);
  assert.equal(generatedCounts.equal, originalCounts.equal);
  planted.push(ALPHAS.map((alpha) => gain(generated, alpha)));
}
assert(original.every((g) => g < 0));
assert(planted.every((trial) => trial.every((g) => g > 0.03)));
console.log(JSON.stringify({
  source: "resources/liber-primus/lp2-corpus.json",
  fold: "physical LP2 page index modulo 5",
  totalTransitions: originalCounts.n,
  originalRepeatedTransitions: originalCounts.equal,
  original: ALPHAS.map((alpha, i) => ({alpha, gain: original[i]})),
  independentPageRelabelNull: describe(relabeled, original),
  matchedRepeatPatternPositivePlants: describe(planted, original),
}, null, 2));
