'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

/** @param {string} rel */
function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r/g, '');
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const runeIndex = new Map(corpus.runes.map((rune, value) => [rune, value]));
const parts = transcription.split('%');

/** @param {number} page */
function segment(page) {
  if (page === 50) return '';
  return parts[page >= 51 ? page - 1 : page];
}

/** @param {number} page */
function parsePage(page) {
  const words = [];
  const runes = [];
  let current = [];
  let start = 0;

  function emit() {
    if (!current.length) return;
    words.push({ start, values: current.slice() });
    current = [];
  }

  for (const ch of segment(page)) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if ('-.&$§'.includes(ch)) {
      emit();
    }
  }
  emit();
  return { words, runes };
}

/** @param {number} base @param {number} exponent */
function pow29(base, exponent) {
  let result = 1n;
  let value = BigInt(base);
  let power = BigInt(exponent);
  while (power > 0n) {
    if (power & 1n) result = (result * value) % 29n;
    value = (value * value) % 29n;
    power >>= 1n;
  }
  return Number(result);
}

/**
 * @param {number[]} source
 * @param {'predecessor'|'successor'} side
 */
function transform(source, side) {
  if (side === 'predecessor') {
    return [pow29(source[0], 3), ...source.slice(1).map((x) => pow29(x, 27))];
  }
  return [...source.slice(0, -1).map((x) => pow29(x, 27)), pow29(source.at(-1), 3)];
}

/** @param {number} page @param {number} boundaryOffset */
function predecessorFiveAt(page, boundaryOffset) {
  if (page < 0 || page > 57 || page === 50) return null;
  const parsed = parsePage(page);
  if (boundaryOffset < 0 || boundaryOffset >= parsed.runes.length) return null;
  const word = parsed.words.find((w) => w.start === boundaryOffset + 1 && w.values.length === 5);
  if (!word) return null;
  return {
    page,
    boundaryOffset,
    boundary: parsed.runes[boundaryOffset],
    wordStart: word.start,
    word: word.values,
  };
}

const p25 = parsePage(25);
const selectedWord = p25.words.find((w) => w.start === 145 && w.values.length === 5);
assert.ok(selectedWord, 'missing selected p25 five-rune word');
assert.deepEqual(selectedWord.values, [3, 20, 10, 11, 16]);

const selectedSource = [p25.runes[144], ...selectedWord.values];
assert.deepEqual(selectedSource, [18, 3, 20, 10, 11, 16]);

const selectedOutput = transform(selectedSource, 'predecessor');
assert.deepEqual(selectedOutput, [3, 10, 16, 3, 8, 20]);

const selectedSums = [
  selectedOutput[0],
  selectedOutput.slice(1).reduce((sum, value) => sum + value, 0),
];
assert.deepEqual(selectedSums, [3, 57]);

const frozenCoordinates = [
  { fieldOrder: 'native', base: 'zero', page: 3, offset: 57 },
  { fieldOrder: 'native', base: 'one', page: 3, offset: 56 },
  { fieldOrder: 'swapped', base: 'zero', page: 57, offset: 3 },
  { fieldOrder: 'swapped', base: 'one', page: 57, offset: 2 },
];

const frozenResults = frozenCoordinates.map((candidate) => ({
  ...candidate,
  target: predecessorFiveAt(candidate.page, candidate.offset),
}));
assert.ok(frozenResults.every((candidate) => candidate.target === null));

const objects = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const parsed = parsePage(page);

  for (const word of parsed.words) {
    if (word.values.length !== 5) continue;

    if (word.start > 0) {
      const source = [parsed.runes[word.start - 1], ...word.values];
      const output = transform(source, 'predecessor');
      objects.push({
        page,
        start: word.start,
        side: 'predecessor',
        source,
        output,
        sums: [output[0], output.slice(1).reduce((sum, value) => sum + value, 0)],
      });
    }

    const successorOffset = word.start + word.values.length;
    if (successorOffset < parsed.runes.length) {
      const source = [...word.values, parsed.runes[successorOffset]];
      const output = transform(source, 'successor');
      objects.push({
        page,
        start: word.start,
        side: 'successor',
        source,
        output,
        sums: [output.slice(0, 5).reduce((sum, value) => sum + value, 0), output[5]],
      });
    }
  }
}
assert.equal(objects.length, 627);

const matched = [];
for (const object of objects) {
  const [left, right] = object.sums;
  const fieldOrders = [
    { name: 'native', page: left, rawOffset: right },
    { name: 'swapped', page: right, rawOffset: left },
  ];

  for (const order of fieldOrders) {
    for (const index of [
      { name: 'zero', offset: order.rawOffset },
      { name: 'one', offset: order.rawOffset - 1 },
    ]) {
      const target = predecessorFiveAt(order.page, index.offset);
      if (!target) continue;
      matched.push({
        source: {
          page: object.page,
          start: object.start,
          side: object.side,
          sums: object.sums,
        },
        variant: {
          fieldOrder: order.name,
          base: index.name,
          page: order.page,
          offset: index.offset,
        },
        target,
      });
    }
  }
}

assert.equal(matched.length, 32);
const selectedMatched = matched.filter((hit) =>
  hit.source.page === 25 &&
  hit.source.start === 145 &&
  hit.source.side === 'predecessor'
);
assert.equal(selectedMatched.length, 0);

console.log(JSON.stringify({
  selected: {
    source: selectedSource,
    transformed: selectedOutput,
    segmentSums: selectedSums,
    frozenCoordinates: frozenResults,
  },
  controls: {
    sideObjectCount: objects.length,
    genericTypedHits: matched.length,
    selectedObjectTypedHits: selectedMatched.length,
  },
  decision: 'Frozen 3|57 page/offset continuation fails all charged coordinates.',
}, null, 2));
