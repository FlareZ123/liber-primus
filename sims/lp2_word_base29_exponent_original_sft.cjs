"use strict";

/**
 * Source-numbered, exact original-LP2 wordwise base29 exponent gate.
 * Tests the public 3301/1033 exponents and the complete secret exponent
 * family e >= 2 on fixed printed word boundaries, without fitting keys.
 *
 * Node.js 22 CommonJS SFT:
 *     node sims/lp2_word_base29_exponent_original_sft.cjs
 *
 * No writes, external packages, network or probabilistic language scores.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const glyph = new Map(corpus.runes.map((r, i) => [r, i]));
const runeWords = (text) => (text.match(/[\u16A0-\u16FF]+/gu) || [])
  .map((s) => [...s].map((r) => {
    const value = glyph.get(r);
    assert(Number.isInteger(value) && value >= 0 && value < 29);
    return value;
  }));
const original = runeWords(transcription.split("%")
  .slice(0, 55).join("").replace(/\/\s*/gu, ""));
assert.equal(original.length, 2896);
assert.equal(original.flat().length, 12956);
assert.deepEqual(original[0], corpus.pages[0].indices.slice(0, 8));
const solvedP57 = runeWords(transcription.split("%")[56]
  .replace(/\/\s*/gu, ""));
assert.equal(solvedP57.flat().length, 95);
assert.deepEqual(solvedP57.flat(), corpus.pages.find((p) => p.page === 57).indices);

const BASE = 29n;
const mod = (a, n) => ((a % n) + n) % n;

/** @param {bigint} value @param {bigint} exponent @param {bigint} modulus */
function modPow(value, exponent, modulus) {
  let out = 1n;
  while (exponent !== 0n) {
    if (exponent & 1n) out = out * value % modulus;
    value = value * value % modulus;
    exponent >>= 1n;
  }
  return out;
}

/** @param {bigint} a @param {bigint} modulus */
function inverse(a, modulus) {
  let [oldR, r, oldT, t] = [modulus, mod(a, modulus), 0n, 1n];
  while (r !== 0n) {
    const q = oldR / r;
    [oldR, r] = [r, oldR - q * r];
    [oldT, t] = [t, oldT - q * t];
  }
  assert.equal(oldR, 1n);
  return mod(oldT, modulus);
}

/** @param {number[]} word @param {boolean} lsdFirst */
function asInteger(word, lsdFirst) {
  const digits = lsdFirst ? [...word].reverse() : word;
  return digits.reduce((value, digit) => value * BASE + BigInt(digit), 0n);
}

/** @param {bigint} value @param {number} length @param {boolean} lsdFirst */
function asDigits(value, length, lsdFirst) {
  const digits = Array(length);
  for (let j = length - 1; j >= 0; j--) {
    digits[j] = Number(value % BASE);
    value /= BASE;
  }
  assert.equal(value, 0n);
  return lsdFirst ? digits.reverse() : digits;
}

/** @param {number[]} word @param {boolean} lsdFirst */
function valuation(word, lsdFirst) {
  const digits = lsdFirst ? word : [...word].reverse();
  let n = 0;
  while (n < digits.length && digits[n] === 0) n++;
  return n;
}

/** @param {number[][]} words @param {bigint} exponent @param {boolean} lsdFirst */
function directPower(words, exponent, lsdFirst) {
  const scores = [];
  const counts = Array(29).fill(0);
  let units = 0;
  let invertible = 0;
  let impossible = 0;
  for (const word of words) {
    const length = word.length;
    const modulus = BASE ** BigInt(length);
    const phi = 28n * BASE ** BigInt(length - 1);
    const c = asInteger(word, lsdFirst);
    if (c % BASE === 0n) {
      if (c !== 0n) impossible++;
      continue;
    }
    units++;
    const exponentInverse = inverse(exponent, phi);
    const out = modPow(c, exponentInverse, modulus);
    assert.equal(modPow(out, exponent, modulus), c);
    const digits = asDigits(out, length, lsdFirst);
    assert.equal(asInteger(digits, lsdFirst), out);
    for (const digit of digits) counts[digit]++;
    invertible++;
    if (scores.length < 5) scores.push(digits.map((v) => corpus.translit[v]).join("."));
  }
  const count = counts.reduce((a, b) => a + b, 0);
  const ioc = counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (count * (count - 1));
  return {exponent: exponent.toString(), lsdFirst, words: words.length,
    units, nonzeroNonunitCipherwords: impossible,
    zeroCipherwords: words.length - units - impossible,
    unitWordsWithExactForwardRecovery: invertible,
    unitOnlyInverseIoC: ioc, firstFiveUnitDecodes: scores};
}

const outputs = [];
for (const exponent of [3301n, 1033n]) {
  for (const lsdFirst of [false, true]) {
    outputs.push(directPower(original, exponent, lsdFirst));
  }
}
// A nonzero 29-adic number of valuation 1 cannot be an e-th power
// modulo 29^L for ANY integer exponent e>=2: its putative source
// valuation would have to be 1/e (not an integer).
for (const lsdFirst of [false, true]) {
  const nonzeroOne = original.filter((word) =>
    valuation(word, lsdFirst) === 1 && word.length > 1).length;
  const nonzeroHigher = original.filter((word) => {
    const v = valuation(word, lsdFirst);
    return v >= 2 && v < word.length;
  }).length;
  const zeroWords = original.filter((word) =>
    valuation(word, lsdFirst) === word.length).length;
  assert.equal(nonzeroOne, lsdFirst ? 115 : 81);
  assert.equal(nonzeroHigher, lsdFirst ? 1 : 0);
  assert.equal(zeroWords, 1);
  assert(outputs.filter((o) => o.lsdFirst === lsdFirst)
    .every((o) => o.nonzeroNonunitCipherwords === nonzeroOne + nonzeroHigher));

  // Native p57 control on the units of the known GP29 plaintext. Here,
  // encode by the e-th power and invert using e^-1 (mod phi(29^L)).
  let recovered = 0;
  let plantedUnits = 0;
  for (const word of solvedP57) {
    const w = asInteger(word, lsdFirst);
    if (w % BASE === 0n) continue;
    plantedUnits++;
    const modulus = BASE ** BigInt(word.length);
    const exponent = 3301n;
    const phi = 28n * BASE ** BigInt(word.length - 1);
    const cipher = modPow(w, exponent, modulus);
    const output = modPow(cipher, inverse(exponent, phi), modulus);
    assert.equal(output, w);
    assert.deepEqual(asDigits(output, word.length, lsdFirst), word);
    recovered += word.length;
  }
  assert(plantedUnits > 10);
  assert(recovered > 30);
  outputs.push({lsdFirst, sourceNativeSolvedP57Plant: true,
    exactRecoveredRunes: recovered, exactRecoveredUnitWords: plantedUnits,
    exponent: "3301"});
}
// The stronger no-go uses no English assumptions and no chosen exponent:
// a source ciphertext with a 29-adic valuation of exactly 1 cannot be
// the image of any exponent >=2 on the complete 29-adic word ring.
const report = {
  original: {words: 2896, runes: 12956},
  publicExponents: [3301, 1033],
  modulus: "29^originalPrintedWordRuneLength",
  result: "DIRECT WORDWISE INTEGER POWER EXCLUDED EXACTLY for every exponent >=2, in both printed/reversed rune orders, under unmodified original segmentation",
  valuationOneNonzeroCipherwords: {MSD_first: 81, LSD_first: 115},
  valuedTwoNonzeroCipherwords: {MSD_first: 0, LSD_first: 1},
  outputs,
  scope: "Only direct modulus-29^L word exponentiation, with no pre/postprocessing, variable base, altered boundaries, or other transport"
};
if (require.main === module) console.log(JSON.stringify(report, null, 2));
module.exports = {asInteger, asDigits, modPow, inverse, valuation, directPower};
