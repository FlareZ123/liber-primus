'use strict';

const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

const TRIALS = 200000;
const SEED = 0x2560A;

/** @param {number} seed @returns {() => number} */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {() => number} next @param {number} bound @returns {number} */
function randomInt(next, bound) {
  const limit = 0x100000000 - (0x100000000 % bound);
  let value;
  do value = next(); while (value >= limit);
  return value % bound;
}

function main() {
  const lowOpportunityValues = [];
  const lowRepeatValues = [];
  let globalRune = 0;

  for (const page of corpus.pages.filter((item) => item.page <= 55)) {
    for (let local = 0; local + 1 < page.indices.length; local += 1) {
      const phase = (globalRune + local) & 255;
      const value = grid.bytes[phase];
      if (value >= 60) continue;
      lowOpportunityValues.push(value);
      if (page.indices[local] === page.indices[local + 1]) {
        lowRepeatValues.push(value);
      }
    }
    globalRune += page.indices.length;
  }

  assert.equal(globalRune, 12956);
  assert.equal(lowOpportunityValues.length, 3025);
  assert.equal(lowRepeatValues.length, 33);

  const observedSum = lowRepeatValues.reduce((a, b) => a + b, 0);
  const opportunitySum = lowOpportunityValues.reduce((a, b) => a + b, 0);
  assert.equal(observedSum, 1010);

  const next = xorshift32(SEED);
  let lowerOrEqual = 0;

  for (let trial = 0; trial < TRIALS; trial += 1) {
    const chosen = new Set();
    let sum = 0;
    while (chosen.size < lowRepeatValues.length) {
      const index = randomInt(next, lowOpportunityValues.length);
      if (chosen.has(index)) continue;
      chosen.add(index);
      sum += lowOpportunityValues[index];
    }
    lowerOrEqual += Number(sum <= observedSum);
  }

  console.log(JSON.stringify({
    status: 'PASS',
    test: 'Within the frozen low60 class, compare the mean raw value at 33 repeat events with 33 fixed-opportunity samples.',
    source: {
      lowOpportunities: lowOpportunityValues.length,
      lowRepeats: lowRepeatValues.length,
      opportunityMean: opportunitySum / lowOpportunityValues.length,
      repeatMean: observedSum / lowRepeatValues.length,
      repeatValues: lowRepeatValues,
    },
    matchedNull: {
      trials: TRIALS,
      seed: `0x${SEED.toString(16)}`,
      fixed: 'all 3025 low-class opportunity values; sample 33 distinct opportunity slots',
      lowerOrEqual,
      lowerOrEqualRate: lowerOrEqual / TRIALS,
    },
    decision: 'The low60 enrichment is not strongly explained by a monotone preference for smaller raw values within 0..59.',
  }, null, 2));
}

main();
