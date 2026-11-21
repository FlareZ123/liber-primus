"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @param {number} n @returns {number} */
const mod29 = (n) => ((n % 29) + 29) % 29;

/**
 * Apply a 2 by 2 matrix over GP29 to consecutive original rune pairs.
 * @param {number[]} input
 * @param {number[][]} matrix
 * @returns {number[]}
 */
function transform(input, matrix) {
  assert.equal(input.length % 2, 0, "Hill blocks require full pairs");
  const output = [];
  for (let i = 0; i < input.length; i += 2) {
    const x = input[i];
    const y = input[i + 1];
    output.push(mod29(matrix[0][0] * x + matrix[0][1] * y));
    output.push(mod29(matrix[1][0] * x + matrix[1][1] * y));
  }
  return output;
}

/** @param {number[]} values @returns {number} */
function indexOfCoincidence(values) {
  const count = Array(29).fill(0);
  for (const x of values) count[x]++;
  return count.reduce((total, n) => total + n * (n - 1), 0)
    / (values.length * (values.length - 1));
}

/** @param {number[]} values @returns {number} */
function adjacentEquals(values) {
  let result = 0;
  for (let i = 1; i < values.length; i++) {
    if (values[i] === values[i - 1]) result++;
  }
  return result;
}

const source = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources", "liber-primus", "lp2-corpus.json"
), "utf8"));

/** @param {number} page @returns {number[]} */
function indices(page) {
  const found = source.pages.find((record) => record.page === page);
  assert.ok(found, "Source page absent: " + page);
  return found.indices;
}

const p6 = indices(6);
const p7 = indices(7);
const p57 = indices(57);

assert.equal(p6.length, 196);
assert.equal(p7.length, 208);
assert.deepEqual(p6.slice(71, 82), [24, 16, 14, 17, 19, 6, 27, 15, 17, 14, 12]);
const redWords = [[23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]];
assert.deepEqual(p7.slice(194), redWords.flat());
const products = redWords.map((word) => word.reduce((a, b) => mod29(a * b), 1));
assert.deepEqual(products, [11, 26, 8, 15, 2]);

const matrix = [[products[0], products[1]], [products[2], products[3]]];
const det = mod29(matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]);
assert.equal(det, 15);
assert.equal(mod29(det * products[4]), 1);
const inverse = [
  [mod29(products[4] * matrix[1][1]), mod29(-products[4] * matrix[0][1])],
  [mod29(-products[4] * matrix[1][0]), mod29(products[4] * matrix[0][0])]
];
assert.deepEqual(inverse, [[1, 6], [13, 22]]);
assert.deepEqual(inverse.flat(), [2, 3, 4, 5].map((k) => mod29(k * k - 3)));

const original = p6.slice(82).concat(p7.slice(0, 194));
assert.equal(original.length, 308);
const decodedInverse = transform(original, inverse);
const decodedDirect = transform(original, matrix);
assert.deepEqual(transform(decodedInverse, matrix), original);
assert.deepEqual(transform(decodedDirect, inverse), original);

// Independent native-GP positive plant from the solved 2014 p57 parable.
// This validates the exact pair operation, not a historical LP2 key.
const clearControl = p57.slice(0, 94);
assert.deepEqual(transform(transform(clearControl, matrix), inverse), clearControl);
assert.deepEqual(transform(transform(clearControl, inverse), matrix), clearControl);

console.log("[source] p6 red offsets 71..81; p7 red offsets 194..207");
console.log("[source] five red-word products", JSON.stringify(products));
console.log("[algebra] determinant", det, "inverse determinant", products[4]);
console.log("[algebra] inverse 2x2", JSON.stringify(inverse));
console.log("[algebra] square-minus-3 sequence at k=2..5", JSON.stringify(inverse.flat()));
console.log("[receiver] p6 offsets 82..195 plus p7 offsets 0..193 =", original.length, "runes");
for (const [name, seq] of [
  ["original", original],
  ["inverse", decodedInverse],
  ["direct", decodedDirect],
  ["solved-p57", p57]
]) {
  const value = seq.map((i) => source.translit[i]).join("");
  console.log("[result]", name, "runes=" + seq.length,
    "IoC=" + indexOfCoincidence(seq).toFixed(12),
    "doublets=" + adjacentEquals(seq));
  console.log("[translit]", name, value.slice(0, 155));
}
console.log("[control] 94/94 solved-p57 synthetic runes recover in both directions");
console.log("[control] 308/308 original ciphertext runes forward-reencrypt exactly");
console.log("[decision] original inverse and direct outputs remain nonlinguistic; no unknown-page plaintext");
