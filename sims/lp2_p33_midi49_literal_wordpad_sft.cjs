'use strict';

/**
 * Original-source SFT for Director #2197.
 * The 2012 participant-specific MIDI list has 49 words; physical LP2 p33 has
 * 49 black printed words. Freeze their original order and one source-literal
 * GP29 word-reset periodic additive key before evaluating the unknown text.
 *
 * Run as an ordinary CommonJS file from any working directory on Node 22:
 *   node sims/lp2_p33_midi49_literal_wordpad_sft.cjs
 *
 * No original LP2 plaintext is claimed. The 2012 author did not instruct
 * players to reuse this personal wordlist as an LP2 key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

/** @param {string} relative @returns {string} */
function source(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

const corpus = JSON.parse(source('resources/liber-primus/lp2-corpus.json'));
const originalTranscription = source('resources/lp2-transcription.txt');
const midiWords = source('resources/historical/cicada2012-midi-49-words.txt').trim().split(/\s+/);
const pages = originalTranscription.split('%');
const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tokenToIndex = new Map(corpus.translit.map((token, index) => [token, index]));
const compoundTokens = new Set(['TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA']);

/**
 * Retain printed words and join broken lines within one word. A hyphen or
 * punctuation mark separates words; a bare line break is a typesetting wrap.
 * @param {string} page
 * @returns {string[]}
 */
function printedWords(page) {
  return page.replace(/\/\r?\n/g, '').replace(/[.&]/g, '-')
    .replace(/\s/g, '').split('-').filter(Boolean);
}

/**
 * Explicit GP normalization for the English 2012 key words. Q->C is a
 * frozen single-rune convention for "square", not a source-authored rule.
 * @param {string} english
 * @returns {number[]}
 */
function gpWord(english) {
  const spelling = english.toUpperCase()
    .replace(/K/g, 'C').replace(/V/g, 'U')
    .replace(/Z/g, 'S').replace(/Q/g, 'C');
  /** @type {number[]} */
  const out = [];
  for (let i = 0; i < spelling.length;) {
    const pair = spelling.slice(i, i + 2);
    const token = compoundTokens.has(pair) ? pair : spelling[i];
    assert(tokenToIndex.has(token), 'Invalid GP token: ' + token);
    out.push(tokenToIndex.get(token));
    i += token.length;
  }
  return out;
}

/** @param {string} runes @returns {number[]} */
function gpIndices(runes) {
  return [...runes].map((rune) => {
    assert(runeToIndex.has(rune), 'Unexpected printed glyph: ' + rune);
    return runeToIndex.get(rune);
  });
}

/**
 * @param {number[]} word
 * @param {number[]} key
 * @param {1 | -1} sign 1 encrypts, -1 decrypts
 * @returns {number[]}
 */
function applyWordKey(word, key, sign) {
  return word.map((rune, j) => (rune + sign * key[j % key.length] + 29) % 29);
}

/** @param {number[]} values @returns {string} */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join('');
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const hist = Array(29).fill(0);
  for (const value of values) hist[value]++;
  return hist.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

/**
 * @param {string[]} runicWords
 * @param {number[][]} keys
 * @returns {{output: number[][], replay: number[][]}}
 */
function decodeAndReplay(runicWords, keys) {
  const input = runicWords.map(gpIndices);
  const output = input.map((word, i) => applyWordKey(word, keys[i], -1));
  const replay = output.map((word, i) => applyWordKey(word, keys[i], 1));
  assert.deepEqual(replay, input, 'Complete byte-for-byte original-rune replay');
  return { output, replay };
}

assert.equal(corpus.pages[33].runic_count, 214);
assert.equal(corpus.pages[34].runic_count, 261);
assert.equal(midiWords.length, 49);
assert.equal(new Set(midiWords).size, 47);
const keys = midiWords.map(gpWord);
const page33 = printedWords(pages[33]);
const page34 = printedWords(pages[34]);
assert.deepEqual(page33.join('') && gpIndices(page33.join('')), corpus.pages[33].indices);
assert.deepEqual(gpIndices(page34.join('')), corpus.pages[34].indices);

// Confirm the two red rubric blocks against the original p33 image (50.jpg).
const redAt = [0, 1, 23, 24];
const rubrics = redAt.map((i) => translit(gpIndices(page33[i])));
assert.deepEqual(rubrics, ['DEO', 'XCFIAWHG', 'NGTHEO', 'IFCOEO']);
const black = page33.filter((word, i) => !redAt.includes(i));
assert.equal(black.length, 49);
assert.equal(black.join('').length, 196);
assert.equal(redAt.reduce((sum, i) => sum + page33[i].length, 0), 18);

// Authentic solved original p57 words, GP orthography including NG and C/U.
// The planted key cycle is an implementation control, not a historical proof.
const solved57 = [
  'PARABLE', 'LICE', 'THE', 'INSTAR', 'TUNNELNG', 'TO', 'THE', 'SURFACE',
  'WE', 'MUST', 'SHED', 'OUR', 'OWN', 'CIRCUMFERENCES', 'FIND',
  'THE', 'DIUINITY', 'WITHIN', 'AND', 'EMERGE'
].map(gpWord);
assert.deepEqual(solved57.flat(), corpus.pages[57].indices);
const solvedC = solved57.map((word, i) => applyWordKey(word, keys[i], 1));
const solvedP = solvedC.map((word, i) => applyWordKey(word, keys[i], -1));
assert.deepEqual(solvedP, solved57, 'GP-native solved-p57 plant');

const p33 = decodeAndReplay(black, keys);
assert(page34.length >= 49, 'Second original-page holdout must contain 49 words');
const p34 = decodeAndReplay(page34.slice(0, 49), keys);
const plain33 = p33.output.flat();
const plain34 = p34.output.flat();
assert.equal(plain33.length, 196);

const report = {
  mode: 'fixed original 2012-list wordwise GP29 periodic addition, C=P+K',
  caveat: 'The 2012 list is participant-specific; no source instruction selects it for LP2.',
  source_midi_words: midiWords.length,
  p33_rubrics: rubrics,
  p33_black_words: black.length,
  p33_black_runes: plain33.length,
  p33_cipher_ioc: ioc(black.flatMap(gpIndices)),
  p33_plain_ioc: ioc(plain33),
  p33_plain: p33.output.map(translit).join(' '),
  p34_holdout_words: p34.output.length,
  p34_holdout_runes: plain34.length,
  p34_holdout_ioc: ioc(plain34),
  p34_holdout_plain: p34.output.map(translit).join(' '),
  exact_replay: true,
  solved_p57_plant: true
};
console.log(JSON.stringify(report, null, 2));
