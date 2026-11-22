'use strict';
/**
 * Source-cued GF(29^2) paired-rune inverse and 56-page clock gate.
 * The polynomial is formed solely from the five red complete p7 word products.
 * Original data are read unchanged; all direct field-unit keys are exhausted.
 * Windows 11 / Node.js 22: node sims/lp2_p7_field56_original_pair_inverse_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources');
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = read('liber-primus/lp2-corpus.json');
const solved = read('external/relikd-solved-gp29-native-v1.json');
const mod = n => (n % 29 + 29) % 29;
const inverses = Array(29).fill(0);
for (let n = 1; n < 29; n++) {
  for (let k = 1; k < 29; k++) {
    if (n * k % 29 === 1) inverses[n] = k;
  }
}
/** @param {number} u @param {number} v @param {number} a @param {number} b */
function multiply(u, v, a, b) {
  return [mod(u * a + 8 * v * b), mod(u * b + v * a)];
}
/** @param {number} u @param {number} v @param {number} c @param {number} d */
function divide(u, v, c, d) {
  const norm = mod(u * u - 8 * v * v);
  assert.notEqual(norm, 0);
  const t = inverses[norm];
  return [mod(t * (u * c - 8 * v * d)), mod(t * (u * d - v * c))];
}
/**
 * Operate on adjacent original rune pairs in page-local positions.
 * skipF is solely a generous source-cued exploratory diagnostic:
 * filtering input F is not a universally invertible coding convention.
 * @param {number[]} source @param {number} u @param {number} v
 * @param {number} phase @param {boolean} skipF @param {boolean} forward
 */
function transform(source, u, v, phase, skipF = false, forward = false) {
  const out = source.slice();
  const positions = [];
  for (let i = 0; i < source.length; i++) {
    if (!skipF || source[i] !== 0) positions.push(i);
  }
  for (let k = phase; k + 1 < positions.length; k += 2) {
    const i = positions[k], j = positions[k + 1];
    const values = forward
      ? multiply(u, v, source[i], source[j])
      : divide(u, v, source[i], source[j]);
    out[i] = values[0];
    out[j] = values[1];
  }
  return out;
}
/** @param {number[]} x */
function iocNumerator(x) {
  const freq = Array(29).fill(0);
  for (const symbol of x) freq[symbol]++;
  return freq.reduce((acc, count) => acc + count * (count - 1), 0);
}
/** @param {number[]} x */
function ioc(x) {
  return iocNumerator(x) / (x.length * (x.length - 1));
}
/** @param {number} n */
function powMod8(n) {
  let acc = 1;
  for (let j = 0; j < n; j++) acc = mod(acc * 8);
  return acc;
}

const redWords = [[23, 3], [22, 16, 2, 25], [5, 7, 11],
  [14, 28], [6, 28, 19]];
assert.deepEqual(corpus.pages[7].indices.slice(194), redWords.flat());
const coefficients = redWords.map(word =>
  word.reduce((acc, r) => mod(acc * r), 1));
assert.deepEqual(coefficients, [11, 26, 8, 15, 2]);
const heading = corpus.pages[8].indices.slice(0, 12);
assert.deepEqual([heading.slice(0, 4), heading.slice(4)].map(word =>
  word.reduce((acc, r) => mod(acc * r), 1)), [4, 3]);
assert.equal(heading[11], 17);
const evaluate = x => mod(coefficients.reduce(
  (sum, c, degree) => sum + c * x ** degree, 0));
for (let x = 0; x < 29; x++) {
  assert.equal(mod(evaluate(x) - x),
    mod(2 * (x - 3) * (x - 4) * (x * x - 8)));
}
assert.deepEqual(Array.from({length:29}, (_, i) => i)
  .filter(x => evaluate(x) === x), [3, 4]);
assert.equal(mod(26 + 16 * 4 + 16 * 4 ** 2 + 8 * 4 ** 3), 17);
assert.equal(powMod8(14), 28);
assert.equal(powMod8(28), 1);
const powers = [];
let [u, v] = [1, 0];
for (let j = 0; j < 56; j++) {
  powers.push([u, v]);
  [u, v] = multiply(u, v, 0, 1);
}
assert.deepEqual([u, v], [1, 0]);
assert.equal(new Set(powers.map(pair => pair.join(','))).size, 56);
assert.deepEqual(powers.slice(0, 4), [[1, 0], [0, 1], [8, 0], [0, 8]]);

const units = [];
for (let a = 0; a < 29; a++) {
  for (let b = 0; b < 29; b++) {
    if (a === 0 && b === 0) continue;
    assert.notEqual(mod(a * a - 8 * b * b), 0);
    units.push([a, b]);
  }
}
assert.equal(units.length, 840);
const runeMap = new Map(corpus.runes.map((rune, i) => [rune, i]));
const controls = solved.sections.map(section =>
  Array.from(section.source_text)
    .filter(ch => runeMap.has(ch))
    .map(ch => runeMap.get(ch)));
/** @param {number} width */
function nativeMin(width) {
  let min = Infinity, windows = 0;
  for (const source of controls) {
    for (let k = 0; k + width <= source.length; k++) {
      const candidate = ioc(source.slice(k, k + width));
      min = Math.min(candidate, min);
      windows++;
    }
  }
  return { min, windows };
}
const cases = [
  {page: 0, peak: [2534, 2826], best: [[27,19,1], [9,25,1]], native: 0.05539469451025124, windows: 1325},
  {page: 9, peak: [2632, 2806], best: [[12,11,1], [17,27,0]], native: 0.05536922130918442, windows: 1301},
  {page: 16, peak: [2708, 2730], best: [[12,4,0], [2,4,0]], native: 0.055363126918419645, windows: 1305},
  {page: 23, peak: [1864, 1800], best: [[6,21,1], [1,17,0]], native: 0.053902028523341305, windows: 1521},
  {page: 40, peak: [2046, 2106], best: [[1,22,1], [8,21,1]], native: 0.054281949934123844, windows: 1449},
  {page: 55, peak: [260, 274], best: [[1,27,0], [27,4,1]], native: 0.0456140350877193, windows: 2304}
];
const findings = [];
for (const {page, peak, best, native, windows} of cases) {
  const source = corpus.pages[page].indices;
  const maxima = [-1, -1], winners = [null, null];
  for (const [a, b] of units) {
    for (let phase = 0; phase <= 1; phase++) {
      for (let skip = 0; skip <= 1; skip++) {
        const score = iocNumerator(transform(source, a, b, phase, !!skip));
        if (score > maxima[skip]) {
          maxima[skip] = score;
          winners[skip] = [a,b,phase];
        }
      }
    }
  }
  assert.deepEqual(maxima, peak);
  assert.deepEqual(winners, best);
  const reference = nativeMin(source.length);
  assert.equal(reference.windows, windows);
  assert(Math.abs(reference.min - native) < 1e-12);
  if (page !== 55) {
    assert(maxima.every(num =>
      num / (source.length * (source.length - 1)) < reference.min));
  }
  const [a, b, phase] = winners[0];
  const inverse = transform(source, a, b, phase);
  const roundtrip = transform(inverse, a, b, phase, false, true);
  assert.deepEqual(roundtrip, source);
  findings.push({page, runes: source.length, originalIoC: ioc(source),
    maximumFullyReversibleIoC: maxima[0] /
      (source.length * (source.length - 1)),
    maximumSpeculativeTransparentFIoC: maxima[1] /
      (source.length * (source.length - 1)),
    smallestSolvedNativeWindowIoC: native,
    nativeWindows: reference.windows, bestUnits: winners});
}
const full = corpus.pages.slice(0, 56).flatMap(page => page.indices);
assert.equal(full.length, 12956);
const originalIoC = ioc(full);
const clocks = [];
for (let phase = 0; phase < 56; phase++) {
  const decoded = [];
  for (const page of corpus.pages.slice(0, 56)) {
    const [a, b] = powers[(phase + page.page) % 56];
    decoded.push(...transform(page.indices, a, b, 0));
  }
  clocks.push({phase, IoC: ioc(decoded)});
}
clocks.sort((a, b) => b.IoC - a.IoC);
assert.equal(clocks[0].phase, 49);
assert(Math.abs(clocks[0].IoC - 0.03448768023923027) < 1e-12);
assert(Math.abs(originalIoC - 0.03447839786450569) < 1e-12);
const genuine = controls[3].slice(0, 262);
const nativeCipher = transform(genuine, 17, 13, 0, false, true);
const nativeDecode = transform(nativeCipher, 17, 13, 0);
assert.deepEqual(nativeDecode, genuine);
console.log(JSON.stringify({sourceRedProducts: coefficients,
  p8RedProducts: [4,3], headingLastRuneIndex: heading[11],
  field: 'GF29[alpha]/(alpha^2-8)', orderOfAlpha: powers.length,
  allSourceUnitKeys: units.length, perPageInverseModels: 2 * units.length,
  originalCases: findings, all56PageRawIoC: originalIoC,
  sourcePageClockBest: clocks[0],
  sourcePageClockWorst: clocks[clocks.length - 1],
  nativePositiveRunes: genuine.length, genuinePlantExactRoundtrip: true,
  caveat: 'The transparent-F variant is exploratory and is not a universal lossless decoder.'}, null, 2));
console.log('PASS: source-polynomial field identities and every direct original page inversion tested.');
