'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'resources', 'lp2-transcription.txt'), 'utf8');
const alphabet = new Set(corpus.runes);

/**
 * Read original rune characters, excluding visual punctuation and layout markers.
 * @param {string} value
 * @returns {string}
 */
function onlyRunes(value) {
  return Array.from(value).filter((ch) => alphabet.has(ch)).join('');
}

const source = transcription.split('%').find((section) => onlyRunes(section).length === 76);
assert.equal(typeof source, 'string', 'Expected one 76-rune p55 source section');
assert.equal(
  transcription.split('%').filter((section) => onlyRunes(section).length === 76).length,
  1,
  '76-rune original section must be unique',
);
const words = source
  .replace(/\/\r?\n/g, '')
  .split(/[-.]/)
  .map(onlyRunes)
  .filter(Boolean);
const lengths = words.map((word) => word.length);
const original = corpus.pages.find((page) => page.page === 55);
assert.ok(original);
assert.equal(words.join(''), original.indices.map((index) => corpus.runes[index]).join(''));
assert.deepEqual(lengths, [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
assert.equal(lengths.reduce((sum, length) => sum + length, 0), 76);
assert.equal(lengths.length, 17);
assert.equal(lengths.filter((length) => length === 1).length, 1);
const interiors = words.map((word) => word.slice(1, -1));
assert.equal(interiors.join('').length, 43);

const capacity = Object.fromEntries(
  [1, 2, 3, 4, 5].map((width) => [
    width,
    lengths.filter((length) => length >= width).length,
  ]),
);
assert.equal(capacity[3], 11);
assert.equal(capacity[4], 9);
assert.equal(capacity[5], 7);
assert.ok(capacity[4] < 14, 'Cannot fit fourteen four-field coordinate records');
assert.ok(capacity[3] < 14, 'Cannot fit fourteen three-field records even with omitted chapter');
console.log('SOURCE: exact physical p55/76 original runes and 17 words match both local witnesses');
console.log('WORDS:', words.join(' | '));
console.log('WORD LENGTHS:', lengths.join(','));
console.log('STRICT INTERIOR GLYPHS:', interiors.join('').length);
console.log('CAPACITY by minimum field width:', JSON.stringify(capacity));
console.log('HISTORICAL 2014 GEB RECORDS: 14 chapter:exchange:word:letter');
console.log('RESULT: nine >=4 words and eleven >=3 words, so direct one-record-per-word transfer is impossible');

const base32 = 'abcdefghijklmnopqrstuvwxyz234567';
const sourceHost = 'ut3qtzbrvs7dtvzp';
const key = Array.from(sourceHost, (ch) => base32.indexOf(ch) % 29);
assert.equal(key.length, 16);
assert.deepEqual(key, [20, 19, 27, 16, 19, 25, 1, 17, 21, 18, 2, 3, 19, 21, 25, 15]);
const bodyWords = words.slice(1).map((word) => Array.from(word, (ch) => corpus.runes.indexOf(ch)));
assert.equal(bodyWords.length, 16);
assert.equal(bodyWords.reduce((sum, w) => sum + w.length, 0), 75);
const plain75 = corpus.pages.find((page) => page.page === 57).indices.slice(0, 75);
assert.equal(plain75.length, 75);

/**
 * Decode or encrypt using one historical hostname symbol per original word.
 * @param {number[]} word
 * @param {number} shift
 * @returns {number[]}
 */
const translate = (word, shift) => word.map((index) => ((index + shift) % 29 + 29) % 29);

/** @param {number[][]} ws @returns {number} */
function ioc(ws) {
  const values = ws.flat();
  const frequencies = Array(29).fill(0);
  values.forEach((index) => { frequencies[index] += 1; });
  return frequencies.reduce((sum, n) => sum + n * (n - 1), 0) / (values.length * (values.length - 1));
}

/** @param {number[][]} ws @returns {string} */
function transliteration(ws) {
  return ws.map((word) => word.map((index) => corpus.translit[index]).join('')).join(' | ');
}
assert.ok(Math.abs(ioc(bodyWords) - 0.03855855855855856) < 1e-12);
for (const sign of [-1, 1]) {
  const result = bodyWords.map((word, i) => translate(word, sign * key[i]));
  const expected = sign < 0 ? 0.03711711711711712 : 0.02990990990990991;
  assert.ok(Math.abs(ioc(result) - expected) < 1e-12);
  const reenciphered = result.map((word, i) => translate(word, -sign * key[i]));
  assert.deepEqual(reenciphered, bodyWords);
  const plantWords = [];
  let offset = 0;
  for (let i = 0; i < bodyWords.length; i += 1) {
    const clear = plain75.slice(offset, offset + bodyWords[i].length);
    plantWords.push(translate(clear, -sign * key[i]));
    offset += clear.length;
  }
  assert.deepEqual(
    plantWords.map((word, i) => translate(word, sign * key[i])).flat(),
    plain75,
    'Solved original-p57-derived 75-position positive must roundtrip',
  );
  console.log('GEB original word-key sign=' + sign + ' IoC=' + ioc(result).toFixed(12));
  console.log('GEB decoded:', transliteration(result));
}
console.log('CONCLUSION: 16 authentic Fifth Onion hostname digits do not decode any complete p55 original prose');
