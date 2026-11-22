#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt').replace(/\r/g, '');
const pageParts = transcription.split('%').slice(0, 55);
const runeSet = new Set(corpus.runes);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

assert.equal(pageParts.length, 55, 'expected p0-p49 and p51-p55; p50 is the numeric table');

function partIndex(physicalPage) {
  assert.notEqual(physicalPage, 50, 'p50 is the numeric table, not a rune page');
  return physicalPage <= 49 ? physicalPage : physicalPage - 1;
}

function parsePage(physicalPage) {
  const source = pageParts[partIndex(physicalPage)];
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      ordinal: words.length + 1,
      start,
      length: current.length,
      values: current.slice()
    });
    current = [];
  }

  for (const ch of source) {
    if (runeSet.has(ch)) {
      if (!current.length) start = offset;
      current.push(runeIndex.get(ch));
      offset += 1;
    } else if (ch === '-' || ch === '.') {
      flush();
    }
    // Spaces, line breaks, slash markers and other layout marks are not word
    // boundaries in the established page-word parser.
  }
  flush();
  return { runeCount: offset, words };
}

const pages = new Map();
for (let p = 0; p <= 55; p += 1) {
  if (p !== 50) pages.set(p, parsePage(p));
}

function pageWord(page, ordinal) {
  const record = pages.get(page);
  if (!record || ordinal < 1) return null;
  return record.words.find((w) => w.ordinal === ordinal) || null;
}

const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');
const signedMatch = signed.match(
  /-----BEGIN PGP SIGNED MESSAGE-----\r?\nHash: SHA1\r?\n\r?\n([\s\S]*?)\r?\n-----BEGIN PGP SIGNATURE-----/
);
assert.ok(signedMatch, 'could not isolate the cleartext-signed body');
const sourceWords = (signedMatch[1].match(/\b[A-Za-z]+\b/g) || []).map((w) => w.toUpperCase());
assert.equal(sourceWords.length, 43, 'natural-language word count changed');

function positions(word) {
  return sourceWords.map((w, i) => (w === word ? i : -1)).filter((i) => i >= 0);
}
const thePositions = positions('THE');
const directionPositions = positions('DIRECTION');
assert.deepEqual(thePositions, [1, 7, 12, 17, 22, 28]);
assert.deepEqual(directionPositions, [29]);

const repeated = {};
for (const word of ['THE', 'THEIR', 'IS', 'ARE', 'AND']) {
  repeated[word] = positions(word).map((i) => ({ zeroBasedIndex: i, oneBasedOrdinal: i + 1 }));
}

const zeroBasedMap = sourceWords.map((word, i) => ({
  sourceWord: word,
  sourceIndex: i,
  sourceOrdinal: i + 1,
  physicalPage: i,
  selectedPageWord: pageWord(i, i)
}));
const directOneBasedMap = sourceWords.map((word, i) => ({
  sourceWord: word,
  sourceIndex: i,
  sourceOrdinal: i + 1,
  physicalPage: i + 1,
  selectedPageWord: pageWord(i + 1, i + 1)
}));
const zeroMissing = zeroBasedMap.filter((x) => !x.selectedPageWord);
const directMissing = directOneBasedMap.filter((x) => !x.selectedPageWord);
assert.equal(zeroBasedMap.length - zeroMissing.length, 41);
assert.equal(directOneBasedMap.length - directMissing.length, 42);
assert.deepEqual(zeroMissing.map((x) => [x.sourceWord, x.physicalPage]), [['HELLO', 0], ['YOU', 32]]);
assert.deepEqual(directMissing.map((x) => [x.sourceWord, x.physicalPage]), [['AND', 32]]);

const allPageSelections = [];
for (const [page, record] of pages.entries()) {
  const selected = pageWord(page, page);
  if (!selected) continue;
  const center = (record.runeCount + 1) / 2;
  allPageSelections.push({
    page,
    runeCount: record.runeCount,
    pageWordCount: record.words.length,
    selectedWord: page,
    selectedStartRune: selected.start + 1,
    selectedLength: selected.length,
    center,
    startMinusCenter: selected.start + 1 - center
  });
}
const centerAdjacent = allPageSelections.filter((x) => x.startMinusCenter === 1);
assert.equal(allPageSelections.length, 48);
assert.deepEqual(centerAdjacent.map((x) => x.page), [28]);

const p28Word28 = pageWord(28, 28);
const p29Word29 = pageWord(29, 29);
const p30Word30 = pageWord(30, 30);
assert.deepEqual(
  { startRune: p28Word28.start + 1, length: p28Word28.length, center: (pages.get(28).runeCount + 1) / 2 },
  { startRune: 136, length: 5, center: 135 }
);
assert.deepEqual(
  { startRune: p29Word29.start + 1, length: p29Word29.length, values: p29Word29.values },
  { startRune: 107, length: 2, values: [8, 15] }
);
assert.deepEqual(
  { startRune: p30Word30.start + 1, length: p30Word30.length, values: p30Word30.values },
  { startRune: 122, length: 6, values: [3, 18, 16, 0, 24, 20] }
);

// Rebuild complete words across the first 55 rune-bearing physical pages.
// A page boundary does not terminate a printed word; only printed hyphens
// and periods do. Cross-page words remain intact and are excluded from the
// complete-page-local two-rune census.
const globalWords = [];
let runeBearingPage = 0;
let globalRuneOffset = 0;
let current = [];

function physicalPageFromSegment(segment) {
  return segment <= 49 ? segment : segment + 1;
}

function flushGlobal() {
  if (!current.length) return;
  globalWords.push({
    values: current.map((x) => x.value),
    startPage: current[0].page,
    endPage: current[current.length - 1].page,
    startGlobalRune: current[0].globalRune
  });
  current = [];
}

for (const ch of pageParts.join('%')) {
  if (runeSet.has(ch)) {
    current.push({
      value: runeIndex.get(ch),
      page: physicalPageFromSegment(runeBearingPage),
      globalRune: globalRuneOffset
    });
    globalRuneOffset += 1;
  } else if (ch === '%') {
    runeBearingPage += 1;
  } else if (ch === '-' || ch === '.') {
    flushGlobal();
  }
}
flushGlobal();

const completeTwoRuneWords = globalWords.filter(
  (w) => w.startPage === w.endPage && w.values.length === 2
);
assert.equal(completeTwoRuneWords.length, 448);

function H(pair) {
  return [
    ((pair[0] - pair[1]) % 29 + 29) % 29,
    ((pair[0] + pair[1]) % 29 + 29) % 29
  ];
}
const expected = [22, 23]; // p28 DH state p=23 gives [p-1,p].
const targetMatches = completeTwoRuneWords.filter(
  (w) => H(w.values).join(',') === expected.join(',')
);
assert.equal(targetMatches.length, 1);
assert.equal(targetMatches[0].startPage, 29);
assert.deepEqual(targetMatches[0].values, [8, 15]);
assert.ok(globalWords.some(
  (w) => w.startPage === 29 && w.endPage === 29 && w.values.join(',') === '8,15'
), 'p29 word29 must be a complete word, not a page-boundary fragment');

const indexHtml = read('resources/historical/stage11-2014-index.html');
const indexFiles = [...indexHtml.matchAll(/(?:src|href)=["'](\d+)\.jpg["']/gi)].map((m) => Number(m[1]));
assert.equal(indexFiles.length, 58);
assert.deepEqual(indexFiles, Array.from({ length: 58 }, (_, i) => i));

const manifest = JSON.parse(read('resources/historical/stage11-2014-index-manifest.json'));
assert.equal(manifest.images.length, 58);
for (let i = 0; i < 58; i += 1) {
  assert.equal(manifest.images[i].sourceFile, i + '.jpg');
  assert.equal(manifest.images[i].mirrorFile, 'resources/liber-primus/' + (i + 17) + '.jpg');
}
assert.equal(manifest.images[28].mirrorFile, 'resources/liber-primus/45.jpg');
assert.equal(manifest.images[29].mirrorFile, 'resources/liber-primus/46.jpg');
assert.equal(manifest.images[30].mirrorFile, 'resources/liber-primus/47.jpg');

const output = {
  sourceWordCount: sourceWords.length,
  repeatedSourceWords: repeated,
  relevantSourceOrdinals: {
    lastTHE: { zeroBasedIndex: 28, oneBasedOrdinal: 29 },
    DIRECTION: { zeroBasedIndex: 29, oneBasedOrdinal: 30 }
  },
  typedPageConversion: 'one-based source ordinal n -> zero-based physical page p=n-1',
  directOneBasedAlternative: 'one-based source ordinal n -> physical page p=n',
  fullSourceCoverage: {
    zeroBasedIndexToPage: { valid: 41, total: 43, missing: zeroMissing.map((x) => ({ word: x.sourceWord, page: x.physicalPage })) },
    directOneBasedOrdinalToPage: { valid: 42, total: 43, missing: directMissing.map((x) => ({ word: x.sourceWord, page: x.physicalPage })) }
  },
  pageSameNumberWordControl: {
    validPageSelections: allPageSelections.length,
    centerAdjacentPages: centerAdjacent,
    neighbors: allPageSelections.filter((x) => [27, 28, 29, 30].includes(x.page))
  },
  receivers: {
    p28Word28: { startRune: p28Word28.start + 1, length: p28Word28.length, centerRune: 135 },
    p29Word29: { startRune: p29Word29.start + 1, length: p29Word29.length, GP0: p29Word29.values, H: H(p29Word29.values), complete: true },
    p30Word30: { startRune: p30Word30.start + 1, length: p30Word30.length, GP0: p30Word30.values }
  },
  completeTwoRuneWords: completeTwoRuneWords.length,
  uniqueDHStateMatch: {
    expected,
    occurrences: targetMatches.length,
    physicalPage: targetMatches[0].startPage,
    rawGP0: targetMatches[0].values,
    transformed: H(targetMatches[0].values)
  },
  stage11PageLabels: { count: indexFiles.length, first: indexFiles[0], last: indexFiles[indexFiles.length - 1] }
};
console.log(JSON.stringify(output, null, 2));
