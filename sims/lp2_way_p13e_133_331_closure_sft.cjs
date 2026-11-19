"use strict";

/**
 * SFT for the source-selected WAY -> p13:e=3 -> historical 133/331 closure.
 *
 * Node.js 22, CommonJS, read-only.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const historicalHtml = read("resources/cicada2014-onion7-index.html");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);\nparts.splice(50, 0, ""); // physical p50 is the non-rune numerical table
const M = 29;
const mod29 = (value) => ((value % M) + M) % M;

/** @param {number} a @param {number} b */
function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

/** @param {number} value @param {number} modulus */
function inverse(value, modulus) {
  assert.equal(gcd(value, modulus), 1);
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  throw new Error("inverse not found");
}

/** @param {string} source @returns {number[]} */
function runes(source) {
  return [...source].flatMap((char) =>
    runeIndex.has(char) ? [runeIndex.get(char)] : []
  );
}

/** @param {number} page @returns {number[][]} */
function physicalLines(page) {
  return parts[page]
    .split("/")
    .map(runes)
    .filter((line) => line.length > 0);
}

/** @param {number[]} values */
function primeSum(values) {
  return values.reduce((sum, value) => sum + corpus.prime[value], 0);
}

/**
 * Evaluate the n-th formal derivative of descending coefficients at x.
 *
 * @param {number[]} coefficients
 * @param {number} x
 * @param {number} order
 */
function derivativeValue(coefficients, x, order) {
  let current = coefficients.slice();
  for (let step = 0; step < order; step += 1) {
    const degree = current.length - 1;
    current = current
      .slice(0, -1)
      .map((coefficient, index) =>
        mod29(coefficient * (degree - index))
      );
  }

  let value = 0;
  for (const coefficient of current) {
    value = mod29(value * x + coefficient);
  }
  return value;
}

const state = Object.freeze({
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
});
const e = inverse(state.b, state.p - 1);
assert.equal(e, 3);

// Reproduce the already committed p29 derivative -> WAY candidate minimally.
const p29 = corpus.pages.find((page) => page.page === 29).indices;
const repeatedRoot = 24;
assert.equal(derivativeValue(p29, repeatedRoot, 0), 0);
assert.equal(derivativeValue(p29, repeatedRoot, 1), 0);
const thirdDerivative = derivativeValue(p29, repeatedRoot, e);
assert.equal(thirdDerivative, 7);
assert.equal(corpus.translit[thirdDerivative], "W");

// Signed-2013 H positive-degree pair is [24,26] = AY in the upstream route.
assert.equal(corpus.translit[24] + corpus.translit[26], "AY");
const wayGp = [thirdDerivative, 24, 26];
assert.equal(wayGp.map((value) => corpus.translit[value]).join(""), "WAY");

// Authenticated signed-2016 source, natural-language words only.
const bodyStart = signed2016.indexOf("Hello.");
const signatureStart = signed2016.indexOf("-----BEGIN PGP SIGNATURE-----");
assert.ok(bodyStart >= 0 && signatureStart > bodyStart);
const body = signed2016
  .slice(bodyStart, signatureStart)
  .replace(/\b7A35090F\b/g, "");
const words = body.match(/[A-Za-z]+/g) || [];
assert.equal(words.length, 43);
const upper = words.map((word) => word.toUpperCase());

const wayIndices = [];
for (let index = 0; index < upper.length; index += 1) {
  if (upper[index] === "WAY") wayIndices.push(index);
}
assert.deepEqual(wayIndices, [13]);

const selectedPage = wayIndices[0];
const selectedLine = e;
assert.equal(selectedPage, 13);
assert.equal(selectedLine, 3);
assert.equal(String(selectedPage) + String(selectedLine), "133");

const selectedRunes = physicalLines(selectedPage)[selectedLine - 1];
assert.equal(selectedRunes.length, 23);
const selectedPrimeSum = primeSum(selectedRunes);
assert.equal(selectedPrimeSum, 1229);

// Solved p57 PARABLE heading fixes the GP-prime modulus 449.
const p57Sentences = parts[57].split(".");
const parableHeading = runes(p57Sentences[0]);
const parableHeadingPrimeSum = primeSum(parableHeading);
assert.equal(parableHeadingPrimeSum, 449);

const residue = selectedPrimeSum % parableHeadingPrimeSum;
assert.equal(residue, 331);

// Inspect historical labels only after the source-selected receiver is fixed.
assert.match(historicalHtml, /<title>133<\/title>/);
assert.match(historicalHtml, /<div id="331">/);
const imageNames = [...historicalHtml.matchAll(/<img src="(\d+\.jpg)"/g)]
  .map((match) => match[1]);
assert.equal(imageNames.length, 58);
assert.equal(imageNames[0], "0.jpg");
assert.equal(imageNames.at(-1), "57.jpg");

// Complete fixed family: six THE followers -> page index, line e=3.
const theIndices = [];
for (let index = 0; index < upper.length; index += 1) {
  if (upper[index] === "THE") theIndices.push(index);
}
assert.deepEqual(theIndices, [1, 7, 12, 17, 22, 28]);

const family = theIndices.map((theIndex) => {
  const followerIndex = theIndex + 1;
  const follower = upper[followerIndex];
  const lines = physicalLines(followerIndex);
  assert.ok(lines.length >= e, "page lacks selected line e");
  const line = lines[e - 1];
  const sum = primeSum(line);
  return {
    theIndex,
    followerIndex,
    follower,
    page: followerIndex,
    line: e,
    runeCount: line.length,
    primeSum: sum,
    residue: sum % parableHeadingPrimeSum,
    titleCode: String(followerIndex) + String(e),
  };
});

assert.deepEqual(
  family.map(({follower, page, line, runeCount, primeSum, residue}) => ({
    follower,
    page,
    line,
    runeCount,
    primeSum,
    residue,
  })),
  [
    {follower:"PATH",      page:2,  line:3, runeCount:22, primeSum:1226, residue:328},
    {follower:"DEVOTED",   page:8,  line:3, runeCount:17, primeSum:802,  residue:353},
    {follower:"WAY",       page:13, line:3, runeCount:23, primeSum:1229, residue:331},
    {follower:"MAP",       page:18, line:3, runeCount:22, primeSum:1085, residue:187},
    {follower:"ROAD",      page:23, line:3, runeCount:17, primeSum:834,  residue:385},
    {follower:"DIRECTION", page:29, line:3, runeCount:22, primeSum:1132, residue:234},
  ]
);

const id331Hits = family.filter((row) => row.residue === 331);
assert.deepEqual(id331Hits, [
  {
    theIndex: 12,
    followerIndex: 13,
    follower: "WAY",
    page: 13,
    line: 3,
    runeCount: 23,
    primeSum: 1229,
    residue: 331,
    titleCode: "133",
  },
]);

console.log(JSON.stringify({
  status: "PASS",
  state: {...state, e},
  p29Way: {
    repeatedRoot,
    derivativeOrder: e,
    derivativeValue: thirdDerivative,
    fixedSuffix: [24, 26],
    gp: wayGp,
    text: "WAY",
  },
  signedWay: {
    zeroBasedIndices: wayIndices,
    selectedPage,
    selectedLine,
    concatenatedCode: "133",
  },
  parable: {
    headingPrimeSum: parableHeadingPrimeSum,
  },
  selectedReceiver: {
    page: selectedPage,
    line: selectedLine,
    runeCount: selectedRunes.length,
    primeSum: selectedPrimeSum,
    residue,
  },
  family,
  historical: {
    title133: true,
    id331: true,
    images: imageNames.length,
    firstImage: imageNames[0],
    lastImage: imageNames.at(-1),
  },
  classification:
    "Retrospective source-chain closure: p29-derived WAY is uniquely signed index13; authenticated numeric-direction semantics select p13 and e=3 selects line3, reconstructing title133 without parsing the title. P13:3 prime sum1229 mod solved PARABLE449 equals id331, uniquely among all six THE-follower pages under the same fixed line/modulus grammar.",
}, null, 2));
