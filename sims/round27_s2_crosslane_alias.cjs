"use strict";
/**
 * Reproduce the published Round27 S1/S2 MT19937 seed collision using
 * both 120-rune selection and 240-rune extension. CommonJS, Node 22.
 *
 * Inputs: original LP2 GP corpus and frozen public Dukotah Round27
 * vectors/quadgram score, committed separately under resources/control.
 * Exact Python-2.7 MT init_by_array([seed]), random29, beam_w=64,
 * GP-to-Latin transliteration, 29-symbol keyskip consistency.
 *
 * Run: node sims/round27_s2_crosslane_alias.cjs
 * This is an original-ciphertext test, with no claimed unknown plaintext.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const ROOT = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pair = JSON.parse(read("resources/control/duko_round27_vectors.json"));
const exact = JSON.parse(read("resources/control/duko_round27_vectors_s2.json"));
const C = corpus.pages[0].indices.slice(0, 240);
const ALPHABET = corpus.translit;
const SKIP_CANDIDATE = 35563892;
const RECORD = "AGHPOPOGPDGMUTHDXGXBEAFGYANTTOMJBETTLORAEAUPXLIABAEXHNGYOURNGNTNTHTHFROLLDMEOTGNNEAATDIESFODAFRILCMXPATINGTHINGAEDTTOEIAICTUNCEODURALMTIAIAJSAEAEPEALPPEOCDEOLXXXGRFAEARJWGJYARIRJDGXDIAGBOLHFBOEUOUEOCU";
assert.equal(C.length, 240);
assert.equal(ALPHABET.length, 29);
assert.deepEqual(C, pair.ciphertext.C_HIT);
assert.deepEqual(C, exact.ciphertext.C_HIT);

const records = read("resources/control/duko_round27_english_quadgrams.txt")
  .trim().split(/\r?\n/).map(s => s.trim().split(/\s+/));
let total = 0;
for (const [quad, count] of records) {
  assert.match(quad, /^[A-Z]{4}$/);
  total += Number(count);
}
assert.equal(total, 7266795);
const scores = new Map(records.map(([quad, count]) =>
  [quad, Math.log10(Number(count) / total)]));
const floor = Math.log10(0.01 / total);

/** @param {number} seed @param {number} count @returns {number[]} */
function python27Random29(seed, count) {
  const N = 624;
  const mt = new Uint32Array(N);
  mt[0] = 19650218;
  for (let i = 1; i < N; i++)
    mt[i] = (Math.imul(1812433253, mt[i - 1] ^ (mt[i - 1] >>> 30)) + i) >>> 0;
  let i = 1;
  for (let k = N; k > 0; k--) {
    mt[i] = ((mt[i] ^ Math.imul(mt[i - 1] ^ (mt[i - 1] >>> 30), 1664525)) + seed) >>> 0;
    if (++i >= N) { mt[0] = mt[N - 1]; i = 1; }
  }
  for (let k = N - 1; k > 0; k--) {
    mt[i] = ((mt[i] ^ Math.imul(mt[i - 1] ^ (mt[i - 1] >>> 30), 1566083941)) - i) >>> 0;
    if (++i >= N) { mt[0] = mt[N - 1]; i = 1; }
  }
  mt[0] = 0x80000000;
  let idx = N;
  function u32() {
    if (idx === N) {
      for (let k = 0; k < N; k++) {
        const y = (mt[k] & 0x80000000) | (mt[(k + 1) % N] & 0x7fffffff);
        mt[k] = mt[(k + 397) % N] ^ (y >>> 1) ^ ((y & 1) ? 0x9908b0df : 0);
      }
      idx = 0;
    }
    let y = mt[idx++];
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;
    return y >>> 0;
  }
  return Array.from({length: count}, () => {
    const a = u32() >>> 5;
    const b = u32() >>> 6;
    return Math.floor((a * 67108864 + b) / 9007199254740992 * 29);
  });
}

/**
 * English Latin quadgram score of a decoded GP transliteration.
 * Append-only scoring mimics the exact historical scoring arithmetic.
 * @param {string} previous
 * @param {string} next
 * @returns {number}
 */
function newQuadScore(previous, next) {
  let addition = 0;
  const joined = previous + next;
  for (let k = Math.max(0, previous.length - 3); k < joined.length - 3; k++)
    addition += scores.get(joined.slice(k, k + 4)) ?? floor;
  return addition;
}

/**
 * Deterministic stable 64-beam GP decoder; pair=even skip, exact=single skip.
 * @param {number} seed
 * @param {"pair"|"exact"} mode
 * @param {number} count
 */
function beam(seed, mode, count) {
  assert.ok(count >= 1 && count <= C.length);
  const K = python27Random29(seed, 1600);
  const step = mode === "pair" ? 2 : 1;
  const maxSkip = mode === "pair" ? 8 : 3;
  const p0 = (C[0] - K[0] + 29) % 29;
  let current = [{score: 0, ptr: 0, plain: [p0], letters: ALPHABET[p0]}];
  for (let t = 1; t < count; t++) {
    const next = [];
    const delta = (C[t] - C[t - 1] + 29) % 29;
    for (const state of current) {
      for (let skipped = 0; skipped <= maxSkip; skipped += step) {
        const ptr = state.ptr + 1 + skipped;
        if (ptr >= K.length) continue;
        const needed = (K[ptr] - delta + 29) % 29;
        let legal = true;
        for (let j = state.ptr + 1; j < ptr; j += step) {
          if (K[j] !== needed) { legal = false; break; }
        }
        if (!legal) continue;
        const p = (C[t] - K[ptr] + 29) % 29;
        const letters = state.letters + ALPHABET[p];
        next.push({
          score: state.score + newQuadScore(state.letters, ALPHABET[p]),
          ptr,
          plain: [...state.plain, p],
          letters,
        });
      }
    }
    next.sort((a, b) => b.score - a.score);
    current = next.slice(0, 64);
    assert.ok(current.length, "Lost all beam states");
  }
  const winner = current[0];
  return {
    seed, mode, count, ptr_end: winner.ptr,
    n_skips: winner.ptr - (count - 1),
    nchars: winner.letters.length,
    plain_idx: winner.plain,
    latin: winner.letters,
    quadScore: winner.score / Math.max(1, winner.letters.length - 3),
  };
}

function referenceWindowScores() {
  const source = read("resources/control/shakespeare_first300k.txt")
    .slice(100000, 240000).replace(/[^A-Za-z]/g, "").toUpperCase();
  const scoresOut = [];
  for (let i = 0; i < 40; i++) {
    const window = source.slice(i * 1000, i * 1000 + 285);
    assert.equal(window.length, 285);
    let sum = 0;
    for (let j = 0; j < window.length - 3; j++)
      sum += scores.get(window.slice(j, j + 4)) ?? floor;
    scoresOut.push(sum / (window.length - 3));
  }
  scoresOut.sort((a, b) => a - b);
  return {windows: scoresOut.length, minimum: scoresOut[0],
    median: scoresOut[20], maximum: scoresOut.at(-1)};
}

function main() {
  for (const dataset of [pair, exact]) {
    assert.equal(dataset.seed_vectors.length, 64);
    for (const fixture of dataset.seed_vectors) {
      assert.deepEqual(python27Random29(fixture.seed, 128), fixture.ks128);
      const output = beam(fixture.seed, dataset === pair ? "pair" : "exact", 120);
      assert.deepEqual(output.plain_idx, fixture.plain_idx);
      assert.equal(output.ptr_end, fixture.ptr_end);
      assert.equal(output.n_skips, fixture.n_skips);
      assert.equal(output.nchars, fixture.nchars);
      assert.ok(Math.abs(output.quadScore - Number(fixture.beam_score)) < 1e-8);
    }
  }
  const p120 = beam(SKIP_CANDIDATE, "pair", 120);
  const e120 = beam(SKIP_CANDIDATE, "exact", 120);
  assert.deepEqual(p120.plain_idx, e120.plain_idx);
  assert.equal(p120.n_skips, 0);
  assert.equal(e120.n_skips, 0);
  assert.equal(p120.ptr_end, 119);
  const p240 = beam(SKIP_CANDIDATE, "pair", 240);
  const e240 = beam(SKIP_CANDIDATE, "exact", 240);
  assert.equal(p240.latin.slice(0, 200), RECORD);
  assert.equal(p240.ptr_end, 247);
  assert.equal(e240.ptr_end, 242);
  assert.ok(Math.abs(p120.quadScore + 6.651765433100071) < 1e-9);
  assert.ok(Math.abs(p240.quadScore + 7.293556451182586) < 1e-9);
  assert.ok(Math.abs(e240.quadScore + 7.089972139497329) < 1e-9);
  const source = referenceWindowScores();
  assert.ok(source.maximum > e240.quadScore);
  return {
    classification: "Exact historical score/inverse reproduction; cross-lane seed alias; no unknown LP2 decryption",
    original: {physicalPage: 0, totalRunes: corpus.pages[0].indices.length, testedRunes: 240},
    sourceFixtures: {pair: 64, exact: 64, streamVectors: 128, beamPathsVerified: 128},
    crosslane: {seed: SKIP_CANDIDATE, first120Identical: true, pmaxHistorical: 7.6707232992600876,
      zeroSkipFirst120: true, pair120: {ptr: p120.ptr_end, quadScore: p120.quadScore},
      exact120: {ptr: e120.ptr_end, quadScore: e120.quadScore}},
    extended240: {
      pair: {ptr: p240.ptr_end, skipCount: p240.n_skips, quadScorePerLatinChar: p240.quadScore,
        latinPrefix200: p240.latin.slice(0, 200)},
      exact: {ptr: e240.ptr_end, skipCount: e240.n_skips, quadScorePerLatinChar: e240.quadScore,
        latinTransliteration: e240.latin},
    },
    heldoutNativeLatinQuadReference: source,
    limitations: "The original nine-register GP-trigram panel is not stored with the published repo; these exact beam-path and English-quadgram comparisons do not reproduce the S2 stage-B pmax. A complete independent S2 adjudication must reconstruct that panel."
  };
}
if (require.main === module) console.log(JSON.stringify(main(), null, 2));
module.exports = {python27Random29, beam, main};
