"use strict";

/**
 * Source-only word-separator test for LP2 adjacent identical runes.
 *
 * Separates adjacent GP rune pairs that straddle a printed word delimiter
 * (- . & $ §) from adjacent runes within the same canonical printed word.
 * Line wrapping (/ whitespace) and physical page transitions are handled
 * exactly as in sims/lp2_word_pages.cjs; page transitions are not pairs.
 *
 * The null is a uniform independent permutation of each physical page's
 * original rune multiset. Expected values and variances are EXACT under
 * that page-conditioned randomization, including covariance when two
 * adjacent pair tests share one rune. The normal z/tails are diagnostics,
 * not an asserted mechanism or plaintext discovery.
 *
 * Run from repository root: node sims/lp2_word_boundary_doublet_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");

/**
 * @typedef {{runes:string[],boundary:boolean[]}} SourcePage
 * @param {string} raw
 * @param {Set<string>} alphabet
 * @returns {SourcePage[]}
 */
function parseSource(raw, alphabet) {
  const pages = Array.from({length: 55}, () => ({runes: [], boundary: []}));
  let p = 0;
  let lastPage = -1;
  let separator = "";
  for (const c of raw) {
    if (alphabet.has(c)) {
      if (p < pages.length) {
        const current = pages[p];
        if (lastPage === p) current.boundary.push(/[-.&$§]/u.test(separator));
        current.runes.push(c);
      }
      lastPage = p;
      separator = "";
    } else {
      separator += c;
      if (c === "%") p++;
    }
  }
  return pages;
}

/**
 * @param {number} n
 * @param {number} r
 * @returns {number}
 */
function falling(n, r) {
  let out = 1;
  for (let k = 0; k < r; k++) out *= n - k;
  return out;
}

/**
 * Exact expected equal-rune indicators for 2, 3, 4 distinct physical
 * slots under independent page-multiset permutation.
 * @param {string[]} runes
 * @returns {{p2:number,p3:number,p22:number}}
 */
function moments(runes) {
  const frequencies = new Map();
  for (const x of runes) frequencies.set(x, (frequencies.get(x) || 0) + 1);
  const f = [...frequencies.values()];
  const f2 = f.map(n => falling(n, 2));
  const sum2 = f2.reduce((s, n) => s + n, 0);
  const sum3 = f.reduce((s, n) => s + falling(n, 3), 0);
  const sum4 = f.reduce((s, n) => s + falling(n, 4), 0);
  // Four slots: two equal pairs; either same rune or different runes.
  const twoPairs = sum4 + sum2 * sum2 - f2.reduce((s, n) => s + n * n, 0);
  return {
    p2: sum2 / falling(runes.length, 2),
    p3: sum3 / falling(runes.length, 3),
    p22: twoPairs / falling(runes.length, 4)
  };
}

/**
 * Weighted sum of equal-adjacency indicators. Accounting separately for
 * pairs sharing a vertex and pairs with four distinct vertices yields
 * the exact page-conditioned permutation variance.
 * @param {number[]} weights
 * @param {{p2:number,p3:number,p22:number}} pm
 * @returns {{expected:number,variance:number}}
 */
function weightedMoments(weights, {p2, p3, p22}) {
  const sum = weights.reduce((s, x) => s + x, 0);
  const squares = weights.reduce((s, x) => s + x * x, 0);
  const overlapping = weights.slice(1).reduce((s, x, i) => s + x * weights[i], 0);
  const disjoint = (sum * sum - squares) / 2 - overlapping;
  return {
    expected: sum * p2,
    variance: squares * (p2 - p2 * p2)
      + 2 * overlapping * (p3 - p2 * p2)
      + 2 * disjoint * (p22 - p2 * p2)
  };
}

/**
 * @param {SourcePage[]} pages
 * @returns {any}
 */
function summarize(pages) {
  const totals = {
    within: {observed: 0, exposure: 0, expected: 0, variance: 0},
    boundary: {observed: 0, exposure: 0, expected: 0, variance: 0}
  };
  const boundaries = pages.reduce((s, page) =>
    s + page.boundary.filter(Boolean).length, 0);
  const within = pages.reduce((s, page) =>
    s + page.boundary.filter(x => !x).length, 0);
  let diffExpected = 0;
  let diffVariance = 0;
  for (const page of pages) {
    const pm = moments(page.runes);
    for (const type of /** @type {const} */ (["boundary", "within"])) {
      const flags = page.boundary.map(x => type === "boundary" ? x : !x);
      const weights = flags.map(x => Number(x));
      const result = weightedMoments(weights, pm);
      const equal = flags.reduce((s, yes, i) =>
        s + Number(yes && page.runes[i] === page.runes[i + 1]), 0);
      totals[type].observed += equal;
      totals[type].exposure += weights.reduce((s, n) => s + n, 0);
      totals[type].expected += result.expected;
      totals[type].variance += result.variance;
    }
    const contrast = page.boundary.map(x => x ? 1 / boundaries : -1 / within);
    const v = weightedMoments(contrast, pm);
    diffExpected += v.expected;
    diffVariance += v.variance;
  }
  for (const type of /** @type {const} */ (["boundary", "within"])) {
    const a = totals[type];
    a.z = (a.observed - a.expected) / Math.sqrt(a.variance);
    a.survival = a.observed / a.expected;
  }
  const diffObserved =
    totals.boundary.observed / boundaries - totals.within.observed / within;
  return {
    ...totals,
    contrast: {
      observed: diffObserved,
      expected: diffExpected,
      sd: Math.sqrt(diffVariance),
      z: (diffObserved - diffExpected) / Math.sqrt(diffVariance)
    }
  };
}

function main() {
  const raw = fs.readFileSync(
    path.join(ROOT, "resources/liber-primus/lp2-transcription.txt"), "utf8");
  const corpus = JSON.parse(fs.readFileSync(
    path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
  const pages = parseSource(raw, new Set(corpus.runes));
  const expectedPages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
  assert.equal(pages.length, 55);
  for (let p = 0; p < pages.length; p++) {
    assert.deepEqual(pages[p].runes, expectedPages[p].indices.map(i => corpus.runes[i]),
      "transcription and canonical original corpus must match page-by-page");
    assert.equal(pages[p].boundary.length, pages[p].runes.length - 1);
  }
  const output = summarize(pages);
  assert.equal(output.boundary.exposure + output.within.exposure, 12901);
  assert.equal(output.boundary.observed + output.within.observed, 86);
  assert.equal(output.boundary.observed, 23);
  assert.equal(output.within.observed, 63);
  assert.ok(Math.abs(output.boundary.expected - 97.74569169278102) < 1e-8);
  assert.ok(Math.abs(output.within.expected - 341.42023239152473) < 1e-8);
  process.stdout.write(JSON.stringify({
    method: "exact page-conditioned permutation null, adjacent-edge covariance",
    pages: pages.length,
    ...output,
    interpretation: "Both within-word and cross-word pairs show strong repeat suppression. No observable reset to IID equality at printed word boundaries."
  }, null, 2) + "\n");
}

if (require.main === module) main();
module.exports = {parseSource, moments, weightedMoments, summarize};
