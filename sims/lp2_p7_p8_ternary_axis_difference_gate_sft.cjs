'use strict';

/**
 * p7 red five-word products -> p8 3^5 black-body five-axis difference gate.
 * Source-only reversible finite-difference candidates; no free key fitting.
 * Run the file directly under Node 22 from the checked-out repository.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const reference = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8');
const page = (n) => source.pages.find((p) => p.page === n).indices;
const mod = (x) => ((x % 29) + 29) % 29;

assert.equal(source.translit.length, 29);
const p7 = page(7);
const p8 = page(8);
const p57 = page(57);
const p7Ink = ink.pages.find((p) => p.page === 7);
const p8Ink = ink.pages.find((p) => p.page === 8);
assert.equal(p7.length, 208);
assert.equal(p8.length, 255);
assert.equal(p57.length, 95);
assert.deepEqual(p7Ink.red_spans.map((s) => [s.start, s.length]), [[194, 14]]);
assert.deepEqual(p8Ink.red_spans.map((s) => [s.start, s.length]), [[0, 12]]);
const p7Red = p7.slice(194);
const redWordLengths = [2, 4, 3, 2, 3];
const p7Words = [];
let start = 0;
for (const length of redWordLengths) {
  p7Words.push(p7Red.slice(start, start + length));
  start += length;
}
assert.equal(start, 14);
assert.deepEqual(p7Words, [
  [23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]
]);
const products = p7Words.map((w) =>
  w.reduce((v, x) => mod(v * x), 1));
assert.deepEqual(products, [11, 26, 8, 15, 2]);
const inverseRow = [23, 2, 5, 2, 19]; // Published GF29 inverse of p7 circulant.
const body = p8.slice(12);
assert.equal(body.length, 3 ** 5);

/**
 * Apply one natural difference/sum along every base-3 coordinate axis.
 * @param {number[]} input
 * @param {number[]} coefficients
 * @param {'forward'|'backward'} direction
 * @param {-1|1} sign
 * @returns {number[]}
 */
function decode(input, coefficients, direction, sign) {
  assert.equal(input.length, 243);
  let values = input.slice();
  for (let axis = 0; axis < 5; axis++) {
    const step = 3 ** axis;
    const old = values.slice();
    for (let i = 0; i < 243; i++) {
      const digit = Math.floor(i / step) % 3;
      if (direction === 'forward' && digit > 0) {
        values[i] = mod(old[i] + sign * coefficients[axis] * old[i - step]);
      } else if (direction === 'backward' && digit < 2) {
        values[i] = mod(old[i] + sign * coefficients[axis] * old[i + step]);
      }
    }
  }
  return values;
}

/**
 * Exact inverse of the axis operations above, in reverse axis order.
 * @param {number[]} output
 * @param {number[]} coefficients
 * @param {'forward'|'backward'} direction
 * @param {-1|1} sign
 * @returns {number[]}
 */
function encode(output, coefficients, direction, sign) {
  assert.equal(output.length, 243);
  let values = output.slice();
  for (let axis = 4; axis >= 0; axis--) {
    const step = 3 ** axis;
    const old = values.slice();
    const reconstructed = old.slice();
    if (direction === 'forward') {
      for (let i = 0; i < 243; i++) {
        if (Math.floor(i / step) % 3 > 0) {
          reconstructed[i] = mod(
            old[i] - sign * coefficients[axis] * reconstructed[i - step]);
        }
      }
    } else {
      for (let i = 242; i >= 0; i--) {
        if (Math.floor(i / step) % 3 < 2) {
          reconstructed[i] = mod(
            old[i] - sign * coefficients[axis] * reconstructed[i + step]);
        }
      }
    }
    values = reconstructed;
  }
  return values;
}

function coincidence(values) {
  const counts = new Int32Array(29);
  for (const v of values) counts[v]++;
  return counts.reduce((n, v) => n + v * (v - 1), 0) /
    (values.length * (values.length - 1));
}

// Use the same native-GP transliteration and solved-source trigram calibration
// as the existing p50-reflection/p55 gate, with no training on p8.
const alphabet = source.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
function gpWord(word) {
  const s = word.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/K/g, 'C')
    .replace(/Z/g, 'S')
    .replace(/ING/g, 'NG')
    .replace(/IO/g, 'IA');
  const result = [];
  for (let i = 0; i < s.length;) {
    const match = alphabet.find((entry) => s.startsWith(entry.s, i));
    if (!match) return null;
    result.push(match.i);
    i += match.s.length;
  }
  return result;
}
const paragraphs = reference.split(/\n\s*\n/)
  .map((p) => p.split('\n')
    .filter((line) => !line.trim().startsWith('#') &&
                      !line.trim().startsWith('['))
    .join(' '))
  .filter((p) => p.trim().length > 0);
const training = [];
for (const paragraph of paragraphs) {
  const seq = [];
  for (const word of paragraph.match(/[A-Za-z]+/g) || []) {
    const encoded = gpWord(word);
    assert.ok(encoded, 'Unencodable control word: ' + word);
    seq.push(...encoded);
  }
  if (seq.length >= 3) training.push(seq);
}
const counts = new Map();
let total = 0;
for (const seq of training) {
  for (let i = 2; i < seq.length; i++) {
    const key = seq.slice(i - 2, i + 1).join(',');
    counts.set(key, (counts.get(key) || 0) + 1);
    total++;
  }
}
assert.equal(total, 3178);
const denominator = total + 0.1 * 29 ** 3;
function trigramScore(values) {
  let s = 0;
  for (let i = 2; i < values.length; i++) {
    const key = values.slice(i - 2, i + 1).join(',');
    s += Math.log(((counts.get(key) || 0) + 0.1) / denominator);
  }
  return s / (values.length - 2);
}
const native = [];
for (const seq of training) {
  for (let i = 0; i + 76 <= seq.length; i++) {
    native.push(trigramScore(seq.slice(i, i + 76)));
  }
}
assert.equal(native.length, 1752);
const nativeMinimum = Math.min(...native);
assert.ok(Math.abs(nativeMinimum + 8.061343953919978) < 1e-9);
const controls = [...p57, ...p57, ...p57.slice(0, 53)];
assert.equal(controls.length, 243);

const results = [];
for (const [name, weights] of [
  ['unit', [1, 1, 1, 1, 1]],
  ['p7-products', products],
  ['p7-inverse', inverseRow]
]) {
  for (const direction of ['forward', 'backward']) {
    for (const sign of [-1, 1]) {
      // The source-shaped positive plant is independently forward-encoded
      // under this exact operation and then recovered, all 243 positions.
      const plant = encode(controls, weights, direction, sign);
      assert.deepEqual(decode(plant, weights, direction, sign), controls);
      const candidate = decode(body, weights, direction, sign);
      assert.deepEqual(encode(candidate, weights, direction, sign), body);
      results.push({
        weights: name, direction, sign,
        ioc: coincidence(candidate),
        trigram: trigramScore(candidate),
        leading: candidate.slice(0, 20)
          .map((v) => source.translit[v]).join('')
      });
    }
  }
}
results.sort((a, b) => b.trigram - a.trigram);
assert.equal(results.length, 12);
assert.equal(results[0].weights, 'unit');
assert.equal(results[0].direction, 'forward');
assert.equal(results[0].sign, -1);
assert.ok(Math.abs(results[0].trigram + 10.674405289258582) < 1e-9);
assert.ok(results.every((r) => r.trigram < nativeMinimum));
assert.ok(results.every((r) => r.ioc < 0.037));
console.log(JSON.stringify({
  source: {
    p7Products: products,
    p7Inverse: inverseRow,
    p8Red: 12,
    p8Black: body.length,
    p57Known: 95
  },
  originalP8Black: {
    ioc: coincidence(body),
    trigram: trigramScore(body)
  },
  clearP57: {
    ioc: coincidence(p57),
    trigram: trigramScore(p57)
  },
  native76WindowMinimum: nativeMinimum,
  native76WindowCount: native.length,
  resultCount: results.length,
  results
}, null, 2));
console.log('Original p8 3^5 five-axis difference gate: bounded negative; all 12 positive controls pass.');


// Independent original-source-motivated alternative: the 2013 Cicada puzzle
// used polynomial secret sharing. A 3^5 rune body can be regarded as five
// axes of three polynomial evaluations. Invert an explicit GF29 Vandermonde
// map along each axis rather than arbitrarily fitting a nonlinear function.
// The original SSSS instance was GF(2^n), so this is a hypothesis, not
// the historically documented algorithm.

/** @param {number[][]} matrix @returns {number[][]} */
function inverse3(matrix) {
  const rows = matrix.map((line, i) =>
    line.map(mod).concat(Array.from({ length: 3 }, (_, j) => Number(i === j))));
  for (let col = 0; col < 3; col++) {
    const pivot = rows.findIndex((line, i) => i >= col && line[col] !== 0);
    assert.ok(pivot >= 0, 'Vandermonde must have distinct sample positions');
    [rows[col], rows[pivot]] = [rows[pivot], rows[col]];
    let inversePivot = 1;
    for (let i = 0; i < 27; i++) inversePivot = mod(inversePivot * rows[col][col]);
    for (let j = 0; j < 6; j++) rows[col][j] = mod(rows[col][j] * inversePivot);
    for (let row = 0; row < 3; row++) {
      if (row === col) continue;
      const factor = rows[row][col];
      for (let j = 0; j < 6; j++) {
        rows[row][j] = mod(rows[row][j] - factor * rows[col][j]);
      }
    }
  }
  return rows.map((line) => line.slice(3));
}

/** @param {number[][]} m @returns {number[][]} */
const transpose3 = (m) => m.map((row, i) => row.map((_, j) => m[j][i]));

/** @param {number[]} xs @returns {number[][]} */
const vandermonde3 = (xs) => xs.map((v) => [1, mod(v), mod(v * v)]);

/**
 * Apply three-point coefficient/evaluation matrices on the 5 base-3 axes.
 * @param {number[]} input
 * @param {number[][][]} matrices
 * @param {number[]} order
 * @returns {number[]}
 */
function applyAxisMatrices(input, matrices, order) {
  let values = input.slice();
  for (const axis of order) {
    const step = 3 ** axis;
    const previous = values.slice();
    for (let i = 0; i < 243; i++) {
      if (Math.floor(i / step) % 3 !== 0) continue;
      const indexes = [i, i + step, i + 2 * step];
      const triple = indexes.map((index) => previous[index]);
      for (let row = 0; row < 3; row++) {
        values[indexes[row]] = mod(matrices[axis][row].reduce(
          (total, coefficient, col) => total + coefficient * triple[col], 0));
      }
    }
  }
  return values;
}

const polynomialFamilies = [
  ['x012', Array.from({ length: 5 }, () => [0, 1, 2])],
  ['x123', Array.from({ length: 5 }, () => [1, 2, 3])],
  ['products-start', products.map((p) => [p, mod(p + 1), mod(p + 2)])],
  ['products-center', products.map((p) => [mod(p - 1), p, mod(p + 1)])],
  ['products-scale', products.map((p) => [p, mod(2 * p), mod(3 * p)])],
  ['inverse-scale', inverseRow.map((p) => [p, mod(2 * p), mod(3 * p)])]
];
const polynomialResults = [];
for (const [family, samplePoints] of polynomialFamilies) {
  const matrices = samplePoints.map(vandermonde3);
  for (const mode of ['inverse', 'direct', 'transpose-inverse']) {
    const decoder = matrices.map((m) => mode === 'inverse'
      ? inverse3(m) : mode === 'direct' ? m : transpose3(inverse3(m)));
    const encoder = decoder.map(inverse3);
    const order = [0, 1, 2, 3, 4];
    const inverseOrder = [4, 3, 2, 1, 0];
    const positive = applyAxisMatrices(controls, encoder, inverseOrder);
    assert.deepEqual(applyAxisMatrices(positive, decoder, order), controls);
    const output = applyAxisMatrices(body, decoder, order);
    assert.deepEqual(applyAxisMatrices(output, encoder, inverseOrder), body);
    polynomialResults.push({
      family, mode,
      ioc: coincidence(output),
      trigram: trigramScore(output),
      leading: output.slice(0, 20)
        .map((v) => source.translit[v]).join('')
    });
  }
}
polynomialResults.sort((a, b) => b.trigram - a.trigram);
assert.equal(polynomialResults.length, 18);
assert.equal(polynomialResults[0].family, 'x012');
assert.equal(polynomialResults[0].mode, 'transpose-inverse');
assert.ok(Math.abs(polynomialResults[0].trigram + 10.641132501295413) < 1e-9);
assert.ok(polynomialResults.every((r) => r.trigram < nativeMinimum));
assert.ok(polynomialResults.every((r) => r.ioc < 0.037));
console.log(JSON.stringify({
  source: 'original p7 five red words and p8 black 3^5',
  historicalComparison: '2013 Cicada used SSSS; this GF29 tensor hypothesis is not documented',
  variantCount: polynomialResults.length,
  best: polynomialResults[0],
  native76WindowMinimum: nativeMinimum,
  results: polynomialResults
}, null, 2));
console.log('Original p8 five-axis three-point polynomial gate: bounded negative; all 18 positive controls pass.');
