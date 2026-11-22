#!/usr/bin/env node
"use strict";

// Test the conditional p0-DH -> p18:w7 ("GAHEALGO") key hypothesis.
// This is a bounded fixed-key test, not a key search.
// Inputs are the canonical LP2 corpus/transcription and the repository's
// fixed English controls. Run from the repository root:
//   node sims/p0_dh23_gahealgo_prime_key_sft.cjs

const fs = require("node:fs");

const corpus = JSON.parse(fs.readFileSync(
  "resources/liber-primus/lp2-corpus.json", "utf8"
));
const transcription = fs.readFileSync("resources/lp2-transcription.txt", "utf8");
const emerson = fs.readFileSync("resources/control/emerson_essays_2944.txt", "utf8");
const gibran = fs.readFileSync("resources/control/gibran_prophet_58585.txt", "utf8");

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const translitIndex = new Map(corpus.translit.map((r, i) => [r, i]));
const mod = (x, n) => ((x % n) + n) % n;

function printedWords(pageText) {
  return pageText
    .replaceAll("/", "")
    .replace(/[\r\n]/g, "")
    .split(/[-.&$§,:!?]/u)
    .map(part => (part.match(/[ᚠ-᛿]+/gu) || []).join(""))
    .filter(Boolean);
}

function encodeEnglish(text) {
  const normalized = text.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/K/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      let matched = false;
      for (const width of [3, 2, 1]) {
        const token = word.slice(i, i + width);
        if (translitIndex.has(token)) {
          out.push(translitIndex.get(token));
          i += width;
          matched = true;
          break;
        }
      }
      if (!matched) throw new Error("Unmapped control text at " + word.slice(i));
    }
  }
  return out;
}

function ioc(values) {
  const counts = new Uint32Array(29);
  for (const value of values) counts[value]++;
  let numerator = 0;
  for (const count of counts) numerator += count * (count - 1);
  return numerator / (values.length * (values.length - 1));
}

const train = encodeEnglish(emerson).slice(0, 50000);
const holdout = encodeEnglish(gibran);
const trigramCounts = new Uint32Array(29 ** 3);
for (let i = 2; i < train.length; i++) {
  trigramCounts[train[i - 2] * 841 + train[i - 1] * 29 + train[i]]++;
}
const denominator = train.length - 2 + trigramCounts.length * 0.2;

function trigramScore(values) {
  let total = 0;
  for (let i = 2; i < values.length; i++) {
    const index = values[i - 2] * 841 + values[i - 1] * 29 + values[i];
    total += Math.log((trigramCounts[index] + 0.2) / denominator);
  }
  return total / (values.length - 2);
}

const pageTexts = transcription.split("%");
const p18Words = printedWords(pageTexts[18]);
const keyWordRunes = [...p18Words[6]];
const keyIndices = keyWordRunes.map(rune => runeIndex.get(rune));
if (keyIndices.some(index => index === undefined)) {
  throw new Error("p18:w7 contains a rune absent from the canonical corpus");
}
const keyPrimeWeights = keyIndices.map(index => corpus.prime[index]);
const primeKey = keyPrimeWeights.map(value => mod(value, 29));
const phiPrimeKey = keyPrimeWeights.map(value => mod(value - 1, 29));

if (keyWordRunes.length !== 7 || keyPrimeWeights.reduce((a, b) => a + b, 0) !== 343) {
  throw new Error("The p18:w7 selector no longer resolves to the documented 7-rune / 343 word");
}

const p0 = corpus.pages.find(page => page.page === 0);
if (!p0 || p0.indices.length - 20 !== 242) {
  throw new Error("The documented p0 body offset/length changed");
}
const body = p0.indices.slice(20);

function decrypt(values, key, sign) {
  return values.map((value, i) => mod(value + sign * key[i % key.length], 29));
}
function encrypt(values, key, sign) {
  return values.map((value, i) => mod(value - sign * key[i % key.length], 29));
}

const models = [];
for (const [name, key] of [
  ["prime-weight-mod29", primeKey],
  ["phi-prime-weight-mod29", phiPrimeKey],
]) {
  for (const sign of [-1, 1]) {
    const plaintext = decrypt(body, key, sign);
    const roundTrip = encrypt(plaintext, key, sign);
    if (roundTrip.some((value, i) => value !== body[i])) {
      throw new Error("Ciphertext round-trip failed for " + name + " sign " + sign);
    }

    const plant = holdout.slice(500, 500 + body.length);
    const plantedCiphertext = encrypt(plant, key, sign);
    const recoveredPlant = decrypt(plantedCiphertext, key, sign);
    if (recoveredPlant.some((value, i) => value !== plant[i])) {
      throw new Error("Synthetic positive control failed for " + name + " sign " + sign);
    }

    models.push({
      key_mapping: name,
      sign,
      key_mod29: key,
      ioc: ioc(plaintext),
      trigram_nats_per_rune: trigramScore(plaintext),
      preview: plaintext.map(index => corpus.translit[index]).join(""),
      round_trip_exact: true,
      synthetic_positive_control_exact: true,
    });
  }
}

const windowScores = [];
for (let start = 0; start + body.length <= holdout.length; start += 7) {
  windowScores.push(trigramScore(holdout.slice(start, start + body.length)));
}
windowScores.sort((a, b) => a - b);
const quantile = q => windowScores[Math.floor((windowScores.length - 1) * q)];

process.stdout.write(JSON.stringify({
  hypothesis: "p0 DH outputs select p18:w7; its GP prime weights are a repeating Vigenere key for the p0 body",
  selector: {
    page: 18,
    word: 7,
    word_runes: keyWordRunes.join(""),
    word_transliteration: keyIndices.map(index => corpus.translit[index]).join("-"),
    prime_weights: keyPrimeWeights,
    prime_weight_sum: keyPrimeWeights.reduce((a, b) => a + b, 0),
    key_length: keyPrimeWeights.length,
  },
  target: {
    page: 0,
    header_offset: 20,
    body_runes: body.length,
    raw_ioc: ioc(body),
    raw_trigram_nats_per_rune: trigramScore(body),
  },
  models,
  native_gibran_windows: {
    length: body.length,
    stride: 7,
    count: windowScores.length,
    min: windowScores[0],
    q10: quantile(0.10),
    median: quantile(0.50),
    q90: quantile(0.90),
    max: windowScores[windowScores.length - 1],
  },
}, null, 2) + "\n");
