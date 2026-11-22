'use strict';
/**
 * SFT: Original LP2 p8 255-rune Hill5 receiver under exact 2014 Stage10
 * fifth-power five-square operators suggested by the p7 READURL candidate.
 * Runs under Node.js 22 on Windows or any supported Node platform.
 * Read-only: no files are written.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = (p) => path.join(__dirname, '..', 'resources', p);
const corpus = JSON.parse(fs.readFileSync(source('liber-primus/lp2-corpus.json'), 'utf8'));
const original = fs.readFileSync(source('cicada2014-openpuff-magic-squares.txt'), 'utf8');
const squares = original.trim().split(/\r?\n\s*\r?\n/).filter(Boolean).map((part) =>
  part.split(/\r?\n/).filter(Boolean).map((line) => line.trim().split(/\s+/).map(Number)));
assert.deepEqual(squares.map((m) => m.length), [5, 7, 5]);
for (let k = 0; k < squares.length; k++) {
  const n = squares[k].length;
  assert(squares[k].every((row) => row.length === n && row.every(Number.isSafeInteger)));
  const sum = k === 0 ? 3301 : 1033;
  assert(squares[k].every((row) => row.reduce((a, b) => a + b, 0) === sum));
}
const mod = (x) => ((x % 29) + 29) % 29;

/** @param {number[][]} x @param {number[][]} y @returns {number[][]} */
function mul(x, y) {
  assert.equal(x[0].length, y.length);
  return Array.from({length: x.length}, (_, r) =>
    Array.from({length: y[0].length}, (_, c) => mod(
      x[r].reduce((sum, value, k) => sum + value * y[k][c], 0))));
}
/** @param {number[][]} x @param {number} power @returns {number[][]} */
function pow(x, power) {
  let out = Array.from({length: x.length}, (_, i) =>
    Array.from({length: x.length}, (_, j) => Number(i === j)));
  let base = x.map((row) => row.map(mod));
  let p = power;
  while (p > 0) {
    if (p % 2) out = mul(out, base);
    base = mul(base, base);
    p = Math.floor(p / 2);
  }
  return out;
}
const identity = (n) => pow(Array.from({length: n}, (_, i) =>
  Array.from({length: n}, (_, j) => Number(i === j))), 1);
const A = squares[0], B = squares[2];
assert.deepEqual(pow(A, 56), identity(5));
assert.deepEqual(pow(B, 28), identity(5));
const A5 = pow(A, 5), B5 = pow(B, 5);
const Ai5 = pow(A, 51), Bi5 = pow(B, 23);
assert.deepEqual(mul(A5, Ai5), identity(5));
assert.deepEqual(mul(B5, Bi5), identity(5));

/** @param {number[]} values @param {number[][][]} matrices @returns {number[]} */
function apply(values, matrices) {
  assert.equal(values.length % 5, 0);
  const out = [];
  for (let p = 0; p < values.length; p += 5) {
    const m = matrices[(p / 5) % matrices.length];
    const five = values.slice(p, p + 5);
    for (const row of m) out.push(mod(row.reduce((sum, value, j) =>
      sum + value * five[j], 0)));
  }
  return out;
}
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const frequency = Array(29).fill(0);
  values.forEach((v) => { assert(v >= 0 && v < 29); frequency[v]++; });
  return frequency.reduce((n, x) => n + x * (x - 1), 0) /
    (values.length * (values.length - 1));
}
/** @param {number[]} a @returns {string} */
const latin = (a) => a.map((v) => corpus.translit[v]).join('');

const p7 = corpus.pages[7].indices;
assert.equal(p7.length, 208);
const red = p7.slice(194, 208), lens = [2, 4, 3, 2, 3];
assert.equal(lens.reduce((a, b) => a + b, 0), 14);
let cursor = 0;
const wordProducts = lens.map((length) => {
  const v = red.slice(cursor, cursor + length);
  cursor += length;
  return v.reduce((n, x) => mod(n * x), 1);
});
assert.deepEqual(wordProducts, [11, 26, 8, 15, 2]);
assert.deepEqual(apply(wordProducts, [A5]), [13, 18, 4, 28, 23]);
assert.deepEqual(apply(wordProducts, [B5]), [1, 4, 20, 14, 21]);

const p8 = corpus.pages[8].indices;
assert.equal(p8.length, 255);
assert.equal(p8.length / 5, 51);
assert(Math.abs(ioc(p8) - 0.03427512737378416) < 1e-12);
const clear = corpus.pages[57].indices;
assert.equal(clear.length, 95);
const plant = Array.from({length: 255}, (_, i) => clear[i % clear.length]);
const cases = [
  ['A5', [A5], [Ai5]],
  ['B5', [B5], [Bi5]],
  ['Ainv5', [Ai5], [A5]],
  ['Binv5', [Bi5], [B5]],
  ['A5/B5', [A5, B5], [Ai5, Bi5]],
  ['B5/A5', [B5, A5], [Bi5, Ai5]],
  ['Ainv5/Binv5', [Ai5, Bi5], [A5, B5]],
  ['Binv5/Ainv5', [Bi5, Ai5], [B5, A5]],
  ['AB5', [mul(A5, B5)], [mul(Bi5, Ai5)]],
  ['BA5', [mul(B5, A5)], [mul(Ai5, Bi5)]]
];
const expected = new Map([
  ['A5', 0.03547939], ['B5', 0.03489270],
  ['Ainv5', 0.03594257], ['Binv5', 0.03393546],
  ['A5/B5', 0.03433688], ['B5/A5', 0.03473830],
  ['Ainv5/Binv5', 0.03452216], ['Binv5/Ainv5', 0.03671453],
  ['AB5', 0.03467655], ['BA5', 0.03455303]
]);
const results = cases.map(([name, forward, inverse]) => {
  const decoded = apply(p8, forward);
  assert.deepEqual(apply(decoded, inverse), p8, 'exact native original re-encoding: ' + name);
  assert.deepEqual(apply(apply(plant, inverse), forward), plant,
    'exact solved-page plaintext plant: ' + name);
  const value = ioc(decoded);
  assert(Math.abs(value - expected.get(name)) < 0.000000006, 'frozen native IoC: ' + name);
  assert(value < 0.04, 'no false plaintext evidence: ' + name);
  return {model: name, ioc: value, gpPrefix: latin(decoded.slice(0, 50))};
});
assert.equal(results.length, 10);
console.log(JSON.stringify({
  status: 'PASS: bounded original p8 fifth-power Hill5 receiver negative',
  runes: p8.length,
  printedBlocks: p8.length / 5,
  sourceWordVector: wordProducts,
  outputREADURL: 'PEREADURLXNG',
  sourceIoC: ioc(p8),
  maxIoC: Math.max(...results.map((x) => x.ioc)),
  models: results
}, null, 2));