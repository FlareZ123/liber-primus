"use strict";

/**
 * Source-locked 2016 signed-message -> LP2 book-word -> table-byte inverse.
 * SFT: node sims/lp2_2016_43byte_bookword_inverse_sft.cjs
 *
 * The 43 bytes are the row-major printed table interval between the two
 * source-selected 193 bytes. The 43 word addresses were frozen in the
 * earlier lp2_2016_message_base58_word_map.cjs source study.
 *
 * This tests two plausible DIRECT, lossless uses of those original inputs:
 *  (1) per-word GP29 additive key = corresponding table byte mod29;
 *  (2) bytewise XOR / +/- using GP sums of addressed rune words.
 * It does not assume that either model was the historical cipher.
 */

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.join(__dirname, "..");
/** @param {string} relative */
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const physical = read("resources/lp2-transcription.txt").split("%");
assert.equal(physical.length, 57);
assert.equal(corpus.pages.length, 58);

/** Preserve source-printed words while joining typographic line wraps. */
function printedWords(source) {
  return source.replace(/[\/\r\n]/gu, "").split(/[-.&$§,:!?]/u)
    .map((part) => (part.match(/[ᚠ-᛿]+/gu) || []).join(""))
    .filter(Boolean);
}
const pages = Array.from({length: 58}, (_, page) => page === 50
  ? [] : printedWords(physical[page > 50 ? page - 1 : page]));
assert.equal(pages.reduce((n, p) => n + p.length, 0), 2973);

const gpTokens = corpus.translit.map((token, index) =>
  ({token: token.toLowerCase(), index}))
  .sort((a, b) => b.token.length - a.token.length);

/**
 * Canonical longest-match GP encoding. Return null for unrepresentable words.
 * @param {string} source
 * @returns {number[] | null}
 */
function gpEncode(source) {
  const word = source.toLowerCase().replace(/v/g, "u")
    .replace(/k/g, "c").replace(/z/g, "s");
  const out = [];
  for (let offset = 0; offset < word.length;) {
    const token = gpTokens.find((item) => word.startsWith(item.token, offset));
    if (!token) return null;
    out.push(token.index);
    offset += token.token.length;
  }
  return out;
}

const begin = signed.indexOf("Hello.");
const end = signed.indexOf("-----BEGIN PGP SIGNATURE-----");
assert(begin >= 0 && end > begin);
const signedWords = signed.slice(begin, end)
  .match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(signedWords.length, 43);
const source = signedWords.map((word, i) => {
  const runes = gpEncode(word);
  assert(runes, word);
  const sum = runes.reduce((n, index) => n + corpus.prime[index], 0);
  const page = sum % 58;
  const wordIndex = Math.floor(sum / 58);
  const selected = pages[page]?.[wordIndex] ?? null;
  const indices = [...(selected || "")].map((rune) => {
    const index = corpus.runes.indexOf(rune);
    assert(index >= 0);
    return index;
  });
  return {
    i, word, page, wordIndex, selected, indices, sourcePrimeSum: sum,
    selectedPrimeSum: indices.reduce((n, index) => n + corpus.prime[index], 0),
    selectedOrdinalSum: indices.reduce((n, index) => n + index, 0)
  };
});
assert.deepEqual(source.filter((word) => !word.selected)
  .map((word) => [word.word, word.i, word.page, word.wordIndex]),
  [["lies", 3, 50, 3]]);
assert.equal(source.reduce((n, word) => n + word.indices.length, 0), 175);

const bytes = grid.bytes.slice(84, 127);
assert.equal(bytes.length, 43);
assert.deepEqual(grid.bytes.slice(82, 84), [201, 193]);
assert.deepEqual(grid.bytes.slice(127, 129), [193, 201]);
const emptyToken = grid.pages.find((page) => page.page === 50);
assert.deepEqual([emptyToken.tokens[3], emptyToken.bytes[3]], ["3D", 193]);

/** @param {number} n @param {number} m */
function mod(n, m) { return (n % m + m) % m; }

/**
 * Subtract/add a source-aligned table byte modulo GP29 for each original word.
 * Every nonmissing word is independently reversible with the SAME byte.
 * @param {-1|1} sign
 * @param {number[]} key
 * @param {number[][]} [input]
 * @returns {number[][]}
 */
function wordTransform(sign, key, input = source.map((word) => word.indices)) {
  return input.map((word, i) => word.map((x) => mod(x + sign * key[i], 29)));
}

/**
 * Train a smoothed word-internal GP bigram and trigram model using only the
 * FIRST 75% of canonical Shakespeare GP words. The remaining 25% supplies an
 * independent native-Cicada-format positive plant (same rune-word lengths).
 * @param {number[][]} training
 */
function languageModel(training) {
  const pairs = Array.from({length: 29}, () => Array(29).fill(1));
  const triples = Array.from({length: 29}, () =>
    Array.from({length: 29}, () => Array(29).fill(1)));
  const pairTotals = Array(29).fill(29);
  const tripleTotals = Array.from({length: 29}, () => Array(29).fill(29));
  for (const word of training) {
    for (let i = 1; i < word.length; i++) {
      pairs[word[i - 1]][word[i]]++;
      pairTotals[word[i - 1]]++;
    }
    for (let i = 2; i < word.length; i++) {
      triples[word[i - 2]][word[i - 1]][word[i]]++;
      tripleTotals[word[i - 2]][word[i - 1]]++;
    }
  }
  /** @param {number[][]} words */
  return function score(words) {
    let log = 0, n = 0;
    for (const word of words) {
      for (let i = 1; i < word.length; i++) {
        log += Math.log(pairs[word[i - 1]][word[i]] / pairTotals[word[i - 1]]);
        n++;
      }
      for (let i = 2; i < word.length; i++) {
        log += Math.log(triples[word[i - 2]][word[i - 1]][word[i]]
          / tripleTotals[word[i - 2]][word[i - 1]]);
        n++;
      }
    }
    return {meanLog: log / n, scoredTransitions: n};
  };
}

const allNative = (read("resources/control/shakespeare_first300k.txt")
  .match(/[A-Za-z]+/g) || []).map(gpEncode)
  .filter((word) => word && word.length >= 2);
const split = Math.floor(allNative.length * 0.75);
const score = languageModel(allNative.slice(0, split));
const holdout = allNative.slice(split);
const byLength = new Map();
for (const word of holdout) {
  if (!byLength.has(word.length)) byLength.set(word.length, []);
  byLength.get(word.length).push(word);
}

/** Repeatable xorshift32, for the same-source byte-order null only. */
let randomState = 0x26112016;
/** @returns {number} A uniform-enough reproducible PRNG fraction for shuffles. */
function random() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return (randomState >>> 0) / 0x100000000;
}
const sampleCount = 2000;
const results = [];
for (const sign of /** @type {Array<-1|1>} */ ([-1, 1])) {
  const inverse = wordTransform(sign, bytes);
  const actual = score(inverse);
  const controls = [];
  for (let i = 0; i < sampleCount; i++) {
    const shuffled = bytes.slice();
    for (let j = shuffled.length - 1; j > 0; j--) {
      const k = Math.floor(random() * (j + 1));
      [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
    }
    controls.push(score(wordTransform(sign, shuffled)).meanLog);
  }
  const mean = controls.reduce((n, x) => n + x, 0) / controls.length;
  const pUpper = (1 + controls.filter((x) => x >= actual.meanLog).length)
    / (sampleCount + 1);
  const restored = wordTransform(-sign, bytes, inverse);
  assert.deepEqual(restored, source.map((word) => word.indices));
  results.push({sign, actual, shuffledMean: mean, shuffledMax: Math.max(...controls),
    shuffledUpperTail: pUpper});
}

/** Native heldout source words matching every ciphertext word length. */
const native = source.map((record, i) => {
  if (record.indices.length === 0) return [];
  const pool = byLength.get(record.indices.length);
  assert(pool && pool.length > 0);
  return pool[i % pool.length];
});
const plantCipher = wordTransform(1, bytes, native);
assert.deepEqual(wordTransform(-1, bytes, plantCipher), native);
const plantedModelScore = score(wordTransform(-1, bytes, plantCipher));
assert(plantedModelScore.meanLog > results[0].actual.meanLog);

/** Two original-data direct byte-readout attempts, no original plaintext. */
const byteReadouts = [
  {name: "selectedPrimeSum XOR", inverse: (b, r) => b ^ ((r.selected
    ? r.selectedPrimeSum : 193) & 255)},
  {name: "selectedOrdinalSum XOR", inverse: (b, r) => b ^ ((r.selected
    ? r.selectedOrdinalSum : 193) & 255)},
  {name: "selectedPrimeSum subtraction", inverse: (b, r) => mod(b -
    (r.selected ? r.selectedPrimeSum : 193), 256)},
  {name: "selectedPrimeSum addition", inverse: (b, r) => mod(b +
    (r.selected ? r.selectedPrimeSum : 193), 256)}
].map((candidate) => {
  const output = bytes.map((byte, i) => candidate.inverse(byte, source[i]));
  return {name: candidate.name, printableASCII: output.filter((b) =>
    b >= 32 && b <= 126).length, hex: Buffer.from(output).toString("hex")};
});

console.log(JSON.stringify({
  interpretation: "provisional source-selected direct inverse, no LP2 decryption",
  signedWords: signedWords.length, addressedRuneWords: source.filter((w) => w.selected).length,
  originalRunes: source.reduce((n, w) => n + w.indices.length, 0),
  source: {tableInterval: [84, 127], exception: ["lies", 50, 3, 193]},
  originalWordwiseGP29: results,
  shuffledKeyControlsPerSign: sampleCount,
  nativeHeldoutExactRecovery: true, nativeHeldoutScore: plantedModelScore,
  byteReadouts
}, null, 2));
