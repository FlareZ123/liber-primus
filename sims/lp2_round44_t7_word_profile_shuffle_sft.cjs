#!/usr/bin/env node
"use strict";

/**
 * Source-locked whole-word event-profile null for the Round44 B3/T7 gap anomaly.
 *
 * Keep each word's complete repeated-rune event pattern (including its within-word
 * positions and the unique word with two events), then reassign patterns to
 * source printed words of the same physical page, exact word length and
 * number of eligible in-page predecessor sites. A second null also keeps the
 * original 13-dot punctuation fragment. A profile may move only to a
 * same-shaped word, so every source event is accounted for.
 *
 * This is a site-statistic conditional test, NOT a substitute for
 * reconstructing valid ciphertext under a cipher.
 *
 * SFT: node sims/lp2_round44_t7_word_profile_shuffle_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { words } = require("./cross_word_repeat_invariant.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(ROOT, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const inks = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const master = read("resources/transcriptions/liber_primus_master.txt");
const sections = master.slice(master.indexOf("\n\n") + 2).split("$");
const wordGlyphs = sections.slice(7, 16).flatMap(words);
assert.equal(wordGlyphs.length, 2896);

const alphabet = new Map(corpus.runes.map((rune, index) => [rune, index]));
const flat = wordGlyphs.flat().map(rune => {
  assert.ok(alphabet.has(rune));
  return alphabet.get(rune);
});
const pages = corpus.pages.filter(p => p.page <= 55);
assert.deepEqual(flat, pages.flatMap(p => p.indices));
assert.equal(flat.length, 12956);

const wordAt = new Int32Array(flat.length);
let cursor = 0;
wordGlyphs.forEach((w, id) => {
  wordAt.fill(id, cursor, cursor + w.length);
  cursor += w.length;
});

/** @type {Map<string, {page:number,fragment:number,length:number,sites:number[],pattern:number[]}>} */
const wordPage = new Map();
const observed = [];
let offset = 0;
for (const page of pages) {
  const annotation = inks.pages.find(p => p.page === page.page);
  const marks = (annotation?.large_punctuation || [])
    .filter(mark => mark[1] === 13).map(mark => mark[0]).sort((a, b) => a - b);
  for (let local = 1; local < page.indices.length; local++) {
    const pos = offset + local;
    const wordId = wordAt[pos];
    const cellKey = wordId + ":" + page.page;
    if (!wordPage.has(cellKey)) {
      wordPage.set(cellKey, {
        page: page.page,
        fragment: marks.filter(mark => local >= mark).length,
        length: wordGlyphs[wordId].length,
        sites: [],
        pattern: []
      });
    }
    const cell = wordPage.get(cellKey);
    cell.sites.push(pos);
    if (page.indices[local] === page.indices[local - 1]) {
      cell.pattern.push(cell.sites.length - 1);
      observed.push(pos);
    }
  }
  offset += page.indices.length;
}
assert.equal(observed.length, 86);
assert.equal(wordPage.size, 2918);

/** Pearson correlation of successive gaps between sorted rune positions.
 * @param {number[]} positions
 */
function lagOne(positions) {
  const gaps = [];
  for (let i = 1; i < positions.length; i++)
    gaps.push(positions[i] - positions[i - 1]);
  const n = gaps.length - 1;
  let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
  for (let i = 0; i < n; i++) {
    const x = gaps[i], y = gaps[i + 1];
    sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y;
  }
  return (sxy - sx * sy / n) /
    Math.sqrt((sxx - sx * sx / n) * (syy - sy * sy / n));
}
const target = lagOne(observed);
assert.ok(Math.abs(target - 0.3800196892410096) < 1e-12);

/** @param {number} seed */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/** @param {boolean} preserveFragment */
function makeStrata(preserveFragment) {
  const groups = new Map();
  for (const cell of wordPage.values()) {
    const key = [cell.page,
      ...(preserveFragment ? [cell.fragment] : []),
      cell.length, cell.sites.length].join(":");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(cell);
  }
  return [...groups.values()];
}

/** @param {boolean} preserveFragment @param {number} seed */
function run(preserveFragment, seed) {
  const strata = makeStrata(preserveFragment), random = xorshift32(seed);
  const trials = 20000;
  let movable = 0, pinned = 0;
  for (const group of strata) {
    const count = group.reduce((s, g) => s + g.pattern.length, 0);
    if (group.length > 1) movable += count;
    else pinned += count;
  }
  let sum = 0, squares = 0, exceedances = 0;
  for (let trial = 0; trial < trials; trial++) {
    const simulated = [];
    for (const group of strata) {
      if (group.length === 1) {
        for (const k of group[0].pattern)
          simulated.push(group[0].sites[k]);
        continue;
      }
      const patterns = group.map(g => g.pattern);
      for (let k = patterns.length - 1; k > 0; k--) {
        const j = Math.floor(random() * (k + 1));
        [patterns[k], patterns[j]] = [patterns[j], patterns[k]];
      }
      for (let k = 0; k < group.length; k++)
        for (const siteIndex of patterns[k])
          simulated.push(group[k].sites[siteIndex]);
    }
    simulated.sort((a, b) => a - b);
    assert.equal(simulated.length, 86);
    const statistic = lagOne(simulated);
    sum += statistic;
    squares += statistic * statistic;
    exceedances += Number(statistic >= target);
  }
  const mean = sum / trials;
  return {
    model: preserveFragment ? "page + 13-dot fragment + word length + eligible sites" :
      "page + word length + eligible sites",
    strata: strata.length, movableEvents: movable, pinnedEvents: pinned,
    seed: "0x" + seed.toString(16), trials, observed: target,
    nullMean: mean, nullSD: Math.sqrt(squares / trials - mean * mean),
    exceedances, addOneUpperTail: (exceedances + 1) / (trials + 1)
  };
}

const page = run(false, 0x33a3f201);
const fragment = run(true, 0x33a3f202);
assert.deepEqual(
  [page.strata, page.movableEvents, page.pinnedEvents, page.exceedances],
  [598, 82, 4, 428]);
assert.deepEqual(
  [fragment.strata, fragment.movableEvents, fragment.pinnedEvents, fragment.exceedances],
  [647, 79, 7, 163]);
console.log(JSON.stringify({
  originalRunes: flat.length,
  originalPrintedWords: wordGlyphs.length,
  samePageRepeatEvents: observed.length,
  sourceWordPageCells: wordPage.size,
  measuredGapLagOne: target,
  nulls: [page, fragment],
  inference: "The flat-position Round44 T7 null is not unique. These whole-word-profile shuffles dilute its significance; 13-dot-conditioning retains a modest residual. No key or plaintext follows."
}, null, 2));
