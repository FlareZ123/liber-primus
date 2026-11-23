'use strict';

/**
 * Single-file source-original finite-field key-recovery gate.
 * The strict p55 word interiors give N=8P and their complete boundary runes
 * give E=43Q. For the two conditionally proposed public values 8 and E,
 * exhaust all x < 2^64 satisfying independently recovered x mod M.
 *
 * Run with Node.js 22: node sims/lp2_p55_shed_public_values_full64_dlog_sft.cjs
 * No extra dependencies, writes, floating point, key tuning or network.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const page = corpus.pages.find((p) => p.page === 55);
assert.ok(page);
assert.equal(page.indices.length, 76);
const lengths = [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
let offset = 1; // original first rune completes a word begun on physical p54
const words = lengths.map((len) => {
  const word = page.indices.slice(offset, offset + len);
  assert.equal(word.length, len);
  offset += len;
  return word;
});
assert.equal(offset, page.indices.length);
const interior = words.flatMap((word) => word.slice(1, -1));
const boundary = words.flatMap((word) => [word[0], word[word.length - 1]]);
assert.equal(interior.length, 43);
assert.equal(boundary.length, 32);

/** @param {number[]} digits */
function base29(digits) {
  return digits.reduce((n, digit) => n * 29n + BigInt(digit), 0n);
}

/**
 * @param {bigint} base
 * @param {bigint} exponent
 * @param {bigint} modulus
 */
function powMod(base, exponent, modulus) {
  let result = 1n;
  for (base %= modulus; exponent > 0n; exponent >>= 1n) {
    if ((exponent & 1n) !== 0n) result = result * base % modulus;
    base = base * base % modulus;
  }
  return result;
}

const N = base29(interior);
const outer = base29(boundary);
assert.equal(N % 8n, 0n);
assert.equal(outer % 43n, 0n);
const P = N / 8n;
const Q = outer / 43n;
assert.equal(P, 63755441409934721069036418908763882578170591536653256311514221n);
assert.equal(Q, 1268532719737981052966698570711268391040527137n);
const E = outer;
const M = 630311729907820n;
const R = 101149063843788281988908603592862658065019147521n;
assert.equal(P - 1n, M * R);

/**
 * Exhaust the unique residue class x=x0+k*M for x < 2^64.
 * Multiplicative running powers reduce 29,266 206-bit exponentiations to
 * two exponentiations and one modular multiplication per candidate.
 * @param {bigint} target
 * @param {bigint} x0
 */
function search(target, x0) {
  assert.equal(powMod(Q, x0 * R, P), powMod(target, R, P));
  const max = ((1n << 64n) - 1n - x0) / M;
  let current = powMod(Q, x0, P);
  const step = powMod(Q, M, P);
  const hits = [];
  for (let k = 0n; k <= max; k++) {
    if (current === target) hits.push(x0 + k * M);
    current = current * step % P;
  }
  return { candidates: max + 1n, hits };
}

const targets = [
  { name: 'public8', target: 8n, x0: 97883509924151n },
  { name: 'shellE', target: E, x0: 483581994079670n }
];
for (const { name, target, x0 } of targets) {
  const result = search(target, x0);
  assert.equal(result.candidates, 29266n);
  assert.deepEqual(result.hits, []);
  const plantedExponent = x0 + 12000n * M;
  assert.ok(plantedExponent < 1n << 64n);
  const control = search(powMod(Q, plantedExponent, P), x0);
  assert.deepEqual(control.hits, [plantedExponent]);
  console.log(
    name + ': 29266/29266 conditional x<2^64 searched; ' +
    'no source-original log, planted exponent recovered exactly'
  );
}
console.log('PASS: original p55 N=8P, E=43Q and two 64-bit DH exponent exclusions');
