"use strict";

/**
 * Exact information accounting for original LP2 adjacent-rune suppression.
 *
 * A fixed-key reversible 29-rune encoder supporting ALL 29^L plaintext
 * sequences cannot map every such input to L ciphertext runes having an
 * unusually low repeat count, unless additional decodable information is
 * provided or the input domain is restricted.
 *
 * Page heads are unconstrained; only within-page transitions are counted.
 * This program reports the minimal fixed-length side information required
 * by the cardinality bound under three clearly stated restriction sets.
 *
 * Reproduce: node sims/lp2_anti_repeat_lossless_capacity.cjs
 * No npm dependencies, randomness, key search, or external text.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));

const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(pages.length, 55);
const rows = pages.map(page => {
  const a = page.indices;
  let equal = 0;
  for (let i = 1; i < a.length; ++i) {
    assert(Number.isInteger(a[i]) && a[i] >= 0 && a[i] < 29);
    if (a[i] === a[i - 1]) ++equal;
  }
  return {page: page.page, runes: a.length, steps: a.length - 1, equal};
});
const runes = rows.reduce((sum, r) => sum + r.runes, 0);
const steps = rows.reduce((sum, r) => sum + r.steps, 0);
const equal = rows.reduce((sum, r) => sum + r.equal, 0);
assert.deepEqual([runes, steps, equal], [12956, 12901, 86]);

const LOG2 = Math.log(2);
const p = 1 / 29;
const logfact = new Float64Array(steps + 1);
for (let n = 1; n <= steps; ++n) logfact[n] = logfact[n - 1] + Math.log(n);
function logchoose(n, k) {
  assert(k >= 0 && k <= n);
  return logfact[n] - logfact[k] - logfact[n - k];
}
function logBinomialPmf(n, k) {
  if (k < 0 || k > n) return -Infinity;
  return logchoose(n, k) + k * Math.log(p)
    + (n - k) * Math.log1p(-p);
}
function logBinomialCdf(n, k) {
  if (k < 0) return -Infinity;
  if (k >= n) return 0;
  const vals = [];
  for (let t = 0; t <= k; ++t) vals.push(logBinomialPmf(n, t));
  const maximum = Math.max(...vals);
  let sum = 0;
  for (const v of vals) sum += Math.exp(v - maximum);
  return maximum + Math.log(sum);
}
function close(x, y, atol = 1e-8) {
  assert(Math.abs(x - y) <= atol, "expected " + y + ", found " + x);
}

/**
 * For a 29-symbol page of length L and exactly k equal transitions,
 * there are 29 * choose(L-1,k) * 28^(L-1-k) strings.
 * Independently, a length-3 brute force over all 29^3 strings verifies it.
 */
for (let L = 1; L <= 3; ++L) {
  const histogram = new Array(L).fill(0);
  for (let word = 0; word < 29 ** L; ++word) {
    let rem = word;
    let last = rem % 29;
    rem = Math.floor(rem / 29);
    let hits = 0;
    for (let i = 1; i < L; ++i) {
      const current = rem % 29;
      rem = Math.floor(rem / 29);
      if (last === current) hits++;
      last = current;
    }
    histogram[hits]++;
  }
  for (let k = 0; k < L; ++k) {
    const predicted = Math.round(
      29 * Math.exp(logchoose(L - 1, k)) * 28 ** (L - 1 - k));
    assert.equal(histogram[k], predicted);
  }
}

const bitsGlobalCap = -logBinomialCdf(steps, equal) / LOG2;
const bitsPageCaps = -rows.reduce(
  (sum, row) => sum + logBinomialCdf(row.steps, row.equal), 0) / LOG2;
const bitsExactPageCounts = -rows.reduce(
  (sum, row) => sum + logBinomialPmf(row.steps, row.equal), 0) / LOG2;
const bitsFixedMask = -(
  equal * Math.log(p) + (steps - equal) * Math.log1p(-p)) / LOG2;

// Independently precomputed source-original regression constants.
close(bitsGlobalCap, 325.4502541839801, 1e-7);
close(bitsPageCaps, 430.5612013481068, 1e-7);
close(bitsExactPageCounts, 445.7315579008697, 1e-7);
close(bitsFixedMask, 1066.5594919726104, 1e-7);
assert(bitsGlobalCap < bitsPageCaps &&
  bitsPageCaps < bitsExactPageCounts &&
  bitsExactPageCounts < bitsFixedMask);

const result = {
  alphabet: 29, unsolved_rune_pages: pages.length,
  runes, within_page_transitions: steps, equal_transitions: equal,
  expected_equal_uniform: steps / 29,
  source_page_counts: rows,
  required_extra_bits_minimum: {
    total_equal_at_most_86: bitsGlobalCap,
    per_page_equal_at_most_actual: bitsPageCaps,
    per_page_equal_exactly_actual: bitsExactPageCounts,
    all_12901_equal_locations_frozen: bitsFixedMask
  },
  corresponding_ceil_binary_bits: {
    global: Math.ceil(bitsGlobalCap),
    page_caps: Math.ceil(bitsPageCaps),
    exact_page_counts: Math.ceil(bitsExactPageCounts),
    fixed_equal_locations: Math.ceil(bitsFixedMask)
  },
  fixed_length_GP29_side_symbols_at_least: {
    global: Math.ceil(bitsGlobalCap / Math.log2(29)),
    page_caps: Math.ceil(bitsPageCaps / Math.log2(29)),
    exact_page_counts: Math.ceil(bitsExactPageCounts / Math.log2(29)),
    fixed_equal_locations: Math.ceil(bitsFixedMask / Math.log2(29))
  },
  assumptions: [
    "All possible GP29 source strings are admitted for each fixed encoder key",
    "No change in the 55 page lengths or the 12956 transmitted rune count",
    "The stated output repeat restriction applies to every possible source input",
    "Any extra side information is decodable and may depend on the plaintext",
    "Fixed-key pre-shared randomness is not plaintext-dependent side information"
  ]
};
console.log(JSON.stringify(result, null, 2));
