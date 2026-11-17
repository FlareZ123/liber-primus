#!/usr/bin/env node
"use strict";

/**
 * Source-frozen LP2 p55 75-rune Hill gate.
 *
 * The original 2014 OpenPuff 5x5/7x7/5x5 matrices have 99 cells.
 * Removing the 7x7 middle square's 24-cell circumference leaves three
 * 5x5 keys, precisely enough for p55's last 75 runes after the opening cross-page word fragment.
 * Try both ordinary Hill column and row-vector conventions, with no key
 * fitting, segmentation search, or hidden padding.
 *
 * Run on Windows 11 (Node.js 22) from repository root:
 *   node sims/lp2_p55_2014_three5x5_circumference_hill_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source = read("resources/cicada2014-openpuff-magic-squares.txt");
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const squares = source.trim().split(/\r?\n\s*\r?\n/).map(block =>
  block.trim().split(/\r?\n/).map(line => line.trim().split(/\s+/).map(Number)));
assert.deepEqual(squares.map(square => square.length), [5, 7, 5]);
const keys = [squares[0], squares[1].slice(1, 6).map(row => row.slice(1, 6)), squares[2]];
assert.ok(keys.every(key => key.length === 5 && key.every(row => row.length === 5)));
const page = corpus.pages.find(candidate => candidate.page === 55);
assert.equal(page.indices.length, 76);
const words = transcription.split("%")[54].replace(/\/\s*/g, "")
  .match(/[\u16a0-\u16ff]+/gu) || [];
assert.deepEqual(words.map(word => [...word].length),
  [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
assert.deepEqual(words.flatMap(word => [...word].map(r => corpus.runes.indexOf(r))), page.indices);
const header = page.indices[0];
const ciphertext = page.indices.slice(1);
assert.equal(ciphertext.length, 75);
const mod = n => (n % 29 + 29) % 29;
/** @param {number} x */
function inverseScalar(x) {
  for (let i = 1; i < 29; i++) if (mod(i * x) === 1) return i;
  throw new Error("singular key");
}
/** @param {number[][]} matrix */
function inverseMatrix(matrix) {
  const a = matrix.map((row, i) => row.map(mod)
    .concat(Array.from({length: 5}, (_, j) => Number(i === j))));
  let determinant = 1;
  for (let col = 0; col < 5; col++) {
    const pivot = a.findIndex((row, i) => i >= col && row[col] !== 0);
    assert(pivot >= col, "matrix must be nonsingular over GP29");
    if (pivot !== col) {
      [a[pivot], a[col]] = [a[col], a[pivot]];
      determinant = mod(-determinant);
    }
    determinant = mod(determinant * a[col][col]);
    const scale = inverseScalar(a[col][col]);
    a[col] = a[col].map(value => mod(value * scale));
    for (let i = 0; i < 5; i++) {
      if (i === col) continue;
      const factor = a[i][col];
      a[i] = a[i].map((v, j) => mod(v - factor * a[col][j]));
    }
  }
  return {inverse: a.map(row => row.slice(5)), determinant};
}
/** @param {number[][]} matrix */
const transpose = matrix => matrix[0].map((_, j) => matrix.map(row => row[j]));
/** @param {number[][]} matrix @param {number[]} vector */
const multiply = (matrix, vector) =>
  matrix.map(row => mod(row.reduce((sum, x, i) => sum + x * vector[i], 0)));
/** @param {number[]} sequence @param {number[][][]} matrices */
function transform(sequence, matrices) {
  assert.equal(sequence.length, 75);
  const out = [];
  for (let k = 0; k < 3; k++) {
    for (let at = 0; at < 25; at += 5) {
      out.push(...multiply(matrices[k], sequence.slice(25 * k + at, 25 * k + at + 5)));
    }
  }
  return out;
}
/** @param {number[]} sequence */
function ioc(sequence) {
  const freq = Array(29).fill(0);
  for (const value of sequence) freq[value]++;
  return freq.reduce((sum, n) => sum + n * (n - 1), 0)
    / (sequence.length * (sequence.length - 1));
}
const inv = keys.map(inverseMatrix);
assert.deepEqual(inv.map(x => x.determinant), [10, 8, 3]);
const control = corpus.pages.find(p => p.page === 57).indices.slice(0, 75);
assert.equal(control.length, 75);
const variants = {};
for (const orientation of ["column", "row"]) {
  // Standard column: C = K P. Row: C(row) = P(row) K.
  // In column-array arithmetic the latter is C = K^T P.
  const enc = orientation === "column" ? keys : keys.map(transpose);
  const dec = orientation === "column" ? inv.map(x => x.inverse)
    : inv.map(x => transpose(x.inverse));
  const plantedCipher = transform(control, enc);
  assert.deepEqual(transform(plantedCipher, dec), control);
  const decoded = transform(ciphertext, dec);
  assert.deepEqual(transform(decoded, enc), ciphertext);
  variants[orientation] = {
    decodedIoC: ioc(decoded),
    nativeP57Control: "75/75",
    forwardOriginal: "75/75",
    output: decoded.map(index => corpus.translit[index]).join("")
  };
}
assert(Math.abs(ioc(page.indices) - 0.037894736842105266) < 1e-12);
assert(Math.abs(variants.column.decodedIoC - 0.04036036036036036) < 1e-12);
assert(Math.abs(variants.row.decodedIoC - 0.0381981981981982) < 1e-12);
console.log(JSON.stringify({
  scope: "Hypothesized circumference-peel three-matrix Hill transfer to original p55",
  classification: "Bounded negative, no recovered unknown plaintext or authentic key",
  originalPage: 55, originalRunes: 76,
  firstRune: corpus.translit[header], remainingRunes: ciphertext.length,
  squareCells: 99, peeledMiddleCircumference: 24,
  matrixDeterminantsMod29: inv.map(x => x.determinant),
  originalIoC: ioc(page.indices), variants
}, null, 2));
console.log("SFT PASS");
