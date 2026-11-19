"use strict";

/**
 * SFT for the p28 THE -> signed-2016 DIRECTION -> p29 selector.
 *
 * It reconstructs the p28 DH state and local THE endpoint, finds the
 * authenticated 2016 THE occurrence whose word index self-locates p28,
 * follows its immediate DIRECTION token to p29 under the same index
 * convention, then checks the previously known p39-red-triad repeated-root
 * property without scanning for a target page.
 *
 * Node.js 22, CommonJS, read-only, no third-party dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const readText = (relative) =>
  fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");
const readJson = (relative) => JSON.parse(readText(relative));

const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const ink = readJson("resources/liber-primus/lp2-ink-annotations.json");
const table = readJson("resources/liber-primus/lp2-grid-256.json");
const transcription = readText("resources/liber-primus/lp2-transcription.txt");
const signed2016 = readText("resources/historical/cicada2016-4gq25-outguess.asc");

const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const M = 29;

/** @param {number} value @returns {number} */
const mod = (value) => ((value % M) + M) % M;

/** @param {number} base @param {number} exponent @param {number} modulus */
function modPow(base, exponent, modulus) {
  let result = 1 % modulus;
  let x = ((base % modulus) + modulus) % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = (result * x) % modulus;
    x = (x * x) % modulus;
    e = Math.floor(e / 2);
  }
  return result;
}

/** @param {number} a @param {number} b */
function gcdInt(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

/** @param {number} value @param {number} modulus */
function inverse(value, modulus) {
  if (gcdInt(value, modulus) !== 1) return null;
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  return null;
}

/** @param {string} text @returns {number[]} */
function values(text) {
  return [...text]
    .map((char) => runeIndex.get(char))
    .filter((value) => value !== undefined);
}

/** @param {string} line @returns {number[][]} */
function fragments(line) {
  return line
    .split(/[-.]/u)
    .map(values)
    .filter((fragment) => fragment.length > 0);
}

/** @param {number[]} fragment @returns {number[]} */
function outerH(fragment) {
  if (fragment.length < 2) return [];
  return [mod(fragment[0] - fragment.at(-1)), mod(fragment[0] + fragment.at(-1))];
}

/** @param {[number,number]} pair @returns {[number,number]} */
function hPair(pair) {
  return [mod(pair[0] - pair[1]), mod(pair[0] + pair[1])];
}

/** @param {[number,number]} pair @returns {[number,number]} */
function hInverse(pair) {
  const inv2 = 15;
  return [mod((pair[0] + pair[1]) * inv2), mod((pair[1] - pair[0]) * inv2)];
}

/** @param {number[]} vector */
function transliterate(vector) {
  return vector.map((value) => corpus.translit[value]).join("");
}

/** @param {number[]} coefficients @param {number} x */
function evaluate(coefficients, x) {
  let value = 0;
  for (const coefficient of coefficients) value = mod(value * x + coefficient);
  return value;
}

/** @param {number[]} coefficients @param {number} x */
function evaluateDerivative(coefficients, x) {
  const degree = coefficients.length - 1;
  let value = 0;
  for (let i = 0; i < degree; i += 1) {
    value = mod(value * x + coefficients[i] * (degree - i));
  }
  return value;
}

/** @param {number[]} coefficients */
function repeatedRoots(coefficients) {
  const roots = [];
  for (let x = 0; x < M; x += 1) {
    if (
      evaluate(coefficients, x) === 0 &&
      evaluateDerivative(coefficients, x) === 0
    ) roots.push(x);
  }
  return roots;
}

/*
 * Reconstruct the calibrated p28 state from the literal-DH line.
 */
const p28Lines = parts[28].trim().split("/");
const dhFragments = fragments(p28Lines[5]);
assert.equal(dhFragments.length, 5);
assert.equal(transliterate(dhFragments[0]), "DH");

const stream = dhFragments.flatMap(outerH);
assert.deepEqual(stream, [15, 2, 14, 4, 12, 12, 23, 12, 8, 19]);

const g = dhFragments.length;
const a = 6;
const b = stream[0];
const K = stream[1];
const candidates = [];

for (const p of new Set(stream)) {
  if (![2,3,5,7,11,13,17,19,23].includes(p) || g >= p || b >= p) continue;
  const A = modPow(g, a, p);
  const B = modPow(g, b, p);
  const shared = modPow(A, b, p);
  if (
    shared === K &&
    shared === modPow(B, a, p) &&
    stream.includes(A) &&
    stream.includes(B)
  ) candidates.push({p,g,a,b,A,B,K});
}
assert.deepEqual(candidates, [{p:23,g:5,a:6,b:15,A:8,B:19,K:2}]);

const state = {...candidates[0], e: inverse(b, 22)};
assert.equal(state.e, 3);

/*
 * Recheck the source-local p28 HERE -> THE consequence.
 */
const firstLine = fragments(p28Lines[0]);
const firstEndpoints = /** @type {[number,number]} */ ([
  firstLine[0][0], firstLine[0].at(-1),
]);
const secondEndpoints = /** @type {[number,number]} */ ([
  firstLine[1][0], firstLine[1].at(-1),
]);
const firstH = hPair(firstEndpoints);
const secondH = hPair(secondEndpoints);
assert.deepEqual(firstH, [8,18]);
assert.deepEqual(secondH, [4,18]);
assert.equal(mod(firstH[0] * state.b), secondH[0]);
assert.equal(firstH[1], secondH[1]);

const predictedTheH = [mod(secondH[0] * state.b), secondH[1]];
assert.deepEqual(predictedTheH, [state.K, state.p - state.g]);
assert.equal(transliterate(predictedTheH), "THE");
assert.deepEqual(hInverse(/** @type {[number,number]} */ (predictedTheH)), [10,8]);

/*
 * Parse the authenticated natural-language signed body.
 */
const signedStart = signed2016.indexOf("Hello.");
const signedEnd = signed2016.indexOf("-----BEGIN PGP SIGNATURE-----");
assert.ok(signedStart >= 0 && signedEnd > signedStart);
const body = signed2016
  .slice(signedStart, signedEnd)
  .replace(/\b7A35090F\b/g, "");
const words = body.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(words.length, 43);

const lower = words.map((word) => word.toLowerCase());
const theIndices = [];
for (let i = 0; i < lower.length; i += 1) {
  if (lower[i] === "the") theIndices.push(i);
}
assert.deepEqual(theIndices, [1,7,12,17,22,28]);

/*
 * The project page label p28 is a zero-based physical-page index. Exactly
 * one authenticated THE occurrence has the same zero-based word index.
 * The equivalent one-based statement is physical page29 <-> signed word29.
 */
const currentPage = 28;
const selfLocatingThe = theIndices.filter((index) => index === currentPage);
assert.deepEqual(selfLocatingThe, [28]);

const directionIndex = currentPage + 1;
assert.equal(lower[directionIndex], "direction");
assert.equal(directionIndex, 29);

// Origin covariance: converting both sides to one-based numbering gives the
// same physical route 29 -> 30, with no origin fork.
assert.equal(currentPage + 1, 29);
assert.equal(selfLocatingThe[0] + 1, 29);
assert.equal(directionIndex + 1, 30);
const selectedNextPage = directionIndex;
assert.equal(selectedNextPage, 29);

/*
 * The p39 red triad supplies G = 15X^2+5X+27 = 15(X-24)^2 over GF29.
 * Test the source-selected p29 only after the signed route has selected it.
 */
const red39 = ink.pages
  .find((page) => page.page === 39)
  .red_spans
  .find((span) => span.start === 119 && span.length === 3);
assert.ok(red39);
assert.deepEqual(
  corpus.pages.find((page) => page.page === 39).indices
    .slice(red39.start, red39.start + red39.length),
  [27,5,15]
);
const G = [15,5,27];
assert.equal(evaluate(G, 24), 0);
assert.equal(evaluateDerivative(G, 24), 0);

const unknownRunePages = corpus.pages.filter(
  (page) => page.page < 56 && page.indices.length > 0
);
assert.equal(unknownRunePages.length, 55);

const pagesWithRepeatedRoot24 = unknownRunePages
  .filter((page) => repeatedRoots(page.indices).includes(24))
  .map((page) => page.page);
assert.deepEqual(pagesWithRepeatedRoot24, [29]);

const selectedPage = corpus.pages.find((page) => page.page === selectedNextPage);
assert.ok(selectedPage);
assert.ok(repeatedRoots(selectedPage.indices).includes(24));

/*
 * The printed 256-cell numerical table independently has the same repeated
 * root. Charge all 55 unknown rune pages plus the table and require a shared
 * repeated root. The only page/table shared repeated-root pair is p29/root24.
 */
assert.equal(table.bytes.length, 256);
const gridPoly = table.bytes.map((value) => value % M);
const gridRepeated = repeatedRoots(gridPoly);
assert.ok(gridRepeated.includes(24));

const pageTableSharedRepeatedRoots = [];
for (const page of unknownRunePages) {
  const pageRoots = repeatedRoots(page.indices);
  const shared = pageRoots.filter((root) => gridRepeated.includes(root));
  if (shared.length) {
    pageTableSharedRepeatedRoots.push({page:page.page, roots:shared});
  }
}
assert.deepEqual(pageTableSharedRepeatedRoots, [{page:29,roots:[24]}]);

console.log(JSON.stringify({
  status:"PASS",
  p28:{
    state,
    predictedTheH,
    currentProjectPage:currentPage,
    currentPhysicalPage:currentPage+1,
  },
  signed2016:{
    wordCount:words.length,
    theZeroBasedIndices:theIndices,
    theOneBasedPositions:theIndices.map((index)=>index+1),
    selfLocatingThe:{
      zeroBasedWordIndex:selfLocatingThe[0],
      oneBasedWordPosition:selfLocatingThe[0]+1,
      token:words[selfLocatingThe[0]],
    },
    follower:{
      zeroBasedWordIndex:directionIndex,
      oneBasedWordPosition:directionIndex+1,
      token:words[directionIndex],
      selectedProjectPage:selectedNextPage,
      selectedPhysicalPage:selectedNextPage+1,
    },
  },
  p29Gate:{
    redP39LowFirst:[27,5,15],
    highFirstG:G,
    repeatedRoot:24,
    unknownRunePages:unknownRunePages.length,
    pagesWithRepeatedRoot24,
    tableRepeatedRoots:gridRepeated,
    pageTableSharedRepeatedRoots,
  },
  classification:
    "Conditional source-selected p29 gate: local p28 THE self-locates at authenticated signed word/page index28; its immediate DIRECTION follower selects p29 under the same origin convention. That independently selected page is the sole unknown rune page carrying the p39-G repeated root24 and the sole page sharing a repeated root with the numeric table. This resolves the prior p29 page-postselection objection conditional on the THE/source-index interpretation; it does not yet specify how to invert p29.",
}, null, 2));
