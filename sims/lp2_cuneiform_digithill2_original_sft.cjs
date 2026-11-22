'use strict';

/** Original-cipher gate for physical LP2 pp34–39: cuneiform positional digits as Hill-2 matrix. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const directory = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(directory, 'lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(directory, 'lp2-transcription.txt'), 'utf8');
const modulus = 29;
const mod = (n) => ((n % modulus) + modulus) % modulus;
const transpose = (matrix) => [[matrix[0][0], matrix[1][0]], [matrix[0][1], matrix[1][1]]];

/**
 * Transform source runes in consecutive two-rune groups, with exact source order.
 * @param {number[]} stream
 * @param {number[][]} matrix
 * @returns {number[]}
 */
function hill2(stream, matrix) {
  assert.equal(stream.length % 2, 0);
  const result = [];
  for (let i = 0; i < stream.length; i += 2) {
    const a = stream[i];
    const b = stream[i + 1];
    result.push(mod(matrix[0][0] * a + matrix[0][1] * b));
    result.push(mod(matrix[1][0] * a + matrix[1][1] * b));
  }
  return result;
}

/** @param {number[]} stream */
function indexOfCoincidence(stream) {
  const count = Array(modulus).fill(0);
  for (const symbol of stream) count[symbol]++;
  return count.reduce((sum, c) => sum + c * (c - 1), 0) / (stream.length * (stream.length - 1));
}

const pageNumbers = [34, 35, 36, 37, 38, 39];
const lengths = pageNumbers.map((p) => corpus.pages[p].indices.length);
assert.deepEqual(lengths, [261, 271, 238, 228, 228, 240]);

const pages = transcription.split('%');
const source = pageNumbers.map((p) => pages[p]);
const sourceStream = [];
for (let j = 0; j < pageNumbers.length; j++) {
  const printed = Array.from(source[j]).filter((symbol) => corpus.runes.includes(symbol)).map((symbol) => corpus.runes.indexOf(symbol));
  assert.deepEqual(printed, corpus.pages[pageNumbers[j]].indices);
  sourceStream.push(...printed);
}
assert.equal(sourceStream.length, 1466);

// The wedge ink shows the positional groups (17,13) and (55,1).
// Reading four digits row-major is the simplest distinct Hill-2 *hypothesis*;
// the source visibly specifies numerals, but never says to multiply matrices.
const raw = [[17, 13], [55, 1]];
const det = raw[0][0] * raw[1][1] - raw[0][1] * raw[1][0];
assert.equal(det, -698);
assert.equal(((det % 60) + 60) % 60, 22); // not invertible mod60: gcd(22,60)=2
const key = [[17, 13], [26, 1]];
assert.equal(mod(det), 27);
assert.equal(mod(27 * 14), 1);
const inverse = [[14, 21], [13, 6]];
const multiply = (x, y) => [
  [mod(x[0][0] * y[0][0] + x[0][1] * y[1][0]), mod(x[0][0] * y[0][1] + x[0][1] * y[1][1])],
  [mod(x[1][0] * y[0][0] + x[1][1] * y[1][0]), mod(x[1][0] * y[0][1] + x[1][1] * y[1][1])]
];
assert.deepEqual(multiply(key, inverse), [[1, 0], [0, 1]]);
assert.deepEqual(multiply(inverse, key), [[1, 0], [0, 1]]);

// Lines wrap but '/' is not a printed word separator.
// '-' and punctuation are word separators. Cross-page runes stay in page order.
const wordText = source.join('&').replace(/[\/\s]/g, '');
const runeSet = corpus.runes.join('');
const words = wordText.split(new RegExp('[^' + runeSet + ']+', 'u')).filter(Boolean);
const singletonPositions = [];
let cursor = 0;
for (const word of words) {
  if (word.length === 1) singletonPositions.push(cursor);
  cursor += word.length;
}
assert.equal(words.length, 327);
assert.equal(cursor, sourceStream.length);
assert.deepEqual(singletonPositions, [104, 153, 385, 504, 898, 1072, 1228, 1381]);

const candidates = [
  ['Hill inverse, column', inverse, key, 0.035101900181124836],
  ['Hill inverse, row', transpose(inverse), transpose(key), 0.03440999399354656],
  ['Hill direct, column', key, inverse, 0.03478528092974312],
  ['Hill direct, row', transpose(key), transpose(inverse), 0.034618590206221565]
];
const results = [];
for (const [name, decoder, encoder, expectedIoC] of candidates) {
  const plaintext = hill2(sourceStream, decoder);
  assert.deepEqual(hill2(plaintext, encoder), sourceStream);
  const ioc = indexOfCoincidence(plaintext);
  assert.ok(Math.abs(ioc - expectedIoC) < 1e-12);
  const singletonValues = singletonPositions.map((position) => plaintext[position]);
  assert.equal(new Set(singletonValues).size, 8);
  results.push({
    name,
    indexOfCoincidence: ioc,
    distinctSingletonRunes: new Set(singletonValues).size,
    singletonTransliteration: singletonValues.map((number) => corpus.translit[number]),
    first60: plaintext.slice(0, 60).map((number) => corpus.translit[number]).join('')
  });
}

// Independent exact solved-source plant, with no use of original unknown plaintext.
const known = corpus.pages[57].indices.slice(0, 94);
assert.equal(known.length, 94);
assert.deepEqual(hill2(hill2(known, key), inverse), known);
assert.deepEqual(hill2(hill2(known, transpose(key)), transpose(inverse)), known);

const a = corpus.translit.indexOf('A');
const i = corpus.translit.indexOf('I');
const planted = sourceStream.slice();
singletonPositions.forEach((position, number) => { planted[position] = number % 2 ? i : a; });
const encrypted = hill2(planted, key);
const recovered = hill2(encrypted, inverse);
assert.deepEqual(recovered, planted);
assert.equal(new Set(singletonPositions.map((position) => recovered[position])).size, 2);

console.log(JSON.stringify({
  sourcePages: pageNumbers,
  sourceRuneCount: sourceStream.length,
  sourceWords: words.length,
  sourceSingletons: singletonPositions.length,
  sourceIoC: indexOfCoincidence(sourceStream),
  rawNumeralMatrix: raw,
  determinant: det,
  base60DeterminantNonunit: 22,
  base29Inverse: inverse,
  solvedPage57Positive: '94/94 exact',
  sourceShapePositive: '8/8 single-rune positions recover A/I',
  candidates: results
}, null, 2));
