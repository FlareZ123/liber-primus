'use strict';

/**
 * Original-source p50 interior180 / solved p56+p57 low-order LFSR gate.
 * Usage from repo root: node sims/lp2_p50_terminal180_linear_complexity_sft.cjs
 * Read-only and deterministic; uses only canonical, committed source inputs.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sourceDir = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const grid = JSON.parse(fs.readFileSync(path.join(sourceDir, 'lp2-grid-256.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(sourceDir, 'lp2-corpus.json'), 'utf8'));

/** @param {number} p Physical LP2 page. @returns {number[]} Original GP29 indices. */
function page(p) {
  const record = corpus.pages.find((entry) => entry.page === p);
  assert.ok(record, 'Missing physical LP2 page ' + p);
  return record.indices;
}

/** @param {number} count Number of consecutive primes. @returns {number[]} */
function firstPrimes(count) {
  const primes = [];
  for (let candidate = 2; primes.length < count; candidate++) {
    if (primes.every((prime) => candidate % prime !== 0)) primes.push(candidate);
  }
  return primes;
}

/**
 * Original published p56 rule: prime minus one, with transparent ciphertext-F
 * at source rune offset56 consuming zero prime steps; original digest/marks
 * consume no prime steps. A separate known plaintext prefix guards this parser.
 * @param {number[]} ciphertext
 * @returns {number[]}
 */
function solved56(ciphertext) {
  const primes = firstPrimes(ciphertext.length);
  let keyIndex = 0;
  return ciphertext.map((symbol, i) => i === 56
    ? symbol
    : (symbol - (primes[keyIndex++] - 1) % 29 + 29) % 29);
}

const GRID = grid.bytes;
assert.equal(GRID.length, 256);
const inner = [];
for (let row = 1; row < 31; row++) {
  for (let col = 1; col < 7; col++) inner.push(GRID[row * 8 + col]);
}
assert.equal(inner.length, 180);
const c55 = page(55);
const c56 = page(56);
const c57 = page(57);
assert.deepEqual([c55.length, c56.length, c57.length], [76, 85, 95]);
const p56 = solved56(c56);
assert.deepEqual(p56.slice(0, 10), [24, 9, 18, 9, 23, 7, 10, 2, 10, 9]); // AN END WITHIN
assert.equal(p56[56], 0); // Authentic literal ciphertext-F bypass.
assert.deepEqual(firstPrimes(29), corpus.prime);

// GF(256) with polynomial x^8+x^4+x^3+x^2+1 (0x11d), primitive element 2.
const EXP = new Array(512);
const LOG = new Array(256).fill(-1);
let element = 1;
for (let i = 0; i < 255; i++) {
  EXP[i] = element;
  LOG[element] = i;
  element <<= 1;
  if (element & 256) element ^= 0x11d;
}
for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
assert.equal(new Set(EXP.slice(0, 255)).size, 255);

/** @param {number} a @param {number} b @returns {number} */
function multiply(a, b) { return a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]]; }
/** @param {number} a @param {number} b @returns {number} */
function divide(a, b) {
  assert.notEqual(b, 0);
  return a === 0 ? 0 : EXP[(LOG[a] - LOG[b] + 255) % 255];
}

/**
 * Berlekamp–Massey over GF256. Recurrence s[n]=sum(C[j]*s[n-j]), j=1..L.
 * @param {number[]} symbols
 * @returns {{ degree:number, coefficients:number[] }}
 */
function berlekampMassey256(symbols) {
  let C = [1], B = [1], L = 0, m = 1, b = 1;
  for (let n = 0; n < symbols.length; n++) {
    let discrepancy = symbols[n];
    for (let j = 1; j <= L; j++) discrepancy ^= multiply(C[j] || 0, symbols[n - j]);
    if (!discrepancy) { m++; continue; }
    const oldC = C.slice();
    const factor = divide(discrepancy, b);
    for (let j = 0; j < B.length; j++) {
      const index = j + m;
      while (C.length <= index) C.push(0);
      C[index] ^= multiply(factor, B[j]);
    }
    if (2 * L <= n) { L = n + 1 - L; B = oldC; b = discrepancy; m = 1; }
    else m++;
  }
  const coefficients = C.slice(0, L + 1);
  assert.ok(symbols.slice(L).every((symbol, offset) => {
    const position = offset + L;
    let residual = symbol;
    for (let j = 1; j <= L; j++) residual ^= multiply(coefficients[j], symbols[position - j]);
    return residual === 0;
  }));
  return { degree: L, coefficients };
}

/** @param {number[]} bits @returns {number} */
function binaryLinearComplexity(bits) {
  let C = [1], B = [1], L = 0, m = 1;
  for (let n = 0; n < bits.length; n++) {
    let discrepancy = bits[n];
    for (let j = 1; j <= L; j++) discrepancy ^= (C[j] || 0) & bits[n - j];
    if (!discrepancy) { m++; continue; }
    const oldC = C.slice();
    for (let j = 0; j < B.length; j++) {
      const index = j + m;
      while (C.length <= index) C.push(0);
      C[index] ^= B[j];
    }
    if (2 * L <= n) { L = n + 1 - L; B = oldC; m = 1; }
    else m++;
  }
  assert.ok(bits.slice(L).every((bit, offset) => {
    const position = offset + L;
    let residual = bit;
    for (let j = 1; j <= L; j++) residual ^= (C[j] || 0) & bits[position - j];
    return residual === 0;
  }));
  return L;
}

/** @param {number[]} values @returns {number[]} */
function msbBits(values) {
  return values.flatMap((value) => Array.from({ length: 8 }, (_, i) => (value >>> (7 - i)) & 1));
}

/**
 * Recover all preceding terms when the highest-lag coefficient is nonzero.
 * @param {number[]} suffix Known tail values.
 * @param {number} prefixLength Number of withheld prefix values.
 * @param {number[]} coefficients Normalized BM coefficient array.
 * @returns {number[]}
 */
function recoverPrefix(suffix, prefixLength, coefficients) {
  const degree = coefficients.length - 1;
  assert.ok(degree > 0 && coefficients[degree] !== 0);
  assert.ok(suffix.length >= degree);
  const all = new Array(prefixLength).fill(0).concat(suffix);
  for (let n = prefixLength + degree - 1; n >= degree; n--) {
    let residual = all[n];
    for (let j = 1; j < degree; j++) residual ^= multiply(coefficients[j], all[n - j]);
    all[n - degree] = divide(residual, coefficients[degree]);
  }
  return all.slice(0, prefixLength);
}

// Positive: a real reversible degree-eight LFSR, with original source-sized
// 76 withheld GP runes and 180 solved-end runes aligned in the same 256 cells.
const plantedCoefficients = [1, 1, 0, 2, 0, 0, 0, 0, 7];
const plantedKey = [1, 2, 3, 5, 8, 13, 21, 34];
for (let n = 8; n < 256; n++) {
  let value = 0;
  for (let j = 1; j <= 8; j++) value ^= multiply(plantedCoefficients[j], plantedKey[n - j]);
  plantedKey.push(value);
}
const plantedP55 = c57.slice(0, 76); // independent authentic native-GP cleartext control.
const knownTerminal = p56.concat(c57);
const plantedOuter = plantedKey.slice(0, 76).map((key, i) => key ^ plantedP55[i]);
const plantedInner = plantedKey.slice(76).map((key, i) => key ^ knownTerminal[i]);
const recoveredSuffix = plantedInner.map((value, i) => value ^ knownTerminal[i]);
const fit = berlekampMassey256(recoveredSuffix);
assert.equal(fit.degree, 8);
assert.deepEqual(fit.coefficients, plantedCoefficients);
const recoveredPrefix = recoverPrefix(recoveredSuffix, 76, fit.coefficients);
assert.deepEqual(recoveredPrefix, plantedKey.slice(0, 76));
assert.deepEqual(plantedOuter.map((v, i) => v ^ recoveredPrefix[i]), plantedP55);
console.log('POSITIVE: degree-8 GF256 recurrence recovered; all 76 withheld source-native GP29 plaintext runes recovered exactly.');

// Original p50 interior table only: fixed row-major 30x6, p56 cipher/plaintext
// and p57 literal GP indices/primes, XOR/subtraction, no fitted phase or offset.
const byteResults = [];
for (const [register, p56Register] of [['cipher', c56], ['plain', p56]]) {
  const terminal = p56Register.concat(c57);
  for (const type of ['index-xor', 'index-sub', 'prime-xor', 'prime-sub']) {
    const values = terminal.map((rune) => type.startsWith('prime') ? corpus.prime[rune] : rune);
    const derived = inner.map((byte, i) => type.endsWith('xor')
      ? byte ^ values[i]
      : (byte - values[i] + 256) % 256);
    const byteL = berlekampMassey256(derived).degree;
    const binaryL = binaryLinearComplexity(msbBits(derived));
    byteResults.push({ register, type, byteL, binaryL });
    console.log('ORIGINAL ' + register.padEnd(6) + ' ' + type.padEnd(9) +
      ' GF256_L=' + byteL + ' GF2_L=' + binaryL);
  }
}
assert.deepEqual(byteResults.map((r) => r.byteL), Array(8).fill(90));
assert.deepEqual(byteResults.map((r) => r.binaryL), [721, 722, 722, 720, 721, 721, 719, 722]);
console.log('PASS: all eight fixed original streams require >=90 GF256 stages and >=719 binary stages. No unknown-page plaintext recovered.');
