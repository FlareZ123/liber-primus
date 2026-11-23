#!/usr/bin/env node
'use strict';

// Exact original-source support test for a 27-symbol, one-rune/one-output,
// previous-ciphertext-only finite-state encoder.
//
// Run from the repository root:
//   node sims/lp2_gp27_local_successor_injection_sft.cjs
//
// The transcription omits the non-runic p50 numeric-table page; its first 55 '%' segments are
// the 55 rune-bearing LP2 pages p0-p55. Page separators are removed before
// word splitting so cross-page words remain intact.

const fs = require('node:fs');
const assert = require('node:assert/strict');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const transcription = fs.readFileSync('resources/liber-primus/lp2-transcription.txt', 'utf8');
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

const segments = transcription.split('%').slice(0, 55);
assert.equal(segments.length, 55, 'expected 55 rune-bearing LP2 page segments');

function parseWords(source) {
  return source
    .replace(/[\/\r\n&$]/g, '')
    .split(/[-.]/)
    .filter(Boolean)
    .map(token => Array.from(token)
      .filter(char => runeIndex.has(char))
      .map(char => runeIndex.get(char)))
    .filter(word => word.length > 0);
}

function newMatrix() {
  return Array.from({ length: 29 }, () => Array(29).fill(0));
}

function addWord(matrix, word) {
  for (let i = 1; i < word.length; i++) matrix[word[i - 1]][word[i]]++;
}

function summarize(matrix) {
  const offDiagonal = [];
  const rowSupport = [];
  let transitions = 0;
  let repeats = 0;

  for (let previous = 0; previous < 29; previous++) {
    const row = matrix[previous];
    transitions += row.reduce((sum, count) => sum + count, 0);
    repeats += row[previous];
    let successors = 0;
    let rowMinimum = Infinity;

    for (let next = 0; next < 29; next++) {
      if (next === previous) continue;
      const count = row[next];
      offDiagonal.push(count);
      if (count > 0) successors++;
      rowMinimum = Math.min(rowMinimum, count);
    }

    rowSupport.push({
      previous: corpus.translit[previous],
      distinctNonrepeatSuccessors: successors,
      minimumCountAmongThose28: rowMinimum
    });
  }

  return {
    transitions,
    repeats,
    offDiagonalPairsObserved: offDiagonal.filter(count => count > 0).length,
    offDiagonalPairTotal: 29 * 28,
    minimumOffDiagonalPairCount: Math.min(...offDiagonal),
    everyPreviousRuneHasAll28Successors: rowSupport.every(
      row => row.distinctNonrepeatSuccessors === 28
    ),
    rowSupport
  };
}

const words = parseWords(segments.join(''));
const wordRuneCount = words.reduce((sum, word) => sum + word.length, 0);
assert.equal(words.length, 2896, 'word parser must recover the original 2,896 words');
assert.equal(wordRuneCount, 12956, 'word parser must recover all 12,956 LP2 runes');

const withinWord = newMatrix();
for (const word of words) addWord(withinWord, word);

// Same word parsing, but reset at each physical page. This removes the 32
// within-word transitions that cross a page boundary.
const withinWordWithPageReset = newMatrix();
for (const segment of segments) {
  for (const word of parseWords(segment)) addWord(withinWordWithPageReset, word);
}

// Page-local and fully continuous views are independent boundary controls.
const runePages = corpus.pages.filter(page => page.page <= 55 && page.runic_count > 0);
assert.equal(runePages.length, 55);
const flat = runePages.flatMap(page => page.indices);
assert.equal(flat.length, 12956);

const withinPage = newMatrix();
for (const page of runePages) {
  for (let i = 1; i < page.indices.length; i++) {
    withinPage[page.indices[i - 1]][page.indices[i]]++;
  }
}

const continuous = newMatrix();
for (let i = 1; i < flat.length; i++) continuous[flat[i - 1]][flat[i]]++;

const p0to2 = corpus.pages.filter(page => page.page <= 2).flatMap(page => page.indices);
assert.equal(p0to2.length, 729, 'p0-p2 should contain 27^2 runes');
const p0to2AlphabetSize = new Set(p0to2).size;
assert.equal(p0to2AlphabetSize, 29, 'p0-p2 uses all 29 GP symbols');

const results = {
  source: {
    runeBearingPages: runePages.length,
    runes: flat.length,
    words: words.length,
    p0ToP2Runes: p0to2.length,
    p0ToP2DistinctRunes: p0to2AlphabetSize
  },
  withinWordsPageCarry: summarize(withinWord),
  withinWordsPageReset: summarize(withinWordWithPageReset),
  withinPagesWordBoundariesRetained: summarize(withinPage),
  continuousStream: summarize(continuous)
};

assert.equal(results.withinWordsPageCarry.transitions, 10060);
assert.equal(results.withinWordsPageCarry.repeats, 63);
assert.equal(results.withinWordsPageCarry.offDiagonalPairsObserved, 812);
assert.equal(results.withinWordsPageCarry.minimumOffDiagonalPairCount, 3);
assert.equal(results.withinWordsPageCarry.everyPreviousRuneHasAll28Successors, true);

assert.equal(results.withinWordsPageReset.transitions, 10028);
assert.equal(results.withinWordsPageReset.repeats, 63);
assert.equal(results.withinWordsPageReset.offDiagonalPairsObserved, 812);
assert.equal(results.withinWordsPageReset.minimumOffDiagonalPairCount, 3);
assert.equal(results.withinWordsPageReset.everyPreviousRuneHasAll28Successors, true);

assert.equal(results.withinPagesWordBoundariesRetained.transitions, 12901);
assert.equal(results.withinPagesWordBoundariesRetained.repeats, 86);
assert.equal(results.withinPagesWordBoundariesRetained.offDiagonalPairsObserved, 812);
assert.equal(results.withinPagesWordBoundariesRetained.minimumOffDiagonalPairCount, 5);
assert.equal(results.withinPagesWordBoundariesRetained.everyPreviousRuneHasAll28Successors, true);

assert.equal(results.continuousStream.transitions, 12955);
assert.equal(results.continuousStream.repeats, 86);
assert.equal(results.continuousStream.offDiagonalPairsObserved, 812);
assert.equal(results.continuousStream.minimumOffDiagonalPairCount, 5);
assert.equal(results.continuousStream.everyPreviousRuneHasAll28Successors, true);

results.crossWordRepeats = 86 - 63;
results.crossPageWithinWordTransitions = 10060 - 10028;
assert.equal(results.crossWordRepeats, 23);
assert.equal(results.crossPageWithinWordTransitions, 32);

console.log(JSON.stringify(results, null, 2));
console.log('\nPASS: all 812 ordered nonidentical transitions occur after every previous rune, even within words and with page resets.');
