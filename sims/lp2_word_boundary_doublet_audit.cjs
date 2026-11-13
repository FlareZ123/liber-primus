'use strict';

const fs = require('node:fs');
const text = fs.readFileSync('resources/liber-primus/lp2-transcription.txt', 'utf8').trim();
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const pages = text.split(/\n%\n/).slice(0, 55);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

const records = [];
const pageStats = [];
let pos = 0;
let lineId = 0;
let wordId = 0;
for (let p = 0; p < pages.length; p++) {
  const pageRecords = [];
  for (const rawLine of pages[p].split('\n')) {
    for (const ch of [...rawLine]) {
      if (runeIndex.has(ch)) {
        const record = { index: runeIndex.get(ch), pos, page: p, line: lineId, word: wordId };
        records.push(record);
        pageRecords.push(record);
        pos++;
      } else if (ch === '-' || ch === '.' || ch === '&' || ch === '$') {
        // These are transcription word/punctuation boundaries. A line break alone
        // does not end a word; the terminal slash is a line marker.
        wordId++;
      }
    }
    lineId++;
  }
  wordId++; // Do not join words across page boundaries.
  let crossPairs = 0;
  let crossDoublets = 0;
  for (let i = 1; i < pageRecords.length; i++) {
    const a = pageRecords[i - 1], b = pageRecords[i];
    if (a.word !== b.word) {
      crossPairs++;
      if (a.index === b.index) crossDoublets++;
    }
  }
  pageStats.push({ page: p, runes: pageRecords.length, crossPairs, crossDoublets });
}

const allSlots = [], withinSlots = [], crossSlots = [];
const allSites = [], withinSites = [], crossSites = [];
const boundaryPairs = [];
let lineDoublets = 0, withinWordLineDoublets = 0, crossWordLineDoublets = 0;
let crossPageDoublets = 0;
for (let i = 1; i < records.length; i++) {
  const a = records[i - 1], b = records[i];
  if (a.page !== b.page) {
    if (a.index === b.index) crossPageDoublets++;
    continue;
  }
  const within = a.word === b.word;
  const slots = within ? withinSlots : crossSlots;
  const sites = within ? withinSites : crossSites;
  slots.push(a.pos);
  allSlots.push(a.pos);
  if (!within) boundaryPairs.push({ page: a.page, x: a.index, y: b.index });
  if (a.index === b.index) {
    sites.push(a.pos);
    allSites.push(a.pos);
    if (a.line !== b.line) {
      lineDoublets++;
      if (within) withinWordLineDoublets++;
      else crossWordLineDoublets++;
    }
  }
}

function ac1OfGaps(positions) {
  const gaps = positions.slice(1).map((x, i) => x - positions[i]);
  if (gaps.length < 3) return 0;
  const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  let numerator = 0, denominator = 0;
  for (let i = 0; i < gaps.length; i++) {
    const d = gaps[i] - mean;
    denominator += d * d;
    if (i > 0) numerator += d * (gaps[i - 1] - mean);
  }
  return denominator ? numerator / denominator : 0;
}
function makeRng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}
function conditionalGapTest(slots, sites, reps, seed) {
  const observed = ac1OfGaps(sites);
  const idx = Array.from({ length: slots.length }, (_, i) => i);
  const rand = makeRng(seed);
  let exceed = 0;
  for (let r = 0; r < reps; r++) {
    const swaps = [];
    for (let i = 0; i < sites.length; i++) {
      const j = i + (rand() % (idx.length - i));
      [idx[i], idx[j]] = [idx[j], idx[i]];
      swaps.push(j);
    }
    const sample = idx.slice(0, sites.length).map(i => slots[i]).sort((a, b) => a - b);
    if (ac1OfGaps(sample) >= observed) exceed++;
    for (let i = swaps.length - 1; i >= 0; i--) {
      const j = swaps[i];
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
  }
  return { observedAC1: observed, reps, exceed, pUpper: (exceed + 1) / (reps + 1), seed: '0x' + seed.toString(16) };
}
function longestZeroRun(counts) {
  let best = 0, current = 0, bestStart = -1, currentStart = -1;
  for (let i = 0; i < counts.length; i++) {
    if (counts[i] === 0) {
      if (current === 0) currentStart = i;
      current++;
      if (current > best) { best = current; bestStart = currentStart; }
    } else current = 0;
  }
  return { length: best, start: bestStart, end: bestStart + best - 1 };
}
function maxZeroRunTest(stats, reps, seed) {
  const slots = [];
  for (const p of stats) for (let i = 0; i < p.crossPairs; i++) slots.push(p.page);
  const k = stats.reduce((a, p) => a + p.crossDoublets, 0);
  const observed = longestZeroRun(stats.map(p => p.crossDoublets));
  const idx = Array.from({ length: slots.length }, (_, i) => i);
  const rand = makeRng(seed);
  let exceed = 0;
  for (let r = 0; r < reps; r++) {
    const counts = new Int16Array(stats.length);
    const swaps = [];
    for (let i = 0; i < k; i++) {
      const j = i + (rand() % (idx.length - i));
      [idx[i], idx[j]] = [idx[j], idx[i]];
      swaps.push(j);
      counts[slots[idx[i]]]++;
    }
    if (longestZeroRun(Array.from(counts)).length >= observed.length) exceed++;
    for (let i = swaps.length - 1; i >= 0; i--) {
      const j = swaps[i];
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
  }
  return {
    observed,
    totalBoundarySlots: slots.length,
    totalCrossWordDoublets: k,
    reps,
    exceed,
    pFamilywise: (exceed + 1) / (reps + 1),
    seed: '0x' + seed.toString(16)
  };
}
function boundaryAffineTest(pairs, reps, seed) {
  const cx = new Int32Array(29), cy = new Int32Array(29);
  for (const q of pairs) { cx[q.x]++; cy[q.y]++; }
  let expectedDiagonal = 0;
  for (let i = 0; i < 29; i++) expectedDiagonal += cx[i] * cy[i] / pairs.length;
  function bestAffine(ys) {
    const matrix = Array.from({ length: 29 }, () => new Int32Array(29));
    for (let i = 0; i < pairs.length; i++) matrix[pairs[i].x][ys[i]]++;
    let best = { a: 0, b: 0, matches: -1 };
    for (let a = 1; a < 29; a++) for (let b = 0; b < 29; b++) {
      let matches = 0;
      for (let x = 0; x < 29; x++) matches += matrix[x][(a * x + b) % 29];
      if (matches > best.matches) best = { a, b, matches };
    }
    return best;
  }
  const ys = pairs.map(q => q.y);
  const observed = bestAffine(ys);
  const rand = makeRng(seed);
  let exceed = 0, zeroDiagonal = 0;
  for (let r = 0; r < reps; r++) {
    const shuffled = ys.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = rand() % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    let diagonal = 0;
    for (let i = 0; i < pairs.length; i++) if (pairs[i].x === shuffled[i]) diagonal++;
    if (diagonal === 0) zeroDiagonal++;
    if (bestAffine(shuffled).matches >= observed.matches) exceed++;
  }
  return {
    n: pairs.length,
    observedDiagonal: pairs.filter(q => q.x === q.y).length,
    expectedDiagonalUnderFixedMarginals: expectedDiagonal,
    distinctFinals: cx.filter(x => x > 0).length,
    distinctInitials: cy.filter(x => x > 0).length,
    bestAffine: observed,
    reps,
    affineMaxExceed: exceed,
    affineMaxP: (exceed + 1) / (reps + 1),
    zeroDiagonalExceed: zeroDiagonal,
    zeroDiagonalP: (zeroDiagonal + 1) / (reps + 1),
    seed: '0x' + seed.toString(16)
  };
}

const totalDoublets = allSites.length;
const withinDoublets = withinSites.length;
const crossDoublets = crossSites.length;
const pageBoundaryDoublets = crossPageDoublets;
const lineBoundaryStats = {
  total: lineDoublets,
  withinWord: withinWordLineDoublets,
  crossWord: crossWordLineDoublets
};
const regionStats = (lo, hi) => {
  const selected = pageStats.filter(p => p.page >= lo && p.page <= hi);
  return {
    pages: [lo, hi],
    runes: selected.reduce((a, p) => a + p.runes, 0),
    wordBoundaries: selected.reduce((a, p) => a + p.crossPairs, 0),
    crossWordDoublets: selected.reduce((a, p) => a + p.crossDoublets, 0)
  };
};
const selectedBoundaryPairs = boundaryPairs.filter(p => p.page >= 11 && p.page <= 23);
const output = {
  source: 'resources/liber-primus/lp2-transcription.txt + lp2-corpus.json; LP2 pages 0–54',
  runes: records.length,
  doublets: {
    total: totalDoublets,
    withinWord: withinDoublets,
    acrossWord: crossDoublets,
    acrossLine: lineBoundaryStats,
    acrossPage: pageBoundaryDoublets
  },
  blockCountsPer1000Runes: Array.from({ length: 13 }, (_, b) =>
    allSites.filter(p => Math.floor(p / 1000) === b).length),
  gapAC1: {
    all: ac1OfGaps(allSites),
    withinWord: ac1OfGaps(withinSites),
    acrossWord: ac1OfGaps(crossSites)
  },
  withinWordConditionalNull: conditionalGapTest(withinSlots, withinSites, 10000, 0x7a71c0de),
  acrossWordConditionalNull: conditionalGapTest(crossSlots, crossSites, 10000, 0x7a71c0de),
  chapterWindows: {
    p15_22: regionStats(15, 22),
    p11_23: regionStats(11, 23),
    longestZeroCrossWordRun: maxZeroRunTest(pageStats, 100000, 0x0b51d3)
  },
  p11_23BoundaryAffine: boundaryAffineTest(selectedBoundaryPairs, 5000, 0x11c0ffee),
  pageCrossWordCounts: pageStats.filter(p => p.crossDoublets > 0)
};
console.log(JSON.stringify(output, null, 2));
