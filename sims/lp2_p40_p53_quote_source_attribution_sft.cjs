'use strict';

/**
 * Director #1130: compare the exact p40/p53 five-word quotation-opening
 * shape against independent first-party Cicada messages, solved LP1, and
 * source-selected historical literary corpora. CommonJS / Node22.
 *
 * It is a finite source-attribution test. It does not fit any unknown-page
 * cipher or claim the full quote is a sourced literary excerpt.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const annotations = JSON.parse(read('resources/liber-primus/lp2-quote-punctuation-spans.json'));
const originals = read('resources/liber-primus/lp2-transcription.txt');
const runes = new Set(corpus.runes);
const shape = [5, 7, 2, 3, 4];

/** @param {string} w @returns {number} */
function gpLength(w) {
  return w.toUpperCase().replace(/ING|TH|NG|EO|OE|AE|EA|IA/g, '*')
    .replace(/[^A-Z*]/g, '').length;
}

/** @param {string} text @returns {string[]} */
function tokenize(text) {
  return Array.from(text.matchAll(/[A-Za-z]+(?:'[A-Za-z]+)*/g),
    m => m[0].toUpperCase());
}

/** @param {string[]} words @returns {{offset:number,phrase:string}[]} */
function exactWindows(words) {
  const lengths = words.map(gpLength);
  const hits = [];
  for (let i = 0; i + 5 <= words.length; i++) {
    if (shape.every((n, j) => lengths[i + j] === n)) {
      hits.push({offset: i, phrase: words.slice(i, i + 5).join(' ')});
    }
  }
  return hits;
}

/**
 * Genuine LP2 line wraps and page boundaries are invisible within a word.
 * The source-printed punctuation that ends words is exactly -.$&§.
 *
 * @param {string} raw
 * @returns {{start:number,end:number,length:number}[]}
 */
function sourceWords(raw) {
  const text = raw.replace(/\/\r?\n/g, '').replace(/\r?\n/g, '');
  let pos = 0, start = 0, inWord = false;
  const words = [];
  for (const glyph of text) {
    if (runes.has(glyph)) {
      if (!inWord) start = pos;
      inWord = true;
      pos++;
    } else if ('-.$&§'.includes(glyph) && inWord) {
      words.push({start, end: pos, length: pos - start});
      inWord = false;
    }
  }
  if (inWord) words.push({start, end: pos, length: pos - start});
  return words;
}
const allWords = sourceWords(originals);
assert.equal(allWords.length, 2941);
assert.equal(annotations.quotes.length, 7);
const pair = [9811, 12522].map(start => {
  const quote = annotations.quotes.find(q => q.start === start);
  assert.ok(quote);
  const words = allWords.filter(w => w.start >= quote.start && w.end <= quote.end);
  assert.equal(words.length, 14);
  const cipher = corpus.pages.flatMap(p => p.indices).slice(quote.start, quote.end);
  assert.equal(cipher.length, quote.length);
  assert.deepEqual(words.slice(0, 5).map(w => w.length), shape);
  return {start, lengths: words.map(w => w.length), cipher: cipher.slice(0, 21)};
});
assert.deepEqual(pair.map(x => x.lengths[5]), [6, 10]);
const cipherEquals = pair[0].cipher.filter((n, i) => n === pair[1].cipher[i]).length;
assert.equal(cipherEquals, 1);
console.log('ORIGINAL', JSON.stringify({
  offsets: pair.map(p => p.start), sourceFiveWordLengths: shape,
  sixthWordLengths: pair.map(p => p.lengths[5]),
  ciphertextRunePositionsEqual: cipherEquals, of: 21
}));

/**
 * Parse only the clear-signed body. A 2012 source embeds a separate armored
 * encrypted PGP payload after its actual message; those base64 lines are
 * explicitly excluded from textual source comparisons.
 * @param {string} raw
 * @returns {string}
 */
function signedBody(raw) {
  const match = raw.match(
    /-----BEGIN PGP SIGNED MESSAGE-----\r?\n(?:Hash:[^\r\n]*\r?\n)*\r?\n([\s\S]*?)(?=\r?\n-----BEGIN PGP SIGNATURE-----)/
  );
  assert.ok(match, 'Archived source is not a clear-signed message');
  return match[1].split(/(?:- )?-----BEGIN PGP MESSAGE-----/)[0];
}

const firstPartyPaths = [
  'historical/cicada2012-countdown-message.asc',
  'historical/cicada2012-midi-email.asc',
  'historical/cicada2013-first-onion-hello.asc',
  'historical/cicada2013-forest-clue.asc',
  'historical/cicada2013-second-onion-everything-you-need.asc',
  'historical/cicada2013-second-onion-icmp-echo.asc',
  'historical/cicada2014-stage09-first-jpeg-recovered.asc',
  'historical/cicada2014-stage11-message.asc',
  'historical/cicada2016-4gq25-outguess.asc',
  'historical/cicada2017-yEiTHhvF.asc',
  'external/2013-do-not-share-this-information-2.asc',
  'cicada2014-may2-signed-message.asc',
];
const firstPartyExpectedWords = [19, 85, 15, 13, 22, 13, 38, 18, 45, 10, 405, 18];
const firstParty = firstPartyPaths.map((p, i) => {
  const words = tokenize(signedBody(read('resources/' + p)));
  assert.equal(words.length, firstPartyExpectedWords[i]);
  const hits = exactWindows(words);
  assert.equal(hits.length, 0, 'An authentic source phrase now needs review: ' + p);
  return {source: p, words: words.length, exactFiveWordLengthWindows: hits.length};
});
assert.equal(firstParty.reduce((s, p) => s + p.words, 0), 701);
console.log('FIRST_PARTY', JSON.stringify({
  clearSignedSourceRecords: firstParty.length,
  totalPlaintextTokens: firstParty.reduce((s, p) => s + p.words, 0),
  exactShapeHits: 0, bySource: firstParty
}));

// These works were independently selected in the earlier Cicada rounds or
// in the established quoted-source comparison. The present new decision
// screens only their exact five-word *opening* fingerprint.
const literature = [
  ['Blake 1906', 'external/blake-marriage-1906-gutenberg45315.txt', 0],
  ['Crowley I', 'external/2013-book-of-law-I.txt', 0],
  ['Crowley II', 'external/2013-book-of-law-II.txt', 0],
  ['Crowley III', 'external/2013-book-of-law-III.txt', 0],
  ['KJV Gospels', 'external/kjv-passion-gospels-2014.txt', 1],
  ['Tennyson 1832', 'external/tennyson-lady-of-shalott-1832-mptc.txt', 0],
  ['Tennyson 1842', 'external/tennyson-lady-of-shalott-1842-gutenberg8601.txt', 0],
  ['Gibran', 'control/gibran_prophet_58585.txt', 0],
  ['Shakespeare', 'control/shakespeare_first300k.txt', 4],
  ['Emerson', 'control/emerson_essays_2944.txt', 5],
];
const allHits = [];
const literatureOut = literature.map(([name, p, count]) => {
  const words = tokenize(read('resources/' + p));
  const hits = exactWindows(words);
  assert.equal(hits.length, count, 'New original literary source candidate: ' + p);
  allHits.push(...hits.map(h => ({...h, source: name})));
  return {name, tokens: words.length, hits};
});
assert.equal(allHits.length, 10);
assert.equal(new Set(allHits.map(h => h.phrase)).size, 10);
const emerson = literatureOut.find(r => r.name === 'Emerson');
for (const [offset, phrase] of [
  [30398, 'EVERY GESTURE OF HIS HAND'],
  [30476, 'EVERY QUALITY OF HIS MIND'],
  [30488, 'EVERY EMOTION OF HIS HEART'],
]) {
  assert.ok(emerson.hits.some(h => h.offset === offset && h.phrase === phrase));
}
console.log('LITERARY', JSON.stringify({
  sources: literatureOut.length,
  sourceTotals: literatureOut.map(x => ({
    name: x.name, totalWords: x.tokens, exactFiveWordShape: x.hits.length
  })),
  allDistinctPhrases: true,
  clusteredEmersonCounterexamples: emerson.hits.filter(
    x => [30398, 30476, 30488].includes(x.offset)
  )
}));

const mabinogion = JSON.parse(read(
  'resources/external/cicada2012-mabinogion-gutenberg5160-gp-wordlengths.json'
)).mabinogion_story_word_lengths;
const mabinogionOffsets = [];
for (let i = 0; i + 5 <= mabinogion.length; i++) {
  if (shape.every((n, j) => mabinogion[i + j] === n)) {
    mabinogionOffsets.push(i);
  }
}
assert.equal(mabinogion.length, 105582);
assert.deepEqual(mabinogionOffsets, [36637, 58285, 81317, 93005, 96900]);
const yetzirah = JSON.parse(read('resources/external/sefer-yetzirah-westcott-archive.json'));
const seferHits = exactWindows(tokenize(yetzirah.map(p => p.pageContent).join(' ')));
assert.equal(seferHits.length, 0);
const lp1 = read('resources/liber-primus/lp1-plaintext-reference.txt');
const lp1MainText = lp1.slice(lp1.indexOf('### 1'));
const lp1Hits = exactWindows(tokenize(lp1MainText));
assert.equal(lp1Hits.length, 0);
console.log('OTHER_SOURCES', JSON.stringify({
  mabinogionSourceWordLengths: mabinogion.length,
  mabinogionExactOffsets: mabinogionOffsets,
  seferExactShapeHits: seferHits.length,
  solvedLP1ExactShapeHits: lp1Hits.length
}));
console.log('DECISION: no independently sourced repeated 21-rune quotation plaintext; profile repeats among distinct literary phrases.');
