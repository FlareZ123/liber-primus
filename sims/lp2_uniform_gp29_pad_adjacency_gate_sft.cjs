'use strict';
/**
 * Exact original-cipher adjacency likelihood under an independently uniform
 * GP29 masking stream. No cryptographic key or plaintext is assumed.
 *
 * Run: node sims/lp2_uniform_gp29_pad_adjacency_gate_sft.cjs
 * @module lp2_uniform_gp29_pad_adjacency_gate_sft
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'));
assert.equal(corpus.runes.length, 29);
const unknown = corpus.pages.filter(p => p.page >= 0 && p.page <= 55);
assert.equal(unknown.length, 56);

/**
 * Numerically stable exact binomial lower-tail logarithm.
 * @param {number} n Number of independent Bernoulli opportunities.
 * @param {number} k Maximum accepted successes.
 * @param {number} p Success probability.
 * @returns {number} Natural logarithm of Pr(X <= k).
 */
function logBinomialLowerTail(n, k, p) {
  let term = n * Math.log1p(-p);
  let total = -Infinity;
  for (let j = 0; j <= k; j++) {
    const high = Math.max(total, term);
    total = high + Math.log(Math.exp(total - high) + Math.exp(term - high));
    if (j < k) {
      term += Math.log(n - j) - Math.log(j + 1) +
        Math.log(p) - Math.log1p(-p);
    }
  }
  return total;
}

let runes = 0;
let opportunities = 0;
let adjacentEquals = 0;
let activePages = 0;
const incrementHistogram = Array(29).fill(0);
const chapters = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55],
];
const perPage = [];
for (const page of unknown) {
  const symbols = page.indices;
  assert.equal(symbols.length, page.runic_count);
  assert.ok(symbols.every(x => Number.isInteger(x) && x >= 0 && x < 29));
  runes += symbols.length;
  if (symbols.length) activePages++;
  let pageEquals = 0;
  for (let i = 1; i < symbols.length; i++) {
    opportunities++;
    const delta = (symbols[i] - symbols[i - 1] + 29) % 29;
    incrementHistogram[delta]++;
    if (delta === 0) {
      adjacentEquals++;
      pageEquals++;
    }
  }
  perPage.push({page: page.page, opportunities: Math.max(0, symbols.length - 1),
    equals: pageEquals});
}
assert.equal(runes, 12956);
assert.equal(activePages, 55);
assert.equal(opportunities, 12901);
assert.equal(adjacentEquals, 86);
assert.equal(incrementHistogram.reduce((a, b) => a + b, 0), opportunities);

const exactLogP = logBinomialLowerTail(opportunities, adjacentEquals, 1 / 29);
const log10P = exactLogP / Math.LN10;
assert.ok(Math.abs(log10P - (-97.97028860584511)) < 1e-8);
const mean = opportunities / 29;
const stdev = Math.sqrt(opportunities * (1 / 29) * (28 / 29));
const chapterCounts = chapters.map(([first, last], index) => {
  const rows = perPage.filter(p => p.page >= first && p.page <= last);
  return {
    chapter: index + 1, pages: first + '-' + last,
    opportunities: rows.reduce((n, p) => n + p.opportunities, 0),
    equals: rows.reduce((n, p) => n + p.equals, 0),
  };
});
assert.equal(chapterCounts.reduce((n, x) => n + x.equals, 0), 86);
assert.equal(chapterCounts.reduce((n, x) => n + x.opportunities, 0), 12901);

console.log(JSON.stringify({
  model: 'fixed arbitrary plaintext plus independent uniform GP29 key symbols',
  originalRunePositions: runes,
  originalRuneBearingPages: activePages,
  adjacentOpportunities: opportunities,
  observedAdjacentEquals: adjacentEquals,
  observedRate: adjacentEquals / opportunities,
  uniformPadExpectedEquals: mean,
  uniformPadStdDev: stdev,
  shortfallInSigma: (mean - adjacentEquals) / stdev,
  exactBinomialLog10LowerTail: log10P,
  exactBinomialLowerTail: Math.exp(exactLogP),
  incrementHistogram, chapterCounts,
  constraint: 'Direct independent uniform symbol masking is inconsistent with the observed low adjacency count. Nonindependent/structured key schedules and collision-aware encoders are outside this model.',
}, null, 2));
