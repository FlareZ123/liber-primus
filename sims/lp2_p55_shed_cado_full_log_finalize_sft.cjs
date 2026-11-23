'use strict';

/**
 * Original p55 conditional full finite-field discrete-log finalizer.
 *
 * The CADO-NFS finite-field DLP gives `log_Q` and `log_E` in the *same*
 * unknown base modulo the large prime R. Ratio log_E/log_Q determines the
 * exponent x modulo R; combine with the independently proven smooth-order
 * residue x mod M. A strict original-field exponentiation then proves or
 * rejects the numeric result.
 *
 * Usage:
 *   node sims/lp2_p55_shed_cado_full_log_finalize_sft.cjs <log_Q> <log_E>
 *   node sims/lp2_p55_shed_cado_full_log_finalize_sft.cjs --log43 <log_Q> <log_43>
 *
 * Without arguments, run a planted virtual-log arithmetic positive control.
 * This is NOT a decryption unless an independently authored plaintext/key
 * consumer is found. Node 22 CommonJS, read-only; no external dependencies.
 */
const assert = require('node:assert/strict');

const P = 63755441409934721069036418908763882578170591536653256311514221n;
const Q = 1268532719737981052966698570711268391040527137n;
const E = 54546906948733185277568038540584540814742666891n;
const M = 630311729907820n;
const R = 101149063843788281988908603592862658065019147521n;
const xSmall = 483581994079670n;
assert.equal(P - 1n, M * R);
assert.equal(E, 43n * Q);

/** @param {bigint} n @param {bigint} p */
function mod(n, p) { return ((n % p) + p) % p; }

/** @param {bigint} b @param {bigint} e @param {bigint} p */
function powMod(b, e, p) {
  let out = 1n;
  for (b = mod(b, p); e > 0n; e >>= 1n, b = b * b % p) {
    if (e & 1n) out = out * b % p;
  }
  return out;
}

/** @param {bigint} n @param {bigint} p */
function inverse(n, p) {
  let [r, nr, t, nt] = [p, mod(n, p), 0n, 1n];
  while (nr > 0n) {
    const q = r / nr;
    [r, nr] = [nr, r - q * nr];
    [t, nt] = [nt, t - q * nt];
  }
  assert.equal(r, 1n, 'CADO virtual log of a primitive root must be invertible');
  return mod(t, p);
}

/** @param {bigint} residueR */
function reconstruct(residueR) {
  const correction = mod((residueR - xSmall) * inverse(M, R), R);
  return xSmall + M * correction;
}

/** @param {bigint} n */
function gpDigits(n) {
  const arr = [];
  do {
    arr.push(Number(n % 29n));
    n /= 29n;
  } while (n);
  return arr.reverse();
}
const GP0 = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
assert.equal(GP0.length, 29);
assert.equal(powMod(Q, xSmall * R, P), powMod(E, R, P));

if (process.argv.length === 2) {
  // Positive control for the CADO virtual-base ratio and smooth+large CRT.
  const plantedX = 987654321987654321987654321n;
  const plantedVirtualBaseLogQ = 92345678987654321n;
  const plantedVirtualBaseLogE = mod(plantedX * plantedVirtualBaseLogQ, R);
  const recoveredLarge = mod(plantedVirtualBaseLogE
    * inverse(plantedVirtualBaseLogQ, R), R);
  assert.equal(recoveredLarge, plantedX % R);
  const plantedLog43 = mod((plantedX - 1n) * plantedVirtualBaseLogQ, R);
  assert.equal(mod(1n + plantedLog43 * inverse(plantedVirtualBaseLogQ, R), R), plantedX % R);
  const full = reconstruct(recoveredLarge);
  assert.equal(full % M, xSmall);
  assert.equal(full % R, recoveredLarge);
  assert.ok(full >= 0n && full < P - 1n);
  console.log('PASS: planted virtual-base log division, CRT and source smooth residue');
  console.log('No actual large-subgroup logarithms have been supplied.');
} else {
  const useSmallFactor = process.argv[2] === '--log43';
  assert.equal(process.argv.length, useSmallFactor ? 5 : 4,
    'Pass <logQ> <logE>, or --log43 <logQ> <log43> for E=43Q');
  for (const argument of process.argv.slice(useSmallFactor ? 3 : 2)) {
    assert.match(argument, /^-?[0-9]+$/, 'Decimal virtual log required');
  }
  const virtualQ = mod(BigInt(process.argv[useSmallFactor ? 3 : 2]), R);
  const virtualSecond = mod(BigInt(process.argv[useSmallFactor ? 4 : 3]), R);
  assert.notEqual(virtualQ, 0n);
  // E = 43*Q in the original integer source, and E < P.
  // Thus log_CADO(E) = log_CADO(43) + log_CADO(Q) modulo R.
  const virtualE = useSmallFactor ? mod(virtualSecond + virtualQ, R) : virtualSecond;
  const xLarge = mod(virtualE * inverse(virtualQ, R), R);
  const x = reconstruct(xLarge);
  assert.ok(x >= 0n && x < P - 1n);
  assert.equal(x % M, xSmall);
  assert.equal(x % R, xLarge);
  assert.equal(powMod(Q, x, P), E, 'Original source public E full equation FAILED');
  const digits = gpDigits(x);
  const roman = digits.map(v => GP0[v]).join('');
  const n = digits.length;
  const freq = Array(29).fill(0);
  for (const d of digits) freq[d]++;
  const ioc = freq.reduce((v, count) => v + count * (count - 1), 0)
    / (n * (n - 1));
  console.log(JSON.stringify({
    originalFieldFullLog: x.toString(),
    smoothSubgroupResidue: xSmall.toString(),
    largeSubgroupResidue: xLarge.toString(),
    fullModularExponentiationPASS: true,
    gp29DigitCount: n,
    sourceP55InteriorSymbolCount: 43,
    gp29DigitValues: digits,
    gp29Transliteration: roman,
    symbolIoC: ioc,
    plaintextRecovered: false,
    remark: 'A finite-field exponent is not an authenticated LP2 plaintext or key.'
  }, null, 2));
}
