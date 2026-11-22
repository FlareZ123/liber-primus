"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
  "utf8"
));
const PRIME = 29;
const SIZE = 5;
const originalSquare = [
  [272, 138, 341, 131, 151],
  [366, 199, 130, 320, 18],
  [226, 245, 91, 245, 226],
  [18, 320, 130, 199, 366],
  [151, 131, 341, 138, 272]
];

/** @typedef {number[][]} Matrix */

/** @param {number} value @returns {number} */
function mod(value) {
  return ((value % PRIME) + PRIME) % PRIME;
}

/** @param {number} value @returns {number} */
function reciprocal(value) {
  for (let i = 1; i < PRIME; i++) {
    if ((value * i) % PRIME === 1) return i;
  }
  throw new Error("Noninvertible pivot");
}

/** @param {Matrix} matrix @returns {Matrix} */
function transpose(matrix) {
  return matrix.map((row, i) => row.map((_, j) => matrix[j][i]));
}

/** @param {Matrix} matrix @returns {Matrix} */
function invert(matrix) {
  const aug = matrix.map((row, i) =>
    row.concat(Array.from({length: SIZE}, (_, j) => Number(i === j)))
  );
  for (let j = 0; j < SIZE; j++) {
    const pivot = aug.findIndex((row, i) => i >= j && row[j] !== 0);
    assert.ok(pivot >= j, "Source square must be invertible in GF(29)");
    [aug[j], aug[pivot]] = [aug[pivot], aug[j]];
    const scale = reciprocal(aug[j][j]);
    aug[j] = aug[j].map(value => mod(value * scale));
    for (let i = 0; i < SIZE; i++) {
      if (i === j) continue;
      const factor = aug[i][j];
      aug[i] = aug[i].map((value, k) => mod(value - factor * aug[j][k]));
    }
  }
  return aug.map(row => row.slice(SIZE));
}

/** @param {Matrix} matrix @param {number[]} symbols @returns {number[]} */
function transform(matrix, symbols) {
  assert.equal(symbols.length % SIZE, 0);
  const result = [];
  for (let k = 0; k < symbols.length; k += SIZE) {
    const block = symbols.slice(k, k + SIZE);
    for (const row of matrix) {
      result.push(mod(row.reduce((sum, value, i) => sum + value * block[i], 0)));
    }
  }
  return result;
}

/** @param {number[]} symbols @returns {number} */
function collisionNumerator(symbols) {
  const counts = new Array(PRIME).fill(0);
  for (const symbol of symbols) counts[symbol]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0);
}

function run() {
  assert.deepEqual(originalSquare.map(row => row.reduce((a, b) => a + b, 0)),
    [1033, 1033, 1033, 1033, 1033]);
  const matrix = originalSquare.map(row => row.map(mod));
  const p53 = source.pages[53].indices;
  const p57 = source.pages[57].indices;
  assert.equal(p53.length, 179);
  assert.equal(p57.length, 95);
  const cipherPrefix = p53.slice(0, 175);
  const knownEnglish = p57.slice(0, 90);
  assert.equal(collisionNumerator(cipherPrefix), 1014);
  const variants = [
    ["source matrix", matrix, 1058],
    ["inverse matrix", invert(matrix), 1034],
    ["source transpose", transpose(matrix), 1104],
    ["inverse transpose", invert(transpose(matrix)), 1016]
  ];
  for (const [name, operator, expected] of variants) {
    const result = transform(operator, cipherPrefix);
    assert.equal(collisionNumerator(result), expected);
    assert.deepEqual(transform(invert(operator), result), cipherPrefix);
    const syntheticCipher = transform(operator, knownEnglish);
    assert.deepEqual(transform(invert(operator), syntheticCipher), knownEnglish);
    const preview = result.slice(0, 40).map(i => source.translit[i]).join(" ");
    const ioc = (expected / (result.length * (result.length - 1))).toFixed(9);
    console.log(name + ": 175 original rune result IoC=" + ioc +
      "; original first 40 GP tokens: " + preview);
  }
  console.log("PASS: exact source p53 175-rune transforms, four source orientations, " +
    "complete inverse controls, native solved-p57 90-rune plants. " +
    "The final original p53 four runes remain untransformed; no padding was inferred.");
}

run();
