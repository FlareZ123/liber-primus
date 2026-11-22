#!/usr/bin/env node
"use strict";

/**
 * Source-motivated, causal GP29 word-to-p50-table inverse.
 *
 * Upstream clues: 2016 signed "words ... map", "numbers ... direction",
 * GP prime weights and original 256-cell table.
 *
 * Frozen receiver: for word i, A_i = (sum GP primes of previous C-word) % 256,
 * A_0 = 3301 % 256. For the j-th rune, K = T[(A_i+j)%256],
 * convert K to GP29 by (K%29) or floor(29*K/256), then
 * P_i,j = C_i,j +/- K mod 29. No fitted phase or secret keys.
 *
 * This is a reversible candidate, not an authenticated Cicada method.
 * Reproduction from repository root:
 *   node sims/lp2_previous_word_p50_consecutive_key_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");
const root = path.resolve(__dirname, "..");
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(read("resources/liber-primus/lp2-grid-256.json")).bytes;
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const actual = parseSharedCorpus();
const lookup = new Map(corpus.runes.map((symbol, i) => [symbol, i]));
const wordIndices = actual.words.map(word => [...word.runes].map(symbol => lookup.get(symbol)));
assert.equal(actual.runeCount, 12956);
assert.equal(actual.words.length, 2896);
assert.equal(table.length, 256);
assert.equal(new Set(table).size, 161);
assert(signed.includes("Its words are the map, their \nmeaning is the road, and their numbers are the direction."));

/** @param {number} n */
const mod29 = n => (n % 29 + 29) % 29;
/** @param {number} byte @param {"mod29"|"floor29"} byteMap */
const mapByte = (byte, byteMap) => byteMap === "mod29" ?
  byte % 29 : Math.floor(29 * byte / 256);

/**
 * Causal prior-C-word key, continuous across all unsolved pages.
 * @param {number[][]} input
 * @param {-1|1} sign
 * @param {"mod29"|"floor29"} byteMap
 * @param {boolean} decrypt
 * @returns {number[][]}
 */
function transform(input, sign, byteMap, decrypt) {
  let address = 3301 % 256;
  const output = [];
  for (const current of input) {
    const converted = current.map((value, i) => {
      const key = mapByte(table[(address + i) % 256], byteMap);
      return mod29(value + (decrypt ? sign : -sign) * key);
    });
    output.push(converted);
    const cipherWord = decrypt ? current : converted;
    address = cipherWord.reduce((sum, v) => sum + corpus.prime[v], 0) % 256;
  }
  return output;
}

/** Greedy GP29 lexical conversion with conventional C/V/QU/Z normalization. */
function nativeGP(text) {
  const forms = corpus.translit.map((token, i) => ({token, i}))
    .sort((a, b) => b.token.length - a.token.length);
  const normalized = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  const output = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const current = forms.find(form => word.startsWith(form.token, i));
      assert(current, "Unmappable GP29 text");
      output.push(current.i);
      i += current.token.length;
    }
  }
  return output;
}

/** @param {number[]} training */
function trigramScorer(training) {
  const trigrams = new Uint32Array(29 ** 3);
  const bigrams = new Uint32Array(29 ** 2);
  for (let i = 0; i + 2 < training.length; i++) {
    const a = training[i], b = training[i + 1], c = training[i + 2];
    trigrams[a * 841 + b * 29 + c]++;
    bigrams[a * 29 + b]++;
  }
  /** @param {number[]} text */
  return text => {
    let score = 0;
    for (let i = 0; i + 2 < text.length; i++) {
      const a = text[i], b = text[i + 1], c = text[i + 2];
      score += Math.log((trigrams[a * 841 + b * 29 + c] + 0.1) /
        (bigrams[a * 29 + b] + 2.9));
    }
    return score / (text.length - 2);
  };
}

/** @param {number[]} stream */
function ioc(stream) {
  const frequencies = Array(29).fill(0);
  stream.forEach(v => frequencies[v]++);
  return frequencies.reduce((sum, n) => sum + n * (n - 1), 0) /
    (stream.length * (stream.length - 1));
}

const native = nativeGP(read("resources/control/gibran_prophet_58585.txt"));
assert(native.length > 44000);
const score = trigramScorer(native.slice(0, 40000));
const original = wordIndices.flat();
const nativePlant = [];
let offset = 0;
for (const cipherWord of wordIndices) {
  nativePlant.push(native.slice(offset, offset + cipherWord.length));
  offset += cipherWord.length;
}
assert.equal(offset, 12956);

const cases = [];
for (const byteMap of ["mod29", "floor29"]) {
  for (const sign of [-1, 1]) {
    const decoded = transform(wordIndices, sign, byteMap, true);
    const plaintext = decoded.flat();
    const reconstructed = transform(decoded, sign, byteMap, false).flat();
    assert.deepEqual(reconstructed, original);
    const plantedCipher = transform(nativePlant, sign, byteMap, false);
    assert.deepEqual(transform(plantedCipher, sign, byteMap, true), nativePlant);
    cases.push({
      map: byteMap, sign, meanTrigram: score(plaintext),
      gp29IoC: ioc(plaintext),
      fullOriginalReencryption: true, plantedNativeRecovery: true,
      first130RuneTransliteration: plaintext.slice(0, 130)
        .map(v => corpus.translit[v]).join(""),
      last76RuneTransliteration: plaintext.slice(-76)
        .map(v => corpus.translit[v]).join("")
    });
  }
}
assert(cases.every(item => item.meanTrigram < -4));
console.log(JSON.stringify({
  sourceWordCount: wordIndices.length,
  sourceRuneCount: original.length,
  tableCells: table.length,
  gpPrimeWordAddressRule: "prior Cipher word GP prime sum mod256",
  initialAddress: 3301 % 256,
  source2016: "words are the map, ... numbers are the direction",
  originalCipherMeanTrigram: score(original),
  heldoutNativeGibranMeanTrigram: score(native.slice(40000, 44000)),
  cases,
  conclusion: "No original unknown LP2 plaintext, candidate key or recognized message; frozen causal p50 table-word mechanism fails.",
}, null, 2));
