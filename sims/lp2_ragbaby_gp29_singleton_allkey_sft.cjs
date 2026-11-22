'use strict';

/**
 * Original LP2 all-secret Ragbaby word-clock singleton obstruction.
 *
 * Historical source: American Cryptogram Association Ragbaby (1955):
 * a single mixed alphabet and a shift given by word number plus position.
 * This SFT tests the naturally lossless GP29 extension, not the classical
 * 24-letter I/J and W/X merging.
 *
 * The GP29 alphabet order is arbitrary and completely secret in the
 * impossibility theorem. No alphabet key is fitted to original ciphertext.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');

const radix = corpus.runes.length;
assert.equal(radix, 29);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
/** @type {number[][]} */
const allWords = [];
/** @type {number[]} */
let current = [];

function finishWord() {
  if (current.length) allWords.push(current);
  current = [];
}

for (const ch of transcription) {
  if (runeIndex.has(ch)) current.push(runeIndex.get(ch));
  else if (ch === '-' || ch === '.') finishWord();
  // '/', '%' and annotations wrap the source; they do not split words.
}
finishWord();

const original = corpus.pages.filter(page => page.page <= 55)
  .flatMap(page => page.indices);
assert.equal(original.length, 12956);

const flattened = allWords.flat();
assert.deepEqual(flattened.slice(0, original.length), original,
  'Transcription must reproduce every original unsolved source rune');

let occupied = 0;
/** @type {number[][]} */
const words = [];
for (const word of allWords) {
  if (occupied === original.length) break;
  assert.ok(occupied + word.length <= original.length,
    'A word must not cross the unsolved/solved boundary');
  words.push(word);
  occupied += word.length;
}
assert.equal(occupied, original.length);
assert.equal(words.length, 2896);

/**
 * For a fixed ciphertext glyph g at the start of a one-rune word:
 * K(P) = K(g) - (wordNumber + initialOffset) (mod 29).
 * If plaintext one-letter words belong to a set S, each distinct shift
 * requires a distinct member of S regardless of the secret permutation K.
 *
 * @param {number[][]} ciphertextWords
 * @returns {{groups: Map<number, Set<number>>, singletons: number, max: number}}
 */
function singletonShiftGroups(ciphertextWords) {
  const groups = new Map();
  let singletons = 0;
  ciphertextWords.forEach((word, wordIndex) => {
    if (word.length !== 1) return;
    singletons++;
    const glyph = word[0];
    const shift = (wordIndex + 1) % radix;
    if (!groups.has(glyph)) groups.set(glyph, new Set());
    groups.get(glyph).add(shift);
  });
  const max = Math.max(...[...groups.values()].map(set => set.size));
  return { groups, singletons, max };
}

const gate = singletonShiftGroups(words);
assert.equal(gate.singletons, 83);
assert.equal(gate.max, 5);

const witness = new Map([
  [19, [14, 15, 17, 19, 21]], // M
  [16, [6, 12, 13, 16, 20]], // T
  [13, [10, 15, 16, 22, 23]], // P
]);
for (const [glyph, expected] of witness) {
  assert.deepEqual([...gate.groups.get(glyph)].sort((a, b) => a - b), expected,
    'Source singleton-word residues changed');
}

// English one-rune GP orthographic words are A, I, and O.
// Each witnessed glyph needs five different plaintext singleton glyphs,
// contradicting every key alphabet if the original words are English.
const nativeEnglishSingletons = new Set([24, 10, 3]);
assert.equal(nativeEnglishSingletons.size, 3);
assert.ok(gate.max > nativeEnglishSingletons.size);

// Genuine invertible positive: a nonidentity complete secret GP29 ordering.
// All original printed word lengths are retained. Non-singleton plant text is
// arbitrary and therefore this control tests the structural theorem only.
const keyRank = Array.from({ length: radix }, (_, i) => (7 * i + 11) % radix);
const rankGlyph = Array(radix);
keyRank.forEach((rank, glyph) => { rankGlyph[rank] = glyph; });
assert.equal(new Set(keyRank).size, radix);

/** @param {number} n */
const mod = n => ((n % radix) + radix) % radix;

/** @param {number[]} word @param {number} wordNumber */
function encryptWord(word, wordNumber) {
  return word.map((plain, j) =>
    rankGlyph[mod(keyRank[plain] + wordNumber + j)]);
}

/** @param {number[]} word @param {number} wordNumber */
function decryptWord(word, wordNumber) {
  return word.map((cipher, j) =>
    rankGlyph[mod(keyRank[cipher] - wordNumber - j)]);
}

const syntheticWords = words.map((word, i) =>
  word.map((_, j) => word.length === 1
    ? [24, 10, 3][i % 3]
    : (i * 7 + j * 11) % radix));
const plantCipher = syntheticWords.map((w, i) => encryptWord(w, i + 1));
const plantRecovered = plantCipher.map((w, i) => decryptWord(w, i + 1));
assert.deepEqual(plantRecovered, syntheticWords);
assert.deepEqual(
  plantRecovered.map((w, i) => encryptWord(w, i + 1)), plantCipher);
const plantGate = singletonShiftGroups(plantCipher);
assert.equal(plantGate.singletons, 83);
assert.ok(plantGate.max <= 3,
  'True Ragbaby native-three-singleton plant must satisfy the theorem');

console.log('PASS: original runes=12956; complete printed words=2896;');
console.log('  original one-rune words=83; hidden-alphabet lower bound=5;');
for (const [glyph, shifts] of witness) {
  console.log('  witness', corpus.translit[glyph], shifts.join(','));
}
console.log('  GP29 mixed-alphabet original-shape plant round-trip=12956/12956;');
console.log('  native-3-singleton plant maximum shifts per glyph=', plantGate.max);
console.log('CONCLUSION: all unknown shared GP29 keyed alphabets fail the');
console.log('  historical global Ragbaby word-number clock for English A/I/O.');
