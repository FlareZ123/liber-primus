#!/usr/bin/env node
'use strict';

// Source-constrained test: p15's 16-cell Fibonacci-prime spiral as the initial
// state for the complementary degree-16 factor of the p50 GF(29) polynomial,
// generating a 238-symbol additive key for the unique 238-rune p36 page.
//
// Inputs:
// - resources/liber-primus/base60-grid.json (256 base-60 bytes; SHA-256 asserted)
// - resources/liber-primus/lp2-corpus.json (physical page 36, 238 GP29 indices)
// - results/lp2-p15-fibonacci-prime-spiral.md (16 displayed values, spiral order)
// The established factorization is documented in
// im-results/grid-bigint-factor-page53.md. This script tests one new composition.

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const MOD = 29;
const mod = n => ((n % MOD) + MOD) % MOD;

const p50Bytes = [203,231,167,186,97,237,126,183,92,249,156,222,247,4,183,212,121,202,15,33,102,137,59,87,109,198,173,25,150,66,141,133,115,114,197,39,54,80,133,5,80,84,28,73,230,107,199,76,253,16,47,59,86,171,156,80,254,118,146,69,106,196,124,51,122,255,25,192,199,73,169,108,164,79,205,177,114,144,46,82,142,58,201,193,173,28,111,65,211,220,198,49,236,84,56,35,222,150,72,34,83,229,32,206,122,63,31,218,14,184,32,115,73,143,197,247,54,171,35,184,42,237,86,54,13,20,163,193,201,179,86,120,169,141,72,171,10,129,233,13,245,46,160,152,125,210,92,173,246,174,153,189,231,33,14,112,52,251,249,248,233,217,192,82,105,18,250,248,240,228,254,54,148,117,209,18,235,131,166,175,144,40,167,81,128,156,19,81,38,192,170,33,0,155,159,89,176,115,105,47,110,74,209,68,194,76,127,21,57,175,6,61,70,150,251,84,142,219,148,59,58,52,51,151,68,52,73,249,144,0,117,175,106,234,196,121,238,32,129,173,144,141,42,214,22,56,198,192,113,158,172,230,180,36,189,80];
const p36 = [26,9,1,7,21,8,6,26,4,3,10,20,9,14,9,3,13,0,28,25,25,3,14,9,15,22,25,20,9,25,2,1,28,26,25,13,10,12,1,4,11,13,22,11,24,21,13,2,13,24,21,26,19,22,14,17,1,16,12,19,13,25,26,14,25,26,4,25,26,0,0,19,27,14,18,4,1,16,6,1,26,4,27,1,3,12,10,11,0,13,11,23,10,2,3,8,27,6,8,20,2,12,22,24,25,28,19,14,8,5,14,24,16,2,25,14,3,15,5,23,16,26,7,9,22,16,14,7,10,22,11,0,10,3,10,4,15,14,9,19,24,27,4,13,15,23,10,22,8,18,16,1,7,28,22,23,22,11,10,21,27,11,4,23,19,17,3,5,3,2,22,4,1,20,1,2,15,1,23,20,6,10,26,21,3,22,10,18,26,18,0,12,21,17,20,10,1,26,0,22,9,22,17,22,6,11,24,9,19,25,26,2,0,10,17,21,13,9,10,4,6,11,12,25,8,24,4,14,14,3,20,9,25,23,26,17,9,24];
const p15Spiral = [3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516];

assert.equal(p50Bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(p50Bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.equal(p36.length, 238);
assert.equal(p15Spiral.length, 16);

// Build the monic degree-16 complementary factor S16 from the established
// small factors of the source-derived p50 polynomial:
// (X+5)^2 * (X^2+18X+11) * (X^3+14X^2+16X+24) *
// (X^9+12X^8+20X^7+10X^6+5X^5+X^4+9X^3+15X+11).
function mulPolyAsc(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) out[i + j] = mod(out[i + j] + a[i] * b[j]);
  }
  return out;
}
const factors = [
  [25, 10, 1],                 // (X+5)^2
  [11, 18, 1],                 // X^2+18X+11
  [24, 16, 14, 1],             // X^3+14X^2+16X+24
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1], // degree 9
];
const s16 = factors.reduce((p, f) => mulPolyAsc(p, f), [1]);
assert.equal(s16.length, 17);
assert.equal(s16[16], 1);

// Verify S16 divides the original p50 polynomial over GF(29), leaving a
// degree-238 quotient and zero remainder.
const pDesc = p50Bytes.map(x => x % MOD);
while (pDesc.length && pDesc[0] === 0) pDesc.shift();
assert.equal(pDesc.length, 255); // degree 254 after the leading zero
const quotientLength = pDesc.length - s16.length + 1;
const quotient = Array(quotientLength).fill(0);
const a = [...pDesc];
for (let i = 0; i < quotientLength; i++) {
  const q = a[i]; // leading coefficient of S16 is 1
  quotient[i] = q;
  if (q !== 0) {
    for (let j = 0; j < s16.length; j++) {
      const idx = i + s16.length - 1 - j;
      a[idx] = mod(a[idx] - q * s16[j]);
    }
  }
}
const remainder = a.slice(quotientLength).filter(x => x !== 0);
assert.equal(remainder.length, 0);
assert.equal(quotient.length - 1, 238);

// The 16 *printed* p15 values in the red-3299-anchored clockwise spiral,
// reduced modulo the historically authenticated BASE29 alphabet size.
// No seed, phase, offset, or state is fitted.
const seed = p15Spiral.map(mod);
assert.deepEqual(seed, [22,21,19,17,11,1,10,3,20,22,25,7,22,12,17,21]);

function generateKey(initial, n) {
  const key = [...initial];
  for (let t = 0; key.length < n; t++) {
    let next = 0;
    for (let j = 0; j < 16; j++) next -= s16[j] * key[t + j];
    key.push(mod(next));
  }
  return key.slice(0, n);
}
function ioc(xs) {
  const counts = Array(MOD).fill(0);
  for (const x of xs) counts[x]++;
  const n = xs.length;
  return counts.reduce((s, c) => s + c * (c - 1), 0) / (n * (n - 1));
}
const translit = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];

const results = [];
for (const [seedOrder, initial] of [
  ['printed-clockwise', seed],
  ['reverse-control', [...seed].reverse()],
]) {
  const key = generateKey(initial, p36.length);
  for (const sign of [-1, 1]) {
    const plain = p36.map((c, i) => mod(c + sign * key[i]));
    results.push({
      seedOrder,
      sign,
      keyIoc: ioc(key),
      plaintextIoc: ioc(plain),
      prefix: plain.slice(0, 40).map(x => translit[x]).join(' '),
    });
  }
}

// Reversibility / wrong-seed controls for the implementation.
const plant = Array.from({length: p36.length}, (_, i) => (7 * i + 11) % MOD);
const plantedKey = generateKey(seed, plant.length);
const plantedCipher = plant.map((p, i) => mod(p - plantedKey[i]));
const recovered = plantedCipher.map((c, i) => mod(c + plantedKey[i]));
assert.deepEqual(recovered, plant);
const wrongSeed = [...seed];
wrongSeed[0] = mod(wrongSeed[0] + 1);
const wrongKey = generateKey(wrongSeed, plant.length);
assert.ok(wrongKey.some((x, i) => x !== plantedKey[i]));

console.log(JSON.stringify({
  p50Sha256: crypto.createHash('sha256').update(Buffer.from(p50Bytes)).digest('hex'),
  p50PolynomialDegree: pDesc.length - 1,
  complementaryFactorDegree: s16.length - 1,
  quotientDegree: quotient.length - 1,
  factorS16Ascending: s16,
  p15Seed: seed,
  p36Length: p36.length,
  rawP36Ioc: ioc(p36),
  results,
  positivePlantRoundtrip: recovered.length,
  wrongSeedDiffers: true,
}, null, 2));
