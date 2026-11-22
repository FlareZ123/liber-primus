#!/usr/bin/env node
'use strict';

// Source-constrained test: the 13 red dropcap rune values rank 13 columns
// of the p0 black body. Dropcap positions are global rune offsets in the
// canonical concatenated stream, as recorded by Dukotah/cicada3301 Round44
// P1 red-channel extraction (channel.json, full.dropcaps).
// All cryptographic inputs are local repository resources; no network is used.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const transcription = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8'
);

// Global offsets in the canonical concatenated rune stream; the non-rune
// p50 numeric table is absent from that stream.
const DROP_CAP_GLOBAL_POSITIONS = Object.freeze([
  0, 729, 848, 1541, 1874, 3612, 5506, 6527, 7960, 8051, 9519, 9640, 12648
]);
const EXPECTED_KEY = Object.freeze([
  15, 20, 13, 24, 14, 20, 1, 19, 23, 21, 27, 0, 24
]);

const flat = corpus.pages.flatMap(page => page.indices);
const key = DROP_CAP_GLOBAL_POSITIONS.map(position => {
  assert.ok(position >= 0 && position < flat.length, 'dropcap offset ' + position + ' out of range');
  return flat[position];
});
assert.deepEqual(key, EXPECTED_KEY, 'original-corpus dropcap values changed');

const p0 = corpus.pages.find(page => page.page === 0);
assert.ok(p0, 'p0 missing from canonical corpus');
const body = p0.indices.slice(13); // 13 red title runes, then the 13-dot marker
assert.equal(body.length, 249, 'unexpected p0 black-body length');

const p0Text = transcription.split('%')[0];
const titleEnd = p0Text.indexOf('.');
assert.notEqual(titleEnd, -1, 'p0 title/body delimiter missing');
const bodyText = p0Text.slice(titleEnd + 1).replace(/[\/\r\n]/g, '');
const runeSet = new Set(corpus.runes);
const wordLengths = bodyText.split('-')
  .map(word => Array.from(word).filter(rune => runeSet.has(rune)).length)
  .filter(length => length > 0);
assert.equal(wordLengths.length, 56, 'unexpected p0 body word count');
assert.equal(wordLengths.reduce((sum, length) => sum + length, 0), body.length,
  'transcription word lengths do not cover p0 body');

function rankOrder(values, descending, reverseSource) {
  let entries = values.map((value, column) => ({ value, column }));
  if (reverseSource) entries = entries.reverse();
  entries = entries.map((entry, tie) => ({ ...entry, tie }));
  entries.sort((a, b) =>
    (descending ? b.value - a.value : a.value - b.value) || a.tie - b.tie
  );
  return entries.map(entry => entry.column);
}

function encryptColumnar(plain, order) {
  const columns = order.length;
  const rows = Math.ceil(plain.length / columns);
  const grid = Array.from({ length: rows }, () => Array(columns).fill(null));
  for (let i = 0; i < plain.length; i++) {
    grid[Math.floor(i / columns)][i % columns] = plain[i];
  }
  const out = [];
  for (const column of order) {
    for (let row = 0; row < rows; row++) {
      if (grid[row][column] !== null) out.push(grid[row][column]);
    }
  }
  return out;
}

function decryptColumnar(cipher, order) {
  const columns = order.length;
  const rows = Math.ceil(cipher.length / columns);
  const extra = cipher.length % columns;
  const columnLengths = Array.from({ length: columns }, (_, column) =>
    rows - (extra > 0 && column >= extra ? 1 : 0)
  );
  const gridColumns = Array(columns);
  let offset = 0;
  for (const column of order) {
    const length = columnLengths[column];
    gridColumns[column] = cipher.slice(offset, offset + length);
    offset += length;
  }
  assert.equal(offset, cipher.length, 'ciphertext not fully consumed');
  const out = [];
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      if (row < gridColumns[column].length) out.push(gridColumns[column][row]);
    }
  }
  return out;
}

function render(indices) {
  return indices.map(index => corpus.translit[index]).join('');
}

function segmentByOriginalWordLengths(indices) {
  let offset = 0;
  return wordLengths.map(length => {
    const segment = render(indices.slice(offset, offset + length));
    offset += length;
    return segment;
  }).join(' ');
}

const variants = [];
for (const reverseSource of [false, true]) {
  for (const descending of [false, true]) {
    const order = rankOrder(key, descending, reverseSource);
    const candidate = decryptColumnar(body, order);
    const forward = encryptColumnar(body, order);
    assert.deepEqual(decryptColumnar(forward, order), body,
      'columnar forward/inverse roundtrip failed');
    variants.push({
      keyDirection: descending ? 'descending' : 'ascending',
      keySourceOrder: reverseSource ? 'reverse' : 'forward',
      rankOrder: order,
      roundtrip: true,
      decryptionCandidate: render(candidate),
      candidateWithOriginalWordLengths: segmentByOriginalWordLengths(candidate),
      oppositeDirectionOutput: render(forward)
    });
  }
}

const result = {
  test: '13 red dropcap values as a standard 13-column p0 transposition key',
  bodyLength: body.length,
  columns: 13,
  rows: 20,
  columnLengths: Array.from({ length: 13 }, (_, column) => 20 - (column >= 2 ? 1 : 0)),
  printedWordCount: wordLengths.length,
  printedWordLengthsSum: wordLengths.reduce((a, b) => a + b, 0),
  dropcapGlobalPositions: DROP_CAP_GLOBAL_POSITIONS,
  keyValues: key,
  keyTransliteration: key.map(index => corpus.translit[index]).join(''),
  tieRule: 'stable source order',
  variants
};

console.log(JSON.stringify(result, null, 2));
