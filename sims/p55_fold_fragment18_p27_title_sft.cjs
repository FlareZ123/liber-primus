'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const ink = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-ink-annotations.json', 'utf8'));
const transcription = fs.readFileSync('resources/lp2-transcription.txt', 'utf8');

const RUNIC = /[\u16A0-\u16FF]/u;
const pages = corpus.pages.slice().sort((a, b) => a.page - b.page);
const pageByNumber = new Map(pages.map((page) => [page.page, page]));
const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

const pageStart = [];
let runeTotal = 0;
for (let page = 0; page < 58; page += 1) {
  pageStart[page] = runeTotal;
  runeTotal += pageByNumber.get(page)?.indices.length ?? 0;
}
assert.equal(runeTotal, 13136);

const thirteenDotGlobals = [];
for (const page of ink.pages) {
  for (const mark of page.large_punctuation ?? []) {
    if (mark[1] === 13) {
      thirteenDotGlobals.push(pageStart[page.page] + mark[0]);
    }
  }
}
thirteenDotGlobals.sort((a, b) => a - b);
assert.equal(thirteenDotGlobals.length, 31);

const allRunes = pages.flatMap((page) => page.indices);
const boundaries = [0, ...thirteenDotGlobals, allRunes.length];
assert.equal(boundaries.length, 33);

/** @param {number} globalOffset @returns {{page:number,local:number}|null} */
function locate(globalOffset) {
  for (let page = 0; page < 58; page += 1) {
    const count = pageByNumber.get(page)?.indices.length ?? 0;
    if (globalOffset >= pageStart[page] && globalOffset < pageStart[page] + count) {
      return { page, local: globalOffset - pageStart[page] };
    }
  }
  return null;
}

/** @param {number} oneBased */
function fragment(oneBased) {
  assert.ok(oneBased >= 1 && oneBased <= 32);
  const index = oneBased - 1;
  const start = boundaries[index];
  const end = boundaries[index + 1];
  const indices = allRunes.slice(start, end);
  return {
    oneBased,
    start,
    end,
    indices,
    startLocation: locate(start),
    endLocation: end > start ? locate(end - 1) : locate(start)
  };
}

// The physical p55 fold compares five aligned circle positions. A 1 means
// the two sides disagree at that position; 0 means they match.
const mismatch = { T: 1, ML: 0, MR: 0, BL: 1, BR: 0 };
const readings = [
  ['top-lr', ['T', 'ML', 'MR', 'BL', 'BR']],
  ['top-rl', ['T', 'MR', 'ML', 'BR', 'BL']],
  ['bottom-lr', ['BL', 'BR', 'ML', 'MR', 'T']],
  ['bottom-rl', ['BR', 'BL', 'MR', 'ML', 'T']]
].map(([name, order]) => {
  const bits = order.map((position) => mismatch[position]).join('');
  return { name, order, bits, value: Number.parseInt(bits, 2) };
});

assert.deepEqual(readings.map((x) => x.value), [18, 17, 17, 9]);
const selected = fragment(readings[0].value);
assert.equal(selected.oneBased, 18);
assert.deepEqual(selected.startLocation, { page: 27, local: 0 });
assert.deepEqual(selected.endLocation, { page: 27, local: 18 });
assert.equal(selected.indices.length, 19);

const expectedTitle = [19, 13, 26, 20, 15, 3, 24, 25, 8, 20, 18, 12, 10, 19, 20, 20, 15, 5, 13];
assert.deepEqual(selected.indices, expectedTitle);
assert.equal(selected.indices[0], 19);
assert.equal(selected.indices.length, selected.indices[0]);
assert.equal(selected.indices.length - 1, selected.oneBased);

const allFragments = Array.from({ length: 32 }, (_, i) => fragment(i + 1));
assert.deepEqual(
  allFragments.filter((x) => x.indices.length > 0 && x.indices.length === x.indices[0]).map((x) => x.oneBased),
  [18]
);
assert.deepEqual(
  allFragments.filter((x) => x.indices.length - 1 === x.oneBased).map((x) => x.oneBased),
  [18]
);

assert.equal(fragment(17).indices.length, 1005);
assert.equal(fragment(9).indices.length, 0);
assert.equal(fragment(12).indices.length, 0);
assert.equal(fragment(19).indices.length, 1414);

const p27Ink = ink.pages.find((page) => page.page === 27);
assert.ok(p27Ink);
assert.ok((p27Ink.red_spans ?? []).some((span) => span.start === 0 && span.length === 19));

const p27Text = transcription.split('%')[27];
const titleText = p27Text.split('.')[0];
const printedWords = titleText.split('-').map((word) => [...word].filter((ch) => RUNIC.test(ch)));
assert.deepEqual(printedWords.map((word) => word.length), [3, 12, 4]);
assert.deepEqual(
  printedWords.flat().map((rune) => runeToIndex.get(rune)),
  expectedTitle
);

const sectionRunes = [...transcription.split('$')[5]]
  .filter((ch) => RUNIC.test(ch))
  .map((rune) => runeToIndex.get(rune));
assert.equal(sectionRunes.length, 1433);
assert.deepEqual(sectionRunes.slice(0, 19), expectedTitle);

const p27 = pageByNumber.get(27).indices;
const p55 = pageByNumber.get(55).indices;
const bookend = [23, 11, 1, 17, 18, 10];
assert.deepEqual(p27.slice(28, 34), bookend);
assert.deepEqual(p55.slice(70, 76), bookend);

// Canonical 2,896-word parser: page markers and line wraps do not split a
// printed word. The unique repeated p27/p55 pair supplies a word-number gap.
const unknownStream = transcription.split('%').slice(0, 55).join('%');
const canonicalWords = [];
let currentWord = [];
const finishWord = () => {
  if (currentWord.length > 0) {
    canonicalWords.push(currentWord);
    currentWord = [];
  }
};
for (const ch of unknownStream) {
  if (RUNIC.test(ch)) {
    currentWord.push(runeToIndex.get(ch));
  } else if (ch === '%' || ch === '/' || /\s/u.test(ch)) {
    // Physical page/line boundaries are transparent to printed words.
  } else {
    finishWord();
  }
}
finishWord();
assert.equal(canonicalWords.length, 2896);

const bookendWordPair = [[23, 11, 1], [17, 18, 10]];
const bookendStarts = [];
for (let i = 0; i + 1 < canonicalWords.length; i += 1) {
  if (
    canonicalWords[i].length === 3 &&
    canonicalWords[i + 1].length === 3 &&
    canonicalWords[i].every((value, j) => value === bookendWordPair[0][j]) &&
    canonicalWords[i + 1].every((value, j) => value === bookendWordPair[1][j])
  ) {
    bookendStarts.push(i);
  }
}
assert.deepEqual(bookendStarts, [1462, 2894]);
const wordNumberGap = bookendStarts[1] - bookendStarts[0];
assert.equal(wordNumberGap, 1432);
assert.equal(wordNumberGap, sectionRunes.length - 1);
assert.equal(wordNumberGap % sectionRunes.length, sectionRunes.length - 1);

console.log(JSON.stringify({
  classification: 'source-image navigation candidate; no plaintext recovered',
  foldMismatch: readings,
  thirteenDotMarks: thirteenDotGlobals.length,
  fragments: boundaries.length - 1,
  selected: {
    oneBased: selected.oneBased,
    length: selected.indices.length,
    start: selected.startLocation,
    end: selected.endLocation,
    firstIndex: selected.indices[0],
    remainingAfterFirst: selected.indices.length - 1,
    transliteration: selected.indices.map((index) => corpus.translit[index]).join(''),
    wordLengths: printedWords.map((word) => word.length)
  },
  orientationControls: {
    fragment17Length: fragment(17).indices.length,
    fragment9Length: fragment(9).indices.length,
    fragment12Length: fragment(12).indices.length,
    zeroBased18AlternativeLength: fragment(19).indices.length
  },
  p27p55Bookend: bookend,
  wordNumberDirection: {
    canonicalWordCount: canonicalWords.length,
    pairStartOffsetsZeroBased: bookendStarts,
    gap: wordNumberGap,
    selectedSectionRunes: sectionRunes.length,
    modularStep: wordNumberGap % sectionRunes.length,
    interpretation: '1432 mod 1433 = -1: reverse traversal'
  }
}, null, 2));
