#!/usr/bin/env node
'use strict';

// Exact phase-selection audit for the p49-p51 256-token panel against the
// original 86 same-page adjacent-equality sites. Enumerates every circular
// shift of the event set (preserving its complete gap sequence) and every
// phase. Raw prefix masks are independent of the provisional base60 value map.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const readJson = file => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const grid = readJson('resources/liber-primus/lp2-grid-256.json');

const positions = [];
let N = 0;
for (const page of corpus.pages.filter(page => page.page <= 55)) {
  for (let i = 1; i < page.indices.length; i++) {
    if (page.indices[i] === page.indices[i - 1]) positions.push(N + i);
  }
  N += page.indices.length;
}
assert.equal(N, 12956);
assert.equal(positions.length, 86);

const tokens = grid.pages.flatMap(page => page.tokens);
const values = grid.pages.flatMap(page => page.bytes);
assert.equal(tokens.length, 256);
assert.equal(values.length, 256);
assert.equal(grid.alphabet, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');

const masks = [];
for (const digit of '01234') {
  masks.push({ name: 'prefix' + digit, bits: tokens.map(token => token[0] === digit) });
}
masks.push({ name: 'even_base60', bits: values.map(value => value % 2 === 0) });
masks.push({ name: 'lt128_base60', bits: values.map(value => value < 128) });
masks.push({ name: 'mod3_base60', bits: values.map(value => value % 3 === 0) });
for (let bit = 0; bit < 8; bit++) {
  masks.push({ name: 'bit' + bit + '_base60', bits: values.map(value => ((value >> bit) & 1) === 1) });
}
const isPrime = value => {
  if (value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor++) {
    if (value % divisor === 0) return false;
  }
  return true;
};
masks.push({ name: 'prime_base60', bits: values.map(isPrime) });
assert.equal(masks.length, 17);

const eventCount = positions.length;
const maskStats = masks.map(({ name, bits }) => {
  const ones = bits.reduce((sum, bit) => sum + (bit ? 1 : 0), 0);
  const probability = ones / 256;
  return { name, bits, ones, probability, sd: Math.sqrt(eventCount * probability * (1 - probability)) };
});
assert.equal(maskStats[0].ones, 60);

const zFromHits = (maskIndex, hits) => {
  const stats = maskStats[maskIndex];
  return (hits - eventCount * stats.probability) / stats.sd;
};
const corr = new Int16Array(maskStats.length * 256);
for (let maskIndex = 0; maskIndex < maskStats.length; maskIndex++) {
  const bits = maskStats[maskIndex].bits;
  const base = maskIndex * 256;
  for (const position of positions) {
    for (let t = 0; t < 256; t++) if (bits[(position + t) & 255]) corr[base + t]++;
  }
}
const z = (maskIndex, phase) => zFromHits(maskIndex, corr[maskIndex * 256 + phase]);

// Local phase zero indexes the first rune of the adjacent pair. With
// zero-based second-rune positions this is external phase255 (predecessor).
const PREDECESSOR_PHASE = 255;
// Diagnostic only: the p0 13-dot marker is a layout delimiter, not a cipher
// initial state (see the original-image adjudication). If one hypothetically
// aligned table index zero to the first black p0 rune, predecessor indexing
// would give phase242; this is not a source-authenticated clock.
const OFFSET13_PHASE = 242;

const observedFixedPredecessor = z(0, PREDECESSOR_PHASE);
const observedOffset13Lead0 = z(0, OFFSET13_PHASE);
let observedMaxPhase = -Infinity;
let observedMaxPrefixFamily = -Infinity;
let observedMaxFamily = -Infinity;
let maxPrefixDetail = null;
for (let phase = 0; phase < 256; phase++) {
  observedMaxPhase = Math.max(observedMaxPhase, z(0, phase));
  for (let maskIndex = 0; maskIndex < 5; maskIndex++) {
    const value = z(maskIndex, phase);
    if (Math.abs(value) > observedMaxPrefixFamily) {
      observedMaxPrefixFamily = Math.abs(value);
      maxPrefixDetail = {
        prefix: maskStats[maskIndex].name,
        phase,
        hits: corr[maskIndex * 256 + phase],
        z: value
      };
    }
  }
  for (let maskIndex = 0; maskIndex < maskStats.length; maskIndex++) {
    observedMaxFamily = Math.max(observedMaxFamily, Math.abs(z(maskIndex, phase)));
  }
}
assert.ok(Math.abs(observedFixedPredecessor - 3.2694817866595507) < 1e-12);
assert.ok(Math.abs(observedOffset13Lead0 - 2.251249016118377) < 1e-12);
assert.ok(Math.abs(observedMaxPhase - 3.2694817866595507) < 1e-12);
assert.ok(Math.abs(observedMaxPrefixFamily - 4.500184974984228) < 1e-12);
assert.ok(Math.abs(observedMaxFamily - 4.500184974984228) < 1e-12);
assert.equal(maxPrefixDetail.prefix, 'prefix2');
assert.equal(maxPrefixDetail.phase, 194);
assert.equal(maxPrefixDetail.hits, 40);

const sortedPositions = positions.slice().sort((a, b) => a - b);
const Nmod256 = N % 256;
let moveIndex = sortedPositions.length - 1;
let fixedPredecessorGe = 0;
let maxPhaseGe = 0;
let maxPrefixFamilyGe = 0;
let maxFamilyGe = 0;
let offset13Lead0Ge = 0;
let offset13PrefixPositiveGe = 0;
let offset13PrefixAbsGe = 0;
const verificationShifts = new Set([0, 1, 123, 5000, N - 1]);
const snapshots = new Map();

for (let shift = 0; shift < N; shift++) {
  if (shift > 0) {
    const wrapThreshold = N - shift;
    while (moveIndex >= 0 && sortedPositions[moveIndex] >= wrapThreshold) {
      const residue = sortedPositions[moveIndex] & 255;
      for (let maskIndex = 0; maskIndex < maskStats.length; maskIndex++) {
        const bits = maskStats[maskIndex].bits;
        const base = maskIndex * 256;
        for (let t = 0; t < 256; t++) {
          const oldHit = bits[(residue + t) & 255] ? 1 : 0;
          const newHit = bits[(residue - Nmod256 + t + 512) & 255] ? 1 : 0;
          corr[base + t] += newHit - oldHit;
        }
      }
      moveIndex--;
    }
  }

  let maxPhase = -Infinity;
  let maxPrefixFamily = -Infinity;
  let maxFamily = -Infinity;
  for (let phase = 0; phase < 256; phase++) {
    maxPhase = Math.max(maxPhase, z(0, phase));
    for (let maskIndex = 0; maskIndex < 5; maskIndex++) {
      maxPrefixFamily = Math.max(maxPrefixFamily, Math.abs(z(maskIndex, phase)));
    }
    for (let maskIndex = 0; maskIndex < maskStats.length; maskIndex++) {
      maxFamily = Math.max(maxFamily, Math.abs(z(maskIndex, phase)));
    }
  }

  const fixedPredecessor = z(0, (shift + PREDECESSOR_PHASE) & 255);
  const offset13Lead0 = z(0, (shift + OFFSET13_PHASE) & 255);
  let offset13PrefixPositive = -Infinity;
  let offset13PrefixAbs = -Infinity;
  for (let maskIndex = 0; maskIndex < 5; maskIndex++) {
    const value = z(maskIndex, (shift + OFFSET13_PHASE) & 255);
    offset13PrefixPositive = Math.max(offset13PrefixPositive, value);
    offset13PrefixAbs = Math.max(offset13PrefixAbs, Math.abs(value));
  }

  if (fixedPredecessor >= observedFixedPredecessor - 1e-12) fixedPredecessorGe++;
  if (maxPhase >= observedMaxPhase - 1e-12) maxPhaseGe++;
  if (maxPrefixFamily >= observedMaxPrefixFamily - 1e-12) maxPrefixFamilyGe++;
  if (maxFamily >= observedMaxFamily - 1e-12) maxFamilyGe++;
  if (offset13Lead0 >= observedOffset13Lead0 - 1e-12) offset13Lead0Ge++;
  if (offset13PrefixPositive >= 2.251249016118377 - 1e-12) offset13PrefixPositiveGe++;
  if (offset13PrefixAbs >= 2.251249016118377 - 1e-12) offset13PrefixAbsGe++;
  if (verificationShifts.has(shift)) snapshots.set(shift, {
    fixedPredecessor, maxPhase, maxPrefixFamily, maxFamily,
    offset13Lead0, offset13PrefixPositive, offset13PrefixAbs
  });
}

function directZ(shift, maskIndex, phase) {
  let hits = 0;
  const bits = maskStats[maskIndex].bits;
  for (const position of positions) {
    const shifted = (position + shift) % N;
    if (bits[(shifted + phase) & 255]) hits++;
  }
  return zFromHits(maskIndex, hits);
}
const directChecks = [...verificationShifts].sort((a, b) => a - b).map(shift => {
  const snap = snapshots.get(shift);
  let directMaxPhase = -Infinity;
  let directMaxPrefix = -Infinity;
  let directMaxFamily = -Infinity;
  let directOffsetPositive = -Infinity;
  let directOffsetAbs = -Infinity;
  for (let phase = 0; phase < 256; phase++) {
    directMaxPhase = Math.max(directMaxPhase, directZ(shift, 0, phase));
    for (let maskIndex = 0; maskIndex < 5; maskIndex++) {
      directMaxPrefix = Math.max(directMaxPrefix, Math.abs(directZ(shift, maskIndex, phase)));
    }
    for (let maskIndex = 0; maskIndex < maskStats.length; maskIndex++) {
      directMaxFamily = Math.max(directMaxFamily, Math.abs(directZ(shift, maskIndex, phase)));
    }
  }
  for (let maskIndex = 0; maskIndex < 5; maskIndex++) {
    const value = directZ(shift, maskIndex, OFFSET13_PHASE);
    directOffsetPositive = Math.max(directOffsetPositive, value);
    directOffsetAbs = Math.max(directOffsetAbs, Math.abs(value));
  }
  assert.ok(Math.abs(snap.fixedPredecessor - directZ(shift, 0, PREDECESSOR_PHASE)) < 1e-12);
  assert.ok(Math.abs(snap.offset13Lead0 - directZ(shift, 0, OFFSET13_PHASE)) < 1e-12);
  assert.ok(Math.abs(snap.maxPhase - directMaxPhase) < 1e-12);
  assert.ok(Math.abs(snap.maxPrefixFamily - directMaxPrefix) < 1e-12);
  assert.ok(Math.abs(snap.maxFamily - directMaxFamily) < 1e-12);
  assert.ok(Math.abs(snap.offset13PrefixPositive - directOffsetPositive) < 1e-12);
  assert.ok(Math.abs(snap.offset13PrefixAbs - directOffsetAbs) < 1e-12);
  return { shift, status: 'PASS' };
});

assert.equal(fixedPredecessorGe, 32);
assert.equal(maxPhaseGe, 6066);
assert.equal(maxPrefixFamilyGe, 6550);
assert.equal(maxFamilyGe, 6597);
assert.equal(offset13Lead0Ge, 484);
assert.equal(offset13PrefixPositiveGe, 1928);
assert.equal(offset13PrefixAbsGe, 2507);

console.log(JSON.stringify({
  source: {
    physical_pages: 'p49-p51 32x8 panel',
    token_count: tokens.length,
    token_alphabet: grid.alphabet,
    provisional_base60_rule: grid.byte_rule,
    base60_vs_base59: 'numeric interpretation remains a hypothesis; raw prefix masks do not depend on it',
    p0_offset13_status: 'layout delimiter only; not a cipher initial state',
    rune_count: N,
    same_page_adjacent_equalities: eventCount,
    leading_zero_cells: maskStats[0].ones
  },
  observed: {
    predecessor_phase_255_z: observedFixedPredecessor,
    offset13_phase_242_lead0_z: observedOffset13Lead0,
    max_leading_zero_phase_z: observedMaxPhase,
    max_five_raw_prefix_family_abs_z: observedMaxPrefixFamily,
    max_five_prefix_detail: maxPrefixDetail,
    max_17_predicate_family_abs_z: observedMaxFamily
  },
  exact_circular_shift_null: {
    shifts: N,
    predecessor_fixed_if_preselected: { ge: fixedPredecessorGe, p: fixedPredecessorGe / N },
    max_leading_zero_phase: { ge: maxPhaseGe, p: maxPhaseGe / N },
    max_five_raw_prefix_family: { ge: maxPrefixFamilyGe, p: maxPrefixFamilyGe / N },
    max_17_predicate_family: { ge: maxFamilyGe, p: maxFamilyGe / N },
    offset13_diagnostic_prefix0_if_preselected: { ge: offset13Lead0Ge, p: offset13Lead0Ge / N },
    offset13_diagnostic_five_prefix_family_positive: { ge: offset13PrefixPositiveGe, p: offset13PrefixPositiveGe / N },
    offset13_diagnostic_five_prefix_family_absolute: { ge: offset13PrefixAbsGe, p: offset13PrefixAbsGe / N },
    null_preserves: 'all 86 event gaps by circularly shifting the complete event set'
  },
  direct_update_checks: directChecks
}, null, 2));
