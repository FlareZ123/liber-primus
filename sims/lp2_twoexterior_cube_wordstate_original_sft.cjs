'use strict';

/**
 * LP2 two-exterior-word GP29 cube-clock transducer, original-cipher gate.
 *
 * One frozen, source-motivated and fully reversible operation, NOT
 * an authenticated Cicada instruction.  Uses signed-2016 cubing Q(x)=x^3
 * modulo 29, p57 "shed our own circumferences" -> preceding complete
 * ciphertext word's two exterior runes, and solved p56's additive GP
 * alphabet.  Word j starts with j=0 and the two cube clocks run in
 * opposite directions.  The virtual preceding word is signed-2016 HELLO.
 *
 * For ciphertext word w_i and previous *ciphertext* word w_(i-1):
 *   k_j = Q^j(first(w_(i-1))) + Q^(-j)(last(w_(i-1))) mod29
 *   p_(i,j) = c_(i,j) - k_j mod29
 * Forward encryption is causal word-to-word and exactly invertible.
 *
 * Node.js 22 CJS, Windows compatible, read-only, no added packages.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const load = file => fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', file), 'utf8');
const corpus = JSON.parse(load('lp2-corpus.json'));
const transcription = load('lp2-transcription.txt');
const GP = 29;
const byRune = new Map(corpus.runes.map((r, i) => [r, i]));
const originalWords = transcription.replace(/[0-9\/\r\n\s%$&§]/g, '')
  .split(/[-.]/g)
  .filter(Boolean)
  .map(word => [...word].map(ch => {
    assert.ok(byRune.has(ch), 'Invalid original source rune ' + ch);
    return byRune.get(ch);
  }));

const unknownWords = originalWords.slice(0, 2896);
const originalUnknown = corpus.pages.slice(0, 56).flatMap(page => page.indices);
const solvedP57 = corpus.pages[57].indices;
const solvedP57Words = originalWords.slice(-20);
assert.equal(corpus.pages.length, 58);
assert.equal(originalWords.length, 2941);
assert.equal(unknownWords.length, 2896);
assert.equal(unknownWords.flat().length, 12956);
assert.deepEqual(unknownWords.flat(), originalUnknown);
assert.equal(solvedP57Words.length, 20);
assert.deepEqual(solvedP57Words.flat(), solvedP57);
assert.equal(corpus.pages[50].runic_count, 0);
assert.equal(corpus.pages.slice(16, 22).reduce((s, p) => s + p.runic_count, 0), 1613);
assert.equal(corpus.pages.slice(40, 54).reduce((s, p) => s + p.runic_count, 0), 3008);

/**
 * @param {number} x GP29 rune ordinal
 * @param {number} steps Signed six-cycle iteration count
 * @returns {number} GP29 rune ordinal
 */
function cube(x, steps) {
  const cycles = ((steps % 6) + 6) % 6;
  for (let i = 0; i < cycles; ++i) x = (x * x * x) % GP;
  return x;
}
for (let x = 0; x < GP; ++x) {
  assert.equal(cube(x, 6), x);
  assert.equal(cube(cube(x, 1), -1), x);
}

/** @param {number} first @param {number} last @param {number} j @returns {number} */
function mask(first, last, j) {
  return (cube(first, j) + cube(last, -j)) % GP;
}
/** @param {number[]} word @param {number[]} previousCipher @returns {number[]} */
function decryptWord(word, previousCipher) {
  assert.ok(word.length > 0);
  return word.map((c, j) => (c - mask(previousCipher[0], previousCipher.at(-1), j) + GP) % GP);
}
/** @param {number[]} word @param {number[]} previousCipher @returns {number[]} */
function encryptWord(word, previousCipher) {
  assert.ok(word.length > 0);
  return word.map((p, j) => (p + mask(previousCipher[0], previousCipher.at(-1), j)) % GP);
}
/**
 * @param {number[][]} words
 * @param {number[]} seed
 * @returns {number[][]}
 */
function decode(words, seed) {
  let prev = seed;
  return words.map(cipher => {
    const plain = decryptWord(cipher, prev);
    prev = cipher;
    return plain;
  });
}
/**
 * @param {number[][]} words
 * @param {number[]} seed
 * @returns {number[][]}
 */
function encode(words, seed) {
  let prev = seed;
  return words.map(plain => {
    const cipher = encryptWord(plain, prev);
    prev = cipher;
    return cipher;
  });
}
/** @param {number[]} a @returns {number} */
function indexOfCoincidence(a) {
  const frequencies = Array(GP).fill(0);
  a.forEach(x => frequencies[x]++);
  return frequencies.reduce((sum, n) => sum + n * (n - 1), 0) / (a.length * (a.length - 1));
}
const translit = a => a.map(x => corpus.translit[x]).join('');

// Source-typed virtual predecessor: word 0 of signed 2016 cleartext "HELLO".
const signedHello = [8, 18, 20, 20, 3];
assert.equal(translit(signedHello), 'HELLO');
const decoded = decode(unknownWords, signedHello);
assert.deepEqual(encode(decoded, signedHello), unknownWords);

const all = decoded.flat();
let offset = 0;
const starts = corpus.pages.map(p => {
  const start = offset;
  offset += p.indices.length;
  return start;
});
const passage = (firstPage, lastPage) => all.slice(
  starts[firstPage],
  starts[lastPage] + corpus.pages[lastPage].indices.length
);
const original16to21 = passage(16, 21);
const original40to53 = passage(40, 53);
assert.equal(original16to21.length, 1613);
assert.equal(original40to53.length, 3008);
assert.ok(Math.abs(indexOfCoincidence(original16to21) - 0.034325632769726125) < 1e-14);
assert.ok(Math.abs(indexOfCoincidence(original40to53) - 0.03445307580185242) < 1e-14);
assert.ok(Math.abs(indexOfCoincidence(all) - 0.03449227972144296) < 1e-14);

// Positive control: encrypt authentic unencrypted, printed p57 parable words,
// checking the causal two-edge state of a *changing ciphertext* predecessor.
const plantedCipher = encode(solvedP57Words, signedHello);
assert.equal(plantedCipher.flat().length, 95);
assert.deepEqual(decode(plantedCipher, signedHello), solvedP57Words);
assert.deepEqual(solvedP57Words.flat(), solvedP57);
assert.ok(indexOfCoincidence(solvedP57) > 0.06);

console.log(JSON.stringify({
  provenance: 'Original LP2 physical pages 0..55 and source-authentic signed2016 HELLO + cube',
  model: 'first/last previous ciphertext word, forward/backward GF29 cube clocks, additive output',
  initialState: 'HELLO [8,18,20,20,3]',
  unknownWords: unknownWords.length,
  unknownRunes: originalUnknown.length,
  exactOriginalForwardReplay: true,
  passage16to21: {
    originalRunes: original16to21.length,
    decodedIoC: indexOfCoincidence(original16to21),
    openingGP: translit(original16to21.slice(0, 120))
  },
  independent40to53: {
    originalRunes: original40to53.length,
    decodedIoC: indexOfCoincidence(original40to53),
    openingGP: translit(original40to53.slice(0, 120))
  },
  completeOriginalDecodedIoC: indexOfCoincidence(all),
  solvedP57NativeIoC: indexOfCoincidence(solvedP57),
  trueEnglishPlantedRoundtripRunes: solvedP57.length,
  originalPlaintextRecovered: false
}, null, 2));
