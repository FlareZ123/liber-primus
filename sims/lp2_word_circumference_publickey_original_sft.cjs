'use strict';
/**
 * SFT: source-visible first/last word-rune pad on LP2 unknown pages.
 *
 * In the solved p57 Parable, "shed our own circumferences" provides a
 * human-visible reason to try the two printed exterior runes of each word
 * as publicly transmitted per-word keys. These 36 fixed decoders use
 * GP29 index, prime, or totient registers and six elementary key laws.
 *
 * Outcome is a bounded negative for source-native English interiors,
 * not an assertion about arbitrary language or multistage encryption.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const printed = read('resources/liber-primus/lp2-transcription.txt');
const spelling = read('resources/control/english_wordfreq_textblob.txt');

const runeMap = new Map(corpus.runes.map((rune, i) => [rune, i]));
const tokens = corpus.translit.map((token, i) => ({token, i}))
  .sort((a, b) => b.token.length - a.token.length);
const mod29 = (n) => ((n % 29) + 29) % 29;

/** @param {string} word @returns {number[] | null} */
function encodeEnglish(word) {
  const normalized = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const result = [];
  for (let pos = 0; pos < normalized.length;) {
    const term = tokens.find(({token}) => normalized.startsWith(token, pos));
    if (!term) return null;
    result.push(term.i);
    pos += term.token.length;
  }
  return result;
}

// Actual original physical pages p0–p55 are the first 55 runic
// transcription blocks; runeless p50 is absent in this text fixture.
// A page wrap is not necessarily a word separator.
const originalText = printed.split('%').slice(0, 55).join('')
  .replace(/\/\s*/gu, '');
const wordStrings = originalText.match(/[\u16A0-\u16FF]+/gu) || [];
const words = wordStrings.map((word) => [...word].map((rune) => {
  const value = runeMap.get(rune);
  assert.notEqual(value, undefined);
  return value;
}));
assert.equal(words.length, 2896);
assert.equal(words.flat().length, 12956);
const eligible6 = words.filter((word) => word.length >= 6);
const eligible8 = words.filter((word) => word.length >= 8);
assert.equal(eligible6.length, 815);
assert.equal(eligible8.length, 343);

// A genuinely external 2026-11-10 TextBlob/Gutenberg English lexicon
// supplies independently spelled whole words and their INTERIOR
// rune strings, without using any original unknown LP2 plaintext.
const dictionary = new Set();
const sampleByLength = new Map();
for (const line of spelling.split('\n')) {
  const match = line.trim().match(/^([a-z]+)\s+\d+$/u);
  if (!match) continue;
  const value = encodeEnglish(match[1]);
  if (!value || value.length < 3) continue;
  dictionary.add(value.slice(1, -1).join(','));
  if (value.length >= 6 && !sampleByLength.has(value.length)) {
    sampleByLength.set(value.length, value);
  }
}
assert.equal(dictionary.size, 20678);
assert.ok(eligible6.every((word) => sampleByLength.has(word.length)));

/** @type {Record<string, (index:number)=>number>} */
const registers = {
  indices: (i) => i,
  primes: (i) => corpus.prime[i],
  totients: (i) => corpus.prime[i] - 1,
};

/** @type {Record<string, (first:number,last:number,position:number)=>number>} */
const laws = {
  first: (first, last, position) => first,
  last: (first, last, position) => last,
  sum: (first, last, position) => first + last,
  firstMinusLast: (first, last, position) => first - last,
  product: (first, last, position) => first * last,
  firstPlusStepLast: (first, last, position) => first + position * last,
};

/**
 * Wordwise reversible interior transform. The published first and
 * last ciphertext runes remain unchanged and supply its key.
 * @param {number[]} ciphertext
 * @param {(index:number)=>number} register
 * @param {(f:number,l:number,j:number)=>number} law
 * @param {number} sign
 * @returns {number[]}
 */
function decodeInterior(ciphertext, register, law, sign) {
  const first = register(ciphertext[0]);
  const last = register(ciphertext[ciphertext.length - 1]);
  return ciphertext.slice(1, -1).map((c, i) =>
    mod29(c + sign * law(first, last, i + 1)));
}

/** @param {number[]} values @returns {boolean} */
const supported = (values) => dictionary.has(values.join(','));

let rawSupport = 0;
for (const word of eligible6) {
  if (supported(word.slice(1, -1))) rawSupport++;
}
assert.equal(rawSupport, 0);

const outcomes = [];
let positiveRecoveries = 0;
for (const [registerName, register] of Object.entries(registers)) {
  for (const [lawName, law] of Object.entries(laws)) {
    for (const sign of [-1, 1]) {
      let hits6 = 0;
      let hits8 = 0;
      for (const original of eligible6) {
        const plain = decodeInterior(original, register, law, sign);
        if (supported(plain)) {
          hits6++;
          if (original.length >= 8) hits8++;
        }

        // 100% genuine native-English positive, using a word from the
        // independent source fixture of exactly the original word length.
        // The original exterior runes are retained as the visible key.
        const sample = sampleByLength.get(original.length);
        const first = register(original[0]);
        const last = register(original[original.length - 1]);
        const planted = [
          original[0],
          ...sample.slice(1, -1).map((p, i) =>
            mod29(p - sign * law(first, last, i + 1))),
          original[original.length - 1],
        ];
        assert.deepEqual(
          decodeInterior(planted, register, law, sign),
          sample.slice(1, -1)
        );
        assert.ok(supported(sample.slice(1, -1)));
        positiveRecoveries++;
      }
      outcomes.push({registerName, lawName, sign, hits6, hits8});
    }
  }
}

assert.equal(outcomes.length, 36);
assert.equal(positiveRecoveries, 29340);
assert.equal(Math.min(...outcomes.map((x) => x.hits6)), 0);
assert.equal(Math.max(...outcomes.map((x) => x.hits6)), 5);
assert.ok(outcomes.every((x) => x.hits8 === 0));

outcomes.sort((a, b) => b.hits6 - a.hits6);
console.log('ORIGINAL: 12956 runes, 2896 words, 815 words>=6, 343 words>=8');
console.log('METHOD: 3 original GP registers x 6 fixed shell-key laws x 2 signs');
console.log('EXACT ENGLISH INTERIOR SUPPORT: max 5/815; all 36 give 0/343 at length>=8');
console.log('POSITIVE PLANTS: 29340/29340 source-native interiors recovered');
console.log('TOP 6: ' + JSON.stringify(outcomes.slice(0, 6)));

/*
 * Historical p56 extension: p56 really uses Euler's totient of successive
 * primes as a consumed-key stream. Let each word's published exterior
 * choose the prime ordinal at which that authentic clock begins.
 * Six frozen selectors and both cipher signs are tested on unchanged
 * original interiors; no unknown phase, F mask, or key is inferred.
 */
const first150Primes = [];
for (let candidate = 2; first150Primes.length < 150; candidate++) {
  let prime = true;
  for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
    if (candidate % divisor === 0) { prime = false; break; }
  }
  if (prime) first150Primes.push(candidate);
}
const starts = {
  firstIndex: (w) => w[0],
  lastIndex: (w) => w[w.length - 1],
  firstPlusLastMod29: (w) => mod29(w[0] + w[w.length - 1]),
  firstPrime: (w) => corpus.prime[w[0]],
  lastPrime: (w) => corpus.prime[w[w.length - 1]],
  firstTotient: (w) => corpus.prime[w[0]] - 1,
};
/**
 * @param {number[]} cipher
 * @param {(word:number[])=>number} start
 * @param {number} sign
 * @returns {number[]}
 */
function decodeTotientInterior(cipher, start, sign) {
  const seed = start(cipher);
  return cipher.slice(1, -1).map((c, j) =>
    mod29(c + sign * (first150Primes[seed + j] - 1)));
}
let totientPlants = 0;
const totientOutcome = [];
for (const [startName, start] of Object.entries(starts)) {
  for (const sign of [-1, 1]) {
    let supported6 = 0;
    let supported8 = 0;
    for (const w of eligible6) {
      if (supported(decodeTotientInterior(w, start, sign))) {
        supported6++;
        if (w.length >= 8) supported8++;
      }
      const native = sampleByLength.get(w.length);
      const seed = start(w);
      const planted = [
        w[0],
        ...native.slice(1, -1).map((p, j) =>
          mod29(p - sign * (first150Primes[seed + j] - 1))),
        w[w.length - 1],
      ];
      assert.deepEqual(
        decodeTotientInterior(planted, start, sign),
        native.slice(1, -1)
      );
      totientPlants++;
    }
    totientOutcome.push({startName, sign, supported6, supported8});
  }
}
assert.equal(totientOutcome.length, 12);
assert.equal(totientPlants, 9780);
assert.equal(Math.max(...totientOutcome.map((x) => x.supported6)), 3);
assert.ok(totientOutcome.every((x) => x.supported8 === 0));
console.log('TOTIENT extension: 12 source-seeded prime clocks, max 3/815 dictionary interiors');
console.log('TOTIENT length>=8: all 0/343, positive native plants 9780/9780');
console.log('TOTIENT details: ' + JSON.stringify(totientOutcome));

console.log('VERDICT: no unknown plaintext/key under this declared model.');
