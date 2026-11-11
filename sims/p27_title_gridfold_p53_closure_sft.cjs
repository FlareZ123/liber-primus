'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/base60-grid.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(ROOT, 'resources/lp2-transcription.txt'), 'utf8');

const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} n */
function bits9(n) {
  return n.toString(2).padStart(9, '0');
}

/** @param {number[]} target */
function findTranscriptionChunk(target) {
  const chunks = transcription.split('%');
  for (const chunk of chunks) {
    const indices = [...chunk].filter((ch) => runeToIndex.has(ch)).map((ch) => runeToIndex.get(ch));
    if (indices.length === target.length && indices.every((value, i) => value === target[i])) return chunk;
  }
  throw new Error('exact transcription chunk not found');
}

/** @param {string} chunk */
function printedWords(chunk) {
  const compact = chunk.replace(/\/\s*/g, '');
  let cursor = 0;
  const words = [];
  for (const part of compact.split(/[-.]/)) {
    const indices = [...part].filter((ch) => runeToIndex.has(ch)).map((ch) => runeToIndex.get(ch));
    if (!indices.length) continue;
    const primeSum = indices.reduce((sum, index) => sum + corpus.prime[index], 0);
    words.push({
      ordinal: words.length + 1,
      start: cursor,
      end: cursor + indices.length - 1,
      indices,
      primeSum,
      residue: primeSum % 29
    });
    cursor += indices.length;
  }
  return words;
}

/** @param {number} seed */
function makeRng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {number[]} flat */
function verticalFoldMatches(flat) {
  const matches = [];
  for (let row = 0; row < 16; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      const foldedIndex = row * 8 + column;
      const a = flat[row * 8 + column];
      const b = flat[(31 - row) * 8 + column];
      if (a === b) matches.push({row, column, foldedIndex, byte: a});
    }
  }
  return matches;
}

const p27 = corpus.pages.find((page) => page.page === 27);
const p53 = corpus.pages.find((page) => page.page === 53);
assert.ok(p27 && p53);

const p27Ink = ink.pages.find((page) => page.page === 27);
const p53Ink = ink.pages.find((page) => page.page === 53);
assert.ok(p27Ink && p53Ink);
assert.deepEqual(p27Ink.red_spans[0].start, 0);
assert.deepEqual(p27Ink.red_spans[0].length, 19);
assert.deepEqual(p53Ink.red_spans[0], {
  start: 128,
  length: 51,
  runes: p53Ink.red_spans[0].runes
});

const title = p27.indices.slice(0, 19);
assert.equal(title.length, 19);
assert.equal(title[0], 19);

const equalBits = [];
for (let i = 0; i < 9; i += 1) equalBits.push(title[i] === title[18 - i] ? 1 : 0);
assert.deepEqual(equalBits, [0, 0, 0, 1, 0, 0, 0, 0, 0]);

const forwardMask = Number.parseInt(equalBits.join(''), 2);
const reverseMask = Number.parseInt(equalBits.slice().reverse().join(''), 2);
assert.equal(forwardMask, 32);
assert.equal(reverseMask, 8);
assert.equal(grid.byte_rows.length, forwardMask);
assert.ok(grid.byte_rows.every((row) => row.length === reverseMask));

// Across all odd-length original red spans, p27 is the only one whose
// mirrored-equality mask and reverse read reproduce the 32x8 grid dimensions.
const pageByNumber = new Map(corpus.pages.map((page) => [page.page, page]));
const redDimensionHits = [];
for (const pageInk of ink.pages) {
  for (const span of pageInk.red_spans ?? []) {
    if (span.length < 3 || span.length % 2 === 0) continue;
    const source = pageByNumber.get(pageInk.page).indices.slice(span.start, span.start + span.length);
    const half = (source.length - 1) / 2;
    const bits = [];
    for (let i = 0; i < half; i += 1) bits.push(source[i] === source[source.length - 1 - i] ? 1 : 0);
    const a = Number.parseInt(bits.join(''), 2);
    const b = Number.parseInt(bits.slice().reverse().join(''), 2);
    if ((a === 32 && b === 8) || (a === 8 && b === 32)) {
      redDimensionHits.push({page: pageInk.page, start: span.start, length: span.length});
    }
  }
}
assert.deepEqual(redDimensionHits, [{page: 27, start: 0, length: 19}]);

const flat = grid.byte_rows.flat();
assert.equal(flat.length, 256);
const matches = verticalFoldMatches(flat);
assert.deepEqual(matches, [{row: 15, column: 2, foldedIndex: 122, byte: 86}]);
assert.equal(grid.rows[15][2], '1Q');
assert.equal(grid.rows[16][2], '1Q');
assert.equal(grid.alphabet.indexOf('Q'), 26);

const p53Black = p53.indices.slice(0, p53Ink.red_spans[0].start);
assert.equal(p53Black.length, 128);
const p53Words = printedWords(findTranscriptionChunk(p53.indices));
const wordAt = new Array(128).fill(null);
for (const word of p53Words) {
  for (let i = word.start; i <= Math.min(word.end, 127); i += 1) wordAt[i] = word.ordinal;
}

const selected = matches[0];
const selectedWordOrdinal = wordAt[selected.foldedIndex];
assert.equal(selected.foldedIndex + 1, 123);
assert.equal(selectedWordOrdinal, 26);
const word26 = p53Words[selectedWordOrdinal - 1];
assert.equal(word26.end, selected.foldedIndex);
assert.deepEqual(word26.indices, [12, 1, 17]);
assert.equal(word26.primeSum, 105);
assert.equal(word26.residue, 18);
assert.equal(selected.byte + title.length, word26.primeSum);
assert.equal(grid.alphabet.indexOf('Q'), selectedWordOrdinal);

// The unique folded cell also behaves like a complete word/letter address.
const upperRowOneBased = selected.row + 1;
const lowerRowOneBased = 32 - selected.row;
const rowDifference = lowerRowOneBased - upperRowOneBased;
const columnOneBased = selected.column + 1;
assert.deepEqual([upperRowOneBased, lowerRowOneBased, columnOneBased], [16, 17, 3]);
assert.equal(Math.floor(selected.byte / 60), rowDifference);
assert.equal(columnOneBased, word26.indices.length);
assert.equal(word26.indices[selected.column], lowerRowOneBased);

const word19 = p53Words[18];
assert.equal(selected.byte, word19.end);
assert.equal(word19.ordinal, title.length);
assert.deepEqual(word19.indices.slice(0, 2), [11, 1]);

const bookend = [23, 11, 1, 17, 18, 10];
assert.deepEqual(p27.indices.slice(28, 34), bookend);
const p55 = corpus.pages.find((page) => page.page === 55);
assert.ok(p55);
assert.deepEqual(p55.indices.slice(70, 76), bookend);
assert.equal(70 - 28, 42);
assert.equal(selected.byte + 42, p53Black.length);
assert.deepEqual(word26.indices.slice(-2), [1, 17]);

function closureFor(flatBytes) {
  const found = verticalFoldMatches(flatBytes);
  if (found.length !== 1) return {one: false, baseClosure: false, coordinateClosure: false};
  const hit = found[0];
  const ordinal = wordAt[hit.foldedIndex];
  const word = ordinal ? p53Words[ordinal - 1] : null;
  if (!word) return {one: true, baseClosure: false, coordinateClosure: false};

  const baseClosure = Boolean(
    hit.foldedIndex === word.end &&
    hit.byte % 60 === ordinal &&
    word.residue === 18
  );
  const lowerRow = 32 - hit.row;
  const rowDelta = lowerRow - (hit.row + 1);
  const coordinateClosure = Boolean(
    baseClosure &&
    hit.column + 1 === word.indices.length &&
    word.indices[hit.column] === lowerRow &&
    Math.floor(hit.byte / 60) === rowDelta
  );
  return {one: true, baseClosure, coordinateClosure};
}

const rng = makeRng(0x45f01829);
const trials = 200000;
let oneMatch = 0;
let baseClosure = 0;
let coordinateClosure = 0;
for (let trial = 0; trial < trials; trial += 1) {
  const shuffled = flat.slice();
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = rng() % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const result = closureFor(shuffled);
  if (result.one) oneMatch += 1;
  if (result.baseClosure) baseClosure += 1;
  if (result.coordinateClosure) coordinateClosure += 1;
}
assert.equal(oneMatch, 60859);
assert.equal(baseClosure, 34);
assert.equal(coordinateClosure, 20);

console.log(JSON.stringify({
  classification: 'source-constrained navigation candidate; no plaintext recovered',
  title: {
    runeCount: title.length,
    firstGpIndex: title[0],
    mirroredEqualityBits: equalBits.join(''),
    dimensions: [forwardMask, reverseMask]
  },
  gridFold: {
    matches,
    token: grid.rows[15][2],
    lowBase60Digit: grid.alphabet.indexOf('Q'),
    upperRowOneBased,
    lowerRowOneBased,
    rowDifference,
    columnOneBased,
    selectedRuneIndex: word26.indices[selected.column]
  },
  p53: {
    blackRunes: p53Black.length,
    selectedWordOrdinal,
    selectedWordEndZeroBased: word26.end,
    selectedWordIndices: word26.indices,
    selectedWordPrimeSum: word26.primeSum,
    selectedWordPrimeResidue: word26.residue,
    bytePlusTitleLength: selected.byte + title.length
  },
  p27p55: {
    repeatedPair: bookend,
    localStarts: [28, 70],
    displacement: 42,
    bytePlusDisplacement: selected.byte + 42
  },
  conditionalShuffle: {
    trials,
    exactlyOneVerticalMatch: oneMatch,
    baseClosure,
    coordinateClosure,
    basePlusOneFrequency: (baseClosure + 1) / (trials + 1),
    coordinatePlusOneFrequency: (coordinateClosure + 1) / (trials + 1),
    seed: '0x45f01829'
  }
}, null, 2));
