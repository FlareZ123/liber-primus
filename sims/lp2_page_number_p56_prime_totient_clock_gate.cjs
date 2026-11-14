"use strict";

/**
 * Test the fixed page-number phase hypothesis for the solved p56 cipher.
 *
 * Node.js 22, CommonJS, no dependencies.
 * Run: node sims/lp2_page_number_p56_prime_totient_clock_gate.cjs
 *
 * Each physical page p in the unsolved p0-p55 set starts the established
 * p56 prime-totient key stream at zero-based prime ordinal p. This makes
 * known page p56 start at ordinal 56 mod 56 = 0, matching its known solution.
 * The test enforces transparent-F semantics and retains every valid skip
 * branch. No phase search or language scoring is used.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/lp2-transcription.txt");
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
const primeList = primes(700);
const totients = primeList.map(p => p - 1);

function firstImpossible(page, startOrdinal) {
  const ciphertext = corpus.pages[page].indices;
  let states = new Set([0]);
  for (let i = 0; i < ciphertext.length; i++) {
    const c = ciphertext[i];
    const next = new Set();
    const cases = [];
    for (const used of states) {
      // Literal plaintext F is copied unchanged and does not consume a key.
      if (c === 0) {
        next.add(used);
        cases.push({used, mode: "literal-F", nextUsed: used});
      }
      const keyIndex = startOrdinal + used;
      const keyTotient = totients[keyIndex];
      const keyMod29 = keyTotient % 29;
      const plaintext = mod29(c - keyMod29);
      if (plaintext !== 0) {
        next.add(used + 1);
        cases.push({used, mode: "consume", keyIndex,
          prime: primeList[keyIndex], keyTotient, keyMod29,
          plaintext, nextUsed: used + 1});
      } else {
        cases.push({used, mode: "invalid-consume", keyIndex,
          prime: primeList[keyIndex], keyTotient, keyMod29, plaintext});
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
        prefixLiteralFPositions: prefix.flatMap((x, j) => x === 0 ? [j] : [])
      };
    }
    states = next;
  }
  return {page, startOrdinal, valid: true, finalStates: [...states]};
}

// Validate every original page/segment association. The transcription omits
// the runeless p50 segment, so p51 begins at segment 50.
const results = [];
for (let page = 0; page < 56; page++) {
  if (page === 50) {
    assert.equal(corpus.pages[page].indices.length, 0);
    continue;
  }
  const segmentIndex = page < 50 ? page : page - 1;
  assert.deepEqual(parseWords(segments[segmentIndex]).flat(), corpus.pages[page].indices);
  results.push(firstImpossible(page, page % 56));
}
assert.equal(results.length, 55);
const failures = results.filter(result => !result.valid);
const passes = results.filter(result => result.valid).map(result => result.page);
assert.equal(failures.length, 53);
assert.deepEqual(passes, [1, 49]);

const byPage = new Map(results.map(result => [result.page, result]));
const p0 = byPage.get(0);
assert.equal(p0.failAt, 235);
assert.equal(p0.cipher, 8);
assert.deepEqual(p0.statesBefore, [231]);
assert.equal(p0.cases[0].keyIndex, 231);
assert.equal(p0.cases[0].prime, 1459);
assert.equal(p0.cases[0].keyTotient, 1458);
assert.equal(p0.cases[0].keyMod29, 8);
assert.equal(p0.cases[0].plaintext, 0);

const p2 = byPage.get(2);
assert.equal(p2.failAt, 4);
assert.equal(p2.cipher, 16);
assert.equal(p2.cases[0].keyIndex, 6);
assert.equal(p2.cases[0].prime, 17);
assert.equal(p2.cases[0].keyTotient, 16);
assert.equal(p2.cases[0].keyMod29, 16);
assert.equal(p2.cases[0].plaintext, 0);

const p3 = byPage.get(3);
assert.equal(p3.failAt, 2);
assert.equal(p3.cipher, 12);
assert.equal(p3.cases[0].keyIndex, 5);
assert.equal(p3.cases[0].prime, 13);
assert.equal(p3.cases[0].keyTotient, 12);
assert.equal(p3.cases[0].keyMod29, 12);
assert.equal(p3.cases[0].plaintext, 0);

// Positive control: the known p56 page is page 56, hence phase 56 mod 56 = 0.
const p56Plaintext =
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT " +
  "IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const p56Plain = p56Plaintext.split(/\s+/).flatMap(encodeWord);
assert.equal(p56Plain.length, 85);
const literalF = p56Plain.flatMap((r, i) => r === 0 ? [i] : []);
assert.deepEqual(literalF, [56]);
let consumed = 0;
const p56Cipher = p56Plain.map(plain => {
  if (plain === 0) return 0;
  const cipher = mod29(plain + totients[consumed] % 29);
  consumed++;
  return cipher;
});
assert.deepEqual(p56Cipher, corpus.pages[56].indices);
assert.equal(consumed, 84);

console.log(JSON.stringify({
  decision: "REJECTED: physical page number as p56 prime-totient start ordinal",
  schedule: "startOrdinal = pageNumber mod 56; p56 therefore starts at ordinal 0",
  testedNonemptyPages: results.length,
  pagesWithNoTransparent-FContradiction: passes,
  pagesWithNoValidTransparent-FPath: failures.length,
  p56PositiveControl: {
    plaintextRunes: p56Plain.length,
    literalFPositions: literalF,
    keySymbolsConsumed: consumed,
    exactOriginalCiphertextReproduced: true
  },
  representativeFailures: {
    p0, p2, p3,
    p7: byPage.get(7),
    p10: byPage.get(10)
  },
  allPageFailures: failures.map(({page, failAt, cipher, cipherRune, statesBefore, cases}) => ({
    page, failAt, cipher, cipherRune, statesBefore, cases
  })),
  scope: [
    "The per-page physical-page-number start schedule fails on 53 of 55 nonempty unknown pages.",
    "A continuous stream beginning at p0 also fails within p0 at rune 235.",
    "Pages 1 and 49 merely avoid this necessary-condition contradiction; no plaintext is thereby established."
  ]
}, null, 2));
