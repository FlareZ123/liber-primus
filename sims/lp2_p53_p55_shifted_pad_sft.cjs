"use strict";

/**
 * Source-exact finite alignment screen for the p53/p55 duplicate-moth
 * two-time-pad idea. This is an exploratory diagnostic, not a decipherment.
 * Run with Node.js 20+: node sims/lp2_p53_p55_shifted_pad_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const source = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, "../resources/liber-primus/lp2-corpus.json"), "utf8"));
const original53 = source.pages.find(p => p.page === 53).indices;
const original55 = source.pages.find(p => p.page === 55).indices;
assert.equal(original53.length, 179);
assert.equal(original55.length, 76);
assert.equal(original55[0], 21); // p54 carry: NG.
const body55 = original55.slice(1);
assert.equal(body55.length, 75);

/**
 * The common pad cancels in an aligned additive GP29 pair.
 * @param {number[]} first
 * @param {number} start
 * @param {number[]} second
 * @returns {number} 29-valued difference collision count.
 */
function differenceCollisions(first, start, second) {
  const count = Array(29).fill(0);
  for (let i = 0; i < second.length; i++) {
    count[(first[start + i] - second[i] + 29) % 29]++;
  }
  return count.reduce((sum, n) => sum + n * (n - 1), 0);
}

/** @param {number[]} first @param {number[]} second */
function maximalAlignment(first, second) {
  let best = -1;
  const starts = [];
  for (let start = 0; start <= first.length - second.length; start++) {
    const collisions = differenceCollisions(first, start, second);
    if (collisions > best) {
      best = collisions;
      starts.length = 0;
      starts.push(start);
    } else if (collisions === best) {
      starts.push(start);
    }
  }
  return { collisions: best, starts };
}

const denominator = body55.length * (body55.length - 1);
const sameStart = differenceCollisions(original53, 0, body55);
const observed = maximalAlignment(original53, body55);
assert.equal(sameStart, 172); // 172 / 5550.
assert.deepEqual(observed, {collisions: 238, starts: [13]});
assert.equal(original53.length - body55.length + 1, 105);

// Reversible same-pad positive: a genuine repeated GP29 additive pad cancels
// algebraically for every GP29 key symbol, independent of its source.
const solved = source.pages.find(p => p.page === 57).indices;
const pad = Array.from({length: 75}, (_, i) => (17 * i + 5) % 29);
const plantA = solved.slice(0, 75);
const plantB = solved.slice(20, 95);
const encA = plantA.map((v, i) => (v + pad[i]) % 29);
const encB = plantB.map((v, i) => (v + pad[i]) % 29);
assert.deepEqual(encA.map((v, i) => (v - pad[i] + 29) % 29), plantA);
assert.deepEqual(encB.map((v, i) => (v - pad[i] + 29) % 29), plantB);
assert.equal(differenceCollisions(encA, 0, encB),
  differenceCollisions(plantA, 0, plantB));

// Familywise comparator: randomize the identity/position of all 75 actual
// p55 body runes; hold p53, both page lengths and 105 possible starts fixed.
// This conditions on original p55's unigram inventory, and corrects the
// unknown-shift selection. Seeded xorshift32 + Fisher-Yates.
let state = 0x53355575;
/** @returns {number} */
function next32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const B = 3000;
const maxima = [];
for (let j = 0; j < B; j++) {
  const permuted = body55.slice();
  for (let i = permuted.length - 1; i > 0; i--) {
    const at = next32() % (i + 1);
    [permuted[i], permuted[at]] = [permuted[at], permuted[i]];
  }
  maxima.push(maximalAlignment(original53, permuted).collisions);
}
maxima.sort((a, b) => a - b);
const exceeds = maxima.filter(v => v >= observed.collisions).length;
assert.equal(exceeds, 2603);
assert.equal(maxima[1500], 248);
assert.equal(maxima[2850], 274);
assert.equal(maxima[2970], 292);
console.log(JSON.stringify({
  source: "original LP2 physical p53[0:179], p55[1:76]",
  testedStartOffsets: 105,
  originalSameStartIoC: sameStart / denominator,
  originalPeak: {start: observed.starts, ioc: observed.collisions / denominator},
  shuffledP55: {seed: "0x53355575", trials: B, exceeds,
    plusOneUpperTail: (exceeds + 1) / (B + 1),
    median: maxima[1500] / denominator,
    percentile95: maxima[2850] / denominator,
    percentile99: maxima[2970] / denominator},
  result: "No unusual shifted difference-spectrum peak or genuine plaintext."
}, null, 2));
