"use strict";

/**
 * Source-dimension selector for LP2 physical page-boundary GP29 differences.
 * Node 22; CommonJS, built-ins only. Run from any working directory:
 *   node sims/lp2_2016_dimension_page_arc_sft.cjs
 *
 * Evidence: a conditional original-ciphertext structural comparison.
 * It does not recover a key, cipher mechanism or unknown plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length > 0)
  .sort((a, b) => a.page - b.page)
  .map(p => ({page: p.page, first: p.indices[0], last: p.indices.at(-1)}));
assert.equal(pages.length, 55);
assert.deepEqual(pages.map(p => p.page).filter(p => p === 50), []);

/** @param {number} v @returns {number} */
function mod29(v) { return ((v % 29) + 29) % 29; }

/** @param {number[]} values @param {number} lo @returns {number} */
function hits(values, lo) {
  return values.filter(d => mod29(d - lo) < 6).length;
}

/** @param {number[]} values @returns {{lo:number, hits:number}[]} */
function arcRanks(values) {
  return Array.from({length: 29}, (_, lo) => ({lo, hits: hits(values, lo)}))
    .sort((a, b) => b.hits - a.hits || a.lo - b.lo);
}
const ordDifferences = pages.slice(1)
  .map((p, i) => mod29(p.first - pages[i].last));
const ordSums = pages.slice(1)
  .map((p, i) => mod29(p.first + pages[i].last));
const primeDifferences = pages.slice(1)
  .map((p, i) => mod29(corpus.prime[p.first] - corpus.prime[pages[i].last]));
const primeSums = pages.slice(1)
  .map((p, i) => mod29(corpus.prime[p.first] + corpus.prime[pages[i].last]));

const tree = corpus.pages.find(p => p.page === 32).indices;
assert.equal(tree.length, 121);
const topRow = tree.slice(0, 11).reduce((n, c) => n + corpus.prime[c], 0);
const leftColumn = Array.from({length: 11}, (_, r) => tree[r * 11])
  .reduce((n, c) => n + corpus.prime[c], 0);
assert.equal(topRow, 563);
assert.equal(leftColumn, 569);
const lo = mod29(topRow);
const upperExclusive = mod29(leftColumn);
assert.deepEqual([lo, upperExclusive], [12, 18]);
assert.equal(hits(ordDifferences, lo), 23);
assert.equal(hits(ordSums, lo), 7);
assert.equal(hits(primeDifferences, lo), 8);
assert.equal(hits(primeSums, lo), 13);
assert.equal(hits(ordDifferences, mod29(503)), 18);
assert.deepEqual(arcRanks(ordDifferences)[0], {lo: 12, hits: 23});
assert.equal(ordDifferences.length, 54);

const boundaries = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]];
const groups = boundaries.map(([a, b]) => pages.map((p, i) =>
  p.page >= a && p.page <= b ? i : -1).filter(i => i !== -1));
assert.equal(groups.flat().length, 55);

/** @param {number} left @param {number} right @returns {number} */
function edge(left, right) {
  return Number(mod29(pages[right].first - pages[left].last - lo) < 6);
}
const sectionOriginal = groups.reduce((n, g) =>
  n + g.slice(1).reduce((v, ix, k) => v + edge(g[k], ix), 0), 0);
assert.equal(sectionOriginal, 20);

let state = 0x56356913;
/** @returns {number} */
function random32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
/** @param {number[]} arr @param {number} [from] @param {number} [to] */
function shuffle(arr, from = 0, to = arr.length - 1) {
  for (let i = to; i > from; i--) {
    const j = from + random32() % (i - from + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

const N = 250000;
const whole = pages.map((_, i) => i);
const pinnedGroups = groups.map(g => g.slice());
let exceedWhole = 0;
let exceedSection = 0;
let sumWhole = 0;
let sumSection = 0;
for (let trial = 0; trial < N; trial++) {
  shuffle(whole);
  let w = 0;
  for (let i = 1; i < whole.length; i++) w += edge(whole[i - 1], whole[i]);
  sumWhole += w;
  if (w >= 23) exceedWhole++;

  let s = 0;
  for (const g of pinnedGroups) {
    shuffle(g, 1, g.length - 2);
    for (let i = 1; i < g.length; i++) s += edge(g[i - 1], g[i]);
  }
  sumSection += s;
  if (s >= 20) exceedSection++;
}
assert.equal(exceedWhole, 78);
assert.equal(exceedSection, 4231);

const brailleAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const brailleMasks = [1, 3, 9, 25, 17, 11, 27, 19, 10, 26, 5, 7, 13,
  29, 21, 15, 31, 23, 14, 30, 37, 39, 58, 45, 61, 53];
const letterByMask = new Map(brailleMasks.map((mask, i) =>
  [mask, brailleAlphabet[i]]));
const bits = ordDifferences.map(d => Number(mod29(d - lo) < 6));
/** @param {number[]} order @returns {string} */
function brailleText(order) {
  return Array.from({length: 9}, (_, cell) => {
    const mask = order.reduce((n, bitIndex, j) =>
      n + bits[cell * 6 + j] * (1 << bitIndex), 0);
    return letterByMask.get(mask) || "?";
  }).join("");
}
const brailleDotOrder = brailleText([0, 1, 2, 3, 4, 5]);
const brailleRowOrder = brailleText([0, 3, 1, 4, 2, 5]);
assert.equal(bits.filter(Boolean).length, 23);
assert.equal(brailleDotOrder, "P?E??????");
assert.equal(brailleRowOrder, "G?K?????S");

console.log(JSON.stringify({
  source: "original LP2 55 rune-bearing physical pages, excluding runeless p50",
  treeImage: {width: topRow, height: leftColumn, reducedWindow: [lo, upperExclusive]},
  pageTransitions: 54,
  ordinalDifferenceWindow: hits(ordDifferences, lo),
  ordinalSumWindow: hits(ordSums, lo),
  primeDifferenceWindow: hits(primeDifferences, lo),
  primeSumWindow: hits(primeSums, lo),
  image2012Window: hits(ordDifferences, mod29(503)),
  fixedSixWideArcRanks: arcRanks(ordDifferences).slice(0, 5),
  sectionOriginal,
  trials: N,
  wholePagePermutation: {mean: sumWhole / N, exceed: exceedWhole,
    addOneTail: (exceedWhole + 1) / (N + 1)},
  pinnedSectionPermutation: {mean: sumSection / N, exceed: exceedSection,
    addOneTail: (exceedSection + 1) / (N + 1)},
  binary: bits.join(""),
  simpleBraille: {dotOrder: brailleDotOrder, rowOrder: brailleRowOrder},
  interpretation: "source and cipher anomaly coincide; no decryption or decipherment"
}, null, 2));
