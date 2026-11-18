"use strict";

/**
 * SFT: the signed 2016 carrier's prime dimension ordinals bridge the
 * independently selected p0 THE ROAD receiver and the existing p50 3QO route.
 *
 * Run:
 *   node sims/lp2_2016_prime_ordinals_p0_road_3qo_bridge_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r\n/g, "\n");
}

/** @param {string} relative @returns {Buffer} */
function readBuffer(relative) {
  return fs.readFileSync(path.join(ROOT, relative));
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const carrier = readBuffer("resources/historical/cicada2016-4gq25.jpg");

/** @param {number} count @returns {number} */
function nthPrime(count) {
  let seen = 0;
  for (let n = 2; ; n += 1) {
    let prime = true;
    for (let d = 2; d * d <= n; d += 1) {
      if (n % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime && ++seen === count) return n;
  }
}

/** @param {Buffer} jpeg @returns {{width:number,height:number}} */
function jpegSize(jpeg) {
  assert.equal(jpeg[0], 0xff);
  assert.equal(jpeg[1], 0xd8);
  let offset = 2;
  while (offset < jpeg.length) {
    assert.equal(jpeg[offset], 0xff);
    while (jpeg[offset] === 0xff) offset += 1;
    const marker = jpeg[offset++];
    if (marker === 0xd9 || marker === 0xda) break;
    const length = jpeg.readUInt16BE(offset);
    const isSof = [
      0xc0, 0xc1, 0xc2, 0xc3,
      0xc5, 0xc6, 0xc7,
      0xc9, 0xca, 0xcb,
      0xcd, 0xce, 0xcf,
    ].includes(marker);
    if (isSof) {
      return {
        height: jpeg.readUInt16BE(offset + 3),
        width: jpeg.readUInt16BE(offset + 5),
      };
    }
    offset += length;
  }
  assert.fail("JPEG SOF marker missing");
}

const image = jpegSize(carrier);
assert.deepEqual(image, {width: 563, height: 569});
assert.deepEqual([nthPrime(103), nthPrime(104)], [image.width, image.height]);

// The original p32 11x11 square independently reproduces the two dimensions.
const p32 = corpus.pages.find((page) => page.page === 32).indices;
assert.equal(p32.length, 121);
const firstRowPrimeSum = p32.slice(0, 11)
  .reduce((sum, value) => sum + corpus.prime[value], 0);
const firstColumnPrimeSum = Array.from({length: 11}, (_, row) => p32[11 * row])
  .reduce((sum, value) => sum + corpus.prime[value], 0);
assert.deepEqual([firstRowPrimeSum, firstColumnPrimeSum], [563, 569]);

const tokenRows = corpus.translit
  .map((token, index) => [token, index])
  .sort((left, right) => right[0].length - left[0].length);

/** @param {string} original @returns {number[]} */
function encodeWord(original) {
  const normalized = original.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (let position = 0; position < normalized.length;) {
    const row = tokenRows.find(([token]) => normalized.startsWith(token, position));
    assert(row, `cannot encode ${original} at ${position}`);
    out.push(row[1]);
    position += row[0].length;
  }
  return out;
}

/** @param {string} word @returns {number} */
function gp0(word) {
  return encodeWord(word).reduce((sum, value) => sum + value, 0);
}

// Extract only the authenticated cleartext, excluding numeric/hex tokens.
const signedBody = signed2016
  .slice(signed2016.indexOf("Hello."), signed2016.indexOf("-----BEGIN PGP SIGNATURE-----"))
  .replace(/\b[0-9A-F]{8}\b/g, "")
  .replace(/\b\d+\b/g, "");
const signedWords = (signedBody.match(/[A-Za-z]+/g) || [])
  .map((word, index) => ({
    index,
    word: word.toUpperCase(),
    runes: encodeWord(word),
    gp0: gp0(word),
  }));
assert.equal(signedWords.length, 43);
assert.deepEqual(
  signedWords.slice(3, 9).map((row) => row.word),
  ["LIES", "EMPTY", "EPIPHANY", "SEEKS", "THE", "DEVOTED"]
);

// Parse original p0 word boundaries from the canonical transcription.
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const p0Source = transcription.split("%")[0];
const p0Words = [];
let runeOffset = 0;
let start = null;
let values = [];
function flushWord() {
  if (start === null) return;
  p0Words.push({
    index: p0Words.length,
    start,
    end: runeOffset - 1,
    length: runeOffset - start,
    values: [...values],
  });
  start = null;
  values = [];
}
for (const ch of [...p0Source]) {
  const value = runeIndex.get(ch);
  if (value !== undefined) {
    if (start === null) start = runeOffset;
    values.push(value);
    runeOffset += 1;
  } else if ("-.$&§".includes(ch)) {
    flushWord();
  }
}
flushWord();
assert.equal(runeOffset, 262);
assert.equal(p0Words.length, 59);

// Reproduce the previously frozen signed-word pointer census for THE ROAD.
const seeks = signedWords.find((row) => row.word === "SEEKS");
const followingThe = signedWords[seeks.index + 1];
assert.equal(followingThe.word, "THE");
const pointerBoundaries = [
  table.bytes[seeks.gp0],
  table.bytes[followingThe.gp0],
].sort((left, right) => left - right);
assert.deepEqual(pointerBoundaries, [102, 108]);

const enclosed = p0Words.filter(
  (word) => word.start > pointerBoundaries[0] && word.end <= pointerBoundaries[1]
);
assert.deepEqual(
  enclosed.map((word) => [word.start, word.end, word.length]),
  [[103, 104, 2], [105, 108, 4]]
);

const lengthVector = enclosed.map((word) => word.length);
const phraseMatches = [];
for (let i = 0; i + lengthVector.length <= signedWords.length; i += 1) {
  const phrase = signedWords.slice(i, i + lengthVector.length);
  const lengths = phrase.map((row) => row.runes.length);
  if (lengths.every((value, j) => value === lengthVector[j])) {
    phraseMatches.push(phrase.map((row) => row.word).join(" "));
  }
}
assert.deepEqual(phraseMatches, ["THE ROAD"]);

// The independently selected THE occupies exactly the signed image's two prime
// dimension ordinals when p0 uses its native zero-based rune offsets.
const selectedThe = enclosed[0];
assert.deepEqual([selectedThe.start, selectedThe.end], [103, 104]);
assert.deepEqual(
  [selectedThe.start, selectedThe.end],
  [103, 104]
);

// The image-selected THE also supplies a value-changing cryptographic holdout.
// Derive the native-GP plaintext from the authenticated signed word rather than
// spelling it rune by rune.
const plainThe = encodeWord("THE");
assert.deepEqual(plainThe, [2, 18]);
assert.deepEqual(selectedThe.values, [8, 12]);
const additiveKey = selectedThe.values.map(
  (cipher, index) => (cipher - plainThe[index] + 29) % 29
);
assert.deepEqual(additiveKey, [6, 23]);

// Independently re-derive the manuscript's DH p/a values from the already
// source-selected p28 physical object. FIND points to page/word 28; physical
// line6 is 23 runes long and ends with word28, so a=6 and p=23.
assert.equal(gp0("FIND"), 42);
assert.equal(table.bytes[42], 28);
const physicalParts = transcription.split(/^\s*%\s*$/m);
const p28Text = physicalParts[28];
const p28Lines = p28Text.trim().split("/").filter((line) => line.trim().length > 0);
const p28Words = (p28Text.replace(/\/\s*/gu, "").match(/[\u16A0-\u16FF]+/gu) || []);
assert.equal(p28Words.length, 59);
const selectedP28Word = [...p28Words[27]].map((rune) => runeIndex.get(rune));
assert.equal(selectedP28Word.length, 5);
const selectedP28LineNumber = 6;
const selectedP28LineRunes = [...p28Lines[selectedP28LineNumber - 1]]
  .map((rune) => runeIndex.get(rune))
  .filter((value) => value !== undefined);
const dhA = selectedP28LineNumber;
const dhP = selectedP28LineRunes.length;
assert.deepEqual([dhA, dhP], [6, 23]);
assert.deepEqual(additiveKey, [dhA, dhP]);

// Finite manuscript control: [H,EO] is the sole complete two-rune word across
// unsolved p0..p55. It occurs at this already selected p0 receiver.
const completeTwoRuneMatches = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const part = physicalParts[page];
  const words = (part.replace(/\/\s*/gu, "").match(/[\u16A0-\u16FF]+/gu) || []);
  let localOffset = 0;
  for (const word of words) {
    const wordValues = [...word].map((rune) => runeIndex.get(rune));
    if (wordValues.length === 2 && wordValues[0] === 8 && wordValues[1] === 12) {
      completeTwoRuneMatches.push({page, start: localOffset});
    }
    localOffset += wordValues.length;
  }
}
assert.deepEqual(completeTwoRuneMatches, [{page: 0, start: 103}]);

// The same integer ordinals, used as one-based p50 cells as in the established
// cross-release route, reconstruct the signed 2013 BASE29 example 3QO=3301.
const cell103 = table.pages.flatMap((page) => page.tokens)[102];
const cell104 = table.pages.flatMap((page) => page.tokens)[103];
assert.deepEqual([cell103, cell104], ["0W", "3Q"]);
assert.deepEqual([table.bytes[102], table.bytes[103]], [32, 206]);
const suffix = corpus.translit[table.bytes[102] % 29];
assert.equal(suffix, "O");
const base29Text = cell104 + suffix;
assert.equal(base29Text, "3QO");
const digitAlphabet = table.alphabet;
const base29Value = [...base29Text].reduce((value, digit) => {
  const index = digitAlphabet.indexOf(digit);
  assert(index >= 0 && index < 29);
  return 29 * value + index;
}, 0);
assert.equal(base29Value, 3301);

// Fixed earlier-image control from the same prime-ordinal program.
assert.deepEqual([nthPrime(96), nthPrime(97)], [503, 509]);
const controlWord = p0Words.find((word) => word.start <= 96 && word.end >= 97);
assert(controlWord);
assert.deepEqual([controlWord.start, controlWord.end, controlWord.length], [95, 102, 8]);
assert.equal(
  p0Words.some((word) => word.start === 96 && word.end === 97),
  false
);

// There are seven two-rune p0 ciphertext words. The 2016 pair selects exactly
// the one already identified prospectively as THE by the pointer census.
const twoRuneWords = p0Words.filter((word) => word.length === 2);
assert.equal(twoRuneWords.length, 7);
assert.deepEqual(
  twoRuneWords.filter((word) => word.start === 103 && word.end === 104)
    .map((word) => word.index),
  [21]
);

process.stdout.write(JSON.stringify({
  classification: "cross-source navigation holdout",
  signed2016Image: image,
  primeOrdinals: [103, 104],
  p32PrimeSums: [firstRowPrimeSum, firstColumnPrimeSum],
  pointerBoundaries,
  uniqueSignedLengthMatch: phraseMatches,
  p0PredictedThe: {
    wordIndex: selectedThe.index,
    offsets: [selectedThe.start, selectedThe.end],
    cipher: selectedThe.values.map((value) => translit[value]),
    plaintext: plainThe.map((value) => translit[value]),
    additiveKey,
    independentlyDerivedDH: {a: dhA, p: dhP},
    completeTwoRuneCipherMatches: completeTwoRuneMatches,
  },
  p50OrdinalCells: {
    oneBased: [103, 104],
    tokens: [cell103, cell104],
    bytes: [table.bytes[102], table.bytes[103]],
    reconstructedBase29: base29Text,
    value: base29Value,
  },
  earlierImageControl: {
    primeOrdinals: [96, 97],
    p0ContainingWord: [controlWord.start, controlWord.end, controlWord.length],
  },
  p0TwoRuneWordCount: twoRuneWords.length,
  decision:
    "The signed 2016 carrier's prime dimension ordinals 103/104 independently coincide with the exact p0 two-rune receiver predicted as THE in THE ROAD, while the same ordinals already reconstruct p50 3QO=3301. This strengthens the navigation interpretation but does not identify the p0 value-changing cipher.",
}, null, 2) + "\n");
