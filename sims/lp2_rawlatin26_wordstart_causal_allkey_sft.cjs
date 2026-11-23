'use strict';

/**
 * All-secret raw-Latin26 word-start prefix capacity gate for original LP2.
 *
 * A deterministic, causal word-local encryption algorithm that begins every
 * word of a given chapter in one common state cannot produce more than
 * 26 possible first ciphertext glyphs from 26 plaintext letters. This is
 * independent of how its key or later within-word state transition works.
 *
 * The actual LP2 first eight original text chapters independently exhibit
 * every one of the 29 GP ciphertext glyphs at word start. A stronger
 * book-wide two-symbol prefix observation gives 802 distinct first digraphs,
 * beyond the 26^2=676 permitted for a fixed-reset prefix-causal transducer.
 *
 * This is a bounded mathematical necessary condition. It neither identifies
 * the historical cipher nor excludes changing word-start IVs, noncausal
 * whole-word encryption, changed spaces, or a non-Latin plaintext register.
 *
 * Run with Windows 11, Node.js 22, from any current working directory:
 * node sims/lp2_rawlatin26_wordstart_causal_allkey_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseSharedCorpus, physicalLP2Page} = require('./lp2_word_pages.cjs');

const resource = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
const corpus = JSON.parse(fs.readFileSync(resource, 'utf8'));
const parsed = parseSharedCorpus();
const glyphIndex = new Map(corpus.runes.map((glyph, index) => [glyph, index]));
const original = corpus.pages.filter(page => page.page <= 55)
  .flatMap(page => page.indices);
const words = parsed.words.map(word => ({
  startPage: physicalLP2Page(word.startPage),
  values: [...word.runes].map(glyph => {
    assert.ok(glyphIndex.has(glyph));
    return glyphIndex.get(glyph);
  })
}));

assert.equal(original.length, 12956);
assert.equal(parsed.runeCount, 12956);
assert.equal(words.length, 2896);
assert.equal(parsed.crossPageWords, 32);
assert.deepEqual(words.flatMap(word => word.values), original);

/** @param {number[][]} entries @param {boolean} suffix */
function boundarySupport(entries, suffix) {
  const n = entries.filter(word => word.length >= 2);
  return {
    firstGlyphs: new Set(entries.map(word => word[0])).size,
    lastGlyphs: new Set(entries.map(word => word[word.length - 1])).size,
    firstDigraphs: new Set(n.map(word => 29 * word[0] + word[1])).size,
    lastDigraphs: new Set(n.map(word => 29 * word[word.length - 2] + word[word.length - 1])).size
  };
}

const cuts = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];
const expectedWords = [158, 255, 383, 437, 224, 326, 378, 669, 66];
const chapters = cuts.slice(0, -1).map((start, i) => {
  const end = cuts[i + 1];
  const entries = words.filter(word => word.startPage >= start && word.startPage < end)
    .map(word => word.values);
  assert.equal(entries.length, expectedWords[i]);
  return {pages: [start, end - 1], words: entries.length, ...boundarySupport(entries)};
});
assert.deepEqual(chapters.slice(0, 8).map(chapter => chapter.firstGlyphs),
  Array(8).fill(29));
assert.deepEqual(chapters.slice(0, 8).map(chapter => chapter.lastGlyphs),
  Array(8).fill(29));
assert.equal(chapters[8].firstGlyphs, 26);
assert.equal(chapters[8].lastGlyphs, 28);

const complete = boundarySupport(words.map(word => word.values));
assert.deepEqual(complete,
  {firstGlyphs: 29, lastGlyphs: 29, firstDigraphs: 802, lastDigraphs: 802});
assert.ok(complete.firstGlyphs > 26);
assert.ok(complete.lastGlyphs > 26);
assert.ok(complete.firstDigraphs > 26 ** 2);
assert.ok(complete.lastDigraphs > 26 ** 2);

// Even a special, otherwise arbitrary cipher for ONLY length-two and
// length-three words needs different word-start states to preserve causality.
const wordLengthControls = [1, 2, 3].map(length => {
  const entries = words.map(w => w.values).filter(w => w.length === length);
  return {length, words: entries.length, ...boundarySupport(entries)};
});
assert.deepEqual(wordLengthControls.map(entry => entry.words), [83, 448, 720]);
assert.deepEqual(wordLengthControls.map(entry => entry.firstGlyphs), [28, 29, 29]);
assert.deepEqual(wordLengthControls.map(entry => entry.lastGlyphs), [28, 29, 29]);

/**
 * A concrete reversible position-changing positive with ONE word-start
 * state shared by all words. It intentionally uses each possible raw-Latin
 * first character and all 676 ordered two-letter prefixes.
 * @param {number[]} latin
 * @returns {number[]}
 */
function encryptWord(latin) {
  let previous = 0;
  return latin.map((letter, j) => {
    assert.ok(Number.isInteger(letter) && letter >= 0 && letter < 26);
    const current = (7 * letter + 4 + previous + 13 * j) % 29;
    previous = current;
    return current;
  });
}

/**
 * Unique inverse on ciphertext produced by encryptWord.
 * @param {number[]} ciphertext
 * @returns {number[]}
 */
function decryptWord(ciphertext) {
  let previous = 0;
  return ciphertext.map((current, j) => {
    const letter = ((current - 4 - previous - 13 * j) * 25) % 29;
    const decoded = (letter + 29) % 29;
    assert.ok(decoded < 26);
    previous = current;
    return decoded;
  });
}
// 7*25 = 175 = 1 (mod 29).
assert.equal((7 * 25) % 29, 1);
const allLatinDigraphs = Array.from({length: 26 * 26}, (_, index) =>
  [Math.floor(index / 26), index % 26]);
const planted = allLatinDigraphs.map(encryptWord);
for (let index = 0; index < planted.length; index++) {
  assert.deepEqual(decryptWord(planted[index]), allLatinDigraphs[index]);
}
const plantedSupports = boundarySupport(planted);
assert.deepEqual(plantedSupports,
  {firstGlyphs: 26, lastGlyphs: 29, firstDigraphs: 676, lastDigraphs: 676});
const singleLetterPlant = Array.from({length: 26}, (_, i) => encryptWord([i]));
assert.equal(boundarySupport(singleLetterPlant).firstGlyphs, 26);

console.log(JSON.stringify({
  input: {
    originalUnsolvedRunes: original.length,
    originalCompleteWords: words.length,
    originalCrossPageWords: parsed.crossPageWords,
    sourceRegister: 'GP29 ciphertext; conditional Latin26 plaintext'
  },
  global: complete,
  rawLatinCapacity: {firstSymbol: 26, firstTwoSymbols: 676},
  chapters,
  wordLengthControls,
  positive: {
    wordLocalCausalPositionChangingPlant: true,
    firstSymbolSupport: plantedSupports.firstGlyphs,
    firstTwoSymbolSupport: plantedSupports.firstDigraphs,
    completeValidTwoLetterPlants: planted.length,
    inversionsCorrect: planted.length
  },
  decision: 'No single state reset at each authentic word or each of the first eight chapter word boundaries can map raw Latin26 prefixes causally to the original first rune; word-start state variation, future-letter mixing, or changed register/spacing is necessary.'
}, null, 2));
