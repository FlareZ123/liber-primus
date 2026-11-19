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
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base, exponent, modulus) {
  let value = 1;
  let factor = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) value = (value * factor) % modulus;
    factor = (factor * factor) % modulus;
    power = Math.floor(power / 2);
  }
  return value;
}

/** @param {number} value @returns {number} */
function cube(value) {
  return modPow(value, 3, 29);
}

/** @param {number} value @returns {number} */
function inverseCube(value) {
  // 3 * 19 = 57 = 1 mod28.
  return modPow(value, 19, 29);
}

/**
 * Endpoint H ordering used by the existing OPENPGP43 report.
 * @param {number[]} values
 * @returns {number[]}
 */
function endpointH3(values) {
  assert.equal(values.length, 3);
  return [
    mod29(values[0] - values[2]),
    mod29(values[0] + values[2]),
    values[1],
  ];
}

const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling " + word);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "");

const source = (clear.match(/[A-Za-z]+/g) || []).map((word, index) => ({
  index,
  word: word.toUpperCase(),
  values: gp(word),
}));

assert.equal(source.length, 43);
assert.equal(source[0].word, "HELLO");
assert.equal(source[5].word, "EPIPHANY");
assert.equal(source[6].word, "SEEKS");
assert.equal(source[13].word, "WAY");
assert.equal(source[22].word, "THE");
assert.equal(source[42].word, "OPENPGP");

const segments = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const pages = segments.map((text, segment) => ({
  page: segment >= 50 ? segment + 1 : segment,
  words: [],
  offset: 0,
}));

let current = [];
let startSegment = 0;
let endSegment = 0;
let startOffset = 0;

function flushWord() {
  if (!current.length) return;
  if (startSegment === endSegment) {
    const page = pages[startSegment];
    page.words.push({
      ordinal: page.words.length + 1,
      start: startOffset,
      end: startOffset + current.length - 1,
      values: current.slice(),
    });
  }
  current = [];
}

for (let segment = 0; segment < segments.length; segment += 1) {
  for (const character of [...segments[segment]]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      if (!current.length) {
        startSegment = segment;
        startOffset = pages[segment].offset;
      }
      endSegment = segment;
      current.push(value);
      pages[segment].offset += 1;
    } else if (character === "/" || /\s/u.test(character)) {
      // Continue a printed word through line wrapping and physical boundaries.
    } else {
      flushWord();
    }
  }
}
flushWord();

const pageByNumber = new Map(pages.map((page) => [page.page, page]));

/** @param {number} sourceIndex @returns {{ordinal:number,start:number,end:number,values:number[]}|null} */
function numberedObject(sourceIndex) {
  const page = pageByNumber.get(sourceIndex);
  return page && page.words[sourceIndex] ? page.words[sourceIndex] : null;
}

const openpgp = numberedObject(42);
assert.ok(openpgp);
assert.equal(openpgp.ordinal, 43);
assert.deepEqual(openpgp.values, [11, 13, 11]);

const openpgpH = endpointH3(openpgp.values);
assert.deepEqual(openpgpH, [0, 22, 13]);
assert.deepEqual(
  openpgpH.map((index) => source[index].word),
  ["HELLO", "THE", "WAY"]
);

const palindromeRows = [];
for (const row of source) {
  const object = numberedObject(row.index);
  if (
    object &&
    object.values.length === 3 &&
    object.values[0] === object.values[2]
  ) {
    const shell = endpointH3(object.values);
    palindromeRows.push({
      index: row.index,
      word: row.word,
      shell,
      cubeEdge: shell[1] === cube(shell[2]),
    });
  }
}

assert.deepEqual(
  palindromeRows.map((row) => [row.index, row.word, row.shell]),
  [
    [19, "THEIR", [0, 22, 20]],
    [30, "SEEK", [0, 15, 12]],
    [42, "OPENPGP", [0, 22, 13]],
  ]
);
assert.deepEqual(
  palindromeRows.filter((row) => row.cubeEdge).map((row) => row.word),
  ["OPENPGP"]
);

assert.equal(cube(13), 22);
assert.equal(source[cube(13)].word, "THE");
assert.equal(cube(22), 5);
assert.equal(source[cube(22)].word, "EPIPHANY");

const p0Ink = ink.pages.find((page) => page.page === 0);
assert.ok(p0Ink);
assert.deepEqual(
  p0Ink.red_spans.map((span) => [span.start, span.length]),
  [[0, 13]]
);

const p0 = pageByNumber.get(0);
assert.ok(p0);
const titleShape = p0.words.slice(0, 2).map((word) => word.values.length);
assert.deepEqual(titleShape, [8, 5]);
assert.equal(titleShape.reduce((sum, value) => sum + value, 0), 13);

const u = openpgpH[1];
const v = openpgpH[2];
const continuations = [
  ["C(first)", cube(u)],
  ["C(second)", cube(v)],
  ["C^-1(first)", inverseCube(u)],
  ["C^-1(second)", inverseCube(v)],
].map(([mode, index]) => ({
  mode,
  index,
  word: source[index].word,
  pair: index + 1 < source.length
    ? [source[index].word, source[index + 1].word]
    : null,
  shape: index + 1 < source.length
    ? [source[index].values.length, source[index + 1].values.length]
    : null,
}));

assert.deepEqual(
  continuations.map((row) => [row.mode, row.index, row.shape]),
  [
    ["C(first)", 5, [8, 5]],
    ["C(second)", 22, [2, 4]],
    ["C^-1(first)", 13, [3, 3]],
    ["C^-1(second)", 6, [5, 2]],
  ]
);

const shapeHits = continuations.filter(
  (row) => row.shape && row.shape[0] === 8 && row.shape[1] === 5
);
assert.deepEqual(
  shapeHits.map((row) => [row.mode, row.index, row.pair]),
  [["C(first)", 5, ["EPIPHANY", "SEEKS"]]]
);

const allAdjacentShapeHits = [];
for (let index = 0; index + 1 < source.length; index += 1) {
  if (
    source[index].values.length === 8 &&
    source[index + 1].values.length === 5
  ) {
    allAdjacentShapeHits.push([
      index,
      source[index].word,
      source[index + 1].word,
    ]);
  }
}
assert.deepEqual(
  allAdjacentShapeHits,
  [[5, "EPIPHANY", "SEEKS"]]
);

console.log(JSON.stringify({
  status: "PASS",
  openpgp: {
    source: [42, "OPENPGP"],
    receiver: openpgp,
    H: openpgpH,
    lexicalH: openpgpH.map((index) => source[index].word),
  },
  cube: {
    wayToThe: [13, cube(13)],
    theToEpiphany: [22, cube(22)],
    palindromeRows,
  },
  p0Title: {
    redSpan: [0, 13],
    shape: titleShape,
  },
  continuationCharge: continuations,
  uniqueTitlePhrase: allAdjacentShapeHits,
  conclusion:
    "OPENPGP43 supplies a unique diagonal cube-edge packet WAY13 -> THE22. Extending the already authenticated cube once gives EPIPHANY5; the original p0 8+5 title shape uniquely fixes the following authenticated word SEEKS6.",
}, null, 2));
