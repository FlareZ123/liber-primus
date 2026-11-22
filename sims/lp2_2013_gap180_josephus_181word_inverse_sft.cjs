'use strict';

/**
 * Original LP2 source-selected word-order test.
 *
 * The 180 primes historically omitted from a 2013 telnet response provide
 * exactly 180 Josephus eliminations among 181 positions, and the unknown LP2
 * manuscript contains 2896 = 16 * 181 continuous printed words.
 * The author's intent to use either source this way is unestablished.
 *
 * SFT: node sims/lp2_2013_gap180_josephus_181word_inverse_sft.cjs
 * Runs without downloads or file writes on Windows 11 / Node.js 22.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
const english = fs.readFileSync(path.join(root, 'resources', 'control', 'gibran_prophet_58585.txt'), 'utf8');

// Original page delimiter is not itself a word delimiter. Its removal joins
// all 32 authentic words that continue across an original physical page edge.
const ciphertextWords = source.split('%').slice(0, 55).join('')
  .replaceAll('\n', '').replaceAll('/', '')
  .split(/[-.&$\s§]+/)
  .filter((word) => word && [...word].every((rune) => /[ᚠ-ᛪ]/u.test(rune)));
assert.equal(ciphertextWords.length, 2896);
const original = ciphertextWords.map((word) => [...word].length);
assert.equal(original.reduce((sum, length) => sum + length, 0), 12956);

/** @param {number} n @returns {boolean} */
function prime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
const missingPrimes = Array.from({length:1156}, (_, i) => i + 73)
  .filter((n) => n < 1229 && prime(n));
assert.equal(missingPrimes.length, 180);
assert.equal(missingPrimes[0], 73);
assert.equal(missingPrimes.at(-1), 1223);

// Elimination steps follow historically ascending prime order; the current
// slot is counted first. The final sole survivor occupies position 180.
const slots = Array.from({length:181}, (_, i) => i);
const elimination = [];
let current = 0;
for (const step of missingPrimes) {
  current = (current + step - 1) % slots.length;
  elimination.push(slots.splice(current, 1)[0]);
  if (current === slots.length) current = 0;
}
elimination.push(slots[0]);
assert.equal(elimination.length, 181);
assert.equal(new Set(elimination).size, 181);
assert.deepEqual(elimination.slice(0, 6), [72, 151, 53, 143, 61, 165]);

/** @param {number[]} sequence @returns {number} */
function mutualInformation(sequence) {
  const count = Array.from({length:10}, () => Array(10).fill(0));
  const left = Array(10).fill(0);
  const right = Array(10).fill(0);
  for (let i = 1; i < sequence.length; i++) {
    const a = Math.min(sequence[i-1], 9);
    const b = Math.min(sequence[i], 9);
    count[a][b]++;
    left[a]++;
    right[b]++;
  }
  const n = sequence.length - 1;
  let total = 0;
  for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) {
    if (count[a][b]) total += (count[a][b] / n) *
      Math.log((count[a][b] * n) / (left[a] * right[b]));
  }
  return total;
}

/**
 * @param {number[]} C
 * @param {boolean} inverse
 * @param {'16-row'|'16-transpose'|'181-row'|'181-transpose'} geometry
 * @returns {number[]}
 */
function reorder(C, inverse, geometry) {
  const P = Array(C.length);
  if (geometry === '16-row' || geometry === '16-transpose') {
    for (let r = 0; r < 16; r++) for (let j = 0; j < 181; j++) {
      const p = 181 * r + elimination[j];
      const c = geometry === '16-row' ? 181 * r + j : 16 * j + r;
      if (inverse) P[c] = C[p];
      else P[p] = C[c];
    }
  } else {
    for (let i = 0; i < 181; i++) for (let j = 0; j < 16; j++) {
      const p = 16 * elimination[i] + j;
      const c = geometry === '181-row' ? 16 * i + j : 181 * j + i;
      if (inverse) P[c] = C[p];
      else P[p] = C[c];
    }
  }
  assert.equal(P.length, 2896);
  assert.ok(P.every(Number.isInteger));
  return P;
}

/** @param {string} word @returns {number} */
function toRunicLength(word) {
  const tokens = ['ING', 'TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA', 'IO'];
  let left = word.toUpperCase().replaceAll('QU', 'CW')
    .replaceAll('K', 'C').replaceAll('V', 'U').replaceAll('Z', 'S');
  let length = 0;
  while (left) {
    const match = tokens.find((token) => left.startsWith(token));
    left = left.slice(match ? match.length : 1);
    length++;
  }
  return length;
}

const native = (english.match(/[A-Za-z]+/g) || []).map(toRunicLength)
  .slice(500, 3396);
assert.equal(native.length, 2896);
const nativeMI = mutualInformation(native);
const originalMI = mutualInformation(original);
assert.ok(nativeMI > 0.045);
assert.ok(originalMI < 0.015);

const expected = [
  ['16-row', false, 0.007972281494418618],
  ['16-row', true, 0.011821514390041529],
  ['16-transpose', false, 0.008253915134055578],
  ['16-transpose', true, 0.007401578034952897],
  ['181-row', false, 0.012174122816037233],
  ['181-row', true, 0.012523083948102285],
  ['181-transpose', false, 0.007243932208702165],
  ['181-transpose', true, 0.00999860346514238],
];
for (const [geometry, inverse, required] of expected) {
  const decoded = reorder(original, inverse, geometry);
  const score = mutualInformation(decoded);
  assert.ok(Math.abs(score - required) < 1e-11, geometry + ' original MI changed');

  // A GP-normalized genuine 2896-word source is deliberately encrypted by the
  // paired source permutation and completely recovered, including its MI.
  const planted = reorder(native, !inverse, geometry);
  const recovered = reorder(planted, inverse, geometry);
  assert.deepEqual(recovered, native, 'planted inverse failed: ' + geometry);
  assert.equal(mutualInformation(recovered), nativeMI);
  console.log(geometry, inverse ? 'inverse' : 'forward',
    'original MI=', score.toFixed(9), 'native recovered MI=', nativeMI.toFixed(9));
}
console.log('PASS: all eight source-frozen original word-order candidates remain below MI 0.013; no plaintext recovered.');
