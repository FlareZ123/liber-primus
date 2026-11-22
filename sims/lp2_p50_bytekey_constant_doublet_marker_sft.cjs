'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const mod29 = (value) => (value % 29 + 29) % 29;
const corpus = read('resources/liber-primus/lp2-corpus.json');
const bytes = read('resources/liber-primus/lp2-grid-256.json').bytes;
const pages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length > 0);

assert.equal(bytes.length, 256);
assert.equal(
  crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290',
);

const values = [];
const events = [];
const pageRanges = [];
let start = 0;
for (const page of pages) {
  for (let local = 0; local < page.indices.length; local++) {
    const value = page.indices[local];
    values.push(value);
    if (local > 0 && value === page.indices[local - 1]) {
      events.push({ global: start + local, page: page.page, local, value });
    }
  }
  pageRanges.push([start, start + page.indices.length]);
  start += page.indices.length;
}
assert.deepEqual([pages.length, values.length, events.length], [55, 12956, 86]);
assert.deepEqual(
  events.slice(0, 5).map((e) => e.global),
  [122, 207, 456, 653, 782],
);

/**
 * For C_i = P_i + f(B_(i+phase) mod 29), any event with
 * C_i=C_(i-1) and a fixed (unknown) plaintext P_i=R fixes
 * one f(B_(i+phase)) value. Count the minimum unavoidable
 * violations over every possible arbitrary stationary function f.
 *
 * @param {{global:number,value:number}[]} observed
 * @param {number} phase
 * @param {boolean} byPosition
 * @returns {{groups:number, fit:number, violations:number, distinctOutputs:number}}
 */
function score(observed, phase, byPosition = false) {
  const groups = new Map();
  for (const event of observed) {
    const index = (event.global + phase) % 256;
    const selector = byPosition ? index : bytes[index];
    const counts = groups.get(selector) || new Map();
    counts.set(event.value, (counts.get(event.value) || 0) + 1);
    groups.set(selector, counts);
  }
  let fit = 0;
  let distinctOutputs = 0;
  for (const counts of groups.values()) {
    fit += Math.max(...counts.values());
    distinctOutputs += counts.size;
  }
  return {
    groups: groups.size,
    fit,
    violations: observed.length - fit,
    distinctOutputs,
  };
}

// This two-event contradiction alone already rules out the natural source phase.
const [left, right] = [events.find((e) => e.global === 653), events.find((e) => e.global === 909)];
assert.deepEqual([left.value, right.value], [11, 25]);
assert.equal(bytes[left.global % 256], 46);
assert.equal(bytes[right.global % 256], 46);
assert.equal(left.global % 256, right.global % 256);
assert.notEqual(left.value, right.value);

const sourcePhase = score(events, 0);
const sourcePosition = score(events, 0, true);
assert.deepEqual(sourcePhase, { groups: 59, fit: 62, violations: 24, distinctOutputs: 83 });
assert.deepEqual(sourcePosition, { groups: 66, fit: 68, violations: 18, distinctOutputs: 84 });

const shifts = Array.from({ length: 256 }, (_, phase) => ({ phase, ...score(events, phase) }));
const bestFit = Math.max(...shifts.map((x) => x.fit));
const worstFit = Math.min(...shifts.map((x) => x.fit));
const phaseRank = 1 + shifts.filter((x) => x.fit > sourcePhase.fit).length;
assert.equal(bestFit, 66);
assert.equal(worstFit, 54);
assert.equal(phaseRank, 61);
assert.ok(shifts.every((x) => x.violations >= 20));

/**
 * Build an exact source-shaped positive. The secret byte function and a
 * plaintext marker R are chosen independently of the original glyph values.
 * All 86 original event sites are then forced to carry R under that function.
 * Other glyphs are adjusted to prevent accidental extra repeat events.
 */
const marker = 10;
const secret = (byte) => (17 * byte + 5) % 29;
const originalSites = new Set(events.map((e) => e.global));
const forced = new Map();
for (const event of events) {
  const encoded = mod29(marker + secret(bytes[event.global % 256]));
  for (const at of [event.global - 1, event.global]) {
    assert.ok(!forced.has(at) || forced.get(at) === encoded);
    forced.set(at, encoded);
  }
}
const plantedCipher = values.map((value, index) => (
  forced.has(index) ? forced.get(index) : mod29(value + 7 * index + 12)
));
let adjustments = 0;
for (const [first, end] of pageRanges) {
  for (let at = first + 1; at < end; at++) {
    if (originalSites.has(at) || plantedCipher[at] !== plantedCipher[at - 1]) continue;
    adjustments++;
    if (!forced.has(at)) {
      plantedCipher[at] = mod29(plantedCipher[at] + 1);
    } else {
      assert.ok(!forced.has(at - 1));
      let alternative = mod29(plantedCipher[at - 1] + 1);
      while (
        alternative === plantedCipher[at] ||
        (at - 2 >= first && alternative === plantedCipher[at - 2])
      ) alternative = mod29(alternative + 1);
      plantedCipher[at - 1] = alternative;
    }
  }
}

const plantedEvents = [];
for (const [first, end] of pageRanges) {
  for (let at = first + 1; at < end; at++) {
    if (plantedCipher[at] === plantedCipher[at - 1]) {
      plantedEvents.push({ global: at, value: plantedCipher[at] });
    }
  }
}
assert.deepEqual(plantedEvents.map((e) => e.global), events.map((e) => e.global));
assert.deepEqual(score(plantedEvents, 0), {
  groups: 59, fit: 86, violations: 0, distinctOutputs: 59,
});
const plantedPlaintext = plantedCipher.map((value, index) => (
  mod29(value - secret(bytes[index % 256]))
));
for (const event of events) assert.equal(plantedPlaintext[event.global], marker);
assert.deepEqual(
  plantedPlaintext.map((value, index) => mod29(value + secret(bytes[index % 256]))),
  plantedCipher,
);
assert.equal(adjustments, 434);

console.log(JSON.stringify({
  source: 'unchanged original GP29 LP2 p0-p55 and 256 radix60 table bytes',
  doubletSites: events.length,
  sourcePhase,
  sourcePosition,
  all256Rotations: {
    minimumUnavoidableMarkerViolations: events.length - bestFit,
    maximumUnavoidableMarkerViolations: events.length - worstFit,
    sourcePhaseRankByLeastViolations: phaseRank,
  },
  certificate: {
    first: { global: left.global, page: left.page, local: left.local, glyph: left.value },
    second: { global: right.global, page: right.page, local: right.local, glyph: right.value },
    sharedByte: 46,
  },
  positive: {
    originalSitesPreserved: plantedEvents.length,
    fullInvertibleRoundTripRunes: plantedCipher.length,
    markerRecoveries: events.length,
    unavoidableViolations: 0,
    adjustments,
  },
  interpretation: 'Exact exclusion of a stationary byte-to-key additive cipher with all doublets representing one fixed plaintext marker. No unknown LP2 plaintext/key recovered.',
}, null, 2));
