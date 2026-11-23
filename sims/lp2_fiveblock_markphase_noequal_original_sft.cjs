'use strict';

/**
 * Original-source key-independent five-rune block anti-repeat gate.
 * Run: node sims/lp2_fiveblock_markphase_noequal_original_sft.cjs
 * No external packages, network access, output files, or source modifications.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-ink-annotations.json'), 'utf8'));
const pages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length > 0);
const starts = new Map();
const pageCuts = [0];
const equalPositions = [];
let total = 0;

for (const page of pages) {
  starts.set(page.page, total);
  for (let i = 1; i < page.indices.length; i++) {
    if (page.indices[i] === page.indices[i - 1]) {
      equalPositions.push(total + i);
    }
  }
  total += page.indices.length;
  pageCuts.push(total);
}
assert.equal(total, 12956);
assert.equal(equalPositions.length, 86);

const markCuts = [0, total];
for (const page of ink.pages) {
  const start = starts.get(page.page);
  if (start === undefined) continue;
  for (const mark of page.large_punctuation || []) {
    markCuts.push(start + mark[0]);
  }
}

/** @param {number[]} positions */
function uniqueSorted(positions) {
  return [...new Set(positions)].sort((a, b) => a - b);
}

/**
 * Each interval gets an independent secret phase in {0..4}.
 * A five-rune block grammar allowing equal neighbors only at block seams
 * must put all equal events in one residue class per interval.
 *
 * @param {number[]} cuts
 * @param {number[]} repeats original equal-second-rune positions
 */
function audit(cuts, repeats) {
  const zones = [];
  const cutSet = new Set(cuts);
  for (let i = 0; i < cuts.length - 1; i++) {
    const start = cuts[i];
    const end = cuts[i + 1];
    const counts = [0, 0, 0, 0, 0];
    for (const position of repeats) {
      if (position > start && position < end) {
        counts[(position - start) % 5]++;
      }
    }
    const events = counts.reduce((a, b) => a + b, 0);
    const permitted = Math.max(...counts);
    zones.push({ start, end, counts, events, forcedExceptions: events - permitted });
  }
  return {
    zones: zones.length,
    contradictoryZones: zones.filter((x) => x.forcedExceptions > 0).length,
    forcedExceptions: zones.reduce((sum, x) => sum + x.forcedExceptions, 0),
    equalOnCuts: repeats.filter((p) => cutSet.has(p)).length,
    examples: zones.filter((x) => x.forcedExceptions > 0)
      .sort((a, b) => b.forcedExceptions - a.forcedExceptions)
      .slice(0, 5)
  };
}

const scopes = {
  continuous: uniqueSorted([0, total]),
  pages: uniqueSorted(pageCuts),
  marks: uniqueSorted(markCuts),
  pagesAndMarks: uniqueSorted([...pageCuts, ...markCuts])
};
const observations = Object.fromEntries(Object.entries(scopes)
  .map(([scope, cuts]) => [scope, audit(cuts, equalPositions)]));

assert.equal(observations.continuous.forcedExceptions, 65);
assert.equal(observations.pages.forcedExceptions, 34);
assert.equal(observations.marks.forcedExceptions, 50);
assert.equal(observations.pagesAndMarks.forcedExceptions, 32);
assert.equal(observations.pagesAndMarks.contradictoryZones, 18);
assert.equal(observations.pagesAndMarks.equalOnCuts, 0);
assert.equal(observations.pagesAndMarks.zones, 74);

// Source-shaped planted positive: 86 equal-rune sites placed exclusively on
// valid five-block seams, allowing a distinct phase in every page+mark zone.
// Forward construction makes the exact complete 12,956-rune GP29 stream.
const cuts = scopes.pagesAndMarks;
const pageStartSet = new Set(pageCuts);
const eligible = [];
for (let zone = 0; zone < cuts.length - 1; zone++) {
  const start = cuts[zone];
  const end = cuts[zone + 1];
  const phase = zone % 5;
  for (let i = start + 1; i < end; i++) {
    if (!pageStartSet.has(i) && (i - start) % 5 === phase) {
      eligible.push(i);
    }
  }
}
assert(eligible.length >= 86);
const chosen = new Set();
for (let j = 0; j < 86; j++) {
  chosen.add(eligible[Math.floor((j + 0.5) * eligible.length / 86)]);
}
assert.equal(chosen.size, 86);
const planted = new Int32Array(total);
let state = 3301;
function next29() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) % 29;
}
planted[0] = next29();
for (let i = 1; i < planted.length; i++) {
  if (chosen.has(i)) planted[i] = planted[i - 1];
  else planted[i] = (planted[i - 1] + 1 + next29() % 28) % 29;
}
const plantedRepeats = [];
for (const page of pages) {
  const start = starts.get(page.page);
  for (let j = 1; j < page.indices.length; j++) {
    if (planted[start + j] === planted[start + j - 1]) {
      plantedRepeats.push(start + j);
    }
  }
}
const plantAudit = audit(cuts, plantedRepeats);
assert.equal(plantedRepeats.length, 86);
assert.equal(plantAudit.forcedExceptions, 0);
assert.equal(plantAudit.contradictoryZones, 0);

console.log(JSON.stringify({
  label: 'LP2 original-source five-rune block exclusion',
  originalPages: pages.length,
  originalRunes: total,
  originalEqualWithinPages: equalPositions.length,
  original: observations,
  plantedPositive: {
    equalEvents: plantedRepeats.length,
    forcedExceptions: plantAudit.forcedExceptions,
    regions: plantAudit.zones
  },
  conclusion: 'A no-internal-equality five-rune block code is impossible on the original source even with an independently secret phase for every printed page and major mark interval; at least 32 extra equality exceptions are required.'
}, null, 2));
