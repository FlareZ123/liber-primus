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
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const raw = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeToValue = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = raw.split(/^\s*%\s*$/m);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/**
 * Exact physical-page printed-word parser used by the established
 * OPENPGP43 endpoint SFT.
 *
 * @param {number} page
 * @returns {Array<{page:number,index:number,ordinal:number,start:number,end:number,values:number[]}>}
 */
function pageWords(page) {
  const text = parts[page <= 49 ? page : page - 1];
  const out = [];
  let current = [];
  let start = 0;
  let runeOffset = 0;

  function flush() {
    if (!current.length) return;
    out.push({
      page,
      index: out.length,
      ordinal: out.length + 1,
      start,
      end: runeOffset - 1,
      values: current.slice(),
    });
    current = [];
  }

  for (const char of [...text]) {
    const value = runeToValue.get(char);
    if (value !== undefined) {
      if (!current.length) start = runeOffset;
      current.push(value);
      runeOffset += 1;
    } else if ((char === "-" || char === ".") && current.length) {
      flush();
    }
  }
  flush();
  return out;
}

/** @param {number[]} values @returns {number[]} */
function endpointH3(values) {
  assert.equal(values.length, 3);
  return [
    mod29(values[0] - values[2]),
    mod29(values[0] + values[2]),
    values[1],
  ];
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
  return modPow(value, 19, 29);
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

const sourceStart = signed2016.indexOf("Hello.");
const sourceEnd = signed2016.indexOf("-----BEGIN PGP SIGNATURE-----");
const source = signed2016
  .slice(sourceStart, sourceEnd)
  .replace(/\b7A35090F\b/g, "")
  .match(/[A-Za-z]+/g)
  .map((word, index) => ({
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

// Reproduce the established endpoint exactly before extending it.
const selected = pageWords(42)[42];
assert.deepEqual(selected, {
  page: 42,
  index: 42,
  ordinal: 43,
  start: 203,
  end: 205,
  values: [11, 13, 11],
});
const openpgpH = endpointH3(selected.values);
assert.deepEqual(openpgpH, [0, 22, 13]);
assert.deepEqual(
  openpgpH.map((index) => source[index].word),
  ["HELLO", "THE", "WAY"]
);

// Reproduce the endpoint's complete numbered-diagonal palindrome control.
const bigramTypes = new Set();
for (let index = 0; index < source.length - 1; index += 1) {
  bigramTypes.add(source[index].word + "|" + source[index + 1].word);
}

const diagonalPalindromes = [];
for (let index = 0; index < source.length; index += 1) {
  const wordIndex = index === 32 ? 10 : index;
  const word = pageWords(index)[wordIndex];
  if (
    word &&
    word.values.length === 3 &&
    word.values[0] === word.values[2]
  ) {
    const shell = endpointH3(word.values);
    diagonalPalindromes.push({
      sourceIndex: index,
      sourceWord: source[index].word,
      shell,
      cubeEdge: shell[1] === cube(shell[2]),
      forwardBigram:
        !!source[shell[1]] &&
        !!source[shell[2]] &&
        bigramTypes.has(
          source[shell[1]].word + "|" + source[shell[2]].word
        ),
    });
  }
}

assert.deepEqual(
  diagonalPalindromes.map((row) => [
    row.sourceIndex,
    row.sourceWord,
    row.shell,
  ]),
  [
    [19, "THEIR", [0, 22, 20]],
    [30, "SEEK", [0, 15, 12]],
    [42, "OPENPGP", [0, 22, 13]],
  ]
);
assert.deepEqual(
  diagonalPalindromes.filter((row) => row.cubeEdge).map((row) => row.sourceWord),
  ["OPENPGP"]
);

// The endpoint's nonzero fields are an exact directed source-cube edge.
assert.equal(cube(13), 22);
assert.equal(source[13].word, "WAY");
assert.equal(source[22].word, "THE");

// Continue the already visible edge once.
assert.equal(cube(22), 5);
assert.equal(source[5].word, "EPIPHANY");

// The original p0 receiver independently fixes a 13-rune red title.
const p0Ink = ink.pages.find((row) => row.page === 0);
assert.ok(p0Ink);
const p0LeadingRed = p0Ink.red_spans.find((span) => span.start === 0);
assert.ok(p0LeadingRed);
assert.equal(p0LeadingRed.length, 13);

// The printed title itself fixes the 8+5 word split.
const p0TitleWords = pageWords(0).slice(0, 2);
const titleShape = p0TitleWords.map((word) => word.values.length);
assert.deepEqual(titleShape, [8, 5]);
assert.equal(titleShape[0] + titleShape[1], p0LeadingRed.length);

// Charge forward/inverse cube from either nonzero endpoint field.
const first = openpgpH[1];
const second = openpgpH[2];
const continuations = [
  ["C(first)", cube(first)],
  ["C(second)", cube(second)],
  ["C^-1(first)", inverseCube(first)],
  ["C^-1(second)", inverseCube(second)],
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

console.log("PASS OPENPGP43 cube continuation -> EPIPHANY SEEKS");
console.log(JSON.stringify({
  openpgp: {
    source: [42, "OPENPGP"],
    selected,
    H: openpgpH,
    lexicalH: openpgpH.map((index) => source[index].word),
  },
  diagonalPalindromes,
  cube: {
    wayToThe: [13, cube(13)],
    theToEpiphany: [22, cube(22)],
  },
  p0Title: {
    redSpan: [p0LeadingRed.start, p0LeadingRed.length],
    shape: titleShape,
  },
  continuationCharge: continuations,
  uniqueTitlePhrase: allAdjacentShapeHits,\n  ciphertextHoldout: {\n    residual,\n    plainWordSums,\n    residualWordSums,\n    bracketHits,\n  },
}, null, 2));
