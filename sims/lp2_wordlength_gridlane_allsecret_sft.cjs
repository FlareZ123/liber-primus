"use strict";
/**
 * Original GP29 whole-word length lanes against the literal 8-column/32-row
 * terminal grid geometry. Read-only, deterministic Node.js 22 SFT.
 * Run from the repository root with node sims/lp2_wordlength_gridlane_allsecret_sft.cjs
 *
 * The purported cipher is a fixed, whole-word, rowwise interleaving of 8 or
 * 32 prose lanes. Every within-chapter permutation of lane labels leaves the
 * lag-width adjacency pairs unchanged, so no key search is needed.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const letters = new Set(corpus.runes);
const transcript = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");
const words = [];
let page = 0;
let length = 0;
let wordPage = 0;
let totalRunes = 0;
function finish() {
  if (length) words.push({len: length, page: wordPage});
  length = 0;
}
for (const char of transcript) {
  if (letters.has(char)) {
    if (!length) wordPage = page;
    length++;
    totalRunes++;
  } else if (char === "%") {
    page++;
  } else if ("-.$&§0123456789".includes(char)) {
    finish();
  }
}
finish();
assert.equal(totalRunes, 12956);
assert.equal(words.length, 2896);
assert.equal(page, 54);
const bounds = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];
const original = words.map((w) => w.len);
const chapters = words.map((w) => {
  const physical = w.page >= 50 ? w.page + 1 : w.page;
  return bounds.findIndex((b, i) =>
    i < 9 && physical >= b && physical < bounds[i + 1]);
});
assert.ok(chapters.every((v) => v >= 0 && v < 9));
const chapterCounts = Array.from({length: 9}, (_, i) =>
  chapters.filter((x) => x === i).length);
assert.deepEqual(chapterCounts, [158,255,383,437,224,326,378,669,66]);
const labels = ["ING", ...corpus.translit].sort((a, b) =>
  b.length - a.length);
/** @param {string} text @returns {number} */
function gpLength(text) {
  const w = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  let count = 0;
  for (let i = 0; i < w.length; count++) {
    const token = labels.find((v) => w.startsWith(v, i));
    assert.ok(token, "Invalid GP source token");
    i += token.length;
  }
  return count;
}
const gibranText = read("resources/control/gibran_prophet_58585.txt");
const gibranStart = gibranText.indexOf("The Coming of the Ship");
assert.ok(gibranStart >= 0);
const gibran = gibranText.slice(gibranStart)
  .match(/[A-Za-z]+/g).slice(0, original.length).map(gpLength);
assert.equal(gibran.length, original.length);
/**
 * @param {number[]} v @param {number[]} groups @param {number} lag
 * @returns {number}
 */
function mi(v, groups, lag) {
  const table = Array.from({length: 10}, () => Array(10).fill(0));
  let n = 0;
  for (let i = lag; i < v.length; i++) {
    if (groups[i] !== groups[i - lag]) continue;
    table[Math.min(v[i - lag], 9)][Math.min(v[i], 9)]++;
    n++;
  }
  assert.ok(n > 0);
  const row = table.map((r) => r.reduce((a, b) => a + b, 0));
  const col = Array.from({length: 10}, (_, j) =>
    table.reduce((s, r) => s + r[j], 0));
  let score = 0;
  for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) {
    const k = table[i][j];
    if (k) score += k / n * Math.log(k * n / (row[i] * col[j]));
  }
  return score;
}
/**
 * @param {number[]} v @param {number[]} groups @param {number} seed
 * @returns {number[]}
 */
function shuffle(v, groups, seed) {
  const y = v.slice();
  let state = seed >>> 0;
  function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  }
  for (let st = 0; st < y.length;) {
    let en = st + 1;
    while (en < y.length && groups[en] === groups[st]) en++;
    for (let i = en - 1; i > st; i--) {
      const j = st + Math.floor(random() * (i - st + 1));
      [y[i], y[j]] = [y[j], y[i]];
    }
    st = en;
  }
  return y;
}
/**
 * Write each chapter's contiguous prose as fixed columns, then read
 * successive row lanes. The displayed column order can be secret:
 * its permutation does not change the lag-width adjacency-pair inventory.
 * @param {number[]} v @param {number[]} groups @param {number} width
 * @returns {number[]}
 */
function interleave(v, groups, width) {
  const y = v.slice();
  for (let st = 0; st < v.length;) {
    let en = st + 1;
    while (en < v.length && groups[en] === groups[st]) en++;
    const n = en - st;
    const w = Math.min(width, n);
    const sizes = Array.from({length: w}, (_, j) =>
      Math.ceil((n - j) / w));
    const starts = [];
    let offset = 0;
    for (const s of sizes) {
      starts.push(offset);
      offset += s;
    }
    assert.equal(offset, n);
    for (let i = 0; i < n; i++) {
      y[st + i] = v[st + starts[i % w] + Math.floor(i / w)];
    }
    st = en;
  }
  return y;
}
/**
 * @param {number[]} v @param {number[]} groups @param {number} lag
 * @param {number} trials @param {number} seed
 * @returns {{observed:number,mean:number,z:number,pUpper:number}}
 */
function test(v, groups, lag, trials, seed) {
  const observed = mi(v, groups, lag);
  let sum = 0;
  let square = 0;
  let hi = 0;
  for (let i = 0; i < trials; i++) {
    const p = shuffle(v, groups,
      seed ^ Math.imul(i + 1, 0x9e3779b9));
    const z = mi(p, groups, lag);
    sum += z;
    square += z * z;
    if (z >= observed) hi++;
  }
  const mean = sum / trials;
  const sd = Math.sqrt(square / trials - mean * mean);
  return {observed, mean, z: (observed - mean) / sd,
    pUpper: (hi + 1) / (trials + 1)};
}
const p40Source = original.filter((_, i) => chapters[i] === 7);
const p40Gibran = gibran.filter((_, i) => chapters[i] === 7);
const p40Groups = p40Source.map(() => 0);
const report = {
  source: {runes: totalRunes, words: original.length,
    originalChapterWordCounts: chapterCounts, p40Words: p40Source.length},
  original: {}, sourceNativePositive: {}, originalP40: {},
  sourceNativePositiveP40: {}
};
assert.equal(p40Source.length, 669);
assert.ok(Math.abs(mi(original, chapters, 1) - 0.012156) < 0.00001);
for (const width of [8, 32]) {
  report.original[width] = test(original, chapters,
    width, 700, 0xb829);
  report.originalP40[width] = test(p40Source, p40Groups,
    width, 700, 0xb829);
  const planted = interleave(gibran, chapters, width);
  const p40Planted = interleave(p40Gibran, p40Groups, width);
  report.sourceNativePositive[width] = test(planted,
    chapters, width, 700, 0xb829);
  report.sourceNativePositiveP40[width] = test(p40Planted,
    p40Groups, width, 700, 0xb829);
  assert.ok(report.original[width].z < 2.5);
  assert.ok(report.originalP40[width].z < 2.5);
  assert.ok(report.sourceNativePositive[width].z > 10);
  assert.ok(report.sourceNativePositiveP40[width].z > 4);
  // The planted operator is an exact permutation, even when chapter sizes
  // are not multiples of the grid width.
  assert.deepEqual(
    [...planted].sort((a, b) => a - b),
    [...gibran].sort((a, b) => a - b));
}
console.log(JSON.stringify(report, null, 2));
