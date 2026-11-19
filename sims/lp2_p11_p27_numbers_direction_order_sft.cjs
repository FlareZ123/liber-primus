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
/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
}
/** @param {number} n @returns {number|null} */
function primeRank(n) {
  if (!isPrime(n)) return null;
  let rank = 0;
  for (let value = 2; value <= n; value += 1) if (isPrime(value)) rank += 1;
  return rank;
}
/** @param {number} n @returns {number} */
function phi(n) {
  let result = n;
  let value = n;
  for (let p = 2; p * p <= value; p += 1) {
    if (value % p !== 0) continue;
    while (value % p === 0) value /= p;
    result -= result / p;
  }
  if (value > 1) result -= result / value;
  return result;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const annotations = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.ok(page >= 0 && page <= 57 && page !== 50);
  return parts[page <= 49 ? page : page - 1];
}

/**
 * @param {number} page
 * @returns {{page:number,ordinal0:number,start:number,end:number,values:number[]}[]}
 */
function pageWords(page) {
  const source = physicalPart(page);
  const out = [];
  let current = [];
  let start = 0;
  let offset = 0;

  const flush = () => {
    if (!current.length) return;
    out.push({
      page,
      ordinal0: out.length,
      start,
      end: offset,
      values: current.slice(),
    });
    current = [];
  };

  for (const ch of source) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (ch === "-" || ch === "." || ch === "&") {
      flush();
    } else if (ch === "/" || /\s/u.test(ch)) {
      // line wraps preserve a printed word
    } else {
      flush();
    }
  }
  flush();
  return out;
}

/** @param {number[]} values @returns {number} */
function primeSum(values) {
  return values.reduce((sum, value) => sum + corpus.prime[value], 0);
}

/**
 * @param {number[][]} wordValues
 * @returns {{inner:number[][],removed:number[]}}
 */
function shed(wordValues) {
  const inner = [];
  const removed = [];
  for (const values of wordValues) {
    if (values.length === 0) {
      inner.push([]);
      continue;
    }
    if (values.length === 1) {
      removed.push(values[0]);
      inner.push([]);
      continue;
    }
    removed.push(values[0], values[values.length - 1]);
    inner.push(values.slice(1, -1));
  }
  return {inner, removed};
}

// Authenticated carrier.
const clear = signed2016.split("-----BEGIN PGP SIGNATURE-----")[0];
const signedWords = clear
  .slice(clear.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());
assert.equal(signedWords.length, 43);

// P11 untouched raw receiver: same-index page/word11.
const p11Receiver = pageWords(11)[11];
assert.deepEqual(p11Receiver, {
  page: 11,
  ordinal0: 11,
  start: 49,
  end: 51,
  values: [11, 14],
});
const p11Packet = [
  mod29(p11Receiver.values[0] + p11Receiver.values[1]),
  mod29(p11Receiver.values[0] - p11Receiver.values[1]),
];
assert.deepEqual(p11Packet, [25, 26]);
assert.deepEqual(p11Packet.map((index) => signedWords[index]), ["THEIR", "NUMBERS"]);

// Charge the exact packet across every complete two-rune unknown-page word.
const packetHits = [];
let completeTwoRuneWords = 0;
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  for (const word of pageWords(page)) {
    if (word.values.length !== 2) continue;
    completeTwoRuneWords += 1;
    const packet = [
      mod29(word.values[0] + word.values[1]),
      mod29(word.values[0] - word.values[1]),
    ];
    if (packet.every((value, slot) => value === p11Packet[slot])) {
      packetHits.push({
        page,
        ordinal0: word.ordinal0,
        start: word.start,
        values: word.values,
        packet,
      });
    }
  }
}
assert.equal(completeTwoRuneWords, 465);
assert.deepEqual(packetHits, [{
  page: 11,
  ordinal0: 11,
  start: 49,
  values: [11, 14],
  packet: [25, 26],
}]);

// The packet begins the authenticated increasing source corridor.
assert.deepEqual(
  signedWords.slice(p11Packet[0], 30),
  ["THEIR", "NUMBERS", "ARE", "THE", "DIRECTION"]
);
const corridorIndices = [25, 26, 27, 28, 29];
assert.deepEqual(corridorIndices.map((index) => signedWords[index]), [
  "THEIR", "NUMBERS", "ARE", "THE", "DIRECTION",
]);

// Reconstruct the independently selected p27 red-heading numeric objects.
const p27Annotation = annotations.pages.find((page) => page.page === 27);
assert.ok(p27Annotation);
const redSpan = p27Annotation.red_spans[0];
assert.deepEqual([redSpan.start, redSpan.length], [0, 19]);
const headingWords = pageWords(27).filter(
  (word) => word.start >= redSpan.start && word.end <= redSpan.start + redSpan.length
);
assert.deepEqual(headingWords.map((word) => word.values.length), [3, 12, 4]);

const heading = headingWords.flatMap((word) => word.values);
const fullPrimeSum = primeSum(heading);
const fullPrimeRank = primeRank(fullPrimeSum);
assert.equal(fullPrimeSum, 1109);
assert.equal(fullPrimeRank, 186);

const firstShed = shed(headingWords.map((word) => word.values));
const interior = firstShed.inner.flat();
assert.equal(interior.length, 13);
assert.equal(primeSum(interior), 673);
const interiorRank = primeRank(primeSum(interior));
assert.equal(interiorRank, 122);
assert.equal(grid.bytes[interiorRank], 86);

const secondShed = shed(firstShed.inner);
assert.equal(primeSum(secondShed.removed), 233);
assert.equal(phi(233), 232);

// Solved p57 word prime sums identify the three values.
const p57Words = pageWords(57).map((word) => ({
  text: word.values.map((value) => corpus.translit[value]).join(""),
  sum: primeSum(word.values),
}));
assert.deepEqual(
  p57Words.slice(8, 11),
  [
    {text: "WE", sum: 86},
    {text: "MUST", sum: 186},
    {text: "SHED", sum: 232},
  ]
);

const valueToWord = new Map(p57Words.map((row) => [row.sum, row.text]));
const structuralValues = [
  fullPrimeRank,
  grid.bytes[interiorRank],
  phi(primeSum(secondShed.removed)),
];
assert.deepEqual(structuralValues, [186, 86, 232]);
assert.deepEqual(structuralValues.map((value) => valueToWord.get(value)), [
  "MUST", "WE", "SHED",
]);

// P11 says THEIR NUMBERS ARE THE DIRECTION. The corridor itself runs in
// increasing source-number order 25->29, so use the p27 candidate numbers in
// the same increasing direction.
const directedValues = [...structuralValues].sort((a, b) => a - b);
assert.deepEqual(directedValues, [86, 186, 232]);
const directedWords = directedValues.map((value) => valueToWord.get(value));
assert.deepEqual(directedWords, ["WE", "MUST", "SHED"]);

// There are six possible object orders; the increasing numeric direction is
// exactly the solved p57 consecutive phrase order.
const permutations = [
  [0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0],
];
const phraseHits = [];
for (const order of permutations) {
  const values = order.map((slot) => structuralValues[slot]);
  const words = values.map((value) => valueToWord.get(value));
  if (words.join(" ") === "WE MUST SHED") {
    phraseHits.push({order, values, words});
  }
}
assert.deepEqual(phraseHits, [{
  order: [1, 0, 2],
  values: [86, 186, 232],
  words: ["WE", "MUST", "SHED"],
}]);

console.log(JSON.stringify({
  status: "PASS",
  p11: {
    receiver: p11Receiver,
    rawPacket: p11Packet,
    rawWords: p11Packet.map((index) => signedWords[index]),
    completeTwoRuneWords,
    uniquePacketHits: packetHits,
  },
  sourceCorridor: {
    indices: corridorIndices,
    words: corridorIndices.map((index) => signedWords[index]),
    direction: "increasing source/page number",
  },
  p27: {
    structuralValues,
    structuralWords: structuralValues.map((value) => valueToWord.get(value)),
    directedValues,
    directedWords,
    permutationHits: phraseHits,
  },
  interpretation:
    "P11's unique untouched [sum,difference]=[25,26] packet enters the authenticated increasing corridor THEIR NUMBERS ARE THE DIRECTION. P27, the corridor's ARE page, independently yields three clear-p57 word numbers in structural order [186,86,232]=MUST/WE/SHED. Applying the corridor's increasing numerical direction orders them [86,186,232]=WE MUST SHED, resolving the ordering limitation in the p27 instruction chain without adding a new cipher or tuned coefficient.",
}, null, 2));
