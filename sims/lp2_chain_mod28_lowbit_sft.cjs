"use strict";

/**
 * Source-original direct mod28 chained-emitter low-bit test.
 * Run: node sims/lp2_chain_mod28_lowbit_sft.cjs
 *
 * This asks whether C[i] = C[i-1] + 1 + (R[i] mod 28) (mod 29)
 * could be emitted by a low-state GF(2)-linear PRNG with R a 32-bit word.
 * It makes NO decryption or author-intent claim.
 */

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));

/**
 * Berlekamp-Massey binary linear complexity. Input: observed 0/1 values.
 * @param {number[]} bits
 * @returns {number}
 */
function linearComplexity(bits) {
  let current = [1];
  let previous = [1];
  let length = 0;
  let lastChange = -1;
  for (let index = 0; index < bits.length; index++) {
    let discrepancy = bits[index];
    for (let k = 1; k <= length; k++) {
      discrepancy ^= (current[k] || 0) & bits[index - k];
    }
    if (!discrepancy) continue;
    const old = current.slice();
    const shift = index - lastChange;
    for (let k = 0; k < previous.length; k++) {
      current[k + shift] = (current[k + shift] || 0) ^ previous[k];
    }
    if (2 * length <= index) {
      length = index + 1 - length;
      previous = old;
      lastChange = index;
    }
  }
  return length;
}

/**
 * Direct modulo-28 map: for D = C[i]-C[i-1] (mod 29), R%28 = D-1.
 * Stops at zero deltas because those cannot be emitted by this operation.
 * @param {number[]} ciphertext
 * @returns {{start: number, deltas: number[]}[]}
 */
function uninterruptedRuns(ciphertext) {
  /** @type {{start: number, deltas: number[]}[]} */
  const runs = [];
  let deltas = [];
  let start = 1;
  function flush() {
    if (deltas.length) runs.push({ start, deltas });
  }
  for (let i = 1; i < ciphertext.length; i++) {
    const delta = (ciphertext[i] - ciphertext[i - 1] + 29) % 29;
    if (delta === 0) {
      flush();
      deltas = [];
      start = i + 1;
    } else {
      deltas.push(delta - 1);
    }
  }
  flush();
  return runs;
}

/**
 * @param {number[]} raw
 * @returns {{bit0:number, bit1:number}}
 */
function score(raw) {
  return {
    bit0: linearComplexity(raw.map(x => x & 1)),
    bit1: linearComplexity(raw.map(x => (x >>> 1) & 1))
  };
}

/**
 * Xorshift32: period-state dimension 32.
 * @param {number} count
 * @returns {number[]}
 */
function xorshift32(count) {
  let state = 0x13579bdf;
  const out = [];
  for (let i = 0; i < count; i++) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    out.push(state % 28);
  }
  return out;
}

/**
 * Marsaglia xorshift128: period-state dimension 128.
 * @param {number} count
 * @returns {number[]}
 */
function xorshift128(count) {
  const state = [0x12345678, 0x87654321, 0x9abcdef0, 0x10203040];
  const out = [];
  for (let i = 0; i < count; i++) {
    const t = state[0] ^ (state[0] << 11);
    state[0] = state[1];
    state[1] = state[2];
    state[2] = state[3];
    state[3] = (state[3] ^ (state[3] >>> 19) ^ t ^ (t >>> 8)) >>> 0;
    out.push(state[3] % 28);
  }
  return out;
}

/**
 * Positive plant: round-trip the 28-step stream to 29-source ciphertext,
 * and recover the source low-bit sequence from ciphertext differences.
 * @param {number[]} raw
 * @returns {number[]}
 */
function plantedChain(raw) {
  const cipher = [17];
  for (const k of raw) cipher.push((cipher[cipher.length - 1] + 1 + k) % 29);
  const recovered = uninterruptedRuns(cipher).flatMap(run => run.deltas);
  assert.deepEqual(recovered, raw);
  return recovered;
}

const originalPages = source.pages.filter(
  p => p.page >= 0 && p.page <= 55 && Array.isArray(p.indices) && p.indices.length > 0
);
assert.equal(originalPages.length, 55);
assert.equal(originalPages.reduce((total, page) => total + page.indices.length, 0), 12956);
let totalRepeats = 0;
const originalRuns = [];
for (const page of originalPages) {
  totalRepeats += page.indices.slice(1).filter((x, i) => x === page.indices[i]).length;
  for (const run of uninterruptedRuns(page.indices)) {
    if (run.deltas.length < 150) continue;
    originalRuns.push({
      page: page.page,
      start: run.start,
      length: run.deltas.length,
      ...score(run.deltas)
    });
  }
}
assert.equal(totalRepeats, 86);
const decisive = originalRuns.filter(
  run => run.length >= 260 && run.bit0 > 128 && run.bit1 > 128
);
assert.equal(decisive.length, 5);
const page17 = originalRuns.find(run => run.page === 17 && run.start === 1);
assert.deepEqual(page17, { page: 17, start: 1, length: 272, bit0: 138, bit1: 140 });

const sampleSize = page17.length;
const plant32 = score(plantedChain(xorshift32(sampleSize)));
const plant128 = score(plantedChain(xorshift128(sampleSize)));
assert.deepEqual(plant32, { bit0: 32, bit1: 32 });
assert.deepEqual(plant128, { bit0: 128, bit1: 128 });

console.log("Source pages=" + originalPages.length +
  " rune count=12956 repeats=" + totalRepeats);
console.log("Original uninterrupted runs of 150+ steps=" + originalRuns.length);
console.log("Original 128-bit contradictions=" + JSON.stringify(decisive));
console.log("Source p17 full local stream=" + JSON.stringify(page17));
console.log("Planted xorshift32=" + JSON.stringify(plant32) +
  " xorshift128=" + JSON.stringify(plant128));
console.log("PASS: the direct modulo-28 differential model's linear" +
  " ≤128-bit output-state family is incompatible with source p17." +
  " No plaintext or historical generator recovered.");
