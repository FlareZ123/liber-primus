'use strict';

/**
 * Source 2014 1033 five-square eigenbasis → source cuneiform p33–39.
 * Direct original-source matrix-change candidate, all 1680 original runes.
 * Node.js 22 CommonJS, Windows 11. Read-only single-file test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const squares = read('resources/cicada2014-openpuff-magic-squares.txt')
  .trim().split(/\r?\n\s*\r?\n/).map((body) =>
    body.trim().split(/\r?\n/).map((line) =>
      line.trim().split(/\s+/).map(Number)));
assert.deepEqual(squares.map((v) => v.length), [5, 7, 5]);
const B = squares[2].map((row) => row.map((v) => ((v % 29) + 29) % 29));
const mod = (v) => ((v % 29) + 29) % 29;
/** @param {number} n @returns {number} */
function invertUnit(n) {
  assert.ok(n > 0 && n < 29);
  for (let i = 1; i < 29; i++) if (mod(i * n) === 1) return i;
  throw new Error('GF29 unit inverse absent');
}
/**
 * General finite-field reduced row echelon form.
 * @param {number[][]} original
 * @param {number} nPivotColumns
 * @returns {{a: number[][], pivots: number[]}}
 */
function rref(original, nPivotColumns) {
  const a = original.map((row) => row.slice());
  const pivots = [];
  for (let col = 0; col < nPivotColumns; col++) {
    const p = a.findIndex((row, idx) =>
      idx >= pivots.length && row[col] !== 0);
    if (p < 0) continue;
    const r = pivots.length;
    [a[r], a[p]] = [a[p], a[r]];
    const inv = invertUnit(a[r][col]);
    a[r] = a[r].map((v) => mod(v * inv));
    for (let i = 0; i < a.length; i++) {
      if (i === r) continue;
      const f = a[i][col];
      a[i] = a[i].map((v, j) => mod(v - f * a[r][j]));
    }
    pivots.push(col);
  }
  return {a, pivots};
}
/** @param {number[][]} matrix @param {number} eigenvalue @returns {number[]} */
function eigenvector(matrix, eigenvalue) {
  const x = matrix.map((row, i) => row.map((v, j) =>
    mod(v - (i === j ? eigenvalue : 0))));
  const {a, pivots} = rref(x, 5);
  assert.equal(pivots.length, 4);
  const free = [0, 1, 2, 3, 4].filter((n) => !pivots.includes(n));
  assert.equal(free.length, 1);
  const result = Array(5).fill(0);
  result[free[0]] = 1;
  pivots.forEach((col, r) => {
    result[col] = mod(-a[r][free[0]]);
  });
  const nonzero = result.find((v) => v > 0);
  const normalized = result.map((v) => mod(v * invertUnit(nonzero)));
  assert.deepEqual(matrix.map((row) => mod(row.reduce(
    (sum, v, j) => sum + v * normalized[j], 0))),
  normalized.map((v) => mod(v * eigenvalue)));
  return normalized;
}
/** @param {number[][]} a @returns {number[][]} */
function inverse(a) {
  const n = a.length;
  const augmented = a.map((row, i) => row.concat(
    Array.from({length:n}, (_,j) => i===j?1:0)));
  const {a: reduced,pivots} = rref(augmented, n);
  assert.deepEqual(pivots, [0,1,2,3,4]);
  assert.deepEqual(reduced.map((row) => row.slice(0,n)),
    Array.from({length:n}, (_,r) =>
      Array.from({length:n}, (_,c)=>r===c?1:0)));
  return reduced.map((row) => row.slice(n));
}
/** @param {number[][]} a @returns {number[][]} */
function transpose(a) {
  return a[0].map((_, i) => a.map((row) => row[i]));
}
/** @param {number[][]} matrix @param {number[]} input @returns {number[]} */
function process(matrix, input) {
  assert.equal(input.length % 5, 0);
  const out = [];
  for (let i=0;i<input.length;i+=5) {
    const block=input.slice(i,i+5);
    out.push(...matrix.map((row) =>
      mod(row.reduce((s, x, j) => s+x*block[j], 0))));
  }
  return out;
}
/** @param {number[]} seq @returns {number} */
function ioc(seq) {
  const ct=Array(29).fill(0);
  seq.forEach((x)=>ct[x]++);
  return ct.reduce((s,n)=>s+n*(n-1),0)/(seq.length*(seq.length-1));
}

// Only original source-root ordering independently recoverable from the
// already-solved first-LP1 word CHANGE: C H A NG E = 5 8 24 21 18.
// The characteristic polynomial is independently asserted by prior work.
const roots = [5, 8, 24, 21, 18];
const eigenvectors = roots.map((root) => eigenvector(B, root));
assert.deepEqual(eigenvectors, [
  [1,0,0,0,28],
  [1,24,8,24,1],
  [1,11,0,18,28],
  [1,18,20,18,1],
  [1,1,1,1,1]
]);
const parity=eigenvectors.map((x)=>({
  symmetric:x.every((v,i)=>v===x[4-i]),
  antisymmetric:x.every((v,i)=>mod(v+x[4-i])===0)
}));
assert.deepEqual(parity.map((p)=>p.symmetric),
  [false,true,false,true,true]);
assert.deepEqual(parity.map((p)=>p.antisymmetric),
  [true,false,true,false,false]);
const ordered = [roots[0],roots[1],roots[2],roots[3],roots[4]];
assert.deepEqual(ordered, [5,8,24,21,18]);
// The final 'E' eigenvalue comes directly from constant row sum 1033 % 29.
assert.equal(mod(squares[2][0].reduce((a,b)=>a+b,0)), roots[4]);
const S = transpose(eigenvectors);
const Sinverse = inverse(S);
assert.deepEqual(S, [
 [1,1,1,1,1], [0,24,11,18,1], [0,8,0,20,1],
 [0,24,18,18,1], [28,1,28,1,1]
]);
assert.deepEqual(Sinverse, [
 [15,25,0,4,14], [1,5,17,5,1], [0,4,0,25,0],
 [8,18,6,18,8], [6,6,6,6,6]
]);
const original = corpus.pages.filter((p) =>
  p.page>=33 && p.page<=39).flatMap((p)=>p.indices);
assert.equal(original.length, 1680);
const source = corpus.pages.find((p)=>p.page===57).indices;
assert.equal(source.length,95);
const native = Array.from({length:1680},(_,i)=>source[i%95]);
const candidates=[
 ['eigenbasis',Sinverse,S], ['eigenbasis-inverse',S,Sinverse],
 ['transposed-eigenbasis',transpose(Sinverse),transpose(S)],
 ['transposed-inverse',transpose(S),transpose(Sinverse)]
];
const outcomes=[];
for(const [name,M,undo] of candidates) {
  const decoded=process(M,original);
  assert.deepEqual(process(undo,decoded),original);
  const plantedCipher=process(undo,native);
  assert.deepEqual(process(M,plantedCipher),native);
  const o={
    name, sourceOriginalRunes:original.length,
    decodedIoC:Number(ioc(decoded).toFixed(12)),
    originalIoC:Number(ioc(original).toFixed(12)),
    nativePlantIoC:Number(ioc(native).toFixed(12)),
    opening: decoded.slice(0,30).map((v)=>corpus.translit[v]).join(' ')
  };
  outcomes.push(o);
  console.log(JSON.stringify(o));
}
assert.equal(outcomes.length,4);
assert.ok(outcomes.every((o)=>o.decodedIoC < 0.037));
assert.ok(outcomes.every((o)=>o.nativePlantIoC > 0.05));
console.log('SFT PASS: all four original full1680 change-of-basis inverses');
console.log('SFT PASS: four 1680/1680 solved-GP PARABLE plants, exact original reencryption');
