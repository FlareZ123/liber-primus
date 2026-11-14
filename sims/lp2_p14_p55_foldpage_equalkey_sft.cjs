"use strict";

/**
 * Original LP2 p14 FOLD -> 42-page p14..p55 physical mirror gate.
 *
 * Two adjacent mirrored page pairs have identical 270/273-rune lengths.
 * This SFT tests whether the source-prescribed order carries a common
 * additive GP29 page pad or preserved word-boundary geometry.
 *
 * Run on Windows 11 / Node.js 22:
 *   node sims/lp2_p14_p55_foldpage_equalkey_sft.cjs
 *
 * All source files are read-only. No external packages or CLI flags.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const db = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const raw = read("resources/lp2-transcription.txt").split("%");
const runeSet = new Set(db.runes);
assert.equal(raw.length, 57);
assert.equal(db.pages.filter(p => p.page < 56)
  .reduce((s, p) => s + p.indices.length, 0), 12956);

/** The text transcription omits rune-free physical p50. */
const source = Array.from({length: 58}, (_, i) =>
  i === 50 ? "" : raw[i < 50 ? i : i - 1]);
assert(source[14].includes("-ᛏᛄ-ᚠᚩᛚᛞ-"), "physical p14 FOLD word");

/**
 * Preserve actual printed word ends within each original physical page.
 * Slash and newline are line wraps, not word separators.
 * @param {string} s
 * @returns {{n:number, breaks:Set<number>}}
 */
function extractPage(s) {
  let n = 0;
  const breaks = new Set();
  for (const rune of s) {
    if (runeSet.has(rune)) n++;
    else if (rune === "-" || rune === ".") {
      if (n > 0) breaks.add(n);
    }
  }
  breaks.delete(n);
  return {n, breaks};
}
const pages = source.map(extractPage);
assert(pages.every((p, i) => p.n === db.pages[i].indices.length));
assert.equal(pages[55].n, 76);
const left = Array.from({length: 21}, (_, i) => i + 14);
const right = Array.from({length: 21}, (_, i) => 55 - i);
const matched = left.flatMap((a, i) =>
  pages[a].n === pages[right[i]].n
    ? [{a, b: right[i], len: pages[a].n}]
    : []);
assert.deepEqual(matched, [
  {a: 24, b: 45, len: 270},
  {a: 25, b: 44, len: 273}
]);

/**
 * Count exact original ciphertext rune matches when two physical pages
 * use one common per-position additive keystream.
 * The match count is a key-independent plaintext-equality invariant.
 * @param {number} a
 * @param {number} b
 * @param {boolean} mirror
 * @returns {number}
 */
function runeMatches(a, b, mirror) {
  const A = db.pages[a].indices, B = db.pages[b].indices;
  const n = Math.min(A.length, B.length);
  let hits = 0;
  for (let i = 0; i < n; i++)
    hits += Number(A[i] === B[mirror ? B.length - 1 - i : i]);
  return hits;
}
const wholeFoldCompared = left.reduce((s, a, i) =>
  s + Math.min(pages[a].n, pages[right[i]].n), 0);
const wholeFoldHits = left.reduce((s, a, i) =>
  s + runeMatches(a, right[i], false), 0);
assert.equal(wholeFoldCompared, 4056);
assert.equal(wholeFoldHits, 138);
assert.deepEqual(matched.map(x => runeMatches(x.a, x.b, false)), [2, 6]);
assert.deepEqual(matched.map(x => runeMatches(x.a, x.b, true)), [10, 8]);

/**
 * Match printed word-break offsets in the literal orientation, or with
 * the right physical page reflected end-to-end.
 * @param {number} a
 * @param {number} b
 * @param {boolean} mirror
 * @returns {number}
 */
function boundaryMatches(a, b, mirror) {
  const A = pages[a], B = pages[b], n = Math.min(A.n, B.n);
  let hits = 0;
  for (const k of A.breaks) {
    if (k >= n) continue;
    hits += Number(B.breaks.has(mirror ? B.n - k : k));
  }
  return hits;
}
const observedBreaks = [false, true].map(m =>
  left.reduce((s, a, i) => s + boundaryMatches(a, right[i], m), 0));
assert.deepEqual(observedBreaks, [199, 191]);

/**
 * Xorshift32 deterministic stream.
 * @param {number} seed
 * @returns {() => number}
 */
function random(seed) {
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
}
/** @param {number[]} a @param {() => number} rng */
function shuffle(a, rng) {
  for (let j = a.length - 1; j > 0; j--) {
    const k = Math.floor(rng() * (j + 1));
    [a[j], a[k]] = [a[k], a[j]];
  }
  return a;
}

// Condition on the original 21 left-hand and 21 right-hand page lists.
// The only randomization is which right-hand original page pairs with a
// fixed left-hand page. This preserves every source rune and word break.
const iterations = 30000;
const rng = random(0x31f02114);
const breakTotals = [0, 0], breakSquares = [0, 0], exceed = [0, 0];
for (let z = 0; z < iterations; z++) {
  const B = shuffle([...right], rng);
  for (let m = 0; m < 2; m++) {
    const count = left.reduce((s, a, i) =>
      s + boundaryMatches(a, B[i], m === 1), 0);
    breakTotals[m] += count;
    breakSquares[m] += count * count;
    exceed[m] += Number(count >= observedBreaks[m]);
  }
}
assert.deepEqual(exceed, [18014, 24818]);

// Count adjacent *exact-length* pairings under the same pair-preserving
// source-inventory null, before examining any rune identities.
const trials = 100000;
const rngLength = random(0x31f02114);
let withAtLeastTwo = 0, withAdjacent = 0;
for (let z = 0; z < trials; z++) {
  const B = shuffle([...right], rngLength);
  let same = 0, adjacent = 0, preceding = false;
  for (let i = 0; i < left.length; i++) {
    const equal = pages[left[i]].n === pages[B[i]].n;
    same += Number(equal);
    adjacent += Number(preceding && equal);
    preceding = equal;
  }
  withAtLeastTwo += Number(same >= 2);
  withAdjacent += Number(adjacent > 0);
}
assert.equal(withAtLeastTwo, 8492);
assert.equal(withAdjacent, 886);

// Source-attested native-GP spelling: ING and IO are single original runes.
// The Shakespeare text is an external positive-language *reference*,
// independent of unknown LP2 text and of this 42-page fold hypothesis.
const tokens = db.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} text @returns {number[]} */
function nativeEnglish(text) {
  const words = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C")
    .replace(/Z/g, "S").match(/[A-Z]+/g) || [];
  const out = [];
  for (const word of words) {
    for (let k = 0; k < word.length;) {
      if (word.startsWith("ING", k)) { out.push(21); k += 3; }
      else if (word.startsWith("IO", k)) { out.push(27); k += 2; }
      else {
        const token = tokens.find(t => word.startsWith(t.s, k));
        assert(token, "unrecognized source-native GP letter sequence");
        out.push(token.i);
        k += token.s.length;
      }
    }
  }
  return out;
}
const reference = nativeEnglish(read("resources/control/shakespeare_first300k.txt"));
assert.equal(reference.length, 217106);
const pairsLength = 270 + 273;
const simulations = 20000;
const rngEnglish = random(0x31f03154);
let minHits = Infinity, sumHits = 0, lowDirect = 0, lowMirror = 0;
for (let z = 0; z < simulations; z++) {
  const maxStart = reference.length - pairsLength;
  const a = Math.floor(rngEnglish() * maxStart);
  let b = Math.floor(rngEnglish() * maxStart);
  if (Math.abs(a - b) < pairsLength)
    b = (b + pairsLength) % maxStart;
  let hits = 0;
  for (let i = 0; i < pairsLength; i++)
    hits += Number(reference[a + i] === reference[b + i]);
  sumHits += hits;
  minHits = Math.min(minHits, hits);
  lowDirect += Number(hits <= 8);
  lowMirror += Number(hits <= 18);
}
assert.deepEqual([minHits, lowDirect, lowMirror], [11, 0, 101]);

// Same key is invisible to equality, and the implementational invariant
// holds for every pair of original GP plaintext strings under any GP29 pad.
const nativeA = reference.slice(4000, 4000 + pairsLength);
const nativeB = reference.slice(7000, 7000 + pairsLength);
const key = Array.from({length: pairsLength}, (_, i) => (i * 17 + 1033) % 29);
const encA = nativeA.map((v, i) => (v + key[i]) % 29);
const encB = nativeB.map((v, i) => (v + key[i]) % 29);
const equal = (A, B) => A.reduce((s, v, i) => s + Number(v === B[i]), 0);
assert.equal(equal(encA, encB), equal(nativeA, nativeB));
assert.deepEqual(encA.map((v, i) => (v - key[i] + 29) % 29), nativeA);
assert.deepEqual(encB.map((v, i) => (v - key[i] + 29) % 29), nativeB);

console.log(JSON.stringify({
  status: "PASS",
  premise: "p14 FOLD, mirrored p14..p55 source physical pages",
  pairs: 21, matched, wholeFoldCompared, wholeFoldHits,
  exactLengthPairRuneHits: {printed: 8, mirrored: 18, compared: 543},
  boundaryAlignment: observedBreaks.map((hits, m) => ({
    orientation: m ? "right mirrored" : "printed",
    hits,
    matchedNullMean: breakTotals[m] / iterations,
    matchedNullSd: Math.sqrt(
      breakSquares[m] / iterations - (breakTotals[m] / iterations) ** 2),
    sameOrHigher: exceed[m],
    nulls: iterations
  })),
  pairedExactLengthNull: {
    atLeastTwo: withAtLeastTwo, anyAdjacent: withAdjacent, nulls: trials
  },
  nativeEnglishSharedPadNegative: {
    sourceMatchForward: 8, sourceMatchMirror: 18,
    length: 543, sampleCount: simulations,
    simulationMean: sumHits / simulations,
    minimum: minHits, atMostEight: lowDirect, atMostEighteen: lowMirror
  },
  conclusion: "The adjacent same-length fold observation does not identify a shared direct GP29 pad or recover plaintext."
}, null, 2));
