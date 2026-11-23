#!/usr/bin/env node
'use strict';

// Reuses the repository's source-fixed GP29 plaintext-F lexical inverse.
// The imported module has self-tests at module load; suppress only its
// console output while loading, not assertions or errors.
const savedLog = console.log;
let model;
try {
  console.log = () => {};
  model = require('./lp2_ftransparent_original_lexical_viterbi_sft.cjs');
} finally {
  console.log = savedLog;
}
const fs = require('node:fs');
const path = require('node:path');
const { decode, encodeWord, printedWords, original } = model;
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const mod29 = (n) => ((n % 29) + 29) % 29;
const runeMap = new Map(original.runes.map((rune, index) => [rune, index]));

const chorusSource = read('resources/control/cicada2012_blake_chorus.txt');
const chorusText = chorusSource.split('BEGIN SOURCE TEXT\n')[1]
  .split('\nEND SOURCE TEXT')[0].trim();
const chorusWords = chorusText.match(/[A-Za-z]+/gu) || [];
if (chorusWords.length !== 56) throw new Error('Expected 56 chorus words');

const transcription = read('resources/liber-primus/lp2-transcription.txt');
const segments = transcription.split('%');
const lineLists = segments.slice(0, 55).map((segment) =>
  segment.split('/').map((line) =>
    [...line].filter((rune) => runeMap.has(rune)).map((rune) => runeMap.get(rune))
  ).filter((line) => line.length)
);

const results = [];
for (let physicalPage = 0; physicalPage < 56; physicalPage += 1) {
  if (physicalPage === 50) continue; // numeric-only p50 has no rune page
  const segmentIndex = physicalPage < 50 ? physicalPage : physicalPage - 1;
  const depth = encodeWord(chorusWords[physicalPage]).length;
  const selectedLine = lineLists[segmentIndex]?.[depth - 1] || [];
  const key = selectedLine.slice(1, -1);
  if (!key.length) {
    results.push({ page: physicalPage, sourceWord: chorusWords[physicalPage],
      depth, keyLength: 0, skipped: 'empty selected-line interior' });
    continue;
  }

  const words = printedWords(segments[segmentIndex]);
  for (const sign of [-1, 1]) {
    try {
      const states = decode(words, (consumed) =>
        mod29(sign * key[consumed % key.length]));
      const best = states[0];
      const second = states[1];
      results.push({
        page: physicalPage,
        sourceWord: chorusWords[physicalPage],
        depth,
        keyLength: key.length,
        sign,
        printedWords: words.length,
        validPath: true,
        lexicalWords: best.lexicalWords,
        score: best.score,
        consumed: best.consumed,
        runnerUpMargin: second ? best.score - second.score : null,
        unseenWords: best.unseenWords
      });
    } catch (error) {
      // The shared decoder asserts when all plaintext-F branches die.
      if (!/No valid plaintext-F inverse/.test(String(error))) throw error;
      results.push({
        page: physicalPage,
        sourceWord: chorusWords[physicalPage],
        depth,
        keyLength: key.length,
        sign,
        printedWords: words.length,
        validPath: false
      });
    }
  }
}

const bySign = [-1, 1].map((sign) => {
  const rows = results.filter((row) => row.sign === sign);
  const valid = rows.filter((row) => row.validPath);
  return {
    sign,
    pagesTested: rows.length,
    pagesWithValidPath: valid.length,
    pagesWithoutValidPath: rows.length - valid.length,
    lexicalWordsAcrossValidPages: valid.reduce((sum, row) => sum + row.lexicalWords, 0),
    validPageDetails: valid.map((row) => ({
      page: row.page,
      printedWords: row.printedWords,
      lexicalWords: row.lexicalWords,
      score: row.score,
      consumed: row.consumed
    }))
  };
});
const validPageUnion = [...new Set(results.filter((row) => row.validPath)
  .map((row) => row.page))].sort((a, b) => a - b);

console.log(JSON.stringify({
  hypothesis: 'chorus word index -> physical page; GP29 word length -> line depth; line interior -> page-local repeating key',
  sourceWords: chorusWords.length,
  sourceLetters: chorusWords.reduce((sum, word) => sum + word.length, 0),
  pages: 55,
  skippedPhysicalPage: 50,
  lexiconDistinctWords: model.lexicon.size,
  validPageUnion,
  bySign,
  results
}, null, 2));
