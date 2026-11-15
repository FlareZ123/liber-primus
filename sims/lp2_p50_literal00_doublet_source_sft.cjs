'use strict';

/**
 * LP2 source-visible p49–51 literal 00 table cells and original adjacent
 * ciphertext doublets, with exact per-page opportunity/event-conditioned
 * randomization. This checks one finite source hypothesis, not a decoder.
 *
 * Run from repo root: node sims/lp2_p50_literal00_doublet_source_sft.cjs
 */
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const path = require('node:path');

/** @param {string} file @returns {any} */
const json = file => JSON.parse(readFileSync(path.join(__dirname, '..', file), 'utf8'));
const corpus = json('resources/liber-primus/lp2-corpus.json');
const grid = json('resources/liber-primus/lp2-grid-256.json');
const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
const zeroPhases = tokens.flatMap((t, i) => t === '00' ? [i] : []);
assert.deepEqual(zeroPhases, [192, 229]);
const types = [...new Set(tokens)].sort();
const id = new Map(types.map((t, i) => [t, i]));
const typeAt = tokens.map(t => id.get(t));
const zeroId = id.get('00');
const original = new Uint16Array(types.length);
const opportunity = new Uint16Array(types.length);
const phaseCount = new Uint16Array(256);
const phaseExposure = new Uint16Array(256);
const pages = [];
const actualPhaseEvents = [];
let pointer = 0;
let allEvents = 0;
let allPairs = 0;
let literalZeroEvents = 0;
let leadingZeroEvents = 0;
let leadingZeroPairs = 0;

for (const page of corpus.pages.filter(p => p.page <= 55)) {
  const size = Math.max(0, page.indices.length - 1);
  const localCount = new Uint16Array(types.length);
  let events = 0;
  for (let i = 0; i < size; i++) {
    const phase = (pointer + i) % 256;
    const token = tokens[phase];
    const tid = typeAt[phase];
    const equal = page.indices[i] === page.indices[i + 1];
    opportunity[tid]++;
    localCount[tid]++;
    phaseExposure[phase]++;
    leadingZeroPairs += Number(token[0] === '0');
    if (equal) {
      original[tid]++;
      phaseCount[phase]++;
      actualPhaseEvents.push(phase);
      events++;
      allEvents++;
      literalZeroEvents += Number(token === '00');
      leadingZeroEvents += Number(token[0] === '0');
    }
  }
  pages.push({start: pointer, size, events, localCount});
  allPairs += size;
  pointer += page.indices.length;
}
assert.equal(pointer, 12956);
assert.equal(allPairs, 12901);
assert.equal(allEvents, 86);
assert.equal(literalZeroEvents, 5);
assert.equal(opportunity[zeroId], 100);
assert.equal(leadingZeroPairs, 3025);
assert.equal(leadingZeroEvents, 33);
assert.equal(phaseCount[192], 4);
assert.equal(phaseCount[229], 1);
assert.equal(types.length, 161);

// The same event-to-table linkage is tested with all 256 cyclic phases.
// The two ties at zero and 37 demonstrate that phase zero is not unique.
const zeroShiftCounts = Array.from({length: 256}, (_, shift) =>
  actualPhaseEvents.filter(phase => tokens[(phase + shift) % 256] === '00').length);
assert.equal(Math.max(...zeroShiftCounts), 5);
assert.deepEqual(zeroShiftCounts.flatMap((n, i) => n === 5 ? [i] : []), [0, 37]);

// Normalization conditions on the exact number of doublets on every page.
// Every table symbol is a separate potential retrospectively selected mask.
const expectation = Array(types.length).fill(0);
const variance = Array(types.length).fill(0);
for (const page of pages) {
  if (page.size === 0) continue;
  for (let j = 0; j < types.length; j++) {
    const fraction = page.localCount[j] / page.size;
    expectation[j] += page.events * fraction;
    if (page.size > 1) {
      variance[j] += page.events * fraction * (1 - fraction) *
        (page.size - page.events) / (page.size - 1);
    }
  }
}
/** @param {number} j @param {number} n @returns {number} */
const score = (j, n) => (n - expectation[j]) / Math.sqrt(variance[j]);
const realZ = score(zeroId, original[zeroId]);
const rankings = types.map((token, j) => ({
  token, events: original[j], opportunities: opportunity[j],
  expected: expectation[j], z: score(j, original[j])
})).sort((a, b) => b.z - a.z);
assert.equal(rankings[0].token, '00');

/** @type {number} */ let seed = 0x33015050;
/** @returns {number} */
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}

const trials = 70000;
let fixedHits = 0;
let anyTokenHits = 0;
let maxPhaseHits = 0;
for (let trial = 0; trial < trials; trial++) {
  const sample = new Uint16Array(types.length);
  const phases = new Uint8Array(256);
  for (const page of pages) {
    const chosen = new Set();
    while (chosen.size < page.events) {
      const local = Math.floor(random() * page.size);
      if (!chosen.has(local)) {
        chosen.add(local);
        const phase = (page.start + local) % 256;
        sample[typeAt[phase]]++;
        phases[phase]++;
      }
    }
  }
  if (sample[zeroId] >= original[zeroId]) fixedHits++;
  if (phases.some(n => n >= phaseCount[192])) maxPhaseHits++;
  if (types.some((_, j) => score(j, sample[j]) >= realZ)) anyTokenHits++;
}

console.log(JSON.stringify({
  source: 'Original physical LP2 pp0-55, printed-order 256 table cells',
  opportunityPairs: allPairs,
  observedDoublets: allEvents,
  leadingZero: {opportunities: leadingZeroPairs, events: leadingZeroEvents},
  literal00: {
    positions: zeroPhases,
    opportunities: opportunity[zeroId],
    events: original[zeroId],
    eventsAt192: phaseCount[192],
    eventsAt229: phaseCount[229],
    expectedUnderPageMatchedNull: expectation[zeroId],
    nullStd: Math.sqrt(variance[zeroId]),
    z: realZ,
    phaseShiftsTiedAtFive: [0, 37],
    fixedOneSidedMonteCarlo: (fixedHits + 1) / (trials + 1),
    maxOf161TokenMasksMonteCarlo: (anyTokenHits + 1) / (trials + 1),
    maxOf256SinglePhasesMonteCarlo: (maxPhaseHits + 1) / (trials + 1)
  },
  rankedTokens: rankings.slice(0, 5),
  nullTrials: trials,
  discoveredCipherOrPlaintext: false
}, null, 2));
