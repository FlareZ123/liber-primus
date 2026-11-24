#!/usr/bin/env node
'use strict';

// Exact, no-search test: apply the earlier 2014 GP29 word-prime-sum operation
// to the 25 printed words of LP2 numbered item 3 (p37 offsets 91..188).
// Compare row-major with the source 2014 5x5 squares; no rotations, shifts,
// substitutions, word reordering, or modulo operations are permitted.

const fs = require('node:fs');
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const transcription = fs.readFileSync('resources/liber-primus/lp2-transcription.txt', 'utf8');
const pages = transcription.split(/\n%\n/);
if (pages.length !== 57) throw new Error('Unexpected canonical page count');

const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const page37 = pages[37];
const start = 91;
const end = 189; // exclusive
let runePosition = 0;
let currentWord = '';
const words = [];

for (const ch of page37) {
  if (runeToIndex.has(ch)) {
    if (runePosition >= start && runePosition < end) currentWord += ch;
    runePosition += 1;
  } else if (ch === '-' && runePosition > start && runePosition <= end) {
    if (currentWord.length) words.push(currentWord);
    currentWord = '';
  }
}
if (currentWord.length) words.push(currentWord);

const primeSums = words.map(word =>
  [...word].reduce((sum, rune) => sum + corpus.prime[runeToIndex.get(rune)], 0)
);

const square1033 = [
  [272, 138, 341, 131, 151],
  [366, 199, 130, 320, 18],
  [226, 245, 91, 245, 226],
  [18, 320, 130, 199, 366],
  [151, 131, 341, 138, 272]
];
const square3301 = [
  [434, 1311, 312, 278, 966],
  [204, 812, 934, 280, 1071],
  [626, 620, 809, 620, 626],
  [1071, 280, 934, 812, 204],
  [966, 278, 312, 1311, 434]
];

const flat1033 = square1033.flat();
const flat3301 = square3301.flat();
const lineSums = values => Array.from({ length: 5 }, (_, r) =>
  values.slice(r * 5, r * 5 + 5).reduce((a, b) => a + b, 0));
const columnSums = values => Array.from({ length: 5 }, (_, c) =>
  Array.from({ length: 5 }, (_, r) => values[r * 5 + c]).reduce((a, b) => a + b, 0));
const diagonalSums = values => [
  values[0] + values[6] + values[12] + values[18] + values[24],
  values[4] + values[8] + values[12] + values[16] + values[20]
];
const sorted = values => [...values].sort((a, b) => a - b);
const exact = (a, b) => JSON.stringify(a) === JSON.stringify(b);

if (words.length !== 25) throw new Error('Item 3 is not 25 words');
if (words.reduce((n, w) => n + [...w].length, 0) !== 98) throw new Error('Item 3 is not 98 runes');
if (!square1033.every(row => row.reduce((a, b) => a + b, 0) === 1033)) throw new Error('Bad 1033 source square');
if (!square3301.every(row => row.reduce((a, b) => a + b, 0) === 3301)) throw new Error('Bad 3301 source square');

const result = {
  method: 'sum original GP29 prime values within each printed word',
  item: 3,
  source_rune_offsets_zero_based: [start, end],
  word_count: words.length,
  word_lengths: words.map(w => [...w].length),
  word_transliterations: words.map(w => [...w].map(r => corpus.translit[runeToIndex.get(r)]).join('')),
  prime_sums: primeSums,
  row_sums: lineSums(primeSums),
  column_sums: columnSums(primeSums),
  diagonal_sums: diagonalSums(primeSums),
  exact_1033_square_row_major: exact(primeSums, flat1033),
  exact_3301_square_row_major: exact(primeSums, flat3301),
  1033_square_cell_multiset_match: exact(sorted(primeSums), sorted(flat1033)),
  3301_square_cell_multiset_match: exact(sorted(primeSums), sorted(flat3301)),
  interpretation: 'Fixed direct word-sum transfer rejected; no alternative traversal or transformation tested.'
};

console.log(JSON.stringify(result, null, 2));
