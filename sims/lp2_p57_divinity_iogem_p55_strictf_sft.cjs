"use strict";

/**
 * Source-frozen original p55 IOGEM-key inverse gate.
 * Reproducer: node sims/lp2_p57_divinity_iogem_p55_strictf_sft.cjs
 * Inputs are the unchanged authoritative LP2 GP29 rune corpus and numeric table.
 * No output file writes and no external packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/lp2-grid-256.json");
const gp = new Map(corpus.translit.map((value, i) => [value, i]));
const primes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const moves = [[1,-1],[1,0],[1,1],[0,-1],[0,0],[0,1],[-1,-1],[-1,0],[-1,1]];
const p55 = corpus.pages.find((p) => p.page === 55).indices;
const p57 = corpus.pages.find((p) => p.page === 57).indices;
const bytes = grid.bytes;
assert.equal(bytes.length, 256);
assert.equal(p55.length, 76);
assert.equal(p57.length, 95);

/* The original solved p57 explicitly prints D-I-U-I-N-I-T-Y. U encodes V. */
const divinity = ["D","I","U","I","N","I","T","Y"].map((name) => gp.get(name));
assert.deepEqual(divinity, [23,10,1,10,9,10,16,26]);
const numericSum = divinity.reduce((sum, symbol) => sum + primes[symbol], 0);
assert.equal(numericSum, 376);
let index = (numericSum - 1) % 256;
const visited = new Set();
const sequence = [];
const positions = [];
while (!visited.has(index)) {
  visited.add(index);
  positions.push(index + 1);
  const digit = bytes[index];
  const quotient = Math.floor(digit / 29);
  const remainder = digit % 29;
  sequence.push(remainder);
  const [dRow, dColumn] = moves[quotient];
  const row = Math.floor(index / 8) + dRow;
  const column = index % 8 + dColumn;
  if (quotient === 4 || row < 0 || row >= 32 || column < 0 || column >= 8) break;
  index = row * 8 + column;
}
assert.deepEqual(positions, [120,111,119,127,128]);
const keyNames = sequence.map((x) => corpus.translit[x]);
assert.deepEqual(keyNames, ["I","O","G","E","M"]);
const key = sequence;
assert.deepEqual(key, [10,3,6,18,19]);
assert.deepEqual(p55.flatMap((v,i) => v === 0 ? [i] : []), [15,25,41]);

/**
 * Enumerate every state of a known cyclic key and native p56 F-transparent
 * Vigenere rule, keeping ciphertext-F ambiguous.
 * A key-consuming operation may never return plaintext F, because original
 * plaintext F is emitted transparently without consuming a key symbol.
 * @param {number[]} ciphertext
 * @param {number} phase
 */
function invert(ciphertext, phase) {
  let states = [{ clock: phase, bypass: [], plain: [] }];
  let impossibleAt = null;
  for (let i = 0; i < ciphertext.length; i++) {
    const next = [];
    for (const state of states) {
      if (ciphertext[i] === 0) {
        next.push({ clock: state.clock, bypass: [...state.bypass, i], plain: [...state.plain, 0] });
      }
      const candidate = (ciphertext[i] - key[state.clock % key.length] + 29) % 29;
      if (candidate !== 0) {
        next.push({ clock: state.clock + 1, bypass: state.bypass, plain: [...state.plain, candidate] });
      }
    }
    states = next;
    if (!states.length) {
      impossibleAt = i;
      break;
    }
  }
  return { impossibleAt, states };
}

/** Strict source-authentic forward encoder, including plaintext-F transparency. */
function encrypt(plain, phase) {
  let clock = phase;
  const cipher = [];
  for (const symbol of plain) {
    if (symbol === 0) cipher.push(0);
    else cipher.push((symbol + key[clock++ % key.length]) % 29);
  }
  return cipher;
}
let bypassesInP57 = 0;
for (let phase = 0; phase < 5; phase++) {
  const plant = encrypt(p57, phase);
  const inverse = invert(plant, phase);
  assert.equal(inverse.impossibleAt, null);
  assert(inverse.states.some((state) => state.plain.every((symbol, i) => symbol === p57[i])));
  assert.deepEqual(encrypt(p57, phase), plant);
  bypassesInP57 += p57.filter((v) => v === 0).length;
}
assert(bypassesInP57 > 0);

const cases = [];
for (const [scope, ciphertext] of [["full76", p55], ["suffix75", p55.slice(1)]]) {
  for (let phase = 0; phase < 5; phase++) {
    const outcome = invert(ciphertext, phase);
    cases.push({ scope, phase, earliestImpossibleAt: outcome.impossibleAt, survivors: outcome.states.length });
    assert.equal(outcome.states.length, 0);
  }
}
assert.deepEqual(cases.map((x) => x.earliestImpossibleAt),
  [55,8,2,67,67,66,54,7,1,66]);
console.log(JSON.stringify({
  input: "unaltered LP2 physical p55 original 76 GP29 runes",
  originalSourceSelector: "p57 DIVINITY GP prime-sum 376, %256 cell120, 29q+r keypad",
  visitedCells: positions,
  keyRuneNames: keyNames,
  key,
  sourceCiphertextFOffsets: [15,25,41],
  knownPlaintextPositive: "all 5 cyclic phases exactly recover native p57 95/95 with genuine plaintext-F bypass",
  tests: cases,
  interpretation: "The newly sourced IOGEM is impossible as a cyclic strict-F Vigenere key for all p55 or the page-local suffix, for every phase; no unknown plaintext recovered."
},null,2));
console.log("PASS");
