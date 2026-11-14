"use strict";

/**
 * Bounded original-source tests of p57's 55-interior Josephus page order
 * as a selector for the established p56 prime-totient cipher.
 *
 * Node.js 22, CommonJS, no dependencies.
 * Run: node sims/lp2_parable55_josephus_p56_clock_gate_sft.cjs
 *
 * Checks both source-visible Josephus directions and three fixed page-start
 * readings: prime-2 baseline, first-55 p50 table bytes as zero-based prime
 * ordinals assigned in elimination order, and the reverse-direction analog.
 * It verifies the p56 known-answer cipher before testing unknown pages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/lp2-transcription.txt");
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const segments = transcription.split(/^\s*%\s*$/m);
assert.equal(segments.length, 57);

const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const runeTokens = corpus.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
const mod29 = n => ((n % 29) + 29) % 29;

function parseWords(segment) {
  return (segment.replace(/\/\s*/gu, "").match(/[\u16A0-\u16FF]+/gu) || [])
    .map(word => Array.from(word, rune => {
      const index = runeToIndex.get(rune);
      assert.notEqual(index, undefined, "unknown original GP rune");
      return index;
    }));
}

function encodeWord(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/K/g, "C")
    .replace(/Z/g, "S")
    .replace(/ING/g, "NG")
    .replace(/IO/g, "IA");
  const output = [];
  for (let i = 0; i < normalized.length;) {
    const token = runeTokens.find(x => normalized.startsWith(x.token, i));
    assert.ok(token, "known plaintext token cannot be represented: " + normalized);
    output.push(token.index);
    i += token.token.length;
  }
  return output;
}

function primes(count) {
  let limit = 10000;
  while (true) {
    const composite = new Uint8Array(limit + 1);
    const output = [];
    for (let p = 2; p <= limit; p++) {
      if (composite[p]) continue;
      output.push(p);
      if (p * p <= limit) {
        for (let k = p * p; k <= limit; k += p) composite[k] = 1;
      }
    }
    if (output.length >= count) return output.slice(0, count);
    limit *= 2;
  }
}

const primeList = primes(600);
const totients = primeList.map(p => p - 1);

function josephus(stepValues) {
  const remaining = Array.from({length: 56}, (_, i) => i);
  const eliminated = [];
  let cursor = 0;
  for (const step of stepValues) {
    cursor = (cursor + step - 1) % remaining.length;
    eliminated.push(remaining.splice(cursor, 1)[0]);
  }
  return {eliminated, survivors: remaining};
}

function firstImpossible(page, startOrdinal = 0) {
  const ciphertext = corpus.pages[page].indices;
  let states = new Set([0]);
  for (let i = 0; i < ciphertext.length; i++) {
    const c = ciphertext[i];
    const next = new Set();
    const cases = [];
    for (const used of states) {
      // A literal plaintext F is copied unchanged and does not advance.
      if (c === 0) {
        next.add(used);
        cases.push({used, mode: "literal-F", nextUsed: used});
      }
      // Every non-F plaintext consumes the next prime-totient symbol.
      const keyIndex = startOrdinal + used;
      const keyTotient = totients[keyIndex];
      const keyMod29 = keyTotient % 29;
      const plaintext = mod29(c - keyMod29);
      if (plaintext !== 0) {
        next.add(used + 1);
        cases.push({
          used, mode: "consume", keyIndex, prime: primeList[keyIndex],
          keyTotient, keyMod29, plaintext, nextUsed: used + 1
        });
      } else {
        cases.push({
          used, mode: "invalid-consume", keyIndex, prime: primeList[keyIndex],
          keyTotient, keyMod29, plaintext
        });
      }
    }
    if (next.size === 0) {
      const prefix = ciphertext.slice(0, i + 1);
      return {
        page, startOrdinal, failAt: i, cipher: c,
        cipherRune: corpus.translit[c],
        statesBefore: [...states].sort((a, b) => a - b),
        cases,
        prefix: prefix.map(x => corpus.translit[x]).join(""),
        prefixRuneIndices: prefix,
        prefixLiteralFPositions: prefix.flatMap((x, j) => x === 0 ? [j] : [])
      };
    }
    states = next;
  }
  return {page, startOrdinal, valid: true, finalStates: [...states]};
}

// Validate every original page/segment association used by the page walk.
// The transcription omits runeless p50, so p51 begins at segment 50.
const pageIds = [];
for (let page = 0; page < 56; page++) {
  if (page === 50) {
    assert.equal(corpus.pages[page].indices.length, 0);
    continue;
  }
  const segmentIndex = page < 50 ? page : page - 1;
  const words = parseWords(segments[segmentIndex]);
  assert.deepEqual(words.flat(), corpus.pages[page].indices,
    "original transcription/corpus mismatch on page " + page);
  pageIds.push(page);
}
assert.equal(pageIds.length, 55);
assert.deepEqual(pageIds, Array.from({length: 56}, (_, i) => i).filter(i => i !== 50));

// Derive the 55 steps from the 20 original p57 words, shedding both ends.
const p57Words = parseWords(segments[56]);
assert.equal(p57Words.length, 20);
assert.deepEqual(p57Words.flat(), corpus.pages[57].indices);
const interiors = p57Words.flatMap(word => word.slice(1, -1));
assert.equal(interiors.length, 55);
const steps = interiors.map(index => corpus.prime[index] - 1);

const forward = josephus(steps);
const reverseSteps = josephus(steps.slice().reverse());
assert.deepEqual(forward.survivors, [50]);
assert.deepEqual(reverseSteps.survivors, [50]);
assert.deepEqual(forward.eliminated.slice(0, 10),
  [39, 49, 35, 43, 8, 40, 54, 27, 31, 46]);
assert.deepEqual(reverseSteps.eliminated.slice(0, 5),
  [15, 25, 37, 54, 28]);
assert.deepEqual([...forward.eliminated].sort((a, b) => a - b), pageIds);
assert.deepEqual([...reverseSteps.eliminated].sort((a, b) => a - b), pageIds);

// Positive control: reproduce the established 85-rune p56 plaintext using
// consecutive prime totients, with its single literal F at local rune 56.
const p56Plaintext =
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT " +
  "IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const p56Plain = p56Plaintext.split(/\s+/).flatMap(encodeWord);
assert.equal(p56Plain.length, 85);
const p56LiteralF = p56Plain.flatMap((r, i) => r === 0 ? [i] : []);
assert.deepEqual(p56LiteralF, [56]);
let consumed = 0;
const reproducedP56 = p56Plain.map(plain => {
  if (plain === 0) return 0;
  const cipher = mod29(plain + totients[consumed] % 29);
  consumed++;
  return cipher;
});
assert.deepEqual(reproducedP56, corpus.pages[56].indices);
assert.equal(consumed, 84);

// Candidate A: p56 stream begins at prime 2, with either a continuous clock
// over the route or a per-page reset to the page's elimination rank.
const forwardPrime2 = firstImpossible(forward.eliminated[0], 0);
const reversePrime2 = firstImpossible(reverseSteps.eliminated[0], 0);
assert.equal(forwardPrime2.page, 39);
assert.equal(forwardPrime2.failAt, 9);
assert.equal(forwardPrime2.cipher, 28);
assert.equal(forwardPrime2.cases.length, 1);
assert.equal(forwardPrime2.cases[0].keyMod29, 28);
assert.equal(forwardPrime2.cases[0].plaintext, 0);
assert.deepEqual(forwardPrime2.prefixLiteralFPositions, []);
assert.equal(reversePrime2.page, 15);
assert.equal(reversePrime2.failAt, 10);
assert.equal(reversePrime2.cipher, 1);
assert.deepEqual(reversePrime2.statesBefore, [10]);
assert.equal(reversePrime2.cases.length, 1);
assert.equal(reversePrime2.cases[0].keyMod29, 1);
assert.equal(reversePrime2.cases[0].plaintext, 0);
assert.deepEqual(reversePrime2.prefixLiteralFPositions, [0]);

// Candidate B: the first 55 row-major p50 table bytes are zero-based prime
// start ordinals, one per page in the Josephus elimination order. The first
// byte is therefore the start ordinal for the first eliminated page.
const tableBytes = grid.byte_rows.flat();
assert.equal(tableBytes.length, 256);
assert.equal(tableBytes[0], 203);
const forwardTableStart = firstImpossible(forward.eliminated[0], tableBytes[0]);
const reverseTableStart = firstImpossible(reverseSteps.eliminated[0], tableBytes[0]);
assert.equal(forwardTableStart.page, 39);
assert.equal(forwardTableStart.startOrdinal, 203);
assert.equal(forwardTableStart.failAt, 16);
assert.equal(forwardTableStart.cipher, 9);
assert.deepEqual(forwardTableStart.statesBefore, [16]);
assert.equal(forwardTableStart.cases.length, 1);
assert.equal(forwardTableStart.cases[0].keyIndex, 219);
assert.equal(forwardTableStart.cases[0].prime, 1373);
assert.equal(forwardTableStart.cases[0].keyTotient, 1372);
assert.equal(forwardTableStart.cases[0].keyMod29, 9);
assert.equal(forwardTableStart.cases[0].plaintext, 0);
assert.deepEqual(forwardTableStart.prefixLiteralFPositions, []);

assert.equal(reverseTableStart.page, 15);
assert.equal(reverseTableStart.startOrdinal, 203);
assert.equal(reverseTableStart.failAt, 8);
assert.equal(reverseTableStart.cipher, 24);
assert.deepEqual(reverseTableStart.statesBefore, [8]);
assert.equal(reverseTableStart.cases.length, 1);
assert.equal(reverseTableStart.cases[0].keyIndex, 211);
assert.equal(reverseTableStart.cases[0].prime, 1301);
assert.equal(reverseTableStart.cases[0].keyTotient, 1300);
assert.equal(reverseTableStart.cases[0].keyMod29, 24);
assert.equal(reverseTableStart.cases[0].plaintext, 0);
assert.deepEqual(reverseTableStart.prefixLiteralFPositions, [0]);

console.log(JSON.stringify({
  decision: "NO VALID p56 PRIME-TOTIENT TRANSFER UNDER THE TESTED JOSEPHUS/TABLE STARTS",
  source: {
    p57PrintedWords: p57Words.length,
    p57InteriorRunes: interiors.length,
    forwardSurvivor: forward.survivors,
    reverseStepSurvivor: reverseSteps.survivors,
    forwardPageOrder: forward.eliminated,
    reverseStepPageOrder: reverseSteps.eliminated
  },
  p56PositiveControl: {
    plaintextRunes: p56Plain.length,
    literalFPositions: p56LiteralF,
    keySymbolsConsumed: consumed,
    exactOriginalCiphertextReproduced: true
  },
  prime2Start: {forward: forwardPrime2, reverseSteps: reversePrime2},
  tableBytePageStart: {
    tableBytes: tableBytes.length,
    first55RowMajorBytes: tableBytes.slice(0, 55),
    forward: forwardTableStart,
    reverseSteps: reverseTableStart
  },
  scope: [
    "Rejects the p56 transparent-F prime-totient cipher starting at prime 2 when applied continuously in either p57-derived page order.",
    "Rejects page-reset clocks whose first page starts at its Josephus rank zero.",
    "Rejects the first-55-row-major-table-byte page-start schedule, with each byte interpreted as a zero-based prime ordinal.",
    "Does not reject p50 as a navigation target or a different, independently selected table consumer, key, or cipher."
  ]
}, null, 2));
