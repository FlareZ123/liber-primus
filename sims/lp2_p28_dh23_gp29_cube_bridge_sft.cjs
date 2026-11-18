"use strict";

const assert = require("node:assert/strict");

const p = 23;
const g = 5;
const a = 6;
const B = 19;
const gpPrime = 29;

/**
 * @param {number} base
 * @param {number} exponent
 * @param {number} modulus
 * @returns {number}
 */
function modPow(base, exponent, modulus) {
  let x = base % modulus;
  let e = exponent;
  let out = 1;
  while (e > 0) {
    if (e & 1) out = (out * x) % modulus;
    x = (x * x) % modulus;
    e >>= 1;
  }
  return out;
}

/**
 * @param {number} x
 * @param {number} modulus
 * @returns {number}
 */
function multiplicativeOrder(x, modulus) {
  let y = 1;
  for (let k = 1; k < modulus; k += 1) {
    y = (y * x) % modulus;
    if (y === 1) return k;
  }
  throw new Error("no multiplicative order");
}

const bCandidates = [];
for (let b = 1; b <= 22; b += 1) {
  if (modPow(g, b, p) === B) bCandidates.push(b);
}
assert.deepEqual(bCandidates, [15]);

const b = bCandidates[0];
const A = modPow(g, a, p);
const K = modPow(B, a, p);
assert.equal(A, 8);
assert.equal(K, 2);
assert.equal(modPow(A, b, p), K);

const exponent = g - K;
assert.equal(exponent, 3);
assert.equal(a / K, 3);
assert.equal(modPow(K, exponent, gpPrime), A);
assert.equal(modPow(A, exponent, gpPrime), B);
assert.equal(modPow(B, exponent, gpPrime), b);

const orbit = [];
let x = K;
do {
  orbit.push(x);
  x = modPow(x, exponent, gpPrime);
} while (x !== K);
assert.deepEqual(orbit, [2, 8, 19, 15, 11, 26]);
assert.equal(orbit.length, a);
for (const root of orbit) {
  assert.equal(multiplicativeOrder(root, gpPrime), 28);
}

const inverseExponent = 19;
assert.equal((exponent * inverseExponent) % 28, 1);
for (let value = 0; value < gpPrime; value += 1) {
  assert.equal(
    modPow(modPow(value, exponent, gpPrime), inverseExponent, gpPrime),
    value
  );
}

const familyHits = [];
for (let aa = 1; aa <= 22; aa += 1) {
  for (let bb = 1; bb <= 22; bb += 1) {
    const AA = modPow(g, aa, p);
    const BB = modPow(g, bb, p);
    const KK = modPow(BB, aa, p);
    const ee = (g - KK + gpPrime) % gpPrime;
    if (
      modPow(KK, ee, gpPrime) === AA &&
      modPow(AA, ee, gpPrime) === BB &&
      modPow(BB, ee, gpPrime) === bb
    ) {
      familyHits.push({ a: aa, b: bb, A: AA, B: BB, K: KK, e: ee });
    }
  }
}

assert.deepEqual(familyHits, [
  { a: 6, b: 15, A: 8, B: 19, K: 2, e: 3 },
]);

console.log(JSON.stringify({
  status: "PASS",
  dh23: { p, g, a, b, A, B, K },
  gp29Bridge: {
    exponent,
    independentExponentIdentity: "g-K = a/K = 3",
    cubeChain: [K, A, B, b],
    fullPrimitiveRootOrbit: orbit,
    orbitLength: orbit.length,
    inverseCubeExponent: inverseExponent,
  },
  exhaustiveFixedGroupSecretPairs: {
    tested: 22 * 22,
    matches: familyHits,
  },
}, null, 2));
