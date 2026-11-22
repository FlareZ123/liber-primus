'use strict';

const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const A = 0x5deece66dn;
const A32 = Number(A & 0xffffffffn);
const MASK32 = 0x100000000;
const INIT_LOW = 0x330e;
const EXPECTED_SHA = '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290';

/**
 * POSIX srand48(seed) starts at (seed << 16) | 0x330e. For each LCG draw,
 * the low 16 bits depend solely on the preceding low 16 bits. Its high 32
 * bits advance by the affine recurrence high' = A32 * high + carry (mod 2^32).
 * This precomputation makes an exhaustive 2^32-seed search inexpensive.
 * @param {number} count Number of draws.
 * @returns {{ low: number, carry: number }[]}
 */
function lcgSteps(count) {
  const steps = [];
  let low = INIT_LOW;
  for (let i = 0; i < count; i += 1) {
    const n = A * BigInt(low) + 11n;
    low = Number(n & 65535n);
    steps.push({ low, carry: Number((n >> 16n) & 0xffffffffn) });
  }
  return steps;
}

/** @param {number} h @param {number} carry @returns {number} */
function advance(h, carry) {
  return (Math.imul(h, A32) + carry) >>> 0;
}

/**
 * Both source-era byte consumers are exact integer arithmetic. The 255 case
 * evaluates floor(255 * (high*2^16+low)/2^48) without losing JS precision.
 * @param {number} high @param {number} low @param {255|256} scale
 * @returns {number}
 */
function byte(high, low, scale) {
  if (scale === 256) return high >>> 24;
  return Math.floor((high * 255 + Math.floor(low * 255 / 65536)) / MASK32);
}

/** @param {number} a @returns {number} */
function inverse32(a) {
  let x = 1;
  for (let i = 0; i < 5; i += 1) x = Math.imul(x, 2 - Math.imul(a, x));
  assert.equal(Math.imul(a, x) >>> 0, 1);
  return x >>> 0;
}
const INV_A32 = inverse32(A32);

/**
 * @param {number} firstByte @param {number} low1 @param {255|256} scale
 * @returns {[number,number]} Full candidate interval, upper end exclusive.
 */
function possibleHigh1(firstByte, low1, scale) {
  if (scale === 256) return [firstByte * 16777216, (firstByte + 1) * 16777216];
  const correction = Math.floor(low1 * 255 / 65536);
  const lo = Math.max(0, Math.ceil((firstByte * MASK32 - correction) / 255));
  const hi = Math.min(MASK32, Math.ceil(((firstByte + 1) * MASK32 - correction) / 255));
  return [lo, hi];
}

/**
 * @param {number} seed @param {255|256} scale @param {number} count
 * @param {{low:number,carry:number}[]} steps
 * @returns {number[]}
 */
function generate(seed, scale, count, steps) {
  let h = seed >>> 0;
  const out = [];
  for (let i = 0; i < count; i += 1) {
    h = advance(h, steps[i].carry);
    out.push(byte(h, steps[i].low, scale));
  }
  return out;
}

/**
 * Enumerate every 32-bit srand48 seed once by reconstructing the first
 * high-state word instead of iterating guessed timestamps or keys.
 * @param {number[]} target Original byte stream or exact blind positive plant.
 * @param {255|256} scale
 * @param {{low:number,carry:number}[]} steps
 * @returns {{range:number,counters:number[],hits:{seed:number,high1:number}[]}}
 */
function solve(target, scale, steps) {
  const [from, to] = possibleHigh1(target[0], steps[0].low, scale);
  const counters = Array(9).fill(0);
  const hits = [];
  for (let start = from; start < to; start += 1) {
    let h = start;
    if (byte(h, steps[0].low, scale) !== target[0]) continue;
    counters[1] += 1;
    let matched = 1;
    for (let i = 1; i < target.length; i += 1) {
      h = advance(h, steps[i].carry);
      if (byte(h, steps[i].low, scale) !== target[i]) break;
      matched += 1;
      if (matched <= 8) counters[matched] += 1;
    }
    if (matched === target.length) {
      const seed = Math.imul((start - steps[0].carry) >>> 0, INV_A32) >>> 0;
      hits.push({ seed, high1: start });
    }
  }
  return { range: to - from, counters, hits };
}

/** @returns {void} */
function main() {
  const source = JSON.parse(readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
  assert.equal(source.byte_rows.length, 32);
  assert(source.byte_rows.every((r) => r.length === 8));
  const values = source.byte_rows.flat();
  assert(values.every((x) => Number.isInteger(x) && x >= 0 && x <= 255));
  const digest = createHash('sha256').update(Buffer.from(values)).digest('hex');
  assert.equal(digest, EXPECTED_SHA);
  assert.deepEqual(values.slice(0, 8), [203, 231, 167, 186, 97, 237, 126, 183]);

  const steps = lcgSteps(256);
  assert.deepEqual(generate(1389060782, 256, 8, steps), [3, 0, 170, 175, 27, 131, 197, 178]);

  const outcomes = [];
  for (const scale of [256, 255]) {
    const original = solve(values, scale, steps);
    const plantedSeed = 0x12345678;
    const planted = solve(generate(plantedSeed, scale, 256, steps), scale, steps);
    assert.equal(original.hits.length, 0);
    assert.deepEqual(planted.hits.map((v) => v.seed), [plantedSeed]);
    assert.equal(planted.counters[8], 1);
    outcomes.push({ scale, candidatesAfterFirstByte: original.counters[1],
      matches2to8: original.counters.slice(2), full256: original.hits,
      plantedRecovered: planted.hits.map((v) => v.seed) });
  }
  console.log(JSON.stringify({ originalSha256: digest, originalFirst8: values.slice(0, 8),
    source: 'literal 32x8 row-major base60 bytes, original pp49-51',
    model: 'POSIX srand48 32-bit seed, int(drand48()*255 or *256) direct bytes',
    domain: 'every uint32 seed, exactly once, via invertible first high-state word',
    outcomes }, null, 2));
}

main();
