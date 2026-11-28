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
const q = 4;

/** @param {number} value */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

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
    words.push({ start, end: start + current.length, values: current.slice() });
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

/** @param {number[]} values */
function product(values) {
  return values.reduce((result, value) => mod29(result * value), 1);
}

/** @param {{values:number[]}} word */
function descriptor(word) {
  return [
    word.values.length,
    word.values.reduce((sum, value) => mod29(sum + value), 0),
    product(word.values),
  ];
}

/** @param {number[]} values */
function h3(values) {
  assert.equal(values.length, 3);
  return [
    mod29(values[0] - values[2]),
    values[1],
    mod29(values[0] + values[2]),
  ];
}

/** @param {number[]} values */
function permutations3(values) {
  const orders = [
    [0, 1, 2], [0, 2, 1], [1, 0, 2],
    [1, 2, 0], [2, 0, 1], [2, 1, 0],
  ];
  return orders.map((order) => ({
    order,
    values: order.map((index) => values[index]),
  }));
}

/** @param {number[]} h */
function chargedFamily(h) {
  const bases = [{ change: 'none', values: h.slice() }];
  for (let coordinate = 0; coordinate < 3; coordinate += 1) {
    for (const delta of [q, -q]) {
      const values = h.slice();
      values[coordinate] = mod29(values[coordinate] + delta);
      bases.push({
        change: `coord${coordinate}${delta === q ? '+q' : '-q'}`,
        values,
      });
    }
  }

  const out = [];
  for (const base of bases) {
    for (const permutation of permutations3(base.values)) {
      out.push({
        change: base.change,
        order: permutation.order,
        values: permutation.values,
      });
    }
  }
  assert.equal(out.length, 42);
  return out;
}

const p33 = parsePage(33);
const p33First = p33.words.find((word) => word.start === 91);
const p33Second = p33.words.find((word) => word.start === 94);
const p33Next = p33.words.find((word) => word.start === 99);
assert.ok(p33First && p33Second && p33Next);
assert.deepEqual([p33First.values.length, p33Second.values.length], [3, 5]);
assert.deepEqual(p33First.values, [21, 2, 12]);

const p33H = h3(p33First.values);
const p33Target = descriptor(p33Next);
assert.deepEqual(p33H, [9, 2, 4]);
assert.deepEqual(p33Target, [6, 4, 9]);

const p33Matches = chargedFamily(p33H).filter((candidate) =>
  candidate.values.every((value, index) => value === p33Target[index])
);
assert.deepEqual(p33Matches, [{
  change: 'coord1+q',
  order: [1, 2, 0],
  values: [6, 4, 9],
}]);

const p40 = parsePage(40);
const p40First = p40.words.find((word) => word.start === 0);
const p40Second = p40.words.find((word) => word.start === 3);
const p40Next = p40.words.find((word) => word.start === 8);
assert.ok(p40First && p40Second && p40Next);
assert.deepEqual([p40First.values.length, p40Second.values.length], [3, 5]);
assert.deepEqual(p40First.values, [0, 9, 19]);

const p40H = h3(p40First.values);
assert.deepEqual(p40H, [10, 9, 19]);

const frozenPrediction = [
  mod29(p40H[1] + q),
  p40H[2],
  p40H[0],
];
assert.deepEqual(frozenPrediction, [13, 19, 10]);

const p40Target = descriptor(p40Next);
assert.deepEqual(p40Next.values, [24, 13, 14, 26, 8]);
assert.deepEqual(p40Target, [5, 27, 3]);
assert.notDeepEqual(frozenPrediction, p40Target);

const p40Matches = chargedFamily(p40H).filter((candidate) =>
  candidate.values.every((value, index) => value === p40Target[index])
);
assert.equal(p40Matches.length, 0);

console.log(JSON.stringify({
  discoveryOnly: {
    page: 33,
    firstRedWord: p33First.values,
    H3: p33H,
    immediateBlackDescriptor: p33Target,
    chargedFamilySize: 42,
    chargedMatches: p33Matches,
  },
  prospectiveControl: {
    page: 40,
    firstRedWord: p40First.values,
    H3: p40H,
    frozenPrediction,
    immediateBlackWord: p40Next.values,
    actualDescriptor: p40Target,
    chargedMatches: p40Matches,
  },
  decision: 'p33 local H/q successor relation fails the independent p40 [3,5] red-span holdout.',
}, null, 2));
