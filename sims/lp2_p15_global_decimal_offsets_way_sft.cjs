"use strict";

/**
 * Original p15 4x4 printed-decimal offsets into the 2014 LP2 release's
 * page0–55 GP29 rune stream. This is a CONDITIONAL indexing hypothesis,
 * not a decipherment or proof the creator intended this address rule.
 *
 * Run: node sims/lp2_p15_global_decimal_offsets_way_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));

/**
 * Source-original p15 4×4 printed numerical square, row-major from scan32.
 * The red central number 3299 is at [1,1].
 * @type {number[][]}
 */
const grid = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];

/** @type {[number,number][]} */
const clockwiseFromRed = [
  [1,1],[1,2],[2,2],[2,1],[2,0],[1,0],[0,0],[0,1],
  [0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0]
];
const inputs = clockwiseFromRed.map(([row, col]) => grid[row][col]);
assert.deepEqual(inputs, [
  3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516
]);

const unknown = corpus.pages.filter(p => p.page >= 0 && p.page <= 55)
  .flatMap(p => p.indices);
const completeLp2 = corpus.pages.filter(p => p.page >= 0 && p.page <= 57)
  .flatMap(p => p.indices);
assert.equal(unknown.length, 12956);
assert.equal(completeLp2.length, 13136);
assert.ok(inputs.every(index => index >= 0 && index < unknown.length));
assert.ok(inputs.every(index => unknown[index] === completeLp2[index]));

/**
 * @param {number[]} addresses
 * @returns {string[]}
 */
function read(addresses) {
  return addresses.map(index => corpus.translit[unknown[index]]);
}

const clockwiseZeroBased = read(inputs);
const clockwiseOneBased = read(inputs.map(index => index - 1));
const rowMajorZeroBased = read(grid.flat());
assert.deepEqual(clockwiseZeroBased, [
  "OE","W","A","Y","L","U","M","U",
  "L","H","T","G","AE","B","U","M"
]);
assert.deepEqual(clockwiseOneBased, [
  "W","G","IA","X","F","O","EO","NG",
  "H","A","EA","I","W","L","L","F"
]);
assert.deepEqual(rowMajorZeroBased, [
  "M","U","L","H","U","OE","W","T",
  "L","Y","A","G","M","U","B","AE"
]);

// All other stride-2 WAY triples in the complete original LP2 source are controls.
const way = ["W", "A", "Y"].map(letter => corpus.translit.indexOf(letter));
const wayRoots = [];
for (let i = 0; i < completeLp2.length; i++) {
  if (completeLp2[i] === way[0] &&
      completeLp2[(i - 2 + completeLp2.length) % completeLp2.length] === way[1] &&
      completeLp2[(i - 4 + completeLp2.length) % completeLp2.length] === way[2]) {
    wayRoots.push(i);
  }
}
assert.deepEqual(wayRoots, [2959, 3298, 4126]);
// The three original-rune addresses IMMEDIATELY AFTER the central red cell.
assert.equal(clockwiseZeroBased.slice(1, 4).join(""), "WAY");
// This is a coincidence candidate until a source-prescribed full readout exists.
assert.notEqual(clockwiseOneBased.slice(1, 4).join(""), "WAY");

let absolute = 0;
const locator = new Map();
for (const page of corpus.pages.filter(p => p.page <= 55)) {
  for (let i = 0; i < page.indices.length; i++) locator.set(absolute++, [page.page, i]);
}
const firstThree = inputs.slice(1,4).map(offset =>
  ({offset, original: corpus.translit[unknown[offset]], location: locator.get(offset)}));


/**
 * Bounded "words are the map" follow-up. The p15 grid is generated from the
 * distinct Fibonacci values f and prime values p_(f+1). Test only these
 * source-derived sequences as whole-word addresses, plus the printed decimal
 * cells themselves. No modulo, wrap, offset, letter-picking, or language search.
 */
const transcription = fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-transcription.txt"), "utf8"
);
const ink = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-ink-annotations.json"), "utf8"
));
const runeSet = new Set(corpus.runes);
const pageSegments = transcription.split("%").slice(0, 55);
const sourceStream = pageSegments.join("%");
const words = [];
let currentWord = "";
let wordPage = 0;
let wordStartPage = 0;
let wordLastPage = 0;
let wordStartOffset = 0;
let wordRuneOffset = 0;
function finishWord() {
  if (!currentWord) return;
  words.push({
    runes: currentWord,
    startPage: wordStartPage,
    endPage: wordLastPage,
    length: [...currentWord].length,
    startOffset: wordStartOffset,
    endOffset: wordRuneOffset - 1
  });
  currentWord = "";
}
for (const character of sourceStream) {
  if (runeSet.has(character)) {
    if (!currentWord) {
      wordStartPage = wordPage;
      wordStartOffset = wordRuneOffset;
    }
    currentWord += character;
    wordLastPage = wordPage;
    wordRuneOffset++;
  } else if (character === "%") {
    wordPage++;
  } else if (character === "/" || /\s/u.test(character)) {
    // Slash and line wrapping do not end a printed word.
  } else {
    finishWord();
  }
}
finishWord();
assert.equal(words.length, 2896);
assert.equal(wordRuneOffset, 12956);
const flattenedWordRunes = words.flatMap(word =>
  Array.from(word.runes, rune => corpus.runes.indexOf(rune))
);
assert.deepEqual(flattenedWordRunes, unknown);

const fibonacci = [0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];
const primes = [];
for (let candidate = 2; primes.length < 988; candidate++) {
  let isPrime = true;
  for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
    if (candidate % divisor === 0) { isPrime = false; break; }
  }
  if (isPrime) primes.push(candidate);
}
const primeValues = fibonacci.map(value => primes[value]); // p_(F+1)
assert.deepEqual(primeValues, [
  2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817
]);
assert.deepEqual(primeValues.map(value => Math.abs(3301 - value)), inputs);

function wordRecord(index) {
  if (index < 0 || index >= words.length) return null;
  const word = words[index];
  return {
    index,
    ordinal: index + 1,
    physicalPage: word.startPage >= 50 ? word.startPage + 1 : word.startPage,
    length: word.length,
    translit: Array.from(word.runes, rune =>
      corpus.translit[corpus.runes.indexOf(rune)]
    ).join(" ")
  };
}
const fibonacciWords = fibonacci.map(wordRecord); // F as zero-based offsets
const primeWordsZeroBased = primeValues.map(wordRecord);
const primeWordsOneBased = primeValues.map(value => wordRecord(value - 1));
const printedDecimalWords = inputs.map(wordRecord);

const p0Ink = ink.pages.find(page => page.page === 0);
assert.deepEqual(p0Ink.red_spans.map(span => span.length), [13]);
assert.deepEqual(p0Ink.large_punctuation[0], [13,13,"red"]);
assert.deepEqual(words.slice(0, 2).map(word => word.length), [8,5]);
assert.equal(words[0].runes + words[1].runes, p0Ink.red_spans[0].runes);
assert.equal(fibonacciWords[0].index, 0);
assert.equal(fibonacciWords[1].index, 1);
assert.equal(fibonacciWords[4].index, 5);
assert.equal(fibonacciWords[4].translit, "N E W B A S OE EO I NG U");
assert.equal(primeValues[2], 5);
assert.equal(primeWordsZeroBased[2].index, 5);
assert.equal(primeWordsZeroBased[2].translit, fibonacciWords[4].translit);
assert.equal(fibonacciWords[0].length + fibonacciWords[1].length, 13);
assert.equal(fibonacciWords.filter(Boolean).length, 16);
assert.equal(primeWordsZeroBased.filter(Boolean).length, 14);
assert.equal(primeWordsOneBased.filter(Boolean).length, 14);
assert.equal(printedDecimalWords.filter(Boolean).length, 5);

const wordAddressing = {
  wordCount: words.length,
  runeCount: wordRuneOffset,
  p0RedHeading: {
    firstTwoWordLengths: words.slice(0,2).map(word => word.length),
    redSpanLength: p0Ink.red_spans[0].length,
    followingPunctuation: p0Ink.large_punctuation[0],
    firstTwoFibonacciAddresses: fibonacci.slice(0,2),
    fibonacciValue5Word: fibonacciWords[4],
    primeValue5Word: primeWordsZeroBased[2]
  },
  fibonacciWordAddresses: fibonacciWords,
  primeValues,
  primeWordAddressesZeroBased: primeWordsZeroBased,
  primeWordAddressesOneBased: primeWordsOneBased,
  printedDecimalWordAddresses: printedDecimalWords
};

console.log(JSON.stringify({
  originalUnknownRunes: unknown.length,
  originalCompleteLp2Runes: completeLp2.length,
  completeLp2Stride2WAYRoots: wayRoots,
  startRed: inputs[0],
  postRed: firstThree,
  clockwiseZeroBased,
  clockwiseOneBased,
  rowMajorZeroBased,
  warning: "Three-rune exploratory apparent word; remaining 13 cells do not spell prose. No cipher/key/plaintext independently recovered."
}, null, 2));
console.log("PASS: original-source p15 rune pointer and bounded Fibonacci/prime word-address gate");
