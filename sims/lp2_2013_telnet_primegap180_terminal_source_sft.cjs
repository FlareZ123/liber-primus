'use strict';

/**
 * Independent, original-input 2013 telnet prime-gap / LP2 terminal-180 test.
 *
 * Run from any working directory with Node.js 22:
 *   node sims/lp2_2013_telnet_primegap180_terminal_source_sft.cjs
 *
 * Reads canonical source files only; writes nothing.
 * Earlier 2013 participant witnesses (not Cicada-signed server logs) report
 * that the telnet PRIMES response jumped from 71 directly to 1229.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {number} upperInclusive @returns {number[]} */
function primesThrough(upperInclusive) {
  const out = [];
  for (let n = 2; n <= upperInclusive; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(n);
  }
  return out;
}

/** @param {number} value @returns {number} */
function gp(value) {
  return ((value % 29) + 29) % 29;
}

/**
 * @param {number[]} source
 * @param {number[][]} key
 * @param {-1 | 1} direction
 * @returns {number}
 */
function matching(source, key, direction) {
  assert.equal(source.length, key.length);
  return source.reduce((count, rune, i) =>
    count + Number(rune === gp(key[i][0] + direction * key[i][1])), 0);
}

/**
 * @param {number[]} primeResidues
 * @returns {number[]}
 */
function oppositeReversalCounts(primeResidues) {
  const partitions = [
    [[1, 3], [5, 7]],
    [[1, 5], [3, 7]],
    [[1, 7], [3, 5]],
  ];
  return partitions.map((oppositePairs) => {
    let reversals = 0;
    for (let i = 0; i + 1 < primeResidues.length; i++) {
      const a = primeResidues[i];
      const b = primeResidues[i + 1];
      if (oppositePairs.some(([u, v]) => (a === u && b === v) || (a === v && b === u))) {
        reversals++;
      }
    }
    return reversals;
  });
}

const base = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(base, 'lp2-corpus.json'), 'utf8'));
const table = JSON.parse(fs.readFileSync(path.join(base, 'lp2-grid-256.json'), 'utf8'));
const primes = primesThrough(3301);
const missing = primes.filter((p) => p > 71 && p < 1229);

assert.equal(primes.length, 464);
assert.deepEqual([primes[19], primes[20], primes[199], primes[200]], [71, 73, 1223, 1229]);
assert.equal(missing.length, 180);
assert.equal(table.bytes.length, 256);

const p55 = corpus.pages.find((page) => page.page === 55).indices;
const p56cipher = corpus.pages.find((page) => page.page === 56).indices;
const p57clear = corpus.pages.find((page) => page.page === 57).indices;
assert.deepEqual([p55.length, p56cipher.length, p57clear.length], [76, 85, 95]);

// Authentic p56 prime-totient inverse: the literal F at local index 56
// emits itself without consuming a prime, so only 84 prime-clock steps occur.
let primeClock = 0;
const p56plain = p56cipher.map((c, i) => {
  if (i === 56) {
    assert.equal(c, 0);
    return 0;
  }
  return gp(c - (primes[primeClock++] - 1));
});
assert.equal(primeClock, 84);
assert.deepEqual(p56plain.slice(0, 5), [24, 9, 18, 9, 23]); // AN END
assert.equal(p56plain.length + p57clear.length, missing.length);

const interior = [];
for (let row = 1; row < 31; row++) {
  for (let col = 1; col < 7; col++) {
    interior.push(table.bytes[row * 8 + col]);
  }
}
assert.equal(interior.length, 180);

const registers = [
  ['plain(p56)+clear(p57)', p56plain.concat(p57clear), [4, 4, 7, 8]],
  ['cipher(p56)+clear(p57)', p56cipher.concat(p57clear), [5, 5, 8, 4]],
];
for (const [name, known, expected] of registers) {
  const scores = [];
  for (const direction of [-1, 1]) {
    for (const primeOffset of [0, -1]) {
      const pairs = interior.map((byte, i) => [byte, missing[i] + primeOffset]);
      scores.push(matching(known, pairs, direction));
    }
  }
  assert.deepEqual(scores, expected, 'original terminal-180 count changed for ' + name);
  console.log(name + ': sign-/prime, sign-/(prime-1), sign+/prime, sign+/(prime-1) = ' + scores.join(', '));
}

// Any direct unit-cardinal Hamiltonian traversal of a 30x6 grid cannot
// immediately return to the previous cell. Every bijection of the four odd
// prime mod 8 residues to {N,E,S,W} has one of these three opposite-pair sets.
const residues = missing.map((p) => p % 8);
assert.deepEqual([...new Set(residues)].sort((a, b) => a - b), [1, 3, 5, 7]);
const backtracks = oppositeReversalCounts(residues);
assert.deepEqual(backtracks, [56, 48, 57]);
console.log('Prime-gap cardinal unit-walk mandatory immediate reversals: ' + backtracks.join(', '));

console.log('PASS: 180 omitted primes, 180 inner cells, 85+95 source runes; no direct additive GP29 match or Hamiltonian mod8 unit walk.');
