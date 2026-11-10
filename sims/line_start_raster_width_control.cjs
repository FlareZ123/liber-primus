'use strict';
/**
 * Original-JPEG glyph-width-adjusted null for 594 LP2 line initials.
 * Advances come from sims/source_glyph_advance_inversion.py, fitted
 * exclusively on image 60.jpg's first seven source-matched printed lines.
 * Node.js 22 CommonJS, source-exact and deterministically seeded.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const RUNES = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const WIDTHS = [
  38.429,57.507,37.014,38.632,38.861,54.667,48.007,38.000,50.400,
  38.282,15.400,49.838,44.625,55.007,66.000,39.505,53.000,39.400,
  59.600,59.558,37.500,55.014,49.657,59.406,38.406,39.732,56.757,
  57.635,88.257
];
const IDS = new Map(RUNES.map((r, i) => [r, i]));
const SEED = 0x8f61b120;
const REPLICATES = 5000;

/** @param {string} raw */
function parse(raw) {
  const sourcePages = raw.split('%').slice(0, 55);
  assert.equal(sourcePages.length, 55);
  const pages = sourcePages.map(page => {
    const all = [...page].filter(c => IDS.has(c)).map(c => IDS.get(c));
    const first = page.split('/').filter(s => [...s].some(c => IDS.has(c)))
      .map(s => IDS.get([...s].find(c => IDS.has(c))));
    return {all, first};
  });
  assert.equal(pages.reduce((n, p) => n + p.all.length, 0), 12956);
  assert.equal(pages.reduce((n, p) => n + p.first.length, 0), 594);
  return pages;
}

/** @param {number[]} a @param {number[]} b */
function chi(a, b) {
  return a.reduce((s, v, i) => s + (v - b[i])**2 / b[i], 0);
}

/**
 * Two interpretations: treat the first physical printed rune of each
 * page as mechanically fixed, or allow it to be width-selected too.
 * In either case the original page rune multiset is sampled exactly.
 * @param {{all:number[],first:number[]}[]} pages
 * @param {boolean} fixedFirst
 */
function model(pages, fixedFirst) {
  const observed = Array(29).fill(0);
  const expected = Array(29).fill(0);
  const unweighted = Array(29).fill(0);
  const inventory = [];
  for (const page of pages) {
    const counts = Array(29).fill(0);
    for (const value of page.all) counts[value]++;
    for (const value of page.first) observed[value]++;
    const first = page.first[0];
    const trials = fixedFirst ? page.first.length - 1 : page.first.length;
    if (fixedFirst) counts[first]--;
    const total = counts.reduce((s, c) => s + c, 0);
    const weighted = counts.reduce((s, c, i) => s + c * WIDTHS[i], 0);
    for (let i = 0; i < 29; i++) {
      const fixed = fixedFirst && i === first ? 1 : 0;
      expected[i] += fixed + trials * counts[i] * WIDTHS[i] / weighted;
      unweighted[i] += fixed + trials * counts[i] / total;
    }
    inventory.push({counts, trials, fixed: fixedFirst ? first : -1});
  }
  return {observed, expected, unweighted, inventory};
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    return (value >>> 0) / 4294967296;
  };
}

/**
 * Successive weighted draws without replacement preserve every original
 * page's rune inventory; they approximate wider runes crossing line wraps.
 * This is a proposed type-layout null, not a proven typesetting generator.
 * @param {{all:number[],first:number[]}[]} pages
 * @param {boolean} fixedFirst
 */
function experiment(pages, fixedFirst) {
  const fit = model(pages, fixedFirst);
  const random = seededRandom(SEED ^ (fixedFirst ? 0 : 0x61373003));
  const actual = chi(fit.observed, fit.expected);
  const values = [];
  for (let t = 0; t < REPLICATES; t++) {
    const draws = Array(29).fill(0);
    for (const {counts: original, trials, fixed} of fit.inventory) {
      const remaining = original.slice();
      if (fixed >= 0) draws[fixed]++;
      for (let j = 0; j < trials; j++) {
        let total = 0;
        for (let i = 0; i < 29; i++) total += remaining[i] * WIDTHS[i];
        let sample = random() * total;
        for (let i = 0; i < 29; i++) {
          sample -= remaining[i] * WIDTHS[i];
          if (sample < 0) {
            draws[i]++;
            remaining[i]--;
            break;
          }
        }
      }
    }
    values.push(chi(draws, fit.expected));
  }
  const greater = values.filter(x => x >= actual).length;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  values.sort((a, b) => a - b);
  return {
    observedPearson: actual,
    unweightedPearson: chi(fit.observed, fit.unweighted),
    nullMean: mean,
    nullSD: Math.sqrt(values.reduce((s, v) => s + (v - mean)**2, 0) / values.length),
    null05: values[250],
    null50: values[2500],
    null95: values[4750],
    rightTailCount: greater,
    rightTailP: (greater + 1) / (REPLICATES + 1),
    largestResiduals: RUNES.map((r, i) => ({
      rune: r, observed: fit.observed[i], expected: fit.expected[i],
      contribution: (fit.observed[i] - fit.expected[i])**2 / fit.expected[i]
    })).sort((a, b) => b.contribution - a.contribution).slice(0, 6)
  };
}

function main() {
  const raw = fs.readFileSync(path.join(__dirname, '..', 'resources', 'lp2-transcription.txt'), 'utf8');
  const pages = parse(raw);
  const unconditioned = experiment(pages, false);
  const firstConditioned = experiment(pages, true);
  const startWidth = pages.flatMap(p => p.first).reduce((s, i) => s + WIDTHS[i], 0) / 594;
  const runeWidth = pages.flatMap(p => p.all).reduce((s, i) => s + WIDTHS[i], 0) / 12956;
  assert(Math.abs(unconditioned.unweightedPearson - 78.2974943196) < 1e-7);
  assert(Math.abs(firstConditioned.unweightedPearson - 60.2055383986) < 1e-7);
  console.log(JSON.stringify({pages: 55, runes: 12956, lines: 594,
    sourceImage: '60.jpg', seed: SEED, replicates: REPLICATES,
    actualMeanStartWidth: startWidth, manuscriptMeanRuneWidth: runeWidth,
    unconditioned, firstConditioned}, null, 2));
}
if (require.main === module) main();
module.exports = {WIDTHS, parse, experiment};
