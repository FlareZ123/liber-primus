'use strict';

/**
 * Read-only, source-shaped 15x15 and 16x16 red-ink Hill inverses.
 * The 225 red runes, 31 thirteen-dot marks, p32/p55 and table values
 * are fixed from source files. All operations are exact modulo 29/257.
 * No fitted key, phase, phase search, English model or file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function load(file) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', file), 'utf8'));
}
const ink = load('lp2-ink-annotations.json');
const corpus = load('lp2-corpus.json');
const grid = load('lp2-grid-256.json');

const gpIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const spans = ink.pages.flatMap(page => (page.red_spans || []).map(span => ({page: page.page, ...span})))
  .sort((a, b) => a.page - b.page || a.start - b.start);
const red = spans.flatMap(span => Array.from(span.runes, rune => {
  assert.ok(gpIndex.has(rune), 'source rune in GP alphabet');
  return gpIndex.get(rune);
}));
const marks = ink.pages.flatMap(page => (page.large_punctuation || [])
  .filter(event => event[1] === 13).map(event => ({page: page.page, event})));
const table = grid.pages.flatMap(page => page.bytes);
assert.equal(red.length, 225);
assert.equal(marks.length, 31);
assert.equal(table.length, 256);
assert.equal(corpus.pages.find(page => page.page === 32).indices.length, 121);
assert.equal(corpus.pages.find(page => page.page === 55).indices.length, 76);

function mod(value, p) {
  return (value % p + p) % p;
}
function power(base, exponent, p) {
  let product = 1;
  while (exponent > 0) {
    if (exponent % 2 === 1) product = product * base % p;
    base = base * base % p;
    exponent = Math.floor(exponent / 2);
  }
  return product;
}
/** @returns {{inverse: number[][], determinant:number}} */
function inverse(matrix, p) {
  const n = matrix.length;
  const a = matrix.map((row, i) => row.concat(Array.from({length: n}, (_, j) => Number(i === j))));
  let determinant = 1;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && a[pivot][col] === 0) pivot++;
    assert.ok(pivot < n, 'candidate key matrix must be invertible');
    if (pivot !== col) {
      [a[pivot], a[col]] = [a[col], a[pivot]];
      determinant = mod(-determinant, p);
    }
    const value = a[col][col];
    determinant = determinant * value % p;
    const reciprocal = power(value, p - 2, p);
    for (let j = 0; j < 2 * n; j++) a[col][j] = a[col][j] * reciprocal % p;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = a[r][col];
      for (let j = 0; j < 2 * n; j++) a[r][j] = mod(a[r][j] - factor * a[col][j], p);
    }
  }
  return {inverse: a.map(row => row.slice(n)), determinant};
}
function matrixMultiply(a, b, p) {
  const n = a.length;
  return a.map(row => Array.from({length: n}, (_, col) =>
    row.reduce((sum, value, i) => sum + value * b[i][col], 0) % p));
}
function flatten(matrix) { return matrix.flat(); }
function rows(items, n) {
  assert.equal(items.length % n, 0);
  return Array.from({length: items.length / n}, (_, i) => items.slice(i * n, (i + 1) * n));
}
function vectorMultiply(matrix, vector, p) {
  return matrix.map(row => row.reduce((sum, value, i) => sum + value * vector[i], 0) % p);
}
function ioc(values, symbols) {
  const freq = Array.from({length: symbols}, (_, i) => values.filter(v => v === i).length);
  return freq.reduce((sum, count) => sum + count * (count - 1), 0) / (values.length * (values.length - 1));
}
function longestGraphic(values) {
  let current = 0;
  let best = 0;
  for (const value of values) {
    if (value >= 32 && value <= 126) {
      current++;
      best = Math.max(best, current);
    } else current = 0;
  }
  return best;
}
const n = 16;
const key257 = Array.from({length: n}, (_, r) => Array.from({length: n}, (_, c) =>
  r < 15 && c < 15 ? corpus.prime[red[15 * r + c]] : 13));
const inv257 = inverse(key257, 257);
assert.equal(inv257.determinant, 44);
const numeric = rows(table, 16);
const decoded = matrixMultiply(inv257.inverse, numeric, 257);
assert.deepEqual(flatten(matrixMultiply(key257, decoded, 257)), table);
const result = flatten(decoded);
const printable = result.filter(v => (v >= 32 && v <= 126) || v === 9 || v === 10 || v === 13).length;
const gpSymbols = result.filter(v => v <= 28).length;
assert.equal(printable, 103);
assert.equal(gpSymbols, 31);
assert.equal(longestGraphic(result), 7);

// A real left-matrix cipher with this exact source-derived key is
// perfectly recoverable: the controlled 256-element plaintext round trips.
const planted = Array.from({length: 256}, (_, i) => ('AN END IN THE DEEP WEB.'.charCodeAt(i % 23) || 32));
const encryptedPlant = matrixMultiply(key257, rows(planted, 16), 257);
assert.deepEqual(flatten(matrixMultiply(inv257.inverse, encryptedPlant, 257)), planted);

console.log('16x16 base60 p50 modulus257: det=' + inv257.determinant +
  ', printable=' + printable + '/256, GP-range=' + gpSymbols +
  '/256, longest contiguous graphic run=' + longestGraphic(result));
console.log('16x16 inverse first 32 residues: ' + result.slice(0, 32).join(','));

for (const family of [
  {name: 'GP-index', sequence: red},
  {name: 'GP-prime', sequence: red.map(i => corpus.prime[i] % 29)}
]) {
  const matrix = rows(family.sequence, 15);
  const candidate = inverse(matrix, 29);
  assert.equal(candidate.determinant, family.name === 'GP-index' ? 8 : 16);
  const plantedGP = Array.from({length: 15}, (_, i) => (5 * i + 3) % 29);
  assert.deepEqual(vectorMultiply(candidate.inverse,
    vectorMultiply(matrix, plantedGP, 29), 29), plantedGP);

  for (const physicalPage of [32, 55]) {
    const original = corpus.pages.find(page => page.page === physicalPage).indices;
    for (const side of ['first-rune-as-header', 'last-rune-as-trailer']) {
      const fullBlocks = side === 'first-rune-as-header' ? original.slice(1) : original.slice(0, -1);
      assert.equal(fullBlocks.length % 15, 0);
      const inverseOutput = rows(fullBlocks, 15).flatMap(block =>
        vectorMultiply(candidate.inverse, block, 29));
      const sample = inverseOutput.slice(0, 55).map(index => corpus.translit[index]).join('');
      const score = ioc(inverseOutput, 29);
      assert.ok(score < 0.045, 'frozen original inverse remains unlike native GP prose');
      console.log('15x15 ' + family.name + ' page=' + physicalPage + ' ' + side +
        ' IoC=' + score.toFixed(6) + ' GP-prefix=' + sample);
    }
  }
}
console.log('PASS: exact original inverses, all source geometry and native planted controls');
