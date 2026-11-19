"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split("%").slice(0, 55);

/** @param {number} base @param {number} exponent @returns {number} */
function pow29(base, exponent) {
  let out = 1;
  let x = ((base % 29) + 29) % 29;
  let e = ((exponent % 28) + 28) % 28;
  if (base === 0 && exponent > 0) return 0;
  while (e > 0) {
    if (e & 1) out = (out * x) % 29;
    x = (x * x) % 29;
    e = Math.floor(e / 2);
  }
  return out;
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.ok(page >= 0 && page <= 55 && page !== 50);
  return parts[page <= 49 ? page : page - 1];
}

/**
 * @param {string} source
 * @returns {{runes:number[],words:Array<{word:number,start:number,values:number[]}>}}
 */
function parsePage(source) {
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  const flush = () => {
    if (!current.length) return;
    words.push({word: words.length + 1, start, values: current.slice()});
    current = [];
  };

  for (const char of [...source]) {
    if (runeSet.has(char)) {
      const value = runeIndex.get(char);
      runes.push(value);
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return {runes, words};
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("").toLowerCase();
}

const dictionaryWords = read("resources/control/english_wordfreq_textblob.txt")
  .toLowerCase()
  .split(/\s+/u)
  .filter(Boolean);
for (const relative of [
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt",
]) {
  dictionaryWords.push(...(read(relative).toLowerCase().match(/[a-z]+/gu) || []));
}
const lexicon = new Set(
  dictionaryWords.filter((word) => /^[a-z]+$/u.test(word) && word.length >= 3),
);

/** @param {string} text @returns {string[][]} */
function parses(text) {
  const out = [];
  if (lexicon.has(text)) out.push([text]);
  for (let cut = 3; cut <= text.length - 3; cut += 1) {
    const left = text.slice(0, cut);
    const right = text.slice(cut);
    if (lexicon.has(left) && lexicon.has(right)) out.push([left, right]);
  }
  return out;
}

const rows = [];
const pageNumberedFive = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const source = physicalPart(page);
  const parsed = parsePage(source);
  const periods = (source.match(/\./g) || []).length;

  for (const word of parsed.words) {
    if (word.values.length !== 5 || word.start === 0) continue;
    const input = [parsed.runes[word.start - 1], ...word.values];
    const output = [
      pow29(input[0], periods),
      ...input.slice(1).map((value) => pow29(value, ((page - 1) % 28 + 28) % 28)),
    ];
    const text = spell(output);
    const wordParses = parses(text);
    const row = {
      page,
      periods,
      wordExponent: ((page - 1) % 28 + 28) % 28,
      word: word.word,
      start: word.start,
      input,
      output,
      text,
      parses: wordParses,
      pageNumbered: word.word === page,
    };
    rows.push(row);
    if (row.pageNumbered) pageNumberedFive.push(row);
  }
}

assert.equal(rows.length, 314);
assert.equal(pageNumberedFive.length, 9);

const p28 = pageNumberedFive.find((row) => row.page === 28);
assert.ok(p28);
assert.equal(p28.periods, 3);
assert.equal(p28.wordExponent, 27);
assert.deepEqual(p28.input, [9, 28, 24, 10, 1, 20]);
assert.deepEqual(p28.output, [4, 28, 23, 3, 1, 16]);
assert.equal(p28.text, "readout");
assert.deepEqual(p28.parses, [["read", "out"]]);

const phraseHits = rows.filter((row) => row.parses.length > 0);
assert.deepEqual(phraseHits.map((row) => [row.page, row.word, row.text]), [[5, 37, "putatt"], [28, 28, "readout"]]);
const pageNumberedPhraseHits = pageNumberedFive.filter(
  (row) => row.parses.length > 0,
);
assert.deepEqual(pageNumberedPhraseHits.map((row) => [row.page, row.word, row.text]), [[28, 28, "readout"]]);

console.log(JSON.stringify({
  status: "PASS",
  rule: {
    boundaryExponent: "printed period count on the same physical page",
    wordExponent: "physical page number minus 1, reduced mod28",
    p28WordExponentMeaning: "27 = multiplicative inverse exponent on nonzero GP29 values",
  },
  p28,
  controls: {
    allFiveRunePredecessorObjects: rows.length,
    allPhraseHits: phraseHits,
    pageNumberedFiveRuneObjects: pageNumberedFive.map((row) => ({
      page: row.page,
      periods: row.periods,
      word: row.word,
      start: row.start,
      text: row.text,
      parses: row.parses,
    })),
    pageNumberedPhraseHits,
  },
}, null, 2));
