"use strict";

const assert = require("node:assert/strict");

const MOD = 29;

/** @param {number} value @returns {number} */
function mod(value) {
  return ((value % MOD) + MOD) % MOD;
}

/** @param {number} base @param {number} exponent @returns {number} */
function modPow(base, exponent) {
  let out = 1;
  let x = mod(base);
  let e = exponent;
  while (e > 0) {
    if (e & 1) out = mod(out * x);
    x = mod(x * x);
    e = Math.floor(e / 2);
  }
  return out;
}

/** @param {number} value @returns {number} */
function inverse(value) {
  for (let candidate = 1; candidate < MOD; candidate += 1) {
    if (mod(value * candidate) === 1) return candidate;
  }
  throw new Error("noninvertible value");
}

/** @param {number} x @param {number} y @returns {number[]} */
function scalarFamily(x, y) {
  return [
    mod(x),
    mod(y),
    mod(x + y),
    mod(x - y),
    mod(y - x),
    mod(x * y),
    mod(x * inverse(y)),
    mod(y * inverse(x)),
    modPow(x, y),
    modPow(y, x),
  ];
}

const left = scalarFamily(6, 23);
const right = scalarFamily(2, 8);
assert.deepEqual(left, [6, 23, 0, 12, 17, 22, 28, 28, 22, 24]);
assert.deepEqual(right, [2, 8, 10, 23, 6, 16, 22, 4, 24, 6]);

const targets = new Set(["2,18", "10,15", "17,18"]);

/** @param {[number, number]} cipher @returns {number} */
function targetHitCount(cipher) {
  let count = 0;
  for (const l of left) {
    for (const r of right) {
      for (const key of [[l, r], [r, l]]) {
        for (const sign of [-1, 1]) {
          const plain = [
            mod(cipher[0] + sign * key[0]),
            mod(cipher[1] + sign * key[1]),
          ];
          if (targets.has(plain.join(","))) count += 1;
        }
      }
    }
  }
  return count;
}

assert.equal(10 * 10 * 2 * 2, 400);
assert.equal(targetHitCount([8, 5]), 1);

let anyHit = 0;
let exactlyOneHit = 0;
for (let first = 0; first < MOD; first += 1) {
  for (let second = 0; second < MOD; second += 1) {
    const count = targetHitCount([first, second]);
    if (count >= 1) anyHit += 1;
    if (count === 1) exactlyOneHit += 1;
  }
}

assert.equal(anyHit, 552);
assert.equal(exactlyOneHit, 248);

console.log(JSON.stringify({
  status: "PASS",
  observedCipher: [8, 5],
  observedTargetHits: 1,
  allPossibleTwoRuneCiphertexts: MOD * MOD,
  ciphertextsWithAnyTargetHit: anyHit,
  ciphertextsWithExactlyOneTargetHit: exactlyOneHit,
  anyHitRate: anyHit / (MOD * MOD),
  exactlyOneHitRate: exactlyOneHit / (MOD * MOD),
}, null, 2));
