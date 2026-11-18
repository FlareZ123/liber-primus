"use strict";

/**
 * Fixed p0 receiver gate after the THE/WAY navigation cycle:
 * historical Stage04 GP29 subtraction with the two source-selected 8-rune
 * DIVINITY representations only.
 *
 * Run: node sims/lp2_p0_divinity_stage04_receiver_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const runeMap = new Map(corpus.runes.map((rune, index) => [rune, index]));
const q = 29;

/** @param {number} n */
function mod(n) {
  return (n % q + q) % q;
}

/** @param {number[]} input @param {number[]} key */
function decodeVigenere(input, key) {
  return input.map((value, i) => mod(value - key[i % key.length]));
}

/** @param {number[]} input @param {number[]} key */
function encodeVigenere(input, key) {
  return input.map((value, i) => mod(value + key[i % key.length]));
}

/** @param {number[]} input */
function ioc(input) {
  const counts = Array(q).fill(0);
  for (const value of input) counts[value] += 1;
  const numerator = counts.reduce((total, count) => total + count * (count - 1), 0);
  return numerator / (input.length * (input.length - 1));
}

/** @param {number[]} input */
function translit(input) {
  return input.map((value) => corpus.translit[value]).join("");
}

/**
 * @param {number} pageNumber
 * @returns {{index:number,start:number,length:number,indices:number[]}[]}
 */
function pageWords(pageNumber) {
  const source = transcription.split(/\r?\n%\r?\n/)[pageNumber];
  const words = [];
  let current = [];
  let offset = 0;
  let start = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({index: words.length, start, length: current.length, indices: current});
    current = [];
  };
  for (const ch of [...source]) {
    const value = runeMap.get(ch);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (ch === "-" || ch === ".") {
      flush();
    }
  }
  flush();
  return words;
}

// Historical Stage04 positive control from the signed 2014 source.
const welcome = [7,18,20,5,3,19,18,13,10,20,6,4,10,19,16,3,2,18];
const sourceStage04 = "ᚦᛗᛞᛇᚠᛗᚪᚱ5ᚢᚫᛝᚱᛝ3ᛠᛗᛇᚠᛡ";
const chunks = sourceStage04.split(/([53])/);
let keyIndex = 0;
let positive = "";
for (const part of chunks) {
  if (/^[53]$/.test(part)) {
    positive += part;
    continue;
  }
  const indices = Array.from(part, (rune) => runeMap.get(rune));
  const decoded = indices.map((value) => mod(value - welcome[keyIndex++ % welcome.length]));
  positive += decoded.map((value) => corpus.translit[value]).join("");
}
assert.equal(keyIndex, 18);
assert.equal(positive.replace("NONIAN", "NONION"), "AUOWYFGL5LCSFJ3NONION");

// The fixed receiver is the p0-p2 chapter black body: red p0 heading is 13
// runes, leaving 716 black runes across original pages0-2.
const chapter = corpus.pages.slice(0, 3).flatMap((page) => page.indices);
assert.equal(chapter.length, 729);
const body = chapter.slice(13);
assert.equal(body.length, 716);

// Source-selected key A: literal solved-p57 DIVINITY.
const literalDivinity = [23,10,1,10,9,10,16,26];
assert.equal(translit(literalDivinity), "DIUINITY");

// Source-selected key B: the actual p27 twice-shed 8-rune interior whose
// GP-prime sum equals solved-p57 DIVINITY.
const carrier = pageWords(27).find((word) => word.start === 79);
assert.ok(carrier);
assert.equal(carrier.length, 12);
const physicalInterior = carrier.indices.slice(2, -2);
assert.equal(physicalInterior.length, 8);
assert.equal(translit(physicalInterior), "NSOOCAEY");
assert.equal(
  physicalInterior.reduce((total, value) => total + corpus.prime[value], 0),
  376,
);
assert.equal(
  literalDivinity.reduce((total, value) => total + corpus.prime[value], 0),
  376,
);

const variants = [
  ["literal-p57-DIVINITY", literalDivinity],
  ["physical-p27-twice-shed-interior", physicalInterior],
].map(([name, key]) => {
  const plaintext = decodeVigenere(body, key);
  assert.deepEqual(encodeVigenere(plaintext, key), body);
  return {
    name,
    key: translit(key),
    ioc: ioc(plaintext),
    first200: translit(plaintext.slice(0, 200)),
  };
});

assert(variants.every((variant) => variant.ioc < 0.04));

process.stdout.write(JSON.stringify({
  status: "fixed p0 Stage04 DIVINITY receiver gate is negative; NO UNKNOWN PLAINTEXT",
  historicalPositive: positive.replace("NONIAN", "NONION"),
  receiver: {
    pages: [0, 1, 2],
    redHeadingRunesExcluded: 13,
    blackBodyRunes: body.length,
    originalIoC: ioc(body),
  },
  variants,
  decision: "Do not phase-search or mutate either key. The source-selected DH route still lacks a post-DH payload cipher.",
}, null, 2) + "\n");
