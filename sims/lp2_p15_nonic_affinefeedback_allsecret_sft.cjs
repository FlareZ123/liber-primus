'use strict';

/**
 * Exhaust every arbitrary initial GF29 nine-state key, and every pair of
 * affine ciphertext-feedback parameters, from authentic p15-22 singleton
 * words. Original-input necessary-condition gate, Node.js 22 CommonJS.
 *
 * Run from the repository root, without network or file writes.
 * The nine-state recurrence is the original p50 table's monic nonic factor.
 * C[i] = alpha*C[i-1] + P[i] + K[i] + beta (mod29).
 *
 * The eleven source singleton positions (9 state anchors + 2 independent
 * feedback equations) determine all eleven otherwise unknown parameters
 * for each of 3^11 native A/I/O plaintext assignments. Seven remaining
 * authentic singleton words are an untouched necessary-condition holdout.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {parseLP2Words} = require('./lp2_word_pages.cjs');

const root = path.resolve(__dirname, '..');
/** @param {string} rel */
function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const parsed = parseLP2Words(read('resources/liber-primus/lp2-transcription.txt'));
/** @param {number} x */
const mod = x => (x % 29 + 29) % 29;
/** @param {number[]} row @param {number[]} values */
const dot = (row, values) => mod(row.reduce((s, x, j) => s + x * values[j], 0));
const smallWords = [24, 10, 3]; // Gematria Primus A, I, O, generous native-English set.
const n = 9;
const nonic = [1, 12, 20, 10, 5, 1, 9, 0, 15, 11];
const reciprocal = [1, 4, 0, 14, 8, 11, 22, 15, 9, 8];
assert.equal(nonic[9], 11);
assert.deepEqual(nonic.slice().reverse().map(x => mod(x * 8)), reciprocal);

assert.equal(grid.bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(grid.bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
// The monic source nonic must genuinely divide the complete 256-cell table.
const polynomial = grid.bytes.slice().reverse().map(x => x % 29);
const ascending = nonic.slice().reverse();
for (let i = polynomial.length - 1; i >= n; i--) {
  const term = polynomial[i];
  for (let j = 0; j <= n; j++)
    polynomial[i - n + j] = mod(polynomial[i - n + j] - term * ascending[j]);
}
assert.deepEqual(polynomial.slice(0, n), Array(n).fill(0));

const full = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(full.length, 12956);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.runeCount, full.length);
const start = corpus.pages.filter(p => p.page < 15)
  .reduce((s, p) => s + p.indices.length, 0) + n;
const end = corpus.pages.filter(p => p.page < 23)
  .reduce((s, p) => s + p.indices.length, 0);
const source = full.slice(start, end);
assert.equal(source.length, 1894);
const title = corpus.pages.find(p => p.page === 15).indices.slice(0, n);
assert.deepEqual(title, [0, 1, 20, 19, 24, 28, 26, 22, 24]);

const singles = [];
let absolute = 0;
for (const word of parsed.words) {
  if (word.length === 1 && absolute >= start && absolute < end)
    singles.push(absolute - start);
  absolute += word.length;
}
assert.equal(absolute, 12956);
assert.deepEqual(singles,
  [126, 171, 269, 394, 530, 536, 564, 605, 621, 746, 862, 1021,
    1087, 1139, 1182, 1641, 1707, 1724]);

/** @param {number} a */
function inverseScalar(a) {
  for (let k = 1; k < 29; k++) if (mod(k * a) === 1) return k;
  throw new Error('Noninvertible field element');
}

/** @param {number[][]} M */
function inverseMatrix(M) {
  const d = M.length;
  const a = M.map((row, i) =>
    [...row, ...Array.from({length: d}, (_, j) => +(i === j))]);
  for (let j = 0; j < d; j++) {
    let k = j;
    while (k < d && a[k][j] === 0) k++;
    assert.ok(k < d, 'First nine original singleton rows must span the source state');
    [a[k], a[j]] = [a[j], a[k]];
    const unit = inverseScalar(a[j][j]);
    for (let h = 0; h < 2 * d; h++) a[j][h] = mod(a[j][h] * unit);
    for (let i = 0; i < d; i++) if (i !== j) {
      const scale = a[i][j];
      for (let h = 0; h < 2 * d; h++)
        a[i][h] = mod(a[i][h] - scale * a[j][h]);
    }
  }
  return a.map(row => row.slice(d));
}

/**
 * GF29 recurrence for a monic degree-nine polynomial in descending order.
 * @param {number[]} characteristic
 * @param {number} length
 */
function stateRows(characteristic, length) {
  const v = Array.from({length: n}, (_, i) =>
    Array.from({length: n}, (_, j) => +(i === j)));
  for (let i = n; i < length; i++) {
    const row = Array(n).fill(0);
    for (let delay = 1; delay <= n; delay++)
      for (let j = 0; j < n; j++)
        row[j] = mod(row[j] - characteristic[delay] * v[i - delay][j]);
    v.push(row);
  }
  return v;
}

/**
 * Derive all eleven hidden variables from eleven authentic singleton cribs.
 * No original holdout symbols affect the equations or parameter selection.
 *
 * @param {number[]} cipher
 * @param {number[][]} v
 * @returns {{pair: number[],det: number,candidates: number,maximum: number,
 *   atMaximum: number,solutions: {alpha:number,beta:number,seed:number[]}[]}}
 */
function recover(cipher, v) {
  assert.equal(cipher.length, 1894);
  const invert = inverseMatrix(singles.slice(0, n).map(i => v[i]));
  const W = singles.slice(n).map(i =>
    Array.from({length: n}, (_, j) =>
      mod(v[i].reduce((s, x, k) => s + x * invert[k][j], 0))));
  const C = singles.map(i => cipher[i]);
  const D = singles.map(i => cipher[i - 1]);
  const conditions = W.map((w, t) => ({
    A: mod(C[n + t] - w.reduce((s, x, j) => s + x * C[j], 0)),
    B: mod(-D[n + t] + w.reduce((s, x, j) => s + x * D[j], 0)),
    E: mod(w.reduce((s, x) => s + x, 0) - 1)
  }));
  let pair = null;
  let det = 0;
  for (let i = 0; i < 9 && pair === null; i++)
    for (let j = i + 1; j < 9; j++) {
      const d = mod(conditions[i].B * conditions[j].E -
        conditions[j].B * conditions[i].E);
      if (d !== 0) {
        pair = [i, j];
        det = d;
        break;
      }
    }
  assert.ok(pair !== null, 'Feedback alpha,beta must be source-identifiable');
  assert.deepEqual(pair, [0, 1]);
  const invDet = inverseScalar(det);
  const solutions = [];
  let maximum = 0;
  let atMaximum = 0;
  for (let mask = 0; mask < 3 ** 11; mask++) {
    let value = mask;
    const anchor = Array(n);
    for (let i = 0; i < n; i++) {
      anchor[i] = smallWords[value % 3];
      value = Math.floor(value / 3);
    }
    const p0 = smallWords[value % 3];
    value = Math.floor(value / 3);
    const p1 = smallWords[value % 3];
    const kTerms = W.map(w => dot(w, anchor));
    const c0 = conditions[pair[0]], c1 = conditions[pair[1]];
    const rhs0 = mod(p0 - c0.A - kTerms[pair[0]]);
    const rhs1 = mod(p1 - c1.A - kTerms[pair[1]]);
    const alpha = mod((rhs0 * c1.E - rhs1 * c0.E) * invDet);
    const beta = mod((c0.B * rhs1 - c1.B * rhs0) * invDet);
    let matches = 11; // nine state anchors and the two alpha/beta equations.
    for (let t = 0; t < 9; t++) {
      if (pair.includes(t)) continue;
      const {A, B, E} = conditions[t];
      const recovered = mod(A + B * alpha + E * beta + kTerms[t]);
      if (smallWords.includes(recovered)) matches++;
    }
    if (matches > maximum) {
      maximum = matches;
      atMaximum = 1;
    } else if (matches === maximum) atMaximum++;
    if (matches === 18) {
      const observedKey = anchor.map((p, j) =>
        mod(C[j] - alpha * D[j] - beta - p));
      const seed = invert.map(row => dot(row, observedKey));
      solutions.push({alpha, beta, seed});
    }
  }
  return {
    pair: pair.map(t => singles[n + t]),
    det,
    candidates: 3 ** 11,
    maximum,
    atMaximum,
    solutions
  };
}

/**
 * Reversible planted model, with previous ciphertext initialized at last
 * original red heading rune.
 * @param {number[]} plain
 * @param {number[][]} rows
 * @param {number[]} seed
 * @param {number} alpha
 * @param {number} beta
 */
function encrypt(plain, rows, seed, alpha, beta, skipRepeat = false) {
  let previous = title[n - 1];
  let keyTime = 0;
  return plain.map(p => {
    const c = mod(alpha * previous + p + dot(rows[keyTime], seed) + beta);
    if (!skipRepeat || c !== previous) keyTime++;
    previous = c;
    return c;
  });
}

/**
 * Recover the key row time solely from *visible ciphertext* repeats.
 * In the skip-repeat model the key advances on every nonrepeat event.
 * This is a hypothesis motivated by the source's unusual repeat deficit.
 * It is not a claim that Cicada's solved p56 plaintext-F bypass did this.
 *
 * @param {number[]} cipher
 * @param {number[][]} rows
 * @returns {number[][]}
 */
function visibleSkipRows(cipher, rows) {
  let previous = title[n - 1];
  let keyTime = 0;
  return cipher.map(c => {
    const active = rows[keyTime];
    if (c !== previous) keyTime++;
    previous = c;
    return active;
  });
}

/**
 * @param {number[]} cipher
 * @param {number[][]} rows
 * @param {number[]} seed
 * @param {number} alpha
 * @param {number} beta
 */
function decrypt(cipher, rows, seed, alpha, beta) {
  let previous = title[n - 1];
  return cipher.map((c, i) => {
    const p = mod(c - alpha * previous - dot(rows[i], seed) - beta);
    previous = c;
    return p;
  });
}

const native = corpus.pages.find(p => p.page === 57).indices;
assert.equal(native.length, 95);
const seed = [4, 1, 7, 2, 9, 5, 11, 3, 6];
for (const [direction, polynomialCoefficients, directDet, directPlantDet,
  skipDet, skipPlantDet, skipBestCount, plantedRepeatCount] of [
  ['forward', nonic, 2, 20, 24, 16, 1, 74],
  ['reciprocal', reciprocal, 10, 25, 6, 24, 2, 68]
]) {
  const rawRows = stateRows(polynomialCoefficients, source.length);
  const plain = Array.from({length: source.length}, (_, i) => native[i % native.length]);
  singles.forEach((position, i) => { plain[position] = smallWords[i % 3]; });

  for (const [clock, expectedDet, plantDet, expectedBestCount] of [
    ['every', directDet, directPlantDet, 2],
    ['skip-repeat', skipDet, skipPlantDet, skipBestCount]
  ]) {
    const skip = clock === 'skip-repeat';
    const originalRows = skip ? visibleSkipRows(source, rawRows) : rawRows;
    const original = recover(source, originalRows);
    assert.equal(original.candidates, 177147);
    assert.deepEqual(original.pair, [746, 862]);
    assert.equal(original.det, expectedDet);
    assert.equal(original.maximum, 17);
    assert.equal(original.atMaximum, expectedBestCount);
    assert.equal(original.solutions.length, 0);

    const planted = encrypt(plain, rawRows, seed, 13, 24, skip);
    if (skip) {
      let prior = title[n - 1];
      const repeatCount = planted.reduce((count, c) => {
        const same = c === prior;
        prior = c;
        return count + Number(same);
      }, 0);
      assert.equal(repeatCount, plantedRepeatCount);
    }
    const plantRows = skip ? visibleSkipRows(planted, rawRows) : rawRows;
    const recovered = recover(planted, plantRows);
    assert.deepEqual(recovered.pair, [746, 862]);
    assert.equal(recovered.det, plantDet);
    assert.equal(recovered.solutions.length, 1);
    assert.equal(recovered.solutions[0].alpha, 13);
    assert.equal(recovered.solutions[0].beta, 24);
    assert.deepEqual(recovered.solutions[0].seed, seed);
    assert.deepEqual(decrypt(planted, plantRows, seed, 13, 24), plain);
    assert.deepEqual(encrypt(decrypt(planted, plantRows, seed, 13, 24),
      rawRows, seed, 13, 24, skip), planted);
    console.log(direction, clock, 'original: 177147 eleven-crib states,',
      original.solutions.length, 'solutions; maximum',
      original.maximum + '/18 on ' + original.atMaximum + ' candidates');
    console.log(direction, clock, 'independent native-GP positive: unique',
      'hidden eleven-variable key and ' + plain.length + '/' +
      plain.length + ' plaintext runes recovered');
  }
}
