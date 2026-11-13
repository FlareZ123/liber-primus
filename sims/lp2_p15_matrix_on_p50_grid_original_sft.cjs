'use strict';

/**
 * Source-locked LP2 p15 printed 4x4 matrix acting on the printed pp49-51 grid.
 *
 * This is a single runnable original-input test. The byte-level transform is
 * noninjective; the separate GF29 transform acts on byte residues and cannot
 * recover the original 8-bit table. It does not identify an LP2 cipher key.
 *
 * Run: node sims/lp2_p15_matrix_on_p50_grid_original_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));

const printed = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820],
];
const mod = value => ((value % 29) + 29) % 29;
const transpose = matrix => matrix[0].map((_, i) => matrix.map(row => row[i]));

function inverse29(matrix) {
  const n = matrix.length;
  const m = matrix.map((row, i) => [
    ...row.map(mod),
    ...Array.from({ length: n }, (_, j) => Number(i === j)),
  ]);
  for (let c = 0; c < n; c++) {
    const pivotRow = m.findIndex((row, i) => i >= c && row[c] !== 0);
    assert.notEqual(pivotRow, -1, 'source matrix is singular modulo29');
    [m[c], m[pivotRow]] = [m[pivotRow], m[c]];
    const pivotInverse = Array.from({ length: 29 }, (_, x) => x)
      .find(x => mod(x * m[c][c]) === 1);
    assert.notEqual(pivotInverse, undefined);
    m[c] = m[c].map(x => mod(x * pivotInverse));
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const factor = m[r][c];
      m[r] = m[r].map((x, j) => mod(x - factor * m[c][j]));
    }
  }
  return m.map(row => row.slice(n));
}

function multiply(matrix, vector) {
  return matrix.map(row => mod(row.reduce(
    (sum, v, i) => sum + v * vector[i], 0)));
}

function transform(matrix, input, phase = 0) {
  const out = [];
  for (let i = phase; i + 4 <= input.length; i += 4) {
    out.push(...multiply(matrix, input.slice(i, i + 4)));
  }
  return out;
}

function indexOfCoincidence(indices) {
  const counts = Array(29).fill(0);
  for (const x of indices) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (indices.length * (indices.length - 1));
}

assert.equal(grid.bytes.length, 256);
assert.equal(corpus.runes.length, 29);
const bytes = Buffer.from(grid.bytes);
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

// Three whole columns are even. Their 128-bit high-bit flips lie in
// the byte transform's kernel; source byte blocks cannot be recovered.
for (const col of [0, 2, 3]) {
  assert(printed.every(row => row[col] % 2 === 0));
  for (const row of printed) assert.equal((row[col] * 128) % 256, 0);
}
const firstBlock = bytes.subarray(0, 4);
const byteMultiply = input => printed.map(row =>
  row.reduce((sum, coefficient, i) => sum + coefficient * input[i], 0) % 256);
for (let bits = 0; bits < 8; bits++) {
  const candidate = Array.from(firstBlock);
  [0, 2, 3].forEach((column, j) => {
    if (bits & (1 << j)) candidate[column] ^= 128;
  });
  assert.deepEqual(byteMultiply(candidate), byteMultiply(firstBlock));
}

const M = printed.map(row => row.map(mod));
const inv = inverse29(M);
const forms = {
  direct: M, inverse: inv,
  transpose: transpose(M), inverseTranspose: transpose(inv),
};
assert.deepEqual(multiply(inv, multiply(M, [2, 3, 5, 7])), [2, 3, 5, 7]);

// The original solved final page is an independent native-GP control.
const known = corpus.pages.find(page => page.page === 57);
assert.equal(known.status, 'solved');
assert.equal(known.indices.length, 95);
const control = known.indices.slice(0, 92);
for (const [name, form] of Object.entries(forms)) {
  const cypher = transform(inverse29(form), control);
  assert.deepEqual(transform(form, cypher), control,
    'authentic solved-LP2 plant for ' + name);
}

const residue = grid.bytes.map(x => x % 29);
const originalIOC = indexOfCoincidence(residue);
const modes = [];
for (const [name, form] of Object.entries(forms)) {
  for (let phase = 0; phase < 4; phase++) {
    const indices = transform(form, residue, phase);
    const ioc = indexOfCoincidence(indices);
    const preview = indices.slice(0, 36).map(i => corpus.translit[i]).join(' ');
    modes.push({ name, phase, count: indices.length, ioc, preview });
  }
}
modes.sort((a, b) => b.ioc - a.ioc);
assert.equal(modes.length, 16);
assert(Math.abs(originalIOC - 0.03388480392156863) < 1e-3);
assert(modes[0].ioc < 0.04,
  'one GF29 candidate has unexpectedly high nonuniformity');
assert.equal(modes[0].name, 'transpose');
assert.equal(modes[0].phase, 1);
assert(Math.abs(modes[0].ioc - 0.03671030165054069) < 1e-12);

console.log(JSON.stringify({
  bytes: bytes.length,
  rawByteMatrixInvertible: false,
  independentByteKernelChoices: 8,
  gf29MatrixInvertible: true,
  inputResidueIoC: originalIOC,
  solvedControlIoC: indexOfCoincidence(control),
  nativeControlRecovered: control.length,
  best: modes[0],
  naturalPhaseZero: modes.filter(mode => mode.phase === 0),
  completeResults: modes,
}, null, 2));
