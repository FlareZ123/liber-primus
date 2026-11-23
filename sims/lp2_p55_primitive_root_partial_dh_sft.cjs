'use strict';
/**
 * Exact original LP2 p55 primitive-root partial discrete logarithm.
 * Node.js 22 SFT: node sims/lp2_p55_primitive_root_partial_dh_sft.cjs
 *
 * The proposed public value 8 and DH interpretation are hypotheses.
 * Mathematically exact projections supply no decrypted unknown-page runes.
 */
const assert = require('node:assert/strict');

/** Verbatim original GP0 source, physical p55=72.jpg; initial NG belongs to p54. */
const source = [
  21,25,19,10,7,15,17,14,19,15,12,6,23,2,25,0,27,24,17,5,1,7,4,17,28,0,
  14,10,19,1,5,13,8,21,20,12,19,15,23,27,13,0,17,8,12,5,12,18,28,
  18,10,6,14,6,15,18,15,12,2,2,18,15,2,22,5,28,10,19,5,14,23,11,1,17,18,10
];
const lengths = [4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(source.length, 76);
assert.equal(source[0], 21);
assert.equal(lengths.reduce((a, b) => a + b, 0), 75);
let offset = 1;
const words = lengths.map(n => {
  const word = source.slice(offset, offset + n);
  offset += n;
  return word;
});
assert.equal(offset, source.length);
const interior = words.flatMap(w => w.slice(1, -1));
const exterior = words.flatMap(w => [w[0], w[w.length - 1]]);
assert.deepEqual([interior.length, exterior.length], [43, 32]);
/** @param {number[]} digits @returns {bigint} */
const gp29 = digits => digits.reduce((n, d) => n * 29n + BigInt(d), 0n);
const N = gp29(interior), E = gp29(exterior);
assert.equal(N, 510043531279477768552291351270111060625364732293226050492113768n);
assert.equal(E, 54546906948733185277568038540584540814742666891n);
assert.equal(N % 8n, 0n);
assert.equal(E % 43n, 0n);
const P = N / 8n, Q = E / 43n;
assert.equal(P, 63755441409934721069036418908763882578170591536653256311514221n);
assert.equal(Q, 1268532719737981052966698570711268391040527137n);
const R = 101149063843788281988908603592862658065019147521n;
const factors = [4n, 5n, 41n, 49477n, 15535963n];
const M = factors.reduce((product, v) => product * v, 1n);
assert.equal(M, 630311729907820n);
assert.equal(P - 1n, M * R);

/** @param {bigint} n @param {bigint} m @returns {bigint} */
const mod = (n, m) => (n % m + m) % m;
/** @param {bigint} b @param {bigint} e @param {bigint} p @returns {bigint} */
function power(b, e, p) {
  let result = 1n;
  for (b = mod(b, p); e > 0n; e >>= 1n, b = b * b % p) {
    if (e & 1n) result = result * b % p;
  }
  return result;
}
/** @param {bigint} x @param {bigint} m @returns {bigint} */
function inverse(x, m) {
  let r = m, nextR = mod(x, m), t = 0n, nextT = 1n;
  while (nextR !== 0n) {
    const q = r / nextR;
    [r, nextR] = [nextR, r - q * nextR];
    [t, nextT] = [nextT, t - q * nextT];
  }
  assert.equal(r, 1n);
  return mod(t, m);
}
/**
 * Baby-step/giant-step search for 0 <= x < bound, given g^x=h mod p.
 * @param {bigint} g @param {bigint} h @param {bigint} bound @param {bigint} p
 * @returns {bigint|null}
 */
function dlog(g, h, bound, p) {
  const size = BigInt(Math.ceil(Math.sqrt(Number(bound))));
  const baby = new Map();
  let value = 1n;
  for (let j = 0n; j < size; j++) {
    if (!baby.has(value)) baby.set(value, j);
    value = value * g % p;
  }
  const jump = power(inverse(g, p), size, p);
  let giant = h;
  for (let i = 0n; i <= size; i++) {
    const j = baby.get(giant);
    if (j !== undefined) {
      const answer = i * size + j;
      if (answer < bound && power(g, answer, p) === h) return answer;
    }
    giant = giant * jump % p;
  }
  return null;
}

// A separately committed full Lucas-Pratt certificate establishes P prime.
// These generator checks require only exact original integers and P-1 factors.
assert.equal(power(Q, P - 1n, P), 1n);
for (const f of [2n, 5n, 41n, 49477n, 15535963n, R]) {
  assert.notEqual(power(Q, (P - 1n) / f, P), 1n);
}
// Candidate public A=8 is the interior's exact integer factor, not a solved key.
const residues = factors.map(order => {
  const subgroupExponent = (P - 1n) / order;
  const g = power(Q, subgroupExponent, P);
  const h = power(8n, subgroupExponent, P);
  const x = dlog(g, h, order, P);
  assert.notEqual(x, null);
  assert.equal(power(g, x, P), h);
  return {order, x};
});
assert.deepEqual(residues.map(v => v.x), [3n, 1n, 35n, 35483n, 13984653n]);

// Pairwise-coprime CRT yields a uniquely fixed 49-bit exponent residue.
let x = 0n, modulus = 1n;
for (const {order, x: residue} of residues) {
  const step = mod((residue - x) * inverse(modulus, order), order);
  x += modulus * step;
  modulus *= order;
}
assert.equal(modulus, M);
assert.equal(x, 97883509924151n);
assert.equal(power(Q, x * (P - 1n) / M, P), power(8n, (P - 1n) / M, P));
assert.notEqual(power(Q, x, P), 8n);

// Full BSGS up to 2^32; a genuine source-built positive exponents test.
assert.equal(dlog(Q, power(Q, 12345678n, P), 1n << 32n, P), 12345678n);
assert.equal(dlog(Q, 8n, 1n << 32n, P), null);
console.log(JSON.stringify({
  input:'LP2 original physical p55, one incoming carry + 16 complete printed words',
  sourcePrime:P.toString(), sourceGenerator:Q.toString(), candidatePublic:8,
  sourceQPrimitiveRoot:true, sourceOriginalInnerCount:43, sourceOriginalShellCount:32,
  orderFactorization:'4*5*41*49477*15535963*101149063843788281988908603592862658065019147521',
  smoothSubgroupM:M.toString(),
  exactResidues:residues.map(r => ({mod:r.order.toString(),log:r.x.toString()})),
  exactPartialLog:x.toString(), remainingPrimeOrderBits:R.toString(2).length,
  shortExponentBelow2Power32:false, originalPlaintextRecovered:false,
  decision:'Exact conditional partial log; missing 157-bit prime-order component and source-selected receiver'
}, null, 2));
