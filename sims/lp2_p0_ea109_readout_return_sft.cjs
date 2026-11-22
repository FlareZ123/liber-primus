"use strict";

/**
 * SFT: EA prime109 -> p0 word109 -> GP0/p50 -> READ OUT start80.
 *
 * Reproduces the downstream consequence of Agent46's frozen ROAD/LEAD/EA
 * selector. The values of the prime-selected word are inspected only after
 * its start109 is fixed. Also enumerates the exact seven-word geometry across
 * the unknown corpus and calibrates the simple return-to80 predicate.
 *
 * Node.js 22, CommonJS, no third-party dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^\s*%\s*$/m);
const alphabet59 = grid.alphabet.replace("f", "");
const tableTokens = grid.pages.flatMap((page) => page.tokens);
const table60 = grid.pages.flatMap((page) => page.bytes);

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/**
 * @param {string} text
 * @returns {Array<{start:number,end:number,values:number[]}>}
 */
function parseWords(text) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  const flush = () => {
    if (!current.length) return;
    words.push({start, end: offset - 1, values: current.slice()});
    current = [];
  };

  for (const char of [...text]) {
    if (runeSet.has(char)) {
      if (!current.length) start = offset;
      current.push(runeIndex.get(char));
      offset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {number[]} values @returns {number} */
function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

/** @param {number} left @param {number} right @returns {[number,number]} */
function H(left, right) {
  return [((left - right) % 29 + 29) % 29, (left + right) % 29];
}

/** @param {number[]} values @returns {number[]} */
function hShell(values) {
  const out = [];
  for (
    let left = 0, right = values.length - 1;
    left < right;
    left += 1, right -= 1
  ) {
    out.push(...H(values[left], values[right]));
  }
  if (values.length % 2 === 1) {
    out.push(values[Math.floor(values.length / 2)]);
  }
  return out;
}

/** @param {string} token @returns {number|null} */
function base59(token) {
  const high = alphabet59.indexOf(token[0]);
  const low = alphabet59.indexOf(token[1]);
  if (high < 0 || low < 0) return null;
  return high * 59 + low;
}

const p0 = parseWords(physicalPart(0));
const readOutReceiver = p0.slice(17, 21);
assert.deepEqual(
  readOutReceiver.map((word) => [word.start, word.end, word.values.length]),
  [[80,82,3], [83,89,7], [90,94,5], [95,102,8]]
);

const theWord = p0[21];
const roadWord = p0[22];
const afterRoad = p0[23];

assert.deepEqual(
  [theWord.start, theWord.end, theWord.values.length],
  [103,104,2]
);
assert.deepEqual(
  [roadWord.start, roadWord.end, roadWord.values.length],
  [105,108,4]
);

// Frozen upstream LEAD -> SHED -> EA selection.
const ea = corpus.translit.indexOf("EA");
assert.equal(ea, 28);
assert.equal(corpus.prime[ea], 109);
assert.equal(afterRoad.start, corpus.prime[ea]);

// New downstream receiver inspection.
assert.deepEqual(afterRoad, {
  start: 109,
  end: 110,
  values: [14,26],
});
const address = gp0(afterRoad.values);
assert.equal(address, 40);
assert.equal(tableTokens[address], "1K");
assert.equal(table60[address], 80);
assert.equal(base59(tableTokens[address]), 79);
assert.equal(readOutReceiver[0].start, 80);

// The same frozen p=23 H packet supplies a reciprocal self-index.
const packet = readOutReceiver.flatMap((word) => hShell(word.values));
assert.equal(packet.length, 23);
assert.equal(address % 23, 17);
assert.equal(packet[(address % 23) - 1], ea);
assert.equal(corpus.prime[packet[(address % 23) - 1]], afterRoad.start);

// Whole-corpus controls.
let totalWords = 0;
let return80Words = 0;
let reciprocalPacketWords = 0;
let combinedPacketAndReturn80 = 0;
const reciprocalHits = [];
const combinedHits = [];
const exactSevenWordGeometry = [];

for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const words = parseWords(physicalPart(page));
  totalWords += words.length;

  for (let wordIndex = 0; wordIndex < words.length; wordIndex += 1) {
    const word = words[wordIndex];
    const sum = gp0(word.values);
    const returns80 = sum < table60.length && table60[sum] === 80;
    if (returns80) return80Words += 1;

    const remainder = sum % 23;
    if (remainder === 0) continue;
    const packetValue = packet[remainder - 1];
    if (corpus.prime[packetValue] !== word.start) continue;

    reciprocalPacketWords += 1;
    const row = {
      page,
      word: wordIndex + 1,
      start: word.start,
      end: word.end,
      length: word.values.length,
      gp0: sum,
      remainder,
      packetValue,
      packetRune: corpus.translit[packetValue],
      prime: corpus.prime[packetValue],
      p50Base60: sum < table60.length ? table60[sum] : null,
    };
    reciprocalHits.push(row);

    if (returns80) {
      combinedPacketAndReturn80 += 1;
      combinedHits.push(row);
    }
  }

  for (let index = 0; index + 6 < words.length; index += 1) {
    const window = words.slice(index, index + 7);
    const lengths = window.map((word) => word.values.length);
    if (lengths.join(",") === "3,7,5,8,2,4,2") {
      exactSevenWordGeometry.push({
        page,
        firstWord: index + 1,
        start: window[0].start,
        end: window[6].end,
        lengths,
      });
    }
  }
}

assert.equal(totalWords, 2928);
assert.equal(return80Words, 111);
assert.equal(reciprocalPacketWords, 8);
assert.equal(combinedPacketAndReturn80, 1);
assert.deepEqual(combinedHits, [{
  page: 0,
  word: 24,
  start: 109,
  end: 110,
  length: 2,
  gp0: 40,
  remainder: 17,
  packetValue: 28,
  packetRune: "EA",
  prime: 109,
  p50Base60: 80,
}]);
assert.deepEqual(exactSevenWordGeometry, [{
  page: 0,
  firstWord: 18,
  start: 80,
  end: 110,
  lengths: [3,7,5,8,2,4,2],
}]);

const p0Return80 = p0
  .map((word, index) => ({
    word: index + 1,
    start: word.start,
    end: word.end,
    length: word.values.length,
    gp0: gp0(word.values),
  }))
  .filter((row) =>
    row.gp0 < table60.length && table60[row.gp0] === 80);

assert.deepEqual(p0Return80, [
  {word:24,start:109,end:110,length:2,gp0:40},
  {word:25,start:111,end:113,length:3,gp0:40},
  {word:27,start:117,end:121,length:5,gp0:37},
]);

console.log(JSON.stringify({
  status: "PASS",
  upstreamFrozenSelector: {
    shedInner: "EA",
    gpValue: ea,
    prime: corpus.prime[ea],
    selectedWordStart: afterRoad.start,
  },
  returnEdge: {
    word: afterRoad,
    gp0: address,
    token: tableTokens[address],
    base60: table60[address],
    base59: base59(tableTokens[address]),
    readOutStart: readOutReceiver[0].start,
  },
  controls: {
    totalUnknownWords: totalWords,
    simpleReturn80Words: return80Words,
    reciprocalPacketWords,
    combinedPacketAndReturn80,
    reciprocalHits,
    combinedHits,
    p0Return80,
    exactSevenWordGeometry,
  },
  classification:
    "Downstream local navigation holdout. EA prime109 selects the next word; its untouched GP0 both self-indexes EA through the frozen p=23 packet and returns through p50/base60 to READ OUT start80; no plaintext is assigned to the word.",
}, null, 2));
