'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const Q = 257;
const SIZE = 256;
const G = 38;

/** @param {string} file @returns {any} */
function load(file) {
  return JSON.parse(fs.readFileSync(
    path.join(__dirname, '..', 'resources', 'liber-primus', file), 'utf8'
  ));
}

/** @param {number} value @param {number} exponent @returns {number} */
function pow(value, exponent) {
  let result = 1;
  let base = value % Q;
  let e = exponent;
  while (e > 0) {
    if (e % 2) result = result * base % Q;
    base = base * base % Q;
    e = Math.floor(e / 2);
  }
  return result;
}

/** @param {number[]} values @param {number} frequency @returns {number} */
function spectralBin(values, frequency) {
  assert.equal(values.length, SIZE);
  const w = pow(G, frequency);
  let phase = 1;
  let sum = 0;
  for (const value of values) {
    sum = (sum + value * phase) % Q;
    phase = phase * w % Q;
  }
  return sum;
}

/** @param {number[]} values @returns {number[]} */
function spectrum(values) {
  return Array.from({length: SIZE}, (_, k) => spectralBin(values, k));
}

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function circularProduct(a, b) {
  assert.equal(a.length, SIZE);
  assert.equal(b.length, SIZE);
  const out = Array(SIZE).fill(0);
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const target = (i + j) % SIZE;
      out[target] = (out[target] + a[i] * b[j]) % Q;
    }
  }
  return out;
}

/**
 * Invert convolution on the image of the singular source circulant.
 * The one free Fourier component is fixed to zero for a canonical witness.
 * @param {number[]} source
 * @param {number[]} target
 * @returns {number[]}
 */
function inverseOnImage(source, target) {
  const bs = spectrum(source);
  const ys = spectrum(target);
  const ps = bs.map((b, k) => {
    if (b === 0) {
      assert.equal(ys[k], 0, 'Target violates necessary source spectral constraint');
      return 0;
    }
    return ys[k] * pow(b, Q - 2) % Q;
  });
  const inverseSize = pow(SIZE, Q - 2);
  return Array.from({length: SIZE}, (_, position) => {
    let sum = 0;
    for (let k = 0; k < SIZE; k++) {
      const phase = pow(G, (SIZE - (position * k % SIZE)) % SIZE);
      sum = (sum + ps[k] * phase) % Q;
    }
    return sum * inverseSize % Q;
  });
}

/** @param {string} text @param {string[]} alphabet @returns {number[]} */
function encodeGpWords(text, alphabet) {
  const tokens = alphabet.map((token, index) => ({token, index}))
    .sort((a, b) => b.token.length - a.token.length);
  const values = [];
  for (const word of text.split(' ')) {
    for (let i = 0; i < word.length;) {
      const match = tokens.find(({token}) => word.startsWith(token, i));
      assert.ok(match, 'Unsupported GP spelling ' + word.slice(i));
      values.push(match.index);
      i += match.token.length;
    }
  }
  return values;
}

const corpus = load('lp2-corpus.json');
const grid = load('lp2-grid-256.json');
const source = grid.bytes;
const p = number => corpus.pages.find(page => page.page === number).indices;
const [p29, p55, p56, p57] = [29, 55, 56, 57].map(p);
assert.equal(source.length, SIZE);
assert.equal(p29.length, 277);
assert.deepEqual([p55.length, p56.length, p57.length], [76, 85, 95]);
assert.equal(pow(G, SIZE), 1);
assert.notEqual(pow(G, SIZE / 2), 1);

const sourceSpectrum = spectrum(source);
const reversedSpectrum = spectrum(source.slice().reverse());
const zeroIndices = values => values.flatMap((v, k) => v === 0 ? [k] : []);
assert.deepEqual(zeroIndices(sourceSpectrum), [76]);
assert.deepEqual(zeroIndices(reversedSpectrum), [180]);

const terminal = [...p55, ...p56, ...p57];
assert.equal(terminal.length, SIZE);
assert.equal(spectralBin(terminal, 76), 70);
assert.equal(spectralBin(terminal, 180), 236);

const trueP56 = encodeGpWords(
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE',
  corpus.translit
);
assert.equal(trueP56.length, 85);
const hybrid = [...p55, ...trueP56, ...p57];
assert.equal(hybrid.length, SIZE);
assert.equal(spectralBin(hybrid, 76), 165);
assert.equal(spectralBin(hybrid, 180), 167);

const p29Windows = Array.from({length: p29.length - SIZE + 1},
  (_, offset) => p29.slice(offset, offset + SIZE));
assert.equal(p29Windows.length, 22);
assert.ok(p29Windows.every(window => spectralBin(window, 76) !== 0));
assert.ok(p29Windows.every(window => spectralBin(window, 180) !== 0));
assert.deepEqual(
  [spectralBin(p29Windows[0], 76), spectralBin(p29Windows[21], 76)],
  [183, 117]
);
assert.deepEqual(
  [spectralBin(p29Windows[0], 180), spectralBin(p29Windows[21], 180)],
  [133, 63]
);

// A mostly-authentic GP-native plaintext control: repeat the true clear p57,
// and alter exactly one original rune (index 5, GP L -> B) to enter the
// source circulant image without changing the 0..28 field representation.
const nativePlant = Array.from({length: SIZE}, (_, i) => p57[i % p57.length]);
assert.equal(nativePlant[5], 20);
nativePlant[5] = 17;
assert.equal(spectralBin(nativePlant, 76), 0);
assert.ok(nativePlant.every(value => value >= 0 && value <= 28));

const witness = inverseOnImage(source, nativePlant);
const reconstructed = circularProduct(source, witness);
assert.deepEqual(reconstructed, nativePlant);
assert.equal(witness.length, SIZE);
const singleCorruption = nativePlant.slice();
singleCorruption[0] = (singleCorruption[0] + 1) % Q;
assert.equal(spectralBin(singleCorruption, 76), 1);

// A full-field convolution is diagonalized by the declared forward DFT.
for (const k of [0, 1, 32, 76, 180, 255]) {
  assert.equal(spectralBin(reconstructed, k),
    sourceSpectrum[k] * spectralBin(witness, k) % Q);
}

console.log(JSON.stringify({
  source: 'LP2 unchanged p49-51 numeric bytes and p29, p55, p56, p57 GP indices',
  field: 'GF(257)',
  primitiveRoot: G,
  tableForwardSpectralZeros: zeroIndices(sourceSpectrum),
  tableReversedSpectralZeros: zeroIndices(reversedSpectrum),
  terminalCipherSpectral76And180: [70, 236],
  terminalWithSolvedP56Spectral76And180: [165, 167],
  p29Original256Windows: p29Windows.length,
  p29WindowsPassingEitherNecessaryConstraint: 0,
  sourceNativeGPPlant: {
    oneRuneModification: {index: 5, before: 20, after: 17},
    recoveredPositions: reconstructed.length,
    fieldKeyPrefix: witness.slice(0, 12)
  },
  verdict: 'PASS: both frozen singular-circulant receivers impossible on original ciphertext'
}, null, 2));
