"use strict";

/**
 * Conditional p0 crib gate for evolving p50-driven rank-28 state machines.
 *
 * This test does not assert that the three p0 phrase placements are plaintext.
 * It asks whether a compact evolving state, motivated by LP2's near-uniform
 * nonzero modular predecessor steps and the 256-cell p50 table, can explain
 * all three conditional phrase islands without fitting a long key.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(
  fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8")
);
const grid = JSON.parse(
  fs.readFileSync(path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8")
);

const p0 = corpus.pages.find((page) => page.page === 0).indices;
const table = grid.pages.flatMap((page) => page.bytes);
assert.equal(p0.length, 262);
assert.equal(table.length, 256);

const ordered = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/**
 * @param {string} word
 * @returns {number[]}
 */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = ordered.find((candidate) =>
      normalized.startsWith(candidate.symbol, i)
    );
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(i));
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}

const expected = new Map();
for (const [start, phrase] of [
  [0, "EPIPHANY SEEKS"],
  [103, "THE ROAD"],
  [235, "THE DEVOTED"],
]) {
  const values = phrase.split(/\s+/).flatMap(gp);
  values.forEach((value, i) => expected.set(start + i, value));
}
assert.equal(expected.size, 28);

const constraints = [...expected.keys()].filter((position) => position > 0);
assert.equal(constraints.length, 27);
assert.ok(
  constraints.every((position) =>
    (p0[position] - p0[position - 1] + 29) % 29 !== 0
  )
);

const dlog15 = new Map();
let power = 1;
for (let exponent = 0; exponent < 28; exponent += 1) {
  assert.equal(dlog15.has(power), false);
  dlog15.set(power, exponent);
  power = (power * 15) % 29;
}
assert.equal(power, 1);
assert.equal(dlog15.size, 28);

/**
 * @param {number} difference
 * @param {"cyclic"|"dlog15"} mode
 * @returns {number}
 */
function cipherRank(difference, mode) {
  assert.ok(difference >= 1 && difference <= 28);
  if (mode === "cyclic") return difference - 1;
  return dlog15.get(difference);
}

/**
 * @param {number} plain
 * @param {"EA_sentinel"|"F_sentinel"} mode
 * @returns {number}
 */
function plainRank(plain, mode) {
  if (mode === "EA_sentinel") {
    assert.notEqual(plain, 28);
    return plain;
  }
  assert.notEqual(plain, 0);
  return plain - 1;
}

/**
 * @param {number} value
 * @param {"mod28"|"scaled28"} mode
 * @returns {number}
 */
function reduceKey(value, mode) {
  return mode === "mod28" ? value % 28 : Math.floor(value * 28 / 256);
}

/**
 * @param {number} state
 * @param {number} difference
 * @param {number} rank
 * @param {string} template
 * @returns {[number,number]}
 */
function evolve(state, difference, rank, template) {
  if (template === "T_splusd_post") {
    const next = table[(state + difference) & 255];
    return [next, next];
  }
  if (template === "T_splusr_post") {
    const next = table[(state + rank) & 255];
    return [next, next];
  }
  if (template === "Ts_plusd_post") {
    const next = (table[state] + difference) & 255;
    return [next, next];
  }
  if (template === "Ts_plusr_post") {
    const next = (table[state] + rank) & 255;
    return [next, next];
  }
  if (template === "T_splusd_pre") {
    return [table[(state + difference) & 255], state];
  }
  if (template === "T_splusr_pre") {
    return [table[(state + rank) & 255], state];
  }
  if (template === "Ts_then_plusd_emitTs") {
    const value = table[state];
    return [(value + difference) & 255, value];
  }
  if (template === "Ts_then_plusr_emitTs") {
    const value = table[state];
    return [(value + rank) & 255, value];
  }
  assert.equal(template, "T_s_autonomous_post");
  const next = table[state];
  return [next, next];
}

const templates = [
  "T_splusd_post",
  "T_splusr_post",
  "Ts_plusd_post",
  "Ts_plusr_post",
  "T_splusd_pre",
  "T_splusr_pre",
  "Ts_then_plusd_emitTs",
  "Ts_then_plusr_emitTs",
  "T_s_autonomous_post",
];

/**
 * @param {object} config
 * @param {number} seed
 * @returns {{score:number,hits:number[]}}
 */
function scoreSeed(config, seed) {
  let state = seed;
  let score = 0;
  const hits = [];

  for (let position = 1; position < p0.length; position += 1) {
    const difference = (p0[position] - p0[position - 1] + 29) % 29;
    const rank = difference === 0
      ? 0
      : cipherRank(difference, config.cipherRank);

    const [nextState, keyValue] = evolve(
      state,
      difference,
      rank,
      config.template
    );
    state = nextState;

    if (!expected.has(position) || difference === 0) continue;
    const predicted = (
      rank +
      config.sign * reduceKey(keyValue, config.reducer) +
      56
    ) % 28;
    if (predicted === plainRank(expected.get(position), config.plainRank)) {
      score += 1;
      hits.push(position);
    }
  }
  return { score, hits };
}

const families = [];
for (const cipherRankMode of ["cyclic", "dlog15"]) {
  for (const plainRankMode of ["EA_sentinel", "F_sentinel"]) {
    for (const template of templates) {
      for (const reducer of ["mod28", "scaled28"]) {
        for (const sign of [-1, 1]) {
          const config = {
            cipherRank: cipherRankMode,
            plainRank: plainRankMode,
            template,
            reducer,
            sign,
          };
          let best = -1;
          let seeds = [];
          for (let seed = 0; seed < 256; seed += 1) {
            const result = scoreSeed(config, seed);
            if (result.score > best) {
              best = result.score;
              seeds = [seed];
            } else if (result.score === best) {
              seeds.push(seed);
            }
          }
          families.push({
            ...config,
            best,
            seeds,
            seed0: scoreSeed(config, 0).score,
            seed80: scoreSeed(config, 80).score,
            seed229: scoreSeed(config, 229).score,
          });
        }
      }
    }
  }
}

assert.equal(families.length, 144);
families.sort((a, b) => b.best - a.best);
assert.deepEqual(
  {
    best: families[0].best,
    cipherRank: families[0].cipherRank,
    plainRank: families[0].plainRank,
    template: families[0].template,
    reducer: families[0].reducer,
    sign: families[0].sign,
    seeds: families[0].seeds,
  },
  {
    best: 8,
    cipherRank: "cyclic",
    plainRank: "EA_sentinel",
    template: "T_splusr_post",
    reducer: "mod28",
    sign: -1,
    seeds: [151, 197],
  }
);

for (const seed of [151, 197]) {
  assert.deepEqual(scoreSeed(families[0], seed).hits, [
    1, 2, 10, 12, 108, 236, 238, 241,
  ]);
}
assert.equal(families[0].seed229, 4);

console.log(JSON.stringify({
  status: "PASS",
  candidateConstraints: constraints.length,
  familyCount: families.length,
  seededModels: families.length * 256,
  best: families[0],
  bestHits: scoreSeed(families[0], 151).hits,
  decision:
    "no compact p50-driven evolving rank-28 state in this frozen family explains the three conditional p0 phrase islands",
}, null, 2));
