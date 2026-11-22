'use strict';

/**
 * Original-book contiguous H-word readout gate.
 * Node.js 22 CommonJS; read-only, deterministic single-file test.
 *
 * H(x,y)=(x-y,x+y) mod29 pairs each word from its circumference inward.
 * The sum of H outputs is 2*(sum of left-half indices) plus the odd center.
 * Treat the checksum as a zero-based word index of the signed 2016 message.
 * This file tests the precise literal uninterrupted-reading hypothesis.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const source = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const signed = fs.readFileSync(path.join(root, 'resources/historical/cicada2016-4gq25-outguess.asc'), 'utf8');
const alphabet = new Map(corpus.runes.map((rune, value) => [rune, value]));
const pageText = source.split('%');
assert.equal(pageText.length, 57);

const words = [];
let current = [];
let physicalPage = 0;
let localRuneOffset = 0;
let originalTotal = 0;

/** Close an authentic printed word; page and line wraps remain within a word. */
function closeWord() {
  if (current.length === 0) return;
  const half = Math.floor(current.length / 2);
  const left = current.slice(0, half).reduce((total, rune) => total + rune.value, 0);
  const center = current.length % 2 === 1 ? current[half].value : 0;
  words.push({
    page: current[0].page,
    offset: current[0].offset,
    lastPage: current[current.length - 1].page,
    length: current.length,
    h: (2 * left + center) % 29,
  });
  current = [];
}

for (let printed = 0; printed < pageText.length; printed++) {
  physicalPage = printed >= 50 ? printed + 1 : printed; // physical p50 is the runeless grid
  localRuneOffset = 0;
  const exact = [];
  for (const rune of pageText[printed]) {
    const value = alphabet.get(rune);
    if (value !== undefined) {
      current.push({ value, page: physicalPage, offset: localRuneOffset++ });
      exact.push(value);
      originalTotal++;
    } else if (rune === '-' || rune === '.') {
      closeWord();
    }
  }
  assert.deepEqual(exact, corpus.pages[physicalPage].indices, 'unmodified glyphs of p' + physicalPage);
}
closeWord();
assert.equal(originalTotal, 13136);
assert.equal(corpus.pages[50].indices.length, 0);
assert.equal(words.length, 2941);

const unknown = words.filter((word) => word.page <= 55);
assert.equal(unknown.length, 2896);
assert.equal(unknown.reduce((n, word) => n + word.length, 0), 12956);
assert.equal(unknown.filter((word) => word.lastPage !== word.page).length, 32);
assert.equal(words.filter((word) => word.page === 56).length, 25);
assert.equal(words.filter((word) => word.page === 57).length, 20);

// Split the original PGP cleartext at the actual signature. Exclude the
// numeric 3301 token and mixed-alphanumeric fingerprint 7A35090F.
const body = signed.slice(
  signed.indexOf('Hash: SHA1') + 'Hash: SHA1'.length,
  signed.indexOf('-----BEGIN PGP SIGNATURE-----')
);
const signedWords = body.trim().split(/\s+/)
  .map((token) => token.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, ''))
  .filter((token) => /^[A-Za-z]+$/.test(token))
  .map((token) => token.toUpperCase());
assert.equal(signedWords.length, 43);
assert.deepEqual(signedWords.slice(17, 24),
  ['THE', 'MAP', 'THEIR', 'MEANING', 'IS', 'THE', 'ROAD']);

const lexical = [];
const numeric = [];
for (let start = 0; start < words.length; start++) {
  for (let index = 0; index < signedWords.length; index++) {
    let size = 0;
    while (start + size < words.length && index + size < signedWords.length &&
      signedWords[words[start + size].h] === signedWords[index + size]) size++;
    if (size >= 3) lexical.push({
      page: words[start].page, offset: words[start].offset,
      sourceIndex: index, size,
      h: words.slice(start, start + size).map((word) => word.h),
    });

    size = 0;
    while (start + size < words.length && index + size < 29 &&
      words[start + size].h === index + size) size++;
    if (size >= 3) numeric.push({
      page: words[start].page, offset: words[start].offset,
      sourceIndex: index, size,
    });
  }
}

assert.equal(lexical.length, 9); // eight unknown-page triples, one solved-page triple
assert.ok(lexical.every((event) => event.size === 3));
assert.equal(lexical.filter((event) => event.page <= 55).length, 8);
assert.deepEqual(numeric, [{ page: 46, offset: 249, sourceIndex: 20, size: 3 }]);

/** Inspect a specific complete word by its original physical starting coordinate. */
function h(page, offset) {
  const found = words.find((word) => word.page === page && word.offset === offset);
  assert.ok(found, 'missing original printed word p' + page + ':' + offset);
  return found.h;
}
assert.deepEqual([h(0, 0), h(0, 8)], [1, 13]);
assert.deepEqual([h(7, 194), h(7, 196), h(8, 0), h(8, 4)], [17, 18, 19, 20]);
assert.deepEqual([h(56, 0), h(56, 2), h(56, 5)], [21, 1, 23]);

console.log(JSON.stringify({
  source: 'original 58 physical pages; p50 runeless',
  runeCount: originalTotal,
  unknownRuneCount: 12956,
  unknownWordCount: unknown.length,
  crossPageWords: 32,
  signedSourceWords: signedWords.length,
  longestLiteralContiguousSourcePhrase: 3,
  independentLexicalTriples: lexical,
  longestNumericallyConsecutiveSourceIndices: 3,
  exactNumericTriples: numeric,
  selectedNoncontiguousRedReadout: [17, 18, 19, 20, 21, 1, 23],
  interpretation: 'No complete four-word contiguous source reading under the fixed H checksum.',
}, null, 2));
