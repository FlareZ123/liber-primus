'use strict';

/**
 * Source-aligned LP2 printed-line first-rune channel.
 *
 * A typographical line is a '/' in the 2014 transcript. Delimiters
 * do not terminate runic words. This script measures whether the first
 * rune of every physical printed line is distributed differently from
 * ordinary runes, then evaluates position-selection and heldout controls.
 *
 * Run: node sims/printed_line_start_channel.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(base, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(base, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const table = new Map(corpus.runes.map((r, i) => [r, i]));
const K = 24, M = 29;
const sourcePages = transcript.split(/^\s*%\s*$/m).slice(0, 55);
assert.equal(sourcePages.length, 55);

/** @param {number} seed */
function rng(seed) {
  let x = seed >>> 0;
  return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return x >>> 0; };
}

/** @param {string} s @returns {number[]} */
function runes(s) {
  return Array.from(s, ch => table.has(ch) ? table.get(ch) : -1).filter(n => n >= 0);
}
const pages = sourcePages.map((s, page) => ({
  page,
  rows: s.split('/').map(runes).filter(r => r.length)
}));
for (const {page, rows} of pages) {
  assert.deepEqual(rows.flat(), corpus.pages[page >= 50 ? page + 1 : page].indices);
}
const rows = pages.flatMap(p => p.rows);
assert.equal(rows.length, 594);
assert.equal(rows.reduce((n, r) => n + r.length, 0), 12956);
assert.ok(rows.every(row => row.length <= 26));

/** @type {Array<{r:number,page:number,start:boolean,offset:number,len:number}>} */
const data = [];
/** @type {number[]} */
let word = [];
function finishWord() {
  if (!word.length) return;
  for (let k = 0; k < word.length; k++) {
    const item = data[word[k]];
    item.offset = k;
    item.len = word.length;
  }
  word = [];
}
sourcePages.forEach((s, page) => {
  let lineStart = true;
  for (const ch of s) {
    if (table.has(ch)) {
      data.push({r: table.get(ch), page, start: lineStart, offset: -1, len: -1});
      word.push(data.length - 1);
      lineStart = false;
    } else if (ch === '/') {
      lineStart = true;
    } else if (!/\s/u.test(ch)) {
      finishWord();
    }
  }
});
finishWord();
assert.deepEqual(data.map(x => x.r), rows.flat());
assert.equal(data.filter(x => x.start).length, rows.length);

/** @param {number[]} labels */
function ioc(labels) {
  const counts = new Int32Array(M);
  for (const label of labels) counts[label]++;
  const n = labels.length;
  return counts.reduce((sum, v) => sum + v * (v - 1), 0) / (n * (n - 1));
}

/**
 * Each position has its own collision rate and eligible pair denominator.
 * Rotation preserves each actual rune line and exact line-length inventory.
 * @param {Int32Array | undefined} shifts
 */
function columnRates(shifts) {
  const bins = Array.from({length: K}, () => new Int16Array(M));
  const sizes = new Int16Array(K);
  for (let j = 0; j < rows.length; j++) {
    const line = rows[j], shift = shifts ? shifts[j] : 0;
    for (let k = 0; k < line.length && k < K; k++) {
      bins[k][line[(k + shift) % line.length]]++;
      sizes[k]++;
    }
  }
  const rates = new Float64Array(K);
  for (let k = 0; k < K; k++) {
    assert.ok(sizes[k] >= 100);
    let hits = 0;
    for (const v of bins[k]) hits += v * (v - 1);
    rates[k] = hits / (sizes[k] * (sizes[k] - 1));
  }
  return rates;
}

/** Permutation family across 24 within-line offsets (>=100 eligible lines). */
function familyPositionTest() {
  const observed = columnRates();
  const B = 2400;
  const nulls = Array.from({length: K}, () => new Float64Array(B));
  const means = new Float64Array(K);
  const deviations = new Float64Array(K);
  const shifts = new Int32Array(rows.length);
  const random = rng(0x627ab1c2);
  for (let b = 0; b < B; b++) {
    for (let j = 0; j < rows.length; j++)
      shifts[j] = random() % rows[j].length;
    const rates = columnRates(shifts);
    for (let k = 0; k < K; k++) {
      const x = rates[k];
      nulls[k][b] = x;
      means[k] += x;
      deviations[k] += x * x;
    }
  }
  for (let k = 0; k < K; k++) {
    means[k] /= B;
    deviations[k] = Math.sqrt(deviations[k] / B - means[k] ** 2);
  }
  const z = Array.from(observed, (x, k) => (x - means[k]) / deviations[k]);
  const best = Math.max(...z);
  const bestIndex = z.indexOf(best);
  let extreme = 0, fixed = 0;
  for (let b = 0; b < B; b++) {
    let maxZ = -Infinity;
    for (let k = 0; k < K; k++)
      maxZ = Math.max(maxZ, (nulls[k][b] - means[k]) / deviations[k]);
    extreme += maxZ >= best;
    fixed += nulls[0][b] >= observed[0];
  }
  return {
    eligiblePositions: K,
    randomizations: B,
    strongestColumnZeroBased: bestIndex,
    bestZ: best,
    bestObservedRate: observed[bestIndex],
    bestNullMean: means[bestIndex],
    bestNullSD: deviations[bestIndex],
    maxFamilyExceedances: extreme,
    familyP: (extreme + 1) / (B + 1),
    firstColumnExceedances: fixed,
    firstColumnP: (fixed + 1) / (B + 1),
    secondColumn: {observedRate: observed[1], z: z[1]}
  };
}

/**
 * Replace the true line-start selection with equally numerous uniformly
 * selected positions inside the same word-offset or word-offset/length strata.
 * @param {(x:typeof data[number])=>string} keyFn
 * @param {number} B
 * @param {()=>number} random
 */
function stratifiedLineStartTest(keyFn, B, random) {
  /** @type {Map<string,number[]>} */
  const groups = new Map();
  for (let i = 0; i < data.length; i++) {
    const key = keyFn(data[i]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(i);
  }
  const strata = [...groups.values()].map(g => ({
    g, n: g.reduce((s, i) => s + Number(data[i].start), 0)
  })).filter(x => x.n);
  const n = data.filter(x => x.start).length;
  const actual = ioc(data.filter(x => x.start).map(x => x.r));
  let high = 0, mean = 0, second = 0;
  for (let b = 0; b < B; b++) {
    const counts = new Int32Array(M);
    for (const {g, n: selected} of strata) {
      const pool = [...g];
      for (let j = 0; j < selected; j++) {
        const k = j + random() % (pool.length - j);
        [pool[j], pool[k]] = [pool[k], pool[j]];
        counts[data[pool[j]].r]++;
      }
    }
    let num = 0;
    for (const v of counts) num += v * (v - 1);
    const value = num / (n * (n - 1));
    high += value >= actual;
    mean += value;
    second += value * value;
  }
  mean /= B;
  return {
    observed: actual, nullMean: mean,
    nullSD: Math.sqrt(second / B - mean * mean),
    nullExceedances: high, repetitions: B,
    pUpper: (high + 1) / (B + 1)
  };
}

/**
 * Train an odds model for printed-line initial rune labels. All training
 * appearances provide the baseline prior, with a 50-count shrinkage.
 * @param {typeof data} source
 */
function train(source) {
  const global = new Float64Array(M).fill(1);
  const starts = new Float64Array(M);
  for (const x of source) {
    global[x.r]++;
    if (x.start) starts[x.r]++;
  }
  const total = global.reduce((a, b) => a + b, 0);
  const n = starts.reduce((a, b) => a + b, 0);
  const weights = new Float64Array(M);
  for (let r = 0; r < M; r++) {
    const q = global[r] / total;
    weights[r] = Math.log((starts[r] + 50 * q) / (n + 50) / q);
  }
  return weights;
}

/**
 * Test only unfitted pages. Null selects the same number of rune
 * positions per (word offset, full word length) stratum.
 * @param {typeof data} source
 * @param {Float64Array} weights
 * @param {number} B
 * @param {()=>number} random
 */
function test(source, weights, B, random) {
  const actual = source.reduce((s, x) => s + (x.start ? weights[x.r] : 0), 0);
  /** @type {Map<string,Array<typeof data[number]>>} */
  const groups = new Map();
  for (const x of source) {
    const key = x.offset + '/' + x.len;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(x);
  }
  const strata = [...groups.values()].map(g => ({
    g, n: g.reduce((s, x) => s + Number(x.start), 0)
  })).filter(x => x.n);
  let high = 0, mean = 0, second = 0;
  for (let b = 0; b < B; b++) {
    let value = 0;
    for (const {g, n} of strata) {
      const pool = [...g];
      for (let k = 0; k < n; k++) {
        const j = k + random() % (pool.length - k);
        [pool[k], pool[j]] = [pool[j], pool[k]];
        value += weights[pool[k].r];
      }
    }
    high += value >= actual;
    mean += value;
    second += value * value;
  }
  mean /= B;
  return {
    testRunes: source.length, firstRunes: source.filter(x => x.start).length,
    logOdds: actual, nullMean: mean, nullSD: Math.sqrt(second / B - mean * mean),
    nullExceedances: high, repetitions: B, pUpper: (high + 1) / (B + 1)
  };
}

/** @param {number[]} sequence */
function bestAcrosticPeriod(sequence) {
  const N = sequence.length, hist = new Int32Array(M);
  for (const v of sequence) hist[v]++;
  let baseline = 0;
  for (const v of hist) baseline += v * (v - 1);
  baseline /= N * (N - 1);
  let best = {period: 0, z: -Infinity};
  for (let L = 2; L <= 60; L++) {
    const bins = Array.from({length: L}, () => new Int16Array(M));
    const size = new Int16Array(L);
    for (let i = 0; i < N; i++) {
      bins[i % L][sequence[i]]++;
      size[i % L]++;
    }
    let matches = 0, pairs = 0;
    for (let k = 0; k < L; k++) {
      pairs += size[k] * (size[k] - 1) / 2;
      for (const v of bins[k]) matches += v * (v - 1) / 2;
    }
    const z = (matches - pairs * baseline) / Math.sqrt(pairs * baseline * (1 - baseline));
    if (z > best.z) best = {period: L, z};
  }
  return best;
}
function acrosticNull() {
  const actual = bestAcrosticPeriod(rows.map(r => r[0])), B = 1600;
  const random = rng(0x2a71f94e);
  let exceeded = 0;
  for (let b = 0; b < B; b++) {
    const reordered = [];
    for (const page of pages) {
      const lines = [...page.rows];
      for (let j = lines.length - 1; j > 0; j--) {
        const k = random() % (j + 1);
        [lines[j], lines[k]] = [lines[k], lines[j]];
      }
      for (const line of lines) reordered.push(line[0]);
    }
    exceeded += bestAcrosticPeriod(reordered).z >= actual.z;
  }
  return {...actual, randomizations: B, exceedances: exceeded,
    familyP: (exceeded + 1) / (B + 1)};
}

const first = data.filter(x => x.page < 28);
const last = data.filter(x => x.page >= 28);
const transferRandom = rng(0x85ac7d99);
const result = {
  status: 'No recovered plaintext, key or verified line-start cipher',
  pages: pages.length, lines: rows.length, runes: data.length,
  start: {ioc: ioc(rows.map(r => r[0])),
    lastRuneIoc: ioc(rows.map(r => r[r.length - 1]))},
  family: familyPositionTest(),
  conditioned: {
    wordOffset: stratifiedLineStartTest(x => '' + x.offset, 1800, rng(0x561f8351)),
    wordOffsetLength: stratifiedLineStartTest(x => x.offset + '/' + x.len, 1800, rng(0xe5b9124a))
  },
  frozenTransfer: {
    firstToSecond: test(last, train(first), 3000, transferRandom),
    secondToFirst: test(first, train(last), 3000, transferRandom)
  },
  acrostic: acrosticNull()
};
assert.ok(result.family.strongestColumnZeroBased === 0);
console.log(JSON.stringify(result, null, 2));
