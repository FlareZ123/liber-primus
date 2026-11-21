#!/usr/bin/env node
'use strict';

// Reproduce LP2 adjacent-equality sites from the local corpus, then test how
// their gap autocorrelation changes under page- and line-conditioned nulls.
// Run from repository root: node sims/lp2_t7_layout_conditioned_null.cjs [draws].
// No external result file is required.

const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const DRAWS = Math.max(100, Number(process.argv[2] || 10000));
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const transcription = fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-transcription.txt'), 'utf8'
);
const runeSet = new Set(corpus.runes);

// LP2's unsolved rune stream consists of physical pages 0-49 and 51-55.
// Physical p50 is the non-rune 256-cell table.
const runePages = corpus.pages.filter(p => p.page <= 55 && p.page !== 50);
const stream = runePages.flatMap(p => p.indices);
const rawLines = transcription.split(/\r?\n/);
const groups = [];
let group = [];
for (const line of rawLines) {
  if (line.trim() === '%') {
    groups.push(group);
    group = [];
  } else {
    group.push(line);
  }
}
if (group.length) groups.push(group);

function classifySeparator(s) {
  if (s.includes('%')) return 'page';
  if (s.includes('/')) return 'line';
  if (s.includes('.')) return 'clause';
  if (s.includes('-')) return 'word';
  return s.length ? 'other' : 'none';
}

const pageRecords = [];
const lineRecords = [];
const pageByPos = [];
const lineByPos = [];
const separatorTypes = [];
let pendingSeparator = '';
let runePos = 0;

for (let gi = 0; gi < groups.length; gi++) {
  const page = gi < 50 ? gi : gi + 1;
  if (page > 55) break;

  const pageStart = runePos;
  for (let li = 0; li < groups[gi].length; li++) {
    const line = groups[gi][li];
    const lineStart = runePos;
    const lineId = lineRecords.length;

    for (const ch of Array.from(line)) {
      if (runeSet.has(ch)) {
        if (runePos > 0) separatorTypes.push(classifySeparator(pendingSeparator));
        pageByPos.push(page);
        lineByPos.push(lineId);
        runePos++;
        pendingSeparator = '';
      } else {
        pendingSeparator += ch;
      }
    }

    if (runePos > lineStart) {
      lineRecords.push({
        page,
        line: li + 1,
        start: lineStart,
        end: runePos - 1,
        length: runePos - lineStart
      });
    }
    // Preserve the physical line boundary even if '/' is absent.
    if (!line.includes('/')) pendingSeparator += '/';
  }

  pageRecords.push({
    page,
    start: pageStart,
    end: runePos - 1,
    length: runePos - pageStart
  });
  pendingSeparator += '%';
}

if (runePos !== stream.length) {
  throw new Error('Transcription/corpus mismatch: ' + runePos + ' vs ' + stream.length + ' runes');
}
if (separatorTypes.length !== stream.length - 1) {
  throw new Error('Boundary map mismatch: ' + separatorTypes.length + ' vs ' + (stream.length - 1));
}

const sites = [];
for (let i = 0; i < stream.length - 1; i++) {
  if (stream[i] === stream[i + 1]) sites.push(i);
}
const gaps = sites.slice(1).map((p, i) => p - sites[i]);

function lag1(values) {
  if (values.length < 4) return null;
  const x = values.slice(0, -1);
  const y = values.slice(1);
  const mx = x.reduce((s, v) => s + v, 0) / x.length;
  const my = y.reduce((s, v) => s + v, 0) / y.length;
  let numerator = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < x.length; i++) {
    const a = x[i] - mx;
    const b = y[i] - my;
    numerator += a * b;
    dx += a * a;
    dy += b * b;
  }
  return numerator / Math.sqrt(dx * dy);
}

function gapAc1FromPositions(positions) {
  const sorted = positions.slice().sort((a, b) => a - b);
  return lag1(sorted.slice(1).map((p, i) => p - sorted[i]));
}

// Deterministic xorshift32 PRNG. Each draw receives an independent derived seed.
function makeRng(seed) {
  let x = seed >>> 0;
  if (x === 0) x = 0x6d2b79f5;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 0x100000000;
  };
}

// Floyd sampling: uniform k-subset of [0,n).
function sampleDistinct(n, k, rng) {
  if (k === 0) return [];
  if (k < 0 || k > n) throw new Error('Invalid sample size ' + k + '/' + n);
  const selected = new Set();
  for (let j = n - k; j < n; j++) {
    const t = Math.floor(rng() * (j + 1));
    selected.add(selected.has(t) ? j : t);
  }
  return Array.from(selected).sort((a, b) => a - b);
}

// Uniform subset conditioned on no adjacent start positions.
function sampleNonAdjacent(candidates, k, rng) {
  if (k === 0) return [];
  for (let attempt = 0; attempt < 1000; attempt++) {
    const chosen = sampleDistinct(candidates.length, k, rng)
      .map(i => candidates[i]);
    let valid = true;
    for (let i = 1; i < chosen.length; i++) {
      if (chosen[i] - chosen[i - 1] === 1) {
        valid = false;
        break;
      }
    }
    if (valid) return chosen;
  }
  throw new Error('Could not sample ' + k + ' nonadjacent sites from ' + candidates.length + ' candidates');
}

function summarize(values, observed) {
  values.sort((a, b) => a - b);
  const lower = values.filter(v => v <= observed).length;
  const upper = values.filter(v => v >= observed).length;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const sd = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1));
  const pTwoSided = Math.min(1, 2 * Math.min(lower + 1, upper + 1) / (values.length + 1));
  return {
    draws: values.length,
    mean,
    sd,
    z: (observed - mean) / sd,
    p_two_sided_add_one: pTwoSided,
    lower_tail_draws: lower,
    upper_tail_draws: upper,
    q05: values[Math.floor(0.05 * (values.length - 1))],
    q95: values[Math.floor(0.95 * (values.length - 1))]
  };
}

function runConditionalNull(units, fixedPositions, observed, seed) {
  const values = new Array(DRAWS);
  for (let d = 0; d < DRAWS; d++) {
    const rng = makeRng((seed + Math.imul(d, 0x9e3779b9)) >>> 0);
    const positions = fixedPositions.slice();
    for (const unit of units) {
      positions.push(...sampleNonAdjacent(unit.candidates, unit.count, rng));
    }
    positions.sort((a, b) => a - b);
    values[d] = lag1(positions.slice(1).map((p, i) => p - positions[i]));
  }
  return summarize(values, observed);
}

function makeUnits(records, countForUnit, fixedPositions) {
  return records.map((unit, index) => {
    const forbidden = new Set();
    for (const p of fixedPositions) {
      if (p >= unit.start - 1 && p <= unit.end + 1) {
        for (let q = p - 1; q <= p + 1; q++) forbidden.add(q);
      }
    }
    const candidates = [];
    // A start at unit.end would cross the physical unit boundary, so omit it.
    for (let p = unit.start; p <= unit.end - 1; p++) {
      if (!forbidden.has(p)) candidates.push(p);
    }
    const count = countForUnit(unit, index);
    if (count < 0 || count > candidates.length) {
      throw new Error('Impossible conditioned count ' + count + ' in unit starting ' + unit.start);
    }
    return { count, candidates };
  });
}

function countDistribution(values) {
  return values.reduce((out, value) => {
    out[value] = (out[value] || 0) + 1;
    return out;
  }, {});
}

function permutationAc1Test(values, seed) {
  const observed = lag1(values);
  const nullValues = new Array(DRAWS);
  for (let d = 0; d < DRAWS; d++) {
    const rng = makeRng((seed + Math.imul(d, 0x9e3779b9)) >>> 0);
    const shuffled = values.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    nullValues[d] = lag1(shuffled);
  }
  return summarize(nullValues, observed);
}

const pageCounts = new Map(pageRecords.map(p => [p.page, 0]));
const lineCounts = new Array(lineRecords.length).fill(0);
const lineInternalCounts = new Array(lineRecords.length).fill(0);
const crossLinePositions = [];
const crossPagePositions = [];
const siteTypeCounts = {};

for (const p of sites) {
  const type = separatorTypes[p];
  siteTypeCounts[type] = (siteTypeCounts[type] || 0) + 1;
  pageCounts.set(pageByPos[p], pageCounts.get(pageByPos[p]) + 1);
  lineCounts[lineByPos[p]]++;
  if (lineByPos[p] === lineByPos[p + 1]) {
    lineInternalCounts[lineByPos[p]]++;
  } else {
    crossLinePositions.push(p);
  }
  if (pageByPos[p] !== pageByPos[p + 1]) crossPagePositions.push(p);
}

const rawAc1 = lag1(gaps);
const observed = rawAc1;
const crossLineByPage = new Map();
for (const p of crossLinePositions) {
  const page = pageByPos[p];
  crossLineByPage.set(page, (crossLineByPage.get(page) || 0) + 1);
}

// Page-conditioned diagnostic: preserve exact site count per physical page and
// fix the four line-boundary sites. This tests within-page placement only.
const pageUnits = makeUnits(
  pageRecords,
  unit => pageCounts.get(unit.page) - (crossLineByPage.get(unit.page) || 0),
  crossLinePositions
);
const pageNull = runConditionalNull(pageUnits, crossLinePositions, observed, 0x20261121);

// Line-conditioned diagnostic: preserve exact within-line site counts and fix
// the four line-boundary sites. This tests within-line placement only.
const lineUnits = makeUnits(
  lineRecords,
  (_unit, index) => lineInternalCounts[index],
  crossLinePositions
);
const lineNull = runConditionalNull(lineUnits, crossLinePositions, observed, 0x20261234);

// Separator sensitivity: 60 sites have no printed separator between the two
// runes; 26 cross a word/clause/line separator. This is diagnostic only.
const withinSeparatorPositions = sites.filter(p => separatorTypes[p] === 'none');
const acrossSeparatorPositions = sites.filter(p => separatorTypes[p] !== 'none');
const withinCandidates = Array.from({ length: stream.length - 1 }, (_, p) => p)
  .filter(p => separatorTypes[p] === 'none');
const withinObserved = gapAc1FromPositions(withinSeparatorPositions);
const acrossObserved = gapAc1FromPositions(acrossSeparatorPositions);
const withinNullValues = new Array(DRAWS);
for (let d = 0; d < DRAWS; d++) {
  const rng = makeRng((0x00face00 + Math.imul(d, 0x9e3779b9)) >>> 0);
  const positions = sampleNonAdjacent(withinCandidates, withinSeparatorPositions.length, rng);
  withinNullValues[d] = gapAc1FromPositions(positions);
}
const withinWordNull = summarize(withinNullValues, withinObserved);

const pageCountArray = pageRecords.map(p => pageCounts.get(p.page));
const pageCountLag1 = permutationAc1Test(pageCountArray, 0x00022b22);
const lineCountLag1 = permutationAc1Test(lineCounts, 0x00011a11);

function locate(position) {
  const lineId = lineByPos[position];
  const line = lineRecords[lineId];
  return {
    page: pageByPos[position],
    line: line.line,
    column_1_based: position - line.start + 1,
    global_position: position
  };
}
const longGaps = [];
for (let i = 0; i < gaps.length; i++) {
  if (gaps[i] >= 300) {
    longGaps.push({
      gap: gaps[i],
      from: locate(sites[i]),
      to: locate(sites[i + 1])
    });
  }
}

if (stream.length !== 12956 || sites.length !== 86) {
  throw new Error('Expected frozen 12,956/86 corpus; got ' + stream.length + '/' + sites.length);
}

const output = {
  inputs: {
    corpus: 'resources/liber-primus/lp2-corpus.json',
    transcription: 'resources/liber-primus/lp2-transcription.txt',
    physical_pages: '0-49, 51-55',
    rune_count: stream.length,
    line_count: lineRecords.length,
    page_count: pageRecords.length
  },
  reproduced: {
    adjacent_equal_sites: sites.length,
    gap_count: gaps.length,
    gap_lag1_pearson_ac1: rawAc1,
    site_type_counts: siteTypeCounts,
    cross_line_site_positions: crossLinePositions,
    cross_page_site_positions: crossPagePositions
  },
  page_counts: pageRecords.map(p => ({
    page: p.page,
    runes: p.length,
    sites: pageCounts.get(p.page)
  })),
  line_site_count_distribution: countDistribution(lineCounts),
  diagnostics: {
    page_conditioned: {
      description: 'Preserve exact per-page site counts; fix line-crossing sites; randomize nonadjacent starts within pages.',
      seed: '0x20261121',
      ...pageNull
    },
    line_conditioned: {
      description: 'Preserve exact within-line site counts; fix line-crossing sites; randomize nonadjacent starts within lines.',
      seed: '0x20261234',
      ...lineNull
    },
    within_separator_only: {
      sites: withinSeparatorPositions.length,
      across_separator_sites: acrossSeparatorPositions.length,
      within_gap_ac1: withinObserved,
      across_separator_gap_ac1: acrossObserved,
      description: 'Sample the same number of nonadjacent sites uniformly from positions with no printed separator.',
      seed: '0x00face00',
      ...withinWordNull
    },
    page_count_sequence_lag1: {
      observed: lag1(pageCountArray),
      seed: '0x00022b22',
      ...pageCountLag1
    },
    line_count_sequence_lag1: {
      observed: lag1(lineCounts),
      seed: '0x00011a11',
      ...lineCountLag1
    }
  },
  gaps_at_least_300_runes: longGaps,
  interpretation_limits: [
    'The page-conditioned null fixes page counts; it cannot test whether page-level rates themselves vary.',
    'The line-conditioned null fixes line counts; it tests only whether within-line positions add structure.',
    'The within-separator-only analysis is diagnostic; it does not assume the cipher resets at spaces or line breaks.',
    'These diagnostics do not identify a cipher, key, plaintext, or keystream generator.'
  ]
};

console.log(JSON.stringify(output, null, 2));
