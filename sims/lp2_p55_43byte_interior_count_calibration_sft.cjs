'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const transcription = fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8'
);

const PACKET_RUNES = 75;
const PACKET_BYTES = 45;
const TRIMMED_BYTES = PACKET_BYTES - 2;
const runeSet = new Set(corpus.runes);

// Match the canonical project parser used by the zeroF and word-layout gates:
// physical line and page continuations stay inside a word; punctuation/spacing
// separate words.
const sourceText = transcription
  .split('%').slice(0, 55).join('%')
  .replace(//?
/g, '')
  .replace(/[
%]/g, '');

const words = [];
let globalRune = 0;
let wordStart = null;
for (const glyph of Array.from(sourceText)) {
  if (runeSet.has(glyph)) {
    if (wordStart === null) wordStart = globalRune;
    globalRune++;
  } else if (wordStart !== null) {
    words.push({
      start: wordStart,
      end: globalRune,
      length: globalRune - wordStart
    });
    wordStart = null;
  }
}
if (wordStart !== null) {
  words.push({
    start: wordStart,
    end: globalRune,
    length: globalRune - wordStart
  });
}

assert.equal(globalRune, 12956);
assert.equal(words.length, 2896);

const pages = corpus.pages.filter((page) => page.page <= 55);
const pageStarts = new Map();
let pageOffset = 0;
for (const page of pages) {
  pageStarts.set(page.page, pageOffset);
  pageOffset += page.indices.length;
}
assert.equal(pageOffset, 12956);

/**
 * Count strict interior runes of complete printed words wholly contained
 * in one 75-rune page-local scan window.
 * @param {number} start
 * @param {number} end
 */
function strictInteriorRunes(start, end) {
  let count = 0;
  let completeWords = 0;
  const lengths = [];
  for (const word of words) {
    if (word.start < start || word.end > end) continue;
    completeWords++;
    lengths.push(word.length);
    count += Math.max(0, word.length - 2);
  }
  return { count, completeWords, lengths };
}

const windows = [];
for (const page of pages) {
  if (!page.indices.length) continue;
  const pageStart = pageStarts.get(page.page);

  for (let phase = 0; phase < 5; phase++) {
    if (page.indices.length < phase + PACKET_RUNES) continue;
    const start = pageStart + phase;
    const end = start + PACKET_RUNES;
    const interiors = strictInteriorRunes(start, end);
    windows.push({
      page: page.page,
      phase,
      strictInteriorRunes: interiors.count,
      completeWords: interiors.completeWords,
      wordLengths: interiors.lengths,
      trimmedPacketBytes: TRIMMED_BYTES,
      exactLengthMatch: interiors.count === TRIMMED_BYTES
    });
  }
}

assert.equal(windows.length, 267);

const matches = windows.filter((window) => window.exactLengthMatch);
const expectedMatches = [
  [3, 4], [28, 1], [28, 2], [30, 3], [30, 4],
  [33, 0], [33, 1], [33, 2],
  [36, 0], [36, 1], [36, 2],
  [37, 0],
  [39, 0], [39, 1], [39, 2], [39, 3],
  [42, 2], [42, 3], [42, 4],
  [51, 0], [51, 2], [51, 3],
  [55, 1]
];
assert.deepEqual(
  matches.map((window) => [window.page, window.phase]),
  expectedMatches
);
assert.equal(matches.length, 23);
assert.equal(new Set(matches.map((window) => window.page)).size, 10);

const p55 = matches.find(
  (window) => window.page === 55 && window.phase === 1
);
assert.ok(p55);
assert.equal(p55.strictInteriorRunes, 43);
assert.equal(p55.completeWords, 16);
assert.deepEqual(
  p55.wordLengths,
  [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]
);

// The #1525 matched null shuffles rune labels within each physical page.
// It keeps every word boundary and every window start/end fixed. Therefore
// this exact layout statistic is invariant under every null draw.
const nullInvariant = matches.length;

console.log(JSON.stringify({
  classification: 'exact source-layout calibration; no plaintext/key',
  eligibleWindows: windows.length,
  trimmedPacketBytes: TRIMMED_BYTES,
  exactLengthMatches: matches.length,
  uniquePagesWithMatch: new Set(matches.map((window) => window.page)).size,
  matchWindows: matches.map((window) => ({
    page: window.page,
    phase: window.phase,
    completeWords: window.completeWords
  })),
  p55Phase1: p55,
  matchedNull: {
    family: 'same within-page rune-label shuffle as #1525',
    boundaryStructureFixed: true,
    exactLengthMatchesPerBook: nullInvariant,
    familywiseAnyMatchRate: 1
  },
  conclusion:
    '43-byte trim equals 43 strict interior runes in 23/267 fixed windows; layout-preserving null cannot make this selective'
}, null, 2));
