'use strict';
// Original-source LP2 cipher test: six-rune GP29 blocks under 2013 Parable-derived RSA/FPE.
// Node.js 22, read-only SFT: node sims/lp2_parable3prime_rsa_cyclewalk_sft.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {bigint} a @param {bigint} b @param {bigint} n @returns {bigint} */
function modPow(a, b, n) {
  let v = 1n;
  while (b > 0n) {
    if (b & 1n) v = v * a % n;
    a = a * a % n;
    b >>= 1n;
  }
  return v;
}

/** @param {bigint} e @param {bigint} modulus @returns {bigint} */
function modInverse(e, modulus) {
  let a = e, b = modulus, x = 1n, y = 0n;
  while (b !== 0n) {
    const q = a / b;
    [a, b] = [b, a - q * b];
    [x, y] = [y, x - q * y];
  }
  assert.equal(a, 1n);
  return (x % modulus + modulus) % modulus;
}
const primeSums = [1259n, 1031n, 1229n];
const modulus = primeSums.reduce((p, q) => p * q, 1n);
const totient = primeSums.reduce((p, q) => p * (q - 1n), 1n);
const blockDomain = 29n ** 6n;
assert.equal(modulus, 1595277641n);
assert.equal(totient, 1591168720n);
assert.ok(blockDomain < modulus);

/**
 * Full length-preserving RSA permutation for complete six-rune blocks.
 * Repeated modular exponentiation until the representative re-enters [0,29^6).
 * @param {number[]} source
 * @param {bigint} exponent
 * @param {boolean} reverseDigits
 * @returns {{output: number[], cycles: number}}
 */
function transform(source, exponent, reverseDigits) {
  assert.ok(source.every(x => Number.isInteger(x) && x >= 0 && x < 29));
  const output = [];
  let cycles = 0;
  for (let i = 0; i + 6 <= source.length; i += 6) {
    const six = source.slice(i, i + 6);
    if (reverseDigits) six.reverse();
    let number = 0n;
    for (const digit of six) number = number * 29n + BigInt(digit);
    do {
      number = modPow(number, exponent, modulus);
      cycles++;
    } while (number >= blockDomain);
    const decoded = Array(6).fill(0);
    for (let j = 5; j >= 0; j--) {
      decoded[j] = Number(number % 29n);
      number /= 29n;
    }
    if (reverseDigits) decoded.reverse();
    output.push(...decoded);
  }
  return { output, cycles };
}

/** @param {number[]} source @returns {number} */
function coincidence(source) {
  const counts = Array(29).fill(0);
  for (const rune of source) counts[rune]++;
  return counts.reduce((acc, n) => acc + n * (n - 1), 0)
    / (source.length * (source.length - 1));
}

const data = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const original = data.pages.filter(p => p.page <= 55);
const stream = original.flatMap(p => p.indices);
const solved = data.pages.find(p => p.page === 57).indices;
assert.equal(stream.length, 12956);
assert.equal(solved.length, 95);
assert.ok(Math.abs(coincidence(stream) - 0.03447839786450569) < 1e-14);
assert.ok(Math.abs(coincidence(solved) - 0.06270996640537514) < 1e-14);

const tested = [];
for (const exponentInt of [3301, 761, 167, 23]) {
  const exponent = BigInt(exponentInt);
  const inverse = modInverse(exponent, totient);
  assert.equal(exponent * inverse % totient, 1n);
  for (const reverseDigits of [false, true]) {
    // Native GP positive: encrypt 90 authentic solved runes and recover all 90.
    const plaintext = solved.slice(0, 90);
    const encrypted = transform(plaintext, exponent, reverseDigits).output;
    const decrypted = transform(encrypted, inverse, reverseDigits).output;
    assert.deepEqual(decrypted, plaintext);

    const whole = transform(stream, inverse, reverseDigits);
    const pages = original.map(p => transform(p.indices, inverse, reverseDigits));
    const concatPages = pages.flatMap(p => p.output);
    const wholeIoC = coincidence(whole.output);
    const perPageIoC = coincidence(concatPages);
    assert.equal(whole.output.length, 12954);
    assert.equal(concatPages.length, 12804);
    assert.ok(wholeIoC > 0.0344 && wholeIoC < 0.0346);
    assert.ok(perPageIoC > 0.0344 && perPageIoC < 0.0346);
    tested.push({
      e: exponentInt,
      reversedWithinBlock: reverseDigits,
      globalIoC: wholeIoC,
      pageResetIoC: perPageIoC,
      globalCycleSteps: whole.cycles,
      pageResetCycleSteps: pages.reduce((s, p) => s + p.cycles, 0)
    });
  }
}
assert.equal(tested.length, 8);
console.log(JSON.stringify({
  source: '2013 parable, LP2 original GP29 p0-p55, solved original p57',
  modulus: modulus.toString(),
  totient: totient.toString(),
  blockDomain: blockDomain.toString(),
  originalIoC: coincidence(stream),
  nativeSolvedIoC: coincidence(solved),
  originalModes: tested.length * 2,
  positiveControls: tested.length,
  results: tested,
  conclusion: 'No 150-rune contiguous native-GP plaintext in tested fixed direct RSA cyclewalk readings'
}, null, 2));
