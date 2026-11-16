'use strict';

/**
 * Search original LP2 word lengths for complete, contiguous literary quotations
 * without assuming a ciphertext/key. Six historical or control sources.
 * Node.js 22 CommonJS standalone test:
 * node sims/lp2_original_wordlength_quote_source_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseLP2Words } = require('./lp2_word_pages.cjs');

const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const parsed = parseLP2Words(transcript);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.runeCount, 12956);
const target = parsed.words.map(w => w.length);
const gpTokens = corpus.translit.slice().sort((a, b) => b.length - a.length);

/** @param {string} rawWord @returns {number} GP29 symbol count or -1. */
function gpLength(rawWord) {
  const w = rawWord.toUpperCase().replace(/'/g, '').replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  let i = 0;
  let n = 0;
  while (i < w.length) {
    const token = gpTokens.find(t => w.startsWith(t, i));
    if (!token) return -1;
    i += token.length;
    n += 1;
  }
  return n;
}

assert.equal(gpLength('PARABLE'), 7);
assert.equal(gpLength('TUNNELING'), 7); // historical ING/NG multigraph
assert.equal(gpLength('THOUGH'), 5);
assert.equal(gpLength("obey'd"), 5);

/**
 * Exact ordered source-word-length matches with no edits or word omissions.
 * Invalid GP-native source tokens break a possible source run.
 * @param {number[]} targetLengths
 * @param {number[]} sourceLengths
 * @param {number} k
 * @returns {Array<{targetIndex:number,sourceIndex:number}>}
 */
function fixedMatches(targetLengths, sourceLengths, k) {
  const sourceMap = new Map();
  for (let j = 0; j + k <= sourceLengths.length; j += 1) {
    const span = sourceLengths.slice(j, j + k);
    if (span.includes(-1)) continue;
    const key = span.join(',');
    const starts = sourceMap.get(key) || [];
    starts.push(j);
    sourceMap.set(key, starts);
  }
  const hits = [];
  for (let i = 0; i + k <= targetLengths.length; i += 1) {
    const starts = sourceMap.get(targetLengths.slice(i, i + k).join(',')) || [];
    for (const j of starts) hits.push({ targetIndex: i, sourceIndex: j });
  }
  return hits;
}

const sources = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/external/2013-book-of-law-I.txt',
  'resources/external/2013-book-of-law-II.txt',
  'resources/external/2013-book-of-law-III.txt',
];
const expectedSourceWords = [54189, 15726, 77773, 1896, 1967, 1998];
const expectedMaxima = [10, 9, 9, 7, 8, 8];
const results = sources.map((source, n) => {
  const sourceText = read(source);
  const sourceMatches = [...sourceText.matchAll(/[A-Za-z]+(?:'[A-Za-z]+)*/g)];
  const sourceWords = sourceMatches.map(m => m[0]);
  const lengths = sourceWords.map(gpLength);
  assert.equal(sourceWords.length, expectedSourceWords[n], source);
  assert.ok(lengths.every(v => v > 0), source);
  assert.ok(fixedMatches(lengths.slice(500, 512), lengths, 12)
    .some(h => h.sourceIndex === 500), source + ' native plant');
  const eleven = fixedMatches(target, lengths, 11);
  assert.equal(eleven.length, 0, source);
  let maximum = 0;
  let hits = [];
  for (let k = 10; k >= 1; k -= 1) {
    const candidates = fixedMatches(target, lengths, k);
    if (candidates.length) {
      maximum = k;
      hits = candidates;
      break;
    }
  }
  assert.equal(maximum, expectedMaxima[n], source);
  if (n === 0) {
    assert.deepEqual(hits, [{targetIndex:1565, sourceIndex:50253}]);
    const boundary = sourceText.slice(sourceMatches[50258].index +
      sourceMatches[50258][0].length, sourceMatches[50259].index);
    assert.equal(boundary, '.\n'); // 'none.' then 'Thus'
    assert.ok(transcript.includes(
      parsed.words[1570].runes + '-' + parsed.words[1571].runes));
    // A separate source-image census finds no raised apostrophe on either
    // physical p28 or p29, while Shakespeare's fourth word is "obey'd".
    assert.equal(sourceWords[50256], "obey'd");
    const punctuation = JSON.parse(read(
      'resources/liber-primus/lp2-quote-punctuation-spans.json'));
    assert.ok(punctuation.source_visible_apostrophes.every(x =>
      x.page !== 28 && x.page !== 29));
    // The manuscript has no full stop at the sole 10-word source match.
  }
  return {
    source,
    sourceWords: sourceWords.length,
    longestExactWordRun: maximum,
    numberAtMaximum: hits.length,
    examples: hits.slice(0, 4).map(h => ({
      unknownWord: h.targetIndex,
      sourceWord: h.sourceIndex,
      unknownStartPage: parsed.words[h.targetIndex].startPage >= 50
        ? parsed.words[h.targetIndex].startPage + 1
        : parsed.words[h.targetIndex].startPage,
      candidate: sourceWords.slice(h.sourceIndex, h.sourceIndex + maximum).join(' '),
    })),
  };
});
console.log(JSON.stringify({
  originalRunes: parsed.runeCount,
  originalWords: parsed.words.length,
  totalSourceWords: results.reduce((n, r) => n + r.sourceWords, 0),
  searched: 'Exact native GP29 contiguous word-length quotation, no free edits',
  sourceTenWordMatch: 'One Shakespeare match p28–29, disqualified by period vs hyphen',
  noOriginalPlaintextRecovered: true,
  results,
}, null, 2));
