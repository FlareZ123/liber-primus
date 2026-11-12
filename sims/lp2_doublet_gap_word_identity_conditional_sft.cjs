#!/usr/bin/env node
"use strict";

// Conditional decomposition of the LP2 adjacent-repeat gap statistic.
// This fixes event-bearing word IDs and their per-word/per-page counts.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { words } = require("./cross_word_repeat_invariant.cjs");

const REPO = path.resolve(__dirname, "..");
const TRIALS = 20000;
const SEED = 0x3301c7a5;

function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

function lagOneCorrelation(sortedPositions) {
  const gaps = sortedPositions.slice(1).map((p, i) => p - sortedPositions[i]);
  const left = gaps.slice(0, -1), right = gaps.slice(1);
  const ml = left.reduce((a, b) => a + b, 0) / left.length;
  const mr = right.reduce((a, b) => a + b, 0) / right.length;
  let cov = 0, vl = 0, vr = 0;
  for (let i = 0; i < left.length; i++) {
    const x = left[i] - ml, y = right[i] - mr;
    cov += x * y; vl += x * x; vr += y * y;
  }
  return cov / Math.sqrt(vl * vr);
}

function sampleWithoutReplacement(n, k, random) {
  assert.ok(k <= n);
  const selected = new Set();
  for (let j = n - k; j < n; j++) {
    const draw = Math.floor(random() * (j + 1));
    selected.add(selected.has(draw) ? j : draw);
  }
  return [...selected];
}

function main() {
  const master = fs.readFileSync(path.join(REPO, "resources", "transcriptions",
    "liber_primus_master.txt"), "utf8");
  const corpus = JSON.parse(fs.readFileSync(path.join(REPO, "resources",
    "liber-primus", "lp2-corpus.json"), "utf8"));
  const sections = master.slice(master.indexOf("\n\n") + 2).split("$");
  const wordGlyphs = sections.slice(7, 16).flatMap(words);
  assert.equal(wordGlyphs.length, 2896);

  const runeIndex = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
  const flatIndices = wordGlyphs.flat().map(glyph => {
    assert.ok(runeIndex.has(glyph));
    return runeIndex.get(glyph);
  });
  const pages = corpus.pages.filter(page => page.page <= 55);
  assert.deepEqual(flatIndices, pages.flatMap(page => page.indices));
  assert.equal(flatIndices.length, 12956);

  const wordRanges = [];
  let cursor = 0;
  for (let id = 0; id < wordGlyphs.length; id++) {
    const length = wordGlyphs[id].length;
    wordRanges.push({ id, start: cursor, end: cursor + length, length });
    cursor += length;
  }
  const wordIdAt = new Int32Array(flatIndices.length);
  for (const word of wordRanges) wordIdAt.fill(word.id, word.start, word.end);

  const groupsByWordPage = new Map(), events = [];
  let pageOffset = 0;
  for (const page of pages) {
    for (let local = 1; local < page.indices.length; local++) {
      const pos = pageOffset + local, wordId = wordIdAt[pos];
      const key = wordId + ":" + page.page;
      if (!groupsByWordPage.has(key)) groupsByWordPage.set(key, {
        wordId, page: page.page, positions: [], eventCount: 0
      });
      const group = groupsByWordPage.get(key);
      group.positions.push(pos);
      if (page.indices[local] === page.indices[local - 1]) {
        group.eventCount++;
        events.push({ pos, wordId });
      }
    }
    pageOffset += page.indices.length;
  }

  const groups = [...groupsByWordPage.values()]
    .filter(g => g.eventCount > 0)
    .sort((a, b) => a.wordId - b.wordId || a.page - b.page);
  const counts = new Array(wordRanges.length).fill(0);
  for (const event of events) counts[event.wordId]++;
  const histogram = {};
  for (const n of counts) histogram[n] = (histogram[n] || 0) + 1;
  assert.equal(events.length, 86);
  assert.equal(groups.length, 85);
  assert.equal(histogram[1], 84);
  assert.equal(histogram[2], 1);

  const observed = events.map(e => e.pos);
  const observedACF = lagOneCorrelation(observed);
  const eventWordIds = [...new Set(events.map(e => e.wordId))].sort((a, b) => a - b);
  const wordACF = lagOneCorrelation(eventWordIds);

  function category(pos) {
    const word = wordRanges[wordIdAt[pos]], offset = pos - word.start;
    return offset === 0 ? "initial" : offset === word.length - 1 ? "final" : "interior";
  }
  const observedCategories = { initial: 0, final: 0, interior: 0 };
  for (const event of events) observedCategories[category(event.pos)]++;

  const random = xorshift32(SEED);
  let sum = 0, sumSq = 0, atLeast = 0;
  const categorySums = { initial: 0, final: 0, interior: 0 };
  for (let trial = 0; trial < TRIALS; trial++) {
    const simulated = [];
    for (const group of groups) {
      for (const index of sampleWithoutReplacement(
        group.positions.length, group.eventCount, random
      )) simulated.push(group.positions[index]);
    }
    simulated.sort((a, b) => a - b);
    const value = lagOneCorrelation(simulated);
    sum += value; sumSq += value * value;
    if (value >= observedACF) atLeast++;
    const cats = { initial: 0, final: 0, interior: 0 };
    for (const pos of simulated) cats[category(pos)]++;
    for (const key of Object.keys(cats)) categorySums[key] += cats[key];
  }
  const mean = sum / TRIALS;
  const sd = Math.sqrt(sumSq / TRIALS - mean * mean);
  process.stdout.write(JSON.stringify({
    source: ["resources/transcriptions/liber_primus_master.txt",
      "resources/liber-primus/lp2-corpus.json"],
    alignment: "2,896 canonical words flatten to 12,956 corpus runes on pages 0–55",
    conditioning: "fix event-bearing word IDs and per-word/per-page event counts; sample eligible positions within each word/page group",
    eventCount: events.length,
    eventBearingWords: eventWordIds.length,
    eventCountHistogramByWord: histogram,
    observedGapLagOneCorrelation: observedACF,
    eventBearingWordIndexGapLagOneCorrelation: wordACF,
    observedWordPositionCategories: observedCategories,
    conditionalNull: {
      trials: TRIALS, xorshift32Seed: "0x" + SEED.toString(16),
      mean, populationStandardDeviation: sd, drawsAtLeastObserved: atLeast,
      addOneUpperTailProbability: (atLeast + 1) / (TRIALS + 1),
      meanPositionCategories: Object.fromEntries(
        Object.entries(categorySums).map(([k, v]) => [k, v / TRIALS])
      )
    },
    interpretation: "Conditional on event-bearing words; does not test why those words were selected."
  }, null, 2) + "\n");
}

if (require.main === module) main();
module.exports = { lagOneCorrelation, sampleWithoutReplacement, xorshift32 };
