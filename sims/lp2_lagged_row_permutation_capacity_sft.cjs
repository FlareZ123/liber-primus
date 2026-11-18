"use strict";
/**
 * An all-secret upper bound for chapter-stationary, lag-L ciphertext-state
 * row-substitution c[i]=pi[chapter,c[i-L]](p[i]), GP29, L=1..29.
 * No heuristic cipher search or guess of the 29! secret alphabet rows.
 * Run: node sims/lp2_lagged_row_permutation_capacity_sft.cjs
 */
const assert = require("node:assert/strict");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const solved = require("../resources/external/relikd-solved-gp29-native-v1.json");
const starts = new Set([0, 3, 8, 15, 23, 27, 33, 40, 54]);
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
const solvedIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const native = [];
for (const section of solved.sections)
  for (const glyph of section.source_text) {
    const index = solvedIndex.get(glyph);
    if (index !== undefined) native.push(index);
  }
assert.equal(native.length, 2979);
const nativeFrequency = Array(29).fill(0);
for (const x of native) nativeFrequency[x]++;
assert.equal(Math.max(...nativeFrequency), 380);
const nativeIC = nativeFrequency.reduce((s, f) => s + f * (f - 1), 0) /
  (native.length * (native.length - 1));

/**
 * Exact maximization over every secret permutation in every chapter/state row.
 * Each row may assign its most frequent ciphertext rune to the same chosen
 * plaintext symbol; align all ordered histograms to reach the bound.
 *
 * @param {{page:number,indices:number[]}[]} sourcePages
 * @param {number} lag
 * @returns {{lag:number,n:number,states:number,top1Count:number,top1:number,IoC:number}}
 */
function capacity(sourcePages, lag) {
  /** @type {Map<number,number[]>} */
  const rows = new Map();
  /** @type {number[]} */
  const history = [];
  let chapter = -1;
  for (const page of sourcePages) {
    if (starts.has(page.page)) {
      chapter++;
      history.length = 0;
    }
    for (const c of page.indices) {
      if (history.length >= lag) {
        const state = history[history.length - lag];
        const row = chapter * 29 + state;
        if (!rows.has(row)) rows.set(row, Array(29).fill(0));
        rows.get(row)[c]++;
      }
      history.push(c);
    }
  }
  const columns = Array(29).fill(0);
  for (const sourceCounts of rows.values()) {
    const sorted = sourceCounts.slice().sort((a, b) => b - a);
    for (let i = 0; i < 29; i++) columns[i] += sorted[i];
  }
  const n = columns.reduce((s, x) => s + x, 0);
  return {lag, n, states: rows.size, top1Count: columns[0],
    top1: columns[0] / n,
    IoC: columns.reduce((s, v) => s + v * (v - 1), 0) / (n * (n - 1))};
}
/**
 * Construct a genuine-native-GP positive under an explicit unknown permutation
 * pi[chapter,c[i-lag]]: x -> 7*x+11*state+chapter (mod 29).
 * @param {number} lag
 * @returns {{page:number,indices:number[]}[]}
 */
function plant(lag) {
  let pos = 0;
  let chapter = -1;
  const history = [];
  return pages.map(page => {
    if (starts.has(page.page)) {
      history.length = 0;
      chapter++;
    }
    const indices = [];
    for (let i = 0; i < page.indices.length; i++) {
      const p = native[pos++ % native.length];
      const tweak = history.length < lag ? 3 * history.length + chapter :
        11 * history[history.length - lag] + chapter;
      const c = (7 * p + tweak) % 29;
      indices.push(c);
      history.push(c);
    }
    return {page: page.page, indices};
  });
}
const bounds = Array.from({length: 29}, (_, i) => capacity(pages, i + 1));
assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), 12956);
assert.equal(bounds[4].n, 12911);
assert.equal(bounds[4].top1Count, 1205);
assert.equal(bounds[5].n, 12902);
assert.equal(bounds[5].top1Count, 1216);
assert.equal(bounds[4].states, 261);
assert.equal(bounds[5].states, 261);
assert(bounds.every(x => x.top1 < 0.098 && x.IoC < 0.052));
const positive = [5, 6].map(lag => {
  const planted = capacity(plant(lag), lag);
  assert(planted.top1 > 0.11 && planted.IoC > 0.055);
  return planted;
});
console.log(JSON.stringify({
  inputRunes: 12956, visualChapters: 9, nativeSolvedRunes: native.length,
  nativeSolvedTop1: Math.max(...nativeFrequency) / native.length,
  nativeSolvedIoC: nativeIC,
  originalLag5: bounds[4], originalLag6: bounds[5],
  strongestOriginalAcrossLag1to29: {
    maxTop1: Math.max(...bounds.map(x => x.top1)),
    maxIoC: Math.max(...bounds.map(x => x.IoC)),
  }, positive,
  decision: "chapter-stationary arbitrary cipher-lag row permutations cannot reproduce native-GP English concentration under this model"
}, null, 2));
