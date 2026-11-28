'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'),
  'utf8'
));
const transcription = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'),
  'utf8'
).replace(/\r/g, '');
const ink = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'),
  'utf8'
));

const runeSet = new Set(corpus.runes);
const parts = transcription.split('%');

/** @param {number} page */
function segment(page) {
  if (page === 50) return '';
  return parts[page >= 51 ? page - 1 : page];
}

/** @param {number} page */
function words(page) {
  const output = [];
  let offset = 0;
  let start = null;
  let length = 0;

  function emit() {
    if (start === null) return;
    output.push({ start, end: start + length, length });
    start = null;
    length = 0;
  }

  for (const ch of Array.from(segment(page))) {
    if (runeSet.has(ch)) {
      if (start === null) start = offset;
      length += 1;
      offset += 1;
    } else if (/[-.&$§,:!?\s]/u.test(ch)) {
      emit();
    }
  }
  emit();
  return output;
}

function inventory(page) {
  const annotation = ink.pages.find((item) => item.page === page);
  const pageWords = words(page);
  const spans = (annotation?.red_spans || []).map((span) => {
    const inside = pageWords.filter(
      (word) => word.start >= span.start && word.end <= span.start + span.length
    );
    const predecessor = pageWords.filter(
      (word) => word.end <= span.start
    ).at(-1) || null;
    const successor = pageWords.find(
      (word) => word.start >= span.start + span.length
    ) || null;

    const placement = span.start === 0
      ? 'initial'
      : span.start + span.length === corpus.pages[page].runic_count
        ? 'terminal'
        : 'internal';

    const large13 = (annotation?.large_punctuation || []).filter(
      ([position, count]) =>
        count === 13 &&
        (position === span.start || position === span.start + span.length)
    );

    return {
      start: span.start,
      length: span.length,
      wordLengths: inside.map((word) => word.length),
      placement,
      predecessor: predecessor ? predecessor.length : null,
      successor: successor ? successor.length : null,
      boundaryLarge13Count: large13.length,
    };
  });

  return { page, spans };
}

const selected = [6, 7, 8].map(inventory);
assert.ok(selected.every((item) => item.spans.length === 1));
assert.deepEqual(selected.map((item) => item.spans[0]), [
  {
    start: 71,
    length: 11,
    wordLengths: [4, 1, 4, 2],
    placement: 'internal',
    predecessor: 4,
    successor: 7,
    boundaryLarge13Count: 2,
  },
  {
    start: 194,
    length: 14,
    wordLengths: [2, 4, 3, 2, 3],
    placement: 'terminal',
    predecessor: 3,
    successor: null,
    boundaryLarge13Count: 2,
  },
  {
    start: 0,
    length: 12,
    wordLengths: [4, 8],
    placement: 'initial',
    predecessor: null,
    successor: 3,
    boundaryLarge13Count: 0,
  },
]);

assert.deepEqual(
  selected.map((item) => item.spans[0].placement),
  ['internal', 'terminal', 'initial']
);
assert.ok(selected.some((item) => item.spans[0].predecessor === null));
assert.ok(selected.some((item) => item.spans[0].successor === null));

console.log(JSON.stringify({
  status: 'PASS',
  frozenMap: { 6: 8, 7: 7, 8: 6 },
  selected,
  decision: 'The page map selects the three red-bearing pages but does not type a uniform red-neighbor consumer without adding a second serialization.',
}, null, 2));
