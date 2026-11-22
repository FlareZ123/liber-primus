'use strict';

/**
 * LP2 page-15 Fibonacci-prime square as a natural 256-bit cryptographic key.
 *
 * Exactly 16 displayed integers fit in 16-bit unsigned fields. Packing
 * these as 32 bytes supplies a clue-derived AES-256/ChaCha20 key without
 * arbitrary passphrases. This tests that specific hypothesis under directly
 * existing stream, rune-mapping, IV and page-reset conventions.
 *
 * No GP plaintext or actual LP2 key is presumed.
 *
 * @module fibonacci_spiral_key_derivation
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {readSquare, primeList, uniqueFibonacciPrimeRanks, clockwiseSpiral} =
  require('./fibonacci_prime_spiral.cjs');
const {scan, plant} = require('./base60_seeded_stream.cjs');

const ROOT = path.join(__dirname, '..');
const CORPUS = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const PAGES = CORPUS.pages.filter((p) =>
  p.status === 'unsolved' && p.indices.length);
assert.equal(PAGES.length, 55);
assert.equal(PAGES.reduce((n, page) => n + page.indices.length, 0), 12956);

/**
 * Encode all 16 scalar values as a fixed 32-byte, 256-bit candidate key.
 * @param {number[]} values Nonnegative integer scalar array.
 * @param {'BE'|'LE'} byteOrder
 * @returns {Buffer}
 */
function pack(values, byteOrder) {
  assert.equal(values.length, 16);
  const output = Buffer.alloc(32);
  values.forEach((value, index) => {
    assert.ok(Number.isInteger(value) && value >= 0 && value < 65536);
    if (byteOrder === 'BE') output.writeUInt16BE(value, index * 2);
    else output.writeUInt16LE(value, index * 2);
  });
  return output;
}

/**
 * Construct candidates without any fitting to LP2 ciphertext.
 * Values and order are taken from the independently exact Fibonacci-prime
 * spiral on original LP2 page 15. Alternatives are finite and predeclared.
 * @returns {Array<{name:string,key:Buffer}>}
 */
function candidates() {
  const grid = readSquare();
  const spiralCoordinates = clockwiseSpiral();
  const ranks = uniqueFibonacciPrimeRanks();
  const primes = primeList(Math.max(...ranks));
  const primeNumbers = ranks.map((index) => primes[index - 1]);
  const numbers = spiralCoordinates.map(([row, col]) => grid[row][col]);
  assert.deepEqual(numbers,
    primeNumbers.map((prime) => Math.abs(3301 - prime)));
  const fib = ranks.map((value) => value - 1);
  const coordinateIndex = Array.from({length: 16}, (_, i) =>
    spiralCoordinates.findIndex(([r, c]) => r * 4 + c === i));
  assert.equal(new Set(coordinateIndex).size, 16);

  const sourceArrays = {
    'absolute-spiral': numbers,
    'absolute-row-major': grid.flat(),
    'prime-spiral': primeNumbers,
    'prime-row-major': coordinateIndex.map((i) => primeNumbers[i]),
    'ordinal-spiral': ranks,
    'ordinal-row-major': coordinateIndex.map((i) => ranks[i]),
    'fibonacci-spiral': fib,
    'fibonacci-row-major': coordinateIndex.map((i) => fib[i])
  };
  const keys = [];
  for (const [name, values] of Object.entries(sourceArrays)) {
    for (const order of ['BE', 'LE']) {
      keys.push({name: name + ':' + order, key: pack(values, order)});
      keys.push({name: 'sha256(' + name + ':' + order + ')',
        key: createHash('sha256').update(pack(values, order)).digest()});
    }
  }
  assert.equal(keys.length, 32);
  return keys;
}

/** @returns {object} */
function run() {
  const keys = candidates();
  const selected = {
    nextPage16: PAGES.filter((p) => p.page === 16),
    followingPages16to22: PAGES.filter((p) => p.page >= 16 && p.page <= 22),
    allUnsolved: PAGES
  };
  const real = Object.fromEntries(Object.entries(selected).map(([label, pages]) =>
    [label, scan(pages, keys)]));
  const knownKey = keys.find((candidate) => candidate.name === 'absolute-spiral:BE');
  assert.ok(knownKey);
  const synthetic = plant(PAGES, knownKey.key);
  const positive = scan(synthetic, keys);
  const chosen = positive.overall[0];
  if (chosen.key !== knownKey.name ||
      chosen.cipher !== 'aes-256-ctr' || chosen.ivmode !== 'zero' ||
      chosen.drop !== 0 || chosen.mapping !== 'mod' || chosen.sign !== -1) {
    throw new Error('The true 256-bit clue-derived AES-CTR key was not recovered');
  }
  return {
    source: 'LP2 15 (32.jpg): Fibonacci-prime 4x4 spiral',
    procedure: '16 uint16 scalar values -> 32-byte AES-256/ChaCha20/RC4 key',
    noKeyLearnedFromLP2: true,
    keyCandidates: keys.map((item) =>
      ({name: item.name,
        sha256: createHash('sha256').update(item.key).digest('hex')})),
    windows: Object.fromEntries(Object.entries(selected).map(([label, pages]) =>
      [label, {pages: pages.map((page) => page.page),
        runes: pages.reduce((sum, page) => sum + page.indices.length, 0),
        ...real[label]}])),
    plantedControl: {
      source: 'LP1-like GP unigram with 81% immediate-repeat rewriting',
      fixedKey: chosen.key, selectedBest: chosen,
      trueKeyRankOne: true
    },
    note: 'Fixed-key, key-pointer-aligned, page-reset hypotheses only'
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));

module.exports = {pack, candidates, run};
