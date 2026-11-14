'use strict';
/**
 * Original-source Q252 × p15 Hill-4 test.
 * Node.js 22, CommonJS, built-ins only. Run from repository root:
 * node sims/lp2_q252_p15_hill4_source_sft.cjs
 *
 * Source-locked operation: divide the 256 table residues by the product
 * of the 2013 signed BASE29 example (H) and p39 original red triad (G),
 * then apply the visible p15 4x4 numeral matrix as an ordinary Hill cipher.
 * This tests only direct, zero-phase blockwise matrix multiplication.
 * No original LP2 unknown plaintext, key, or destination is claimed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
assert.equal(grid.bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(grid.bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const mod = n => ((n % 29) + 29) % 29;
/** @param {number} x */
function inv(x) {
  for (let i = 1; i < 29; i++) if (mod(x * i) === 1) return i;
  throw Error('singular residue');
}
// Ascending coefficients H and G are independent original-source inputs.
const H = [3, 26, 24], G = [27, 5, 15];
/** @param {number[]} a @param {number[]} b */
function product(a, b) {
  const p = Array(a.length + b.length - 1).fill(0);
  a.forEach((x, i) => b.forEach((y, j) => {p[i + j] = mod(p[i + j] + x * y);}));
  return p;
}
const factor = product(H, G).reverse();
assert.deepEqual(factor, [12, 17, 11, 21, 23]);
const residue = grid.bytes.map(mod);
const quotient = [];
for (let i = 0; i < 252; i++) {
  const v = mod(residue[i] * inv(factor[0]));
  quotient.push(v);
  for (let j = 0; j < factor.length; j++)
    residue[i + j] = mod(residue[i + j] - v * factor[j]);
}
assert.deepEqual(residue.slice(-4), [0, 0, 0, 0]);
assert.equal(quotient.length, 252);
assert.deepEqual(quotient.slice(0, 18),
  [0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21,7,21]);

// Original p15 printed 4x4 decimal grid, row-major, with red 3299 center.
// Independent Fibonacci/prime reconstruction selects precisely the two signs.
const printed = [
  [3258,3222,3152,3038],
  [3278,3299,3298,2838],
  [3288,3294,3296,2472],
  [4516,1206,708,1820]
];
const signedNums = printed.map(row => row.slice());
signedNums[3][0] = -signedNums[3][0];
signedNums[3][1] = -signedNums[3][1];
const toMatrix = rows => rows.map(row => row.map(mod));
const transpose = matrix => matrix[0].map((_, c) => matrix.map(row => row[c]));
/** @param {number[][]} original */
function invertMatrix(original) {
  const augmented = original.map((row, i) =>
    row.concat(Array.from({length: 4}, (_, j) => Number(i === j))));
  for (let i = 0; i < 4; i++) {
    let pivot = i;
    while (pivot < 4 && augmented[pivot][i] === 0) pivot++;
    assert(pivot < 4, 'singular source matrix');
    [augmented[i], augmented[pivot]] = [augmented[pivot], augmented[i]];
    const scale = inv(augmented[i][i]);
    augmented[i] = augmented[i].map(x => mod(x * scale));
    for (let j = 0; j < 4; j++) {
      if (j === i) continue;
      const multiple = augmented[j][i];
      augmented[j] = augmented[j].map((x, k) => mod(x - multiple * augmented[i][k]));
    }
  }
  return augmented.map(row => row.slice(4));
}
/** @param {number[][]} matrix @param {number[]} data */
function apply(matrix, data) {
  assert.equal(data.length % 4, 0);
  const output = [];
  for (let i = 0; i < data.length; i += 4)
    for (let row = 0; row < 4; row++)
      output.push(mod(matrix[row].reduce((sum, x, col) => sum + x * data[i + col], 0)));
  return output;
}
/** @param {number[]} a */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((sum, x) => sum + x * (x - 1), 0) / (a.length * (a.length - 1));
}
assert(Math.abs(ioc(quotient) - 0.036330867008157845) < 1e-13);
assert.equal(gp.pages[57].indices.length, 95);
const native = gp.pages[57].indices.slice(0, 92);
assert(Math.abs(ioc(gp.pages[57].indices) - 0.06270996640537514) < 1e-13);
// Frozen original source output values independent of any language fitting.
const fixed = [
  0.034876367545690255, 0.03376968317207361,
  0.034591791563903115, 0.03560361727692405,
  0.033200531208499334, 0.03427559602858408,
  0.03282109656611649, 0.034591791563903115
];
const results = [];
for (const [source, original] of [['signed', toMatrix(signedNums)], ['printed', toMatrix(printed)]]) {
  for (const [orientation, matrix] of [['column', original], ['row', transpose(original)]]) {
    const inverse = invertMatrix(matrix);
    assert.deepEqual(apply(inverse, apply(matrix, native)), native);
    assert.deepEqual(apply(matrix, apply(inverse, native)), native);
    for (const [operator, key] of [['matrix', matrix], ['inverse', inverse]]) {
      const recovered = apply(key, quotient);
      const score = ioc(recovered);
      assert(Math.abs(score - fixed[results.length]) < 1e-13);
      results.push({source, orientation, operator, ioc: score,
        first24: recovered.slice(0, 24).map(i => gp.translit[i]).join('')});
    }
  }
}
assert.equal(results.length, 8);

// Source-native language controls: every sliding 252-rune window is evaluated.
const tokenMap = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} source @returns {number[]} */
function encodeGP(source) {
  const encoded = [];
  for (let word of source.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) {encoded.push(21); i += 3; continue;}
      if (word.startsWith('IO', i)) {encoded.push(27); i += 2; continue;}
      const match = tokenMap.find(x => word.startsWith(x.s, i));
      assert(match);
      encoded.push(match.i);
      i += match.s.length;
    }
  }
  return encoded;
}
/** @param {number[]} data @param {number} cutoff */
function windowEnvelope(data, cutoff) {
  const width = 252, n = data.length - width + 1;
  assert(n > 0);
  const counts = Array(29).fill(0);
  for (let i = 0; i < width; i++) counts[data[i]]++;
  let sum = counts.reduce((v, c) => v + c * (c - 1), 0);
  let minimum = Infinity, below = 0;
  for (let i = 0; i < n; i++) {
    minimum = Math.min(minimum, sum);
    if (sum / (width * (width - 1)) <= cutoff + 1e-13) below++;
    if (i < n - 1) {
      const previous = data[i], next = data[i + width];
      if (previous !== next) {
        sum -= 2 * (counts[previous] - 1); counts[previous]--;
        sum += 2 * counts[next]; counts[next]++;
      }
    }
  }
  return {windows: n, minimumIoC: minimum / (width * (width - 1)), windowsAtOrBelow: below};
}
const cutoff = Math.max(...results.map(x => x.ioc));
const controls = [];
for (const p of [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt'
]) {
  const a = encodeGP(read(p)), test = windowEnvelope(a, cutoff);
  controls.push({source: p, runes: a.length, ...test});
}
assert.deepEqual(controls.map(x => x.runes), [217106, 62492, 321327]);
assert.deepEqual(controls.map(x => x.windows), [216855, 62241, 321076]);
assert(controls.every(x => x.windowsAtOrBelow === 0));
const controlMins = [0.047966862707898565, 0.05090748118636565, 0.049642699045089486];
controls.forEach((x, i) => assert(Math.abs(x.minimumIoC - controlMins[i]) < 1e-13));
console.log(JSON.stringify({
  verdict: 'all eight source-only Hill-4 consumers fail native GP plaintext controls',
  source: {byteCount: grid.bytes.length, quotientCount: quotient.length,
    quotientIoC: ioc(quotient), solvedP57IoC: ioc(gp.pages[57].indices)},
  results, cutoff, controls, novelPlaintextRunes: 0
}, null, 2));
