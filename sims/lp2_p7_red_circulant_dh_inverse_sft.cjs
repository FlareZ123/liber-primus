'use strict';

/**
 * p7 original red word products, GF29 5x5 circulant inverse, and one p8 receiver.
 *
 * This is a source-selected candidate operation, not a proof that the
 * manuscript authors intended a Hill cipher.
 *
 * Run: node sims/lp2_p7_red_circulant_dh_inverse_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {number} x @returns {number} */
function mod29(x) {
  return ((x % 29) + 29) % 29;
}

/** @param {number} x @param {number} e @param {number} modulus @returns {number} */
function power(x, e, modulus) {
  let base = ((x % modulus) + modulus) % modulus;
  let result = 1;
  for (let exponent = e; exponent > 0; exponent = Math.floor(exponent / 2)) {
    if (exponent % 2) result = (result * base) % modulus;
    base = (base * base) % modulus;
  }
  return result;
}

/**
 * @param {number[][]} matrix
 * @returns {{inverse:number[][]|null,determinant:number}}
 */
function inverseGF29(matrix) {
  const n = matrix.length;
  const rows = matrix.map((row, i) =>
    row.map(mod29).concat(Array.from({ length: n }, (_, j) => Number(i === j))));
  let determinant = 1;
  for (let col = 0; col < n; col++) {
    const pivot = rows.findIndex((row, r) => r >= col && row[col] !== 0);
    if (pivot === -1) return { inverse: null, determinant: 0 };
    if (pivot !== col) {
      [rows[pivot], rows[col]] = [rows[col], rows[pivot]];
      determinant = mod29(-determinant);
    }
    const lead = rows[col][col];
    determinant = mod29(determinant * lead);
    const scale = power(lead, 27, 29);
    for (let j = 0; j < 2 * n; j++) rows[col][j] = mod29(rows[col][j] * scale);
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = rows[r][col];
      for (let j = 0; j < 2 * n; j++) {
        rows[r][j] = mod29(rows[r][j] - factor * rows[col][j]);
      }
    }
  }
  return { inverse: rows.map((row) => row.slice(n)), determinant };
}

/**
 * @param {number[][]} matrix
 * @param {number[]} body
 * @returns {number[]}
 */
function transformBlocks(matrix, body) {
  assert.equal(body.length % matrix.length, 0, 'whole blocks required');
  const out = [];
  for (let offset = 0; offset < body.length; offset += matrix.length) {
    for (const row of matrix) {
      out.push(mod29(row.reduce((total, value, i) =>
        total + value * body[offset + i], 0)));
    }
  }
  return out;
}

/** @param {number[]} symbols @returns {number} */
function indexOfCoincidence(symbols) {
  const counts = new Int32Array(29);
  for (const x of symbols) counts[x]++;
  return counts.reduce((total, x) => total + x * (x - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/** @returns {void} */
function main() {
  const root = path.join(__dirname, '..', 'resources', 'liber-primus');
  const source = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
  const pageText = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8')
    .split(/\n%\s*\n/);
  const index = new Map(source.runes.map((rune, i) => [rune, i]));
  const page7 = pageText[7];
  /** @type {{start:number,runic:number[]}[]} */
  const words = [];
  let runic = [];
  let offset = 0;
  let start = 0;
  for (const glyph of page7) {
    if (index.has(glyph)) {
      if (runic.length === 0) start = offset;
      runic.push(index.get(glyph));
      offset++;
    } else if (glyph === '-' || glyph === '.' || glyph === ' ') {
      if (runic.length) words.push({ start, runic });
      runic = [];
    }
  }
  if (runic.length) words.push({ start, runic });
  assert.equal(offset, 208);

  const red = words.filter((w) => w.start >= 194 && w.start < 208);
  assert.deepEqual(red.map((w) => w.runic), [
    [23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]
  ]);
  const products = red.map((w) => w.runic.reduce((product, rune) =>
    mod29(product * rune), 1));
  assert.deepEqual(products, [11, 26, 8, 15, 2]);

  // The five red words, in printed order, are the first row of this
  // right-rotating GF29 circulant (one natural, source-selected convention).
  const circulant = Array.from({ length: 5 }, (_, i) =>
    Array.from({ length: 5 }, (_, k) => products[(k - i + 5) % 5]));
  const { inverse, determinant } = inverseGF29(circulant);
  assert.equal(determinant, 19);
  assert.ok(inverse, 'actual source matrix must be nonsingular');
  assert.deepEqual(inverse[0], [23, 2, 5, 2, 19]);
  for (let i = 0; i < 5; i++) {
    for (let k = 0; k < 5; k++) {
      let cell = 0;
      for (let h = 0; h < 5; h++) cell += circulant[i][h] * inverse[h][k];
      assert.equal(mod29(cell), Number(i === k));
    }
  }

  // The cross-round DH teaching tuple, independent of this inverse.
  const dh = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 };
  assert.equal(power(dh.g, dh.a, dh.p), dh.A);
  assert.equal(power(dh.g, dh.b, dh.p), dh.B);
  assert.equal(power(dh.B, dh.a, dh.p), dh.K);
  assert.deepEqual(inverse[0], [dh.p, dh.K, dh.g, dh.K, dh.B]);

  // Conditional specificity, NOT a historical-probability calculation.
  // Hold the signed DH teaching field p=23 and base g=5 fixed, enumerate
  // all 22*22 nonzero private-exponent pairs, and construct the same five
  // reciprocal DH-state operands without seeing manuscript ciphertext.
  let invertibleDhTuples = 0;
  /** @type {number[][]} */
  const inverseIdentityMatches = [];
  for (let a = 1; a <= 22; a++) {
    for (let b = 1; b <= 22; b++) {
      const A = power(dh.g, a, dh.p);
      const B = power(dh.g, b, dh.p);
      const K = power(B, a, dh.p);
      const state = [
        power(A, 27, 29), power(B, 27, 29), A,
        power(K, 27, 29), K
      ];
      const key = Array.from({ length: 5 }, (_, i) =>
        Array.from({ length: 5 }, (_, k) => state[(k - i + 5) % 5]));
      const trial = inverseGF29(key);
      if (!trial.inverse) continue;
      invertibleDhTuples++;
      if (trial.inverse[0].every((value, i) =>
        value === [dh.p, K, dh.g, K, B][i])) {
        inverseIdentityMatches.push([a, b]);
      }
    }
  }
  assert.equal(invertibleDhTuples, 456);
  assert.deepEqual(inverseIdentityMatches, [[6, 15]]);

  // The immediately following p8 is exactly 255 = 51*5 source runes.
  // Test the unmodified complete original page with no fitting.
  const original = source.pages[8].indices;
  assert.equal(original.length, 255);
  const decoded = transformBlocks(inverse, original);
  assert.deepEqual(transformBlocks(circulant, decoded), original);

  // Native p57's clear runes are 95 = 19*5. This is a positive
  // forward/reverse control for native-GP plaintext and exactly the same key.
  const known = source.pages[57].indices;
  assert.equal(known.length, 95);
  const planted = transformBlocks(circulant, known);
  assert.deepEqual(transformBlocks(inverse, planted), known);

  // The reverse circulant convention is a single source-natural orientation
  // alternative. Neither is a readable ordinary-GP p8 cipher inverse.
  const transpose = inverse.map((row, i) => row.map((_, k) => inverse[k][i]));
  const reversed = transformBlocks(transpose, original);
  const flat = (values) => values.map((i) => source.translit[i]).join('-');

  console.log('p7 five-word GF29 circulant source packet: PASS');
  console.log('Original p7 red products: ' + products.join(','));
  console.log('Circulant determinant mod29: ' + determinant);
  console.log('Inverted first row: ' + inverse[0].join(','));
  console.log('Authenticated DH23 pattern: [p,K,g,K,B] = ' +
    [dh.p, dh.K, dh.g, dh.K, dh.B].join(','));
  console.log('DH23 exponent-pair conditional census: ' +
    invertibleDhTuples + '/484 nonsingular; inverse identity only at a=6,b=15.');
  console.log('p8 original 255-runic IoC: ' + indexOfCoincidence(original).toFixed(8));
  console.log('p8 standard-circulant inverse IoC: ' +
    indexOfCoincidence(decoded).toFixed(8));
  console.log('p8 transposed-circulant inverse IoC: ' +
    indexOfCoincidence(reversed).toFixed(8));
  console.log('p57 native-GP positive control IoC: ' +
    indexOfCoincidence(known).toFixed(8));
  console.log('p8 standard inverse first 30 rune values: ' +
    flat(decoded.slice(0, 30)));
  console.log('p8 transposed inverse first 30 rune values: ' +
    flat(reversed.slice(0, 30)));
  console.log('Exact p8 forward replay: 255/255; p57 plant replay: 95/95.');
  console.log('Conclusion: exact DH-circulant identity, but no p8 plaintext recovery.');
}

main();
