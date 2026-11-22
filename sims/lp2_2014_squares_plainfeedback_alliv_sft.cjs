'use strict';
/**
 * Source-fixed original 2014 magic-square feedback: exhaust all IVs
 * compatible with every authentic LP2 one-rune word A, I or O.
 *
 * Standalone SFT, Node.js 22 CJS on Windows 11:
 * node sims/lp2_2014_squares_plainfeedback_alliv_sft.cjs
 *
 * This is a word-preserving necessary-condition test, not a claim that
 * the runic manuscript really uses plaintext words or this cipher.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseLP2Words} = require('./lp2_word_pages.cjs');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const originalSquares = fs.readFileSync(path.join(root,
  'resources', 'cicada2014-openpuff-magic-squares.txt'), 'utf8')
  .trim().split(/\r?\n\s*\r?\n/).map(block =>
    block.trim().split(/\r?\n/).map(line =>
      line.trim().split(/\s+/).map(Number)));
assert.deepEqual(originalSquares.map(M => M.length), [5, 7, 5]);
const sourceWords = parseLP2Words(fs.readFileSync(path.join(root,
  'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8'), 55);
assert.equal(sourceWords.runeCount, 12956);
assert.equal(sourceWords.words.length, 2896);
assert.equal(sourceWords.crossPageWords, 32);
const originalSingleton = [];
let wordPosition = 0;
for (const word of sourceWords.words) {
  if (word.length === 1) originalSingleton.push(wordPosition);
  wordPosition += word.length;
}
assert.equal(wordPosition, 12956);
assert.equal(originalSingleton.length, 83);
const pages = corpus.pages.filter(p => p.page <= 55);
assert.equal(pages.flatMap(p => p.indices).length, 12956);
const nativeOneRune = [24, 10, 3]; // A, I, O
const zero = n => Array(n).fill(0);
const mod = x => ((x % 29) + 29) % 29;
/** @param {number} v */
function inverseUnit(v) {
  for (let i = 1; i < 29; i++) if (mod(i * v) === 1) return i;
  throw new Error('nonunit over GF(29)');
}
/** @param {number[][]} matrix */
function inverseMatrix(matrix) {
  const n = matrix.length;
  const a = matrix.map((row, i) => [...row.map(mod),
    ...Array.from({length:n}, (_, j) => +(i === j))]);
  for (let k = 0; k < n; k++) {
    const p = a.findIndex((row, i) => i >= k && row[k] !== 0);
    assert(p >= k, 'source matrix is invertible');
    [a[k], a[p]] = [a[p], a[k]];
    const scalar = inverseUnit(a[k][k]);
    a[k] = a[k].map(v => mod(v * scalar));
    for (let i = 0; i < n; i++) {
      if (i === k) continue;
      const factor = a[i][k];
      a[i] = a[i].map((v, j) => mod(v - factor * a[k][j]));
    }
  }
  return a.map(row => row.slice(n));
}
function vector(matrix, v) {
  return matrix.map(row =>
    mod(row.reduce((sum, factor, j) => sum + factor * v[j], 0)));
}
function rank(rows, dimension) {
  const a = rows.map(row => row.map(mod));
  let p = 0;
  for (let j = 0; j < dimension; j++) {
    const k = a.findIndex((row, i) => i >= p && row[j] !== 0);
    if (k === -1) continue;
    [a[p], a[k]] = [a[k], a[p]];
    const scalar = inverseUnit(a[p][j]);
    a[p] = a[p].map(v => mod(v * scalar));
    for (let i = p + 1; i < a.length; i++) {
      const factor = a[i][j];
      a[i] = a[i].map((v, z) => mod(v - factor * a[p][z]));
    }
    p += 1;
    if (p === a.length) break;
  }
  return p;
}
/**
 * P_j = M^{-1}(C_j - P_{j-1}); the secret IV is P_{-1}.
 * @param {number[]} ciphertext
 * @param {number[][]} inverse
 * @param {number[]} initialPlain
 */
function decryptPlainFeedback(ciphertext, inverse, initialPlain) {
  const n = inverse.length;
  assert.equal(ciphertext.length % n, 0);
  let previous = initialPlain.slice();
  const result = [];
  for (let i = 0; i < ciphertext.length; i += n) {
    const current = vector(inverse, ciphertext.slice(i, i + n)
      .map((v, j) => mod(v - previous[j])));
    result.push(...current);
    previous = current;
  }
  return result;
}
/** Forward C_j = M P_j + P_{j-1}, including a nonzero secret IV. */
function encryptPlainFeedback(plaintext, matrix, initialPlain) {
  const n = matrix.length;
  assert.equal(plaintext.length % n, 0);
  let previous = initialPlain.slice();
  const result = [];
  for (let i = 0; i < plaintext.length; i += n) {
    const block = plaintext.slice(i, i + n);
    result.push(...vector(matrix, block)
      .map((v, j) => mod(v + previous[j])));
    previous = block;
  }
  return result;
}
/** The IV can alter only block zero under CBC/CFB ciphertext feedback. */
function decryptCipherFeedback(ciphertext, matrix, inverse, mode) {
  const n = matrix.length;
  let previous = zero(n);
  const result = [];
  for (let i = 0; i < ciphertext.length; i += n) {
    const block = ciphertext.slice(i, i + n);
    let next;
    if (mode === 'inner') {
      next = vector(inverse, block).map((v, j) => mod(v - previous[j]));
    } else if (mode === 'outer') {
      next = vector(inverse, block.map((v, j) => mod(v - previous[j])));
    } else {
      const mask = vector(matrix, previous);
      next = block.map((v, j) => mod(v - mask[j]));
    }
    result.push(...next);
    previous = block;
  }
  return result;
}
function ioc(data) {
  const counts = Array(29).fill(0);
  for (const v of data) counts[v] += 1;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (data.length * (data.length - 1));
}
/**
 * Exhaust 3^n singleton-value assignments to n independent equations.
 * This is exhaustive over ALL 29^n possible secret IV vectors because
 * every eligible IV has an A/I/O value at the n selected singleton sites.
 * @param {number[]} ciphertext
 * @param {number[][]} inverse
 * @param {number[]} singletonPositions
 */
function solveIV(ciphertext, inverse, singletonPositions) {
  const n = inverse.length;
  const baseline = decryptPlainFeedback(ciphertext, inverse, zero(n));
  const response = Array.from({length:n}, (_, j) => {
    const iv = zero(n);
    iv[j] = 1;
    return decryptPlainFeedback(ciphertext, inverse, iv)
      .map((v, i) => mod(v - baseline[i]));
  });
  const rows = singletonPositions.map(pos =>
    Array.from({length:n}, (_, j) => response[j][pos]));
  const selectedRows = [];
  const selected = [];
  for (let i = 0; i < rows.length; i++) {
    if (rank([...selectedRows, rows[i]], n) > selectedRows.length) {
      selectedRows.push(rows[i]);
      selected.push(i);
    }
    if (selected.length === n) break;
  }
  const dimension = selected.length;
  if (dimension < n) return {dimension, candidates: null,
    baseline, checked:0, maxIoC:null};
  const equationInverse = inverseMatrix(selectedRows);
  const candidates = [];
  for (let i = 0; i < 3 ** n; i++) {
    let choice = i;
    const target = [];
    for (let j = 0; j < n; j++) {
      const point = singletonPositions[selected[j]];
      target.push(mod(nativeOneRune[choice % 3] - baseline[point]));
      choice = Math.floor(choice / 3);
    }
    const key = vector(equationInverse, target);
    const valid = rows.every((coefficients, j) =>
      nativeOneRune.includes(mod(baseline[singletonPositions[j]] +
        coefficients.reduce((sum, v, k) => sum + v * key[k], 0))));
    if (valid) candidates.push(key);
  }
  const top = candidates.map(iv =>
    ioc(decryptPlainFeedback(ciphertext, inverse, iv)));
  return {dimension, candidates, checked:3 ** n,
    maxIoC:top.length ? Math.max(...top) : null};
}
const control = corpus.pages.find(p => p.page === 57).indices;
assert.equal(control.length, 95);
assert(ioc(control) > 0.06);
const studies = [
  {matrix:0, pages:[3,7], n:1145, singletons:8, survivors:0},
  {matrix:0, pages:[33,39], n:1680, singletons:9, survivors:0},
  {matrix:2, pages:[3,7], n:1145, singletons:8, survivors:0},
  {matrix:2, pages:[33,39], n:1680, singletons:9, survivors:0},
  {matrix:1, pages:[8,14], n:1729, singletons:11, survivors:0},
  {matrix:1, pages:[33,39], n:1680, singletons:9, survivors:16}
];
for (const study of studies) {
  const [first,last] = study.pages;
  const matrix = originalSquares[study.matrix].map(r => r.map(mod));
  assert(matrix.every(row => row.length === matrix.length));
  const inverse = inverseMatrix(matrix);
  const n = matrix.length;
  const start = pages.filter(p => p.page < first)
    .reduce((s, p) => s + p.indices.length, 0);
  const ciphertext = pages.filter(p =>
    p.page >= first && p.page <= last).flatMap(p => p.indices);
  assert.equal(ciphertext.length, study.n);
  assert.equal(ciphertext.length % n, 0);
  const singletons = originalSingleton.filter(p =>
    p >= start && p < start + ciphertext.length).map(p => p - start);
  assert.equal(singletons.length, study.singletons);
  const result = solveIV(ciphertext, inverse, singletons);
  assert.equal(result.dimension, n);
  assert.equal(result.checked, 3 ** n);
  assert.equal(result.candidates.length, study.survivors);
  if (study.matrix === 1 && first === 33) {
    assert(Math.abs(result.maxIoC - 0.03510096712895998) < 1e-12);
  }
  // Every ordinary CBC/CFB IV changes only its first n output runes;
  // later one-rune words are independent of all secret IV choices.
  const witnesses = ['inner','outer','cfb'].map(mode => {
    const decoded = decryptCipherFeedback(ciphertext, matrix, inverse, mode);
    const point = singletons.find(pos =>
      pos >= n && !nativeOneRune.includes(decoded[pos]));
    assert(point !== undefined);
    return mode + '=' + point + ':' + corpus.translit[decoded[point]];
  });
  // Genuine positive: encrypt a native GP word stream with a secret,
  // nonzero source-derived IV. Place A/I/O at source-original singleton
  // sites to ensure it satisfies the same word-boundary contract.
  const native = Array.from({length:ciphertext.length},
    (_, i) => control[i % control.length]);
  singletons.forEach((point, i) => {
    native[point] = nativeOneRune[i % nativeOneRune.length];
  });
  const secret = matrix[0].slice();
  const plant = encryptPlainFeedback(native, matrix, secret);
  assert.deepEqual(decryptPlainFeedback(plant, inverse, secret), native);
  const plantKeys = solveIV(plant, inverse, singletons);
  assert(plantKeys.candidates.some(candidate =>
    candidate.every((v, i) => v === secret[i])));
  console.log('matrix ' + study.matrix + ', p' + first + '–' + last +
    ': ' + ciphertext.length + ' original runes, ' + singletons.length +
    ' original singletons, rank ' + result.dimension +
    ', ' + result.checked + ' source-compatible IV assignments, ' +
    result.candidates.length + ' survivors, best survivor IoC ' +
    (result.maxIoC === null ? 'none' : result.maxIoC.toFixed(12)) +
    ', IV-independent CBC/CFB contradictions ' + witnesses.join(', ') +
    ', genuine secret-IV plant recovered');
}
console.log('PASS all original-source secret-IV necessary-condition tests');
