"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const historical = JSON.parse(fs.readFileSync(
  path.join(root, "resources/external/1033-3301-historical-operator-chain.json"),
  "utf8"
));

assert.deepEqual(historical.pair, [1033,3301]);

// Original p15 spiral values, preserving the unique red 3299 source value.
const p15Spiral = [
  3258,3222,3152,3038,
  3278,3299,3298,2838,
  3288,3294,3296,2472,
  4516,1206,708,1820,
];
assert.equal(p15Spiral.filter((value) => value === 3299).length, 1);

const N1 = 1033;
const N2 = 3299;
const N3 = 3301;
const alphabet = 29;
const signedP = 23;

/** @param {number} n @param {number} p @returns {{q:number,r:number}} */
function divide(n, p) {
  return {q:Math.floor(n / p), r:n % p};
}

/** @param {number} value @param {number} modulus @returns {number} */
function mod(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function powMod(base, exponent, modulus) {
  let result = 1;
  let value = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = result * value % modulus;
    value = value * value % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

const d1 = divide(N1, signedP);
const d2 = divide(N2, signedP);
const d3 = divide(N3, signedP);
assert.deepEqual(d1, {q:44,r:21});
assert.deepEqual(d2, {q:143,r:10});
assert.deepEqual(d3, {q:143,r:12});

const packet = [
  [mod(d1.q, alphabet), d1.r],
  [mod(d2.q, alphabet), d2.r],
  [mod(d3.q, alphabet), d3.r],
];
assert.deepEqual(packet, [[15,21],[27,10],[27,12]]);

const K = N3 - N2;
assert.equal(K, 2);

// Redundant exact recoveries.
assert.equal(signedP - d1.r, K);
assert.equal(mod(-d2.q, alphabet), K);
assert.equal(mod(-d3.q, alphabet), K);

const gFromRemainder = d2.r / K;
const gFromQuotient = (d2.q + K) / alphabet;
assert.equal(gFromRemainder, 5);
assert.equal(gFromQuotient, 5);
assert.equal(gFromRemainder, gFromQuotient);

const g = gFromRemainder;
const a = d3.r / K;
const b = mod(d1.q, alphabet);
assert.equal(a, 6);
assert.equal(b, 15);
assert.equal(a, g + 1);

const p = signedP;
const A = powMod(g, a, p);
const B = powMod(g, b, p);
assert.deepEqual([A,B], [8,19]);
assert.equal(powMod(B, a, p), K);
assert.equal(powMod(A, b, p), K);

// Exact reconstruction formulas.
assert.equal(p * (alphabet + b) + (p - K), N1);
assert.equal(p * (alphabet * g - K) + K * g, N2);
assert.equal(p * (alphabet * g - K) + K * a, N3);

// Exhaust every integer modulus 3..1033 under the frozen packet grammar.
// This is a selectivity control, not a discovery-adjusted probability.
const modulusHits = [];
for (let candidateP = 3; candidateP <= N1; candidateP += 1) {
  const c1 = divide(N1, candidateP);
  const c2 = divide(N2, candidateP);
  const c3 = divide(N3, candidateP);

  if (c2.q !== c3.q) continue;
  if (candidateP - c1.r !== K) continue;
  if (mod(c2.q, alphabet) !== mod(-K, alphabet)) continue;
  if (c2.r % K !== 0 || c3.r % K !== 0) continue;
  if ((c2.q + K) % alphabet !== 0) continue;

  const candidateGFromR = c2.r / K;
  const candidateGFromQ = (c2.q + K) / alphabet;
  const candidateA = c3.r / K;
  if (candidateGFromR !== candidateGFromQ) continue;
  if (candidateA !== candidateGFromR + 1) continue;

  modulusHits.push({
    p:candidateP,
    g:candidateGFromR,
    a:candidateA,
    b:mod(c1.q, alphabet),
  });
}
assert.deepEqual(modulusHits, [{p:23,g:5,a:6,b:15}]);

console.log(JSON.stringify({
  status:"PASS",
  sources:{N1,N2,N3,alphabet},
  euclidean:{
    N1:{...d1,qMod29:mod(d1.q,alphabet)},
    N2:{...d2,qMod29:mod(d2.q,alphabet)},
    N3:{...d3,qMod29:mod(d3.q,alphabet)},
    packet,
  },
  recovered:{p,g,a,b,A,B,K},
  redundancy:{
    KFromGap:N3-N2,
    KFromFirstRemainder:p-d1.r,
    KFromMiddleQuotient:mod(-d2.q,alphabet),
    gFromRemainder,
    gFromQuotient,
    sharedFromBa:powMod(B,a,p),
    sharedFromAb:powMod(A,b,p),
  },
  exactReconstruction:{
    N1:p*(alphabet+b)+(p-K),
    N2:p*(alphabet*g-K)+K*g,
    N3:p*(alphabet*g-K)+K*a,
  },
  integerModulusScan:{range:[3,N1],hits:modulusHits},
  decision:"The 1033/3299/3301 mixed-radix packet exactly reconstructs the known DH state and uniquely selects p=23 under the frozen structural grammar. Preserve as a strong state-source candidate; operation syntax remains inferred.",
}, null, 2));
