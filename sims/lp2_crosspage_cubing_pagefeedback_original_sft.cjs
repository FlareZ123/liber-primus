#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseLP2Words, physicalLP2Page} = require('./lp2_word_pages.cjs');

const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const lexicon = read('resources/control/english_wordfreq_textblob.txt');
const carryCsv = read('im-results/lp2-all-32-cross-page-word-boundaries.csv');
const alphabet = corpus.translit;
const runeIndex = new Map(corpus.runes.map((glyph, index) => [glyph, index]));
const sourcePages = transcript.split('%').slice(0, 55);
const pages = corpus.pages.filter(page => page.page <= 55 && page.page !== 50);
const mod = value => ((value % 29) + 29) % 29;

/** @param {string} word @returns {number[] | null} */
function encodeGp(word) {
  const normalized = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/[KQ]/g, 'C').replace(/V/g, 'U').replace(/Z/g, 'S');
  const compounds = ['ING', 'TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA'];
  const result = [];
  for (let i = 0; i < normalized.length;) {
    const token = compounds.find(item => normalized.startsWith(item, i)) || normalized[i];
    const index = alphabet.indexOf(token === 'ING' ? 'NG' : token);
    if (index < 0) return null;
    result.push(index);
    i += token.length;
  }
  return result;
}

/** @param {number[]} runes @returns {number} */
function coincidence(runes) {
  const counts = Array(29).fill(0);
  for (const value of runes) counts[value] += 1;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (runes.length * (runes.length - 1));
}

/** @param {number[]} runes @returns {string} */
const roman = runes => runes.map(index => alphabet[index]).join(' ');
const gpWords = new Set();
for (const row of lexicon.split(/\r?\n/u)) {
  const match = /^([a-z]+)\s+\d+$/u.exec(row);
  if (!match) continue;
  const encoded = encodeGp(match[1]);
  if (encoded) gpWords.add(encoded.join(','));
}

assert.equal(sourcePages.length, 55);
assert.equal(pages.length, 55);
let globalOffset = 0;
/** @type {Array<{page:number,at:number}>} */
const lineBreaks = [];
for (let index = 0; index < sourcePages.length; index++) {
  const pageNumber = physicalLP2Page(index);
  const original = pages[index];
  assert.equal(original.page, pageNumber);
  const pageBody = sourcePages[index];
  const observed = [];
  for (let pos = 0; pos < pageBody.length; pos++) {
    const ch = pageBody[pos];
    if (runeIndex.has(ch)) {
      observed.push(runeIndex.get(ch));
      globalOffset++;
    } else if (ch === '/' && /[\u16a0-\u16ff]/u.test(pageBody.slice(pos + 1))) {
      // Exclude page-terminal slash: it is a page break, not a line-wrap control.
      lineBreaks.push({page: pageNumber, at: globalOffset});
    }
  }
  assert.deepEqual(observed, original.indices, 'exact page ' + pageNumber);
}
assert.equal(globalOffset, 12956);
assert.equal(lineBreaks.length, 539);
const parsed = parseLP2Words(transcript, 55);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.crossPageWords, 32);

let cursor = 0;
const sourceWords = parsed.words.map(word => {
  const start = cursor;
  cursor += word.length;
  return {start, end: cursor, word};
});
assert.equal(cursor, globalOffset);
let wordCursor = 0;
/** @type {Array<{page:number,at:number,len:number,split:number,start:number,end:number}>} */
const within = [];
for (const breakPoint of lineBreaks) {
  while (wordCursor < sourceWords.length && sourceWords[wordCursor].end <= breakPoint.at) {
    wordCursor++;
  }
  const candidate = sourceWords[wordCursor];
  if (candidate && candidate.start < breakPoint.at && breakPoint.at < candidate.end) {
    within.push({page: breakPoint.page, at: breakPoint.at,
      len: candidate.end - candidate.start, split: breakPoint.at - candidate.start,
      start: candidate.start, end: candidate.end});
  }
}
assert.equal(within.length, 388);
const csvLines = carryCsv.trim().split(/\r?\n/u);
const csvColumns = csvLines[0].split(',');
const carries = csvLines.slice(1).map(line =>
  Object.fromEntries(line.split(',').map((cell, index) => [csvColumns[index], cell])));
assert.equal(carries.length, 32);
assert.deepEqual(
  carries.map(item => item.word_runes),
  parsed.words.filter(word => word.startPage !== word.endPage).map(word => word.runes)
);
const cipher = pages.flatMap(page => page.indices);
assert.equal(cipher.length, 12956);

const orbit = [2, 8, 19, 15, 11, 26];
for (let i = 0; i < orbit.length; i++) {
  assert.equal(mod(orbit[i] ** 3), orbit[(i + 1) % 6]);
}
const key = page => orbit[mod(page - 28) % 6];

/**
 * A fully specified reversible GP29 filter. The six-cycle is a speculative
 * page clock, anchored at physical p28=2; cipher predecessor state carries
 * across page transitions unless the separately tested reset policy is set.
 * @param {number[]} values
 * @param {boolean} encrypt
 * @param {boolean} pageReset
 * @returns {number[]}
 */
function transform(values, encrypt, pageReset) {
  const result = [];
  let previousCipher = 0;
  let position = 0;
  for (const page of pages) {
    if (pageReset) previousCipher = 0;
    const multiplier = key(page.page);
    for (let i = 0; i < page.indices.length; i++) {
      const input = values[position++];
      const output = encrypt ? mod(input + multiplier * previousCipher) :
        mod(input - multiplier * previousCipher);
      result.push(output);
      previousCipher = encrypt ? output : input;
    }
  }
  assert.equal(position, values.length);
  return result;
}

const decoded = transform(cipher, false, false);
const resetDecoded = transform(cipher, false, true);
assert.deepEqual(transform(decoded, true, false), cipher);
assert.deepEqual(transform(resetDecoded, true, true), cipher);

/** @param {number[]} source @returns {number} */
const knownWord = source => Number(gpWords.has(source.join(',')));
function wordDiagnostic(stream) {
  const pageCarryRows = carries.map(item => {
    const start = Number(item.global_start);
    const length = Number(item.word_length);
    const plaintext = stream.slice(start, start + length);
    return {from: Number(item.from_page), to: Number(item.to_page),
      split: [...item.previous_fragment].length, length,
      lexical: knownWord(plaintext), plaintext: roman(plaintext)};
  });
  const lineControlMatches = within.reduce((n, item) =>
    n + knownWord(stream.slice(item.start, item.end)), 0);
  return {pageCarryRows, carryLexical: pageCarryRows.reduce((n, row) => n + row.lexical, 0),
    withinLineLexical: lineControlMatches};
}
const continuous = wordDiagnostic(decoded);
const pageReset = wordDiagnostic(resetDecoded);
assert.equal(continuous.carryLexical, 0);
assert.equal(continuous.withinLineLexical, 9);

let pageStart = 0;
const offsets = new Map();
for (const page of pages) {
  offsets.set(page.page, pageStart);
  pageStart += page.indices.length;
}
const p54 = decoded.slice(offsets.get(54), offsets.get(55));
const p55 = decoded.slice(offsets.get(55));
assert.equal(p54.length, 232);
assert.equal(p55.length, 76);

const p57 = corpus.pages.find(page => page.page === 57).indices;
assert.equal(p57.length, 95);
assert.deepEqual(encodeGp('PARABLE'), p57.slice(0, 7));
const p56 = corpus.pages.find(page => page.page === 56).indices;
const knownP56 = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const knownP56Runes = knownP56.split(' ').flatMap(word => encodeGp(word));
assert.equal(knownP56Runes.length, 85);
assert.equal(p56.length, 85);
/** @param {number} amount @returns {number[]} */
function primes(amount) {
  const found = [];
  for (let value = 2; found.length < amount; value++) {
    let isPrime = true;
    for (let divisor = 2; divisor * divisor <= value; divisor++) {
      if (value % divisor === 0) {isPrime = false; break;}
    }
    if (isPrime) found.push(value);
  }
  return found;
}
const sourcePrime = primes(85);
let primeClock = 0;
const p56Generated = knownP56Runes.map(plain => {
  if (plain === 0) return 0; // Authentic plaintext-F bypass.
  return mod(plain + sourcePrime[primeClock++] - 1);
});
assert.deepEqual(p56Generated, p56);
assert.equal(primeClock, 84);

const syntheticPlain = Array.from({length: 12956},
  (_, i) => p57[i % p57.length]);
for (const reset of [false, true]) {
  const planted = transform(syntheticPlain, true, reset);
  assert.deepEqual(transform(planted, false, reset), syntheticPlain);
}
const report = {
  test: 'fixed physical-page GF29 cubing-orbit ciphertext predecessor feedback',
  orbit, keyAtP28: key(28), originalRunes: cipher.length,
  originalWords: sourceWords.length, pageCarries: carries.length,
  withinLineCarries: within.length, dictionaryUniqueGpForms: gpWords.size,
  originalIoC: coincidence(cipher), originalInverseIoC: coincidence(decoded),
  p57ClearIoC: coincidence(p57), p54IoC: coincidence(p54),
  p55IoC: coincidence(p55), p54Untouched150: roman(p54.slice(0, 150)),
  p55Decoded: roman(p55),
  continuous: {carryLexical: continuous.carryLexical,
    withinLineLexical: continuous.withinLineLexical,
    pageCarryRows: continuous.pageCarryRows},
  pageReset: {carryLexical: pageReset.carryLexical,
    withinLineLexical: pageReset.withinLineLexical},
  solvedP56CipherPositive: '85/85', solvedP57ClearPositive: '95/95',
  plantedGpInverse: '12956/12956 both policies',
  conclusion: 'Original cipher does not yield GP29 English under this exact proposed key/state law.'
};
console.log(JSON.stringify(report, null, 2));
