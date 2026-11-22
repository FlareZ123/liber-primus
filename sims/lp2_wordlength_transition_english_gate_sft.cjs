"use strict";
/**
 * LP2 word-length order versus English source-native holdouts.
 * Node 22: node sims/lp2_wordlength_transition_english_gate_sft.cjs
 * No original plaintext, key, or cipher hypothesis is assumed.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} rel */
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");

const raw = read("resources/lp2-transcription.txt").split("%").slice(0, 55).join("%");
/** @type {Array<{length:number,start:number,page:number}>} */
const words = [];
let length = 0, start = 0, runePosition = 0, page = 0, wordPage = 0;
function finish() {
  if (!length) return;
  words.push({length, start, page:wordPage});
  length = 0;
}
for (const ch of raw) {
  if (/[\u16A0-\u16FF]/u.test(ch)) {
    if (!length) {start = runePosition; wordPage = page;}
    length++;
    runePosition++;
  } else if (ch === "%") {
    page++;
  } else if (ch === "/" || /\s/u.test(ch)) {
    // Printed line breaks can continue a single word.
  } else finish();
}
finish();
assert.equal(runePosition, 12956);
assert.equal(words.length, 2896);
const chapterStarts = [0,729,1874,3603,5506,6527,7960,9640,12648,12956];
const chapters = chapterStarts.slice(1).map((end, j) =>
  words.filter(w => w.start >= chapterStarts[j] && w.start < end)
    .map(w => w.length));
assert.deepEqual(chapters.map(a => a.length),
  [158,255,383,437,224,326,378,669,66]);
const pageChunks = Array.from({length:55}, (_, i) =>
  words.filter(w => w.page === i).map(w => w.length));
assert.equal(pageChunks.reduce((s, a) => s + a.length, 0), 2896);
assert.equal(Math.min(...pageChunks.map(x => x.length)), 16);
assert.equal(Math.max(...pageChunks.map(x => x.length)), 71);

const pairs = new Set(["TH","NG","EO","OE","AE","IA","EA","IO"]);
/**
 * Approximate GP-native length convention for English prose controls only.
 * @param {string} word
 * @returns {number}
 */
function gpLength(word) {
  let n = 0;
  for (let i = 0; i < word.length; i++) {
    if (word.slice(i, i + 3) === "ING") {
      i += 2; n++; continue;
    }
    if (pairs.has(word.slice(i, i + 2))) i++;
    n++;
  }
  return n;
}
const sources = [
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/shakespeare_first300k.txt"
].map(rel => ({rel, lengths:
  (read(rel).toUpperCase().match(/[A-Z]+/g) || []).map(gpLength)}));
assert.deepEqual(sources.map(x => x.lengths.length), [15733,77932,55407]);

const K = 18, alpha = .5;
/**
 * Smoothed first-order word-length conditional English model versus unigram.
 * Train exclusively on two sources; the third is a heldout positive control.
 * @param {number[][]} training
 * @returns {number[][]}
 */
function fit(training) {
  const matrix = Array.from({length: K}, () => Array(K).fill(alpha));
  const rows = Array(K).fill(K * alpha);
  const marg = Array(K).fill(K * alpha);
  for (const a of training) for (let i = 1; i < a.length; i++) {
    const p = a[i - 1], q = a[i];
    if (p >= K || q >= K) continue;
    matrix[p][q]++; rows[p]++; marg[q]++;
  }
  const total = marg.reduce((s, x) => s + x, 0);
  return matrix.map((row, p) => row.map((v, q) =>
    Math.log(v / rows[p]) - Math.log(marg[q] / total)));
}
/** @param {number[]} a @param {number[][]} model */
function score(a, model) {
  let s = 0;
  for (let i = 1; i < a.length; i++) s += model[a[i-1]][a[i]];
  return s / (a.length - 1);
}
/** @param {number[][]} pieces @param {number[][]} model */
function chapterScore(pieces, model) {
  let sum = 0, n = 0;
  for (const a of pieces) {sum += score(a, model) * (a.length - 1); n += a.length - 1;}
  return sum / n;
}
let seed = 0x56565555;
/** @param {number} n */
function rnd(n) {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) % n;
}
/** @param {number[]} a */
function shuffle(a) {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}
/** @param {number[]} a */
function moments(a) {
  const mean = a.reduce((s, x) => s + x, 0) / a.length;
  const sd = Math.sqrt(a.reduce((s, x) => s + (x - mean) ** 2, 0) / a.length);
  return {mean, sd};
}
/** Separate page-shuffle RNG: the chapter-level Monte Carlo remains unchanged. */
let pageSeed = 0x55c0ffee;
/** @param {number[]} a */
function shufflePage(a) {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    pageSeed ^= pageSeed << 13;
    pageSeed ^= pageSeed >>> 17;
    pageSeed ^= pageSeed << 5;
    const j = (pageSeed >>> 0) % (i + 1);
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}
const results = [];
for (let h = 0; h < sources.length; h++) {
  const model = fit(sources.filter((_, i) => i !== h).map(x => x.lengths));
  const original = chapterScore(chapters, model);
  const originalSamples = Array.from({length: 1000}, () =>
    chapterScore(chapters.map(shuffle), model));
  const originalNull = moments(originalSamples);
  const native = sources[h].lengths.slice(3000, 5896);
  assert.equal(native.length, 2896);
  const nativeScore = score(native, model);
  const nativeSamples = Array.from({length: 600}, () => score(shuffle(native), model));
  const nativeNull = moments(nativeSamples);
  const result = {
    heldout: sources[h].rel,
    original, originalNull,
    originalZ: (original - originalNull.mean) / originalNull.sd,
    originalUpperP: (1 + originalSamples.filter(x => x >= original).length) / 1001,
    nativeScore, nativeNull,
    nativeZ: (nativeScore - nativeNull.mean) / nativeNull.sd,
    nativeUpperP: (1 + nativeSamples.filter(x => x >= nativeScore).length) / 601
  };
  assert.ok(Math.abs(result.originalZ) < 2, JSON.stringify(result));
  assert.ok(result.nativeZ > 5, JSON.stringify(result));
  // A pure permutation of physical pages leaves all within-page pairs intact.
  // Word fragments continuing onto another page belong to their start page.
  const pageOriginal = chapterScore(pageChunks, model);
  const pageOriginalSamples = Array.from({length:900}, () =>
    chapterScore(pageChunks.map(shufflePage), model));
  const pageOriginalNull = moments(pageOriginalSamples);
  let offset = 0;
  const nativePages = pageChunks.map(p => {
    const a = native.slice(offset, offset + p.length);
    offset += p.length;
    return a;
  });
  assert.equal(offset, native.length);
  const pageNative = chapterScore(nativePages, model);
  const pageNativeSamples = Array.from({length:500}, () =>
    chapterScore(nativePages.map(shufflePage), model));
  const pageNativeNull = moments(pageNativeSamples);
  result.withinPage = {
    original: pageOriginal,
    null: pageOriginalNull,
    z: (pageOriginal - pageOriginalNull.mean) / pageOriginalNull.sd,
    upperP: (1 + pageOriginalSamples.filter(x => x >= pageOriginal).length) / 901,
    native: pageNative,
    nativeNull: pageNativeNull,
    nativeZ: (pageNative - pageNativeNull.mean) / pageNativeNull.sd,
    nativeUpperP: (1 + pageNativeSamples.filter(x => x >= pageNative).length) / 501
  };
  assert.ok(Math.abs(result.withinPage.z) < 2, JSON.stringify(result));
  assert.ok(result.withinPage.nativeZ > 5, JSON.stringify(result));
  results.push(result);
}
console.log(JSON.stringify({
  originalWordCount: words.length,
  originalRuneCount: runePosition,
  chapterWordCounts: chapters.map(x => x.length),
  results
}, null, 2));
