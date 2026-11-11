"use strict";

/**
 * Original-source test of a conditional WE=86 page/offset route from LP2 p57
 * through the repeated p27/p55 ciphertext bookend to p50's numeric grid.
 * This script tests one frozen pointer-key inverse and claims no decryption.
 */
const fs = require("node:fs");
const assert = require("node:assert/strict");

const read = (path) => fs.readFileSync(path, "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const scans = read("resources/lp2-transcription.txt").split("%");
assert.equal(scans.length, 57);
assert.equal(corpus.pages.length, 58);

const values = grid.pages.flatMap((page) => page.bytes);
const tokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(values.length, 256);
assert.equal(tokens.length, 256);
assert.deepEqual(grid.pages.map((p) => [p.page, p.rows]), [
  [49, 10], [50, 13], [51, 9]
]);

/** @param {string} physicalPage */
function printedWords(physicalPage) {
  return physicalPage.replaceAll("/", "").replaceAll("\r", "")
    .replaceAll("\n", "").split(/[-.&$§,:!?]/u)
    .map((fragment) => (fragment.match(/[ᚠ-᛿]+/gu) || []).join(""))
    .filter(Boolean);
}
const words = Array.from({ length: 58 }, (_, page) =>
  page === 50 ? [] : printedWords(scans[page > 50 ? page - 1 : page]));
assert.equal(words.reduce((total, page) => total + page.length, 0), 2973);

/** @param {string} rune */
function index(rune) {
  const found = corpus.runes.indexOf(rune);
  assert(found >= 0, "invalid original GP rune");
  return found;
}
/** @param {string} word */
function wordSum(word) {
  return [...word].reduce((sum, rune) => sum + corpus.prime[index(rune)], 0);
}
/** @param {string} word */
function translit(word) {
  return [...word].map((rune) => corpus.translit[index(rune)]).join("");
}
/** @param {number} page @param {number} wordIndex */
function follow(page, wordIndex) {
  const seen = new Set();
  const trace = [];
  for (let step = 0; step < 100; step++) {
    const state = String(page) + ":" + String(wordIndex);
    if (seen.has(state)) return { kind: "cycle", trace };
    seen.add(state);
    const word = words[page]?.[wordIndex];
    if (!word) return { kind: "missing", trace };
    const number = wordSum(word);
    const nextPage = number % 58;
    const nextIndex = Math.floor(number / 58);
    trace.push({ page, wordIndex, runes: translit(word), number, nextPage, nextIndex });
    if (nextPage === 50) return { kind: "table", cell: nextIndex, trace };
    if (nextPage >= 56) return { kind: "solved", page: nextPage, index: nextIndex, trace };
    page = nextPage;
    wordIndex = nextIndex;
  }
  throw Error("unexpected word-graph length");
}
/** @param {number[]} haystack @param {number[]} needle */
function starts(haystack, needle) {
  const result = [];
  for (let i = 0; i <= haystack.length - needle.length; i++) {
    if (needle.every((value, j) => haystack[i + j] === value)) result.push(i);
  }
  return result;
}
/** @param {number} n */
function phi(n) {
  let result = n;
  for (let divisor = 2; divisor * divisor <= n; divisor++) {
    if (n % divisor === 0) {
      while (n % divisor === 0) n /= divisor;
      result -= result / divisor;
    }
  }
  if (n > 1) result -= result / n;
  return result;
}
/** @param {number[]} stream */
function ioc(stream) {
  const counts = Array(29).fill(0);
  stream.forEach((value) => counts[value]++);
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (stream.length * (stream.length - 1));
}

const source27 = corpus.pages[27].indices;
const source55 = corpus.pages[55].indices;
assert.equal(source27.length, 234);
assert.equal(source55.length, 76);
const bookend = [23, 11, 1, 17, 18, 10]; // DJU BEI, six exact GP glyphs
const occurrences = corpus.pages.filter((p) => p.page <= 55)
  .flatMap((p) => starts(p.indices, bookend).map((offset) => ({ page: p.page, offset })));
assert.deepEqual(occurrences, [{ page: 27, offset: 28 }, { page: 55, offset: 70 }]);

const title = source27.slice(0, 19);
assert.equal(title[0], 19); // M: title length is 19
assert.equal(title[1], 13);
assert.equal(title[18], 13); // P/P is the only equal mirrored payload pair
assert.equal(source27[19], 9); // first black rune N
const gpP = corpus.prime[13];
const we = corpus.prime[7] + corpus.prime[18];
const number = 2 * gpP;
assert.equal(gpP, 43);
assert.equal(we, 86);
assert.equal(number, we);
assert.equal((57 + number) % 58, 27);
assert.equal((27 + number) % 58, 55);
assert.equal(phi(number), 42);
assert.equal(28 + phi(number), 70);
assert.equal(phi(corpus.prime[9]), 28);  // N=29, p27 duplicate start
assert.equal(phi(corpus.prime[19]), 70); // M=71, p55 duplicate start

assert.equal(translit(words[27][5]), "DJU");
assert.deepEqual(words[55].slice(-2).map(translit), ["DJU", "BEI"]);
const pathDJU = follow(55, words[55].length - 2);
const pathBEI = follow(55, words[55].length - 1);
assert.equal(pathDJU.kind, "table");
assert.equal(pathDJU.cell, 2);
assert.deepEqual(pathDJU.trace.map((x) => x.number), [129, 166]);
assert.equal(pathBEI.kind, "table");
assert.equal(pathBEI.cell, 2);
assert.deepEqual(pathBEI.trace.map((x) => x.number), [
  159, 84, 152, 131, 184, 202, 265, 358,
  233, 175, 136, 89, 160, 317, 129, 166
]);
assert(pathBEI.trace.some((x) => x.page === 27 && x.wordIndex === 5));
const globalCell = grid.pages[0].rows * grid.pages[0].cols + pathBEI.cell;
assert.equal(globalCell, 82);
assert.equal(tokens[82], "3L");
assert.equal(values[82], 201);
assert.equal(tokens[83], "3D");
assert.equal(values[83], 193);
const lies = [20, 10, 18, 15].reduce((s, idx) => s + corpus.prime[idx], 0);
assert.equal(lies, 224);
assert.deepEqual([lies % 58, Math.floor(lies / 58)], [50, 3]);

let total = 0;
let pathsToCell2 = 0;
let pathsViaP27DJU = 0;
for (let page = 0; page <= 55; page++) {
  for (let w = 0; w < words[page].length; w++) {
    const route = follow(page, w);
    total++;
    if (route.kind === "table" && route.cell === 2) pathsToCell2++;
    if (route.trace.some((x) => x.page === 27 && x.wordIndex === 5)) pathsViaP27DJU++;
  }
}
assert.deepEqual([total, pathsToCell2, pathsViaP27DJU], [2928, 569, 294]);

// Source-specific p50-cell82 starts, forward pointer clock, exactly 76 original p55 runes.
// Tests: literal table byte as additive GP29 pad, or pointer displacement as GP29 direction.
let state = 82;
const bytes = [];
const directions = [];
for (let i = 0; i < source55.length; i++) {
  const next = values[state];
  bytes.push(next % 29);
  directions.push(((next - state) % 29 + 29) % 29);
  state = next;
}
const results = [bytes, directions].map((key) => {
  const plaintext = source55.map((value, i) => (value - key[i] + 29) % 29);
  return {
    ioc: ioc(plaintext),
    first30: plaintext.slice(0, 30).map((r) => corpus.translit[r]).join(" ")
  };
});
assert.equal(ioc(source55), 0.037894736842105266);
assert(Math.abs(results[0].ioc - 0.037894736842105266) < 1e-12);
assert(Math.abs(results[1].ioc - 0.047017543859649125) < 1e-12);

// Independent solved p57 word-source discriminator: only WE simultaneously
// reaches p27 from p57 and transports offset28 to the repeated p55 offset70.
const p57Candidates = words[57].map((word, bodyIndex) => ({
  bodyIndex, word: translit(word), number: wordSum(word)
})).filter((word) => (57 + word.number) % 58 === 27);
assert.deepEqual(p57Candidates, [
  { bodyIndex: 8, word: "WE", number: 86 },
  { bodyIndex: 16, word: "DIUINITY", number: 376 }
]);
const pageAndOffset = p57Candidates.map((word) => ({
  word: word.word, page: (27 + word.number) % 58, offset: 28 + phi(word.number)
}));
assert.deepEqual(pageAndOffset, [
  { word: "WE", page: 55, offset: 70 },
  { word: "DIUINITY", page: 55, offset: 212 }
]);

// Source-frozen T86 also predicts 28 original p27/p55 overlapping runes
// before the repeated six; none of those 28 is identical. The proposed
// transport is therefore only an exact six-rune bookend, not a copy cipher.
const precedingMatches = Array.from({ length: 28 }, (_, local) =>
  Number(source27[local] === source55[local + 42]))
  .reduce((sum, match) => sum + match, 0);
assert.equal(precedingMatches, 0);

// Director #410: the simplest *reversible* extended transport posits
// an arbitrary UNKNOWN 29-symbol bijection sigma, held constant over this
// source-selected 34-position p27→p55 overlay. The matched six-rune
// bookend fixes sigma on D,J,U,B,E,I. The 28 withheld preceding pairs
// violate those fixed mappings, so no secret substitution can rescue it.
const mappedOutputs = Array.from({length: 29}, () => new Set());
for (let local = 0; local < 34; local++) {
  mappedOutputs[source27[local]].add(source55[local + 42]);
}
const sourceOutputContradictions = mappedOutputs
  .flatMap((targets, runeIndex) => targets.size > 1 ? [runeIndex] : []);
assert.equal(sourceOutputContradictions.length, 9);
const anchoredFixedIndices = bookend;
assert.equal(new Set(anchoredFixedIndices).size, 6);
const forcedAnchorConflicts = Array.from({length: 28}, (_, local) => {
  const s = source27[local];
  return Number(anchoredFixedIndices.includes(s) && source55[42 + local] !== s);
}).reduce((s, v) => s + v, 0);
assert.equal(forcedAnchorConflicts, 5);
// Example: source E at p27 local10 maps to X, whereas E at local32
// in the bookend maps to E. Even non-injective deterministic maps fail.
assert.equal(source27[10], corpus.translit.indexOf("E"));
assert.equal(source27[32], corpus.translit.indexOf("E"));
assert.equal(source55[52], corpus.translit.indexOf("X"));
assert.equal(source55[74], corpus.translit.indexOf("E"));

// Director #410 word-boundary-preserving accident null: the only
// repeated complete adjacent two-word type, DJU BEI, has shape 3+3.
// Condition on that *observed* shape, count all eligible source locations,
// then state the explicit iid GP29 and hard no-repeat baselines. These are
// narrow shape-conditioned model probabilities, not discovery-adjusted p's.
const wordPairTypes = new Map();
let pageLocalPairs = 0;
let shape33Count = 0;
for (let page = 0; page <= 55; page++) {
  for (let w = 0; w + 1 < words[page].length; w++) {
    const left = words[page][w];
    const right = words[page][w + 1];
    pageLocalPairs++;
    if (left.length !== 3 || right.length !== 3) continue;
    shape33Count++;
    const key = left + "|" + right;
    const origins = wordPairTypes.get(key) || [];
    origins.push([page, w]);
    wordPairTypes.set(key, origins);
  }
}
const duplicate33Types = [...wordPairTypes.values()]
  .filter((origins) => origins.length > 1);
assert.equal(pageLocalPairs, 2873);
assert.equal(shape33Count, 182);
assert.deepEqual(duplicate33Types, [[[27, 5], [55, 15]]]);
const sameShapePairs = shape33Count * (shape33Count - 1) / 2;
const iid29ExpectedDuplicatePairs = sameShapePairs / (29 ** 6);
const hardNoRepeatExpectedPairs = sameShapePairs / (29 * 28 ** 5);
const terminalTargetExpectedMatches = (shape33Count - 1) / (29 ** 6);
assert(Math.abs(iid29ExpectedDuplicatePairs - 0.000027690575366664212) < 1e-16);
assert(hardNoRepeatExpectedPairs < 0.000034);

console.log(JSON.stringify({
  verifiedRoute: [[57, "WE"], [27, 28], [55, 70]],
  duplicateCiphertext: "DJU BEI",
  totient86: 42,
  solvedP57DualCoordinateCandidates: pageAndOffset,
  previous28RUNE_matches: precedingMatches,
  pageLocal33WordPairNull: {
    pageLocalPairs, shape33Count, duplicate33Types,
    iid29ExpectedDuplicatePairs, hardNoRepeatExpectedPairs,
    terminalTargetExpectedMatches,
    caveat: 'shape-conditioned idealized null, not discovery-adjusted significance'
  },
  anySecretStationaryBijectiveTransport: {
    stateContradictions: sourceOutputContradictions.length,
    forcedAnchorConflicts,
    possible: false
  },
  tableHandoff: { cell: globalCell, token: tokens[82], byte: values[82],
    signedWordLiesAdjacent: { cell: 83, token: tokens[83], byte: values[83] } },
  finalBEIWordRoute: pathBEI.trace,
  routeSelectivity: { total, pathsToCell2, pathsViaP27DJU },
  sourceP55IOC: ioc(source55),
  pointerByteInverse: results[0],
  pointerDirectionInverse: results[1],
  verdict: "navigation hypothesis only; no previously unknown LP2 plaintext recovered"
}, null, 2));
