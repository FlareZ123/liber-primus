#!/usr/bin/env node
'use strict';

/**
 * SFT: LP1 p5 Wisdom inner 3x3 as a Hill key on the complete p55 body.
 *
 * Source hypothesis: the copied LP1-p5 moth selects the 5x5 Wisdom square;
 * solved p57's "shed our own circumferences" selects its inner 3x3. The
 * incoming first rune on physical p55 is a carry from p54, leaving exactly
 * 75 complete-body runes = 25 three-rune Hill blocks. This is a proposed
 * consumer, not a historically established cipher instruction.
 *
 * Four frozen cases: printed numbers or Euler totients, each with standard
 * column-vector or row-vector Hill orientation. No fitted phase or alphabet.
 * Run with: node sims/lp1_wisdom_inner3_hill_p55_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const mod = (n) => ((n % 29) + 29) % 29;

/** @param {number} n @returns {number} */
function phi(n) {
  let remaining = n;
  let result = n;
  for (let p = 2; p * p <= remaining; p++) {
    if (remaining % p === 0) {
      while (remaining % p === 0) remaining /= p;
      result = (result / p) * (p - 1);
    }
  }
  if (remaining > 1) result = (result / remaining) * (remaining - 1);
  return result;
}

/** @param {number} v @returns {number} */
function inverseScalar(v) {
  for (let n = 1; n < 29; n++) if (mod(v * n) === 1) return n;
  throw new Error('Matrix is singular mod 29');
}

/** @param {number[][]} matrix @returns {number[][]} */
function inverse3(matrix) {
  const a = matrix.map((row, i) =>
    [...row.map(mod), ...[0, 1, 2].map((j) => Number(i === j))]);
  for (let col = 0; col < 3; col++) {
    const pivot = a.findIndex((row, i) => i >= col && row[col] !== 0);
    assert.notEqual(pivot, -1, 'Original source matrix must be invertible');
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const factor = inverseScalar(a[col][col]);
    a[col] = a[col].map((n) => mod(n * factor));
    for (let row = 0; row < 3; row++) {
      if (row === col) continue;
      const scale = a[row][col];
      for (let j = 0; j < 6; j++)
        a[row][j] = mod(a[row][j] - scale * a[col][j]);
    }
  }
  return a.map((row) => row.slice(3));
}

/**
 * Transform full physical page, keeping exactly the first carried rune.
 * @param {number[]} indices all 76 original GP29 runes
 * @param {number[][]} matrix Hill forward/inverse 3x3
 * @param {'column'|'row'} orientation conventional Hill orientation
 * @returns {number[]} full 76-symbol output
 */
function transform(indices, matrix, orientation) {
  assert.equal(indices.length, 76);
  const out = [indices[0]];
  for (let pos = 1; pos < 76; pos += 3) {
    const src = indices.slice(pos, pos + 3);
    assert.equal(src.length, 3);
    for (let j = 0; j < 3; j++) {
      let sum = 0;
      for (let k = 0; k < 3; k++)
        sum += (orientation === 'column'
          ? matrix[j][k] : matrix[k][j]) * src[k];
      out.push(mod(sum));
    }
  }
  return out;
}

/** @param {number[]} indices @returns {number} */
function ioc(indices) {
  const count = Array(29).fill(0);
  for (const v of indices) count[v]++;
  return count.reduce((sum, n) => sum + n * (n - 1), 0) /
    (indices.length * (indices.length - 1));
}

const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const p55 = corpus.pages.find((p) => p.page === 55).indices;
const p57 = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(p55.length, 76);
assert.equal(p57.length, 95);
assert.equal(p55[0], 21); // original incoming NG carry

const squareFile = fs.readFileSync(
  path.join(root, 'resources/cicada2014-openpuff-magic-squares.txt'), 'utf8');
const squares = squareFile.trim().split(/\r?\n\s*\r?\n/).map((block) =>
  block.trim().split(/\r?\n/).map((line) => line.trim().split(/\s+/).map(Number)));
const wisdom = squares[2];
assert.deepEqual(wisdom.map((row) => row.length), [5, 5, 5, 5, 5]);
assert.equal(wisdom[0][0], 272);
assert.equal(wisdom[4][4], 272);
const inner = wisdom.slice(1, 4).map((row) => row.slice(1, 4));
assert.deepEqual(inner, [
  [199, 130, 320], [245, 91, 245], [320, 130, 199]
]);

// Verify page-local rune order against the independent printable transcription.
// That derived transcription omits runeless p50, so p55 occupies section 54.
const transcribed = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8')
  .split(/^%$/m)[54];
const printed = [...transcribed].filter((rune) => corpus.runes.includes(rune))
  .map((rune) => corpus.runes.indexOf(rune));
assert.deepEqual(printed, p55);
const words = transcribed.replace(/\//g, '').replace(/\n/g, '')
  .split(/[.\-]/).filter((part) => [...part].some((r) => corpus.runes.includes(r)));
assert.equal(words.length, 17); // one carry + 16 complete p55 words
assert.equal([...words[0]].filter((r) => corpus.runes.includes(r)).length, 1);

/**
 * Preserve the original word divisions while inserting proposed plaintext.
 * @param {number[]} text GP29 numbers
 * @returns {string}
 */
function printWithWords(text) {
  let pos = 0;
  return words.map((word) => {
    const n = [...word].filter((r) => corpus.runes.includes(r)).length;
    const value = text.slice(pos, pos + n).map((v) => corpus.translit[v]).join('');
    pos += n;
    return value;
  }).join(' ');
}

const results = [];
for (const [keyType, matrix] of [
  ['printed_mod29', inner.map((row) => row.map(mod))],
  ['totient_mod29', inner.map((row) => row.map((n) => mod(phi(n))))]
]) {
  const inv = inverse3(matrix);
  for (const orientation of ['column', 'row']) {
    const decoded = transform(p55, inv, orientation);
    assert.deepEqual(transform(decoded, matrix, orientation), p55);
    const plant = [p55[0], ...p57.slice(0, 75)];
    const plantCipher = transform(plant, matrix, orientation);
    assert.deepEqual(transform(plantCipher, inv, orientation), plant);
    results.push({
      keyType, orientation, matrix, inverse: inv,
      bodyBlocks: 25, unchangedCarry: corpus.translit[p55[0]],
      decipheredIoC: ioc(decoded),
      exactOriginalRoundtrip: 76,
      solvedSourcePlantRecovered: 76,
      proposedPlaintext: printWithWords(decoded),
      judgment: 'No coherent English or GP-native plaintext recovered.'
    });
  }
}
console.log(JSON.stringify({
  name: 'LP1-p5 Wisdom inner3 Hill on LP2 physical-p55 source-carry body',
  originalIoC: ioc(p55), results,
  scope: 'Four source-constrained direct Hill orientations only; not a cipher identification.'
}, null, 2));
