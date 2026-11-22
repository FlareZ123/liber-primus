"use strict";

/**
 * Original-input GP29 two-tap ciphertext-feedback exclusion.
 * C[i] = P[i] + a*C[i-1] + b*C[i-2] + k (mod 29).
 * Arbitrary a,b,k globally, or independent per printed physical page.
 * The first two runes per page may use arbitrary hidden initial states;
 * only subsequent output runes enter the no-key monogram invariant.
 *
 * Run: node sims/lp2_two_tap_cipherfeedback_allsecret_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} source */
function read(source) {
  return fs.readFileSync(path.join(root, source), "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length > 2);
const lengths = pages.map(p => p.indices.length);
const ciphertext = pages.flatMap(p => p.indices);
assert.equal(pages.length, 55);
assert.equal(ciphertext.length, 12956);
const gp = new Map(corpus.translit.map((token, i) => [token, i]));
gp.set("ING", 21);

/** @param {string} text @returns {number[]} */
function encode(text) {
  const result = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < word.length;) {
      const n = [3, 2, 1].find(n => gp.has(word.slice(i, i + n)));
      assert.notEqual(n, undefined, "Unmapped GP word: " + word);
      result.push(gp.get(word.slice(i, i + n)));
      i += n;
    }
  }
  return result;
}

/** @param {number} n */
function mod(n) {
  return ((n % 29) + 29) % 29;
}

/**
 * Cipher inversion and forward generator, identical page boundaries.
 * First two ciphertext symbols are literal initial source values.
 * @param {number[]} input
 * @param {boolean} encrypt
 * @param {(page: number) => [number,number,number]} key
 */
function transform(input, encrypt, key) {
  const output = input.slice();
  let at = 0;
  for (let page = 0; page < lengths.length; page++) {
    const [a, b, k] = key(page);
    for (let i = 2; i < lengths[page]; i++) {
      const pos = at + i;
      const previous = encrypt ? output : input;
      const feedback = a * previous[pos - 1] + b * previous[pos - 2] + k;
      output[pos] = mod(input[pos] + (encrypt ? 1 : -1) * feedback);
    }
    at += lengths[page];
  }
  assert.equal(at, input.length);
  return output;
}

/**
 * Affine inverse, with complete freedom in the two feedback multipliers.
 * Additive k is deliberately omitted: it is a fixed alphabet rotation
 * within each independently keyed page and cannot change its collision rate.
 * @param {number[]} values
 * @param {number} start
 * @param {number} length
 * @param {number} a
 * @param {number} b
 */
function pairs(values, start, length, a, b) {
  const counts = new Uint16Array(29);
  for (let i = start + 2; i < start + length; i++) {
    counts[mod(values[i] - a * values[i - 1] - b * values[i - 2])]++;
  }
  let sum = 0;
  for (const n of counts) sum += n * (n - 1);
  return sum;
}

/** @param {number[]} values */
function scoreOriginal(values) {
  const eligible = values.length - 2 * lengths.length;
  const globalCounts = new Uint16Array(29);
  let globalBest = {a: 0, b: 0, pairs: -1};
  for (let a = 0; a < 29; a++) {
    for (let b = 0; b < 29; b++) {
      globalCounts.fill(0);
      let at = 0;
      for (const length of lengths) {
        for (let i = at + 2; i < at + length; i++) {
          globalCounts[mod(values[i] - a * values[i - 1] -
            b * values[i - 2])]++;
        }
        at += length;
      }
      let total = 0;
      for (const n of globalCounts) total += n * (n - 1);
      if (total > globalBest.pairs) globalBest = {a, b, pairs: total};
    }
  }
  let pagePairs = 0;
  let pageDenominator = 0;
  let at = 0;
  for (const length of lengths) {
    let best = -1;
    for (let a = 0; a < 29; a++) {
      for (let b = 0; b < 29; b++) {
        best = Math.max(best, pairs(values, at, length, a, b));
      }
    }
    pagePairs += best;
    pageDenominator += (length - 2) * (length - 3);
    at += length;
  }
  return {eligible,
    bestGlobal: {a: globalBest.a, b: globalBest.b,
      ioc: globalBest.pairs / (eligible * (eligible - 1))},
    pageAllSecret: {pairs: pagePairs, denominator: pageDenominator,
      ioc: pagePairs / pageDenominator}};
}

/** Lower-bound control: every secret-key optimum is >= identity-key IoC. */
function nativeLowerBound(values) {
  const counts = new Uint16Array(29);
  let at = 0;
  let pagePairs = 0;
  let pageDenominator = 0;
  for (const length of lengths) {
    const localCounts = new Uint16Array(29);
    for (let i = at + 2; i < at + length; i++) {
      counts[values[i]]++;
      localCounts[values[i]]++;
    }
    for (const n of localCounts) pagePairs += n * (n - 1);
    pageDenominator += (length - 2) * (length - 3);
    at += length;
  }
  const globalPairs = counts.reduce((sum, n) => sum + n * (n - 1), 0);
  const eligible = ciphertext.length - 2 * lengths.length;
  return {global: globalPairs / (eligible * (eligible - 1)),
    page: pagePairs / pageDenominator};
}

const nativeSources = [
  "resources/control/emerson_essays_2944.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
].map(source => encode(read(source)));
assert.deepEqual(nativeSources.map(v => v.length), [323083, 62696, 217644]);
const nativeWindows = nativeSources.flatMap(source => {
  const windows = [];
  for (let at = 0; at + ciphertext.length <= source.length;
    at += ciphertext.length) {
    windows.push(source.slice(at, at + ciphertext.length));
  }
  return windows;
});
assert.equal(nativeWindows.length, 44);
const native = nativeWindows.map(nativeLowerBound);
const minGlobal = Math.min(...native.map(s => s.global));
const minPage = Math.min(...native.map(s => s.page));
const original = scoreOriginal(ciphertext);

// Each original maximum over all hidden coefficients must be below every
// control's attainable score, even allowing the original all 841 choices.
assert(original.bestGlobal.ioc < minGlobal);
assert(original.pageAllSecret.ioc < minPage);
assert.equal(original.bestGlobal.a, 1);
assert.equal(original.bestGlobal.b, 0);
assert.equal(original.eligible, 12846);
assert.equal(original.pageAllSecret.pairs, 122794);
assert.equal(original.pageAllSecret.denominator, 3147058);

// Positive: arbitrary changing page keys encrypt a real GP-English control.
// The first two runes of each page remain literal, and every subsequent
// symbol is recovered byte-for-byte. A deliberate wrong key fails.
const nativePlain = nativeWindows[0];
const selected = page => [(7 + 3 * page) % 29,
  (11 + 5 * page) % 29, (13 + 11 * page) % 29];
const plant = transform(nativePlain, true, selected);
assert.deepEqual(transform(plant, false, selected), nativePlain);
assert.notDeepEqual(transform(plant, false, () => [0, 0, 0]), nativePlain);

console.log(JSON.stringify({status: "PASS", family:
  "C[i]=P[i]+a*C[i-1]+b*C[i-2]+k (mod29)",
  originalPages: pages.length, originalRunes: ciphertext.length,
  positiveRecovered: nativePlain.length, testedGlobalPairs: 29 * 29,
  testedPagewisePairs: pages.length * 29 * 29,
  nativeWindows: nativeWindows.length, minGlobalNativeLowerBound: minGlobal,
  minPageNativeLowerBound: minPage, original}, null, 2));
