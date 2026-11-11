'use strict';

/**
 * Fixed-order predecessor-exclusion rank28 versus naive byte % 28.
 * Exact original LP2 counts, exact-binomial tail and source-marginal audit.
 * Execute in repository root: node sims/gp28_byte_reducer_gate.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const CORPUS = path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
const P = 40 / 256;

/** @param {number} n @param {number} k @param {number} p */
function binomialLeftTail(n, k, p) {
  let logComb = 0;
  for (let i = 1; i <= k; i++) logComb += Math.log((n - k + i) / i);
  let q = Math.exp(logComb + k * Math.log(p) + (n - k) * Math.log1p(-p));
  let sum = q;
  for (let j = k; j > 0; j--) {
    q *= j / (n - j + 1) * (1 - p) / p;
    sum += q;
  }
  return sum;
}

/**
 * @param {number} previous GP rune index (0..28).
 * @param {number} next GP rune index, distinct from previous.
 * @param {'sorted'|'cyclic'} mode
 * @returns {number} Rank in 0..27.
 */
function rank(previous, next, mode) {
  assert.notEqual(previous, next);
  return mode === 'sorted' ? next - Number(next > previous) : (next - previous - 1 + 29) % 29;
}

/** @param {{page:number,indices:number[]}[]} pages @param {'sorted'|'cyclic'} mode */
function audit(pages, mode) {
  let n = 0, repeats = 0, firstFour = 0, expectedNumerator = 0, expectedDenominator = 0;
  const histogram = Array(28).fill(0);
  const halves = [];
  for (const section of [pages.filter(p => p.page < 28), pages.filter(p => p.page >= 28)]) {
    let nHalf = 0, firstHalf = 0;
    for (const page of section) {
      const a = page.indices;
      const f = Array(29).fill(0);
      for (const value of a) f[value]++;
      for (let i = 1; i < a.length; i++) {
        if (a[i] === a[i - 1]) { repeats++; continue; }
        const r = rank(a[i - 1], a[i], mode);
        histogram[r]++;
        n++; nHalf++;
        if (r < 4) { firstFour++; firstHalf++; }
      }
      // Expected under independent transitions with observed page marginal counts.
      for (let previous = 0; previous < 29; previous++) {
        for (let next = 0; next < 29; next++) {
          if (previous === next) continue;
          const weight = f[previous] * f[next];
          expectedDenominator += weight;
          if (rank(previous, next, mode) < 4) expectedNumerator += weight;
        }
      }
    }
    halves.push({runes: nHalf, low4: firstHalf, low4_fraction: firstHalf / nHalf,
      p_mod28_left_tail: binomialLeftTail(nHalf, firstHalf, P)});
  }
  return {mode, transitions: n, repeats, low4: firstFour, low4_fraction: firstFour / n,
    byte_mod28_low4_expected: n * P,
    conditioned_source_marginals_expected_fraction: expectedNumerator / expectedDenominator,
    p_mod28_left_tail: binomialLeftTail(n, firstFour, P),
    histogram, halves};
}

function main() {
  assert.equal(binomialLeftTail(4, 0, .5), .0625);
  assert.ok(Math.abs(binomialLeftTail(4, 2, .5) - .6875) < 1e-13);
  const bytes = Array.from({length:256}, (_, i) => i);
  assert.equal(bytes.filter(b => b % 28 < 4).length, 40);
  const book = JSON.parse(fs.readFileSync(CORPUS, 'utf8'));
  const pages = book.pages.filter(p => p.page <= 55 && p.indices.length);
  const rows = ['sorted', 'cyclic'].map(mode => audit(pages, mode));
  assert.equal(rows[0].transitions, 12815);
  assert.equal(rows[1].transitions, 12815);
  assert.equal(rows[0].repeats, 86);
  assert.equal(rows[1].repeats, 86);
  assert.equal(rows[0].low4, 1864);
  assert.equal(rows[1].low4, 1831);
  assert.ok(Math.abs(rows[0].p_mod28_left_tail - .0003583252414) < 1e-8);
  assert.ok(Math.abs(rows[1].p_mod28_left_tail - .0000131282677) < 1e-8);
  console.log(JSON.stringify({source: 'original 55 rune-bearing LP2 pages',
    tested_hypothesis: 'independent 8-bit bytes reduced by %28 in either source-fixed rank order',
    note: 'Conditions on 12,815 non-repeat transitions; does not test secret rank permutations, changing byte reducers, or the origin of 86 repeats.',
    rows}, null, 2));
  console.log('SFT PASS: source counts, synthetic byte-bin control and exact binomial tails.');
}
if (require.main === module) main();
module.exports = {rank, audit, binomialLeftTail};
