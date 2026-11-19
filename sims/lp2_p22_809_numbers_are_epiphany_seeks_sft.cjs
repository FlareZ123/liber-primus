"use strict";

/**
 * SFT: p22 emerged center 809 -> mirrored BASE29 -> NUMBERS ARE ->
 * numbered-route H -> EPIPHANY SEEKS.
 *
 * This test keeps the p0 ciphertext values out of candidate selection. It uses
 * only the authenticated 2016 source register, the canonical LP2
 * transcription, the source-linked 2014 5x5 square, and the already-fixed
 * outside-in H transform used by the numbered DIRECTION route.
 *
 * Node.js 22, CommonJS, read-only.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const M = 29;

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % M) + M) % M;
}

/**
 * Convert a nonnegative integer to canonical most-significant-first BASE29.
 *
 * @param {number} value
 * @returns {number[]}
 */
function base29(value) {
  return baseDigits(value, M);
}

/**
 * Convert a nonnegative integer to canonical most-significant-first digits.
 *
 * @param {number} value
 * @param {number} radix
 * @returns {number[]}
 */
function baseDigits(value, radix) {
  assert.ok(Number.isSafeInteger(value) && value >= 0);
  assert.ok(Number.isSafeInteger(radix) && radix >= 2);
  if (value === 0) return [0];

  const digits = [];
  let current = value;
  while (current > 0) {
    digits.unshift(current % radix);
    current = Math.floor(current / radix);
  }
  return digits;
}

/**
 * Interleaved outside-in H shell.
 *
 * @param {number[]} values
 * @returns {number[]}
 */
function shell(values) {
  const out = [];
  let left = 0;
  let right = values.length - 1;

  while (left < right) {
    out.push(
      mod29(values[left] - values[right]),
      mod29(values[left] + values[right])
    );
    left += 1;
    right -= 1;
  }

  if (left === right) out.push(values[left]);
  return out;
}

/**
 * Split H serialization: differences outside-in, odd center, sums inside-out.
 *
 * @param {number[]} values
 * @returns {number[]}
 */
function splitShell(values) {
  const differences = [];
  const sums = [];
  let left = 0;
  let right = values.length - 1;

  while (left < right) {
    differences.push(mod29(values[left] - values[right]));
    sums.push(mod29(values[left] + values[right]));
    left += 1;
    right -= 1;
  }

  return [
    ...differences,
    ...(left === right ? [values[left]] : []),
    ...sums.reverse(),
  ];
}

/**
 * True when every successive digit increases by exactly one.
 *
 * @param {number[]} values
 * @returns {boolean}
 */
function isAscendingConsecutive(values) {
  return values.length >= 2
    && values.every((value, index) =>
      index === 0 || value === values[index - 1] + 1
    );
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/**
 * Convert ordinary source spelling into canonical GP indices.
 *
 * @param {string} text
 * @returns {number[]}
 */
function gpText(text) {
  const normalized = text
    .toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const out = [];
  for (let index = 0; index < normalized.length;) {
    const token = gpTokens.find((row) =>
      normalized.startsWith(row.symbol, index)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(index));
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

// Parse the authenticated 2016 plaintext into its zero-based word register.
const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");

const source = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word, index) => ({
    index,
    ordinal: index + 1,
    word: word.toUpperCase(),
  }));

assert.equal(source.length, 43);
assert.equal(source[5].word, "EPIPHANY");
assert.equal(source[6].word, "SEEKS");
assert.equal(source[26].word, "NUMBERS");
assert.equal(source[27].word, "ARE");
assert.equal(source[29].word, "DIRECTION");

// The p22-linked original 2014 5x5 integer square.
const square = [
  [434, 1311, 312, 278, 966],
  [204, 812, 934, 280, 1071],
  [626, 620, 809, 620, 626],
  [1071, 280, 934, 812, 204],
  [966, 278, 312, 1311, 434],
];

assert.equal(square[2][2], 809);

// Recursively shedding the square's circumferences leaves the center 809.
// The p22 illustration is a mirrored reuse, so reverse the BASE29 digit order.
const centerDigits = base29(square[2][2]);
const mirroredCenterDigits = [...centerDigits].reverse();
assert.deepEqual(centerDigits, [27, 26]);
assert.deepEqual(mirroredCenterDigits, [26, 27]);
assert.deepEqual(
  mirroredCenterDigits.map((index) => source[index].word),
  ["NUMBERS", "ARE"]
);

// Charge every radix whose digits can all be literal indices into the 43-word
// authenticated source register. BASE29 is uniquely selected by the mirrored
// consecutive-index property, rather than chosen after reading the words.
const radixHits = [];
for (let radix = 2; radix <= source.length; radix += 1) {
  const canonical = baseDigits(square[2][2], radix);
  const mirrored = [...canonical].reverse();
  if (isAscendingConsecutive(mirrored)) {
    radixHits.push({radix, canonical, mirrored});
  }
}
assert.deepEqual(radixHits, [{
  radix: 29,
  canonical: [27, 26],
  mirrored: [26, 27],
}]);

// Charge the same complete representation on all 25 cells. The emerged center
// is the sole cell whose mirrored BASE29 digits form an ascending consecutive
// run in the authenticated source register.
const consecutiveCells = square
  .flat()
  .filter((value) => isAscendingConsecutive([...base29(value)].reverse()));
assert.deepEqual(consecutiveCells, [809]);

// Canonical cross-page parser. Printed line/page wraps can continue a word;
// only real punctuation ends it. Crossing words are excluded from page-local
// ordinals, matching the established numbered-route correction.
const parts = transcription.split(/^\s*%\s*$/m);
const unknownSegments = parts.slice(0, 55);
const canonicalPages = unknownSegments.map((text, segment) => ({
  page: segment >= 50 ? segment + 1 : segment,
  words: [],
  offset: 0,
}));

let currentWord = [];
let startSegment = 0;
let endSegment = 0;
let startOffset = 0;
let crossingWordCount = 0;

/** Flush the current canonical word into its page when page-local. */
function flushCanonicalWord() {
  if (!currentWord.length) return;

  if (startSegment === endSegment) {
    const page = canonicalPages[startSegment];
    page.words.push({
      ordinal: page.words.length + 1,
      start: startOffset,
      end: startOffset + currentWord.length - 1,
      values: currentWord.slice(),
    });
  } else {
    crossingWordCount += 1;
  }

  currentWord = [];
}

for (let segment = 0; segment < unknownSegments.length; segment += 1) {
  for (const character of [...unknownSegments[segment]]) {
    const value = runeIndex.get(character);

    if (value !== undefined) {
      if (!currentWord.length) {
        startSegment = segment;
        startOffset = canonicalPages[segment].offset;
      }
      endSegment = segment;
      currentWord.push(value);
      canonicalPages[segment].offset += 1;
    } else if (character === "/" || /\s/u.test(character)) {
      // Printed line and page wraps may continue a word.
    } else {
      flushCanonicalWord();
    }
  }
}
flushCanonicalWord();

const canonicalWords = canonicalPages.flatMap((page) =>
  page.words.map((word) => ({page: page.page, ...word}))
);
const wordsByPage = new Map(
  canonicalPages.map((page) => [page.page, page.words])
);

assert.equal(crossingWordCount, 32);
assert.equal(canonicalWords.length, 2864);
assert.equal(canonicalWords.length + crossingWordCount, 2896);

/**
 * Signed source index n has ordinal n+1. The established direction convention
 * sends that ordinal to physical LP2 page n and page-local word n+1.
 *
 * @param {number} sourceIndex
 * @returns {{
 *   source:{index:number,ordinal:number,word:string},
 *   page:number,
 *   object:{ordinal:number,start:number,end:number,values:number[]}
 * }}
 */
function directedObject(sourceIndex) {
  const sourceWord = source[sourceIndex];
  assert.ok(sourceWord);

  const page = sourceWord.ordinal - 1;
  const words = wordsByPage.get(page) || [];
  const object = words[sourceWord.ordinal - 1];
  assert.ok(object, "missing numbered object for " + sourceWord.word);

  return {source: sourceWord, page, object};
}

/**
 * Interpret GP values as zero-based authenticated source-word indices.
 *
 * @param {number[]} values
 * @returns {(string|null)[]}
 */
function lexicalize(values) {
  return values.map((value) => source[value]?.word || null);
}

// Provenance check: the same fixed H transform is already selected on the
// numbered DIRECTION object and reconstructs the established DH packet.
const direction = directedObject(29);
assert.equal(direction.page, 29);
assert.equal(direction.object.ordinal, 30);
assert.deepEqual(shell(direction.object.values), [22, 0, 15, 8]);
assert.deepEqual(splitShell(direction.object.values), [22, 15, 8, 0]);

// Follow the newly emitted source words NUMBERS ARE as directions.
const numbers = directedObject(26);
assert.equal(numbers.page, 26);
assert.equal(numbers.object.ordinal, 27);
assert.equal(numbers.object.start, 123);
assert.deepEqual(numbers.object.values, [2, 6, 11]);
assert.deepEqual(shell(numbers.object.values), [20, 13, 6]);
assert.deepEqual(
  lexicalize(shell(numbers.object.values)),
  ["MEANING", "WAY", "SEEKS"]
);

const are = directedObject(27);
assert.equal(are.page, 27);
assert.equal(are.object.ordinal, 28);
assert.equal(are.object.start, 111);
assert.deepEqual(are.object.values, [0, 20, 15, 1]);
assert.deepEqual(shell(are.object.values), [28, 1, 5, 6]);
assert.deepEqual(
  lexicalize(shell(are.object.values)),
  ["THE", "THE", "EPIPHANY", "SEEKS"]
);
assert.deepEqual(shell(are.object.values).slice(-2), [5, 6]);
assert.deepEqual(splitShell(are.object.values), [28, 5, 6, 1]);
assert.deepEqual(
  lexicalize(splitShell(are.object.values).slice(1, 3)),
  ["EPIPHANY", "SEEKS"]
);

// Census the numbered objects available through the source register under both
// live ordered H serializations. The exact ordered pair [5,6] occurs only in
// ARE27's directed object under each serialization.
const pairHits = {Hpair: [], Hsplit: []};
for (let sourceIndex = 0; sourceIndex < source.length; sourceIndex += 1) {
  const sourceWord = source[sourceIndex];
  const page = sourceWord.ordinal - 1;
  const words = wordsByPage.get(page) || [];
  const object = words[sourceWord.ordinal - 1];
  if (!object) continue;

  for (const [name, transformed] of [
    ["Hpair", shell(object.values)],
    ["Hsplit", splitShell(object.values)],
  ]) {
    for (let index = 0; index + 1 < transformed.length; index += 1) {
      if (transformed[index] === 5 && transformed[index + 1] === 6) {
        pairHits[name].push({
          sourceIndex,
          sourceWord: sourceWord.word,
          page,
          ordinal: object.ordinal,
          start: object.start,
          pairIndex: index,
          terminal: index + 2 === transformed.length,
        });
      }
    }
  }
}

assert.deepEqual(pairHits.Hpair, [{
  sourceIndex: 27,
  sourceWord: "ARE",
  page: 27,
  ordinal: 28,
  start: 111,
  pairIndex: 2,
  terminal: true,
}]);
assert.deepEqual(pairHits.Hsplit, [{
  sourceIndex: 27,
  sourceWord: "ARE",
  page: 27,
  ordinal: 28,
  start: 111,
  pairIndex: 1,
  terminal: false,
}]);

// Independent p0 shape control. No p0 ciphertext values are used. The emitted
// source pair is the sole adjacent authenticated source pair with GP lengths
// 8+5, matching the physical p0 title word lengths.
const adjacent85 = [];
for (let index = 0; index + 1 < source.length; index += 1) {
  const leftLength = gpText(source[index].word).length;
  const rightLength = gpText(source[index + 1].word).length;
  if (leftLength === 8 && rightLength === 5) {
    adjacent85.push([
      source[index].index,
      source[index].word,
      source[index + 1].index,
      source[index + 1].word,
    ]);
  }
}
assert.deepEqual(adjacent85, [[5, "EPIPHANY", 6, "SEEKS"]]);

const p0Words = wordsByPage.get(0);
assert.ok(p0Words);
assert.equal(p0Words[0].values.length, 8);
assert.equal(p0Words[1].values.length, 5);

console.log("PASS p22 809 -> NUMBERS ARE -> EPIPHANY SEEKS source route");
console.log(JSON.stringify({
  sourceSelection: {
    center: 809,
    base29: centerDigits,
    mirroredBase29: mirroredCenterDigits,
    mirroredWords: lexicalize(mirroredCenterDigits),
    radixHits,
    consecutiveSquareCells: consecutiveCells,
  },
  transformProvenance: {
    direction29: {
      page: direction.page,
      ordinal: direction.object.ordinal,
      shell: shell(direction.object.values),
    },
  },
  directions: {
    numbers26: {
      page: numbers.page,
      ordinal: numbers.object.ordinal,
      start: numbers.object.start,
      raw: numbers.object.values,
      shell: shell(numbers.object.values),
      lexical: lexicalize(shell(numbers.object.values)),
    },
    are27: {
      page: are.page,
      ordinal: are.object.ordinal,
      start: are.object.start,
      raw: are.object.values,
      Hpair: shell(are.object.values),
      HpairLexical: lexicalize(shell(are.object.values)),
      Hsplit: splitShell(are.object.values),
      HsplitPairLexical: lexicalize(splitShell(are.object.values).slice(1, 3)),
    },
  },
  pairHits,
  p0ShapeControl: {
    adjacent85,
    p0FirstTwoWordLengths: [
      p0Words[0].values.length,
      p0Words[1].values.length,
    ],
  },
  decision:
    "The p22 center independently source-routes EPIPHANY SEEKS without "
    + "consulting p0 ciphertext values. The [5,6] pair survives both live "
    + "ordered H serializations; the p0 13-atom key order remains a separate "
    + "unresolved provenance question.",
}, null, 2));
