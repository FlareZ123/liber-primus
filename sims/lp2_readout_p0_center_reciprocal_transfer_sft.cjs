"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^\s*%\s*$/m);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} base @param {number} exponent @returns {number} */
function pow29(base, exponent) {
  let result = 1;
  let value = mod29(base);
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * value) % 29;
    value = (value * value) % 29;
    power = Math.floor(power / 2);
  }
  return result;
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/**
 * @param {number} page
 * @returns {{runes:number[],words:Array<{number:number,start:number,end:number,values:number[]}>}}
 */
function parsePage(page) {
  const text = parts[page <= 49 ? page : page - 1];
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;

  /** @returns {void} */
  function flush() {
    if (current.length === 0) return;
    words.push({
      number: words.length + 1,
      start,
      end: runes.length - 1,
      values: current.slice(),
    });
    current = [];
  }

  for (const char of [...text]) {
    if (runeSet.has(char)) {
      if (current.length === 0) start = runes.length;
      const value = runeIndex.get(char);
      assert.notEqual(value, undefined);
      runes.push(value);
      current.push(value);
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return {runes, words};
}

/**
 * Apply the p28 power roles to an odd center-selected receiver.
 * @param {number[]} values
 * @returns {number[]}
 */
function centerCubeOuterReciprocal(values) {
  assert.equal(values.length % 2, 1);
  const center = (values.length - 1) / 2;
  return values.map((value, index) => pow29(value, index === center ? 3 : 27));
}

const p28Input = [9, 28, 24, 10, 1, 20];
const p28Output = [
  pow29(p28Input[0], 3),
  ...p28Input.slice(1).map((value) => pow29(value, 27)),
];
assert.deepEqual(p28Output, [4, 28, 23, 3, 1, 16]);
assert.equal(spell(p28Output), "READOUT");

const p0 = parsePage(0);
const selectedWords = p0.words.filter((word) => word.start >= 80 && word.end <= 102);
assert.deepEqual(selectedWords.map((word) => [word.number, word.start, word.end, word.values.length]), [
  [18, 80, 82, 3],
  [19, 83, 89, 7],
  [20, 90, 94, 5],
  [21, 95, 102, 8],
]);

const receiver = p0.runes.slice(80, 103);
assert.equal(receiver.length, 23);
assert.deepEqual(receiver, [
  21,25,2,10,25,8,14,2,13,6,26,0,21,5,11,2,24,19,10,21,10,27,26,
]);

const zeroPositions = receiver
  .map((value, index) => value === 0 ? index : -1)
  .filter((index) => index >= 0);
assert.deepEqual(zeroPositions, [11]);

for (let index = 0; index < receiver.length; index += 1) {
  if (index === 11) continue;
  assert.equal((receiver[index] * pow29(receiver[index], 27)) % 29, 1);
}

const output = centerCubeOuterReciprocal(receiver);
assert.deepEqual(output, [
  18,7,15,3,7,11,27,15,9,5,19,0,18,6,8,15,23,26,3,18,3,14,19,
]);
assert.equal(spell(output), "EWSOWJIASNCMFEGHSDYOEOXM");

const lengths = selectedWords.map((word) => word.values.length);
let cursor = 0;
const outputWords = lengths.map((length) => {
  const values = output.slice(cursor, cursor + length);
  cursor += length;
  return spell(values);
});
assert.deepEqual(outputWords, ["EWS", "OWJIASNC", "MFEGH", "SDYOEOXM"]);

const signedWords = new Set([
  "HELLO","THE","PATH","LIES","EMPTY","EPIPHANY","SEEKS","DEVOTED",
  "LIBER","PRIMUS","IS","WAY","ITS","WORDS","ARE","MAP","THEIR",
  "MEANING","ROAD","AND","NUMBERS","DIRECTION","SEEK","YOU","WILL",
  "BE","FOUND","GOOD","LUCK","BEWARE","FALSE","PATHS","VERIFY","OPENPGP",
]);
assert.ok(outputWords.every((word) => !signedWords.has(word)));

console.log(JSON.stringify({
  status: "PASS",
  positiveControl: {
    input: p28Input,
    exponents: [3,27,27,27,27,27],
    output: p28Output,
    transliteration: spell(p28Output),
  },
  p0Receiver: {
    offsets: [80,102],
    length: receiver.length,
    wordNumbers: selectedWords.map((word) => word.number),
    wordLengths: lengths,
    zeroPositions,
    input: receiver,
    output,
    outputTransliteration: spell(output),
    outputWords,
    authenticated2016WordHits: [],
  },
  decision: "Reject the exact center-cube / outer-reciprocal transfer on the selected p0 receiver.",
}, null, 2));
