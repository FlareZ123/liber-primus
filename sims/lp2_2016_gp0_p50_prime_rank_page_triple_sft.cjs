#!/usr/bin/env node
'use strict';

// Reproduces the signed-2016 GP0 -> original p50 byte -> prime-rank page
// selector. This is a navigation hypothesis, not a decryption.

const fs = require('node:fs');
const path = require('node:path');
const read = p => fs.readFileSync(path.join(process.cwd(), p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const source = read('resources/historical/cicada2016-4gq25-outguess.asc');
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const wordfreq = read('resources/control/english_wordfreq_textblob.txt');

const bodyStart = source.indexOf('Hello.');
const bodyEnd = source.indexOf('-----BEGIN PGP SIGNATURE-----');
if (bodyStart < 0 || bodyEnd <= bodyStart) throw new Error('2016 signed-message body not found');
const body = source.slice(bodyStart, bodyEnd).replace(/\b7A35090F\b/g, '');
const sourceWords = body.match(/[A-Za-z]+/g) || [];
if (sourceWords.length !== 43) throw new Error('expected 43 signed-message words, got ' + sourceWords.length);

const tokens = ['TH', 'EO', 'NG', 'OE', 'AE', 'IA', 'EA',
  ...corpus.translit.filter(x => x.length === 1)];
function encodeGP0(word) {
  let s = word.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/K/g, 'C')
    .replace(/Q/g, 'C')
    .replace(/V/g, 'U')
    .replace(/Z/g, 'S')
    .replace(/ING/g, 'NG')
    .replace(/IO/g, 'IA');
  const out = [];
  while (s.length) {
    const token = tokens.find(t => s.startsWith(t));
    if (!token) throw new Error('cannot GP-encode ' + word + ': ' + s);
    out.push(corpus.translit.indexOf(token));
    s = s.slice(token.length);
  }
  return out.reduce((a, b) => a + b, 0);
}
function isPrime(n) {
  if (!Number.isInteger(n) || n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
function primeOrdinal(n) {
  if (!isPrime(n)) return null;
  let count = 0;
  for (let x = 2; x <= n; x++) if (isPrime(x)) count++;
  return count;
}
const rows = sourceWords.map((word, index) => {
  const gp0 = encodeGP0(word);
  const value = gp0 < grid.bytes.length ? grid.bytes[gp0] : null;
  return {
    index, word, gp0, value,
    base60: value === null ? null :
      grid.alphabet[Math.floor(value / 60)] + grid.alphabet[value % 60],
    prime: value !== null && isPrime(value),
    primeOrdinal: value === null ? null : primeOrdinal(value)
  };
});
const primeRuns = [];
for (let i = 0; i <= rows.length - 3; i++) {
  if (rows.slice(i, i + 3).every(r => r.prime)) {
    primeRuns.push({ start: i, words: rows.slice(i, i + 3) });
  }
}
if (primeRuns.length !== 1 || primeRuns[0].start !== 25) {
  throw new Error('expected the sole consecutive prime run at word 25; got ' +
    JSON.stringify(primeRuns.map(x => x.start)));
}
const selected = rows.slice(25, 28);
if (selected.map(x => x.word.toLowerCase()).join(' ') !== 'their numbers are') {
  throw new Error('word positions 25–27 are not THEIR NUMBERS ARE');
}
if (JSON.stringify(selected.map(x => x.value)) !== JSON.stringify([197, 193, 199]) ||
    JSON.stringify(selected.map(x => x.primeOrdinal)) !== JSON.stringify([45, 44, 46])) {
  throw new Error('prime-value / prime-rank mapping changed');
}

const parts = transcription.split('%');
const runeSet = new Set(corpus.runes);
function lineCount(page) {
  return parts[page].split('/').filter(line => [...line].some(ch => runeSet.has(ch))).length;
}
function wordSpans(page) {
  const spans = [];
  let cursor = 0, start = 0;
  for (const ch of parts[page]) {
    if (runeSet.has(ch)) cursor++;
    else if (ch === '-' || ch === '.') {
      if (cursor > start) spans.push({ start, end: cursor });
      start = cursor;
    }
  }
  if (cursor > start) spans.push({ start, end: cursor });
  if (cursor !== corpus.pages[page].indices.length) {
    throw new Error('page ' + page + ': transcription/corpus rune count mismatch ' +
      cursor + '/' + corpus.pages[page].indices.length);
  }
  return spans;
}
const selectedPages = selected.map(r => r.primeOrdinal);
const pageStats = selectedPages.map(page => ({
  page,
  runes: corpus.pages[page].indices.length,
  lines: lineCount(page),
  words: wordSpans(page).length
}));
if (JSON.stringify(pageStats.map(x => [x.runes, x.lines])) !==
    JSON.stringify([[270, 12], [273, 12], [270, 12]])) {
  throw new Error('selected page structure changed: ' + JSON.stringify(pageStats));
}

function readRune(page, offset) {
  const gp = corpus.pages[page].indices[offset];
  if (gp === undefined) throw new Error('out-of-range coordinate p' + page + '[' + offset + ']');
  return { page, offset, gp, rune: corpus.translit[gp] };
}
const primeOffsetReadout = selected.map(r => readRune(r.primeOrdinal, r.value));
const gp0OffsetReadout = selected.map(r => readRune(r.primeOrdinal, r.gp0));
const primeOffsetKey = primeOffsetReadout.map(x => x.gp);
const gp0OffsetKey = gp0OffsetReadout.map(x => x.gp);

const dictionary = new Set(wordfreq.split(/\r?\n/).map(line => line.trim().split(/\s+/)[0]).filter(Boolean));
function testRepeatingKey(page, key) {
  const cipher = corpus.pages[page].indices;
  const plain = cipher.map((c, i) => ((c - key[i % key.length]) % 29 + 29) % 29);
  const decoded = wordSpans(page).map(w =>
    plain.slice(w.start, w.end).map(i => corpus.translit[i]).join('').toLowerCase());
  return {
    page, words: decoded.length,
    exactDictionaryMatches: decoded.filter(w => dictionary.has(w)).length,
    prefix: decoded.slice(0, 12)
  };
}
const keyTests = [
  { key: 'prime-value offsets', symbols: primeOffsetReadout.map(x => x.rune), gp: primeOffsetKey },
  { key: 'source GP0 offsets', symbols: gp0OffsetReadout.map(x => x.rune), gp: gp0OffsetKey }
].map(k => ({
  name: k.key, symbols: k.symbols.join(''), gp: k.gp,
  tests: [29, 45, 44, 46].map(page => testRepeatingKey(page, k.gp))
}));

const cohortLineCounts = Array.from({ length: 16 }, (_, i) => ({
  page: 40 + i, lines: lineCount(40 + i)
}));
const cohortLineTotal = cohortLineCounts.reduce((sum, x) => sum + x.lines, 0);
if (cohortLineTotal !== 155) throw new Error('p40–p55 line total changed: ' + cohortLineTotal);

console.log(JSON.stringify({
  sourceWordCount: sourceWords.length,
  uniqueConsecutivePrimeRunCount: primeRuns.length,
  selectedWords: selected,
  selectedPages: pageStats,
  primeValueOffsets: primeOffsetReadout,
  sourceGP0Offsets: gp0OffsetReadout,
  repeatingKeyNegativeControls: keyTests,
  p40To55LineCounts: cohortLineCounts,
  p40To55LineTotal: cohortLineTotal,
  rejected192LineBase: 'p40–p55 contains 155 printed lines, not 16×12=192'
}, null, 2));
