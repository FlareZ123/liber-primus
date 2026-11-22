'use strict';

/**
 * LP2 original-source equal-rune interval diagnostic, read-only.
 * Compatible with Windows Node.js 22 and canonical corpus JSON.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const pages = corpus.pages.filter((page) => page.page <= 55);
let totalLength = 0;
const originalSites = [];
const originals = pages.map((page) => {
  const localSites = [];
  for (let i = 0; i + 1 < page.indices.length; i++) {
    if (page.indices[i] === page.indices[i + 1]) {
      localSites.push(i);
      originalSites.push(totalLength + i);
    }
  }
  const value = {
    number: page.page,
    start: totalLength,
    length: page.indices.length,
    localSites
  };
  totalLength += page.indices.length;
  return value;
});

/** @param {number[]} sites */
function gapLengths(sites) {
  return sites.slice(1).map((value, i) => value - sites[i]);
}

/** @param {number[]} gaps */
function ac1(gaps) {
  const n = gaps.length - 1;
  let leftSum = 0;
  let rightSum = 0;
  for (let i = 0; i < n; i++) {
    leftSum += gaps[i];
    rightSum += gaps[i + 1];
  }
  const lm = leftSum / n;
  const rm = rightSum / n;
  let cross = 0;
  let left = 0;
  let right = 0;
  for (let i = 0; i < n; i++) {
    const u = gaps[i] - lm;
    const v = gaps[i + 1] - rm;
    cross += u * v;
    left += u * u;
    right += v * v;
  }
  return cross / Math.sqrt(left * right);
}

/** @param {number[]} gaps */
function maximumThreeGaps(gaps) {
  let maximum = -1;
  let index = -1;
  for (let i = 0; i + 2 < gaps.length; i++) {
    const sum = gaps[i] + gaps[i + 1] + gaps[i + 2];
    if (sum > maximum) {
      maximum = sum;
      index = i;
    }
  }
  return { maximum, index };
}

/** @param {number} seed */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * Uniformly choose count distinct integers from [0, size) by Floyd's method.
 * @param {number} size
 * @param {number} count
 * @param {() => number} random
 */
function subset(size, count, random) {
  const values = new Set();
  for (let j = size - count; j < size; j++) {
    const v = Math.floor(random() * (j + 1));
    values.add(values.has(v) ? j : v);
  }
  return [...values].sort((a, b) => a - b);
}

/** @param {number[]} siteOffsets */
function gapSix(siteOffsets) {
  for (let i = 1; i < siteOffsets.length; i++) {
    if (siteOffsets[i] - siteOffsets[i - 1] < 6) return false;
  }
  return true;
}

/**
 * @template T
 * @param {T[]} values
 * @param {() => number} random
 * @returns {T[]}
 */
function shuffled(values, random) {
  const copy = values.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const originalGaps = gapLengths(originalSites);
const observedAc1 = ac1(originalGaps);
const observedThree = maximumThreeGaps(originalGaps);
const observedSingle = Math.max(...originalGaps);
assert.equal(totalLength, 12956);
assert.equal(originalSites.length, 86);
assert.equal(originalGaps.length, 85);
assert.ok(gapSix(originalSites));
assert.deepEqual(observedThree, { maximum: 1649, index: 17 });
assert.equal(observedSingle, 712);
assert.deepEqual(originalSites.slice(17, 21), [2739, 3139, 3851, 4388]);
assert.ok(Math.abs(observedAc1 - 0.38001968924100965) < 1e-12);

const chapterRanges = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const chapters = chapterRanges.map(([start, end]) => {
  const chapterPages = originals.filter((p) => p.number >= start && p.number <= end);
  const eligible = chapterPages.flatMap((p) =>
    Array.from({ length: Math.max(0, p.length - 1) }, (_, i) => p.start + i)
  );
  const count = chapterPages.reduce((sum, p) => sum + p.localSites.length, 0);
  return { chapterPages, eligible, count };
});
assert.equal(chapters.reduce((sum, c) => sum + c.count, 0), 86);

/** @param {() => number} random */
function flatHardcore(random) {
  return subset(totalLength - 1 - 5 * (originalSites.length - 1),
    originalSites.length, random).map((v, i) => v + 5 * i);
}

/** @param {() => number} random */
function pageCountHardcore(random) {
  while (true) {
    const sampled = [];
    for (const page of originals) {
      const count = page.localSites.length;
      if (!count) continue;
      const size = page.length - 1 - 5 * (count - 1);
      sampled.push(...subset(size, count, random)
        .map((v, i) => page.start + v + 5 * i));
    }
    if (gapSix(sampled)) return sampled;
  }
}

/** @param {() => number} random */
function chapterCountHardcore(random) {
  while (true) {
    const sampled = [];
    for (const chapter of chapters) {
      let sample;
      do {
        sample = subset(chapter.eligible.length, chapter.count, random)
          .map((index) => chapter.eligible[index]);
      } while (!gapSix(sample));
      sampled.push(...sample);
    }
    if (gapSix(sampled)) return sampled;
  }
}

/** @param {typeof originals} pageOrder */
function orderedSites(pageOrder) {
  let offset = 0;
  const positions = [];
  for (const page of pageOrder) {
    positions.push(...page.localSites.map((local) => offset + local));
    offset += page.length;
  }
  return positions;
}

/** @param {() => number} random */
function chapterPagePermutation(random) {
  return orderedSites(chapters.flatMap((chapter) =>
    shuffled(chapter.chapterPages, random)));
}

/** @param {() => number} random */
function wholeBookPagePermutation(random) {
  return orderedSites(shuffled(originals, random));
}

/**
 * @param {string} name
 * @param {(random: () => number) => number[]} draw
 * @param {number} n
 * @param {number} seed
 */
function trial(name, draw, n, seed) {
  const random = rng(seed);
  let acExceed = 0;
  let spanExceed = 0;
  let singleExceed = 0;
  let acSum = 0;
  let spanSum = 0;
  let singleSum = 0;
  for (let i = 0; i < n; i++) {
    const sample = draw(random);
    assert.equal(sample.length, 86);
    const sampleGaps = gapLengths(sample);
    const sampleAc = ac1(sampleGaps);
    const sampleSpan = maximumThreeGaps(sampleGaps).maximum;
    const sampleSingle = Math.max(...sampleGaps);
    if (sampleAc >= observedAc1) acExceed++;
    if (sampleSpan >= observedThree.maximum) spanExceed++;
    if (sampleSingle >= observedSingle) singleExceed++;
    acSum += sampleAc;
    spanSum += sampleSpan;
    singleSum += sampleSingle;
  }
  return {
    null: name,
    samples: n,
    seed: '0x' + seed.toString(16),
    meanAc1: acSum / n,
    ac1UpperTail: (acExceed + 1) / (n + 1),
    meanMaxThreeGaps: spanSum / n,
    maxThreeGapsUpperTail: (spanExceed + 1) / (n + 1),
    meanMaxSingleGap: singleSum / n,
    maxSingleGapUpperTail: (singleExceed + 1) / (n + 1)
  };
}

const output = {
  original: {
    runeCount: totalLength,
    eventCount: originalSites.length,
    observedAc1,
    largestThreeGapSpan: observedThree.maximum,
    largestIndividualGap: observedSingle,
    siteOffsets: originalSites.slice(17, 21),
    internalRepeatedPairs: [originalSites[18], originalSites[19]],
    chapterCounts: chapters.map((chapter) => chapter.count)
  },
  trials: [
    trial('flat-uniform-hardcore', flatHardcore, 100000, 0x33012026),
    trial('original-page-count-hardcore', pageCountHardcore, 100000, 0x11022026),
    trial('nine-chapter-count-hardcore', chapterCountHardcore, 30000, 0x33012202),
    trial('nine-chapter-page-permutation', chapterPagePermutation, 100000, 0x33012277),
    trial('whole-book-page-permutation', wholeBookPagePermutation, 100000, 0x33012277)
  ]
};
console.log(JSON.stringify(output, null, 2));
