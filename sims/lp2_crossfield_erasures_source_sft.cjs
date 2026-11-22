'use strict';

/** Original-source cross-field erasure decoder for GP29 p29 and base60 p50. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} name @returns {any} */
function load(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources',
    'liber-primus', name), 'utf8'));
}
/** @param {number} x @param {number} m @returns {number} */
const mod = (x, m) => ((x % m) + m) % m;
/** @param {number} x @param {number} m @returns {number} */
function inv(x, m) {
  for (let a = 1; a < m; a++) if (mod(x * a, m) === 1) return a;
  throw new Error('Nonunit pivot ' + x + ' modulo ' + m);
}
/** @param {number[]} a @param {number} x @param {number} m @returns {number} */
function at(a, x, m) {
  let y = 0;
  for (const v of a) y = mod(y * x + v, m);
  return y;
}
/** @param {number[]} a @param {number} x @param {number} m @returns {number} */
function derivative(a, x, m) {
  let y = 0;
  for (let j = 0; j < a.length - 1; j++) {
    y = mod(y * x + (a.length - 1 - j) * a[j], m);
  }
  return y;
}
/**
 * Remainder of descending polynomial a by ascending quadratic coefficients d.
 * Returns constant coefficient, then linear coefficient.
 * @param {number[]} a @param {number[]} d @param {number} m @returns {number[]}
 */
function rem(a, d, m) {
  const v = a.map(x => mod(x, m));
  const inverseLead = inv(d[2], m);
  for (let i = 0; i < v.length - 2; i++) {
    const scale = v[i] * inverseLead % m;
    for (let k = 0; k < 3; k++) {
      v[i + k] = mod(v[i + k] - scale * d[2 - k], m);
    }
  }
  return [v[v.length - 1], v[v.length - 2]];
}
/**
 * Solve 4x4 linear system over Z/(29*29) using unit pivots.
 * @param {number[][]} a @param {number[]} rhs @returns {number[]}
 */
function solve(a, rhs) {
  const m = 841, n = 4;
  const rows = a.map((r, i) => [...r.map(x => mod(x, m)), mod(rhs[i], m)]);
  for (let i = 0; i < n; i++) {
    const k = rows.findIndex((r, j) => j >= i && r[i] % 29 !== 0);
    assert.ok(k >= i);
    [rows[i], rows[k]] = [rows[k], rows[i]];
    const pivot = inv(rows[i][i], m);
    for (let j = i; j <= n; j++) rows[i][j] = rows[i][j] * pivot % m;
    for (let k2 = 0; k2 < n; k2++) {
      if (k2 === i) continue;
      const f = rows[k2][i];
      for (let j = i; j <= n; j++) rows[k2][j] =
        mod(rows[k2][j] - f * rows[i][j], m);
    }
  }
  return rows.map(r => r[n]);
}

const corpus = load('lp2-corpus.json');
const originalP29 = corpus.pages[29].indices;
const originalP50 = load('lp2-grid-256.json').bytes;
const H = [3, 26, 24], G = [27, 5, 15];
assert.equal(originalP29.length, 277);
assert.equal(originalP50.length, 256);
assert.equal(corpus.pages[32].indices.length, 121);
assert.equal(corpus.pages[23].indices.length, 213);
assert.equal(at([...G].reverse(), 24, 29), 0);
assert.equal(derivative([...G].reverse(), 24, 29), 0);

// Erase the last 3 original p29 cipher glyphs.
// G has repeated root 24 in GF29, giving 2 linear constraints.
const p29Prefix = originalP29.slice(0, 274);
const blank29 = [...p29Prefix, 0, 0, 0];
const baseValue = at(blank29, 24, 29);
const baseSlope = derivative(blank29, 24, 29);
const possible29 = [];
for (let a = 0; a < 29; a++) {
  const b = mod(-baseSlope - 2 * 24 * a, 29);
  const c = mod(-baseValue - a * 24 * 24 - 24 * b, 29);
  const full = [...p29Prefix, a, b, c];
  assert.deepEqual(rem(full, G, 29), [0, 0]);
  possible29.push({tail: [a, b, c], root121: at(full, 121, 257)});
}
assert.equal(possible29.length, 29);
const recovered29 = possible29.filter(r => r.root121 === 0);
assert.deepEqual(recovered29.map(r => r.tail), [[6, 8, 19]]);
// Open the erased source suffix only after the independent reconstruction.
assert.deepEqual(recovered29[0].tail, originalP29.slice(274));

// Erase last 5 original table bytes. Mod841 H/G carries give 4 equations.
// Original DH-source fields A=8,g=5,b=15,K=2 are in printed high-first
// remainder order H=[A,g],G=[b,K], so low-first carry is [g,A,K,b].
const p50Prefix = originalP50.slice(0, 251);
const blank50 = [...p50Prefix, 0, 0, 0, 0, 0];
const target = [29 * 5, 29 * 8, 29 * 2, 29 * 15];
/** @param {number[]} a @returns {number[]} */
const syndrome = a => [...rem(a, H, 841), ...rem(a, G, 841)];
const base = syndrome(blank50);
const columns = Array.from({length: 5}, (_, i) => {
  const e = Array(256).fill(0);
  e[251 + i] = 1;
  return syndrome(e);
});
const matrix = Array.from({length: 4}, (_, row) =>
  Array.from({length: 4}, (_, col) => columns[col + 1][row]));
const possible50 = [];
for (let first = 0; first < 256; first++) {
  const rhs = target.map((v, row) =>
    mod(v - base[row] - first * columns[0][row], 841));
  const lastFour = solve(matrix, rhs);
  if (lastFour.some(x => x >= 256)) continue;
  const tail = [first, ...lastFour];
  const full = [...p50Prefix, ...tail];
  assert.deepEqual(syndrome(full), target);
  possible50.push({tail, root213: at(full, 213, 257)});
}
assert.deepEqual(possible50, [
  {tail: [30, 177, 46, 71, 35], root213: 128},
  {tail: [230, 180, 36, 189, 80], root213: 0}
]);
const recovered50 = possible50.filter(r => r.root213 === 0);
assert.equal(recovered50.length, 1);
assert.deepEqual(recovered50[0].tail, originalP50.slice(251));

// Complete root checks prevent accidental lookup/clock ambiguity.
const roots = a => Array.from({length: 257}, (_, x) => x)
  .filter(x => at(a, x, 257) === 0);
assert.deepEqual(roots(originalP29), [121]);
assert.deepEqual(roots(originalP50), [213]);

console.log(JSON.stringify({
  verdict: 'PASS',
  caveat: 'Original visible ciphertext/byte reconstruction; no new plaintext',
  p29: {erased: 3, GOnlyCandidates: 29, root121Candidates: 1,
    recovered: recovered29[0].tail,
    gp: recovered29[0].tail.map(x => corpus.translit[x])},
  p50: {erased: 5, mod841ByteAdmissible: possible50,
    root213Candidates: 1, recovered: recovered50[0].tail}
}, null, 2));
