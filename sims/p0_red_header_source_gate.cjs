#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const page0 = corpus.pages.find((page) => page.page === 0);
const page0Ink = ink.pages.find((page) => page.page === 0);
const red = page0Ink.red_spans.find((span) => span.start === 0 && span.length === 13);
if (!page0 || !red) throw new Error('Missing canonical p0 page or 13-rune red span');

const redGlyphs = Array.from(red.runes);
const redTokens = redGlyphs.map((glyph) => corpus.translit[runeToIndex.get(glyph)]);
const firstBlackIndex = page0.indices[red.start + red.length];
const firstBlackGlyph = corpus.runes[firstBlackIndex];
const firstBlackToken = corpus.translit[firstBlackIndex];
const firstLine = read('resources/lp2-transcription.txt').split(/\r?\n/)[0];
const printedWords = firstLine.split(/[-.\/%&$]+/)
  .map((part) => Array.from(part).filter((glyph) => runeToIndex.has(glyph)))
  .filter((word) => word.length > 0);
const printedWordLengths = printedWords.slice(0, 4).map((word) => word.length);
if (!same(redTokens, ['S', 'H', 'E', 'O', 'G', 'M', 'IA', 'F', 'S', 'Y', 'E', 'NG', 'C'])) {
  throw new Error('Unexpected p0 red-span GP transcription: ' + redTokens.join(' '));
}
if (firstBlackToken !== 'TH' || !same(printedWordLengths, [8, 5, 4, 3])) {
  throw new Error('Unexpected p0 held-out rune or printed word boundaries');
}

const targetPattern = equalityPattern([...redTokens, firstBlackToken]);
const sourcePaths = [
  'resources/historical/cicada2012-countdown-message.asc',
  'resources/historical/cicada2012-midi-49-words.txt',
  'resources/historical/cicada2013-first-onion-hello.asc',
  'resources/historical/cicada2013-forest-clue.asc',
  'resources/historical/cicada2013-second-onion-everything-you-need.asc',
  'resources/historical/cicada2013-second-onion-icmp-echo.asc',
  'resources/external/2013-do-not-share-this-information-2.asc',
  'resources/external/2013-tcp-server-signed-source.md',
  'resources/external/2013-book-of-law-I.txt',
  'resources/external/2013-book-of-law-II.txt',
  'resources/external/2013-book-of-law-III.txt',
  'resources/external/2012-marriage-of-heaven-and-hell-page.txt',
];
const singles = ['F', 'U', 'O', 'R', 'C', 'G', 'W', 'H', 'N', 'I', 'J', 'P', 'X', 'S', 'T', 'B', 'E', 'M', 'L', 'D', 'A', 'Y'];

function equalityPattern(tokens) {
  const seen = new Map();
  let next = 0;
  return tokens.map((token) => {
    if (!seen.has(token)) seen.set(token, next++);
    return seen.get(token);
  });
}

function normalizeSource(text) {
  return text.toUpperCase()
    .replace(/Þ/g, 'TH').replace(/Æ/g, 'AE')
    .replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S');
}

function tokenizeWord(word, mode) {
  const source = normalizeSource(word);
  const multi = mode === 'ING'
    ? ['ING', 'TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA']
    : ['TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA'];
  const tokens = [...multi, ...singles];
  const out = [];
  for (let i = 0; i < source.length;) {
    const token = tokens.find((candidate) => source.startsWith(candidate, i));
    if (!token) return null;
    out.push(token);
    i += token.length;
  }
  return out;
}

const variants = ['NG', 'ING'].map((mode) => {
  const redExpansion = redTokens.map((token) => token === 'NG' && mode === 'ING' ? 'ING' : token).join('');
  const exact13 = [];
  const exact14 = [];
  const exactWordPair = [];
  const patternMatches = [];
  let tokenizableWords = 0;

  for (const relative of sourcePaths) {
    const source = read(relative);
    const normalized = normalizeSource(source);
    const compact = normalized.replace(/[^A-Z]/g, '');
    if (compact.includes(redExpansion)) exact13.push(relative);
    if (compact.includes(redExpansion + firstBlackToken)) exact14.push(relative);

    const rawWords = normalized.match(/[A-Z]+/g) || [];
    const words = rawWords.map((raw) => tokenizeWord(raw, mode));
    tokenizableWords += words.filter(Boolean).length;
    for (let i = 0; i + 2 < words.length; i++) {
      const [first, second, third] = words.slice(i, i + 3);
      if (!first || !second || !third || first.length !== 8 || second.length !== 5 || third.length === 0) continue;
      const candidate = [...first, ...second, third[0]];
      if (same(equalityPattern(candidate), targetPattern)) {
        patternMatches.push({ source: relative, words: rawWords.slice(i, i + 3) });
      }
      const expectedSecond = redTokens.slice(8).map((token) => token === 'NG' && mode === 'ING' ? 'ING' : token);
      if (same(first, redTokens.slice(0, 8)) && same(second, expectedSecond) && third[0] === firstBlackToken) {
        exactWordPair.push({ source: relative, words: rawWords.slice(i, i + 3) });
      }
    }
  }

  return { mode, exact13, exact14, exactWordPair, monoalphabeticPatternMatches: patternMatches, tokenizableWords };
});

console.log(JSON.stringify({
  input: {
    page: 0,
    redGlyphs: redGlyphs.join(''),
    redTokens,
    redWordLengths: printedWordLengths.slice(0, 2),
    firstBlackGlyph,
    firstBlackToken,
    heldOutPattern: targetPattern,
  },
  sourcePaths,
  variants,
}, null, 2));
