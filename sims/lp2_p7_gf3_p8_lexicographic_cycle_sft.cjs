"use strict";

/**
 * LP2 p7-to-p8 GF(3) lexicographic state-address transposition.
 * Tests both inequivalent 242-to-243 zero splices and both read directions.
 * Single-file Windows 11 / Node 22 test: from repo root run
 * node sims/lp2_p7_gf3_p8_lexicographic_cycle_sft.cjs
 * Reads only the canonical unchanged source corpus. No writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = JSON.parse(fs.readFileSync(path.resolve(
  __dirname, "..", "resources", "liber-primus", "lp2-corpus.json"
), "utf8"));
const p7 = source.pages[7].indices;
const p8 = source.pages[8].indices;
const p9 = source.pages[9].indices.slice(0, 243);
const p57 = source.pages[57].indices;
const redWords = [[23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]];
assert.deepEqual(p7.slice(-14), redWords.flat());
assert.equal(p7.length, 208);
assert.equal(p8.length, 255);
assert.equal(p9.length, 243);
assert.equal(p57.length, 95);

const coefficients = redWords.map(w => w.reduce((p, x) => p * x % 29, 1) % 3);
assert.deepEqual(coefficients, [2, 2, 2, 0, 2]);
const seed = coefficients.slice();

/** @param {number[]} s @returns {number[]} */
function advance(s) {
  return [...s.slice(1), coefficients.reduce((v, c, i) => v + c * s[i], 0) % 3];
}

/**
 * Test both mathematically valid m-sequence zero splices. Every five-trit
 * window now occurs once, yielding a bijection onto the printed 243 cells.
 * @returns {{addresses:number[],firstZeroRun:number,insertion:number}}
 */
function stateAddresses(firstZeroRun) {
  const trits = [];
  const visited = new Set();
  let state = seed.slice();
  for (let i = 0; i < 242; i++) {
    assert(!visited.has(state.join("")));
    visited.add(state.join(""));
    trits.push(state[0]);
    state = advance(state);
  }
  assert.deepEqual(state, seed);
  assert.equal(visited.size, 242);
  const zeroRuns = trits.flatMap((_, i) =>
    [0, 1, 2, 3].every(j => trits[(i + j) % 242] === 0) ? [i] : []);
  assert.deepEqual(zeroRuns, [83, 204]);
  assert(zeroRuns.includes(firstZeroRun));
  const insertion = (firstZeroRun + 4) % 242;
  assert.equal(insertion, firstZeroRun + 4);
  trits.splice(insertion, 0, 0);
  const addresses = Array.from({length:243}, (_, i) => {
    let value = 0;
    for (let j = 0; j < 5; j++) value = 3 * value + trits[(i + j) % 243];
    return value;
  });
  assert.equal(new Set(addresses).size, 243);
  assert.equal(Math.min(...addresses), 0);
  assert.equal(Math.max(...addresses), 242);
  assert.deepEqual(addresses.slice(0, 5), [236, 223, 184, 67, 203]);
  return {addresses,firstZeroRun,insertion};
}

/** @param {number[]} x @returns {number} */
function coincidence(x) {
  const h = Array(29).fill(0);
  for (const v of x) h[v]++;
  return h.reduce((n, v) => n + v * (v - 1), 0) / (x.length * (x.length - 1));
}

/**
 * Retrieve the rune at each ordinary lexicographic five-trit cell address.
 * @param {number[]} symbols
 * @param {number[]} order
 * @returns {number[]}
 */
function readByAddress(symbols, order) {
  return order.map(address => symbols[address]);
}

/**
 * Exact inverse to a given source-compatible read order.
 * @param {number[]} readout
 * @param {number[]} order
 * @returns {number[]}
 */
function writeByAddress(readout, order) {
  const original = Array(243);
  for (let i = 0; i < 243; i++) original[order[i]] = readout[i];
  return original;
}

const addressSets = [83, 204].map(stateAddresses);
const black = p8.slice(12);
assert.equal(black.length, 243);
assert.equal(black.filter(x => x === 18).length, 7);
assert.equal(p9.filter(x => x === 18).length, 6);
assert(coincidence(p57) > 0.06);
const nativeControl = Array.from({length:243}, (_, i) => p57[i % 95]);
const results = [];
for (const {addresses, firstZeroRun, insertion} of addressSets) {
for (const [direction,order] of [
  ["forward", addresses],
  ["reverse", addresses.slice().reverse()]
]) {
  const encryptedPlant = writeByAddress(nativeControl, order);
  assert.deepEqual(readByAddress(encryptedPlant, order), nativeControl);
  for (const [page, input] of [[8,black],[9,p9]]) {
    const decoded = readByAddress(input, order);
    assert.deepEqual(writeByAddress(decoded, order), input);
    assert.equal(decoded.filter(x => x === 18).length, page === 8 ? 7 : 6);
    assert.equal(coincidence(decoded), coincidence(input));
    results.push({
      firstZeroRun, insertion,
      physicalPage:page,
      direction,
      GP29Runes:243,
      E:decoded.filter(x => x === 18).length,
      IoC:+coincidence(decoded).toFixed(12),
      fullReadout:decoded.map(x => source.translit[x]).join("."),
      inverseReconstruction:"243/243",
      plantedSolvedGP29Recovery:"243/243"
    });
  }
}
}
assert.equal(results.length, 8);
console.log(JSON.stringify({
  source:"Original p7 five red word products; original p8 243 black runes; adjacent p9 first243 only as a mechanical control",
  coefficients,
  seed,
  spliceAlternatives:addressSets.map(({firstZeroRun,insertion,addresses}) =>
    ({firstZeroRun,insertion,addressHead:addresses.slice(0,20)})),
  originalP8GP29IoC:+coincidence(black).toFixed(12),
  originalP9GP29IoC:+coincidence(p9).toFixed(12),
  solvedP57GP29IoC:+coincidence(p57).toFixed(12),
  verdict:"All four exact splice-and-direction address readings are lossless but none yields legible plaintext or an original-key instruction.",
  results
}, null, 2));
