"use strict";

/**
 * LP2 original-cipher SFT: a source-motivated, lossless predecessor-exclusion
 * GP29 → base28 → 5-digit/3-byte transport gate.
 *
 * The 29-rune ciphertext has only 86 equal-adjacent events. After deleting
 * those events as the most permissive possible no-data escapes, each next
 * non-repeating rune has one of 28 ranks after excluding its predecessor.
 * A proposed 3-byte → five base28 digit codec must map every 5-digit group
 * to an integer below 2^24, not merely have a favourable score.
 *
 * Run: node sims/lp2_predecessor_28_to_byte_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
  "utf8"
));
const pages = corpus.pages.filter((p) => p.status === "unsolved" && p.indices.length);
const N = 2 ** 24;

/**
 * Remove a source-uncued identical-rune escape. Return natural-order GP29
 * successor ranks in the 28 options excluding the preceding emitted rune.
 * @param {number[]} symbols
 * @returns {{digits:number[], repeats:number}}
 */
function ranks(symbols) {
  /** @type {number[]} */
  const digits = [];
  let repeats = 0;
  let prev = null;
  for (const current of symbols) {
    if (prev !== null) {
      if (current === prev) repeats++;
      else digits.push(current < prev ? current : current - 1);
    }
    prev = current;
  }
  return { digits, repeats };
}

/**
 * A decoder cannot emit invalid 24-bit blocks, regardless of plaintext.
 * @param {number[]} digits
 * @param {number} phase
 * @param {boolean} littleEndDigitOrder
 * @returns {{blocks:number,invalid:number}}
 */
function gate(digits, phase, littleEndDigitOrder) {
  let blocks = 0;
  let invalid = 0;
  for (let start = phase; start + 5 <= digits.length; start += 5) {
    let value = 0;
    for (let j = 0; j < 5; j++) {
      const rank = digits[start + (littleEndDigitOrder ? 4 - j : j)];
      assert(rank >= 0 && rank < 28);
      value = 28 * value + rank;
    }
    blocks++;
    if (value >= N) invalid++;
  }
  return { blocks, invalid };
}

/**
 * Test all five possible fixed book origins and the page-local origin.
 * @param {boolean} little
 * @param {number[]} globalDigits
 * @returns {{global:number[],perPage:{blocks:number,invalid:number}}}
 */
function check(little, globalDigits) {
  const phases = Array.from({ length: 5 }, (_, phase) => gate(globalDigits, phase, little));
  const perPage = { blocks: 0, invalid: 0 };
  for (const page of pages) {
    const test = gate(ranks(page.indices).digits, 0, little);
    perPage.blocks += test.blocks;
    perPage.invalid += test.invalid;
  }
  return { global: phases.map((x) => x.invalid), perPage };
}

/** @param {number} count @returns {number[]} */
function plantedBytes(count) {
  let state = 3301;
  /** @type {number[]} */
  const vals = [];
  for (let i = 0; i < count; i++) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    vals.push(state >>> 8 & 0xFFFFFF);
  }
  return vals;
}

/** @param {number[]} byteTriples @returns {number[]} */
function plantDigits(byteTriples) {
  /** @type {number[]} */
  const digits = [];
  for (const value of byteTriples) {
    let remainder = value;
    const group = [0, 0, 0, 0, 0];
    for (let j = 4; j >= 0; j--) {
      group[j] = remainder % 28;
      remainder = Math.floor(remainder / 28);
    }
    assert.equal(remainder, 0);
    digits.push(...group);
  }
  return digits;
}

/** @param {number[]} digits @returns {number[]} */
function plantSymbolsWithEscapes(digits) {
  const symbols = [13]; // a fixed artificial initial rune (not an LP2 key)
  let emittedEscapes = 0;
  for (let i = 0; i < digits.length; i++) {
    const previous = symbols[symbols.length - 1];
    const rune = digits[i] < previous ? digits[i] : digits[i] + 1;
    symbols.push(rune);
    if (emittedEscapes < 86 && (i + 1) % 149 === 0) {
      symbols.push(rune); // direct no-data repeated-rune escape
      emittedEscapes++;
    }
  }
  assert.equal(emittedEscapes, 86);
  return symbols;
}

function main() {
  const original = pages.flatMap((p) => p.indices);
  assert.equal(original.length, 12956);
  const { digits, repeats } = ranks(original);
  assert.equal(repeats, 86);
  assert.equal(digits.length, 12869);

  const big = check(false, digits);
  const little = check(true, digits);
  assert.deepEqual(big.global, [62, 54, 65, 70, 71]);
  assert.deepEqual(little.global, [73, 60, 62, 64, 72]);
  assert.deepEqual(big.perPage, { blocks: 2539, invalid: 79 });
  assert.deepEqual(little.perPage, { blocks: 2539, invalid: 66 });

  const planted = plantDigits(plantedBytes(2573));
  const emitted = plantSymbolsWithEscapes(planted);
  const recovered = ranks(emitted);
  assert.equal(recovered.repeats, 86);
  assert.deepEqual(recovered.digits, planted);
  assert.deepEqual(gate(recovered.digits, 0, false), { blocks: 2573, invalid: 0 });

  console.log(JSON.stringify({
    originalRunes: original.length,
    observedAdjacentRepeats: repeats,
    base28DigitsWithRepeatsSkipped: digits.length,
    codewordCapacity: 28 ** 5,
    byteCapacity: 2 ** 24,
    bigEndianOriginal: big,
    littleEndianOriginal: little,
    plantedValidBlocks: 2573,
    plantedInvalidBlocks: 0
  }, null, 2));
  console.log("PASS: source-indexed direct 5×base28→3-byte transport is rejected.");
}

main();
