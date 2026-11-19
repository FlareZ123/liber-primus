"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const raw = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeToValue = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = raw.split(/^\s*%\s*$/m);

/** @param {number} value */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} page */
function pageWords(page) {
  const text = parts[page <= 49 ? page : page - 1];
  const out = [];
  let current = [];
  let start = 0;
  let runeOffset = 0;
  const flush = () => {
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
  };
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

/** @param {number[]} values */
function H3(values) {
  assert.equal(values.length, 3);
  return [
    mod29(values[0] - values[2]),
    mod29(values[0] + values[2]),
    values[1],
  ];
}

const sourceStart = signed2016.indexOf("Hello.");
const sourceEnd = signed2016.indexOf("-----BEGIN PGP SIGNATURE-----");
const source = signed2016
  .slice(sourceStart, sourceEnd)
  .replace(/\b7A35090F\b/g, "")
  .match(/[A-Za-z]+/g)
  .map((word) => word.toUpperCase());

assert.equal(source.length, 43);
assert.equal(source[42], "OPENPGP");
assert.equal(source[0], "HELLO");
assert.equal(source[22], "THE");
assert.equal(source[13], "WAY");

const selected = pageWords(42)[42];
assert.deepEqual(selected, {
  page: 42,
  index: 42,
  ordinal: 43,
  start: 203,
  end: 205,
  values: [11, 13, 11],
});
assert.deepEqual(H3(selected.values), [0, 22, 13]);
assert.deepEqual(H3(selected.values).map((value) => source[value]), [
  "HELLO",
  "THE",
  "WAY",
]);

const allWords = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  allWords.push(...pageWords(page));
}
const threeRuneWords = allWords.filter((word) => word.values.length === 3);
assert.equal(threeRuneWords.length, 726);

const exactHits = threeRuneWords.filter(
  (word) => H3(word.values).join(",") === "0,22,13"
);
assert.deepEqual(
  exactHits.map((word) => [word.page, word.index, word.start, word.values]),
  [[42, 42, 203, [11, 13, 11]]]
);

const palindromes = threeRuneWords.filter(
  (word) => word.values[0] === word.values[2]
);
assert.equal(palindromes.length, 32);

const bigramTypes = new Set();
for (let index = 0; index < source.length - 1; index += 1) {
  bigramTypes.add(source[index] + "|" + source[index + 1]);
}
const forwardBigramHits = palindromes.filter((word) => {
  const h = H3(word.values);
  const left = source[h[1]];
  const right = source[h[2]];
  return left && right && bigramTypes.has(left + "|" + right);
});
assert.equal(forwardBigramHits.length, 6);

const diagonalPalindromes = [];
for (let index = 0; index < source.length; index += 1) {
  const wordIndex = index === 32 ? 10 : index;
  const word = pageWords(index)[wordIndex];
  if (
    word.values.length === 3 &&
    word.values[0] === word.values[2]
  ) {
    const h = H3(word.values);
    diagonalPalindromes.push({
      sourceIndex: index,
      sourceWord: source[index],
      page: index,
      wordIndex,
      start: word.start,
      values: word.values,
      h,
      tokens: h.map((value) => source[value]),
      forwardBigram:
        !!source[h[1]] &&
        !!source[h[2]] &&
        bigramTypes.has(source[h[1]] + "|" + source[h[2]]),
    });
  }
}

assert.deepEqual(diagonalPalindromes, [
  {
    sourceIndex: 19,
    sourceWord: "THEIR",
    page: 19,
    wordIndex: 19,
    start: 85,
    values: [11, 20, 11],
    h: [0, 22, 20],
    tokens: ["HELLO", "THE", "MEANING"],
    forwardBigram: false,
  },
  {
    sourceIndex: 30,
    sourceWord: "SEEK",
    page: 30,
    wordIndex: 30,
    start: 127,
    values: [22, 12, 22],
    h: [0, 15, 12],
    tokens: ["HELLO", "WORDS", "THE"],
    forwardBigram: false,
  },
  {
    sourceIndex: 42,
    sourceWord: "OPENPGP",
    page: 42,
    wordIndex: 42,
    start: 203,
    values: [11, 13, 11],
    h: [0, 22, 13],
    tokens: ["HELLO", "THE", "WAY"],
    forwardBigram: true,
  },
]);

const p0Ink = ink.pages.find((row) => row.page === 0);
assert.ok(p0Ink);
const p0LeadingRed = p0Ink.red_spans.find((span) => span.start === 0);
assert.deepEqual(p0LeadingRed, {
  start: 0,
  length: 13,
  runes: p0LeadingRed.runes,
});

const endpointChecks = diagonalPalindromes.map((row) => ({
  sourceWord: row.sourceWord,
  returnedPage: row.h[0],
  endpoint: row.h[2],
  endpointEqualsLeadingRed:
    row.h[0] === 0 && row.h[2] === p0LeadingRed.length,
}));
assert.deepEqual(endpointChecks, [
  {
    sourceWord: "THEIR",
    returnedPage: 0,
    endpoint: 20,
    endpointEqualsLeadingRed: false,
  },
  {
    sourceWord: "SEEK",
    returnedPage: 0,
    endpoint: 12,
    endpointEqualsLeadingRed: false,
  },
  {
    sourceWord: "OPENPGP",
    returnedPage: 0,
    endpoint: 13,
    endpointEqualsLeadingRed: true,
  },
]);

// Rejected literal packet consumer [page=0,start=22,length=13].
const p0 = pageWords(0);
const overlap = p0.filter((word) => word.end >= 22 && word.start <= 34);
assert.deepEqual(
  overlap.map((word) => [word.ordinal, word.start, word.end]),
  [[5,20,22],[6,23,33],[7,34,38]]
);
assert.notEqual(overlap[0].start, 22);
assert.notEqual(overlap[overlap.length - 1].end, 34);

console.log("PASS OPENPGP43 -> p42 H3 -> HELLO THE WAY");
console.log(JSON.stringify({
  selected,
  H3: H3(selected.values),
  tokens: H3(selected.values).map((value) => source[value]),
  corpus: {
    threeRuneWords: threeRuneWords.length,
    exactShellHits: exactHits.length,
    palindromicThreeRuneWords: palindromes.length,
    forwardAuthenticatedBigramHits: forwardBigramHits.length,
  },
  diagonalPalindromes,
  p0Return: { leadingRedLength: p0LeadingRed.length, endpointChecks },
  rejectedCoordinate: {
    page: 0,
    start: 22,
    length: 13,
    overlappingWords: overlap.map((word) => ({
      ordinal: word.ordinal,
      start: word.start,
      end: word.end,
    })),
  },
}, null, 2));
