'use strict';

/**
 * Source-frozen 51×127 pair-matrix column-order inverse for original LP2.
 * Node.js 22 CommonJS. Read-only, deterministic, no external dependencies.
 * A standalone test (SFT), including a whole-size native-GP planted control.
 *
 * The original marked p3/p39 polynomial algebra defines GF(29²), p39 factors
 * the 256-byte p50 grid modulo 29, p53 marks 51 red runes, and the remaining
 * original rune payload after its first two symbols is 51×127×2. Testing
 * column-first reading is a new hypothesis, not an authenticated Cicada step.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const MOD = 29;
const ROWS = 51;
const COLS = 127;
const mod = x => ((x % MOD) + MOD) % MOD;

const original = corpus.pages.slice(0, 56).flatMap(page => page.indices);
const red = corpus.pages[53].indices.slice(128);
assert.equal(original.length, 12956);
assert.deepEqual(original.slice(0, 2), [15, 8]);
assert.equal(red.length, ROWS);
assert.equal(corpus.pages[54].indices[0], 24);
assert.equal(grid.bytes.length, 256);
const cipher = original.slice(2);
assert.equal(cipher.length, ROWS * COLS * 2);

// Divide p50's original descending-coefficient GF29 polynomial by
// monic (X-24)^2 = X^2+10X+25, preserving leading quotient-zero slots.
const work = grid.bytes.map(v => v % MOD);
const quotient = [];
for (let i = 0; i < 254; i++) {
  const lead = work[i];
  quotient.push(lead);
  work[i + 1] = mod(work[i + 1] - 10 * lead);
  work[i + 2] = mod(work[i + 2] - 25 * lead);
}
assert.deepEqual(work.slice(254), [0, 0]);
assert.equal(quotient.length, 254);
const Q = Array.from({ length: COLS }, (_, j) => [
  quotient[2 * j], quotient[2 * j + 1]
]);

/** @param {number[]} a @param {number[]} b */
function fieldMultiply(a, b) {
  return [
    mod(a[0] * b[0] + 8 * a[1] * b[1]),
    mod(a[0] * b[1] + a[1] * b[0] + 3 * a[1] * b[1])
  ];
}

/** @param {number[]} a @param {number[]} b */
function fieldAdd(a, b) {
  return [mod(a[0] + b[0]), mod(a[1] + b[1])];
}

/**
 * Source and output traversal are independently row-first (R) or
 * column-first (C). Each pair remains in its original internal order.
 *
 * @param {number[]} input Original 12954-rune pair-register stream
 * @param {'R'|'C'} sourceOrder
 * @param {'R'|'C'} outputOrder
 * @param {'mul'|'add'|'zero'} rule
 * @param {boolean} swap Whether row source is (red,Ac) or (Ac,red)
 * @param {-1|1} sign Signed mask applied in GP29 coordinates
 * @returns {number[]}
 */
function convert(input, sourceOrder, outputOrder, rule, swap, sign) {
  assert.equal(input.length, ROWS * COLS * 2);
  const output = Array(input.length);
  for (let r = 0; r < ROWS; r++)
    for (let j = 0; j < COLS; j++) {
      const src = 2 * (sourceOrder === 'C' ? j * ROWS + r : r * COLS + j);
      const dest = 2 * (outputOrder === 'C' ? j * ROWS + r : r * COLS + j);
      const rowSeed = swap ? [red[r], 24] : [24, red[r]];
      const mask = rule === 'mul' ? fieldMultiply(rowSeed, Q[j])
        : rule === 'add' ? fieldAdd(rowSeed, Q[j]) : [0, 0];
      for (let k = 0; k < 2; k++)
        output[dest + k] = mod(input[src + k] + sign * mask[k]);
    }
  return output;
}

/** @param {string} raw @returns {number[]} */
function nativeGP(raw) {
  const tokens = corpus.translit.map((s, i) => ({ s, i }))
    .sort((a, b) => b.s.length - a.s.length);
  const words = raw.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S').match(/[A-Z]+/g) || [];
  const output = [];
  for (const word of words)
    for (let i = 0; i < word.length;) {
      const token = tokens.find(t => word.startsWith(t.s, i));
      if (token) {
        output.push(token.i);
        i += token.s.length;
      } else i++;
    }
  return output;
}

/** @param {number[]} a @returns {number} */
function coincidence(a) {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (a.length * (a.length - 1));
}

const train = nativeGP(read('resources/control/shakespeare_first300k.txt')
  .slice(0, 190000));
const independent = nativeGP(read('resources/control/gibran_prophet_58585.txt'));
assert(train.length > 100000);
assert(independent.length >= cipher.length);

const counts = new Map();
for (let i = 2; i < train.length; i++) {
  const key = train[i - 2] * 841 + train[i - 1] * 29 + train[i];
  counts.set(key, (counts.get(key) || 0) + 1);
}
const denominator = train.length - 2 + 0.2 * 29 ** 3;
/** @param {number[]} symbols */
function trigram(symbols) {
  let sum = 0;
  for (let i = 2; i < symbols.length; i++) {
    const key = symbols[i - 2] * 841 + symbols[i - 1] * 29 + symbols[i];
    sum += Math.log(((counts.get(key) || 0) + 0.2) / denominator);
  }
  return sum / (symbols.length - 2);
}

const variants = [];
for (const sourceOrder of ['R', 'C'])
  for (const outputOrder of ['R', 'C'])
    for (const rule of ['mul', 'add', 'zero'])
      for (const swap of [false, true])
        for (const sign of [-1, 1]) {
          const decoded = convert(cipher, sourceOrder, outputOrder,
            rule, swap, sign);
          variants.push({
            sourceOrder, outputOrder, rule, swap, sign,
            ioc: coincidence(decoded), trigram: trigram(decoded)
          });
        }
assert.equal(variants.length, 48);
variants.sort((a, b) => b.trigram - a.trigram);

const sample = independent.slice(0, cipher.length);
const plant = convert(sample, 'R', 'C', 'mul', false, -1);
const restored = convert(plant, 'C', 'R', 'mul', false, 1);
assert.deepEqual(restored, sample);
assert.notDeepEqual(convert(plant, 'C', 'R', 'mul', true, 1), sample);
const originalRaw = {
  ioc: coincidence(cipher), trigram: trigram(cipher)
};
const originalBest = variants[0], bestColumnFirst =
  variants.filter(x => x.sourceOrder === 'C' && x.outputOrder === 'R')[0];
const native = { ioc: coincidence(sample), trigram: trigram(sample) };
assert(Math.abs(originalRaw.ioc - 0.034478961663527145) < 1e-12);
assert(Math.abs(originalRaw.trigram + 12.542185948151351) < 1e-9);
assert(Math.abs(originalBest.trigram + 12.506105245646557) < 1e-9);
assert(Math.abs(bestColumnFirst.trigram + 12.517792229824222) < 1e-9);
assert(native.trigram > -9 && native.ioc > 0.05);
assert(originalBest.trigram < -12 && originalBest.ioc < 0.04);

console.log(JSON.stringify({
  source: { runes: original.length, originalFirstTwo: original.slice(0, 2),
    redLength: red.length, quotientLength: quotient.length,
    finalPolynomialRemainder: work.slice(254), matrix: [ROWS, COLS] },
  originalRaw, bestAll: originalBest, bestColumnFirst,
  nativeIndependentControl: native,
  wholePayloadNativePlantRecovered: restored.length,
  wrongSourceOrientationRejectsPlant: true,
  variants: variants.length,
  conclusion: 'No direct native-GP plaintext from any tested row/column traversal and frozen field mask.'
}, null, 2));
