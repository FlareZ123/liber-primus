'use strict';
/**
 * LP1 05.jpg's central reversed-hex magic-square payload and its canonical
 * GP29 mirror-sector eigenbasis. Apply four exact original LP2 basis inverses.
 * Windows 11 / Node 22 / CommonJS / read-only, no network or dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const data = fs.readFileSync(path.join(root, 'resources', 'liber-primus', '05.jpg'));
const eoi = data.indexOf(Buffer.from([0xff, 0xd9]));
assert.equal(eoi, 336351);
const jpegLength = eoi + 2;
assert.equal(data.length, 673066);
const first = data.subarray(0, jpegLength);
const reversed = data.subarray(data.length - jpegLength);
assert.deepEqual(first, Buffer.from(reversed).reverse());
const center = data.subarray(jpegLength, data.length - jpegLength);
assert.equal(center.length, 360);
assert.deepEqual(center.subarray(0, 2), Buffer.from([10, 10]));
const h = center.subarray(2).toString('ascii').split('').reverse().join('');
assert.match(h, /^[0-9a-f]+$/);
const recovered = Buffer.from(h, 'hex').toString('ascii');
assert.equal(Buffer.byteLength(recovered), 179);
const matrix = recovered.trim().split('\n').map(line =>
  line.trim().split(/\s+/).map(Number));
assert.deepEqual(matrix, [
  [272, 138, 341, 131, 151],
  [366, 199, 130, 320, 18],
  [226, 245, 91, 245, 226],
  [18, 320, 130, 199, 366],
  [151, 131, 341, 138, 272],
]);
for (const row of matrix) assert.equal(row.reduce((a, b) => a + b, 0), 1033);
for (let j = 0; j < 5; j += 1) {
  assert.equal(matrix.reduce((a, row) => a + row[j], 0), 1033);
}

const mod = n => ((n % 29) + 29) % 29;
const inv = n => {
  for (let k = 1; k < 29; k += 1) if (mod(k * n) === 1) return k;
  throw Error('not invertible');
};
/** @param {number[][]} source */
function rref(source) {
  const a = source.map(row => row.map(mod));
  const pivots = [];
  for (let c = 0, r = 0; c < a[0].length && r < a.length; c += 1) {
    let k = -1;
    for (let i = r; i < a.length; i += 1) if (a[i][c] !== 0) { k = i; break; }
    if (k < 0) continue;
    [a[r], a[k]] = [a[k], a[r]];
    const unit = inv(a[r][c]);
    a[r] = a[r].map(v => mod(v * unit));
    for (let i = 0; i < a.length; i += 1) {
      if (i === r) continue;
      const q = a[i][c];
      a[i] = a[i].map((v, j) => mod(v - q * a[r][j]));
    }
    pivots.push(c);
    r += 1;
  }
  return { a, pivots };
}
/** @param {number[][]} input */
function inverseMatrix(input) {
  const n = input.length;
  const work = input.map((row, i) =>
    [...row.map(mod), ...Array.from({ length: n }, (_, j) => +(i === j))]);
  for (let c = 0; c < n; c += 1) {
    let k = -1;
    for (let r = c; r < n; r += 1) if (work[r][c] !== 0) { k = r; break; }
    assert(k >= 0);
    [work[c], work[k]] = [work[k], work[c]];
    const unit = inv(work[c][c]);
    work[c] = work[c].map(v => mod(v * unit));
    for (let r = 0; r < n; r += 1) {
      if (r === c) continue;
      const scale = work[r][c];
      work[r] = work[r].map((v, i) => mod(v - scale * work[c][i]));
    }
  }
  return work.map(row => row.slice(n));
}
const B = matrix.map(row => row.map(mod));
/** @param {number} eigenvalue */
function eigenvector(eigenvalue) {
  const { a, pivots } = rref(B.map((row, i) => row.map((v, j) =>
    mod(v - (i === j ? eigenvalue : 0)))));
  const free = [0, 1, 2, 3, 4].filter(i => !pivots.includes(i));
  if (free.length === 0) return null;
  assert.deepEqual(free.length, 1);
  const v = [0, 0, 0, 0, 0];
  v[free[0]] = 1;
  for (let i = pivots.length - 1; i >= 0; i -= 1) {
    v[pivots[i]] = mod(-a[i].reduce((sum, x, j) => sum + x * v[j], 0));
  }
  const firstNonzero = v.find(x => x !== 0);
  return v.map(x => mod(x * inv(firstNonzero)));
}
const roots = [];
const anti = [], symmetric = [], uniform = [];
for (let lambda = 0; lambda < 29; lambda += 1) {
  const v = eigenvector(lambda);
  if (v === null) continue;
  roots.push(lambda);
  const isUniform = v.every(x => x === v[0]);
  const isAnti = v.every((x, i) => mod(x + v[4 - i]) === 0);
  const isSym = v.every((x, i) => x === v[4 - i]);
  if (isUniform) uniform.push(lambda);
  else if (isAnti) anti.push(lambda);
  else if (isSym) symmetric.push(lambda);
  else throw Error('unexpected mixed mirror parity');
}
assert.deepEqual(roots, [5, 8, 18, 21, 24]);
assert.deepEqual(anti, [5, 24]);
assert.deepEqual(symmetric, [8, 21]);
assert.deepEqual(uniform, [18]);
// Candidate canonical reading: alternate ordered antisymmetric and symmetric
// mirror sectors, finish with the row-sum (uniform) eigenvalue.
const order = [anti[0], symmetric[0], anti[1], symmetric[1], uniform[0]];
assert.deepEqual(order, [5, 8, 24, 21, 18]); // CHANGE; an interpretation, not an opcode.
const vectors = order.map(eigenvector);
assert.deepEqual(vectors, [
  [1, 0, 0, 0, 28],
  [1, 24, 8, 24, 1],
  [1, 11, 0, 18, 28],
  [1, 18, 20, 18, 1],
  [1, 1, 1, 1, 1],
]);
const P = Array.from({ length: 5 }, (_, r) => vectors.map(v => v[r]));
const Q = inverseMatrix(P);
const transpose = a => a[0].map((_, j) => a.map(row => row[j]));
const mul = (A, b) => A.map(row =>
  mod(row.reduce((sum, value, i) => sum + value * b[i], 0)));
assert.deepEqual(Array.from({length: 5}, (_,i) =>
  mul(B, vectors[i])), vectors.map((v,i) => v.map(x => mod(x*order[i]))));
for (let i = 0; i < 5; i += 1) {
  const unit = [0, 0, 0, 0, 0]; unit[i] = 1;
  assert.deepEqual(mul(Q, mul(P, unit)), unit);
}
/** @param {number[]} values @param {number[][]} op */
function blocks(values, op) {
  const result = [];
  for (let i = 0; i < values.length; i += 5) {
    const b = values.slice(i, i + 5);
    result.push(...(b.length === 5 ? mul(op, b) : b));
  }
  return result;
}
/** @param {number[]} values */
function ioc(values) {
  const f = new Array(29).fill(0);
  for (const v of values) f[v] += 1;
  return f.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const unknown = corpus.pages.filter(page => page.page >= 0 && page.page <= 55);
assert.equal(unknown.length, 56);
const total = unknown.reduce((sum, page) => sum + page.indices.length, 0);
assert.equal(total, 12956);
const solved = corpus.pages.find(page => page.page === 57);
assert.equal(solved.indices.length, 95);
const operators = { P, Pinv: Q, PT: transpose(P), PTinv: inverseMatrix(transpose(P)) };
const outcome = {};
for (const [name, op] of Object.entries(operators)) {
  const reverse = inverseMatrix(op);
  const transformed = unknown.map(page => {
    const plaintext = blocks(page.indices, op);
    assert.deepEqual(blocks(plaintext, reverse), page.indices);
    return plaintext;
  });
  const plant = blocks(solved.indices, reverse);
  assert.deepEqual(blocks(plant, op), solved.indices);
  const combined = transformed.flat();
  outcome[name] = {
    wholeIoc: +ioc(combined).toFixed(9),
    p0: +ioc(transformed[0]).toFixed(6),
    p8: +ioc(transformed[8]).toFixed(6),
    p33: +ioc(transformed[33]).toFixed(6),
    p55: +ioc(transformed[55]).toFixed(6),
  };
  assert(outcome[name].wholeIoc < 0.04);
}
console.log(JSON.stringify({
  originalJpegBytes: data.length, mirroredJpegBytes: jpegLength,
  centralBytes: center.length, decodedAsciiBytes: recovered.length,
  authentic1033Square: matrix, spectrum: roots, sectors: {anti, symmetric, uniform},
  candidateOrderedSpectrum: order,
  eigenbasis: P, originalIoc: ioc(unknown.flatMap(p => p.indices)),
  solvedPage57Ioc: ioc(solved.indices), originalTransformIoc: outcome,
  verdict: 'Exact image payload and reversible GP29 bases; no unknown-page plaintext; ordering remains interpretive.',
}, null, 2));
