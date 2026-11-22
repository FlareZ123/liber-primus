/** Direct source-shaped four-matrix Hill-8 original-cipher gate.
 * Inputs: printed LP2 p40 red8 followed by exactly 3000 runes and the pp49–51 32×8 base60 byte table.
 * One row-major 8×8 matrix per eight printed rows, selected cyclically across 375 blocks.
 * This is a proposed consumer, not a documented author instruction.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
/** @param {string} name */
const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', name), 'utf8'));
const corpus = read('lp2-corpus.json'), grid = read('base60-grid.json');
/** @param {number} x */
const mod = x => ((x % 29) + 29) % 29;
/** @param {number} x */
function invertScalar(x) {
  for (let y = 1; y < 29; y++) if (mod(x * y) === 1) return y;
  throw Error('Matrix has a noninvertible pivot');
}
/** @param {number[][]} matrix */
function invertMatrix(matrix) {
  const n = 8;
  const a = matrix.map((row, i) => [
    ...row, ...Array.from({ length: n }, (_, j) => Number(i === j))
  ]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && a[pivot][col] === 0) pivot++;
    assert.ok(pivot < n, 'Singular source matrix');
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const scale = invertScalar(a[col][col]);
    for (let j = 0; j < 2 * n; j++) a[col][j] = mod(a[col][j] * scale);
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = a[row][col];
      for (let j = 0; j < 2 * n; j++) a[row][j] = mod(a[row][j] - factor * a[col][j]);
    }
  }
  return a.map(row => row.slice(n));
}
/** @param {number[][]} matrix @param {number[]} vector */
function product(matrix, vector) {
  return matrix.map(row => mod(row.reduce((sum, cell, j) => sum + cell * vector[j], 0)));
}
/** @param {number[]} runes */
function coincidence(runes) {
  const f = Array(29).fill(0);
  runes.forEach(r => f[r]++);
  return f.reduce((s, v) => s + v * (v - 1), 0) / (runes.length * (runes.length - 1));
}
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
const matrices = Array.from({ length: 4 }, (_, k) => Array.from({ length: 8 }, (_, row) =>
  bytes.slice(k * 64 + row * 8, k * 64 + row * 8 + 8).map(mod)
));
const inverses = matrices.map(invertMatrix);
const source = corpus.pages.filter(p => p.page >= 40 && p.page <= 53)
  .flatMap(p => p.indices);
assert.equal(source.length, 3008);
assert.deepEqual(source.slice(0, 8), [0, 9, 19, 26, 6, 23, 25, 8]);
const ciphertext = source.slice(8);
assert.equal(ciphertext.length, 3000);
/** @param {number[]} runes @param {number[][][]} keys */
function apply(runes, keys) {
  assert.equal(runes.length % 8, 0);
  /** @type {number[]} */
  const output = [];
  for (let i = 0; i < runes.length; i += 8) {
    output.push(...product(keys[(i / 8) % 4], runes.slice(i, i + 8)));
  }
  return output;
}
const plaintext = apply(ciphertext, inverses);
assert.deepEqual(apply(plaintext, matrices), ciphertext);
const native = corpus.pages.find(p => p.page === 57).indices;
const plant = Array.from({ length: 3000 }, (_, j) => native[j % native.length]);
const nativeCipher = apply(plant, matrices);
assert.deepEqual(apply(nativeCipher, inverses), plant);
const result = {
  inputRunes: ciphertext.length,
  fourMatrixRanks: [8, 8, 8, 8],
  rawIoC: coincidence(ciphertext),
  decodedIoC: coincidence(plaintext),
  nativePlantIoC: coincidence(plant),
  originalRoundTrip: 3000,
  positivePlantRecovered: 3000,
  decodedFirst50Tokens: plaintext.slice(0, 50).map(i => corpus.translit[i]).join('-'),
  status: 'PASS: implementation, negative direct original-cipher language readout'
};
assert.ok(Math.abs(result.rawIoC - 0.03454440369011893) < 1e-12);
assert.ok(Math.abs(result.decodedIoC - 0.034594420362343004) < 1e-12);
console.log(JSON.stringify(result, null, 2));
