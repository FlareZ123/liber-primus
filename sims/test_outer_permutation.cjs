"use strict";
/** Regression tests for exhaustive outer-alphabet assignment and key alignment. */
const assert = require("node:assert/strict");
const {
  assignmentMax, inferAlphabet, decipher, encodeEnglish, encrypt,
  seededRandom, shuffledPermutation
} = require("./outer_permutation_assignment.cjs");

/**
 * Brute-force optimum on a tiny square matrix, independently of Hungarian.
 * @param {number[][]} values
 */
function brute(values) {
  const walk = (row, used, acc) => row === values.length ? acc :
    Math.max(...values[row].map((weight, col) =>
      used.includes(col) ? -Infinity :
        walk(row + 1, used.concat([col]), acc + weight)));
  return walk(0, [], 0);
}
for (const matrix of [
  [[1, 2], [3, 4]],
  [[4, 2, 7], [3, 5, 1], [3, -4, 2]],
  [[-3, 7, 9, 0], [1, -8, 4, 3], [6, 2, 4, -1], [3, 5, 0, 9]],
]) {
  const result = assignmentMax(matrix);
  assert.equal(result.score, brute(matrix));
  assert.equal(new Set(result.assignment).size, matrix.length);
}
assert.deepEqual(encodeEnglish("PARABLE LIKE THE INSTAR TUNNELING").length, 27);
const random = seededRandom(3301);
const sigma = shuffledPermutation(Array.from({length:29}, (_, i) => i), random);
const prior = Array.from({length:29}, (_, i) => i === 18 ? .08 :
  i === 10 ? .09 : .83 / 27);
const plaintext = Array.from({length:10000}, () =>
  random() < .5 ? 10 : Math.floor(random() * 29));
const key = Array.from({length:10200}, () => Math.floor(random() * 29));
const pure = encrypt(plaintext, key, sigma, random, 0);
assert.deepEqual(pure.keyIndices.slice(0, 100), Array.from({length:100}, (_,i)=>i));
const decoded = inferAlphabet(pure.ciphertext, key, prior);
assert.equal(new Set(decoded.inverse).size, 29);
const roundTrip = decipher(pure.ciphertext, key, decoded.inverse);
assert.equal(roundTrip.length, pure.ciphertext.length);
const equalCipher = encrypt(plaintext.slice(0, 3000), key, sigma, random, .81);
assert(equalCipher.extraDraws > 0);
assert(equalCipher.extraDraws < 150);
assert.equal(equalCipher.keyIndices.length, 3000);
assert(equalCipher.keyIndices.at(-1) >= 2999);
const known = inferAlphabet(equalCipher.ciphertext, key, prior,
  equalCipher.keyIndices);
assert.equal(known.inverse.length, 29);
console.log("PASS: Hungarian vs enumeration, 29-way bijection, GP encoding,");
console.log("      additive control, and anti-repeat draw-index interface.");
