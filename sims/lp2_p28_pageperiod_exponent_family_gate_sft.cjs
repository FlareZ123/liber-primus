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

/** @param {number} value @returns {number} */
function mod28(value) {
  return ((value % 28) + 28) % 28;
}

/** @param {number} base @param {number} exponent @returns {number} */
function pow29(base, exponent) {
  let out = 1;
  let factor = ((base % 29) + 29) % 29;
  let power = mod28(exponent);
  if (base === 0 && power > 0) return 0;
  while (power > 0) {
    if (power & 1) out = (out * factor) % 29;
    factor = (factor * factor) % 29;
    power = Math.floor(power / 2);
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
 * @returns {{
 *   runes:number[],
 *   words:Array<{word:number,start:number,end:number,values:number[]}>,
 *   periods:number,
 *   hyphens:number,
 *   slashes:number,
 *   lines:number
 * }}
 */
function parsePage(source) {
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  const flush = () => {
    if (!current.length) return;
    words.push({
      word: words.length + 1,
      start,
      end: offset - 1,
      values: current.slice(),
    });
    current = [];
  };

  for (const char of [...source]) {
    if (runeSet.has(char)) {
      const value = runeIndex.get(char);
      assert.notEqual(value, undefined);
      runes.push(value);
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();

  const periods = (source.match(/\./g) || []).length;
  const hyphens = (source.match(/-/g) || []).length;
  const slashes = (source.match(/\//g) || []).length;
  return {
    runes,
    words,
    periods,
    hyphens,
    slashes,
    lines: slashes + 1,
  };
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
  dictionaryWords.filter((word) => /^[a-z]+$/u.test(word) && word.length >= 3)
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

/**
 * @param {number} page
 * @param {ReturnType<typeof parsePage>} parsed
 * @returns {Array<{name:string,value:number}>}
 */
function exponentSources(page, parsed) {
  return [
    {name: "periods", value: mod28(parsed.periods)},
    {name: "hyphens", value: mod28(parsed.hyphens)},
    {name: "slashes", value: mod28(parsed.slashes)},
    {name: "lines", value: mod28(parsed.lines)},
    {name: "words", value: mod28(parsed.words.length)},
    {name: "page", value: mod28(page)},
    {name: "pageMinus1", value: mod28(page - 1)},
    {name: "pagePlus1", value: mod28(page + 1)},
    {name: "dhInverse3", value: 3},
  ];
}

const eligible = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const parsed = parsePage(physicalPart(page));
  const centerPlus1 = (parsed.runes.length - 1) / 2 + 1;

  for (const origin of [1, 0]) {
    const wantedWord = origin === 1 ? page : page + 1;
    const word = parsed.words.find((candidate) =>
      candidate.word === wantedWord && candidate.values.length === 5
    );
    if (!word) continue;

    eligible.push({
      page,
      origin,
      word: word.word,
      start: word.start,
      end: word.end,
      centerPlus1,
      deltaStart: word.start - centerPlus1,
      parsed,
      wordValues: word.values,
    });
  }
}

assert.equal(eligible.length, 15);
const centered = eligible.filter((row) => row.deltaStart === 0);
assert.deepEqual(
  centered.map((row) => [row.page, row.origin, row.word]),
  [[28, 1, 28]]
);

const nonP28ByDistance = eligible
  .filter((row) => row.page !== 28)
  .slice()
  .sort((left, right) =>
    Math.abs(left.deltaStart) - Math.abs(right.deltaStart) ||
    left.page - right.page ||
    right.origin - left.origin
  );
assert.deepEqual(
  [nonP28ByDistance[0].page, nonP28ByDistance[0].origin,
    nonP28ByDistance[0].word, nonP28ByDistance[0].deltaStart],
  [15, 0, 16, -9]
);

const familyHits = [];
let evaluated = 0;

for (const object of eligible) {
  const sources = exponentSources(object.page, object.parsed);
  for (const boundarySide of ["predecessor", "successor"]) {
    const boundaryOffset =
      boundarySide === "predecessor" ? object.start - 1 : object.end + 1;
    if (boundaryOffset < 0 || boundaryOffset >= object.parsed.runes.length) continue;
    const boundaryRune = object.parsed.runes[boundaryOffset];

    for (const boundaryExponent of sources) {
      for (const wordExponent of sources) {
        const sourceValues =
          boundarySide === "predecessor"
            ? [boundaryRune, ...object.wordValues]
            : [...object.wordValues, boundaryRune];
        const exponents =
          boundarySide === "predecessor"
            ? [boundaryExponent.value, ...Array(5).fill(wordExponent.value)]
            : [...Array(5).fill(wordExponent.value), boundaryExponent.value];
        const transformed = sourceValues.map((value, index) =>
          pow29(value, exponents[index])
        );

        for (const direction of ["forward", "reverse"]) {
          evaluated += 1;
          const output =
            direction === "forward" ? transformed : transformed.slice().reverse();
          const text = spell(output);
          const phraseParses = parses(text);
          if (!phraseParses.length) continue;
          familyHits.push({
            page: object.page,
            origin: object.origin,
            word: object.word,
            start: object.start,
            deltaStart: object.deltaStart,
            boundarySide,
            boundarySource: boundaryExponent.name,
            boundaryExponent: boundaryExponent.value,
            wordSource: wordExponent.name,
            wordExponent: wordExponent.value,
            direction,
            text,
            parses: phraseParses,
          });
        }
      }
    }
  }
}

const exactP28Rule = familyHits.filter((hit) =>
  hit.page === 28 &&
  hit.origin === 1 &&
  hit.word === 28 &&
  hit.boundarySide === "predecessor" &&
  hit.boundarySource === "periods" &&
  hit.wordSource === "pageMinus1" &&
  hit.direction === "forward"
);
assert.equal(exactP28Rule.length, 1);
assert.equal(exactP28Rule[0].text, "readout");
assert.deepEqual(exactP28Rule[0].parses, [["read", "out"]]);

const exactRuleHits = familyHits.filter((hit) =>
  hit.boundarySource === "periods" &&
  hit.wordSource === "pageMinus1" &&
  hit.boundarySide === "predecessor" &&
  hit.direction === "forward"
);

const holdoutObject = eligible.find((row) =>
  row.page === 15 && row.origin === 0 && row.word === 16
);
assert.ok(holdoutObject);
const holdoutBoundary = holdoutObject.parsed.runes[holdoutObject.start - 1];
const holdoutOutput = [
  pow29(holdoutBoundary, holdoutObject.parsed.periods),
  ...holdoutObject.wordValues.map((value) => pow29(value, mod28(15 - 1))),
];
const holdoutText = spell(holdoutOutput);
const holdoutParses = parses(holdoutText);

const p28Hits = familyHits.filter((hit) => hit.page === 28 && hit.origin === 1);
const distinctP28NumericRules = new Map();
for (const hit of p28Hits) {
  const signature = [
    hit.boundarySide,
    hit.boundaryExponent,
    hit.wordExponent,
    hit.direction,
    hit.text,
  ].join("|");
  if (!distinctP28NumericRules.has(signature)) {
    distinctP28NumericRules.set(signature, hit);
  }
}

console.log(JSON.stringify({
  status: "PASS",
  predeclaredFamily: {
    eligibleObjects: eligible.map((row) => ({
      page: row.page,
      origin: row.origin,
      word: row.word,
      start: row.start,
      deltaStart: row.deltaStart,
      periods: row.parsed.periods,
      hyphens: row.parsed.hyphens,
      slashes: row.parsed.slashes,
      lines: row.parsed.lines,
      words: row.parsed.words.length,
    })),
    exponentSources: [
      "periods", "hyphens", "slashes", "lines", "words",
      "page", "pageMinus1", "pagePlus1", "dhInverse3",
    ],
    boundarySides: ["predecessor", "successor"],
    directions: ["forward", "reverse"],
    evaluated,
  },
  exactP28Rule: exactP28Rule[0],
  exactRuleHits,
  p28: {
    labeledPhraseHits: p28Hits.length,
    distinctNumericPhraseRules: distinctP28NumericRules.size,
    hits: p28Hits,
  },
  allFamilyPhraseHits: familyHits,
  holdout: {
    page: 15,
    origin: 0,
    word: 16,
    start: holdoutObject.start,
    deltaStart: holdoutObject.deltaStart,
    boundaryExponent: holdoutObject.parsed.periods,
    wordExponent: mod28(15 - 1),
    output: holdoutOutput,
    text: holdoutText,
    parses: holdoutParses,
  },
}, null, 2));
