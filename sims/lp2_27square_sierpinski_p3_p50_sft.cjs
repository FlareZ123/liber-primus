"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

/** @param {number} row @param {number} col @returns {boolean} */
function isCarpetHole(row, col) {
  for (let scale = 1; scale <= 9; scale *= 3) {
    const r = Math.floor(row / scale) % 3;
    const c = Math.floor(col / scale) % 3;
    if (r === 1 && c === 1) return true;
  }
  return false;
}

/** @param {number[]} a @param {number[]} b @returns {number} */
function identical(a, b) {
  assert.equal(a.length, b.length);
  return a.reduce((sum, n, i) => sum + Number(n === b[i]), 0);
}

/** @param {number[]} a @param {number[]} b @returns {number} */
function frequencyL1(a, b) {
  const fa = Array(29).fill(0);
  const fb = Array(29).fill(0);
  a.forEach(n => fa[n]++);
  b.forEach(n => fb[n]++);
  return fa.reduce((sum, n, i) => sum + Math.abs(n - fb[i]), 0);
}


/**
 * Identify two equal inputs yielding unequal outputs. A single such pair
 * disproves every deterministic memoryless mapping of this input type.
 * @template T
 * @param {T[]} inputs
 * @param {number[]} outputs
 * @returns {{earlier:number,later:number,input:T,outputs:number[]}|null}
 */
function firstFunctionalConflict(inputs, outputs) {
  const seen = new Map();
  for (let i=0; i<inputs.length; i++) {
    const label = JSON.stringify(inputs[i]);
    if (seen.has(label)) {
      const j = seen.get(label);
      if (outputs[i] !== outputs[j]) {
        return {earlier:j, later:i, input:inputs[i],
          outputs:[outputs[j],outputs[i]]};
      }
    } else {
      seen.set(label,i);
    }
  }
  return null;
}

/** Deterministic original-input gate for a proposed 27x27 ternary-carpet bridge. */
function main() {
  const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
    "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
  const grid = JSON.parse(fs.readFileSync(path.join(ROOT,
    "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));

  const opening = corpus.pages.filter(p => p.page >= 0 && p.page <= 2)
    .flatMap(p => p.indices);
  const p3 = corpus.pages.find(p => p.page === 3).indices;
  const table = grid.pages.flatMap(p => p.bytes);

  assert.equal(opening.length, 729);
  assert.equal(p3.length, 217);
  assert.equal(table.length, 256);

  const holes = [];
  const kept = [];
  const levels = [0, 0, 0];
  for (let i = 0; i < 729; i++) {
    const row = Math.floor(i / 27);
    const col = i % 27;
    if (isCarpetHole(row, col)) {
      holes.push(opening[i]);
      for (let j = 2; j >= 0; j--) {
        const scale = 3 ** j;
        if (Math.floor(row / scale) % 3 === 1
            && Math.floor(col / scale) % 3 === 1) {
          levels[2 - j]++;
          break;
        }
      }
    } else {
      kept.push(opening[i]);
    }
  }
  assert.deepEqual(levels, [81, 72, 64]);
  assert.equal(holes.length, 217);
  assert.equal(kept.length, 512);

  const pairs = Array.from({length:256}, (_, i) =>
    [kept[2*i], kept[2*i+1]]);
  const reflectedPairs = [];
  for (let i=0;i<729;i++) {
    if (i>=728-i || isCarpetHole(Math.floor(i/27),i%27)) continue;
    reflectedPairs.push([opening[i],opening[728-i]]);
  }
  assert.equal(reflectedPairs.length,256);
  const fixedSubstitutionConflict = firstFunctionalConflict(holes, p3);
  const consecutivePairConflict = firstFunctionalConflict(pairs,table);
  const reflectionPairConflict = firstFunctionalConflict(reflectedPairs,table);
  const bigEndian = pairs.map(([a,b]) => (29*a+b) % 256);
  const littleEndian = pairs.map(([a,b]) => (a+29*b) % 256);
  const primeSum = pairs.map(([a,b]) => corpus.prime[a]+corpus.prime[b]);
  const subtract = p3.map((v,i) => (v-holes[i]+29) % 29);
  const printable = subtract.slice(0,90).map(v=>corpus.translit[v]).join("");

  const result = {
    shape:"27x27",
    chapterRunes:opening.length,
    removedByLevel:levels,
    removedRunes:holes.length,
    retainedRunes:kept.length,
    nextPageRunes:p3.length,
    tableBytes:table.length,
    p3VersusRemoved: {
      stationarySubstitutionContradiction:fixedSubstitutionConflict,
      equalAtSameOffset:identical(p3, holes),
      frequencyL1:frequencyL1(p3, holes),
      addFixed23Equal:identical(p3, holes.map(v=>(v+23)%29)),
      subtractSample90:printable
    },
    retainedPairsVersusP50: {
      consecutivePairEncoderContradiction:consecutivePairConflict,
      reflectedPairEncoderContradiction:reflectionPairConflict,
      base29BigModulo256Equal:identical(bigEndian, table),
      base29LittleModulo256Equal:identical(littleEndian, table),
      gpPrimePairSumEqual:identical(primeSum, table)
    },
    interpretation:"Count matches; no full-cipher inverse or plaintext is established."
  };
  assert.deepEqual(fixedSubstitutionConflict,{earlier:1,later:3,input:10,outputs:[11,8]});
  assert.deepEqual(consecutivePairConflict,{earlier:3,later:24,input:[27,0],outputs:[186,109]});
  assert.deepEqual(reflectionPairConflict,{earlier:19,later:28,input:[22,11],outputs:[33,150]});
  assert.equal(result.p3VersusRemoved.equalAtSameOffset, 10);
  assert.equal(result.p3VersusRemoved.frequencyL1, 82);
  assert.equal(result.p3VersusRemoved.addFixed23Equal, 8);
  assert.equal(result.retainedPairsVersusP50.base29BigModulo256Equal, 1);
  assert.equal(result.retainedPairsVersusP50.base29LittleModulo256Equal, 1);
  assert.equal(result.retainedPairsVersusP50.gpPrimePairSumEqual, 2);
  process.stdout.write(JSON.stringify(result,null,2)+"\n");
}
if (require.main===module) main();
module.exports={isCarpetHole, identical, frequencyL1, firstFunctionalConflict};
