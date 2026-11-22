"use strict";
/**
 * Original-source 13x256 red-ordinal checksum and frozen 256-step key test.
 * Run with Node.js 22 from the repository root.
 * Source arithmetic only. No recovered LP2 plaintext or authenticated key.
 * This program reads shared source JSON and writes no files.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const {events, transform, ioc} = require("./red_256_event_key_inverse.cjs");

const root = path.resolve(__dirname, "..");
const load = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const corpus = load("resources/liber-primus/lp2-corpus.json");
const ink = load("resources/liber-primus/lp2-ink-annotations.json");
const grid = load("resources/liber-primus/base60-grid.json").byte_rows.flat();

/** Original 256 events: 225 one-based GP ordinals, 31 zero stencils. */
function sourceWalk() {
  const stream = events();
  assert.equal(stream.length, 256);
  assert.equal(stream.filter(e => e.kind === 1).length, 225);
  assert.equal(stream.filter(e => e.kind === 0).length, 31);
  const weights = stream.map(e => e.kind ? e.value + 1 : 0);
  const sum = weights.reduce((a, b) => a + b, 0);
  assert.equal(sum, 3328);
  assert.equal(sum, 13 * stream.length);
  assert.equal(sum - 225, 3103);
  const states = [0];
  for (const weight of weights)
    states.push((states.at(-1) + weight - 13 + 256) % 256);
  assert.equal(states.length, 257);
  assert.equal(states.at(-1), 0);
  const distinct = new Set(states.slice(0, -1)).size;
  assert.equal(distinct, 97);
  assert.equal(corpus.pages[54].indices[0], 24);
  assert.equal(corpus.prime[24], 97);
  assert.equal(states.indexOf(0, 1), 8);
  return {stream, weights, states, sum, distinct};
}

/**
 * Independently circularly rotate each red mask within its original page.
 * Page runes, red span lengths, stencil positions and event order are held.
 * This is a conditional control and does not correct for clue discovery.
 * @param {Array<{page:number,offset:number,kind:number}>} stream
 * @param {number} trials
 */
function pageRotationNull(stream, trials = 300000) {
  const marked = ink.pages.filter(p => (p.red_spans || []).length > 0)
    .map(p => ({page: p.page, runes: corpus.pages[p.page].indices}));
  const lookup = new Map(marked.map((p, i) => [p.page, i]));
  const entries = stream.map(e => ({
    kind: e.kind, offset: e.offset, pageId: lookup.get(e.page)
  }));
  let seed = 0x13256301;
  function next() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  }
  const shifts = new Uint32Array(marked.length);
  const primes = new Set(corpus.prime);
  let exactSum = 0, exact97 = 0, joint = 0, anyPrimeAndSum = 0;
  let modularClosure = 0;
  for (let t = 0; t < trials; t++) {
    for (let j = 0; j < marked.length; j++)
      shifts[j] = next() % marked[j].runes.length;
    let sum = 0, state = 0, distinct = 0;
    const seen = new Uint8Array(256);
    for (const e of entries) {
      if (!seen[state]) { seen[state] = 1; distinct++; }
      let weight = 0;
      if (e.kind) {
        const page = marked[e.pageId];
        weight = page.runes[(e.offset + shifts[e.pageId]) % page.runes.length] + 1;
      }
      sum += weight;
      state = (state + weight - 13 + 256) % 256;
    }
    const sumMatches = sum === 3328;
    exactSum += Number(sumMatches);
    exact97 += Number(distinct === 97);
    joint += Number(sumMatches && distinct === 97);
    anyPrimeAndSum += Number(sumMatches && primes.has(distinct));
    modularClosure += Number(state === 0);
  }
  const plusOne = n => (n + 1) / (trials + 1);
  if (trials === 300000)
    assert.deepEqual([exactSum, exact97, joint, anyPrimeAndSum,
      modularClosure], [1114, 2138, 22, 139, 1274]);
  return {
    trials, seedInitial: "0x13256301", preservedRedPages: marked.length,
    exactSum, exact97, joint, anyPrimeAndSum, modularClosure,
    conditionalPlusOne: {
      exactSum: plusOne(exactSum),
      exact97: plusOne(exact97),
      exactSumAndAcPrime: plusOne(joint),
      exactSumAndAnyGpPrime: plusOne(anyPrimeAndSum)
    }
  };
}

/**
 * Source walk indexes into unchanged 256-cell table. The sixteen fixed
 * GP29 additive modes choose before/after update, byte reduction, sign,
 * and continuous versus physical-page key clock.
 * Exact reencryption and solved-p57 plants validate implementation only.
 * @param {number[]} states
 */
function directGridInverse(states) {
  assert.equal(grid.length, 256);
  assert.equal(
    crypto.createHash("sha256").update(Buffer.from(grid)).digest("hex"),
    "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
  );
  const original = corpus.pages.filter(p => p.page < 56)
    .flatMap(p => p.indices);
  assert.equal(original.length, 12956);
  const solvedP57 = corpus.pages[57].indices;
  assert.equal(solvedP57.length, 95);
  const native = Array.from({length: original.length},
    (_, i) => solvedP57[i % solvedP57.length]);
  const candidates = [];
  for (const [position, offsets] of [
    ["before", states.slice(0, -1)], ["after", states.slice(1)]
  ]) {
    for (const reducer of ["mod29", "scaled29"]) {
      const key = offsets.map(x => reducer === "mod29"
        ? grid[x] % 29 : Math.floor(grid[x] * 29 / 256));
      for (const sign of [-1, 1]) for (const reset of ["book", "page"]) {
        const mode = {family: "add", sign, reset};
        const decoded = transform(original, key, mode, false);
        assert.deepEqual(transform(decoded, key, mode, true), original);
        const synthetic = transform(native, key, mode, true);
        assert.deepEqual(transform(synthetic, key, mode, false), native);
        candidates.push({
          position, reducer, sign, reset,
          recoveredIoC: ioc(decoded),
          first80: decoded.slice(0, 80).map(x => corpus.translit[x]).join("")
        });
      }
    }
  }
  assert.equal(candidates.length, 16);
  candidates.sort((a, b) => b.recoveredIoC - a.recoveredIoC);
  assert(candidates[0].recoveredIoC < 0.036);
  return {
    ciphertextRunes: original.length,
    candidateCount: candidates.length,
    originalIoC: ioc(original),
    solvedP57RepeatedPlantIoC: ioc(native),
    exactOriginalReencryption: 16 * original.length,
    exactSolvedP57PlantedRecovery: 16 * original.length,
    best: candidates[0], worst: candidates.at(-1),
    noOriginalPlaintextRecovered: true
  };
}

function run() {
  const walk = sourceWalk();
  return {
    classification: "new source arithmetic and bounded negative; no unknown LP2 plaintext",
    source: {
      redRunes: 225, thirteenDotMarks: 31, totalInkEvents: 256,
      sumOneBasedGpRed: walk.sum, identity: "3328 = 13 * 256",
      centeredWalkFinalState: walk.states.at(-1),
      distinctPreEventStates: walk.distinct,
      enlargedAcGpIndex: 24, enlargedAcGpPrime: corpus.prime[24],
      firstReturnEventIndex: 8,
      preEventStatesFirst32: walk.states.slice(0, 32),
      tableIsPermutationTraversal: walk.distinct === 256
    },
    conditionalPageRotationNull: pageRotationNull(walk.stream),
    directOriginalGridKeyTest: directGridInverse(walk.states)
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {sourceWalk, pageRotationNull, directGridInverse, run};
