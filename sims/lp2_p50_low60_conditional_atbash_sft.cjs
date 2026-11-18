'use strict';

/**
 * Director #1533: keyless conditional authentic GP29 Atbash under the frozen
 * global phase-zero p50 leading-zero / low-value mask.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'
));
const lp1CipherText = fs.readFileSync(
  path.join(root, 'resources/transcriptions/lp1_wulfic_canonical.txt'), 'utf8'
);
const lp1Reference = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8'
);

const tokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256);
const mask = Uint8Array.from(tokens, (token) => Number(token[0] === '0'));
assert.equal(mask.reduce((a, b) => a + b, 0), 60);

/** @param {number} value */
const atbash = (value) => 28 - value;
for (let i = 0; i < 29; i++) assert.equal(atbash(atbash(i)), i);

/*
 * Authentic solved LP1 Atbash positive, copied from the established
 * regression logic. GP29 Atbash is affine i -> 28*i+28 mod29 = 28-i.
 */
const lp1CipherPage = lp1CipherText.split('%')[0];
const authenticCipher = [...lp1CipherPage]
  .filter((rune) => corpus.runes.includes(rune))
  .map((rune) => corpus.runes.indexOf(rune));
const authenticReference = lp1Reference.split('### 1')[1].split('### 3')[0];
const authenticExpected = authenticReference.replace(/[^A-Z]/g, '')
  .replaceAll('V', 'U').replaceAll('K', 'C').replaceAll('ING', 'NG');
const authenticDecoded = authenticCipher.map((value) => corpus.translit[atbash(value)]).join('');
assert.equal(authenticCipher.length, 184);
assert.equal(authenticExpected.length, 199);
assert.equal(authenticDecoded, authenticExpected);

/**
 * Exact frozen p50 conditional involution at continuous global phase zero.
 * @param {number[]} values
 * @returns {number[]}
 */
function conditionalAtbash(values) {
  return values.map((value, i) => mask[i & 255] ? atbash(value) : value);
}

const unknownPages = corpus.pages.filter((page) => page.page <= 55);
const unknown = unknownPages.flatMap((page) => page.indices);
assert.equal(unknown.length, 12956);

const decoded = conditionalAtbash(unknown);
assert.deepEqual(conditionalAtbash(decoded), unknown);

/*
 * Source-shaped masked plant. The source plaintext is built only from
 * independently solved LP1 GP29 text, repeated to the exact unknown length.
 */
const alphabet = new Map(corpus.translit.map((token, index) => [token, index]));
const alphabetTokens = [...alphabet.keys()].sort((a, b) => b.length - a.length);

/** @param {string} text @returns {number[]} */
function encodeReference(text) {
  const out = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replaceAll('ING', 'NG');
    const seq = [];
    for (let at = 0; at < word.length;) {
      const token = alphabetTokens.find((candidate) => word.startsWith(candidate, at));
      if (!token) {
        seq.length = 0;
        break;
      }
      seq.push(alphabet.get(token));
      at += token.length;
    }
    out.push(...seq);
  }
  return out;
}

const native = encodeReference(lp1Reference);
assert.equal(native.length, 3568);
const plantedPlain = Array.from({ length: unknown.length }, (_, i) => native[i % native.length]);
const plantedCipher = conditionalAtbash(plantedPlain);
const plantedRecovered = conditionalAtbash(plantedCipher);
assert.deepEqual(plantedRecovered, plantedPlain);

/*
 * Frozen LP1-only first-order language score, shared with recent exact
 * additive-family gates. It is diagnostic only; the decoder itself has no fit.
 */
const unigram = new Float64Array(29).fill(0.5);
const bigram = Array.from({ length: 29 }, () => new Float64Array(29).fill(0.25));
for (const value of native) unigram[value]++;
for (let i = 1; i < native.length; i++) bigram[native[i - 1]][native[i]]++;
const unigramTotal = unigram.reduce((a, b) => a + b, 0);
const logU = Array.from(unigram, (x) => Math.log(x / unigramTotal));
const logT = Array.from({ length: 29 }, (_, a) => {
  const total = bigram[a].reduce((x, y) => x + y, 0);
  return Array.from(bigram[a], (x) => Math.log(x / total));
});

/** @param {number[]} values */
function score(values) {
  let total = logU[values[0]];
  for (let i = 1; i < values.length; i++) total += logT[values[i - 1]][values[i]];
  return {
    n: values.length,
    score: total,
    perRune: total / values.length,
    perplexity: Math.exp(-total / values.length)
  };
}

const CHAPTERS = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];

let global = 0;
let selectedRunes = 0;
let changedRunes = 0;
const chapterResults = [];
for (let chapter = 0; chapter < CHAPTERS.length; chapter++) {
  const [first, last] = CHAPTERS[chapter];
  const pages = unknownPages.filter((page) => first <= page.page && page.page <= last);
  const source = pages.flatMap((page) => page.indices);
  const start = global;
  const transformed = source.map((value, local) => {
    const selected = mask[(start + local) & 255];
    selectedRunes += selected;
    const result = selected ? atbash(value) : value;
    changedRunes += Number(result !== value);
    return result;
  });
  global += source.length;
  chapterResults.push({
    chapter,
    pages: [first, last],
    runes: source.length,
    raw: score(source),
    conditionalAtbash: score(transformed),
    first180: transformed.slice(0, 180).map((x) => corpus.translit[x]).join('-')
  });
}
assert.equal(global, unknown.length);
assert.deepEqual(chapterResults.flatMap((entry, chapter) => {
  const [first, last] = CHAPTERS[chapter];
  const pages = unknownPages.filter((page) => first <= page.page && page.page <= last);
  const start = pages.reduce((sum, page) => sum + page.indices.length, 0);
  return [start];
}).reduce((a, b) => a + b, 0), unknown.length);

const p57 = corpus.pages[57].indices;
const p57Native = score(p57);
const wholeRaw = score(unknown);
const wholeDecoded = score(decoded);
const plantPlainScore = score(plantedPlain);
const plantRecoveredScore = score(plantedRecovered);

console.log('Authentic solved Atbash positive:', JSON.stringify({
  source: 'LP1 solved page01',
  cipherRunes: authenticCipher.length,
  mapping: 'i -> 28-i',
  exactKnownPlaintextRecovered: authenticDecoded === authenticExpected
}));
console.log('Frozen p50 mask:', JSON.stringify({
  cells: mask.length,
  leadingZeroLowValueCells: mask.reduce((a, b) => a + b, 0),
  unknownRunes: unknown.length,
  selectedRunePositions: selectedRunes,
  changedRunePositions: changedRunes
}));
console.log('Source-shaped masked plant:', JSON.stringify({
  nativeSourceRunes: native.length,
  plantedRunes: plantedPlain.length,
  exactForwardInverseRecovery: plantedRecovered.every((x, i) => x === plantedPlain[i]),
  plaintextScore: plantPlainScore,
  recoveredScore: plantRecoveredScore
}));
console.log('Original whole stream:', JSON.stringify({
  raw: wholeRaw,
  conditionalAtbash: wholeDecoded,
  genuineSolvedP57: p57Native
}));
for (const result of chapterResults) {
  console.log('Original chapter:', JSON.stringify(result));
}

assert.ok(plantRecoveredScore.perRune > -2.8);
assert.ok(p57Native.perRune > -3.0);
assert.ok(wholeDecoded.perRune < -4.0);
assert.ok(chapterResults.every((entry) => entry.conditionalAtbash.perRune < -3.8));
console.log('PASS: authentic Atbash and masked plant recover exactly; frozen original p50-mask conditional Atbash remains nonlinguistic on every chapter.');
