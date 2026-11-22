"use strict";
/**
 * Fifth-order p7 original red-word recurrence with FIVE unknown coefficients
 * multiplying the prior five ciphertext values, tested without brute-force.
 * Every printed word may have its own five coefficient values, 5-state IV,
 * output multiplier, output offset and recurrence constant.
 *
 * Standalone Windows Node.js 22 SFT:
 *   node sims/lp2_p7_five_cipher_taps_allsecret_longword_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus, physicalLP2Page} = require("./lp2_word_pages.cjs");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const mod = x => ((x % 29) + 29) % 29;
const weights = [11, 26, 8, 15, 2];
const red = [[23, 3], [22, 16, 2, 25], [5, 7, 11],
  [14, 28], [6, 28, 19]];
assert.deepEqual(gp.pages[7].indices.slice(-14), red.flat());
assert.deepEqual(red.map(word => word.reduce((v, r) => mod(v * r), 1)), weights);
const originals = parseSharedCorpus();
assert.equal(originals.words.length, 2896);
assert.equal(originals.runeCount, 12956);
assert.equal(originals.crossPageWords, 32);
const runeToIndex = new Map(gp.runes.map((glyph, value) => [glyph, value]));
const inverse = Array(29).fill(0);
for (let x = 1; x < 29; x++)
  for (let y = 1; y < 29; y++)
    if (x * y % 29 === 1) inverse[x] = y;
assert(inverse.slice(1).every(v => v > 0));

/** @param {number[]} source @returns {number[]} */
function sourceInnovation(source) {
  const result = [];
  for (let i = 5; i < source.length; i++) {
    let value = source[i];
    for (let j = 0; j < 5; j++)
      value -= weights[j] * source[i - j - 1];
    result.push(mod(value));
  }
  return result;
}
/**
 * Exact finite-field Gaussian consistency solver, with any five unknown q.
 * A rank-deficient compatible system is counted as compatible because
 * free coefficients are permitted to take any original GP29 value.
 *
 * @param {number[][]} matrix n×5 matrix
 * @param {number[]} target n-vector
 * @returns {{rank:number, q:number[]}|null}
 */
function solveFive(matrix, target) {
  assert.equal(matrix.length, target.length);
  const rows = matrix.map((line, k) => line.map(mod).concat(mod(target[k])));
  let rank = 0;
  const pivots = [];
  for (let col = 0; col < 5; col++) {
    let pivot = rank;
    while (pivot < rows.length && rows[pivot][col] === 0) pivot++;
    if (pivot === rows.length) continue;
    [rows[pivot], rows[rank]] = [rows[rank], rows[pivot]];
    const scale = inverse[rows[rank][col]];
    for (let j = col; j <= 5; j++)
      rows[rank][j] = mod(rows[rank][j] * scale);
    for (let i = 0; i < rows.length; i++) {
      if (i === rank || rows[i][col] === 0) continue;
      const multiplier = rows[i][col];
      for (let j = col; j <= 5; j++)
        rows[i][j] = mod(rows[i][j] - multiplier * rows[rank][j]);
    }
    pivots.push(col);
    rank++;
  }
  for (let i = rank; i < rows.length; i++)
    if (rows[i][5] !== 0) return null;
  const q = Array(5).fill(0);
  for (let i = 0; i < rank; i++) q[pivots[i]] = rows[i][5];
  for (let i = 0; i < matrix.length; i++)
    assert.equal(mod(matrix[i].reduce((sum, entry, j) =>
      sum + entry * q[j], 0)), mod(target[i]));
  return {rank, q};
}
/**
 * All hidden b, r and 5 state initials cancel. For each a≠0, solve the
 * unknown five ciphertext-feedback coefficients exactly.
 * @param {number[]} cipher
 * @param {number[]} plain
 * @returns {{a:number,q:number[],rank:number}|null}
 */
function compatible(cipher, plain) {
  assert.equal(cipher.length, plain.length);
  const cResid = sourceInnovation(cipher);
  const pResid = sourceInnovation(plain);
  const equations = cipher.length - 6;
  assert(equations >= 7);
  const matrix = Array.from({length: equations}, (_, row) =>
    Array.from({length: 5}, (_, j) =>
      mod(cipher[row + 6 - j - 1] - cipher[5 - j - 1])));
  const dc = Array.from({length: equations}, (_, row) =>
    mod(cResid[row + 1] - cResid[0]));
  const dp = Array.from({length: equations}, (_, row) =>
    mod(pResid[row + 1] - pResid[0]));
  for (let a = 1; a < 29; a++) {
    const rhs = dc.map((value, i) => mod(value - a * dp[i]));
    const hit = solveFive(matrix, rhs);
    if (hit) return {a, q: hit.q, rank: hit.rank};
  }
  return null;
}
/** @param {number[]} plain @param {number[]} q @param {number} a
 *  @param {number} b @param {number} r @param {number[]} seed
 *  @returns {number[]} */
function encrypt(plain, q, a, b, r, seed) {
  assert.equal(q.length, 5);
  assert.equal(seed.length, 5);
  const K = seed.slice();
  const cipher = [];
  for (let i = 0; i < plain.length; i++) {
    if (i >= 5) {
      let next = r;
      for (let j = 0; j < 5; j++)
        next += weights[j] * K[i - j - 1] + q[j] * cipher[i - j - 1];
      K.push(mod(next));
    }
    cipher.push(mod(a * plain[i] + b + K[i]));
  }
  return cipher;
}
const positive = encodeSourceNativeGP("CIRCUMFERENCES");
assert.equal(positive.length, 14);
const seeds = [[23, 2, 5, 2, 19], [0, 0, 0, 0, 0]];
let positives = 0;
for (const seed of seeds) {
  for (let k = 0; k < 15; k++) {
    const q = [k, mod(k + 7), mod(3 * k + 5),
      mod(11 * k + 8), mod(17 * k + 1)];
    const a = mod(3 * k + 1) || 1;
    const b = mod(9 * k + 2), r = mod(4 * k + 11);
    const cipher = encrypt(positive, q, a, b, r, seed);
    const found = compatible(cipher, positive);
    assert(found, "failed genuine source-native positive at k=" + k);
    positives++;
  }
}
assert.equal(positives, 30);

const {sourceNativeLongwords}=require("./lp2_source_native_longword_lexicon.cjs");
const wordsByLength=sourceNativeLongwords();
assert.equal(wordsByLength.get(13).length,426);
assert.equal(wordsByLength.get(14).length,175);
const outcomes = [];
for (const sourceWord of originals.words) {
  if (sourceWord.length < 13) continue;
  const ciphertext = [...sourceWord.runes].map(glyph => {
    const index = runeToIndex.get(glyph);
    assert.notEqual(index, undefined);
    return index;
  });
  assert.equal(ciphertext.length, sourceWord.length);
  const compatibleWords = [];
  for (const entry of wordsByLength.get(ciphertext.length) || []) {
    const solution = compatible(ciphertext, entry.indices);
    if (solution) compatibleWords.push({
      word: entry.word, q: solution.q, multiplier: solution.a,
      matrixRank: solution.rank
    });
  }
  outcomes.push({
    physicalPage: physicalLP2Page(sourceWord.startPage),
    originalGPWordLength: ciphertext.length,
    nativeLexiconTested: wordsByLength.get(ciphertext.length).length,
    compatibleNativeWords: compatibleWords
  });
}
assert.equal(outcomes.length, 7);
assert.deepEqual(outcomes.map(x => [x.physicalPage,
  x.originalGPWordLength, x.compatibleNativeWords.length]), [
  [11,13,11], [13,14,0], [16,13,11], [25,14,1],
  [43,14,0], [52,13,23], [55,13,10]
]);
assert.deepEqual(outcomes.find(x => x.physicalPage === 25)
  .compatibleNativeWords.map(x => x.word), ["wurttembergers"]);
console.log(JSON.stringify({
  sourceProducts: weights,
  model: "K[i]=Σ w[j]K[i-j-1]+Σ q[j]C[i-j-1]+r; C[i]=aP[i]+b+K[i]",
  secretFamily: "all GF29^5 ciphertext-driver q, all nonzero a, arbitrary r,b and five independent IV runes for every original printed word",
  exactLinearEquations: "n-6 in 5 unknown ciphertext coefficients, after enumerating 28 output multipliers and eliminating constants",
  nativeDictionaryByRuneLength: [13,14].map(n =>
    ({length:n,words:wordsByLength.get(n).length})),
  originalWordResults: outcomes,
  positiveNativeEncryptedWords: positives,
  decision: "Two original 14-rune words admit no native dictionary plaintext under ANY full five-tap linear ciphertext-driven coefficient choice; only p25 fits an isolated rare demonym",
  recoveredUnknownPlaintext: false,
  caveat: "This excludes direct single-layer GP-native dictionary text only; arbitrary extra layers or non-dictionary plaintext remain outside scope"
}, null, 2));
