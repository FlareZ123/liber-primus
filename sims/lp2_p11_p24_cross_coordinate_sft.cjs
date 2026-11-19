"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} values @returns {number[]} */
function Hpair(values) {
  const out = [];
  let left = 0;
  let right = values.length - 1;
  while (left < right) {
    out.push(mod29(values[left] - values[right]), mod29(values[left] + values[right]));
    left += 1;
    right -= 1;
  }
  if (left === right) out.push(values[left]);
  return out;
}

/** @param {number[]} values @returns {number[]} */
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

/** @param {number[]} values @returns {boolean} */
function isUnitRun(values) {
  if (values.length < 2) return false;
  const step = values[1] - values[0];
  return Math.abs(step) === 1
    && values.every((value, index) => index === 0 || value - values[index - 1] === step);
}

/** @param {number[]} values @returns {number[]} */
function increasing(values) {
  return values.slice().sort((a, b) => a - b);
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const pages = parts.map((text, segment) => ({
  page: segment >= 50 ? segment + 1 : segment,
  words: [],
  offset: 0,
}));
let current = [];
let startSegment = 0;
let endSegment = 0;
let startOffset = 0;
let crossing = 0;

/** Flush one canonical printed word. */
function flushWord() {
  if (!current.length) return;
  if (startSegment === endSegment) {
    const page = pages[startSegment];
    page.words.push({
      page: page.page,
      ordinal: page.words.length + 1,
      start: startOffset,
      values: current.slice(),
    });
  } else {
    crossing += 1;
  }
  current = [];
}

for (let segment = 0; segment < parts.length; segment += 1) {
  for (const char of [...parts[segment]]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) {
        startSegment = segment;
        startOffset = pages[segment].offset;
      }
      endSegment = segment;
      current.push(value);
      pages[segment].offset += 1;
    } else if (char !== "/" && !/\s/u.test(char)) {
      flushWord();
    }
  }
}
flushWord();

assert.equal(crossing, 32);
assert.equal(pages.flatMap((page) => page.words).length, 2864);
const wordsByPage = new Map(pages.map((page) => [page.page, page.words]));

/** @param {number} page @param {number} ordinal */
function getWord(page, ordinal) {
  return (wordsByPage.get(page) || [])[ordinal - 1] || null;
}

const clear = signed2016.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clear);
const source = (clear[1].match(/\b[A-Za-z]+\b/gu) || []).map((word) => word.toUpperCase());
assert.equal(source.length, 43);

const tape = grid.pages.flatMap((page) => page.tokens);
const alpha60 = grid.alphabet;

/** @param {number} address @returns {number} */
function low60(address) {
  assert.ok(Number.isInteger(address) && address >= 0 && address < tape.length);
  const value = alpha60.indexOf(tape[address][1]);
  assert.ok(value >= 0);
  return value;
}

// Independently established full unit-run packets on the direct numbered route.
const p11 = getWord(11, 12);
const p24 = getWord(24, 25);
const p42 = getWord(42, 43);
assert.ok(p11 && p24 && p42);
assert.deepEqual(p11.values, [11, 14]);
assert.deepEqual(p24.values, [27, 15]);
assert.deepEqual(p42.values, [16, 0, 14]);

const unitPackets = [
  {selector: "IS11", values: increasing(Hpair(p11.values))},
  {selector: "AND24", values: increasing(Hpair(p24.values))},
  {selector: "OPENPGP42", values: increasing(Hpair(p42.values))},
];
assert.deepEqual(unitPackets, [
  {selector: "IS11", values: [25, 26]},
  {selector: "AND24", values: [12, 13]},
  {selector: "OPENPGP42", values: [0, 1, 2]},
]);

// Charge every cross-coordinate made from two distinct full unit-run packets.
// Preserve the numbered-route coordinate grammar:
//   source index i -> project page i;
//   source index j -> canonical word ordinal j+1.
// Charge both assignments of packets to page/word, every packet element, and
// both live H serializations.
const crossCases = [];
for (let left = 0; left < unitPackets.length; left += 1) {
  for (let right = left + 1; right < unitPackets.length; right += 1) {
    for (const [pagePacket, wordPacket] of [
      [unitPackets[left], unitPackets[right]],
      [unitPackets[right], unitPackets[left]],
    ]) {
      for (const pageIndex of pagePacket.values) {
        for (const wordIndex of wordPacket.values) {
          const ordinal = wordIndex + 1;
          const object = getWord(pageIndex, ordinal);
          if (!object) continue;
          for (const [transform, output] of [
            ["Hpair", Hpair(object.values)],
            ["Hsplit", Hsplit(object.values)],
          ]) {
            const unitRun = isUnitRun(output)
              && output.every((value) => value >= 0 && value < source.length);
            crossCases.push({
              pagePacket: pagePacket.selector,
              wordPacket: wordPacket.selector,
              pageIndex,
              wordIndex,
              page: pageIndex,
              ordinal,
              start: object.start,
              raw: object.values,
              transform,
              output,
              unitRun,
              increasing: unitRun ? increasing(output) : null,
              words: unitRun ? increasing(output).map((index) => source[index]) : null,
            });
          }
        }
      }
    }
  }
}

const unitHits = crossCases.filter((row) => row.unitRun);
assert.deepEqual(unitHits, [{
  pagePacket: "IS11",
  wordPacket: "AND24",
  pageIndex: 26,
  wordIndex: 12,
  page: 26,
  ordinal: 13,
  start: 60,
  raw: [15, 15, 28],
  transform: "Hsplit",
  output: [16, 15, 14],
  unitRun: true,
  increasing: [14, 15, 16],
  words: ["ITS", "WORDS", "ARE"],
}]);

// Treat the unique first-stage output as a derived packet, then charge every
// cross with the three independently established packets under the same
// coordinate grammar. This is a prospective continuation test.
const derivedPacket = {
  selector: "P26W13",
  values: unitHits[0].increasing,
};
const secondStageHits = [];
for (const basePacket of unitPackets) {
  for (const [pagePacket, wordPacket] of [
    [derivedPacket, basePacket],
    [basePacket, derivedPacket],
  ]) {
    for (const pageIndex of pagePacket.values) {
      for (const wordIndex of wordPacket.values) {
        const ordinal = wordIndex + 1;
        const object = getWord(pageIndex, ordinal);
        if (!object) continue;
        for (const [transform, output] of [
          ["Hpair", Hpair(object.values)],
          ["Hsplit", Hsplit(object.values)],
        ]) {
          if (
            isUnitRun(output)
            && output.every((value) => value >= 0 && value < source.length)
          ) {
            secondStageHits.push({
              pagePacket: pagePacket.selector,
              wordPacket: wordPacket.selector,
              pageIndex,
              wordIndex,
              page: pageIndex,
              ordinal,
              start: object.start,
              raw: object.values,
              transform,
              output,
              increasing: increasing(output),
              words: increasing(output).map((index) => source[index]),
            });
          }
        }
      }
    }
  }
}
assert.deepEqual(secondStageHits, []);

// Held-out downstream closure committed before this cross-coordinate discovery.
// The frozen base60 low-digit consumer maps second THEIR25 -> MAP18 -> WORDS15,
// selecting the authenticated interval WORDS ARE THE MAP at indices15..18.
const secondTheir = 25;
const mapIndex = low60(secondTheir);
const wordsIndex = low60(mapIndex);
assert.deepEqual([secondTheir, mapIndex, wordsIndex], [25, 18, 15]);
const lowDigitClause = [15, 16, 17, 18];
assert.deepEqual(
  lowDigitClause.map((index) => source[index]),
  ["WORDS", "ARE", "THE", "MAP"]
);

const crossPacket = unitHits[0].increasing;
assert.deepEqual(crossPacket, [14, 15, 16]);
const overlap = crossPacket.filter((index) => lowDigitClause.includes(index));
assert.deepEqual(overlap, [15, 16]);
assert.deepEqual(overlap.map((index) => source[index]), ["WORDS", "ARE"]);

const completeInterval = [...new Set([
  ...unitPackets[1].values,
  ...crossPacket,
  ...lowDigitClause,
])].sort((left, right) => left - right);
assert.deepEqual(completeInterval, [12, 13, 14, 15, 16, 17, 18]);
assert.deepEqual(
  completeInterval.map((index) => source[index]),
  ["THE", "WAY", "ITS", "WORDS", "ARE", "THE", "MAP"]
);

// The p11+p24 combination is independently motivated by the already recovered
// source fragments THEIR NUMBERS and THE WAY. Report its four receivers in
// addition to the all-packet cross charge.
const p11p24 = crossCases.filter((row) =>
  (row.pagePacket === "IS11" && row.wordPacket === "AND24")
  || (row.pagePacket === "AND24" && row.wordPacket === "IS11")
);

console.log(JSON.stringify({
  status: "PASS",
  unitPackets: unitPackets.map((row) => ({
    selector: row.selector,
    indices: row.values,
    words: row.values.map((index) => source[index]),
  })),
  family: {
    crossCases: crossCases.length,
    distinctCoordinateReceivers: new Set(
      crossCases.map((row) => `${row.page}:${row.ordinal}`)
    ).size,
    serializers: ["Hpair", "Hsplit"],
  },
  p11p24,
  unitHits,
  secondStage: {
    derivedPacket,
    hits: secondStageHits,
  },
  preExistingLowDigitClosure: {
    path: [secondTheir, mapIndex, wordsIndex],
    clauseIndices: lowDigitClause,
    clauseWords: lowDigitClause.map((index) => source[index]),
    overlapIndices: overlap,
    overlapWords: overlap.map((index) => source[index]),
    completeInterval,
    completeWords: completeInterval.map((index) => source[index]),
  },
  continuationTarget: {
    prefixIndices: [12, 13],
    prefixWords: source.slice(12, 14),
    immediateContinuationIndices: [14, 15, 16],
    immediateContinuationWords: source.slice(14, 17),
    concatenated: source.slice(12, 17),
  },
  decision: "Crossing every pair of the three independently established numbered-diagonal unit packets under the existing page=index / word=index+1 coordinate grammar and both live H serializations gives one unit-run hit: NUMBERS26 x THE12 selects p26 word13, whose Hsplit output [16,15,14] orients to ITS WORDS ARE. It exactly continues THE WAY. A pre-existing low-digit route independently selects WORDS ARE THE MAP at indices15..18, overlapping the new packet on WORDS ARE and closing the authenticated interval THE WAY ITS WORDS ARE THE MAP. Reusing the derived packet under the cross grammar yields no second-stage unit run.",
}, null, 2));
