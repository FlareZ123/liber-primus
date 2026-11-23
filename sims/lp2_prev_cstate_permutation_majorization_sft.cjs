'use strict';

/**
 * SFT: a complete unknown per-previous-ciphertext GP29 permutation cannot
 * make source-native English letter concentrations from original LP2.
 *
 * On each physical page after the initial glyph:
 *   P[i] = pi[C[i - 1]](C[i])
 * where pi consists of 29 unknown, independently chosen permutations of the
 * 29-symbol Gematria Primus alphabet. No constraints on the secret key.
 *
 * The original ordered bigram matrix implies a sharp majorization ceiling:
 * for any k-symbol output set S, occurrences in noninitial positions cannot
 * exceed the sum of the k largest entries of each predecessor row.
 *
 * No file writes, no guessed plaintext, no random search, no external modules.
 * Run in Windows Node.js 22 from any working directory.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const CORPUS = JSON.parse(fs.readFileSync(path.join(
  ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'
), 'utf8'));
const MOD = 29;

/**
 * @param {number[][]} pageIndices Canonical per-page GP29 indices.
 * @returns {number[][]} Exact original 29-by-29 predecessor/successor table.
 */
function matrixFor(pageIndices) {
  /** @type {number[][]} */
  const counts = Array.from({length: MOD}, () => Array(MOD).fill(0));
  for (const page of pageIndices) {
    for (let i = 1; i < page.length; i++) counts[page[i - 1]][page[i]]++;
  }
  return counts;
}

/**
 * @param {number[][]} matrix Ordered bigram counts.
 * @returns {number[]} Sorted-row sum vector, length 29, majorizing every
 * possible output symbol-count vector for these 29 secret permutations.
 */
function envelopeBins(matrix) {
  const totals = Array(MOD).fill(0);
  for (const row of matrix) {
    assert.equal(row.length, MOD);
    const sorted = [...row].sort((a, b) => b - a);
    sorted.forEach((n, k) => { totals[k] += n; });
  }
  return totals;
}

/**
 * @param {number} residue Integer.
 * @returns {number} Canonical GP29 residue.
 */
function mod29(residue) {
  return (residue % MOD + MOD) % MOD;
}

assert.equal(CORPUS.runes.length, MOD);
assert.equal(CORPUS.translit.length, MOD);
const originalPages = CORPUS.pages.filter(p => p.page <= 55 && p.indices.length > 0);
assert.equal(originalPages.length, 55);
const original = originalPages.map(p => p.indices);
for (const page of original) {
  for (const c of page) assert.ok(Number.isInteger(c) && c >= 0 && c < MOD);
}
const n = original.reduce((sum, p) => sum + p.length, 0);
assert.equal(n, 12956);
const starts = original.length;
const counts = matrixFor(original);
const edges = counts.flat().reduce((a, b) => a + b, 0);
assert.equal(edges, 12901);
const selfLoops = counts.reduce((sum, row, prev) => sum + row[prev], 0);
assert.equal(selfLoops, 86);

const bins = envelopeBins(counts);
const targetFirstTen = [714, 645, 612, 593, 571, 554, 543, 527, 515, 502];
assert.deepEqual(bins.slice(0, 10), targetFirstTen);
const caps = [0];
for (const b of bins) caps.push(caps[caps.length - 1] + b);
assert.equal(caps[29], edges);
for (let k = 1; k <= MOD; k++) caps[k] += starts;
assert.deepEqual(caps.slice(1, 11), [
  769, 1414, 2026, 2619, 3190, 3744, 4287, 4814, 5329, 5831
]);
assert.equal(caps[29], n);
assert.equal(Math.max(...bins), 714);

// Construct a concrete row-permutation decoder that *achieves* the
// predecessor-edge upper bound for every top-k simultaneously.
// A separately free page-start output is granted in the upper bound.
const inverseRows = counts.map(row => [...row.keys()]
  .sort((a, b) => row[b] - row[a] || a - b));
const rankRows = inverseRows.map(indices => {
  const ranks = Array(MOD);
  indices.forEach((c, rank) => { ranks[c] = rank; });
  assert.equal(new Set(ranks).size, MOD);
  return ranks;
});
const recoveredBins = Array(MOD).fill(0);
for (const page of original) {
  for (let i = 1; i < page.length; i++) {
    recoveredBins[rankRows[page[i - 1]][page[i]]]++;
  }
}
assert.deepEqual(recoveredBins, bins); // Sharp, not an approximate bound.

const knownPlain = CORPUS.pages.find(p => p.page === 57).indices;
assert.equal(knownPlain.length, 95);
const clearFrequencies = Array.from({length: MOD},
  (_, k) => knownPlain.filter(c => c === k).length);
assert.equal(clearFrequencies[CORPUS.translit.indexOf('E')], 15);
const clearTop = [...clearFrequencies].sort((a, b) => b - a);
assert.deepEqual(clearTop.slice(0, 3), [15, 9, 9]);

// Full-length authentic-native-plaintext positive plant. Encrypt the
// historical clear p57 rune sequence through a legal reversible row-permutation
// machine; then recover all 12,956 runes exactly with the original inverse.
// The artificial encryption key is intentionally obvious and unsecret.
const nativePlant = [];
let offset = 0;
for (const page of original) {
  const planted = Array.from({length: page.length},
    (_, k) => knownPlain[(offset + k) % knownPlain.length]);
  offset += page.length;
  nativePlant.push(planted);
}
const synthetic = nativePlant.map(plaintext => {
  const ciphertext = [];
  plaintext.forEach((p, i) => {
    ciphertext.push(i === 0
      ? mod29(p + 2)
      : mod29(p - 7 * ciphertext[i - 1]));
  });
  return ciphertext;
});
const decoded = synthetic.map(ciphertext => ciphertext.map((c, i) =>
  i === 0 ? mod29(c - 2) : mod29(c + 7 * ciphertext[i - 1])));
assert.deepEqual(decoded, nativePlant);

const syntheticCaps = envelopeBins(matrixFor(synthetic));
const nativeE = nativePlant.flat().filter(v => v === CORPUS.translit.indexOf('E')).length;
assert.ok(nativeE <= syntheticCaps[0] + starts);
assert.ok(nativeE / n > caps[1] / n);

// Every possible unknown stationary predecessor-ciphertext permutation is
// constrained by this certificate. Compare a *source-attested example* of
// plaintext GP, and do not assert all unknown LP2 text must have its histogram.
const output = {
  source: 'resources/liber-primus/lp2-corpus.json',
  unknown_pages: originalPages.length,
  source_runes: n,
  within_page_transitions: edges,
  adjacent_equal: selfLoops,
  secret_permutations_allowed: MOD,
  symbols_per_permutation: MOD,
  majorization_sorted_bin_counts: bins,
  upper_counts_including_freely_chosen_page_starts: caps.slice(1),
  max_one_symbol_percentage: Number((100 * caps[1] / n).toFixed(6)),
  max_two_symbol_percentage: Number((100 * caps[2] / n).toFixed(6)),
  genuine_clear_p57: {
    length: knownPlain.length,
    most_common_symbol: CORPUS.translit[clearFrequencies.indexOf(clearTop[0])],
    E_count: clearFrequencies[CORPUS.translit.indexOf('E')],
    top_two_count: clearTop[0] + clearTop[1],
    E_percentage: Number((100 * 15 / 95).toFixed(6)),
    top_two_percentage: Number((100 * 24 / 95).toFixed(6)),
  },
  plant_GP29_runes_recovered: decoded.flat().length,
  original_plaintext_recovered: false,
};
console.log(JSON.stringify(output, null, 2));
