'use strict';

/**
 * Original LP2 p55 prime-seed inverse selected by a p50 5x5 square perimeter.
 *
 * One independently printed source cell supplies the prime ordinal for each
 * of p55's 16 complete words. The decoder is the authentic solved-p56
 * phi(prime) operation, with all possible transparent-F branches retained.
 * Both printed radix conventions, two traversal orientations and two cipher
 * signs are fixed before reading any unknown output.
 *
 * These selectors are hypotheses. This test neither asserts plaintext nor
 * treats the source-number coincidences as authenticated decoder instructions.
 *
 * Run on Windows 11: node sims/lp2_p50_perimeter_wordseed_phi_p55_sft.cjs
 * Requires Node.js 22, no packages, no file writes or network access.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const mod29 = n => (n % 29 + 29) % 29;
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const pageText = transcription.split('%')[54];

/** @param {string} s @returns {number[]} */
function gp(s) {
  return Array.from(s).flatMap(rune =>
    runeIndex.has(rune) ? [runeIndex.get(rune)] : []);
}
const printedGroups = pageText.replace(/[\s/]/gu, '')
  .split(/[.\-&§$]/u).filter(Boolean).map(gp)
  .filter(group => group.length > 0);
assert.equal(printedGroups.length, 17);
assert.deepEqual(printedGroups[0], [21]); // incoming p54 word continuation
const words = printedGroups.slice(1);
assert.equal(words.length, 16);
assert.deepEqual(words.map(w => w.length),
  [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
assert.deepEqual(printedGroups.flat(),
  corpus.pages.find(p => p.page === 55).indices);
assert.equal(words.flat().length, 75);
assert.deepEqual(corpus.pages[55].indices.flatMap((rune, i) =>
  rune === 0 ? [i] : []), [15, 25, 41]);

// Source-anchored 5x5 frame: rows 21..25, columns 1..5 of the printed 32x8
// numeric grid. Its four corners under provisional radix59 are
// [[224,115],[73,75]]. Start at bottom-left 73 and walk its 16-cell border.
/** @returns {number[]} */
function clockwiseBorder() {
  const indices = [];
  for (let row = 25; row >= 21; row--) indices.push(row * 8 + 1);
  for (let col = 2; col <= 5; col++) indices.push(21 * 8 + col);
  for (let row = 22; row <= 25; row++) indices.push(row * 8 + 5);
  for (let col = 4; col >= 2; col--) indices.push(25 * 8 + col);
  assert.equal(indices.length, 16);
  assert.equal(new Set(indices).size, 16);
  return indices;
}
const border = clockwiseBorder();
const allTokens = grid.pages.flatMap(p => p.tokens);
assert.equal(allTokens.length, 256);
/** @param {59|60} radix @returns {number[]} */
function numeralValues(radix) {
  const digits = radix === 59 ? grid.alphabet.replace('f', '') :
    grid.alphabet;
  assert.equal(digits.length, radix);
  return allTokens.map(token => {
    const a = digits.indexOf(token[0]);
    const b = digits.indexOf(token[1]);
    assert(a >= 0 && b >= 0);
    return radix * a + b;
  });
}
assert.deepEqual([169, 173, 201, 205].map(i => numeralValues(59)[i]),
  [224, 115, 73, 75]);

/** @returns {number[]} */
function firstPrimes() {
  const primes = [];
  for (let n = 2; primes.length < 300; n++) {
    if (primes.every(p => p * p > n || n % p !== 0)) primes.push(n);
  }
  return primes;
}
const primes = firstPrimes();
/** @typedef {{plain:number[],clock:number}} State */

/**
 * Exact dynamic inversion of the known solved-p56 phi(prime) transform.
 * If plaintext rune is F=0 it is emitted literally and consumes no prime.
 * A non-F rune may also emit C=0, so enumerate both admissible branches.
 *
 * @param {number[]} ciphertext
 * @param {number} initialClock 0-based prime ordinal from a printed cell
 * @param {-1|1} sign Forward-sign convention
 * @returns {{states:State[],death:null|number}}
 */
function invert(ciphertext, initialClock, sign) {
  /** @type {State[]} */
  let states = [{plain: [], clock: initialClock}];
  for (let position = 0; position < ciphertext.length; position++) {
    /** @type {State[]} */
    const next = [];
    for (const state of states) {
      const plaintext = mod29(ciphertext[position] -
        sign * (primes[state.clock] - 1));
      if (plaintext !== 0)
        next.push({plain: state.plain.concat(plaintext),
          clock: state.clock + 1});
      if (ciphertext[position] === 0)
        next.push({plain: state.plain.concat(0), clock: state.clock});
    }
    states = next;
    if (!states.length) return {states: [], death: position};
  }
  return {states, death: null};
}

/**
 * @param {number[]} plaintext
 * @param {number} initialClock
 * @param {-1|1} sign
 */
function forward(plaintext, initialClock, sign) {
  let clock = initialClock;
  return plaintext.map(p => p === 0 ? 0 :
    mod29(p + sign * (primes[clock++] - 1)));
}

// The lexicon is a finite reference, not proof about the unknown LP2 language.
// GP-native transliteration allows Cicada's known ING ligature and conventional
// Cicada replacements for otherwise unrepresentable Latin letters.
const tokens = corpus.translit.map((t, i) => ({t, i}))
  .sort((a, b) => b.t.length - a.t.length);
/** @param {string} word @returns {number[]|null} */
function encodeEnglish(word) {
  word = word.toUpperCase().replace(/ING/gu, 'NG')
    .replace(/V/gu, 'U').replace(/[KQ]/gu, 'C').replace(/Z/gu, 'S');
  const out = [];
  for (let i = 0; i < word.length;) {
    const next = tokens.find(token => word.startsWith(token.t, i));
    if (!next) return null;
    out.push(next.i);
    i += next.t.length;
  }
  return out;
}
const lexicon = new Map();
let sourceWords = 0;
for (const line of read('resources/control/english_wordfreq_textblob.txt')
  .split(/\r?\n/u)) {
  const match = /^([a-z]+) (\d+)$/u.exec(line);
  if (!match) continue;
  sourceWords++;
  const enc = encodeEnglish(match[1]);
  if (!enc) continue;
  const key = enc.join(',');
  const previous = lexicon.get(key) || [];
  previous.push(match[1].toUpperCase());
  lexicon.set(key, previous);
}
assert.equal(sourceWords, 29157);
assert.equal(lexicon.size, 29060);
const known = corpus.pages.find(p => p.page === 57).indices.slice(0, 75);
assert.equal(known.length, 75);
let offset = 0;
const knownWords = words.map(w => {
  const slice = known.slice(offset, offset + w.length);
  offset += w.length;
  return slice;
});
assert.equal(offset, 75);

const models = [];
for (const radix of [59, 60]) {
  const values = numeralValues(radix);
  for (const clockwise of [true, false]) {
    const direction = clockwise ? border : [border[0], ...border.slice(1).reverse()];
    for (const sign of [-1, 1]) {
      let impossible = 0;
      let matches = 0;
      let longMatches = 0;
      const dead = [];
      const wordsWithMatches = [];
      let candidateCount = 0;
      for (let wi = 0; wi < words.length; wi++) {
        const clock = values[direction[wi]];
        const output = invert(words[wi], clock, sign);
        candidateCount += output.states.length;
        if (!output.states.length) {
          impossible++;
          dead.push({word: wi + 1, position: output.death});
        }
        const lexical = [...new Set(output.states.flatMap(s =>
          lexicon.get(s.plain.join(',')) || []))];
        if (lexical.length) {
          matches++;
          wordsWithMatches.push({word: wi + 1, matches: lexical});
          if (words[wi].length >= 3) longMatches++;
        }
        // Exact original forward re-encryption for every surviving branch.
        for (const state of output.states)
          assert.deepEqual(forward(state.plain, clock, sign), words[wi]);
        // Independent genuinely clear p57 GP passage: native positive plant.
        const planted = forward(knownWords[wi], clock, sign);
        assert(invert(planted, clock, sign).states
          .some(s => s.plain.every((p, j) => p === knownWords[wi][j])));
      }
      models.push({
        radix, clockwise, sign, impossible, dead, candidateCount,
        lexicalWords: matches, lexicalWordsLengthAtLeast3: longMatches,
        wordsWithMatches
      });
    }
  }
}
assert.deepEqual(models.map(m => m.impossible),
  [0, 2, 1, 2, 4, 0, 4, 3]);
assert.deepEqual(models.map(m => m.lexicalWords),
  [1, 1, 1, 1, 1, 3, 0, 3]);
assert(models.every(m => m.lexicalWordsLengthAtLeast3 === 0));
console.log(JSON.stringify({
  source: 'LP2 p50 5x5 source frame and p55 16 complete words',
  receiver: 'solved-p56 phi(prime), source-word-local key clock',
  originalRunes: 75, nativePlantRecovered: '75/75 for each of eight models',
  lexiconEntries: sourceWords, models,
  conclusion: 'All eight source-clue variants have zero matching lexicon words of length >=3 runes; six also have impossible literal-F branches. No unknown LP2 plaintext recovered.'
}, null, 2));
