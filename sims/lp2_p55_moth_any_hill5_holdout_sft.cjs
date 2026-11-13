"use strict";

/**
 * Original-source GP29 5x5 Hill key recovery from the provisional LP2 p55
 * moth-linked seven-word LP1 crib, using a five-symbol withheld prediction.
 *
 * One runnable file: node sims/lp2_p55_moth_any_hill5_holdout_sft.cjs
 *
 * The original plaintext hypothesis is UNPROVEN. A failure excludes the
 * fixed block-aligned 5x5 Hill family for that hypothesis, not the crib or
 * other cryptographic mechanisms. Only the first 25 rune pairs fit a key.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));

const sourcePhrase = "THE TOTIENT FUNCTION IS SACRED ALL THINGS";
const lp1 = read("resources/liber-primus/lp1-plaintext-reference.txt");
const lp1Prose = lp1.toUpperCase().replace(/\s+/g, " ");
assert(lp1Prose.includes("THE TOTIENT FUNCTION IS SACRED"));
assert(lp1Prose.includes("ALL THINGS SHOULD BE ENCRYPTED"));

/**
 * Source-authenticated LP1 orthography includes ᛝ=ING and ᛡ=IO.
 * @param {string} word ASCII English word
 * @returns {number[]} Gematria Primus rune indices
 */
function encodeWord(word) {
  const normalized = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const tokens = gp.translit.map((name, index) => ({name, index}))
    .sort((a, b) => b.name.length - a.name.length);
  const values = [];
  for (let i = 0; i < normalized.length;) {
    if (normalized.startsWith("ING", i)) {
      values.push(21);
      i += 3;
    } else if (normalized.startsWith("IO", i)) {
      values.push(27);
      i += 2;
    } else {
      const token = tokens.find(t => normalized.startsWith(t.name, i));
      assert(token, "unmapped GP letter in " + word);
      values.push(token.index);
      i += token.name.length;
    }
  }
  return values;
}
const phraseWords = sourcePhrase.split(" ");
const phraseParts = phraseWords.map(encodeWord);
assert.deepEqual(phraseParts.map(p => p.length), [2, 7, 7, 2, 6, 3, 3]);
const plaintext = phraseParts.flat();
assert.equal(plaintext.length, 30);

// The original p55 has a single initial rune carried from p54.
// Physical p50 is runeless and omitted by this derivative transcription.
const printedP55 = read("resources/liber-primus/lp2-transcription.txt")
  .split(/\n%\n/)[54].replace(/\/\n/g, "").replace(/\n/g, "");
const printedWords = printedP55.match(/[\u16A0-\u16FF]+/gu) || [];
assert.equal(printedWords.length, 17);
assert.equal(printedWords[0], "ᛝ");
assert.deepEqual(printedWords.slice(-7).map(w => w.length),
  [2, 7, 7, 2, 6, 3, 3]);
const originalRunes = [...printedWords.join("")].map(glyph => {
  const ordinal = gp.runes.indexOf(glyph);
  assert(ordinal >= 0);
  return ordinal;
});
assert.deepEqual(originalRunes, gp.pages.find(page => page.page === 55).indices);
assert.equal(originalRunes.length, 76);
const ciphertext = originalRunes.slice(46);
assert.equal(ciphertext.length, 30);

/** @param {number} x @returns {number} */
function mod29(x) { return (x % 29 + 29) % 29; }
/** @param {number} x @returns {number} */
function inverseScalar(x) {
  for (let k = 1; k < 29; k++) if (x * k % 29 === 1) return k;
  throw new Error("noninvertible field element " + x);
}
/**
 * Dense GF(29) matrix product.
 * @param {number[][]} left
 * @param {number[][]} right
 * @returns {number[][]}
 */
function multiply(left, right) {
  assert.equal(left[0].length, right.length);
  return left.map(row => right[0].map((_, col) => mod29(
    row.reduce((total, value, i) => total + value * right[i][col], 0))));
}
/**
 * Gauss-Jordan inversion over GF(29); fails on a singular basis.
 * @param {number[][]} matrix
 * @returns {number[][]}
 */
function inverseMatrix(matrix) {
  const n = matrix.length;
  assert(matrix.every(row => row.length === n));
  const a = matrix.map((row, i) =>
    [...row.map(mod29), ...Array.from({length:n}, (_, j) => Number(i===j))]);
  for (let col = 0; col < n; col++) {
    const pivot = a.findIndex((row, i) => i >= col && row[col] !== 0);
    assert(pivot >= 0, "singular provisional-plaintext basis");
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const scale = inverseScalar(a[col][col]);
    for (let j = 0; j < 2*n; j++) a[col][j] = mod29(a[col][j] * scale);
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = a[row][col];
      for (let j = 0; j < 2*n; j++)
        a[row][j] = mod29(a[row][j] - factor*a[col][j]);
    }
  }
  return a.map(row => row.slice(n));
}
/** @param {number[]} values @returns {number[][]} */
function blocksOfFive(values) {
  assert.equal(values.length, 30);
  return Array.from({length:6}, (_, i) => values.slice(5*i,5*i+5));
}
/** @param {number[][]} blocks @returns {number[][]} */
function firstFiveColumns(blocks) {
  return Array.from({length:5}, (_, row) =>
    Array.from({length:5}, (_, col) => blocks[col][row]));
}
/** @param {number[]} values @returns {number[][]} */
function column(values) { return values.map(value => [value]); }
/** @param {number[][]} matrix @param {number[]} values @returns {number[]} */
function apply(matrix, values) {
  return multiply(matrix, column(values)).map(row => row[0]);
}

const pBlocks = blocksOfFive(plaintext);
const cBlocks = blocksOfFive(ciphertext);
const pBasis = firstFiveColumns(pBlocks);
const pBasisInverse = inverseMatrix(pBasis); // First 25 plaintext symbols rank five.
const coefficient = apply(pBasisInverse, pBlocks[5]);
assert.deepEqual(coefficient, [25, 4, 15, 6, 7]);

// Any 5x5 matrix, including a completely secret/invertible one, has
// the same sixth-block prediction once the first five pairs are fixed.
const cBasis = firstFiveColumns(cBlocks);
const unknownHillKey = multiply(cBasis, pBasisInverse);
assert.deepEqual(unknownHillKey, [
  [3,23,28,4,11], [27,4,4,28,13], [3,1,24,2,23],
  [24,4,18,13,4], [15,20,19,22,22]
]);
inverseMatrix(unknownHillKey); // Even the fitted 25-symbol key is reversible.
const predictedLast = apply(unknownHillKey, pBlocks[5]);
const observedLast = cBlocks[5];
assert.deepEqual(predictedLast, [13, 19, 22, 1, 22]);
assert.deepEqual(observedLast, [11, 1, 17, 18, 10]);
const holdoutMatches = predictedLast.filter((v,i) => v===observedLast[i]).length;
assert.equal(holdoutMatches, 0);

// Construct an actual complete six-block Hill ciphertext with the source
// 5x5 LP1 p5 square, then recover its entire unknown key from 25 symbols.
const sourceSquare = [
  [272,138,341,131,151],
  [366,199,130,320,18],
  [226,245,91,245,226],
  [18,320,130,199,366],
  [151,131,341,138,272]
];
assert(sourceSquare.every(row => row.reduce((sum,v)=>sum+v,0)===1033));
const trueKey = sourceSquare.map(row => row.map(mod29));
inverseMatrix(trueKey);
const plantBlocks = pBlocks.map(part => apply(trueKey, part));
const recoveredKey = multiply(firstFiveColumns(plantBlocks),pBasisInverse);
assert.deepEqual(recoveredKey, trueKey);
assert.deepEqual(apply(recoveredKey,pBlocks[5]), plantBlocks[5]);
assert.deepEqual(plantBlocks.map(part => apply(inverseMatrix(trueKey),part)),
  pBlocks);

console.log(JSON.stringify({
  status: "Conditional all-secret Hill(5,GF29) exclusion; no recovered plaintext",
  sourcePhrase, printedBodyLastSevenLengths:phraseParts.map(p => p.length),
  originalPhysicalPage:55, startRuneOffset:46,
  firstFivePlaintextColumnsRank:5,
  heldoutPlaintextCoordinates:coefficient,
  originalHeldoutCipher:observedLast,
  forcedHeldoutCipher:predictedLast,
  heldoutExactSymbols:holdoutMatches,
  sourceSquarePositivePlant: "30/30 GP runes; 25-symbol key fully recovered",
  decision: "No stationary block-aligned 5x5 GF29 linear Hill key can encode this exact provisional 30-rune phrase into the original p55 suffix."
},null,2));
