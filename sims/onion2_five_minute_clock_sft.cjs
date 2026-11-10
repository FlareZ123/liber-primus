'use strict';

/**
 * Exact source-original historical-clock gate for the 2014 second onion.
 * Read-only: uses the repository's archived interval witnesses, not LP2 ciphertext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  const m = Math.min(k, n - k);
  let value = 1n;
  for (let i = 1; i <= m; i++) value = value * BigInt(n - i + 1) / BigInt(i);
  return value;
}

/** Exact uniform 1..maxDelay probability that the sum of n draws is <= maxSum.
 * @param {number} n @param {number} maxSum @param {number} maxDelay
 * @returns {{ favorable: bigint, total: bigint, probability: number }}
 */
function uniformLowerTail(n, maxSum, maxDelay) {
  let dp = Array(maxSum + 1).fill(0n);
  dp[0] = 1n;
  for (let i = 0; i < n; i++) {
    const next = Array(maxSum + 1).fill(0n);
    for (let s = i; s <= maxSum; s++) {
      const ways = dp[s];
      if (!ways) continue;
      for (let step = 1; step <= maxDelay && s + step <= maxSum; step++) {
        next[s + step] += ways;
      }
    }
    dp = next;
  }
  const favorable = dp.reduce((a, b) => a + b, 0n);
  const total = BigInt(maxDelay) ** BigInt(n);
  return { favorable, total, probability: Number(favorable) / Number(total) };
}

/** Exact conditional permutation tail for an a priori fixed earlier interval block.
 * All k values are held fixed; choose a uniformly random subset of earlySize cells.
 * @param {Map<number, number>} histogram
 * @param {number} earlySize
 * @param {number} earlySum
 * @returns {{ favorable: bigint, total: bigint, probability: number }}
 */
function permutationUpperTail(histogram, earlySize, earlySum) {
  const dp = Array.from({ length: earlySize + 1 }, () => new Map());
  dp[0].set(0, 1n);
  let states = dp;
  for (const [delay, count] of histogram) {
    const next = Array.from({ length: earlySize + 1 }, () => new Map());
    for (let used = 0; used <= earlySize; used++) {
      for (const [sum, ways] of states[used]) {
        for (let pick = 0; pick <= Math.min(count, earlySize - used); pick++) {
          const outSum = sum + pick * delay;
          const row = next[used + pick];
          row.set(outSum, (row.get(outSum) || 0n) + ways * choose(count, pick));
        }
      }
    }
    states = next;
  }
  const n = [...histogram.values()].reduce((a, b) => a + b, 0);
  const total = choose(n, earlySize);
  const all = [...states[earlySize].values()].reduce((a, b) => a + b, 0n);
  assert.equal(all, total, 'exact permutation mass must equal binomial count');
  const favorable = [...states[earlySize]].reduce((s, [sum, ways]) => s + (sum >= earlySum ? ways : 0n), 0n);
  return { favorable, total, probability: Number(favorable) / Number(total) };
}

function main() {
  const input = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'cicada2014-onion2-timing.json'), 'utf8'));
  const hex = input.final_hex;
  assert.equal(hex.length, 512);
  assert.equal(createHash('sha256').update(Buffer.from(hex, 'hex')).digest('hex'), input.final_bytes_sha256);
  const events = input.interval_cells.slice().sort((a, b) => a.pos - b.pos);
  assert.equal(events.length, 112);
  assert.deepEqual(events.map(x => x.pos), [...Array.from({length: 47}, (_, i) => i + 143), ...Array.from({length: 65}, (_, i) => i + 192)]);
  for (const x of events) {
    assert.equal(hex.slice((x.pos - 1) * 2, x.pos * 2), x.hex_byte);
    assert.ok(Number.isInteger(x.k_5min) && x.k_5min >= 1 && x.k_5min <= 7);
  }
  const sum = events.reduce((s, x) => s + x.k_5min, 0);
  assert.equal(sum, 234);
  const hist = new Map(Array.from({length: 7}, (_, i) => [i + 1, events.filter(x => x.k_5min === i + 1).length]));
  const early = events.filter(x => x.pos <= 182);
  const later = events.filter(x => x.pos >= 183);
  assert.equal(early.length, 40);
  assert.equal(later.length, 72);
  const earlySum = early.reduce((s, x) => s + x.k_5min, 0);
  const laterSum = later.reduce((s, x) => s + x.k_5min, 0);
  assert.equal(earlySum + laterSum, sum);
  assert.equal(earlySum, 99);
  const uniform = uniformLowerTail(events.length, sum, 7);
  const clockShift = permutationUpperTail(hist, early.length, earlySum);
  const p = events.length / sum;
  const expected = [events.length * p, events.length * p * (1-p), events.length * p * (1-p)**2, events.length * (1-p)**3];
  const observed = [hist.get(1), hist.get(2), hist.get(3), events.filter(x => x.k_5min >= 4).length];
  const chiSquare = expected.reduce((s, e, i) => s + (observed[i] - e)**2/e, 0);
  const geometricPApprox = Math.exp(-chiSquare / 2); // chi-square df=2, p fitted
  assert.equal(uniformLowerTail(2, 2, 2).probability, 0.25);
  assert.equal(permutationUpperTail(new Map([[1, 2], [2, 1]]), 1, 2).probability, 1/3);
  console.log(JSON.stringify({
    historicalSourceSHA256: input.final_bytes_sha256,
    intervals: events.length, sumFiveMinuteUnits: sum,
    histogram: Object.fromEntries(hist),
    uniformDelayOneToSeven: { exactLowerTail: uniform.probability, favorable: String(uniform.favorable), total: String(uniform.total) },
    fittedGeometric: { p, observedBins1_2_3_4plus: observed, expectedBins1_2_3_4plus: expected, chiSquare, chiSquareDf2ApproxP: geometricPApprox },
    fixedWitnessBoundary: { splitAfterPosition: 182, earlyN: early.length, earlySum, lateN: later.length, lateSum, earlyMean: earlySum/early.length, lateMean: laterSum/later.length, exactConditionalUpperTail: clockShift.probability, favorable: String(clockShift.favorable), total: String(clockShift.total) },
    remainingUnknown: 'Positions 1–142 have no interval data; positions 190–191 have an unobserved 30-minute joint interval.'
  }, null, 2));
}

if (require.main === module) main();
module.exports = { choose, uniformLowerTail, permutationUpperTail };
