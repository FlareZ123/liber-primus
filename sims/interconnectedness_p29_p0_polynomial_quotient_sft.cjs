'use strict';
/* Source-fixed p29/p0 polynomial quotient, additive-key, and Hill4 tests. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const readJson = name => JSON.parse(fs.readFileSync(path.join(__dirname, '..', name), 'utf8'));
const readText = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const emerson = readText('resources/control/emerson_essays_2944.txt');
const gibran = readText('resources/control/gibran_prophet_58585.txt');
const mod = x => ((x % 29) + 29) % 29;
function inv(x) {
  for (let i = 1; i < 29; i++) if (mod(i * x) === 1) return i;
  throw new RangeError('Noninvertible GF(29) element: ' + x);
}
function trim(a) {
  const i = a.findIndex(x => mod(x) !== 0);
  return i < 0 ? [0] : a.slice(i).map(mod);
}
function divide(source, factor) {
  const a = trim(source), b = trim(factor), r = a.slice(), q = [];
  const unit = inv(b[0]);
  for (let i = 0; i <= a.length - b.length; i++) {
    const v = mod(r[i] * unit);
    q.push(v);
    for (let j = 0; j < b.length; j++) r[i + j] = mod(r[i + j] - v * b[j]);
  }
  return { quotient: q, remainder: trim(r.slice(a.length - b.length + 1)) };
}
function ioc(a) {
  const f = Array(29).fill(0);
  for (const x of a) f[x]++;
  return f.reduce((s, x) => s + x * (x - 1), 0) / (a.length * (a.length - 1));
}
function gpEncode(text) {
  const tokens = new Map(corpus.translit.map((x, i) => [x, i]));
  const out = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, 'CW').replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S');
    for (let i = 0; i < word.length;) {
      const pair = word.slice(i, i + 2);
      if (tokens.has(pair)) { out.push(tokens.get(pair)); i += 2; }
      else { if (tokens.has(word[i])) out.push(tokens.get(word[i])); i++; }
    }
  }
  return out;
}
function makeScore(training) {
  const counts = new Float64Array(29 ** 3);
  for (let i = 2; i < training.length; i++) counts[841 * training[i - 2] + 29 * training[i - 1] + training[i]]++;
  const denominator = training.length - 2 + 0.1 * 29 ** 3;
  return sequence => {
    let s = 0;
    for (let i = 2; i < sequence.length; i++) {
      const k = 841 * sequence[i - 2] + 29 * sequence[i - 1] + sequence[i];
      s += Math.log((counts[k] + 0.1) / denominator);
    }
    return s / Math.max(1, sequence.length - 2);
  };
}
function show(sequence) { return sequence.map(x => corpus.translit[x]).join(''); }
function matrixInverse(matrix) {
  const n = matrix.length;
  const a = matrix.map((row, i) => row.slice().concat(Array.from({ length: n }, (_, j) => i === j ? 1 : 0)));
  let determinant = 1, sign = 1, rank = 0;
  for (let c = 0; c < n; c++) {
    let p = rank;
    while (p < n && a[p][c] === 0) p++;
    if (p === n) break;
    if (p !== rank) { [a[p], a[rank]] = [a[rank], a[p]]; sign = -sign; }
    const pivot = a[rank][c];
    determinant = mod(determinant * pivot);
    const pivotInv = inv(pivot);
    for (let j = 0; j < 2 * n; j++) a[rank][j] = mod(a[rank][j] * pivotInv);
    for (let i = 0; i < n; i++) if (i !== rank) {
      const f = a[i][c];
      if (f) for (let j = 0; j < 2 * n; j++) a[i][j] = mod(a[i][j] - f * a[rank][j]);
    }
    rank++;
  }
  return rank === n
    ? { rank, determinant: mod(determinant * sign), inverse: a.map(row => row.slice(n)) }
    : { rank, determinant: 0, inverse: null };
}
function applyMatrix(sequence, matrix, orientation) {
  const n = matrix.length;
  assert.equal(sequence.length % n, 0);
  const out = [];
  for (let offset = 0; offset < sequence.length; offset += n) {
    const block = sequence.slice(offset, offset + n);
    if (orientation === 'column') {
      for (let i = 0; i < n; i++) {
        let s = 0;
        for (let j = 0; j < n; j++) s += matrix[i][j] * block[j];
        out.push(mod(s));
      }
    } else {
      for (let j = 0; j < n; j++) {
        let s = 0;
        for (let i = 0; i < n; i++) s += block[i] * matrix[i][j];
        out.push(mod(s));
      }
    }
  }
  return out;
}
function rotateCW(a) { return a[0].map((_, c) => a.map(row => row[3 - c])); }
function main() {
  const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length).sort((a, b) => a.page - b.page);
  const p0 = pages.find(p => p.page === 0), p29 = pages.find(p => p.page === 29);
  assert.equal(p0.indices.length, 262);
  assert.equal(p29.indices.length, 277);
  const division = divide(p29.indices, p0.indices);
  const key = division.quotient, remainder = division.remainder;
  assert.equal(key.length, 16);
  assert.equal(remainder.length, 261);
  assert.deepEqual(key, [4,11,11,15,7,24,19,28,26,24,20,13,22,8,22,17]);

  const train = gpEncode(emerson), held = gpEncode(gibran), score = makeScore(train);
  const metrics = sequence => ({ length: sequence.length, ioc: ioc(sequence), trigram: score(sequence) });
  const printedP15 = [[10,3,20,22],[1,22,21,25],[11,17,19,7],[21,17,12,22]];
  const p15Transforms = [];
  let orientation = printedP15.map(r => r.slice());
  for (let rot = 0; rot < 4; rot++) {
    p15Transforms.push({ name: 'rot' + rot, values: orientation.flat() });
    p15Transforms.push({ name: 'rot' + rot + '-mirror', values: orientation.map(r => r.slice().reverse()).flat() });
    orientation = rotateCW(orientation);
  }
  const p15Comparisons = p15Transforms.map(x => ({
    name: x.name,
    exact: key.every((v, i) => v === x.values[i]),
    matches: key.filter((v, i) => v === x.values[i]).length
  }));

  const excluded = pages.filter(p => p.page !== 0 && p.page !== 29);
  const offsets = new Map();
  let total = 0;
  for (const page of pages) { offsets.set(page.page, total); total += page.indices.length; }
  const rawOther = excluded.flatMap(p => p.indices);
  assert.equal(total, 12956);
  assert.equal(rawOther.length, 12417);
  const additiveCases = [];
  const nativeAdditive = held.slice(0, rawOther.length);
  for (const clock of ['global-fullbook', 'page-reset']) {
    for (const sign of [-1, 1]) {
      const decoded = [], recovered = [];
      let cursor = 0;
      for (const page of excluded) {
        const base = clock === 'page-reset' ? 0 : offsets.get(page.page);
        for (let i = 0; i < page.indices.length; i++) {
          const k = key[(base + i) % 16];
          decoded.push(mod(page.indices[i] + sign * k));
          const encrypted = mod(nativeAdditive[cursor + i] - sign * k);
          recovered.push(mod(encrypted + sign * k));
        }
        cursor += page.indices.length;
      }
      assert(recovered.every((x, i) => x === nativeAdditive[i]));
      additiveCases.push({ clock, sign, ...metrics(decoded) });
    }
  }

  const matrix = Array.from({ length: 4 }, (_, i) => key.slice(i * 4, i * 4 + 4));
  const matrixResult = matrixInverse(matrix);
  assert.equal(matrixResult.rank, 4);
  assert.equal(matrixResult.determinant, 21);
  const matrixInv = matrixResult.inverse;
  const fullCipher = pages.flatMap(p => p.indices);
  assert.equal(fullCipher.length, 12956);
  assert.equal(fullCipher.length % 4, 0);
  const hillCases = [];
  for (const [direction, decoder] of [['M', matrix], ['M-inverse', matrixInv]]) {
    for (const vector of ['column', 'row']) {
      const decoded = applyMatrix(fullCipher, decoder, vector);
      hillCases.push({ direction, vector, ...metrics(decoded), first120: show(decoded.slice(0, 120)) });
    }
  }
  const matrixPlant = held.slice(0, fullCipher.length);
  const matrixControls = [];
  for (const [direction, decoder, encoder] of [['M', matrix, matrixInv], ['M-inverse', matrixInv, matrix]]) {
    for (const vector of ['column', 'row']) {
      const encrypted = applyMatrix(matrixPlant, encoder, vector);
      const recovered = applyMatrix(encrypted, decoder, vector);
      assert(recovered.every((x, i) => x === matrixPlant[i]));
      matrixControls.push({ direction, vector, exact: true });
    }
  }

  const remainderRows = Array.from({ length: 9 }, (_, i) => remainder.slice(i * 29, i * 29 + 29));
  const rowUniqueCounts = remainderRows.map(row => new Set(row).size);
  console.log(JSON.stringify({
    classification: 'SOURCE-SELECTED p0/p29 POLYNOMIAL RELATION; SIMPLE INVERSES FAIL',
    source: {
      p0Runes: p0.indices.length, p29Runes: p29.indices.length,
      quotientLength: key.length, quotient: key, quotientGP: show(key),
      remainderLength: remainder.length, remainderIs9x29: remainder.length === 9 * 29,
      p15PrintedSquareMod29: printedP15, p15D4Comparisons: p15Comparisons,
      bookLength: total, hill4Blocks: total / 4
    },
    polynomial: {
      quotientMetrics: metrics(key),
      remainderMetrics: metrics(remainder),
      remainderRowsUniqueCounts: rowUniqueCounts,
      rowsArePermutations: rowUniqueCounts.every(x => x === 29)
    },
    additive16: {
      rawOtherPages: metrics(rawOther),
      nativeControl: metrics(nativeAdditive),
      cases: additiveCases,
      allFourNativePlantsExact: true
    },
    hill4: {
      matrix, rank: matrixResult.rank, determinant: matrixResult.determinant,
      rawFullBook: metrics(fullCipher), cases: hillCases,
      nativeControl: metrics(matrixPlant), allFourNativePlantsExact: matrixControls
    },
    conclusion: 'The audio-selected p29/p0 division gives a 16-symbol quotient and 261-symbol remainder, but the remainder, quotient-pad, and quotient-derived Hill4 matrix do not recover native-GP language.'
  }, null, 2));
}
if (require.main === module) main();
module.exports = { divide, matrixInverse, applyMatrix, main };
