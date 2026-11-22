"use strict";
/**
 * Original LP2 cross-page shared-position 29! bijection gate.
 *
 * Tests a model in which every original physical page starts at cipher phase 0
 * and one arbitrary secret GP29 alphabet bijection is REUSED across all pages
 * at a given page-local rune offset. The alphabet can be independently chosen
 * at every offset, so no fixed period or guessed key is assumed.
 *
 * Under this model, C[page,t] == C[otherPage,t] iff the corresponding native
 * plaintext GP symbols are identical. This gate is independent of the secret.
 *
 * Controls: 300 deterministic windows per original Shakespeare, Gibran and
 * Emerson text, split at all 55 exact original physical page lengths. The
 * separate nine-original-image-chapter statistic assumes shared alphabets
 * only among physical pages of the same chapter.
 *
 * Run from repository root: node sims/lp2_crosspage_shared_phase_allsecret_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(ROOT, relative), "utf8");

const source = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = source.pages.filter(p => p.page < 56 && p.indices.length)
  .map(p => ({page:p.page, symbols:p.indices}));
assert.equal(pages.length, 55);
assert.equal(pages.reduce((s, p) => s + p.symbols.length, 0), 12956);
const N = 12956;
const CUTS = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];

/** @param {number} page @returns {number} */
function chapter(page) {
  const index = CUTS.findIndex((b, i) =>
    i + 1 < CUTS.length && b <= page && page < CUTS[i + 1]);
  assert(index >= 0);
  return index;
}

/**
 * Count equal page-local-position pairs, with all pages pooled or only pages
 * in a common source-visible chapter. A new arbitrary secret permutation at
 * EVERY offset preserves the equality count exactly.
 *
 * @param {{page:number,symbols:number[]}[]} input
 * @param {boolean} withinChapter
 * @returns {{equal:number,pairs:number,rate:number}}
 */
function collision(input, withinChapter) {
  const groupCount = withinChapter ? 9 : 1;
  const maxLength = Math.max(...input.map(p => p.symbols.length));
  let equal = 0;
  let pairs = 0;
  for (let t = 0; t < maxLength; t++) {
    const frequencies = Array.from({length:groupCount},
      () => new Uint16Array(29));
    const n = new Uint16Array(groupCount);
    for (const p of input) {
      if (t >= p.symbols.length) continue;
      const group = withinChapter ? chapter(p.page) : 0;
      frequencies[group][p.symbols[t]]++;
      n[group]++;
    }
    for (let group = 0; group < groupCount; group++) {
      pairs += n[group] * (n[group] - 1) / 2;
      for (const count of frequencies[group])
        equal += count * (count - 1) / 2;
    }
  }
  return {equal, pairs, rate:equal / pairs};
}

/**
 * Null expectation for uniformly shuffling each page independently, while
 * preserving its exact symbol inventory and length.
 *
 * @param {boolean} withinChapter
 * @returns {number}
 */
function shuffledExpectation(withinChapter) {
  const f = pages.map(p => {
    const c = new Float64Array(29);
    for (const symbol of p.symbols) c[symbol]++;
    return c.map(value => value / p.symbols.length);
  });
  let expectation = 0;
  for (let i = 0; i < pages.length; i++) {
    for (let j = i + 1; j < pages.length; j++) {
      if (withinChapter && chapter(pages[i].page) !== chapter(pages[j].page))
        continue;
      let dot = 0;
      for (let k = 0; k < 29; k++) dot += f[i][k] * f[j][k];
      expectation += dot * Math.min(pages[i].symbols.length,
        pages[j].symbols.length);
    }
  }
  return expectation;
}

const GP = {
  F:0,U:1,TH:2,O:3,R:4,C:5,G:6,W:7,H:8,N:9,I:10,J:11,
  EO:12,P:13,X:14,S:15,T:16,B:17,E:18,M:19,L:20,NG:21,
  OE:22,D:23,A:24,AE:25,Y:26,IA:27,EA:28
};

/**
 * Existing project GP-native spelling convention. Controls are actual
 * English-source segments, not constructed ciphertext fits.
 * @param {string} text @returns {number[]}
 */
function encodeEnglish(text) {
  const src = text.toUpperCase().replace(/V/g, "U").replace(/K/g, "C")
    .replace(/Q/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < src.length; i++) {
    const letter = src[i];
    if (!/[A-Z]/.test(letter)) continue;
    if (src.slice(i, i + 3) === "ING") {
      result.push(21);
      i += 2;
      continue;
    }
    const pair = src.slice(i, i + 2);
    if (Object.hasOwn(GP, pair)) {
      result.push(GP[pair]);
      i++;
      continue;
    }
    if (Object.hasOwn(GP, letter)) result.push(GP[letter]);
  }
  return result;
}

/** @param {number} initial @returns {()=>number} */
function randomFactory(initial) {
  let state = initial >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/** @param {number[]} symbols */
function splitAtSourcePages(symbols) {
  assert.equal(symbols.length, N);
  let cursor = 0;
  const out = pages.map(p => {
    const section = symbols.slice(cursor, cursor + p.symbols.length);
    cursor += section.length;
    return {page:p.page, symbols:section};
  });
  assert.equal(cursor, N);
  return out;
}

/** @param {number[]} values @returns {object} */
function summary(values, originalRate) {
  values.sort((a, b) => a - b);
  return {
    minimum: values[0],
    median: values[150],
    maximum: values[299],
    countAtOrBelowOriginal: values.filter(value => value <= originalRate).length
  };
}

const original = collision(pages, false);
const within = collision(pages, true);
assert.deepEqual([original.equal, original.pairs], [10751, 311132]);
assert.deepEqual([within.equal, within.pairs], [1392, 38178]);

const random = randomFactory(0x7c198501);
const controlFiles = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
];
const lengths = [217644, 62696, 323083];
const controls = [];
for (let index = 0; index < controlFiles.length; index++) {
  const symbols = encodeEnglish(read(controlFiles[index]));
  assert.equal(symbols.length, lengths[index]);
  const globalRates = [];
  const chapterRates = [];
  for (let sample = 0; sample < 300; sample++) {
    const start = Math.floor(random() * (symbols.length - N + 1));
    const native = splitAtSourcePages(symbols.slice(start, start + N));
    globalRates.push(collision(native, false).rate);
    chapterRates.push(collision(native, true).rate);
  }
  const global = summary(globalRates, original.rate);
  const chapterScoped = summary(chapterRates, within.rate);
  assert(global.minimum > original.rate);
  assert(chapterScoped.minimum > within.rate);
  controls.push({corpus:controlFiles[index], originalGPCount:symbols.length,
    samples:300, global, chapterScoped});
}

/** Reversible planted native plaintext, with independent 29! at every t. */
function plantedPositiveControl() {
  const native = splitAtSourcePages(
    encodeEnglish(read(controlFiles[0])).slice(0, N));
  const random = randomFactory(0x43b129);
  const phases = Math.max(...native.map(p => p.symbols.length));
  const forward = [], reverse = [];
  for (let t = 0; t < phases; t++) {
    const perm = Array.from({length:29}, (_, i) => i);
    for (let k = 28; k > 0; k--) {
      const j = Math.floor(random() * (k + 1));
      [perm[k], perm[j]] = [perm[j], perm[k]];
    }
    const inv = new Array(29);
    for (let k = 0; k < 29; k++) inv[perm[k]] = k;
    forward.push(perm);
    reverse.push(inv);
  }
  const encrypted = native.map(p => ({
    page:p.page,
    symbols:p.symbols.map((value, t) => forward[t][value])
  }));
  const decrypted = encrypted.map(p => ({
    page:p.page,
    symbols:p.symbols.map((value, t) => reverse[t][value])
  }));
  assert.deepEqual(decrypted, native);
  assert.deepEqual(collision(encrypted, false), collision(native, false));
  assert.deepEqual(collision(encrypted, true), collision(native, true));
  return {runesRecovered:N, phases, nativeGlobal:collision(native, false),
    nativeWithin:collision(native, true)};
}

console.log(JSON.stringify({
  original, within,
  pageHistogramShuffleExpected:{
    globalEqual:shuffledExpectation(false),
    withinEqual:shuffledExpectation(true)
  },
  controls, positivePlant:plantedPositiveControl()
}, null, 2));
