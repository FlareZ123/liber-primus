'use strict';

/**
 * Source-frozen GP29 power-feedback inverse for original LP2 pp33–39.
 * Test: node sims/lp2_cuneiform1033_powerfeedback_original_sft.cjs
 *
 * Hypothesis, not an established Cicada mechanism:
 * c[i] = (p[i] + c[i-1])^25 mod 29;
 * p[i] = c[i]^9 - c[i-1] mod 29.
 * The exponents follow from the original cuneiform 1033 and 3301:
 * both are 25 modulo phi(29)=28, and 25*9=1 modulo 28.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');

const mod = (x) => (x % 29 + 29) % 29;

/** @param {number} base @param {number} exp @returns {number} */
function pow29(base, exp) {
  let value = 1;
  for (let i = 0; i < exp; i++) value = (value * base) % 29;
  return value;
}

/** @param {number[]} input @param {number} iv @returns {number[]} */
function decode(input, iv = 0) {
  let previous = iv;
  return input.map((cipher) => {
    const plain = mod(pow29(cipher, 9) - previous);
    previous = cipher;
    return plain;
  });
}

/** @param {number[]} input @param {number} iv @returns {number[]} */
function encode(input, iv = 0) {
  let previous = iv;
  return input.map((plain) => {
    const cipher = pow29(mod(plain + previous), 25);
    previous = cipher;
    return cipher;
  });
}

/** @param {number[]} input @returns {number} */
function coincidence(input) {
  const histogram = Array(29).fill(0);
  for (const rune of input) histogram[rune]++;
  return histogram.reduce((sum, n) => sum + n * (n - 1), 0) / (input.length * (input.length - 1));
}

assert.equal(1033 % 28, 25);
assert.equal(3301 % 28, 25);
assert.equal((25 * 9) % 28, 1);
for (let rune = 0; rune < 29; rune++) {
  assert.equal(pow29(pow29(rune, 25), 9), rune);
}

const pageNumbers = [33, 34, 35, 36, 37, 38, 39];
const pageLengths = [214, 261, 271, 238, 228, 228, 240];
assert.deepEqual(pageNumbers.map((n) => corpus.pages[n].indices.length), pageLengths);
const firstRubricLength = 91;
const source = pageNumbers.flatMap((n) => corpus.pages[n].indices).slice(firstRubricLength);
assert.equal(source.length, 1589);

// The real text is printed with page-carry words. A '/' is a line wrap,
// '%' is a physical page break, while '-' and '.' terminate printed words.
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const pages = transcription.split(/^\s*%\s*$/m);
assert.equal(pages.length, 57); // p50's number-only page is omitted from this text file.
let visible = pages.slice(33, 40).join('').replace(/[\r\n/]/g, '');
let cursor = 0;
let seen = 0;
while (seen < firstRubricLength) {
  if (runeIndex.has(visible[cursor])) seen++;
  cursor++;
}
visible = visible.slice(cursor);

const visibleRunes = [...visible].filter((rune) => runeIndex.has(rune)).map((rune) => runeIndex.get(rune));
assert.deepEqual(visibleRunes, source);

const words = [];
let word = [];
let position = 0;
for (const rune of visible) {
  if (runeIndex.has(rune)) {
    word.push(position++);
  } else if (rune === '-' || rune === '.' || rune === '&') {
    if (word.length) words.push(word);
    word = [];
  }
}
if (word.length) words.push(word);
assert.equal(position, 1589);
assert.equal(words.length, 355);
const singletonOffsets = words.filter((w) => w.length === 1).map((w) => w[0]);
assert.deepEqual(singletonOffsets, [47, 227, 276, 508, 627, 1021, 1195, 1351, 1504]);

const plain = decode(source);
assert.deepEqual(encode(plain), source);
const singletonSymbols = singletonOffsets.map((offset) => corpus.translit[plain[offset]]);
assert.deepEqual(singletonSymbols, ['D', 'EO', 'TH', 'W', 'X', 'D', 'G', 'EO', 'S']);
const englishSingletons = new Set([24, 10, 3]); // GP A, I, O
assert.equal(singletonOffsets.filter((i) => englishSingletons.has(plain[i])).length, 0);
const starts = [0, 123, 384, 655, 893, 1121, 1349];
assert.equal(singletonOffsets.some((i) => starts.includes(i)), false);
const withheld = singletonOffsets.filter((i) => i >= 893);
assert.equal(withheld.length, 4);
assert.equal(withheld.filter((i) => englishSingletons.has(plain[i])).length, 0);

// A genuine author-clear GP29 page supplies a positive known-text codec test.
const positive = corpus.pages[57].indices;
assert.equal(positive.length, 95);
const encryptedPositive = encode(positive);
assert.deepEqual(decode(encryptedPositive), positive);
assert.deepEqual(encode(decode(encryptedPositive)), encryptedPositive);

console.log('Cuneiform exponents 1033=3301=25 mod 28; unique power inverse 9');
console.log('Original p33[91..] + pp34–39:', source.length, 'GP29 runes,', words.length, 'printed words');
console.log('Original GP IoC:', coincidence(source).toFixed(11));
console.log('Power-feedback GP IoC:', coincidence(plain).toFixed(11));
console.log('Whole-stream original round trip:', source.length + '/' + source.length);
console.log('All 9 original singleton outputs:', singletonSymbols.join(' '));
console.log('A/I/O singletons:', '0/9; withheld pp37–39 0/4');
console.log('Real solved p57 rune positive:', positive.length + '/' + positive.length);
console.log('Decision: this complete, frozen nonlinear feedback cipher is not native-GP English on the original marked span.');
