"use strict";

/**
 * Source-aligned chapter-page ciphertext collision probe.
 *
 * Investigates a concrete prospective keystream-reuse signal, without
 * assuming that original LP2 runes already represent ordinary English.
 *
 * SFT: node sims/lp2_chapter_pagealigned_collision_sft.cjs
 * Node.js 20+, CommonJS, no dependencies, no writes, seeded nulls.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const source = JSON.parse(fs.readFileSync(path.join(
  root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const pages = source.pages.filter(p => p.page <= 55 && p.indices.length);
const chapters = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
assert.equal(pages.length, 55);
assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), 12956);

/** @param {number} page */
function page(page) {
  const p = pages.find(p => p.page === page);
  assert(p, "missing original physical page " + page);
  return p.indices;
}

/**
 * Exact aligned equality count in source runes.
 * @param {number[][]} rows
 * @param {number} start
 * @param {number} width
 */
function collisions(rows, start, width) {
  let matches = 0;
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      for (let k = start; k < start + width; k++) {
        matches += Number(rows[i][k] === rows[j][k]);
      }
    }
  }
  return matches;
}

const four = [18, 19, 20, 21].map(page);
const block = four.map(row => row.slice(60, 80));
assert.equal(collisions(four, 60, 20), 18);
assert.equal(collisions(four, 20, 20), 10);
const hist = block.map(row => {
  const counts = new Array(29).fill(0);
  for (const c of row) counts[c]++;
  return counts;
});
let localExpected = 0;
for (let i = 0; i < hist.length; i++) {
  for (let j = i + 1; j < hist.length; j++) {
    localExpected += hist[i].reduce(
      (sum, n, k) => sum + n * hist[j][k] / 20, 0);
  }
}
assert.ok(Math.abs(localExpected - 4.65) < 1e-10);

// Exact-page-window-inventory null: independent random permutations of
// each actual 20-rune slice. This removes alignment while retaining the
// conspicuous original local letter histograms.
let localSeed = 314159265;
/** @returns {number} */
function localRandom() {
  localSeed = (Math.imul(localSeed, 1664525) + 1013904223) >>> 0;
  return localSeed / 4294967296;
}
let localExtreme = 0;
const localDraws = 40000;
for (let draw = 0; draw < localDraws; draw++) {
  const shuffled = block.map(row => {
    const result = [...row];
    for (let k = 19; k > 0; k--) {
      const j = Math.floor(localRandom() * (k + 1));
      [result[k], result[j]] = [result[j], result[k]];
    }
    return result;
  });
  localExtreme += Number(collisions(shuffled, 0, 20) >= 18);
}
assert.equal(localExtreme, 0, "fixed-seed local null changed");

const byPage = new Map(pages.map((p, i) => [p.page, i]));
const rows = pages.map(p => p.indices);
const specs = [];
// Search scope includes EVERY completely available consecutive four-page
// group contained in a SOURCE-DEFINED visual chapter, at predeclared
// source-position-anchored 10/20/40-rune nonoverlapping windows.
for (const [lo, hi] of chapters) {
  for (let p = lo; p <= hi - 3; p++) {
    const ids = [0, 1, 2, 3].map(i => byPage.get(p + i));
    if (ids.some(i => i === undefined)) continue;
    const minLen = Math.min(...ids.map(i => rows[i].length));
    for (const width of [10, 20, 40]) {
      for (let start = 0; start + width <= minLen; start += width) {
        specs.push({p, ids, width, start});
      }
    }
  }
}
assert.equal(specs.length, 971);

/** @param {number[]} shifts */
function scan(shifts) {
  return specs.map(({ids, width, start}) => {
    let n = 0;
    for (let a = 0; a < 4; a++) {
      for (let b = a + 1; b < 4; b++) {
        const x = rows[ids[a]], y = rows[ids[b]];
        for (let k = start; k < start + width; k++) {
          n += Number(x[(k + shifts[ids[a]]) % x.length] ===
            y[(k + shifts[ids[b]]) % y.length]);
        }
      }
    }
    return n;
  });
}
/** @param {number} n @param {number} width */
function zScore(n, width) {
  const mean = 6 * width / 29;
  return (n - mean) / Math.sqrt(mean * 28 / 29);
}
const original = scan(rows.map(() => 0));
const ranks = original.map((n, i) => ({i, n, z: zScore(n, specs[i].width)}))
  .sort((x, y) => y.z - x.z);
const best = specs[ranks[0].i];
assert.deepEqual([best.p, best.start, best.width, ranks[0].n],
  [18, 60, 20, 18]);

// Circularly shift each entire original page. This preserves each page's
// complete rune sequence, exact histogram, local anti-repeat signal and
// n-gram texture, while removing accidental inter-page phase alignment.
// The same 971-way maximum is selected on EVERY null draw.
let seed = 33012026;
/** @returns {number} */
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}
const draws = 1900;
let anyAtLeast = 0, specificAtLeast = 0;
for (let draw = 0; draw < draws; draw++) {
  const shifts = rows.map(row => Math.floor(random() * row.length));
  const counts = scan(shifts);
  let maximum = -Infinity;
  for (let i = 0; i < counts.length; i++) {
    const z = zScore(counts[i], specs[i].width);
    if (z > maximum) maximum = z;
  }
  anyAtLeast += Number(maximum >= ranks[0].z);
  specificAtLeast += Number(counts[ranks[0].i] >= ranks[0].n);
}
assert.equal(anyAtLeast, 8, "familywise null must be reproducible");
assert.equal(specificAtLeast, 0, "specific-window null must be reproducible");

// A repeated period-40 additive page clock would link windows 20:39 and
// 60:79. Actual inter-window equality is BELOW the uniform-alphabet rate.
const chapter = [15, 16, 17, 18, 19, 20, 21, 22].map(page);
let cross40 = 0;
for (let offset = 20; offset < 40; offset++) {
  for (const a of chapter) {
    for (const b of chapter) {
      cross40 += Number(a[offset] === b[offset + 40]);
    }
  }
}
assert.equal(cross40, 31);

const output = {
  observation: {
    pages: [18, 19, 20, 21],
    localRuneInterval: [60, 79],
    alignedEqualities: 18,
    comparisonPairs: 120,
    localInventoryNullMean: localExpected,
    localNullDraws: localDraws,
    localNullExceedances: localExtreme
  },
  multiWindowFamilywise: {
    visualChapters: chapters.length,
    searchedWindows: specs.length,
    widths: [10, 20, 40],
    originalStrongest: [best.p, best.start, best.width, ranks[0].n],
    circularPageNullDraws: draws,
    maxNullExceedances: anyAtLeast,
    plusOneTailProbability: (anyAtLeast + 1) / (draws + 1)
  },
  rejectedSimpleClock: {
    candidatePeriod: 40,
    crossBandMatches: cross40,
    crossBandComparisons: 20 * 8 * 8
  },
  interpretation: "Exploratory aligned-symbol anomaly; no plaintext, key or historical cipher identified."
};
console.log(JSON.stringify(output, null, 2));
