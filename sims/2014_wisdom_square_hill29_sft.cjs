#!/usr/bin/env node
"use strict";

// Test the source-derived 2014 Wisdom square as a direct 5x5 Hill mixing key
// over the original 29-symbol LP2 ciphertext. Run from the repository root:
//   node sims/2014_wisdom_square_hill29_sft.cjs

const assert = require("node:assert/strict");
const fs = require("node:fs");

const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const shakespeare = fs.readFileSync("resources/control/shakespeare_first300k.txt", "utf8");
const alpha = corpus.translit;
const unknownPages = corpus.pages.filter(page => page.page <= 55);
const ciphertext = unknownPages.flatMap(page => page.indices);

assert.equal(unknownPages.length, 56, "physical pages 0-55 include the runeless p50 table");
assert.equal(unknownPages.filter(page => page.indices.length > 0).length, 55);
assert.equal(ciphertext.length, 12956, "canonical unknown LP2 rune count");
assert(ciphertext.every(x => Number.isInteger(x) && x >= 0 && x < 29));

const square = [
  [272,138,341,131,151],
  [366,199,130,320,18],
  [226,245,91,245,226],
  [18,320,130,199,366],
  [151,131,341,138,272],
];
const mod = value => ((value % 29) + 29) % 29;

function totient(value) {
  let n = value;
  let result = value;
  for (let p = 2; p * p <= n; p++) {
    if (n % p === 0) {
      while (n % p === 0) n /= p;
      result -= result / p;
    }
  }
  if (n > 1) result -= result / n;
  return result;
}

function modInverse(value) {
  for (let candidate = 1; candidate < 29; candidate++) {
    if (mod(value * candidate) === 1) return candidate;
  }
  throw new Error("matrix pivot has no inverse modulo 29");
}

function determinantMod29(matrix) {
  const a = matrix.map(row => row.map(mod));
  let determinant = 1;
  for (let column = 0; column < 5; column++) {
    let pivot = column;
    while (pivot < 5 && a[pivot][column] === 0) pivot++;
    if (pivot === 5) return 0;
    if (pivot !== column) {
      [a[pivot], a[column]] = [a[column], a[pivot]];
      determinant = mod(-determinant);
    }
    const value = a[column][column];
    determinant = mod(determinant * value);
    const inverse = modInverse(value);
    for (let j = column; j < 5; j++) a[column][j] = mod(a[column][j] * inverse);
    for (let row = column + 1; row < 5; row++) {
      const factor = a[row][column];
      for (let j = column; j < 5; j++) {
        a[row][j] = mod(a[row][j] - factor * a[column][j]);
      }
    }
  }
  return determinant;
}

function inverseMatrix(matrix) {
  const a = matrix.map((row, i) => [
    ...row.map(mod),
    ...Array.from({length: 5}, (_, j) => i === j ? 1 : 0),
  ]);
  for (let column = 0; column < 5; column++) {
    let pivot = column;
    while (pivot < 5 && a[pivot][column] === 0) pivot++;
    if (pivot === 5) throw new Error("matrix is singular modulo 29");
    [a[pivot], a[column]] = [a[column], a[pivot]];
    const inverse = modInverse(a[column][column]);
    for (let j = 0; j < 10; j++) a[column][j] = mod(a[column][j] * inverse);
    for (let row = 0; row < 5; row++) {
      if (row === column) continue;
      const factor = a[row][column];
      for (let j = 0; j < 10; j++) {
        a[row][j] = mod(a[row][j] - factor * a[column][j]);
      }
    }
  }
  return a.map(row => row.slice(5));
}

function multiplyMatrices(left, right) {
  return left.map((row, i) => right[0].map((_, j) =>
    mod(row.reduce((sum, value, k) => sum + value * right[k][j], 0))
  ));
}

function applyBlock(matrix, block, orientation) {
  if (orientation === "column") {
    return matrix.map(row => mod(row.reduce((sum, value, j) => sum + value * block[j], 0)));
  }
  return matrix[0].map((_, j) =>
    mod(block.reduce((sum, value, i) => sum + value * matrix[i][j], 0))
  );
}

function applyStream(matrix, opposite, symbols, orientation) {
  const output = [];
  for (let offset = 0; offset + 5 <= symbols.length; offset += 5) {
    const inputBlock = symbols.slice(offset, offset + 5);
    const outputBlock = applyBlock(matrix, inputBlock, orientation);
    const roundTrip = applyBlock(opposite, outputBlock, orientation);
    assert.deepEqual(roundTrip, inputBlock, "every complete Hill block must re-encrypt exactly");
    output.push(...outputBlock);
  }
  return output;
}

function tokenizeControl(source) {
  const normalized = source.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/K/g, "C")
    .replace(/Z/g, "S");
  const indexByToken = new Map(alpha.map((token, index) => [token, index]));
  const multi = alpha.filter(token => token.length > 1).sort((a, b) => b.length - a.length);
  const output = [];
  for (let i = 0; i < normalized.length;) {
    const ch = normalized[i];
    if (ch >= "A" && ch <= "Z") {
      const token = multi.find(candidate => normalized.startsWith(candidate, i));
      if (token) {
        output.push(indexByToken.get(token));
        i += token.length;
      } else if (indexByToken.has(ch)) {
        output.push(indexByToken.get(ch));
        i++;
      } else {
        i++;
      }
    } else {
      i++;
    }
  }
  return output;
}

function buildTrigramModel(symbols) {
  const trigrams = new Float64Array(29 * 29 * 29);
  const bigrams = new Float64Array(29 * 29);
  for (let i = 0; i + 2 < symbols.length; i++) {
    trigrams[symbols[i] * 841 + symbols[i + 1] * 29 + symbols[i + 2]]++;
    bigrams[symbols[i] * 29 + symbols[i + 1]]++;
  }
  return function score(sequence) {
    let total = 0;
    for (let i = 0; i + 2 < sequence.length; i++) {
      const a = sequence[i], b = sequence[i + 1], c = sequence[i + 2];
      const tri = trigrams[a * 841 + b * 29 + c];
      const bi = bigrams[a * 29 + b];
      total += Math.log((tri + 0.1) / (bi + 0.1 * 29));
    }
    return total / (sequence.length - 2);
  };
}

const rawMatrix = square.map(row => row.map(mod));
const phiMatrix = square.map(row => row.map(value => mod(totient(value))));
const matrices = [
  {name: "phi", matrix: phiMatrix},
  {name: "raw", matrix: rawMatrix},
];
const identity = Array.from({length: 5}, (_, i) =>
  Array.from({length: 5}, (_, j) => i === j ? 1 : 0)
);

for (const item of matrices) {
  item.determinant = determinantMod29(item.matrix);
  assert.notEqual(item.determinant, 0, item.name + " matrix must be invertible");
  item.inverse = inverseMatrix(item.matrix);
  assert.deepEqual(multiplyMatrices(item.matrix, item.inverse), identity);
  assert.deepEqual(multiplyMatrices(item.inverse, item.matrix), identity);
}

const control = tokenizeControl(shakespeare);
assert.equal(control.length, 218800, "fixed Shakespeare control token count");
const score = buildTrigramModel(control);
const rawScore = score(ciphertext);
const controlScore = score(control);
const variants = [];

for (const item of matrices) {
  for (const direction of [
    {name: "inverse", transform: item.inverse, opposite: item.matrix},
    {name: "direct", transform: item.matrix, opposite: item.inverse},
  ]) {
    for (const orientation of ["column", "row"]) {
      const output = applyStream(direction.transform, direction.opposite, ciphertext, orientation);
      variants.push({
        name: item.name + "-" + direction.name + "-" + orientation,
        score: score(output),
        outputSymbols: output.length,
        trailingUnprocessedSymbols: ciphertext.length - output.length,
        preview: output.slice(0, 80).map(index => alpha[index]).join(" "),
      });
    }
  }
}

assert.equal(ciphertext.length % 5, 1, "continuous 5-symbol blocks leave one terminal rune");
assert(variants.every(item => item.outputSymbols === 12955));
variants.sort((a, b) => b.score - a.score);

console.log(JSON.stringify({
  physicalPages: unknownPages.length,
  runeBearingPages: unknownPages.filter(page => page.indices.length > 0).length,
  unknownRunes: ciphertext.length,
  blockSize: 5,
  transformedRunesPerVariant: 12955,
  unprocessedTerminalRunes: 1,
  rawSquareMod29: rawMatrix,
  phiSquareMod29: phiMatrix,
  determinantsMod29: {
    raw: matrices.find(item => item.name === "raw").determinant,
    phi: matrices.find(item => item.name === "phi").determinant,
  },
  controlRunes: control.length,
  rawUnknownTrigramScore: rawScore,
  nativeShakespeareControlScore: controlScore,
  variants,
}, null, 2));
