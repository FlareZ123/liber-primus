"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt").replace(/\r/g, "");
const signedProtocol = read("resources/external/2013-tcp-server-signed-source.md");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const table = grid.pages.flatMap((page) => page.tokens);
const bytes = grid.bytes;
const parts = transcription.split("%");

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {[number, number]} pair */
function hadamardPair(pair) {
  return [mod29(pair[0] - pair[1]), mod29(pair[0] + pair[1])];
}

/** @param {number[]} values */
function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

/** @param {string} raw */
function pageWords(raw) {
  const words = [];
  let current = [];
  let offset = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({
      start: offset - current.length,
      values: current.slice(),
      text: current.map((value) => corpus.translit[value]).join(""),
      gp0: gp0(current),
    });
    current = [];
  };

  for (const character of raw) {
    if (runeIndex.has(character)) {
      current.push(runeIndex.get(character));
      offset += 1;
    } else if (character === "/" || /\s/u.test(character)) {
      // Physical wraps do not terminate printed words.
    } else {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {string} raw */
function runeValues(raw) {
  return [...raw]
    .filter((rune) => runeIndex.has(rune))
    .map((rune) => runeIndex.get(rune));
}

const p28Words = pageWords(parts[28]);
assert.equal(p28Words.length, 59);
const base29Word = p28Words[44];
assert.deepEqual(base29Word.values, [0, 28, 6, 23, 17]);
assert.deepEqual([
  gp0(base29Word.values),
  gp0(base29Word.values.slice(1, -1)),
  gp0(base29Word.values.slice(2, -2)),
], [74, 57, 6]);

// The five numbered cuneiform passages close at the original p38 red 10-dot mark.
const p38Ink = ink.pages.find((page) => page.page === 38);
assert.ok(p38Ink);
assert.deepEqual(
  p38Ink.large_punctuation.filter((mark) => mark[2] === "red"),
  [[186, 10, "red"]]
);

const p38Runes = runeValues(parts[38]);
const p39Prefix = parts[39].split("&")[0];
const p39Runes = runeValues(p39Prefix);
assert.equal(p39Runes.length, 119);

const tailRunes = [
  ...p38Runes.slice(186),
  ...p39Runes,
];
const tailWords = [
  ...pageWords(parts[38])
    .filter((word) => word.start >= 186)
    .map((word) => ({ page: 38, ...word })),
  ...pageWords(p39Prefix)
    .filter((word) => word.start < 119)
    .map((word) => ({ page: 39, ...word })),
];

assert.equal(tailRunes.length, 161);
assert.equal(tailWords.length, 34);

const ordinal = 6;
const sixthRune = tailRunes[ordinal - 1];
const sixthWord = tailWords[ordinal - 1];

assert.equal(sixthRune, 19);
assert.equal(table[sixthRune], "0X");
assert.equal(sixthWord.text, "XH");
assert.equal(sixthWord.gp0, 22);
assert.equal(table[sixthWord.gp0], "0x");

// DH typing from the already selected p28 state.
const p = 23;
const a = 6;
const B = 19;
const cubeExponent = 3;
assert.equal(sixthRune, B);
assert.equal(sixthWord.gp0, p - 1);

const isHexPrefix = (token) => token === "0x" || token === "0X";
const comparable = [];
for (let n = 1; n <= tailWords.length; n += 1) {
  const runeValue = tailRunes[n - 1];
  const word = tailWords[n - 1];
  const runeToken = table[runeValue];
  const wordToken = word.gp0 < table.length ? table[word.gp0] : null;
  comparable.push({
    ordinal: n,
    runeValue,
    runeToken,
    wordGp0: word.gp0,
    wordToken,
    doubleHex: isHexPrefix(runeToken) && isHexPrefix(wordToken),
  });
}
assert.deepEqual(
  comparable.filter((row) => row.doubleHex).map((row) => row.ordinal),
  [6]
);

// Reconstruct the independently selected p27 red19 + red13 receiver.
const immediateRed13 = [];
for (const page of ink.pages) {
  for (const span of page.red_spans || []) {
    const end = span.start + span.length;
    for (const mark of page.large_punctuation || []) {
      if (mark[0] !== end || mark[1] !== 13 || mark[2] !== "red") continue;
      immediateRed13.push({
        page: page.page,
        start: span.start,
        length: span.length,
        throughH: hadamardPair([span.length, mark[1]]),
      });
    }
  }
}
assert.equal(immediateRed13.length, 16);
const p27Selector = immediateRed13.filter((row) =>
  row.throughH[0] === a && row.throughH[1] === cubeExponent
);
assert.deepEqual(p27Selector, [{
  page: 27,
  start: 0,
  length: 19,
  throughH: [6, 3],
}]);

// Literal p50 readout of the selected red punctuation count.
assert.equal(table[13], "04");
assert.equal(bytes[13], 4);
assert.equal(parseInt(table[13], 16), 0x04);

// Across all source-used large-punctuation counts, 13 alone maps to an ASCII control.
const punctuationCounts = [...new Set(
  ink.pages.flatMap((page) => (page.large_punctuation || []).map((mark) => mark[1]))
)].sort((left, right) => left - right);
assert.deepEqual(punctuationCounts, [10, 13, 23]);

const controlHits = punctuationCounts.filter((count) => {
  const token = table[count];
  if (!/^[0-9A-Fa-f]{2}$/.test(token)) return false;
  const value = parseInt(token, 16);
  return value <= 31 || value === 127;
});
assert.deepEqual(controlHits, [13]);

// ASCII 0x04 is EOT (End of Transmission); the authenticated protocol includes GOODBYE.
assert.match(signedProtocol, /\bGOODBYE\b/);

console.log(JSON.stringify({
  status: "PASS",
  p28Peel: {
    full: 74,
    inner: 57,
    center: 6,
    labels: ["BASE29", "NEXT", "6"],
  },
  nextAfterNumberedEnclosure: {
    closingMark: { page: 38, offset: 186, dots: 10 },
    tailRunes: tailRunes.length,
    tailWords: tailWords.length,
    ordinal,
    rune6: {
      value: sixthRune,
      dhType: "B",
      p50Token: table[sixthRune],
    },
    word6: {
      text: sixthWord.text,
      gp0: sixthWord.gp0,
      dhType: "p-1",
      p50Token: table[sixthWord.gp0],
    },
    uniqueDoubleHexOrdinal: 6,
  },
  p27Receiver: {
    redLength: 19,
    redDots: 13,
    throughH: [6, 3],
    p50At13: table[13],
    p50ByteAt13: bytes[13],
    literalHex: "0x04",
    asciiControl: "EOT",
  },
  punctuationControl: {
    counts: punctuationCounts,
    asciiControlCounts: controlHits,
  },
  closure: "0x04 = ASCII EOT = End of Transmission; semantic endpoint matches authenticated GOODBYE",
}, null, 2));
