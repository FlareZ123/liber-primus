#!/usr/bin/env node
'use strict';

/**
 * Source-register word-length crib matcher for original LP2 printed words.
 * Run in the repository: node sims/lp2_wordlength_source_crib_index_sft.cjs
 *
 * This finds possible passages copied from known literature without assuming
 * ciphertext letters are related by a particular cipher. Source words are
 * independently transliterated to GP29 rune lengths before comparison.
 * A match is only a candidate until independent rune/key evidence supports it.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const translit = gp.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);

const runicWordPattern = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const physicalRunePages = read('resources/lp2-transcription.txt').split('%').slice(0, 55);
assert.equal(physicalRunePages.length, 55);

function originalPageWordLengths(text) {
  const joined = text.replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '');
  const words = joined.match(runicWordPattern) || [];
  return words.map((w) => Array.from(w).length);
}

const originalPages = physicalRunePages.map(originalPageWordLengths);
const chapterPageRanges = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const segmentNumber = (physicalPage) =>
  physicalPage > 50 ? physicalPage - 1 : physicalPage;
const chapters = chapterPageRanges.map(([first, last], index) => ({
  chapter: index + 1,
  pages: [first, last],
  lengths: originalPages.slice(segmentNumber(first), segmentNumber(last) + 1).flat()
}));
assert.deepEqual(chapters.map((c) => c.lengths.length), [
  160, 259, 385, 441, 227, 329, 380, 680, 67
]);
assert.equal(chapters.reduce((a, x) => a + x.lengths.length, 0), 2896);
assert.equal(chapters.reduce((a, x) => a +
  x.lengths.reduce((b, y) => b + y, 0), 0), 12956);

/** Convert one ordinary written word to GP-native rune length. */
function nativeLength(word) {
  let glyphs = 0;
  for (let i = 0; i < word.length;) {
    if (word.startsWith('ING', i)) {
      glyphs++;
      i += 3;
      continue;
    }
    if (word.startsWith('IO', i)) {
      glyphs++;
      i += 2;
      continue;
    }
    const found = translit.find((t) => word.startsWith(t.s, i));
    assert(found, 'Unknown GP character sequence ' + word.slice(i));
    glyphs++;
    i += found.s.length;
  }
  return glyphs;
}

/** Return GP29-normalized whole-word lengths while retaining source words. */
function nativeEnglish(raw) {
  const normalized = raw.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const words = normalized.match(/[A-Z]+/g) || [];
  return { words, lengths: words.map(nativeLength) };
}

const latinAlphabet = '0123456789ABCDEFGHIJKLMNOPQRS';
const latinWords = read('resources/control/latin-vulgate-gp-wholewords.txt')
  .split(/\r?\n/).filter((line) => /^[0-9A-S]+$/.test(line));
assert(latinWords.every((s) =>
  [...s].every((glyph) => latinAlphabet.includes(glyph))
);

const references = [
  ['Shakespeare', nativeEnglish(read('resources/control/shakespeare_first300k.txt'))],
  ['Gibran The Prophet', nativeEnglish(read('resources/control/gibran_prophet_58585.txt'))],
  ['Emerson Essays', nativeEnglish(read('resources/control/emerson_essays_2944.txt'))],
  ['Latin Vulgate', { words: latinWords, lengths: latinWords.map((w) => w.length) }]
];
assert.deepEqual(references.map(([, r]) => r.words.length), [
  55407, 15733, 77932, 39835
]);

/**
 * Index exact 7-word length signatures and extend each original hit both ways.
 * This is a lossless search for exact length matches of >=7 words, distinct
 * from statistical frequency or visually chosen matching fragments.
 * @param {{words:string[],lengths:number[]}} reference
 * @param {{chapter:number,pages:number[],lengths:number[]}[]} targets
 */
function searchLengthMatches(reference, targets) {
  const k = 7;
  const index = new Map();
  const source = reference.lengths;
  for (let i = 0; i + k <= source.length; i++) {
    const signature = source.slice(i, i + k).join('.');
    let starts = index.get(signature);
    if (!starts) {
      starts = [];
      index.set(signature, starts);
    }
    starts.push(i);
  }
  let max = 0;
  const results = new Map();
  for (const target of targets) {
    const targetLengths = target.lengths;
    for (let i = 0; i + k <= targetLengths.length; i++) {
      const signature = targetLengths.slice(i, i + k).join('.');
      const starts = index.get(signature) || [];
      for (const found of starts) {
        let originalStart = i;
        let sourceStart = found;
        let span = k;
        while (originalStart > 0 && sourceStart > 0 &&
          targetLengths[originalStart - 1] === source[sourceStart - 1]) {
          originalStart--;
          sourceStart--;
          span++;
        }
        while (originalStart + span < targetLengths.length &&
          sourceStart + span < source.length &&
          targetLengths[originalStart + span] === source[sourceStart + span]) {
          span++;
        }
        if (span < max) continue;
        if (span > max) {
          max = span;
          results.clear();
        }
        const key = target.chapter + '/' + originalStart + '/' + sourceStart;
        results.set(key, {
          chapter: target.chapter,
          printedPages: target.pages,
          originalWordOffset: originalStart,
          sourceWordOffset: sourceStart,
          words: span,
          lengthSignature: targetLengths.slice(originalStart, originalStart + span),
          candidateSourceWords: reference.words
            .slice(sourceStart, sourceStart + span).join(' ')
        });
      }
    }
  }
  return { longestMatch: max, tiedBest: [...results.values()] };
}

const scans = references.map(([name, ref]) => ({
  source: name, sourceWords: ref.words.length,
  ...searchLengthMatches(ref, chapters)
}));
assert.deepEqual(scans.map((x) => x.longestMatch), [9, 10, 9, 9]);
assert.equal(scans[1].tiedBest[0].chapter, 7);
assert.equal(scans[1].tiedBest[0].originalWordOffset, 169);
assert.equal(scans[1].tiedBest[0].sourceWordOffset, 4886);

// Source-phrase positive control: a fully known, 20-word contiguous Gibran
// segment is transplanted at a legal in-chapter word boundary. The same scanner
// locates the entire inserted span with no predeclared substring/phrase.
const gibran = references[1][1];
const planted = chapters.map((c) => ({ ...c, lengths: c.lengths.slice() }));
planted[6].lengths.splice(169, 20, ...gibran.lengths.slice(4886, 4906));
const positive = searchLengthMatches(gibran, planted);
assert(positive.longestMatch >= 20);
assert(positive.tiedBest.some((m) =>
  m.chapter === 7 && m.originalWordOffset === 169 &&
  m.sourceWordOffset === 4886 && m.words >= 20
));

console.log(JSON.stringify({
  status: 'PASS',
  originalRunePages: 55,
  printedWords: 2896,
  printedRunes: 12956,
  sourceNativeGP29: true,
  chapterWordCounts: chapters.map((c) => c.lengths.length),
  references: scans,
  positive20WordSourcePlant: {
    recoveredAtOriginalChapter: 7,
    recoveredAtWordOffset: 169,
    recoveredAtSourceWordOffset: 4886,
    recoveredAtLeast: positive.longestMatch
  },
  interpretation: 'No eleven-or-longer exact GP29 word-length source passage found in these four literal source editions. A 10-word length match by itself is not recovered plaintext.'
}, null, 2));
