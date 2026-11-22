"use strict";

/**
 * Source-fixed displaced shared GP29 pad test on LP2 p40-p55.
 *
 * Original visual motif supplies 16 floral physical pages, including rune-free
 * p50. Original p15 supplies a 4x4 number matrix and its known spiral order.
 * Hypothesis: each page is encrypted with the same GP29 additive key stream,
 * starting at the corresponding p15 cell's absolute key-clock position.
 *
 * The difference at aligned absolute clock positions cancels the unknown pad.
 * A page-specific Caesar offset shifts all differences for that page pair by
 * a constant, so the *largest* of the 29 difference-bin counts is invariant
 * under every such offset; this per-pair oracle is more permissive than any
 * globally consistent page-offset assignment.
 *
 * This is a finite plain-GP-English test, not a universal cipher exclusion.
 *
 * SFT: node sims/lp2_p15_floral_displaced_sharedpad_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = gp.pages.filter(p => p.page >= 40 && p.page <= 55);
assert.deepEqual(pages.map(p => p.page), Array.from({ length: 16 }, (_, i) => 40 + i));
assert.equal(pages[10].indices.length, 0, "physical p50 remains a zero-rune slot");
const lengths = pages.map(p => p.indices.length);
const N = lengths.reduce((n, v) => n + v, 0);
const unknown = pages.flatMap(p => p.indices);
assert.equal(N, 3316);
const begins = [];
for (const len of lengths) begins.push((begins.at(-1) || 0) + (begins.length ? lengths[begins.length - 1] : 0));

const M = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
const row = M.flat();
const spiral = [
  [1, 1], [1, 2], [2, 2], [2, 1],
  [2, 0], [1, 0], [0, 0], [0, 1],
  [0, 2], [0, 3], [1, 3], [2, 3],
  [3, 3], [3, 2], [3, 1], [3, 0]
].map(([r, c]) => M[r][c]);
assert.equal(row.length, 16);
assert.equal(spiral.length, 16);
assert.equal(spiral[0], 3299);
assert.equal(new Set(spiral).size, 16);

/**
 * Exact source-native GP29 spelling, accounting for LP1's ING and IO.
 * @param {string} text
 * @returns {number[]}
 */
function encodeSourceNative(text) {
  const tokens = gp.translit.map((s, i) => ({ s, i }))
    .sort((a, b) => b.s.length - a.s.length);
  const words = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C")
    .replace(/Z/g, "S").match(/[A-Z]+/g) || [];
  const result = [];
  for (const w of words) {
    for (let pos = 0; pos < w.length;) {
      if (w.startsWith("ING", pos)) {
        result.push(21);
        pos += 3;
      } else if (w.startsWith("IO", pos)) {
        result.push(27);
        pos += 2;
      } else {
        const token = tokens.find(t => w.startsWith(t.s, pos));
        assert(token, "cannot encode " + w.slice(pos));
        result.push(token.i);
        pos += token.s.length;
      }
    }
  }
  return result;
}
assert.deepEqual(encodeSourceNative("TUNNELING"), [16, 1, 9, 9, 18, 20, 21]);

/** @param {number} value @param {number} period */
function modulo(value, period) {
  return (value % period + period) % period;
}

/**
 * Build pairs of rune positions sharing exactly one key-clock state.
 * No original rune may be deleted or reordered; p50 occupies a key slot.
 * @param {number[]} starts
 * @param {number} period - zero means an unwrapped absolute key clock
 * @returns {number[][][]}
 */
function matchedPairs(starts, period) {
  const groups = [];
  for (let a = 0; a < 16; a++) {
    if (lengths[a] === 0) continue;
    for (let b = a + 1; b < 16; b++) {
      if (lengths[b] === 0) continue;
      const group = [];
      for (let i = 0; i < lengths[a]; i++) {
        const global = starts[a] + i;
        const delta = global - starts[b];
        const j = period ? modulo(delta, period) : delta;
        if (j >= 0 && j < lengths[b])
          group.push([begins[a] + i, begins[b] + j]);
      }
      if (group.length) groups.push(group);
    }
  }
  return groups;
}

/**
 * Compute invariant equalities at literal source offsets and under oracle
 * per-pair Caesar offsets. The oracle is a strict upper bound on any globally
 * consistent set of per-page Caesar offsets.
 * @param {number[]} seq
 * @param {number[][][]} groups
 * @returns {{total:number,fixed:number,oracle:number,pairs:number}}
 */
function measure(seq, groups) {
  let total = 0, fixed = 0, oracle = 0;
  for (const group of groups) {
    const counts = new Int32Array(29);
    for (const [i, j] of group) {
      assert(i >= 0 && i < seq.length && j >= 0 && j < seq.length);
      const d = modulo(seq[i] - seq[j], 29);
      counts[d]++;
      if (d === 0) fixed++;
      total++;
    }
    oracle += Math.max(...counts);
  }
  return { total, fixed, oracle, pairs: groups.length };
}

/**
 * A deterministic key stream indexed by absolute source cell position.
 * This is only a positive plant; no claim is made about Cicada's PRNG.
 * @param {number} absolute
 * @param {number} period
 */
function keyAt(absolute, period) {
  const state = period ? modulo(absolute, period) : absolute;
  const t = (Math.imul(state ^ 0x6d2b79f5, 1664525) + 1013904223) >>> 0;
  return t % 29;
}

/**
 * Encrypt a native GP plaintext under the model's *same* pad and allow a
 * distinct Caesar offset on each physical page.
 * @param {number[]} clear
 * @param {number[]} starts
 * @param {number} period
 * @param {boolean} caesar
 */
function plant(clear, starts, period, caesar) {
  const out = clear.slice();
  for (let p = 0; p < 16; p++) {
    const offset = caesar ? (p * 7 + 3) % 29 : 0;
    for (let i = 0; i < lengths[p]; i++) {
      const at = begins[p] + i;
      out[at] = (clear[at] + keyAt(starts[p] + i, period) + offset) % 29;
    }
  }
  return out;
}

const reference = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
].map(([name, file]) => ({ name, seq: encodeSourceNative(read(file)) }));
for (const r of reference) assert(r.seq.length > N);
const models = [
  ["spiral", spiral],
  ["spiral-inverted-clock", spiral.map(v => -v)],
  ["row-major", row],
  ["row-major-inverted-clock", row.map(v => -v)]
];
const summary = [];
for (const [name, starts] of models) {
  for (const period of [0, 3299]) {
    const groups = matchedPairs(starts, period);
    const source = measure(unknown, groups);
    assert(source.pairs >= 30 && source.total >= 4900);
    const controls = [];
    for (const r of reference) {
      const maxStart = r.seq.length - N;
      const step = Math.max(1, Math.floor(maxStart / 150));
      const samples = [];
      for (let from = 0; from + N <= r.seq.length; from += step)
        samples.push(measure(r.seq.slice(from, from + N), groups));
      assert(samples.length >= 150);
      controls.push({
        name: r.name,
        samples: samples.length,
        fixed_min: Math.min(...samples.map(x => x.fixed)),
        oracle_min: Math.min(...samples.map(x => x.oracle)),
        fixed_le_source: samples.filter(x => x.fixed <= source.fixed).length,
        oracle_le_source: samples.filter(x => x.oracle <= source.oracle).length
      });
    }

    // The same unknown stream cancels *exactly* at source-matched positions.
    const clear = reference[0].seq.slice(0, N);
    const unencrypted = measure(clear, groups);
    const direct = measure(plant(clear, starts, period, false), groups);
    assert.equal(direct.fixed, unencrypted.fixed,
      "shared-pad exact-position positive control " + name + " " + period);
    assert.equal(direct.oracle, unencrypted.oracle);
    const withCaesar = measure(plant(clear, starts, period, true), groups);
    assert.equal(withCaesar.oracle, unencrypted.oracle,
      "per-pair oracle positive control " + name + " " + period);
    assert.equal(withCaesar.total, source.total);
    summary.push({ name, period, source, controls });
    console.log(JSON.stringify({ name, period, source, controls,
      positive_plant_exact: true }));
  }
}
assert.equal(summary.length, 8);
const spiralResult = summary.find(x => x.name === "spiral" && x.period === 0);
assert(spiralResult);
assert.deepEqual([spiralResult.source.total, spiralResult.source.fixed,
  spiralResult.source.oracle, spiralResult.source.pairs], [7805, 274, 493, 36]);
console.log("DECISION: eight fixed p15-cell clocks do not recover unknown LP2 " +
  "plaintext or an authentic key. Native-English pad-reuse controls are " +
  "substantially more collision-rich than the original source.");
