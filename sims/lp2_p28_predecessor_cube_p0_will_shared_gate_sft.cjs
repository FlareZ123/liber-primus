"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(root, name), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const parts = read("resources/liber-primus/lp2-transcription.txt")
  .split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} value @param {number} exponent @returns {number} */
function power(value, exponent) {
  let result = 1;
  let base = value % 29;
  let n = exponent;
  while (n) {
    if (n % 2) result = result * base % 29;
    base = base * base % 29;
    n = Math.floor(n / 2);
  }
  return result;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = new Array(29).fill(0);
  for (const value of values) counts[value] += 1;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}

/** @param {number[]} values @returns {string} */
function latin(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/**
 * Frozen, page-local global extension of the p28 [3, 27] operation:
 * Every source rune receives x^27; a rune immediately preceding any printed
 * complete five-rune word receives x^3 instead. The cube choice wins when
 * a rune is also inside an earlier five-rune word, avoiding double decoding.
 * Every rune is transformed exactly once by a bijection of GF(29).
 *
 * @param {number} page
 * @returns {{ original:number[], values:number[], exponents:number[], words:Array<{start:number,length:number}> }}
 */
function decodePage(page) {
  assert.notEqual(page, 50);
  const printed = parts[page <= 49 ? page : page - 1];
  const original = corpus.pages[page].indices;
  const words = [];
  let start = 0;
  let length = 0;
  let offset = 0;
  const flush = () => {
    if (!length) return;
    words.push({ start, length });
    length = 0;
  };
  for (const character of printed) {
    if (runeIndex.has(character)) {
      if (!length) start = offset;
      length += 1;
      offset += 1;
    } else if (character === "-" || character === ".") {
      flush();
    }
  }
  flush();
  assert.equal(offset, original.length, "original transcription count p" + page);

  const exponents = new Array(original.length).fill(27);
  for (const word of words) {
    if (word.length === 5 && word.start > 0) exponents[word.start - 1] = 3;
  }
  const values = original.map((value, index) => power(value, exponents[index]));
  const replay = values.map((value, index) =>
    power(value, exponents[index] === 3 ? 19 : 27));
  assert.deepEqual(replay, original, "full original replay p" + page);
  return { original, values, exponents, words };
}

const p0 = decodePage(0);
const p28 = decodePage(28);
assert.ok(p28.words.some((word) => word.start === 135 && word.length === 5));
assert.ok(p0.words.some((word) => word.start === 141 && word.length === 4));

const p28Cipher = p28.original.slice(134, 140);
const p28Plain = p28.values.slice(134, 140);
assert.deepEqual(p28Cipher, [9, 28, 24, 10, 1, 20]);
assert.deepEqual(p28.exponents.slice(134, 140), [3, 27, 27, 27, 27, 27]);
assert.deepEqual(p28Plain, [4, 28, 23, 3, 1, 16]);
assert.equal(latin(p28Plain), "READOUT");

const p0Cipher = p0.original.slice(141, 145);
const p0Plain = p0.values.slice(141, 145);
assert.deepEqual(p0Cipher, [19, 16, 9, 18]);
assert.deepEqual(p0.exponents.slice(141, 145), [27, 27, 27, 27]);
assert.deepEqual(p0Plain, [26, 20, 13, 21]);
assert.notDeepEqual(p0Plain, [7, 10, 20, 20]);

// All-secret word-global alphabet relabeling also fails: a single
// permutation cannot map two distinct decoded outputs to plaintext L.
assert.notEqual(p0Plain[2], p0Plain[3]);

const heldPages = [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 52, 53];
const held = heldPages.map((page) => decodePage(page));
const heldSource = held.flatMap((item) => item.original);
const heldPlain = held.flatMap((item) => item.values);
assert.equal(heldPlain.length, 3008);

// Independent native positive: physical solved p57 is genuine plaintext.
// Encode its exact runes with the frozen exponent schedule and decode again.
const native = decodePage(57);
const nativeCipher = native.original.map((value, index) =>
  power(value, native.exponents[index] === 3 ? 19 : 27));
const nativeRecovery = nativeCipher.map((value, index) =>
  power(value, native.exponents[index]));
assert.deepEqual(nativeRecovery, native.original);
assert.equal(nativeRecovery.length, 95);

// A wrong exponent schedule cannot silently pass the native planted control.
const wrongRecovery = nativeCipher.map((value, index) =>
  power(value, native.exponents[index] === 3 ? 27 : 3));
assert.notDeepEqual(wrongRecovery, native.original);

const result = {
  status: "PASS",
  sourceRule: "p28 five-rune word predecessor^3, all other runes^27 (GF29)",
  p28: {
    cipher: p28Cipher,
    exponents: p28.exponents.slice(134, 140),
    localOutput: latin(p28Plain),
    fullPageIoC: ioc(p28.values),
    next100: latin(p28.values.slice(134, 234)),
  },
  p0: {
    cipher: p0Cipher,
    output: p0Plain,
    expectedConditionalWILL: [7, 10, 20, 20],
    localOutput: latin(p0Plain),
    pageIoC: ioc(p0.values),
    next100: latin(p0.values.slice(141, 241)),
  },
  independentOriginalHoldout: {
    pages: heldPages,
    runes: heldPlain.length,
    originalIoC: ioc(heldSource),
    inverseIoC: ioc(heldPlain),
  },
  authenticSolvedNativePositive: {
    page: 57,
    plantedRunes: nativeRecovery.length,
    exactRecovered: true,
    wrongExponentRejected: true,
  },
  verdict: "This full original, uniquely reversible shared cube law fails WILL and sustained original prose. Other evolving-state laws remain untested.",
};
console.log(JSON.stringify(result, null, 2));
