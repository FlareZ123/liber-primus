'use strict';

const fs = require('node:fs');
const lp2Text = fs.readFileSync('resources/liber-primus/lp2-transcription.txt', 'utf8').trim();
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const pages = lp2Text.split(/\n%\n/).slice(0, 55);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

const records = [];
const pageStats = [];
let pos = 0, lineId = 0, wordId = 0;
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
        wordId++;
      }
    }
    lineId++;
  }
  wordId++; // Never join words across page boundaries.
  const runeCounts = new Int32Array(29);
  for (const record of pageRecords) runeCounts[record.index]++;
  const expectedDoubletsUnderPageShuffle =
    runeCounts.reduce((sum, n) => sum + n * (n - 1), 0) / pageRecords.length;
  let withinPairs = 0, withinDoublets = 0, crossPairs = 0, crossDoublets = 0;
  for (let i = 1; i < pageRecords.length; i++) {
    const a = pageRecords[i - 1], b = pageRecords[i];
    if (a.word !== b.word) {
      crossPairs++;
      if (a.index === b.index) crossDoublets++;
    } else {
      withinPairs++;
      if (a.index === b.index) withinDoublets++;
    }
  }
  pageStats.push({
    page: p, runes: pageRecords.length, withinPairs, withinDoublets, crossPairs, crossDoublets,
    expectedDoubletsUnderPageShuffle
  });
}

const allSlots = [], withinSlots = [], crossSlots = [];
const allSites = [], withinSites = [], crossSites = [];
const boundaryPairs = [];
const transitionDifferences = {
  all: new Int32Array(29),
  withinWord: new Int32Array(29),
  crossWord: new Int32Array(29),
  p11_23WithinWord: new Int32Array(29),
  p11_23CrossWord: new Int32Array(29)
};
let lineDoublets = 0, withinWordLineDoublets = 0, crossWordLineDoublets = 0;
let crossPageDoublets = 0;

for (let i = 1; i < records.length; i++) {
  const a = records[i - 1], b = records[i];
  if (a.page !== b.page) {
    if (a.index === b.index) crossPageDoublets++;
    continue;
  }
  const within = a.word === b.word;
  const difference = (b.index - a.index + 29) % 29;
  transitionDifferences.all[difference]++;
  transitionDifferences[within ? 'withinWord' : 'crossWord'][difference]++;
  if (a.page >= 11 && a.page <= 23) {
    transitionDifferences[within ? 'p11_23WithinWord' : 'p11_23CrossWord'][difference]++;
  }
  (within ? withinSlots : crossSlots).push(a.pos);
  allSlots.push(a.pos);
  if (!within) boundaryPairs.push({ page: a.page, x: a.index, y: b.index });
  if (a.index === b.index) {
    (within ? withinSites : crossSites).push(a.pos);
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
  return {
    observedAC1: observed, reps, exceed,
    pUpper: (exceed + 1) / (reps + 1),
    seed: '0x' + seed.toString(16)
  };
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
    observed, totalBoundarySlots: slots.length, totalCrossWordDoublets: k,
    reps, exceed, pFamilywise: (exceed + 1) / (reps + 1),
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
    reps, affineMaxExceed: exceed, affineMaxP: (exceed + 1) / (reps + 1),
    zeroDiagonalExceed: zeroDiagonal, zeroDiagonalP: (zeroDiagonal + 1) / (reps + 1),
    seed: '0x' + seed.toString(16)
  };
}

function lp1FirstThreeBlockControl() {
  const lp1 = fs.readFileSync('resources/transcriptions/lp1_wulfic_canonical.txt', 'utf8').trim();
  const blocks = lp1.split(/\n%\n/).slice(0, 3);
  let runes = 0, withinPairs = 0, withinDoublets = 0, crossPairs = 0, crossDoublets = 0;
  const withinDifferences = new Int32Array(29), crossDifferences = new Int32Array(29);
  for (const block of blocks) {
    const page = [];
    let word = 0;
    for (const rawLine of block.split('\n')) {
      for (const ch of [...rawLine]) {
        if (runeIndex.has(ch)) page.push({ index: runeIndex.get(ch), word });
        else if (ch === '-' || ch === '.' || ch === '&' || ch === '$') word++;
      }
    }
    runes += page.length;
    for (let i = 1; i < page.length; i++) {
      const a = page[i - 1], b = page[i];
      const difference = (b.index - a.index + 29) % 29;
      if (a.word === b.word) {
        withinDifferences[difference]++;
        withinPairs++;
        if (a.index === b.index) withinDoublets++;
      } else {
        crossDifferences[difference]++;
        crossPairs++;
        if (a.index === b.index) crossDoublets++;
      }
    }
  }
  return {
    blocks: blocks.length, runes,
    withinPairs, withinDoublets, withinRate: withinDoublets / withinPairs,
    crossPairs, crossDoublets, crossRate: crossDoublets / crossPairs,
    withinDifferenceCounts: Array.from(withinDifferences),
    crossDifferenceCounts: Array.from(crossDifferences)
  };
}

function p15GridRepeatingWordKeyTest(records, boundaryPairs) {
  const fib = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];
  const primeIndex = fib.map(x => x + 1);
  const primes = [2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463, 829, 1481, 2593, 4507, 7817];
  const printed = [3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516];
  const sequences = {
    printed, prime: primes, totient: primes.map(x => x - 1), fib, primeIndex
  };
  const keys = Object.fromEntries(Object.entries(sequences).map(([name, values]) =>
    [name, values.map(x => ((x % 29) + 29) % 29)]));
  const wordMap = new Map();
  for (const record of records) {
    if (record.page < 16 || record.page > 23) continue;
    if (!wordMap.has(record.word)) wordMap.set(record.word, []);
    wordMap.get(record.word).push(record.index);
  }
  const words = Array.from(wordMap.values());
  const flat = words.flat();
  const ioc = values => {
    const counts = new Int32Array(29);
    for (const x of values) counts[x]++;
    const n = values.length;
    let numerator = 0;
    for (const count of counts) numerator += count * (count - 1);
    return numerator / (n * (n - 1));
  };
  const runeStream = records.filter(record => record.page >= 16 && record.page <= 23).map(record => record.index);
  const runeVariants = [];
  for (const [name, key] of Object.entries(keys)) {
    for (const a of [1, 28]) for (const sign of [1, -1]) {
      const decoded = runeStream.map((x, i) => ((a * x + sign * key[i % 16]) % 29 + 29) % 29);
      runeVariants.push({ name, a, sign, ioc: ioc(decoded) });
    }
  }
  runeVariants.sort((x, y) => y.ioc - x.ioc);
  const wordVariants = [];
  for (const [name, key] of Object.entries(keys)) {
    for (const a of [1, 28]) for (const sign of [1, -1]) {
      const decoded = [];
      for (let wi = 0; wi < words.length; wi++) {
        for (const x of words[wi]) decoded.push(((a * x + sign * key[wi % 16]) % 29 + 29) % 29);
      }
      wordVariants.push({ name, a, sign, ioc: ioc(decoded) });
    }
  }
  wordVariants.sort((x, y) => y.ioc - x.ioc);

  const pairs = boundaryPairs.filter(p => p.page >= 16 && p.page <= 23);
  const candidates = [];
  for (const [name, key] of Object.entries(keys)) {
    for (const a of [1, 28]) for (const sign of [1, -1]) candidates.push({ name, key, a, sign });
  }
  function score(ys) {
    let best = { matches: -1, name: '', a: 0, sign: 0 };
    for (const candidate of candidates) {
      let matches = 0;
      for (let i = 0; i < pairs.length; i++) {
        const b = ((candidate.sign * candidate.key[i % 16]) % 29 + 29) % 29;
        if (ys[i] === ((candidate.a * pairs[i].x + b) % 29 + 29) % 29) matches++;
      }
      if (matches > best.matches) best = {
        matches, name: candidate.name, a: candidate.a, sign: candidate.sign
      };
    }
    return best;
  }
  const ys = pairs.map(p => p.y);
  const observed = score(ys);
  const rand = makeRng(0x16b0a11);
  const reps = 10000;
  let exceed = 0;
  for (let r = 0; r < reps; r++) {
    const shuffled = ys.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = rand() % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    if (score(shuffled).matches >= observed.matches) exceed++;
  }
  return {
    sourceKeyCandidates: 5, affineFormsPerKey: 4, totalFixedCandidates: candidates.length,
    p16_23Words: words.length, p16_23Runes: flat.length,
    bestWholeWordShift: wordVariants[0],
    bestContinuousRuneKey: runeVariants[0],
    uniformIoCBaseline: 1 / 29,
    boundaryPairs: pairs.length, bestBoundaryRelation: observed,
    boundaryMaxPermutation: { reps, exceed, p: (exceed + 1) / (reps + 1), seed: '0x16b0a11' }
  };
}

const totalDoublets = allSites.length;
const withinDoublets = withinSites.length;
const crossDoublets = crossSites.length;
const pageBoundaryDoublets = crossPageDoublets;
const lineBoundaryStats = {
  total: lineDoublets, withinWord: withinWordLineDoublets, crossWord: crossWordLineDoublets
};
const regionStats = (lo, hi) => {
  const selected = pageStats.filter(p => p.page >= lo && p.page <= hi);
  return {
    pages: [lo, hi],
    runes: selected.reduce((a, p) => a + p.runes, 0),
    withinWordPairs: selected.reduce((a, p) => a + p.withinPairs, 0),
    withinWordDoublets: selected.reduce((a, p) => a + p.withinDoublets, 0),
    withinWordRate: selected.reduce((a, p) => a + p.withinDoublets, 0) / selected.reduce((a, p) => a + p.withinPairs, 0),
    wordBoundaries: selected.reduce((a, p) => a + p.crossPairs, 0),
    crossWordDoublets: selected.reduce((a, p) => a + p.crossDoublets, 0),
    crossWordRate: selected.reduce((a, p) => a + p.crossDoublets, 0) / selected.reduce((a, p) => a + p.crossPairs, 0)
  };
};
const selectedBoundaryPairs = boundaryPairs.filter(p => p.page >= 11 && p.page <= 23);
const expectedPageMarginal = pageStats.reduce((sum, p) => sum + p.expectedDoubletsUnderPageShuffle, 0);
const output = {
  source: 'resources/liber-primus/lp2-transcription.txt + lp2-corpus.json; LP2 pages 0–54',
  lp1FirstThreeBlockControl: lp1FirstThreeBlockControl(),
  runes: records.length,
  adjacentPairs: allSlots.length,
  expectedDoubletsUnderUniform: allSlots.length / 29,
  expectedDoubletsUnderPageMarginalShuffle: expectedPageMarginal,
  repeatSuppressionVsPageMarginalShuffle: 1 - totalDoublets / expectedPageMarginal,
  transitionDifferenceCounts: Object.fromEntries(
    Object.entries(transitionDifferences).map(([k, v]) => [k, Array.from(v)])
  ),
  doublets: {
    total: totalDoublets, withinWord: withinDoublets, acrossWord: crossDoublets,
    acrossLine: lineBoundaryStats, acrossPage: pageBoundaryDoublets
  },
  blockCountsPer1000Runes: Array.from({ length: 13 }, (_, b) =>
    allSites.filter(p => Math.floor(p / 1000) === b).length),
  gapAC1: {
    all: ac1OfGaps(allSites), withinWord: ac1OfGaps(withinSites),
    acrossWord: ac1OfGaps(crossSites)
  },
  allSitesConditionalNull: conditionalGapTest(allSlots, allSites, 10000, 0x7a71c0de),
  withinWordConditionalNull: conditionalGapTest(withinSlots, withinSites, 10000, 0x7a71c0de),
  acrossWordConditionalNull: conditionalGapTest(crossSlots, crossSites, 10000, 0x7a71c0de),
  chapterWindows: {
    p15_22: regionStats(15, 22),
    p11_23: regionStats(11, 23),
    longestZeroCrossWordRun: maxZeroRunTest(pageStats, 100000, 0x0b51d3)
  },
  p11_23BoundaryAffine: boundaryAffineTest(selectedBoundaryPairs, 5000, 0x11c0ffee),
  p15GridRepeatingWordKey: p15GridRepeatingWordKeyTest(records, boundaryPairs),
  pageCrossWordCounts: pageStats.filter(p => p.crossDoublets > 0)
};

console.log(JSON.stringify(output, null, 2));
