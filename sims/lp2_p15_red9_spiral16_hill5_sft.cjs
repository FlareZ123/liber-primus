"use strict";
/**
 * SFT: original p15 outer-16-number ring plus inner-9-red-rune Hill5 key.
 *
 * Source selection: 16 cells of p15's verified 4x4 Fibonacci-prime spiral,
 * nine red heading runes, and the remaining 150 original body runes.
 * 5x5 = 16-cell perimeter + 9-cell interior; 150 = 30 * 5.
 * Tests both matrix actions and row/column conventions with no fitted key.
 * Read-only, dependency-free CommonJS; Node 22.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const d = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const MOD = 29;
const mod = x => ((x % MOD) + MOD) % MOD;
const physical15 = d.pages.find(p => p.page === 15);
const known57 = d.pages.find(p => p.page === 57);
const heading = physical15.indices.slice(0, 9);
const body = physical15.indices.slice(9);
const print = values => values.map(x => d.translit[x]).join("");
assert.equal(heading.map(x => d.translit[x]).join(" "), "F U L M A EA Y OE A");
assert.equal(physical15.indices.length, 159);
assert.equal(body.length, 150);
assert.equal(known57.indices.length, 95);
const spiral = [
  3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516
];
const perimeter = [];
for (let c = 0; c < 5; c++) perimeter.push([0, c]);
for (let r = 1; r < 5; r++) perimeter.push([r, 4]);
for (let c = 3; c >= 0; c--) perimeter.push([4, c]);
for (let r = 3; r >= 1; r--) perimeter.push([r, 0]);
const center = [];
for (let r = 1; r <= 3; r++) for (let c = 1; c <= 3; c++) center.push([r, c]);
assert.equal(perimeter.length, 16);
assert.equal(center.length, 9);
const M = Array.from({length: 5}, () => Array(5).fill(-1));
for (let i = 0; i < 16; i++) {
  const [r, c] = perimeter[i];
  M[r][c] = mod(spiral[i]);
}
for (let i = 0; i < 9; i++) {
  const [r, c] = center[i];
  M[r][c] = heading[i];
}
assert.deepEqual(M, [
  [22,21,19,17,11],
  [21, 0, 1,20, 1],
  [17,19,24,28,10],
  [12,26,22,24, 3],
  [22, 7,25,22,20]
]);
/** @param {number[][]} m @returns {{inverse:number[][],det:number}} */
function invert(m) {
  const n = m.length, a = m.map((row, i) =>
    [...row, ...Array.from({length:n}, (_, j) => Number(i === j))]);
  let det = 1;
  for (let k = 0; k < n; k++) {
    const p = a.findIndex((row, i) => i >= k && row[k] !== 0);
    assert.notEqual(p, -1, "singular source key");
    if (p !== k) {
      [a[k], a[p]] = [a[p], a[k]];
      det = mod(-det);
    }
    const pivot = a[k][k];
    det = mod(det * pivot);
    let inv = 1;
    while (mod(pivot * inv) !== 1) inv++;
    for (let j = 0; j < 2*n; j++) a[k][j] = mod(a[k][j] * inv);
    for (let i = 0; i < n; i++) if (i !== k) {
      const q = a[i][k];
      for (let j = 0; j < 2*n; j++) a[i][j] = mod(a[i][j] - q * a[k][j]);
    }
  }
  return {inverse:a.map(row => row.slice(n)),det};
}
const {inverse: Minv, det} = invert(M);
assert.equal(det, 23);
assert.deepEqual(Minv, [
  [25,26,23,18, 7],
  [ 1, 1,25, 9,16],
  [ 9, 1, 6, 8,14],
  [20, 8,12,15, 5],
  [23,19,25,10, 0]
]);
/** @param {number[]} input @param {number[][]} matrix @param {boolean} rows */
function transform(input, matrix, rows) {
  assert.equal(input.length % 5, 0);
  const output = [];
  for (let at = 0; at < input.length; at += 5) {
    for (let i = 0; i < 5; i++) {
      let sum = 0;
      for (let j = 0; j < 5; j++) sum +=
        input[at + j] * (rows ? matrix[j][i] : matrix[i][j]);
      output.push(mod(sum));
    }
  }
  return output;
}
/** @param {number[]} input */
function ioc(input) {
  const counts = Array(29).fill(0);
  for (const n of input) counts[n]++;
  return counts.reduce((sum, n) => sum + n*(n-1), 0) /
    (input.length*(input.length-1));
}
const variants = [];
const expected = [0.031767337807606266,0.03463087248322148,
  0.031946308724832215,0.03328859060402684];
for (const [keyName, key, opposite] of [
  ["M", M, Minv], ["Minv", Minv, M]
]) for (const rows of [false, true]) {
  const candidate = transform(body, key, rows);
  assert.deepEqual(transform(candidate, opposite, rows), body);
  assert.ok(Math.abs(ioc(candidate)-expected[variants.length]) < 1e-14);
  variants.push({key:keyName, action:rows?"row-vector":"column-vector",
    ioc:ioc(candidate), opening80:print(candidate.slice(0,80))});
}
const control = [...known57.indices, ...known57.indices.slice(0,55)];
assert.equal(control.length, 150);
for (const rows of [false, true]) {
  const ciphertext = transform(control, M, rows);
  assert.deepEqual(transform(ciphertext, Minv, rows), control);
  assert.deepEqual(transform(transform(control, Minv, rows), M, rows), control);
}
console.log(JSON.stringify({
  classification:"source-composite p15 Hill5 direct original-cipher negative",
  source:"p15 red9+spiral16→5x5; p15 body150→30 five-rune packets",
  matrix:M, determinant:det, inverse:Minv,
  originalBodyIoC:ioc(body), variants,
  positiveControl:"p57 known GP95 plus its first55 = 150; all four inverse pairs exact",
  verdict:"No deciphered p15 native-GP plaintext or source-authentic cipher mechanism."
}, null, 2));
