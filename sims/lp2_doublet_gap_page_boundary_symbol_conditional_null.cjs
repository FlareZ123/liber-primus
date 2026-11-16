#!/usr/bin/env node
"use strict";

/*
Conditional diagnostic for the 86 original LP2 adjacent-equal rune sites.

Primary null: physical page × inside-word/cross-word boundary × preceding
GP29 rune identity. This preserves page totals, boundary-class totals and
the number of repeat events attributed to each preceding rune, while leaving
most event positions movable.

Sensitivity null: physical page × exact word-length/within-word-offset (or
cross-word) × preceding rune identity. This is deliberately reported as a
sensitivity only: it fixes many event positions and is highly constrained.

Neither null is a cipher model or a plaintext claim.
*/

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length > 0);
const sections = transcription.split("$").slice(0, 8);
const words = sections.flatMap(section =>
  section.split(/[-.&§]/)
    .map(part => part.match(/\p{Script=Runic}/gu) || [])
    .filter(word => word.length)
);
const wordId = words.flatMap((word, id) => word.map(() => id));
const wordLength = words.flatMap(word => word.map(() => word.length));
const wordPosition = words.flatMap(word => word.map((_, i) => i));
const ciphertext = pages.flatMap(page => page.indices);
const sourceRunes = sections.join("").match(/\p{Script=Runic}/gu) || [];

assert.strictEqual(ciphertext.length, 12956);
assert.strictEqual(words.length, 2896);
assert.strictEqual(wordId.length, ciphertext.length);
assert.strictEqual(pages.length, 55);
assert(ciphertext.every((rune, i) => corpus.runes[rune] === sourceRunes[i]),
  "numeric corpus and literal transcription must agree at every rune");

function pearson(a) {
  const n = a.length - 1;
  let leftMean = 0, rightMean = 0;
  for (let i = 0; i < n; i++) {
    leftMean += a[i];
    rightMean += a[i + 1];
  }
  leftMean /= n;
  rightMean /= n;
  let product = 0, leftSS = 0, rightSS = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i] - leftMean;
    const y = a[i + 1] - rightMean;
    product += x * y;
    leftSS += x * x;
    rightSS += y * y;
  }
  return product / Math.sqrt(leftSS * rightSS);
}

function midranks(values) {
  const sorted = values.map((value, index) => ({ value, index }))
    .sort((a, b) => a.value - b.value);
  const ranks = Array(values.length);
  for (let i = 0; i < sorted.length;) {
    let j = i + 1;
    while (j < sorted.length && sorted[j].value === sorted[i].value) j++;
    for (let k = i; k < j; k++) ranks[sorted[k].index] = (i + j - 1) / 2;
    i = j;
  }
  return ranks;
}

function gapStats(positions) {
  const gaps = positions.slice(1).map((position, i) => position - positions[i]);
  return [
    pearson(gaps),
    pearson(gaps.map(Math.log)),
    pearson(midranks(gaps))
  ];
}

function makeRng(seed) {
  let state = seed >>> 0;
  return function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

function buildStrata(mode) {
  const strata = new Map();
  const observedPositions = [];
  let pageOffset = 0;
  let eligible = 0;
  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const page = pages[pageIndex];
    for (let i = 1; i < page.indices.length; i++) {
      const position = pageOffset + i;
      const inside = wordId[position] === wordId[position - 1];
      const boundary = inside ? "inside" : "cross";
      const shape = inside
        ? `in:${wordLength[position]}:${wordPosition[position]}`
        : "cross";
      const previousRune = page.indices[i - 1];
      const key = mode === "balanced"
        ? `${pageIndex}:${boundary}:${previousRune}`
        : `${pageIndex}:${shape}:${previousRune}`;
      if (!strata.has(key)) strata.set(key, { slots: [], count: 0 });
      const group = strata.get(key);
      group.slots.push(position);
      eligible++;
      if (ciphertext[position] === ciphertext[position - 1]) {
        group.count++;
        observedPositions.push(position);
      }
    }
    pageOffset += page.indices.length;
  }
  observedPositions.sort((a, b) => a - b);
  return {
    groups: [...strata.values()].filter(group => group.count > 0),
    observedPositions, eligible, totalStrata: strata.size
  };
}

function runNull(mode, seed, samples) {
  const built = buildStrata(mode);
  const groups = built.groups;
  const observed = gapStats(built.observedPositions);
  const exceedances = [0, 0, 0];
  const sums = [0, 0, 0];
  const squares = [0, 0, 0];
  const minima = [Infinity, Infinity, Infinity];
  const maxima = [-Infinity, -Infinity, -Infinity];
  const slotHistogram = {};
  let movableEvents = 0, fixedEvents = 0, activeSlots = 0;
  for (const group of groups) {
    slotHistogram[group.slots.length] = (slotHistogram[group.slots.length] || 0) + 1;
    activeSlots += group.slots.length;
    if (group.slots.length > 1) movableEvents += group.count;
    else fixedEvents += group.count;
  }

  const random = makeRng(seed);
  for (let sample = 0; sample < samples; sample++) {
    const positions = [];
    for (const group of groups) {
      const pool = group.slots.slice();
      for (let i = 0; i < group.count; i++) {
        const j = i + Math.floor(random() * (pool.length - i));
        [pool[i], pool[j]] = [pool[j], pool[i]];
        positions.push(pool[i]);
      }
    }
    positions.sort((a, b) => a - b);
    assert.strictEqual(positions.length, 86);
    const values = gapStats(positions);
    for (let i = 0; i < 3; i++) {
      if (values[i] >= observed[i]) exceedances[i]++;
      sums[i] += values[i];
      squares[i] += values[i] * values[i];
      minima[i] = Math.min(minima[i], values[i]);
      maxima[i] = Math.max(maxima[i], values[i]);
    }
  }

  return {
    mode, seed: "0x" + seed.toString(16).toUpperCase(), samples,
    observed,
    activeStrata: groups.length, totalStrata: built.totalStrata,
    eligiblePositions: built.eligible, activeSlots,
    movableEvents, fixedEvents, slotHistogram,
    exceedances,
    addOneP: exceedances.map(n => (n + 1) / (samples + 1)),
    nullMeans: sums.map(x => x / samples),
    nullSD: squares.map((x, i) => Math.sqrt(Math.max(0, x / samples - (sums[i] / samples) ** 2))),
    nullMin: minima, nullMax: maxima
  };
}

const observedPositions = buildStrata("balanced").observedPositions;
assert.strictEqual(observedPositions.length, 86);
const observed = gapStats(observedPositions);
assert(Math.abs(observed[0] - 0.38001968924100965) < 1e-12);
assert(Math.abs(observed[1] - 0.2294355175896505) < 1e-12);
assert(Math.abs(observed[2] - 0.26700210480775993) < 1e-12);

const result = {
  source: { runeCount:ciphertext.length, wordCount:words.length, physicalPages:pages.length, doublets:86 },
  statistics: ["Pearson(gap)", "Pearson(log gap)", "Pearson(midrank gap)"],
  balanced: runNull("balanced", 0x53594D32, 20000),
  fineSensitivity: runNull("fine", 0x53594D42, 20000)
};

console.log(JSON.stringify(result, null, 2));
