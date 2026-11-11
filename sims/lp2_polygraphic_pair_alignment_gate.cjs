'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { parseLP2Words } = require('./lp2_word_pages.cjs');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const pages = corpus.pages.filter(p => p.page >= 0 && p.page <= 55);
assert.equal(pages.length, 56);
assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), 12956);

let globalOffset = 0, total = 0, affectedPages = 0, conflictingPages = 0, minPageExceptions = 0;
const globalHistogram = [0, 0], pageHistogram = [0, 0];
for (const page of pages) {
  const local = [0, 0];
  for (let i = 1; i < page.indices.length; i++) {
    if (page.indices[i] !== page.indices[i - 1]) continue;
    local[i % 2]++;
    pageHistogram[i % 2]++;
    globalHistogram[(globalOffset + i) % 2]++;
    total++;
  }
  const n = local[0] + local[1];
  if (n) {
    affectedPages++;
    const exceptions = n - Math.max(...local);
    minPageExceptions += exceptions;
    if (exceptions) conflictingPages++;
  }
  globalOffset += page.indices.length;
}

const raw = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const parsed = parseLP2Words(raw, 55);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.crossPageWords, 32);

let within = 0, insidePair = 0, atPairBoundary = 0, wordsWithRepeats = 0;
let wordsWithBothParities = 0, minWordExceptions = 0;
const wordHistogram = [0, 0];
for (const word of parsed.words) {
  const runes = [...word.runes], local = [0, 0];
  for (let i = 1; i < runes.length; i++) {
    if (runes[i] !== runes[i - 1]) continue;
    within++; local[i % 2]++; wordHistogram[i % 2]++;
    if (i % 2 === 1) insidePair++;
    else atPairBoundary++;
  }
  const n = local[0] + local[1];
  if (n) {
    wordsWithRepeats++;
    minWordExceptions += n - Math.max(...local);
    if (local[0] && local[1]) wordsWithBothParities++;
  }
}

assert.equal(total, 86);
assert.equal(affectedPages, 42);
assert.deepEqual(globalHistogram, [49, 37]);
assert.equal(total - Math.max(...globalHistogram), 37);
assert.deepEqual(pageHistogram, [51, 35]);
assert.equal(conflictingPages, 14);
assert.equal(minPageExceptions, 17);
assert.equal(within, 63);
assert.equal(insidePair, 27);
assert.equal(atPairBoundary, 36);
assert.equal(wordsWithRepeats, 62);
assert.equal(wordsWithBothParities, 0);
assert.equal(minWordExceptions, 0);
assert.deepEqual(wordHistogram, [36, 27]);

// Synthetic positive control: every aligned pair contains distinct symbols.
const plant = [
  { page: 0, indices: [0, 1, 1, 2, 3, 4, 4, 5, 6, 7] },
  { page: 1, indices: [8, 9, 9, 10, 11, 12, 12, 13, 14, 15] },
];
let plantOdd = 0;
for (const p of plant) for (let i = 1; i < p.indices.length; i++)
  if (p.indices[i] === p.indices[i - 1] && i % 2 === 1) plantOdd++;
assert.equal(plantOdd, 0);

console.log(JSON.stringify({
  original: {
    runes: 12956, words: parsed.words.length, crossPageWords: parsed.crossPageWords,
    totalAdjacentRepeats: total, affectedPages,
    continuousPairingHistogram: globalHistogram,
    continuousPairingMinimumInternalRepeats: 37,
    pageLocalPairingHistogram: pageHistogram,
    conflictingPagesUnderPageLocalPhase: conflictingPages,
    minimumInternalRepeatsEvenWithPageSpecificPhase: minPageExceptions,
    withinWordRepeats: within,
    insideWordStartDigraphs: insidePair,
    atWordStartDigraphBoundaries: atPairBoundary,
    wordsWithRepeats, wordsWithBothParities,
    minimumInternalRepeatsEvenWithIndependentWordPhase: minWordExceptions,
    wordLocalPairingHistogram: wordHistogram
  },
  syntheticPositiveControl: { repeatedPairsInsideDigraphs: plantOdd },
  interpretation: 'Hard no-repeat digraphic encipherment fails under standard continuous, page-reset, and word-start pairings. Per-word phase selection is retrospective and source-unsupported.'
}, null, 2));
