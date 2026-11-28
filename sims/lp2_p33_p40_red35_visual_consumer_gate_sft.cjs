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

const spans = [];
for (const annotation of ink.pages) {
  const pageWords = words(annotation.page);
  for (const span of annotation.red_spans || []) {
    const inside = pageWords.filter(
      (word) => word.start >= span.start &&
        word.end <= span.start + span.length
    );
    const predecessor = pageWords.filter(
      (word) => word.end <= span.start
    ).at(-1) || null;
    const successor = pageWords.find(
      (word) => word.start >= span.start + span.length
    ) || null;
    const boundary13Count = (annotation.large_punctuation || []).filter(
      ([position, count]) =>
        count === 13 &&
        (position === span.start || position === span.start + span.length)
    ).length;

    spans.push({
      page: annotation.page,
      start: span.start,
      length: span.length,
      wordLengths: inside.map((word) => word.length),
      placement: span.start === 0
        ? 'initial'
        : span.start + span.length === annotation.rune_count
          ? 'terminal'
          : 'internal',
      predecessorAdjacent: Boolean(predecessor && predecessor.end === span.start),
      predecessorLength: predecessor?.length ?? null,
      successorAdjacent: Boolean(
        successor && successor.start === span.start + span.length
      ),
      successorLength: successor?.length ?? null,
      boundary13Count,
    });
  }
}

assert.equal(spans.length, 18);
assert.equal(spans.filter((span) => span.successorAdjacent).length, 16);
assert.equal(spans.filter((span) => span.predecessorAdjacent).length, 7);
assert.equal(
  spans.filter((span) => span.successorAdjacent && span.predecessorAdjacent).length,
  5
);

const pair = spans.filter(
  (span) => span.wordLengths.length === 2 &&
    span.wordLengths[0] === 3 &&
    span.wordLengths[1] === 5
);
assert.deepEqual(pair, [
  {
    page: 33,
    start: 91,
    length: 8,
    wordLengths: [3, 5],
    placement: 'internal',
    predecessorAdjacent: true,
    predecessorLength: 2,
    successorAdjacent: true,
    successorLength: 6,
    boundary13Count: 2,
  },
  {
    page: 40,
    start: 0,
    length: 8,
    wordLengths: [3, 5],
    placement: 'initial',
    predecessorAdjacent: false,
    predecessorLength: null,
    successorAdjacent: true,
    successorLength: 5,
    boundary13Count: 0,
  },
]);

console.log(JSON.stringify({
  status: 'PASS',
  redSpanCount: spans.length,
  genericAdjacencyControl: {
    successor: spans.filter((span) => span.successorAdjacent).length,
    predecessor: spans.filter((span) => span.predecessorAdjacent).length,
    both: spans.filter(
      (span) => span.successorAdjacent && span.predecessorAdjacent
    ).length,
  },
  red35Pair: pair,
  decision: 'Immediate black successor transfers across the pair but is generic (16/18 red spans); stronger bracket/placement types do not transfer.',
}, null, 2));
