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
