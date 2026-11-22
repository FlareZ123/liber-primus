'use strict';

/**
 * Single-file, read-only original-input test for Director #2160.
 *
 * Candidate: whole-word, plaintext-envelope, reversible GP29 affine rotor.
 * It uses the literal first/last GP rune of each decoded word as the next
 * word's shift and direction. There is one two-rune starting secret (841 keys).
 *
 * Usage: node sims/lp2_p16_p21_word_envelope_state_sft.cjs
 * Requires repository resources/liber-primus/lp2-transcription.txt and
 * resources/liber-primus/lp2-corpus.json. Node 22, CommonJS, Windows 11.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const MOD = 29;
const mod = n => ((n % MOD) + MOD) % MOD;
const root = path.join('resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const raw = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8');
const runeToNumber = new Map(corpus.runes.map((r, i) => [r, i]));

/** @typedef {{value: number, page: number, offset: number}} Cell */
/** @typedef {Cell[]} SourceWord */

/** @returns {SourceWord[]} */
function tokenize() {
  /** @type {SourceWord[]} */
  const words = [];
  /** @type {SourceWord} */
  let word = [];
  let transcriptPage = 0;
  let offset = 0;
  const flush = () => {
    if (word.length) words.push(word);
    word = [];
  };
  for (const ch of raw) {
    if (ch === '%') {
      transcriptPage++;
      offset = 0;
    } else if (runeToNumber.has(ch)) {
      // The text omits rune-free physical page p50.
      const page = transcriptPage < 50 ? transcriptPage : transcriptPage + 1;
      word.push({ value: runeToNumber.get(ch), page, offset: offset++ });
    } else if ('-.$&'.includes(ch)) {
      flush();
    }
    // Newlines and '/' denote printed wraps. They are not word boundaries.
  }
  flush();
  return words;
}

/**
 * Decode an exact, word-preserving GP29 affine rotor, with a two-symbol seed.
 * C[w,j] = P[w,j] + K[w] + j*D[w] mod29;
 * K[w+1] = P[w,0] + P[w,last] mod29;
 * D[w+1] = P[w,0] - P[w,last] mod29.
 * The previous decoded word determines the next state, even across pages.
 *
 * @param {number[][]} ciphertext
 * @param {number} shift
 * @param {number} direction
 * @returns {number[][]}
 */
function decode(ciphertext, shift, direction) {
  const out = [];
  let k = shift;
  let d = direction;
  for (const word of ciphertext) {
    const plaintext = word.map((c, j) => mod(c - k - j * d));
    k = mod(plaintext[0] + plaintext[plaintext.length - 1]);
    d = mod(plaintext[0] - plaintext[plaintext.length - 1]);
    out.push(plaintext);
  }
  return out;
}

/**
 * @param {number[][]} plaintext
 * @param {number} shift
 * @param {number} direction
 * @returns {number[][]}
 */
function encode(plaintext, shift, direction) {
  const out = [];
  let k = shift;
  let d = direction;
  for (const word of plaintext) {
    out.push(word.map((p, j) => mod(p + k + j * d)));
    k = mod(word[0] + word[word.length - 1]);
    d = mod(word[0] - word[word.length - 1]);
  }
  return out;
}

const words = tokenize();
const corridor = words.filter(w => w[0].page >= 16 && w[w.length - 1].page <= 21);
const ciphertext = corridor.map(w => w.map(c => c.value));
const runeCount = ciphertext.reduce((n, w) => n + w.length, 0);
const oneRuneSites = corridor.map((w, i) => ({ w, i })).filter(x => x.w.length === 1);

assert.equal(corridor.length, 372, 'word parser drift in p16–p21');
assert.equal(runeCount, 1605, 'rune parser drift in p16–p21');
assert.equal(oneRuneSites.length, 17, 'single-rune source count changed');
assert.deepEqual(oneRuneSites.slice(0, 2).map(x =>
  ({ word: x.i, page: x.w[0].page, offset: x.w[0].offset, ciphertext: x.w[0].value })),
[
  { word: 2, page: 16, offset: 21, ciphertext: 23 },
  { word: 29, page: 16, offset: 119, ciphertext: 9 }
]);

// Most generous native-GP English singleton alphabet: O is allowed alongside A,I.
const legalSingletons = new Set([3, 10, 24]);
let maxHits = 0;
let maxFirstTwo = 0;
let validAll = 0;
let validFirstTwo = 0;
let firstPairInvariantCount = 0;
let exactReplays = 0;
const pairExamples = new Set();
for (let k = 0; k < MOD; k++) {
  for (let d = 0; d < MOD; d++) {
    const p = decode(ciphertext, k, d);
    const nHits = oneRuneSites.reduce((count, at) =>
      count + Number(legalSingletons.has(p[at.i][0])), 0);
    const nFirstTwo = oneRuneSites.slice(0, 2).reduce((count, at) =>
      count + Number(legalSingletons.has(p[at.i][0])), 0);
    maxHits = Math.max(maxHits, nHits);
    maxFirstTwo = Math.max(maxFirstTwo, nFirstTwo);
    if (nHits === oneRuneSites.length) validAll++;
    if (nFirstTwo === 2) validFirstTwo++;
    const first = p[oneRuneSites[0].i][0];
    const second = p[oneRuneSites[1].i][0];
    pairExamples.add(first + ':' + second);
    if (mod(first + 2 * second) === 28) firstPairInvariantCount++;
    assert.deepEqual(encode(p, k, d), ciphertext, 'forward replay failed');
    exactReplays++;
  }
}
assert.equal(validFirstTwo, 0);
assert.equal(validAll, 0);
assert.equal(firstPairInvariantCount, 841);
assert.equal(pairExamples.size, 29);
assert.equal(maxHits, 4);

// Positive: source-native solved p57 words, two complete copies, and permitted
// single-letter controls. The final diagnostic token includes all 29 runes.
const p57 = words.filter(w => w[0].page === 57 && w[w.length - 1].page === 57)
  .map(w => w.map(c => c.value));
assert.equal(p57.reduce((n, w) => n + w.length, 0), 95);
const plant = [...p57, [24], [10], [3], ...p57, Array.from({ length: MOD }, (_, i) => i)];
const plantCipher = encode(plant, 23, 5);
assert.deepEqual(decode(plantCipher, 23, 5), plant);
assert.equal(plant.reduce((n, w) => n + w.length, 0), 222);
console.log(JSON.stringify({
  original: { pageStart: 16, pageEnd: 21, completeWords: corridor.length,
    runes: runeCount, omittedOutgoingCarryRunes: 8,
    oneRuneWords: oneRuneSites.length, firstTwo: oneRuneSites.slice(0, 2).map(x =>
      ({ wordIndex: x.i, page: x.w[0].page, offset: x.w[0].offset,
        ciphertextGP0: x.w[0].value })) },
  model: 'whole-word GP29 affine shift/direction from previous plaintext word envelope',
  keys: 841, exactReplays, pairExamples: pairExamples.size,
  firstPairIdentity: 'P(first singleton) + 2*P(second singleton) = 28 mod29',
  firstPairIdentityKeys: firstPairInvariantCount,
  maxLegalFirstTwo: maxFirstTwo, validFirstTwo, maxLegalAll17: maxHits, validAll17: validAll,
  solvedP57Plant: { runes: 222, firstWordCorrect: true, all29Symbols: true }
}, null, 2));
console.log('PASS: the frozen two-state envelope family is key-independently excluded');
