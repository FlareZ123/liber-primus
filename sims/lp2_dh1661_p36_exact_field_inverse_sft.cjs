'use strict';

/**
 * Original-source GF(29^238) DH1661 exact exponent inverse (Director #571).
 * Reads only authentic LP2 corpus and base60 grid, with no external packages.
 * Node.js 22, run from repository root.
 */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const corpus = JSON.parse(readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const grid = JSON.parse(readFileSync('resources/liber-primus/base60-grid.json', 'utf8'));
const MOD = 29;
const DEGREE = 238;
const mod = (n) => ((n % MOD) + MOD) % MOD;

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function polyMultiply(a, b) {
  const out = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) out[i + j] = mod(out[i + j] + a[i] * b[j]);
  }
  return out;
}

const printedTokens = grid.rows.flat();
const originalBytes = grid.byte_rows.flat();
assert.equal(printedTokens.length, 256);
assert.equal(originalBytes.length, 256);
assert.equal(grid.alphabet, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
for (let i = 0; i < 256; i++) {
  const token = printedTokens[i];
  assert.equal(token.length, 2);
  const value = grid.alphabet.indexOf(token[0]) * 60 + grid.alphabet.indexOf(token[1]);
  assert.equal(value, originalBytes[i], 'printed numeric grid token at ' + i);
}

const sourcePoly = originalBytes.slice().reverse().map((b) => b % MOD);
const factors = [
  [5, 1], [5, 1], [11, 18, 1], [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1],
];
let divisor = [1];
for (const factor of factors) divisor = polyMultiply(divisor, factor);
assert.equal(divisor.length, 17);
const remain = sourcePoly.slice();
const quotient = new Array(DEGREE + 1).fill(0);
for (let i = sourcePoly.length - 1; i >= 16; i--) {
  const factor = remain[i];
  if (i > 254) { assert.equal(factor, 0); continue; }
  quotient[i - 16] = factor;
  for (let j = 0; j < divisor.length; j++) {
    remain[i - 16 + j] = mod(remain[i - 16 + j] - factor * divisor[j]);
  }
}
assert.deepEqual(remain.slice(0, 16), new Array(16).fill(0));
assert.equal(quotient[238], 28);
const fieldModulus = quotient.map((v) => mod(v * 28));
assert.equal(fieldModulus[0], 5);
assert.equal(fieldModulus[238], 1);
assert.equal(fieldModulus.length, 239);

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function fieldMultiply(a, b) {
  const tmp = new Int32Array(2 * DEGREE - 1);
  for (let i = 0; i < DEGREE; i++) {
    const ai = a[i];
    for (let j = 0; j < DEGREE; j++) tmp[i + j] += ai * b[j];
  }
  for (let k = 2 * DEGREE - 2; k >= DEGREE; k--) {
    const factor = mod(tmp[k]);
    if (!factor) continue;
    for (let j = 0; j < DEGREE; j++) {
      tmp[k - DEGREE + j] = mod(tmp[k - DEGREE + j] - factor * fieldModulus[j]);
    }
  }
  const out = new Array(DEGREE);
  for (let j = 0; j < DEGREE; j++) out[j] = mod(tmp[j]);
  return out;
}

const one = [1, ...new Array(DEGREE - 1).fill(0)];
/** @param {number[]} a @param {bigint} n @returns {number[]} */
function fieldPower(a, n) {
  let result = one;
  let base = a;
  while (n > 0n) {
    if (n & 1n) result = fieldMultiply(result, base);
    n >>= 1n;
    if (n) base = fieldMultiply(base, base);
  }
  return result;
}

/** @param {bigint} n @param {bigint} m */
function inverseMod(n, m) {
  let a = n, b = m, x = 1n, y = 0n;
  while (b) {
    const q = a / b;
    [a, b] = [b, a % b];
    [x, y] = [y, x - q * y];
  }
  assert.equal(a, 1n);
  return (x % m + m) % m;
}

/** @param {number[]} a */
function stats(a) {
  const counts = new Array(29).fill(0);
  for (const value of a) { assert(value >= 0 && value < 29); counts[value]++; }
  const top12 = counts.slice().sort((x, y) => y - x).slice(0, 12).reduce((s, x) => s + x, 0) / a.length;
  const ioc = counts.reduce((s, x) => s + x * (x - 1), 0) / (a.length * (a.length - 1));
  return { ioc: Number(ioc.toFixed(12)), top12: Number(top12.toFixed(12)) };
}

const p36 = corpus.pages.find((p) => p.page === 36);
assert.equal(p36.runic_count, DEGREE);
assert.equal(p36.indices.length, DEGREE);
const state = p36.indices;
const p57 = corpus.pages.find((p) => p.page === 57);
assert.equal(p57.runic_count, 95);
const plant = Array.from({ length: DEGREE }, (_, i) => p57.indices[i % p57.indices.length]);
const groupOrder = 29n ** 238n - 1n;
console.log('Source p36', JSON.stringify(stats(state)), 'Q238 constant', fieldModulus[0]);


// The archived DH3301 participant congruence e≡11 (mod 550) permits e=1661;
// the inferred Wisdom prime-cell selector 151 independently singles it out.
// Both historical attribution and the inferred selector remain conditional.
const exponent = 1661n;
const inverseExponent = inverseMod(exponent, groupOrder);
const original = state.slice();
const deciphered = fieldPower(original, inverseExponent);
const forward = fieldPower(original, exponent);
assert.deepEqual(fieldPower(deciphered, exponent), original);
assert.deepEqual(fieldPower(forward, inverseExponent), original);
const encryptedPlant = fieldPower(plant, exponent);
assert.deepEqual(fieldPower(encryptedPlant, inverseExponent), plant);
const wrongExponent = 3301n;
const wrongDeciphered = fieldPower(original, inverseMod(wrongExponent, groupOrder));
const result = {
  source: "LP2 physical p36 238 original rune indices; original printed p49–51 GF29 factor R238",
  historicalDhClass: "e ≡ 11 mod 550 (unsigned participant witness)",
  proposedExactExponent: Number(exponent),
  selectedFrom: "inferred 2013 DH e=1661 -> Wisdom prime cell151 -> 36th prime -> p36",
  groupOrderDecimalDigits: groupOrder.toString().length,
  inverseExponent: inverseExponent.toString(),
  original: stats(original),
  inversePower: stats(deciphered),
  forwardPower: stats(forward),
  priorSourceExponent3301Control: stats(wrongDeciphered),
  positiveNativePlant: stats(plant),
  decodedIndices: deciphered,
  decodedGP: deciphered.map(i => corpus.translit[i]).join('-'),
  forwardIndices: forward,
  forwardGP: forward.map(i => corpus.translit[i]).join('-'),
  exactForwardReconstruction: 238,
  exactReverseReconstruction: 238,
  nativePlantRecovered: 238,
  decision: "Both original outputs are uniform-like and nonlinguistic; reject exactly this frozen e=1661 direct field power as p36 decoder. No unknown plaintext/key."
};
assert.equal(result.inversePower.ioc, 0.035173563096);
assert.equal(result.forwardPower.ioc, 0.033932560366);
assert.equal(result.original.ioc, 0.035989079176);
assert.equal(result.positiveNativePlant.ioc, 0.067546005744);
console.log(JSON.stringify(result, null, 2));
