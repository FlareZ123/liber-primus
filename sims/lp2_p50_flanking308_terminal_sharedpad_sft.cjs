"use strict";
/**
 * Source-defined 308/308 same-pad necessary-condition gate.
 *
 * Two complete printed sentences straddling the original 256-cell table
 * have 138 + 170 = 308 GP runes. The complete terminal p54–55 chapter
 * independently has 232 + 76 = 308 GP runes.
 *
 * If these two streams use the same position-synchronous additive GP29 pad,
 * their pairwise modular differences equal the differences of genuine GP
 * plaintexts. No key search, anchor shift, plaintext fit, or table decoding
 * occurs here. The equal length is retrospective, not an authored selector.
 *
 * Run from repository root: node sims/lp2_p50_flanking308_terminal_sharedpad_sft.cjs
 * Windows 11 / Node 22, only built-in libraries and checked-in sources.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {toGematria} = require("./previous_cipher_sbox_invariant.cjs");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const book = JSON.parse(read("resources/liber-primus/lp2-corpus.json")).pages;

/** Exact printed whole-sentence spans, excluding the intervening p50 object. */
const before = book[48].indices.slice(-72).concat(book[49].indices);
const after = book[51].indices.concat(book[52].indices.slice(0, 78));
const tableFlanks = before.concat(after);
const terminal = book[54].indices.concat(book[55].indices);

assert.deepEqual([
  before.length, after.length, tableFlanks.length,
  book[54].indices.length, book[55].indices.length, terminal.length
], [138, 170, 308, 232, 76, 308]);

/**
 * Count the 29 modular differences for two equal-length GP29 sequences.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
function differenceHistogram(a, b) {
  assert.equal(a.length, b.length);
  const counts = Array(29).fill(0);
  for (let i = 0; i < a.length; i++) {
    counts[(a[i] - b[i] + 29) % 29]++;
  }
  return counts;
}

/**
 * Under independent genuine language streams with native-GP marginals p,
 * shared additive masking cancels and the difference D has:
 * P(D=d) = sum_{u=0}^{28} p(u) p(u-d mod 29).
 * @param {number[]} language
 * @returns {number[]}
 */
function languageDifferenceProbabilities(language) {
  const p = Array(29).fill(0);
  for (const glyph of language) p[glyph]++;
  for (let i = 0; i < 29; i++) p[i] /= language.length;
  const q = Array(29).fill(0);
  for (let d = 0; d < 29; d++) {
    for (let u = 0; u < 29; u++) {
      q[d] += p[u] * p[(u - d + 29) % 29];
    }
  }
  return q;
}

/**
 * Log-likelihood ratio for shared GP29 additive pad carrying two
 * independently sampled genuine texts versus flat difference noise.
 * @param {number[]} a
 * @param {number[]} b
 * @param {number[]} q
 * @returns {number}
 */
function llr(a, b, q) {
  const h = differenceHistogram(a, b);
  return h.reduce((sum, count, i) => sum + count * Math.log(29 * q[i]), 0);
}

/** @param {number} seed @returns {()=>number} */
function randomGenerator(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * Empirical true-shared-pad controls, using two nonoverlapping native-text
 * windows. The same additive pad cancels exactly for every pair.
 * @param {number[]} language
 * @param {number[]} q
 * @param {number} seed
 * @param {number} count
 * @returns {number[]}
 */
function positiveScores(language, q, seed, count) {
  const rng = randomGenerator(seed);
  const width = tableFlanks.length;
  const scores = [];
  while (scores.length < count) {
    const i = Math.floor(rng() * (language.length - width + 1));
    const j = Math.floor(rng() * (language.length - width + 1));
    if (Math.abs(i - j) < width) continue;

    const p1 = language.slice(i, i + width);
    const p2 = language.slice(j, j + width);
    // Genuine forward plant, distinct from simply evaluating native pairs.
    const c1 = [], c2 = [];
    for (let k = 0; k < width; k++) {
      const key = Math.floor(rng() * 29);
      c1.push((p1[k] + key) % 29);
      c2.push((p2[k] + key) % 29);
    }
    assert.deepEqual(differenceHistogram(c1, c2),
      differenceHistogram(p1, p2));
    scores.push(llr(c1, c2, q));
  }
  scores.sort((x, y) => x - y);
  return scores;
}

/**
 * Genuine unknown-book wrong-registration control: other nonoverlapping
 * 308-rune windows are paired without using plaintext.
 * @param {number[]} original
 * @param {number[]} q
 * @param {number} seed
 * @param {number} count
 * @returns {number[]}
 */
function unrelatedOriginalScores(original, q, seed, count) {
  const rng = randomGenerator(seed);
  const width = tableFlanks.length, scores = [];
  while (scores.length < count) {
    const i = Math.floor(rng() * (original.length - width + 1));
    const j = Math.floor(rng() * (original.length - width + 1));
    if (Math.abs(i - j) < width) continue;
    scores.push(llr(original.slice(i, i + width),
      original.slice(j, j + width), q));
  }
  return scores.sort((a, b) => a - b);
}

/**
 * @param {string} label
 * @param {number[]} gp
 * @param {number} seed
 * @returns {object}
 */
function study(label, gp, seed) {
  assert(gp.length > 1000);
  const q = languageDifferenceProbabilities(gp);
  const observed = llr(tableFlanks, terminal, q);
  const positives = positiveScores(gp, q, seed, 3000);
  const whole = book.slice(0, 56).flatMap(p => p.indices);
  assert.equal(whole.length, 12956);
  const nulls = unrelatedOriginalScores(whole, q, seed ^ 0x9e3779b9, 3000);
  const quant = (a, v) => a[Math.floor(v * (a.length - 1))];
  const atOrBelow = positives.filter(value => value <= observed).length;
  return {
    source:label, controlRunes:gp.length,
    nativeExpectedDifference0:q[0],
    originalLLR:observed,
    nativePositive:{draws:positives.length,atOrBelowOriginal:atOrBelow,
      q01:quant(positives,.01),median:quant(positives,.5),
      q99:quant(positives,.99),min:positives[0]},
    independentOriginalNull:{draws:nulls.length,
      median:quant(nulls,.5),
      fractionAtOrAboveObserved:nulls.filter(v => v >= observed).length/nulls.length}
  };
}

const lp1 = read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split(/\r?\n/)
  .filter(line => line.trim() && !/^\s*(#|\[)/.test(line))
  .join(" ");
const controls = [
  ["solved-LP1", toGematria(lp1), 0x33010001],
  ["Gibran", toGematria(read("resources/control/gibran_prophet_58585.txt")), 0x33010002],
  ["Shakespeare", toGematria(read("resources/control/shakespeare_first300k.txt")), 0x33010003]
];

const originalCounts = differenceHistogram(tableFlanks, terminal);
assert.equal(originalCounts.reduce((sum, n) => sum + n, 0), 308);
const studies = controls.map(([name, data, seed]) => study(name, data, seed));

console.log(JSON.stringify({
  claim:"Source-aligned direct GP29 same-additive-pad necessary-condition gate, not a plaintext solution",
  knownSourceSizes:{before:138,after:170,combined:308,terminal:308},
  originalDifferenceHistogram:originalCounts,
  originalEqualPairs:originalCounts[0],
  originalEqualPairRate:originalCounts[0]/308,
  studies
}, null, 2));
assert(studies.every(s => s.nativePositive.atOrBelowOriginal <= 30),
  "Retrospective shared-additive-pad model not consistently disfavored");
