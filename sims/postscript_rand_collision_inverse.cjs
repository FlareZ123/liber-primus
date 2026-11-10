"use strict";
/**
 * Original LP2 source-constrained inverse for Ghostscript/PostScript rand.
 *
 * Ghostscript's PostScript zrand implementation (9.27 source and newer)
 * uses Park–Miller x[n+1]=16807*x[n] mod (2^31-1), with initial seed 1.
 * The independent source-artifact analysis traces the LP2 PDF rendering
 * profile to Ghostscript 9.05–9.14. Rendering does not prove that the
 * manuscript ciphertext used PostScript rand, so this is a hypothesis.
 *
 * This program scores 8 genuine, disjoint 300-rune source windows with a
 * lossless one-rejection-per-rune inverse. A rejected key is legal only if
 * it would emit the previous observed ciphertext rune for the same
 * plaintext symbol. The state path is Viterbi-optimized under a reference
 * GP trigram LM. All source seeds are pre-specified. Planted controls
 * use independently held-out GP English and the identical cipher path.
 *
 * Node 22 CommonJS, built-in libraries only; no file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { originalBodies } = require("./grid_stream_collision_viterbi.cjs");
const { encode, train } = require("./grid_keyskip_viterbi.cjs");
const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const MOD = 29, M = 2147483647, CAP = 25, WIDTH = 300, TRAIN = 150;
const PENALTY = Math.log(29);
const SEEDS = [1, 331, 662, 1033, 3301];
const SETTINGS = SEEDS.flatMap(seed =>
  ["mod", "scale"].flatMap(reducer =>
    [-1, 1].map(sign => ({ seed, reducer, sign }))));
const mod = (n, m = MOD) => (n % m + m) % m;

/** PostScript srand values are integers 1..2^31-2. */
function postscriptRand(seed, size, reducer = "mod") {
  let state = mod(seed, M - 1) + 1;
  const output = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    state = (state * 16807) % M;
    output[i] = reducer === "mod" ? state % MOD :
      Math.floor(state * MOD / M);
  }
  return output;
}

/** Dynamic program over the cumulative source-key collision skips. */
function viterbi(cipher, key, sign, model, from = 0, frozen = null, wantText = false) {
  const n = cipher.length, W = (CAP + 1) * 2;
  assert.ok(n >= 3 && key.length >= n + CAP + 1);
  const decode = (i, e) => mod(cipher[i] - sign * key[i + e]);
  let scores = new Float64Array(W).fill(-Infinity);
  const back = wantText ? new Int16Array(W * n).fill(-1) : null;
  if (from === 0) {
    const p0 = decode(0, 0);
    for (let skip = 0; skip <= 1; skip++) {
      const p1 = decode(1, skip);
      if (skip && mod(p1 + sign * key[1]) !== cipher[0]) continue;
      scores[skip * 2 + skip] = model.unigram[p0] +
        model.bigram[p0 * MOD + p1] - PENALTY * skip;
    }
  } else {
    assert.ok(Number.isInteger(frozen) && frozen >= 0 && frozen < W);
    scores[frozen] = 0;
  }
  for (let i = from === 0 ? 2 : from; i < n; i++) {
    const next = new Float64Array(W).fill(-Infinity);
    for (let e = 0; e <= CAP; e++) for (let prevSkip = 0; prevSkip <= 1; prevSkip++) {
      const oldState = 2 * e + prevSkip, score = scores[oldState];
      if (!Number.isFinite(score) || e < prevSkip) continue;
      const p2 = decode(i - 2, e - prevSkip);
      const p1 = decode(i - 1, e);
      for (let skip = 0; skip <= 1 && e + skip <= CAP; skip++) {
        const enew = e + skip, p = decode(i, enew);
        if (skip && mod(p + sign * key[i + e]) !== cipher[i - 1]) continue;
        const dst = 2 * enew + skip;
        const nextScore = score +
          model.trigram[(p2 * MOD + p1) * MOD + p] - PENALTY * skip;
        if (nextScore > next[dst]) {
          next[dst] = nextScore;
          if (back) back[i * W + dst] = oldState;
        }
      }
    }
    scores = next;
  }
  let best = -Infinity, state = -1;
  for (let s = 0; s < W; s++) if (scores[s] > best) {
    best = scores[s]; state = s;
  }
  assert.ok(Number.isFinite(best), "Viterbi has no legal path");
  const result = { score: best, state, inferredSkips: Math.floor(state / 2) };
  if (wantText) {
    const output = new Array(n);
    let at = state;
    for (let i = n - 1; i >= 1; i--) {
      output[i] = decode(i, Math.floor(at / 2));
      if (i > 1) {
        at = back[i * W + at];
        assert.ok(at >= 0, "Traceback failure");
      }
    }
    output[0] = decode(0, 0);
    result.plaintext = output;
  }
  return result;
}

/** Synthetic, exact inverse-positive source with collision-rejected draws. */
function plant(plain, key, sign) {
  const out = [];
  let j = 0, prior = -1, skipped = 0;
  for (const p of plain) {
    let c = mod(p + sign * key[j]);
    if (prior >= 0 && c === prior) {
      j++;
      c = mod(p + sign * key[j]);
      skipped++;
    }
    out.push(c);
    prior = c;
    j++;
  }
  return { ciphertext: out, trueSkips: skipped };
}

/** Train on half, evaluate the untouched second half at the frozen state. */
function evaluate(bodies, lm, candidate, wantText = false) {
  const key = postscriptRand(candidate.seed, WIDTH + CAP + 2, candidate.reducer);
  const trainRows = bodies.map(c =>
    viterbi(c.slice(0, TRAIN), key, candidate.sign, lm));
  const testRows = bodies.map((c, i) =>
    viterbi(c, key, candidate.sign, lm, TRAIN, trainRows[i].state));
  const value = {
    ...candidate,
    train: trainRows.reduce((s, x) => s + x.score, 0) / (TRAIN * bodies.length),
    heldout: testRows.reduce((s, x) => s + x.score, 0) /
      ((WIDTH - TRAIN) * bodies.length),
    skips: trainRows.map(x => x.inferredSkips),
  };
  if (wantText) value.sample = bodies.map(c =>
    viterbi(c, key, candidate.sign, lm, 0, null, true).plaintext.slice(0, 80));
  return value;
}

function run() {
  const original = originalBodies();
  assert.deepEqual(original.map(x => x.length), Array(8).fill(WIDTH));
  const shakespeare = read("resources/control/shakespeare_first300k.txt");
  const lm = train(shakespeare.slice(0, 200000));
  const target = encode(shakespeare.slice(220000));
  assert.ok(target.length >= 8 * WIDTH);
  const planted = Array.from({ length: 8 }, (_, i) =>
    plant(target.slice(i * WIDTH, (i + 1) * WIDTH),
      postscriptRand(1, WIDTH + CAP + 2, "mod"), 1));
  const plantedCipher = planted.map(x => x.ciphertext);
  const positiveTrue = evaluate(plantedCipher, lm,
    { seed: 1, reducer: "mod", sign: 1 }, true);
  const plantedDecoded = positiveTrue.sample.map((_, i) =>
    viterbi(plantedCipher[i],
      postscriptRand(1, WIDTH + CAP + 2, "mod"), 1, lm, 0, null, true).plaintext);
  const exact = plantedDecoded.reduce((s, x, i) =>
    s + x.filter((v, j) => v === target[i * WIDTH + j]).length, 0);
  assert.ok(exact >= 0.83 * 8 * WIDTH,
    "Correct PostScript seed is not identifiable from a true planted key");
  const plantedCandidates = SETTINGS.map(x => evaluate(plantedCipher, lm, x));
  plantedCandidates.sort((a, b) => b.train - a.train);
  const results = SETTINGS.map(x => evaluate(original, lm, x));
  results.sort((a, b) => b.train - a.train);
  const top = results[0];
  const full = evaluate(original, lm, top, true);
  const data = {
    generator: "Ghostscript/PostScript rand, Park–Miller multiplier 16807, M=2^31-1",
    reference: "https://sources.debian.org/src/ghostscript/9.27~dfsg-2+deb10u5/psi/zmath.c",
    sourceSeeds: SEEDS, reducers: ["mod", "scale"], signs: [-1, 1],
    sampledOriginalRunes: 8 * WIDTH, trainOriginalRunes: 8 * TRAIN,
    heldoutOriginalRunes: 8 * (WIDTH - TRAIN),
    plant: { trueKey: { seed: 1, reducer: "mod", sign: 1 },
      actualSkipped: planted.map(x => x.trueSkips),
      exactRecovered: exact, total: 8 * WIDTH, trueScore: positiveTrue.heldout,
      trainWinner: plantedCandidates[0], topThree: plantedCandidates.slice(0, 3) },
    real: { trainSelected: top, heldoutWinner: [...results].sort(
      (a, b) => b.heldout - a.heldout)[0],
      topFive: results.slice(0, 5),
      decodedStart: full.sample.map(x => x.map(v =>
        ["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X",
         "S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"][v]
      ).join("")) },
    interpretation: "A key is authentic only if original plaintext is linguistic with source-independent matching key and reproducible re-encryption."
  };
  console.log(JSON.stringify(data, null, 2));
  return data;
}
if (require.main === module) run();
module.exports = { postscriptRand, viterbi, plant, evaluate, run };
