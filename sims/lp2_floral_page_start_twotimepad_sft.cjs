"use strict";

/**
 * LP2 flower-framed page-start two-time-pad cancellation challenge.
 *
 * A repeated additive GP29 keystream, reset at the first BLACK rune of
 * each flower page, cancels from simultaneous page differences:
 * (C_page1[i] - C_page2[i]) mod 29 = (P_page1[i] - P_page2[i]) mod 29.
 *
 * Tests every source-visible p40..p55 floral page, excluding rune-free p50,
 * with one fixed zero-offset black-body alignment. No phase search, invented
 * ciphertext, candidate English words, or fitted decryption key.
 *
 * Single-file Windows11/Node22 SFT:
 * node sims/lp2_floral_page_start_twotimepad_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const english = read("resources/control/shakespeare_first300k.txt");
const ix = new Map(gp.translit.map((token, i) => [token, i]));
const tokens = ["TH", "EO", "NG", "OE", "AE", "IA", "EA"];

/** @param {string} input @returns {number[]} */
function sourceNativeGP(input) {
  const encoded = [];
  const words = input.toUpperCase().match(/[A-Z]+/g) || [];
  for (let word of words) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S")
      .replace(/ING/g, "NG").replace(/IO/g, "IA");
    for (let i = 0; i < word.length;) {
      const token = tokens.find(t => word.startsWith(t, i)) || word[i];
      const value = ix.get(token);
      if (value !== undefined) encoded.push(value);
      i += token.length;
    }
  }
  return encoded;
}
const donor = sourceNativeGP(english);
assert.equal(donor.length, 217106);
const hist = Array(29).fill(0);
donor.forEach(x => hist[x]++);
const p = hist.map(x => x / donor.length);
const nativeDifference = Array.from({length: 29}, (_, step) =>
  p.reduce((sum, n, x) => sum + n * p[(x - step + 29) % 29], 0));
const logRatio = nativeDifference.map(prob => Math.log(29 * prob));
assert(nativeDifference[0] > 0.05 && nativeDifference[0] < 0.07);
assert(Math.abs(nativeDifference.reduce((s, x) => s + x, 0) - 1) < 1e-12);

// Two original red headings (p40=8 GP runes, p54=9) are outside the
// body clock. Other floral pages start immediately with black rune text.
const floral = gp.pages.filter(page => page.page >= 40 && page.page <= 55 &&
  page.indices.length).map(page => ({
    page: page.page,
    symbols: page.indices.slice(page.page === 40 ? 8 :
      page.page === 54 ? 9 : 0)
  }));
assert.deepEqual(floral.map(x => x.page),
  [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 52, 53, 54, 55]);
assert.equal(floral[0].symbols.length, 223);
assert.equal(floral[13].symbols.length, 223);

const pairSpec = [];
for (let i = 0; i < floral.length; i++) {
  for (let j = i + 1; j < floral.length; j++) {
    pairSpec.push({i, j, n: Math.min(floral[i].symbols.length,
      floral[j].symbols.length)});
  }
}
assert.equal(pairSpec.length, 105);

/** @param {number[]} x @param {number[]} y @param {number} n
 *  @param {number} [shiftX] @param {number} [shiftY]
 *  @returns {{score:number,equals:number}} */
function compare(x, y, n, shiftX = 0, shiftY = 0) {
  let score = 0;
  let equals = 0;
  for (let k = 0; k < n; k++) {
    const a = x[(k + shiftX) % x.length];
    const b = y[(k + shiftY) % y.length];
    const delta = (a - b + 29) % 29;
    score += logRatio[delta];
    if (delta === 0) equals++;
  }
  return {score, equals};
}

/** @param {number[][]} streams @param {number[]} [offsets] */
function panel(streams, offsets = streams.map(() => 0)) {
  let best = {score: -Infinity, equals: 0, pages: [], n: 0};
  let aggregate = 0;
  let totalRunes = 0;
  for (const {i, j, n} of pairSpec) {
    const r = compare(streams[i], streams[j], n, offsets[i], offsets[j]);
    aggregate += r.score;
    totalRunes += n;
    if (r.score > best.score) {
      best = {...r, pages: [floral[i].page, floral[j].page], n};
    }
  }
  return {best, aggregate, totalRunes};
}
const original = panel(floral.map(x => x.symbols));
assert.equal(original.totalRunes, 18918);
assert.deepEqual(original.best.pages, [43, 48]);
assert.equal(original.best.equals, 18);
assert.equal(original.best.n, 271);
assert(Math.abs(original.best.score - 4.786752108811641) < 1e-8);
assert(Math.abs(original.aggregate + 319.2937295144604) < 1e-8);

// Exact native and authentic p57 shared-key plants demonstrate the cancel
// identity, independently of inference on the unknown source manuscript.
const clearP57 = gp.pages[57].indices;
assert.equal(clearP57.length, 95);
const ciphertextPlant = clearP57.map((x, i) => (x + i * 17 + 3) % 29);
const plaintextPlant = donor.slice(1000, 1095);
const ciphertextPlant2 = plaintextPlant.map((x, i) =>
  (x + i * 17 + 3) % 29);
assert.deepEqual(ciphertextPlant.map((x, i) =>
  (x - (i * 17 + 3) % 29 + 29) % 29), clearP57);
assert.deepEqual(ciphertextPlant2.map((x, i) =>
  (x - (i * 17 + 3) % 29 + 29) % 29), plaintextPlant);
assert.deepEqual(
  ciphertextPlant.map((x, i) => (x - ciphertextPlant2[i] + 29) % 29),
  clearP57.map((x, i) => (x - plaintextPlant[i] + 29) % 29)
);
const synthetic = floral.map((page, index) => {
  const offset = 5000 + index * 1500;
  assert(offset + page.symbols.length < donor.length);
  return donor.slice(offset, offset + page.symbols.length).map((x, i) =>
    (x + i * 17 + 3) % 29);
});
const sourceNativePlant = panel(synthetic);
assert(sourceNativePlant.aggregate > 0);
assert(sourceNativePlant.best.score > original.best.score);

// A single continuous PRNG stream, no reseeding inside the trial loop.
// Rotations preserve each authentic source page's glyphs, length and
// short-range correlations but randomize the zero-offset key alignment.
let seed = 0x33011986;
/** @returns {number} */
function random32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const trials = 2000;
let nullBestAtLeast = 0;
let nullAggregateAtLeast = 0;
const nullBestScores = [];
for (let t = 0; t < trials; t++) {
  const offsets = floral.map(page =>
    Math.floor(random32() / 4294967296 * page.symbols.length));
  const sample = panel(floral.map(x => x.symbols), offsets);
  if (sample.best.score >= original.best.score) nullBestAtLeast++;
  if (sample.aggregate >= original.aggregate) nullAggregateAtLeast++;
  nullBestScores.push(sample.best.score);
}
nullBestScores.sort((a, b) => a - b);
assert.equal(nullBestAtLeast, 164);
assert.equal(nullAggregateAtLeast, 159);

console.log(JSON.stringify({
  description: "Original p40..p55 floral page-black-start shared additive GP29 keystream test",
  source: "resources/liber-primus/lp2-corpus.json; resources/control/shakespeare_first300k.txt",
  pages: floral.map(x => ({page: x.page, bodyRunes: x.symbols.length})),
  nativeGPReference: donor.length,
  nativeGPDifferenceEqualityRate: nativeDifference[0],
  fullSourcePairCount: pairSpec.length,
  original,
  nativeSamePadPlant: sourceNativePlant,
  authenticClearP57TwoTimePadPositive: "95/95 + 95/95",
  matchedRotatedPageNull: {
    seed: "0x33011986", trials,
    familywiseBestAtLeastOriginal: nullBestAtLeast,
    familywiseBestP: (nullBestAtLeast + 1) / (trials + 1),
    aggregateAtLeastOriginal: nullAggregateAtLeast,
    aggregateP: (nullAggregateAtLeast + 1) / (trials + 1),
    familywiseBestMedian: nullBestScores[1000]
  },
  conclusion: "No pair has familywise-significant evidence of a reset shared additive GP29 pad. No authentic plaintext or key recovered. This does not exclude unrelated pad offsets, per-page fresh keys or an F-transparent nonlinear clock."
}, null, 2));
