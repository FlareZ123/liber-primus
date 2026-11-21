"use strict";

/**
 * SFT: Try each source-selected signed-2016 clause as a cyclic GP29
 * additive key on the untouched original page that emitted its word indices.
 *
 * The key selector is retrospective (sorted outer-H fourword packets).
 * This test is a finite original-cipher consumer, not a claim of plaintext.
 *
 * Windows Node.js 22. All input and output is read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const load = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const signed = load("resources/historical/cicada2016-4gq25-outguess.asc")
  .replace(/\r\n/g, "\n").split("\n\n").slice(1).join("\n\n")
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/7A35090F/g, "").match(/[A-Za-z]+/g)
  .map(word => word.toUpperCase());
assert.equal(signed.length, 43);
const GP = corpus.translit.map((rune, index) => ({ rune, index }))
  .sort((a, b) => b.rune.length - a.rune.length);
const normal = value => value.toUpperCase().replace(/QU/g, "CW")
  .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
/** @param {string} word @returns {number[]} */
function gpWord(word) {
  const source = normal(word);
  const result = [];
  for (let cursor = 0; cursor < source.length;) {
    const token = GP.find(item => source.startsWith(item.rune, cursor));
    if (!token) return [];
    result.push(token.index);
    cursor += token.rune.length;
  }
  return result;
}
/** @param {string} text @returns {number[]} */
function gpText(text) {
  return (text.match(/[A-Za-z]+/g) || []).flatMap(word => gpWord(word));
}
const train = gpText(load("resources/control/shakespeare_first300k.txt"));
const heldout = gpText(load("resources/control/gibran_prophet_58585.txt"));
assert.ok(train.length > 200000);
assert.ok(heldout.length > 60000);
const triple = new Uint32Array(29 * 29 * 29);
const pair = new Uint32Array(29 * 29);
for (let i = 2; i < train.length; i++) {
  const ab = 29 * train[i - 2] + train[i - 1];
  triple[29 * ab + train[i]]++;
  pair[ab]++;
}
const alpha = 0.5;
/** @param {number[]} values @returns {number} */
function score(values) {
  let logSum = 0;
  for (let i = 2; i < values.length; i++) {
    const ab = 29 * values[i - 2] + values[i - 1];
    logSum += Math.log((triple[29 * ab + values[i]] + alpha)
      / (pair[ab] + 29 * alpha));
  }
  return logSum / (values.length - 2);
}
const mod = value => ((value % 29) + 29) % 29;
/**
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {number} anchor
 * @param {number} sign
 * @param {boolean} transparentF
 * @returns {number[]}
 */
function decode(ciphertext, key, anchor, sign, transparentF) {
  const consumed = [0];
  for (const value of ciphertext) {
    consumed.push(consumed[consumed.length - 1] + (transparentF && value === 0 ? 0 : 1));
  }
  return ciphertext.map((value, i) => {
    if (transparentF && value === 0) return 0;
    const phase = modClock(consumed[i] - consumed[anchor], key.length);
    return mod(value + sign * key[phase]);
  });
}
/** @param {number} phase @param {number} length */
function modClock(phase, length) {
  return ((phase % length) + length) % length;
}
const cases = [
  { page: 12, start: 122, end: 130, wordRange: [5, 9], expectedKeyLength: 22 },
  { page: 14, start: 64, end: 73, wordRange: [19, 23], expectedKeyLength: 13 },
  { page: 46, start: 39, end: 46, wordRange: [10, 14], expectedKeyLength: 13 }
];
const results = [];
for (const scenario of cases) {
  const ciphertext = corpus.pages.find(p => p.page === scenario.page).indices;
  const clause = signed.slice(...scenario.wordRange).join(" ");
  const key = gpText(clause);
  assert.equal(key.length, scenario.expectedKeyLength);
  const tail = ciphertext.slice(scenario.end);
  assert.ok(tail.length >= 64);
  const nativeControl = [];
  for (let i = 0; i + tail.length <= heldout.length; i += tail.length) {
    nativeControl.push(score(heldout.slice(i, i + tail.length)));
  }
  const leastLinguisticNative = Math.min(...nativeControl);
  const candidates = [];
  for (const anchor of [0, scenario.start, scenario.end]) {
    for (const reverse of [false, true]) {
      const k = reverse ? [...key].reverse() : key;
      for (const sign of [-1, +1]) {
        for (const transparentF of [false, true]) {
          const output = decode(ciphertext, k, anchor, sign, transparentF);
          if (!transparentF) {
            assert.deepEqual(output.map((p, i) => mod(p - sign *
              k[modClock(i - anchor, k.length)])), ciphertext);
          }
          candidates.push({
            anchor, reverse, sign, transparentF,
            scoreAfter: score(output.slice(scenario.end)),
            scoreAll: score(output),
            outputPrefix: output.slice(scenario.end, scenario.end + 30)
              .map(i => corpus.translit[i]).join("-")
          });
        }
      }
    }
  }
  assert.equal(candidates.length, 24);
  candidates.sort((a, b) => b.scoreAfter - a.scoreAfter);
  const best = candidates[0];
  assert.ok(best.scoreAfter < leastLinguisticNative,
    "The source-clause direct cipher must underperform the weakest native text");
  results.push({
    page: scenario.page, clause,
    clauseGPKey: key.map(i => corpus.translit[i]).join("-"),
    ciphertextTailRunes: tail.length,
    ciphertextTailTrigramScore: score(tail),
    lowestNativeHeldoutScore: leastLinguisticNative,
    nativeHeldoutWindows: nativeControl.length,
    bestCipherConsumer: best,
    worstCipherConsumerScore: candidates.at(-1).scoreAfter,
    anyNativeLike: candidates.some(candidate => candidate.scoreAfter >= leastLinguisticNative)
  });
}
const solvedP57 = score(corpus.pages.find(p => p.page === 57).indices);
assert.ok(solvedP57 > -3.1);
console.log(JSON.stringify({
  status: "PASS",
  input: {
    pages: [12, 14, 46], consumerFamily: "GP29 cyclic additive",
    sampleCount: 72, signs: ["plus", "minus"],
    key: "verbatim GP spelling of fixed 2016 signed-clause readout",
    possibleAnchor: ["pageStart", "packetStart", "packetEnd"],
    keyOrdering: ["normal", "reversed"],
    literalCipherFSkip: [false, true]
  },
  linguisticCalibration: {
    ShakespeareTrainingRunes: train.length,
    independentGibranRunes: heldout.length,
    authenticClearP57TrigramScore: solvedP57
  },
  originalSource: results,
  classification: "All frozen source-clause direct GP29 consumers fail native plaintext"
}, null, 2));
