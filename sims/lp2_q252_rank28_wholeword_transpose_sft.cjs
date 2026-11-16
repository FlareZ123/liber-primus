"use strict";

/**
 * LP2 p50 H/G quotient as a source-fixed, whole-word 28-slot transposition.
 * Run on Node.js 22; reads tracked source files and writes nothing.
 * This tests an independently defined permutation architecture, not a cipher claim.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const repo = path.join(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(
  path.join(repo, "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
const abc = grid.alphabet;
const bytes = grid.pages.flatMap((p) => p.tokens).map((token) =>
  60 * abc.indexOf(token[0]) + abc.indexOf(token[1]));
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

/** @param {number} v @returns {number} */
function mod(v) {
  return ((v % 29) + 29) % 29;
}

/**
 * Formal 252-slot quotient of original 256 descending GF29 coefficients,
 * divided by the source-linked 2013 H times p39 G polynomial.
 * @param {number[]} original
 * @returns {number[]}
 */
function quotient(original) {
  const remainder = original.map((v) => v % 29);
  const divisor = [12, 17, 11, 21, 23];
  const q = [];
  for (let i = 0; i < 252; i++) {
    const z = mod(remainder[i] * 17); // 17 is inverse(12) over GF29
    q.push(z);
    for (let j = 0; j < divisor.length; j++) {
      remainder[i + j] = mod(remainder[i + j] - z * divisor[j]);
    }
  }
  assert.deepEqual(remainder, Array(256).fill(0));
  assert.deepEqual(q.slice(0, 20),
    [0, 12, 9, 28, 2, 25, 23, 21, 18, 28,
      21, 17, 17, 8, 15, 21, 7, 21, 18, 7]);
  return q;
}

const q = quotient(bytes);
const chapterWords = [158, 255, 383, 437, 224, 326, 378, 669, 66];
const chapterRunes = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
const corpus = parseSharedCorpus();
const original = corpus.words.map((w) => w.length);
assert.equal(original.length, 2896);
assert.equal(corpus.runeCount, 12956);
assert.equal(corpus.crossPageWords, 32);
assert.equal(chapterWords.reduce((s, n) => s + n, 0), 2896);
assert.equal(chapterRunes.reduce((s, n) => s + n, 0), 12956);
{
  let start = 0;
  for (let h = 0; h < 9; h++) {
    const count = original.slice(start, start + chapterWords[h])
      .reduce((s, n) => s + n, 0);
    assert.equal(count, chapterRunes[h], "printed chapter source cut " + h);
    start += chapterWords[h];
  }
}

/**
 * Stable ascending-key permutation for each of the nine 28-value rows.
 * Tie-breaking is ascending source-position order, chosen before plaintext.
 * @type {number[][]}
 */
const orders = Array.from({length: 9}, (_, h) =>
  Array.from({length: 28}, (_, i) => i).sort((a, b) =>
    q[28 * h + a] - q[28 * h + b] || a - b));
assert.deepEqual(orders[0],
  [0, 27, 4, 20, 25, 16, 19, 13, 2, 22, 1, 24, 14, 21,
    11, 12, 8, 18, 23, 26, 7, 10, 15, 17, 6, 5, 3, 9]);

/**
 * Map complete 28-word blocks in each printed chapter by the table-derived
 * stable rank, keeping incomplete tails intact and all word lengths unchanged.
 * @param {number[]} input
 * @param {boolean} inverse
 * @returns {number[]}
 */
function transpose(input, inverse = false) {
  const out = input.slice();
  let chapterStart = 0;
  for (let h = 0; h < 9; h++) {
    const order = orders[h];
    const end = chapterStart + chapterWords[h];
    for (let start = chapterStart; start + 28 <= end; start += 28) {
      for (let k = 0; k < 28; k++) {
        if (inverse) out[start + order[k]] = input[start + k];
        else out[start + k] = input[start + order[k]];
      }
    }
    chapterStart = end;
  }
  return out;
}

/**
 * Source-independent 9x9 Pearson association for next-word length.
 * 1 through 8 are distinct; lengths nine and above share a final bin.
 * This is a diagnostic for language-like word-order syntax.
 * @param {number[]} input
 * @returns {number}
 */
function adjacentChiSquare(input) {
  const cells = Array.from({length: 9}, () => Array(9).fill(0));
  const left = Array(9).fill(0);
  const right = Array(9).fill(0);
  const n = input.length - 1;
  for (let i = 0; i < n; i++) {
    const a = Math.min(8, input[i] - 1);
    const b = Math.min(8, input[i + 1] - 1);
    assert.ok(a >= 0 && b >= 0);
    cells[a][b]++;
    left[a]++;
    right[b]++;
  }
  let statistic = 0;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const expected = left[i] * right[j] / n;
      if (expected > 0) statistic += (cells[i][j] - expected) ** 2 / expected;
    }
  }
  return statistic;
}

/** @param {number} seed @returns {() => number} */
function xorshift32(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return s >>> 0;
  };
}

/**
 * Shuffle words only within their original chapter, holding every chapter's
 * observed word-length inventory fixed.
 * @param {number[]} input
 * @param {() => number} rng
 * @returns {number[]}
 */
function chapterShuffle(input, rng) {
  const out = input.slice();
  let start = 0;
  for (let h = 0; h < 9; h++) {
    for (let i = chapterWords[h] - 1; i > 0; i--) {
      const j = rng() % (i + 1);
      [out[start + i], out[start + j]] = [out[start + j], out[start + i]];
    }
    start += chapterWords[h];
  }
  return out;
}

const printed = adjacentChiSquare(original);
const forward = adjacentChiSquare(transpose(original));
const reverse = adjacentChiSquare(transpose(original, true));
assert.ok(Math.abs(printed - 68.27318638192133) < 1e-8);
assert.ok(Math.abs(forward - 54.340845553869606) < 1e-8);
assert.ok(Math.abs(reverse - 82.29903666826436) < 1e-8);
assert.deepEqual(transpose(transpose(original), true), original);
assert.deepEqual(transpose(transpose(original, true)), original);

// Full best-of-three comparison, including the unchanged original.
const best = Math.max(printed, forward, reverse);
const trials = 3000;
const rng = xorshift32(0x3301728);
const maxima = [];
let atLeastOriginal = 0;
for (let run = 0; run < trials; run++) {
  const shuffled = chapterShuffle(original, rng);
  const candidate = Math.max(
    adjacentChiSquare(shuffled),
    adjacentChiSquare(transpose(shuffled)),
    adjacentChiSquare(transpose(shuffled, true)));
  maxima.push(candidate);
  if (candidate >= best) atLeastOriginal++;
}
maxima.sort((a, b) => a - b);
assert.equal(atLeastOriginal, 536);

/**
 * Native GP29 word-length approximation from ordinary English spelling
 * using the same runic digraph groups and ING contraction as solved LP2.
 * @param {string} word
 * @returns {number}
 */
function gpLength(word) {
  const contractions = ["ING", "TH", "EO", "OE", "AE", "IA", "EA", "NG"];
  let count = 0;
  for (let i = 0; i < word.length;) {
    const group = contractions.find((g) => word.startsWith(g, i));
    i += group ? group.length : 1;
    count++;
  }
  return count;
}

const shakespeare = fs.readFileSync(
  path.join(repo, "resources", "control", "shakespeare_first300k.txt"), "utf8");
const englishWords = shakespeare.toUpperCase().match(/[A-Z]+/g);
assert.ok(englishWords.length >= 3146);
const native = englishWords.slice(250, 3146).map(gpLength);
const nativeCipher = transpose(native);
assert.deepEqual(transpose(nativeCipher, true), native);
const nativeResult = {
  ordered: adjacentChiSquare(native),
  transposed: adjacentChiSquare(nativeCipher),
  restored: adjacentChiSquare(transpose(nativeCipher, true))
};
assert.ok(Math.abs(nativeResult.ordered - 147.67414923546136) < 1e-8);
assert.ok(Math.abs(nativeResult.transposed - 66.18509591079578) < 1e-8);

console.log(JSON.stringify({
  source: {runes: corpus.runeCount, words: original.length,
    chapterWords, qLength: q.length, qHead: q.slice(0, 20),
    firstChapterRank: orders[0]},
  original: {printed, forward, reverse, best},
  null: {trials, atLeastOriginal, upperTailAddOne: (atLeastOriginal + 1) / (trials + 1),
    mean: maxima.reduce((s, n) => s + n, 0) / trials,
    median: maxima[1500], percentile95: maxima[2850]},
  independentNativePlant: nativeResult, exactRecovery: true,
  recoveredOriginalUnknownPlaintext: false
}, null, 2));
