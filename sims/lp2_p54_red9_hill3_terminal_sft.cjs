"use strict";
/**
 * Original LP2 p54 red-nine as a fixed 3x3 Hill cipher on the terminal
 * p54-after-rubric through p55 original rune stream (299 signs).
 *
 * Source: canonical corpus + ink. Pure read-only SFT, CommonJS Node 22.
 * The final two symbols are a mandatory undecoded tail for a 3-block
 * candidate; this tests its first 297 symbols only, without inventing padding.
 *
 * Run: node sims/lp2_p54_red9_hill3_terminal_sft.cjs
 */
const assert = require("node:assert/strict");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const ink = require("../resources/liber-primus/lp2-ink-annotations.json");
const mod = x => ((x % 29) + 29) % 29;

/** @param {number[][]} matrix @returns {number[][]} */
function invert3(matrix) {
  const a = matrix.map((row, i) => [
    ...row.map(mod), ...Array.from({length: 3}, (_, j) => Number(i === j))
  ]);
  for (let c = 0; c < 3; c++) {
    const pivot = a.findIndex((row, r) => r >= c && row[c] !== 0);
    assert.ok(pivot >= c, "red-nine key must be invertible over GF29");
    [a[c], a[pivot]] = [a[pivot], a[c]];
    const scale = Array.from({length: 28}, (_, i) => i + 1)
      .find(x => mod(x * a[c][c]) === 1);
    assert.ok(scale !== undefined);
    a[c] = a[c].map(x => mod(x * scale));
    for (let r = 0; r < 3; r++) {
      if (r === c) continue;
      const k = a[r][c];
      a[r] = a[r].map((x, j) => mod(x - k * a[c][j]));
    }
  }
  assert.deepEqual(a.map(row => row.slice(0, 3)), [
    [1, 0, 0], [0, 1, 0], [0, 0, 1]
  ]);
  return a.map(row => row.slice(3));
}

/** @param {number[]} source @param {number[][]} matrix
 *  @param {boolean} transpose @returns {number[]} */
function applyFullBlocks(source, matrix, transpose = false) {
  const out = [];
  for (let k = 0; k + 2 < source.length; k += 3) {
    for (let i = 0; i < 3; i++) {
      let sum = 0;
      for (let j = 0; j < 3; j++) {
        sum += (transpose ? matrix[j][i] : matrix[i][j]) * source[k + j];
      }
      out.push(mod(sum));
    }
  }
  return out;
}

/** @param {number[]} indices @returns {number} */
function ioc(indices) {
  const counts = Array(29).fill(0);
  for (const i of indices) counts[i]++;
  return counts.reduce((s, x) => s + x * (x - 1), 0) /
    (indices.length * (indices.length - 1));
}
/** @param {number[]} indices @param {number} n @returns {string} */
function translit(indices, n) {
  return indices.slice(0, n).map(i => corpus.translit[i]).join("-");
}
const red54 = ink.pages.find(p => p.page === 54).red_spans
  .flatMap(span => [...span.runes].map(r => corpus.runes.indexOf(r)));
assert.deepEqual(red54, [24, 19, 21, 23, 27, 2, 14, 10, 19]);
const a54 = corpus.pages.find(p => p.page === 54).indices;
const a55 = corpus.pages.find(p => p.page === 55).indices;
const known56 = corpus.pages.find(p => p.page === 56).indices;
const clear57 = corpus.pages.find(p => p.page === 57).indices;
assert.deepEqual(a54.slice(0, 9), red54);
assert.deepEqual([a54.length, a55.length, known56.length, clear57.length],
  [232, 76, 85, 95]);
assert.deepEqual(
  ink.pages.find(p => p.page === 54).large_punctuation,
  [[9, 13, "red"]]
);
assert.deepEqual(
  ink.pages.find(p => p.page === 55).large_punctuation,
  [[76, 13, "red"]]
);
const input = [...a54.slice(9), ...a55];
assert.equal(input.length, 299);
const matrix = Array.from({length: 3}, (_, i) => red54.slice(i * 3, i * 3 + 3));
const inverse = invert3(matrix);
assert.deepEqual(inverse, [[0, 16, 9], [8, 3, 0], [8, 8, 27]]);
const models = [];
for (const transpose of [false, true]) {
  const decoded = applyFullBlocks(input, inverse, transpose);
  assert.equal(decoded.length, 297);
  assert.deepEqual(applyFullBlocks(decoded, matrix, transpose),
    input.slice(0, 297));
  const positiveControls = [known56, clear57].map(clear => {
    const length = clear.length - clear.length % 3;
    const test = clear.slice(0, length);
    const ciphertext = applyFullBlocks(test, matrix, transpose);
    const restored = applyFullBlocks(ciphertext, inverse, transpose);
    assert.deepEqual(restored, test);
    return {sourceRunes: clear.length, tripletRunes: length,
      recoveredExactly: restored.length};
  });
  const readout = {orientation: transpose ? "row-vector" : "column-vector",
    originalIoC: ioc(input.slice(0, 297)), decryptedIoC: ioc(decoded),
    openingGp100: translit(decoded, 100),
    knownSolvedPlants: positiveControls,
    originalLossless297: true, undecodedTwoRuneTail: input.slice(297)};
  models.push(readout);
}
assert.ok(models.every(x => x.decryptedIoC < 0.045));
console.log(JSON.stringify({
  source: "original LP2 p54 71.jpg and p55 72.jpg, checked corpus and ink",
  clue: "p54 initial nine red runes; two 13-dot punctuation frames",
  matrix, inverse, originalBodyRunes: input.length,
  nativeClearP57IoC: ioc(clear57), tests: models,
  decision: "Neither standard red-nine Hill3 inverse gives recognizable GP plaintext; source has no instruction for the two-rune terminal remainder."
}, null, 2));
