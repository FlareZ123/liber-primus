"use strict";
/**
 * Original LP2 all-secret 256-period additive-key reuse test.
 *
 * Hypothesis: ciphertext C_page,t = (P_page,t + K[(phase_page +
 * direction_page*t) mod 256]) mod 29, where each page has an unknown
 * circular phase, direction +/-1, and shares one unknown 256-symbol pad.
 *
 * A known GP-English unigram distribution predicts the difference of
 * two plaintext runes when their key positions align. For each page,
 * fit the two directions and all 256 phases against p0 only, then test
 * non-anchor page pairs without fitting their pairwise alignment.
 * The known clear GP29 p57 passage supplies the reference distribution.
 *
 * Null: independently shuffle eight-rune blocks within every original
 * page. This preserves page rune counts, exact blocks and most local
 * adjacency while disrupting a common position-based pad. Nulls must
 * not circularly shift whole pages: the model fits arbitrary shifts!
 * Positive: a random 256-symbol shared pad with truly random per-page
 * phases/directions, and 81% artificial adjacent-doublet replacement.
 *
 * Node.js 22; only built-in modules. Invoke manually:
 * node sims/lp2_shared256_freephase_orientation_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const MOD = 29;
const PERIOD = 256;
const PREFIX = 200;
const ALPHA = 0.4;
const RANDOM_SEED = 0x83bee9cd;
const originalPages = corpus.pages.filter(p => p.page < 56 && p.indices.length >= PREFIX);
const original = originalPages.map(p => p.indices.slice(0, PREFIX));
const parable = corpus.pages.find(p => p.page === 57).indices;
assert.equal(original.length, 46);
assert.equal(parable.length, 95);
const q = Array.from({length: MOD}, (_, i) =>
  (parable.filter(v => v === i).length + ALPHA) / (parable.length + MOD * ALPHA)
);
const differences = Float64Array.from({length: MOD}, (_, d) =>
  Math.log(MOD * q.reduce((sum, prob, i) => sum + prob * q[(i + d) % MOD], 0))
);

/**
 * @param {number[]} anchor
 * @param {number[]} page
 * @param {1|-1} direction
 * @param {number} phase
 * @returns {number}
 */
function alignedPairScore(anchor, page, direction, phase) {
  let score = 0, n = 0;
  for (let t = 0; t < PREFIX; t++) {
    const u = (direction * t + phase + PERIOD * 2) & 255;
    if (u >= PREFIX) continue;
    score += differences[(anchor[t] - page[u] + MOD) % MOD];
    n++;
  }
  return score / Math.sqrt(n);
}

/** @param {number[][]} pages */
function fit(pages) {
  const directions = [1], phases = [0];
  let anchorTotal = 0;
  for (let j = 1; j < pages.length; j++) {
    let best = -Infinity, chosenDirection = 1, chosenPhase = 0;
    for (const direction of [1, -1]) {
      for (let phase = 0; phase < PERIOD; phase++) {
        const score = alignedPairScore(pages[0], pages[j], direction, phase);
        if (score > best) {
          best = score;
          chosenDirection = direction;
          chosenPhase = phase;
        }
      }
    }
    directions.push(chosenDirection);
    phases.push(chosenPhase);
    anchorTotal += best;
  }
  let heldTotal = 0, positive = 0, pairs = 0, compared = 0;
  for (let j = 1; j < pages.length; j++) {
    for (let k = j + 1; k < pages.length; k++) {
      let sum = 0, n = 0;
      for (let t = 0; t < PERIOD; t++) {
        const a = (directions[j] * t + phases[j] + PERIOD * 2) & 255;
        const b = (directions[k] * t + phases[k] + PERIOD * 2) & 255;
        if (a < PREFIX && b < PREFIX) {
          sum += differences[(pages[j][a] - pages[k][b] + MOD) % MOD];
          n++;
        }
      }
      const score = sum / Math.sqrt(n);
      heldTotal += score;
      positive += Number(score > 0);
      compared += n;
      pairs++;
    }
  }
  return {
    anchor: anchorTotal / (pages.length - 1),
    held: heldTotal / pairs,
    positive: positive / pairs,
    pairs,
    meanCompared: compared / pairs,
    directions,
    phases
  };
}

/** @param {number} seed */
function xorshift(seed) {
  let state = seed | 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}
const random = xorshift(RANDOM_SEED);

/** @returns {number} */
function drawRune() {
  let r = random();
  for (let i = 0; i < MOD; i++) {
    r -= q[i];
    if (r < 0) return i;
  }
  return MOD - 1;
}

/** @returns {{pages:number[][],phases:number[],directions:number[],repairs:number}} */
function plant() {
  const key = Array.from({length: PERIOD}, () => Math.floor(random() * MOD));
  const phases = original.map(() => Math.floor(random() * PERIOD));
  const directions = original.map((_, j) => j === 0 ? 1 : random() < 0.5 ? -1 : 1);
  let repairs = 0;
  const pages = original.map((page, j) => {
    const out = [];
    for (let t = 0; t < PREFIX; t++) {
      let value = (drawRune() +
        key[(phases[j] + directions[j] * t + PERIOD * 2) & 255]) % MOD;
      if (t && value === out[t - 1] && random() < 0.81) {
        value = (value + 1 + Math.floor(random() * 28)) % MOD;
        repairs++;
      }
      out.push(value);
    }
    return out;
  });
  return {pages, phases, directions, repairs};
}

/** @param {number[][]} pages */
function shuffledEightRuneBlocks(pages) {
  return pages.map(page => {
    const blocks = Array.from({length: PREFIX / 8}, (_, j) =>
      page.slice(j * 8, (j + 1) * 8)
    );
    for (let j = blocks.length - 1; j > 0; j--) {
      const k = Math.floor(random() * (j + 1));
      [blocks[j], blocks[k]] = [blocks[k], blocks[j]];
    }
    return blocks.flat();
  });
}

/** @param {Array<{anchor:number,held:number,positive:number}>} results @param {"anchor"|"held"|"positive"} key */
function summary(results, key) {
  const values = results.map(r => r[key]);
  return {
    mean: values.reduce((a, b) => a + b, 0) / values.length,
    min: Math.min(...values),
    max: Math.max(...values)
  };
}

function main() {
  const observed = fit(original);
  const nulls = [];
  for (let i = 0; i < 40; i++) nulls.push(fit(shuffledEightRuneBlocks(original)));
  const positives = [];
  for (let i = 0; i < 12; i++) {
    const planted = plant();
    const result = fit(planted.pages);
    let exact = 0;
    for (let j = 0; j < planted.pages.length; j++) {
      const truthPhase =
        ((planted.phases[0] - planted.phases[j]) * planted.directions[j] +
          PERIOD * 2) & 255;
      exact += Number(result.directions[j] === planted.directions[j] &&
        result.phases[j] === truthPhase);
    }
    positives.push({...result, exact, repairs: planted.repairs});
  }
  const result = {
    hypothesis: "One unknown GP29 additive pad, 256-cycle, with independently unknown page phase and direction",
    pageNumbers: originalPages.map(p => p.page),
    prefixRunes: PREFIX,
    reference: "95 known-clear p57 GP29 runes, symmetric Dirichlet 0.4 smoothing",
    seed: RANDOM_SEED,
    original: {
      anchor: observed.anchor, held: observed.held,
      positive: observed.positive, heldoutPairs: observed.pairs,
      meanCompared: observed.meanCompared
    },
    shuffledNull: {
      repetitions: nulls.length,
      held: summary(nulls, "held"),
      anchor: summary(nulls, "anchor"),
      positive: summary(nulls, "positive"),
      upperTailOriginalHeld: (1 + nulls.filter(x => x.held >= observed.held).length) /
        (nulls.length + 1)
    },
    syntheticKnownTruth: {
      repetitions: positives.length,
      held: summary(positives, "held"),
      anchor: summary(positives, "anchor"),
      exactAnchoredPagePhases: summary(positives, "exact"),
      doubletRepairs: summary(positives, "repairs"),
      heldAboveOriginal: positives.filter(x => x.held > observed.held).length
    }
  };
  assert.ok(positives.every(r => r.held > observed.held));
  assert.ok(observed.held >= summary(nulls, "held").min &&
    observed.held <= summary(nulls, "held").max);
  console.log(JSON.stringify(result, null, 2));
}
if (require.main === module) main();
module.exports = {alignedPairScore, fit, plant, shuffledEightRuneBlocks, main};
