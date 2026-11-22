"use strict";

/**
 * Original 2014 LP2 p7-p9 source register: red-heading product, complete
 * cross-page word, and the two valid ternary zero-splice candidates.
 *
 * Run on Windows 11 using Node.js 22. No dependencies or command-line flags.
 * This is a source-level test. It makes no plaintext-recovery claim.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "resources", "liber-primus");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(root, "lp2-ink-annotations.json"), "utf8"));
const source = fs.readFileSync(path.join(root, "lp2-transcription.txt"), "utf8");
const pages = source.split("%");
const runeIds = new Map(corpus.runes.map((r, i) => [r, i]));
const runes = new Set(corpus.runes);

/** @param {number[]} a @returns {number} */
const product29 = a => a.reduce((v, x) => (v * x) % 29, 1);
/** @param {number[]} a @returns {number} */
const sum29 = a => a.reduce((v, x) => v + x, 0);
/** @param {string} a @returns {number[]} */
const indices = a => Array.from(a, x => runeIds.get(x));

/** @param {string} a @returns {string} */
function clean(a) { return a.replace(/[\/\s&$]/g, ""); }

/**
 * Original page-crossing words. Hyphens and periods terminate printed words.
 * Page references in the runeless p50 case are intentionally not inferred
 * from the percent-delimited transcription.
 * @returns {{boundary: number, left: string, right: string, word: string, values: number[]}[]}
 */
function crossingWords() {
  const out = [];
  for (let i = 0; i < pages.length - 1; i++) {
    const a = clean(pages[i]);
    const b = clean(pages[i + 1]);
    if (!runes.has(Array.from(a).at(-1)) || !runes.has(Array.from(b)[0])) continue;
    const left = Array.from(a.slice(a.search(/[^-.]*$/))).filter(c => runes.has(c)).join("");
    const right = Array.from(b.split(/[-.]/, 1)[0]).filter(c => runes.has(c)).join("");
    const word = left + right;
    out.push({ boundary: i, left, right, word, values: indices(word) });
  }
  return out;
}

const crossings = crossingWords();
assert.equal(crossings.length, 32);
const p8Cross = crossings.find(w => w.boundary === 8);
assert(p8Cross);
assert.equal(p8Cross.left, "ᛇ");
assert.equal(p8Cross.right, "ᚣᚹᚫᚷᛄ");
assert.deepEqual(p8Cross.values, [12, 26, 7, 25, 6, 11]);
assert.equal(sum29(p8Cross.values), 87);
assert.equal(sum29(p8Cross.values) % 29, 0);
assert.deepEqual(crossings.filter(w => sum29(w.values) % 29 === 0).map(w => w.boundary), [8]);
assert.equal(crossings.filter(w => w.values.length === 6).length, 5);

const p7 = corpus.pages[7].indices;
const p8 = corpus.pages[8].indices;
const p9 = corpus.pages[9].indices;
assert.equal(p7.length, 208);
assert.equal(p8.length, 255);
assert.equal(p9.slice(0, 5).join(","), "26,7,25,6,11");
const p8Ink = ink.pages.find(p => p.page === 8);
assert(p8Ink);
assert.deepEqual(p8Ink.red_spans.map(s => [s.start, s.length]), [[0, 12]]);
const red = p8.slice(0, 12);
assert.equal(red.length, 12);
assert.deepEqual(red, [14, 10, 14, 19, 1, 14, 19, 5, 2, 13, 3, 17]);
assert.equal(product29(red.slice(0, 4)), 4);
assert.equal(product29(red.slice(4)), 3);
assert.equal(product29(red), 12);
assert.equal(p8.at(-1), 12);
assert.equal(red.length, p8.at(-1));

const startHeadingControls = [];
for (const p of ink.pages) {
  if (p.page > 55) continue;
  const spans = (p.red_spans || []).slice().sort((a, b) => a.start - b.start);
  if (!spans.length || spans[0].start !== 0) continue;
  let len = 0;
  for (const s of spans) {
    if (s.start !== len) break;
    len += s.length;
  }
  const values = corpus.pages[p.page].indices;
  startHeadingControls.push({
    page: p.page,
    headingRunes: len,
    headingProduct29: product29(values.slice(0, len)),
    lastRune29: values.at(-1),
  });
}
assert.equal(startHeadingControls.length, 9);
assert.deepEqual(startHeadingControls.filter(x =>
  x.headingProduct29 === x.lastRune29 &&
  x.headingRunes === x.lastRune29).map(x => x.page), [8]);

const redWords = [[23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]];
assert.deepEqual(p7.slice(-14), redWords.flat());
const product = redWords.map(product29);
assert.deepEqual(product, [11, 26, 8, 15, 2]);
const taps = product.map(v => v % 3);
assert.deepEqual(taps, [2, 2, 2, 0, 2]);

const sequence = [];
let state = taps.slice();
for (let i = 0; i < 242; i++) {
  sequence.push(state[0]);
  state = state.slice(1).concat([taps.reduce((v, t, j) => v + t * state[j], 0) % 3]);
}
assert.deepEqual(state, taps);
const splicePositions = [];
for (let i = 0; i < 242; i++) {
  if ([0, 1, 2, 3].every(j => sequence[(i + j) % 242] === 0)) {
    splicePositions.push((i + 4) % 242);
  }
}
assert.deepEqual(splicePositions, [87, 208]);

/** @param {number} splice @returns {{unique: number, zeroIndex: number, carriedAddress: number}} */
function addressRegister(splice) {
  const trits = [...sequence.slice(0, splice), 0, ...sequence.slice(splice)];
  const addresses = trits.map((_, i) =>
    Array.from({ length: 5 }, (_, j) => trits[(i + j) % 243])
      .reduce((v, t) => v * 3 + t, 0));
  return {
    unique: new Set(addresses).size,
    zeroIndex: addresses.indexOf(0),
    carriedAddress: addresses[242],
  };
}
const registers = splicePositions.map(s => ({ splice: s, ...addressRegister(s) }));
assert.deepEqual(registers, [
  { splice: 87, unique: 243, zeroIndex: 83, carriedAddress: 78 },
  { splice: 208, unique: 243, zeroIndex: 204, carriedAddress: 78 },
]);

const punctuation = { stopOffsets: [], wordBoundaryOffsets: [] };
let offset = 0;
for (const ch of pages[8]) {
  if (runes.has(ch)) offset++;
  else if (offset > 12 && offset < 255) {
    if (ch === ".") punctuation.stopOffsets.push(offset - 12);
    if (ch === "-") punctuation.wordBoundaryOffsets.push(offset - 12);
  }
}
assert.equal(offset, 255);
assert.deepEqual(punctuation.stopOffsets, [28, 122, 208]);
assert(punctuation.wordBoundaryOffsets.includes(87));
assert(!punctuation.stopOffsets.includes(87));

console.log(JSON.stringify({
  source: "Original p7-p9 GP29 corpus, ink spans, and physical text",
  page8: {
    redWordsProducts29: [product29(red.slice(0, 4)), product29(red.slice(4))],
    redHeadingLength: red.length,
    redHeadingProduct29: product29(red),
    blackRuneCount: p8.length - red.length,
    pageFinalRune29: p8.at(-1),
    crossingWord: p8Cross.word,
    crossingIndices: p8Cross.values,
    crossingSum: sum29(p8Cross.values),
  },
  originalCrossingWords: {
    total: crossings.length,
    sum0mod29Boundaries: crossings.filter(w => sum29(w.values) % 29 === 0).map(w => w.boundary),
    lengthSixCount: crossings.filter(w => w.values.length === 6).length,
  },
  headingControls: startHeadingControls,
  p7RedProducts29: product,
  p7PrimitiveTaps3: taps,
  splicePositions,
  registers,
  originalBlackPunctuation: punctuation.stopOffsets.concat([]),
  wordBoundary87: punctuation.wordBoundaryOffsets.includes(87),
  interpretation: "The carry-word GP0 sum selects splice87, whereas the earlier sentence-offset criterion selects208. The physical carried rune cannot itself be the all-zero five-trit state in either valid de Bruijn register. No first-party cipher output law is specified.",
}, null, 2));
