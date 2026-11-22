'use strict';

/**
 * Source-frozen LP2 p39 Q252 line-overhead additive inverse.
 *
 * Frozen hypothesis: divide the original 256 GP29 grid coefficients in
 * printed order by the signed-2013 H and the p39 red G. Consume the 252
 * quotient coefficients in 12 physical p39 line packets: one line salt,
 * followed by one rune pad per printed rune. P = C - (salt + pad) mod 29.
 *
 * No fitted phase, reverse reading, skipped rune, or shifted line boundary.
 * Node.js 22, CommonJS, no dependencies, read-only single-file test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const root = path.resolve(__dirname, '..');

/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
/** @param {string} name @returns {any} */
const load = name => JSON.parse(read(name));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const source = load('resources/liber-primus/lp2-grid-256.json');
const original = corpus.pages.find(page => page.page === 39).indices;
const modulo = x => (x % 29 + 29) % 29;
assert.equal(original.length, 240);
assert.deepEqual(original.slice(119, 122), [27, 5, 15]);
assert.equal(source.bytes.length, 256);
assert.equal(createHash('sha256').update(Buffer.from(source.bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

// Original transcription separates physical pages by a standalone % and
// original printed lines by LF. Ignore decorative empty lines and glyph
// delimiters; independently compare every extracted rune to the corpus.
const sourcePage = read('resources/liber-primus/lp2-transcription.txt')
  .split(/\n%\n/)[39];
const glyphs = new Map(corpus.runes.map((rune, index) => [rune, index]));
const sourceLines = sourcePage.split('\n').map(line =>
  Array.from(line).filter(character => glyphs.has(character))
    .map(character => glyphs.get(character))).filter(line => line.length);
const lineLengths = sourceLines.map(line => line.length);
assert.deepEqual(lineLengths, [23, 22, 24, 22, 23, 5, 19, 18, 18, 26, 23, 17]);
assert.deepEqual(sourceLines.flat(), original);
assert.equal(sourceLines.length, 12);
assert.equal(lineLengths.slice(0, 6).reduce((a, b) => a + b, 0), 119);

// Ascending coefficients: 2013 BASE29 H = 3+26x+24x^2;
// p39 visibly red G = 27+5x+15x^2. Grid coefficients are descending.
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a, b) {
  const product = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      product[i + j] = modulo(product[i + j] + a[i] * b[j]);
  return product;
}
const factor = multiply([3, 26, 24], [27, 5, 15]).reverse();
assert.deepEqual(factor, [12, 17, 11, 21, 23]);

/** @param {number[]} bytes */
function divideGrid(bytes) {
  const working = bytes.map(modulo);
  const quotient = [];
  const inv12 = 17; // 12*17 = 1 mod 29
  for (let position = 0; position < 252; position++) {
    const coefficient = modulo(working[position] * inv12);
    quotient.push(coefficient);
    for (let j = 0; j < factor.length; j++)
      working[position + j] = modulo(
        working[position + j] - coefficient * factor[j]);
  }
  return {quotient, remainder: working.slice(252)};
}
const {quotient, remainder} = divideGrid(source.bytes);
assert.equal(quotient.length, 252);
assert.deepEqual(remainder, [0, 0, 0, 0]);
assert.deepEqual(quotient.slice(0, 10), [0, 12, 9, 28, 2, 25, 23, 21, 18, 28]);

// A wrong original-source byte changes the fixed factor remainder and
// therefore fails the source identity before any linguistic selection.
const wrongBytes = source.bytes.slice();
wrongBytes[0] = (wrongBytes[0] + 1) % 256;
assert.notDeepEqual(divideGrid(wrongBytes).remainder, [0, 0, 0, 0]);

const lineSalts = [];
const runePads = [];
let take = 0;
for (const length of lineLengths) {
  const salt = quotient[take++];
  lineSalts.push(salt);
  for (let j = 0; j < length; j++)
    runePads.push(modulo(salt + quotient[take++]));
}
assert.equal(take, quotient.length);
assert.equal(runePads.length, original.length);
assert.deepEqual(lineSalts, [0, 12, 23, 7, 10, 4, 10, 5, 13, 16, 20, 3]);

/** @param {number[]} encrypted @returns {number[]} */
const decode = encrypted => encrypted.map((symbol, i) =>
  modulo(symbol - runePads[i]));
/** @param {number[]} plaintext @returns {number[]} */
const encode = plaintext => plaintext.map((symbol, i) =>
  modulo(symbol + runePads[i]));
const plaintext = decode(original);
assert.deepEqual(encode(plaintext), original);
assert.deepEqual(plaintext.slice(119, 122), [16, 4, 10]); // "TRI"
const originalOutput = plaintext.map(x => corpus.translit[x]);
assert.equal(originalOutput.length, 240);

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const frequencies = Array(29).fill(0);
  for (const x of symbols) frequencies[x]++;
  return frequencies.reduce((sum, count) => sum + count * (count - 1), 0)
    / (symbols.length * (symbols.length - 1));
}
assert.ok(Math.abs(ioc(original) - 0.035774058577405864) < 1e-12);
assert.ok(Math.abs(ioc(plaintext) - 0.032880055788005576) < 1e-12);

// Use established native-GP normalization, fixed on solved LP1 studies.
const tokens = corpus.translit.map((spelling, index) => ({spelling, index}))
  .sort((a, b) => b.spelling.length - a.spelling.length);
/** @param {string} raw @returns {number[]} */
function gpEncode(raw) {
  const text = raw.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (const word of text.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const next = tokens.find(item => word.startsWith(item.spelling, i));
      assert.ok(next, 'GP source transliteration must be complete');
      out.push(next.index);
      i += next.spelling.length;
    }
  }
  return out;
}
const shakespeare = read('resources/control/shakespeare_first300k.txt');
const train = gpEncode(shakespeare.slice(0, 240000));
const first = new Uint32Array(29);
const second = new Uint32Array(29 * 29);
const third = new Uint32Array(29 * 29 * 29);
for (let i = 0; i < train.length; i++) {
  const x = train[i];
  first[x]++;
  if (i > 0) second[train[i - 1] * 29 + x]++;
  if (i > 1) third[(train[i - 2] * 29 + train[i - 1]) * 29 + x]++;
}
/** @param {number[]} symbols @returns {number} */
function score(symbols) {
  let total = 0;
  for (let i = 0; i < symbols.length; i++) {
    const x = symbols[i];
    let probability = (first[x] + 1) / (train.length + 29);
    if (i > 0)
      probability = (second[symbols[i - 1] * 29 + x] + 8 * probability) /
        (first[symbols[i - 1]] + 8);
    if (i > 1)
      probability = (third[(symbols[i - 2] * 29 + symbols[i - 1]) * 29 + x] +
        8 * probability) / (second[symbols[i - 2] * 29 + symbols[i - 1]] + 8);
    total += Math.log(probability);
  }
  return total / symbols.length;
}
const originalScore = score(original);
const decodedScore = score(plaintext);
assert.ok(Math.abs(originalScore + 6.384357076390178) < 1e-9);
assert.ok(Math.abs(decodedScore + 6.55715494272717) < 1e-9);

// An actual native-GP plant of the full original physical length must
// recover 240/240 runes and round trip using the identical fixed pads.
const gibran = gpEncode(read('resources/control/gibran_prophet_58585.txt'));
const plant = gibran.slice(0, original.length);
assert.equal(plant.length, 240);
assert.deepEqual(decode(encode(plant)), plant);
assert.deepEqual(encode(decode(encode(plant))), encode(plant));

// Holdouts use 240-rune nonoverlapping windows, preserving independent
// source records; no original ciphertext is used to train the language model.
const controls = [
  ['Shakespeare heldout', gpEncode(shakespeare.slice(240000))],
  ['Gibran', gibran],
  ['Emerson', gpEncode(read('resources/control/emerson_essays_2944.txt'))]
];
const comparison = [];
for (const [name, symbols] of controls) {
  const scores = [], frequencies = [];
  for (let i = 0; i + 240 <= symbols.length; i += 240) {
    const window = symbols.slice(i, i + 240);
    scores.push(score(window));
    frequencies.push(ioc(window));
  }
  scores.sort((a, b) => a - b);
  frequencies.sort((a, b) => a - b);
  comparison.push({
    name, windows: scores.length, minimumScore: scores[0],
    minimumIoC: frequencies[0],
    lessOrEqualScore: scores.filter(value => value <= decodedScore).length,
    lessOrEqualIoC: frequencies.filter(value => value <= ioc(plaintext)).length
  });
}
assert.deepEqual(comparison.map(x => x.windows), [182, 262, 1352]);
assert.deepEqual(comparison.map(x => [x.lessOrEqualScore, x.lessOrEqualIoC]),
  [[0, 0], [0, 0], [0, 0]]);

let from = 0;
const recoveredLines = lineLengths.map((length, index) => {
  const decodedRunes = originalOutput.slice(from, from + length).join('');
  from += length;
  return {line: index + 1, salt: lineSalts[index], length, decodedRunes};
});
assert.equal(from, 240);
console.log(JSON.stringify({
  experiment: 'Original p39, H/G Q252 12-line one-salt-per-line inverse',
  inputPages: 'pp49–51 full 256-cell original grid and p39 240 printed runes',
  totalConsumedQuotientSymbols: take,
  lineLengths, lineSalts, originalIoC: ioc(original), decodedIoC: ioc(plaintext),
  originalScore, decodedScore, nativeControls: comparison,
  originalRoundTrip: '240/240', nativePlantRecovered: '240/240',
  red119Decoded: originalOutput.slice(119, 122).join(''),
  recoveredLines,
  recoveredAuthenticPlaintext: false
}, null, 2));
