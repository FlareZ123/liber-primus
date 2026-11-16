"use strict";
/**
 * LP2 p50 256-byte table -> p56 85-rune affine-triplet handoff.
 * The source-native 256 = 3*85 + 1 format admits eight distinct direct
 * layouts (printed versus columns, reversal, first/last spare byte).
 * For each, test every unknown GF29 affine triple map against the 85 authentic
 * p56 ciphertext symbols, its fully solved plaintext, and its genuine
 * 84-consumption prime-totient key (with the one plaintext-F bypass).
 *
 * Run: node sims/lp2_p50_85triplet_p56_affine_sft.cjs
 * Node 22, CommonJS, offline. A negative necessary condition, not plaintext.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
/** @param {number} x @returns {number} */
const mod = x => ((x % 29) + 29) % 29;
/** @param {number} x @returns {number} */
function inverse(x) {
  for (let i = 1; i < 29; i++) if (mod(x * i) === 1) return i;
  throw Error("A field pivot was zero");
}
/** @param {number[][]} rows @returns {{rank:number,matrix:number[][]}} */
function rref(rows) {
  const a = rows.map(row => row.map(mod));
  let row = 0;
  for (let col = 0; col < a[0].length && row < a.length; col++) {
    let selected = row;
    while (selected < a.length && a[selected][col] === 0) selected++;
    if (selected === a.length) continue;
    [a[row], a[selected]] = [a[selected], a[row]];
    const pivotInverse = inverse(a[row][col]);
    for (let j = col; j < a[row].length; j++) {
      a[row][j] = mod(a[row][j] * pivotInverse);
    }
    for (let k = 0; k < a.length; k++) {
      if (k === row || a[k][col] === 0) continue;
      const factor = a[k][col];
      for (let j = col; j < a[k].length; j++) {
        a[k][j] = mod(a[k][j] - factor * a[row][j]);
      }
    }
    row++;
  }
  return { rank: row, matrix: a };
}
/** @param {number[]} xs @returns {number} */
function scalar(xs) { return xs.reduce((a, b) => a + b, 0); }
/** @param {number[][]} x @param {number[]} y */
function firstFourFit(x, y) {
  const chosen = [];
  for (let i = 0; i < x.length && chosen.length < 4; i++) {
    if (rref([...chosen.map(k => x[k]), x[i]]).rank > chosen.length) chosen.push(i);
  }
  assert.equal(chosen.length, 4);
  const fitted = rref(chosen.map(i => [...x[i], y[i]]));
  assert.equal(fitted.rank, 4);
  const weights = fitted.matrix.map(row => row[4]);
  const matching = x.filter((row, i) =>
    mod(scalar(row.map((v, j) => v * weights[j]))) === y[i]).length;
  return { chosen, weights, matching };
}
/** @param {number} length @returns {number[]} */
function firstPrimes(length) {
  const primes = [];
  for (let n = 2; primes.length < length; n++) {
    if (primes.every(p => n % p !== 0)) primes.push(n);
  }
  return primes;
}
const grid = read("resources/liber-primus/lp2-grid-256.json");
const bytes = grid.bytes;
assert.equal(bytes.length, 256);
assert.equal(
  crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);
const pages = read("resources/liber-primus/lp2-corpus.json").pages;
const originalCipher = pages.find(p => p.page === 56).indices;
assert.equal(originalCipher.length, 85);
assert.equal(originalCipher[56], 0);
const primes = firstPrimes(84);
let pointer = 0;
const originalKey = originalCipher.map((v, i) => i === 56 ? 0 : mod(primes[pointer++] - 1));
assert.equal(pointer, 84);
const originalPlain = originalCipher.map((v, i) => i === 56 ? 0 : mod(v - originalKey[i]));
assert.deepEqual(originalPlain.slice(0, 5), [24, 9, 18, 9, 23]); // ANEND
assert.deepEqual(originalPlain.slice(-4), [13, 24, 6, 18]); // PAGE
assert.deepEqual(originalPlain.map((v, i) => i === 56 ? 0 : mod(v + originalKey[i])),
  originalCipher);
const targets = { ciphertext: originalCipher, plaintext: originalPlain, primeKey: originalKey };
const colMajor = Array.from({ length: 256 }, (_, i) =>
  bytes[(i % 32) * 8 + Math.floor(i / 32)]);
const results = [];
for (const [layout, inOrder] of Object.entries({
  printedRowMajor: bytes, printedColumnMajor: colMajor
})) {
  for (const reversed of [false, true]) {
    const tape = reversed ? inOrder.slice().reverse() : inOrder;
    for (const spareFirst of [false, true]) {
      const start = spareFirst ? 1 : 0;
      const triplets = Array.from({ length: 85 }, (_, i) =>
        [...tape.slice(start + i * 3, start + i * 3 + 3).map(mod), 1]);
      assert(triplets.every(a => a.length === 4));
      assert.equal(rref(triplets).rank, 4);
      const plant = triplets.map(row => mod(row[0] * 7 + row[1] * 11 + row[2] * 3 + 13));
      assert.equal(rref(triplets.map((row, i) => [...row, plant[i]])).rank, 4);
      assert.equal(firstFourFit(triplets, plant).matching, 85);
      for (const [target, y] of Object.entries(targets)) {
        const augmented = rref(triplets.map((row, i) => [...row, y[i]])).rank;
        assert.equal(augmented, 5);
        const fit = firstFourFit(triplets, y);
        assert.deepEqual(fit.chosen, [0, 1, 2, 3]);
        results.push({ layout, reversed, spareFirst, target,
          rankFeatures: 4, rankAugmented: augmented, exactMatchesFirstFourFit: fit.matching });
      }
    }
  }
}
assert.equal(results.length, 24);
assert.equal(Math.max(...results.map(r => r.exactMatchesFirstFourFit)), 11);
assert.equal(Math.min(...results.map(r => r.exactMatchesFirstFourFit)), 4);
console.log(JSON.stringify({
  sourceBytes: bytes.length, sourceSha256: "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290",
  originalSolvedPageRunes: 85, genuinePrimeKeyConsumptions: pointer,
  tested: results.length, allOriginalAugmentedRanks: 5,
  allOriginalFeatureRanks: 4, plantedFullRecovered: 8,
  bestFourPositionFittedMatches: 11, minimum: 4,
  outcome: "No exact 3-byte affine GP29 mapping from source table to authentic p56 cipher, plaintext or prime key",
  details: results
}, null, 2));
