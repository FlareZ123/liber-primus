"use strict";

/**
 * SFT: canonical cross-page audit of the authenticated source-number route.
 *
 * The manuscript has printed words that cross physical page boundaries.
 * This test keeps those words intact, excludes crossing words from page-local
 * ordinals, and then charges the complete 43-word signed-source diagonal.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/**
 * @param {number} base
 * @param {number} exponent
 * @param {number} modulus
 */
function modPow(base, exponent, modulus) {
  let result = 1;
  let b = base % modulus;
  let e = exponent;
  while (e > 0) {
    if (e % 2 === 1) result = (result * b) % modulus;
    b = (b * b) % modulus;
    e = Math.floor(e / 2);
  }
  return result;
}

/**
 * Outside-in H shell in visible pair order.
 *
 * @param {number[]} values
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

// P50 has no runes and therefore has no transcription segment. Segments
// 0..49 map directly; segments 50..54 map to project pages 51..55.
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
  for (const char of [...unknownSegments[segment]]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!currentWord.length) {
        startSegment = segment;
        startOffset = canonicalPages[segment].offset;
      }
      endSegment = segment;
      currentWord.push(value);
      canonicalPages[segment].offset += 1;
    } else if (char === "/" || /\s/u.test(char)) {
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
const pageWords = (page) => wordsByPage.get(page) || [];

assert.equal(crossingWordCount, 32);
assert.equal(canonicalWords.length, 2864);
assert.equal(canonicalWords.length + crossingWordCount, 2896);

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

const indexOf = (word) => {
  const row = source.find((candidate) => candidate.word === word);
  assert.ok(row, "missing source word " + word);
  return row.index;
};
const their = source
  .filter((row) => row.word === "THEIR")
  .map((row) => row.index);

const state = Object.freeze({
  p: indexOf("ROAD"),
  g: indexOf("EPIPHANY"),
  a: their[1] - their[0],
  b: indexOf("WORDS"),
  A: indexOf("DEVOTED"),
  B: their[0],
  K: indexOf("PATH"),
  e: indexOf("LIES"),
  q: indexOf("EMPTY"),
});
assert.deepEqual(state, {
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
  e: 3,
  q: 4,
});

// One-based signed ordinal n -> physical LP2 page n -> project page n-1
// -> complete page-local canonical word n.
const diagonal = source.map((row) => {
  const page = row.ordinal - 1;
  const words = pageWords(page);
  return {
    source: row,
    page,
    wordCount: words.length,
    object: words[row.ordinal - 1] || null,
  };
});

const missing = diagonal.filter((row) => !row.object);
assert.deepEqual(
  missing.map((row) => [
    row.source.ordinal,
    row.source.word,
    row.page,
    row.wordCount,
  ]),
  [[33, "YOU", 32, 21]]
);

// DIRECTION30 survives the canonical parser unchanged.
const direction = diagonal[29];
assert.equal(direction.source.word, "DIRECTION");
assert.equal(direction.object.ordinal, 30);
assert.equal(direction.object.start, 108);
assert.deepEqual(direction.object.values, [11, 26, 11, 18]);
assert.deepEqual(shell(direction.object.values), [22, 0, 15, 8]);

const groupOrder = shell(direction.object.values)[0];
const p = groupOrder + 1;
const b = shell(direction.object.values)[2];
const A = shell(direction.object.values)[3];
const K = modPow(A, b, p);
assert.equal(groupOrder, state.p - 1);
assert.equal(p, state.p);
assert.equal(b, state.b);
assert.equal(A, state.A);
assert.equal(K, state.K);

// The next two numbered objects under the cross-page-correct parser.
const seek = diagonal[30];
assert.equal(seek.source.word, "SEEK");
assert.equal(seek.object.ordinal, 31);
assert.equal(seek.object.start, 130);
assert.deepEqual(seek.object.values, [28, 4, 12]);

const and = diagonal[31];
assert.equal(and.source.word, "AND");
assert.equal(and.object.ordinal, 32);
assert.equal(and.object.start, 126);
assert.deepEqual(and.object.values, [state.K * state.a, state.p, 1]);
assert.deepEqual(and.object.values, [12, 23, 1]);

/**
 * Interpret GP values as authenticated signed-source indices.
 *
 * @param {number[]} values
 * @param {0|1} origin
 */
function lexicalize(values, origin) {
  return values.map((value) => {
    const index = origin === 0 ? value : value - 1;
    return index >= 0 && index < source.length ? source[index].word : null;
  });
}

assert.deepEqual(
  lexicalize(seek.object.values, 0),
  ["THE", "EMPTY", "THE"]
);
assert.deepEqual(
  lexicalize(and.object.values, 0),
  ["THE", "ROAD", "THE"]
);

/**
 * Find consecutive three-rune diagonal objects whose lexicalized outer
 * values are the same word in both objects and whose center changes.
 *
 * @param {0|1} origin
 */
function sameOuterTransitions(origin) {
  const hits = [];
  for (let index = 0; index + 1 < diagonal.length; index += 1) {
    const first = diagonal[index];
    const second = diagonal[index + 1];
    if (!first.object || !second.object) continue;
    if (first.object.values.length !== 3 || second.object.values.length !== 3) {
      continue;
    }

    const left = lexicalize(first.object.values, origin);
    const right = lexicalize(second.object.values, origin);
    if (
      left[0] !== null &&
      left[0] === left[2] &&
      right[0] === right[2] &&
      left[0] === right[0] &&
      left[1] !== right[1]
    ) {
      hits.push({
        sourceIndex: index,
        first: first.source.word,
        second: second.source.word,
        left,
        right,
        center: [left[1], right[1]],
      });
    }
  }
  return hits;
}

assert.deepEqual(sameOuterTransitions(0), [{
  sourceIndex: 30,
  first: "SEEK",
  second: "AND",
  left: ["THE", "EMPTY", "THE"],
  right: ["THE", "ROAD", "THE"],
  center: ["EMPTY", "ROAD"],
}]);
assert.deepEqual(sameOuterTransitions(1), []);

// The old p-1 wrap is rejected by canonical cross-page numbering.
const you = missing[0];
assert.equal(you.wordCount, 21);
assert.equal(groupOrder, 22);
assert.notEqual(you.wordCount, groupOrder);

const groupOrderWrappedOrdinal =
  ((you.source.ordinal - 1) % groupOrder) + 1;
const pageLengthWrappedOrdinal =
  ((you.source.ordinal - 1) % you.wordCount) + 1;
assert.equal(groupOrderWrappedOrdinal, 11);
assert.equal(pageLengthWrappedOrdinal, 12);
assert.notEqual(groupOrderWrappedOrdinal, pageLengthWrappedOrdinal);

// The previously cited five-rune packet remains present at offset59, but
// canonical cross-page numbering places it at word10 rather than word11.
const legacyPacket = pageWords(you.page).find((word) => word.start === 59);
assert.ok(legacyPacket);
assert.equal(legacyPacket.ordinal, 10);
assert.deepEqual(legacyPacket.values, [2, 7, 14, 27, 2]);
assert.notEqual(legacyPacket.ordinal, groupOrderWrappedOrdinal);

// Direct numbering resumes after the missing YOU coordinate.
assert.deepEqual(
  diagonal.slice(33, 36).map((row) => [
    row.source.word,
    row.source.ordinal,
    row.object.ordinal,
    row.object.start,
    row.object.values,
  ]),
  [
    ["WILL", 34, 34, 130, [12, 24]],
    ["BE", 35, 35, 148, [25, 14, 18, 9, 7]],
    ["FOUND", 36, 36, 164, [14, 5]],
  ]
);

// Whole-manuscript controls use complete page-local canonical words only.
const lengthCounts = new Map();
for (const word of canonicalWords) {
  lengthCounts.set(
    word.values.length,
    (lengthCounts.get(word.values.length) || 0) + 1
  );
}
assert.equal(lengthCounts.get(2), 448);
assert.equal(lengthCounts.get(3), 716);
assert.equal(lengthCounts.get(5), 311);

function exactHits(values) {
  return canonicalWords
    .filter(
      (word) =>
        word.values.length === values.length &&
        word.values.every((value, index) => value === values[index])
    )
    .map((word) => ({
      page: word.page,
      ordinal: word.ordinal,
      start: word.start,
    }));
}

assert.deepEqual(exactHits(seek.object.values), [
  {page: 8, ordinal: 15, start: 60},
  {page: 26, ordinal: 18, start: 79},
  {page: 30, ordinal: 31, start: 130},
]);
assert.deepEqual(exactHits(and.object.values), [
  {page: 31, ordinal: 32, start: 126},
]);

console.log("PASS canonical DIRECTION / SEEK AND numbered-route correction");
console.log(JSON.stringify({
  state,
  completeWords: canonicalWords.length,
  crossingWords: crossingWordCount,
  missing: missing.map((row) => ({
    ordinal: row.source.ordinal,
    word: row.source.word,
    projectPage: row.page,
    wordCount: row.wordCount,
  })),
  direction: {
    start: direction.object.start,
    values: direction.object.values,
    shell: shell(direction.object.values),
    groupOrder,
  },
  seekAnd: {
    seek: {
      start: seek.object.start,
      values: seek.object.values,
      lexical: lexicalize(seek.object.values, 0),
    },
    and: {
      start: and.object.start,
      values: and.object.values,
      lexical: lexicalize(and.object.values, 0),
    },
    transitions0: sameOuterTransitions(0),
    transitions1: sameOuterTransitions(1),
  },
  wrapRejection: {
    pageWordCount: you.wordCount,
    groupOrderWrappedOrdinal,
    pageLengthWrappedOrdinal,
    legacyPacketOrdinal: legacyPacket.ordinal,
  },
  controls: {
    twoRuneWords: lengthCounts.get(2),
    threeRuneWords: lengthCounts.get(3),
    fiveRuneWords: lengthCounts.get(5),
    seekHits: exactHits(seek.object.values),
    andHits: exactHits(and.object.values),
  },
}, null, 2));
