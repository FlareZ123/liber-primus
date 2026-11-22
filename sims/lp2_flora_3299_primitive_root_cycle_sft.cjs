'use strict';

/**
 * Original LP2 floral-pair source-3299 full-cycle inverse, a single runnable test file.
 * Tested input: original p40–p53 after red8, followed by p54–p55 after red9.
 * Source-visible integers: p15 red3299; Cicada identifier 3301; coefficient 2.
 * Hypothesis frozen in workplace/agent27-floral-3299-primitive-root-cyclic-inverse-precommit.md.
 *
 * Run in repository with: node sims/lp2_flora_3299_primitive_root_cycle_sft.cjs
 * This file performs read-only source loads and has no library dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8')
);
const ink = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../resources/liber-primus/lp2-ink-annotations.json'), 'utf8')
);

const N = 3299;
const L = N - 1;
const MOD = 29;

/** @param {number} n @returns {number} */
function mod(n) {
  return ((n % MOD) + MOD) % MOD;
}

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const bins = Array(MOD).fill(0);
  for (const x of a) bins[x] += 1;
  return bins.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}

/** @param {number} i @returns {number} */
function redLength(i) {
  const page = ink.pages.find((p) => p.page === i);
  assert.ok(page);
  assert.equal(page.red_spans.length, 1);
  assert.equal(page.red_spans[0].start, 0);
  return page.red_spans[0].length;
}

/** @returns {number[]} */
function getSource() {
  const a = corpus.pages.slice(40, 54).flatMap((page) => page.indices);
  const b = corpus.pages.slice(54, 56).flatMap((page) => page.indices);
  assert.equal(a.length, 3008);
  assert.equal(b.length, 308);
  assert.equal(redLength(40), 8);
  assert.equal(redLength(54), 9);
  const source = [...a.slice(8), ...b.slice(9)];
  assert.equal(source.length, N);
  return source;
}

/** @returns {number[]} */
function doublingOrbit() {
  const orbit = [];
  const seen = new Set();
  let index = 1;
  for (let step = 0; step < L; step += 1) {
    assert.ok(!seen.has(index), 'premature doubling cycle');
    seen.add(index);
    orbit.push(index);
    index = (2 * index) % N;
  }
  assert.equal(index, 1);
  assert.equal(seen.size, L);
  return orbit;
}

/** @param {number[]} values @returns {number[]} */
function encode(values) {
  assert.equal(values.length, N);
  return values.map((p, i) => mod(p + 2 * values[(2 * i) % N]));
}

/**
 * Unique inverse of C_i=P_i+2*P_(2i mod3299) over GP29.
 * Inverse denominator: 1-(-2)^3298=25; 25^-1 mod29=7.
 *
 * @param {number[]} cipher
 * @param {number[]} orbit
 * @returns {number[]}
 */
function decode(cipher, orbit) {
  assert.equal(cipher.length, N);
  assert.equal(orbit.length, L);
  const plain = Array(N);
  plain[0] = mod(10 * cipher[0]); // inverse of 3 mod29
  let sum = 0;
  let power = 1;
  for (const index of orbit) {
    sum = mod(sum + power * cipher[index]);
    power = mod(-2 * power);
  }
  assert.equal(power, 5);
  plain[1] = mod(7 * sum);
  for (let k = 0; k < L - 1; k += 1) {
    const index = orbit[k];
    plain[orbit[k + 1]] = mod(15 * (cipher[index] - plain[index]));
  }
  assert.deepStrictEqual(encode(plain), cipher, 'complete original reencryption');
  return plain;
}

/** @param {number[]} values @param {number} width @returns {string} */
function runes(values, width) {
  return values.slice(0, width).map((i) => corpus.translit[i]).join('.');
}

// Verify 3299 prime by direct divisor test, plus the full primitive-root orbit.
for (let divisor = 2; divisor * divisor <= N; divisor += 1) {
  assert.notEqual(N % divisor, 0);
}
const orbit = doublingOrbit();
const cipher = getSource();
const plain = decode(cipher, orbit);
const p57 = corpus.pages[57].indices;
assert.equal(p57.length, 95);
const plant = Array.from({ length: N }, (_, i) => p57[i % p57.length]);
assert.deepStrictEqual(decode(encode(plant), orbit), plant, 'solved-GP original-length plant');

// Independent key-free original-orbit prediction: local anti-repeat should also
// appear along the printed generator if the actual cipher forbids C[i]=C[2i].
let orbitCollisions = 0;
let localCollisions = 0;
for (let i = 1; i < N; i += 1) {
  if (cipher[i] === cipher[(2 * i) % N]) orbitCollisions += 1;
  if (cipher[i] === cipher[i - 1]) localCollisions += 1;
}
assert.equal(orbitCollisions, 124);
assert.equal(localCollisions, 21);
const frequencies = Array(MOD).fill(0);
for (const rune of cipher) frequencies[rune] += 1;
const expectedOrbitCollisions = frequencies.reduce((s, n) => s + n * (n - 1), 0) / N;

const sourceIoC = ioc(cipher);
const resultIoC = ioc(plain);
assert.ok(Math.abs(sourceIoC - 0.034464934244182635) < 1e-12);
assert.ok(Math.abs(resultIoC - 0.034429088991996586) < 1e-12);
assert.deepStrictEqual(plain.slice(0, 12), [8, 13, 0, 6, 7, 24, 10, 15, 15, 1, 23, 10]);

console.log('ORIGINAL:', N, 'runes; 3000 from pp40–53 and 299 from pp54–55');
console.log('SOURCE: p15 red3299, 3301−3299=2; index multiplication 2 mod3299');
console.log('ORBIT:', orbit.length, 'distinct nonzero positions, one complete cycle');
console.log('FROZEN RULE: C[i] = P[i] + 2*P[(2*i)%3299] modulo29');
console.log('SOLVED-GP CONTROL: source-native p57 repeated to 3299 runes; exact reencryption PASS');
console.log('ORIGINAL REENCRYPTION:', cipher.length, 'of', cipher.length, 'exact');
console.log('GENERATOR-2 EDGE EQUALITIES:', orbitCollisions, 'of', L, 'vs fixed-frequency random-permutation expectation', expectedOrbitCollisions.toFixed(6));
console.log('PRINTED-ORDER EQUALITIES:', localCollisions, 'of', L);
console.log('CIPHERTEXT IoC:', sourceIoC.toFixed(12));
console.log('DECODED IoC:', resultIoC.toFixed(12));
console.log('POSITIVE IoC:', ioc(plant).toFixed(12));
console.log('FIRST80 GP:', runes(plain, 80));
console.log('FINAL-CHAPTER FIRST80 GP:', runes(plain.slice(3000), 80));
console.log('VERDICT: exact reversible construction; original inverse remains nonprose.');
