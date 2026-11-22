"use strict";
/**
 * The fully source-selected p50 GF29 degree-nine recurrence, with p54's first
 * nine RED runes as terminal state, is inverted across the untouched prior
 * pp40..53 chapter. Grant even an arbitrary unknown key-symbol → GP29 shift
 * substitution. Fit all 29 shifts independently on untouched pp40..46 and
 * measure unseen pp47..53. This is more flexible than a bijection.
 *
 * Source-native Shakespeare ciphertext planted under an unrevealed random
 * bijection provides an exact positive inverse test. Only the planted
 * ciphertext's source mapping is known to the harness.
 *
 * Node22 CommonJS Windows, no writes, no CLI params.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const root = path.resolve(__dirname, "..");
/** @param {string} f @returns {string} */
const read = f => fs.readFileSync(path.join(root, f), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const factor = [11, 15, 0, 9, 1, 5, 10, 20, 12, 1];
const period = 29;
/** @param {number} n @returns {number} */
const mod = n => (n % period + period) % period;
const red9 = corpus.pages[54].indices.slice(0, 9);
const chapter = corpus.pages.filter(p => p.page >= 40 && p.page <= 53);
const original = chapter.flatMap(p => p.indices);
const trainN = chapter.filter(p => p.page <= 46)
  .reduce((n, p) => n + p.indices.length, 0);
assert.deepEqual(red9, [24,19,21,23,27,2,14,10,19]);
assert.equal(original.length, 3008);
assert.equal(trainN, 1863);
assert.equal(original.length - trainN, 1145);
assert.equal(grid.byte_rows.flat().length, 256);

// Reprove exact p50 factor on the unmodified coefficient tape.
const r = grid.byte_rows.flat().reverse().map(mod);
for (let i = r.length - 1; i >= 9; i--) {
  const a = r[i];
  for (let j = 0; j <= 9; j++)
    r[i - 9 + j] = mod(r[i - 9 + j] - a * factor[j]);
}
assert.deepEqual(r.slice(0, 9), Array(9).fill(0));

/** @param {number[]} end9 @returns {number[]} */
function backwards(end9) {
  const state = end9.slice();
  for (let n = 0; n < original.length; n++) {
    let sum = state[8];
    for (let j = 1; j <= 8; j++) sum += factor[j] * state[j - 1];
    state.unshift(mod(-8 * sum));
    state.pop();
  }
  const all = state.slice();
  for (let n = 0; n < original.length; n++) {
    let sum = 0;
    for (let j = 0; j <= 8; j++)
      sum += factor[j] * all[all.length - 9 + j];
    all.push(mod(-sum));
  }
  assert.deepEqual(all.slice(original.length), end9);
  return all.slice(0, original.length);
}
/**
 * Alternative: red9 at end tells the INITIAL state, run forward on p40–53.
 * @param {number[]} initial9
 * @returns {number[]}
 */
function forwards(initial9) {
  const all = initial9.slice();
  while (all.length < original.length) {
    let sum = 0;
    for (let j = 0; j < 9; j++)
      sum += factor[j] * all[all.length - 9 + j];
    all.push(mod(-sum));
  }
  return all.slice(0, original.length);
}
const freq = Array(period).fill(0.5);
for (const r of encodeSourceNativeGP(read(
  "resources/control/gibran_prophet_58585.txt"))) freq[r]++;
const total = freq.reduce((a, b) => a + b);
const logFreq = freq.map(n => Math.log(n / total));
const shakespeare = encodeSourceNativeGP(read(
  "resources/control/shakespeare_first300k.txt"));
const native = shakespeare.slice(5000, 8008);
assert.equal(native.length, original.length);

// Freeze before reading original: xorshifted Fisher-Yates 29-permutation.
let state = 3301;
/** @returns {number} */
function random() {
  state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
  return state / 4294967296;
}
const secretMap = Array.from({length:period}, (_,i) => i);
for (let i = 28; i > 0; i--) {
  const j = Math.floor(random() * (i + 1));
  [secretMap[i], secretMap[j]] = [secretMap[j], secretMap[i]];
}
assert.equal(new Set(secretMap).size, 29);

/**
 * Rowwise independent MLE of the unknown mapping under source-native unigram
 * English; more permissive than any 29-way permutation. No information from
 * the heldout pp47..53 is used. Recovered shifts can coincide.
 *
 * @param {number[]} ciphertext
 * @param {number[]} states
 * @returns {{map:number[],trainNLL:number,holdoutNLL:number,
 *            distinctShifts:number,minTrainKeyObservations:number,
 *            minHeldoutKeyObservations:number}}
 */
function learnAndTest(ciphertext, states) {
  const map = Array(period).fill(0);
  const trainCounts = Array(period).fill(0), testCounts = Array(period).fill(0);
  for (let q = 0; q < period; q++) {
    let best = -Infinity;
    for (let shift = 0; shift < period; shift++) {
      let ll = 0;
      for (let i = 0; i < trainN; i++) {
        if (states[i] === q) ll += logFreq[mod(ciphertext[i] - shift)];
      }
      if (ll > best) { best = ll; map[q] = shift; }
    }
  }
  let trainLoss = 0, heldLoss = 0;
  for (let i = 0; i < ciphertext.length; i++) {
    const q = states[i], plain = mod(ciphertext[i] - map[q]);
    if (i < trainN) {
      trainCounts[q]++;
      trainLoss -= logFreq[plain];
    } else {
      testCounts[q]++;
      heldLoss -= logFreq[plain];
    }
  }
  return {
    map,
    trainNLL: trainLoss / trainN,
    holdoutNLL: heldLoss / (ciphertext.length - trainN),
    distinctShifts: new Set(map).size,
    minTrainKeyObservations: Math.min(...trainCounts),
    minHeldoutKeyObservations: Math.min(...testCounts)
  };
}
const cases = [];
for (const [direction, derive] of [
  ["terminal-state-backward", backwards],
  ["end-rubric-supplies-forward-initial-state", forwards]
]) {
for (const [name, terminal] of [
  ["red9",red9],["reverse-red9",red9.slice().reverse()]
]) {
  const key = derive(terminal);
  const actual = learnAndTest(original, key);
  const encrypted = native.map((p, i) => mod(p + secretMap[key[i]]));
  const positive = learnAndTest(encrypted, key);
  const exactMapRecovered = positive.map.filter((x, i) => x === secretMap[i]).length;
  assert.equal(exactMapRecovered, 29);
  assert.equal(positive.distinctShifts, 29);
  assert.deepEqual(encrypted.map((c,i)=>mod(c-positive.map[key[i]])),native);
  cases.push({
    temporalDirection:direction, orientation:name,
    sourceOriginal:{
      trainingNativeNLL:actual.trainNLL,
      untouchedHoldoutNativeNLL:actual.holdoutNLL,
      distinctShiftLabels:actual.distinctShifts,
      minTrainingObservationsPerState:actual.minTrainKeyObservations,
      minHeldoutObservationsPerState:actual.minHeldoutKeyObservations
    },
    sourceNativeEnglishPlant:{
      trainingNativeNLL:positive.trainNLL,
      untouchedHoldoutNativeNLL:positive.holdoutNLL,
      exactSecretShiftTableSymbolsRecovered:exactMapRecovered,
      exactPlaintextRecovery:true
    }
  });
}
}
assert.deepEqual(cases.map(x =>
  Number(x.sourceOriginal.untouchedHoldoutNativeNLL.toFixed(9))),
  [4.165590652,4.134855744,4.104821714,4.230320532]);
assert.deepEqual(cases.map(x =>
  Number(x.sourceNativeEnglishPlant.untouchedHoldoutNativeNLL.toFixed(9))),
  [2.956625867,2.956625867,2.956625867,2.956625867]);
assert(cases.every(x =>
  x.sourceOriginal.untouchedHoldoutNativeNLL >
  x.sourceNativeEnglishPlant.untouchedHoldoutNativeNLL + 1));
console.log(JSON.stringify({
  classification: "Exact source-conditional out-of-sample negative; no plaintext",
  upstream: "p50 true degree-nine factor and p54 source-red9 terminal-state premise",
  learnedCipher: "arbitrary, not necessarily injective, GP29 key-symbol-to-shift map",
  originalData: {
    pages40to53:14, untouchedRuneCount:original.length,
    trainPages:"40..46", trainRunes:trainN,
    heldoutPages:"47..53", heldoutRunes:original.length - trainN
  },
  genuineEnglishControl: {
    training:"Gibran source-native GP29",
    plantedPlaintext:"untouched Shakespeare excerpt, 3008 source-native runes",
    secretMap:secretMap,
    sourceMapRecoveredIndependently:true
  },
  cases,
  outcome:"Neither backward terminal-state nor forward initial-state interpretation, with either red9 orientation, predicts native English in untouched heldout ciphertext even with 29 independently trained shifts."
},null,2));
