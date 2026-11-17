"use strict";

/**
 * Source-derived all-29 test for a fixed cipher image of GP29's even prime F.
 * Single runnable test: node sims/lp2_prime_clause_secret_even_rune_sft.cjs
 *
 * If source-authored short clauses retain prime GP sums and a position-
 * independent bijection enciphers F to one unknown glyph q, every prime
 * plaintext clause must have odd (length - count(q)) parity.
 * This is a necessary condition, not a decoder or a claim of prime sums
 * for the unknown plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} name */
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
assert.equal(corpus.runes.length, 29);
assert.equal(corpus.prime[0], 2);
assert.ok(corpus.prime.slice(1).every(p => p % 2 === 1));

/** @param {string} text @returns {number[][]} */
function clauses(text) {
  return text.split(/[.&$§]/).map(unit => Array.from(unit)
    .flatMap(rune => runeIndex.has(rune) ? [runeIndex.get(rune)] : []))
    .filter(unit => unit.length > 0);
}

/** @param {number[][]} units @param {number} maxLen */
function counts(units, maxLen = 40) {
  const short = units.filter(unit => unit.length <= maxLen);
  const scores = new Array(29).fill(0);
  for (const unit of short) {
    const frequencies = new Array(29).fill(0);
    for (const rune of unit) frequencies[rune]++;
    for (let q = 0; q < 29; q++) {
      scores[q] += (unit.length - frequencies[q]) % 2;
    }
  }
  return { n: short.length, scores };
}

const original = read("resources/lp2-transcription.txt");
const pages = original.split("%").slice(0, 55);
const unsolved = pages.join("%");
const runeTotal = Array.from(unsolved).filter(c => runeIndex.has(c)).length;
assert.equal(runeTotal, 12956);
assert.equal(pages.length, 55);
const sourceUnits = clauses(unsolved);
assert.equal(sourceUnits.length, 175);
const found = counts(sourceUnits);
assert.equal(found.n, 70);
assert.deepEqual(found.scores,
  [37,40,44,35,37,35,34,37,36,38,38,35,35,38,34,41,33,38,39,35,35,42,32,36,31,42,36,37,32]);

const left = counts(clauses(pages.slice(0, 28).join("%")));
const right = counts(clauses(pages.slice(28).join("%")));
const labels = corpus.translit;
/** @param {number[]} scores */
const best = scores => scores.map((score, index) => ({ rune: labels[index], index, score }))
  .sort((a, b) => b.score - a.score || a.index - b.index);

// Authentic known-cleartext positive with source clause punctuation:
// swap F (GP index 0) with TH (index 2), preserving native prime-sum parity.
const master = read("resources/transcriptions/liber_primus_master.txt");
const sections = master.slice(master.indexOf("\n\n") + 2)
  .split(/\s*\$\s*/).filter(section => Array.from(section).some(r => runeIndex.has(r)));
assert.equal(sections.length, 18);
const native = [2, 4, 6, 17].flatMap(section => clauses(sections[section]))
  .filter(unit => unit.length <= 40);
assert.equal(native.length, 32);
const originalOdd = counts(native).scores[0];
assert.equal(originalOdd, 24);
const swapped = native.map(unit => unit.map(g => g === 0 ? 2 : g === 2 ? 0 : g));
assert.equal(counts(swapped).scores[2], originalOdd);

// Null: independently shuffle original rune symbols within each original
// physical page, preserving per-page rune histograms, punctuation positions,
// original page and section layout, and short-clause lengths.
let seed = 0x33012026;
/** @returns {number} */
function rand() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
/** @param {string} text */
function shufflePage(text) {
  const chars = Array.from(text);
  const positions = [];
  for (let i = 0; i < chars.length; i++) {
    if (runeIndex.has(chars[i])) positions.push(i);
  }
  for (let j = positions.length - 1; j > 0; j--) {
    const k = rand() % (j + 1);
    const hold = chars[positions[j]];
    chars[positions[j]] = chars[positions[k]];
    chars[positions[k]] = hold;
  }
  return chars.join("");
}
const replicates = 2000;
const maxima = [];
let atLeastOriginal = 0;
for (let i = 0; i < replicates; i++) {
  const nullText = pages.map(shufflePage).join("%");
  const nullScores = counts(clauses(nullText));
  assert.equal(nullScores.n, 70);
  const maximum = Math.max(...nullScores.scores);
  maxima.push(maximum);
  if (maximum >= 44) atLeastOriginal++;
}
assert.equal(atLeastOriginal, 697);
const mean = maxima.reduce((sum, value) => sum + value, 0) / replicates;
assert.equal(mean, 42.919);
const nativeThreshold = Math.ceil((22 / 32) * 70);
assert.equal(nativeThreshold, 49);
const result = {
  source: "original 55 rune-bearing unknown LP2 pages, 12956 runes, fixed printed clauses",
  model: "all 29 fixed cipher images of GP prime F=2",
  shortClauseCount: found.n,
  allCipherRuneScores: best(found.scores),
  originalMaximum: Math.max(...found.scores),
  literalFScore: found.scores[0],
  byHalf: { pages0to27: best(left.scores).slice(0, 5), pages28to55Excluding50: best(right.scores).slice(0, 5) },
  shuffledNull: { replicates, seed: "0x33012026", maximumMean: mean,
    countAtLeastOriginal: atLeastOriginal, addOneTail: (atLeastOriginal + 1) / (replicates + 1) },
  authenticNativeControl: { shortClauses: native.length, trueEvenRuneOdd: originalOdd,
    movedFToTHOdd: counts(swapped).scores[2] },
  conditionalNativePrimeShare: { solvedNative: "22/32", targetOn70: nativeThreshold,
    maximumPossiblePrimeShortClausesForAnyFixedEvenRune: Math.max(...found.scores),
    minimalClauseParityChangesToReachNativeShare: nativeThreshold - Math.max(...found.scores) },
  caveat: "No demonstrated plaintext, source-authored F cipher image, or independently known LP2 clause-prime count.",
};
console.log(JSON.stringify(result, null, 2));
