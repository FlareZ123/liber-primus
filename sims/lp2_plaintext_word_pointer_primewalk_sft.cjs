'use strict';

// Finite test of one signed-2016 "word numbers / direction" interpretation.
// Source first-party rule is conjectural: GP-prime word sums control the NEXT
// prime-totient key cursor; this is not a claim of Cicada-selected encryption.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const naturalWords = [
  read('resources/liber-primus/lp1-plaintext-reference.txt'),
  read('resources/external/2013-book-of-law-I.txt'),
  read('resources/external/2013-book-of-law-II.txt'),
  read('resources/external/2013-book-of-law-III.txt')
];

const p56Words = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const primes = [];
for (let n = 2; primes.length < 464; n++) {
  if (primes.every((p) => p * p > n || n % p !== 0)) primes.push(n);
}
assert.equal(primes.at(-1), 3301);

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

/** @param {string} value @returns {string} */
function gpSpelling(value) {
  return value.toUpperCase().replace(/[^A-Z]/g, '')
    .replace(/ING/g, 'NG').replace(/[KQ]/g, 'C')
    .replace(/V/g, 'U').replace(/Z/g, 'S');
}
const tokens = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} word @returns {number[] | null} */
function toGp(word) {
  let remaining = gpSpelling(word);
  /** @type {number[]} */
  const out = [];
  while (remaining) {
    const match = tokens.find(({ s }) => remaining.startsWith(s));
    if (!match) return null;
    out.push(match.i);
    remaining = remaining.slice(match.s.length);
  }
  return out;
}

/**
 * Source-locked exploratory rule:
 * each non-F plaintext rune adds phi(next prime), advancing cursor once.
 * F emits literal F without key consumption, as on authentic solved p56.
 * At every PRINTED word end, GP-prime sum S changes the cursor by +S if
 * S is prime or by -S if composite, modulo the 464 primes through 3301.
 * @param {number[]} word
 * @param {number} initial
 * @returns {{ cipher: number[], next: number, sum: number, direction: number }}
 */
function encodeWord(word, initial) {
  let cursor = initial;
  const cipher = [];
  for (const letter of word) {
    if (letter === 0) cipher.push(0);
    else {
      cipher.push((letter + primes[cursor] - 1) % 29);
      cursor = (cursor + 1) % 464;
    }
  }
  const sum = word.reduce((acc, letter) => acc + corpus.prime[letter], 0);
  const direction = isPrime(sum) ? 1 : -1;
  return {
    cipher,
    next: ((cursor + direction * sum) % 464 + 464) % 464,
    sum,
    direction
  };
}

/** @returns {Map<number, number[][]>} */
function dictionaryByLength() {
  /** @type {Map<string, number[]>} */
  const unique = new Map();
  for (const text of [...naturalWords, p56Words]) {
    for (const match of text.matchAll(/\b[A-Za-z]+\b/g)) {
      const runes = toGp(match[0]);
      if (runes && runes.length <= 15) unique.set(runes.join(','), runes);
    }
  }
  assert.equal(unique.size, 1472);
  /** @type {Map<number, number[][]>} */
  const byLength = new Map();
  for (const runes of unique.values()) {
    const list = byLength.get(runes.length) || [];
    list.push(runes);
    byLength.set(runes.length, list);
  }
  return byLength;
}
const dictionary = dictionaryByLength();

/**
 * Exact GP29 printed-word dictionary DP. No language model or unknown
 * ciphertext scoring: a candidate matches only if forward encoding equals
 * the original ciphertext and its pointer follows the previous decoded word.
 * @param {number[][]} cipherWords
 * @returns {Array<{ cursor: number, words: number[][] }>}
 */
function invertWords(cipherWords) {
  let states = [{ cursor: 0, words: [] }];
  for (const cipherWord of cipherWords) {
    /** @type {Map<string, { cursor: number, words: number[][] }>} */
    const nextStates = new Map();
    for (const state of states) {
      for (const candidate of dictionary.get(cipherWord.length) || []) {
        const result = encodeWord(candidate, state.cursor);
        if (!result.cipher.every((letter, i) => letter === cipherWord[i])) continue;
        const words = [...state.words, candidate];
        nextStates.set(words.map((w) => w.join(',')).join('|'), {
          cursor: result.next,
          words
        });
      }
    }
    states = [...nextStates.values()];
    if (!states.length) break;
  }
  return states;
}

/**
 * Enumerate every possible literal-F versus key-consuming interpretation
 * of a short ORIGINAL first word when cursor is fixed to zero. This avoids
 * assuming a source-ciphertext F is necessarily plaintext F.
 * @param {number[]} cipher
 * @returns {number[][]}
 */
function firstWordBranches(cipher) {
  let states = [{ cursor: 0, decoded: [] }];
  for (const letter of cipher) {
    const next = [];
    for (const state of states) {
      if (letter === 0) next.push({ cursor: state.cursor, decoded: [...state.decoded, 0] });
      const shift = primes[state.cursor] - 1;
      const plaintext = ((letter - shift) % 29 + 29) % 29;
      if (plaintext !== 0) next.push({
        cursor: (state.cursor + 1) % 464,
        decoded: [...state.decoded, plaintext]
      });
    }
    states = next;
  }
  return states.map((state) => state.decoded);
}

const plainWords = p56Words.split(' ').map((word) => {
  const result = toGp(word);
  assert.ok(result);
  return result;
});
const flattened = plainWords.flat();
assert.equal(flattened.length, 85);

// Authentic solved-p56 independent positive: genuine continuous
// prime-totient/F bypass, without the HYPOTHETICAL word-pointer shifts.
let cursor = 0;
const continuous = flattened.map((rune) => {
  if (rune === 0) return 0;
  const result = (rune + primes[cursor] - 1) % 29;
  cursor++;
  return result;
});
assert.deepEqual(continuous, corpus.pages[56].indices);

// Plant a full-length native-GP phrase with hidden pointer transitions.
// The inverse sees only ciphertext, immutable printed lengths and dictionary.
cursor = 0;
const planted = [];
let forward = 0;
let backward = 0;
for (const word of plainWords) {
  const result = encodeWord(word, cursor);
  planted.push(result.cipher);
  cursor = result.next;
  if (result.direction > 0) forward++;
  else backward++;
}
assert.equal(planted.flat().length, 85);
assert.deepEqual([forward, backward], [4, 21]);
const recovered = invertWords(planted);
assert.equal(recovered.length, 1);
assert.deepEqual(recovered[0].words, plainWords);

// The original book must be read in physical p0 -> p55 order. At zero
// cursor its very first 8-rune red word is already unrecoverable as any of
// the 1,472 authentic-reference GP words; F branching is exhaustively kept.
const p0 = corpus.pages[0].indices;
const p40 = corpus.pages[40].indices;
const red = firstWordBranches(p0.slice(0, 8));
const blackReset = firstWordBranches(p0.slice(13, 17));
const p40Reset = firstWordBranches(p40.slice(0, 3));
assert.deepEqual(red, [
  [14, 6, 14, 26, 25, 7, 11, 0],
  [14, 6, 14, 26, 25, 7, 11, 11]
]);
assert.deepEqual(blackReset, [[1, 9, 2, 19]]);
assert.deepEqual(p40Reset, [[0, 8, 17], [28, 7, 15]]);
assert.equal(invertWords([p0.slice(0, 8)]).length, 0);
assert.equal(invertWords([p0.slice(13, 17)]).length, 0);
assert.equal(invertWords([p40.slice(0, 3)]).length, 0);
console.log(JSON.stringify({
  status: 'PASS - fixed pointer rule excluded on original p0 word',
  originalWords: {
    p0Red8: red.map((word) => word.map((i) => corpus.translit[i]).join('')),
    p0Black4DiagnosticReset: blackReset.map((word) => word.map((i) => corpus.translit[i]).join('')),
    p40First3DiagnosticReset: p40Reset.map((word) => word.map((i) => corpus.translit[i]).join(''))
  },
  corpus: 'original source p0 and p40, no edits',
  dictionaryDistinctGp: 1472,
  authenticP56ContinuousRerun: '85/85',
  nativePlant: { runes: 85, words: 25, forward, backward, inverseCandidates: recovered.length },
  interpretation: 'source-selected next-word cursor rule missing; no unknown plaintext'
}, null, 2));
