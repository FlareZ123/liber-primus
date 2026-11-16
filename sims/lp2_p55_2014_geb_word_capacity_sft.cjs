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
