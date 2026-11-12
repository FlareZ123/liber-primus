'use strict';

/**
 * Original LP2 word-length crib screen against historically used Cicada sources.
 * Node.js 22, no dependencies, reads repository files without modifying them.
 * Word lengths use the documented GP29 digraph normalization.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.join(__dirname, '..');
/** @param {string} rel */
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt').replace(/[\/\r\n]/g, '');
const runeRE = /[\u16A0-\u16FF]+/gu;
const allRunes = [...transcription].filter((x) => corpus.runes.includes(x)).map((x) => corpus.runes.indexOf(x));
const canonical = corpus.pages.flatMap((page) => page.indices);
assert.deepEqual(allRunes, canonical, 'Full source transcription and canonical corpus must agree');
assert.equal(corpus.pages.length, 58);
assert.equal(canonical.length, 13136);
const unknownRuneCount = corpus.pages.slice(0, 56).reduce((n, p) => n + p.runic_count, 0);
assert.equal(unknownRuneCount, 12956);

let runeOffset = 0;
/** @type {{runes: string, length: number, runeOffset: number}[]} */
const unknownWords = [];
/** @type {{runes: string, length: number, runeOffset: number}[]} */
const solvedWords = [];
for (const match of transcription.matchAll(runeRE)) {
  const runes = match[0];
  const item = { runes, length: runes.length, runeOffset };
  (runeOffset < unknownRuneCount ? unknownWords : solvedWords).push(item);
  runeOffset += runes.length;
}
assert.equal(runeOffset, 13136);
assert.equal(unknownWords.length, 2928);

/** @param {string} word */
const gpLength = (word) => word.toUpperCase().replace(/TH|NG|EO|OE|AE|IA|EA/g, '_').length;
/** @param {string} source */
const sourceWords = (source) => [...source.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)]
  .map((m) => m[0].replace(/['’]/g, ''));

/**
 * @param {{runes: string, length: number, runeOffset: number}[]} cipher
 * @param {string[]} words
 */
function align(cipher, words) {
  const length = words.map(gpLength);
  /** @type {Map<string, number[]>} */
  const triples = new Map();
  for (let j = 0; j + 2 < length.length; j++) {
    const key = length.slice(j, j + 3).join(',');
    if (!triples.has(key)) triples.set(key, []);
    triples.get(key).push(j);
  }
  let best = 0;
  let hits = [];
  for (let i = 0; i + 2 < cipher.length; i++) {
    const key = [cipher[i].length, cipher[i + 1].length, cipher[i + 2].length].join(',');
    for (const j of triples.get(key) || []) {
      let k = 3;
      while (i + k < cipher.length && j + k < words.length && cipher[i + k].length === length[j + k]) k++;
      if (k > best) { best = k; hits = []; }
      if (k === best) {
        hits.push({ runeOffset: cipher[i].runeOffset, cipherWordIndex: i, sourceWordIndex: j,
          wordLengthMatch: k, text: words.slice(j, j + k).join(' ') });
      }
    }
  }
  return { sourceWords: words.length, best, hits };
}

const lp1 = read('resources/liber-primus/lp1-plaintext-reference.txt');
const historical = [
  ['LP1 solved p1-16', sourceWords(lp1.split('### 56')[0]
    .replace(/#[^\n]*/g, '').replace(/\[[^\]]*\]/g, '').replace(/\b\d+\b/g, ''))],
  ['2012 Blake excerpt', sourceWords(read('resources/external/2012-marriage-of-heaven-and-hell-page.txt'))],
  ...['I', 'II', 'III'].map((chapter) => [
    '2013 Book of Law ' + chapter,
    sourceWords(read('resources/external/2013-book-of-law-' + chapter + '.txt').replace(/^\d+[.,]\s*/gm, ''))
  ])
];

const solvedPrefix = sourceWords('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO');
assert.deepEqual(solvedWords.slice(0, solvedPrefix.length).map((w) => w.length), solvedPrefix.map(gpLength),
  'Known original p56 first thirteen words must align exactly');

const report = historical.map(([name, words]) => ({ source: name, ...align(unknownWords, words) }));
assert.deepEqual(report.map((r) => r.best), [7, 7, 8, 8, 8],
  'Historical frozen max matches changed; inspect the source transcripts and parser');
assert(report.every((r) => r.best < 9));
console.log(JSON.stringify({
  originalUnknownRunes: unknownRuneCount,
  originalUnknownWordFragments: unknownWords.length,
  originalSolvedRunes: canonical.length - unknownRuneCount,
  p56KnownPrefixWordsExactlyAligned: solvedPrefix.length,
  results: report
}, null, 2));
