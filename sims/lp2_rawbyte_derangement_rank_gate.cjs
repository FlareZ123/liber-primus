'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Test two precisely specified direct-byte emission registers.
 * GP order is the canonical 0..28 ordering from lp2-corpus.json.
 * For each noninitial, nonrepeat transition, b is a uniformly
 * distributed independent byte. The source-defined repeat mask is
 * exempted and can be inserted at any of the original positions.
 *
 * Cyclic:     C_t = (C_(t-1) + 1 + (b % 28)) % 29.
 * Skipped:    list the 28 glyphs except C_(t-1), in ascending GP order;
 *             output the glyph at list index b % 28.
 *
 * Every byte 0..255 maps to rank 0..3 ten times each, versus nine
 * times for ranks 4..27. Unknown arbitrary per-position alphabets,
 * biased byte generators, or dependent marker selection are outside scope.
 *
 * @typedef {{page:number, indices:number[], status:string}} CorpusPage
 */

/**
 * @param {number} n
 * @param {number} k
 * @param {number} p
 * @returns {number}
 */
function binomialLowerTail(n, k, p) {
  const factorialLogs = new Float64Array(n + 1);
  for (let i = 2; i <= n; i++) factorialLogs[i] = factorialLogs[i - 1] + Math.log(i);
  const logs = new Float64Array(k + 1);
  let maximum = -Infinity;
  for (let i = 0; i <= k; i++) {
    const logp = factorialLogs[n] - factorialLogs[i] - factorialLogs[n - i]
      + i * Math.log(p) + (n - i) * Math.log1p(-p);
    logs[i] = logp;
    maximum = Math.max(maximum, logp);
  }
  let normalized = 0;
  for (const logp of logs) normalized += Math.exp(logp - maximum);
  return Math.exp(maximum) * normalized;
}

/**
 * @param {number[]} histogram
 * @returns {{first4:number, maximum4:number, maximumStart:number}}
 */
function describe(histogram) {
  const first4 = histogram.slice(0, 4).reduce((a, b) => a + b, 0);
  let maximum4 = -1;
  let maximumStart = -1;
  for (let start = 0; start < 28; start++) {
    let value = 0;
    for (let offset = 0; offset < 4; offset++) value += histogram[(start + offset) % 28];
    if (value > maximum4) {
      maximum4 = value;
      maximumStart = start;
    }
  }
  return {first4, maximum4, maximumStart};
}

/**
 * @param {number} previous
 * @param {number} current
 * @param {number[]} cyclic
 * @param {number[]} skipped
 */
function addTransition(previous, current, cyclic, skipped) {
  const distance = (current - previous + 29) % 29;
  assert.notEqual(distance, 0);
  cyclic[distance - 1]++;
  skipped[current < previous ? current : current - 1]++;
}

/** @param {CorpusPage[]} pages */
function analyze(pages) {
  const originalCyclic = Array(28).fill(0);
  const originalSkipped = Array(28).fill(0);
  const plantedCyclic = Array(28).fill(0);
  const plantedSkipped = Array(28).fill(0);
  let nonrepeat = 0;
  let doublets = 0;
  let totalRunes = 0;

  for (const page of pages) {
    const original = page.indices;
    totalRunes += original.length;
    let lastCyclic = original[0];
    let lastSkipped = original[0];

    for (let i = 1; i < original.length; i++) {
      const previous = original[i - 1];
      const current = original[i];
      if (current === previous) {
        doublets++;
        continue;
      }
      addTransition(previous, current, originalCyclic, originalSkipped);

      // 197 is coprime to 256: each 256-byte cycle is exactly uniform.
      // The control preserves original physical page lengths and all
      // original adjacent-repeat sites without fitting any plaintext.
      const byte = (197 * nonrepeat + 13) & 255;
      const distance = 1 + (byte % 28);
      const nextCyclic = (lastCyclic + distance) % 29;
      const skippedRank = byte % 28;
      const nextSkipped = skippedRank < lastSkipped ? skippedRank : skippedRank + 1;

      plantedCyclic[(nextCyclic - lastCyclic + 29) % 29 - 1]++;
      plantedSkipped[nextSkipped < lastSkipped ? nextSkipped : nextSkipped - 1]++;
      lastCyclic = nextCyclic;
      lastSkipped = nextSkipped;
      nonrepeat++;
    }
  }

  assert.equal(pages.length, 55);
  assert.equal(totalRunes, 12956);
  assert.equal(doublets, 86);
  assert.equal(nonrepeat, 12815);

  const summarize = (histogram) => {
    const counts = describe(histogram);
    const byteMod28HighProb = 40 / 256;
    return {
      ...counts,
      lowerTailFirst4: binomialLowerTail(nonrepeat, counts.first4, byteMod28HighProb),
      conservativeUnknownCyclicRotationP:
        binomialLowerTail(nonrepeat, counts.maximum4, byteMod28HighProb),
      histogram
    };
  };

  const result = {
    original: {cyclic: summarize(originalCyclic), skipped: summarize(originalSkipped)},
    sourceShapedPositive: {
      cyclic: summarize(plantedCyclic), skipped: summarize(plantedSkipped)
    },
    nonrepeat, doublets, totalRunes,
    model: 'uniform independent 8-bit byte reduced mod28; source-fixed repeat positions'
  };

  assert.equal(result.original.cyclic.first4, 1831);
  assert.equal(result.original.cyclic.maximum4, 1904);
  assert.equal(result.original.skipped.first4, 1864);
  assert.equal(result.original.skipped.maximum4, 1918);
  assert.equal(result.sourceShapedPositive.cyclic.first4, 2002);
  assert.equal(result.sourceShapedPositive.skipped.first4, 2002);
  return result;
}

const corpusPath = path.join(__dirname, '../resources/liber-primus/lp2-corpus.json');
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
const pages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length > 0);
console.log(JSON.stringify(analyze(pages), null, 2));
