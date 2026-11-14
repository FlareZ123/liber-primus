"use strict";

/**
 * Original LP2 adjacent-repeat gap correlation under a page- and word-shape-
 * conditional null. Run as one Node.js file from the repository root.
 * The script is read-only and needs no third-party packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @typedef {{page: number, indices: number[]}} SourcePage */
/** @typedef {{runes: string[], pages: SourcePage[]}} SourceCorpus */
/** @typedef {{slots: number[], k: number}} Stratum */

/** @param {string} file */
function read(file) {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8");
}

/** @param {number[]} data */
function correlation(data) {
  const n = data.length - 1;
  let leftMean = 0;
  let rightMean = 0;
  for (let i = 0; i < n; i++) {
    leftMean += data[i];
    rightMean += data[i + 1];
  }
  leftMean /= n;
  rightMean /= n;

  let product = 0;
  let leftSS = 0;
  let rightSS = 0;
  for (let i = 0; i < n; i++) {
    const x = data[i] - leftMean;
    const y = data[i + 1] - rightMean;
    product += x * y;
    leftSS += x * x;
    rightSS += y * y;
  }
  return product / Math.sqrt(leftSS * rightSS);
}

/** @param {number[]} values */
function midpointRanks(values) {
  const entries = values.map((value, index) => ({ value, index }));
  entries.sort((a, b) => a.value - b.value);
  const ranks = new Array(values.length);

  for (let i = 0; i < entries.length;) {
    let end = i + 1;
    while (end < entries.length && entries[end].value === entries[i].value) {
      end++;
    }
    for (let j = i; j < end; j++) {
      ranks[entries[j].index] = (i + end - 1) / 2;
    }
    i = end;
  }
  return ranks;
}

/** @param {number[]} eventPositions */
function threeCorrelations(eventPositions) {
  const gaps = eventPositions.slice(1).map((position, i) => position - eventPositions[i]);
  return [
    correlation(gaps),
    correlation(gaps.map(Math.log)),
    correlation(midpointRanks(gaps)),
  ];
}

const corpus = /** @type {SourceCorpus} */ (
  JSON.parse(read("resources/liber-primus/lp2-corpus.json"))
);
const pages = corpus.pages.filter(page => page.page < 56 && page.indices.length > 0);
const sections = read("resources/liber-primus/lp2-transcription.txt")
  .split("$").slice(0, 8);
const words = sections.flatMap(section =>
  section.split(/[-.&§]/)
    .map(part => part.match(/\p{Script=Runic}/gu) || [])
    .filter(word => word.length > 0)
);
const wordId = words.flatMap((word, id) => word.map(() => id));
const wordLength = words.flatMap(word => word.map(() => word.length));
const wordPosition = words.flatMap(word => word.map((_, i) => i));
const ciphertext = pages.flatMap(page => page.indices);
const sourceRunes = sections.join("").match(/\p{Script=Runic}/gu) || [];

assert.equal(pages.length, 55);
assert.equal(ciphertext.length, 12956);
assert.equal(words.length, 2896);
assert.deepEqual(ciphertext.map(symbol => corpus.runes[symbol]), sourceRunes);
assert.equal(Math.max(...wordLength), 14);

/** @type {Map<string, Stratum>} */
const strata = new Map();
/** @type {number[]} */
const originalEvents = [];
let offset = 0;
let totalEligible = 0;

for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
  const page = pages[pageIndex];
  for (let i = 1; i < page.indices.length; i++) {
    const position = offset + i;
    const insideWord = wordId[position] === wordId[position - 1];
    const shape = insideWord
      ? "in:" + wordLength[position] + ":" + wordPosition[position]
      : "cross";
    const key = pageIndex + ":" + shape;
    if (!strata.has(key)) {
      strata.set(key, { slots: [], k: 0 });
    }
    const group = strata.get(key);
    group.slots.push(position);
    totalEligible++;

    if (ciphertext[position] === ciphertext[position - 1]) {
      group.k++;
      originalEvents.push(position);
    }
  }
  offset += page.indices.length;
}
assert.equal(totalEligible, 12901);
assert.equal(originalEvents.length, 86);

/** @type {Stratum[]} */
const active = Array.from(strata.values()).filter(group => group.k > 0);
assert.equal(active.length, 81);

const observed = threeCorrelations(originalEvents);
assert.ok(Math.abs(observed[0] - 0.38001968924100965) < 1e-12);
assert.ok(Math.abs(observed[1] - 0.2294355175896505) < 1e-12);
assert.ok(Math.abs(observed[2] - 0.26700210480775993) < 1e-12);

// Deterministic xorshift32. Every simulated sequence preserves the exact
// number of repeat sites in every (physical page, word-length, rune-offset)
// category, plus the original page geometry and all word boundaries.
let state = 0x44553301;
/** @returns {number} */
function randomUnit() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 4294967296;
}

const samples = 20000;
const exceedances = [0, 0, 0];
const totals = [0, 0, 0];
const max = [-1, -1, -1];

for (let sample = 0; sample < samples; sample++) {
  /** @type {number[]} */
  const positions = [];
  for (const group of active) {
    const pool = group.slots.slice();
    // Sample group.k positions uniformly without replacement.
    for (let i = 0; i < group.k; i++) {
      const other = i + Math.floor(randomUnit() * (pool.length - i));
      [pool[i], pool[other]] = [pool[other], pool[i]];
      positions.push(pool[i]);
    }
  }
  positions.sort((a, b) => a - b);
  assert.equal(positions.length, originalEvents.length);

  const values = threeCorrelations(positions);
  for (let i = 0; i < 3; i++) {
    exceedances[i] += Number(values[i] >= observed[i]);
    totals[i] += values[i];
    max[i] = Math.max(max[i], values[i]);
  }
}

assert.deepEqual(exceedances, [230, 1008, 474]);
for (let i = 0; i < 3; i++) {
  assert.ok(Math.abs(totals[i] / samples - [0.2469327647854789,
    0.08721333754580048, 0.1097821321875728][i]) < 1e-10);
}

console.log(JSON.stringify({
  input: "unchanged original 55 rune-bearing LP2 ciphertext pages",
  originalRunes: ciphertext.length,
  words: words.length,
  pages: pages.length,
  repeats: originalEvents.length,
  eligiblePairs: totalEligible,
  conditioning: "physical page x exact printed word length x within-word rune offset",
  activeStrata: active.length,
  seed: "0x44553301",
  samples,
  statistic: ["Pearson(gap)", "Pearson(log gap)", "Pearson(midrank gap)"],
  original: observed,
  comparisonsAtLeastOriginal: exceedances,
  addOneProbabilities: exceedances.map(n => (n + 1) / (samples + 1)),
  nullMeans: totals.map(n => n / samples),
  nullMaxima: max,
}, null, 2));
