"use strict";

/**
 * Source-bounded inverse: five original numbered LP2 passages, round-robin
 * column mixing, and the historically solved page-56 prime-totient pad.
 * Candidate only. A failing original-language result does not reject other
 * mix clocks, transpositions, encodings, or keys.
 * @returns {void}
 */
function main() {
  const assert = require("node:assert/strict");
  const fs = require("node:fs");
  const path = require("node:path");
  const corpus = JSON.parse(fs.readFileSync(
    path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"
  ));
  /** @param {number} n @returns {number[]} */
  const page = n => corpus.pages.find(p => p.page === n).indices;
  const input = [...page(36).slice(99), ...page(37), ...page(38).slice(0, 186)];
  const lengths = [139, 91, 98, 96, 129];
  assert.equal(input.length, 553);
  assert.equal(lengths.reduce((a, b) => a + b, 0), 553);

  const parts = [];
  for (let i = 0, offset = 0; i < lengths.length; i++) {
    parts.push(input.slice(offset, offset + lengths[i]));
    offset += lengths[i];
  }

  /**
   * Visit source numbered passages column-by-column, skipping exhausted
   * passages without adding symbols.
   * @param {boolean} reverse
   * @returns {{stream:number[], originalPositions:number[]}}
   */
  function interleave(reverse) {
    const indices = reverse ? [4, 3, 2, 1, 0] : [0, 1, 2, 3, 4];
    const starts = [0, 139, 230, 328, 424];
    const stream = [];
    const originalPositions = [];
    for (let col = 0; col < 139; col++) {
      for (const row of indices) {
        if (col < lengths[row]) {
          stream.push(parts[row][col]);
          originalPositions.push(starts[row] + col);
        }
      }
    }
    assert.equal(stream.length, input.length);
    const recovered = Array(input.length);
    originalPositions.forEach((offset, i) => { recovered[offset] = stream[i]; });
    assert.deepEqual(recovered, input);
    return {stream, originalPositions};
  }

  const primes = [];
  for (let n = 2; primes.length < input.length; n++) {
    let prime = true;
    for (const p of primes) {
      if (p * p > n) break;
      if (n % p === 0) { prime = false; break; }
    }
    if (prime) primes.push(n);
  }
  const key = primes.map(p => (p - 1) % 29);
  /** @param {number[]} sequence @returns {number} */
  function ioc(sequence) {
    const counts = Array(29).fill(0);
    sequence.forEach(i => counts[i]++);
    return counts.reduce((s, n) => s + n * (n - 1), 0) /
      (sequence.length * (sequence.length - 1));
  }
  /** @param {number[]} sequence @param {number} sign @returns {number[]} */
  const shift = (sequence, sign) =>
    sequence.map((c, i) => (c + sign * key[i] + 29) % 29);

  const models = [
    ["as-printed", input],
    ["round-robin-1-to-5", interleave(false).stream],
    ["round-robin-5-to-1", interleave(true).stream]
  ];
  const results = [];
  for (const [model, sequence] of models) {
    for (const sign of [-1, 1]) {
      const output = shift(sequence, sign);
      assert.deepEqual(shift(output, -sign), sequence);
      results.push({
        model, sign, length: output.length, ioc: ioc(output),
        beginning: output.slice(0, 35).map(i => corpus.translit[i]).join(" ")
      });
    }
  }
  const expected = [
    .03418114631653432, .034797022826742144,
    .03466598527137878, .0346201221270016,
    .0347642634379013, .034823230337814814
  ];
  assert.equal(results.length, expected.length);
  results.forEach((r, i) => assert.ok(Math.abs(r.ioc - expected[i]) < 1e-12));
  assert.ok(Math.max(...results.map(r => r.ioc)) < 0.035);
  console.log(JSON.stringify({
    source: "Original LP2 pp36-38, numbered 1-5, 553 GP29 runes",
    originalIoc: ioc(input), primeCount: key.length,
    keyRule: "k_j = (jth prime - 1) mod 29; phase zero at source enclosure",
    outcomes: results,
    conclusion: "No direct native GP29 plaintext under these six fixed mixes and signed shifts"
  }, null, 2));
}

if (require.main === module) main();
module.exports = {main};
