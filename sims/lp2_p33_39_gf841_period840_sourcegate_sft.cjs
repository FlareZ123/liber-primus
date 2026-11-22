'use strict';

/**
 * Independent source-conditioned period-840 gate on the original 1,680-rune
 * physical LP2 pp33–39 visual chapter. Finite-field and 29-symbol controls.
 *
 * The signed 2013 BASE29 example 3301 -> 3QO supplies the polynomial
 * 3 + 26X + 24X^2. Its exact divisibility of the LP2 p50 byte table is
 * checked here. The normalized polynomial's root has order 840 in GF(29^2);
 * the original pp33–39 chapter has length exactly 2*840.
 *
 * Run: node sims/lp2_p33_39_gf841_period840_sourcegate_sft.cjs
 * No network, external libraries, or file writes.
 *
 * @module lp2_p33_39_gf841_period840_sourcegate_sft
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');

/** @param {number} x @returns {number} */
const mod29 = (x) => (x % 29 + 29) % 29;

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), 'utf8');
}

const table = JSON.parse(read('resources/liber-primus/lp2-grid-256.json')).bytes;
assert.equal(table.length, 256);
const coefficients = table.map(mod29);
// H(X) = 3 + 26X + 24X^2; conventional descending divisor coefficients.
const Hdesc = [24, 26, 3];
const inverseLead = 23;
assert.equal(mod29(24 * inverseLead), 1);
for (let i = 0; i <= coefficients.length - Hdesc.length; i++) {
  const quotient = mod29(coefficients[i] * inverseLead);
  for (let j = 0; j < Hdesc.length; j++) {
    coefficients[i + j] = mod29(coefficients[i + j] - quotient * Hdesc[j]);
  }
}
assert.ok(coefficients.every((x) => x === 0), 'p50 original H remainder is zero');

// Normalize H/24 to U²+18U+11; hence U² = 11U+18 in GF(29²).
// Multiplication by U takes a+bU to 18b+(a+11b)U.
const fieldOrbit = [];
let a = 1;
let b = 0;
for (let i = 0; i < 840; i++) {
  assert.ok(i === 0 || a !== 1 || b !== 0, 'early period');
  fieldOrbit.push([a, b, mod29(2 * a + 11 * b)]);
  [a, b] = [mod29(18 * b), mod29(a + 11 * b)];
}
assert.deepEqual([a, b], [1, 0], 'primitive element has order 840');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original = corpus.pages.filter((p) => p.page >= 33 && p.page <= 39)
  .flatMap((p) => p.indices);
assert.equal(original.length, 1680);
const PERIOD = 840;

/** @param {number[]} sequence @returns {number} */
function laggedEquality(sequence) {
  assert.equal(sequence.length, PERIOD * 2);
  let same = 0;
  for (let i = 0; i < PERIOD; i++) {
    if (sequence[i] === sequence[i + PERIOD]) same++;
  }
  return same;
}

/** @param {number[]} sequence @returns {number} */
function laggedDifferenceIoc(sequence) {
  const counts = Array(29).fill(0);
  for (let i = 0; i < PERIOD; i++) {
    counts[mod29(sequence[i + PERIOD] - sequence[i])]++;
  }
  return counts.reduce((total, n) => total + n * (n - 1), 0)
    / (PERIOD * (PERIOD - 1));
}

/** @param {number[]} sequence @returns {number} */
function ioc(sequence) {
  const counts = Array(29).fill(0);
  for (const symbol of sequence) counts[symbol]++;
  return counts.reduce((total, n) => total + n * (n - 1), 0)
    / (sequence.length * (sequence.length - 1));
}

const sourceLag840 = laggedEquality(original);
const sourceDifferenceIoc = laggedDifferenceIoc(original);
assert.equal(sourceLag840, 28);
assert.ok(Math.abs(sourceDifferenceIoc - 0.03465009364890175) < 1e-12);

const languageMap = new Map([
  'F', 'U', 'TH', 'O', 'R', 'C', 'G', 'W', 'H', 'N',
  'I', 'J', 'EO', 'P', 'X', 'S', 'T', 'B', 'E', 'M',
  'L', 'NG', 'OE', 'D', 'A', 'AE', 'Y', 'IA', 'EA'
].map((label, index) => [label, index]));
const DIGRAPHS = ['ING', 'TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA'];
/** Convert supplied independent English reference bytes to standard GP29. 
 * @param {string} input @returns {number[]}
 */
function englishToGp(input) {
  const text = input.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C')
    .replace(/Z/g, 'S').replace(/Q/g, 'C');
  const output = [];
  for (let i = 0; i < text.length;) {
    if (!/[A-Z]/.test(text[i])) { i++; continue; }
    let syllable = text[i];
    let step = 1;
    for (const digraph of DIGRAPHS) {
      if (text.startsWith(digraph, i)) {
        syllable = digraph === 'ING' ? 'NG' : digraph;
        step = digraph.length;
        break;
      }
    }
    const value = languageMap.get(syllable);
    if (value !== undefined) output.push(value);
    i += step;
  }
  return output;
}

/** @param {string} data @returns {number[]} */
function latinToGp(data) {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRS';
  return [...data.split(/\r?\n/).filter((line) => /^[0-9A-S]+$/.test(line)).join('')]
    .map((character) => alphabet.indexOf(character));
}

/**
 * @param {number[]} sequence
 * @param {number} stride
 * @returns {{count:number,min:number,max:number,mean:number,atMostOriginal:number}}
 */
function matchedWindows(sequence, stride) {
  let n = 0;
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let atMostOriginal = 0;
  for (let offset = 0; offset + PERIOD * 2 <= sequence.length; offset += stride) {
    const nEq = laggedEquality(sequence.slice(offset, offset + PERIOD * 2));
    min = Math.min(min, nEq);
    max = Math.max(max, nEq);
    sum += nEq;
    n++;
    if (nEq <= sourceLag840) atMostOriginal++;
  }
  return { count: n, min, max, mean: sum / n, atMostOriginal };
}

const latin = latinToGp(read('resources/control/latin-vulgate-gp-wholewords.txt'));
const shakespeare = englishToGp(read('resources/control/shakespeare_first300k.txt'));
const gibran = englishToGp(read('resources/control/gibran_prophet_58585.txt'));
assert.deepEqual([latin.length, shakespeare.length, gibran.length],
  [204802, 217644, 62696]);
const ref = {
  latin: matchedWindows(latin, 159),
  shakespeare: matchedWindows(shakespeare, 157),
  gibran: matchedWindows(gibran, 157)
};
assert.deepEqual(
  [ref.latin.count, ref.latin.min, ref.latin.atMostOriginal],
  [1278, 42, 0]
);
assert.deepEqual(
  [ref.shakespeare.count, ref.shakespeare.min, ref.shakespeare.atMostOriginal],
  [1376, 28, 2]
);
assert.deepEqual(
  [ref.gibran.count, ref.gibran.min, ref.gibran.atMostOriginal],
  [389, 29, 0]
);

// Source-frozen direct GF841 additive projections, start 1, no arbitrary IV.
const decodes = [];
for (const [index, projection] of ['constant', 'linear', 'trace'].entries()) {
  for (const sign of [-1, +1]) {
    const decoded = original.map((symbol, position) =>
      mod29(symbol + sign * fieldOrbit[position % PERIOD][index])
    );
    decodes.push({ projection, sign, GP29Ioc: ioc(decoded) });
  }
}
assert.ok(decodes.every((x) => x.GP29Ioc < 0.035));

// Two independent, exact positive plants:
const plain = latin.slice(1000, 1000 + PERIOD * 2);
assert.equal(plain.length, PERIOD * 2);
const additiveCipher = plain.map((symbol, i) =>
  mod29(symbol + fieldOrbit[i % PERIOD][2])
);
const additiveRecovered = additiveCipher.map((symbol, i) =>
  mod29(symbol - fieldOrbit[i % PERIOD][2])
);
assert.deepEqual(additiveRecovered, plain);

// One entirely secret GP29 permutation per 840-position clock value.
let seed = 0x84103301;
/** @param {number} maximum @returns {number} */
function randomIndex(maximum) {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  seed >>>= 0;
  return seed % maximum;
}
const permutations = [];
const inverses = [];
for (let state = 0; state < PERIOD; state++) {
  const permutation = [...Array(29).keys()];
  for (let i = permutation.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
  }
  const inverse = [];
  for (let i = 0; i < 29; i++) inverse[permutation[i]] = i;
  permutations.push(permutation);
  inverses.push(inverse);
}
const ciphertext = plain.map((symbol, i) => permutations[i % PERIOD][symbol]);
assert.deepEqual(
  ciphertext.map((symbol, i) => inverses[i % PERIOD][symbol]), plain
);
assert.equal(laggedEquality(ciphertext), laggedEquality(plain));

console.log(JSON.stringify({
  source: 'Original physical LP2 pp33–39, 1680 runes, and 2013 BASE29 3QO',
  p50DivisibleBy2013H: true,
  fieldPrimitiveRootOrder: PERIOD,
  chapterLength: original.length,
  observedSameRuneAtLag840: sourceLag840,
  observedLag840DifferenceIoc: sourceDifferenceIoc,
  sourceRawIoc: ioc(original),
  referenceNativeGpSameRuneAtLag840: ref,
  directUnfittedFieldProjections: decodes,
  positiveControls: {
    additiveTraceExactRecovered: additiveRecovered.length,
    hidden840PermutationExactRecovered: ciphertext.length,
    lag840EqualityPreserved: laggedEquality(ciphertext) === laggedEquality(plain)
  },
  conclusion: 'No recovered GP-native plaintext. Repeated 840-position bijective state is disfavored by source-like GP controls; period coincidence alone does not select a cipher.'
}, null, 2));
