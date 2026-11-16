'use strict';

/**
 * One-file source-original 3/5/3 magic-square Hill inverse gate.
 * Node.js 22, CommonJS, no external modules or command line arguments.
 *
 * Each 2014 Stage10 OpenPuff magic square is stripped of its one-cell border.
 * Its 3x3 / 5x5 / 3x3 core is applied to, respectively, the 138-rune sentence
 * before the LP2 numeric table, the 256 table coefficients modulo 29, and the
 * 170-rune sentence following the table. Both conventional Hill orientations
 * and every allowed plaintext-F transparent skip pattern are tested.
 *
 * The table-as-GP29 and the historic square-to-text transfer are hypotheses.
 * The original p56 plaintext-F bypass is a real, independently solved cipher
 * constraint, imposed here only as part of the specified proposed consumer.
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(root, name), 'utf8');
}
/** @param {number} n @returns {number} */
function mod29(n) {
  return ((n % 29) + 29) % 29;
}
/** @param {number} n @returns {number} */
function inverseScalar(n) {
  for (let i = 1; i < 29; i++) {
    if (mod29(i * n) === 1) return i;
  }
  throw new Error('Nonunit GF29 scalar');
}
/** @param {number[][]} matrix @returns {number[][]} */
function inverseMatrix(matrix) {
  const n = matrix.length;
  assert.ok(n > 0 && matrix.every((row) => row.length === n));
  const a = matrix.map((row, i) => [
    ...row.map(mod29),
    ...Array.from({ length: n }, (_, j) => Number(i === j))
  ]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && a[pivot][col] === 0) pivot++;
    assert.ok(pivot < n, 'Magic-square core is singular modulo29');
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const factor = inverseScalar(a[col][col]);
    a[col] = a[col].map((v) => mod29(v * factor));
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const scalar = a[row][col];
      a[row] = a[row].map((v, j) => mod29(v - scalar * a[col][j]));
    }
  }
  return a.map((row) => row.slice(n));
}
/**
 * @param {number[][]} matrix
 * @param {number[]} input
 * @param {'column'|'row'} orientation
 * @returns {number[]}
 */
function hill(matrix, input, orientation) {
  const n = matrix.length;
  assert.equal(input.length % n, 0);
  const result = [];
  for (let start = 0; start < input.length; start += n) {
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        sum += input[start + j] * (
          orientation === 'column' ? matrix[i][j] : matrix[j][i]
        );
      }
      result.push(mod29(sum));
    }
  }
  return result;
}
/** @param {number[]} input @returns {number[][]} */
function allSourceFSubsets(input, divisor) {
  const zeros = input.flatMap((v, i) => v === 0 ? [i] : []);
  const result = [];
  function visit(k, chosen) {
    if (k === zeros.length) {
      if ((input.length - chosen.length) % divisor === 0) {
        result.push([...chosen]);
      }
      return;
    }
    visit(k + 1, chosen);
    chosen.push(zeros[k]);
    visit(k + 1, chosen);
    chosen.pop();
  }
  visit(0, []);
  return result;
}
/**
 * @param {number[]} raw
 * @param {number[]} skips
 * @param {number[][]} inverseKey
 * @param {'column'|'row'} orientation
 */
function decodeWithSkips(raw, skips, inverseKey, orientation) {
  const mask = new Set(skips);
  const consumed = raw.filter((_, i) => !mask.has(i));
  const decoded = hill(inverseKey, consumed, orientation);
  let cursor = 0;
  const plaintext = raw.map((_, i) => mask.has(i) ? 0 : decoded[cursor++]);
  assert.equal(cursor, decoded.length);
  const invalid = plaintext.flatMap((v, i) => (
    v === 0 && raw[i] !== 0 ? [i] : []
  ));
  return { plaintext, invalid };
}
/** @param {number[]} values @returns {number} */
function coincidence(values) {
  const bins = Array(29).fill(0);
  for (const v of values) {
    assert.ok(Number.isInteger(v) && v >= 0 && v < 29);
    bins[v]++;
  }
  return bins.reduce((total, n) => total + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}


const squares = read('resources/cicada2014-openpuff-magic-squares.txt')
  .trim().split(/\r?\n\s*\r?\n/)
  .map((block) => block.trim().split(/\r?\n/).map((row) => (
    row.trim().split(/\s+/).map(Number)
  )));
assert.deepEqual(squares.map((square) => square.length), [5, 7, 5]);
assert.ok(squares.every((square) => square.every((row) => (
  row.length === square.length && row.every(Number.isInteger)
))));
const keys = squares.map((square) => (
  square.slice(1, -1).map((row) => row.slice(1, -1))
));
assert.deepEqual(keys.map((key) => key.length), [3, 5, 3]);
const inverseKeys = keys.map(inverseMatrix);
assert.deepEqual(inverseKeys, [
  [[19,12,16],[22,20,22],[16,12,19]],
  [[20,24,7,4,1],[25,19,26,9,22],[25,11,23,11,25],
   [22,9,26,19,25],[1,4,7,24,20]],
  [[28,15,5],[16,26,16],[5,15,28]]
]);
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const bytes = grid.pages.flatMap((page) => page.bytes);
assert.equal(bytes.length, 256);
assert.equal(bytes[0], 203);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes))
  .digest('hex'), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.deepEqual([48,49,50,51,52].map((p) => corpus.pages[p].indices.length),
  [271,66,0,92,263]);

const units = [
  {
    name: 'pretable-complete-138-rune-sentence',
    input: corpus.pages[48].indices.slice(-72).concat(corpus.pages[49].indices),
    zeroPositions: [13,32,35,37,65,71,75,105],
    possibleMasks: 85,
    minimumContradictions: { column: 5, row: 3 }
  },
  {
    name: 'original-256-cell-table-GP29-residues',
    input: bytes.map(mod29),
    zeroPositions: [0,23,81,149,192,220,229],
    possibleMasks: 14,
    minimumContradictions: { column: 6, row: 4 }
  },
  {
    name: 'posttable-complete-170-rune-sentence',
    input: corpus.pages[51].indices.concat(corpus.pages[52].indices.slice(0, 78)),
    zeroPositions: [3,57,60,91,93,133],
    possibleMasks: 21,
    minimumContradictions: { column: 4, row: 2 }
  }
];
assert.deepEqual(units.map((unit) => unit.input.length), [138, 256, 170]);
const genuineClear = corpus.pages[57].indices.filter((v) => v !== 0);
assert.ok(genuineClear.length >= 80);
const summary = [];
for (let u = 0; u < units.length; u++) {
  const unit = units[u];
  const key = keys[u];
  const inverseKey = inverseKeys[u];
  const input = unit.input;
  assert.ok(input.every((v) => Number.isInteger(v) && v >= 0 && v < 29));
  assert.deepEqual(input.flatMap((v, i) => v === 0 ? [i] : []),
    unit.zeroPositions);
  const masks = allSourceFSubsets(input, key.length);
  assert.equal(masks.length, unit.possibleMasks);
  for (const orientation of ['column', 'row']) {
    let legal = 0;
    let minContradictions = Infinity;
    /** @type {number[]} */
    let bestMask = [];
    let bestIoC = 0;
    for (const skips of masks) {
      const observed = decodeWithSkips(input, skips, inverseKey, orientation);
      const nonSkipped = input.filter((_, i) => !skips.includes(i));
      const plaintextConsumed = observed.plaintext.filter((_, i) => !skips.includes(i));
      assert.deepEqual(hill(key, plaintextConsumed, orientation), nonSkipped);
      if (observed.invalid.length === 0) legal++;
      if (observed.invalid.length < minContradictions) {
        minContradictions = observed.invalid.length;
        bestMask = skips;
        bestIoC = coincidence(observed.plaintext);
      }
    }
    assert.equal(legal, 0);
    assert.equal(minContradictions, unit.minimumContradictions[orientation]);

    // Native source-positive: the authentic solved p57 alphabet is woven into
    // the same input layout under one explicitly known F-bypass mask, then
    // encrypted and decoded by the exact same Hill matrix and source grammar.
    const plantMask = masks[0];
    const plantSet = new Set(plantMask);
    const fill = input.length - plantMask.length;
    const knownPlain = Array.from({ length: fill }, (_, i) => (
      genuineClear[i % genuineClear.length]
    ));
    const knownCipher = hill(key, knownPlain, orientation);
    let cursor = 0;
    const plantedCipher = input.map((_, i) => (
      plantSet.has(i) ? 0 : knownCipher[cursor++]
    ));
    const positive = decodeWithSkips(plantedCipher, plantMask, inverseKey,
      orientation);
    const knownFull = input.map((_, i) => plantSet.has(i)
      ? 0 : knownPlain[i - plantMask.filter((index) => index < i).length]);
    assert.deepEqual(positive.plaintext, knownFull);
    assert.equal(positive.invalid.length, 0);
    summary.push({
      unit: unit.name,
      orientation,
      symbolCount: input.length,
      masksExhausted: masks.length,
      fullyLegalOriginalPaths: legal,
      minimumForbiddenPlaintextF: minContradictions,
      bestMask,
      bestMaskDecodedIoC: Number(bestIoC.toFixed(10)),
      nativeGPPlantRecovered: input.length
    });
  }
}
console.log(JSON.stringify({
  classification: 'finite-original-cipher-negative-no-recovered-plaintext',
  originalSource: '2014 5x5/7x7/5x5 magic-square cores',
  coreSizes: [3,5,3],
  conditionalRadix: 'canonical base60 projected modulo GP29',
  cipher: 'Hill modulo29 with optional historic plaintext-F bypass',
  original: summary,
  conclusion: 'zero legal full-span inverses under either Hill orientation'
}, null, 2));
