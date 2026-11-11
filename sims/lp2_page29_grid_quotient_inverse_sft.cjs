'use strict';
/*
 * Source-fixed p29 / printed-grid polynomial quotient tests.
 * No fitted key, phase, alphabet permutation, or language-selected parameter.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const readJson = name => JSON.parse(fs.readFileSync(path.join(__dirname, '..', name), 'utf8'));
const readText = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const ink = readJson('resources/liber-primus/lp2-ink-annotations.json');
const grid = readJson('resources/liber-primus/lp2-grid-256.json');
const emerson = readText('resources/control/emerson_essays_2944.txt');
const gibran = readText('resources/control/gibran_prophet_58585.txt');
const mod = x => ((x % 29) + 29) % 29;
function inverse(x) {
  for (let i = 1; i < 29; i++) if (mod(i * x) === 1) return i;
  throw new RangeError('Noninvertible element of GF(29): ' + x);
}
function trim(a) {
  const i = a.findIndex(x => mod(x) !== 0);
  return i < 0 ? [0] : a.slice(i).map(mod);
}
function divideFixed(source, factor) {
  assert(source.length >= factor.length);
  const r = source.map(mod);
  const q = Array(source.length - factor.length + 1).fill(0);
  const unit = inverse(factor[0]);
  for (let i = 0; i < q.length; i++) {
    const v = mod(r[i] * unit);
    q[i] = v;
    for (let j = 0; j < factor.length; j++) r[i + j] = mod(r[i + j] - v * factor[j]);
  }
  return { quotient: q, remainder: r.slice(q.length) };
}
function divideTrim(source, factor) {
  const a = trim(source);
  const b = trim(factor);
  assert(!(b.length === 1 && b[0] === 0));
  if (a.length < b.length) return { quotient: [0], remainder: a };
  const r = a.slice();
  const q = [];
  const unit = inverse(b[0]);
  for (let i = 0; i <= a.length - b.length; i++) {
    const v = mod(r[i] * unit);
    q.push(v);
    for (let j = 0; j < b.length; j++) r[i + j] = mod(r[i + j] - v * b[j]);
  }
  return { quotient: q, remainder: trim(r.slice(a.length - b.length + 1)) };
}
function multiplyPolynomials(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) out[i + j] = mod(out[i + j] + a[i] * b[j]);
  }
  return out;
}
function ioc(a) {
  if (a.length < 2) return 0;
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
function makeTrigramModel(training) {
  const counts = new Float64Array(29 ** 3);
  for (let i = 2; i < training.length; i++) counts[841 * training[i - 2] + 29 * training[i - 1] + training[i]]++;
  const denominator = training.length - 2 + 0.1 * 29 ** 3;
  return sequence => {
    let score = 0;
    for (let i = 2; i < sequence.length; i++) {
      const key = 841 * sequence[i - 2] + 29 * sequence[i - 1] + sequence[i];
      score += Math.log((counts[key] + 0.1) / denominator);
    }
    return score / Math.max(1, sequence.length - 2);
  };
}
function show(sequence) { return sequence.map(x => corpus.translit[x]).join(''); }
function matrixInverse(matrix) {
  const n = matrix.length;
  const a = matrix.map((row, i) => row.slice().concat(Array.from({ length: n }, (_, j) => i === j ? 1 : 0)));
  let determinant = 1, sign = 1, rank = 0;
  for (let column = 0; column < n; column++) {
    let pivotRow = rank;
    while (pivotRow < n && a[pivotRow][column] === 0) pivotRow++;
    if (pivotRow === n) break;
    if (pivotRow !== rank) { [a[pivotRow], a[rank]] = [a[rank], a[pivotRow]]; sign = -sign; }
    const pivot = a[rank][column];
    determinant = mod(determinant * pivot);
    const pivotInverse = inverse(pivot);
    for (let j = 0; j < 2 * n; j++) a[rank][j] = mod(a[rank][j] * pivotInverse);
    for (let i = 0; i < n; i++) {
      if (i === rank) continue;
      const multiplier = a[i][column];
      if (multiplier) for (let j = 0; j < 2 * n; j++) a[i][j] = mod(a[i][j] - multiplier * a[rank][j]);
    }
    rank++;
  }
  if (rank !== n) return { rank, determinant: 0, inverse: null };
  return { rank, determinant: mod(determinant * sign), inverse: a.map(row => row.slice(n)) };
}
function applyMatrix(sequence, matrix, orientation) {
  const n = matrix.length;
  assert.equal(sequence.length % n, 0);
  const output = [];
  for (let offset = 0; offset < sequence.length; offset += n) {
    const block = sequence.slice(offset, offset + n);
    if (orientation === 'column') {
      for (let i = 0; i < n; i++) {
        let value = 0;
        for (let j = 0; j < n; j++) value += matrix[i][j] * block[j];
        output.push(mod(value));
      }
    } else {
      for (let j = 0; j < n; j++) {
        let value = 0;
        for (let i = 0; i < n; i++) value += block[i] * matrix[i][j];
        output.push(mod(value));
      }
    }
  }
  return output;
}
function main() {
  assert.equal(grid.bytes.length, 256);
  assert.equal(crypto.createHash('sha256').update(Buffer.from(grid.bytes)).digest('hex'),
    '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
  const redSpan = page => ink.pages.find(p => p.page === page).red_spans.find(s => s.start === 119 && s.length === 3);
  const p3Red = [...redSpan(3).runes].map(g => corpus.runes.indexOf(g));
  const p39Red = [...redSpan(39).runes].map(g => corpus.runes.indexOf(g));
  assert.deepEqual(p3Red, [13, 23, 2]);
  assert.deepEqual(p39Red, [27, 5, 15]);
  const factor = p39Red.slice().reverse();
  assert.deepEqual(factor, [15, 5, 27]);

  const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length).sort((a, b) => a.page - b.page);
  const p29 = pages.find(p => p.page === 29);
  assert.equal(p29.indices.length, 277);
  const p29Factor = divideFixed(p29.indices, factor);
  const gridFactor = divideFixed(grid.bytes, factor);
  assert(p29Factor.remainder.every(x => x === 0));
  assert(gridFactor.remainder.every(x => x === 0));
  assert.equal(p29Factor.quotient.length, 275);
  assert.equal(gridFactor.quotient.length, 254);
  assert.deepEqual(multiplyPolynomials(factor, p29Factor.quotient), p29.indices.map(mod));
  assert.deepEqual(multiplyPolynomials(factor, gridFactor.quotient), grid.bytes.map(mod));

  const p29ByGrid = divideTrim(p29.indices, grid.bytes);
  assert.equal(p29ByGrid.quotient.length, 23);
  assert.equal(p29ByGrid.remainder.length, 254);
  assert.deepEqual(p29ByGrid.quotient, [27,20,4,17,16,18,16,11,8,28,18,16,5,23,12,10,8,25,14,14,15,20,17]);
  const p29RemainderByFactor = divideTrim(p29ByGrid.remainder, factor);
  assert.equal(p29RemainderByFactor.quotient.length, 252);
  assert.deepEqual(p29RemainderByFactor.remainder, [0]);
  const cancelledDivision = divideTrim(p29Factor.quotient, gridFactor.quotient);
  assert.deepEqual(cancelledDivision.quotient, p29ByGrid.quotient);
  assert.equal(cancelledDivision.remainder.length, 252);
  assert.deepEqual(cancelledDivision.remainder, p29RemainderByFactor.quotient);

  const train = gpEncode(emerson), held = gpEncode(gibran), score = makeTrigramModel(train);
  const metrics = sequence => ({ length: sequence.length, ioc: ioc(sequence), trigram: score(sequence) });
  const p29Metrics = metrics(p29.indices);
  const p29RemainderMetrics = metrics(p29ByGrid.remainder);
  const cancelledRemainderMetrics = metrics(cancelledDivision.remainder);
  const p29Quotient = p29ByGrid.quotient;

  const scoredPages = pages.filter(p => p.page !== 29);
  const offsets = new Map();
  let totalBookRunes = 0;
  for (const page of pages) { offsets.set(page.page, totalBookRunes); totalBookRunes += page.indices.length; }
  const rawOtherPages = scoredPages.flatMap(p => p.indices);
  assert.equal(totalBookRunes, 12956);
  assert.equal(rawOtherPages.length, 12679);
  const additiveCases = [];
  const nativeAdditive = held.slice(0, rawOtherPages.length);
  for (const clock of ['global-fullbook', 'page-reset']) {
    for (const sign of [-1, 1]) {
      const decoded = [], recoveredPlant = [];
      let cursor = 0;
      for (const page of scoredPages) {
        const base = clock === 'page-reset' ? 0 : offsets.get(page.page);
        const length = page.indices.length;
        for (let i = 0; i < length; i++) {
          const key = p29Quotient[(base + i) % 23];
          decoded.push(mod(page.indices[i] + sign * key));
          const encryptedPlant = mod(nativeAdditive[cursor + i] - sign * key);
          recoveredPlant.push(mod(encryptedPlant + sign * key));
        }
        cursor += length;
      }
      assert(recoveredPlant.every((x, i) => x === nativeAdditive[i]));
      additiveCases.push({ clock, sign, ...metrics(decoded) });
    }
  }

  const matrixValues = p29Factor.quotient.concat(gridFactor.quotient);
  assert.equal(matrixValues.length, 529);
  const n = 23;
  const matrix = Array.from({ length: n }, (_, i) => matrixValues.slice(i * n, (i + 1) * n));
  const matrixResult = matrixInverse(matrix);
  assert.equal(matrixResult.rank, 23);
  assert.equal(matrixResult.determinant, 7);
  const matrixInv = matrixResult.inverse;

  const fullCipher = pages.flatMap(p => p.indices);
  assert.equal(fullCipher.length, 12956);
  assert.equal(fullCipher.length, 563 * 23 + 7);
  const matrixCases = [], matrixRawControls = [];
  for (const alignment of ['prefix7', 'suffix7']) {
    const sequence = alignment === 'prefix7' ? fullCipher.slice(7) : fullCipher.slice(0, 12949);
    assert.equal(sequence.length, 12949);
    matrixRawControls.push({ alignment, ...metrics(sequence) });
    for (const [direction, decoder] of [['M', matrix], ['M-inverse', matrixInv]]) {
      for (const orientation of ['column', 'row']) {
        const decoded = applyMatrix(sequence, decoder, orientation);
        matrixCases.push({ alignment, direction, orientation, ...metrics(decoded), first120: show(decoded.slice(0, 120)) });
      }
    }
  }

  const matrixPlant = held.slice(0, 12949);
  const matrixPlantControls = [];
  for (const [direction, decoder, encoder] of [['M', matrix, matrixInv], ['M-inverse', matrixInv, matrix]]) {
    for (const orientation of ['column', 'row']) {
      const encrypted = applyMatrix(matrixPlant, encoder, orientation);
      const recovered = applyMatrix(encrypted, decoder, orientation);
      assert(recovered.every((x, i) => x === matrixPlant[i]));
      matrixPlantControls.push({ direction, orientation, exact: true });
    }
  }

  console.log(JSON.stringify({
    classification: 'SOURCE-EXACT POLYNOMIAL RELATIONS; TESTED DIRECT INVERSES FAIL',
    source: {
      p3RedGP: p3Red, p39RedGP: p39Red, factorDescending: factor,
      p29Runes: p29.indices.length, gridBytes: grid.bytes.length,
      p29FactorQuotientLength: p29Factor.quotient.length,
      gridFactorQuotientLength: gridFactor.quotient.length,
      fixedWidthQuotientSum: matrixValues.length,
      p3MiddleRuneSelectsDimension: p3Red[1],
      p29GridQuotient: p29Quotient,
      p29GridQuotientTransliteration: show(p29Quotient),
      p29GridRemainderLength: p29ByGrid.remainder.length,
      cancelledRemainderLength: cancelledDivision.remainder.length,
      cancelledRemainderIs9x28: cancelledDivision.remainder.length === 9 * 28
    },
    polynomialRemainders: {
      p29: p29Metrics,
      directGridRemainder: p29RemainderMetrics,
      commonFactorCancelledRemainder: cancelledRemainderMetrics
    },
    additive23Key: {
      scoredPages: scoredPages.length, scoredRunes: rawOtherPages.length,
      raw: metrics(rawOtherPages), keyTransliteration: show(p29Quotient),
      cases: additiveCases, nativeControl: metrics(nativeAdditive), allFourPlantsExact: true
    },
    hill23: {
      dimension: n, determinant: matrixResult.determinant, rank: matrixResult.rank,
      matrixSequenceLength: matrixValues.length, originalLength: fullCipher.length,
      completeBlocks: 563, trailingRunes: 7, sourceGeometry: '12956 = 563 * 23 + 7',
      rawControls: matrixRawControls, cases: matrixCases,
      nativeControl: metrics(matrixPlant), allFourPlantsExact: matrixPlantControls
    },
    conclusion: 'The marked p39 factor and p29/grid polynomial relation are exact, but the tested quotient/remainder plaintext, 23-symbol additive key, and 23x23 Hill interpretations do not recover native-GP language.'
  }, null, 2));
}
if (require.main === module) main();
module.exports = { divideFixed, divideTrim, matrixInverse, applyMatrix, main };
