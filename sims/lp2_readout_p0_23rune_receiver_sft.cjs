#!/usr/bin/env node
'use strict';

// Reproduce the downstream receiver selected by the p28 READ OUT candidate.
// This script does not independently validate the upstream READ OUT decryption.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const translitIndex = new Map(corpus.translit.map((t, i) => [t, i]));
const parts = transcription.split(/^\s*%\s*$/m);
const table = grid.pages.flatMap(page => page.tokens);
const alphabet60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';

function pagePart(page) {
  return parts[page <= 49 ? page : page - 1];
}

function parsePage(page) {
  const text = pagePart(page);
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;

  for (const ch of [...text]) {
    if (runeIndex.has(ch)) {
      if (current.length === 0) start = runes.length;
      const value = runeIndex.get(ch);
      runes.push(value);
      current.push(value);
    } else if (ch === '-' || ch === '.') {
      if (current.length) {
        words.push({ start, end: runes.length - 1, values: current });
        current = [];
      }
    }
  }
  if (current.length) words.push({ start, end: runes.length - 1, values: current });
  return { runes, words };
}

function gp0(transliterations) {
  return transliterations.reduce((sum, token) => {
    const value = translitIndex.get(token);
    assert.notEqual(value, undefined, 'Unknown GP29 transliteration: ' + token);
    return sum + value;
  }, 0);
}

function digit59(ch) {
  const d = alphabet60.indexOf(ch);
  assert.notEqual(d, -1, 'Token character is not in the base-60 alphabet');
  return d > 41 ? d - 1 : d; // base59 omits lowercase f
}

function tokenValue(token, base) {
  assert.equal(token.length, 2);
  if (base === 60) {
    return alphabet60.indexOf(token[0]) * 60 + alphabet60.indexOf(token[1]);
  }
  return digit59(token[0]) * 59 + digit59(token[1]);
}

function transliterate(values) {
  return values.map(value => corpus.translit[value]).join('');
}

const readSum = gp0(['R', 'EA', 'D']);
const outSum = gp0(['O', 'U', 'T']);
assert.equal(readSum, 55);
assert.equal(outSum, 20);
assert.equal(table.length, 256);

const readToken = table[readSum];
const outToken = table[outSum];
assert.equal(readToken, '1K');
assert.equal(outToken, '1g');

const start60 = tokenValue(readToken, 60);
const end60 = tokenValue(outToken, 60);
const start59 = tokenValue(readToken, 59);
const end59 = tokenValue(outToken, 59);

assert.equal(start60, 80);
assert.equal(end60, 102);
assert.equal(start59, 79);
assert.equal(end59, 100);

const p0 = parsePage(0);
const firstWord = p0.words.findIndex(word => word.start === start60);
const lastWord = p0.words.findIndex(word => word.end === end60);
assert.equal(firstWord, 17); // one-based word18
assert.equal(lastWord, 20);  // one-based word21

const selectedWords = p0.words.slice(firstWord, lastWord + 1);
assert.deepEqual(selectedWords.map(word => word.start), [80, 83, 90, 95]);
assert.deepEqual(selectedWords.map(word => word.end), [82, 89, 94, 102]);
assert.deepEqual(selectedWords.map(word => word.values.length), [3, 7, 5, 8]);

const selectedRunes = p0.runes.slice(start60, end60 + 1);
assert.equal(selectedRunes.length, 23);
assert.equal(selectedRunes.reduce((sum, value) => sum + value, 0), 328);

const base59Length = end59 - start59 + 1;
assert.equal(base59Length, 22);
assert.equal(p0.words.some(word => word.start === start59), false);
assert.equal(p0.words.some(word => word.end === end59), false);

const dhPrime = 23; // independently reconstructed in the p28 DH/H research
assert.equal(selectedRunes.length, dhPrime);

console.log(JSON.stringify({
  upstreamPhrase: 'READ OUT',
  gp0: { READ: readSum, OUT: outSum },
  table: {
    size: table.length,
    READ: { address: readSum, token: readToken, base60: start60, base59: start59 },
    OUT: { address: outSum, token: outToken, base60: end60, base59: end59 }
  },
  p0: {
    runeCount: p0.runes.length,
    selectedWordRangeOneBased: [firstWord + 1, lastWord + 1],
    wordStarts: selectedWords.map(word => word.start),
    wordEnds: selectedWords.map(word => word.end),
    wordLengths: selectedWords.map(word => word.values.length),
    words: selectedWords.map(word => transliterate(word.values)),
    runeIndices: selectedRunes,
    transliteration: transliterate(selectedRunes),
    selectedLength: selectedRunes.length
  },
  dhPrime,
  base59Control: {
    start: start59,
    end: end59,
    inclusiveLength: base59Length,
    startIsWordBoundary: false,
    endIsWordBoundary: false
  },
  result: 'PASS: base-60 READ OUT pointers delimit a word-aligned 23-rune p0 block matching DH p=23.'
}, null, 2));
