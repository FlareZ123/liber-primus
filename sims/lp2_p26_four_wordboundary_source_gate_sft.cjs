"use strict";

/**
 * Original LP2 p26 FOUR receiver: line-wrap and page-corpus validity gate.
 * Node.js 22 / CommonJS. Read-only SFT, no third-party packages.
 * Source: original page 43.jpg, canonical rune/page transcription, printed p50.
 *
 * A line wrap "/" is not a word separator. A physical page "%" is not
 * a word separator either. Only printed punctuation ends a rune word.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseLP2Words } = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
/** @param {string} relative @returns {string} */
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const table = grid.pages.flatMap((page) => page.tokens);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const segments = transcription.split("%");
assert.equal(table.length, 256);
assert.equal(segments.length, 57);

/** @param {number[]} values @returns {number} */
const sum = (values) => values.reduce((a, b) => a + b, 0);
/** @param {string} runes @returns {number[]} */
const values = (runes) => [...runes].map((rune) => {
  const index = runeIndex.get(rune);
  assert.notEqual(index, undefined, "source rune must have GP index");
  return index;
});
/** @param {number[]} word */
const wordText = (word) => word.map((i) => corpus.translit[i]).join("");
/** @param {number[]} word */
const wordAddress = (word) => sum(word);
/** @param {number[]} word */
function highDigit(word) {
  const address = wordAddress(word);
  assert.ok(address < 256, "word fits literal p50 zero-based table");
  return Number(table[address][0]);
}

/**
 * For diagnosis, parse each physical rune-bearing page separately.
 * The false variant treats typography "/" as a word separator.
 * The correct variant treats "/" as a line wrap, not as punctuation.
 * Both explicitly exclude the last two solved LP2 page segments.
 * @param {string} pageText
 * @param {boolean} falseLineSeparator
 * @returns {number[][]}
 */
function parsePage(pageText, falseLineSeparator) {
  const words = [];
  let word = [];
  const flush = () => {
    if (word.length > 0) {
      words.push(word);
      word = [];
    }
  };
  for (const char of [...pageText]) {
    const rune = runeIndex.get(char);
    if (rune !== undefined) {
      word.push(rune);
    } else if (char === "/") {
      if (falseLineSeparator) flush();
    } else if (/\s/u.test(char)) {
      // Typographic whitespace is not a printed delimiter.
    } else {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {number[][]} words @returns {{index:number,words:string[],addresses:number[],high:number[]}[]} */
function fourHits(words) {
  const found = [];
  for (let i = 0; i + 3 < words.length; i += 1) {
    const slice = words.slice(i, i + 4);
    const high = slice.map(highDigit);
    if (high.join("") === "0314") {
      found.push({
        index: i,
        words: slice.map(wordText),
        addresses: slice.map(wordAddress),
        high,
      });
    }
  }
  return found;
}

/** @param {number[][]} words */
function exactWayMapEdges(words) {
  const hits = [];
  for (let i = 0; i + 1 < words.length; i += 1) {
    if (wordAddress(words[i]) === 57 && wordAddress(words[i + 1]) === 56) {
      hits.push({ index: i, words: words.slice(i, i + 2).map(wordText) });
    }
  }
  return hits;
}

const canonical = parseLP2Words(transcription);
assert.equal(canonical.runeCount, 12956);
assert.equal(canonical.words.length, 2896);
assert.equal(canonical.crossPageWords, 32);
assert.equal(segments[55].match(/[\u16a0-\u16ff]/gu).length, 85,
  "segment55 is already solved physical p56, not unknown p55");
assert.equal(segments[56].match(/[\u16a0-\u16ff]/gu).length, 95,
  "segment56 is already clear physical p57");

let falseCount = 0;
let falseWindows = 0;
let correctCount = 0;
let correctWindows = 0;
const falseHits = [];
const correctHits = [];
const trueEdges = [];

for (let p = 0; p < 55; p += 1) {
  const splitWords = parsePage(segments[p], true);
  const joinedWords = parsePage(segments[p], false);
  falseCount += splitWords.length;
  falseWindows += Math.max(splitWords.length - 3, 0);
  correctCount += joinedWords.length;
  correctWindows += Math.max(joinedWords.length - 3, 0);
  for (const hit of fourHits(splitWords)) falseHits.push({ page: p, ...hit });
  for (const hit of fourHits(joinedWords)) correctHits.push({ page: p, ...hit });
  for (const edge of exactWayMapEdges(joinedWords)) trueEdges.push({ page: p, ...edge });
}
assert.equal(falseCount, 3316);
assert.equal(falseWindows, 3151);
assert.equal(correctCount, 2928);
assert.equal(correctWindows, 2763);
assert.deepEqual(falseHits.map((hit) => hit.page), [5, 23, 26, 31]);
assert.deepEqual(correctHits.map((hit) => hit.page), [5, 23, 48, 50]);
assert.deepEqual(trueEdges, [{
  page: 26, index: 45, words: ["CHISFIN", "POENG"],
}]);

const p26Raw = segments[26];
assert.match(p26Raw, /ᚪᛖᛏ-ᛖ\/\s*ᛋᚪᛟ-/u,
  "original transcription has E/SAOE without a printed delimiter");
const falseP26 = parsePage(p26Raw, true);
const actualP26 = parsePage(p26Raw, false);
assert.equal(falseP26.length, 69);
assert.equal(actualP26.length, 59);
assert.deepEqual(fourHits(falseP26), [{
  index: 51,
  words: ["E", "SAOE", "CHISFIN", "POENG"],
  addresses: [18, 61, 57, 56],
  high: [0, 3, 1, 4],
}]);
assert.deepEqual(fourHits(actualP26), []);
assert.deepEqual(actualP26.slice(43, 49).map(wordText), [
  "YIA", "AET", "ESAOE", "CHISFIN", "POENG", "EOTHYTAEX",
].slice(0, 6).map((v, i) => v));
assert.deepEqual(actualP26.slice(44, 48).map(wordAddress), [58, 79, 57, 56]);
assert.deepEqual(actualP26.slice(44, 48).map(highDigit), [2, 1, 1, 4]);
assert.deepEqual(exactWayMapEdges(actualP26), [{
  index: 45, words: ["CHISFIN", "POENG"],
}]);

/* Full-corpus window control: page wraps also join incomplete words. */
const canonicalWords = canonical.words.map((item) => values(item.runes));
const canonicalHits = fourHits(canonicalWords);
assert.equal(canonicalWords.length - 3, 2893);
assert.equal(canonicalHits.length, 4);
assert.deepEqual(canonicalHits.map((h) => h.index), [271, 1238, 2677, 2725]);

/* Conditional selectivity after the prior table route fixed cells 48,56,57. */
const highCounts = Array.from({ length: 5 }, (_, digit) =>
  table.filter((token) => Number(token[0]) === digit).length);
assert.deepEqual(highCounts, [60, 58, 65, 56, 17]);
assert.deepEqual([table[48], table[56], table[57]], ["4D", "4E", "1w"]);
const probPrefix = (highCounts[0] / (256 - 3)) *
  (highCounts[3] / (256 - 4));
assert.ok(Math.abs(probPrefix - 0.05270092226613965) < 1e-14);

/* How many solved four-rune lexical types can first printed digit even spell? */
const solvedIndex = new Map(solved.runes.map((rune, index) => [rune, index]));
const fourLexicon = new Set();
for (const section of solved.sections) {
  let word = [];
  const flush = () => {
    if (word.length === 4) fourLexicon.add(word.join(","));
    word = [];
  };
  for (const char of [...section.source_text]) {
    const index = solvedIndex.get(char);
    if (index === undefined) flush();
    else word.push(index);
  }
  flush();
}
assert.equal(fourLexicon.size, 64);
const reachable = [...fourLexicon]
  .filter((word) => word.split(",").every((value) => Number(value) <= 4));
assert.deepEqual(reachable, ["0,3,1,4"]);

console.log(JSON.stringify({
  source: {
    runeCount: canonical.runeCount, intactWords: canonical.words.length,
    crossPageWords: canonical.crossPageWords,
    originalImage: "43.jpg", sourcePhysicalPage: 26,
    originalBoundary: "AET-E/SAOE-CHISFIN-POENG",
    trueWord: "ESAOE", trueWordAddress: 79,
    sourceRuneSegments: 55, accidentallyIncludedSolvedSegment: 55,
  },
  falseWrapParser: { words: falseCount, windows: falseWindows,
    fourHits: falseHits.map(h => ({ page: h.page, index: h.index })) },
  trueWithinPageParser: { words: correctCount, windows: correctWindows,
    fourHits: correctHits.map(h => ({ page: h.page, index: h.index })) },
  canonicalAcrossPages: { words: canonicalWords.length,
    fourWindows: canonicalWords.length - 3,
    fourHitIndices: canonicalHits.map(h => h.index) },
  p26: {
    falseWindow: fourHits(falseP26),
    actualFourWindows: fourHits(actualP26),
    correctedPreEdgeAddresses: actualP26.slice(44, 48).map(wordAddress),
    correctedPreEdgeHigh: actualP26.slice(44, 48).map(highDigit),
    genuineEdge: exactWayMapEdges(actualP26),
  },
  priorSelectedTableRoute: {
    highCounts, fixedCells: [48,56,57],
    exactConditionalPrefixChance: probPrefix,
  },
  solvedFourRuneLexicon: {
    distinctWords: fourLexicon.size, reachableWithDigit0to4: reachable,
  },
  conclusion: "The p26 FOUR/FOURTH/DH packet is a line-break artifact; only the independent 57->56 word-address edge survives.",
}, null, 2));
console.log("PASS lp2_p26_four_wordboundary_source_gate_sft");
