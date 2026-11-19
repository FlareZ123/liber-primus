"use strict";

/**
 * Agent17 SFT: charge the signed-2016 MAP/ROAD/DIRECTION clause-anchor
 * coordinate family under the existing page=index / word=index+1 grammar.
 * Node.js 22 / CommonJS. Reads canonical repository resources only.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} segment @returns {number} */
function physicalPage(segment) {
  return segment >= 50 ? segment + 1 : segment;
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} values @returns {number[]} */
function hSequence(values) {
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

/** @param {number[]} values @param {number} split @returns {number[]} */
function lineWrapUnion(values, split) {
  return [
    ...hSequence(values),
    ...hSequence(values.slice(0, split)),
    ...hSequence(values.slice(split)),
  ];
}

/** @param {number[]} values @returns {{best:number,runs:number[][]}} */
function longestConsecutiveRuns(values) {
  const set = new Set(values);
  let best = 0;
  let runs = [];
  for (let start = 0; start < 29; start += 1) {
    let end = start;
    while (end < 29 && set.has(end)) end += 1;
    const length = end - start;
    if (length > best) {
      best = length;
      runs = length ? [[start, end - 1]] : [];
    } else if (length === best && length > 0) {
      runs.push([start, end - 1]);
    }
  }
  return {best, runs};
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @typedef {{segment:number,offset:number,value:number}} Site */
/** @typedef {{page:number,ordinal:number,start:number,values:number[],breaks:number[]}} Word */

/** @type {Map<number, Word[]>} */
const wordsByPage = new Map();
/** @type {Site[]} */
let current = [];
/** @type {number[]} */
let breaks = [];
const offsets = Array(58).fill(0);
let segment = 0;

function finishWord() {
  if (current.length === 0) return;
  const segments = [...new Set(current.map((site) => site.segment))];
  if (segments.length === 1) {
    const page = physicalPage(segments[0]);
    if (page <= 55) {
      if (!wordsByPage.has(page)) wordsByPage.set(page, []);
      const pageWords = wordsByPage.get(page);
      pageWords.push({
        page,
        ordinal: pageWords.length + 1,
        start: current[0].offset,
        values: current.map((site) => site.value),
        breaks: breaks.slice(),
      });
    }
  }
  current = [];
  breaks = [];
}

for (const character of transcription) {
  if (character === "%") {
    segment += 1;
  } else if (runeIndex.has(character)) {
    current.push({segment, offset: offsets[segment], value: runeIndex.get(character)});
    offsets[segment] += 1;
  } else if (character === "/") {
    if (current.length > 0) breaks.push(current.length);
  } else if (/\s/u.test(character)) {
    // Physical whitespace does not terminate a printed word.
  } else {
    finishWord();
  }
}
finishWord();

const signedBody = signed2016
  .slice(signed2016.indexOf("Hello."), signed2016.indexOf("-----BEGIN PGP SIGNATURE-----"))
  .replace(/\b7A35090F\b/g, "");
const source = signedBody.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(source.length, 43);
const upper = source.map((word) => word.toUpperCase());

const anchors = {
  theMap: 17,
  map: 18,
  theRoad: 22,
  road: 23,
  theDirection: 28,
  direction: 29,
};
assert.deepEqual(
  Object.values(anchors).map((index) => upper[index]),
  ["THE", "MAP", "THE", "ROAD", "THE", "DIRECTION"]
);

const anchorIndices = Object.values(anchors);
const rows = [];
for (const pageIndex of anchorIndices) {
  const pageWords = wordsByPage.get(pageIndex) || [];
  for (const wordIndex of anchorIndices) {
    const word = pageWords[wordIndex];
    if (!word) continue;
    const union = word.breaks.length === 1
      ? lineWrapUnion(word.values, word.breaks[0])
      : hSequence(word.values);
    rows.push({
      pageIndex,
      pageWord: upper[pageIndex],
      wordIndex,
      wordWord: upper[wordIndex],
      ordinal: wordIndex + 1,
      start: word.start,
      length: word.values.length,
      breaks: word.breaks,
      ...longestConsecutiveRuns(union),
    });
  }
}
rows.sort((a, b) => b.best - a.best || a.pageIndex - b.pageIndex || a.wordIndex - b.wordIndex);

const semantic = rows.find((row) =>
  row.pageIndex === anchors.theDirection && row.wordIndex === anchors.map
);
assert.ok(semantic);

const allThe = upper
  .map((word, index) => ({word, index}))
  .filter((row) => row.word === "THE")
  .map((row) => row.index);
assert.deepEqual(allThe, [1,7,12,17,22,28]);

const theToMap = [];
for (const pageIndex of allThe) {
  const word = (wordsByPage.get(pageIndex) || [])[anchors.map];
  if (!word) continue;
  const union = word.breaks.length === 1
    ? lineWrapUnion(word.values, word.breaks[0])
    : hSequence(word.values);
  theToMap.push({
    pageIndex,
    pageWord: upper[pageIndex],
    wordIndex: anchors.map,
    ordinal: anchors.map + 1,
    start: word.start,
    length: word.values.length,
    breaks: word.breaks,
    ...longestConsecutiveRuns(union),
  });
}
theToMap.sort((a, b) => b.best - a.best || a.pageIndex - b.pageIndex);

console.log(JSON.stringify({
  status: "PASS",
  sourceAnchors: anchors,
  anchorFamily: {
    rows: rows.length,
    ranking: rows,
  },
  literalMapDirectionCoordinate: semantic,
  theToMapFamily: theToMap,
}, null, 2));
