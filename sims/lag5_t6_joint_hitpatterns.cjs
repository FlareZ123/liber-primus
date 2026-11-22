"use strict";

/**
 * Null test for whether the already selected within-word lag-five identity
 * and lag-six affine echo co-occur more than their observed marginal hit
 * profiles, after conditioning on word length and section/page.
 *
 * The independent null shuffles complete lag-six hit-pattern vectors among
 * words in the same stratum. It preserves every lag-five and lag-six
 * profile, both hit totals, same-rune counts, and word lengths.
 * It intentionally does not simulate a new ciphertext generator.
 *
 * @module lag5_t6_joint_hitpatterns
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname, "..");
const RAW = fs.readFileSync(path.join(ROOT, "resources/lp2-transcription.txt"), "utf8");
const RUNES = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8")).runes;
const INDEX = new Map(RUNES.map((r, i) => [r, i]));
const FIELDS = ["jointWords", "sameSite", "t6BeforeL5", "t6AfterL5"];

/** @param {string} raw @returns {number[]} Section index per canonical word. */
function sectionsOf(raw) {
  const result = [];
  let section = 0;
  let active = false;
  const flush = () => {
    if (active) {
      result.push(section);
      active = false;
    }
  };
  for (const ch of raw.split("%").slice(0, 55).join("%")) {
    if (INDEX.has(ch)) {
      active = true;
    } else if (ch === "%" || ch === "/" || /\s/u.test(ch)) {
      // Typesetting page/line wraps never end a rune word.
    } else {
      flush();
      if (ch === "$") section++;
    }
  }
  flush();
  return result;
}

/**
 * @typedef {{length:number,page:number,section:number,h5:number[],h6:number[]}} HitWord
 * @returns {HitWord[]}
 */
function readHits() {
  const corpus = parseSharedCorpus();
  assert.equal(corpus.words.length, 2896);
  assert.equal(corpus.runeCount, 12956);
  const sections = sectionsOf(RAW);
  assert.equal(sections.length, corpus.words.length);
  assert.equal(Math.max(...sections), 7);
  const rows = corpus.words.map((w, i) => {
    const a = Array.from(w.runes, c => INDEX.get(c));
    const h5 = [], h6 = [];
    for (let j = 5; j < a.length; j++)
      if (a[j] === a[j - 5]) h5.push(j);
    for (let j = 6; j < a.length; j++)
      if (a[j] === (24 - 2 * a[j - 6] + 58) % 29) h6.push(j);
    return {length:a.length, page:w.startPage, section:sections[i], h5, h6};
  });
  assert.equal(rows.reduce((n, w) => n + w.h5.length, 0), 104);
  assert.equal(rows.reduce((n, w) => n + w.h6.length, 0), 80);
  return rows.filter(w => w.length >= 7);
}

/** @param {number[]} a @param {number[]} b @param {number[]} out */
function countPair(a, b, out) {
  if (!a.length || !b.length) return;
  out[0]++;
  for (const h of a) {
    if (b.includes(h)) out[1]++;
    if (b.includes(h - 1)) out[2]++;
    if (b.includes(h + 1)) out[3]++;
  }
}

/** @param {HitWord[]} rows @returns {number[]} */
function observe(rows) {
  const counts = [0, 0, 0, 0];
  for (const row of rows) countPair(row.h5, row.h6, counts);
  return counts;
}

/**
 * @param {HitWord[]} rows
 * @param {"length"|"section-length"|"page-length"} mode
 * @returns {HitWord[][]}
 */
function groupsOf(rows, mode) {
  const groups = new Map();
  for (const row of rows) {
    let key = String(row.length);
    if (mode === "section-length") key = row.section + ":" + key;
    if (mode === "page-length") key = row.page + ":" + key;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return [...groups.values()];
}

/** Tiny deterministic xorshift32 with explicit unsigned state. */
function makeRandom(seed) {
  let s = seed >>> 0;
  return function draw() {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return s >>> 0;
  };
}

/**
 * @param {HitWord[][]} groups
 * @param {number[]} actual
 * @param {number} repeats
 * @param {number} seed
 */
function simulate(groups, actual, repeats, seed) {
  const random = makeRandom(seed);
  const total = [0, 0, 0, 0], squares = [0, 0, 0, 0];
  const tail = [0, 0, 0, 0];
  let expectedJoint = 0;
  for (const g of groups) {
    const n5 = g.filter(w => w.h5.length).length;
    const n6 = g.filter(w => w.h6.length).length;
    expectedJoint += n5 * n6 / g.length;
  }
  for (let test = 0; test < repeats; test++) {
    const counts = [0, 0, 0, 0];
    for (const group of groups) {
      const indexes = group.map((_, i) => i);
      for (let i = indexes.length - 1; i > 0; i--) {
        const j = random() % (i + 1);
        [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
      }
      for (let i = 0; i < group.length; i++)
        countPair(group[i].h5, group[indexes[i]].h6, counts);
    }
    for (let j = 0; j < actual.length; j++) {
      const value = counts[j];
      total[j] += value;
      squares[j] += value * value;
      if (value >= actual[j]) tail[j]++;
    }
  }
  const measurements = {};
  for (let j = 0; j < actual.length; j++) {
    const mean = total[j] / repeats;
    measurements[FIELDS[j]] = {
      observed:actual[j], nullMean:mean,
      nullSd:Math.sqrt(squares[j] / repeats - mean * mean),
      exceedances:tail[j],
      oneSidedP:(tail[j] + 1) / (repeats + 1)
    };
  }
  // Exact expected joint count is the hypergeometric expectation.
  assert.ok(Math.abs(measurements.jointWords.nullMean - expectedJoint) < 0.25);
  return {groups:groups.length, exactExpectedJoint:expectedJoint, measurements};
}

function main() {
  const rows = readHits();
  assert.equal(rows.length, 559);
  const actual = observe(rows);
  assert.deepEqual(actual, [18, 6, 6, 3]);
  const repeats = 10000;
  const modes = ["length", "section-length", "page-length"];
  const result = {};
  for (let i = 0; i < modes.length; i++) {
    const mode = modes[i];
    const groups = groupsOf(rows, mode);
    result[mode] = simulate(groups, actual, repeats, 0x1800a115 + i);
  }
  process.stdout.write(JSON.stringify({
    kind:"conditional-hitpattern-pairing", inputWords:2896,
    analyzedWords:rows.length, sourceRuneCount:12956,
    seed:0x1800a115, repeatsPerMode:repeats,
    note:"Exploratory test of historically selected motifs; no plaintext or key.",
    result
  }, null, 2) + "\n");
}

if (require.main === module) main();
module.exports = {readHits, observe, groupsOf, simulate};
