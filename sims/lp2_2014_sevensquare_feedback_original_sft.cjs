'use strict';
/**
 * Reversible original-2014 seven-square feedback test on complete LP2 chapters.
 *
 * Node.js 22 CommonJS SFT. Run from any Windows 11 working directory:
 * node sims/lp2_2014_sevensquare_feedback_original_sft.cjs
 *
 * The original 7x7 1033-sum square is from the genuine 2014 OpenPuff
 * recovered artifact. Models below use no learned key, plaintext crib,
 * phase adjustment or language-fitted parameters.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const source = fs.readFileSync(
  path.join(root, 'resources', 'cicada2014-openpuff-magic-squares.txt'), 'utf8');
const blocks = source.trim().split(/\r?\n\s*\r?\n/).map(section =>
  section.trim().split(/\r?\n/).map(line =>
    line.trim().split(/\s+/).map(Number)));
assert.deepEqual(blocks.map(matrix => matrix.length), [5, 7, 5]);
const square = blocks[1];
assert(square.every(row => row.length === 7 &&
  row.reduce((s, x) => s + x, 0) === 1033));
const mod = n => ((n % 29) + 29) % 29;
const matrix = square.map(row => row.map(mod));
const dimension = 7;
const zero = Array(dimension).fill(0);
const identity = Array.from({length: dimension}, (_, i) =>
  Array.from({length: dimension}, (_, j) => +(i === j)));
const invScalar = x => {
  const inverse = Array.from({length: 28}, (_, i) => i + 1)
    .find(v => mod(v * x) === 1);
  assert(inverse !== undefined);
  return inverse;
};
function inverseMatrix(M) {
  const n = M.length;
  const a = M.map((r, i) => [...r, ...identity[i]]);
  for (let j = 0; j < n; j += 1) {
    const pivot = a.findIndex((r, i) => i >= j && r[j] !== 0);
    assert(pivot >= j, 'Source square must be invertible modulo 29');
    [a[j], a[pivot]] = [a[pivot], a[j]];
    const v = invScalar(a[j][j]);
    a[j] = a[j].map(x => mod(x * v));
    for (let i = 0; i < n; i += 1) {
      if (i === j) continue;
      const coeff = a[i][j];
      a[i] = a[i].map((x, k) => mod(x - coeff * a[j][k]));
    }
  }
  return a.map(r => r.slice(n));
}
const inverse = inverseMatrix(matrix);
const vector = (M, v) => M.map(row =>
  mod(row.reduce((s, c, i) => s + c * v[i], 0)));
const add = (a, b) => a.map((x, i) => mod(x + b[i]));
const sub = (a, b) => a.map((x, i) => mod(x - b[i]));
for (let i = 0; i < dimension; i += 1) {
  assert.deepEqual(vector(matrix, inverse.map(row => row[i])),
    identity.map(row => row[i]));
}
const modes = ['cbc-inner', 'cbc-outer', 'ciphertext-feedback', 'plaintext-feedback'];
/**
 * @param {number[]} input - GP29 source blocks
 * @param {string} mode - one source matrix feedback convention
 * @param {boolean} encode - true encrypts; false decrypts
 * @returns {number[]}
 */
function transfer(input, mode, encode) {
  assert(input.length % 7 === 0);
  assert(modes.includes(mode));
  let precedingCipher = zero;
  let precedingPlain = zero;
  const result = [];
  for (let i = 0; i < input.length; i += 7) {
    const block = input.slice(i, i + 7);
    let plaintext;
    let ciphertext;
    if (encode) {
      plaintext = block;
      switch (mode) {
        case 'cbc-inner':
          ciphertext = vector(matrix, add(plaintext, precedingCipher));
          break;
        case 'cbc-outer':
          ciphertext = add(vector(matrix, plaintext), precedingCipher);
          break;
        case 'ciphertext-feedback':
          ciphertext = add(plaintext, vector(matrix, precedingCipher));
          break;
        case 'plaintext-feedback':
          ciphertext = add(vector(matrix, plaintext), precedingPlain);
          break;
      }
    } else {
      ciphertext = block;
      switch (mode) {
        case 'cbc-inner':
          plaintext = sub(vector(inverse, ciphertext), precedingCipher);
          break;
        case 'cbc-outer':
          plaintext = vector(inverse, sub(ciphertext, precedingCipher));
          break;
        case 'ciphertext-feedback':
          plaintext = sub(ciphertext, vector(matrix, precedingCipher));
          break;
        case 'plaintext-feedback':
          plaintext = vector(inverse, sub(ciphertext, precedingPlain));
          break;
      }
    }
    result.push(...(encode ? ciphertext : plaintext));
    precedingCipher = ciphertext;
    precedingPlain = plaintext;
  }
  return result;
}
/** @param {number[]} runes */
function ioc(runes) {
  const h = Array(29).fill(0);
  for (const v of runes) {
    assert(Number.isInteger(v) && v >= 0 && v < 29);
    h[v] += 1;
  }
  const n = runes.length;
  return h.reduce((s, c) => s + c * (c - 1), 0) / (n * (n - 1));
}
const p57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(p57.length, 95);
const control = p57.slice(0, 91);
assert.equal(control.length % 7, 0);
assert(ioc(control) > 0.05, 'Authentic clear-GP control');
const sections = [
  {label:'p8-p14 tree', start:8, end:14, length:1729,
    expected:[0.03428443,0.03453211,0.03452609,0.03461244]},
  {label:'p33-p39 numbered', start:33, end:39, length:1680,
    expected:[0.03466633,0.03430401,0.03477268,0.03435364]},
  {label:'p54-p55 terminal', start:54, end:55, length:308,
    expected:[0.03489995,0.03464614,0.03458268,0.03358856]}
];
let experiments = 0;
for (const section of sections) {
  const ciphertext = corpus.pages.filter(p =>
    p.page >= section.start && p.page <= section.end)
    .flatMap(p => p.indices);
  assert.equal(ciphertext.length, section.length);
  assert.equal(ciphertext.length % 7, 0);
  for (const [j, mode] of modes.entries()) {
    const plaintext = transfer(ciphertext, mode, false);
    assert.deepEqual(transfer(plaintext, mode, true), ciphertext,
      'Forward replay of unmodified original source');
    const naturalCipher = transfer(control, mode, true);
    assert.deepEqual(transfer(naturalCipher, mode, false), control,
      'Genuine p57 plaintext-positive control');
    const measured = ioc(plaintext);
    assert(Math.abs(measured - section.expected[j]) < 0.00000001,
      'Pinned original output regression');
    console.log(section.label + ', ' + mode +
      ': original ' + ciphertext.length +
      ', GP29 IoC ' + measured.toFixed(10) +
      ', p57-positive ' + control.length + '/' + control.length +
      ', initial tokens ' + plaintext.slice(0, 14)
        .map(index => corpus.translit[index]).join(' '));
    experiments += 1;
  }
}
console.log('PASS ' + experiments +
  ' complete original-source, exactly reversible, key-free block-feedback tests');
