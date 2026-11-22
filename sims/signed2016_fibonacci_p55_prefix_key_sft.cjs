"use strict";

/**
 * One frozen direct-GP test of the postselected Fibonacci 76-rune p55 key.
 *
 * Source motivation:
 *   8 + 13 + 21 + 34 = 76 = physical p55 rune count.
 * The four consecutive preceding Fibonacci pages are therefore read in the
 * natural forward direction, taking the first N runes from physical page N
 * and concatenating them. This yields one exact 76-rune GP key.
 *
 * Only the two additive orientations P=C±K mod29 are tested. No suffix key,
 * phase, permutation, alternate projection, page relabeling, or fitted
 * language model parameter is searched.
 *
 * Run: node sims/signed2016_fibonacci_p55_prefix_key_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const reference = fs.readFileSync(path.join(
  ROOT, "resources/control/emerson_essays_2944.txt"), "utf8");

const MOD = 29;
const FIB_PAGES = [8, 13, 21, 34];
const p55 = corpus.pages.find((page) => page.page === 55);
assert.ok(p55);
assert.equal(p55.status, "unsolved");
assert.equal(p55.indices.length, 76);
assert.equal(FIB_PAGES.reduce((sum, value) => sum + value, 0), 76);

/** @param {number} value @returns {number} */
function mod(value) {
  return ((value % MOD) + MOD) % MOD;
}

const key = FIB_PAGES.flatMap((pageNumber) => {
  const page = corpus.pages.find((candidate) => candidate.page === pageNumber);
  assert.ok(page && page.indices.length >= pageNumber);
  return page.indices.slice(0, pageNumber);
});
assert.equal(key.length, p55.indices.length);

const gp = new Map(corpus.translit.map((token, index) => [token, index]));
gp.set("ING", gp.get("NG"));
const tokens = [...gp.keys()].sort((a, b) => b.length - a.length);

/**
 * Encode ordinary English to the repository GP spelling convention.
 * @param {string} source
 * @returns {number[]}
 */
function encodeEnglish(source) {
  const result = [];
  for (let word of source.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    for (let offset = 0; offset < word.length;) {
      const token = tokens.find((candidate) => word.startsWith(candidate, offset));
      assert.ok(token, "Unmappable reference spelling: " + word.slice(offset));
      result.push(gp.get(token));
      offset += token.length;
    }
  }
  return result;
}

const english = encodeEnglish(reference);
assert.ok(english.length > 200000);
const tri = new Uint32Array(MOD ** 3);
const TRAIN = 50000;
for (let i = 2; i < TRAIN; i++) {
  tri[english[i - 2] * MOD * MOD + english[i - 1] * MOD + english[i]]++;
}
const alpha = 0.2;
const denominator = TRAIN - 2 + tri.length * alpha;

/**
 * Mean smoothed trigram log likelihood.
 * @param {number[]} values
 * @returns {number}
 */
function score(values) {
  let total = 0;
  for (let i = 2; i < values.length; i++) {
    const index = values[i - 2] * MOD * MOD + values[i - 1] * MOD + values[i];
    total += Math.log((tri[index] + alpha) / denominator);
  }
  return total / (values.length - 2);
}

/**
 * @param {number[]} values
 * @returns {string}
 */
function translit(values) {
  return values.map((index) => corpus.translit[index]).join("");
}

/**
 * Decrypt with the frozen 76-rune key.
 * @param {number[]} cipher
 * @param {-1|1} sign
 * @returns {number[]}
 */
function decrypt(cipher, sign) {
  assert.equal(cipher.length, key.length);
  return cipher.map((value, index) => mod(value + sign * key[index]));
}

/**
 * Matching forward emitter for the positive control.
 * @param {number[]} plain
 * @param {-1|1} sign
 * @returns {number[]}
 */
function encrypt(plain, sign) {
  assert.equal(plain.length, key.length);
  return plain.map((value, index) => mod(value - sign * key[index]));
}

const candidates = [-1, 1].map((sign) => {
  const plain = decrypt(p55.indices, sign);
  return {sign, score: score(plain), transliteration: translit(plain), plain};
});
candidates.sort((a, b) => b.score - a.score);

const controls = [];
for (let i = 0; i < 1000; i++) {
  const start = 60000 + i * 137;
  controls.push(score(english.slice(start, start + 76)));
}
controls.sort((a, b) => a - b);

const plantedPlain = english.slice(210000, 210076);
assert.equal(plantedPlain.length, 76);
for (const sign of [-1, 1]) {
  const plantedCipher = encrypt(plantedPlain, sign);
  assert.deepEqual(decrypt(plantedCipher, sign), plantedPlain);
}

const best = candidates[0];
const result = {
  classification:
    "single postselected Fibonacci-prefix p55 direct-GP additive gate; no key claim",
  source: {
    fibonacciPages: FIB_PAGES,
    segmentLengths: FIB_PAGES,
    keyRunes: key.length,
    targetPage: 55,
    targetRunes: p55.indices.length,
    keyTransliteration: translit(key)
  },
  variants: candidates.map(({plain, ...candidate}) => candidate),
  reference: {
    nativeWindows: controls.length,
    nativeMinimum: controls[0],
    nativeMedian: controls[500],
    nativeMaximum: controls.at(-1),
    candidatesBeatingNativeMinimum: candidates.filter(
      (candidate) => candidate.score >= controls[0]).length
  },
  positiveControl: {
    plantedRunes: plantedPlain.length,
    bothSignsExact: true,
    recoveredScore: score(plantedPlain)
  },
  decision: best.score >= controls[0]
    ? "Candidate reaches native-GP reference range; inspect before interpreting."
    : "Both frozen additive orientations score below every matched native-GP window; retire this direct prefix-key reading."
};
console.log(JSON.stringify(result, null, 2));
