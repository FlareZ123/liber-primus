"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
function read(name) { return fs.readFileSync(path.join(root, name), "utf8").replace(/\r/g, ""); }
const matrixSource = read("resources/cicada2014-openpuff-magic-squares.txt");
const matrices = matrixSource.trim().split(/\n\s*\n/u).map(block =>
  block.split("\n").map(line => line.trim().split(/\s+/u).map(Number))
);
assert.deepEqual(matrices.map(matrix => matrix.length), [5, 7, 5]);
for (const matrix of matrices) {
  const size = matrix.length;
  assert.ok(matrix.every(row => row.length === size && row.every(Number.isInteger)));
}
const centers = matrices.map(matrix => matrix[Math.floor(matrix.length / 2)][Math.floor(matrix.length / 2)]);
assert.deepEqual(centers, [809, 331, 91]);
assert.deepEqual(matrices.map(matrix => matrix[0].reduce((sum, value) => sum + value, 0)), [3301,1033,1033]);
const alphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
/** @param {number} value @returns {number[]} */
function base29(value) {
  const digits = [];
  do { digits.push(value % 29); value = Math.floor(value / 29); } while (value);
  return digits.reverse();
}
assert.equal(base29(3301).map(value => alphabet[value]).join(""), "3QO");
const clear = read("resources/historical/cicada2016-4gq25-outguess.asc")
  .split("-----BEGIN PGP SIGNATURE-----")[0].split(/\n\n/u).slice(1).join("\n");
const words = clear.split(/[^A-Za-z0-9]+/u).filter(token => /^[A-Za-z]+$/u.test(token))
  .map(token => token.toUpperCase());
assert.equal(words.length, 43);
/** @param {number[]} digits @param {number} origin @returns {string[]} */
function indexed(digits, origin) {
  return digits.map(value => words[value - origin] ?? "<outside>");
}
const rows = centers.map((center, index) => {
  const forward = base29(center);
  const reversed = forward.slice().reverse();
  return {
    matrix: index + 1, size: matrices[index].length, center,
    forward, reversed,
    forwardZeroBased: indexed(forward, 0),
    reversedZeroBased: indexed(reversed, 0),
    forwardOneBased: indexed(forward, 1),
    reversedOneBased: indexed(reversed, 1),
  };
});
assert.deepEqual(rows.map(row => row.forward), [[27,26],[11,12],[3,4]]);
assert.deepEqual(rows.map(row => row.reversed), [[26,27],[12,11],[4,3]]);
assert.deepEqual(rows.map(row => row.reversedZeroBased), [
  ["NUMBERS","ARE"],["THE","IS"],["EMPTY","LIES"],
]);
assert.deepEqual(rows.map(row => row.reversedOneBased), [
  ["THEIR","NUMBERS"],["IS","PRIMUS"],["LIES","PATH"],
]);
console.log(JSON.stringify({
  matrixSourceSha256:crypto.createHash("sha256").update(matrixSource).digest("hex"),
  signedWordCount:words.length,
  rows,
}, null, 2));
