"use strict";

/**
 * Independent architecture discriminator:
 * test whether within-word lag-five equalities co-localize with physical lines
 * carrying adjacent-equal ciphertext events.
 *
 * The null fixes, for every physical page, the exact count of same-line
 * within-word lag-five hits and the exact set of eligible positions. It then
 * distributes those page-local hits uniformly over eligible positions. The
 * overlap with the already-observed doublet-bearing line mask is evaluated by
 * an exact convolution of pagewise hypergeometric distributions.
 *
 * Run from repository root:
 *   node sims/lp2_doublet_lag5_line_overlap_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const transcription = fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-transcription.txt"), "utf8");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));

const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const parts = transcription.split(/^%$/m);
assert.equal(parts.length, 57);

const sourcePages = [];
for (let page = 0; page <= 55; page++) {
  if (page === 50) continue;
  sourcePages.push({
    page,
    body: parts[page < 50 ? page : page - 1]
  });
}

const runes = [];
const words = [];
let currentWord = null;

/** Finish the active canonical word. */
function finishWord() {
  if (!currentWord) return;
  currentWord.end = runes.length;
  words.push(currentWord);
  currentWord = null;
}

for (const { page, body } of sourcePages) {
  let line = 0;
  for (const ch of body) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!currentWord) currentWord = { start: runes.length, end: null };
      runes.push({ value, page, line });
    } else if (ch === "/") {
      line++;
    } else if (/\s/u.test(ch)) {
      // Physical wrapping whitespace does not end a canonical word.
    } else {
      finishWord();
    }
  }
}
finishWord();

assert.equal(runes.length, 12956);
assert.equal(words.length, 2896);

const wordOf = new Int32Array(runes.length);
words.forEach((word, wordIndex) => {
  for (let i = word.start; i < word.end; i++) wordOf[i] = wordIndex;
});

const doubletLines = new Set();
let doubletEvents = 0;
for (let i = 0; i < runes.length - 1; i++) {
  if (
    runes[i].page === runes[i + 1].page &&
    runes[i].value === runes[i + 1].value
  ) {
    doubletEvents++;
    doubletLines.add(`${runes[i].page}:${runes[i].line}`);
  }
}
assert.equal(doubletEvents, 86);
assert.equal(doubletLines.size, 83);

const opportunities = [];
for (let i = 5; i < runes.length; i++) {
  if (wordOf[i] !== wordOf[i - 5]) continue;
  if (
    runes[i].page !== runes[i - 5].page ||
    runes[i].line !== runes[i - 5].line
  ) continue;

  const lineKey = `${runes[i].page}:${runes[i].line}`;
  opportunities.push({
    page: runes[i].page,
    hit: runes[i].value === runes[i - 5].value,
    onDoubletLine: doubletLines.has(lineKey)
  });
}

const hits = opportunities.filter((item) => item.hit);
const doubletLineOpportunities = opportunities.filter((item) => item.onDoubletLine);
const overlap = opportunities.filter((item) => item.hit && item.onDoubletLine);

assert.equal(opportunities.length, 1645);
assert.equal(hits.length, 72);
assert.equal(doubletLineOpportunities.length, 218);
assert.equal(overlap.length, 8);

const byPage = new Map();
for (const item of opportunities) {
  if (!byPage.has(item.page)) byPage.set(item.page, []);
  byPage.get(item.page).push(item);
}

const pageRows = [...byPage.entries()].map(([page, items]) => ({
  page,
  n: items.length,
  m: items.filter((item) => item.hit).length,
  d: items.filter((item) => item.onDoubletLine).length,
  observed: items.filter((item) => item.hit && item.onDoubletLine).length
}));

/**
 * Binomial coefficient. Inputs here are at most the small page opportunity
 * counts, so IEEE-754 precision is ample for the probability calculation.
 *
 * @param {number} n
 * @param {number} k
 * @returns {number}
 */
function choose(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  const r = Math.min(k, n - k);
  let value = 1;
  for (let i = 1; i <= r; i++) {
    value *= (n - r + i) / i;
  }
  return value;
}

/**
 * Exact pagewise hypergeometric PMF for overlap k when m fixed hits are
 * placed uniformly among n eligible positions, d of which lie on doublet
 * lines.
 *
 * @param {number} n
 * @param {number} m
 * @param {number} d
 * @returns {number[]}
 */
function hypergeom(n, m, d) {
  const lo = Math.max(0, m - (n - d));
  const hi = Math.min(m, d);
  const pmf = new Array(hi + 1).fill(0);
  const denominator = choose(n, m);
  for (let k = lo; k <= hi; k++) {
    pmf[k] = choose(d, k) * choose(n - d, m - k) / denominator;
  }
  return pmf;
}

let distribution = [1];
for (const row of pageRows) {
  const local = hypergeom(row.n, row.m, row.d);
  const next = new Array(distribution.length + local.length - 1).fill(0);
  for (let i = 0; i < distribution.length; i++) {
    for (let k = 0; k < local.length; k++) {
      next[i + k] += distribution[i] * local[k];
    }
  }
  distribution = next;
}

const observedOverlap = overlap.length;
const mean = distribution.reduce((sum, probability, k) =>
  sum + probability * k, 0);
const variance = distribution.reduce((sum, probability, k) =>
  sum + probability * (k - mean) ** 2, 0);
const upperTail = distribution.slice(observedOverlap)
  .reduce((sum, probability) => sum + probability, 0);
const lowerTail = distribution.slice(0, observedOverlap + 1)
  .reduce((sum, probability) => sum + probability, 0);

assert.ok(Math.abs(distribution.reduce((a, b) => a + b, 0) - 1) < 1e-12);
assert.ok(Math.abs(mean - 10.320671302061763) < 1e-12);
assert.ok(Math.abs(Math.sqrt(variance) - 2.676729313073793) < 1e-12);
assert.ok(Math.abs(upperTail - 0.8554834684828885) < 1e-12);
assert.ok(Math.abs(lowerTail - 0.25308150388759976) < 1e-12);

const result = {
  canonical: {
    runes: runes.length,
    words: words.length
  },
  adjacentDoublets: {
    events: doubletEvents,
    bearingLines: doubletLines.size
  },
  sameLineWithinWordLag5: {
    opportunities: opportunities.length,
    hits: hits.length,
    hitRate: hits.length / opportunities.length
  },
  doubletBearingLines: {
    opportunities: doubletLineOpportunities.length,
    hits: overlap.length,
    hitRate: overlap.length / doubletLineOpportunities.length
  },
  otherLines: {
    opportunities: opportunities.length - doubletLineOpportunities.length,
    hits: hits.length - overlap.length,
    hitRate: (hits.length - overlap.length) /
      (opportunities.length - doubletLineOpportunities.length)
  },
  exactPageConditionedOverlap: {
    observed: observedOverlap,
    expected: mean,
    sd: Math.sqrt(variance),
    upperTail,
    lowerTail
  }
};

console.log(JSON.stringify(result, null, 2));
console.log("PASS: doublet-bearing lines do not enrich same-line within-word lag-five echoes.");
