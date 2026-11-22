'use strict';

const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

const pages = corpus.pages.filter((page) => page.page <= 55);
const tokens = grid.pages.flatMap((page) => page.tokens);
const low = tokens.map((token) => token[0] === '0');
const chapters = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];

const counts = Array.from({ length: 9 }, () =>
  Array.from({ length: 4 }, () => ({ opportunities: 0, hits: 0 }))
);

let global = 0;
for (const page of pages) {
  const chapter = chapters.findIndex(
    ([first, last]) => first <= page.page && page.page <= last
  );
  assert.ok(chapter >= 0);

  for (let index = 0; index + 1 < page.indices.length; index++) {
    const predecessorLow = Number(low[(global + index) & 255]);
    const successorLow = Number(low[(global + index + 1) & 255]);
    const category = predecessorLow * 2 + successorLow;
    counts[chapter][category].opportunities++;
    counts[chapter][category].hits += Number(
      page.indices[index] === page.indices[index + 1]
    );
  }
  global += page.indices.length;
}
assert.equal(global, 12956);

function sumCategory(category) {
  return counts.reduce((out, chapter) => {
    out.opportunities += chapter[category].opportunities;
    out.hits += chapter[category].hits;
    return out;
  }, { opportunities: 0, hits: 0 });
}

const highHigh = sumCategory(0);
const highLow = sumCategory(1);
const lowHigh = sumCategory(2);
const lowLow = sumCategory(3);

assert.deepEqual(highHigh, { opportunities: 7556, hits: 42 });
assert.deepEqual(highLow, { opportunities: 2320, hits: 11 });
assert.deepEqual(lowHigh, { opportunities: 2318, hits: 29 });
assert.deepEqual(lowLow, { opportunities: 707, hits: 4 });
assert.equal(
  highHigh.opportunities + highLow.opportunities +
  lowHigh.opportunities + lowLow.opportunities,
  12901
);
assert.equal(
  highHigh.hits + highLow.hits + lowHigh.hits + lowLow.hits,
  86
);

function choose(n, k) {
  let out = 1;
  const m = Math.min(k, n - k);
  for (let i = 1; i <= m; i++) out = out * (n - m + i) / i;
  return out;
}

const exclusiveEvents = lowHigh.hits + highLow.hits;
const predecessorOnlyEvents = lowHigh.hits;
let oneSidedP = 0;
for (let k = predecessorOnlyEvents; k <= exclusiveEvents; k++) {
  oneSidedP += choose(exclusiveEvents, k) / 2 ** exclusiveEvents;
}

assert.equal(exclusiveEvents, 40);
assert.equal(predecessorOnlyEvents, 29);
assert.ok(Math.abs(oneSidedP - 0.003213288047845708) < 1e-15);

const chapterDirection = counts.map((chapter, index) => ({
  chapter: index,
  predecessorOnlyOpportunities: chapter[2].opportunities,
  predecessorOnlyHits: chapter[2].hits,
  successorOnlyOpportunities: chapter[1].opportunities,
  successorOnlyHits: chapter[1].hits,
  predecessorRateHigher:
    chapter[2].hits * chapter[1].opportunities >
    chapter[1].hits * chapter[2].opportunities
}));
assert.equal(
  chapterDirection.filter((row) => row.predecessorRateHigher).length,
  7
);

console.log(JSON.stringify({
  categories: {
    nonlowToNonlow: highHigh,
    nonlowToLow: highLow,
    lowToNonlow: lowHigh,
    lowToLow: lowLow
  },
  exclusiveDirection: {
    predecessorLowSuccessorNonlowEvents: lowHigh.hits,
    predecessorNonlowSuccessorLowEvents: highLow.hits,
    totalExclusiveEvents: exclusiveEvents,
    oneSidedExactSymmetryP: oneSidedP,
    chaptersWithHigherPredecessorOnlyRate: 7
  },
  decision:
    'predecessor-side low60 status carries the directional repeat signal; a symmetric two-cell transparency mask is unsupported'
}, null, 2));
