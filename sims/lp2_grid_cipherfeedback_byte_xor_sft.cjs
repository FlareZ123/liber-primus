"use strict";
/**
 * Single-file original-LP2 gate for a fixed ciphertext-driven 256-byte
 * grid lookup cipher, with exhaustive initial-state convergence.
 *
 * A proposed historical reading (not an authenticated Cicada algorithm):
 *   state[0]  = 3301 mod 256
 *   key[i]    = printedGrid[state[i]] mod 29
 *   plain[i]  = (cipher[i] - key[i]) mod 29
 *   state[i+1] = printedGrid[state[i] XOR cipher[i]]
 *
 * Run with Node.js 22 from any working directory. No network or dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ROOT = path.resolve(__dirname, "..");
const load = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const corpus = load("resources/liber-primus/lp2-corpus.json");
const originalTable = load("resources/liber-primus/base60-grid.json");
const table = originalTable.byte_rows.flat();
const source = corpus.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
const solvedP57 = corpus.pages.find((p) => p.page === 57).indices;
const SHA = "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290";

assert.equal(table.length, 256);
assert.equal(originalTable.byte_rows.length, 32);
assert.ok(originalTable.byte_rows.every((r) => r.length === 8));
assert.ok(table.every((x) => Number.isInteger(x) && x >= 0 && x <= 255));
assert.equal(crypto.createHash("sha256").update(Buffer.from(table)).digest("hex"), SHA);
assert.equal(source.length, 12956);
assert.equal(corpus.pages.filter((p) => p.page <= 55 && p.indices.length > 0).length, 55);
assert.equal(solvedP57.length, 95);

/** @param {number[]} arr @returns {number} */
function indexOfCoincidence(arr) {
  const count = Array(29).fill(0);
  for (const x of arr) {
    assert.ok(Number.isInteger(x) && x >= 0 && x < 29);
    count[x]++;
  }
  return count.reduce((total, n) => total + n * (n - 1), 0)
    / (arr.length * (arr.length - 1));
}

/** @param {number[]} symbols @param {number} initialState @returns {number[]} */
function decode(symbols, initialState) {
  let state = initialState;
  const plain = [];
  for (const c of symbols) {
    plain.push((c - table[state] % 29 + 29) % 29);
    state = table[state ^ c];
  }
  return plain;
}

/** @param {number[]} symbols @param {number} initialState @returns {number[]} */
function encode(symbols, initialState) {
  let state = initialState;
  const cipher = [];
  for (const p of symbols) {
    const c = (p + table[state] % 29) % 29;
    cipher.push(c);
    state = table[state ^ c];
  }
  return cipher;
}

const initialState = 3301 % 256; // signed 2013 challenge operand, hypothetical use
const recovered = decode(source, initialState);
assert.deepEqual(encode(recovered, initialState), source);
const originalIc = indexOfCoincidence(source);
const candidateIc = indexOfCoincidence(recovered);
assert.ok(Math.abs(originalIc - 0.03447839786450569) < 1e-12);
assert.ok(Math.abs(candidateIc - 0.034535319435827036) < 1e-12);

// Unknown initial byte cannot influence the runes after the first 223 positions:
let states = Array.from({length: 256}, (_, i) => i);
let convergence = -1;
for (let i = 0; i < source.length; i++) {
  states = states.map((state) => table[state ^ source[i]]);
  if (new Set(states).size === 1) {
    convergence = i + 1;
    break;
  }
}
assert.equal(convergence, 223);
assert.equal(new Set(states).size, 1);
assert.equal(states[0], 32);
assert.ok(Math.abs(indexOfCoincidence(recovered.slice(convergence))
  - 0.03453711414890901) < 1e-12);
for (let initial = 0; initial < 256; initial++) {
  const alternative = decode(source, initial);
  assert.deepEqual(alternative.slice(convergence), recovered.slice(convergence));
}

// Authentic, independently solved GP text provides a direct forward/inverse plant.
const solvedCipherPlant = encode(solvedP57, initialState);
assert.deepEqual(decode(solvedCipherPlant, initialState), solvedP57);
assert.ok(Math.abs(indexOfCoincidence(solvedP57) - 0.06270996640537514) < 1e-12);

const visualChapters = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],
  [33,39],[40,53],[54,55]];
let cursor = 0;
const chapters = visualChapters.map(([lo, hi]) => {
  const n = corpus.pages.filter((p) => p.page >= lo && p.page <= hi)
    .reduce((sum, p) => sum + p.indices.length, 0);
  const result = {pages: `p${lo}-${hi}`, runes: n,
    candidateIc: indexOfCoincidence(recovered.slice(cursor, cursor + n))};
  cursor += n;
  return result;
});
assert.equal(cursor, source.length);
console.log(JSON.stringify({
  sourceBytes: table.length,
  originalRunes: source.length,
  model: "p=c-T[s] mod29; s'=T[s XOR c]",
  initialState,
  fullCipherIoC: originalIc,
  fullCandidateIoC: candidateIc,
  seedConvergenceAfterRunes: convergence,
  convergenceState: states[0],
  seedIndependentSuffixIoC: indexOfCoincidence(recovered.slice(convergence)),
  authenticSolvedP57PlantRecovered: solvedP57.length,
  chapters,
  conclusion: "Bounded source-motivated GP29 inverse negative, no recovered LP2 plaintext"
}, null, 2));
