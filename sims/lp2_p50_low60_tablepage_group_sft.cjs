'use strict';

const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

const TABLE_PAGES = [
  {name: 'p49', first: 0, last: 79},
  {name: 'p50', first: 80, last: 183},
  {name: 'p51', first: 184, last: 255},
];

/** @param {number} n @param {number} k @returns {number} */
function logChoose(n, k) {
  if (k < 0 || k > n) return -Infinity;
  const m = Math.min(k, n - k);
  let value = 0;
  for (let i = 1; i <= m; i += 1) {
    value += Math.log(n - m + i) - Math.log(i);
  }
  return value;
}

/**
 * @param {number} population
 * @param {number} groupSize
 * @param {number} draws
 * @param {number} threshold
 * @returns {number}
 */
function hypergeomUpperTail(population, groupSize, draws, threshold) {
  let total = 0;
  const max = Math.min(groupSize, draws);
  for (let hits = threshold; hits <= max; hits += 1) {
    total += Math.exp(
      logChoose(groupSize, hits) +
      logChoose(population - groupSize, draws - hits) -
      logChoose(population, draws)
    );
  }
  return total;
}

function main() {
  const stats = TABLE_PAGES.map((group) => ({
    ...group,
    lowCells: 0,
    lowOpp: 0,
    lowHits: 0,
    otherOpp: 0,
    otherHits: 0,
  }));

  for (let phase = 0; phase < 256; phase += 1) {
    if (grid.bytes[phase] >= 60) continue;
    const group = stats.find((item) => item.first <= phase && phase <= item.last);
    assert.ok(group);
    group.lowCells += 1;
  }

  let globalRune = 0;
  for (const page of corpus.pages.filter((item) => item.page <= 55)) {
    for (let local = 0; local + 1 < page.indices.length; local += 1) {
      const phase = (globalRune + local) & 255;
      const group = stats.find((item) => item.first <= phase && phase <= item.last);
      assert.ok(group);
      const repeat = page.indices[local] === page.indices[local + 1];
      if (grid.bytes[phase] < 60) {
        group.lowOpp += 1;
        group.lowHits += Number(repeat);
      } else {
        group.otherOpp += 1;
        group.otherHits += Number(repeat);
      }
    }
    globalRune += page.indices.length;
  }

  assert.equal(globalRune, 12956);
  assert.deepEqual(stats.map((s) => [s.lowCells, s.lowOpp, s.lowHits, s.otherOpp, s.otherHits]), [
    [15, 764, 7, 3308, 17],
    [26, 1316, 12, 3929, 21],
    [19, 945, 14, 2639, 15],
  ]);

  const totalLowOpp = stats.reduce((sum, s) => sum + s.lowOpp, 0);
  const totalLowHits = stats.reduce((sum, s) => sum + s.lowHits, 0);
  assert.equal(totalLowOpp, 3025);
  assert.equal(totalLowHits, 33);

  const p51Tail = hypergeomUpperTail(totalLowOpp, stats[2].lowOpp, totalLowHits, stats[2].lowHits);
  assert.ok(Math.abs(p51Tail - 0.11558984548460091) < 1e-12);

  console.log(JSON.stringify({
    status: 'PASS',
    frozenClock: 'global row-major phase zero',
    tablePageGroups: stats.map((s) => ({
      page: s.name,
      lowCells: s.lowCells,
      lowOpportunities: s.lowOpp,
      lowRepeatHits: s.lowHits,
      lowRepeatRate: s.lowHits / s.lowOpp,
      otherOpportunities: s.otherOpp,
      otherRepeatHits: s.otherHits,
      otherRepeatRate: s.otherHits / s.otherOpp,
      rateRatio: (s.lowHits / s.lowOpp) / (s.otherHits / s.otherOpp),
    })),
    p51LowHitConditionalUpperTail: p51Tail,
    decision: 'All three printed table pages retain positive low60 enrichment; the busiest cells being on p51 does not source-select p51 as a separate receiver.',
  }, null, 2));
}

main();
