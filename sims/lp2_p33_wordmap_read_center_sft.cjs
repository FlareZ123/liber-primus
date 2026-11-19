"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} base @param {number} exponent @returns {number} */
function pow29(base, exponent) {
  let result = 1;
  let value = mod29(base);
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * value) % 29;
    value = (value * value) % 29;
    power = Math.floor(power / 2);
  }
  return result;
}

/**
 * Parse printed words while preserving slash/line wrapping inside words.
 * @param {string} source
 * @returns {{start:number,values:number[]}[]}
 */
function parseWords(source) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  const flush = () => {
    if (!current.length) return;
    words.push({ start, values: current.slice() });
    current = [];
  };

  for (const character of source) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (character === "-" || character === "." || character === "&") {
      flush();
    } else if (character === "/" || /\s/u.test(character)) {
      // Physical line wrapping preserves a word.
    } else {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {number} physicalPage @returns {string} */
function physicalPart(physicalPage) {
  assert.ok(physicalPage >= 0 && physicalPage <= 55 && physicalPage !== 50);
  return parts[physicalPage <= 49 ? physicalPage : physicalPage - 1];
}

const e = 3;
const q = 4;
const wordExponent = 27;
const readGp = [4, 28, 23];
assert.equal(spell(readGp), "READ");

// The p33 first black body is the text after the first title period and
// before the section divider.
const p33 = physicalPart(33);
const firstUnit = p33.split("&")[0];
const firstChunks = firstUnit.split(".");
assert.ok(firstChunks.length >= 2);
const upperBodyWords = parseWords(firstChunks.slice(1).join("."));
assert.equal(upperBodyWords.length, 21);
assert.equal(upperBodyWords.reduce((sum, word) => sum + word.values.length, 0), e ** q);
assert.deepEqual(
  upperBodyWords.map((word) => word.values.length),
  [2, 9, 6, 3, 3, 5, 3, 2, 7, 3, 3, 6, 5, 8, 2, 3, 2, 2, 2, 3, 2]
);

// e^2=9 selects exactly one word inside the already selected 81-rune body.
const selected = upperBodyWords
  .map((word, index) => ({ ...word, bodyWord: index + 1 }))
  .filter((word) => word.values.length === e ** 2);
assert.equal(selected.length, 1);
assert.equal(selected[0].bodyWord, 2);
assert.deepEqual(selected[0].values, [0, 16, 18, 22, 28, 24, 27, 15, 6]);

// Exponent27 is the already authenticated p28 word exponent. It is
// self-inverse on GP29, including 0 under this positive exponent convention.
const transformed = selected[0].values.map((value) => pow29(value, wordExponent));
assert.deepEqual(transformed, [0, 20, 21, 4, 28, 23, 14, 2, 5]);
assert.deepEqual(
  transformed.map((value) => pow29(value, wordExponent)),
  selected[0].values
);

// Partition the e^2 word into e equal e-rune blocks. The unique inner block
// is exactly READ in native GP transliteration.
const blocks = Array.from({ length: e }, (_, block) =>
  transformed.slice(block * e, (block + 1) * e)
);
assert.deepEqual(blocks[1], readGp);
assert.deepEqual(blocks.map(spell), ["FLNG", "READ", "XTHC"]);

// Before exponentiation, the two outer e-rune thirds have the canonical GP0
// sums of the independently recovered clue words THEIR and HERE.
const THEIR_GP0 = 34;
const HERE_GP0 = 48;
assert.equal(selected[0].values.slice(0, e).reduce((sum, value) => sum + value, 0), THEIR_GP0);
assert.equal(selected[0].values.slice(2 * e).reduce((sum, value) => sum + value, 0), HERE_GP0);

// Manuscript-wide fixed control: every complete nine-rune unknown-page word,
// same exponent27, same central three-rune extraction.
let nineRuneWords = 0;
let leftTheirHits = 0;
let rightHereHits = 0;
let bothOuterHits = 0;
const centerReadHits = [];
const tripleHits = [];
for (let physicalPage = 0; physicalPage <= 55; physicalPage += 1) {
  if (physicalPage === 50) continue;
  const words = parseWords(physicalPart(physicalPage));
  for (let wordIndex = 0; wordIndex < words.length; wordIndex += 1) {
    const word = words[wordIndex];
    if (word.values.length !== e ** 2) continue;
    nineRuneWords += 1;
    const output = word.values.map((value) => pow29(value, wordExponent));
    const center = output.slice(e, 2 * e);
    const leftSum = word.values.slice(0, e).reduce((sum, value) => sum + value, 0);
    const rightSum = word.values.slice(2 * e).reduce((sum, value) => sum + value, 0);
    const isRead = center.every((value, index) => value === readGp[index]);
    if (leftSum === THEIR_GP0) leftTheirHits += 1;
    if (rightSum === HERE_GP0) rightHereHits += 1;
    if (leftSum === THEIR_GP0 && rightSum === HERE_GP0) bothOuterHits += 1;
    if (isRead) {
      centerReadHits.push({
        physicalPage,
        pageWord: wordIndex + 1,
        pageOffset: word.start,
        source: word.values,
        transformed: output,
      });
    }
    if (leftSum === THEIR_GP0 && rightSum === HERE_GP0 && isRead) {
      tripleHits.push({
        physicalPage,
        pageWord: wordIndex + 1,
        pageOffset: word.start,
      });
    }
  }
}
assert.equal(nineRuneWords, 77);
assert.equal(leftTheirHits, 2);
assert.equal(rightHereHits, 2);
assert.equal(bothOuterHits, 1);
assert.deepEqual(
  centerReadHits.map((hit) => [hit.physicalPage, hit.pageWord, hit.pageOffset]),
  [[33, 4, 12]]
);
assert.deepEqual(tripleHits, [{
  physicalPage: 33,
  pageWord: 4,
  pageOffset: 12,
}]);

// Symmetry check only: the p33 lower body has two length-nine words, and
// neither contains OUT under the analogous central/any-position exponent27
// reading. This prevents silently promoting READ into an unsupported full
// phrase.
const secondUnit = p33.split("&")[1];
const secondChunks = secondUnit.split(".");
const lowerBodyWords = parseWords(secondChunks.slice(1).join("."));
assert.equal(lowerBodyWords.length, 28);
assert.equal(lowerBodyWords.reduce((sum, word) => sum + word.values.length, 0), 115);
const outGp = [3, 1, 16];
const lowerNine = lowerBodyWords.filter((word) => word.values.length === e ** 2);
assert.equal(lowerNine.length, 2);
for (const word of lowerNine) {
  const output = word.values.map((value) => pow29(value, wordExponent));
  for (let start = 0; start + outGp.length <= output.length; start += 1) {
    assert.ok(!outGp.every((value, index) => output[start + index] === value));
  }
}

console.log(JSON.stringify({
  status: "PASS",
  sourceState: { e, q, upperBodyRunes: e ** q },
  selection: {
    uniqueUpperBodyLength: e ** 2,
    bodyWord: selected[0].bodyWord,
    pageWord: 4,
    pageOffset: selected[0].start + 10,
    sourceValues: selected[0].values,
  },
  transform: {
    exponent: wordExponent,
    transformedValues: transformed,
    transformedSymbols: transformed.map((value) => corpus.translit[value]),
    equalBlocks: blocks.map((block) => ({
      gp: block,
      text: spell(block),
    })),
    recoveredCenter: spell(blocks[1]),
  },
  control: {
    completeNineRuneWords: nineRuneWords,
    sourceOuterThirds: {
      leftTheirHits,
      rightHereHits,
      bothOuterHits,
      selectedLeftGp0: THEIR_GP0,
      selectedRightGp0: HERE_GP0,
    },
    exactTripleHits: tripleHits,
    exactCenterReadHits: centerReadHits.map((hit) => ({
      physicalPage: hit.physicalPage,
      pageWord: hit.pageWord,
      pageOffset: hit.pageOffset,
    })),
    lowerBodyNineRuneWords: lowerNine.length,
    analogousLowerOutHits: 0,
  },
  decision: "Strong source-constrained p33 upper-body plaintext candidate: the risen-THEIR route recovers [e,q]=[3,4] and selects the 81-rune body; its unique e^2=9 word has source outer-third GP0s THEIR=34 and HERE=48, and under the already authenticated p28 word exponent27 its central e=3 GP runes are R-EA-D = READ. Across all 77 complete nine-rune words, only two have left THEIR, two have right HERE, one has both outer identities, and that same sole word is the unique center READ hit. Preserve as a conditional plaintext recovery pending independent adjudication; do not infer OUT or a whole-body cipher.",
}, null, 2));
