"use strict";
/**
 * Original GP29 16x181 word-order inverse gate.
 *
 * The published LP2 4x4 numeric spiral motivates exactly 16 columns, and
 * the unsolved transcription has exactly 2896 = 16*181 printed rune words.
 * Test both natural serializations of the full rectangle, together with the
 * independently chapter-delimited 224 = 16*14-word p23..26 block.
 *
 * The source-only lag invariant holds for every fixed secret lane permutation.
 * This is a language-register test of one complete, lossless word-order model,
 * not a proposed decoding of individual rune symbols.
 *
 * Run: node sims/lp2_wordlength_16x181_original_inverse_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runes = new Set(corpus.runes);
const transcript = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");
const words = [];
let runeCount = 0;
let page = 0;
let wordPage = 0;
let wordLength = 0;
function finishWord() {
  if (wordLength) words.push({ length: wordLength, page: wordPage });
  wordLength = 0;
}
for (const ch of transcript) {
  if (runes.has(ch)) {
    if (!wordLength) wordPage = page;
    wordLength++;
    runeCount++;
  } else if (ch === "%") {
    page++;
  } else if ("-.$&§0123456789".includes(ch)) {
    finishWord();
  }
}
finishWord();
assert.equal(runeCount, 12956);
assert.equal(page, 54);
assert.equal(words.length, 2896);
const allLengths = words.map((w) => w.length);
const fourPageLengths = words
  .filter((w) => w.page >= 23 && w.page <= 26)
  .map((w) => w.length);
assert.equal(fourPageLengths.length, 224);
assert.equal(allLengths.length, 16 * 181);
assert.equal(fourPageLengths.length, 16 * 14);

const labels = ["ING", ...corpus.translit].sort((a, b) =>
  b.length - a.length);
/** @param {string} word @returns {number} */
function gpLength(word) {
  const normalized = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  let length = 0;
  for (let i = 0; i < normalized.length; length++) {
    const part = labels.find((x) => normalized.startsWith(x, i));
    assert.ok(part, "Source word has no GP29 encoding");
    i += part.length;
  }
  return length;
}
const prose = read("resources/control/gibran_prophet_58585.txt");
const proseStart = prose.indexOf("The Coming of the Ship");
assert.ok(proseStart >= 0);
const gibran = prose.slice(proseStart).match(/[A-Za-z]+/g)
  .slice(0, 2896).map(gpLength);
assert.equal(gibran.length, 2896);
const shortGibran = gibran.slice(0, 224);

/**
 * Encode contiguous plaintext columns of an n/width rectangular word matrix
 * into the displayed rowwise interleave. No glyph or word is discarded.
 * @param {number[]} values
 * @param {number} width
 * @returns {number[]}
 */
function interleave(values, width) {
  const n = values.length;
  assert.equal(n % width, 0);
  const height = n / width;
  return values.map((_, i) =>
    values[(i % width) * height + Math.floor(i / width)]);
}
/**
 * @param {number[]} values
 * @param {number} width
 * @returns {number[]}
 */
function inverse(values, width) {
  const n = values.length;
  assert.equal(n % width, 0);
  const height = n / width;
  const output = Array(n);
  for (let i = 0; i < n; i++) {
    output[(i % width) * height + Math.floor(i / width)] = values[i];
  }
  return output;
}
/**
 * Mutual information (in nats) of printed rune-word length at a fixed lag.
 * @param {number[]} values
 * @param {number} lag
 * @param {3 | 10} bins
 * @returns {number}
 */
function mi(values, lag, bins) {
  const group = bins === 3
    ? (x) => x <= 3 ? 0 : x <= 6 ? 1 : 2
    : (x) => Math.min(x, 9);
  const table = Array.from({ length: bins }, () => Array(bins).fill(0));
  const row = Array(bins).fill(0);
  const col = Array(bins).fill(0);
  let n = 0;
  for (let i = lag; i < values.length; i++) {
    const a = group(values[i - lag]);
    const b = group(values[i]);
    table[a][b]++;
    row[a]++;
    col[b]++;
    n++;
  }
  let result = 0;
  for (let a = 0; a < bins; a++) {
    for (let b = 0; b < bins; b++) {
      const count = table[a][b];
      if (count) {
        result += count / n * Math.log(count * n / (row[a] * col[b]));
      }
    }
  }
  return result;
}
/**
 * @param {number[]} values
 * @param {number} seed
 * @returns {number[]}
 */
function shuffle(values, seed) {
  const output = values.slice();
  let state = seed >>> 0;
  for (let i = output.length - 1; i > 0; i--) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    const j = Math.floor((state >>> 0) / 4294967296 * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
}
/**
 * @param {number[]} values
 * @param {number} lag
 * @param {3 | 10} bins
 * @param {number} trials
 * @param {number} seed
 * @returns {{ observed: number, nullMean: number, z: number, pUpper: number }}
 */
function measure(values, lag, bins, trials, seed) {
  const observed = mi(values, lag, bins);
  let sum = 0;
  let sq = 0;
  let upper = 0;
  for (let k = 0; k < trials; k++) {
    const x = mi(shuffle(values,
      (seed ^ Math.imul(k + 1, 0x9e3779b9)) >>> 0), lag, bins);
    sum += x;
    sq += x * x;
    if (x >= observed) upper++;
  }
  const nullMean = sum / trials;
  const sd = Math.sqrt(sq / trials - nullMean * nullMean);
  return {
    observed, nullMean, z: (observed - nullMean) / sd,
    pUpper: (upper + 1) / (trials + 1)
  };
}

const globalSpecs = [
  { id: "2896_words_16_lanes_of_181", original: allLengths,
    native: gibran, width: 16, bins: 10 },
  { id: "2896_words_181_lanes_of_16", original: allLengths,
    native: gibran, width: 181, bins: 10 },
  { id: "p23_to_p26_224_words_14_lanes_of_16",
    original: fourPageLengths, native: shortGibran, width: 14, bins: 3 },
  { id: "p23_to_p26_224_words_16_lanes_of_14",
    original: fourPageLengths, native: shortGibran, width: 16, bins: 3 }
];
const report = {
  source: { runes: runeCount, words: words.length,
    fullBookRectangle: [181, 16], fourPageRectangle: [14, 16] },
  originalLag1MI: mi(allLengths, 1, 10),
  nativeNaturalLag1MI: mi(gibran, 1, 10),
  tests: {}
};
for (const spec of globalSpecs) {
  const planted = interleave(spec.native, spec.width);
  assert.deepEqual(inverse(planted, spec.width), spec.native);
  assert.deepEqual(interleave(inverse(spec.original, spec.width),
    spec.width), spec.original);
  const observed = measure(spec.original, spec.width,
    spec.bins, 1200, 0xb829);
  const positive = measure(planted, spec.width,
    spec.bins, 1200, 0xb829);
  assert.ok(observed.z < 2.5, spec.id + ": original source gate");
  assert.ok(positive.z > 5, spec.id + ": native-plant recovery");
  report.tests[spec.id] = {
    lag: spec.width,
    bins: spec.bins,
    observed,
    nativePositive: positive,
    directOriginalInverseLag1MI: mi(inverse(spec.original,
      spec.width), 1, spec.bins),
    exactNativePlaintextInverseLag1MI: mi(inverse(planted,
      spec.width), 1, spec.bins)
  };
}
console.log(JSON.stringify(report, null, 2));
