"use strict";
/**
 * Source-corrected LP2 base-60 AES/ChaCha key inversion.
 *
 * Eight 32-byte vertical columns are candidate source keys. We compare
 * the canonical transcription against five independently audited cells
 * without changing the shared original fixture. Fit all 16 cipher/mode/sign
 * families and 8! exact assignments on the first 300 runes in each section;
 * freeze parameters and score the next 300 authentic unknown runes.
 *
 * Positive control encrypts native GP-English under the corrected original
 * source keys and exactly decodes all 12,956 planted runes.
 *
 * Run: node sims/grid_five_cell_corrected_inversion.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {inputs, correctedGridColumns, cipherBytes, ioc, evaluate, plant} =
  require("./grid_section_column_keys.cjs");
const {encode} = require("./grid_keyskip_viterbi.cjs");
const {seededRandom} = require("./outer_permutation_assignment.cjs");

const ROOT = path.join(__dirname, "..");
const N = 29, TRAIN = 300, HOLD = 300, SHUFFLES = 40;
const mod = x => (x % N + N) % N;

/** @param {number[][]} groups */
function prefixes(groups) {
  return groups.map(g => g.slice(0, TRAIN));
}

/**
 * Score fixed trained cipher family and assignment on independent positions.
 * CTR/ChaCha pointer is continuous through the train/hold boundary.
 * @param {number[][]} groups
 * @param {number[][]} columns
 * @param {{algorithm:string,reverse:boolean,scaled:boolean,sign:number,assignment:number[]}} model
 */
function frozenHold(groups, columns, model) {
  let score = 0, n = 0;
  for (let s = 0; s < groups.length; s++) {
    const group = groups[s], col = columns[model.assignment[s]];
    const key = model.reverse ? col.slice().reverse() : col;
    const pad = cipherBytes(key, model.algorithm, TRAIN + HOLD);
    const c = group.slice(TRAIN, TRAIN + HOLD);
    assert.equal(c.length, HOLD);
    const p = pad.subarray(TRAIN, TRAIN + HOLD);
    score += HOLD * ioc(c, p, model.sign, model.scaled);
    n += HOLD;
  }
  return score / n;
}

/** @param {number[][]} groups @param {number[][]} columns */
function evaluateSource(groups, columns) {
  const fit = evaluate(prefixes(groups), columns).winner;
  return {
    model: {
      algorithm: fit.algorithm, reverse: fit.reverse, scaled: fit.scaled,
      sign: fit.sign, assignment: fit.assignment
    },
    trainIoC: fit.optimum,
    holdIoC: frozenHold(groups, columns, fit)
  };
}

/** @param {number[][]} columns @param {()=>number} rng */
function shuffled(columns, rng) {
  return columns.map(col => {
    const c = col.slice();
    for (let i = c.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [c[i], c[j]] = [c[j], c[i]];
    }
    return c;
  });
}

/**
 * Exact original-key AES additive positive. Output intentionally lacks a
 * synthetic no-doublet rewrite to permit full forward re-encryption; the
 * separate existing plant() covers an 81%-repair case.
 * @param {number[][]} groups
 * @param {number[][]} columns
 */
function positiveControl(groups, columns) {
  const raw = fs.readFileSync(path.join(ROOT,
    "resources/control/shakespeare_first300k.txt"), "utf8");
  const english = encode(raw);
  let pos = 0;
  const cipherGroups = [], plainGroups = [];
  for (let s = 0; s < groups.length; s++) {
    const n = groups[s].length;
    const plain = english.slice(pos, pos + n);
    assert.equal(plain.length, n);
    const key = cipherBytes(columns[s], "aes-256-ctr", n);
    cipherGroups.push(plain.map((p,i) => mod(p + key[i] % N)));
    plainGroups.push(plain);
    pos += n;
  }
  const fit = evaluateSource(cipherGroups, columns);
  const known = {
    algorithm:"aes-256-ctr",reverse:false,scaled:false,sign:-1,
    assignment:Array.from({length:8},(_,i)=>i)
  };
  const knownHeldIoC = frozenHold(cipherGroups, columns, known);
  const oldFitHeld = frozenHold(cipherGroups, inputs().columnKeys, known);
  let equal = 0;
  for (let s = 0; s < 8; s++) {
    const pad = cipherBytes(columns[s], "aes-256-ctr", plainGroups[s].length);
    for (let i = 0; i < plainGroups[s].length; i++) {
      const recovered = mod(cipherGroups[s][i] - pad[i] % N);
      if (recovered === plainGroups[s][i]) equal++;
    }
  }
  assert.equal(equal, pos);
  assert.ok(knownHeldIoC > 0.045,
    "native GP-English control must show strong predicted symbol statistics");
  return {
    symbolsRoundTripped:equal, plantedRuneCount:pos, knownHeldIoC,
    oldSourceWrongKeyHeldIoC:oldFitHeld,
    trainedModel:fit.model, trainedHeldIoC:fit.holdIoC,
    correctModelRecovered:fit.model.algorithm === "aes-256-ctr" &&
      fit.model.reverse === false && fit.model.scaled === false &&
      fit.model.sign === -1 &&
      fit.model.assignment.every((c,i)=>c===i)
  };
}

function main() {
  assert.notEqual(process.env.LP2_GRID_FIVE_CORRECTIONS, "1",
    "Run this paired screen without the opt-in environment overlay");
  const {groups, columnKeys} = inputs();
  const corrected = correctedGridColumns(columnKeys);
  const baseline = evaluateSource(groups, columnKeys);
  const repaired = evaluateSource(groups, corrected);
  const native = positiveControl(groups, corrected);
  const repairedPlant = plant(groups, corrected);
  const rng = seededRandom(0x3301a9);
  const nullScores = [];
  for (let i = 0; i < SHUFFLES; i++)
    nullScores.push(evaluateSource(groups, shuffled(corrected, rng)).holdIoC);
  const nullBetter = nullScores.filter(x=>x>=repaired.holdIoC).length;
  const out = {
    research:"five-cell corrected table against original LP2 source",
    source: "pnotisdev/cicada3301/work/ref/lp_master.txt (2026-10-21 audit)",
    correctedCellIndices:[45,50,165,172,246],
    affectedColumns:[2,4,5,6],
    samples:{sections:8,trainingRunes:8*TRAIN,unseenRunes:8*HOLD},
    canonical:baseline,corrected:repaired,positive:native,
    repairedPlant,
    shuffledNull:{
      samples:SHUFFLES,
      heldMean:nullScores.reduce((a,b)=>a+b,0)/SHUFFLES,
      heldMin:Math.min(...nullScores),heldMax:Math.max(...nullScores),
      outrank: nullBetter,
      upperTail:(nullBetter+1)/(SHUFFLES+1)
    },
    conclusion:repaired.holdIoC>0.045 && nullBetter<2 ?
      "candidate requires further exact inverse validation" :
      "no direct-additive plaintext signal under source correction"
  };
  console.log(JSON.stringify(out,null,2));
}

if (require.main === module) main();
module.exports = {frozenHold, evaluateSource, positiveControl, main};
