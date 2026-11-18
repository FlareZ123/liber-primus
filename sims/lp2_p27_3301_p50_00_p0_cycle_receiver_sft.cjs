"use strict";

/**
 * Bounded receiver gate for the source-linked chain
 * p27 -> 3301 -> p50 cell 229 -> token 00 -> p0 / table cell 0.
 *
 * The p27 parser that reconstructs 3301 and the zero-based table lookup are
 * documented separately. This test begins at their shared typed output and
 * asks whether the cell-0 byte-pointer cycle can act as the exact historical
 * plaintext-F-transparent GP29 additive key on original p0.
 *
 * Run: node sims/lp2_p27_3301_p50_00_p0_cycle_receiver_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const tokens = grid.pages.flatMap((page) => page.tokens);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/**
 * Strict historical plaintext-F encoder. Plaintext F is copied as F and does
 * not consume a key symbol. Other plaintext runes consume exactly one symbol.
 * @param {number[]} plain
 * @param {number[]} key
 * @param {1|-1} direction 1 means C=P+K; -1 means C=P-K.
 * @returns {number[]}
 */
function encrypt(plain, key, direction) {
  let clock = 0;
  return plain.map((rune) => {
    if (rune === 0) return 0;
    const out = mod29(rune + direction * key[clock % key.length]);
    clock += 1;
    return out;
  });
}

/**
 * Enumerate every legal key clock under the historical plaintext-F grammar.
 * Ciphertext F can be either a literal unconsumed plaintext F or the ordinary
 * encryption of a non-F rune. Any consuming branch that yields plaintext F is
 * illegal because authentic plaintext F would have bypassed encryption.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {1|-1} direction 1 means inverse P=C-K; -1 means inverse P=C+K.
 * @returns {{passed:boolean, firstFailure:number|null, before:number[], after:number[], maxStates:number}}
 */
function allClockPaths(cipher, key, direction) {
  let states = new Set([0]);
  let before = [0];
  let maxStates = 1;
  for (let i = 0; i < cipher.length; i += 1) {
    before = [...states].sort((a, b) => a - b);
    const next = new Set();
    for (const clock of states) {
      if (cipher[i] === 0) next.add(clock);
      const plain = mod29(
        cipher[i] - direction * key[clock % key.length]
      );
      if (plain !== 0) next.add(clock + 1);
    }
    if (next.size === 0) {
      return {
        passed: false,
        firstFailure: i,
        before,
        after: [],
        maxStates,
      };
    }
    states = next;
    maxStates = Math.max(maxStates, states.size);
  }
  return {
    passed: true,
    firstFailure: null,
    before,
    after: [...states].sort((a, b) => a - b),
    maxStates,
  };
}

assert.equal(grid.bytes.length, 256);
assert.equal(tokens.length, 256);
assert.equal(3301 % 256, 229);
assert.equal(tokens[229], "00");
assert.equal(grid.bytes[229], 0);

const cycle = [];
let state = 0;
do {
  assert.ok(!cycle.includes(state), "unexpected preperiod before cell-0 cycle");
  cycle.push(state);
  state = grid.bytes[state];
} while (state !== 0);
assert.deepEqual(cycle, [0, 203, 68, 199, 47, 76, 114, 197, 115, 247, 192]);

const addressKey = cycle.map((value) => value % 29);
const successorKey = cycle.map((index) => grid.bytes[index] % 29);
assert.deepEqual(addressKey, [0, 0, 10, 25, 18, 18, 27, 23, 28, 15, 18]);
assert.deepEqual(successorKey, [0, 10, 25, 18, 18, 27, 23, 28, 15, 18, 0]);

const p0 = corpus.pages.find((page) => page.page === 0).indices;
const p57 = corpus.pages.find((page) => page.page === 57).indices;
assert.equal(p0.length, 262);
assert.equal(p57.length, 95);

const tests = [];
for (const [name, key] of [["address", addressKey], ["successor", successorKey]]) {
  for (const direction of [1, -1]) {
    const result = allClockPaths(p0, key, direction);
    tests.push({name, direction, ...result});

    // Independent known-clear positive plant verifies the same state grammar.
    const planted = encrypt(p57, key, direction);
    const control = allClockPaths(planted, key, direction);
    assert.equal(control.passed, true);
    const consumed = p57.filter((rune) => rune !== 0).length;
    assert.ok(control.after.includes(consumed));
  }
}

const historicalAddress = tests.find((row) => row.name === "address" && row.direction === 1);
const historicalSuccessor = tests.find((row) => row.name === "successor" && row.direction === 1);
const reverseAddress = tests.find((row) => row.name === "address" && row.direction === -1);
const reverseSuccessor = tests.find((row) => row.name === "successor" && row.direction === -1);

assert.equal(historicalAddress.firstFailure, 6);
assert.deepEqual(historicalAddress.before, [6]);
assert.equal(p0[6], 27);
assert.equal(addressKey[6], 27);
assert.equal(historicalSuccessor.firstFailure, 10);
assert.deepEqual(historicalSuccessor.before, [9]);
assert.equal(p0[10], 18);
assert.equal(successorKey[9], 18);
assert.equal(reverseAddress.firstFailure, 119);
assert.deepEqual(reverseAddress.before, [114]);
assert.equal(reverseSuccessor.firstFailure, 119);
assert.deepEqual(reverseSuccessor.before, [113]);
assert.equal(p0[119], 11);
assert.equal(addressKey[114 % 11], 18);
assert.equal(successorKey[113 % 11], 18);

console.log(JSON.stringify({
  status: "PASS: the 3301->00->p0 cell-0-cycle F-transparent receiver is algebraically closed",
  sourceChain: {
    recoveredInteger: 3301,
    tableAddress: 3301 % 256,
    printedToken: tokens[229],
    conditionalDestination: "p0 / table cell0",
    cell0Cycle: cycle,
  },
  keys: {addressKey, successorKey},
  originalP0: tests.map((row) => ({
    key: row.name,
    direction: row.direction === 1 ? "C=P+K (historical)" : "C=P-K (orientation control)",
    passed: row.passed,
    firstFailure: row.firstFailure,
    reachableClocksBeforeFailure: row.before,
    maxReachableClocks: row.maxStates,
  })),
  positiveControls: "all four p57 plants survive the complete 95-rune inverse",
  decision:
    "Reject the direct cell-0 byte-pointer cycle as the p56-style plaintext-F-transparent repeating GP29 receiver on p0. Preserve 3301->00 as a conditional navigation link; another receiver requires an independent source instruction.",
}, null, 2));
