"use strict";

/**
 * Original-input, key-independent gate for one shared page-reset alphabet.
 *
 * Hypothesis: C[page, offset] = pi[offset](P[page, offset]), where the
 * SAME otherwise arbitrary bijection pi[offset] is used on every page
 * in the tested chapter or whole book. No assumption about the secret
 * alphabets, their periods, or their relation to one another is needed.
 *
 * The number of equal glyph pairs at each page-local rune offset is
 * invariant under every such bijection. Compare the original LP2 count
 * with source-calibrated GP29 English control windows of exactly the
 * same original physical page lengths.
 *
 * Run: node sims/lp2_pageoffset_allsecret_reuse_gate.cjs
 * Node.js 20+, CommonJS, no packages or network access.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.join(__dirname, "..");

/** @param {string} filename */
function read(filename) {
  return fs.readFileSync(path.join(root, filename), "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const unknownPages = corpus.pages.filter(page =>
  page.page <= 55 && page.indices.length > 0);
assert.equal(unknownPages.length, 55);
assert.equal(unknownPages.reduce((n, page) => n + page.indices.length, 0), 12956);

const solvedP57 = read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split("### 57\n")[1];
assert.deepEqual(encodeSourceNativeGP(solvedP57),
  corpus.pages.find(page => page.page === 57).indices,
  "source-native English encoder exactly matches independent solved p57");

/**
 * Count page-offset symbol equalities. Every independent position-wise
 * secret permutation shared across the displayed pages preserves this count.
 *
 * @param {number[][]} pages Each array is one physical-page rune sequence.
 * @returns {{matches:number,comparisons:number,rate:number}}
 */
function equality(pages) {
  let matches = 0;
  let comparisons = 0;
  const maxLength = Math.max(...pages.map(page => page.length));
  for (let i = 0; i < maxLength; i++) {
    const counts = new Uint16Array(29);
    let present = 0;
    for (const page of pages) {
      if (i < page.length) {
        counts[page[i]]++;
        present++;
      }
    }
    comparisons += present * (present - 1) / 2;
    for (const count of counts) matches += count * (count - 1) / 2;
  }
  return {matches, comparisons, rate: matches / comparisons};
}

/**
 * Overlay a contiguous native-GP English span on exact original page lengths.
 *
 * @param {number[]} text
 * @param {number[]} lengths
 * @param {number} start
 * @returns {number[][]}
 */
function overlay(text, lengths, start) {
  let offset = start;
  return lengths.map(length => {
    const page = text.slice(offset, offset + length);
    offset += length;
    return page;
  });
}

/** @param {number[][]} pages */
function reencryptUnderSharedPageOffsetKey(pages) {
  return pages.map(page => page.map((x, i) => {
    const multiply = 1 + (i * 7) % 28; // always invertible modulo 29
    const shift = (i * 11 + 3) % 29;
    return (multiply * x + shift) % 29;
  }));
}

const sources = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
].map(([name, file]) => ({name, indices: encodeSourceNativeGP(read(file))}));

const chapters = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55], [0, 55]
];
const results = [];

for (const [startPage, endPage] of chapters) {
  const pages = unknownPages
    .filter(page => page.page >= startPage && page.page <= endPage);
  const originals = pages.map(page => page.indices);
  const lengths = originals.map(page => page.length);
  const totalLength = lengths.reduce((sum, length) => sum + length, 0);
  const original = equality(originals);
  assert.deepEqual(
    equality(reencryptUnderSharedPageOffsetKey(originals)), original,
    "all-secret position-wise positive plant must preserve original collisions"
  );

  const controls = sources.map(source => {
    let windows = 0;
    let atOrBelowOriginal = 0;
    let minimum = Infinity;
    let minimumStart = null;
    for (let start = 0; start + totalLength <= source.indices.length; start += 127) {
      const candidate = equality(overlay(source.indices, lengths, start));
      assert.equal(candidate.comparisons, original.comparisons);
      minimum = Math.min(minimum, candidate.rate);
      if (candidate.rate === minimum) minimumStart = start;
      if (candidate.rate <= original.rate) atOrBelowOriginal++;
      windows++;
    }
    return {source: source.name, windows, minimum,
      minimumStart, atOrBelowOriginal};
  });

  results.push({startPage, endPage, pageCount: pages.length,
    runes: totalLength, original, controls});
}

const book = results.at(-1);
assert.deepEqual(
  [book.original.matches, book.original.comparisons], [10751, 311132]);
assert(book.controls.every(control => control.atOrBelowOriginal === 0));
const chapter15 = results.find(result => result.startPage === 15);
assert.deepEqual(
  [chapter15.original.matches, chapter15.original.comparisons], [240, 5861]);
assert(chapter15.controls.every(control => control.atOrBelowOriginal === 0));

console.log(JSON.stringify({
  status: "key-independent finite-English exclusion; no unknown plaintext recovered",
  identity: "same page-offset bijection preserves cross-page equalities",
  originalUnknownPages: 55,
  originalUnknownRunes: 12956,
  independentSolvedP57ExactRuneControl: 95,
  sourceEnglishControlLengths: sources.map(source =>
    ({source: source.name, runes: source.indices.length})),
  sourceNativeSharedSecretPositivePlant: "exact for each chapter and whole book",
  controlWindowStride: 127,
  chapters: results
}, null, 2));
