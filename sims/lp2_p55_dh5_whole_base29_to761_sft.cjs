"use strict";
/**
 * Original-input whole-register BASE29 -> BASE761 serialization gate for the
 * signed 2013 DH5 model, on all 76 untouched physical LP2 p55 runes.
 * Node 22 / Windows:
 * node sims/lp2_p55_dh5_whole_base29_to761_sft.cjs
 *
 * This tests a *literal representation* of an independent-source group orbit,
 * rather than attempting a new ciphertext-dependent decryption.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources/liber-primus/lp2-corpus.json"), "utf8"));
const ciphertext = corpus.pages.find(x => x.page === 55).indices;
assert.equal(ciphertext.length, 76);

/** Convert source-ordered GP indices (each 0..28) to one integer. */
function fromDigits(digits, radix) {
  let n = 0n;
  for (const digit of digits) {
    assert(Number.isInteger(digit) && digit >= 0 && BigInt(digit) < radix);
    n = n * radix + BigInt(digit);
  }
  return n;
}
/** Convert an arbitrary nonnegative integer into canonical MSB-first digits. */
function toDigits(n, radix) {
  if (n === 0n) return [0];
  const result = [];
  while (n > 0n) {
    result.unshift(Number(n % radix));
    n /= radix;
  }
  return result;
}
/** Count exact source-generator multiplicative edges. */
function edges(digits, multiplier) {
  let count = 0;
  for (let i = 1; i < digits.length; i++) {
    if (digits[i] === (digits[i - 1] * multiplier) % 761) count++;
  }
  return count;
}
const printed = [];
for (const order of ["printed", "reversed"]) {
  const source = order === "printed" ? ciphertext : [...ciphertext].reverse();
  const n = fromDigits(source, 29n);
  const digits = toDigits(n, 761n);
  printed.push({
    order,
    inputRunes: source.length,
    base761Digits: digits.length,
    leadingDigits: digits.slice(0, 6),
    consecutive5Edges: edges(digits, 5),
    consecutive23Edges: edges(digits, 23),
    first38Generator5Edges: edges(digits.slice(0, 38), 5),
    last38Generator5Edges: edges(digits.slice(-38), 5),
    first38Generator23Edges: edges(digits.slice(0, 38), 23),
    last38Generator23Edges: edges(digits.slice(-38), 23),
  });
}
assert.deepEqual(printed.map(v => v.base761Digits), [39, 39]);
assert.deepEqual(printed.map(v => v.leadingDigits), [
  [33, 518, 7, 327, 143, 485],
  [16, 286, 232, 632, 266, 733],
]);
assert.deepEqual(printed.map(v => [v.consecutive5Edges, v.consecutive23Edges]),
  [[0, 0], [1, 0]]);
for (const record of printed) {
  assert(record.first38Generator5Edges < 37);
  assert(record.last38Generator5Edges < 37);
  assert(record.first38Generator23Edges < 37);
  assert(record.last38Generator23Edges < 37);
}

// Independent positive: the 2013 DH source base5 has an exact order-38 orbit
// modulo the separately sourced 761 MP3 title prime. A full 38-state orbit,
// treated as a single BASE761 integer and represented by exactly 76 GP digits,
// must survive this whole-number base conversion with no pair boundaries.
const orbit = [];
let state = 1;
for (let i = 0; i < 38; i++) {
  assert(!orbit.includes(state));
  orbit.push(state);
  state = state * 5 % 761;
}
assert.equal(state, 1);
assert.equal(orbit.length, 38);
assert.equal(edges(orbit, 5), 37);
const packed = toDigits(fromDigits(orbit, 761n), 29n);
assert(packed.length <= 76);
const padded = Array(76 - packed.length).fill(0).concat(packed);
assert.equal(padded.length, 76);
const unpacked = toDigits(fromDigits(padded, 29n), 761n);
assert.deepEqual(unpacked, orbit);
const reversePadded = [...padded].reverse();
assert.deepEqual(toDigits(fromDigits([...reversePadded].reverse(), 29n), 761n),
  orbit);
console.log(JSON.stringify({
  sourceModulus: 761,
  signed2013DHBase: 5,
  orbitOrder: 38,
  originalP55Runes: ciphertext.length,
  originalBigIntegerConversions: printed,
  syntheticOrbitWholeBase29PackedDigits: packed.length,
  recoveredOrbitNativePlant: unpacked.length === 38 &&
    edges(unpacked, 5) === 37,
  unknownPlaintextRecovered: false,
}, null, 2));
