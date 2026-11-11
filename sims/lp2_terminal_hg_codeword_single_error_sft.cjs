'use strict';

/**
 * SFT: exact [256,252,3] H/G parity gate on four original terminal-rune
 * orderings. The factor and terminal counts are fixed by original sources.
 * A positive plant demonstrates one-rune error correction.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'
));
const FIELD = 29;
const H2013 = [3, 26, 24];
const GP39 = [27, 5, 15];

/** @param {number} number @returns {number} */
function mod(number) { return ((number % FIELD) + FIELD) % FIELD; }

/** @param {number} x @returns {number} */
function inverse(x) {
  for (let k = 1; k < FIELD; k++) if (mod(x * k) === 1) return k;
  throw new Error('Noninvertible field element ' + x);
}

/**
 * Multiply ascending-power polynomials over GF29.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
function multiplyAscending(a, b) {
  const product = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) product[i + j] = mod(product[i + j] + a[i] * b[j]);
  }
  return product;
}

/**
 * Divide descending-power source coefficients by ascending-power factor.
 * @param {number[]} descending
 * @param {number[]} factor
 * @returns {number[]}
 */
function syndrome(descending, factor) {
  const work = descending.map(mod).reverse();
  const invLead = inverse(factor[factor.length - 1]);
  for (let i = work.length - factor.length; i >= 0; i--) {
    const multiple = mod(work[i + factor.length - 1] * invLead);
    for (let j = 0; j < factor.length; j++) {
      work[i + j] = mod(work[i + j] - multiple * factor[j]);
    }
  }
  return work.slice(0, factor.length - 1);
}

/**
 * Rune conversion in established GP orthography, no cross-word digraphs.
 * @param {string} phrase
 * @returns {number[]}
 */
function encodeWords(phrase) {
  const tokens = corpus.translit.map((token, index) => ({token, index}))
    .sort((a, b) => b.token.length - a.token.length);
  /** @type {number[]} */
  const output = [];
  for (const word of phrase.split(' ')) {
    for (let i = 0; i < word.length;) {
      const found = tokens.find(({token}) => word.startsWith(token, i));
      assert.ok(found, 'Invalid GP word spelling ' + word);
      output.push(found.index);
      i += found.token.length;
    }
  }
  return output;
}

const p55 = corpus.pages[55].indices;
const p56Visible = corpus.pages[56].indices;
const p57 = corpus.pages[57].indices;
const p56Known = encodeWords(
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'
);
assert.deepEqual([p55.length, p56Visible.length, p56Known.length, p57.length],
  [76, 85, 85, 95]);

const coefficient = multiplyAscending(H2013, GP39);
assert.deepEqual(coefficient, [23, 21, 11, 17, 12]);

const sourceBytes = grid.rows.flat().map(token =>
  60 * grid.alphabet.indexOf(token[0]) + grid.alphabet.indexOf(token[1])
);
assert.equal(sourceBytes.length, 256);
assert.deepEqual(syndrome(sourceBytes, coefficient), [0, 0, 0, 0],
  'Original table must be the H/G codeword');

/** @type {Array<[number,number]>} */
const perimeter = [];
for (let x = 0; x < 8; x++) perimeter.push([0, x]);
for (let y = 1; y < 32; y++) perimeter.push([y, 7]);
for (let x = 6; x >= 0; x--) perimeter.push([31, x]);
for (let y = 30; y >= 1; y--) perimeter.push([y, 0]);
/** @type {Array<[number,number]>} */
const interior = [];
for (let y = 1; y <= 30; y++) {
  for (let x = 1; x <= 6; x++) interior.push([y, x]);
}
assert.deepEqual([perimeter.length, interior.length], [76, 180]);

/**
 * Place original p55 into printed rectangle perimeter and the original
 * 85+95 terminal runes in natural printed interior row-major order.
 * @param {number[]} outside
 * @param {number[]} inside
 * @returns {number[]}
 */
function placeRing(outside, inside) {
  assert.deepEqual([outside.length, inside.length], [76, 180]);
  const output = Array(256);
  perimeter.forEach(([y, x], i) => { output[y * 8 + x] = outside[i]; });
  interior.forEach(([y, x], i) => { output[y * 8 + x] = inside[i]; });
  assert.ok(output.every(Number.isInteger));
  return output;
}

// Complete weight-one syndrome dictionary: [256,252,3] has 256*28
// different nonzero syndromes, so every one-error correction is unique.
const singleError = new Map();
for (let at = 0; at < 256; at++) {
  const basis = Array(256).fill(0);
  basis[at] = 1;
  const s = syndrome(basis, coefficient);
  for (let delta = 1; delta < 29; delta++) {
    const key = s.map(n => mod(n * delta)).join(',');
    assert.ok(!singleError.has(key), 'Syndrome alias contradicts distance 3');
    singleError.set(key, {at, delta});
  }
}
assert.equal(singleError.size, 7168);

const sourceOriginal = sourceBytes.map(n => n % FIELD);
const planted = sourceOriginal.slice();
planted[55] = mod(planted[55] + 7);
const detected = singleError.get(syndrome(planted, coefficient).join(','));
assert.deepEqual(detected, {at: 55, delta: 7});
planted[detected.at] = mod(planted[detected.at] - detected.delta);
assert.deepEqual(planted, sourceOriginal, 'One error corrected on true source codeword');

const alternatives = {
  'p55+p56-printed+p57 row-major concatenation': [...p55, ...p56Visible, ...p57],
  'p55+p56-solved+p57 row-major concatenation': [...p55, ...p56Known, ...p57],
  'p55 perimeter; p56-printed+p57 interior': placeRing(p55, [...p56Visible, ...p57]),
  'p55 perimeter; p56-solved+p57 interior': placeRing(p55, [...p56Known, ...p57])
};
const expected = [
  [2, 16, 22, 3],
  [17, 12, 10, 6],
  [28, 15, 15, 10],
  [4, 16, 17, 15]
];
const outcomes = [];
for (const [name, runes] of Object.entries(alternatives)) {
  assert.equal(runes.length, 256);
  const s = syndrome(runes, coefficient);
  assert.deepEqual(s, expected[outcomes.length]);
  const correction = singleError.get(s.join(',')) || null;
  assert.equal(correction, null, 'Unexpected near-codeword must be investigated');
  outcomes.push({name, syndrome: s, oneErrorCorrection: correction});
}
console.log(JSON.stringify({
  factor: coefficient,
  originalGridSyndrome: syndrome(sourceBytes, coefficient),
  sourcePlant: 'Original exact one-error correction at byte55 with delta7',
  code: {length: 256, dimension: 252, distance: 3,
    distinctOneErrorSyndromes: singleError.size},
  outcomes,
  conclusion: 'No terminal-rune model is an H/G codeword or one edit away; no p55 decryption'
}, null, 2));
