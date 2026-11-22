'use strict';

/**
 * Source-first exact low-state PRNG output obstruction on the 32x8 LP2 grid.
 * Reading and tests work in Node.js 22 on Windows and other platforms.
 * This does not claim any LP2 plaintext or historical generator.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {number[][]} rows @param {'row'|'column'} orientation @returns {number[]} */
function ordered(rows, orientation) {
  return orientation === 'row' ? rows.flat() :
    Array.from({length: 8}, (_, c) => rows.map(row => row[c])).flat();
}

/** @param {number} s @param {number} a @param {number} b @param {number} c @param {'LRL'|'RLR'} mode @returns {number} */
function step(s, a, b, c, mode) {
  if (mode === 'LRL') {
    s ^= s << a; s ^= s >>> b; s ^= s << c;
  } else {
    s ^= s >>> a; s ^= s << b; s ^= s >>> c;
  }
  return s >>> 0;
}

/** @param {number[]} bytes @returns {bigint} */
function pack(bytes) {
  assert.equal(bytes.length, 8);
  return bytes.reduce((v, x, i) => v | (BigInt(x) << BigInt(8 * i)), 0n);
}

/** @param {bigint[]} columns @param {bigint} target @returns {boolean} */
function inSpan(columns, target) {
  const pivot = Array(64).fill(0n);
  for (let v of columns) {
    for (let i = 63; i >= 0; i--) {
      if ((v & (1n << BigInt(i))) === 0n) continue;
      if (pivot[i] !== 0n) v ^= pivot[i];
      else { pivot[i] = v; break; }
    }
  }
  for (let i = 63; i >= 0; i--) {
    if ((target & (1n << BigInt(i))) !== 0n && pivot[i] !== 0n) target ^= pivot[i];
  }
  return target === 0n;
}

/** @param {number} seed @param {number} a @param {number} b @param {number} c
 *  @param {'LRL'|'RLR'} mode @param {0|1} bytePart @returns {bigint} */
function firstEight(seed, a, b, c, mode, bytePart) {
  let v = 0n;
  for (let i = 0; i < 8; i++) {
    seed = step(seed, a, b, c, mode);
    const bval = bytePart === 0 ? seed & 255 : seed >>> 24;
    v |= BigInt(bval) << BigInt(8 * i);
  }
  return v;
}

/** @param {number[]} bytes @returns {{tests: number, hits: string[]}} */
function xorshiftGate(bytes) {
  const target = pack(bytes.slice(0, 8));
  let tests = 0;
  const hits = [];
  for (const mode of /** @type {('LRL'|'RLR')[]} */ (['LRL', 'RLR'])) {
    for (let a = 1; a <= 31; a++)
      for (let b = 1; b <= 31; b++)
        for (let c = 1; c <= 31; c++) {
          const basis = Array.from({length: 32}, (_, i) => [
            firstEight((2 ** i) >>> 0, a, b, c, mode, 0),
            firstEight((2 ** i) >>> 0, a, b, c, mode, 1)
          ]);
          for (const part of /** @type {(0|1)[]} */ ([0, 1])) {
            tests++;
            if (inSpan(basis.map(column => column[part]), target)) {
              hits.push(`${mode}:${a},${b},${c}:${part === 0 ? 'low' : 'high'}`);
            }
          }
        }
  }
  return {tests, hits};
}

/** glibc additive feedback r[i]=r[i-3]+r[i-31] mod 2^32.
 * rand_i=(r[i]>>>1) implies the low byte has lag(3,31) sum
 * with a possible carry of one from the discarded bit.
 * @param {number[]} bytes @returns {number} */
function glibc31Matches(bytes) {
  let pass = 0;
  for (let i = 31; i < bytes.length; i++) {
    const difference = (bytes[i] - bytes[i - 3] - bytes[i - 31] + 512) & 255;
    if (difference === 0 || difference === 1) pass++;
  }
  return pass;
}

/** @param {number[]} bytes @returns {number} */
function lcg8CandidateCount(bytes) {
  let matches = 0;
  for (let a = 0; a <= 255; a++) for (let c = 0; c <= 255; c++) {
    if (bytes.every((v, i) => i === 0 || (((a * bytes[i - 1] + c) & 255) === v))) {
      matches++;
    }
  }
  return matches;
}

function main() {
  const file = path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json');
  /** @type {{byte_rows:number[][]}} */
  const source = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(source.byte_rows.length, 32);
  source.byte_rows.forEach(row => {
    assert.equal(row.length, 8);
    row.forEach(v => assert.ok(Number.isInteger(v) && v >= 0 && v < 256));
  });
  assert.deepEqual(source.byte_rows[0], [203, 231, 167, 186, 97, 237, 126, 183]);

  const known = firstEight(0x97BDF123, 13, 17, 5, 'LRL', 0);
  const basis = Array.from({length:32}, (_, i) => firstEight((2 ** i) >>> 0, 13, 17, 5, 'LRL', 0));
  assert.equal(inSpan(basis, known), true, 'inversion must accept a real unknown 32-bit seeded generator');
  assert.equal(inSpan(Array(32).fill(0n), 0x11n), false);

  let seed = Array.from({length:31}, (_, i) => (Math.imul(1664525, i + 17) + 1013904223) >>> 0);
  const glibcPlant = seed.map(s => (s >>> 1) & 255);
  for (let i = 31; i < 256; i++) {
    seed.push((seed[i - 3] + seed[i - 31]) >>> 0);
    glibcPlant.push((seed[i] >>> 1) & 255);
  }
  assert.equal(glibc31Matches(glibcPlant), 225, 'true glibc-style recurrence must pass every lag test');
  assert.equal(lcg8CandidateCount(Array.from({length:256}, (_, i) => (i * 5 + 23) & 255)) > 0, true);
  console.log('Positive controls pass: xorshift hidden-state span, additive-feedback stream, and modulo256 LCG.');

  for (const orientation of /** @type {('row'|'column')[]} */ (['row', 'column'])) {
    const bytes = ordered(source.byte_rows, orientation);
    assert.equal(bytes.length, 256);
    const xs = xorshiftGate(bytes);
    const gr = glibc31Matches(bytes);
    const lc = lcg8CandidateCount(bytes);
    console.log(`${orientation}: xorshift=${xs.tests} full-parameter GF(2) seed-existence tests, surviving=${xs.hits.length}; glibc(3,31) compatible=${gr}/225; LCG raw-low8 full-sequence pairs=${lc}`);
    assert.equal(xs.tests, 119164);
    assert.deepEqual(xs.hits, []);
    assert.equal(gr, orientation === 'row' ? 4 : 2);
    assert.equal(lc, 0);
  }
  console.log('Decision: source grid is not raw consecutive output of these exact low-state generators (conditional base60 byte interpretation).');
}
if (require.main === module) main();
module.exports = {ordered, step, pack, inSpan, firstEight, xorshiftGate, glibc31Matches, lcg8CandidateCount};
