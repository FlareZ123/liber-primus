"use strict";

/**
 * Director #1692: test whether the promoted whole-word GP0 -> zero-based p50
 * address primitive independently fixes the empirical p50 low60 clock origin.
 *
 * Read-only SFT. It reuses the frozen low60 mask/event definition, evaluates
 * all 256 continuous-global phases at chapter and physical-page leave-one-out,
 * reproduces the previously frozen phase-zero reset family, and checks whether
 * the address-only GP0 evidence supplies an equation tying any table address to
 * a specific p0..p55 global rune state.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const transcription = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");

const CHAPTERS = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55],
];
const pages = corpus.pages.filter((page) => page.page <= 55);
const tokens = grid.pages.flatMap((page) => page.tokens);
const low60 = Uint8Array.from(tokens, (token) => Number(token[0] === "0"));
assert.equal(tokens.length, 256);
assert.equal(low60.reduce((sum, value) => sum + value, 0), 60);

function chapterOf(page) {
  const chapter = CHAPTERS.findIndex(([first, last]) =>
    first <= page && page <= last);
  assert.ok(chapter >= 0);
  return chapter;
}

function blankClock() {
  return {
    opportunities: Array.from({length: 9}, () => new Int32Array(256)),
    hits: Array.from({length: 9}, () => new Int32Array(256)),
  };
}

const sections = transcription.split(/^%$/m);
assert.equal(sections.length, 57);

function physicalLineLengths(pageNumber) {
  if (pageNumber === 50) return [];
  return sections[pageNumber < 50 ? pageNumber : pageNumber - 1]
    .split(/\/\r?\n/u)
    .map((line) =>
      [...line].filter((rune) => corpus.runes.includes(rune)).length)
    .filter(Boolean);
}

const clocks = {
  global: blankClock(),
  page: blankClock(),
  chapter: blankClock(),
  line: blankClock(),
};
const pairs = [];
const pageStarts = new Map();

let globalOffset = 0;
let chapterOffset = 0;
let previousChapter = -1;
let physicalLineCount = 0;

for (const page of pages) {
  pageStarts.set(page.page, globalOffset);
  const chapter = chapterOf(page.page);
  if (chapter !== previousChapter) {
    chapterOffset = 0;
    previousChapter = chapter;
  }

  const lengths = physicalLineLengths(page.page);
  physicalLineCount += lengths.length;
  assert.equal(lengths.reduce((sum, value) => sum + value, 0),
    page.indices.length);

  const lineOffset = new Int32Array(page.indices.length);
  let cursor = 0;
  for (const length of lengths) {
    for (let i = 0; i < length; i += 1) lineOffset[cursor + i] = i;
    cursor += length;
  }

  for (let i = 0; i + 1 < page.indices.length; i += 1) {
    const hit = Number(page.indices[i] === page.indices[i + 1]);
    const phases = {
      global: (globalOffset + i) & 255,
      page: i & 255,
      chapter: (chapterOffset + i) & 255,
      line: lineOffset[i] & 255,
    };
    pairs.push({
      globalPosition: globalOffset + i,
      page: page.page,
      chapter,
      hit,
    });

    for (const [name, phase] of Object.entries(phases)) {
      clocks[name].opportunities[chapter][phase] += 1;
      clocks[name].hits[chapter][phase] += hit;
    }
  }

  globalOffset += page.indices.length;
  chapterOffset += page.indices.length;
}

assert.equal(globalOffset, 12956);
assert.equal(pairs.length, 12901);
assert.equal(pairs.reduce((sum, pair) => sum + pair.hit, 0), 86);
assert.equal(physicalLineCount, 594);
assert.equal(pageStarts.get(0), 0);
assert.equal(pageStarts.get(28), 6761);
assert.equal(pageStarts.get(38), 9172);

function logBernoulli(hits, n, p) {
  return hits * Math.log(p) + (n - hits) * Math.log1p(-p);
}

function predictiveFold(train, held) {
  const selectedP = (train.selectedHits + 0.5) /
    (train.selectedOpportunities + 1);
  const otherP = (train.otherHits + 0.5) /
    (train.otherOpportunities + 1);
  const nullP = (train.totalHits + 0.5) / (train.totalOpportunities + 1);
  return {
    gain:
      logBernoulli(held.selectedHits, held.selectedOpportunities, selectedP) +
      logBernoulli(held.otherHits, held.otherOpportunities, otherP) -
      logBernoulli(held.totalHits, held.totalOpportunities, nullP),
    positive:
      held.selectedHits * held.otherOpportunities >
      held.otherHits * held.selectedOpportunities,
  };
}

function countClock(clock, chapters) {
  const result = {
    selectedOpportunities: 0,
    selectedHits: 0,
    otherOpportunities: 0,
    otherHits: 0,
    totalOpportunities: 0,
    totalHits: 0,
  };

  for (const chapter of chapters) {
    for (let phase = 0; phase < 256; phase += 1) {
      const opportunities = clock.opportunities[chapter][phase];
      const hits = clock.hits[chapter][phase];
      result.totalOpportunities += opportunities;
      result.totalHits += hits;
      if (low60[phase]) {
        result.selectedOpportunities += opportunities;
        result.selectedHits += hits;
      } else {
        result.otherOpportunities += opportunities;
        result.otherHits += hits;
      }
    }
  }
  return result;
}

const allChapters = Array.from({length: 9}, (_, index) => index);

function evaluateFrozenClock(clock) {
  const folds = [];
  for (let held = 0; held < 9; held += 1) {
    const training = allChapters.filter((chapter) => chapter !== held);
    folds.push(predictiveFold(
      countClock(clock, training),
      countClock(clock, [held]),
    ));
  }
  return {
    source: countClock(clock, allChapters),
    gain: folds.reduce((sum, fold) => sum + fold.gain, 0),
    positiveFolds: folds.filter((fold) => fold.positive).length,
  };
}

const frozen = Object.fromEntries(
  Object.entries(clocks).map(([name, clock]) => [name, evaluateFrozenClock(clock)]),
);

const expectedFrozen = {
  global: [[3025, 33, 9876, 53], 4.5848931753101105, 9],
  page: [[2934, 19, 9967, 67], -1.0384117799082127, 6],
  chapter: [[3020, 20, 9881, 66], -0.5604708753894556, 5],
  line: [[1918, 16, 10983, 70], -0.47842866154683605, 5],
};

for (const [name, [counts, gain, positiveFolds]] of Object.entries(expectedFrozen)) {
  const result = frozen[name];
  assert.deepEqual([
    result.source.selectedOpportunities,
    result.source.selectedHits,
    result.source.otherOpportunities,
    result.source.otherHits,
  ], counts);
  assert.ok(Math.abs(result.gain - gain) < 1e-12);
  assert.equal(result.positiveFolds, positiveFolds);
}

function countPairs(phase, predicate) {
  const result = {
    selectedOpportunities: 0,
    selectedHits: 0,
    otherOpportunities: 0,
    otherHits: 0,
    totalOpportunities: 0,
    totalHits: 0,
  };
  for (const pair of pairs) {
    if (!predicate(pair)) continue;
    const selected = low60[(pair.globalPosition + phase) & 255];
    result.totalOpportunities += 1;
    result.totalHits += pair.hit;
    if (selected) {
      result.selectedOpportunities += 1;
      result.selectedHits += pair.hit;
    } else {
      result.otherOpportunities += 1;
      result.otherHits += pair.hit;
    }
  }
  return result;
}

function evaluatePhaseByGroups(phase, groups, groupOf) {
  let gain = 0;
  let positiveFolds = 0;
  for (const heldGroup of groups) {
    const train = countPairs(phase, (pair) => groupOf(pair) !== heldGroup);
    const held = countPairs(phase, (pair) => groupOf(pair) === heldGroup);
    const fold = predictiveFold(train, held);
    gain += fold.gain;
    positiveFolds += Number(fold.positive);
  }
  const source = countPairs(phase, () => true);
  return {
    phase,
    gain,
    positiveFolds,
    source,
  };
}

const physicalPages = pages.map((page) => page.page);
const chapterPhaseScores = Array.from({length: 256}, (_, phase) =>
  evaluatePhaseByGroups(phase, allChapters, (pair) => pair.chapter))
  .sort((a, b) => b.gain - a.gain || a.phase - b.phase);
const pagePhaseScores = Array.from({length: 256}, (_, phase) =>
  evaluatePhaseByGroups(phase, physicalPages, (pair) => pair.page))
  .sort((a, b) => b.gain - a.gain || a.phase - b.phase);

assert.equal(chapterPhaseScores[0].phase, 0);
assert.equal(pagePhaseScores[0].phase, 0);
assert.ok(chapterPhaseScores[0].gain > chapterPhaseScores[1].gain);
assert.ok(pagePhaseScores[0].gain > pagePhaseScores[1].gain);
assert.ok(Math.abs(chapterPhaseScores[0].gain - 4.5848931753101105) < 1e-12);
assert.ok(Math.abs(chapterPhaseScores[1].gain - 3.217363742673232) < 1e-12);
assert.equal(chapterPhaseScores[1].phase, 246);
assert.ok(Math.abs(pagePhaseScores[0].gain - 4.130712933743942) < 1e-12);
assert.ok(Math.abs(pagePhaseScores[1].gain - 3.0549760068435186) < 1e-12);
assert.equal(pagePhaseScores[1].phase, 16);

// #1685 promoted only these p56/p57 table addresses as address-only evidence.
// None identifies a rune coordinate in the p0..p55 low60 clock.
const promotedAddressOnlyEvidence = [
  {label: "p56 PILGRIM", address: 82},
  {label: "p57 EMERGE", address: 83},
  {label: "p57 DIUINITY", address: 105},
];
assert.equal(promotedAddressOnlyEvidence.some((entry) =>
  Number.isInteger(entry.globalRunePosition)), false);

// Formally, absent a source-fixed rune residue g, every origin phi is compatible
// with an address a under state(g) = (g + phi) mod 256.
function impliedPhase(address, runeResidue) {
  return (address - runeResidue + 256) & 255;
}
for (const evidence of promotedAddressOnlyEvidence) {
  const possible = new Set(Array.from({length: 256}, (_, runeResidue) =>
    impliedPhase(evidence.address, runeResidue)));
  assert.equal(possible.size, 256);
}

// Stress test only: if already-published typed receivers are illegitimately
// promoted into state=address anchor equations, they disagree with one another
// and none recovers phase0. These typed output semantics are outside #1685's
// address-only primitive and therefore cannot count as a positive derivation.
const typedReceiverStress = [
  {
    label: "NEXT GP0=57 -> p28 zero-based rune117",
    address: 57,
    globalRunePosition: pageStarts.get(28) + 117,
  },
  {
    label: "p0 closure receiver-word GP0=13 -> end236",
    address: 13,
    globalRunePosition: 236,
  },
  {
    label: "p0 closure EMPTY GP0=92 -> end236",
    address: 92,
    globalRunePosition: 236,
  },
  {
    label: "p38 receiver-word GP0=95 -> end53",
    address: 95,
    globalRunePosition: pageStarts.get(38) + 53,
  },
  {
    label: "p38 FOUND GP0=36 -> end53",
    address: 36,
    globalRunePosition: pageStarts.get(38) + 53,
  },
].map((entry) => ({
  ...entry,
  impliedPhase: impliedPhase(entry.address, entry.globalRunePosition & 255),
}));

assert.deepEqual(
  typedReceiverStress.map((entry) => entry.impliedPhase),
  [91, 33, 112, 86, 27],
);
assert.equal(new Set(typedReceiverStress.map((entry) => entry.impliedPhase)).size, 5);
assert.equal(typedReceiverStress.some((entry) => entry.impliedPhase === 0), false);

console.log(JSON.stringify({
  status: "PASS: GP0 address primitive does not derive the low60 absolute origin",
  frozenResetFamily: Object.fromEntries(Object.entries(frozen).map(([name, value]) => [
    name,
    {
      gain: value.gain,
      positiveFolds: value.positiveFolds,
      selectedHits: value.source.selectedHits,
      selectedOpportunities: value.source.selectedOpportunities,
    },
  ])),
  all256Phases: {
    chapterLOO: {
      winner: chapterPhaseScores[0],
      runnerUp: chapterPhaseScores[1],
      phase0Rank: chapterPhaseScores.findIndex((entry) => entry.phase === 0) + 1,
    },
    physicalPageLOO: {
      winner: pagePhaseScores[0],
      runnerUp: pagePhaseScores[1],
      phase0Rank: pagePhaseScores.findIndex((entry) => entry.phase === 0) + 1,
    },
  },
  gp0AddressOnly: {
    evidence: promotedAddressOnlyEvidence,
    compatibleOriginsPerUnanchoredAddress: 256,
    derivedClockOrigins: [],
  },
  typedReceiverStress,
}, null, 2));
