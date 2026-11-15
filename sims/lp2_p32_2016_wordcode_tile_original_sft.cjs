"use strict";

/**
 * Single-file original-source test of Cicada 2016 words/numbers/map as a
 * one-plaintext-rune-per-ciphertext-word code via p32's 11x11 prime tile map.
 * This is a bounded proposed decoder, not a claim of authentic plaintext.
 *
 * Run: node sims/lp2_p32_2016_wordcode_tile_original_sft.cjs
 * Requires Node.js 18+. All source and control files are read-only.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const rawTranscript = fs.readFileSync(path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const english = fs.readFileSync(path.join(root, "resources/control/shakespeare_first300k.txt"), "utf8");
const letters = new Map(corpus.runes.map((symbol, index) => [symbol, index]));
const p32 = corpus.pages[32].indices;
assert.equal(p32.length, 121);

const xEdges = [0], yEdges = [0];
for (let i = 0; i < 11; i++) {
  xEdges.push(xEdges.at(-1) + corpus.prime[p32[i]]);
  yEdges.push(yEdges.at(-1) + corpus.prime[p32[11 * i]]);
}
assert.equal(xEdges.at(-1), 563);
assert.equal(yEdges.at(-1), 569);

/**
 * @param {number[]} edges
 * @param {number} point
 * @returns {number}
 */
function bin(edges, point) {
  for (let i = 0; i < 11; i++) if (edges[i] <= point && point < edges[i + 1]) return i;
  throw new RangeError("Point falls outside eleven source strips");
}

/**
 * @param {bigint} number
 * @returns {number}
 */
function decodeTile(number) {
  const x = Number(number % 563n);
  const y = Number(number % 569n);
  return p32[11 * bin(yEdges, y) + bin(xEdges, x)];
}

// Physical p50 has no rune line in this transcription, so the initial 55
// nonempty page blocks are precisely the 55 rune-bearing unknown LP2 pages.
// Strip only explicit physical line wraps and page markers; preserve words
// spanning those boundaries and all literal hyphen/period word separators.
const sourcePages = rawTranscript.split(/^\s*%\s*$/m);
assert.equal(sourcePages.length, 57);
const originalText = sourcePages.slice(0, 55).join("");
const rawWords = originalText.replace(/\/\s*\n/g, "").replace(/[\r\n]/g, "")
  .replace(/[&$§]/g, "-").split(/[-.]/).filter(Boolean);
const unknownNonrunic = rawWords.filter(word => [...word].some(ch => !letters.has(ch)));
assert.deepEqual(unknownNonrunic, ["7", "1", "2", "3", "4", "5"]);
const words = rawWords.filter(word => [...word].every(ch => letters.has(ch)))
  .map(word => [...word].map(ch => letters.get(ch)));
assert.equal(words.length, 2896);
assert.equal(words.reduce((acc, x) => acc + x.length, 0), 12956);

/**
 * @param {number[]} word
 * @returns {bigint}
 */
function base29(word) {
  return word.reduce((acc, digit) => 29n * acc + BigInt(digit), 0n);
}
/**
 * @param {number[]} word
 * @returns {bigint}
 */
function primeSum(word) {
  return BigInt(word.reduce((sum, index) => sum + corpus.prime[index], 0));
}

const directPositional = words.map(word => decodeTile(base29(word)));
const directPrimeSum = words.map(word => decodeTile(primeSum(word)));

/**
 * @param {number[]} symbols
 * @returns {{ioc:number, unique:number, prefix:string, counts:number[]}}
 */
function summarize(symbols) {
  const counts = Array(29).fill(0);
  for (const symbol of symbols) counts[symbol]++;
  const n = symbols.length;
  return {
    ioc: counts.reduce((sum, v) => sum + v * (v - 1), 0) / (n * (n - 1)),
    unique: counts.filter(v => v > 0).length,
    prefix: symbols.slice(0, 75).map(v => corpus.translit[v]).join(" "),
    counts
  };
}
const positionalSummary = summarize(directPositional);
const primeSummary = summarize(directPrimeSum);
assert.ok(Math.abs(positionalSummary.ioc - 0.05265961507266291) < 1e-12);
assert.ok(Math.abs(primeSummary.ioc - 0.10836267521636657) < 1e-12);
assert.equal(positionalSummary.unique, 29);
assert.equal(primeSummary.unique, 15);

// Independent native-GP literary text: historical solved-LP1-compatible long
// spellings, including ING/NG and TH as a single rune, greedy longest match.
const graphemes = corpus.translit.map((spelling, index) => ({spelling, index}))
  .sort((a, b) => b.spelling.length - a.spelling.length);
const normalized = english.toUpperCase().replace(/ING/g, "NG")
  .replace(/K/g, "C").replace(/Q/g, "CW").replace(/V/g, "U").replace(/Z/g, "S");
const native = [];
for (let i = 0; i < normalized.length;) {
  if (normalized[i] < "A" || normalized[i] > "Z") { i++; continue; }
  const match = graphemes.find(g => normalized.startsWith(g.spelling, i));
  if (match) { native.push(match.index); i += match.spelling.length; }
  else i++;
}
assert.ok(native.length > 210000);
const nativeTrain = native.slice(0, 160000), ngramCounts = new Int32Array(29 * 29 * 29);
for (let i = 2; i < nativeTrain.length; i++)
  ngramCounts[nativeTrain[i-2] * 841 + nativeTrain[i-1] * 29 + nativeTrain[i]]++;
const logDenominator = Math.log(nativeTrain.length - 2 + 0.5 * ngramCounts.length);

/**
 * @param {number[]} seq
 * @returns {number} Smoothed native GP English trigram log-likelihood / rune.
 */
function nativeTrigramScore(seq) {
  let score = 0;
  for (let i = 2; i < seq.length; i++)
    score += Math.log(ngramCounts[seq[i-2] * 841 + seq[i-1] * 29 + seq[i]] + 0.5) - logDenominator;
  return score / (seq.length - 2);
}
const directScore = nativeTrigramScore(directPositional);
const controlScore = nativeTrigramScore(native.slice(180000, 180000 + directPositional.length));

/** @returns {number} */
function makeRandom() {
  let state = 0x33012016;
  return function next() {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return state >>> 0;
  };
}
const next = makeRandom();
const nullScores = [];
for (let rep = 0; rep < 256; rep++) {
  const shuffled = directPositional.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const k = next() % (i + 1);
    const hold = shuffled[i]; shuffled[i] = shuffled[k]; shuffled[k] = hold;
  }
  nullScores.push(nativeTrigramScore(shuffled));
}
nullScores.sort((a, b) => a - b);
const exceed = nullScores.filter(v => v >= directScore).length;

// Ability-to-recover-positive: an actual source p32 tile for every GP symbol
// is reachable with a four-digit base29 word, without changing the key map.
// Encrypt each authentic clear p57 GP rune into the first such codeword.
const codewords = new Int32Array(29).fill(-1);
for (let n = 0; n < 29 ** 4; n++) {
  const ch = decodeTile(BigInt(n));
  if (codewords[ch] < 0) codewords[ch] = n;
}
assert.ok([...codewords].every(n => n >= 0));
const authenticClearP57 = corpus.pages[57].indices;
assert.equal(authenticClearP57.length, 95);
const plantedWords = authenticClearP57.map(target => {
  let n = codewords[target];
  const symbols = [0,0,0,0];
  for (let i = 3; i >= 0; i--) { symbols[i] = n % 29; n = Math.floor(n / 29); }
  return symbols;
});
assert.deepEqual(plantedWords.map(word => decodeTile(base29(word))), authenticClearP57);

console.log(JSON.stringify({
  source: {unknownWords: words.length, unknownGP: 12956, p32Tiles: 121},
  positionalBase29Tile: positionalSummary,
  originalPrimeSumTile: primeSummary,
  englishGPTrain: nativeTrain.length,
  originalPositionalTrigramNatsPerRune: directScore,
  untouchedNativeGPControlNatsPerRune: controlScore,
  originalOrderShuffleControls: {
    replicates: nullScores.length,
    median: nullScores[128],
    min: nullScores[0],
    max: nullScores.at(-1),
    atLeastAsEnglishLikeAsOriginal: exceed,
    upperTail: (exceed + 1) / (nullScores.length + 1)
  },
  positivePlantRecovered: authenticClearP57.length,
  verdict: "Neither one-output-rune-per-printed-word map reveals authentic unknown plaintext."
}, null, 2));
