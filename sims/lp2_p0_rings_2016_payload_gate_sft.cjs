"use strict";

/**
 * Original LP2 opening 27×27 nested-ring arithmetic against the signed 2016 message.
 * The geometry and two arithmetic coincidences are provisional. No cipher is decoded.
 * Run using Node 22 from the repository root.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {Buffer} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative));
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json").toString("utf8"));
const source = corpus.pages.filter(p => p.page <= 2).flatMap(p => p.indices);
const p32 = corpus.pages.find(p => p.page === 32).indices;
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
assert.equal(source.length, 729);
assert.equal(p32.length, 121);
assert.equal(signed2016.length, 1136);

/**
 * Return the unmodified clockwise boundary, top-left first.
 * @param {number[]} page @param {number} width @param {number} depth
 * @returns {number[]}
 */
function ring(page, width, depth) {
  const result = [];
  const top = depth;
  const last = width - depth - 1;
  for (let x = top; x <= last; x++) result.push(page[width * top + x]);
  for (let y = top + 1; y <= last; y++) result.push(page[width * y + last]);
  for (let x = last - 1; x >= top; x--) result.push(page[width * last + x]);
  for (let y = last - 1; y > top; y--) result.push(page[width * y + top]);
  return result;
}

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

const squareRings = Array.from({ length: 14 }, (_, depth) => ring(source, 27, depth));
const indexSums = squareRings.map(sum);
const primeSums = squareRings.map(r => sum(r.map(v => corpus.prime[v])));
assert.deepEqual(squareRings.map(r => r.length),
  [104, 96, 88, 80, 72, 64, 56, 48, 40, 32, 24, 16, 8, 1]);
assert.equal(indexSums[3], signed2016.length);
assert.equal(primeSums[5], 3302);
assert.equal(primeSums[13], 79);
assert.equal(source[13 * 27 + 13], 21);

// A second source-fixed 1136 sum was already independently known:
// the p32 central 5×5 perimeter's sixteen GP-prime weights.
const p32Ring = ring(p32, 11, 3).map(v => corpus.prime[v]);
assert.equal(p32Ring.length, 16);
assert.equal(sum(p32Ring), signed2016.length);

// Direct segmentation prediction: five p0 ring3 index lengths for each
// of the sixteen p32 perimeter widths. This correspondence does not hold.
const r80 = squareRings[3];
const grouped = Array.from({ length: 16 }, (_, i) => sum(r80.slice(5 * i, 5 * i + 5)));
const anchoredMatches = grouped.filter((v, i) => v === p32Ring[i]).length;
assert.equal(anchoredMatches, 1);
let best = 0;
for (const direction of [1, -1]) {
  for (let start = 0; start < 80; start++) {
    const w = Array.from({ length: 16 }, (_, i) => {
      let total = 0;
      for (let k = 0; k < 5; k++) {
        total += r80[(start + direction * (5 * i + k) + 480) % 80];
      }
      return total;
    });
    for (let shift = 0; shift < 16; shift++) {
      for (const flip of [1, -1]) {
        const hits = w.filter((v, i) => v === p32Ring[(shift + flip * i + 160) % 16]).length;
        if (hits > best) best = hits;
      }
    }
  }
}
assert.equal(best, 2);

// Conditional matched-multiset null. All runes and rune frequencies are
// conserved; only the 729 cells are randomly reassigned, once per trial.
// This is NOT a discovery-wide p-value because metrics and ring depths
// were noticed after looking at the original numbers.
let state = 0x27113679;
/** @returns {number} */
function nextU32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const trials = 150000;
const shuffled = source.slice();
const ringOf = Array.from({ length: 729 }, (_, i) => {
  const y = Math.floor(i / 27);
  const x = i % 27;
  return Math.min(x, y, 26 - x, 26 - y);
});
const events = {
  fixedIndex1136: 0, fixedPrime3302: 0, fixedCenter79: 0,
  fixedBoth: 0, fixedAllThree: 0, anyIndex1136: 0,
  anyPrime3302: 0, anyBoth: 0, anyAllThree: 0,
};
for (let trial = 0; trial < trials; trial++) {
  for (let i = 728; i > 0; i--) {
    const k = nextU32() % (i + 1);
    const t = shuffled[i];
    shuffled[i] = shuffled[k];
    shuffled[k] = t;
  }
  const iSum = new Array(14).fill(0);
  const pSum = new Array(14).fill(0);
  for (let i = 0; i < 729; i++) {
    const depth = ringOf[i];
    iSum[depth] += shuffled[i];
    pSum[depth] += corpus.prime[shuffled[i]];
  }
  const a = iSum[3] === 1136;
  const b = pSum[5] === 3302;
  const c = shuffled[13 * 27 + 13] === 21;
  const aa = iSum.includes(1136);
  const bb = pSum.includes(3302);
  if (a) events.fixedIndex1136++;
  if (b) events.fixedPrime3302++;
  if (c) events.fixedCenter79++;
  if (a && b) events.fixedBoth++;
  if (a && b && c) events.fixedAllThree++;
  if (aa) events.anyIndex1136++;
  if (bb) events.anyPrime3302++;
  if (aa && bb) events.anyBoth++;
  if (aa && bb && c) events.anyAllThree++;
}

assert.deepEqual(events, {
  fixedIndex1136: 808, fixedPrime3302: 213, fixedCenter79: 5955,
  fixedBoth: 2, fixedAllThree: 0, anyIndex1136: 1399,
  anyPrime3302: 361, anyBoth: 2, anyAllThree: 0,
});
console.log(JSON.stringify({
  status: "exploratory exact numeric alignments only; no source-selected inverse",
  originalRunes: source.length,
  p0RingIndexSums: indexSums,
  p0RingPrimeSums: primeSums,
  signed2016Bytes: signed2016.length,
  p32Inner5PrimeRing: p32Ring,
  fiveToOneSegmentation: { anchoredMatches, maxAcrossRotationsAndReflections: best },
  conditionalNull: { trials, seed: "0x27113679", events },
}, null, 2));
