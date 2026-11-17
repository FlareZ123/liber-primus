"use strict";

/**
 * Key-independent necessary-condition test for all nonperiodic shared
 * position-wise 28-symbol substitution streams across nine LP2 chapters.
 *
 * Original at every nonzero source difference: d=(C[i]-C[i-1]) mod29,
 * rank=d-1 in 0..27; zero differences are skipped but site positions
 * are retained. Under any shared, secret, position-specific permutation
 * f_t of all 28 symbols, aligned encrypted symbols are equal iff their
 * unknown plaintext symbols are equal. No alphabet/key must be guessed.
 *
 * Windows/Node22: node sims/lp2_nonzero_step_allshift_allsecret_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {originals, rankStream} =
  require("./lp2_nonzero_step_allshift_sharedpad_sft.cjs");
const {nativeGP} = require("./lp2_allshift_ninebody_sharedpad_sft.cjs");

const ROOT = path.join(__dirname, "..");
const M = 28;
const MIN_OVERLAP = 256;
const ORIGINAL_LENGTHS = [724, 1138, 1719, 1892, 1009,
  1419, 1667, 2989, 304];
const TOTAL_SOURCE_ZEROES = 86;

/**
 * All pairs and all relative unknown key-pointer offsets that permit
 * 256 source rank values. The equality statistic is invariant under
 * arbitrary independently secret bijections at each key position.
 *
 * @param {number[][]} tapes
 * @returns {{z:number,a:number,b:number,delta:number,n:number,eq:number,shifts:number}}
 */
function scanEquality(tapes) {
  let best = {z: -Infinity, a: -1, b: -1, delta: 0,
    n: 0, eq: 0, shifts: 0};
  let shifts = 0;
  for (let a = 0; a < tapes.length; a++) {
    for (let b = a + 1; b < tapes.length; b++) {
      const A = tapes[a], B = tapes[b];
      for (let delta = MIN_OVERLAP - B.length;
        delta <= A.length - MIN_OVERLAP; delta++) {
        const ia = Math.max(0, delta);
        const ib = Math.max(0, -delta);
        const n = Math.min(A.length - ia, B.length - ib);
        if (n < MIN_OVERLAP) continue;
        shifts++;
        let eq = 0;
        for (let i = 0; i < n; i++) {
          if (A[ia + i] === B[ib + i]) eq++;
        }
        const z = (eq - n / M) / Math.sqrt(n * 27 / 784);
        if (z > best.z) {
          best = {z, a, b, delta, n, eq, shifts: 0};
        }
      }
    }
  }
  best.shifts = shifts;
  return best;
}

/** @param {number} seed @returns {()=>number} Fixed independent PRNG. */
function random(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * Permute each whole original chapter by a different alphabet relabeling.
 * Every original chapter-internal match/repetition/zero-step position is
 * kept, while a shared between-chapter key relation is disrupted.
 * @param {number[][]} tapes
 * @param {()=>number} draw
 * @returns {number[][]}
 */
function relabel(tapes, draw) {
  return tapes.map((a) => {
    const permutation = Array.from({length: M}, (_, i) => i);
    for (let i = M - 1; i > 0; i--) {
      const j = draw() % (i + 1);
      [permutation[i], permutation[j]] =
        [permutation[j], permutation[i]];
    }
    return a.map((r) => permutation[r]);
  });
}

/**
 * Independent genuinely native-GP English control, with different
 * key-pointer offsets and an arbitrary 28-symbol alphabet permutation
 * at each of 4,000 keystream positions. No additive key assumption.
 *
 * @param {number[][]} source
 * @returns {{best:ReturnType<typeof scanEquality>,offsets:number[],recoverable:number,zeroes:number}}
 */
function plantedNonlinear(source) {
  const reference = fs.readFileSync(path.join(ROOT, "resources",
    "control", "gibran_prophet_58585.txt"), "utf8");
  const native = nativeGP(reference).filter((x) => x !== 28);
  assert.equal(native.length, 62508);
  const draw = random(0x3301e4ab);
  const maps = Array.from({length: 4000}, () => {
    const p = Array.from({length: M}, (_, i) => i);
    for (let i = M - 1; i > 0; i--) {
      const j = draw() % (i + 1);
      [p[i], p[j]] = [p[j], p[i]];
    }
    return p;
  });
  let cursor = 300;
  const offsets = [];
  const planted = [];
  let recoverable = 0, zeroes = 0;
  for (const original of source) {
    const r = rankStream(original, "sorted");
    zeroes += r.zeroPositions.length;
    const n = r.rank.length;
    const plain = native.slice(cursor, cursor + n);
    assert.equal(plain.length, n);
    cursor += n + 100;
    const offset = draw() % 200;
    offsets.push(offset);
    const ranks = plain.map((x, i) => maps[offset + i][x]);
    const zeros = new Set(r.zeroPositions);
    const ciphertext = [original[0]];
    let t = 0;
    for (let i = 1; i < original.length; i++) {
      if (zeros.has(i)) {
        ciphertext.push(ciphertext[i - 1]);
      } else {
        ciphertext.push((ciphertext[i - 1] + ranks[t] + 1) % 29);
        t++;
      }
    }
    assert.equal(t, n);
    const recovered = rankStream(ciphertext, "sorted");
    assert.deepEqual(recovered.zeroPositions, r.zeroPositions);
    assert.deepEqual(recovered.rank, ranks);
    const inverseMaps = Array.from({length: n}, (_, i) => {
      const inv = Array(M);
      for (let k = 0; k < M; k++) {
        inv[maps[offset + i][k]] = k;
      }
      return inv;
    });
    assert.deepEqual(ranks.map((v, i) => inverseMaps[i][v]), plain);
    recoverable += n;
    planted.push(recovered.rank);
  }
  assert.equal(zeroes, TOTAL_SOURCE_ZEROES);
  assert.equal(recoverable, ORIGINAL_LENGTHS.reduce((a, b) => a + b, 0));
  const best = scanEquality(planted);
  assert.equal(best.delta, offsets[best.b] - offsets[best.a]);
  assert.ok(best.z >= 7.5);
  return {best, offsets, recoverable, zeroes};
}

function main() {
  const bodies = originals();
  const rankResults = bodies.map((b) => rankStream(b, "sorted"));
  const tapes = rankResults.map((r) => r.rank);
  assert.deepEqual(tapes.map((x) => x.length), ORIGINAL_LENGTHS);
  assert.equal(rankResults.reduce((n, r) =>
    n + r.zeroPositions.length, 0), TOTAL_SOURCE_ZEROES);
  const original = scanEquality(tapes);
  assert.equal(original.shifts, 84492);
  assert.deepEqual([original.a, original.b, original.delta,
    original.n, original.eq], [5, 7, -429, 1419, 83]);
  assert.ok(Math.abs(original.z - 4.623549370376567) < 1e-11);
  const draw = random(0x3301e41);
  const controls = Array.from({length: 12},
    () => scanEquality(relabel(tapes, draw)));
  const exceedances = controls.filter((o) => o.z >= original.z).length;
  assert.equal(exceedances, 11);
  const planted = plantedNonlinear(bodies);
  assert.deepEqual([planted.best.a, planted.best.b,
    planted.best.delta, planted.best.n, planted.best.eq],
  [2, 3, 25, 1694, 120]);
  assert.ok(Math.abs(planted.best.z - 7.789981243540761) < 1e-11);
  process.stdout.write(JSON.stringify({
    interpretation: "GP28 nonzero-ciphertext-step rank, 9 original chapters",
    originalUnknownRunes: 12956, originalZeroStepSites: 86,
    totalComparedAlignments: original.shifts,
    original,
    wholeScanNullMaxima: controls.map((o) => o.z),
    nullExceedances: exceedances,
    diagnosticAddOneUpperTail: (exceedances + 1) / (controls.length + 1),
    independentlyPlantedNonlinearKey: planted,
    outcome: "no original reused arbitrary shared position-wise alphabet signal",
  }, null, 2) + "\n");
}

if (require.main === module) main();
module.exports = {scanEquality, relabel, plantedNonlinear};
