'use strict';

/**
 * Original-cipher SFT: source-word prime sum chooses its own eight-way p50 grid walk.
 *
 * Decoder interpretation (frozen, direct): choose a 00 cell as the word's
 * starting coordinate; one of eight toroidal compass directions is chosen by
 * the unknown plaintext word's GP-prime sum modulo eight. The word's cipher
 * runes are GP29 additions/subtractions of original table bytes reduced mod29.
 *
 * No guessed English words or fitted keys enter the original-input test.
 * Run with Node 22: node sims/lp2_wordvalue_selfreferential_p50_compass_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, 'resources', 'liber-primus', file), 'utf8');
const corpus = JSON.parse(read('lp2-corpus.json'));
const grid = JSON.parse(read('lp2-grid-256.json'));
const transcription = read('lp2-transcription.txt');
const alphabet = new Map(corpus.runes.map((rune, index) => [rune, index]));
const compass = [
  [-1, 0], [-1, 1], [0, 1], [1, 1],
  [1, 0], [1, -1], [0, -1], [-1, -1],
];

/**
 * Convert a complete printed word into source GP ordinal positions.
 * @param {string} text
 * @returns {number[]}
 */
function wordIndices(text) {
  return [...text].filter((glyph) => alphabet.has(glyph)).map((glyph) => alphabet.get(glyph));
}

/** @type {string[]} */
const physicalSections = transcription.split('%');
assert.equal(physicalSections.length, 57);
const unsolvedText = physicalSections.slice(0, 55).join('').replace(/[\/\r\n&$]/g, '');
const words = unsolvedText.split(/[-.]/).map(wordIndices).filter((word) => word.length > 0);
const sourceIndices = corpus.pages
  .filter((page) => page.page <= 55 && page.indices.length)
  .flatMap((page) => page.indices);
assert.equal(words.length, 2896);
assert.equal(sourceIndices.length, 12956);
assert.deepEqual(words.flat(), sourceIndices);
assert.equal(grid.bytes.length, 256);
assert.equal(grid.bytes[192], 0);
assert.equal(grid.bytes[229], 0);
assert.equal(grid.bytes.filter((byte) => byte === 0).length, 2);

/**
 * A source-word-dependent eight-way direction, determined by plaintext.
 * @param {number[]} word
 * @returns {number}
 */
function direction(word) {
  let sum = 0;
  for (const rune of word) sum += corpus.prime[rune];
  return sum % 8;
}

/**
 * Get the exact table key positions from a frozen 32-by-8 toroidal walk.
 * @param {number} length
 * @param {number} compassIndex
 * @param {number} anchor
 * @param {boolean} anchorFirst
 * @returns {number[]}
 */
function keys(length, compassIndex, anchor, anchorFirst) {
  const [dr, dc] = compass[compassIndex];
  let row = Math.floor(anchor / 8);
  let col = anchor % 8;
  const output = [];
  for (let i = 0; i < length; i++) {
    if (!anchorFirst) {
      row = (row + dr + 32) % 32;
      col = (col + dc + 8) % 8;
    }
    output.push(grid.bytes[row * 8 + col] % 29);
    if (anchorFirst) {
      row = (row + dr + 32) % 32;
      col = (col + dc + 8) % 8;
    }
  }
  return output;
}

/**
 * The direct candidate inverse P = C + sign*K mod29.
 * @param {number[]} cipher
 * @param {number} compassIndex
 * @param {{anchor:number,sign:number,anchorFirst:boolean}} mode
 * @returns {number[]}
 */
function decode(cipher, compassIndex, mode) {
  const key = keys(cipher.length, compassIndex, mode.anchor, mode.anchorFirst);
  return cipher.map((rune, i) => (rune + mode.sign * key[i] + 29) % 29);
}

/**
 * Inverse forward mapping for a plaintext-selected direction.
 * @param {number[]} plain
 * @param {{anchor:number,sign:number,anchorFirst:boolean}} mode
 * @returns {number[]}
 */
function encode(plain, mode) {
  const key = keys(plain.length, direction(plain), mode.anchor, mode.anchorFirst);
  return plain.map((rune, i) => (rune - mode.sign * key[i] + 29) % 29);
}

/**
 * Count candidate directions that agree with the decoded plaintext word.
 * @param {number[]} cipher
 * @param {{anchor:number,sign:number,anchorFirst:boolean}} mode
 * @returns {number[]}
 */
function fixedPoints(cipher, mode) {
  const valid = [];
  for (let compassIndex = 0; compassIndex < 8; compassIndex++) {
    if (direction(decode(cipher, compassIndex, mode)) === compassIndex) valid.push(compassIndex);
  }
  return valid;
}

const clearWords = physicalSections[56].replace(/[\/\r\n&$]/g, '')
  .split(/[-.]/).map(wordIndices).filter((word) => word.length > 0);
assert.equal(clearWords.flat().length, 95);

const observations = [];
for (const anchor of [192, 229]) {
  for (const sign of [-1, 1]) {
    for (const anchorFirst of [false, true]) {
      const mode = { anchor, sign, anchorFirst };
      let none = 0;
      let one = 0;
      let multiple = 0;
      let total = 0;
      let max = 0;
      const firstInconsistent = [];
      for (let w = 0; w < words.length; w++) {
        const candidate = fixedPoints(words[w], mode);
        total += candidate.length;
        max = Math.max(max, candidate.length);
        if (candidate.length === 0) {
          none++;
          if (firstInconsistent.length < 5) firstInconsistent.push({ wordIndex: w, length: words[w].length });
        } else if (candidate.length === 1) {
          one++;
        } else {
          multiple++;
        }
        for (const idx of candidate) {
          assert.deepEqual(encode(decode(words[w], idx, mode), mode), words[w]);
        }
      }
      for (const plain of clearWords) {
        const cipher = encode(plain, mode);
        const selected = direction(plain);
        assert.ok(fixedPoints(cipher, mode).includes(selected));
        assert.deepEqual(decode(cipher, selected, mode), plain);
      }
      assert.equal(none + one + multiple, words.length);
      assert.ok(none > 0);
      observations.push({ anchor, sign, anchorFirst, noDirection: none,
        uniqueDirection: one, ambiguousDirection: multiple,
        totalFixedPoints: total, maximumPerWord: max, firstInconsistent });
    }
  }
}
assert.deepEqual(observations.map((item) => item.noDirection),
  [950, 936, 930, 977, 927, 934, 935, 904]);

// Independently source-shaped address test: the chapter with red LPAD initials
// has exactly 255 printed words, so word ordinals 1..255 naturally occupy
// all nonzero addresses of the 256-cell table (0 is the unfilled sentinel).
// The conventional alternate zero-based word index is also tested.
const chapterText = physicalSections.slice(3, 8).join('').replace(/[\/\r\n&$]/g, '');
const chapterWords = chapterText.split(/[-.]/).map(wordIndices).filter((word) => word.length > 0);
assert.equal(chapterWords.length, 255);
assert.equal(chapterWords.flat().length, 1145);
const chapterObservations = [];
for (const ordinalStart of [0, 1]) {
  for (const sign of [-1, 1]) {
    for (const anchorFirst of [false, true]) {
      let none = 0;
      let one = 0;
      let multiple = 0;
      for (let w = 0; w < chapterWords.length; w++) {
        const mode = { anchor: (w + ordinalStart) % 256, sign, anchorFirst };
        const candidate = fixedPoints(chapterWords[w], mode);
        if (candidate.length === 0) none++;
        else if (candidate.length === 1) one++;
        else multiple++;
        for (const idx of candidate) {
          assert.deepEqual(encode(decode(chapterWords[w], idx, mode), mode), chapterWords[w]);
        }
      }
      for (let w = 0; w < clearWords.length; w++) {
        const mode = { anchor: (w + ordinalStart) % 256, sign, anchorFirst };
        const plain = clearWords[w];
        const cipher = encode(plain, mode);
        assert.ok(fixedPoints(cipher, mode).includes(direction(plain)));
        assert.deepEqual(decode(cipher, direction(plain), mode), plain);
      }
      assert.equal(none + one + multiple, 255);
      chapterObservations.push({
        ordinalStart, sign, anchorFirst,
        noDirection: none, uniqueDirection: one, ambiguousDirection: multiple,
      });
    }
  }
}
assert.deepEqual(chapterObservations.map((item) => item.noDirection),
  [85, 73, 90, 74, 88, 90, 81, 77]);

console.log(JSON.stringify({
  source: 'original LP2 p0-p55 (12,956 GP runes / 2,896 printed words)',
  candidate: 'per-word plaintext GP-prime sum mod8 selects p50 toroidal walk direction',
  table: 'original 256-token base60 interpretation; zero anchors 192 and 229',
  nativePositive: 'all original 95 clear p57 rune positions encoded and recovered in each mode',
  observations,
  chapterSource: "p3-p7 LPAD-initial chapter, 255 printed words / 1,145 runes; each word ordinal maps to one of the 256 table cells",
  chapterObservations,
}, null, 2));
