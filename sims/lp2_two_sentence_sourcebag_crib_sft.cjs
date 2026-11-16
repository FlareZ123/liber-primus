#!/usr/bin/env node
'use strict';

/**
 * LP2 original punctuation-span wordlength bag crib gate.
 * Test whether two successive printed sentences were copied intact from
 * source prose, then internally permuted as whole GP-rune words.
 *
 * Run on Windows: node sims/lp2_two_sentence_sourcebag_crib_sft.cjs
 * Read-only, deterministic, no network or npm dependencies.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} rel @returns {string} */
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));

/** @returns {number[][]} */
function originalSpans() {
  const pageParts = transcript.split('%').slice(0, 55);
  const pageArrays = corpus.pages.filter((p) => p.page <= 55 && p.runic_count > 0);
  assert.equal(pageParts.length, 55);
  assert.equal(pageArrays.length, 55);
  for (let i = 0; i < 55; i++) {
    const found = [...pageParts[i]].filter((ch) => runeToIndex.has(ch))
      .map((ch) => runeToIndex.get(ch));
    assert.deepEqual(found, pageArrays[i].indices,
      'Unchanged original rune identity at rune-bearing page ' + i);
  }

  // Page and physical line wraps carry the same printed word, including 32
  // page-spanning words. Source minus/hyphen terminates a word.
  const stream = pageParts.join('%');
  const spans = [];
  let span = [];
  let wordLength = 0;
  const finishWord = () => {
    if (wordLength) span.push(wordLength);
    wordLength = 0;
  };
  const finishSpan = () => {
    finishWord();
    if (span.length) spans.push(span);
    span = [];
  };
  for (const ch of stream) {
    if (runeToIndex.has(ch)) wordLength++;
    else if (ch === '-') finishWord();
    else if ('.&$§'.includes(ch)) finishSpan();
  }
  finishSpan();

  const lengths = spans.flat();
  assert.equal(spans.length, 175);
  assert.equal(lengths.length, 2896);
  assert.equal(lengths.reduce((n, v) => n + v, 0), 12956);
  return spans;
}

const tokens = ['ING', 'IO', ...corpus.translit].sort((a, b) => b.length - a.length);
/** @param {string} input @returns {number} */
function gpLength(input) {
  const str = input.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  let i = 0;
  let n = 0;
  while (i < str.length) {
    const token = tokens.find((v) => str.startsWith(v, i));
    i += token ? token.length : 1;
    n++;
  }
  return n;
}

/**
 * Original reference prose is reflowed across printed line breaks, then
 * split only on source punctuation. A newline is not a sentence terminator.
 * @param {string} content
 * @returns {number[][]}
 */
function sourceSpans(content) {
  return content.replace(/\r?\n/g, ' ').split(/[.!?;:]+/g)
    .map((part) => (part.match(/[A-Za-z]+/g) || []).map(gpLength))
    .filter((part) => part.length);
}

/** @param {number[]} arr @returns {string} */
function key(arr) {
  return [...arr].sort((a, b) => a - b).join(',');
}
/** @param {number[]} arr @returns {Uint16Array} */
function hist(arr) {
  const h = new Uint16Array(32);
  for (const n of arr) h[Math.min(n, 31)]++;
  return h;
}
/**
 * Number of word-length edits needed after unconstrained whole-word ordering.
 * @param {{lengths:number[],h:Uint16Array}} a
 * @param {{lengths:number[],h:Uint16Array}} b
 * @returns {number}
 */
function bagDeficit(a, b) {
  let common = 0;
  for (let i = 0; i < 32; i++) common += Math.min(a.h[i], b.h[i]);
  return Math.max(a.lengths.length, b.lengths.length) - common;
}
/** @param {number[][]} spans @returns {{lengths:number[],h:Uint16Array}[]} */
function wrap(spans) {
  return spans.map((lengths) => ({lengths, h: hist(lengths)}));
}

/**
 * Searches consecutive source punctuation spans against consecutive original
 * punctuation spans, allowing ANY permutation within each intact sentence.
 * @param {number[][]} original
 * @param {number[][]} source
 * @param {number} minWordCount
 * @returns {{minCombinedDeficit:number, best:{sourceIndex:number,originalIndex:number,sourceWords:number,originalWords:number,deficits:number[]}[], exactPairs:number}}
 */
function scan(original, source, minWordCount = 13) {
  const a = wrap(original), b = wrap(source);
  let minCombinedDeficit = Infinity;
  let exactPairs = 0;
  let best = [];
  for (let i = 0; i + 1 < a.length; i++) {
    if (Math.min(a[i].lengths.length, a[i + 1].lengths.length) < minWordCount) continue;
    for (let j = 0; j + 1 < b.length; j++) {
      if (Math.min(b[j].lengths.length, b[j + 1].lengths.length) < minWordCount) continue;
      if (Math.abs(a[i].lengths.length - b[j].lengths.length) > 5 ||
          Math.abs(a[i + 1].lengths.length - b[j + 1].lengths.length) > 5) continue;
      const d1 = bagDeficit(a[i], b[j]);
      if (d1 > minCombinedDeficit) continue;
      const d2 = bagDeficit(a[i + 1], b[j + 1]);
      const sum = d1 + d2;
      if (sum === 0) exactPairs++;
      if (sum < minCombinedDeficit) {
        minCombinedDeficit = sum;
        best = [];
      }
      if (sum === minCombinedDeficit) best.push({
        originalIndex: i, sourceIndex: j,
        originalWords: a[i].lengths.length + a[i + 1].lengths.length,
        sourceWords: b[j].lengths.length + b[j + 1].lengths.length,
        deficits: [d1, d2]
      });
    }
  }
  return {minCombinedDeficit, exactPairs, best: best.slice(0, 5)};
}

const originals = originalSpans();
const sources = [
  ['Gibran Prophet', 'resources/control/gibran_prophet_58585.txt'],
  ['Emerson Essays', 'resources/control/emerson_essays_2944.txt'],
  ['Shakespeare excerpt', 'resources/control/shakespeare_first300k.txt'],
  ['2014 LP1 editor-normalized solved plaintext', 'resources/liber-primus/lp1-plaintext-reference.txt'],
  ['Crowley Book of the Law', null]
].map(([name, file]) => {
  const content = file ? read(file) : [
    read('resources/external/2013-book-of-law-I.txt'),
    read('resources/external/2013-book-of-law-II.txt'),
    read('resources/external/2013-book-of-law-III.txt')
  ].join('\n');
  return {name, spans: sourceSpans(content)};
});

const results = sources.map(({name, spans}) => ({
  name, sourcePunctuationSpans: spans.length, ...scan(originals, spans)
}));
for (const r of results) {
  assert(r.minCombinedDeficit > 0, 'Unexpected exact two-span bag crib: ' + r.name);
}
// Predeclared controls, independent from observed ciphertext: each planted
// sentence is reversed, a valid arbitrary word permutation.
for (const {name, spans} of sources) {
  const j = spans.findIndex((s, k) => s.length >= 13 && spans[k + 1]?.length >= 13);
  assert(j >= 0, 'Missing two-sentence source plant for ' + name);
  const plant = [spans[j].slice().reverse(), spans[j + 1].slice().reverse()];
  const found = scan(plant, spans);
  assert.equal(found.minCombinedDeficit, 0);
  assert(found.best.some((p) => p.sourceIndex === j));
}
console.log(JSON.stringify({
  status: 'PASS',
  original: {punctuationSpans: originals.length,
    printedWords: originals.flat().length, runes: 12956},
  model: 'all within-sentence whole-word permutations; two adjacent sentences',
  minWordsPerSentence: 13,
  exactTwoSentenceSourceMatches: 0,
  results,
  sourcePositiveControls: sources.length
}, null, 2));
