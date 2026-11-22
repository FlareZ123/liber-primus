'use strict';

// Exact original-cipher source test: literal MOBIUS in original LP1 p05.
// Node.js 22, Windows-compatible, read-only, CommonJS. No packages.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const MOD = 29;
const chapterLengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];

/** @param {number} x @returns {number} */
function residue(x) {
  return (x % MOD + MOD) % MOD;
}

/** @param {number[]} C @returns {number[]} */
function invertDivisorZeta(C) {
  const P = C.slice();
  for (let d = 1; d <= P.length; d++) {
    for (let n = 2 * d; n <= P.length; n += d) {
      P[n - 1] = residue(P[n - 1] - P[d - 1]);
    }
  }
  return P;
}

/** @param {number[]} C @returns {number[]} */
function invertMultipleZeta(C) {
  const P = C.slice();
  for (let d = P.length; d >= 1; d--) {
    for (let n = 2 * d; n <= P.length; n += d) {
      P[d - 1] = residue(P[d - 1] - P[n - 1]);
    }
  }
  return P;
}

/** @param {number[]} P @returns {number[]} */
function forwardDivisorZeta(P) {
  const C = P.slice();
  for (let d = 1; d <= P.length; d++) {
    for (let n = 2 * d; n <= P.length; n += d) {
      C[n - 1] = residue(C[n - 1] + P[d - 1]);
    }
  }
  return C;
}

/** @param {number[]} P @returns {number[]} */
function forwardMultipleZeta(P) {
  const C = P.slice();
  for (let d = 1; d <= P.length; d++) {
    for (let n = 2 * d; n <= P.length; n += d) {
      C[d - 1] = residue(C[d - 1] + P[n - 1]);
    }
  }
  return C;
}

/** @param {number[]} xs @param {number[]} lengths @returns {number[][]} */
function splitAtLengths(xs, lengths) {
  let pos = 0;
  const parts = lengths.map((length) => {
    const part = xs.slice(pos, pos + length);
    assert.equal(part.length, length);
    pos += length;
    return part;
  });
  assert.equal(pos, xs.length);
  return parts;
}

/** @param {number[]} xs @returns {number} */
function indexOfCoincidence(xs) {
  const bins = Array(MOD).fill(0);
  for (const value of xs) bins[value]++;
  return bins.reduce((total, n) => total + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}

/** @param {number[]} xs @returns {string} */
function romanize(xs) {
  return xs.map((v) => source.translit[v]).join(' ');
}

const originalPages = source.pages.filter((p) => p.page <= 55 && p.indices.length > 0);
const cipher = originalPages.flatMap((p) => p.indices);
assert.equal(cipher.length, 12956);
assert.equal(originalPages.length, 55);
assert.equal(source.pages[50].indices.length, 0);
assert.equal(source.pages[57].indices.length, 95);
assert.equal(chapterLengths.reduce((a, b) => a + b, 0), cipher.length);
const clocks = [
  ['whole', [cipher.length]],
  ['chapter', chapterLengths],
  ['page', originalPages.map((p) => p.indices.length)],
];

const solved = source.pages[57].indices;
for (const [name, inverse, forward] of [
  ['divisor', invertDivisorZeta, forwardDivisorZeta],
  ['multiple', invertMultipleZeta, forwardMultipleZeta],
]) {
  const artificial = forward(solved);
  assert.deepEqual(inverse(artificial), solved, `positive control: ${name}`);
  assert.deepEqual(forward(inverse(cipher)), cipher, `whole-book round trip: ${name}`);
  console.log(`Positive control ${name}: 95/95 GP runes of original clear p57 recovered`);
}
console.log(`Original ciphertext: ${cipher.length} GP29 runes, IoC=${indexOfCoincidence(cipher).toFixed(12)}`);
console.log(`Original clear p57: ${solved.length} GP29 runes, IoC=${indexOfCoincidence(solved).toFixed(12)}`);
for (const [clock, lengths] of clocks) {
  const splits = splitAtLengths(cipher, lengths);
  for (const [name, inverse, forward] of [
    ['divisor', invertDivisorZeta, forwardDivisorZeta],
    ['multiple', invertMultipleZeta, forwardMultipleZeta],
  ]) {
    const decoded = splits.flatMap((p) => inverse(p));
    assert.deepEqual(splitAtLengths(decoded, lengths).flatMap((p) => forward(p)), cipher);
    console.log(`${clock}/${name}: IoC=${indexOfCoincidence(decoded).toFixed(12)}, first 50 GP symbols: ${romanize(decoded.slice(0, 50))}`);
  }
}
