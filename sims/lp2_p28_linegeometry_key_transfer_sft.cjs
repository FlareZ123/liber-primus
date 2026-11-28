'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r/g, '');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');
const runeSet = new Set(corpus.runes);
const parts = transcription.split('%');
const mod = (value) => ((value % 29) + 29) % 29;

/** @param {number} page */
function physicalText(page) {
  if (page === 50) return '';
  return parts[page >= 51 ? page - 1 : page];
}

/** @param {number} page */
function lineGeometry(page) {
  let offset = 0;
  let ordinal = 0;
  const rows = [];
  for (const line of physicalText(page).split('\n')) {
    const length = [...line].filter((ch) => runeSet.has(ch)).length;
    if (!length) continue;
    ordinal += 1;
    rows.push({ ordinal, start: offset, length, end: offset + length - 1 });
    offset += length;
  }
  return rows;
}

const p28Lines = lineGeometry(28);
assert.deepEqual(p28Lines.find((row) => row.ordinal === 7), {
  ordinal: 7,
  start: 140,
  length: 22,
  end: 161,
});
assert.deepEqual(p28Lines.find((row) => row.ordinal === 1), {
  ordinal: 1,
  start: 0,
  length: 23,
  end: 22,
});

// Existing local THE candidate: source-derived key equals line geometry.
assert.deepEqual([22, 7], [
  p28Lines.find((row) => row.ordinal === 7).length,
  7,
]);

// Fresh transfer was frozen before these target values were read.
const p28 = corpus.pages.find((page) => page.page === 28);
const target = p28.indices.slice(0, 2);
assert.deepEqual(target, [13, 5]);
const key = [23, 1];
const output = target.map((value, index) => mod(value - key[index]));
assert.deepEqual(output, [19, 4]);

const tokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} word */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S')
    .replace(/[^A-Z]/g, '');
  const result = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith('ING', offset)) {
      result.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith('IO', offset)) {
      result.push(27);
      offset += 2;
      continue;
    }
    const token = tokens.find((item) => normalized.startsWith(item.symbol, offset));
    assert.ok(token);
    result.push(token.value);
    offset += token.symbol.length;
  }
  return result;
}

const clear = signed
  .split('-----BEGIN PGP SIGNATURE-----')[0]
  .slice(signed.indexOf('Hello.'));
const sourceWords = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((word) => /^[A-Za-z]+$/u.test(word))
  .map((word) => word.toUpperCase())
  .slice(0, 43);

const twoRune = sourceWords
  .map((word, index) => ({ index, word, values: gp(word) }))
  .filter((item) => item.values.length === 2);
const exact = twoRune.filter((item) =>
  item.values[0] === output[0] && item.values[1] === output[1]
);
assert.equal(exact.length, 0);

console.log(JSON.stringify({
  status: 'PASS',
  retrospective: {
    p28THE: {
      receiverOffset: 140,
      lineOrdinal: 7,
      lineLength: 22,
      existingKey: [22, 7],
    },
  },
  prospective: {
    pretargetCommit: 'f679d5cedd9283f65ae8d664920a0cc4c7b27687',
    receiverOffset: 0,
    lineOrdinal: 1,
    lineLength: 23,
    ciphertext: target,
    key,
    output,
    transliteration: output.map((value) => corpus.translit[value]).join(''),
    authenticatedTwoRuneMatches: exact,
  },
  decision: 'Retain the p28 [22,7] equality as retrospective convergence; reject a reusable [line length,line ordinal] key rule.',
}, null, 2));
