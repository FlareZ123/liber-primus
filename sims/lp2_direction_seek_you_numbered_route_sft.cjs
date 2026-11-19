"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
const readJson = (relative) => JSON.parse(read(relative));

const corpus = readJson("resources/liber-primus/lp2-corpus.json");
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
  let result = 1 % modulus;
  let x = ((base % modulus) + modulus) % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = (result * x) % modulus;
    x = (x * x) % modulus;
    e = Math.floor(e / 2);
  }
  return result;
}

/**
 * Canonical unknown-word parser. Printed line wraps and physical page breaks
 * may continue a word. Retain only words wholly contained on one unknown page.
 */
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

function flushCanonicalWord() {
  if (!currentWord.length) return;
  if (startSegment === endSegment) {
    const page = canonicalPages[startSegment];
    page.words.push({
      index: page.words.length,
      ordinal: page.words.length + 1,
      start: startOffset,
      end: startOffset + currentWord.length - 1,
      values: currentWord.slice(),
    });
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
      // Printed line/page wrap can continue a word.
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
function pageWords(page) {
  return wordsByPage.get(page) || [];
}

/**
 * Outside-in H shell in visible pair order:
 * H(first,last), H(second,penultimate), ..., odd center literal.
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

// Fixed source state and authored rise.
const indexOf = (word) => {
  const row = source.find((candidate) => candidate.word === word);
  assert.ok(row, "missing source word " + word);
  return row.index;
};
const their = source
  .filter((row) => row.word === "THEIR")
  .map((row) => row.index);
assert.deepEqual(their, [19, 25]);

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

// Source-number diagonal: one-based source ordinal n -> physical LP2 page n
// (project page n-1) -> canonical local word n.
const diagonal = source.map((row) => {
  const page = row.ordinal - 1;
  const words = pageWords(page);
  const object = words[row.ordinal - 1] || null;
  return {
    source: row,
    page,
    wordCount: words.length,
    object,
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
  [[33, "YOU", 32, 22]]
);

// DIRECTION30 is the numeric calibrator.
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

// The next two source-numbered objects were not used to derive the formulas.
const seek = diagonal[30];
assert.equal(seek.source.word, "SEEK");
assert.equal(seek.object.ordinal, 31);
assert.equal(seek.object.start, 127);
assert.deepEqual(seek.object.values, [
  state.p - 1,
  state.K * state.a,
  state.p - 1,
]);
assert.deepEqual(seek.object.values, [22, 12, 22]);
assert.deepEqual(shell(seek.object.values), [0, state.b, state.K * state.a]);

const and = diagonal[31];
assert.equal(and.source.word, "AND");
assert.equal(and.object.ordinal, 32);
assert.equal(and.object.start, 126);
assert.deepEqual(and.object.values, [state.K * state.a, state.p, 1]);
assert.deepEqual(and.object.values, [12, 23, 1]);

// Reuse the already fixed zero-based signed-word convention as a literal
// number-to-word readout. Each GP rune value is an authenticated source
// index in the first 29 positions.
function lexicalize(values, origin) {
  return values.map((value) => {
    const index = origin === 0 ? value : value - 1;
    return index >= 0 && index < source.length ? source[index].word : null;
  });
}

assert.deepEqual(lexicalize(seek.object.values, 0), ["THE", "THE", "THE"]);
assert.deepEqual(lexicalize(and.object.values, 0), ["THE", "ROAD", "THE"]);

function lexicalTransitions(origin) {
  const hits = [];
  for (let index = 0; index + 1 < diagonal.length; index += 1) {
    const first = diagonal[index];
    const second = diagonal[index + 1];
    if (!first.object || !second.object) continue;
    if (first.object.values.length !== 3 || second.object.values.length !== 3) continue;

    const left = lexicalize(first.object.values, origin);
    const right = lexicalize(second.object.values, origin);
    const x = left[0];
    if (
      x !== null &&
      left.every((word) => word === x) &&
      right[0] === x &&
      right[2] === x &&
      right[1] !== null &&
      right[1] !== x
    ) {
      hits.push({
        sourceIndex: index,
        first: first.source.word,
        second: second.source.word,
        left,
        right,
        extracted: [x, right[1]],
      });
    }
  }
  return hits;
}

assert.deepEqual(lexicalTransitions(0), [{
  sourceIndex: 30,
  first: "SEEK",
  second: "AND",
  left: ["THE", "THE", "THE"],
  right: ["THE", "ROAD", "THE"],
  extracted: ["THE", "ROAD"],
}]);
assert.deepEqual(lexicalTransitions(1), []);

// YOU33 is the sole missing direct coordinate. Its physical page has exactly
// the group order number of words, so use one one-based cyclic reduction.
const you = missing[0];
assert.equal(you.source.ordinal, 33);
assert.equal(you.wordCount, groupOrder);
const wrappedOrdinal = ((you.source.ordinal - 1) % groupOrder) + 1;
assert.equal(wrappedOrdinal, 11);

const youObject = pageWords(you.page)[wrappedOrdinal - 1];
assert.equal(youObject.ordinal, 11);
assert.equal(youObject.start, 59);
assert.deepEqual(youObject.values, [
  state.K,
  state.g + state.K,
  mod29(-state.b),
  mod29(-state.K),
  state.K,
]);
assert.deepEqual(youObject.values, [2, 7, 14, 27, 2]);
assert.deepEqual(shell(youObject.values), [
  0,
  state.q,
  state.b - state.a,
  state.g,
  mod29(-state.b),
]);
assert.deepEqual(shell(youObject.values), [0, 4, 9, 5, 14]);

// After the single YOU wrap, the direct source-number diagonal resumes.
for (const ordinal of [34, 35, 36]) {
  assert.ok(diagonal[ordinal - 1].object);
}
assert.deepEqual(
  diagonal.slice(33, 36).map((row) => [
    row.source.word,
    row.source.ordinal,
    row.object.ordinal,
    row.object.start,
  ]),
  [
    ["WILL", 34, 34, 130],
    ["BE", 35, 35, 144],
    ["FOUND", 36, 36, 164],
  ]
);

// Exact-packet manuscript controls for the new numbered objects.
const packets = [
  {name: "SEEK", values: seek.object.values},
  {name: "AND", values: and.object.values},
  {name: "YOU_WRAP", values: youObject.values},
];

const packetHits = new Map(packets.map((packet) => [packet.name, []]));
const lengthCounts = new Map();

for (const word of canonicalWords) {
    lengthCounts.set(
      word.values.length,
      (lengthCounts.get(word.values.length) || 0) + 1
    );

    for (const packet of packets) {
      if (
        word.values.length === packet.values.length &&
        word.values.every((value, index) => value === packet.values[index])
      ) {
        packetHits.get(packet.name).push({
          page,
          ordinal: word.ordinal,
          start: word.start,
        });
      }
    }
}

assert.equal(lengthCounts.get(3), 722);
assert.equal(lengthCounts.get(5), 318);
assert.deepEqual(packetHits.get("SEEK"), [{
  page: 30,
  ordinal: 31,
  start: 127,
}]);
assert.deepEqual(packetHits.get("AND"), [{
  page: 31,
  ordinal: 32,
  start: 126,
}]);
assert.deepEqual(packetHits.get("YOU_WRAP"), [{
  page: 32,
  ordinal: 11,
  start: 59,
}]);

console.log("PASS DIRECTION / SEEK AND YOU numbered route");
console.log(JSON.stringify({
  state,
  diagonalMissing: missing.map((row) => ({
    ordinal: row.source.ordinal,
    word: row.source.word,
    projectPage: row.page,
    wordCount: row.wordCount,
  })),
  direction: {
    ordinal: direction.source.ordinal,
    page: direction.page,
    start: direction.object.start,
    values: direction.object.values,
    shell: shell(direction.object.values),
    groupOrder,
  },
  seek: {
    ordinal: seek.source.ordinal,
    page: seek.page,
    start: seek.object.start,
    values: seek.object.values,
    shell: shell(seek.object.values),
  },
  and: {
    ordinal: and.source.ordinal,
    page: and.page,
    start: and.object.start,
    values: and.object.values,
    shell: shell(and.object.values),
  },
  you: {
    ordinal: you.source.ordinal,
    page: you.page,
    directWordCount: you.wordCount,
    wrappedOrdinal,
    start: youObject.start,
    values: youObject.values,
    shell: shell(youObject.values),
  },
  resumes: diagonal.slice(33, 36).map((row) => ({
    source: row.source.word,
    ordinal: row.source.ordinal,
    page: row.page,
    localOrdinal: row.object.ordinal,
    start: row.object.start,
  })),
  controls: {
    threeRuneWords: lengthCounts.get(3),
    fiveRuneWords: lengthCounts.get(5),
    packetHits: Object.fromEntries(packetHits),
  },
}, null, 2));
