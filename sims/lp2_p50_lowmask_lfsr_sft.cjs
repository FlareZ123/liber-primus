'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const GRID = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const NULL_SAMPLES = 20000;
const NULL_SEED = 0x1518;

/**
 * Return the minimal GF(2) linear recurrence via Berlekamp-Massey.
 * The result satisfies s[n] = sum(coeffs[i] * s[n-i]) for i=1..L.
 * @param {number[]} bits
 * @returns {{L: number, coeffs: number[]}}
 */
function berlekampMassey(bits) {
  const n = bits.length;
  const c = Array(n).fill(0);
  const b = Array(n).fill(0);
  c[0] = 1;
  b[0] = 1;
  let L = 0;
  let m = -1;

  for (let N = 0; N < n; N += 1) {
    let d = bits[N];
    for (let i = 1; i <= L; i += 1) d ^= c[i] & bits[N - i];
    if (d === 0) continue;

    const t = c.slice();
    const shift = N - m;
    for (let j = 0; j + shift < n; j += 1) c[j + shift] ^= b[j];
    if (2 * L <= N) {
      L = N + 1 - L;
      for (let j = 0; j < n; j += 1) b[j] = t[j];
      m = N;
    }
  }

  return {L, coeffs: c.slice(0, L + 1)};
}

/**
 * Extend a prefix using one frozen GF(2) recurrence.
 * @param {number[]} prefix
 * @param {number[]} coeffs
 * @param {number} count
 * @returns {number[]}
 */
function predict(prefix, coeffs, count) {
  const L = coeffs.length - 1;
  const out = prefix.slice();
  for (let n = prefix.length; n < prefix.length + count; n += 1) {
    let bit = 0;
    for (let i = 1; i <= L; i += 1) bit ^= coeffs[i] & out[n - i];
    out.push(bit);
  }
  return out.slice(prefix.length);
}

/** @param {number} seed @returns {() => number} */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Uniformly sample a 256-bit mask with exactly 60 ones.
 * @param {() => number} rng
 * @returns {number[]}
 */
function exact60Mask(rng) {
  const idx = Array.from({length: 256}, (_, i) => i);
  for (let i = 0; i < 60; i += 1) {
    const j = i + Math.floor(rng() * (256 - i));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const bits = Array(256).fill(0);
  for (let i = 0; i < 60; i += 1) bits[idx[i]] = 1;
  return bits;
}

/** @param {number[]} xs @returns {number} */
function mean(xs) {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function main() {
  assert.strictEqual(GRID.bytes.length, 256);
  const source = GRID.bytes.map((value) => Number(value < 60));
  assert.strictEqual(source.reduce((a, b) => a + b, 0), 60);
  assert.strictEqual(source.slice(0, 128).reduce((a, b) => a + b, 0), 31);
  assert.strictEqual(source.slice(128).reduce((a, b) => a + b, 0), 29);

  const full = berlekampMassey(source);
  const train = berlekampMassey(source.slice(0, 128));
  const heldoutPred = predict(source.slice(0, 128), train.coeffs, 128);
  const mismatches = heldoutPred.reduce((n, bit, i) => n + Number(bit !== source[128 + i]), 0);
  const firstMismatch = heldoutPred.findIndex((bit, i) => bit !== source[128 + i]) + 128;

  assert.strictEqual(full.L, 130);
  assert.strictEqual(train.L, 65);
  assert.strictEqual(mismatches, 61);
  assert.strictEqual(firstMismatch, 132);

  const rng = mulberry32(NULL_SEED);
  const fullL = [];
  const trainL = [];
  const heldoutErrors = [];
  let compactPrefixCount = 0;
  let exactHeldoutCount = 0;
  let fullAtLeastSource = 0;
  let errorAtMostSource = 0;

  for (let sample = 0; sample < NULL_SAMPLES; sample += 1) {
    const bits = exact60Mask(rng);
    const all = berlekampMassey(bits);
    const first = berlekampMassey(bits.slice(0, 128));
    const pred = predict(bits.slice(0, 128), first.coeffs, 128);
    const errors = pred.reduce((n, bit, i) => n + Number(bit !== bits[128 + i]), 0);

    fullL.push(all.L);
    trainL.push(first.L);
    heldoutErrors.push(errors);
    if (first.L <= 32) compactPrefixCount += 1;
    if (errors === 0) exactHeldoutCount += 1;
    if (all.L >= full.L) fullAtLeastSource += 1;
    if (errors <= mismatches) errorAtMostSource += 1;
  }

  const result = {
    source: {
      weight: 60,
      first128Weight: 31,
      last128Weight: 29,
      fullLinearComplexity: full.L,
      fullRecurrenceTapLags: full.coeffs.map((v, i) => (i > 0 && v ? i : null)).filter((v) => v !== null),
      first128LinearComplexity: train.L,
      first128RecurrenceTapLags: train.coeffs.map((v, i) => (i > 0 && v ? i : null)).filter((v) => v !== null),
      heldoutMismatches: mismatches,
      firstHeldoutMismatchIndex: firstMismatch,
      thresholdPass: full.L <= 32 && train.L <= 32 && mismatches === 0,
    },
    matchedExact60Null: {
      samples: NULL_SAMPLES,
      seed: `0x${NULL_SEED.toString(16)}`,
      fullLinearComplexityMean: mean(fullL),
      fullLinearComplexityMin: Math.min(...fullL),
      fullLinearComplexityMax: Math.max(...fullL),
      fullAtLeastSource,
      first128LinearComplexityMean: mean(trainL),
      first128LinearComplexityMin: Math.min(...trainL),
      first128LinearComplexityMax: Math.max(...trainL),
      first128AtMost32: compactPrefixCount,
      heldoutErrorMean: mean(heldoutErrors),
      heldoutErrorMin: Math.min(...heldoutErrors),
      heldoutErrorMax: Math.max(...heldoutErrors),
      heldoutErrorsAtMostSource: errorAtMostSource,
      exactHeldoutPredictions: exactHeldoutCount,
    },
  };

  console.log(JSON.stringify(result, null, 2));
  console.log('PASS lp2_p50_lowmask_lfsr_sft');
}

main();
