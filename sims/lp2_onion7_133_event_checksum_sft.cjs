"use strict";
/**
 * Source-defined 13/31 original-red-event rolling-checksum conjecture.
 *
 * The source masks (13,31), 256 original ink events (225 red one-based GP
 * ordinal values, 31 13-dot marker values 31), and table size (256) give
 * a finite hash: s <- 13*s + event (mod 256), starting at zero.
 * Compare its terminal value to the contemporary index title "133".
 *
 * The successful match was noticed during broader hypothesis exploration.
 * The shuffles below calibrate this individual rule and the complete
 * 2 x 4 x 2 alternative family; neither implies an authenticated cipher.
 *
 * Run from repo root: node sims/lp2_onion7_133_event_checksum_sft.cjs
 * Node 22, CommonJS, no third-party dependencies or file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const loadJson = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));

const corpus = loadJson("resources/liber-primus/lp2-corpus.json");
const ink = loadJson("resources/liber-primus/lp2-ink-annotations.json");
const table = loadJson("resources/liber-primus/base60-grid.json").byte_rows;
const historicalIndex = fs.readFileSync(
  path.join(root, "resources/cicada2014-onion7-index.html"), "utf8"
);
assert.match(historicalIndex, /<title>133<\/title>/);
assert.match(historicalIndex, /<div id="331">/);
assert.equal(table.length, 32);
assert(table.every(row => row.length === 8));

/** Build the exact chronologically ordered original ink event stream. */
function getEvents() {
  const events = [];
  for (const page of ink.pages) {
    const runes = corpus.pages[page.page].indices;
    assert.equal(page.rune_count, runes.length);
    for (const span of page.red_spans || []) {
      for (let i = 0; i < span.length; i++) {
        const offset = span.start + i;
        assert.equal(corpus.runes[runes[offset]], [...span.runes][i]);
        events.push({
          page: page.page, offset, kind: 1, value: runes[offset] + 1
        });
      }
    }
    for (const mark of page.large_punctuation || []) {
      if (mark[1] === 13) {
        events.push({
          page: page.page, offset: mark[0], kind: 0, value: 0
        });
      }
    }
  }
  events.sort((a, b) =>
    a.page - b.page || a.offset - b.offset || a.kind - b.kind);
  assert.equal(events.length, 256);
  assert.equal(events.filter(e => e.kind).length, 225);
  assert.equal(events.filter(e => !e.kind).length, 31);
  assert.deepEqual(events.at(-1), {
    page: 57, offset: 7, kind: 0, value: 0
  });
  assert.equal(events.reduce((n, e) => n + e.value, 0), 13 * 256);
  return events;
}
const events = getEvents();

/** Bitmask is exact modular reduction because modulus is 256. */
function terminal(values, multiplier, marker, increment = 0) {
  let state = 0;
  for (const e of values) {
    const value = e.kind ? e.value : marker;
    state = (multiplier * state + value + increment) & 255;
  }
  return state;
}
const original = terminal(events, 13, 31);
assert.equal(original, 133);
assert.equal(terminal(events, 13, 0), 224);
assert.equal(terminal(events, 13, 31, 31), 133); // Increment sums to zero.

// Source-only coefficient terms permit 16-family evaluation in O(256)
// per simulation, with no independent repeated 256-step passes per variant.
const constants = {};
for (const multiplier of [13, 31]) {
  let markerTerm = 0, bias = 0, seedCoefficient = 1;
  for (const e of events) {
    markerTerm = (multiplier * markerTerm + (e.kind ? 0 : 1)) & 255;
    bias = (multiplier * bias + 1) & 255;
    seedCoefficient = (multiplier * seedCoefficient) & 255;
  }
  constants[multiplier] = {markerTerm, bias, seedCoefficient};
}
assert.equal(constants[13].markerTerm, 187);
assert.equal(constants[13].bias, 0);
assert.equal(constants[13].seedCoefficient, 1);

const originalFamily = [];
for (const multiplier of [13, 31])
  for (const marker of [0, 1, 13, 31])
    for (const increment of [0, 31])
      originalFamily.push({
        multiplier, marker, increment,
        final: terminal(events, multiplier, marker, increment)
      });
assert.deepEqual(
  originalFamily.filter(x => x.final === 133).map(x =>
    [x.multiplier, x.marker, x.increment]),
  [[13, 31, 0], [13, 31, 31]]
);

/** Deterministic xorshift RNG with fixed initial seed for both nulls. */
function randomGenerator(seed = 0x33551331) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

function study(trials = 100000) {
  assert(Number.isInteger(trials) && trials > 0 && trials <= 1000000);
  const rand = randomGenerator();
  const redValues = events.filter(e => e.kind).map(e => e.value);
  const redPages = ink.pages.filter(p => (p.red_spans || []).length > 0)
    .map(p => ({
      page: p.page,
      values: corpus.pages[p.page].indices,
      length: corpus.pages[p.page].indices.length
    }));
  const pageLookup = new Map(redPages.map((p, i) => [p.page, i]));
  let fixedShuffle = 0, familyShuffle = 0, fixedPage = 0, familyPage = 0;

  /**
   * @param {number} multiplier
   * @param {number} base
   * @returns {boolean}
   */
  function familyContains(multiplier, base) {
    for (const marker of [0, 1, 13, 31])
      for (const increment of [0, 31])
        if (((base + marker * constants[multiplier].markerTerm +
          increment * constants[multiplier].bias) & 255) === 133)
          return true;
    return false;
  }

  for (let trial = 0; trial < trials; trial++) {
    // 1. Uniform shuffle of red rune values into 225 fixed red slots.
    const shuffled = redValues.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = rand() % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    let p = 0, base13 = 0, base31 = 0;
    for (const e of events) {
      const val = e.kind ? shuffled[p++] : 0;
      base13 = (13 * base13 + val) & 255;
      base31 = (31 * base31 + val) & 255;
    }
    fixedShuffle += Number(
      ((base13 + 31 * constants[13].markerTerm) & 255) === 133
    );
    familyShuffle += Number(
      familyContains(13, base13) || familyContains(31, base31)
    );

    // 2. Independent cyclic rotation of each original red-bearing page.
    // Red mask geometry and source rune sequence within each page are fixed.
    const shifts = redPages.map(page => rand() % page.length);
    let page13 = 0, page31 = 0;
    for (const e of events) {
      const index = pageLookup.get(e.page);
      const value = e.kind ? redPages[index].values[
        (e.offset + shifts[index]) % redPages[index].length
      ] + 1 : 0;
      page13 = (13 * page13 + value) & 255;
      page31 = (31 * page31 + value) & 255;
    }
    fixedPage += Number(
      ((page13 + 31 * constants[13].markerTerm) & 255) === 133
    );
    familyPage += Number(
      familyContains(13, page13) || familyContains(31, page31)
    );
  }
  if (trials === 100000) {
    assert.deepEqual(
      [fixedShuffle, familyShuffle, fixedPage, familyPage],
      [1555, 3871, 410, 3142]
    );
  }
  const plusOne = hits => (hits + 1) / (trials + 1);
  return {
    source: {
      count: events.length, red: redValues.length,
      thirteenDotStencils: 31, oneBasedRedSum: 3328,
      lastEvent: {page: 57, offset: 7, kind: "13-dot"},
      borderOperands: [13, 31], tableBytes: 256,
      historicalHtml: ["title=133", "div-id=331"]
    },
    hypothesis: "s0=0; event red GP ordinal (1..29) or mark31; s=(13*s+event) mod256",
    observedTerminal: original,
    originalFamily, constants,
    controls: {
      conditionalNull: "100000 fixed-seed red-value permutations and pagewise source-mask rotations",
      seed: "0x33551331", trials,
      fixedHypothesis: {
        shuffleHits: fixedShuffle, shuffleP: plusOne(fixedShuffle),
        pageRotationHits: fixedPage, pageRotationP: plusOne(fixedPage)
      },
      alternativeFamily: {
        choices: 16, effectiveChoices: 8,
        multiplier: [13, 31], marker: [0, 1, 13, 31],
        increment: [0, 31],
        shuffleHits: familyShuffle, shuffleP: plusOne(familyShuffle),
        pageRotationHits: familyPage, pageRotationP: plusOne(familyPage)
      }
    },
    decision: "EXPLORATORY CHECKSUM MATCH; independently fixed decoder/key and further out-of-sample prediction missing"
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(study(), null, 2) + "\n");
}
module.exports = {getEvents, terminal, study};
