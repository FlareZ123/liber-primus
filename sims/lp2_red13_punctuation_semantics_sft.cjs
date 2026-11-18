'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const ink = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-ink-annotations.json'),
  'utf8'
));

const rows = [];
for (const page of ink.pages) {
  for (const [offset, dots, color] of page.large_punctuation || []) {
    if (dots !== 13) continue;
    const adjacent = (page.red_spans || []).filter(
      (span) => span.start + span.length === offset
    );

    rows.push({
      page: page.page,
      offset,
      color,
      pageEnd: offset === page.rune_count,
      afterRedSpan: adjacent.length > 0,
      adjacentRedLengths: adjacent.map((span) => span.length),
    });
  }
}

const red = rows.filter((row) => row.color === 'red');
const black = rows.filter((row) => row.color === 'black');
const afterRed = rows.filter((row) => row.afterRedSpan);
const pageEnd = rows.filter((row) => row.pageEnd);
const either = rows.filter((row) => row.afterRedSpan || row.pageEnd);
const neither = rows.filter((row) => !row.afterRedSpan && !row.pageEnd);

assert.equal(rows.length, 31);
assert.equal(red.length, 30);
assert.equal(black.length, 1);
assert.equal(afterRed.length, 16);
assert.equal(pageEnd.length, 10);
assert.equal(either.length, 24);
assert.equal(neither.length, 7);

const adjacentLengths = afterRed.flatMap((row) => row.adjacentRedLengths);
assert.deepEqual(adjacentLengths, [
  13, 16, 3, 11, 14, 9, 11, 16, 19, 10, 8, 3, 51, 9, 5, 7,
]);

// Solved positive controls. p56 decrypts to title AN END (5 GP runes);
// p57 is clear PARABLE (7 GP runes). The same 13-dot glyph immediately
// follows both titles, so dot-count 13 is not the adjacent title length.
const p56 = ink.pages.find((page) => page.page === 56);
const p57 = ink.pages.find((page) => page.page === 57);
assert.deepEqual(
  p56.large_punctuation,
  [[5, 13, 'red'], [45, 10, 'red'], [85, 13, 'red']]
);
assert.deepEqual(
  p57.large_punctuation,
  [[7, 13, 'red'], [95, 23, 'red']]
);
assert.deepEqual(
  p56.red_spans.map((span) => [span.start, span.length]),
  [[0, 5]]
);
assert.deepEqual(
  p57.red_spans.map((span) => [span.start, span.length]),
  [[0, 7]]
);

// The thirteen-dot glyph also terminates the complete solved p56 page,
// while the complete solved p57 page instead uses a 23-dot glyph.
assert.ok(rows.some((row) => row.page === 56 && row.offset === 85 && row.pageEnd));
assert.ok(!rows.some((row) => row.page === 57 && row.offset === 95));
assert.ok(
  p57.large_punctuation.some(
    ([offset, dots, color]) => offset === 95 && dots === 23 && color === 'red'
  )
);

console.log(JSON.stringify({
  status: 'PASS',
  red13: {
    total: rows.length,
    red: red.length,
    black: black.length,
    afterRedSpan: afterRed.length,
    pageEnd: pageEnd.length,
    afterRedSpanOrPageEnd: either.length,
    otherContexts: neither.length,
    adjacentRedSpanLengths: adjacentLengths,
  },
  solvedControls: {
    p56: {
      title: 'AN END',
      titleRunes: 5,
      punctuation: p56.large_punctuation,
    },
    p57: {
      title: 'PARABLE',
      titleRunes: 7,
      punctuation: p57.large_punctuation,
    },
  },
  decision:
    'Thirteen-dot marks are demonstrably a recurring punctuation class. ' +
    'The visible dot count 13 may still be used by a separately motivated ' +
    'arithmetic hypothesis, but the solved controls do not select it as a ' +
    'numeric operand or as the length of the adjacent object.',
}, null, 2));
