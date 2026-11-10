"use strict";

/**
 * LP2 physical page-turn GP-index arcs with original-JPEG glyph-width,
 * section-start and word-carry matching. All permutation expectations and
 * variances are computed exactly for the finite, without-replacement null.
 * Refit all 377 cyclic arcs separately on each shuffled training half.
 *
 * Run: node sims/page_turn_width_word_matched_crossfit.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const physical = corpus.pages.filter(page => page.page < 56 &&
  page.indices.length > 0);
const printed = fs.readFileSync(path.join(
  ROOT, "resources/lp2-transcription.txt"), "utf8")
  .split("%").slice(0, 55);
assert.equal(physical.length, 55);
assert.equal(printed.length, 55);
assert.equal(physical.reduce((n, p) => n + p.indices.length, 0), 12956);

const FIRST = physical.map(page => page.indices[0]);
const LAST = physical.map(page => page.indices[page.indices.length - 1]);

// Independent original-JPEG ink medians. These are imperfect proxies for
// advances; see printed_line_width_conditioned_residual.cjs and its source.
const INK_WIDTH = [
  34, 52, 33, 34, 33, 34.5, 40, 33, 43, 29,
  9, 41, 36, 51, 59, 34, 45, 34, 52, 52,
  33, 48, 41, 52, 33, 34, 52, 50, 83
];
assert.equal(INK_WIDTH.length, 29);

/** @param {number} width @returns {number} */
function widthBin(width) {
  if (width < 20) return 0;
  if (width < 35) return 1;
  if (width < 45) return 2;
  if (width < 55) return 3;
  return 4;
}

const SECTIONS = new Set([0, 3, 8, 15, 23, 27, 33, 40, 54]);
const RUNE_END = /[\u16a0-\u16ff]$/u;
const RUNE_START = /^[\u16a0-\u16ff]/u;
const CARRY = printed.slice(0, -1).map((page, i) =>
  RUNE_END.test(page.replace(/[\s/]+$/gu, "")) &&
  RUNE_START.test(printed[i + 1].replace(/^[\s/]+/gu, "")));
assert.equal(CARRY.filter(Boolean).length, 32);

/** @param {number} index @returns {string} */
function key(index, variant) {
  const width = widthBin(INK_WIDTH[FIRST[index]]);
  if (variant === "width") return String(width);
  if (variant === "widthSection")
    return width + ":" + Number(SECTIONS.has(index));
  if (variant === "widthWord")
    return width + ":" + Number(CARRY[index - 1]);
  return width + ":" + Number(SECTIONS.has(index)) + ":" +
    Number(CARRY[index - 1]);
}

/**
 * Destination-page groups preserving each original page's width-bin (and
 * optionally its section and word-continuation flags).
 * @param {number} start Destination page index inclusive.
 * @param {number} stop Destination page index exclusive.
 * @param {string} variant
 * @returns {number[][]}
 */
function grouped(start, stop, variant) {
  const groups = new Map();
  for (let i = start; i < stop; i++) {
    const k = key(i, variant);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(i);
  }
  return [...groups.values()];
}

const ARCS = [];
for (let len = 2; len <= 14; len++)
  for (let start = 0; start < 29; start++)
    ARCS.push([start, len]);
assert.equal(ARCS.length, 377);

/** @param {number} x @param {number} previous @param {number[]} arc */
function match(x, previous, arc) {
  return (x - previous + 58 - arc[0]) % 29 < arc[1];
}

/**
 * Exact first two moments of a sum of matching edges when each group is
 * permuted uniformly without replacement. Two edges in one group are
 * dependent; the covariance term below is essential.
 * @param {number[][]} groups
 * @returns {{E:number[],V:number[]}}
 */
function moments(groups) {
  const E = [], V = [];
  for (const arc of ARCS) {
    let e = 0, v = 0;
    for (const ids of groups) {
      const n = ids.length;
      const rows = ids.map(i => ids.map(j =>
        Number(match(FIRST[j], LAST[i - 1], arc))));
      const sum = rows.map(row => row.reduce((a, b) => a + b, 0));
      const q = sum.map(s => s / n);
      e += q.reduce((a, b) => a + b, 0);
      v += q.reduce((a, b) => a + b * (1 - b), 0);
      if (n > 1) {
        for (let i = 0; i < n; i++) {
          for (let j = i + 1; j < n; j++) {
            const dot = rows[i].reduce((a, x, k) => a + x * rows[j][k], 0);
            v += 2 * ((sum[i] * sum[j] - dot) / (n * (n - 1)) -
              q[i] * q[j]);
          }
        }
      }
    }
    E.push(e);
    V.push(Math.max(0, v));
  }
  return {E, V};
}

/** @param {number[]} heads @param {number} start @param {number} stop */
function histogram(heads, start, stop) {
  const h = Array(29).fill(0);
  for (let i = start; i < stop; i++)
    h[(heads[i] - LAST[i - 1] + 29) % 29]++;
  return h;
}

/** @param {number[]} h @param {number[]} arc */
function arcCount(h, arc) {
  let n = 0;
  for (let j = 0; j < arc[1]; j++)
    n += h[(arc[0] + j) % 29];
  return n;
}

/** @param {number[]} h @param {{E:number[],V:number[]}} p */
function select(h, p) {
  let best = {index: -1, z: -Infinity};
  for (let j = 0; j < ARCS.length; j++) {
    const count = arcCount(h, ARCS[j]);
    const z = p.V[j] > 1e-10 ?
      (count - p.E[j]) / Math.sqrt(p.V[j]) : 0;
    if (z > best.z)
      best = {index: j, z, arc: ARCS[j], count,
        expected: p.E[j], variance: p.V[j]};
  }
  return best;
}

/** @param {number[]} h @param {{E:number[],V:number[]}} p @param {number} index */
function score(h, p, index) {
  const count = arcCount(h, ARCS[index]);
  return {count, expected: p.E[index], variance: p.V[index],
    z: p.V[index] > 1e-10 ?
      (count - p.E[index]) / Math.sqrt(p.V[index]) : 0};
}

/** @param {number} seed @returns {()=>number} */
function random32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {number[]} heads @param {number[][]} groups @param {()=>number} rand */
function shuffleHeads(heads, groups, rand) {
  for (const ids of groups) {
    const values = ids.map(i => FIRST[i]);
    for (let j = values.length - 1; j > 0; j--) {
      const k = rand() % (j + 1);
      [values[j], values[k]] = [values[k], values[j]];
    }
    ids.forEach((id, i) => { heads[id] = values[i]; });
  }
}

/**
 * Full conditional discovery/heldout recalibration. The arc is NOT frozen
 * on each null: every shuffled early-page training set refits all 377 arcs.
 * @param {string} variant
 * @param {number} trials
 */
function crossfit(variant, trials) {
  const train = grouped(1, 28, variant);
  const heldout = grouped(29, 55, variant);
  const trainMoments = moments(train);
  const heldMoments = moments(heldout);
  const selected = select(histogram(FIRST, 1, 28), trainMoments);
  const observed = score(histogram(FIRST, 29, 55),
    heldMoments, selected.index);
  const rand = random32(0x4f291531);
  const sample = FIRST.slice();
  let exceed = 0;
  for (let t = 0; t < trials; t++) {
    shuffleHeads(sample, train, rand);
    shuffleHeads(sample, heldout, rand);
    const candidate = select(histogram(sample, 1, 28), trainMoments);
    const z = score(histogram(sample, 29, 55),
      heldMoments, candidate.index).z;
    if (z >= observed.z - 1e-10) exceed++;
  }
  return {variant, trainGroupSizes: train.map(x => x.length),
    heldGroupSizes: heldout.map(x => x.length),
    training: selected, heldout: observed,
    trials, exceed, p: (exceed + 1) / (trials + 1)};
}

/**
 * Exact generating polynomial for a frozen 12..17 heldout arc under the
 * strict source-matched null. Counts use arbitrary-precision integers.
 * @param {number[][]} groups
 */
function exactFixedArc(groups) {
  const arc = [12, 6];
  let book = [1n];
  for (const ids of groups) {
    const n = ids.length;
    const memo = new Map();
    /** @param {number} used Bit-mask of assigned source rune instances. */
    function dfs(used) {
      if (used === (1 << n) - 1) return [1n];
      if (memo.has(used)) return memo.get(used);
      const slot = used.toString(2).replaceAll("0", "").length;
      const out = Array(n - slot + 1).fill(0n);
      for (let j = 0; j < n; j++) {
        if (used & (1 << j)) continue;
        const shift = Number(match(FIRST[ids[j]], LAST[ids[slot] - 1], arc));
        const rest = dfs(used | (1 << j));
        for (let k = 0; k < rest.length; k++)
          out[k + shift] += rest[k];
      }
      memo.set(used, out);
      return out;
    }
    const local = dfs(0);
    const next = Array(book.length + local.length - 1).fill(0n);
    for (let i = 0; i < book.length; i++)
      for (let j = 0; j < local.length; j++)
        next[i + j] += book[i] * local[j];
    book = next;
  }
  const observed = arcCount(histogram(FIRST, 29, 55), arc);
  const denominator = book.reduce((a, b) => a + b, 0n);
  const numerator = book.slice(observed).reduce((a, b) => a + b, 0n);
  return {arc, observed, expected: book.reduce((sum, n, k) =>
    sum + Number(n) * k / Number(denominator), 0),
    numerator: String(numerator), denominator: String(denominator),
    exactTail: Number(numerator) / Number(denominator)};
}

/**
 * Positive detector-power control. Rearranges ONLY existing original page
 * head runes within their exact width/section/word categories to maximize
 * hits in the prespecified hidden [9,14] arc. It is not an LP2 key claim.
 * @param {number[][]} groups
 * @param {number[]} output
 */
function plant(groups, output) {
  for (const ids of groups) {
    const n = ids.length;
    let best = -1, assignment = [];
    function walk(slot, used, score, values) {
      if (slot === n) {
        if (score > best) {
          best = score;
          assignment = values.slice();
        }
        return;
      }
      for (let j = 0; j < n; j++) {
        if (used & (1 << j)) continue;
        values[slot] = FIRST[ids[j]];
        walk(slot + 1, used | (1 << j),
          score + Number(match(FIRST[ids[j]], LAST[ids[slot] - 1], [9, 6])),
          values);
      }
    }
    walk(0, 0, 0, []);
    ids.forEach((id, j) => { output[id] = assignment[j]; });
  }
}

function main() {
  const output = {
    source: {runes: 12956, pages: 55, pageJoins: 54,
      sourceWordContinuations: CARRY.filter(Boolean).length,
      trainJoins: 27, heldoutJoins: 26, skippedJoin: "p27-p28"},
    variants: ["width", "widthSection", "widthWord", "widthSectionWord"]
      .map(v => crossfit(v, 15000)),
    frozenStrictArc: exactFixedArc(grouped(29, 55, "widthSectionWord"))
  };
  const gsEarly = grouped(1, 28, "widthSectionWord");
  const gsLate = grouped(29, 55, "widthSectionWord");
  const planted = FIRST.slice();
  plant(gsEarly, planted);
  plant(gsLate, planted);
  const chosen = select(histogram(planted, 1, 28), moments(gsEarly));
  output.positive = {
    hiddenTargetArc: [9, 6],
    plantedTrainHits: arcCount(histogram(planted, 1, 28), [9, 6]),
    plantedHeldoutHits: arcCount(histogram(planted, 29, 55), [9, 6]),
    selectedArc: chosen.arc,
    heldout: score(histogram(planted, 29, 55),
      moments(gsLate), chosen.index)
  };

  assert.deepEqual(output.variants.map(v => v.training.arc),
    [[16, 2], [16, 2], [16, 2], [16, 2]]);
  assert.deepEqual(output.variants.map(v => v.heldout.count),
    [2, 2, 2, 2]);
  assert.equal(output.frozenStrictArc.observed, 12);
  assert.equal(output.frozenStrictArc.numerator, "11446272");
  assert.equal(output.frozenStrictArc.denominator, "298598400");
  assert.deepEqual(output.positive.selectedArc, [3, 12]);
  assert.equal(output.positive.heldout.count, 17);
  console.log(JSON.stringify(output, null, 2));
}

if (require.main === module) main();
module.exports = {main};
