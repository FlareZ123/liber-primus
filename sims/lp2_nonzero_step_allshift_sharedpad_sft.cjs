"use strict";

/**
 * Source-led necessary-condition test for reusing one unrestricted 28-symbol
 * additive pad in nine visible LP2 chapters after undoing the no-repeat
 * ciphertext-step wrapper. Works for every relative body-pointer offset.
 *
 * Run: node sims/lp2_nonzero_step_allshift_sharedpad_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {nativeGP} = require("./lp2_allshift_ninebody_sharedpad_sft.cjs");

const ROOT = path.join(__dirname, "..");
const DATA = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const RANGES = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]];
const LENGTHS = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
const OVERLAP = 256;
const M = 28;
const POW15 = Array.from({length: M}, () => 0);
const LOG15 = Array(29).fill(-1);
let power = 1;
for (let i = 0; i < M; i++) {
  POW15[i] = power;
  LOG15[power] = i;
  power = power * 15 % 29;
}
assert.equal(power, 1);
assert.ok(LOG15.slice(1).every((x) => x >= 0));

/** @returns {number[][]} Original physical-page contents in nine visual chapters. */
function originals() {
  const b = RANGES.map(([a, z]) =>
    DATA.pages.slice(a, z + 1).flatMap((p) => p.indices));
  assert.deepEqual(b.map((x) => x.length), LENGTHS);
  assert.equal(b.flat().length, 12956);
  return b;
}

/**
 * Nonzero change C[i]-C[i-1] determines an invertible 28-symbol rank;
 * exact zero step is a reserved, observable event and consumes no key.
 * @param {number[]} ciphertext
 * @param {"sorted"|"log15"} mode
 * @returns {{rank:number[],zeroPositions:number[]}}
 */
function rankStream(ciphertext, mode) {
  const rank = [];
  const zeroPositions = [];
  for (let i = 1; i < ciphertext.length; i++) {
    const d = (ciphertext[i] - ciphertext[i - 1] + 29) % 29;
    if (d === 0) zeroPositions.push(i);
    else rank.push(mode === "sorted" ? d - 1 : LOG15[d]);
  }
  return {rank, zeroPositions};
}

/**
 * Search all body pairs and every integer relative pointer displacement
 * retaining at least 256 nonzero-step observations, and optimize one
 * arbitrary per-pair mod-28 Caesar difference.
 *
 * A genuine reused pad cancels: R[a,t]-R[b,t+delta]
 *   = P[a,t]-P[b,t+delta]+constant mod28.
 *
 * @param {number[][]} streams
 * @returns {{z:number,a:number,b:number,delta:number,n:number,hits:number,diff:number,shifts:number}}
 */
function scan(streams) {
  let best = {z: -Infinity, a: -1, b: -1, delta: 0,
    n: 0, hits: 0, diff: 0, shifts: 0};
  let shifts = 0;
  for (let a = 0; a < streams.length; a++) {
    for (let b = a + 1; b < streams.length; b++) {
      const A = streams[a], B = streams[b];
      for (let delta = OVERLAP - B.length;
        delta <= A.length - OVERLAP; delta++) {
        const ia = Math.max(0, delta);
        const ib = Math.max(0, -delta);
        const n = Math.min(A.length - ia, B.length - ib);
        if (n < OVERLAP) continue;
        shifts++;
        const counts = new Int16Array(M);
        for (let k = 0; k < n; k++) {
          let d = A[ia + k] - B[ib + k];
          if (d < 0) d += M;
          counts[d]++;
        }
        let mode = 0;
        for (let k = 1; k < M; k++) {
          if (counts[k] > counts[mode]) mode = k;
        }
        const z = (counts[mode] - n / M) / Math.sqrt(n * 27 / 784);
        if (z > best.z) {
          best = {z, a, b, delta, n, hits: counts[mode], diff: mode,
            shifts: 0};
        }
      }
    }
  }
  best.shifts = shifts;
  return best;
}

/** @param {number} seed @returns {()=>number} Independent deterministic generator. */
function random(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}

/**
 * Fixed per-chapter relabeling keeps all observed zero-step positions,
 * exact rank inventories, and all rank same-symbol echoes.
 * @param {number[][]} streams
 * @param {()=>number} draw
 * @returns {number[][]}
 */
function relabel(streams, draw) {
  return streams.map((s) => {
    const permutation = Array.from({length: M}, (_, i) => i);
    for (let i = M - 1; i > 0; i--) {
      const j = draw() % (i + 1);
      [permutation[i], permutation[j]] =
        [permutation[j], permutation[i]];
    }
    return s.map((v) => permutation[v]);
  });
}

/**
 * Encrypt independent native-GP source under one random 4,000-value
 * shared pad, variable hidden per-chapter pad pointer and Caesar constant.
 * Reinsert precisely the original 86 source zero-step sites as reserved
 * symbol 28, and reconstruct complete 29-way ciphertext steps.
 *
 * @param {number[][]} shape
 * @param {"sorted"|"log15"} mode
 * @returns {{best:ReturnType<typeof scan>,offsets:number[],constants:number[],zeroes:number}}
 */
function nativePlant(shape, mode) {
  const text = fs.readFileSync(path.join(ROOT, "resources", "control",
    "gibran_prophet_58585.txt"), "utf8");
  const native = nativeGP(text).filter((x) => x !== 28);
  assert.equal(native.length, 62508);
  const draw = random(0x3301528);
  const pad = Array.from({length: 4000}, () => draw() % M);
  const offsets = [];
  const constants = [];
  const planted = [];
  let cursor = 300, totalZeroes = 0;
  for (const original of shape) {
    const model = rankStream(original, mode);
    const n = model.rank.length;
    const plaintext = native.slice(cursor, cursor + n);
    assert.equal(plaintext.length, n);
    cursor += n + 100;
    const offset = draw() % 200;
    const constant = draw() % M;
    offsets.push(offset);
    constants.push(constant);
    const zeros = new Set(model.zeroPositions);
    totalZeroes += zeros.size;
    const encrypted = [original[0]];
    let t = 0;
    for (let i = 1; i < original.length; i++) {
      if (zeros.has(i)) {
        encrypted.push(encrypted[i - 1]);
        continue;
      }
      const rank = (plaintext[t] + pad[t + offset] + constant) % M;
      const d = mode === "sorted" ? rank + 1 : POW15[rank];
      encrypted.push((encrypted[i - 1] + d) % 29);
      t++;
    }
    assert.equal(t, n);
    const recoveredSteps = rankStream(encrypted, mode);
    assert.deepEqual(recoveredSteps.zeroPositions, model.zeroPositions);
    for (let i = 0; i < n; i++) {
      const restored = (recoveredSteps.rank[i] -
        pad[i + offset] - constant + 56) % M;
      assert.equal(restored, plaintext[i]);
    }
    planted.push(recoveredSteps.rank);
  }
  assert.equal(totalZeroes, 86);
  const best = scan(planted);
  assert.equal(best.delta, offsets[best.b] - offsets[best.a]);
  assert.equal(best.diff,
    (constants[best.a] - constants[best.b] + M) % M);
  assert.ok(best.z >= 9.5);
  return {best, offsets, constants, zeroes: totalZeroes};
}

/** Exact original checks, full-maximum matched null, and independent plants. */
function main() {
  const shape = originals();
  const out = {};
  for (const mode of ["sorted", "log15"]) {
    const streams = shape.map((b) => rankStream(b, mode).rank);
    assert.deepEqual(streams.map((s) => s.length),
      [724, 1138, 1719, 1892, 1009, 1419, 1667, 2989, 304]);
    const original = scan(streams);
    assert.equal(original.shifts, 84492);
    const expected = mode === "sorted"
      ? [2, 8, 488, 304, 30, 18, 5.916244528223862]
      : [2, 4, -463, 546, 44, 19, 5.649967013661283];
    assert.deepEqual([original.a, original.b, original.delta,
      original.n, original.hits, original.diff], expected.slice(0, 6));
    assert.ok(Math.abs(original.z - expected[6]) < 1e-10);
    const draw = random(mode === "sorted" ? 0x33012828 : 0x33011515);
    const controls = Array.from({length: 8}, () => scan(relabel(streams, draw)));
    const exceedances = controls.filter((x) => x.z >= original.z).length;
    assert.equal(exceedances, mode === "sorted" ? 3 : 5);
    out[mode] = {
      original, controls: controls.map((x) => x.z),
      exceedances, numberOfControls: controls.length,
      empiricalUpperTail: (exceedances + 1) / (controls.length + 1),
      genuineReusedPadPlant: nativePlant(shape, mode),
    };
  }
  process.stdout.write(JSON.stringify({
    source: "original LP2 55 rune-bearing unsolved pages",
    originalRunes: 12956, physicalChapters: 9,
    sourceZeroStepEvents: 86, originalPairShiftCount: 84492,
    sourceRegister: "nonzero GF29 predecessor steps, key on GP28 ranks",
    outcome: "no authentic unknown plaintext, key, or pad reuse found",
    modes: out,
  }, null, 2) + "\n");
}

if (require.main === module) main();
module.exports = {originals, rankStream, scan, relabel, nativePlant};
