'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));

const RADIX = 29;
const LIMIT = 2 ** 24;
const PACKET_RUNES = 75;
const PACKET_BYTES = 45;
const INTERIOR_BYTES = 43;
const TRIALS = 20000;
const SEED = 0x1525A25;
const EXPECTED_FRAME_HEX = '15023cbcedd14959802c8aee4d43d09b0ead8f8e12d2f139066f3e8892b6460c27a66059a2e9bc73106377502d';

/**
 * Deterministic 32-bit PRNG used by Director #1525.
 * @param {number} seed
 * @returns {() => number}
 */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * Draw an unbiased integer in [0, bound), exactly matching #1525.
 * @param {() => number} nextU32
 * @param {number} bound
 * @returns {number}
 */
function randomInt(nextU32, bound) {
  const range = 0x100000000;
  const limit = range - (range % bound);
  let x;
  do x = nextU32(); while (x >= limit);
  return x % bound;
}

/**
 * Consume the random draws that #1525 spends shuffling one page.
 * Values are irrelevant until p55 because Fisher-Yates draw bounds depend only on page length.
 * @param {number} length
 * @param {() => number} nextU32
 */
function consumeShuffle(length, nextU32) {
  for (let i = length - 1; i > 0; i -= 1) randomInt(nextU32, i + 1);
}

/**
 * Fisher-Yates shuffle a copy of one page.
 * @param {number[]} source
 * @param {() => number} nextU32
 * @returns {number[]}
 */
function shuffledPage(source, nextU32) {
  const out = source.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = randomInt(nextU32, i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Serialize the fixed p55 phase1 75-rune window to 45 low-24-bit bytes.
 * @param {number[]} page
 * @returns {number[]}
 */
function frameBytes(page) {
  assert.equal(page.length, 76);
  const bytes = [];
  for (let group = 0; group < 15; group += 1) {
    let value = 0;
    const start = 1 + group * 5;
    for (let j = 0; j < 5; j += 1) value = value * RADIX + page[start + j];
    const lower = value >= LIMIT ? value - LIMIT : value;
    bytes.push((lower >>> 16) & 255, (lower >>> 8) & 255, lower & 255);
  }
  assert.equal(bytes.length, PACKET_BYTES);
  return bytes;
}

/**
 * Compute the five frozen #1578 diagnostics on the 43-byte interior.
 * @param {number[]} frame
 * @returns {number[]}
 */
function diagnostics(frame) {
  const bytes = frame.slice(1, -1);
  assert.equal(bytes.length, INTERIOR_BYTES);
  const counts = Array(256).fill(0);
  let longest = 1;
  let current = 1;
  let printable = 0;
  let zero = 0;

  for (let i = 0; i < bytes.length; i += 1) {
    const b = bytes[i];
    counts[b] += 1;
    if (b >= 0x20 && b <= 0x7e) printable += 1;
    if (b === 0) zero += 1;
    if (i > 0 && b === bytes[i - 1]) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  let distinct = 0;
  let entropy = 0;
  for (const count of counts) {
    if (count === 0) continue;
    distinct += 1;
    const p = count / bytes.length;
    entropy -= p * Math.log2(p);
  }
  return [distinct, entropy, longest, printable, zero];
}

/**
 * Invert a small square matrix by Gauss-Jordan elimination.
 * @param {number[][]} input
 * @returns {number[][]}
 */
function invert(input) {
  const n = input.length;
  const a = input.map((row, i) => [
    ...row,
    ...Array.from({length: n}, (_, j) => Number(i === j)),
  ]);

  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
    }
    assert.ok(Math.abs(a[pivot][col]) > 1e-14);
    [a[col], a[pivot]] = [a[pivot], a[col]];

    const scale = a[col][col];
    for (let j = 0; j < 2 * n; j += 1) a[col][j] /= scale;
    for (let row = 0; row < n; row += 1) {
      if (row === col) continue;
      const factor = a[row][col];
      for (let j = 0; j < 2 * n; j += 1) a[row][j] -= factor * a[col][j];
    }
  }
  return a.map((row) => row.slice(n));
}

/**
 * Squared Mahalanobis distance.
 * @param {number[]} v
 * @param {number[]} mean
 * @param {number[][]} invCov
 * @returns {number}
 */
function mahalanobisSquared(v, mean, invCov) {
  const d = v.map((x, i) => x - mean[i]);
  let out = 0;
  for (let i = 0; i < d.length; i += 1) {
    for (let j = 0; j < d.length; j += 1) out += d[i] * invCov[i][j] * d[j];
  }
  return out;
}

function main() {
  const pages = corpus.pages.slice(0, 56).map((page) => page.indices);
  assert.equal(pages.length, 56);
  assert.equal(pages[55].length, 76);
  assert.equal(pages.reduce((sum, page) => sum + page.length, 0), 12956);

  const originalFrame = frameBytes(pages[55]);
  const frameHex = Buffer.from(originalFrame).toString('hex');
  assert.equal(frameHex, EXPECTED_FRAME_HEX);
  const original = diagnostics(originalFrame);
  assert.deepEqual(original.slice(0, 1), [41]);
  assert.ok(Math.abs(original[1] - 5.333241498888144) < 1e-12);
  assert.deepEqual(original.slice(2), [1, 17, 0]);

  const nextU32 = xorshift32(SEED);
  const samples = [];
  for (let trial = 0; trial < TRIALS; trial += 1) {
    for (let p = 0; p < 55; p += 1) consumeShuffle(pages[p].length, nextU32);
    const p55 = shuffledPage(pages[55], nextU32);
    samples.push(diagnostics(frameBytes(p55)));
  }

  const dim = original.length;
  const mean = Array(dim).fill(0);
  for (const v of samples) for (let j = 0; j < dim; j += 1) mean[j] += v[j] / TRIALS;

  const cov = Array.from({length: dim}, () => Array(dim).fill(0));
  for (const v of samples) {
    for (let i = 0; i < dim; i += 1) {
      for (let j = 0; j < dim; j += 1) {
        cov[i][j] += (v[i] - mean[i]) * (v[j] - mean[j]) / (TRIALS - 1);
      }
    }
  }
  const invCov = invert(cov);
  const originalD2 = mahalanobisSquared(original, mean, invCov);
  const nullD2 = samples.map((v) => mahalanobisSquared(v, mean, invCov));
  const jointTailCount = nullD2.filter((x) => x >= originalD2).length;

  const names = ['distinct', 'entropy', 'longestEqualRun', 'printableAscii', 'zeroBytes'];
  const marginals = Object.fromEntries(names.map((name, j) => {
    const values = samples.map((v) => v[j]);
    return [name, {
      original: original[j],
      mean: mean[j],
      min: Math.min(...values),
      max: Math.max(...values),
      lessOrEqual: values.filter((x) => x <= original[j]).length,
      greaterOrEqual: values.filter((x) => x >= original[j]).length,
      equal: values.filter((x) => x === original[j]).length,
    }];
  }));

  const exactVectorMatches = samples.filter((v) => v.every((x, j) => Math.abs(x - original[i]) < 1e-12)).length;

  const expectedMeans = [39.6469, 5.267157666326, 1.1505, 15.07975, 0.2035];
  for (let i = 0; i < expectedMeans.length; i += 1) {
    assert.ok(Math.abs(mean[i] - expectedMeans[i]) < 1e-11);
  }
  assert.ok(Math.abs(originalD2 - 1.310532534624) < 1e-9);
  assert.equal(jointTailCount, 16231);
  assert.equal(exactVectorMatches, 268);

  console.log(JSON.stringify({
    status: 'PASS',
    protocol: {
      issue: 1578,
      trials: TRIALS,
      seed: `0x${SEED.toString(16)}`,
      null: 'exact #1525 Fisher-Yates PRNG stream; earlier-page shuffle draws consumed; p55 shuffled identically',
      window: 'p55 phase1 only; same 75 runes -> 45 low24 bytes -> trim first and last byte',
      printableAscii: '0x20..0x7e inclusive',
      joint: 'empirical tail of squared Mahalanobis distance from five-feature null centroid',
    },
    originalFrameHex: frameHex,
    originalInteriorHex: frameHex.slice(2, -2),
    marginals,
    joint: {
      originalMahalanobisSquared: originalD2,
      nullAtLeastAsDistant: jointTailCount,
      empiricalTailRate: jointTailCount / TRIALS,
      exactFiveVectorMatches: exactVectorMatches,
    },
    conclusion: 'ordinary matched-null byte profile; byte appearance does not select a typed consumer',
  }, null, 2));
}

main();
