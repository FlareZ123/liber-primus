"use strict";

/**
 * Original-source, source-selected candidate for the 2016 instruction that
 * "words are the map ... numbers are the direction."
 *
 * One original table byte B[s] is a mixed-radix 9-by-29 address:
 *   chapter = floor(B[s] / 29), word = B[s] % 29.
 * The addressed complete original printed word supplies the next table
 * cell via its Gematria Primus prime sum modulo the table's 256 positions.
 *
 * The input dimensions (nine image-visible chapters, 29 GP symbols, 256
 * printed source bytes) are fixed; this interpretation remains unverified.
 * It produces no plaintext or key and does not apply a cipher to LP2.
 *
 * Run from repository root: node sims/lp2_p50_ninechapter_29word_primepointer_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const {byte_rows: grid} = require("../resources/liber-primus/base60-grid.json");
const {parseSharedCorpus, physicalLP2Page} = require("./lp2_word_pages.cjs");

const bytes = grid.flat();
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const chapterPageRanges = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const parsed = parseSharedCorpus();
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.runeCount, 12956);
const chapters = chapterPageRanges.map(([first, last]) =>
  parsed.words.filter(word => {
    const page = physicalLP2Page(word.startPage);
    return page >= first && page <= last;
  }));
assert.deepEqual(chapters.map(items => items.length),
  [158, 255, 383, 437, 224, 326, 378, 669, 66]);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
/** @param {string} runes */
function primeSum(runes) {
  return [...runes].reduce((sum, rune) =>
    sum + corpus.prime[runeIndex.get(rune)], 0);
}

/** @param {number} byte */
function selectedWord(byte) {
  const chapter = Math.floor(byte / 29);
  const ordinal = byte % 29;
  const word = chapters[chapter][ordinal];
  assert.ok(word);
  return {chapter, ordinal, word};
}
const nextByValue = Array.from({length: 256}, (_, byte) =>
  primeSum(selectedWord(byte).word.runes) % 256);
const edges = bytes.map(byte => nextByValue[byte]);
const fixed = edges.flatMap((destination, index) =>
  destination === index ? [index] : []);

assert.deepEqual(fixed, [255]);
assert.equal(bytes[255], 80);
const last = selectedWord(bytes[255]);
assert.deepEqual([last.chapter, last.ordinal], [2, 22]);
assert.equal(last.word.runes, "ᚣᛋᚻᚢᛚ");
assert.equal(physicalLP2Page(last.word.startPage), 8);
assert.equal(primeSum(last.word.runes), 255);
assert.equal(edges[255], 255);

/**
 * @param {number} seed Zero-based grid-cell index.
 * @param {readonly number[]} transitions
 */
function follow(seed, transitions) {
  const visited = new Set();
  const path = [];
  let current = seed;
  while (!visited.has(current)) {
    visited.add(current);
    path.push(current);
    current = transitions[current];
  }
  return {path, repeated: current, reachesFinal: visited.has(255)};
}

const wisdom = follow(1033 % 256, edges);
const identifier = follow(3301 % 256, edges);
assert.deepEqual(wisdom.path, [9, 27, 44, 37, 255]);
assert.equal(wisdom.repeated, 255);
assert.deepEqual(identifier.path, [229, 91, 210, 183, 156, 171, 148, 167, 101, 187]);
assert.equal(identifier.repeated, 156);

/* The first direct proposed cipher consumer uses the newly selected
 * five-rune source word as the ordinary repeating GP29 Vigenere key for
 * original p55. A source-selected key candidate is not yet an authored
 * instruction to use Vigenere; this bound tests the simplest inverse. */
const key = [...last.word.runes].map(rune => runeIndex.get(rune));
assert.deepEqual(key, [26, 15, 8, 1, 20]);
const p55 = corpus.pages[55].indices;
assert.equal(p55.length, 76);
const mod29 = value => (value % 29 + 29) % 29;
/** @param {number[]} values */
function coincidence(values) {
  const count = Array(29).fill(0);
  for (const symbol of values) count[symbol]++;
  return count.reduce((n, f) => n + f * (f - 1), 0) /
    (values.length * (values.length - 1));
}
/**
 * Enumerate every legal literal-F bypass history in the authentic p56
 * skip architecture. All non-F ciphertext must consume key and decode
 * to a non-F plaintext rune. Cipher F may be bypassed or consumed.
 * @param {-1|1} sign
 */
function skipAware(sign) {
  let states = new Map([[0, {plain: [], bypass: []}]]);
  let firstImpossible = null;
  for (let i = 0; i < p55.length; i++) {
    const next = new Map();
    for (const [used, item] of states) {
      if (p55[i] === 0) {
        next.set(used, {
          plain: [...item.plain, 0],
          bypass: [...item.bypass, i]
        });
      }
      const decoded = mod29(p55[i] + sign * key[used % key.length]);
      if (decoded !== 0) {
        next.set(used + 1, {
          plain: [...item.plain, decoded],
          bypass: item.bypass
        });
      }
    }
    states = next;
    if (states.size === 0 && firstImpossible === null) firstImpossible = i;
  }
  return {states: [...states].map(([used, item]) => ({
    used, bypass: item.bypass, ioc: coincidence(item.plain),
    first32: item.plain.slice(0, 32).map(x => corpus.translit[x]).join(" ")
  })), firstImpossible};
}
const directMinus = p55.map((c, i) => mod29(c - key[i % key.length]));
const directPlus = p55.map((c, i) => mod29(c + key[i % key.length]));
const fMinus = skipAware(-1);
const fPlus = skipAware(1);
assert.equal(coincidence(directMinus), 0.030175438596491227);
assert.equal(coincidence(directPlus), 0.03754385964912281);
assert.equal(fMinus.states.length, 1);
assert.deepEqual(fMinus.states[0].bypass, [15, 25]);
assert.equal(fMinus.states[0].ioc, 0.03614035087719298);
assert.equal(fPlus.states.length, 0);
assert.equal(fPlus.firstImpossible, 33);

/* This is a conditional, retrospectively selected diagnostic null. The
 * source word map and complete byte multiset are frozen; only their
 * assignments to the 256 physical cells are shuffled. It is not a
 * multiple-search-corrected probability of Cicada authorship. */
let seed = 0x331c274b;
/** @returns {number} */
function random32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const trials = 100000;
let finalFixed = 0;
let seed9ReachesFinal = 0;
let conjunction = 0;
let conjunctionWithinFive = 0;
let anyFixed = 0;
for (let sample = 0; sample < trials; sample++) {
  const values = bytes.slice();
  for (let i = values.length - 1; i > 0; i--) {
    const j = random32() % (i + 1);
    [values[i], values[j]] = [values[j], values[i]];
  }
  const proposedEdges = values.map(value => nextByValue[value]);
  const eventFinal = proposedEdges[255] === 255;
  const reached = follow(9, proposedEdges);
  if (eventFinal) finalFixed++;
  if (reached.reachesFinal) seed9ReachesFinal++;
  if (eventFinal && reached.reachesFinal) {
    conjunction++;
    if (reached.path.length <= 5) conjunctionWithinFive++;
  }
  if (proposedEdges.some((dest, index) => dest === index)) anyFixed++;
}
assert.deepEqual([finalFixed, seed9ReachesFinal, conjunction,
  conjunctionWithinFive, anyFixed], [1529, 19887, 249, 78, 63489]);

console.log(JSON.stringify({
  claim: "Conditional source-derived self-pointer, not a recovered cipher",
  source: "nine original visual chapters; 29 GP symbols; 256 printed base60 bytes",
  mappedOriginalWords: chapters.map(words => words.length),
  fixedCell: fixed,
  cell255: {
    printedByte: bytes[255],
    chapter: last.chapter,
    wordOrdinalZeroBased: last.ordinal,
    physicalPage: physicalLP2Page(last.word.startPage),
    runes: last.word.runes,
    primeSum: primeSum(last.word.runes)
  },
  originalPaths: {source1033: wisdom, source3301: identifier},
  conditionalNull: {
    trials, finalFixed, seed9ReachesFinal, conjunction,
    conjunctionWithinFive, anyFixed
  },
  directSelectedWordKey: {
    minusIoC: coincidence(directMinus), plusIoC: coincidence(directPlus),
    skipAwareMinus: fMinus, skipAwarePlus: fPlus,
    conclusion: "No native GP29 plaintext under source-word repeating additive key"
  },
  plaintextRecovered: 0
}, null, 2));
