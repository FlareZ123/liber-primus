"use strict";

/**
 * SFT: transfer Agent24's independently selected p50 low-base60 digit pointer
 * to the p38 FOUND route and charge every forward adjacent contained-word pair.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const source = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

const RUNIC = /[\u16A0-\u16FF]/u;
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/** @param {string} token @returns {number} */
function low60(token) {
  const value = alphabet60.indexOf(token[1]);
  assert.ok(value >= 0, "token low digit outside base60 alphabet: " + token);
  return value;
}

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gpEnglish(word) {
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
    const token = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, "unmapped GP spelling: " + word);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

const signedBody = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "");
const signedWords = (signedBody.match(/[A-Za-z]+/g) || []).map((word, index) => {
  const values = gpEnglish(word);
  return { index, word: word.toUpperCase(), values, gp0: sum(values), length: values.length };
});
assert.equal(signedWords.length, 43);
assert.equal(signedWords[35].word, "FOUND");
assert.equal(signedWords[35].gp0, 36);

const segments = source.split("%").slice(0, 55);

/** @param {number} segment @returns {number} */
function physicalPage(segment) {
  return segment >= 50 ? segment + 1 : segment;
}

/**
 * Parse continuously and retain page-contained words.
 * @returns {Map<number, Array<object>>}
 */
function pageWords() {
  const pages = segments.map((text, segment) => ({ page: physicalPage(segment), words: [] }));
  const offsets = new Array(segments.length).fill(0);
  let values = [];
  let startSegment = 0;
  let endSegment = 0;
  let start = 0;

  function flush() {
    if (!values.length) return;
    if (startSegment === endSegment) {
      const page = pages[startSegment];
      page.words.push({
        page: page.page,
        ordinal: page.words.length,
        start,
        end: start + values.length - 1,
        values: values.slice(),
        length: values.length,
        gp0: sum(values),
      });
    }
    values = [];
  }

  for (let segment = 0; segment < segments.length; segment += 1) {
    for (const char of segments[segment]) {
      if (RUNIC.test(char)) {
        if (!values.length) {
          startSegment = segment;
          start = offsets[segment];
        }
        endSegment = segment;
        values.push(runeIndex.get(char));
        offsets[segment] += 1;
      } else if (char === "/" || /\s/u.test(char)) {
        continue;
      } else {
        flush();
      }
    }
  }
  flush();
  return new Map(pages.map((page) => [page.page, page.words]));
}

const pages = pageWords();
const allWords = [...pages.values()].flat();
assert.equal(allWords.length, 2864);

const eligiblePairs = [];
const sourceIndexHits = [];
const lengthHits = [];
const equalGp0Hits = [];
const fullHits = [];

for (const [page, words] of pages) {
  for (let i = 0; i + 1 < words.length; i += 1) {
    const current = words[i];
    const next = words[i + 1];
    eligiblePairs.push({ page, current, next });
    if (current.gp0 < 0 || current.gp0 >= tokens.length) continue;

    const sourceIndex = low60(tokens[current.gp0]);
    if (sourceIndex < 0 || sourceIndex >= signedWords.length) continue;
    const selected = signedWords[sourceIndex];
    const base = {
      page,
      currentOrdinal: current.ordinal,
      currentStart: current.start,
      currentEnd: current.end,
      currentLength: current.length,
      currentGp0: current.gp0,
      currentToken: tokens[current.gp0],
      sourceIndex,
      selectedWord: selected.word,
      selectedLength: selected.length,
      selectedGp0: selected.gp0,
      nextOrdinal: next.ordinal,
      nextStart: next.start,
      nextEnd: next.end,
      nextLength: next.length,
      nextGp0: next.gp0,
    };
    sourceIndexHits.push(base);

    if (selected.length !== current.length) continue;
    lengthHits.push(base);

    if (selected.gp0 !== next.gp0) continue;
    equalGp0Hits.push(base);

    if (selected.gp0 < 0 || selected.gp0 >= tokens.length) continue;
    const nextPointer = low60(tokens[selected.gp0]);
    if (nextPointer !== next.start) continue;

    fullHits.push({
      ...base,
      selectedToken: tokens[selected.gp0],
      nextPointer,
    });
  }
}

assert.deepEqual(fullHits, [{
  page: 38,
  currentOrdinal: 9,
  currentStart: 49,
  currentEnd: 53,
  currentLength: 5,
  currentGp0: 95,
  currentToken: "0Z",
  sourceIndex: 35,
  selectedWord: "FOUND",
  selectedLength: 5,
  selectedGp0: 36,
  nextOrdinal: 10,
  nextStart: 54,
  nextEnd: 56,
  nextLength: 3,
  nextGp0: 36,
  selectedToken: "0s",
  nextPointer: 54,
}]);

console.log(JSON.stringify({
  status: "PASS: low-base60 forward pointer transfers uniquely to p38 FOUND next-word chain",
  operation: "p50[GP0] -> low base60 digit, zero-origin, forward",
  population: {
    whollyPageContainedWords: allWords.length,
    forwardAdjacentSamePagePairs: eligiblePairs.length,
    pairsWithValidSignedWordIndex: sourceIndexHits.length,
    pairsAlsoPreservingCurrentWordLength: lengthHits.length,
    pairsAlsoWithSelectedGp0EqualNextCipherGp0: equalGp0Hits.length,
    fullTransferredChains: fullHits.length,
  },
  equalGp0Hits,
  fullHits,
  classification:
    "cross-route transfer of independently selected READ OUT low-digit opcode; p38 observation was recognized before this census, so uniqueness is a family charge rather than a blind discovery p-value.",
}, null, 2));
