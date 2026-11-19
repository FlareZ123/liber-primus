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
 * @param {number} value
 * @param {number} modulus
 */
function inverse(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  return null;
}

/**
 * Canonical LP2 word parser. A printed line wrap "/" is not a word boundary.
 *
 * @param {string} text
 */
function parseCanonical(text) {
  const words = [];
  let values = [];
  let start = 0;
  let offset = 0;

  function flush() {
    if (!values.length) return;
    words.push({
      ordinal: words.length + 1,
      start,
      end: offset - 1,
      values: values.slice(),
    });
    values = [];
  }

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!values.length) start = offset;
      values.push(value);
      offset += 1;
    } else if ((char === "-" || char === ".") && values.length) {
      flush();
    }
  }
  flush();
  return words;
}

/**
 * Canonical outside-in four-rune H serialization:
 * H(k0,k3) || H(k1,k2).
 *
 * @param {number[]} values
 */
function H4(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
    mod29(values[0] + values[3]),
  ];
}

/**
 * High-first polynomial derivative evaluated modulo29.
 *
 * @param {number[]} coefficients
 * @param {number} x
 * @param {number} order
 */
function derivativeValue(coefficients, x, order) {
  let current = coefficients.slice();
  for (let step = 0; step < order; step += 1) {
    const degree = current.length - 1;
    current = current
      .slice(0, -1)
      .map((coefficient, index) =>
        mod29(coefficient * (degree - index))
      );
  }

  let value = 0;
  for (const coefficient of current) {
    value = mod29(value * x + coefficient);
  }
  return value;
}

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");

const sourceWords = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word, index) => ({ index, ordinal: index + 1, word: word.toUpperCase() }));

assert.equal(sourceWords.length, 43);
assert.deepEqual(
  sourceWords.slice(28, 31).map((row) => [row.ordinal, row.word]),
  [
    [29, "THE"],
    [30, "DIRECTION"],
    [31, "SEEK"],
  ]
);

// Project p29 is physical LP2 page30. READ OUT THE selects source word29 THE;
// its immediate authenticated follower is one-based word30 DIRECTION.
// Use that same one-based 30 on physical page30.
const projectPage = 29;
const physicalPage = projectPage + 1;
const directionSource = sourceWords[29];
assert.equal(physicalPage, 30);
assert.deepEqual(directionSource, {
  index: 29,
  ordinal: 30,
  word: "DIRECTION",
});

const p29Words = parseCanonical(parts[projectPage]);
const directionObject = p29Words[directionSource.ordinal - 1];
assert.ok(directionObject);
assert.equal(directionObject.ordinal, 30);
assert.equal(directionObject.start, 108);
assert.deepEqual(directionObject.values, [11, 26, 11, 18]);

const packet = H4(directionObject.values);
assert.deepEqual(packet, [22, 15, 8, 0]);

// Read the packet as [p-1,b,A,F]. These values independently occur as
// authenticated 2016 source positions for ROAD, WORDS, DEVOTED and the
// zero sentinel.
const [groupOrder, b, A, sentinel] = packet;
assert.equal(sentinel, 0);
const p = groupOrder + 1;
const e = inverse(b, groupOrder);
const K = modPow(A, b, p);

assert.equal(p, 23);
assert.equal(b, 15);
assert.equal(A, 8);
assert.equal(e, 3);
assert.equal(K, 2);

const byWord = new Map(sourceWords.map((row) => [row.word, row.index]));
assert.equal(byWord.get("ROAD"), p);
assert.equal(byWord.get("WORDS"), b);
assert.equal(byWord.get("DEVOTED"), A);
assert.equal(byWord.get("LIES"), e);
assert.equal(byWord.get("PATH"), K);

// Object-family control: for each project page p0..p55, take the one-based
// word whose ordinal equals that page's physical LP2 page number p+1.
const numberedObjects = [];
for (let page = 0; page <= 55; page += 1) {
  const physical = page + 1;
  const word = parseCanonical(parts[page])[physical - 1];
  if (!word) continue;

  numberedObjects.push({
    page,
    physical,
    ordinal: word.ordinal,
    start: word.start,
    values: word.values,
    h4: word.values.length === 4 ? H4(word.values) : null,
  });
}

assert.equal(numberedObjects.length, 49);
const numberedFourRune = numberedObjects.filter((row) => row.h4);
assert.equal(numberedFourRune.length, 7);
const numberedZeroOuterSum = numberedFourRune.filter((row) => row.h4[3] === 0);
assert.deepEqual(
  numberedZeroOuterSum.map((row) => [
    row.page,
    row.physical,
    row.ordinal,
    row.start,
    row.h4,
  ]),
  [[29, 30, 30, 108, [22, 15, 8, 0]]]
);

// Manuscript-wide exact packet control.
let fourRuneWords = 0;
const exactPacketHits = [];
for (let page = 0; page <= 55; page += 1) {
  for (const word of parseCanonical(parts[page])) {
    if (word.values.length !== 4) continue;
    fourRuneWords += 1;
    const h4 = H4(word.values);
    if (h4.every((value, index) => value === packet[index])) {
      exactPacketHits.push({
        page,
        ordinal: word.ordinal,
        start: word.start,
      });
    }
  }
}
assert.equal(fourRuneWords, 520);
assert.deepEqual(exactPacketHits, [{
  page: 29,
  ordinal: 30,
  start: 108,
}]);

// Existing independent p39 red triad fixes repeated root24.
const G = [15, 5, 27];
assert.equal(derivativeValue(G, 24, 0), 0);
assert.equal(derivativeValue(G, 24, 1), 0);

// The local DIRECTION packet derives e=3 before this derivative is opened.
const p29Polynomial = corpus.pages.find((page) => page.page === 29).indices;
assert.ok(p29Polynomial);
assert.equal(derivativeValue(p29Polynomial, 24, 0), 0);
assert.equal(derivativeValue(p29Polynomial, 24, 1), 0);
const derivative = derivativeValue(p29Polynomial, 24, e);
assert.equal(derivative, 7);
assert.equal(corpus.translit[derivative], "W");

console.log("PASS p29 DIRECTION self-index packet");
console.log(JSON.stringify({
  source: {
    prior: sourceWords[28],
    direction: directionSource,
  },
  localObject: {
    projectPage,
    physicalPage,
    ordinal: directionObject.ordinal,
    start: directionObject.start,
    values: directionObject.values,
    h4: packet,
  },
  recovered: {groupOrder, p, b, A, e, K},
  numberedObjectControl: {
    existing: numberedObjects.length,
    fourRune: numberedFourRune.length,
    zeroOuterSum: numberedZeroOuterSum.map((row) => ({
      page: row.page,
      physical: row.physical,
      ordinal: row.ordinal,
      start: row.start,
      h4: row.h4,
    })),
  },
  manuscriptControl: {
    fourRuneWords,
    exactPacketHits,
  },
  derivative: {
    root: 24,
    order: e,
    output: derivative,
    text: corpus.translit[derivative],
  },
}, null, 2));
