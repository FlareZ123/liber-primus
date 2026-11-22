"use strict";
/**
 * Test one source-selected historical LP1 decoder on the independently
 * derived 2016/2017 Fibonacci-prime page route [13,21,34,55].
 *
 * An original LP1 p03-04 additive DIVINITY Vigenere cipher has exactly
 * eight GP29 key runes and a plaintext-F literal bypass. This test gives
 * that *precise cipher family* every possible key-start phase and every
 * possible ambiguous ciphertext-F skip assignment, without fitting
 * ciphertext, plaintext, word length, or a language model.
 *
 * Existence check is a rigorous eight-state DP. A failure is impossible
 * for any GP29 plaintext under this historical codec at that page origin.
 * It does not rule out a different key, page route, or cipher architecture.
 *
 * Run: node sims/lp2_signed2016_route_divinity_allphase_ftransparent_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const book = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const signed2016 = fs.readFileSync(path.join(
  ROOT, "resources/historical/cicada2016-4gq25-outguess.asc"), "utf8");
const signed2017 = fs.readFileSync(path.join(
  ROOT, "resources/historical/cicada2017-yEiTHhvF.asc"), "utf8");
const lp1 = require("./authentic_lp1_p03_p04_vigenere_recovery.cjs");
const key = lp1.key;
assert.deepEqual(key, [23, 10, 1, 10, 9, 10, 16, 26]);
assert(key.every(x => x > 0 && x < 29));
assert(signed2016.includes("their numbers are the direction."));
assert(signed2017.includes("Beware false paths."));
const pages = [13, 21, 34, 55];
const mod = value => (value % 29 + 29) % 29;
/**
 * Authentic LP1 Vigenere with plaintext-F literal interrupter:
 * source 0 copies directly to output 0 without consuming any key symbol.
 * @param {number[]} plaintext
 * @param {number} initialPhase
 * @returns {number[]}
 */
function encrypt(plaintext, initialPhase) {
  let phase = initialPhase;
  return plaintext.map(value => {
    if (value === 0) return 0;
    const cipher = mod(value + key[phase]);
    phase = (phase + 1) % key.length;
    return cipher;
  });
}
/**
 * Count every possible authentic plaintext-F skip mask and key phase at
 * each original position, with NO plaintext assumptions or ranking.
 * C!=0 cannot match K[phase]: the corresponding plaintext would be F,
 * which must instead appear as literal ciphertext-F.
 * C==0 admits either literal F skip or encrypted non-F consumption.
 *
 * @param {number[]} cipher
 * @param {number} initialPhase
 * @returns {{firstImpossible:number|null, solutions:string, terminalPhases:number[]}}
 */
function feasible(cipher, initialPhase) {
  let states = Array(8).fill(0n);
  states[initialPhase] = 1n;
  for (let offset = 0; offset < cipher.length; offset++) {
    const next = Array(8).fill(0n);
    for (let phase = 0; phase < 8; phase++) {
      const count = states[phase];
      if (!count) continue;
      if (cipher[offset] === 0) {
        next[phase] += count; // genuine plaintext F bypass
        next[(phase + 1) % 8] += count; // encrypted non-F hits zero
      } else if (cipher[offset] !== key[phase]) {
        next[(phase + 1) % 8] += count;
      }
    }
    states = next;
    if (states.every(count => count === 0n)) {
      return {firstImpossible: offset, solutions: "0", terminalPhases: []};
    }
  }
  return {
    firstImpossible: null,
    solutions: states.reduce((s, x) => s + x, 0n).toString(),
    terminalPhases: states.flatMap((x, i) => x > 0n ? [i] : [])
  };
}
/**
 * Obtain the full actual GP plaintext strings of every permitted p55
 * phase-5 completion. This operates only on a maximum 3 ciphertext-F
 * positions; all possibilities are enumerated, not language-selected.
 * @param {number[]} cipher
 * @returns {Array<{plaintext:number[],skips:number[],terminalPhase:number}>}
 */
function enumerateP55(cipher) {
  let paths = [{plaintext: [], skips: [], phase: 5}];
  for (let offset = 0; offset < cipher.length; offset++) {
    const next = [];
    for (const old of paths) {
      if (cipher[offset] === 0) {
        next.push({plaintext: old.plaintext.concat(0),
          skips: old.skips.concat(offset), phase: old.phase});
        next.push({plaintext: old.plaintext.concat(mod(-key[old.phase])),
          skips: old.skips, phase: (old.phase + 1) % 8});
      } else if (cipher[offset] !== key[old.phase]) {
        next.push({plaintext: old.plaintext.concat(
          mod(cipher[offset] - key[old.phase])),
          skips: old.skips, phase: (old.phase + 1) % 8});
      }
    }
    paths = next;
  }
  return paths.map(p => ({plaintext: p.plaintext, skips: p.skips,
    terminalPhase: p.phase}));
}

// Historical 515-symbol *original* LP1 source input controls the exact
// key/interrupter semantics. A proposed decoder failing this is unusable.
assert.equal(lp1.cipher.length, 515);
assert.deepEqual(encrypt(lp1.plaintext, 0), lp1.cipher);
assert.notEqual(feasible(lp1.cipher, 0).solutions, "0");
assert.deepEqual(lp1.allRecoveredFs,
  [48, 74, 84, 132, 159, 160, 250, 421, 443, 465, 514]);

// Source-native plants have authentic LP1 plaintext, not generated
// pseudo-English. They exercise the exact target lengths.
const results = [];
for (const page of pages) {
  const original = book.pages[page].indices;
  const plantedPlain = lp1.plaintext.slice(0, original.length);
  assert.equal(plantedPlain.length, original.length);
  const plant = encrypt(plantedPlain, 0);
  const plantWitness = feasible(plant, 0);
  assert.notEqual(plantWitness.solutions, "0");
  const phases = Array.from({length: 8}, (_, start) =>
    ({start, ...feasible(original, start)}));
  const allowed = phases.filter(p => p.solutions !== "0");
  results.push({
    page, runes: original.length,
    ciphertextFPositions: original.flatMap((x, i) => x === 0 ? [i] : []),
    sourceSolvedPlantAccepted: true,
    anyKeyPhaseFeasible: allowed.length > 0,
    allPhaseResults: phases
  });
}
assert.deepEqual(results.map(x => x.runes), [272, 273, 261, 76]);
assert.deepEqual(results.map(x => x.anyKeyPhaseFeasible),
  [false, false, false, true]);
assert.deepEqual(results.map(x => x.allPhaseResults
  .map(p => p.firstImpossible)), [
  [23, 33, 33, 226, 226, 25, 25, 13],
  [60, 32, 7, 9, 7, 3, 7, 60],
  [9, 11, 2, 5, 9, 12, 16, 12],
  [3, 75, 3, 75, 12, null, 3, 75]
]);
const p55Original = book.pages[55].indices;
const p55Paths = enumerateP55(p55Original);
assert.equal(p55Paths.length, 2);
assert.deepEqual(p55Paths.map(x => x.skips), [[15], [25]]);
for (const witness of p55Paths) {
  assert.deepEqual(encrypt(witness.plaintext, 5), p55Original);
}
const output = {
  classification: "Strict historical DIVINITY F-transparent reuse is impossible on 3/4 independently selected LP2 pages, irrespective of phase or any literal-F skip mask",
  selectedBySignedFibonacci2016Route: pages,
  historicalLP1KeyGp29: key,
  originalLP1Positive: {runes: lp1.cipher.length,
    originalExactForwardReplay: true, DPRecoveredFeasible: true,
    nativeSkippedF: lp1.allRecoveredFs},
  pageResults: results,
  survivingP55Witnesses: p55Paths.map(x => ({
    startPhase: 5, terminalPhase: x.terminalPhase,
    transparentFAt: x.skips,
    GP: x.plaintext.map(v => book.translit[v]).join("")
  })),
  interpretation: "Original p13, p21 and p34 cannot be ciphertext of the exact LP1 DIVINITY-key, plaintext-F-bypass codec under any key-start phase. Only p55 has two algebraically feasible but nonlinguistic original candidates (phase5). This rejects one direct source-linked historical key transfer, not the signed Fibonacci route itself or any other encryption."
};
console.log(JSON.stringify(output, null, 2));
