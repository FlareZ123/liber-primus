'use strict';

/**
 * RSA-4/3 interpretation of source-marked prime/totient red spans.
 * One frozen inverse with a known-plaintext positive, no key search.
 * node sims/lp2_red_totient_rsa29_blockgate_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} relative */
function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', relative), 'utf8'));
}
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const ink = readJson('resources/liber-primus/lp2-ink-annotations.json');

/** @param {number} page @param {number} start @returns {number} */
function redSum(page, start) {
  const annotation = ink.pages.find((entry) => entry.page === page);
  const span = annotation.red_spans.find((entry) => entry.start === start);
  const indices = corpus.pages[page].indices.slice(start, start + span.length);
  assert.equal(indices.length, span.length);
  for (let j = 0; j < indices.length; j++) {
    assert.equal(corpus.runes[indices[j]], [...span.runes][j]);
  }
  return indices.reduce((total, index) => total + corpus.prime[index], 0);
}
const p = redSum(6, 71);
const q = redSum(57, 0);
const e = redSum(27, 0);
assert.deepEqual([p, q, e, redSum(0, 0)], [661, 449, 1109, 662]);
const n = p * q, phi = (p - 1) * (q - 1), d = 134909;
assert.deepEqual([n, phi, d], [296789, 295680, 134909]);
assert.equal((e * d) % phi, 1);

/** @param {number[]} digits @param {boolean} little */
function read29(digits, little = false) {
  const ordered = little ? digits.slice().reverse() : digits;
  return ordered.reduce((value, digit) => value * 29 + digit, 0);
}

/** @param {number} number @param {number} digits */
function write29(number, digits) {
  const out = new Array(digits).fill(0);
  for (let j = digits - 1; j >= 0; j--) {
    out[j] = number % 29;
    number = Math.floor(number / 29);
  }
  assert.equal(number, 0);
  return out;
}

/** @param {number} value @param {number} exponent @param {number} modulus */
function modPow(value, exponent, modulus) {
  let base = BigInt(value), exp = BigInt(exponent), mod = BigInt(modulus), result = 1n;
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % mod;
    base = (base * base) % mod;
    exp >>= 1n;
  }
  return Number(result);
}

const clear = corpus.pages[57].indices.slice(0, 93);
assert.equal(clear.length, 93);
const planted = [];
for (let i = 0; i < clear.length; i += 3) {
  const message = read29(clear.slice(i, i + 3));
  assert(message < n);
  const crypt = modPow(message, e, n);
  planted.push(...write29(crypt, 4));
}
const recovered = [];
for (let i = 0; i < planted.length; i += 4) {
  const crypt = read29(planted.slice(i, i + 4));
  assert(crypt < n);
  const message = modPow(crypt, d, n);
  assert(message < 29 ** 3);
  recovered.push(...write29(message, 3));
}
assert.deepEqual(recovered, clear);

const pages = corpus.pages.filter((page) => page.page <= 55 && page.status === 'unsolved' && page.indices.length > 0);
const joined = pages.flatMap((page) => page.indices);
assert.equal(joined.length, 12956);
assert.equal(joined.length % 4, 0);
const counts = [];
for (const framing of ['continuous', 'per-page']) {
  const chunks = framing === 'continuous' ? [joined] : pages.map((page) => page.indices);
  for (const endian of ['big', 'little']) {
    for (let phase = 0; phase < 4; phase++) {
      let blocks = 0, invalid = 0, firstBad = null;
      for (const chunk of chunks) {
        for (let offset = phase; offset + 4 <= chunk.length; offset += 4) {
          const digits = chunk.slice(offset, offset + 4);
          const value = read29(digits, endian === 'little');
          blocks++;
          if (value >= n) {
            invalid++;
            if (!firstBad) firstBad = { offset, digits, value };
          }
        }
      }
      assert(invalid > 0);
      counts.push({ framing, endian, phase, blocks, invalid, firstBad });
    }
  }
}
assert.deepEqual(counts.find((c) => c.framing === 'continuous' && c.endian === 'big' && c.phase === 0), {
  framing: 'continuous', endian: 'big', phase: 0, blocks: 3239, invalid: 1917,
  firstBad: { offset: 0, digits: [15, 8, 18, 3], value: 373088 }
});
assert.equal(Math.min(...counts.map((result) => result.invalid)), 1836);

// Original manuscript-specific receiver: 729-rune opening chapter, excluding
// the physically red p0 13-rune heading, leaves exactly 179 four-rune blocks.
const blackOpening = pages.slice(0, 3).flatMap((page) => page.indices).slice(13);
assert.equal(blackOpening.length, 716);
let openingInvalid = 0;
for (let i = 0; i < blackOpening.length; i += 4) {
  if (read29(blackOpening.slice(i, i + 4)) >= n) openingInvalid++;
}
assert.equal(openingInvalid, 107);
console.log(JSON.stringify({
  status: 'PASS',
  rsaSource: { p, q, e, n, phi, d },
  knownClearP57Positive: recovered.length + '/' + clear.length,
  originalRunes: joined.length,
  openingBlackSource: { symbols: blackOpening.length, blocks: 179, invalid: openingInvalid },
  originalFourRuneReadings: counts.map(({ framing, endian, phase, blocks, invalid }) => ({ framing, endian, phase, blocks, invalid })),
  decision: 'Every tested canonical fixed-width 4-digit base29 RSA ciphertext block framing has invalid c>=n blocks, so this direct source RSA 4:3 transport is impossible'
}, null, 2));
