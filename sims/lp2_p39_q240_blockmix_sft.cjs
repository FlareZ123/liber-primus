'use strict';
// One-file, read-only Node.js 22 SFT. Run: node sims/lp2_p39_q240_blockmix_sft.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
/** @param {number} x @returns {number} */
function mod(x) { return ((x % 29) + 29) % 29; }
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function polyMul(a, b) {
  const z = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) z[i + j] = mod(z[i + j] + a[i] * b[j]);
  return z;
}
/** @param {number[][]} m @param {number[]} v @returns {number[]} */
function blockMatrix(m, v) {
  assert.equal(v.length % 4, 0);
  const o = [];
  for (let i = 0; i < v.length; i += 4) for (let j = 0; j < 4; j++) {
    let s = 0;
    for (let k = 0; k < 4; k++) s += m[j][k] * v[i + k];
    o.push(mod(s));
  }
  return o;
}
/** @param {number[]} a @param {number[]} b @param {number} sign @returns {number[]} */
function combine(a, b, sign) { return a.map((x, i) => mod(x + sign * b[i])); }
/** @param {number[]} data @returns {number} */
function ioc(data) {
  const cnt = Array(29).fill(0);
  for (const n of data) cnt[n]++;
  return cnt.reduce((s, n) => s + n * (n - 1), 0) / (data.length * (data.length - 1));
}
const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const bytes = grid.bytes;
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const C = corpus.pages.find(p => p.page === 39).indices;
const solved = corpus.pages.find(p => p.page === 57).indices;
assert.equal(C.length, 240);
assert.equal(solved.length, 95);
// Descending original 256 coefficients divided by all four small GF29 factors.
const factors = [
  [5, 1], [5, 1], [11, 18, 1], [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
];
const divisor = factors.reduce(polyMul, [1]);
assert.deepEqual(divisor, [13, 20, 26, 12, 6, 2, 13, 26, 6, 26, 11, 7, 15, 11, 17, 25, 1]);
const residue = bytes.map(x => x % 29).reverse();
const quotient = Array(256 - divisor.length + 1).fill(0);
for (let i = quotient.length - 1; i >= 0; i--) {
  const v = mod(residue[i + divisor.length - 1]);
  quotient[i] = v;
  for (let j = 0; j < divisor.length; j++) residue[i + j] = mod(residue[i + j] - v * divisor[j]);
}
assert.deepEqual(residue.slice(0, 16), Array(16).fill(0));
const Q = quotient.reverse();
assert.equal(Q.length, 240);
assert.deepEqual(Q.slice(0, 12), [0, 28, 18, 14, 3, 2, 14, 21, 7, 27, 23, 2]);
const matrices = {
  unsigned: [[10,3,20,22],[1,22,21,25],[11,17,19,7],[21,17,12,22]],
  signed: [[10,3,20,22],[1,22,21,25],[11,17,19,7],[8,12,12,22]],
  Rm: [[21,27,22,0],[28,10,13,22],[12,0,9,13],[12,24,7,3]]
};
const outputs = {};
for (const [name, matrix] of Object.entries(matrices)) {
  const mc = blockMatrix(matrix, C);
  const mq = blockMatrix(matrix, Q);
  for (const sign of [-1, 1]) {
    const word = sign < 0 ? 'minus' : 'plus';
    outputs[name + '_c_' + word + '_mQ'] = ioc(combine(C, mq, sign));
    outputs[name + '_q_' + word + '_mC'] = ioc(combine(Q, mc, sign));
    outputs[name + '_mC_' + word + '_Q'] = ioc(blockMatrix(matrix, combine(C, Q, sign)));
  }
}
assert.equal(Object.keys(outputs).length, 18);
assert.ok(Math.max(...Object.values(outputs)) < 0.0362);
assert.ok(ioc(solved) > 0.06);
console.log(JSON.stringify({ original_p39_ioc: ioc(C), solved_p57_ioc: ioc(solved),
  quotient_coefficients: Q.length, original_grid_division: 'zero remainder mod 29', outputs }, null, 2));
