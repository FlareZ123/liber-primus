#!/usr/bin/env node
'use strict';

// Exact phase-selection audit for the p50 leading-digit mask against the
// original 86 same-page adjacent-equality sites. Enumerates every circular
// shift of the event set (preserving its complete gap sequence) and every
// phase. This is a selection null, not a decryption attempt.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const readJson = file => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const grid = readJson('resources/liber-primus/lp2-grid-256.json');

const pages = corpus.pages.filter(page => page.page <= 55);
const positions = [];
let N = 0;
for (const page of pages) {
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

const masks = [];
for (const digit of '01234') {
  masks.push({ name: 'lead' + digit, bits: tokens.map(token => token[0] === digit) });
}
masks.push({ name: 'even', bits: values.map(value => value % 2 === 0) });
masks.push({ name: 'lt128', bits: values.map(value => value < 128) });
masks.push({ name: 'mod3', bits: values.map(value => value % 3 === 0) });
for (let bit = 0; bit < 8; bit++) {
  masks.push({ name: 'bit' + bit, bits: values.map(value => ((value >> bit) & 1) === 1) });
}
const isPrime = value => {
  if (value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor++) {
    if (value % divisor === 0) return false;
  }
  return true;
};
masks.push({ name: 'prime', bits: values.map(isPrime) });
assert.equal(masks.length, 17);

const eventCount = positions.length;
const maskStats = masks.map(({ name, bits }) => {
  const ones = bits.reduce((sum, bit) => sum + (bit ? 1 : 0), 0);
  const probability = ones / 256;
  return {
    name,
    bits,
    ones,
    probability,
    sd: Math.sqrt(eventCount * probability * (1 - probability))
  };
});
assert.equal(maskStats[0].ones, 60);

const zFromHits = (maskIndex, hits) => {
  const stats = maskStats[maskIndex];
  return (hits - eventCount * stats.probability) / stats.sd;
};

// corr[mask][t] is the hit count at phase t for the current circular shift.
// Initially all sites are unwrapped. As the shift advances, a site crossing
// the end of the N-rune tape moves from residue r to r-(N mod 256).
const corr = new Int16Array(maskStats.length * 256);
for (let maskIndex = 0; maskIndex < maskStats.length; maskIndex++) {
  const bits = maskStats[maskIndex].bits;
  const base = maskIndex * 256;
  for (const position of positions) {
    for (let t = 0; t < 256; t++) {
      if (bits[(position + t) & 255]) corr[base + t]++;
    }
  }
}
const z = (maskIndex, phase) => zFromHits(maskIndex, corr[maskIndex * 256 + phase]);

// External zero-based convention: phase 255 reads the predecessor rune.
// The original local SFT labels the same physical alignment phase zero.
const PREDECESSOR_PHASE = 255;
const observedFixedPredecessor = z(0, PREDECESSOR_PHASE);
let observedMaxPhase = -Infinity;
let observedMaxFamily = -Infinity;
for (let phase = 0; phase < 256; phase++) {
  observedMaxPhase = Math.max(observedMaxPhase, z(0, phase));
  for (let maskIndex = 0; maskIndex < maskStats.length; maskIndex++) {
    observedMaxFamily = Math.max(observedMaxFamily, Math.abs(z(maskIndex, phase)));
  }
}
assert.ok(Math.abs(observedFixedPredecessor - 3.2694817866595507) < 1e-12);
assert.ok(Math.abs(observedMaxPhase - 3.2694817866595507) < 1e-12);
assert.ok(Math.abs(observedMaxFamily - 4.500184974984228) < 1e-12);

const sortedPositions = positions.slice().sort((a, b) => a - b);
const Nmod256 = N % 256;
let moveIndex = sortedPositions.length - 1;
let fixedPredecessorGe = 0;
let maxPhaseGe = 0;
let maxFamilyGe = 0;
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
  let maxFamily = -Infinity;
  for (let phase = 0; phase < 256; phase++) {
    maxPhase = Math.max(maxPhase, z(0, phase));
    for (let maskIndex = 0; maskIndex < maskStats.length; maskIndex++) {
      maxFamily = Math.max(maxFamily, Math.abs(z(maskIndex, phase)));
    }
  }
  const fixedPredecessor = z(0, (shift + PREDECESSOR_PHASE) & 255);
  if (fixedPredecessor >= observedFixedPredecessor - 1e-12) fixedPredecessorGe++;
  if (maxPhase >= observedMaxPhase - 1e-12) maxPhaseGe++;
  if (maxFamily >= observedMaxFamily - 1e-12) maxFamilyGe++;
  if (verificationShifts.has(shift)) snapshots.set(shift, { fixedPredecessor, maxPhase, maxFamily });
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
  let directMaxFamily = -Infinity;
  for (let phase = 0; phase < 256; phase++) {
    directMaxPhase = Math.max(directMaxPhase, directZ(shift, 0, phase));
    for (let maskIndex = 0; maskIndex < maskStats.length; maskIndex++) {
      directMaxFamily = Math.max(directMaxFamily, Math.abs(directZ(shift, maskIndex, phase)));
    }
  }
  assert.ok(Math.abs(snap.fixedPredecessor - directZ(shift, 0, PREDECESSOR_PHASE)) < 1e-12);
  assert.ok(Math.abs(snap.maxPhase - directMaxPhase) < 1e-12);
  assert.ok(Math.abs(snap.maxFamily - directMaxFamily) < 1e-12);
  return { shift, status: 'PASS' };
});

assert.equal(fixedPredecessorGe, 32);
assert.equal(maxPhaseGe, 6066);
assert.equal(maxFamilyGe, 6597);

console.log(JSON.stringify({
  source: {
    physical_pages: 'p0-p55',
    rune_count: N,
    same_page_adjacent_equalities: eventCount,
    first_event_positions: positions.slice(0, 10),
    last_event_positions: positions.slice(-10),
    p50_table_tokens: tokens.length,
    leading_zero_cells: maskStats[0].ones,
    tested_masks: maskStats.map(({ name, ones }) => ({ name, ones }))
  },
  observed: {
    local_phase_zero_equals_external_predecessor_phase_255: true,
    fixed_predecessor_z: observedFixedPredecessor,
    max_phase_z: observedMaxPhase,
    max_family_abs_z: observedMaxFamily
  },
  exact_circular_shift_null: {
    shifts: N,
    fixed_predecessor_ge: fixedPredecessorGe,
    fixed_predecessor_p_if_preselected: fixedPredecessorGe / N,
    max_phase_ge: maxPhaseGe,
    max_phase_p: maxPhaseGe / N,
    max_family_ge: maxFamilyGe,
    max_family_p: maxFamilyGe / N,
    null_preserves: 'all 86 event gaps by circularly shifting the complete event set'
  },
  direct_update_checks: directChecks
}, null, 2));
