"use strict";

/**
 * A finite, clue-constrained historical lagged-Fibonacci receiver gate.
 *
 * P15's 16-cell source spiral visibly gives Fibonacci indices
 * 1,2,3,5,8,13,21,34,55,89,144,233,377,610,987.
 * The largest two Fibonacci indices fitting in the original p50 256-byte
 * table are 144 and 233. Freeze them as additive-lag state taps.
 *
 * Seed 256 bytes in exact row-major source order. For n>=256, compute
 * state[n] = (state[n-144] + state[n-233]) mod m,
 * m=256 (original-byte register) or m=29 (native GP29 register).
 * The first 256 target runes use untouched p50 seed values.
 *
 * Decode source p16..p21, immediately after the p15 spiral, continuously
 * across all six physical pages. No page resets, fitted initial phase,
 * reversed state, key search or iterative feedback. Test both additive signs.
 *
 * Original cipher positive: encrypt a known original clear GP p57 with
 * the very same stream and prove exact inverse for all of its 95 runes.
 *
 * SFT (Windows 11 Node 22):
 * node sims/lp2_p15_fibonacci_p50_256state_original_inverse_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const repo = path.resolve(__dirname, "..");
const load = p => JSON.parse(fs.readFileSync(path.join(repo, p), "utf8"));
const original = load("resources/liber-primus/lp2-corpus.json");
const grid = load("resources/liber-primus/base60-grid.json");
const state0 = grid.rows.flat().map(token => {
  const n = 60 * grid.alphabet.indexOf(token[0]) +
    grid.alphabet.indexOf(token[1]);
  assert(n >= 0 && n < 256);
  return n;
});
assert.equal(state0.length, 256);
const taps = [144, 233];
assert(taps.every(n => n < state0.length));
const pages = original.pages.slice(16, 22);
assert.deepEqual(pages.map(x => x.indices.length),
  [267, 273, 260, 271, 269, 273]);
const cipher = pages.flatMap(x => x.indices);
assert.equal(cipher.length, 1613);

/**
 * @param {number} mod
 * @param {number} length
 * @returns {number[]}
 */
function makeState(mod, length) {
  const seq = state0.map(n => n % mod);
  for (let i = seq.length; i < length; i++) {
    seq.push((seq[i - taps[0]] + seq[i - taps[1]]) % mod);
  }
  return seq;
}
/**
 * @param {number[]} ciphertext
 * @param {number[]} state
 * @param {number} sign
 * @returns {number[]}
 */
function apply(ciphertext, state, sign) {
  return ciphertext.map((n, i) => (29 + n + sign * (state[i] % 29)) % 29);
}
/** @param {number[]} x @returns {number} */
function ioc(x) {
  const frequencies = new Int32Array(29);
  x.forEach(n => frequencies[n]++);
  return Array.from(frequencies).reduce((s, n) => s + n * (n - 1), 0) /
    (x.length * (x.length - 1));
}
/** @param {number[]} x @returns {string} */
function romanize(x) {
  return x.map(n => original.translit[n]).join("");
}
const clear = original.pages[57].indices;
assert.equal(clear.length, 95);
for (const mod of [256, 29]) {
  const stream = makeState(mod, cipher.length);
  assert.equal(stream.length, cipher.length);
  const plant = apply(clear, stream, +1);
  assert.deepEqual(apply(plant, stream, -1), clear);
  for (const sign of [-1, +1]) {
    const decoded = apply(cipher, stream, sign);
    let offset = 0;
    const pageResults = pages.map(p => {
      const section = decoded.slice(offset, offset + p.indices.length);
      offset += p.indices.length;
      return {
        page: p.page,
        runes: section.length,
        ioc: ioc(section),
        preview: romanize(section.slice(0, 65))
      };
    });
    assert.equal(offset, cipher.length);
    assert(decoded.every(x => Number.isInteger(x) && x >= 0 && x < 29));
    assert(pageResults.every(x => x.ioc < 0.045),
      "no fully decoded source-native GP English page");
    console.log(JSON.stringify({
      source: "p15 Fibonacci indices 144/233, p50 table256 source seed",
      originalRunes: cipher.length, mod, sign,
      combinedIoC: ioc(decoded), pageResults
    }));
  }
}
console.log("PASS: original seeded-Fibonacci original-cipher receiver "
  + "fails GP-native prose on all six intact p16–21 pages; "
  + "synthetic solved-p57 native GP positive reencrypts exactly.");
