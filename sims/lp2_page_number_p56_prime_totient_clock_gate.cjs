"use strict";

/**
 * Test two fixed page-indexed start schedules for the established p56 cipher.
 *
 * Node.js 22, CommonJS, no dependencies.
 * Run: node sims/lp2_page_number_p56_prime_totient_clock_gate.cjs
 *
 * A: startOrdinal = pageNumber mod 56. This makes known p56 start at 0.
 * B: startOrdinal = p50TableBytes[pageNumber], with the table byte treated
 *    as a zero-based prime ordinal.
 *
 * Both use the p56 transparent-F inverse and retain every valid skip branch.
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
const primeList = primes(800);
const totients = primeList.map(p => p - 1);
const tableBytes = grid.byte_rows.flat();
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every(row => row.length === 8));
assert.equal(tableBytes.length, 256);

function firstImpossible(page, startOrdinal) {
  const ciphertext = corpus.pages[page].indices;
  let states = new Set([0]);
  for (let i = 0; i < ciphertext.length; i++) {
    const c = ciphertext[i];
    const next = new Set();
    const cases = [];
    for (const used of states) {
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
const pages = [];
for (let page = 0; page < 56; page++) {
  if (page === 50) {
    assert.equal(corpus.pages[page].indices.length, 0);
    continue;
  }
  const segmentIndex = page < 50 ? page : page - 1;
  assert.deepEqual(parseWords(segments[segmentIndex]).flat(), corpus.pages[page].indices);
  pages.push(page);
}
assert.equal(pages.length, 55);

const pageNumberSchedule = pages.map(page => firstImpossible(page, page % 56));
const tableIndexSchedule = pages.map(page => firstImpossible(page, tableBytes[page]));

function summarize(results) {
  const failures = results.filter(result => !result.valid);
  const passes = results.filter(result => result.valid).map(result => result.page);
  return {failures, passes};
}
const pageNumber = summarize(pageNumberSchedule);
const tableIndex = summarize(tableIndexSchedule);
assert.equal(pageNumber.failures.length, 53);
assert.deepEqual(pageNumber.passes, [1, 49]);
assert.equal(tableIndex.failures.length, 53);
assert.deepEqual(tableIndex.passes, [12, 55]);

const byPageNumber = new Map(pageNumberSchedule.map(result => [result.page, result]));
const byTableIndex = new Map(tableIndexSchedule.map(result => [result.page, result]));

const p0Number = byPageNumber.get(0);
assert.equal(p0Number.failAt, 235);
assert.equal(p0Number.cipher, 8);
assert.deepEqual(p0Number.statesBefore, [231]);
assert.equal(p0Number.cases[0].keyIndex, 231);
assert.equal(p0Number.cases[0].prime, 1459);
assert.equal(p0Number.cases[0].keyTotient, 1458);
assert.equal(p0Number.cases[0].keyMod29, 8);
assert.equal(p0Number.cases[0].plaintext, 0);

const p2Number = byPageNumber.get(2);
assert.equal(p2Number.failAt, 4);
assert.equal(p2Number.cipher, 16);
assert.equal(p2Number.cases[0].keyIndex, 6);
assert.equal(p2Number.cases[0].prime, 17);
assert.equal(p2Number.cases[0].keyTotient, 16);
assert.equal(p2Number.cases[0].keyMod29, 16);
assert.equal(p2Number.cases[0].plaintext, 0);

const p3Number = byPageNumber.get(3);
assert.equal(p3Number.failAt, 2);
assert.equal(p3Number.cipher, 12);
assert.equal(p3Number.cases[0].keyIndex, 5);
assert.equal(p3Number.cases[0].prime, 13);
assert.equal(p3Number.cases[0].keyTotient, 12);
assert.equal(p3Number.cases[0].keyMod29, 12);
assert.equal(p3Number.cases[0].plaintext, 0);

const p0Table = byTableIndex.get(0);
assert.equal(p0Table.startOrdinal, 203);
assert.equal(p0Table.failAt, 4);
assert.equal(p0Table.cipher, 6);
assert.equal(p0Table.cases[0].keyIndex, 207);
assert.equal(p0Table.cases[0].prime, 1283);
assert.equal(p0Table.cases[0].keyTotient, 1282);
assert.equal(p0Table.cases[0].keyMod29, 6);
assert.equal(p0Table.cases[0].plaintext, 0);

const p39Table = byTableIndex.get(39);
assert.equal(p39Table.startOrdinal, 5);
assert.equal(p39Table.failAt, 24);
assert.equal(p39Table.cipher, 25);
assert.equal(p39Table.cases[0].keyIndex, 29);
assert.equal(p39Table.cases[0].prime, 113);
assert.equal(p39Table.cases[0].keyTotient, 112);
assert.equal(p39Table.cases[0].keyMod29, 25);
assert.equal(p39Table.cases[0].plaintext, 0);

// Positive control: known p56 starts at 56 mod56 = 0.
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
  decision: "REJECTED: two fixed page-indexed p56 prime-totient start schedules",
  p56PositiveControl: {
    plaintextRunes: p56Plain.length,
    literalFPositions: literalF,
    keySymbolsConsumed: consumed,
    exactOriginalCiphertextReproduced: true
  },
  pageNumberSchedule: {
    definition: "startOrdinal = pageNumber mod 56",
    tested: pages.length,
    failed: pageNumber.failures.length,
    passPages: pageNumber.passes,
    examples: {p0: p0Number, p2: p2Number, p3: p3Number},
    failures: pageNumber.failures.map(({page, failAt, cipher, cipherRune, cases}) =>
      ({page, failAt, cipher, cipherRune, cases}))
  },
  tableIndexSchedule: {
    definition: "startOrdinal = p50TableBytes[pageNumber]",
    first56Bytes: tableBytes.slice(0, 56),
    tested: pages.length,
    failed: tableIndex.failures.length,
    passPages: tableIndex.passes,
    examples: {p0: p0Table, p39: p39Table},
    failures: tableIndex.failures.map(({page, failAt, cipher, cipherRune, cases}) =>
      ({page, failAt, cipher, cipherRune, cases}))
  },
  scope: [
    "Both per-page schedules fail on 53 of 55 nonempty unknown pages.",
    "A continuous physical-order p56 stream starting at p0 also fails within p0 under the page-number schedule.",
    "Surviving pages merely avoid the necessary-condition contradiction; no plaintext is established."
  ]
}, null, 2));
