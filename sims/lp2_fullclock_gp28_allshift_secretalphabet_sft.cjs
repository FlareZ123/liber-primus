"use strict";

/**
 * Full-rune-clock complement of the nonzero-event-clock GP28 arbitrary
 * secret-alphabet key-reuse experiment. Full clock advances even when
 * ciphertext C[i] equals preceding C[i-1] (a reserved plaintext EA).
 *
 * Windows/Node 22 standalone:
 * node sims/lp2_fullclock_gp28_allshift_secretalphabet_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {originals} =
  require("./lp2_nonzero_step_allshift_sharedpad_sft.cjs");
const {nativeGP} = require("./lp2_allshift_ninebody_sharedpad_sft.cjs");

const ROOT = path.join(__dirname, "..");
const M = 28;
const MIN_OVERLAP = 256;
const EXPECT_LENGTHS = [728, 1144, 1728, 1902, 1020, 1432, 1679, 3007, 307];
const EXPECT_RANK_COUNT = 12861;
const EXPECT_ZERO_COUNT = 86;

/**
 * 28 ranks for all nonzero adjacent GP29 differences; sentinel 28 for
 * original adjacent equalities. Retain every full-rune clock tick.
 * @param {number[]} original
 * @returns {number[]}
 */
function fullClock(original) {
  return original.slice(1).map((x, i) => {
    const d = (x - original[i] + 29) % 29;
    return d === 0 ? 28 : d - 1;
  });
}

/**
 * Exhaust every relative chapter offset with >=256 nominal ticks, and
 * compare only times when both ciphertexts have nonzero transitions.
 * At correct shared key offset, equality of encrypted ranks necessarily
 * equals equality of plaintext GP28 symbols for arbitrary secret
 * position-dependent 28! bijections.
 * @param {number[][]} tapes
 * @returns {{z:number,a:number,b:number,delta:number,overlap:number,valid:number,hits:number,shifts:number}}
 */
function scan(tapes) {
  let best = {z: -Infinity, a: -1, b: -1, delta: 0,
    overlap: 0, valid: 0, hits: 0, shifts: 0};
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
        let hits = 0, valid = 0;
        for (let i = 0; i < n; i++) {
          const x = A[ia + i], y = B[ib + i];
          if (x === 28 || y === 28) continue;
          valid++;
          if (x === y) hits++;
        }
        if (valid < MIN_OVERLAP) continue;
        const z = (hits - valid / M) / Math.sqrt(valid * 27 / 784);
        if (z > best.z) {
          best = {z, a, b, delta, overlap: n, valid, hits, shifts: 0};
        }
      }
    }
  }
  best.shifts = shifts;
  return best;
}

/** @param {number} seed @returns {()=>number} */
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
 * Keep all source local repetitions, 86 real doublets, page layouts and
 * whole-chapter counts, but independently relabel nonzero ranks by one
 * secret, chapter-specific bijection.
 * @param {number[][]} tapes
 * @param {()=>number} draw
 * @returns {number[][]}
 */
function control(tapes, draw) {
  return tapes.map((s) => {
    const p = Array.from({length: M}, (_, i) => i);
    for (let i = M - 1; i > 0; i--) {
      const j = draw() % (i + 1);
      [p[i], p[j]] = [p[j], p[i]];
    }
    return s.map((x) => x === 28 ? 28 : p[x]);
  });
}

/**
 * Full-length actual GP-English positive with a different random bijection
 * f[t] at each of 4,000 consecutive full-clock positions. Every original
 * doublet is reserved as plaintext EA and CONSUMES a key clock position.
 * A fresh chapter pointer shift is used for all nine chapters.
 *
 * @param {number[][]} bodies
 * @returns {{offsets:number[],best:ReturnType<typeof scan>,tokens:number,zeros:number}}
 */
function planted(bodies) {
  const reference = fs.readFileSync(path.join(ROOT, "resources", "control",
    "gibran_prophet_58585.txt"), "utf8");
  const native = nativeGP(reference).filter((x) => x !== 28);
  assert.equal(native.length, 62508);
  const draw = random(0x33015577);
  const maps = Array.from({length: 4000}, () => {
    const p = Array.from({length: M}, (_, i) => i);
    for (let i = M - 1; i > 0; i--) {
      const j = draw() % (i + 1);
      [p[i], p[j]] = [p[j], p[i]];
    }
    return p;
  });
  let cursor = 300, zeros = 0, tokens = 0;
  const offsets = [], ciphertextTapes = [];
  for (const body of bodies) {
    const authenticZero = fullClock(body).map((x) => x === 28);
    const count = authenticZero.filter((x) => !x).length;
    const plaintext = native.slice(cursor, cursor + count);
    assert.equal(plaintext.length, count);
    cursor += count + 100;
    const offset = draw() % 200;
    offsets.push(offset);
    const ciphertext = [body[0]];
    const inverse = [];
    let t = 0;
    for (let i = 0; i < authenticZero.length; i++) {
      if (authenticZero[i]) {
        ciphertext.push(ciphertext.at(-1));
        inverse.push(28);
        zeros++;
      } else {
        const encryptedRank = maps[i + offset][plaintext[t]];
        ciphertext.push((ciphertext.at(-1) + encryptedRank + 1) % 29);
        let recovered = -1;
        for (let k = 0; k < M; k++) {
          if (maps[i + offset][k] === encryptedRank) {
            recovered = k;
            break;
          }
        }
        assert.equal(recovered, plaintext[t]);
        inverse.push(recovered);
        t++;
        tokens++;
      }
    }
    assert.equal(t, count);
    assert.deepEqual(inverse.filter((x) => x !== 28), plaintext);
    const expected = fullClock(ciphertext);
    assert.deepEqual(expected.map((x) => x === 28), authenticZero);
    ciphertextTapes.push(expected);
  }
  assert.equal(zeros, EXPECT_ZERO_COUNT);
  assert.equal(tokens, EXPECT_RANK_COUNT);
  const best = scan(ciphertextTapes);
  assert.equal(best.delta, offsets[best.b] - offsets[best.a]);
  assert.ok(best.z > 7);
  return {offsets, best, tokens, zeros};
}

/** Unchanged original runes plus complete calibrated null and English plants. */
function main() {
  const bodies = originals();
  const tapes = bodies.map(fullClock);
  assert.deepEqual(tapes.map((x) => x.length), EXPECT_LENGTHS);
  assert.equal(tapes.flat().filter((x) => x === 28).length, EXPECT_ZERO_COUNT);
  assert.equal(tapes.flat().filter((x) => x !== 28).length, EXPECT_RANK_COUNT);
  const original = scan(tapes);
  assert.deepEqual([original.a, original.b, original.delta,
    original.overlap, original.valid, original.hits, original.shifts],
  [1, 6, 391, 753, 699, 48, 85180]);
  assert.ok(Math.abs(original.z - 4.695039438242998) < 1e-11);
  const draw = random(0x33011199);
  const nulls = Array.from({length: 10}, () => scan(control(tapes, draw)));
  assert.equal(nulls.filter((x) => x.z >= original.z).length, 10);
  const positive = planted(bodies);
  assert.deepEqual([positive.best.a, positive.best.b,
    positive.best.delta, positive.best.overlap,
    positive.best.valid, positive.best.hits],
  [3, 7, 37, 1865, 1842, 125]);
  assert.ok(Math.abs(positive.best.z - 7.434603831920843) < 1e-11);
  process.stdout.write(JSON.stringify({
    source: "12,956 unmodified LP2 p0-55 runes, nine original chapters",
    interpretation: "GP28 nonzero predecessor rank, full-rune key clock",
    totalSourceRepeatedRuneEvents: EXPECT_ZERO_COUNT,
    original, controls: nulls.map((x) => x.z),
    matchedControlExceedances: 10,
    nativeNonlinearSharedPadPlant: positive,
    verdict: "no original GP28 shared alphabet signal under full-rune clock",
  }, null, 2) + "\n");
}

if (require.main === module) main();
module.exports = {fullClock, scan, planted};
