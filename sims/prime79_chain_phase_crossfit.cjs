'use strict';
/**
 * Source-constrained, unknown-key-free period-79 cyclic-difference test on LP2.
 *
 * The 22nd ordinary prime (79) is selected by the corrected original-image
 * red-heading GP sum 638 = 29 * 22 on physical LP2 page 15. The separately
 * marked page-53 red stanza has sum 2262 = 29 * 78 = 29 * phi(79).
 * These numerical relationships are exploratory and were post-selected.
 *
 * Compare 28-symbol predecessor-excluded cyclic differences at matching
 * manuscript-global modulo-79 phases across independently held-out page groups.
 * Nulls rotate exact within-page difference arrays, preserving all their
 * observed values (including the 86 doublets and page-start erasures), or
 * rotate the original page ciphertext before recomputing its differences.
 *
 * Runnable in Node.js 22, CommonJS. No external libraries or timed CI.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encode} = require('./word_partition_invariant.cjs');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const pages = corpus.pages.filter((p) => p.page < 56 && p.indices.length);
const LENGTH = pages.reduce((n, p) => n + p.indices.length, 0);
const GROUPS = 4;
const PERIODS = [78, 79];
const CONVENTIONS = ['cyclic', 'sorted'];
const GROUPINGS = ['page', 'equal-quarter'];
const REPS = 3000;
const RAW_REPS = 2200;
const SEED = 0x7941e170;

assert.equal(pages.length, 55);
assert.equal(LENGTH, 12956);
assert.equal(LENGTH, 79 * 164);
assert.equal(LENGTH, 4 * 41 * 79);

/**
 * @param {number} page
 * @param {number} start
 * @param {number} count
 * @returns {number}
 */
function redPrimeSum(page, start, count) {
  const source = ink.pages.find((p) => p.page === page);
  assert.ok(source.red_spans.some((s) => s.start === start && s.length === count));
  const runes = corpus.pages.find((p) => p.page === page).indices;
  return runes.slice(start, start + count).reduce((n, rune) => n + corpus.prime[rune], 0);
}
assert.equal(redPrimeSum(15, 0, 9), 638);
assert.equal(redPrimeSum(53, 128, 51), 2262);
assert.equal(corpus.prime[21], 79);
assert.equal(corpus.prime[12], 41);

/** @param {number} seed @returns {() => number} */
function random32(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return s >>> 0;
  };
}

/**
 * Exactly one predecessor is required, so original physical page starts and
 * immediately repeated runes become explicit erasures with value -1.
 * @param {number[][]} ciphertext
 * @param {'cyclic'|'sorted'} convention
 * @returns {number[][]}
 */
function differences(ciphertext, convention) {
  return ciphertext.map((page) => page.map((c, i) => {
    if (i === 0 || c === page[i - 1]) return -1;
    const previous = page[i - 1];
    return convention === 'cyclic'
      ? (c - previous + 29) % 29 - 1
      : c - Number(c > previous);
  }));
}

/**
 * @param {number[][]} rows One difference array per original physical page
 * @param {number} period
 * @returns {{mean:number,min:number,pooled:number,groupPairs:Array<{groups:string,hit:number,total:number,rate:number}>}}
 */
function phaseScore(rows, period, grouping = 'page') {
  const hist = Array.from({length: GROUPS}, () => new Uint16Array(period * 28));
  const count = Array.from({length: GROUPS}, () => new Uint16Array(period));
  let absoluteRune = 0;
  for (let pageNumber = 0; pageNumber < rows.length; pageNumber++) {
    for (const rank of rows[pageNumber]) {
      const group = grouping === 'equal-quarter'
        ? Math.floor(absoluteRune / (LENGTH / GROUPS))
        : Math.floor(pageNumber * GROUPS / rows.length);
      const phase = absoluteRune % period;
      if (rank >= 0) {
        assert.ok(rank < 28);
        hist[group][phase * 28 + rank]++;
        count[group][phase]++;
      }
      absoluteRune++;
    }
  }
  assert.equal(absoluteRune, LENGTH);
  const groupPairs = [];
  let pooledMatches = 0, pooledPairs = 0;
  for (let a = 0; a < GROUPS; a++) for (let b = a + 1; b < GROUPS; b++) {
    let hit = 0, total = 0;
    for (let phase = 0; phase < period; phase++) {
      total += count[a][phase] * count[b][phase];
      for (let symbol = 0; symbol < 28; symbol++)
        hit += hist[a][phase * 28 + symbol] * hist[b][phase * 28 + symbol];
    }
    assert.ok(total);
    pooledMatches += hit;
    pooledPairs += total;
    groupPairs.push({groups: String(a) + String(b), hit, total, rate: hit / total});
  }
  const rates = groupPairs.map((pair) => pair.rate);
  return {
    mean: rates.reduce((n, rate) => n + rate, 0) / rates.length,
    min: Math.min(...rates),
    pooled: pooledMatches / pooledPairs,
    groupPairs
  };
}

/**
 * Preserve each physical page's *complete rank inventory and local sequence*
 * through a cyclic rotation. Erasure count is exactly unchanged.
 * @param {number[][]} rows
 * @param {number[]} shifts
 */
function rotate(rows, shifts) {
  return rows.map((row, j) => row.map((_, i) => row[(i + shifts[j]) % row.length]));
}

const settings = CONVENTIONS.flatMap((convention) =>
  PERIODS.flatMap((period) => GROUPINGS.map((grouping) =>
    ({convention, period, grouping}))));
const original = {
  cyclic: differences(pages.map((p) => p.indices), 'cyclic'),
  sorted: differences(pages.map((p) => p.indices), 'sorted')
};
const removed = original.cyclic.flat().filter((x) => x < 0).length;
assert.equal(removed, 55 + 86);
const observed = settings.map((s) => ({
  ...s, ...phaseScore(original[s.convention], s.period, s.grouping)
}));

/** Matched null calibrating four source-related, finite models simultaneously. */
function calibrate() {
  const rand = random32(SEED);
  const samples = settings.map(() => []);
  for (let trial = 0; trial < REPS; trial++) {
    const shifts = pages.map((p) => rand() % p.indices.length);
    const a = rotate(original.cyclic, shifts);
    const b = rotate(original.sorted, shifts);
    for (let model = 0; model < settings.length; model++) {
      const s = settings[model];
      samples[model].push(phaseScore(
        s.convention === 'cyclic' ? a : b, s.period, s.grouping).mean);
    }
  }
  const averages = samples.map((arr) => arr.reduce((a, b) => a + b, 0) / arr.length);
  const deviations = samples.map((arr, model) => Math.sqrt(
    arr.reduce((sum, n) => sum + (n - averages[model]) ** 2, 0) / arr.length));
  const z = observed.map((s, model) => (s.mean - averages[model]) / deviations[model]);
  let exceededMaximum = 0;
  const exceedances = settings.map(() => 0);
  for (let trial = 0; trial < REPS; trial++) {
    for (let model = 0; model < settings.length; model++)
      exceedances[model] += Number(samples[model][trial] >= observed[model].mean);
    exceededMaximum += Number(Math.max(...settings.map((_, model) =>
      (samples[model][trial] - averages[model]) / deviations[model])) >= Math.max(...z));
  }
  return {
    trials: REPS, seed: SEED, randomization: 'pagewise cyclic rank rotation',
    familywiseMaxZP: (exceededMaximum + 1) / (REPS + 1),
    familywiseExceedances: exceededMaximum,
    models: settings.map((s, i) => ({
      ...s, observed: observed[i].mean, nullMean: averages[i],
      nullSD: deviations[i], z: z[i],
      upperP: (exceedances[i] + 1) / (REPS + 1)
    }))
  };
}

/** Additional independent null rotating original ciphertext before differencing. */
function originalCipherNull() {
  const rand = random32(0x79bee310);
  const actual = observed.find((s) => s.convention === 'cyclic' && s.period === 79 && s.grouping === 'page');
  let exceedMean = 0, exceedMin = 0, sum = 0;
  for (let trial = 0; trial < RAW_REPS; trial++) {
    const shifts = pages.map((p) => rand() % p.indices.length);
    const rotated = rotate(pages.map((p) => p.indices), shifts);
    const score = phaseScore(differences(rotated, 'cyclic'), 79);
    sum += score.mean;
    exceedMean += Number(score.mean >= actual.mean);
    exceedMin += Number(score.min >= actual.min);
  }
  return {
    trials: RAW_REPS, seed: 0x79bee310,
    rotationNullMean: sum / RAW_REPS,
    meanUpperP: (exceedMean + 1) / (RAW_REPS + 1),
    minUpperP: (exceedMin + 1) / (RAW_REPS + 1)
  };
}

/**
 * A fully invertible, nonzero-step, period-79 synthetic cipher shows what a
 * true language-register key of this family would look like. Position zero
 * of each page is a free initial state; every later GP 28-code symbol is
 * recovered exactly with the independently created key.
 */
function positiveControl() {
  const words = read('resources/control/shakespeare_first300k.txt')
    .toUpperCase().match(/[A-Z]+/g);
  const source = words.flatMap(encode);
  assert.ok(source.length > LENGTH + 1000);
  const plaintext = source.slice(1000, 1000 + LENGTH).map((x) => x % 28);
  const random = random32(0x79797712);
  const key = Array.from({length: 79}, () => random() % 28);
  const plant = [];
  let pos = 0;
  for (const p of pages) {
    const result = [];
    let last = random() % 29;
    for (let i = 0; i < p.indices.length; i++) {
      if (i) last = (last + 1 + (plaintext[pos] + key[pos % 79]) % 28) % 29;
      result.push(last);
      pos++;
    }
    plant.push(result);
  }
  const decoded = differences(plant, 'cyclic');
  let recovered = 0, valid = 0, pos2 = 0;
  for (const p of decoded) for (const cipherRank of p) {
    if (cipherRank >= 0) {
      const inverse = (cipherRank - key[pos2 % 79] + 28) % 28;
      recovered += Number(inverse === plaintext[pos2]);
      valid++;
    }
    pos2++;
  }
  assert.equal(valid, LENGTH - 55);
  assert.equal(recovered, valid);
  const originalMean = observed.find((s) => s.convention === 'cyclic' && s.period === 79 && s.grouping === 'equal-quarter').mean;
  const planted = phaseScore(decoded, 79, 'equal-quarter');
  assert.ok(planted.mean > 0.050 && planted.mean > originalMean);
  return {model: '79-state 28-rank additive chain', recovered, valid,
    exactInversion: true, observedOriginalMean: originalMean,
    plantedMean: planted.mean, plantedMin: planted.min};
}

function main() {
  const result = {
    source: 'original LP2 ciphertext, original source-marked red runes',
    sourcePrimeSums: {page15: 638, page53: 2262,
      primeIndex22: 79, primeIndex13: 41},
    sourceRunes: LENGTH, period79Blocks: 164,
    fourQuarterLengths: [3239, 3239, 3239, 3239], pages: pages.length,
    excludedPageStartsAndRepeats: removed,
    referenceUniformRankCoincidence: 1 / 28,
    observed: observed.map((s) => ({
      convention: s.convention, period: s.period,
      grouping: s.grouping, mean: s.mean,
      min: s.min, pooled: s.pooled, groupPairs: s.groupPairs
    })),
    calibration: calibrate(), independentOriginalCipherNull: originalCipherNull(),
    syntheticPositive: positiveControl(),
    interpretation: 'Exploratory 79-phase rank effect; no original LP2 plaintext or key recovered.'
  };
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  return result;
}

if (require.main === module) main();
module.exports = {
  redPrimeSum, differences, phaseScore, rotate, calibrate,
  originalCipherNull, positiveControl, main
};
