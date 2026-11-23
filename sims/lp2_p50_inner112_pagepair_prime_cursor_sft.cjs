'use strict';
/**
 * Original LP2 28x4 inner-panel, two-cells-per-page, prime-cursor test.
 * Run: node sims/lp2_p50_inner112_pagepair_prime_cursor_sft.cjs
 *
 * Hypothesis only: neither the twice-peeled address nor a pagewise prime
 * start/stride is an authenticated Cicada instruction.
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

const original = new Map(corpus.pages.map((p) => [p.page, p.indices]));
const pages = Array.from({ length: 56 }, (_, page) => ({
  page,
  ciphertext: original.get(page)
}));
assert.equal(corpus.runes.length, 29);
assert.equal(grid.bytes.length, 256);
assert.equal(pages.length, 56);
assert.equal(pages.filter((p) => p.ciphertext.length).length, 55);
assert.equal(pages[50].ciphertext.length, 0);
assert.equal(pages.reduce((s, p) => s + p.ciphertext.length, 0), 12956);
assert.equal(original.get(57).length, 95);

const core = [];
for (let r = 2; r < 30; r++) {
  for (let c = 2; c < 6; c++) core.push(grid.bytes[8 * r + c]);
}
assert.equal(core.length, 112);
assert.ok(core.every((x) => Number.isInteger(x) && x >= 0 && x <= 255));

const largestOrdinal = Math.max(...pages.filter((p) => p.ciphertext.length).map(
  (p) => core[2 * p.page] + (p.ciphertext.length - 1) * (core[2 * p.page + 1] + 1)
));

/** @param {number} largest Maximum zero-based prime ordinal needed. */
function makePrimes(largest) {
  const n = largest + 2;
  const bound = Math.ceil(n * (Math.log(n) + Math.log(Math.log(n)))) + 200;
  const sieve = new Uint8Array(bound + 1);
  sieve[0] = 1;
  sieve[1] = 1;
  for (let x = 2; x * x <= bound; x++) {
    if (!sieve[x]) for (let y = x * x; y <= bound; y += x) sieve[y] = 1;
  }
  const primes = [];
  for (let x = 2; x <= bound; x++) if (!sieve[x]) primes.push(x);
  assert.ok(primes.length > largest);
  return primes;
}
const primes = makePrimes(largestOrdinal);

/**
 * The two source cells define the first prime index and index stride. Exact
 * historical p56 consumer: subtract (prime - 1) modulo 29.
 * @param {number[]} source
 * @param {number} page Physical LP2 page number, including rune-free p50 slot.
 * @param {number} sign +1 to encode, -1 to decode.
 * @returns {number[]}
 */
function transform(source, page, sign) {
  const start = core[2 * page];
  const stride = core[2 * page + 1] + 1;
  return source.map((x, j) => ((x + sign * ((primes[start + stride * j] - 1) % 29)) % 29 + 29) % 29);
}
/** @param {number[]} data GP29 indices. */
function ioc(data) {
  const counts = Array(29).fill(0);
  for (const x of data) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (data.length * (data.length - 1));
}

/**
 * Stronger, explicitly separate ciphertext-feedback countermodel. The
 * uncommon repeated ciphertext rune encodes a reserved plaintext EA.
 * All nonzero GP29 successor differences enumerate 28 other symbols.
 * It is a candidate codec, not an authenticated Cicada mechanic.
 * @param {number[]} data GP29 input tape, physical-page local.
 * @param {number} page Original page slot, including p50.
 * @param {'sorted'|'cyclic'} order Codebook enumeration.
 * @param {-1|1} direction -1 decrypt / +1 encrypt.
 * @returns {number[]}
 */
function rankTransform(data, page, order, direction) {
  if (!data.length) return [];
  const out = [data[0]];
  const start = core[2 * page];
  const stride = core[2 * page + 1] + 1;
  for (let j = 1; j < data.length; j++) {
    const k = (primes[start + stride * j] - 1) % 28;
    const lastCipher = direction === -1 ? data[j - 1] : out[j - 1];
    if (direction === -1) {
      const current = data[j];
      if (current === lastCipher) {
        out.push(28);
      } else {
        const rank = order === 'sorted'
          ? current - Number(current > lastCipher)
          : (current - lastCipher + 28) % 29;
        out.push(((rank - k) % 28 + 28) % 28);
      }
    } else if (data[j] === 28) {
      out.push(lastCipher);
    } else {
      const rank = (data[j] + k) % 28;
      out.push(order === 'sorted'
        ? rank + Number(rank >= lastCipher)
        : (lastCipher + rank + 1) % 29);
    }
  }
  return out;
}
const rankVariants = ['sorted', 'cyclic'].map((order) => {
  const candidate = [];
  for (const p of pages) {
    const decodedPage = rankTransform(p.ciphertext, p.page, order, -1);
    assert.deepEqual(rankTransform(decodedPage, p.page, order, +1), p.ciphertext);
    candidate.push(...decodedPage);
  }
  // Use actual solved p57 GP29 as a native-language, 95-rune positive
  // under the frozen p55 source-key pair (never fitting a p57 key).
  const planted = rankTransform(original.get(57), 55, order, +1);
  assert.deepEqual(rankTransform(planted, 55, order, -1), original.get(57));
  return {
    order,
    recoveredRunes: candidate.length,
    reservedEACount: candidate.filter((x) => x === 28).length,
    ioc: ioc(candidate),
    first40GpTokens: candidate.slice(0, 40).map((i) => corpus.translit[i])
  };
});
assert.deepEqual(rankVariants.map((r) => r.reservedEACount), [86, 86]);
assert.ok(Math.abs(rankVariants[0].ioc - 0.03525637764084454) < 1e-12);
assert.ok(Math.abs(rankVariants[1].ioc - 0.03527852903315905) < 1e-12);

const ciphertext = pages.flatMap((p) => p.ciphertext);
const decoded = pages.flatMap((p) => transform(p.ciphertext, p.page, -1));
assert.equal(decoded.length, 12956);
for (const p of pages) {
  assert.deepEqual(transform(transform(p.ciphertext, p.page, -1), p.page, +1), p.ciphertext);
}
// Genuine decrypted p57 language is an independent plaintext plant. The
// source-assigned p55 key is used unchanged for this independent 95-rune plant.
const plainPlant = original.get(57);
assert.deepEqual(transform(transform(plainPlant, 55, +1), 55, -1), plainPlant);
const result = {
  source: 'unchanged original GP29 p0-p55 and base60 p49-p51 32x8 grid',
  selection: 'two circumference peels, row-major 28x4 core, two bytes for each physical p0-p55',
  decoder: 'P[i] = C[i] - (prime[byteA + i*(byteB+1)]-1) mod29; reset at every page',
  originalRunes: ciphertext.length,
  sourceCoreCells: core.length,
  largestPrimeOrdinal: largestOrdinal,
  ciphertextIoc: ioc(ciphertext),
  candidateIoc: ioc(decoded),
  first20GpIndices: decoded.slice(0, 20),
  first20GpTokens: decoded.slice(0, 20).map((i) => corpus.translit[i]),
  solvedP57PositivePlant: plainPlant.length,
  rank28CiphertextFeedbackVariants: rankVariants,
  pageIocs: pages.filter((p) => p.ciphertext.length).map(
    (p) => ({ page: p.page, ioc: ioc(transform(p.ciphertext, p.page, -1)) })
  )
};
assert.ok(Math.abs(result.candidateIoc - 0.03445220703055879) < 1e-12);
assert.ok(Math.abs(result.ciphertextIoc - 0.03447839786450569) < 1e-12);
console.log(JSON.stringify(result, null, 2));
