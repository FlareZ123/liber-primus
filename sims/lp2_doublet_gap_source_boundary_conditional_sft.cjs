'use strict';

/**
 * LP2 original doublet-gap source-boundary conditional null.
 *
 * Comparison object: the 86 sites where a rune equals its immediate
 * predecessor within its original physical page. Their 85 gaps have a
 * lag-one Pearson correlation of 0.38001968924100954.
 *
 * Conditions on original, source-visible chapter / page / 13-dot fragment
 * counts. This is a site-process diagnostic, not a cipher decoder.
 * Source positive tests exercise the autocorrelation implementation.
 *
 * Run: node sims/lp2_doublet_gap_source_boundary_conditional_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'lp2-ink-annotations.json'), 'utf8'));
const pages = corpus.pages.filter(p => p.page <= 55);
const chapterStarts = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];

/** @param {number[]} positions @returns {number} */
function lag1GapPearson(positions) {
  assert.ok(positions.length >= 4);
  const n = positions.length - 2;
  let x = 0, y = 0, xx = 0, yy = 0, xy = 0;
  for (let i = 0; i < n; i++) {
    const a = positions[i + 1] - positions[i];
    const b = positions[i + 2] - positions[i + 1];
    x += a; y += b; xx += a * a; yy += b * b; xy += a * b;
  }
  const denominator = Math.sqrt((n * xx - x * x) * (n * yy - y * y));
  return (n * xy - x * y) / denominator;
}

/** @param {number} seed @returns {() => number} deterministic xorshift32 */
function makeRandom(seed) {
  let state = seed >>> 0;
  assert.notEqual(state, 0);
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

const pageOffset = new Map();
const eligible = [];
const site = [];
let total = 0;
for (const p of pages) {
  pageOffset.set(p.page, total);
  for (let i = 1; i < p.indices.length; i++) {
    eligible.push({position: total + i, page: p.page});
    if (p.indices[i] === p.indices[i - 1]) site.push(total + i);
  }
  total += p.indices.length;
}
assert.equal(total, 12956);
assert.equal(site.length, 86);
const siteSet = new Set(site);
const observation = lag1GapPearson(site);
assert.ok(Math.abs(observation - 0.38001968924100954) < 1e-12);

// An unsolved 13-dot mark splits the rune stream at its printed, zero-based,
// page-local after-rune position. Duplicated-color marks at the same position
// form a single boundary, not a spurious zero-length fragment.
const boundaries = [...new Set([0, total,
  ...ink.pages.filter(p => p.page <= 55).flatMap(p =>
    (p.large_punctuation || []).filter(entry => entry[1] === 13)
      .map(entry => pageOffset.get(p.page) + entry[0]))
])].sort((a, b) => a - b);
assert.equal(boundaries.length, 27);

/** @param {number} position @returns {number} */
function fragmentIndex(position) {
  let lo = 0, hi = boundaries.length - 1;
  while (lo + 1 < hi) {
    const middle = (lo + hi) >>> 1;
    if (boundaries[middle] <= position) lo = middle;
    else hi = middle;
  }
  return lo;
}

/**
 * @param {(record:{position:number,page:number}) => string} getGroup
 * @returns {Array<{label:string, positions:number[],count:number}>}
 */
function makeGroups(getGroup) {
  const map = new Map();
  for (const rec of eligible) {
    const label = getGroup(rec);
    if (!map.has(label)) map.set(label, {label, positions: [], count: 0});
    map.get(label).positions.push(rec.position);
    if (siteSet.has(rec.position)) map.get(label).count++;
  }
  return [...map.values()];
}

/** @param {number} page @returns {number} */
function chapter(page) {
  for (let i = 0; i < chapterStarts.length - 1; i++)
    if (page >= chapterStarts[i] && page < chapterStarts[i + 1]) return i;
  throw new Error('page outside source chapters');
}

/**
 * Null uniformly resamples the exact number of event sites within each
 * original source-selected stratum. The generator uses Floyd's sample without
 * replacement, with no assumption about observed cipher-symbol values.
 *
 * @param {Array<{label:string,positions:number[],count:number}>} groups
 * @param {number} seed
 * @param {number} trials
 * @returns {{trialCount:number,observed:number,nullMean:number,nullSD:number,upperTailCount:number,upperTailP:number,nullMax:number,groupCount:number}}
 */
function conditionalNull(groups, seed, trials) {
  const random = makeRandom(seed);
  let above = 0, sum = 0, squares = 0, maximum = -Infinity;
  assert.equal(groups.reduce((s, x) => s + x.count, 0), 86);
  for (let trial = 0; trial < trials; trial++) {
    const simulated = [];
    for (const group of groups) {
      const n = group.positions.length, k = group.count;
      const selected = new Set();
      for (let j = n - k; j < n; j++) {
        const draw = Math.floor(random() * (j + 1));
        selected.add(selected.has(draw) ? j : draw);
      }
      for (const i of selected) simulated.push(group.positions[i]);
    }
    simulated.sort((a, b) => a - b);
    assert.equal(simulated.length, site.length);
    const value = lag1GapPearson(simulated);
    sum += value;
    squares += value * value;
    if (value >= observation) above++;
    if (value > maximum) maximum = value;
  }
  const mean = sum / trials;
  return {
    trialCount: trials, observed: observation, nullMean: mean,
    nullSD: Math.sqrt(squares / trials - mean * mean),
    upperTailCount: above, upperTailP: (above + 1) / (trials + 1),
    nullMax: maximum, groupCount: groups.length
  };
}


/**
 * Original rune-word and printed-line roles for every eligible event site.
 * The canonical corpus alone loses separators. Independent transcription
 * segments omit the runeless numerical page p50, as the original parser does.
 * The literal delimiter classes are source-defined, prior to this test.
 */
const transcript = fs.readFileSync(
  path.join(root, '..', 'lp2-transcription.txt'), 'utf8');
const segments = transcript.split('%').slice(0, 55);
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const roleByPosition = new Map();
const wordLengthByPosition = new Map();
let currentWord = [];
function finishWord() {
  for (const position of currentWord)
    wordLengthByPosition.set(position, currentWord.length);
  currentWord = [];
}
assert.equal(segments.length, 55);
for (let segment = 0; segment < segments.length; segment++) {
  const page = segment < 50 ? segment : segment + 1;
  const original = corpus.pages.find(p => p.page === page);
  const base = pageOffset.get(page);
  const observed = [];
  let local = 0;
  let separator = '';
  for (const glyph of segments[segment]) {
    if (runeIndex.has(glyph)) {
      observed.push(runeIndex.get(glyph));
      currentWord.push(base + local);
      if (local > 0) {
        const word = Number(/[-.&$§]/u.test(separator));
        const line = Number(/[\/\r\n]/u.test(separator));
        roleByPosition.set(base + local, word + 2 * line);
      }
      local++;
      separator = '';
    } else {
      if (/[-.&$§]/u.test(glyph)) finishWord();
      if (local > 0) separator += glyph;
    }
  }
  assert.deepEqual(observed, original.indices,
    'original physical LP2 page transcription ' + page);
}
finishWord();
assert.equal(wordLengthByPosition.size, total);
assert.equal(roleByPosition.size, eligible.length);
const originalRoleCounts = Array.from({length: 4}, (_, cls) =>
  eligible.filter(x => siteSet.has(x.position) &&
    roleByPosition.get(x.position) === cls).length);
assert.deepEqual(originalRoleCounts, [60, 22, 3, 1]);

const chapters = makeGroups(x => String(chapter(x.page)));
assert.deepEqual(chapters.map(x => x.count), [4,6,9,10,11,13,12,18,3]);
const physicalPages = makeGroups(x => String(x.page));
const fragmentPage = makeGroups(x => `${fragmentIndex(x.position)}:${x.page}`);
const roleGroups = makeGroups(x => String(roleByPosition.get(x.position)));
const pageRoleGroups = makeGroups(x => `${x.page}:${roleByPosition.get(x.position)}`);
const fragmentPageRoleGroups = makeGroups(x =>
  `${fragmentIndex(x.position)}:${x.page}:${roleByPosition.get(x.position)}`);
const lengthBucket = length => length <= 3 ? 'S' : length <= 6 ? 'M'
  : length <= 9 ? 'L' : 'XL';
const exactWordLengthGroups = makeGroups(x =>
  `${fragmentIndex(x.position)}:${x.page}:${roleByPosition.get(x.position)}:${wordLengthByPosition.get(x.position)}`);
const bucketWordLengthGroups = makeGroups(x =>
  `${fragmentIndex(x.position)}:${x.page}:${roleByPosition.get(x.position)}:${lengthBucket(wordLengthByPosition.get(x.position))}`);
assert.equal(physicalPages.length, 55);
assert.equal(fragmentPage.length, 72);

// A clearly drifting gap process must be detected by the very same statistic.
const plantedGaps = [...Array(30).fill(200), ...Array(25).fill(50),
  ...Array(30).fill(110)];
const planted = [100];
for (const gap of plantedGaps) planted.push(planted[planted.length - 1] + gap);
assert.ok(lag1GapPearson(planted) > 0.9);

const results = {
  originalRunes: total, doubletSites: site.length, originalLag1: observation,
  historicalExternalBaseline:
    'Dukotah/cicada3301 Round44 W2-B3 T7, flat Bernoulli p=0.0010; independent 20000-draw gap-permutation p=0.00025',
  chapterCounts: chapters.map(x => x.count),
  source13DotBoundaries: boundaries,
  sourceWordLineDoubletCounts: originalRoleCounts,
  sourceWordLineRoleEligibleCounts: roleGroups.map(x => x.positions.length),
  sourceWordLengthExactStrata: exactWordLengthGroups.length,
  sourceWordLengthBucketStrata: bucketWordLengthGroups.length,
  nulls: {
    chapterCountFixed: conditionalNull(chapters, 0x48b3c201, 20000),
    physicalPageCountFixed: conditionalNull(physicalPages, 0x48b3c202, 20000),
    pageAnd13DotFragmentCountFixed: conditionalNull(fragmentPage, 0x3301c1b2, 20000),
    wordAndLineRoleCountFixed: conditionalNull(roleGroups, 0x3301b003, 20000),
    pageAndWordLineRoleCountFixed: conditionalNull(pageRoleGroups, 0x3301b001, 20000),
    pageAndFragmentAndWordLineRoleCountFixed: conditionalNull(
      fragmentPageRoleGroups, 0x3301b002, 20000),
    pageFragmentRoleExactWordLengthFixed: conditionalNull(
      exactWordLengthGroups, 0x3301c7a4, 20000),
    pageFragmentRoleBucketWordLengthFixed: conditionalNull(
      bucketWordLengthGroups, 0x3301c7a3, 20000)
  },
  plantedLag1: lag1GapPearson(planted)
};
assert.ok(results.nulls.chapterCountFixed.upperTailP < 0.001);
assert.ok(results.nulls.physicalPageCountFixed.upperTailP < 0.02);
assert.ok(results.nulls.pageAnd13DotFragmentCountFixed.upperTailP < 0.02);
assert.equal(results.nulls.wordAndLineRoleCountFixed.upperTailCount, 7);
assert.equal(results.nulls.pageAndWordLineRoleCountFixed.upperTailCount, 115);
assert.equal(results.nulls.pageAndFragmentAndWordLineRoleCountFixed.upperTailCount, 58);
assert.equal(results.nulls.pageFragmentRoleExactWordLengthFixed.upperTailCount, 153);
assert.equal(results.nulls.pageFragmentRoleBucketWordLengthFixed.upperTailCount, 95);
console.log(JSON.stringify(results, null, 2));
