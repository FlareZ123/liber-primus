'use strict';

/**
 * Source-complete SFT for one source-ordered perimeter ASCII passphrase.
 * Windows 11 / Node.js 22:
 * node sims/lp2_p50_13dot_perimeter_printable_passphrase_sft.cjs
 *
 * Reads only original derived corpora. It does not decrypt runic text.
 */
const assert = require('node:assert/strict');
const panel = require('../resources/liber-primus/lp2-grid-256.json');
const ink = require('../resources/liber-primus/lp2-ink-annotations.json');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
assert.equal(panel.shape, '32 rows by 8 columns across LP2 pages 49, 50, 51');
assert.equal(panel.bytes.length, 256);
assert.equal(panel.byte_rule, 'value = 60*digit(first) + digit(second)');
assert.equal(corpus.pages.find((p) => p.page === 57).indices.length, 95);
const p57 = ink.pages.find((p) => p.page === 57);
assert.deepEqual(p57.large_punctuation, [[7, 13, 'red'], [95, 23, 'red']]);

const width = 8;
const height = 32;
const ringIndices = [];
for (let c = 0; c < width; c += 1) ringIndices.push(c);
for (let r = 1; r < height; r += 1) ringIndices.push(r * width + width - 1);
for (let c = width - 2; c >= 0; c -= 1) ringIndices.push((height - 1) * width + c);
for (let r = height - 2; r >= 1; r -= 1) ringIndices.push(r * width);
assert.equal(ringIndices.length, 76);
assert.equal(new Set(ringIndices).size, 76);
const selected = ringIndices.slice(12, 19);
assert.deepEqual(selected, [47, 55, 63, 71, 79, 87, 95]);
const bytes = selected.map((i) => panel.bytes[i]);
assert.deepEqual(bytes, [76, 80, 51, 108, 82, 65, 35]);
const passphrase = String.fromCharCode(...bytes);
assert.equal(passphrase, 'LP3lRA#');
assert.equal(panel.bytes[ringIndices[19]], 206, 'next clockwise byte is non-printable');

/** @param {number} byte @returns {boolean} */
function printable(byte) { return byte >= 32 && byte <= 126; }
/** @param {number[]} values @returns {number} */
function longestPrintable(values) {
  let longest = 0;
  let current = 0;
  for (const byte of values) {
    current = printable(byte) ? current + 1 : 0;
    if (current > longest) longest = current;
  }
  return longest;
}
const columnLongest = Array.from({ length: 8 }, (_, c) => longestPrintable(
  Array.from({ length: 32 }, (_, r) => panel.bytes[r * 8 + c])
));
assert.deepEqual(columnLongest, [5, 2, 2, 5, 2, 3, 6, 7]);
console.log(JSON.stringify({
  status: 'PASS',
  input: 'unchanged original LP2 32x8 base60 panel (physical pp49-51)',
  pointer: 'original solved p57 13-dot red mark after PARABLE',
  coordinateConvention: 'clockwise outer perimeter starting at upper-left; 1-based position13',
  originalCellIndicesZeroBased: selected,
  bytes,
  passphrase,
  sourceNextByte: panel.bytes[ringIndices[19]],
  columnLongestPrintable: columnLongest,
  warning: 'ASCII extraction is a human-selected hypothesis. The 13-dot mark does not explicitly prescribe ASCII, passphrases, source carrier or stop.'
}, null, 2));
