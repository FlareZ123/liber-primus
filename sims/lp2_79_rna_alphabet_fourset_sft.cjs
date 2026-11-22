"use strict";
/**
 * Source-frozen 79-step biological alphabet discriminator.
 * 79 is visible in the original p15 Fibonacci-prime spiral and bounds
 * the source-original p36-p38 seven-clock ten-dot enclosure.
 * Enumerate ALL 29-choose-4 subsets, without optimizing source coordinates.
 * This measures a symbol-set observation only, not a protein decoder.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const book = JSON.parse(fs.readFileSync(path.join(__dirname, "..",
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const all = book.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(all.length, 12956);
const phaseMasks = Array.from({length:79}, () => new Set());
function popcount(value) {
  let result = 0;
  for (let x = value; x !== 0; x &= x - 1) result++;
  return result;
}
for (let phase = 0; phase < 79; phase++) {
  const stream = [];
  for (let i = phase; i < all.length; i += 79) stream.push(all[i]);
  for (let i = 0; i + 7 <= stream.length; i++) {
    let mask = 0;
    for (let j = 0; j < 7; j++) mask |= 1 << stream[i + j];
    if (popcount(mask) <= 4) phaseMasks[phase].add(mask);
  }
}
const quartet = ["A", "U", "G", "C"].map(v => book.translit.indexOf(v));
assert.ok(quartet.every(v => v >= 0 && v < 29));
const quartetMask = quartet.reduce((m, v) => m | 1 << v, 0);
const present = (mask, allMasks) => allMasks.some(s => (mask & s) === s);
const globalMasks = [...new Set(phaseMasks.flatMap(s => [...s]))];
const specificMasks = [...phaseMasks[35]];
let total = 0, fixed = 0, any = 0;
for (let i = 0; i < 26; i++)
  for (let j = i + 1; j < 27; j++)
    for (let k = j + 1; k < 28; k++)
      for (let l = k + 1; l < 29; l++) {
        const mask = (1 << i) | (1 << j) | (1 << k) | (1 << l);
        total++;
        fixed += Number(present(mask, specificMasks));
        any += Number(present(mask, globalMasks));
      }
assert.equal(total, 23751);
assert.equal(fixed, 3);
assert.equal(any, 273);
assert.equal(present(quartetMask, specificMasks), true);
assert.equal(present(quartetMask, globalMasks), true);
const s = Array.from({length: 8}, (_, j) => book.translit[all[8804 + 79*j]]);
assert.deepEqual(s, ["H", "U", "A", "A", "U", "A", "G", "C"]);
const literalBases = new Set(quartet);
const peaks = [];
for (let p = 0; p < 79; p++) {
  let best = 0, current = 0;
  for (let i = p; i < all.length; i += 79) {
    current = literalBases.has(all[i]) ? current + 1 : 0;
    best = Math.max(best, current);
  }
  peaks.push(best);
}
assert.equal(peaks[35], 7);
assert.equal(peaks.filter(v => v >= 7).length, 1);
assert.equal(Math.max(...peaks.filter((_, i) => i !== 35)), 5);
console.log(JSON.stringify({
  originalFixedPhase:35, selected79Stream:s.join(""),
  originalRNABaseLongest:7, otherPhasesLongest:5,
  numberOfFourSymbolAlphabets:total,
  fourSymbolAlphabetsWithSevenRunOnFixedPhase:fixed,
  fourSymbolAlphabetsWithSevenRunOnAny79Phase:any,
  biologicalAlphabetOneOfThree:true,
  semanticFrameAuthenticated:false, plaintextRecovered:false
},null,2));
