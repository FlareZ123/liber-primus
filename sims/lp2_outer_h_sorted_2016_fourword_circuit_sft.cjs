"use strict";

/**
 * Source-original SFT: consecutive signed-2016 word indices from sorted
 * outer-pair H packets in complete LP2 ciphertext words.
 *
 * Windows Node.js 22. No changes to source files.
 *
 * The sorting convention was recognized retrospectively. The readout
 * recovers positional labels in the authentic signed message, not plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source = read("resources/lp2-transcription.txt");
const signedSource = read("resources/historical/cicada2016-4gq25-outguess.asc");
const signed = signedSource.replace(/\r\n/g, "\n").split("\n\n").slice(1).join("\n\n")
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/7A35090F/g, "")
  .match(/[A-Za-z]+/g).map(token => token.toUpperCase());
assert.equal(signed.length, 43);
assert.equal(signed.slice(5, 9).join(" "), "EPIPHANY SEEKS THE DEVOTED");
assert.equal(signed.slice(10, 14).join(" "), "PRIMUS IS THE WAY");
assert.equal(signed.slice(19, 23).join(" "), "THEIR MEANING IS THE");

const symbol = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
const runePages = corpus.pages.filter(page => page.page <= 55 && page.indices.length);
assert.equal(runePages.length, 55);
const pageStarts = [];
let running = 0;
for (const page of runePages) {
  pageStarts.push(running);
  running += page.indices.length;
}
assert.equal(running, 12956);

const mod = value => ((value % 29) + 29) % 29;
/** @param {number[]} value */
function outerH(value) {
  const first = value[0];
  const last = value[value.length - 1];
  const difference = mod(first - last);
  const sum = mod(first + last);
  return { raw: [difference, sum], sorted: [Math.min(difference, sum), Math.max(difference, sum)] };
}
/** @param {number[]} pair */
function checkForwardOuter(pair, original) {
  const [difference, sum] = pair;
  const recoveredFirst = mod((difference + sum) * 15);
  const recoveredLast = mod((sum - difference) * 15);
  assert.equal(recoveredFirst, original[0]);
  assert.equal(recoveredLast, original[original.length - 1]);
}
function parseOriginal() {
  const tape = source.split("%").slice(0, 55).join("%");
  const words = [];
  let current = [];
  let startGlobal = 0;
  let startPage = 0;
  let endPage = 0;
  let runeCount = 0;
  let runePage = 0;
  function finish() {
    if (!current.length) return;
    const values = current;
    const packet = outerH(values);
    checkForwardOuter(packet.raw, values);
    const physicalPage = runePages[startPage].page;
    words.push({
      startGlobal, startPage, endPage, physicalPage,
      localStart: startGlobal - pageStarts[startPage],
      values, ...packet, length: values.length,
      rendered: values.map(i => corpus.translit[i]).join("-")
    });
    current = [];
  }
  for (const character of tape) {
    if (symbol.has(character)) {
      if (!current.length) {
        startGlobal = runeCount;
        startPage = runePage;
      }
      current.push(symbol.get(character));
      endPage = runePage;
      runeCount += 1;
    } else if (character === "%") {
      runePage += 1;
    } else if (character === "/" || /\s/u.test(character)) {
      // Manuscript line and physical-page wraps do not delimit a word.
    } else {
      finish();
    }
  }
  finish();
  assert.equal(runeCount, 12956);
  assert.equal(words.length, 2896);
  assert.equal(words.filter(word => word.startPage === word.endPage).length, 2862);
  return words;
}
const words = parseOriginal();
const byPage = Array.from({ length: 55 }, (_, i) =>
  words.filter(w => w.startPage === i && w.endPage === i));
/** @param {any} a @param {any} b */
function isFourRun(a, b) {
  if (a.length < 2 || b.length < 2) return false;
  const s = a.sorted[0];
  return s + 3 < 29 &&
    a.sorted[1] === s + 1 &&
    b.sorted[0] === s + 2 &&
    b.sorted[1] === s + 3;
}
const hits = [];
for (const page of byPage) {
  for (let i = 0; i < page.length - 1; i++) {
    if (!isFourRun(page[i], page[i + 1])) continue;
    const first = page[i], second = page[i + 1];
    const begin = first.sorted[0];
    hits.push({
      physicalPage: first.physicalPage,
      globalWordIndex: words.indexOf(first),
      globalRuneStarts: [first.startGlobal, second.startGlobal],
      localRuneStarts: [first.localStart, second.localStart],
      originalWords: [first.rendered, second.rendered],
      originalOuterValues: [
        [first.values[0], first.values[first.values.length - 1]],
        [second.values[0], second.values[second.values.length - 1]]
      ],
      rawH: [first.raw, second.raw],
      sortedH: [first.sorted, second.sorted],
      signedIndices: [begin, begin + 1, begin + 2, begin + 3],
      signedWords: signed.slice(begin, begin + 4).join(" "),
      successor: page[i + 2] ? {
        originalWord: page[i + 2].rendered,
        sortedH: page[i + 2].sorted,
        directContinues: page[i + 2].sorted[0] === begin + 4 &&
          page[i + 2].sorted[1] === begin + 5
      } : null
    });
  }
}
assert.equal(hits.length, 3);
const expected = [
  { physicalPage: 12, globalRuneStarts: [3055, 3059], localRuneStarts: [122, 126],
    originalWords: ["L-T-EA-X", "OE-S-N-X"], signedIndices: [5, 6, 7, 8],
    signedWords: "EPIPHANY SEEKS THE DEVOTED" },
  { physicalPage: 14, globalRuneStarts: [3530, 3533], localRuneStarts: [64, 67],
    originalWords: ["C-B-S", "W-N-H-E-NG-S"], signedIndices: [19, 20, 21, 22],
    signedWords: "THEIR MEANING IS THE" },
  { physicalPage: 46, globalRuneStarts: [11272, 11276], localRuneStarts: [39, 43],
    originalWords: ["AE-L-E-X", "IA-NG-S"], signedIndices: [10, 11, 12, 13],
    signedWords: "PRIMUS IS THE WAY" }
];
for (let i = 0; i < 3; i++) {
  for (const key of Object.keys(expected[i])) {
    assert.deepEqual(hits[i][key], expected[i][key]);
  }
  assert.equal(hits[i].successor.directContinues, false,
    "Naive adjacent-word continuation is disproven on all three packets");
}
assert.deepEqual(hits.map(hit => hit.rawH), [
  [[6, 5], [8, 7]],
  [[19, 20], [21, 22]],
  [[11, 10], [12, 13]]
]);

// Permute complete words independently inside each original physical page.
// This preserves the rune words, their outer rune pairs, their counts,
// their printed lengths, and each page's word inventory. It measures the
// familywide chance of >=3 arbitrary four-step ordinal runs, rather than
// treating discovered source starting positions as preregistered.
let rng = 0x43ad91c7;
/** @returns {number} Unsigned deterministic xorshift32 draw */
function next() {
  rng ^= rng << 13;
  rng ^= rng >>> 17;
  rng ^= rng << 5;
  return rng >>> 0;
}
const trials = 100000;
let atLeastThree = 0;
let targetTriple = 0;
let sumHits = 0;
const histogram = Array(12).fill(0);
const shuffled = byPage.map(page => page.slice());
for (let trial = 0; trial < trials; trial++) {
  let count = 0;
  let mask = 0;
  for (const page of shuffled) {
    for (let j = page.length - 1; j > 0; j--) {
      const k = next() % (j + 1);
      const swap = page[j];
      page[j] = page[k];
      page[k] = swap;
    }
    for (let j = 0; j < page.length - 1; j++) {
      if (!isFourRun(page[j], page[j + 1])) continue;
      count++;
      const start = page[j].sorted[0];
      if (start === 5) mask |= 1;
      if (start === 10) mask |= 2;
      if (start === 19) mask |= 4;
    }
  }
  histogram[Math.min(count, histogram.length - 1)]++;
  sumHits += count;
  if (count >= 3) atLeastThree++;
  if (mask === 7) targetTriple++;
}
assert.equal(histogram.reduce((a, b) => a + b, 0), trials);
console.log(JSON.stringify({
  status: "PASS",
  input: {
    sourceRuneCount: 12956, signedWords: signed.length,
    completeCipherWords: words.length, pageContainedWords: 2862,
    H: "sorted((first-last) mod29, (first+last) mod29)"
  },
  originalFourWordPackets: hits,
  null: {
    algorithm: "page-stratified full-word inventory permutation",
    seed: "0x43ad91c7", trials, histogram,
    expectedHitsPerPermutation: sumHits / trials,
    anyAtLeastThree: atLeastThree,
    empiricalAnyAtLeastThree: atLeastThree / trials,
    allThreeDiscoveredStarts: targetTriple,
    conditionalDiscoveredStartRate: targetTriple / trials
  },
  classification: "Three source-word-index coincidences, with retrospective sorted-H rule; no unknown rune plaintext"
}, null, 2));
