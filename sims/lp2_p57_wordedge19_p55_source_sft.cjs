"use strict";

/**
 * Solved p57's 19 poem-body words as a source-selected candidate 19-rune
 * boundary key for unsolved p55's exactly 76 runes (4 x 19).
 *
 * Node.js 22, CommonJS. Read-only; uses the checked-in original GP corpus
 * and the physical-page transcription, never synthetic unknown plaintext.
 *
 * This is a bounded rejection of direct period-19 GP29 addition, not a
 * recovered key or a claim that the poem dictates a one-edge rule.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const text = read("resources/liber-primus/lp2-transcription.txt");
const pages = text.split("%");
const index = new Map(gp.runes.map((r, i) => [r, i]));

/**
 * Page/line breaks do not divide rune words. Printed space and punctuation
 * delimiters do. This parser is used only on p55 and p57.
 * @param {string} input
 * @returns {number[][]}
 */
function runeWords(input) {
  const words = [];
  let current = [];
  for (const char of input) {
    if (index.has(char)) current.push(index.get(char));
    else if ("-.$&§0123456789".includes(char) && char.length) {
      if (current.length) words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

/** @param {number[]} values @returns {number} */
function coincidenceNumerator(values) {
  const counts = Array(29).fill(0);
  for (const val of values) counts[val]++;
  return counts.reduce((sum, c) => sum + c * (c - 1), 0);
}

/** @param {number[]} values @returns {string} */
function labels(values) {
  return values.map((x) => gp.translit[x]).join("");
}

const poem = runeWords(pages.at(-1));
const encryptedPage = runeWords(pages.at(-3)); // p55: p56 occupies next segment
const p55 = gp.pages[55].indices;
const p57 = gp.pages[57].indices;

assert.equal(poem.length, 20);
assert.equal(poem[0].map((x) => gp.translit[x]).join(""), "PARABLE");
assert.deepEqual(poem.flat(), p57);
assert.equal(p57.length, 95);
assert.equal(poem.slice(1).length, 19);
assert.equal(p55.length, 76);
assert.equal(p55.length, 19 * 4);
assert.deepEqual(encryptedPage.flat(), p55);
assert.equal(encryptedPage.length, 17); // first segment is carry from p54
assert.equal(encryptedPage[0].length, 1);
const body = poem.slice(1);

/**
 * Source-body-word boundary extraction; return 19 first or last runes.
 * @param {number[][]} words
 * @param {"first"|"last"} edge
 * @returns {number[]}
 */
function keyOf(words, edge) {
  return words.map((word) => edge === "first" ? word[0] : word.at(-1));
}

/**
 * Decode every p55 original glyph under a fixed 19-symbol key.
 * A carry offset of 18 means the source p55 first carried glyph gets the
 * previous key position, so the first complete p55 word starts at key 0.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {-1|1} sign
 * @param {number} carry
 * @returns {number[]}
 */
function transform(cipher, key, sign, carry) {
  return cipher.map((c, i) => (c + 29 + sign * key[(i + carry) % 19]) % 29);
}

/**
 * Find the strongest 29-symbol unigram coincidence over precisely sixteen
 * source-motivated configurations. No hidden key, fitted phase or text score.
 * @param {number[][]} words
 * @param {number[]} cipher
 * @param {boolean} verifyRoundtrip
 * @returns {{max: number, best: object, output: number[]}}
 */
function bestFamily(words, cipher, verifyRoundtrip = false) {
  let result = {max: -1, best: {}, output: []};
  for (const edge of ["first", "last"]) {
    for (const sign of [-1, 1]) {
      for (const carry of [0, 18]) {
        for (const reverse of [false, true]) {
          const key = keyOf(words, edge);
          if (reverse) key.reverse();
          const plaintext = transform(cipher, key, sign, carry);
          const max = coincidenceNumerator(plaintext);
          // Every candidate is invertible and recovers all unmodified input.
          if (verifyRoundtrip) assert.deepEqual(transform(plaintext, key, -sign, carry), cipher);
          if (max > result.max) {
            result = {max, best: {edge, sign, carry, reverse}, output: plaintext};
          }
        }
      }
    }
  }
  return result;
}
const original = bestFamily(body, p55, true);
assert.equal(original.max, 242);
assert.deepEqual(original.best, {
  edge: "last", sign: -1, carry: 0, reverse: false
});

// A source-native known-text plant proves that the same 19-key encoder
// and decoder can recover a 76-rune GP sequence, with no change in length.
const source76 = [poem[0], ...body.map((word) => word.slice(0, -1))].flat();
assert.equal(source76.length, 76);
assert.equal(coincidenceNumerator(source76), 322);
const sourceKey = keyOf(body, "last");
const planted = transform(source76, sourceKey, 1, 0);
assert.deepEqual(transform(planted, sourceKey, -1, 0), source76);

// Shuffle whole p57 source-body words, jointly retaining their first/last
// rune values, lengths, and genuine word inventory. Re-run the identical
// 16-variant family on each wrong-order key. Deterministic seed.
let state = 0x33015719;
/** @returns {number} */
function random() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 4294967296;
}
/** @param {number[][]} arr @returns {number[][]} */
function shuffleWords(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const trials = 50000;
let matchedOrExceeded = 0;
let total = 0;
for (let i = 0; i < trials; i++) {
  const max = bestFamily(shuffleWords(body), p55).max;
  matchedOrExceeded += Number(max >= original.max);
  total += max;
}
assert.equal(matchedOrExceeded, 24037);
const output = {
  originalP55Runes: p55.length,
  sourceP57Runes: p57.length,
  p57BodyWords: body.length,
  keyLength: sourceKey.length,
  originalRawIoc: coincidenceNumerator(p55) / (76 * 75),
  candidate: original.best,
  candidateIoc: original.max / (76 * 75),
  sourceNativeControlIoc: coincidenceNumerator(source76) / (76 * 75),
  familywiseWordOrderNull: {
    trials, seed: "0x33015719", successes: matchedOrExceeded,
    plusOneTail: (matchedOrExceeded + 1) / (trials + 1),
    meanBestIoc: total / trials / (76 * 75)
  },
  candidateOutput: labels(original.output),
  decision: "No original plaintext or source-authenticated key"
};
console.log(JSON.stringify(output, null, 2));
