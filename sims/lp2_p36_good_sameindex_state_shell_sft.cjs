"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {number[]} values */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/**
 * Canonical LP2 word parser. Printed line wraps "/" do not terminate words.
 * Only actual word/phrase delimiters "-" and "." flush a word.
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
      sum: sum(values),
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
 * Historical flawed parser, retained only to reproduce the false p36 hit.
 * It incorrectly treats "/" as a word delimiter.
 *
 * @param {string} text
 */
function parseSplitAtLineWrap(text) {
  const words = [];
  let values = [];
  let start = 0;
  let offset = 0;

  function flush() {
    if (!values.length) return;
    words.push({
      start,
      end: offset - 1,
      values: values.slice(),
      sum: sum(values),
    });
    values = [];
  }

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!values.length) start = offset;
      values.push(value);
      offset += 1;
    } else if (
      (char === "-" || char === "." || char === "/") &&
      values.length
    ) {
      flush();
    }
  }
  flush();
  return words;
}

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");

const message = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word, index) => {
    const values = gp(word);
    return { index, word: word.toUpperCase(), values, sum: sum(values) };
  });

assert.equal(message.length, 43);
const good = message[36];
assert.equal(good.word, "GOOD");
assert.deepEqual(good.values, [6, 3, 3, 23]);
assert.equal(good.sum, 35);

const parts = transcription.split(/^\s*%\s*$/m);
const p36Canonical = parseCanonical(parts[36]);
const p36StateReceivers = p36Canonical.filter(
  (word) => word.values.length === good.values.length && word.sum === good.sum
);
assert.deepEqual(p36StateReceivers, []);

const spanningWord = p36Canonical.find(
  (word) => word.start === 87
);
assert.ok(spanningWord);
assert.deepEqual(spanningWord.values, [11, 0, 13, 11, 23]);
assert.equal(spanningWord.end, 91);
assert.equal(spanningWord.values.length, 5);
assert.equal(spanningWord.sum, 58);

const flawed = parseSplitAtLineWrap(parts[36]).filter(
  (word) => word.values.length === good.values.length && word.sum === good.sum
);
assert.deepEqual(
  flawed.map((word) => [word.start, word.values]),
  [[87, [11, 0, 13, 11]]]
);

// Canonical same-index state census for all authenticated four-GP-rune words.
const canonicalHits = [];
for (const source of message.filter((row) => row.values.length === 4)) {
  for (const word of parseCanonical(parts[source.index])) {
    if (
      word.values.length === 4 &&
      word.sum === source.sum
    ) {
      canonicalHits.push({
        page: source.index,
        target: source.word,
        start: word.start,
      });
    }
  }
}

assert.deepEqual(
  canonicalHits.map((row) => [row.page, row.target, row.start]),
  [
    [33, "WILL", 132],
    [40, "PATHS", 71],
  ]
);

console.log("PASS p36 GOOD line-wrap correction");
console.log(JSON.stringify({
  target: good.word,
  canonicalStateReceivers: p36StateReceivers,
  canonicalWordAt87: spanningWord,
  flawedLineWrapReceiver: flawed[0],
  canonicalFourRuneSameIndexHits: canonicalHits,
}, null, 2));
