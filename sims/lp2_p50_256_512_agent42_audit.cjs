"use strict";

/**
 * Independent, source-layout-conditioned audit of the p50 256/512 doublet
 * phase claim. This does not search keys or infer a cipher.
 *
 * Run from repository root:
 *   node sims/lp2_p50_256_512_agent42_audit.cjs
 *
 * Node built-ins only. Seeds and trial counts are fixed below.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const book = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const pages = book.pages.filter(p => p.page <= 55 && p.indices.length);
const sourcePages = transcription.split("%").slice(0, 55);
const runeSet = new Set(book.runes);
const runeIndex = new Map(book.runes.map((r, i) => [r, i]));
const tableTokens = grid.rows.flat();
const tableBytes = grid.byte_rows.flat();
const PERIODS = [
  ...Array.from({length: 23}, (_, i) => 245 + i),
  ...Array.from({length: 25}, (_, i) => 500 + i)
];
const MIDPOINT = 6478;
const PAGE_HALF = 6527; // first rune of physical p27
const TRIALS = 50000;
const STD_TRIALS = 30000;
const HOLDOUT_TRIALS = 20000;
const HOT_TRIALS = 20000;

assert.equal(pages.length, 55);
assert.equal(sourcePages.length, 55);
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every(row => row.length === 8 && row.every(t => t.length === 2)));
assert.equal(tableTokens.length, 256);
assert.equal(tableBytes.length, 256);

/* Reconstruct eligible adjacent pairs directly from the page transcription.
   Page transitions are excluded as events, but the global clock keeps running. */
const eligible = [];
const pageEntries = [];
let totalRunes = 0;
for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
  const original = pages[pageIndex];
  const source = sourcePages[pageIndex];
  const start = totalRunes;
  const pageEvents = [];
  let line = 0;
  let local = 0;
  for (const glyph of source) {
    if (glyph === "/") { line++; continue; }
    if (!runeSet.has(glyph)) continue;
    const current = original.indices[local];
    assert.notEqual(current, undefined, "too many source runes on p" + original.page);
    if (local > 0) {
      const global = start + local;
      const cell = (global - 1) % 256;
      const prior = original.indices[local - 1];
      const event = Number(current === prior);
      const record = {
        global, page: original.page, line,
        prior, current, event,
        word: -1,
        tableCell: cell,
        tableToken: tableTokens[cell],
        leadingZero: tableTokens[cell][0] === "0",
        cell192: cell === 192,
        lowByte: tableBytes[cell] < 64
      };
      eligible.push(record);
      if (event) pageEvents.push(global);
    }
    local++;
  }
  assert.equal(local, original.indices.length,
    "transcription/corpus mismatch on p" + original.page);
  pageEntries.push({page: original.page, start, length: local, events: pageEvents});
  totalRunes += local;
}
assert.equal(totalRunes, 12956);
assert.equal(eligible.length, 12901);
assert.equal(eligible.reduce((s, x) => s + x.event, 0), 86);

/* Assign each rune to its printed word while preserving the exact source order. */
const wordText = sourcePages.join("%")
  .replace(/\/\r?\n/g, "")
  .replace(/[\r\n%]/g, "");
const sourceWords = wordText.match(new RegExp("[" + book.runes.join("") + "]+", "gu")) || [];
assert.equal(sourceWords.length, 2896);
const wordAtGlobal = new Int32Array(totalRunes);
let cursor = 0;
for (let wordId = 0; wordId < sourceWords.length; wordId++) {
  for (const glyph of sourceWords[wordId]) wordAtGlobal[cursor++] = wordId;
}
assert.equal(cursor, totalRunes);
for (const v of eligible) v.word = wordAtGlobal[v.global];

const events = eligible.filter(v => v.event);
const eventPositions = events.map(v => v.global);
const eventRecords = events.map(v => ({
  global: v.global, page: v.page, line: v.line, word: v.word,
  prior: book.runes[v.prior], rune: book.runes[v.current],
  predecessorCell: v.tableCell, predecessorToken: v.tableToken,
  leadingZero: v.leadingZero, cell192: v.cell192
}));
assert.equal(eventRecords.length, 86);

function periodVector(positions) {
  const scores = new Array(PERIODS.length).fill(0);
  for (let pi = 0; pi < PERIODS.length; pi++) {
    const P = PERIODS[pi];
    const counts = new Uint8Array(P);
    let pairs = 0;
    for (const position of positions) {
      const phase = position % P;
      pairs += counts[phase]++;
    }
    scores[pi] = pairs;
  }
  return scores;
}
function familyStats(positions) {
  const scores = periodVector(positions);
  const low = scores.slice(0, 23);
  const high = scores.slice(23);
  const lowMax = Math.max(...low);
  const highMax = Math.max(...high);
  const allMax = Math.max(...scores);
  return {
    eventCount: positions.length,
    s256: scores[256 - 245],
    s512: scores[23 + 512 - 500],
    lowMax,
    lowPeriod: PERIODS[low.indexOf(lowMax)],
    highMax,
    highPeriod: PERIODS[23 + high.indexOf(highMax)],
    allMax,
    allPeriod: PERIODS[scores.indexOf(allMax)],
    scores: PERIODS.map((period, i) => ({period, pairs: scores[i]}))
  };
}
const observed = familyStats(eventPositions);
assert.equal(observed.s256, 27);
assert.equal(observed.s512, 16);
assert.equal(observed.lowMax, 27);
assert.equal(observed.lowPeriod, 256);
assert.equal(observed.highMax, 16);
assert.equal(observed.highPeriod, 512);

/* Joint conditional strata preserve physical page, printed line, word identity,
   preceding rune, and the known predecessor-table leading-zero class. */
function makeGroups(list, {includeCell192 = false} = {}) {
  const map = new Map();
  for (const v of list) {
    const key = [
      v.page, v.line, v.word, v.prior, Number(v.leadingZero),
      ...(includeCell192 ? [Number(v.cell192)] : [])
    ].join(":");
    if (!map.has(key)) map.set(key, {sites: [], count: 0});
    const group = map.get(key);
    group.sites.push(v.global);
    group.count += v.event;
  }
  return [...map.values()].filter(g => g.count > 0);
}
function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function sampleGroups(groups, rng) {
  const sample = [];
  for (const group of groups) {
    if (group.count === group.sites.length) {
      sample.push(...group.sites);
      continue;
    }
    const pool = group.sites.slice();
    for (let i = 0; i < group.count; i++) {
      const j = i + Math.floor(rng() * (pool.length - i));
      [pool[i], pool[j]] = [pool[j], pool[i]];
      sample.push(pool[i]);
    }
  }
  return sample;
}
function runRawMaxNull(name, list, positions, trials, seed, options = {}) {
  const groups = makeGroups(list, options);
  const observedStats = familyStats(positions);
  const rng = mulberry32(seed);
  let lowHits = 0, highHits = 0, allHits = 0;
  let lowSum = 0, highSum = 0;
  for (let t = 0; t < trials; t++) {
    const s = familyStats(sampleGroups(groups, rng));
    lowSum += s.lowMax;
    highSum += s.highMax;
    lowHits += Number(s.lowMax >= observedStats.lowMax);
    highHits += Number(s.highMax >= observedStats.highMax);
    allHits += Number(s.allMax >= observedStats.allMax);
  }
  const p = hits => (hits + 1) / (trials + 1);
  return {
    name, trials, activeStrata: groups.length,
    randomizableStrata: groups.filter(g => g.sites.length > g.count).length,
    forcedEvents: groups.filter(g => g.sites.length === g.count)
      .reduce((sum, g) => sum + g.count, 0),
    observed: {
      lowMax: observedStats.lowMax, lowPeriod: observedStats.lowPeriod,
      highMax: observedStats.highMax, highPeriod: observedStats.highPeriod,
      allMax: observedStats.allMax, allPeriod: observedStats.allPeriod
    },
    meanLowMax: lowSum / trials,
    meanHighMax: highSum / trials,
    pLowFamily: p(lowHits),
    pHighFamily: p(highHits),
    pFull48PeriodFamily: p(allHits)
  };
}

/* A standardized max-T test prevents the lower-period family from dominating
   merely because its raw pair counts have a larger expectation. Pilot and
   evaluation simulations use independent deterministic seeds. */
function runStandardizedMaxNull(groups, positions, trials, pilotSeed, testSeed) {
  const pilotRng = mulberry32(pilotSeed);
  const means = new Float64Array(PERIODS.length);
  const m2 = new Float64Array(PERIODS.length);
  for (let t = 0; t < trials; t++) {
    const scores = periodVector(sampleGroups(groups, pilotRng));
    for (let i = 0; i < scores.length; i++) {
      means[i] += scores[i];
      m2[i] += scores[i] * scores[i];
    }
  }
  const sds = new Float64Array(PERIODS.length);
  for (let i = 0; i < means.length; i++) {
    means[i] /= trials;
    sds[i] = Math.sqrt(Math.max(1e-12, m2[i] / trials - means[i] * means[i]));
  }
  const observedScores = periodVector(positions);
  const observedZ = observedScores.map((score, i) => (score - means[i]) / sds[i]);
  const maxZObserved = Math.max(...observedZ);
  const maxZPeriod = PERIODS[observedZ.indexOf(maxZObserved)];

  const testRng = mulberry32(testSeed);
  let hits = 0, sumMaxZ = 0;
  for (let t = 0; t < trials; t++) {
    const scores = periodVector(sampleGroups(groups, testRng));
    let maxZ = -Infinity;
    for (let i = 0; i < scores.length; i++) {
      const z = (scores[i] - means[i]) / sds[i];
      if (z > maxZ) maxZ = z;
    }
    sumMaxZ += maxZ;
    if (maxZ >= maxZObserved) hits++;
  }
  return {
    pilotTrials: trials, evaluationTrials: trials,
    observedMaxZ: maxZObserved, observedMaxZPeriod: maxZPeriod,
    meanNullMaxZ: sumMaxZ / trials,
    familywiseP: (hits + 1) / (trials + 1),
    periodZ: PERIODS.map((period, i) => ({
      period, observedPairs: observedScores[i],
      nullMean: means[i], nullSd: sds[i], z: observedZ[i]
    }))
  };
}

/* First/second physical-page blocks and a separately held-out cuneiform chapter. */
const firstHalf = eligible.filter(v => v.global < 6527); // p0-p26
const secondHalf = eligible.filter(v => v.global >= 6527); // p27-p55
const firstEvents = firstHalf.filter(v => v.event).map(v => v.global);
const secondEvents = secondHalf.filter(v => v.event).map(v => v.global);
const cuneiformChapter = eligible.filter(v => v.page >= 33 && v.page <= 39);
const cuneiformEvents = cuneiformChapter.filter(v => v.event).map(v => v.global);
const cuneiformNull = runRawMaxNull(
  "held-out cuneiform chapter p33-p39",
  cuneiformChapter, cuneiformEvents, HOLDOUT_TRIALS, 0x42a72114
);

/* Post-inspection diagnostic: remove all events and eligible sites whose
   predecessor token is the literal p50 cell 192 == "00". */
const withoutCell192 = eligible.filter(v => !v.cell192);
const withoutCell192Events = withoutCell192.filter(v => v.event).map(v => v.global);
const cell192ExcludedNull = runRawMaxNull(
  "post-inspection cell192 exclusion",
  withoutCell192, withoutCell192Events, HOT_TRIALS, 0x42a72110
);

/* Positive control: plant each page's original event count at eligible sites
   whose actual p50 byte is <64. This tests detector power, not an LP2 cipher. */
const positiveRng = mulberry32(0x42a72113);
const planted = [];
for (const page of pageEntries) {
  const pool = eligible.filter(v => v.page === page.page && v.lowByte)
    .map(v => v.global);
  assert.ok(pool.length >= page.events.length, "positive pool p" + page.page);
  for (let i = 0; i < page.events.length; i++) {
    const j = i + Math.floor(positiveRng() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
    planted.push(pool[i]);
  }
}
const plantedStats = familyStats(planted);
assert.equal(planted.length, 86);
assert.ok(plantedStats.s256 > observed.s256);
assert.ok(plantedStats.s512 > observed.s512);

/* Cross-half pair counts use the fixed midpoint from the original screen. */
function crossPairs(positions, period, cutoff) {
  const left = new Uint8Array(period), right = new Uint8Array(period);
  let pairs = 0;
  for (const position of positions) {
    const phase = position % period;
    if (position < cutoff) {
      pairs += right[phase];
      left[phase]++;
    } else {
      pairs += left[phase];
      right[phase]++;
    }
  }
  return pairs;
}

const jointGroups = makeGroups(eligible);
const fullRawNull = runRawMaxNull(
  "full book: page×line×word×prior-rune×leading-zero",
  eligible, eventPositions, TRIALS, 0x42a72107
);
const standardizedNull = runStandardizedMaxNull(
  jointGroups, eventPositions, STD_TRIALS, 0x42a7f001, 0x42a7f002
);
const cell192Events = events.filter(v => v.cell192);
assert.equal(cell192Events.length, 4);
assert.equal(cell192Events.reduce((n, v) => n + 1, 0), 4);

const output = {
  source: {
    pagesWithRunes: pages.length, totalRunes: totalRunes,
    eligibleWithinPagePairs: eligible.length, words: sourceWords.length,
    equalityEvents: events.length,
    p50Grid: "32x8 = 256 two-character base60 tokens / 512 printed characters",
    periodsTested: PERIODS
  },
  eventRecords,
  original: observed,
  crossHalf: {
    fixedCutoff: MIDPOINT,
    crossPairs256: crossPairs(eventPositions, 256, MIDPOINT),
    crossPairs512: crossPairs(eventPositions, 512, MIDPOINT),
    firstPageBlock: familyStats(firstEvents),
    secondPageBlock: familyStats(secondEvents)
  },
  fullRawMaxNull: fullRawNull,
  standardizedFullFamilyMaxNull: standardizedNull,
  heldOutCuneiformChapter: {
    pages: "p33-p39", events: cuneiformEvents.length,
    observed: familyStats(cuneiformEvents), null: cuneiformNull
  },
  cell192: {
    token: tableTokens[192],
    events: cell192Events.map(v => ({
      global: v.global, page: v.page, line: v.line,
      prior: book.runes[v.prior], rune: book.runes[v.current]
    })),
    originalPairs256: observed.s256,
    originalPairs512: observed.s512,
    afterExclusion: familyStats(withoutCell192Events),
    null: cell192ExcludedNull
  },
  positiveControl: {
    description: "same per-page event counts planted at actual p50 byte<64 phases",
    events: planted.length, lowByteCells: tableBytes.filter(v => v < 64).length,
    stats: plantedStats
  },
  interpretation: "The 256/512 phase recurrence is not familywise robust under the full 48-period joint conditional null; no cipher key, opcode, reversible decoder, or plaintext is identified."
};

console.log(JSON.stringify(output, null, 2));
