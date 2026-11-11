"use strict";

/**
 * Original-input test of direct affine ciphertext feedback:
 *
 *   C[i] = P[i] + a C[i-lag] + b (mod 29).
 *
 * Every multiplier a in GF(29) is allowed. The global model allows an
 * unknown global additive offset b. A more permissive model lets every
 * printed page choose its own unknown a and b. Page-local comparisons
 * ignore the first lag symbols, which may depend on arbitrary hidden IVs.
 *
 * Run: node sims/lp2_ciphertext_feedback_allmultiplier_allsecret_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} name */
function read(name) {
  return fs.readFileSync(path.join(root, name), "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter((p) => p.page < 56 && p.indices.length);
const lengths = pages.map((p) => p.indices.length);
const original = pages.flatMap((p) => p.indices);
assert.equal(pages.length, 55);
assert.equal(original.length, 12956);

/** @type {Map<string, number>} */
const gp = new Map(corpus.translit.map((token, i) => [token, i]));
gp.set("ING", 21);

/** @param {string} text @returns {number[]} */
function encode(text) {
  const result = [];
  const words = text.toUpperCase().match(/[A-Z]+/g) || [];
  for (let word of words) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < word.length;) {
      let tokenId;
      let tokenLength = 0;
      for (const n of [3, 2, 1]) {
        const candidate = gp.get(word.slice(i, i + n));
        if (candidate !== undefined) {
          tokenId = candidate;
          tokenLength = n;
          break;
        }
      }
      assert.notEqual(tokenId, undefined, "Unmapped native GP word: " + word);
      result.push(tokenId);
      i += tokenLength;
    }
  }
  return result;
}

const controlPaths = [
  "resources/control/emerson_essays_2944.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
];
const controlTexts = controlPaths.map((name) => encode(read(name)));
assert.deepEqual(controlTexts.map((v) => v.length), [323083, 62696, 217644]);
const controlWindows = controlTexts.flatMap((text) => {
  const windows = [];
  for (let i = 0; i + original.length <= text.length; i += original.length) {
    windows.push(text.slice(i, i + original.length));
  }
  return windows;
});
assert.equal(controlWindows.length, 44);
const lags = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

/** @param {number} n */
function mod(n) {
  return ((n % 29) + 29) % 29;
}

/**
 * Collision-pair numerator of the inverse P[i] = C[i] - a*C[i-lag] - b.
 * Since b is constant within a segment, it cannot alter its IoC.
 * @param {number[]} values
 * @param {number} start
 * @param {number} end
 * @param {number} lag
 * @param {number} a
 */
function collisionPairs(values, start, end, lag, a) {
  const frequencies = new Int32Array(29);
  for (let i = start + lag; i < end; i++) {
    frequencies[mod(values[i] - a * values[i - lag])]++;
  }
  let pairs = 0;
  for (const n of frequencies) pairs += n * (n - 1);
  return pairs;
}

/**
 * Both scores favor the original by selecting the best coefficient(s).
 * The global score allows one a and b. The per-page score allows separate
 * a and b for every page and arbitrary initial lag symbol states.
 *
 * @param {number[]} values
 * @param {number} lag
 */
function score(values, lag) {
  const eligible = values.length - lag;
  const bookDenominator = eligible * (eligible - 1);
  let bookBest = { a: 0, pairs: collisionPairs(values, 0, values.length, lag, 0) };
  for (let a = 1; a < 29; a++) {
    const pairs = collisionPairs(values, 0, values.length, lag, a);
    if (pairs > bookBest.pairs) bookBest = { a, pairs };
  }
  let at = 0;
  let pageNumerator = 0;
  let pageDenominator = 0;
  for (const length of lengths) {
    if (length >= lag + 2) {
      let maximum = -1;
      for (let a = 0; a < 29; a++) {
        const pairs = collisionPairs(values, at, at + length, lag, a);
        if (pairs > maximum) maximum = pairs;
      }
      pageNumerator += maximum;
      const n = length - lag;
      pageDenominator += n * (n - 1);
    }
    at += length;
  }
  assert.equal(at, values.length);
  return {
    bestGlobalCoefficient: bookBest.a,
    globalIoC: bookBest.pairs / bookDenominator,
    pageAnyCoefficientIoC: pageNumerator / pageDenominator,
    pageComparablePairs: pageDenominator,
  };
}

/**
 * Explicit causal cipher, with any page-local secret coefficient and offset.
 * First lag positions use zero IV; omitted positions can instead have
 * arbitrary IVs without changing the tested invariant.
 * @param {number[]} text
 * @param {number} lag
 * @param {boolean} encrypt
 * @param {(j: number) => number} aOfPage
 * @param {(j: number) => number} bOfPage
 */
function transform(text, lag, encrypt, aOfPage, bOfPage) {
  const output = text.slice();
  let at = 0;
  for (let j = 0; j < lengths.length; j++) {
    const length = lengths[j];
    const a = aOfPage(j);
    const b = bOfPage(j);
    for (let i = 0; i < length; i++) {
      const priorCipher = i < lag ? 0 :
        (encrypt ? output[at + i - lag] : text[at + i - lag]);
      output[at + i] = mod(text[at + i] +
        (encrypt ? 1 : -1) * (a * priorCipher + b));
    }
    at += length;
  }
  return output;
}

// Source-native positive control: a page-dependent hidden multiplier and
// offset fully recover GP plaintext. A deliberately wrong inverse does not.
const planted = controlWindows[0];
for (const lag of lags) {
  const a = (page) => (7 + 3 * page) % 29;
  const b = (page) => (13 + 11 * page) % 29;
  const plantedCipher = transform(planted, lag, true, a, b);
  const recovered = transform(plantedCipher, lag, false, a, b);
  assert.deepEqual(recovered, planted, "Exact planted recovery failed");
  const wrong = transform(plantedCipher, lag, false, () => 1, () => 13);
  assert.notDeepEqual(wrong, planted, "Wrong-key control unexpectedly passed");
}

const outcomes = [];
for (const lag of lags) {
  const actual = score(original, lag);
  const controls = controlWindows.map((v) => score(v, lag));
  const globalNativeMin = Math.min(...controls.map((v) => v.globalIoC));
  const pageNativeMin = Math.min(...controls.map((v) => v.pageAnyCoefficientIoC));
  const globalNativeAtOrBelow = controls.filter(
    (v) => v.globalIoC <= actual.globalIoC).length;
  const pageNativeAtOrBelow = controls.filter(
    (v) => v.pageAnyCoefficientIoC <= actual.pageAnyCoefficientIoC).length;
  assert.equal(globalNativeAtOrBelow, 0);
  assert.equal(pageNativeAtOrBelow, 0);
  outcomes.push({
    lag,
    ...actual,
    globalNativeMin,
    pageNativeMin,
    globalNativeAtOrBelow,
    pageNativeAtOrBelow,
  });
}

console.log(JSON.stringify({
  status: "PASS",
  model: "C[i]=P[i]+a*C[i-lag]+b mod29, all a, arbitrary page-specific a/b",
  unsolvedPages: pages.length,
  unsolvedRunes: original.length,
  controlWindows: controlWindows.length,
  controlRuneLengths: controlTexts.map((v) => v.length),
  positivePlantedRoundTrips: lags.length,
  outcomes,
}, null, 2));
