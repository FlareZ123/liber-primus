'use strict';

/**
 * Original p55 three-clause 3x25 prime-totient source-gate, literal-F semantics.
 *
 * Run with Node.js 22:
 *   node sims/lp2_p55_parable_threeprime_3x25_totient_sft.cjs
 *
 * Source-independent parameter selection:
 *   2013 audio "Parable 1,595,277,641" exactly factors into the three
 *   original clear p57 body-clause GP prime sums [1259,1031,1229].
 *   The original p55 76 runes begin with the single rune inherited from p54;
 *   the other 75 full-word runes occupy 3 blocks of 25 (authentic historical
 *   5x5 moth-linked LP1 square is at most a geometrical cue).
 *
 * Question: do the three literal clause sums initialize, respectively, three
 * p56-authenticated consecutive-prime phi(prime)=prime-1 key clocks?
 * The decryption has real plaintext-F transparency: literal-F ciphertext may
 * represent plaintext F without advancing the prime clock. No masks/cribs,
 * key phases, invented prime numbers, secret alphabets, or extra layers.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const firstPrimes = [1259, 1031, 1229];
const mod = (v) => (v % 29 + 29) % 29;

/** @param {number} v @returns {boolean} */
function isPrime(v) {
  if (v < 2) return false;
  for (let i = 2; i * i <= v; i++) if (v % i === 0) return false;
  return true;
}

/** @param {number} first @returns {number[]} */
function keyClock(first) {
  assert(isPrime(first));
  const out = [];
  for (let value = first; out.length < 25; value++) if (isPrime(value)) out.push(value - 1);
  return out;
}

/**
 * Invert every branch of an authentic plaintext-F-transparent totient cipher.
 * @param {number[]} cipher GP29 values
 * @param {number[]} key consecutive prime-totient modulo29 schedule
 * @param {number} sign -1 is the historically solved p56 inverse
 * @returns {{failAt:null|number,paths:{plain:number[],k:number,skip:number[]}[]}}
 */
function invert(cipher, key, sign) {
  let states = [{ plain: [], k: 0, skip: [] }];
  for (let i = 0; i < cipher.length; i++) {
    const next = [];
    for (const state of states) {
      const p = mod(cipher[i] + sign * key[state.k]);
      if (p !== 0) next.push({
        plain: [...state.plain, p], k: state.k + 1, skip: state.skip
      });
      if (cipher[i] === 0) next.push({
        plain: [...state.plain, 0], k: state.k,
        skip: [...state.skip, i]
      });
    }
    if (!next.length) return { failAt: i, paths: [] };
    states = next;
  }
  return { failAt: null, paths: states };
}

/**
 * Exact native solved-plaintext plant with literal F and a local key clock.
 * @param {number[]} plain original solved GP29
 * @param {number[]} key
 * @param {number} inverseSign
 * @returns {number[]}
 */
function forward(plain, key, inverseSign) {
  let k = 0;
  return plain.map((p) => p === 0 ? 0 : mod(p - inverseSign * key[k++]));
}

assert.equal(firstPrimes.reduce((a, b) => a * b, 1), 1595277641);
assert.deepEqual(firstPrimes.map(isPrime), [true, true, true]);
const p55 = source.pages[55].indices;
const p57 = source.pages[57].indices;
assert.equal(p55.length, 76);
assert.equal(p57.length, 95);
assert.equal(p55[0], 21); // the single GP NG carry continuing p54's word
const p55Core = p55.slice(1);
assert.equal(p55Core.length, 75);
const knownPlain75 = p57.slice(0, 75);
const originalFailOffsets = {
  '-1': [19, 10, null],
  '1': [null, 0, 4]
};

for (const sign of [-1, 1]) {
  let originalFullPaths = 1;
  for (let block = 0; block < 3; block++) {
    const prime = firstPrimes[block];
    const key = keyClock(prime);
    const cipher25 = p55Core.slice(25 * block, 25 * (block + 1));
    const result = invert(cipher25, key, sign);
    assert.equal(result.failAt, originalFailOffsets[String(sign)][block]);
    originalFullPaths *= result.paths.length;
    const solved25 = knownPlain75.slice(25 * block, 25 * (block + 1));
    const synthetic25 = forward(solved25, key, sign);
    const control = invert(synthetic25, key, sign);
    assert.equal(control.failAt, null);
    assert(control.paths.some((state) =>
      state.plain.every((v, i) => v === solved25[i])));
    console.log(JSON.stringify({
      primeStart: prime, block, firstLocalPrime: key[0] + 1,
      inverseSign: sign, originalRuneOffsets: [1 + 25 * block, 25 + 25 * block],
      originalFirstImpossibleWithinBlock: result.failAt,
      completeOriginalBlockPaths: result.paths.length,
      solvedNativeGPPlantRecovered: 25
    }));
  }
  assert.equal(originalFullPaths, 0);
}
console.log('PASS: original p55 complete triple 3x25 prime-totient inverse impossible, both signs; 6/6 authentic-native positives pass.');
