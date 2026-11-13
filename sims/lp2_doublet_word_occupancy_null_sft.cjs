#!/usr/bin/env node
"use strict";

/**
 * Exact-original-input, source-stratified null for 86 repeat events occupying
 * 85 words. This probes whether there is evidence for a per-word repeat cap.
 *
 * SFT: node sims/lp2_doublet_word_occupancy_null_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");

/** @param {string} p */
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const inks = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const master = read("resources/transcriptions/liber_primus_master.txt");
const rawSections = master.slice(master.indexOf("\n\n") + 2).split("$");
const words = rawSections.slice(7, 16).flatMap(part =>
  part.split(/[-.&§]/u)
    .map(token => token.match(/[\u16a0-\u16ff]/gu))
    .filter(Boolean));
const alphabet = new Map(corpus.runes.map((r, i) => [r, i]));
const original = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
const flattened = words.flat().map(r => {
  assert.ok(alphabet.has(r));
  return alphabet.get(r);
});
assert.equal(words.length, 2896);
assert.equal(original.length, 12956);
assert.deepEqual(flattened, original);

const wordAt = new Int16Array(original.length);
let cursor = 0;
for (let i = 0; i < words.length; i++) {
  wordAt.fill(i, cursor, cursor + words[i].length);
  cursor += words[i].length;
}
const byPage = new Map();
const byFragment = new Map();
const observed = [];
let pageStart = 0;
for (const page of corpus.pages.filter(p => p.page < 56)) {
  const source = inks.pages.find(p => p.page === page.page);
  const dots = (source?.large_punctuation || [])
    .filter(([_, kind]) => kind === 13)
    .map(([local]) => local).sort((a, b) => a - b);
  for (let local = 1; local < page.indices.length; local++) {
    const site = pageStart + local;
    const fragment = dots.filter(dot => local >= dot).length;
    const pair = [
      [byPage, String(page.page)],
      [byFragment, page.page + ":" + fragment]
    ];
    const hasRepeat = page.indices[local] === page.indices[local - 1];
    for (const [groups, key] of pair) {
      if (!groups.has(key)) groups.set(key, { sites: [], count: 0 });
      const group = groups.get(key);
      group.sites.push(site);
      group.count += Number(hasRepeat);
    }
    if (hasRepeat) observed.push(site);
  }
  pageStart += page.indices.length;
}
const count = observed.length;
assert.equal(count, 86);
assert.equal(count - new Set(observed.map(pos => wordAt[pos])).size, 1);
assert.equal([...byPage.values()].reduce((s, g) => s + g.sites.length, 0), 12901);

/** Deterministic xorshift32 sampling, no replacement inside each stratum.
 * @param {Map<string, {sites:number[], count:number}>} groups
 * @param {number} seed
 */
function nullSample(groups, seed) {
  let state = seed >>> 0;
  const next = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
  const strata = [...groups.values()];
  let meanTotal = 0, <=1 = 0, zeros = 0, ones = 0;
  const all = [];
  const trials = 20000;
  for (let trial = 0; trial < trials; trial++) {
    const observedWords = new Set();
    let repeatedWords = 0;
    for (const group of strata) {
      const picked = new Set();
      while (picked.size < group.count)
        picked.add(Math.floor(next() * group.sites.length));
      for (const k of picked) {
        const id = wordAt[group.sites[k]];
        if (observedWords.has(id)) repeatedWords++;
        else observedWords.add(id);
      }
    }
    assert.equal(observedWords.size + repeatedWords, count);
    meanTotal += repeatedWords;
    all.push(repeatedWords);
    <=1 += Number(repeatedWords <= 1);
    zeros += Number(repeatedWords === 0);
    ones += Number(repeatedWords === 1);
  }
  const mean = meanTotal / trials;
  return {
    strata: strata.length, trials, seed: "0x" + seed.toString(16),
    observedWithinWordEventCollisions: 1,
    nullMean: mean,
    nullSD: Math.sqrt(all.reduce((s, v) => s + (v - mean) ** 2, 0) / trials),
    atMostOne: <=1, zero: zeros, exactlyOne: ones,
    addOneLowerTail: (<=1 + 1) / (trials + 1)
  };
}
const page = nullSample(byPage, 0x6711a201);
const fragment = nullSample(byFragment, 0x6711a202);
assert.deepEqual(
  [page.strata, page.atMostOne, page.zero, page.exactlyOne],
  [55, 11738, 4603, 7135]);
assert.deepEqual(
  [fragment.strata, fragment.atMostOne, fragment.zero, fragment.exactlyOne],
  [72, 12299, 5134, 7165]);
console.log(JSON.stringify({
  source: "original 12,956 GP29 runes, 2,896 complete printed words",
  repeatEvents: 86,
  repeatBearingWords: 85,
  nulls: [page, fragment],
  conclusion: "One word with two repeat events is typical under both source-conditioned random-site nulls. It does not select a one-repeat-per-word encoder."
}, null, 2));
