"use strict";

/**
 * Exact key-independent TEA/XTEA state-trace exclusion for the 32x8 LP2
 * printed table.  A pair of adjacent 64-bit round states of these ciphers
 * imposes elementary mod-2 conditions on the low bit of their first word.
 * No key words, plaintext, or generator seeds are fitted to the manuscript.
 *
 * Run: node sims/grid_tea_xtea_allkey_trace_gate.cjs
 * Node 22 built-in modules only. Source-grid parsed from original resource.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources/liber-primus/base60-grid.json"), "utf8"));
const rows = data.byte_rows;
const DELTA = 0x9e3779b9;
const POSSIBLY_DISPUTED_PRINTED_BYTE_INDICES = new Set([45, 50, 165, 172, 246]);

assert.equal(rows.length, 32);
assert.ok(rows.every(r => r.length === 8 && r.every(x =>
  Number.isInteger(x) && x >= 0 && x <= 255)));
const grid = rows.flat();
assert.equal(grid.length, 256);

/**
 * Read 32-bit integer in either byte order without exceeding signed-js int.
 * @param {number[]} b
 * @param {boolean} little
 * @returns {number}
 */
function u32(b, little) {
  assert.equal(b.length, 4);
  return little
    ? (b[0] | b[1] << 8 | b[2] << 16 | b[3] << 24) >>> 0
    : (b[0] << 24 | b[1] << 16 | b[2] << 8 | b[3]) >>> 0;
}

/**
 * Byte coordinates of all 16 naturally oriented candidate traces.
 * Two readouts (printed row / column-major), both row directions,
 * both 32-bit word endiannesses, both word-half orders.
 */
function sourceLayouts() {
  const output = [];
  for (const layout of ["row-major", "column-major"]) {
    for (const reverseRows of [false, true]) {
      for (const littleEndian of [false, true]) {
        for (const swapWords of [false, true]) {
          let indices = layout === "row-major"
            ? Array.from({length: 256}, (_, i) => i)
            : Array.from({length: 256}, (_, i) =>
              (i % 32) * 8 + Math.floor(i / 32));
          let states = Array.from({length: 32}, (_, i) => {
            const ids = indices.slice(i * 8, i * 8 + 8);
            const bytes = ids.map(j => grid[j]);
            const first = u32(bytes.slice(0, 4), littleEndian);
            const second = u32(bytes.slice(4, 8), littleEndian);
            return {
              first: swapWords ? second : first,
              second: swapWords ? first : second,
              tainted: ids.some(j => POSSIBLY_DISPUTED_PRINTED_BYTE_INDICES.has(j)),
              indices: ids
            };
          });
          if (reverseRows) states.reverse();
          output.push({
            name: [
              layout, reverseRows ? "reverse-rows" : "forward-rows",
              littleEndian ? "little-endian" : "big-endian",
              swapWords ? "swap-word-halves" : "original-word-halves"
            ].join("/"),
            states
          });
        }
      }
    }
  }
  assert.equal(output.length, 16);
  return output;
}

/** All keys impose a *constant* q0, q1 for TEA, and period-4 q0 for XTEA. */
function parityTrace(states) {
  assert.equal(states.length, 32);
  const first = [], second = [], clean = [];
  for (let round = 0; round < states.length - 1; round++) {
    const a = states[round], b = states[round + 1];
    const d0 = (b.first - a.first) >>> 0;
    const d1 = (b.second - a.second) >>> 0;
    first.push((d0 ^ a.second ^ (a.second >>> 5) ^ round) & 1);
    second.push((d1 ^ b.first ^ (b.first >>> 5) ^ round) & 1);
    clean.push(!a.tainted && !b.tainted);
  }
  return {first, second, clean};
}

/**
 * Exact minimum wrong bits after optimally choosing all period-p hidden bits.
 * For TEA p=1, this gives a lower bound under *any* 128-bit key.
 * For XTEA first-half p=4, this gives the same all-key obstruction.
 */
function minViolations(bits, period, selected = bits.map(() => true)) {
  assert.equal(bits.length, selected.length);
  let wrong = 0;
  const perResidue = [];
  for (let residue = 0; residue < period; residue++) {
    let zero = 0, one = 0;
    for (let i = residue; i < bits.length; i += period) {
      if (!selected[i]) continue;
      if (bits[i]) one++;
      else zero++;
    }
    wrong += Math.min(zero, one);
    perResidue.push({residue, zeros: zero, ones: one});
  }
  return {wrong, perResidue};
}

/** TEA's standard 32 round full-state transition, sum carries over rounds. */
function teaRound(pair, sum, key) {
  let [v0, v1] = pair;
  const nextSum = (sum + DELTA) >>> 0;
  const a = (((v1 << 4) + key[0]) ^
    (v1 + nextSum) ^ ((v1 >>> 5) + key[1])) >>> 0;
  v0 = (v0 + a) >>> 0;
  const b = (((v0 << 4) + key[2]) ^
    (v0 + nextSum) ^ ((v0 >>> 5) + key[3])) >>> 0;
  v1 = (v1 + b) >>> 0;
  return {state: [v0, v1], sum: nextSum};
}

/** XTEA's standard 32 round full-state transition, sum carries over rounds. */
function xteaRound(pair, sum, key) {
  let [v0, v1] = pair;
  const a = ((((v1 << 4) ^ (v1 >>> 5)) + v1) ^
    (sum + key[sum & 3])) >>> 0;
  v0 = (v0 + a) >>> 0;
  const nextSum = (sum + DELTA) >>> 0;
  const b = ((((v0 << 4) ^ (v0 >>> 5)) + v0) ^
    (nextSum + key[(nextSum >>> 11) & 3])) >>> 0;
  v1 = (v1 + b) >>> 0;
  return {state: [v0, v1], sum: nextSum};
}

/**
 * Genuine synthetic round-state plants with hidden arbitrary key and sum.
 * Their q0/q1 constraints must pass exactly; a damaged state must fail.
 */
function controlStates(roundFn, key, initialSum) {
  const result = [];
  let pair = [0xdeadbeef, 0x01234567];
  let sum = initialSum;
  result.push({first: pair[0], second: pair[1], tainted: false});
  for (let i = 0; i < 31; i++) {
    const next = roundFn(pair, sum, key);
    pair = next.state;
    sum = next.sum;
    result.push({first: pair[0], second: pair[1], tainted: false});
  }
  return result;
}

function main() {
  const secret = [0x13579bdf, 0x2468ace0, 0x11223345, 0x89abcdef];
  const initialSum = 0x6a09e667;
  const trueTea = parityTrace(controlStates(teaRound, secret, initialSum));
  const trueXtea = parityTrace(controlStates(xteaRound, secret, initialSum));
  assert.equal(minViolations(trueTea.first, 1).wrong, 0);
  assert.equal(minViolations(trueTea.second, 1).wrong, 0);
  assert.equal(minViolations(trueXtea.first, 4).wrong, 0);

  const originals = sourceLayouts().map(({name, states}) => {
    const measured = parityTrace(states);
    const all = measured.clean.map(() => true);
    return {
      orientation: name,
      tainted_source_rows: states.flatMap((row, i) => row.tainted ? [i] : []),
      untainted_round_pairs: measured.clean.filter(Boolean).length,
      tea_first_all: minViolations(measured.first, 1, all).wrong,
      tea_first_unchanged: minViolations(measured.first, 1, measured.clean).wrong,
      tea_second_all: minViolations(measured.second, 1, all).wrong,
      tea_second_unchanged: minViolations(measured.second, 1, measured.clean).wrong,
      xtea_first_all: minViolations(measured.first, 4, all).wrong,
      xtea_first_unchanged: minViolations(measured.first, 4, measured.clean).wrong,
      q0bits: measured.first.join("")
    };
  });
  assert.equal(originals.length, 16);
  const minima = {
    teaFirstAll: Math.min(...originals.map(r => r.tea_first_all)),
    teaFirstUnchanged: Math.min(...originals.map(r => r.tea_first_unchanged)),
    xteaFirstAll: Math.min(...originals.map(r => r.xtea_first_all)),
    xteaFirstUnchanged: Math.min(...originals.map(r => r.xtea_first_unchanged))
  };
  assert.deepEqual(minima, {
    teaFirstAll: 11, teaFirstUnchanged: 7,
    xteaFirstAll: 7, xteaFirstUnchanged: 5
  });
  assert.ok(originals.every(r => r.tea_first_unchanged > 0 &&
    r.tea_second_unchanged > 0 && r.xtea_first_unchanged > 0));

  return {
    claim: "None of 16 source-visible 32x64-bit readings of the original grid can be 32 consecutive TEA or XTEA round states for any 128-bit secret key, even if five recorded disputed bytes vary arbitrarily.",
    source: "resources/liber-primus/base60-grid.json",
    source_ambiguity_cell_indices: [...POSSIBLY_DISPUTED_PRINTED_BYTE_INDICES],
    key_independent_necessary_conditions: {
      TEA: "Q0[r] = ((nextV0 - V0) xor V1 xor (V1 >>> 5) xor r) & 1 must be constant over r; same for Q1 replacing previous V1 with next V0.",
      XTEA: "Q0[r] must be periodic with period four; the key index (sum & 3) has period four because delta is odd.",
      note: "All hidden 128-bit keys, initial word states, and initial round-sum phases obey these requirements. Reported violations count contradictory round equations, not necessarily byte edits."
    },
    authentic_source_orientations: originals,
    minimum_necessary_equation_mismatches: minima,
    source_native_true_cipher_controls: {
      key_hex: secret.map(x => x.toString(16).padStart(8, "0")),
      initial_sum_hex: initialSum.toString(16),
      tea_first_constant: trueTea.first.every(x => x === trueTea.first[0]),
      tea_second_constant: trueTea.second.every(x => x === trueTea.second[0]),
      xtea_first_4period: trueXtea.first.every((x, i) => x === trueXtea.first[i % 4]),
      synthetic_round_states: 32
    },
    conclusion: "Exact finite-family all-key rejection for direct literal 32-round state traces. Other key schedules, nonlinear encodings, keyed row permutations, cipher output carriers, or larger encryption layers remain outside scope; no unknown LP2 plaintext recovered."
  };
}
if (require.main === module) console.log(JSON.stringify(main(), null, 2));
module.exports = {main, u32, sourceLayouts, parityTrace, minViolations, teaRound, xteaRound};
