"use strict";

const assert = require("node:assert/strict");

const MOD = 29;
const dh = {p:23, g:5, a:6, b:15, A:8, B:19, K:2};
const orbit = [1,3,9,27,25,19];

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base, exponent, modulus) {
  let out = 1;
  let x = ((base % modulus) + modulus) % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) out = (out * x) % modulus;
    x = (x * x) % modulus;
    e = Math.floor(e / 2);
  }
  return out;
}

/** @template T @param {T[]} values @param {number} length @returns {T[][]} */
function permutations(values, length) {
  if (length === 0) return [[]];
  const out = [];
  for (let index = 0; index < values.length; index += 1) {
    const head = values[index];
    const rest = values.slice(0, index).concat(values.slice(index + 1));
    for (const tail of permutations(rest, length - 1)) out.push([head, ...tail]);
  }
  return out;
}

const names = Object.keys(dh);
const hits = [];
for (const exponent of orbit) {
  for (const chain of permutations(names, 4)) {
    const values = chain.map((name) => dh[name]);
    if (
      modPow(values[0], exponent, MOD) === values[1] &&
      modPow(values[1], exponent, MOD) === values[2] &&
      modPow(values[2], exponent, MOD) === values[3]
    ) {
      hits.push({exponent, chain, values});
    }
  }
}

assert.deepEqual(hits, [
  {exponent:3, chain:["K","A","B","b"], values:[2,8,19,15]},
  {exponent:19, chain:["b","B","A","K"], values:[15,19,8,2]},
]);

assert.equal((3 * 19) % 28, 1);
assert.deepEqual(
  [modPow(3, 1, 28), modPow(3, 3, 28)],
  [3, 27]
);
assert.deepEqual(
  [modPow(19, 1, 28), modPow(19, 3, 28)],
  [19, 27]
);
assert.deepEqual(
  [modPow(3, 0, 28), modPow(3, 2, 28)],
  [1, 9]
);
assert.deepEqual(
  [modPow(19, 0, 28), modPow(19, 2, 28)],
  [1, 25]
);

console.log(JSON.stringify({
  status:"PASS",
  orderedFourStateBridgeHits:hits,
  interpretation:"Without an independently selected bridge direction, the fixed DH values and cube orbit support both cube exponent 3 and inverse-cube exponent 19.",
  actionCountPairs:{cube:[3,27], inverseCube:[19,27]},
  zeroIndexPairs:{cube:[1,9], inverseCube:[1,25]},
}, null, 2));
