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
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/**
 * Canonical outside-in H serialization used by current local-inverse reports:
 * differences outside-in, odd center literal, sums inside-out.
 * @param {number[]} values
 * @returns {number[]}
 */
function Hsplit(values) {
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
 * Pair-interleaved outside-in H serialization used by the numbered-route
 * DIRECTION and OPENPGP43 scripts: each pair emits difference then sum, and an
 * odd center is appended last.
 * @param {number[]} values
 * @returns {number[]}
 */
function Hpair(values) {
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

/** Flush one canonical complete page-local word. */
function flushCanonicalWord() {
  if (!currentWord.length) return;
  if (startSegment === endSegment) {
    const page = canonicalPages[startSegment];
    page.words.push({
      ordinal: page.words.length + 1,
      start: startOffset,
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
      // Printed wraps may continue a word.
    } else {
      flushCanonicalWord();
    }
  }
}
flushCanonicalWord();

const wordsByPage = new Map(
  canonicalPages.map((page) => [page.page, page.words])
);
const pageWords = (page) => wordsByPage.get(page) || [];

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");
const source = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word, index) => ({index, ordinal: index + 1, word: word.toUpperCase()}));
assert.equal(source.length, 43);

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
assert.deepEqual(
  diagonal.filter((row) => !row.object).map((row) => [
    row.source.ordinal,
    row.source.word,
    row.page,
    row.wordCount,
  ]),
  [[33, "YOU", 32, 21]]
);

/**
 * @param {number[]} values
 * @param {0|1} origin
 * @returns {(string|null)[]}
 */
function lexicalize(values, origin) {
  return values.map((value) => {
    const index = value - origin;
    return index >= 0 && index < source.length ? source[index].word : null;
  });
}

/**
 * Exact arithmetic progression by one, allowing either direction.
 * @param {number[]} values
 * @param {0|1} origin
 * @returns {{start:number,direction:number,words:string[]}|null}
 */
function contiguousSourceRun(values, origin) {
  const indices = values.map((value) => value - origin);
  if (indices.some((value) => value < 0 || value >= source.length)) return null;
  if (indices.length < 2) return null;
  const direction = indices[1] - indices[0];
  if (direction !== 1 && direction !== -1) return null;
  for (let index = 1; index < indices.length; index += 1) {
    if (indices[index] - indices[index - 1] !== direction) return null;
  }
  return {
    start: indices[0],
    direction,
    words: indices.map((index) => source[index].word),
  };
}

const rows = [];
const contiguousHits = [];
const repeatedLexicalHits = [];
for (const row of diagonal) {
  if (!row.object) continue;
  for (const [transform, values] of [
    ["raw", row.object.values],
    ["Hpair", Hpair(row.object.values)],
    ["Hsplit", Hsplit(row.object.values)],
  ]) {
    for (const origin of [0, 1]) {
      const lexical = lexicalize(values, origin);
      const contiguous = contiguousSourceRun(values, origin);
      const nonNull = lexical.every((word) => word !== null);
      const distinctLexical = nonNull ? new Set(lexical).size : null;
      const item = {
        sourceIndex: row.source.index,
        sourceOrdinal: row.source.ordinal,
        sourceWord: row.source.word,
        page: row.page,
        wordOrdinal: row.object.ordinal,
        start: row.object.start,
        transform,
        origin,
        values,
        lexical,
        contiguous,
        distinctLexical,
      };
      rows.push(item);
      if (contiguous) contiguousHits.push(item);
      if (nonNull && distinctLexical < lexical.length) repeatedLexicalHits.push(item);
    }
  }
}

const tailRows = rows.filter((row) => row.sourceIndex >= 28);

// Predeclared controls from current synthesis.
const p24 = rows.find((row) =>
  row.sourceIndex === 24
  && row.transform === "Hpair"
  && row.origin === 0
);
assert.ok(p24);
assert.deepEqual(p24.values, [12, 13]);
assert.deepEqual(p24.lexical, ["THE", "WAY"]);
assert.deepEqual(p24.contiguous, {
  start: 12,
  direction: 1,
  words: ["THE", "WAY"],
});

const p42 = rows.find((row) =>
  row.sourceIndex === 42
  && row.transform === "Hpair"
  && row.origin === 0
);
assert.ok(p42);
assert.deepEqual(p42.values, [2, 1, 0]);
assert.deepEqual(p42.lexical, ["PATH", "THE", "HELLO"]);
assert.deepEqual(p42.contiguous, {
  start: 2,
  direction: -1,
  words: ["PATH", "THE", "HELLO"],
});

// The direct WILL34 coordinate is present and intentionally left unopened
// beyond the two fixed transforms. This is the main neighboring control for
// the missing YOU33 coordinate.
const will34 = rows.filter((row) => row.sourceIndex === 33);
assert.equal(will34.length, 6);

const direction30Pair = rows.find((row) =>
  row.sourceIndex === 29
  && row.transform === "Hpair"
  && row.origin === 0
);
const direction30Split = rows.find((row) =>
  row.sourceIndex === 29
  && row.transform === "Hsplit"
  && row.origin === 0
);
assert.ok(direction30Pair);
assert.ok(direction30Split);
assert.deepEqual(direction30Pair.values, [22, 0, 15, 8]);
assert.deepEqual(direction30Split.values, [22, 15, 8, 0]);
assert.notDeepEqual(direction30Pair.values, direction30Split.values);

const p42Split = rows.find((row) =>
  row.sourceIndex === 42
  && row.transform === "Hsplit"
  && row.origin === 0
);
assert.ok(p42Split);
assert.deepEqual(p42Split.values, [2, 0, 1]);
assert.equal(p42Split.contiguous, null);

console.log(JSON.stringify({
  status: "PASS",
  scope: {
    transforms: ["raw", "Hpair (pair-interleaved)", "Hsplit (differences/center/sums)"],
    origins: [0, 1],
    diagonalObjects: diagonal.filter((row) => row.object).length,
    missing: diagonal.filter((row) => !row.object).map((row) => ({
      sourceOrdinal: row.source.ordinal,
      sourceWord: row.source.word,
      page: row.page,
      wordCount: row.wordCount,
    })),
  },
  contiguousHits: contiguousHits.map((row) => ({
    sourceIndex: row.sourceIndex,
    sourceWord: row.sourceWord,
    page: row.page,
    ordinal: row.wordOrdinal,
    transform: row.transform,
    origin: row.origin,
    values: row.values,
    lexical: row.lexical,
    contiguous: row.contiguous,
  })),
  repeatedLexicalHits: repeatedLexicalHits.map((row) => ({
    sourceIndex: row.sourceIndex,
    sourceWord: row.sourceWord,
    page: row.page,
    ordinal: row.wordOrdinal,
    transform: row.transform,
    origin: row.origin,
    values: row.values,
    lexical: row.lexical,
    distinctLexical: row.distinctLexical,
  })),
  will34: will34.map((row) => ({
    transform: row.transform,
    origin: row.origin,
    values: row.values,
    lexical: row.lexical,
    contiguous: row.contiguous,
  })),
  direction30: {
    pair: {
      values: direction30Pair.values,
      lexical: direction30Pair.lexical,
    },
    split: {
      values: direction30Split.values,
      lexical: direction30Split.lexical,
    },
  },
  openpgp43: {
    pair: {
      values: p42.values,
      lexical: p42.lexical,
      contiguous: p42.contiguous,
    },
    split: {
      values: p42Split.values,
      lexical: p42Split.lexical,
      contiguous: p42Split.contiguous,
    },
  },
}, null, 2));
