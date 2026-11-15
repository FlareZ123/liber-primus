#!/usr/bin/env node
'use strict';

// Deterministic robustness check for the LP2 lag-five within-word statistic.
// Four extra apostrophe boundaries were independently observed in the
// relikd/LiberPrayground page transcription at the stated absolute rune offsets.
// Run from repository root: node sims/lag5_relikd_segmentation_crosscheck.cjs

const fs = require('node:fs');
const assert = require('node:assert/strict');
const { parseSharedCorpus } = require('./lp2_word_pages.cjs');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const parsed = parseSharedCorpus();
const currentWords = parsed.words.map((w) => Array.from(w.runes).map((r) => corpus.runes.indexOf(r)));
const cuts = [1110, 5138, 8515, 10089];

assert.equal(parsed.runeCount, 12956);
assert.equal(currentWords.length, 2896);
assert.ok(currentWords.flat().every((r) => r >= 0));

function tally(words) {
  let hits = 0;
  let opportunities = 0;
  let contiguousPairs = 0;
  for (const word of words) {
    for (let i = 5; i < word.length; i++) {
      opportunities++;
      if (word[i] === word[i - 5]) {
        hits++;
        if (i >= 6 && word[i - 1] === word[i - 6]) contiguousPairs++;
      }
    }
  }
  return { hits, opportunities, contiguousPairs, rate: hits / opportunities };
}

const currentTally = tally(currentWords);
const currentBoundaries = new Set();
{
  let n = 0;
  for (const word of currentWords) {
    n += word.length;
    currentBoundaries.add(n);
  }
}
const relikdWords = [];
let offset = 0;
for (const word of currentWords) {
  const end = offset + word.length;
  const localCuts = cuts.filter((cut) => cut > offset && cut < end).map((cut) => cut - offset);
  let start = 0;
  for (const cut of localCuts) {
    relikdWords.push(word.slice(start, cut));
    start = cut;
  }
  relikdWords.push(word.slice(start));
  offset = end;
}
const relikdTally = tally(relikdWords);
const relikdBoundaries = new Set();
{
  let n = 0;
  for (const word of relikdWords) {
    n += word.length;
    relikdBoundaries.add(n);
  }
}
const flatCurrent = currentWords.flat();
const flatRelikd = relikdWords.flat();
const boundaryDiffs = [...new Set([...currentBoundaries, ...relikdBoundaries])]
  .filter((x) => currentBoundaries.has(x) !== relikdBoundaries.has(x))
  .sort((a, b) => a - b);

assert.equal(relikdWords.length, 2900);
assert.deepEqual(boundaryDiffs, cuts);
assert.deepEqual(flatRelikd, flatCurrent);
assert.deepEqual(currentTally, relikdTally);
assert.deepEqual(currentTally, {
  hits: 104,
  opportunities: 2105,
  contiguousPairs: 9,
  rate: 104 / 2105,
});

console.log(JSON.stringify({
  source: 'relikd/LiberPrayground pages p0-2 through p54-55; four apostrophe boundaries',
  current: { words: currentWords.length, runes: flatCurrent.length, tally: currentTally },
  relikdAlternative: { words: relikdWords.length, runes: flatRelikd.length, tally: relikdTally },
  extraBoundaryOffsets: cuts,
  extraBoundaryType: 'apostrophe (U+0027)',
  runeStreamsIdentical: true,
  lagFiveStatisticUnchanged: true,
}, null, 2));
