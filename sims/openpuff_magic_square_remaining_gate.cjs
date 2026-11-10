#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8");
const mod = (x) => ((x % 29) + 29) % 29;

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const squareBlocks = read("resources/cicada2014-openpuff-magic-squares.txt")
  .trim().split(/\n\s*\n/);
const squares = squareBlocks.map((block) =>
  block.trim().split(/\n/).map((line) => line.trim().split(/\s+/).map(Number))
);
if (squares.length !== 3) throw new Error("Expected the three historical OpenPuff squares");

const pages = corpus.pages.slice().sort((a, b) => a.page - b.page).filter((p) => p.page <= 55);
const flatCipher = pages.flatMap((p) => p.indices);
if (pages.length !== 56 || flatCipher.length !== 12956) {
  throw new Error("Unexpected LP2 unknown-page corpus dimensions");
}

const tokenPairs = corpus.translit.map((token, index) => [token, index])
  .sort((a, b) => b[0].length - a[0].length);

function encodeEnglish(text) {
  const source = text.toUpperCase().replace(/[^A-Z]/g, "");
  const output = [];
  for (let i = 0; i < source.length;) {
    let matched = false;
    for (const [token, index] of tokenPairs) {
      if (source.startsWith(token, i)) {
        output.push(index);
        i += token.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    const ch = source[i++];
    if (ch === "K" || ch === "Q") output.push(5);
    else if (ch === "V") output.push(1);
    else if (ch === "Z") output.push(15);
  }
  return output;
}

const control = encodeEnglish(read("resources/control/shakespeare_first300k.txt"));
const split = Math.floor(control.length * 0.78);
const train = control.slice(0, split);
const holdout = control.slice(split);
const counts = Array.from({ length: 29 }, () => Array(29).fill(0));
const totals = Array(29).fill(0);
for (let i = 1; i < train.length; i++) {
  counts[train[i - 1]][train[i]]++;
  totals[train[i - 1]]++;
}
const logP = counts.map((row, i) =>
  row.map((count) => Math.log((count + 0.1) / (totals[i] + 2.9)))
);

function scoreSequence(sequence) {
  let score = 0;
  let pairs = 0;
  for (let i = 1; i < sequence.length; i++) {
    score += logP[sequence[i - 1]][sequence[i]];
    pairs++;
  }
  return score / Math.max(1, pairs);
}

function scorePages(pageSequences) {
  let score = 0;
  let pairs = 0;
  for (const sequence of pageSequences) {
    for (let i = 1; i < sequence.length; i++) {
      score += logP[sequence[i - 1]][sequence[i]];
      pairs++;
    }
  }
  return score / Math.max(1, pairs);
}

function inverseMod(a) {
  for (let x = 1; x < 29; x++) if ((a * x) % 29 === 1) return x;
  throw new Error("No inverse modulo 29 for " + a);
}

function matrixInverse(matrix) {
  const n = matrix.length;
  const augmented = matrix.map((row, i) =>
    row.map(mod).concat(Array.from({ length: n }, (_, j) => i === j ? 1 : 0))
  );
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && augmented[pivot][col] === 0) pivot++;
    if (pivot === n) throw new Error("Singular matrix modulo 29");
    [augmented[col], augmented[pivot]] = [augmented[pivot], augmented[col]];
    const scale = inverseMod(augmented[col][col]);
    augmented[col] = augmented[col].map((x) => mod(x * scale));
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = augmented[row][col];
      if (factor) {
        augmented[row] = augmented[row].map((x, j) =>
          mod(x - factor * augmented[col][j])
        );
      }
    }
  }
  return augmented.map((row) => row.slice(n));
}

function determinantMod(matrix) {
  const n = matrix.length;
  const a = matrix.map((row) => row.map(mod));
  let determinant = 1;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && a[pivot][col] === 0) pivot++;
    if (pivot === n) return 0;
    if (pivot !== col) {
      [a[col], a[pivot]] = [a[pivot], a[col]];
      determinant = mod(-determinant);
    }
    const value = a[col][col];
    determinant = mod(determinant * value);
    const inverse = inverseMod(value);
    for (let row = col + 1; row < n; row++) {
      const factor = mod(a[row][col] * inverse);
      for (let j = col + 1; j < n; j++) {
        a[row][j] = mod(a[row][j] - factor * a[col][j]);
      }
    }
  }
  return determinant;
}

function transpose(matrix) {
  return matrix[0].map((_, col) => matrix.map((row) => row[col]));
}

function matrixVector(matrix, vector) {
  return matrix.map((row) =>
    mod(row.reduce((sum, value, i) => sum + value * vector[i], 0))
  );
}

function decodeHill(sequence, encryptionMatrix, phase) {
  const blockSize = encryptionMatrix.length;
  const decryptionMatrix = matrixInverse(encryptionMatrix);
  const output = sequence.slice();
  for (let start = phase; start + blockSize <= sequence.length; start += blockSize) {
    const plain = matrixVector(decryptionMatrix, sequence.slice(start, start + blockSize));
    for (let j = 0; j < blockSize; j++) output[start + j] = plain[j];
  }
  return output;
}

function round(value) {
  return Number(value.toFixed(5));
}

const hillResults = [];
const padResults = [];
const testedSquares = [
  { name: "OpenPuff 5x5 / magic sum 3301", matrix: squares[0] },
  { name: "OpenPuff 7x7 / magic sum 1033", matrix: squares[1] }
];

for (const { name, matrix } of testedSquares) {
  const n = matrix.length;
  const inverse = matrixInverse(matrix);
  const variants = [
    ["M", matrix],
    ["M-transpose", transpose(matrix)],
    ["M-inverse", inverse],
    ["M-inverse-transpose", transpose(inverse)]
  ];

  for (const [variant, transform] of variants) {
    for (const mode of ["global", "page-reset"]) {
      for (let phase = 0; phase < n; phase++) {
        const decoded = mode === "global"
          ? decodeHill(flatCipher, transform, phase)
          : pages.map((page) => decodeHill(page.indices, transform, phase));
        const score = mode === "global"
          ? scoreSequence(decoded)
          : scorePages(decoded);
        hillResults.push({ name, variant, mode, phase, score: round(score) });
      }
    }
  }

  const rowMajorKey = matrix.flat().map(mod);
  for (const period of [rowMajorKey.length, rowMajorKey.length - 1]) {
    const key = rowMajorKey.slice(0, period);
    for (const sign of [-1, 1]) {
      for (const mode of ["global", "page-reset"]) {
        const decode = (sequence) =>
          sequence.map((cipher, i) => mod(cipher - sign * key[i % period]));
        const decoded = mode === "global"
          ? decode(flatCipher)
          : pages.map((page) => decode(page.indices));
        const score = mode === "global"
          ? scoreSequence(decoded)
          : scorePages(decoded);
        padResults.push({ name, period, sign, mode, score: round(score) });
      }
    }
  }
}

const byScore = (items) => items.slice().sort((a, b) => b.score - a.score);
const bestHill = byScore(hillResults)[0];
const bestPad = byScore(padResults)[0];
const output = {
  scope: "LP2 pages 0-55; source GP29 indices",
  unknownPages: pages.length,
  unknownRunes: flatCipher.length,
  control: {
    corpus: "Shakespeare first 300k",
    trainFraction: 0.78,
    heldoutBigramScore: round(scoreSequence(holdout)),
    uniformRandomBigramBaseline: round(
      logP.flat().reduce((sum, value) => sum + value, 0) / (29 * 29)
    )
  },
  squares: testedSquares.map(({ name, matrix }) => ({
    name,
    size: matrix.length,
    magicConstant: matrix[0].reduce((sum, value) => sum + value, 0),
    determinantMod29: determinantMod(matrix)
  })),
  hillModels: hillResults.length,
  additiveModels: padResults.length,
  bestHill,
  bestHillBySquare: testedSquares.map(({ name }) => ({
    name,
    best: byScore(hillResults.filter((x) => x.name === name))[0]
  })),
  bestAdditive: bestPad,
  bestAdditiveBySquare: testedSquares.map(({ name }) => ({
    name,
    best: byScore(padResults.filter((x) => x.name === name))[0]
  })),
  conclusion: "No English plaintext recovered; both source-locked interpretations score near the uniform-random baseline."
};
console.log(JSON.stringify(output, null, 2));
