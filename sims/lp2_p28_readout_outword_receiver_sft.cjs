"use strict";

/**
 * Downstream gate for the p28 READ OUT candidate.
 *
 * Reproduces three frozen literal interpretations:
 * 1. read outward from the exact p28 center using the already selected H map;
 * 2. READ OUT as printed-order serialization of the p50 outer perimeter and
 *    a direct p55 additive key under the already selected numeral states;
 * 3. READ OUT as the literal solved p56 word OUT, then test its independently
 *    visible word number against the post-SHED p50 navigation state.
 *
 * Node.js 22, CommonJS, no third-party dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildSourceNativeTrigramModel } = require("./lp1_source_native_trigram_model.cjs");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const lp1Reference = read("resources/liber-primus/lp1-plaintext-reference.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const physicalParts = transcription.split(/^\s*%\s*$/m);

/** @param {number} n @returns {number} */
function mod29(n) {
  return ((n % 29) + 29) % 29;
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base, exponent, modulus) {
  let result = 1;
  let factor = base % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    e = Math.floor(e / 2);
  }
  return result;
}

/** @param {number[]} pair @returns {number[]} */
function hadamardPair(pair) {
  return [mod29(pair[0] - pair[1]), mod29(pair[0] + pair[1])];
}

/** @param {string} text @returns {number[]} */
function runes(text) {
  return [...text]
    .map((char) => runeIndex.get(char))
    .filter((value) => value !== undefined);
}

/** @param {string} text @returns {number[][]} */
function words(text) {
  return (text.replace(/\/\s*/gu, "").match(/[\u16A0-\u16FF]+/gu) || []).map((word) =>
    [...word].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  );
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => {
    if (value === 21) return "ING";
    if (value === 27) return "IO";
    return corpus.translit[value];
  }).join("");
}

/** @param {number[]} values @returns {number} */
function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

/** @param {number[]} values @returns {number} */
function gp1(values) {
  return values.reduce((sum, value) => sum + value + 1, 0);
}

/** @param {number[]} values @returns {number} */
function gpPrime(values) {
  return values.reduce((sum, value) => sum + corpus.prime[value], 0);
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value] += 1;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (values.length * (values.length - 1));
}

/** @param {string} token @param {string} alphabet @returns {number} */
function numeralValue(token, alphabet) {
  return alphabet.indexOf(token[0]) * alphabet.length + alphabet.indexOf(token[1]);
}

const model = buildSourceNativeTrigramModel({ corpus, referenceText: lp1Reference });
const p28 = runes(physicalParts[28]);
assert.equal(p28.length, 269);
const center = 134;
assert.equal(p28[center], 9);

// Frozen READ OUT reconstruction.
const p28Words = words(physicalParts[28]);
assert.equal(p28Words.length, 59);
assert.deepEqual(p28Words[27], [28, 24, 10, 1, 20]);
const sourceSpan = [p28[center], ...p28Words[27]];
const readOut = [
  modPow(sourceSpan[0], 3, 29),
  ...sourceSpan.slice(1).map((value) => modPow(value, 27, 29)),
];
assert.equal(spell(readOut), "READOUT");

// Literal interpretation A: center-out H traversal.
const centerOut = [modPow(p28[center], 3, 29)];
for (let distance = 1; distance <= center; distance += 1) {
  centerOut.push(...hadamardPair([p28[center - distance], p28[center + distance]]));
}
assert.equal(centerOut.length, p28.length);
const centerOutScore = model.scoreStream(centerOut).mean;
assert.ok(Math.abs(centerOutScore - (-3.417075848286591)) < 1e-12);

// Literal interpretation B: printed-order OUTER p50 cells as p55 key.
const tableTokens = grid.pages.flatMap((page) => page.tokens);
const table60 = grid.pages.flatMap((page) => page.bytes);
assert.equal(tableTokens.length, 256);
assert.equal(table60.length, 256);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
const table59 = tableTokens.map((token) => numeralValue(token, alphabet59));
const boundary = [];
for (let index = 0; index < 256; index += 1) {
  const row = Math.floor(index / 8);
  const col = index % 8;
  if (row === 0 || row === 31 || col === 0 || col === 7) boundary.push(index);
}
assert.equal(boundary.length, 76);
const p55 = corpus.pages.find((page) => page.page === 55).indices;
assert.equal(p55.length, 76);

const outerKeys = {
  base60: boundary.map((index) => mod29(table60[index])),
  base59: boundary.map((index) => mod29(table59[index])),
  shed: boundary.map((index) => mod29(table60[index] - table59[index])),
};
const outerResults = {};
for (const [name, key] of Object.entries(outerKeys)) {
  const plain = p55.map((value, index) => mod29(value - key[index]));
  outerResults[name] = {
    score: model.scoreStream(plain).mean,
    ioc: ioc(plain),
    text: spell(plain),
  };
}
assert.ok(Math.abs(outerResults.base60.score - (-3.4281429643381642)) < 1e-12);
assert.ok(Math.abs(outerResults.base59.score - (-3.4401085437553056)) < 1e-12);
assert.ok(Math.abs(outerResults.shed.score - (-3.420939201250331)) < 1e-12);

// Literal interpretation C: READ the solved word OUT.
const p56Section = solved.sections.find((section) => /p56/i.test(section.name));
const p57Section = solved.sections.find((section) => /p57/i.test(section.name));
assert.ok(p56Section && p57Section);
const p56Words = words(p56Section.source_text);
const p57Words = words(p57Section.source_text);
assert.equal(p56Words.length, 25);
assert.equal(p57Words.length, 20);

const outPositions = p56Words
  .map((word, index) => ({ word, position: index + 1 }))
  .filter((row) => spell(row.word) === "OUT");
assert.equal(outPositions.length, 1);
const out = outPositions[0];
assert.equal(out.position, 23);
assert.equal(gp0(out.word), 20);
assert.equal(gp1(out.word), 23);
assert.equal(gpPrime(out.word), 69);

// OUT is one of only two p56 GP1 self-indexing words.
const selfIndexing = p56Words
  .map((word, index) => ({
    position: index + 1,
    word: spell(word),
    gp1: gp1(word),
  }))
  .filter((row) => row.position === row.gp1);
assert.deepEqual(selfIndexing, [
  { position: 21, word: "TO", gp1: 21 },
  { position: 23, word: "OUT", gp1: 23 },
]);

// In the already selected post-SHED base59 state, OUT's independent word
// position selects p50 cell 23. Its value 86 is unique in the whole table.
assert.equal(tableTokens[out.position], "1R");
assert.equal(table59[out.position], 86);
assert.equal(table60[out.position], 87);
const value86Cells = table59
  .map((value, index) => ({ value, index }))
  .filter((row) => row.value === 86)
  .map((row) => row.index);
assert.deepEqual(value86Cells, [23]);

const p57Metrics = [];
for (let index = 0; index < p57Words.length; index += 1) {
  const word = p57Words[index];
  p57Metrics.push(
    { position: index + 1, word: spell(word), metric: "gp0", value: gp0(word) },
    { position: index + 1, word: spell(word), metric: "gp1", value: gp1(word) },
    { position: index + 1, word: spell(word), metric: "gpp", value: gpPrime(word) },
  );
}

// Family control: every solved p56 word position is used as the p50 address.
// Under base59, exactly one position lands on any p57 word metric.
const positionHits59 = [];
for (let index = 0; index < p56Words.length; index += 1) {
  const position = index + 1;
  const value = table59[position];
  const hits = p57Metrics.filter((candidate) => candidate.value === value);
  if (hits.length) {
    positionHits59.push({
      position,
      word: spell(p56Words[index]),
      token: tableTokens[position],
      value,
      hits,
    });
  }
}
assert.deepEqual(positionHits59, [{
  position: 23,
  word: "OUT",
  token: "1R",
  value: 86,
  hits: [{ position: 9, word: "WE", metric: "gpp", value: 86 }],
}]);

const we = p57Words.find((word) => spell(word) === "WE");
assert.ok(we);
assert.equal(gpPrime(we), 86);

console.log(JSON.stringify({
  status: "PASS",
  p28Candidate: {
    sourceSpan: spell(sourceSpan),
    decoded: spell(readOut),
  },
  rejectedLiteralReads: {
    centerOutH: {
      score: centerOutScore,
      head: spell(centerOut.slice(0, 80)),
    },
    printedOrderOuter76P55: outerResults,
  },
  outWordReceiver: {
    out: {
      position: out.position,
      gp0: gp0(out.word),
      gp1: gp1(out.word),
      gpPrime: gpPrime(out.word),
    },
    selfIndexingP56: selfIndexing,
    p50: {
      address: out.position,
      token: tableTokens[out.position],
      base59: table59[out.position],
      base60: table60[out.position],
      base59Value86Cells: value86Cells,
    },
    base59AllP56PositionToP57MetricHits: positionHits59,
  },
  classification:
    "READ OUT gains one source-constrained navigation consequence: literal OUT uniquely self-indexes at p56 word23, whose fixed post-SHED p50 address yields unique value86=GP-prime(WE). The final output-type interpretation remains underselected, so this supports but does not by itself authenticate the six-rune plaintext candidate.",
}, null, 2));
