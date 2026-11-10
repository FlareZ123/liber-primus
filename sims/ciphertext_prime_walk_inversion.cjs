"use strict";
/**
 * Source-indexed prime-totient running-key inverse with ciphertext-driven clock
 * and one latent collision-rejected prime draw per emitted ciphertext rune.
 *
 * Original source: p56 authentic K_j = (p_j - 1) mod29, p_j ordinary jth prime.
 * Proposed new state: after emitting C_i, advance prime ordinal by one of:
 * 1; one-based GP symbol index; GP prime weight; GP prime weight minus one.
 * Six fixed starts are drawn from source: 1, 15, 22, 53, 78, 79.
 * Both additive signs, same setting on all eight independent section bodies.
 *
 * An extra draw before emitting C_i is permitted only when its hypothetical
 * discarded output would exactly repeat observed C_(i-1). Its necessity is
 * checked algebraically from the published ciphertext, no plaintext guessing.
 * Viterbi over total discarded draws and preceding-bit state scores GP English.
 *
 * This is a reproducible hypothesis test, not an asserted Cicada cipher.
 * Exact source page/section starts are from the verified shared transcript.
 * Node 22 CommonJS. No external packages and no file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { originalBodies } = require("./grid_stream_collision_viterbi.cjs");
const { train, encode } = require("./grid_keyskip_viterbi.cjs");
const ROOT = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const CORPUS = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const RUNES = CORPUS.runes;
const MOD = 29, WIDTH = 300, TRAIN = 150, CAP = 26, PENALTY = 3.5;
const STARTS = [1, 15, 22, 53, 78, 79];
const RULES = ["one", "gp-index", "gp-prime", "gp-totient"];
const SETTINGS = RULES.flatMap(rule =>
  STARTS.flatMap(start => [-1, 1].map(sign => ({ rule, start, sign }))));
const mod = value => (value % MOD + MOD) % MOD;

/** @returns {Int16Array} one-based ordinary prime ordinals' totients mod29 */
function primeTape() {
  const maxIndex = 1 + WIDTH * 109 + CAP + Math.max(...STARTS);
  const upper = Math.ceil(maxIndex *
    (Math.log(maxIndex) + Math.log(Math.log(maxIndex))) + 200);
  const composites = new Uint8Array(upper + 1);
  for (let j = 2; j * j <= upper; j++) if (!composites[j]) {
    for (let m = j * j; m <= upper; m += j) composites[m] = 1;
  }
  const tape = new Int16Array(maxIndex + 1);
  let n = 0;
  for (let candidate = 2; candidate <= upper && n < maxIndex; candidate++) {
    if (!composites[candidate]) tape[++n] = (candidate - 1) % MOD;
  }
  assert.equal(n, maxIndex);
  assert.deepEqual(Array.from(tape.slice(1, 6)), [1, 2, 4, 6, 10]);
  return tape;
}

/** @param {string} rule @param {number} rune */
function increment(rule, rune) {
  if (rule === "one") return 1;
  if (rule === "gp-index") return rune + 1;
  if (rule === "gp-prime") return CORPUS.prime[rune];
  assert.equal(rule, "gp-totient");
  return CORPUS.prime[rune] - 1;
}

/**
 * @param {number[]} cipher original ciphertext indices
 * @param {string} rule source-derived clock
 * @param {number} start one-based starting prime ordinal
 */
function baseOrdinals(cipher, rule, start) {
  const base = new Int32Array(cipher.length);
  let ordinal = start;
  for (let i = 0; i < cipher.length; i++) {
    base[i] = ordinal;
    ordinal += increment(rule, cipher[i]);
  }
  return base;
}

/**
 * Exact optimum under a one-collision skip at each position.
 * A heldout continuation is seeded by the fixed TRAIN endpoint state;
 * it may select later hidden skips, but cannot refit that endpoint.
 * @param {number[]} cipher
 * @param {Int16Array} tape
 * @param {{rule:string,start:number,sign:number}} mode
 * @param {object} lm
 * @param {number} [from=0]
 * @param {number|null} [frozenState=null]
 * @param {boolean} [wantText=false]
 */
function viterbi(cipher, tape, mode, lm, from = 0, frozenState = null, wantText = false) {
  const n = cipher.length, W = (CAP + 1) * 2;
  assert.ok(n > 2);
  const base = baseOrdinals(cipher, mode.rule, mode.start);
  assert.ok(base[n - 1] + CAP < tape.length);
  const plain = (i, E) => mod(cipher[i] - mode.sign * tape[base[i] + E]);
  let scores = new Float64Array(W).fill(-Infinity);
  const trace = wantText ? new Int16Array(W * n).fill(-1) : null;
  if (from === 0) {
    const first = plain(0, 0);
    for (let r = 0; r <= 1; r++) {
      const p1 = plain(1, r);
      if (r && mod(p1 + mode.sign * tape[base[1]]) !== cipher[0]) continue;
      scores[r * 2 + r] = lm.unigram[first] +
        lm.bigram[first * MOD + p1] - r * PENALTY;
    }
  } else {
    assert.ok(Number.isInteger(frozenState) && frozenState >= 0 && frozenState < W);
    assert.ok(from >= 2);
    scores[frozenState] = 0;
  }
  for (let i = from === 0 ? 2 : from; i < n; i++) {
    const next = new Float64Array(W).fill(-Infinity);
    for (let extra = 0; extra <= CAP; extra++) {
      for (let prevSkip = 0; prevSkip <= 1; prevSkip++) {
        const s = extra * 2 + prevSkip, previousScore = scores[s];
        if (!Number.isFinite(previousScore)) continue;
        const a = plain(i - 2, extra - prevSkip);
        const b = plain(i - 1, extra);
        for (let skip = 0; skip <= 1 && extra + skip <= CAP; skip++) {
          const E = extra + skip;
          const p = plain(i, E);
          if (skip && mod(p + mode.sign * tape[base[i] + extra]) !== cipher[i - 1]) {
            continue;
          }
          const value = previousScore +
            lm.trigram[(a * MOD + b) * MOD + p] - skip * PENALTY;
          const dst = E * 2 + skip;
          if (value > next[dst]) {
            next[dst] = value;
            if (trace) trace[i * W + dst] = s;
          }
        }
      }
    }
    scores = next;
  }
  let endState = -1, score = -Infinity;
  for (let i = 0; i < W; i++) if (scores[i] > score) {
    score = scores[i];
    endState = i;
  }
  assert.ok(Number.isFinite(score) && endState >= 0);
  const out = { score, endState, consumedExtra: Math.floor(endState / 2) };
  if (wantText) {
    assert.equal(from, 0);
    const decoded = new Array(n);
    let s = endState;
    for (let i = n - 1; i >= 1; i--) {
      decoded[i] = plain(i, Math.floor(s / 2));
      if (i >= 2) {
        s = trace[i * W + s];
        assert.ok(s >= 0);
      }
    }
    decoded[0] = plain(0, 0);
    out.plaintext = decoded;
  }
  return out;
}

/**
 * Freeze the entire model on 150 original runes per section,
 * then score remaining 150 with exact fixed boundary state.
 */
function search(bodies, tape, lm) {
  assert.deepEqual(bodies.map(x => x.length), Array(8).fill(WIDTH));
  const ranked = SETTINGS.map(mode => {
    const prefix = bodies.map(c => viterbi(c.slice(0, TRAIN), tape, mode, lm));
    const trainScore = prefix.reduce((s, v) => s + v.score, 0) / (8 * TRAIN);
    const testScore = bodies.reduce((s, c, i) =>
      s + viterbi(c, tape, mode, lm, TRAIN, prefix[i].endState).score, 0) /
      (8 * (WIDTH - TRAIN));
    return { ...mode, trainScore, testScore,
      skippedOnTrain: prefix.map(x => x.consumedExtra) };
  });
  ranked.sort((a, b) => b.trainScore - a.trainScore);
  const top = ranked[0];
  const full = bodies.map(c => viterbi(c, tape, top, lm, 0, null, true));
  return {
    top, alternatives: ranked.slice(1, 5), tested: ranked.length,
    originalDecodedPrefixes: full.map(x => x.plaintext.slice(0, 65).map(v => RUNES[v]).join("")),
    totalFullSkipped: full.reduce((s, x) => s + x.consumedExtra, 0)
  };
}

/** @param {number} seed deterministic independent seeded RNG */
function random32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * True-positive forward encryption using original Cicada prime-totient values,
 * ciphertext-driven ordinal jumps and stochastic collision-consumed draws.
 * Actual GP source is held-out Shakespeare after language training boundary.
 */
function plant(tape, lm) {
  const english = encode(read("resources/control/shakespeare_first300k.txt").slice(205000));
  assert.ok(english.length >= 8 * WIDTH);
  const clear = Array.from({length: 8}, (_, i) =>
    english.slice(i * WIDTH, (i + 1) * WIDTH));
  const mode = { rule: "gp-prime", start: 22, sign: 1 };
  const next = random32(0x11c3301), skips = [];
  const cipher = clear.map(plain => {
    let ordinal = mode.start, previous = -1, count = 0;
    const output = [];
    for (const p of plain) {
      let candidate = mod(p + mode.sign * tape[ordinal]);
      if (candidate === previous && next() / 4294967296 < .81) {
        ordinal++;
        candidate = mod(p + mode.sign * tape[ordinal]);
        count++;
      }
      output.push(candidate);
      previous = candidate;
      ordinal += increment(mode.rule, candidate);
    }
    skips.push(count);
    return output;
  });
  const result = search(cipher, tape, lm);
  const decoded = cipher.map(c => viterbi(c, tape, mode, lm, 0, null, true));
  const correct = clear.reduce((total, word, i) =>
    total + word.filter((x, j) => x === decoded[i].plaintext[j]).length, 0);
  assert.ok(correct >= 0.90 * 8 * WIDTH, "Positive prime-walk inversion underpowered");
  return {
    trueMode: mode, foundMode: result.top,
    modelRankOne: result.top.rule === mode.rule && result.top.start === mode.start &&
      result.top.sign === mode.sign,
    recoveredExactRunes: correct, totalRunes: 8 * WIDTH, actualSkips: skips,
    inferredTrueModeSkips: decoded.map(x => x.consumedExtra)
  };
}

/** @param {number[][]} bodies @param {Int16Array} tape @param {object} lm */
function matchedNull(bodies, tape, lm, actual, trials = 30) {
  const next = random32(0x11ef312);
  const observed = actual.top.testScore;
  const scores = [];
  for (let trial = 0; trial < trials; trial++) {
    const shuffled = new Int16Array(tape);
    for (let i = shuffled.length - 1; i > 1; i--) {
      const j = 1 + (next() % i);
      const tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
    }
    const hypothesis = search(bodies, shuffled, lm);
    scores.push(hypothesis.top.testScore);
  }
  scores.sort((a, b) => a - b);
  const exceed = scores.filter(x => x >= observed).length;
  return { trials, seed: "0x11ef312", heldoutExceed: exceed,
    heldoutPUpper: (exceed + 1) / (trials + 1),
    median: scores[Math.floor(trials / 2)], min: scores[0],
    max: scores[scores.length - 1], scores };
}
function run() {
  const original = originalBodies(), tape = primeTape();
  const lm = train(read("resources/control/shakespeare_first300k.txt").slice(0, 200000));
  const positive = plant(tape, lm);
  const real = search(original, tape, lm);
  const nulls = matchedNull(original, tape, lm, real, 30);
  const result = {
    method: "Original LP2 prime-totient with published-ciphertext-dependent prime-index stride and optional collision-rejected draw",
    starts: STARTS, rules: RULES, signs: [-1, 1],
    keyCollisionSkipPenalty: PENALTY, extraCap: CAP, split: [TRAIN, WIDTH - TRAIN],
    originalRunes: 8 * WIDTH, positive, real, nulls,
    classification: "Bounded reversible source-key hypothesis; no key unless original decodes coherently and heldout score beats matched null"
  };
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  return result;
}
if (require.main === module) run();
module.exports = { primeTape, increment, baseOrdinals, viterbi, search, plant, matchedNull, run };
