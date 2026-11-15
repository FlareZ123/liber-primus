"use strict";

/**
 * Exact all-secret word-rekeyed ciphertext-feedback equality invariant.
 *
 * Model: for printed word w and j >= 1,
 *   C[w,j] = C[w,j-1] + perm_w(P[w,j]) (mod 29),
 * where perm_w is any independent unknown permutation of the 29 GP runes.
 * The first symbol of every word may use an arbitrary other secret map.
 *
 * Then C[w,j]-C[w,j-1] = perm_w(P[w,j]); equality between any
 * two within-word differences is independent of ALL secret permutations.
 *
 * Single-file test: node sims/lp2_wordrekey_cipherfeedback_equality_sft.cjs
 * Node 22, CommonJS, no network, third-party dependencies or file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {encodeSourceNativeGP} =
  require("./lp2_native_gp_source_orthography_sft.cjs");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(ROOT, name), "utf8");
}
const gpBytes = fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"));
const gp = JSON.parse(gpBytes.toString("utf8"));
const index = new Map(gp.runes.map((r, i) => [r, i]));
const typed = read("resources/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%")
  .replace(/\/\r?\n/g, "")
  .replace(/[\r\n%]/g, "");
const rx = new RegExp("[" + gp.runes.join("") + "]+", "gu");
const original = (typed.match(rx) || [])
  .map(word => Array.from(word, glyph => {
    const rune = index.get(glyph);
    assert.notEqual(rune, undefined);
    return rune;
  }));
assert.equal(original.length, 2896);
assert.deepEqual(original.flat(), gp.pages
  .filter(p => p.page < 56).flatMap(p => p.indices));
assert.equal(original.flat().length, 12956);

/**
 * Equal unordered pairs among positions 1..end of one native GP word.
 * @param {number[]} word
 * @returns {number}
 */
function suffixPairs(word) {
  const h = Array(29).fill(0);
  for (let j = 1; j < word.length; j++) h[word[j]]++;
  return h.reduce((s, v) => s + v * (v - 1) / 2, 0);
}

/**
 * Equal unordered pairs of consecutive ciphertext differences within word.
 * @param {number[]} word
 * @returns {number}
 */
function deltaPairs(word) {
  const h = Array(29).fill(0);
  for (let j = 1; j < word.length; j++) {
    h[(word[j] - word[j - 1] + 29) % 29]++;
  }
  return h.reduce((s, v) => s + v * (v - 1) / 2, 0);
}

/** @param {number} x @returns {number} */
function xorshift32(x) {
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return x >>> 0;
}

const observedPairs = original.reduce((s, word) => s + deltaPairs(word), 0);
const eligiblePairs = original.reduce((s, word) => {
  const k = word.length - 1;
  return s + k * (k - 1) / 2;
}, 0);
assert.deepEqual([observedPairs, eligiblePairs], [744, 20221]);

const latinAlphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
/** @param {string} text @returns {number[][]} */
function latinWords(text) {
  return text.split(/\r?\n/)
    .filter(line => line.length > 0 && !line.trimStart().startsWith("#"))
    .map(line => Array.from(line, ch => {
      const i = latinAlphabet.indexOf(ch);
      assert.ok(i >= 0, "Invalid Latin-GP source symbol " + ch);
      return i;
    }));
}

const sources = [
  ["shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["gibran", "resources/control/gibran_prophet_58585.txt"],
  ["emerson", "resources/control/emerson_essays_2944.txt"],
  ["latin", "resources/control/latin-vulgate-gp-wholewords.txt"]
];

/**
 * Positive control: 2,896 entirely independent, arbitrary secret bijections.
 * Each word's first rune is independently masked, and all other runes
 * propagate via encrypted-ciphertext feedback. No plaintext is used during
 * inversion except the known planted keys.
 *
 * @param {number[][]} plain
 * @returns {{recoveredRunes:number,plainPairs:number,cipherPairs:number}}
 */
function positivePlant(plain) {
  let recoveredRunes = 0;
  let plainPairs = 0;
  let cipherPairs = 0;
  for (let i = 0; i < plain.length; i++) {
    const word = plain[i];
    const shift = (7 * i + 13) % 29;
    let seed = (0x33013829 ^ Math.imul(i + 1, 0x9e3779b9)) >>> 0;
    const permutation = Array.from({length: 29}, (_, v) => v);
    for (let j = 28; j > 0; j--) {
      seed = xorshift32(seed);
      const k = seed % (j + 1);
      [permutation[j], permutation[k]] = [permutation[k], permutation[j]];
    }
    const inverse = Array(29);
    for (let j = 0; j < 29; j++) inverse[permutation[j]] = j;
    assert.equal(new Set(permutation).size, 29);
    const ciphertext = [(word[0] + shift) % 29];
    const recovered = [(ciphertext[0] - shift + 29) % 29];
    for (let j = 1; j < word.length; j++) {
      const diff = permutation[word[j]];
      ciphertext.push((ciphertext[j - 1] + diff) % 29);
      const decodedDiff = (ciphertext[j] - ciphertext[j - 1] + 29) % 29;
      recovered.push(inverse[decodedDiff]);
    }
    assert.deepEqual(recovered, word);
    plainPairs += suffixPairs(word);
    cipherPairs += deltaPairs(ciphertext);
    recoveredRunes += recovered.length;
  }
  assert.equal(recoveredRunes, 12956);
  assert.equal(cipherPairs, plainPairs);
  return {recoveredRunes, plainPairs, cipherPairs};
}

const SAMPLES = 5000;
const controls = [];
let plant = null;
for (const [name, filename] of sources) {
  const text = read(filename);
  const nativeWords = name === "latin" ? latinWords(text) :
    (text.match(/[A-Za-z]+/g) || []).map(encodeSourceNativeGP);
  const byLength = new Map();
  for (const word of nativeWords) {
    let pool = byLength.get(word.length);
    if (!pool) {
      pool = [];
      byLength.set(word.length, pool);
    }
    pool.push({word, samePairs: suffixPairs(word)});
  }
  let expectation = 0;
  let variance = 0;
  for (const word of original) {
    const pool = byLength.get(word.length);
    assert.ok(pool && pool.length, "Missing GP word length in " + name);
    const mean = pool.reduce((s, v) => s + v.samePairs, 0) / pool.length;
    expectation += mean;
    variance += pool.reduce((s, v) =>
      s + (v.samePairs - mean) ** 2, 0) / pool.length;
  }
  let seed = 0x33013829;
  let minimum = Infinity;
  let maximum = -Infinity;
  let total = 0;
  let notGreater = 0;
  for (let trial = 0; trial < SAMPLES; trial++) {
    let score = 0;
    const firstPlain = trial === 0 && name === "shakespeare" ? [] : null;
    for (const originalWord of original) {
      seed = xorshift32(seed);
      const pool = byLength.get(originalWord.length);
      const selected = pool[seed % pool.length];
      score += selected.samePairs;
      if (firstPlain) firstPlain.push(selected.word);
    }
    if (firstPlain) plant = positivePlant(firstPlain);
    minimum = Math.min(minimum, score);
    maximum = Math.max(maximum, score);
    total += score;
    if (score <= observedPairs) notGreater++;
  }
  assert.ok(minimum > observedPairs,
    name + ": source-native reference did not reject original");
  controls.push({
    name,
    sourceWords: nativeWords.length,
    expectedPairs: Number(expectation.toFixed(4)),
    standardDeviation: Number(Math.sqrt(variance).toFixed(4)),
    zBelowExpected: Number(((observedPairs - expectation) /
      Math.sqrt(variance)).toFixed(4)),
    referenceBooks: SAMPLES,
    minimumPairs: minimum,
    maximumPairs: maximum,
    simulatedMeanPairs: total / SAMPLES,
    referenceBooksAtOrBelowOriginal: notGreater,
    conservativePlusOneTail: (notGreater + 1) / (SAMPLES + 1)
  });
}
assert.ok(plant && plant.recoveredRunes === 12956);
assert.deepEqual(controls.map(x => x.sourceWords),
  [55407, 15733, 77932, 39835]);
assert.deepEqual(controls.map(x => x.minimumPairs),
  [942, 909, 892, 967]);
console.log(JSON.stringify({
  classification: "source-native-conditional all-secret word-specific bijection exclusion",
  inputCorpusSha256: crypto.createHash("sha256").update(gpBytes).digest("hex"),
  originalPrintedWords: original.length,
  originalRuneCount: 12956,
  eligiblePairs,
  originalSameDeltaPairs: observedPairs,
  originalSameDeltaRate: observedPairs / eligiblePairs,
  model: "independent arbitrary 29! difference-output permutation per complete printed word; first rune freely keyed",
  controls,
  positivePlant: plant,
  recoveredUnknownPlaintext: false,
  caveat: "Only printed-boundary-preserving GP29 native-plaintext register, stationary within-word bijective output and previous-ciphertext feedback."
}, null, 2));
