'use strict';

/**
 * LP2 doublet-exception channel scan.
 *
 * The 86 within-page repeated-rune events are an unusually sparse channel.
 * Tests three specified 29-symbol readings against an English-rune unigram
 * reference, with 58 affine relabelings and matched random event positions.
 * The test asks whether the exceptions carry ordinary runic plaintext;
 * it cannot rule out independently encrypted exception payloads.
 *
 * Run: node sims/doublet_exception_channel.cjs
 */
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'
));

const pool = [];
const events = [];
let runeOffset = 0;
for (const page of corpus.pages) {
  if (page.page > 55) continue;
  for (let i = 1; i < page.indices.length; i++) {
    const item = { page: page.page, local: i, global: runeOffset + i, rune: page.indices[i] };
    pool.push(item);
    if (page.indices[i] === page.indices[i - 1]) events.push(item);
  }
  runeOffset += page.indices.length;
}
if (runeOffset !== 12956 || pool.length !== 12901 || events.length !== 86) {
  throw new Error('LP2 corpus count invariant failed');
}

const reference = corpus.pages.find((page) => page.page === 57).indices;
const freq = new Array(29).fill(0.5);
for (const rune of reference) freq[rune]++;
const total = freq.reduce((a, b) => a + b, 0);
const probability = freq.map((v) => v / total);
const logP = probability.map((v) => Math.log(v));

/** @param {number[]} values */
function bestScore(values) {
  const histogram = new Array(29).fill(0);
  for (const value of values) histogram[value]++;
  let best = -Infinity;
  for (const sign of [1, -1]) {
    for (let shift = 0; shift < 29; shift++) {
      let ll = 0;
      for (let i = 0; i < 29; i++) {
        ll += histogram[i] * logP[(sign * i + shift + 29) % 29];
      }
      best = Math.max(best, ll / values.length);
    }
  }
  return best;
}

/** @param {{page:number, local:number, global:number, rune:number}[]} sample */
function readings(sample) {
  return [
    sample.map((event) => event.rune),
    sample.slice(1).map((event, index) => (event.global - sample[index].global) % 29),
    sample.map((event) => event.local % 29),
  ];
}

let state = 0x24db1e57;
/** @returns {number} Uniform in [0,1). */
function random() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 4294967296;
}

function randomEvents() {
  const selected = new Set();
  while (selected.size < events.length) {
    selected.add(Math.floor(random() * pool.length));
  }
  return [...selected].sort((a, b) => a - b).map((index) => pool[index]);
}

/** @param {{page:number}[]} sample */
function pageConcentration(sample) {
  const counts = new Array(56).fill(0);
  const eligible = new Array(56).fill(0);
  for (const event of sample) counts[event.page]++;
  for (const item of pool) eligible[item.page]++;
  let value = 0;
  for (let page = 0; page < 56; page++) {
    if (eligible[page] === 0) continue;
    const expected = events.length * eligible[page] / pool.length;
    value += (counts[page] - expected) ** 2 / expected;
  }
  return value;
}

/** @param {number[]} sorted @param {number} target */
function empiricalP(sorted, target) {
  return (1 + sorted.filter((value) => value >= target).length) / (1 + sorted.length);
}

/** @param {number[]} sorted @param {number} q */
function quantile(sorted, q) {
  return sorted[Math.floor(q * (sorted.length - 1))];
}

const nNull = 3000;
const names = ['repeated_rune', 'inter_event_gap_mod29', 'page_local_position_mod29'];
const observed = readings(events).map(bestScore);
const nulls = names.map(() => []);
const nullPageConcentration = [];
for (let t = 0; t < nNull; t++) {
  const sample = randomEvents();
  const scores = readings(sample);
  for (let i = 0; i < names.length; i++) nulls[i].push(bestScore(scores[i]));
  nullPageConcentration.push(pageConcentration(sample));
}
for (const scores of nulls) scores.sort((a, b) => a - b);
nullPageConcentration.sort((a, b) => a - b);

const pageObserved = pageConcentration(events);
const result = {
  method: '29-symbol smoothed page-57 unigram score; max over ± index and 29 offsets',
  corpus: { pages: 55, runes: runeOffset, eligible_within_page_pairs: pool.length,
    repeated_pairs: events.length, reference_runes: reference.length },
  null: { draws: nNull, seed: '0x24db1e57',
    construction: '86 positions sampled uniformly without replacement from 12901 eligible pairs' },
  readings: names.map((name, index) => ({
    name, symbols: name === 'inter_event_gap_mod29' ? 85 : 86,
    observed: observed[index],
    null_mean: nulls[index].reduce((a, b) => a + b, 0) / nNull,
    null_p95: quantile(nulls[index], 0.95),
    null_p99: quantile(nulls[index], 0.99),
    p_upper: empiricalP(nulls[index], observed[index]),
  })),
  page_concentration: {
    observed: pageObserved,
    null_mean: nullPageConcentration.reduce((a, b) => a + b, 0) / nNull,
    null_p95: quantile(nullPageConcentration, 0.95),
    p_upper: empiricalP(nullPageConcentration, pageObserved),
  },
};

const threshold = quantile(nulls[0], 0.99);
let passed = 0;
const nPlant = 500;
for (let trial = 0; trial < nPlant; trial++) {
  const sign = random() < 0.5 ? 1 : -1;
  const shift = Math.floor(random() * 29);
  const planted = [];
  for (let i = 0; i < 86; i++) {
    const u = random();
    let sum = 0;
    let symbol = 28;
    for (let k = 0; k < 29; k++) {
      sum += probability[k];
      if (u <= sum) { symbol = k; break; }
    }
    planted.push((sign * symbol + shift + 58) % 29);
  }
  if (bestScore(planted) > threshold) passed++;
}
result.positive_control = {
  model: 'iid draws from fitted page-57 rune unigrams, random affine relabeling',
  detectable_at_rune_channel_null_p99: passed,
  planted_trials: nPlant,
};
console.log(JSON.stringify(result, null, 2));
