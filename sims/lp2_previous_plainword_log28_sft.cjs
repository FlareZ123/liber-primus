"use strict";

/**
 * Source-shaped previous-plaintext-word prime-sum feedback over the GP28
 * discrete-log step register. Standalone SFT: Node.js 22, no dependencies.
 *
 * Original LP2: 55 rune-bearing physical pages p0..p55 (p50 is runeless).
 * Original words, including 32 cross-page words, are parsed by the shared
 * source transcript parser. The decoder retains all published GP29 glyphs.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const alphabet = new Map(source.runes.map((rune, i) => [rune, i]));
const {words: parsedWords, runeCount, crossPageWords} = parseSharedCorpus();
const words = parsedWords.map(({runes}) =>
  [...runes].map(rune => {
    assert.ok(alphabet.has(rune), "Unknown source rune");
    return alphabet.get(rune);
  }));
const original = words.flat();
const canonical = source.pages.filter(page => page.page <= 55)
  .flatMap(page => page.indices);
assert.equal(parsedWords.length, 2896);
assert.equal(runeCount, 12956);
assert.equal(crossPageWords, 32);
assert.deepEqual(original, canonical);
const solvedP57 = source.pages.find(page => page.page === 57).indices;
assert.equal(solvedP57.length, 95);

/** @param {number} value @param {number} n @returns {number} */
function mod(value, n) {
  return (value % n + n) % n;
}

const powers = Array(28).fill(0);
const logarithms = Array(29).fill(-1);
powers[0] = 1;
for (let i = 1; i < 28; i++) powers[i] = powers[i - 1] * 15 % 29;
for (let i = 0; i < 28; i++) {
  assert.equal(logarithms[powers[i]], -1, "15 must generate all 28 nonzero residues");
  logarithms[powers[i]] = i;
}
assert.equal(powers[27] * 15 % 29, 1);
assert.ok(logarithms.slice(1).every(k => k >= 0));

/**
 * @param {number[]} input
 * @param {1|-1} sign
 * @param {boolean} progressive
 * @param {boolean} encode
 * @param {number[]} [weight]
 * @returns {number[]}
 *
 * At i>0, source-native output transition d=C_i-C_(i-1) mod29.
 * Plaintext symbol EA (28) corresponds to d=0.
 * Otherwise d=15^((P_i-sign*K_w*factor) mod28).
 * The key K_w is the PREVIOUS DECODED plaintext word's GP prime sum mod28,
 * with K_0=0. The previous word is complete before the next key is computed.
 * Factor is 1 or j+1 within each original complete word.
 * The first rune is transmitted as its own starting state.
 */
function transform(input, sign, progressive, encode, weight = source.prime) {
  assert.equal(input.length, original.length);
  const output = [];
  let key = 0;
  let start = 0;
  for (const word of words) {
    for (let j = 0; j < word.length; j++) {
      const i = start + j;
      const symbol = input[i];
      if (i === 0) {
        output.push(symbol);
        continue;
      }
      const shift = sign * key * (progressive ? j + 1 : 1);
      if (encode) {
        output.push(symbol === 28
          ? output[i - 1]
          : mod(output[i - 1] + powers[mod(symbol - shift, 28)], 29));
      } else {
        const step = mod(symbol - input[i - 1], 29);
        output.push(step === 0 ? 28 : mod(logarithms[step] + shift, 28));
      }
    }
    let total = 0;
    for (let i = start; i < start + word.length; i++) {
      total = (total + weight[encode ? input[i] : output[i]]) % 28;
    }
    key = total;
    start += word.length;
  }
  assert.equal(start, input.length);
  return output;
}

/** @param {number[]} runes @returns {number} */
function ioc(runes) {
  const histogram = Array(29).fill(0);
  for (const rune of runes) histogram[rune]++;
  return histogram.reduce((sum, count) => sum + count * (count - 1), 0)
    / (runes.length * (runes.length - 1));
}

/** @param {number[]} runes @returns {number} */
function doublets(runes) {
  return runes.reduce((count, rune, i) =>
    count + Number(i > 0 && rune === runes[i - 1]), 0);
}
assert.equal(doublets(original), 86);
assert.equal(ioc(solvedP57).toFixed(9), "0.062709966");

// Plant known solved-p57 native plaintext cyclically in the exact 12,956-rune
// original source shape, overwriting only original 86 doublet sites with EA.
// This forces exactly those 86 source-marked ciphertext doublets.
const plant = original.map((rune, i) =>
  i > 0 && rune === original[i - 1] ? 28 : solvedP57[i % solvedP57.length]);
assert.equal(plant.filter(v => v === 28).length, 86);
assert.equal(ioc(plant).toFixed(12), "0.071689912918");
const wrongWeights = source.runes.map((_, i) => i);
const expectedOriginalIoC = {
  "constant/-1": 0.03525806967834248,
  "constant/1": 0.035283676640195015,
  "progressive/-1": 0.035318577892529165,
  "progressive/1": 0.035328015172095106
};
const expectedWrongMatches = {
  "constant/-1": 473, "constant/1": 538,
  "progressive/-1": 926, "progressive/1": 1105
};
for (const progressive of [false, true]) {
  for (const sign of [-1, 1]) {
    const key = (progressive ? "progressive" : "constant") + "/" + sign;
    const decrypted = transform(original, sign, progressive, false);
    const reencrypted = transform(decrypted, sign, progressive, true);
    assert.deepEqual(reencrypted, original, "Original re-encryption: " + key);
    assert.ok(Math.abs(ioc(decrypted) - expectedOriginalIoC[key]) < 1e-13);
    assert.equal(decrypted.filter(v => v === 28).length, 86);

    const plantedCipher = transform(plant, sign, progressive, true);
    const recovered = transform(plantedCipher, sign, progressive, false);
    assert.deepEqual(recovered, plant, "True-source positive: " + key);
    assert.equal(doublets(plantedCipher), 86);
    const wrong = transform(plantedCipher, sign, progressive, false, wrongWeights);
    const wrongMatches = wrong.filter((v, i) => v === plant[i]).length;
    assert.equal(wrongMatches, expectedWrongMatches[key]);
    assert.ok(wrongMatches < 1200, "Wrong-source control must fail");
    console.log(JSON.stringify({
      model: key, sourceRunes: original.length, sourceWords: words.length,
      originalDecodedIoC: ioc(decrypted), originalDoublets: doublets(original),
      originalDecodedPrefix: decrypted.slice(0, 110).map(i => source.translit[i]).join(""),
      plantedPlaintextIoC: ioc(plant), plantedCipherIoC: ioc(plantedCipher),
      plantedCipherDoublets: doublets(plantedCipher),
      plantedRecoveredRunes: recovered.length, wrongWeightsMatches: wrongMatches,
      originalRoundtrip: true
    }));
  }
}
console.log("PASS: four original 12956/12956 round trips and four independent 12956/12956 native positive recoveries.");
