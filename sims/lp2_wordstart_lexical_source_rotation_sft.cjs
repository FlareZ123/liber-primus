'use strict';

/**
 * Original-input SFT: GP29 English-looking word starts under a
 * ciphertext-transition-preserving page-rotation null (not a decryptor).
 * Uses only checked-in source and control files; Node.js 22 CommonJS.
 * No network, dependencies, or file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const dictionary = read('resources/control/english_wordfreq_textblob.txt');

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const tokenIndex = new Map(corpus.translit.map((t, i) => [t, i]));
const folds = { K: 'C', Q: 'C', V: 'U', Z: 'S' };
const digraphs = new Set(['TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA']);
const originalSourcePages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
assert.equal(originalSourcePages.length, 55);

const pages = [];
const words = [];
let current = [];
let periodPending = false;
let afterPeriod = false;
let periods = 0;

function flushWord() {
  if (current.length) {
    words.push({ slots: current, afterPeriod });
    current = [];
    afterPeriod = false;
  }
}

for (const [p, raw] of transcript.trim().split('%').slice(0, 55).entries()) {
  const indices = [];
  for (const ch of raw) {
    if (runeIndex.has(ch)) {
      if (current.length === 0) {
        afterPeriod = periodPending;
        periodPending = false;
      }
      current.push([p, indices.length]);
      indices.push(runeIndex.get(ch));
    } else if (!'/ \r\n\t'.includes(ch)) {
      flushWord();
      if (ch === '.') {
        periodPending = true;
        periods++;
      }
    }
  }
  assert.deepEqual(indices, originalSourcePages[p].indices, `original page ${p} rune mismatch`);
  pages.push(indices);
}
flushWord();
assert.equal(pages.flat().length, 12956);
assert.equal(words.length, 2896);
assert.equal(periods, 175);
assert.equal(words.filter((w) => w.afterPeriod).length, 174);
assert.equal(words.filter((w) => w.slots[0][0] !== w.slots[w.slots.length - 1][0]).length, 32);

const prefixes = new Set();
const completeWords = new Set();
for (const line of dictionary.split('\n')) {
  const match = /^([a-z]+)\s+\d+/.exec(line);
  if (!match) continue;
  const text = [...match[1].toUpperCase()].map((ch) => folds[ch] || ch).join('');
  const encoded = [];
  for (let i = 0; i < text.length;) {
    const pair = text.slice(i, i + 2);
    if (digraphs.has(pair)) {
      encoded.push(tokenIndex.get(pair));
      i += 2;
    } else {
      encoded.push(tokenIndex.get(text[i]));
      i++;
    }
  }
  if (encoded.some((n) => n === undefined)) continue;
  completeWords.add(encoded.join(','));
  if (encoded.length >= 4) prefixes.add(encoded.slice(0, 4).reduce((a, b) => 29 * a + b, 0));
}
assert.equal(prefixes.size, 7612);
assert.equal(completeWords.size, 29061);
const eligible = words.filter((w) => w.slots.length >= 4);
assert.equal(eligible.length, 1645);

/** @param {number[][]} source @param {number[]} shifts */
function score(source, shifts) {
  let prefix4 = 0;
  let postperiod4 = 0;
  let complete = 0;
  let fourComplete = 0;
  const exactExamples = [];
  for (const word of eligible) {
    const first = word.slots.slice(0, 4).map(([p, i]) => source[p][(i + shifts[p]) % source[p].length]);
    const key = first.reduce((a, b) => 29 * a + b, 0);
    if (prefixes.has(key)) {
      prefix4++;
      if (word.afterPeriod) postperiod4++;
    }
    const whole = word.slots.map(([p, i]) => source[p][(i + shifts[p]) % source[p].length]);
    if (completeWords.has(whole.join(','))) {
      complete++;
      if (whole.length === 4) fourComplete++;
      exactExamples.push({ page: word.slots[0][0] >= 50 ? word.slots[0][0] + 1 : word.slots[0][0],
        offset: word.slots[0][1], runeWord: whole.map((v) => corpus.translit[v]).join('-') });
    }
  }
  return { prefix4, postperiod4, complete, fourComplete, exactExamples };
}

const original = score(pages, pages.map(() => 0));
assert.equal(original.prefix4, 27);
assert.equal(original.postperiod4, 4);
assert.equal(original.complete, 5);
assert.equal(original.fourComplete, 5);

const positive = pages.map((p) => p.slice());
const home = [8, 3, 19, 18];
const twelve = eligible.filter((w) => w.afterPeriod).slice(0, 12);
assert.equal(twelve.length, 12);
for (const word of twelve) {
  for (const [j, [p, offset]] of word.slots.slice(0, 4).entries()) positive[p][offset] = home[j];
}
const planted = score(positive, pages.map(() => 0));
assert.ok(planted.postperiod4 >= 12);

/** @param {number} startingSeed */
function generator(startingSeed) {
  let state = startingSeed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/** @param {number} seed @param {'prefix'|'complete'} target */
function rotationNull(seed, target) {
  const random = generator(seed);
  const iterations = 10000;
  let sum = 0;
  let squareSum = 0;
  let highAll = 0;
  let sumSecondary = 0;
  let highSecondary = 0;
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < iterations; i++) {
    const shifts = pages.map((p) => Math.floor(random() * p.length));
    const value = score(pages, shifts);
    const first = target === 'prefix' ? value.prefix4 : value.complete;
    const second = target === 'prefix' ? value.postperiod4 : value.fourComplete;
    const originalFirst = target === 'prefix' ? original.prefix4 : original.complete;
    const originalSecond = target === 'prefix' ? original.postperiod4 : original.fourComplete;
    sum += first;
    squareSum += first * first;
    sumSecondary += second;
    if (first >= originalFirst) highAll++;
    if (second >= originalSecond) highSecondary++;
    min = Math.min(min, first);
    max = Math.max(max, first);
  }
  const mean = sum / iterations;
  return {
    seed, iterations, first: { mean, sd: Math.sqrt(squareSum / iterations - mean * mean),
      min, max, geOriginal: highAll, upperTailP: (highAll + 1) / (iterations + 1) },
    secondary: { mean: sumSecondary / iterations, geOriginal: highSecondary,
      upperTailP: (highSecondary + 1) / (iterations + 1) }
  };
}

const prefixNull = rotationNull(0x33011314, 'prefix');
const completeNull = rotationNull(0x73015531, 'complete');
assert.equal(prefixNull.first.geOriginal, 329);
assert.equal(prefixNull.secondary.geOriginal, 170);
assert.equal(completeNull.first.geOriginal, 291);
assert.equal(completeNull.secondary.geOriginal, 290);

console.log(JSON.stringify({
  findingType: 'exploratory word-start concentration, no decryption',
  source: { ciphertextRunes: 12956, pages: 55, words: words.length,
    candidateWordsLengthAtLeast4: eligible.length, dictionaryGP4Prefixes: prefixes.size,
    dictionaryEncodedWords: completeWords.size },
  original,
  positivePlantPostperiod4: planted.postperiod4,
  sourceTransitionPreservingPageRotations: { prefixNull, completeNull },
  caution: 'Each surrogate preserves within-page ciphertext transitions except at one circular seam; weak p-values are uncorrected for model selection and prior search.'
}, null, 2));
