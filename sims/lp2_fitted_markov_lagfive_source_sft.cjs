"use strict";

/**
 * Fitted first-order Markov controls for the original LP2 five-back echoes.
 *
 * Read-only standalone test. On Windows 11, use Node.js 22 or newer.
 * Input corpus and word parser are the repository's exact original-source
 * derived resources. All pseudorandom draws use reproducible xorshift32.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
  "utf8"
));
const pages = corpus.pages.filter((page) => page.page <= 55 &&
  page.indices.length > 0);
const symbols = pages.flatMap((page) => page.indices);
const parsed = parseSharedCorpus();
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const spans = [];

let cursor = 0;
for (const word of parsed.words) {
  const wordIndices = Array.from(word.runes, (rune) => {
    assert.ok(runeIndex.has(rune), `Unknown rune: ${rune}`);
    return runeIndex.get(rune);
  });
  assert.deepEqual(symbols.slice(cursor, cursor + word.length),
    wordIndices, `Canonical transcription mismatch in word ${spans.length + 1}`);
  spans.push([cursor, cursor + word.length]);
  cursor += word.length;
}
assert.equal(pages.length, 55);
assert.equal(symbols.length, 12956);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.crossPageWords, 32);
assert.equal(cursor, 12956);

/**
 * Return [within-word lag-five equals, S-to-S echoes, adjacent echo pairs].
 * S has authentic GP29 index 15. The S-specific statistic was historically
 * selected after looking at the corpus and is exploratory, not an
 * independent preregistered discovery.
 * @param {ArrayLike<number>} values
 * @returns {[number, number, number]}
 */
function score(values) {
  let total = 0;
  let sToS = 0;
  let paired = 0;
  for (const [start, end] of spans) {
    for (let i = start + 5; i < end; i++) {
      if (values[i] === values[i - 5]) {
        total++;
        if (values[i] === 15) sToS++;
        if (i > start + 5 && values[i - 1] === values[i - 6]) paired++;
      }
    }
  }
  return [total, sToS, paired];
}

/**
 * Count every observed transition within each physical page.
 * @param {number[]} source
 * @returns {number[][]}
 */
function transitionCounts(source) {
  const counts = Array.from({ length: 29 }, () => Array(29).fill(0));
  for (let i = 1; i < source.length; i++)
    counts[source[i - 1]][source[i]]++;
  return counts;
}

/**
 * Convert each empirical transition row to a CDF. A source state with no
 * outgoing transitions uses its book-wide row to avoid a fabricated symbol.
 * @param {number[][]} counts
 * @param {Float64Array[]} fallback
 * @returns {Float64Array[]}
 */
function cumulativeRows(counts, fallback) {
  return counts.map((row, symbol) => {
    const count = row.reduce((a, b) => a + b, 0);
    if (count === 0) return fallback[symbol];
    const cdf = new Float64Array(29);
    let sum = 0;
    for (let i = 0; i < 29; i++) {
      sum += row[i] / count;
      cdf[i] = sum;
    }
    cdf[28] = 1;
    return cdf;
  });
}

const original = score(symbols);
assert.deepEqual(original, [104, 11, 9]);

const perPageCounts = pages.map((page) => transitionCounts(page.indices));
const pooledCounts = Array.from({ length: 29 }, () => Array(29).fill(0));
for (const matrix of perPageCounts)
  for (let i = 0; i < 29; i++)
    for (let j = 0; j < 29; j++)
      pooledCounts[i][j] += matrix[i][j];

const globalRows = cumulativeRows(pooledCounts, []);
const pageRows = perPageCounts.map((matrix) =>
  cumulativeRows(matrix, globalRows)
);

/**
 * Deterministic unsigned 32-bit xorshift generator.
 * @param {number} seed
 * @returns {() => number} Uniform double in [0,1).
 */
function generator(seed) {
  let state = seed | 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * @param {Float64Array} cdf
 * @param {number} probability
 * @returns {number}
 */
function sampleRow(cdf, probability) {
  let low = 0;
  let high = 28;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (probability < cdf[mid]) high = mid;
    else low = mid + 1;
  }
  return low;
}

/**
 * Generate a new page-length-matched sequence and score source word spans.
 * Every simulation fixes the actual first rune of each physical page.
 * All other symbols are sampled from the fitted first-order output law.
 * @param {"global"|"page"} mode
 * @param {number} seed
 * @param {number} simulations
 * @returns {object}
 */
function run(mode, seed, simulations) {
  const random = generator(seed);
  const candidate = new Uint8Array(symbols.length);
  const sums = [0, 0, 0];
  const sumsSquared = [0, 0, 0];
  const countsAbove = [0, 0, 0];
  const maxima = [0, 0, 0];

  for (let trial = 0; trial < simulations; trial++) {
    let offset = 0;
    for (let p = 0; p < pages.length; p++) {
      const source = pages[p].indices;
      const model = mode === "page" ? pageRows[p] : globalRows;
      candidate[offset] = source[0];
      for (let j = 1; j < source.length; j++)
        candidate[offset + j] = sampleRow(
          model[candidate[offset + j - 1]], random());
      offset += source.length;
    }
    assert.equal(offset, symbols.length);
    const observed = score(candidate);
    for (let k = 0; k < 3; k++) {
      sums[k] += observed[k];
      sumsSquared[k] += observed[k] * observed[k];
      if (observed[k] >= original[k]) countsAbove[k]++;
      if (observed[k] > maxima[k]) maxima[k] = observed[k];
    }
  }
  const means = sums.map((n) => n / simulations);
  return {
    model: mode,
    seed: `0x${(seed >>> 0).toString(16)}`,
    simulations,
    means,
    sd: sumsSquared.map((n, k) =>
      Math.sqrt(n / simulations - means[k] * means[k])),
    countAtLeastOriginal: countsAbove,
    upperTailPlusOne: countsAbove.map((n) => (n + 1) / (simulations + 1)),
    maxima
  };
}

const global = run("global", 0x243f6a88, 10000);
const page = run("page", 0x6a09e667, 10000);
console.log(JSON.stringify({
  source: {
    physicalRunePages: pages.length,
    runes: symbols.length,
    words: parsed.words.length,
    carriedWords: parsed.crossPageWords,
    lagFiveOpportunities: spans.reduce((sum, [a, b]) =>
      sum + Math.max(0, b - a - 5), 0),
    observed: original
  },
  global,
  page
}, null, 2));
console.log("PASS: source alignment, 10000 seeded global and page Markov controls");
