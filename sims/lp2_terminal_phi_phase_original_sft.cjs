'use strict';

// Source-original, bounded test of the authentic p56 phi/F-transparent cipher
// against the contiguous p54+p55 terminal chapter with a free initial prime rank.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  /** @type {number[]} */
  const primes = [];
  for (let value = 2; primes.length < n; value++) {
    let isPrime = true;
    for (const prime of primes) {
      if (prime * prime > value) break;
      if (value % prime === 0) { isPrime = false; break; }
    }
    if (isPrime) primes.push(value);
  }
  return primes;
}
/**
 * Return reachable counts of consumed primes; each path obeys p56's
 * plaintext-F transparency (a plaintext F must be emitted as ciphertext F).
 * @param {number[]} cipher @param {number[]} primes @param {number} start
 * @returns {Set<number>}
 */
function possibleClocks(cipher, primes, start) {
  let states = new Set([0]);
  for (const c of cipher) {
    const next = new Set();
    for (const k of states) {
      const shift = (primes[start + k] - 1) % 29;
      if (c === 0) {
        next.add(k); // literal plaintext F, prime clock unchanged
        if (shift !== 0) next.add(k + 1); // encrypted non-F
      } else if (c !== shift) {
        next.add(k + 1); // ciphertext non-F cannot represent plaintext F
      }
    }
    states = next;
    if (states.size === 0) break;
  }
  return states;
}
/** @param {number[]} cipher @param {number[]} primes @param {number} maxStart @returns {number[]} */
function scanStarts(cipher, primes, maxStart) {
  /** @type {number[]} */
  const survivors = [];
  for (let s = 0; s < maxStart; s++) {
    if (possibleClocks(cipher, primes, s).size > 0) survivors.push(s);
  }
  return survivors;
}
/**
 * For the few survivors, enumerate all legal F masks and actual plaintexts.
 * @param {number[]} cipher @param {number[]} primes @param {number} start
 * @returns {number[][]}
 */
function decodeAll(cipher, primes, start) {
  /** @type {Array<{k:number, plain:number[]}>} */
  let paths = [{ k: 0, plain: [] }];
  for (const c of cipher) {
    /** @type {Array<{k:number, plain:number[]}>} */
    const next = [];
    for (const current of paths) {
      const shift = (primes[start + current.k] - 1) % 29;
      if (c === 0) {
        next.push({ k: current.k, plain: current.plain.concat(0) });
        if (shift !== 0) next.push({ k: current.k + 1, plain: current.plain.concat((29 - shift) % 29) });
      } else if (c !== shift) {
        next.push({ k: current.k + 1, plain: current.plain.concat((29 + c - shift) % 29) });
      }
    }
    paths = next;
    if (paths.length === 0) break;
  }
  return paths.map(v => v.plain);
}
/** @param {number[]} plain @param {number[]} primes @param {number} start @returns {number[]} */
function encode(plain, primes, start) {
  let k = start;
  return plain.map(value => value === 0 ? 0 : (value + primes[k++] - 1) % 29);
}
/** @param {string} words @param {string[]} alphabet @returns {number[]} */
function toGp(words, alphabet) {
  const tokens = alphabet.map((word, id) => ({ word, id })).sort((a, b) => b.word.length - a.word.length);
  /** @type {number[]} */
  const out = [];
  for (const word of words.split(' ')) {
    for (let i = 0; i < word.length;) {
      const found = tokens.find(v => word.startsWith(v.word, i));
      assert.ok(found, 'Unknown GP fragment: ' + word.slice(i));
      out.push(found.id);
      i += found.word.length;
    }
  }
  return out;
}
/** @param {number[]} arr @returns {number} */
function ioc(arr) {
  const freq = Array(29).fill(0);
  for (const n of arr) freq[n]++;
  return freq.reduce((sum, n) => sum + n * (n - 1), 0) / (arr.length * (arr.length - 1));
}
/** @param {number} p @returns {number[]} */
function page(p) {
  const item = source.pages.find(v => v.page === p);
  assert.ok(item, 'missing page ' + p);
  return item.indices;
}

const p54 = page(54), p55 = page(55), p56 = page(56), p57 = page(57);
assert.deepEqual([p54.length, p55.length, p56.length, p57.length], [232, 76, 85, 95]);
assert.deepEqual(p54.slice(0, 9), [24, 19, 21, 23, 27, 2, 14, 10, 19]);
const terminal = p54.concat(p55);
const maxStart = 10000;
const primes = firstPrimes(maxStart + terminal.length + 1);

// Independent genuine Cicada known plaintext, including the single literal-F bypass.
const p56Words = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const known = toGp(p56Words, source.translit);
assert.equal(known.length, 85);
assert.deepEqual(encode(known, primes, 0), p56);
assert.ok(possibleClocks(p56, primes, 0).size > 0);

// Positive synthetic plant includes real GP-native F from the clear PARABLE page.
const plantedPlain = Array.from({ length: terminal.length }, (_, i) => p57[i % p57.length]);
assert.ok(plantedPlain.includes(0));
const plantedCipher = encode(plantedPlain, primes, 167);
assert.ok(possibleClocks(plantedCipher, primes, 167).size > 0);
assert.ok(decodeAll(plantedCipher, primes, 167).some(p => p.every((v, i) => v === plantedPlain[i])));

const all = scanStarts(terminal, primes, maxStart);
const body = scanStarts(terminal.slice(9), primes, maxStart);
const end = scanStarts(p55, primes, maxStart);
assert.deepEqual(all, [167, 168, 3047, 4121, 4365, 4366, 7312, 7975]);
assert.deepEqual(body, [176, 177, 640, 3056, 4130, 4374, 4375, 7321, 7322, 7984, 8270, 9859]);
assert.equal(end.length, 3000);
const survivors = all.map(s => {
  const paths = decodeAll(terminal, primes, s);
  assert.ok(paths.length > 0);
  assert.ok(paths.every(p => p.length === terminal.length && encode(p, primes, s).every((v, i) => v === terminal[i])));
  const redHeading = paths[0].slice(0, 9).map(v => source.translit[v]).join(' ');
  return { startZeroBased: s, firstPrime: primes[s], legalPlaintextPaths: paths.length,
    redHeading, initialA: paths[0][0] === 24,
    minIoc: Math.min(...paths.map(ioc)), maxIoc: Math.max(...paths.map(ioc)) };
});
const articleCandidates = survivors.filter(s => s.initialA);
assert.equal(articleCandidates.length, 1);
assert.equal(articleCandidates[0].startZeroBased, 4366);
assert.equal(articleCandidates[0].redHeading, 'A N C EO H H M N T');

console.log(JSON.stringify({ test: 'Original 308-rune terminal under authentic p56 phi/F rule; 10,000 free prime starts',
  sourcePages: [54, 55], pageLengths: [p54.length, p55.length],
  originalCipherFPositions: terminal.flatMap((v, i) => v === 0 ? [i] : []),
  fullSurvivorCount: all.length, black299SurvivorCount: body.length,
  isolatedP55SurvivorCount: end.length,
  fullSurvivors: survivors, articleCandidates,
  authenticP56: '85/85 exact forward with literal-F bypass',
  planted308: 'exactly recovered and forward-verified',
  status: 'PASS; finite mechanism exclusion, not plaintext recovery' }, null, 2));
