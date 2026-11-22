#!/usr/bin/env node
"use strict";

/** Original-source SFT for the corrected T7 50x33 window claim. Windows Node22 CJS. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const pages = corpus.pages.slice(0, 56);
const source = pages.flatMap(p => p.indices);
assert.equal(pages.length, 56);
assert.equal(source.length, 12956);
const equals = [];
for (let i = 1; i < source.length; i++) {
  if (source[i] === source[i - 1]) equals.push(i);
}
assert.equal(equals.length, 86);
const L = 1650;
const start = 2739;
const inside = equals.filter(i => i > start && i < start + L);
assert.deepEqual(inside, [2740, 3140, 3852]);
assert.deepEqual(inside.map(i => corpus.translit[source[i]]), ["U", "AE", "G"]);
const candidates = [];
let bestStart = 0;
let bestLength = 0;
for (let i = 0; i <= equals.length; i++) {
  const lo = i === 0 ? 0 : equals[i - 1];
  const hi = i === equals.length ? source.length : equals[i];
  const len = hi - lo;
  candidates.push({start: lo, endExclusive: hi, length: len});
  if (len > bestLength) {
    bestStart = lo;
    bestLength = len;
  }
}
assert.equal(bestStart, 3140);
assert.equal(bestLength, 712);
const prefix = [0];
for (let i = 0; i < source.length; i++) {
  prefix.push(prefix[i] + (i > 0 && source[i] === source[i - 1] ? 1 : 0));
}
let minimum = Infinity;
const ties = [];
for (let i = 0; i + L <= source.length; i++) {
  const count = prefix[i + L] - prefix[i + 1];
  if (count < minimum) {
    minimum = count;
    ties.length = 0;
    ties.push(i);
  } else if (count === minimum) {
    ties.push(i);
  }
}
assert.equal(minimum, 3);
assert.equal(ties.length, 351);
assert.equal(ties[0], 2580);
assert.equal(ties[ties.length - 1], 2930);
assert.ok(ties.includes(2739));

// Twenty thousand exact fixed-site nulls show the longest zero-equality run
// is ordinary even before conditioning on each page's observed event count.
// All 86 sites are drawn without replacement from the 12,901 original-page
// eligible pair positions; 55 page-boundary transitions remain unavailable.
const eligible = [];
let base = 0;
for (const page of pages) {
  for (let i = 1; i < page.indices.length; i++) eligible.push(base + i);
  base += page.indices.length;
}
assert.equal(eligible.length, 12901);
let seed = 0x3301;
function uniform() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}
function longestOf(siteList) {
  let longest = siteList[0];
  let previous = siteList[0];
  for (let i = 1; i < siteList.length; i++) {
    longest = Math.max(longest, siteList[i] - previous);
    previous = siteList[i];
  }
  return Math.max(longest, source.length - previous);
}
const maxGapSamples = [];
for (let trial = 0; trial < 20000; trial++) {
  const chosen = new Set();
  while (chosen.size < equals.length) {
    chosen.add(eligible[Math.floor(uniform() * eligible.length)]);
  }
  maxGapSamples.push(longestOf([...chosen].sort((a, b) => a - b)));
}
maxGapSamples.sort((a, b) => a - b);
const exceed = maxGapSamples.filter(n => n >= bestLength).length;
assert.equal(maxGapSamples[9999], 721);
assert.equal(maxGapSamples[999], 532);
assert.equal(maxGapSamples[18999], 1074);
assert.equal(exceed, 10462);

// Condition on all 55 original non-empty page-level repeat counts instead.
// This is deliberately a separate fixed-seed experiment: page populations
// and counts are measured from the immutable original ciphertext.
let pageSeed = 0x3301;
function pageUniform() {
  pageSeed = (Math.imul(pageSeed, 1664525) + 1013904223) >>> 0;
  return pageSeed / 4294967296;
}
let cumulative = 0;
const pagePools = [];
for (const page of pages) {
  let count = 0;
  for (let i = 1; i < page.indices.length; i++) {
    if (page.indices[i] === page.indices[i - 1]) count++;
  }
  pagePools.push({start: cumulative, eligible: page.indices.length - 1,
    repeats: count});
  cumulative += page.indices.length;
}
assert.equal(pagePools.reduce((sum, p) => sum + p.repeats, 0), equals.length);
const conditional = [];
for (let trial = 0; trial < 20000; trial++) {
  const taken = [];
  for (const page of pagePools) {
    const draw = new Set();
    while (draw.size < page.repeats) {
      draw.add(1 + Math.floor(pageUniform() * page.eligible));
    }
    for (const value of draw) taken.push(page.start + value);
  }
  taken.sort((a, b) => a - b);
  conditional.push(longestOf(taken));
}
conditional.sort((a, b) => a - b);
const conditionalGE = conditional.filter(n => n >= bestLength).length;
assert.equal(conditional[9999], 833);
assert.equal(conditional[999], 685);
assert.equal(conditional[18999], 1014);
assert.equal(conditionalGE, 17954);
console.log(JSON.stringify({
  sourceRunes: source.length,
  allAdjacentEqual: equals.length,
  disputedWindow: {start, endExclusive: start + L, runes: L, internalAdjacentEqual: inside},
  longestTrueNoEqual: {start: bestStart, endExclusive: bestStart + bestLength, runes: bestLength},
  allLength1650Windows: source.length - L + 1,
  minimumEqual: minimum,
  tiedMinima: {count: ties.length, firstStart: ties[0], lastStart: ties[ties.length - 1]},
  fixedSiteNull: {draws: 20000, seed: "0x3301", median: maxGapSamples[9999],
    p05: maxGapSamples[999], p95: maxGapSamples[18999],
    geObserved: exceed, empiricalUpperTail: (exceed + 1) / 20001},
  pageCountConditionalNull: {draws: 20000, seed: "0x3301",
    median: conditional[9999], p05: conditional[999], p95: conditional[18999],
    geObserved: conditionalGE, empiricalUpperTail: (conditionalGE + 1) / 20001}
}, null, 2));
