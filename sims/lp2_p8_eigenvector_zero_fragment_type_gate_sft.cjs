'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const transcription = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8'
).replace(/\r/g, '');

const runeSet = new Set(corpus.runes);
const parts = transcription.split('%');

/** @param {number} page */
function segment(page) {
  if (page === 50) return '';
  return parts[page >= 51 ? page - 1 : page];
}

/** @param {number} page */
function fragments(page) {
  const output = [];
  let offset = 0;
  let line = 0;
  let current = null;
  let separatorBefore = '';

  function flush(separatorAfter) {
    if (!current) return;
    output.push({
      ...current,
      end: offset,
      separatorBefore,
      separatorAfter,
    });
    current = null;
    separatorBefore = separatorAfter;
  }

  for (const ch of Array.from(segment(page))) {
    if (runeSet.has(ch)) {
      if (!current) {
        current = { start: offset, length: 0, lineStart: line, lineEnd: line };
      }
      current.length += 1;
      current.lineEnd = line;
      offset += 1;
    } else {
      if (ch === '\n') line += 1;
      if (ch !== '/' && !/\s/u.test(ch)) {
        flush(ch);
      } else if (!current) {
        separatorBefore += ch;
      }
    }
  }
  flush('');
  return output;
}

const all = fragments(8);
assert.deepEqual(all.slice(0, 2).map((item) => item.length), [4, 8]);
const black = all.slice(2);
assert.equal(black.length, 49);
const matrix = Array.from({ length: 7 }, (_, row) =>
  black.slice(row * 7, row * 7 + 7)
);

assert.deepEqual(
  matrix.map((row) => row.map((item) => item.length)),
  [
    [3,2,3,9,4,3,4],
    [2,2,6,3,7,3,4],
    [3,8,4,3,4,5,5],
    [2,3,4,4,7,5,10],
    [6,12,4,5,3,2,6],
    [10,4,9,6,5,6,8],
    [8,3,2,9,6,6,1],
  ]
);

const candidates = {
  rowZero: matrix[5],
  rowOne: matrix[4],
  colZero: matrix.map((row) => row[5]),
  colOne: matrix.map((row) => row[4]),
};

const compact = Object.fromEntries(
  Object.entries(candidates).map(([name, items]) => [
    name,
    {
      lengths: items.map((item) => item.length),
      starts: items.map((item) => item.start),
      lines: items.map((item) => [item.lineStart, item.lineEnd]),
      contiguous: items.every(
        (item, index) => index === 0 || items[index - 1].end === item.start
      ),
      beginsAfterPeriod: items[0].separatorBefore.includes('.'),
      endsAtPeriod: items.at(-1).separatorAfter.includes('.'),
    },
  ])
);

assert.deepEqual(compact.rowZero.lengths, [10,4,9,6,5,6,8]);
assert.deepEqual(compact.rowOne.lengths, [6,12,4,5,3,2,6]);
assert.deepEqual(compact.colZero.lengths, [3,3,5,5,2,6,6]);
assert.deepEqual(compact.colOne.lengths, [4,7,4,7,3,5,6]);

assert.equal(compact.rowZero.contiguous, true);
assert.equal(compact.rowOne.contiguous, true);
assert.equal(compact.colZero.contiguous, false);
assert.equal(compact.colOne.contiguous, false);
assert.equal(compact.rowZero.endsAtPeriod, true);
assert.equal(compact.rowOne.beginsAfterPeriod, true);

console.log(JSON.stringify({
  status: 'PASS',
  eigenvector: [14,7,7,3,25,0,4],
  zeroCoordinate: 5,
  candidates: compact,
  decision: 'No row/column × origin interpretation is uniquely source-typed without rune-value inspection.',
}, null, 2));
