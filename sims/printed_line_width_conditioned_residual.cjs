'use strict';

/**
 * LP2 printed-line starts after conditioning on original-JPEG rune ink widths.
 * Source channel only: this script does not decode ciphertext or infer a key.
 *
 * Node.js 22, CommonJS, standard library only.
 * Run: node sims/printed_line_width_conditioned_residual.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const transcript = fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-transcription.txt'), 'utf8'
);
const RUNES = new Map(corpus.runes.map((r, i) => [r, i]));
const MOD = 29;

/**
 * Median original-JPEG first-ink-component widths, in source GP index order.
 * Fixed independently of this test, reproduced in
 * sims/printed_line_fixed_pixel_width_forward.py
 * and successful Actions run 42779713580.
 * Widths are imperfect proxies for the original font's advance/kerning.
 */
const INK_WIDTH = [
  34, 52, 33, 34, 33, 34.5, 40, 33, 43, 29,
  9, 41, 36, 51, 59, 34, 45, 34, 52, 52,
  33, 48, 41, 52, 33, 34, 52, 50, 83
];
assert.equal(INK_WIDTH.length, MOD);

/**
 * Prespecified coarse pixel bins; preserving original page and bin start
 * counts removes the major wide-glyph typesetting selection effect.
 * The finest bucket contains the 83-pixel EA glyph alone.
 *
 * @param {number} width
 * @returns {number}
 */
function inkBin(width) {
  if (width < 20) return 0;
  if (width < 35) return 1;
  if (width < 45) return 2;
  if (width < 55) return 3;
  return 4;
}

/**
 * @typedef {{r:number,bin:number,start:boolean,mid:boolean}} Token
 * @returns {Token[][]}
 */
function readPages() {
  const records = transcript.split('%').slice(0, 55);
  assert.equal(records.length, 55);
  /** @type {Token[][]} */
  const pages = [];
  let prevWasRuneInsideWord = false;
  for (let p = 0; p < records.length; p++) {
    /** @type {Token[]} */
    const page = [];
    let firstRuneOfPage = true;
    let afterPrintedSlash = false;
    for (const ch of records[p]) {
      const r = RUNES.get(ch);
      if (r !== undefined) {
        page.push({
          r,
          bin: inkBin(INK_WIDTH[r]),
          start: !firstRuneOfPage && afterPrintedSlash,
          mid: prevWasRuneInsideWord
        });
        firstRuneOfPage = false;
        afterPrintedSlash = false;
        prevWasRuneInsideWord = true;
      } else if (ch === '/') {
        afterPrintedSlash = true;
      } else if (!/\s/u.test(ch)) {
        // Distinguish actual punctuation from typographical line wraps.
        prevWasRuneInsideWord = false;
      }
    }
    const physical = p >= 50 ? p + 1 : p;
    assert.deepEqual(page.map(x => x.r), corpus.pages[physical].indices);
    pages.push(page);
  }
  assert.equal(pages.reduce((n, p) => n + p.length, 0), 12956);
  assert.equal(pages.flat().filter(x => x.start).length, 539);
  assert.equal(pages.flat().filter(x => x.start && x.mid).length, 388);
  return pages;
}

/** @param {number} seed @returns {()=>number} */
function rng(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}

/**
 * @typedef {{labels:number[],pick:number}} Group
 * @typedef {{observed:number[],expected:number[],groups:Group[],n:number}} Sample
 * @param {Token[][]} pages
 * @param {'all'|'mid'} mode
 * @param {number} startPage
 * @param {number} endPage
 * @returns {Sample}
 */
function sample(pages, mode, startPage, endPage) {
  const observed = new Array(MOD).fill(0);
  const expected = new Array(MOD).fill(0);
  /** @type {Group[]} */
  const groups = [];
  for (let p = startPage; p < endPage; p++) {
    for (let bin = 0; bin < 5; bin++) {
      const pool = pages[p].filter(x =>
        x.bin === bin && (mode === 'all' || x.mid)
      );
      const pick = pool.reduce((s, x) => s + Number(x.start), 0);
      if (!pick) continue;
      assert.ok(pick <= pool.length);
      for (const x of pool) {
        expected[x.r] += pick / pool.length;
        if (x.start) observed[x.r]++;
      }
      groups.push({labels: pool.map(x => x.r), pick});
    }
  }
  return {observed, expected, groups,
    n: observed.reduce((a, b) => a + b, 0)};
}

/**
 * Sample a fixed number of positions without replacement from every
 * (physical page, observed glyph-width bin). Each group retains its exact
 * original rune multiset and actual line-wrap count.
 * @param {Group[]} groups
 * @param {()=>number} next
 * @param {number|null} [plantRune=null] Symbol given an 8x positive weight
 * @returns {number[]}
 */
function draw(groups, next, plantRune = null) {
  const observed = new Array(MOD).fill(0);
  for (const {labels, pick} of groups) {
    const pool = labels.slice();
    for (let j = 0; j < pick; j++) {
      let k;
      if (plantRune === null) {
        k = j + next() % (pool.length - j);
      } else {
        let total = 0;
        for (let t = j; t < pool.length; t++)
          total += pool[t] === plantRune ? 8 : 1;
        let choice = next() / 4294967296 * total;
        k = j;
        while (k < pool.length - 1) {
          const weight = pool[k] === plantRune ? 8 : 1;
          if (choice < weight) break;
          choice -= weight;
          k++;
        }
      }
      [pool[j], pool[k]] = [pool[k], pool[j]];
      observed[pool[j]]++;
    }
  }
  return observed;
}

/** @param {number[]} o @param {number[]} e @returns {number} */
function chi(o, e) {
  return o.reduce((sum, n, i) => sum + (n - e[i]) ** 2 /
    (e[i] + 1e-8), 0);
}

/** @param {number[]} o @param {number[]} e @returns {number[]} */
function residual(o, e) {
  return o.map((v, i) => (v - e[i]) / (e[i] + 8));
}

/** @param {number[]} o @param {number[]} e @param {number[]} weights @returns {number} */
function dot(o, e, weights) {
  return o.reduce((s, v, i) => s + (v - e[i]) * weights[i], 0);
}

/**
 * Evaluate fixed-label spectrum and opposite-page-half residual prediction.
 * The hypotheses and sampling universe are chosen before shuffling.
 * @param {Token[][]} pages
 * @param {'all'|'mid'} mode
 * @param {number} count
 * @param {number} seed
 */
function evaluate(pages, mode, count, seed) {
  const pooled = sample(pages, mode, 0, 55);
  const early = sample(pages, mode, 0, 28);
  const late = sample(pages, mode, 28, 55);
  const earlyWeight = residual(early.observed, early.expected);
  const lateWeight = residual(late.observed, late.expected);
  const original = {
    chi: chi(pooled.observed, pooled.expected),
    earlyToLate: dot(late.observed, late.expected, earlyWeight),
    lateToEarly: dot(early.observed, early.expected, lateWeight)
  };
  const next = rng(seed);
  const extremes = {chi: 0, earlyToLate: 0, lateToEarly: 0};
  const means = {chi: 0, earlyToLate: 0, lateToEarly: 0};
  for (let b = 0; b < count; b++) {
    const nullChi = chi(draw(pooled.groups, next), pooled.expected);
    const nullForward = dot(draw(late.groups, next),
      late.expected, earlyWeight);
    const nullReverse = dot(draw(early.groups, next),
      early.expected, lateWeight);
    extremes.chi += nullChi >= original.chi;
    extremes.earlyToLate += nullForward >= original.earlyToLate;
    extremes.lateToEarly += nullReverse >= original.lateToEarly;
    means.chi += nullChi;
    means.earlyToLate += nullForward;
    means.lateToEarly += nullReverse;
  }
  for (const field of Object.keys(means)) means[field] /= count;
  const p = Object.fromEntries(Object.keys(extremes).map(field =>
    [field, (extremes[field] + 1) / (count + 1)]));
  const selectedLabels = pooled.observed
    .map((v, i) => ({
      symbol: corpus.translit[i], observed: v, expected: pooled.expected[i],
      standardizedResidual: (v - pooled.expected[i]) /
        Math.sqrt(pooled.expected[i] || 1)
    }))
    .filter(v => v.expected >= 3)
    .sort((x, y) =>
      Math.abs(y.standardizedResidual) - Math.abs(x.standardizedResidual))
    .slice(0, 6);
  return {
    eventCount: pooled.n, early: early.n, late: late.n,
    nullTrials: count, seed,
    original, nullMeans: means, exceedances: extremes,
    plusOneUpperP: p, topResiduals: selectedLabels
  };
}

/**
 * A source-layout-matched positive: give one rune eight times the baseline
 * chance of being selected as a line-start *within every same-width group*.
 * The sampled labels still come from the original page/width inventories.
 * @param {Token[][]} pages
 * @param {number} count
 */
function plantedControl(pages, count) {
  const early = sample(pages, 'all', 0, 28);
  const late = sample(pages, 'all', 28, 55);
  const plant = rng(0x16c0ffee);
  const target = 13; // GP P, observed native ink width 51 px.
  const plantedEarly = draw(early.groups, plant, target);
  const plantedLate = draw(late.groups, plant, target);
  const weights = residual(plantedEarly, early.expected);
  const observedScore = dot(plantedLate, late.expected, weights);
  const next = rng(0x16fedcba);
  let exceedances = 0;
  for (let b = 0; b < count; b++) {
    exceedances += dot(draw(late.groups, next), late.expected, weights)
      >= observedScore;
  }
  return {
    control: '8x preference for GP P at line-start within each page-width bin',
    earlyPlantedCount: plantedEarly[target],
    latePlantedCount: plantedLate[target],
    earlyExpected: early.expected[target],
    lateExpected: late.expected[target],
    frozenHeldoutScore: observedScore,
    nullExceedances: exceedances,
    nullTrials: count,
    plusOneUpperP: (exceedances + 1) / (count + 1)
  };
}

const pages = readPages();
const B = Number(process.argv[2] || 10000);
assert.ok(Number.isInteger(B) && B > 0 && B <= 100000);
const answer = {
  evidence: 'width-conditioned source-layout experiment; no ciphertext decryption',
  source: 'original LP2 55 rune-bearing pages, 12956 GP runes',
  originalJpegWidthSource: 'Actions run 42779713580',
  physicalPagePreservation: true,
  widthBinUpperEdgesPx: [20, 35, 45, 55],
  sourceLineStarts: 594,
  testedWithinPageWraps: 539,
  testedMidwordWraps: 388,
  allWraps: evaluate(pages, 'all', B, 0x16aff991),
  midwordOnly: evaluate(pages, 'mid', B, 0x16aff992),
  plantedControl: plantedControl(pages, Math.min(B, 3000)),
  limitations: [
    'Coarse width bins are a conditional nuisance model, not exact font metrics',
    'These intervals and this analysis were chosen after discovery of the line-initial bias',
    'Failure of residual transfer does not rule out a weak or different steganographic channel',
    'No original LP2 plaintext, cipher state, keys or destination recovered'
  ]
};
console.log(JSON.stringify(answer, null, 2));
