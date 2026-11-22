"use strict";

/**
 * End-anchored Fibonacci direct-GP p55 gate.
 *
 * Physical p55 has 76 runes, a source-annotated red 13-dot punctuation mark
 * at local offset 76, and an 8-rune final printed line. Reading backward from
 * that marked end gives the consecutive Fibonacci block lengths 8,13,21,34.
 * For each block length N, take the last N runes of physical page N. In
 * forward p55 order the fixed key is therefore suffix34 || suffix21 ||
 * suffix13 || suffix8. Test only P=C±K mod29.
 *
 * Run: node sims/signed2016_fibonacci_p55_terminal_key_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources/liber-primus/lp2-ink-annotations.json"), "utf8"));
const transcript = fs.readFileSync(path.join(
  ROOT, "resources/lp2-transcription.txt"), "utf8");
const reference = fs.readFileSync(path.join(
  ROOT, "resources/control/emerson_essays_2944.txt"), "utf8");

const MOD = 29;
const BLOCKS_FROM_END = [8, 13, 21, 34];
const p55 = corpus.pages.find((page) => page.page === 55);
assert.ok(p55);
assert.equal(p55.indices.length, 76);
assert.equal(BLOCKS_FROM_END.reduce((sum, value) => sum + value, 0), 76);

const p55Ink = ink.pages.find((page) => page.page === 55);
assert.deepEqual(p55Ink.large_punctuation, [[76, 13, "red"]]);

const physicalP55 = transcript.split("%")[54];
const printedLineLengths = physicalP55.split("/").map((line) =>
  (line.match(/[\u16A0-\u16FF]/gu) || []).length).filter(Boolean);
assert.deepEqual(printedLineLengths, [24, 22, 22, 8]);

/** @param {number} value @returns {number} */
function mod(value) {
  return ((value % MOD) + MOD) % MOD;
}

const keySegments = [...BLOCKS_FROM_END].reverse().map((pageNumber) => {
  const page = corpus.pages.find((candidate) => candidate.page === pageNumber);
  assert.ok(page && page.indices.length >= pageNumber);
  return page.indices.slice(-pageNumber);
});
const keyOrdinal = keySegments.flat();
assert.equal(keyOrdinal.length, 76);
const keyPrime = keyOrdinal.map((index) => corpus.prime[index] % MOD);
const keyFibonacciBlockShifts = [...BLOCKS_FROM_END].reverse()
  .flatMap((length) => Array(length).fill(length % MOD));
assert.equal(keyFibonacciBlockShifts.length, 76);
const keyProjections = [
  {name: "gp-index", key: keyOrdinal},
  {name: "gp-prime-mod29", key: keyPrime},
  {name: "fibonacci-block-shifts", key: keyFibonacciBlockShifts}
];

const gp = new Map(corpus.translit.map((token, index) => [token, index]));
gp.set("ING", gp.get("NG"));
const tokens = [...gp.keys()].sort((a, b) => b.length - a.length);

/** @param {string} source @returns {number[]} */
function encodeEnglish(source) {
  const out = [];
  for (let word of source.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    for (let offset = 0; offset < word.length;) {
      const token = tokens.find((candidate) => word.startsWith(candidate, offset));
      assert.ok(token, "Unmappable reference spelling: " + word.slice(offset));
      out.push(gp.get(token));
      offset += token.length;
    }
  }
  return out;
}

const english = encodeEnglish(reference);
assert.ok(english.length > 200000);
const tri = new Uint32Array(MOD ** 3);
const TRAIN = 50000;
for (let i = 2; i < TRAIN; i++) {
  tri[english[i - 2] * MOD * MOD + english[i - 1] * MOD + english[i]]++;
}
const alpha = 0.2;
const denominator = TRAIN - 2 + tri.length * alpha;

/** @param {number[]} values @returns {number} */
function score(values) {
  let total = 0;
  for (let i = 2; i < values.length; i++) {
    const index = values[i - 2] * MOD * MOD + values[i - 1] * MOD + values[i];
    total += Math.log((tri[index] + alpha) / denominator);
  }
  return total / (values.length - 2);
}

/** @param {number[]} values @returns {string} */
function translit(values) {
  return values.map((index) => corpus.translit[index]).join("");
}

/** @param {number[]} cipher @param {number[]} key @param {-1|1} sign @returns {number[]} */
function decrypt(cipher, key, sign) {
  return cipher.map((value, index) => mod(value + sign * key[index]));
}

/** @param {number[]} plain @param {number[]} key @param {-1|1} sign @returns {number[]} */
function encrypt(plain, key, sign) {
  return plain.map((value, index) => mod(value - sign * key[index]));
}

const candidates = keyProjections.flatMap((projection) => [-1, 1].map((sign) => {
  const plain = decrypt(p55.indices, projection.key, sign);
  return {projection: projection.name, sign, score: score(plain),
    transliteration: translit(plain), plain};
})).sort((a, b) => b.score - a.score);

const forwardBlockLengths = [...BLOCKS_FROM_END].reverse();
let blockOffset = 0;
const forwardBlocks = forwardBlockLengths.map((length) => {
  const block = p55.indices.slice(blockOffset, blockOffset + length);
  blockOffset += length;
  return block;
});
assert.equal(blockOffset, 76);
const transpositionCandidates = [
  {
    name: "reverse-fibonacci-block-order",
    plain: [...forwardBlocks].reverse().flat()
  },
  {
    name: "read-every-rune-backward-from-terminal-mark",
    plain: [...p55.indices].reverse()
  }
].map((candidate) => ({
  name: candidate.name,
  score: score(candidate.plain),
  transliteration: translit(candidate.plain)
}));

const controls = [];
for (let i = 0; i < 1000; i++) {
  const start = 60000 + i * 137;
  controls.push(score(english.slice(start, start + 76)));
}
controls.sort((a, b) => a - b);

const plantedPlain = english.slice(210000, 210076);
assert.equal(plantedPlain.length, 76);
for (const projection of keyProjections) for (const sign of [-1, 1]) {
  assert.deepEqual(
    decrypt(encrypt(plantedPlain, projection.key, sign), projection.key, sign),
    plantedPlain);
}

const result = {
  classification:
    "source-end-anchored Fibonacci suffix p55 direct-GP gate; no key claim",
  source: {
    targetPage: 55,
    targetRunes: 76,
    terminalPunctuation: p55Ink.large_punctuation[0],
    printedLineLengths,
    blockLengthsFromMarkedEnd: BLOCKS_FROM_END,
    sourcePagesFromMarkedEnd: BLOCKS_FROM_END,
    keyForwardPageOrder: [...BLOCKS_FROM_END].reverse(),
    keyRunes: keyOrdinal.length,
    keyTransliteration: translit(keyOrdinal),
    projections: keyProjections.map((projection) => projection.name)
  },
  variants: candidates.map(({plain, ...candidate}) => candidate),
  directMarkedEndReadouts: transpositionCandidates,
  reference: {
    nativeWindows: controls.length,
    nativeMinimum: controls[0],
    nativeMedian: controls[500],
    nativeMaximum: controls.at(-1),
    candidatesBeatingNativeMinimum: candidates.filter(
      (candidate) => candidate.score >= controls[0]).length
  },
  positiveControl: {
    plantedRunes: plantedPlain.length,
    allProjectionSignPairsExact: true,
    recoveredScore: score(plantedPlain)
  },
  decision: candidates[0].score >= controls[0]
    ? "Candidate reaches native-GP reference range; inspect before interpreting."
    : "All end-anchored additive projection/sign variants score below every matched native-GP window; retire this terminal suffix-key reading."
};
console.log(JSON.stringify(result, null, 2));
