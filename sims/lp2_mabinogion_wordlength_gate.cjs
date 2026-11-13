'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const reference = read('resources/liber-primus/lp1-plaintext-reference.txt');
const profile = JSON.parse(read('resources/external/cicada2012-mabinogion-gutenberg5160-gp-wordlengths.json'));
const ruby = new Map(corpus.runes.map((r, i) => [r, i]));
const rune = /[\u16A0-\u16FF]/u;
const digraphs = new Set(['TH', 'EO', 'NG', 'OE', 'AE', 'IA', 'EA']);

function runeWords(text) {
  const words = [];
  let token = '';
  const finish = () => { if (token) words.push(token); token = ''; };
  for (const ch of text) {
    if (rune.test(ch)) token += ch;
    else if (ch === '/' || ch === '%' || /\s/u.test(ch)) continue;
    else finish();
  }
  finish();
  return words;
}

function englishGpLength(word) {
  const s = word.toUpperCase().replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Q/g, 'C').replace(/Z/g, 'S');
  let n = 0;
  for (let i = 0; i < s.length;) {
    if (s.slice(i, i + 3) === 'ING') i += 3;
    else if (digraphs.has(s.slice(i, i + 2))) i += 2;
    else i++;
    n++;
  }
  return n;
}

function matchLengths(target, source, window = 8) {
  const dictionary = new Map();
  for (let i = 0; i + window <= target.length; i++) {
    const key = target.slice(i, i + window).join(',');
    if (!dictionary.has(key)) dictionary.set(key, []);
    dictionary.get(key).push(i);
  }
  let matchedWindows = 0, longest = 0, example = null;
  for (let j = 0; j + window <= source.length; j++) {
    const slots = dictionary.get(source.slice(j, j + window).join(','));
    if (!slots) continue;
    for (const i of slots) {
      matchedWindows++;
      let left = 0, right = window;
      while (i - left - 1 >= 0 && j - left - 1 >= 0 &&
        target[i - left - 1] === source[j - left - 1]) left++;
      while (i + right < target.length && j + right < source.length &&
        target[i + right] === source[j + right]) right++;
      if (left + right > longest) {
        longest = left + right;
        example = {target: i - left, source: j - left, length: longest};
      }
    }
  }
  return {sourceWords: source.length, matchedWindows, longest, example};
}

function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

function shuffled(values, random) {
  const a = values.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pages = transcription.split('%');
assert.equal(pages.length, 57);
const unknownWords = runeWords(pages.slice(0, 55).join('%'));
const target = unknownWords.map((word) => Array.from(word).length);
const observed = unknownWords.flatMap((word) => [...word].map((r) => ruby.get(r)));
const expected = corpus.pages.filter((p) => p.page < 56).flatMap((p) => p.indices);
assert.deepEqual(observed, expected);
assert.equal(unknownWords.length, 2896);
assert.equal(observed.length, 12956);

const p57Runes = runeWords(pages[56]).map((word) => Array.from(word).length);
const p57English = [...reference.split('### 57').at(-1).matchAll(/[A-Za-z]+/g)]
  .map((m) => englishGpLength(m[0]));
assert.equal(p57Runes.length, 20);
assert.deepEqual(p57Runes, p57English);

const full = profile.full_book_word_lengths;
const chapter = profile.lady_of_the_fountain_word_lengths;
assert.equal(full.length, 111275);
assert.equal(chapter.length, 10400);
const fullMatch = matchLengths(target, full);
const chapterMatch = matchLengths(target, chapter);
const pageLocalChapter = pages.slice(0, 55).map((page, pageNumber) => {
  const lengths = runeWords(page).map((word) => Array.from(word).length);
  return {page: pageNumber, words: lengths.length, ...matchLengths(lengths, chapter)};
});
const pageLocalMaxChapter = Math.max(...pageLocalChapter.map((x) => x.longest));

const random = xorshift32(0x3301);
const nullMaxima = [];
for (let i = 0; i < 250; i++) {
  nullMaxima.push(matchLengths(target, shuffled(full, random)).longest);
}
const sorted = nullMaxima.slice().sort((a, b) => a - b);
const nullSummary = {
  shuffles: nullMaxima.length, seed: '0x3301 (xorshift32)',
  median: sorted[Math.floor((sorted.length - 1) * 0.50)],
  p95: sorted[Math.ceil(sorted.length * 0.95) - 1],
  maximum: sorted.at(-1),
  countAtLeast11: nullMaxima.filter((x) => x >= 11).length
};

const summary = {
  source: profile.source,
  target: {words: target.length, runes: observed.length, p57PositiveControlWords: p57Runes.length},
  ladyOfTheFountain: {...chapterMatch, pageLocalMaximum: pageLocalMaxChapter},
  fullBook: fullMatch,
  fullBookShuffleNull: nullSummary
};
assert.equal(chapterMatch.matchedWindows, 12);
assert.equal(chapterMatch.longest, 9);
assert.equal(fullMatch.matchedWindows, 124);
assert.equal(fullMatch.longest, 11);
assert.equal(pageLocalMaxChapter, 9);
assert.equal(nullSummary.median, 10);
assert.equal(nullSummary.p95, 11);
assert.equal(nullSummary.maximum, 12);
assert.equal(nullSummary.countAtLeast11, 78);
console.log(JSON.stringify(summary, null, 2));
