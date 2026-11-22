"use strict";

/**
 * Literal p7 five-red-word GF29 products, reduced mod3, form a maximal
 * five-trit 242-state LFSR. Complete its unique missing all-zero state
 * using the first source-seeded run of four zeros; test the 243-rune p8
 * black body as a complete five-trit address table for original p9–p14.
 *
 * Repro (Windows 11 / Node 22):
 * node sims/lp2_p7_primitive_gf3_p8_debruijn_lookup_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const gp = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const p7 = gp.pages[7].indices;
const p8 = gp.pages[8].indices;
const p57 = gp.pages[57].indices;
const recipient = gp.pages.slice(9, 15).flatMap(p => p.indices);
assert.equal(p7.length, 208);
assert.equal(p8.length, 255);
assert.equal(p57.length, 95);
assert.deepEqual(p8.slice(0, 12), [14, 10, 14, 19, 1, 14, 19, 5, 2, 13, 3, 17]);

const redWords = [[23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]];
assert.deepEqual(p7.slice(194), redWords.flat());
const products = redWords.map(word => word.reduce((a, r) => a * r % 29, 1));
assert.deepEqual(products, [11, 26, 8, 15, 2]);
const coefficients = products.map(x => x % 3);
assert.deepEqual(coefficients, [2, 2, 2, 0, 2]);
const p8Black = p8.slice(12);
assert.equal(p8Black.length, 243);

/** @param {number[]} state @returns {number[]} */
function advance(state) {
  assert.equal(state.length, 5);
  return [...state.slice(1), coefficients.reduce((a, c, i) => a + c * state[i], 0) % 3];
}

/** @param {number[]} seed @returns {number[]} */
function maximalSequence(seed) {
  assert.equal(seed.length, 5);
  assert(seed.some(x => x !== 0));
  const visited = new Set();
  const sequence = [];
  let state = seed.slice();
  for (let i = 0; i < 242; i++) {
    const k = state.join("");
    assert(!visited.has(k), "LFSR has unexpected short period");
    visited.add(k);
    sequence.push(state[0]);
    state = advance(state);
  }
  assert.deepEqual(state, seed, "LFSR did not return at 242");
  assert.equal(visited.size, 242);
  assert(!visited.has("00000"));
  return sequence;
}

/**
 * The maximal cyclic ternary 242-sequence omits state 00000.
 * Insert one 0 immediately after the first four-zero cyclic run. This
 * yields 243 different five-consecutive-trit windows.
 * @param {number[]} sequence
 * @returns {{states:number[],insertion:number,firstZeroRun:number}}
 */
function insertMissingZero(sequence) {
  assert.equal(sequence.length, 242);
  const firstZeroRun = sequence.findIndex((_, i) =>
    Array.from({length:4}, (_, j) => sequence[(i + j) % 242]).every(x => x === 0));
  assert(firstZeroRun >= 0);
  const insertion = (firstZeroRun + 4) % 242;
  const states = [...sequence.slice(0, insertion), 0, ...sequence.slice(insertion)];
  assert.equal(states.length, 243);
  const addresses = Array.from({length:243}, (_, i) => {
    let code = 0;
    for (let j = 0; j < 5; j++) code = 3 * code + states[(i + j) % 243];
    return code;
  });
  assert.equal(new Set(addresses).size, 243);
  assert.equal(new Set(addresses).has(0), true);
  return { states: addresses, insertion, firstZeroRun };
}

/** @param {number} x @returns {number} */
function mod29(x) { return (x % 29 + 29) % 29; }

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const x of symbols) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (symbols.length * (symbols.length - 1));
}

/**
 * @param {number[]} lastFive
 * @param {boolean} usePrime
 * @returns {number}
 */
function fiveAddress(lastFive, usePrime) {
  return lastFive.reduce((v, x) =>
    3 * v + (usePrime ? gp.prime[x] % 3 : x % 3), 0);
}

/**
 * A key depends on the previous five emitted ciphertext or recovered
 * plaintext GP symbols. The p8 source table is keyed by the LFSR's
 * numerical five-trit state.
 * @param {number[]} c
 * @param {number[]} table
 * @param {boolean} usePrime
 * @param {"cipher"|"plain"} driver
 * @param {1|-1} sign
 * @returns {number[]}
 */
function decode(c, table, usePrime, driver, sign) {
  const state = p8.slice(-5);
  const plaintext = [];
  for (const symbol of c) {
    const address = fiveAddress(state.slice(-5), usePrime);
    const p = mod29(symbol - sign * table[address]);
    plaintext.push(p);
    state.push(driver === "cipher" ? symbol : p);
  }
  return plaintext;
}

/** @param {number[]} plaintext
 * @param {number[]} table
 * @param {boolean} usePrime
 * @param {"cipher"|"plain"} driver
 * @param {1|-1} sign
 * @returns {number[]}
 */
function encode(plaintext, table, usePrime, driver, sign) {
  const state = p8.slice(-5);
  const ciphertext = [];
  for (const p of plaintext) {
    const address = fiveAddress(state.slice(-5), usePrime);
    const c = mod29(p + sign * table[address]);
    ciphertext.push(c);
    state.push(driver === "cipher" ? c : p);
  }
  return ciphertext;
}

const sourceSeeds = [
  ["p7 red-product trits", coefficients],
  ["p8 first-five-red trits", p8.slice(0, 5).map(x => x % 3)]
];
const results = [];
for (const [seedName, seed] of sourceSeeds) {
  const seq = maximalSequence(seed);
  const { states: addresses, insertion, firstZeroRun } = insertMissingZero(seq);
  const table = Array(243);
  for (let i = 0; i < 243; i++) table[addresses[i]] = p8Black[i];
  assert.equal(table.filter(x => x !== undefined).length, 243);
  for (const usePrime of [false, true]) {
    for (const sign of [-1, 1]) {
      for (const driver of ["cipher", "plain"]) {
        const decoded = decode(recipient, table, usePrime, driver, sign);
        assert.deepEqual(encode(decoded, table, usePrime, driver, sign), recipient);
        const planted = encode(p57, table, usePrime, driver, sign);
        assert.deepEqual(decode(planted, table, usePrime, driver, sign), p57);
        const originalIoC = ioc(decoded);
        assert(originalIoC < 0.038, "unexpected original text statistical shift");
        results.push({
          seed: seedName, seedTrits: seed.join(""), zeroRunAt: firstZeroRun,
          zeroInsertedAt: insertion,
          tritReading: usePrime ? "GP prime residue" : "GP ordinal residue",
          sign, driver,
          originalRecipientRunes: decoded.length,
          outputIoC: +originalIoC.toFixed(8),
          first30: decoded.slice(0, 30).map(x => gp.translit[x]).join("."),
          nativeSolvedPlant: "95/95", reencryption: "full"
        });
      }
    }
  }
}
assert.equal(results.length, 16);
assert(ioc(p57) > 0.06);
console.log(JSON.stringify({
  source: "p7 red last14; p8 red12+black243; original p9–14 complete; solved p57 positive",
  vector: products, reducedGF3Coefficients: coefficients,
  sourceLFSRNonzeroStatePeriod: 242, augmentedDeBruijnCycle: 243,
  p8BlackRuneValues: 243, originalTargetRunes: recipient.length,
  originalRecipientRawIoC: +ioc(recipient).toFixed(8),
  solvedP57IoC: +ioc(p57).toFixed(8),
  verdict: "Exact GF3 source-derived 243-state address construction; all 16 tested direct GP29 lookup ciphers remain original-ciphertext-like; no plaintext.",
  results
}, null, 2));
