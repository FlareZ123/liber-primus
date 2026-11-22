"use strict";
/**
 * LP2 p54 red nine as terminal state of the authentic p50 GF29 degree-nine
 * primitive factor, run BACKWARD over the preceding pp40..53 (3008 runes).
 * This orientation is distinct from the forward p54/p55 test. Every input
 * and key state is source frozen. Windows 11 Node.js 22 standalone SFT.
 *
 * No extra key-clock skips, fitted phase, discarded original F runes,
 * alternate polynomials, or hidden punctuation assumptions.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} f @returns {string} */
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const source = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const FACTOR = [11, 15, 0, 9, 1, 5, 10, 20, 12, 1];
const MOD = 29;
/** @param {number} x @returns {number} */
const mod = x => ((x % MOD) + MOD) % MOD;
const seed = source.pages.find(p => p.page === 54).indices.slice(0, 9);
const pp40to53 = source.pages.filter(p => p.page >= 40 && p.page <= 53);
const original = pp40to53.flatMap(p => p.indices);
assert.deepEqual(seed, [24, 19, 21, 23, 27, 2, 14, 10, 19]);
assert.equal(original.length, 3008);
assert.equal(table.byte_rows.flat().length, 256);
assert.deepEqual(FACTOR, [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]);

// Verify the factor against the untouched original table coefficient stream.
const remainder = table.byte_rows.flat().reverse().map(mod);
for (let i = remainder.length - 1; i >= FACTOR.length - 1; i--) {
  const a = remainder[i];
  for (let j = 0; j < FACTOR.length; j++) {
    remainder[i - FACTOR.length + 1 + j] =
      mod(remainder[i - FACTOR.length + 1 + j] - a * FACTOR[j]);
  }
}
assert.deepEqual(remainder.slice(0, 9), Array(9).fill(0));
assert.equal(mod(FACTOR[0] * 8), 1);

/** @param {number[]} state @returns {number} */
function prior(state) {
  assert.equal(state.length, 9);
  let s = state[8];
  for (let j = 1; j < 9; j++) s += FACTOR[j] * state[j - 1];
  return mod(-8 * s);
}
/** @param {number[]} nine @returns {number} */
function next(nine) {
  let s = 0;
  for (let j = 0; j < 9; j++) s += FACTOR[j] * nine[j];
  return mod(-s);
}
/**
 * Exactly invert a terminal nine-state checkpoint n times and reconstruct
 * its entire key history. The code checks the published ending checkpoint.
 * @param {number[]} terminalNine
 * @param {number} n
 * @returns {number[]}
 */
function reverseKey(terminalNine, n) {
  const window = terminalNine.slice();
  for (let j = 0; j < n; j++) {
    window.unshift(prior(window));
    window.pop();
  }
  const reconstructed = window.slice();
  while (reconstructed.length < n + 9) {
    reconstructed.push(next(reconstructed.slice(-9)));
  }
  assert.deepEqual(reconstructed.slice(n, n + 9), terminalNine);
  return reconstructed.slice(0, n);
}
/**
 * @param {number[]} values GP29
 * @returns {number} IoC
 */
function ioc(values) {
  const count = new Uint32Array(MOD);
  for (const value of values) count[value]++;
  return count.reduce((s, v) => s + v * (v - 1), 0) /
    (values.length * (values.length - 1));
}
const gibran = encodeSourceNativeGP(read("resources/control/gibran_prophet_58585.txt"));
const nativeWords = gibran.slice(7000, 7000 + original.length);
assert.equal(nativeWords.length, original.length);
const freq = Array(MOD).fill(0.5);
for (const symbol of gibran) freq[symbol]++;
const denominator = freq.reduce((a, b) => a + b);
for (let i = 0; i < MOD; i++) freq[i] /= denominator;
/** @param {number[]} values @returns {number} */
const crossEntropy = values => -values.reduce((s, v) => s + Math.log(freq[v]), 0) /
  values.length;
/** @param {number[]} plain @param {number[]} key @param {1|-1} sign */
function encrypt(plain, key, sign) {
  return plain.map((p, i) => mod(p + sign * key[i]));
}
/** @param {number[]} ciphertext @param {number[]} key @param {1|-1} sign */
function decode(ciphertext, key, sign) {
  return ciphertext.map((c, i) => mod(c - sign * key[i]));
}
const syntheticPlain = Array.from({length: original.length},
  (_, i) => source.pages[57].indices[i % source.pages[57].indices.length]);
assert(ioc(syntheticPlain) > 0.05);
const configurations = [];
for (const [orientation, checkpoint] of [
  ["terminal-nine-forward", seed],
  ["terminal-nine-reverse", seed.slice().reverse()]
]) {
  const key = reverseKey(checkpoint, original.length);
  for (const sign of [-1, 1]) {
    const plant1 = encrypt(syntheticPlain, key, sign);
    const plant2 = encrypt(nativeWords, key, sign);
    assert.deepEqual(decode(plant1, key, sign), syntheticPlain);
    assert.deepEqual(decode(plant2, key, sign), nativeWords);
    const plaintext = decode(original, key, sign);
    assert.deepEqual(encrypt(plaintext, key, sign), original);
    configurations.push({
      orientation, sign, keyFirstNine: key.slice(0, 9),
      originalIoC: ioc(plaintext),
      originalNativeUnigramNegativeLogLikelihood: crossEntropy(plaintext),
      originalFirst48: plaintext.slice(0, 48)
        .map(index => source.translit[index]).join(""),
      plantedNativeGPRecoveredExactly: true,
      plantedP57RecoveredExactly: true
    });
  }
}
assert.deepEqual(configurations.map(row => Number(row.originalIoC.toFixed(9))),
  [0.034412612, 0.034373695, 0.034366399, 0.034482042]);
assert(configurations.every(row => row.originalIoC < 0.04));
assert(configurations.every(row =>
  row.originalNativeUnigramNegativeLogLikelihood > 4.1));
console.log(JSON.stringify({
  classification: "Conditional original-cipher negative, no recovered plaintext",
  sourceEvidence: "p50 full GF29 primitive degree9 factor and p54 first nine red runes",
  hypothesis: "p54 red9 is terminal state of backward degree9 recurrence for pp40..53",
  sourcePages: pp40to53.map(p => p.page),
  originalRunes: original.length, originalIoC: ioc(original),
  authenticP57NativePlaintextControlIoC: ioc(syntheticPlain),
  authenticGibranNativePlaintextControlIoC: ioc(nativeWords),
  originalNativeUnigramNegativeLogLikelihood: crossEntropy(original),
  nativePlaintextControlCrossEntropy: crossEntropy(nativeWords),
  configurations,
  conclusion: "Four frozen reverse-LFSR additive inverses remain ciphertext-like. Terminal-state premise, alternate clocks, and other ciphers remain unresolved."
}, null, 2));
