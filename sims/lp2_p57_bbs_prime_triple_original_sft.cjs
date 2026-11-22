'use strict';

/**
 * Source-selected 2013 PARABLE prime triple -> Blum-Blum-Shub candidate.
 * Run from repo root: node sims/lp2_p57_bbs_prime_triple_original_sft.cjs
 * Deterministic, read-only. No dependency on guessed unknown plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const file = path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
const corpus = JSON.parse(fs.readFileSync(file, 'utf8'));
const pages = corpus.pages.filter((p) => p.page >= 0 && p.page <= 55);
const c55 = corpus.pages.find((p) => p.page === 55).indices;
const p57 = corpus.pages.find((p) => p.page === 57).indices;
const C = pages.flatMap((p) => p.indices);
assert.equal(C.length, 12956);
assert.deepEqual([c55.length, p57.length], [76, 95]);

/** @param {number} x @returns {boolean} */
function prime(x) {
  if (x < 2) return false;
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return false;
  return true;
}
const ranges = [[0, 7], [7, 37], [37, 67], [67, 95]];
const sums = ranges.map(([from, to]) =>
  p57.slice(from, to).reduce((sum, gp) => sum + corpus.prime[gp], 0));
assert.deepEqual(sums, [449, 1259, 1031, 1229]);
const [p, q, seed] = sums.slice(1);
assert.ok(prime(p) && prime(q) && prime(seed));
assert.deepEqual([p % 4, q % 4, seed % 4], [3, 3, 1]);
const N = p * q;
assert.equal(N * seed, 1595277641); // Authenticated historical 761.MP3 metadata.
assert.equal(N, 1298029);

/**
 * Blum-Blum-Shub with x0 = seed^2 mod N; each call first advances x -> x^2.
 * 'state': state modulo29. 'msb'/'lsb': standard parity-bit stream,
 * 5-bit GP29 rejection sampling, in respective bit-packing order.
 * @param {'state'|'msb'|'lsb'} method
 * @returns {() => number}
 */
function generator(method) {
  let x = seed * seed % N;
  const bit = () => { x = x * x % N; return x & 1; };
  return () => {
    if (method === 'state') {
      x = x * x % N;
      return x % 29;
    }
    while (true) {
      let code = 0;
      for (let j = 0; j < 5; j++) {
        const b = bit();
        code = method === 'msb' ? code * 2 + b : code | (b << j);
      }
      if (code < 29) return code;
    }
  };
}

// An actual congruence orbit result, independent of any ciphertext score.
const first = seed * seed % N;
let state = first, cycle = 0;
do { state = state * state % N; cycle++; } while (state !== first && cycle < N);
assert.equal(cycle, 612);
console.log('SOURCE: PARABLE body primes [' + [p,q,seed].join(',') + '], N=' + N + ', BBS seed orbit=' + cycle);

/** @param {number[]} a @returns {number} */
function indexOfCoincidence(a) {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((sum, x) => sum + x * (x - 1), 0) / (a.length * (a.length - 1));
}
const originalIoc = indexOfCoincidence(C);
assert.ok(Math.abs(originalIoc - 0.03447839786450569) < 1e-12);
let minIoc = 1, maxIoc = 0;
for (const offset of [0, 761, 3301]) {
  for (const method of ['state', 'msb', 'lsb']) {
    const next = generator(method);
    for (let j = 0; j < offset; j++) next();
    const key = C.map(() => next());
    assert.ok(key.every((x) => x >= 0 && x < 29));
    // Positive: original clear GP29 PARABLE can be reversibly ciphered under
    // this exact seeded generator and decoded again, rune for rune.
    const planted = p57.map((plain, i) => (plain + key[i]) % 29);
    assert.deepEqual(planted.map((cipher, i) => (cipher - key[i] + 29) % 29), p57);
    for (const sign of [-1, 1]) {
      const decoded = C.map((cipher, i) => (cipher + sign * key[i] + 29) % 29);
      const ioc = indexOfCoincidence(decoded);
      minIoc = Math.min(minIoc, ioc);
      maxIoc = Math.max(maxIoc, ioc);
      const p55Ioc = indexOfCoincidence(decoded.slice(-76));
      console.log('ORIGINAL offset=' + offset + ' stream=' + method + ' sign=' + sign + ' fullIoC=' + ioc.toFixed(6) + ' p55IoC=' + p55Ioc.toFixed(6));
    }
  }
}
assert.ok(minIoc > 0.0344 && maxIoc < 0.0346);
console.log('PASS: originalIoC=' + originalIoc.toFixed(9) + ' BBS candidates fullIoC=' + minIoc.toFixed(6) + '..' + maxIoc.toFixed(6) + '; positive PARABLE roundtrip 95/95, unknown ciphertext remains nonprose.');
