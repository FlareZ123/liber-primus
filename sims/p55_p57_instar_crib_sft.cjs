'use strict';

/**
 * Fixed, source-motivated original p55/p57 instar literal-crib word-shape gate.
 *
 * Original images: resources/liber-primus/72.jpg (p55 moth) and 74.jpg
 * (p57 Parable / instar). The original-rune master has percent-delimited
 * scan units. Units 71 and 73 are p55 and p57, respectively.
 * No guessed cipher parameters or language models.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const file = path.join(
  __dirname, '..', 'resources', 'transcriptions', 'liber_primus_master.txt'
);
const source = fs.readFileSync(file, 'utf8');
const units = source.split('%');

/**
 * @param {number} unitIndex Original master transcript unit index.
 * @returns {{count: number, lengths: number[], words: string[]}}
 */
function wordShape(unitIndex) {
  const visible = units[unitIndex].split('&')[0]
    .replace(/[\s/]/g, '')
    .replace(/[^\u16a0-\u16ff.\-]/g, '');
  const words = visible.split(/[.\-]/).filter(Boolean);
  const lengths = words.map((word) => [...word].length);
  return { count: lengths.reduce((sum, n) => sum + n, 0), lengths, words };
}

/**
 * @param {number[]} candidate Word-length sequence sought as a whole.
 * @param {number[]} target Word-length sequence containing candidate.
 * @returns {number[]}
 */
function contiguousMatches(candidate, target) {
  const starts = [];
  for (let start = 0; start + candidate.length <= target.length; start++) {
    if (candidate.every((n, i) => n === target[start + i])) {
      starts.push(start);
    }
  }
  return starts;
}

const p55 = wordShape(71);
const p57 = wordShape(73);
assert.equal(p55.count, 76);
assert.equal(p57.count, 95);
assert.equal(p55.lengths.length, 17);
assert.equal(p57.lengths.length, 20);

assert.ok(p55.lengths.includes(1));
assert.ok(p55.lengths.includes(13));
assert.ok(!p57.lengths.includes(1));
assert.ok(!p57.lengths.includes(13));

const originalStarts = contiguousMatches(p55.lengths, p57.lengths);
const positiveStarts = contiguousMatches(
  p57.lengths.slice(0, 17), p57.lengths
);
assert.deepEqual(originalStarts, []);
assert.deepEqual(positiveStarts, [0]);

console.log(JSON.stringify({
  classification: 'Bounded word-boundary-preserving p57 literal-crib negative',
  originalSource: 'resources/transcriptions/liber_primus_master.txt',
  inputImages: ['resources/liber-primus/72.jpg', 'resources/liber-primus/74.jpg'],
  p55: { runes: p55.count, words: p55.lengths.length, lengths: p55.lengths },
  p57: { runes: p57.count, words: p57.lengths.length, lengths: p57.lengths },
  searchWordWindows: p57.lengths.length - p55.lengths.length + 1,
  originalMatches: originalStarts,
  positiveControlMatches: positiveStarts,
  plaintextRecovered: false
}, null, 2));
