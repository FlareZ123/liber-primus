"use strict";
/**
 * Full original-source test of the 2014 OutGuess/ARC4 256-byte key-scheduling
 * permutation as a repeated 256-WORD LP2 transposition.
 * SFT: node sims/lp2_p50_rc4ksa_256word_source_sft.cjs
 * Uses source-native runes, canonical p50 bytes and held-out GP English.
 */
const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const root = resolve(__dirname, "..");
/** @param {string} filename @returns {string} */
const read = (filename) => readFileSync(resolve(root, filename), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.equal(createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const runes = new Set(corpus.runes);
const original = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");
const lengths = [];
let width = 0;
let totalRunes = 0;
/** @returns {void} */
function flush() {
  if (!width) return;
  lengths.push(width);
  width = 0;
}
for (const ch of original) {
  if (runes.has(ch)) {
    width++;
    totalRunes++;
  } else if ("-.$&§0123456789".includes(ch)) {
    flush();
  }
}
flush();
assert.equal(totalRunes, 12956);
assert.equal(lengths.length, 2896);

// The original 256 numeric cells are the literal 256-byte ARC4 KSA key.
// This yields an actual permutation despite repeated printed byte values.
const permutation = Array.from({ length: 256 }, (_, i) => i);
let j = 0;
for (let i = 0; i < 256; i++) {
  j = (j + permutation[i] + bytes[i]) & 255;
  [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
}
assert.equal(new Set(permutation).size, 256);
assert.deepEqual(permutation.slice(0, 10), [82, 2, 3, 65, 182, 37, 111, 49, 22, 154]);

/**
 * Reorder 11 full source-word blocks of length256. The last 80 words remain
 * in printed order; no ciphertext-dependent word selection is fitted.
 * @param {number[]} words
 * @param {boolean} inverse
 * @returns {number[]}
 */
function reorder(words, inverse = false) {
  const output = words.slice();
  for (let block = 0; block < 11; block++) {
    const offset = 256 * block;
    for (let k = 0; k < 256; k++) {
      if (inverse) output[offset + permutation[k]] = words[offset + k];
      else output[offset + k] = words[offset + permutation[k]];
    }
  }
  return output;
}
/** @param {number[]} values @returns {number} */
function adjacencyChiSquare(values) {
  const n = values.length - 1;
  const rows = Array(9).fill(0);
  const cols = Array(9).fill(0);
  const pairs = Array.from({ length: 9 }, () => Array(9).fill(0));
  for (let i = 1; i < values.length; i++) {
    const a = Math.min(9, values[i - 1]) - 1;
    const b = Math.min(9, values[i]) - 1;
    pairs[a][b]++;
    rows[a]++;
    cols[b]++;
  }
  let score = 0;
  for (let a = 0; a < 9; a++) {
    for (let b = 0; b < 9; b++) {
      const expected = rows[a] * cols[b] / n;
      if (expected) score += (pairs[a][b] - expected) ** 2 / expected;
    }
  }
  return score;
}
/**
 * Marginal-matched shuffle of all exact manuscript word lengths, preserving
 * the original counts. Every null gets the same three-way selection.
 * @param {number[]} values @param {number} seed @returns {number[]}
 */
function shuffle(values, seed) {
  const copy = values.slice();
  let state = seed >>> 0;
  for (let i = copy.length - 1; i > 0; i--) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    const k = (state >>> 0) % (i + 1);
    [copy[i], copy[k]] = [copy[k], copy[i]];
  }
  return copy;
}

const originalChi = [
  adjacencyChiSquare(lengths),
  adjacencyChiSquare(reorder(lengths)),
  adjacencyChiSquare(reorder(lengths, true))
];
const expectedOriginal = [68.27318638192133, 70.16993173912292, 64.16596005444205];
for (let k = 0; k < 3; k++) {
  assert.ok(Math.abs(originalChi[k] - expectedOriginal[k]) < 1e-8);
}
const trials = 2000;
const bestObserved = Math.max(...originalChi);
let tail = 0;
let total = 0;
let sumOfSquares = 0;
for (let trial = 0; trial < trials; trial++) {
  const randomWords = shuffle(lengths, ((trial + 1) * 0x9e3779b9) ^ 0x3301c3a7);
  const best = Math.max(
    adjacencyChiSquare(randomWords),
    adjacencyChiSquare(reorder(randomWords)),
    adjacencyChiSquare(reorder(randomWords, true))
  );
  if (best >= bestObserved) tail++;
  total += best;
  sumOfSquares += best * best;
}
assert.equal(tail, 1237);
const controlWords = read("resources/control/shakespeare_first300k.txt")
  .match(/[A-Za-z]+/g).map((word) => word.toUpperCase());
const translit = ["ING", ...corpus.translit].sort((a, b) => b.length - a.length);
/** @param {string} raw @returns {number} */
function gpWordLength(raw) {
  const word = raw.replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S");
  let i = 0;
  let count = 0;
  while (i < word.length) {
    const token = translit.find((label) => word.startsWith(label, i));
    assert.ok(token, "Unmapped GP control word: " + raw);
    i += token.length;
    count++;
  }
  return count;
}
const controls = [1000, 12000, 24000].map((offset) => {
  const native = controlWords.slice(offset, offset + 2896).map(gpWordLength);
  assert.equal(native.length, 2896);
  const forward = reorder(native);
  const reverse = reorder(native, true);
  assert.deepEqual(reorder(forward, true), native);
  assert.deepEqual(reorder(reverse), native);
  const ordered = adjacencyChiSquare(native);
  assert.ok(ordered > 140, "native GP prose control is weak");
  return {
    sourceWordStart: offset,
    native: ordered,
    scrambledForward: adjacencyChiSquare(forward),
    scrambledInverse: adjacencyChiSquare(reverse),
    exactRecovery: true
  };
});
const nullMean = total / trials;
console.log(JSON.stringify({
  source: { runes: totalRunes, words: lengths.length, completeBlocks: 11,
    untransposedTail: 80, bytes: bytes.length },
  ksaFirst25: permutation.slice(0, 25),
  original: { printed: originalChi[0], forward: originalChi[1],
    inverse: originalChi[2] },
  nullSelection: { seed: "0x3301c3a7", trials, tail,
    correctedP: (tail + 1) / (trials + 1), mean: nullMean,
    sd: Math.sqrt(sumOfSquares / trials - nullMean ** 2) },
  controls
}, null, 2));
