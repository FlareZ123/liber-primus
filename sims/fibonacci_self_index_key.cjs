"use strict";

/**
 * Page-15 Fibonacci/prime spiral as indexes into the LP2 rune stream or its
 * canonical whole words, yielding a self-indexed 16-rune periodic additive key.
 * Key extraction precedes score fitting; pages 16-18 select candidate
 * configuration, pages 19-22 are held out. No new plaintext is assumed.
 *
 * Execute: node sims/fibonacci_self_index_key.cjs
 * @module fibonacci_self_index_key
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");
const {readSquare, primeList, uniqueFibonacciPrimeRanks, clockwiseSpiral} =
  require("./fibonacci_prime_spiral.cjs");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {encode} = require("./affine_echo_literary_control.cjs");

const ROOT = path.resolve(__dirname, "..");
const RAW = fs.readFileSync(path.join(ROOT, "resources", "lp2-transcription.txt"), "utf8");
const DATA = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const PAGES = DATA.pages.filter(p => p.status === "unsolved" && p.indices.length > 0);
const WORDS = parseSharedCorpus().words;
const INDEX = new Map(DATA.runes.map((glyph, i) => [glyph, i]));
assert.equal(PAGES.length, 55);
assert.equal(WORDS.length, 2896);
assert.equal(WORDS.reduce((n, w) => n + w.length, 0), 12956);
assert.equal(PAGES.reduce((n, p) => n + p.indices.length, 0), 12956);
assert.equal(PAGES.filter(p => p.page >= 16 && p.page <= 18)
  .reduce((n, p) => n + p.indices.length, 0), 800);

const TRAIN = PAGES.filter(p => p.page >= 16 && p.page <= 18);
const HOLD = PAGES.filter(p => p.page >= 19 && p.page <= 22);

/** Independently reconstructed source lists, preserving square orientation. */
function sourceLists() {
  const square = readSquare();
  const coords = clockwiseSpiral();
  const values = coords.map(([r, c]) => square[r][c]);
  const ranks = uniqueFibonacciPrimeRanks();
  const primes = primeList(Math.max(...ranks));
  const actualPrimes = ranks.map(rank => primes[rank - 1]);
  assert.deepEqual(values, actualPrimes.map(p => Math.abs(3301 - p)));
  const rowToSpiral = Array.from({length: 16}, (_, i) =>
    coords.findIndex(([r, c]) => r * 4 + c === i));
  assert.equal(new Set(rowToSpiral).size, 16);
  return {
    arrays: {square: values, prime: actualPrimes,
      rank: ranks, fibonacci: ranks.map(x => x - 1)},
    rowToSpiral
  };
}

/** @returns {Array<{name:string,key:number[]}>} */
function keys() {
  const {arrays, rowToSpiral} = sourceLists();
  const full = PAGES.flatMap(p => p.indices);
  const postSquare = PAGES.filter(p => p.page >= 16).flatMap(p => p.indices);
  const wordFirst = WORDS.map(w => INDEX.get([...w.runes][0]));
  const wordLast = WORDS.map(w => INDEX.get([...w.runes].at(-1)));
  const sources = {
    "full-runes": full, "after-square-runes": postSquare,
    "whole-word-first": wordFirst, "whole-word-last": wordLast
  };
  const out = [];
  for (const [name, values] of Object.entries(arrays)) {
    for (const [layout, indexed] of [
      ["spiral", values], ["row-major", rowToSpiral.map(i => values[i])]
    ]) {
      for (const [src, stream] of Object.entries(sources)) {
        for (const base of [0, 1]) {
          const positions = indexed.map(x => x - base);
          if (positions.some(i => i < 0 || i >= stream.length)) continue;
          const key = positions.map(i => stream[i]);
          assert.equal(key.length, 16);
          assert.ok(key.every(x => Number.isInteger(x) && x >= 0 && x < 29));
          out.push({name: name + "/" + layout + "/" + src + "/base" + base,
            key});
        }
      }
    }
  }
  assert.equal(out.length, 40);
  return out;
}

/**
 * @param {number[]} source Original or synthetic rune indexes.
 * @param {number[]} key Sixteen source-derived GP rune indexes.
 * @param {number} phase 0..15.
 * @param {number} sign +/- 1 used in decryption.
 * @param {number} start Continuous key pointer from beginning of scoring span.
 */
function decipher(source, key, phase, sign, start = 0) {
  return source.map((x, i) => (x + sign * key[(start + i + phase) % 16] + 29) % 29);
}

/**
 * Cipher language-statistic score. Simulates the alternative that the key
 * restarts on each physical page or continues across page boundaries.
 * @param {Array<{indices:number[]}>} pages
 * @param {number[]} key
 * @param {number} phase
 * @param {number} sign
 * @param {boolean} reset
 */
function score(pages, key, phase, sign, reset) {
  const hist = Array(29).fill(0);
  let pointer = 0;
  let n = 0;
  for (const page of pages) {
    if (reset) pointer = 0;
    const decoded = decipher(page.indices, key, phase, sign, pointer);
    pointer += page.indices.length;
    for (const x of decoded) { hist[x]++; n++; }
  }
  return hist.reduce((sum, x) => sum + x * (x - 1), 0) / (n * (n - 1));
}

/**
 * Deliberate known-key/known-plaintext plant on the exact page-length layout.
 * The chosen key is extracted solely from original ciphertext, not fit to
 * the planted plaintext. Check exact inversion before any scoring.
 * @param {{name:string,key:number[]}} chosen
 */
function plantControl(chosen) {
  const source = fs.readFileSync(path.join(ROOT, "resources", "control",
    "shakespeare_first300k.txt"), "utf8");
  const plaintext = (source.match(/[A-Za-z]+/g) || []).flatMap(w => encode(w));
  const samplePages = [...TRAIN, ...HOLD];
  const sampleLength = samplePages.reduce((n, p) => n + p.indices.length, 0);
  assert.ok(plaintext.length >= sampleLength);
  const plain = plaintext.slice(0, sampleLength);
  const planted = [];
  let pointer = 0;
  for (const page of samplePages) {
    const passage = plain.slice(pointer, pointer + page.indices.length);
    const encrypted = decipher(passage, chosen.key, 7, 1, pointer);
    planted.push({page: page.page, indices: encrypted});
    assert.deepEqual(decipher(encrypted, chosen.key, 7, -1, pointer), passage);
    pointer += passage.length;
  }
  const plantedTrain = planted.slice(0, TRAIN.length);
  const plantedHold = planted.slice(TRAIN.length);
  return {trueKey: chosen.name, phase: 7, sign: -1, reset: false,
    trainingIoC: score(plantedTrain, chosen.key, 7, -1, false),
    heldoutIoC: score(plantedHold, chosen.key, 7, -1, false),
    sourcePlaintextIoC: (() => {
      const h = Array(29).fill(0);
      for (let i = TRAIN.reduce((n, p) => n + p.indices.length, 0);
        i < plain.length; i++) h[plain[i]]++;
      const n = sampleLength - 800;
      return h.reduce((s, x) => s + x * (x - 1), 0) / (n * (n - 1));
    })(),
    exactRuneRoundTrip: true};
}

/** @returns {object} */
function run() {
  const candidates = keys();
  const scores = [];
  for (const {name, key} of candidates) {
    for (const reset of [true, false]) {
      for (let phase = 0; phase < 16; phase++) {
        for (const sign of [-1, 1]) {
          scores.push({name, reset, phase, sign,
            trainIoC: score(TRAIN, key, phase, sign, reset),
            heldoutIoC: score(HOLD, key, phase, sign, reset)});
        }
      }
    }
  }
  assert.equal(scores.length, 2560);
  scores.sort((a, b) => b.trainIoC - a.trainIoC);
  const selected = scores[0];
  const positive = plantControl(candidates.find(x =>
    x.name === "square/spiral/full-runes/base0"));
  assert.ok(positive.heldoutIoC > 0.05,
    "Known self-index key did not recover planted English");
  assert.ok(Math.abs(positive.heldoutIoC - positive.sourcePlaintextIoC) < 1e-12);
  return {
    inputSha256: createHash("sha256").update(RAW).digest("hex"),
    inspected: {runePages: PAGES.length,
      ciphertextRunes: 12956, words: WORDS.length,
      pagesTrain: TRAIN.map(p => p.page), trainRunes: 800,
      pagesHeldout: HOLD.map(p => p.page),
      heldoutRunes: HOLD.reduce((n, p) => n + p.indices.length, 0)},
    keyExtractionFamilies: candidates.length,
    exactScoredConfigurations: scores.length,
    selectedTrainingOnly: selected,
    topFiveTraining: scores.slice(0, 5),
    plantedReproduction: positive,
    noKnownLP2PlaintextRecovered: true,
    scope: "16-rune periodic additive masks from literal manuscript lookups; 0/1-based indexing, word first/last, row/spiral, page reset/continuous, both signs and all rotations"
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {sourceLists, keys, decipher, score, plantControl, run};
