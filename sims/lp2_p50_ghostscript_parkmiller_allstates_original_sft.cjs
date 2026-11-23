"use strict";
/**
 * Source-grounded Ghostscript 9.06 Park-Miller rand() test against the original
 * LP2 pp49-51 32x8 numerical panel, without secret seed guessing.
 *
 * Source premise: Ghostscript 9.06's zmath.c exposes the Park-Miller generator
 * (16807*x) mod (2^31-1). The original LP2 JPEG renderings contain an
 * Artifex/Ghostscript ICC profile, which motivates this bounded generator
 * check; it does not establish that Ghostscript generated the numeral panel.
 *
 * Windows Node.js 22, CommonJS. Read-only single runnable test.
 * Original inputs: resources/liber-primus/lp2-grid-256.json.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const source = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-grid-256.json"), "utf8"
));
const M = 2147483647, A = 16807, WIDTH = 8, LENGTH = 256;
assert.equal(source.bytes.length, LENGTH);
assert.equal(source.pages.flatMap(p => p.tokens).length, LENGTH);
assert.equal(source.alphabet.length, 60);
assert.equal(crypto.createHash("sha256")
  .update(Buffer.from(source.bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);
/** @param {number} x */
function next(x) {
  return (A * x) % M; // Maximum exact product is below 2^53.
}
/** @param {number} x @returns {number} */
function highByte(x) {
  return Math.floor(256 * x / M);
}
/** @param {number} x @returns {number} */
function rotate8(x) {
  return (256 * x) % M; // Exact even for 31-bit x.
}
/**
 * In the 31-bit Mersenne field, multiplying a state by 2^8 rotates its
 * 31 bits. Since multiplying by A commutes with this rotation, the low-byte
 * and top-byte model classes are algebraically the same class of generators
 * under a one-to-one seed relabelling, not two independent trials.
 *
 * If x = q*2^23+r, then 256*x mod M = q+256*r and
 * (256*x mod M) mod 256 = q = floor(256*x/M).
 * @param {number} state
 */
function assertProjectionConjugacy(state) {
  assert(state >= 1 && state < M);
  assert.equal(rotate8(state) % 256, highByte(state));
  assert.equal(next(rotate8(state)), rotate8(next(state)));
}
for (const x of [1, 3301, 1033, 8388607, 8388608, 2147483646]) {
  assertProjectionConjugacy(x);
}
/** @param {number[]} values */
function columns(values) {
  assert.equal(values.length, LENGTH);
  const out = [];
  for (let c = 0; c < WIDTH; c++)
    for (let r = 0; r < LENGTH / WIDTH; r++)
      out.push(values[r * WIDTH + c]);
  return out;
}
/** @param {number} radix @returns {number[]} */
function fromOriginalTokens(radix) {
  assert(radix === 59 || radix === 60);
  const alpha = radix === 60 ? source.alphabet :
    source.alphabet.replace("f", "");
  assert.equal(alpha.length, radix);
  return source.pages.flatMap(p => p.tokens).map(t => {
    assert.equal(t.length, 2);
    const high = alpha.indexOf(t[0]), low = alpha.indexOf(t[1]);
    assert(high >= 0 && low >= 0);
    const b = radix * high + low;
    assert(b >= 0 && b <= 255);
    return b;
  });
}
assert.deepEqual(fromOriginalTokens(60), source.bytes);
/** @param {number} seed @param {number} n @returns {number[]} */
function plant(seed, n) {
  assert(seed >= 1 && seed < M);
  const out = [seed % 256];
  let state = seed;
  while (out.length < n) {
    state = next(state);
    out.push(state % 256);
  }
  return out;
}
/**
 * Exhaustively enumerate ALL 31-bit states with the first observed byte.
 * State is the first *emitted* Park-Miller state, equivalent to any secret
 * preceding seed since A is invertible modulo M.
 *
 * The true candidate must match the entire source, so early eight-cell
 * rejection is a mathematically complete negative for this generator.
 * @param {number[]} observed
 */
function allStates(observed) {
  assert.equal(observed.length, LENGTH);
  const first = observed[0], counts = [0, 0, 0, 0, 0];
  const survivors = [];
  let checked = 0, bestPrefix = 1, bestState = 0;
  for (let state = first || 256; state < M; state += 256) {
    checked++;
    let x = state, matches = 1;
    while (matches < 8) {
      x = next(x);
      if (x % 256 !== observed[matches]) break;
      matches++;
    }
    for (let k = 2; k <= 4; k++) if (matches >= k) counts[k]++;
    if (matches > bestPrefix) { bestPrefix = matches; bestState = state; }
    if (matches === 8) {
      for (let i = 8; i < LENGTH; i++) {
        x = next(x);
        if (x % 256 !== observed[i]) break;
        matches++;
      }
      if (matches === LENGTH) survivors.push(state);
      if (matches > bestPrefix) { bestPrefix = matches; bestState = state; }
    }
  }
  assert.equal(checked, 8388608);
  return {checked, first2:counts[2], first3:counts[3],
    first4:counts[4], bestPrefix, bestState, full256Seeds:survivors};
}
const cases = [
  {radix:60, order:"row", expected:[32940,106,0,3]},
  {radix:60, order:"column", expected:[32442,146,0,3]},
  {radix:59, order:"row", expected:[32941,143,1,4]},
  {radix:59, order:"column", expected:[32441,116,1,4]}
];
for (const c of cases) {
  const flat = fromOriginalTokens(c.radix);
  const bytes = c.order === "row" ? flat : columns(flat);
  const found = allStates(bytes);
  assert.deepEqual(
    [found.first2, found.first3, found.first4, found.bestPrefix], c.expected
  );
  assert.deepEqual(found.full256Seeds, []);
  console.log("ORIGINAL", JSON.stringify({radix:c.radix,
    order:c.order, projection:"rand_low8; high8 is seed-conjugate", ...found}));
}
// Original-size positive plant, recovered without being told the state.
const planted = plant(3301, LENGTH);
const positive = allStates(planted);
assert.equal(positive.bestPrefix, LENGTH);
assert(positive.full256Seeds.includes(3301));
assert.deepEqual(plant(positive.full256Seeds[0], LENGTH), planted);
const highPlant = planted.map((_, i) => {
  let state = 3301;
  for (let n = 0; n < i; n++) state = next(state);
  return highByte(state);
});
assert.deepEqual(plant(rotate8(3301), LENGTH), highPlant);
console.log("POSITIVE", JSON.stringify({length:LENGTH,
  exactRecoveredState:positive.full256Seeds.includes(3301),
  high8ConjugacyProven:true, originalFull256Hits:0}));
console.log("PASS: no 31-bit Ghostscript 9.06 Park-Miller state reproduces " +
  "the original panel in the four source-readout cases; high8 is redundant.");
