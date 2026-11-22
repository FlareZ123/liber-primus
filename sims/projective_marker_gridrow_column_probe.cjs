'use strict';

/**
 * Source-order projective marker -> 32x8 grid row/column test.
 *
 * Uses the exact p3/p39 GF(29^2) projective orbit from
 * gf29_projective_singer_cycle_probe.cjs and the 32 fragment-row mapping
 * from projective_marker_gridrow_nonce_probe.cjs.
 *
 * Tests:
 *  1. Each fragment's mapped 8-byte grid row as a repeating Vigenere key,
 *     with source-derived zero/state/next/delta phases and both directions.
 *  2. Ciphertext-residue addressing: grid column = C mod 8, (C+1) mod 8,
 *     (C+state) mod 8, or (C+1+state) mod 8.
 *  3. A deterministic 500-permutation row-map null. For each random row
 *     permutation, maximize over the same 16 ciphertext-residue variants.
 *
 * No parameters are fitted to LP2. Node.js 22, built-ins only.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');
const grid = read('resources/liber-primus/base60-grid.json');
const referenceText = fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp1-plaintext-reference.txt'),
  'utf8'
);

const C = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
assert.equal(C.length, 12956);
assert.equal(grid.byte_rows.length, 32);
assert(grid.byte_rows.every(row => row.length === 8));

const mod = (x, n) => ((x % n) + n) % n;
function inverse29(x) {
  for (let y = 1; y < 29; y++) if (mod(x * y, 29) === 1) return y;
  throw new Error('noninvertible element');
}

// Reconstruct the 30-state projective orbit from the printed p3/p39 data.
const M0 = [[23, 13], [27, 17]];
function projectiveStep(t) {
  if (t === null) return mod(M0[0][0] * inverse29(M0[1][0]), 29);
  const den = mod(M0[1][0] * t + M0[1][1], 29);
  if (den === 0) return null;
  return mod((M0[0][0] * t + M0[0][1]) * inverse29(den), 29);
}
function projectiveOrbit(start = 24) {
  const out = [];
  let t = start;
  for (let i = 0; i < 30; i++) {
    out.push(t);
    t = projectiveStep(t);
  }
  assert.equal(t, start);
  assert.equal(new Set(out.map(x => x === null ? 'inf' : String(x))).size, 30);
  assert.equal(out[0], 24);
  assert.equal(out[7], 25);
  assert.equal(out[8], 27);
  assert.equal(out[17], null);
  assert.equal(out[26], 28);
  return out;
}
const states30 = projectiveOrbit(24);

// Reconstruct all 256 original ink events and their 32 fragment boundaries.
const events = [];
for (const page of ink.pages) {
  for (const span of page.red_spans || []) {
    for (let i = 0; i < span.length; i++) {
      events.push({ page: page.page, offset: span.start + i, kind: 1 });
    }
  }
  for (const mark of page.large_punctuation || []) {
    if (mark[1] === 13) {
      events.push({ page: page.page, offset: mark[0], kind: 0, color: mark[2] });
    }
  }
}
events.sort((a, b) => a.page - b.page || a.offset - b.offset || a.kind - b.kind);
assert.equal(events.length, 256);
const markerEvents = events.filter(e => e.kind === 0);
assert.equal(markerEvents.length, 31);
assert.equal(events.filter(e => e.kind === 1).length, 225);

const fragmentRows = [];
let stateIndex = 0;
let lastKey = null;
let lastColor = null;
let currentState = null;
for (const e of markerEvents) {
  const key = e.page + ':' + e.offset;
  if (key === lastKey) {
    assert.equal(lastColor, 'black');
    assert.equal(e.color, 'red');
    assert.equal(currentState, 25);
    fragmentRows.push(25); // red layer at the duplicated p7:194 site
  } else {
    const state = states30[stateIndex++];
    currentState = state;
    if (e.color === 'black') {
      assert.equal(state, 25);
      fragmentRows.push(30); // extra black overprint row
    } else {
      fragmentRows.push(state === null ? 29 : state);
    }
  }
  lastKey = key;
  lastColor = e.color;
}
assert.equal(stateIndex, 30);
fragmentRows.push(31); // trailing fragment
assert.deepEqual(fragmentRows, [
  24,22,13,4,2,9,12,30,25,27,15,26,19,20,16,21,
  8,23,29,3,18,5,10,6,7,0,11,28,1,14,17,31
]);

const bounds = [0];
let current = 0;
let redCount = 0;
let eventIndex = 0;
for (const page of corpus.pages) {
  for (let offset = 0; offset <= page.indices.length; offset++) {
    while (
      eventIndex < events.length &&
      events[eventIndex].page === page.page &&
      events[eventIndex].offset === offset
    ) {
      if (events[eventIndex].kind === 0) {
        redCount = 0;
        bounds.push(current);
      } else {
        redCount++;
      }
      eventIndex++;
    }
    if (offset < page.indices.length) current++;
  }
}
assert.equal(eventIndex, events.length);
assert.equal(bounds.length, 32);
assert.equal(bounds[28], C.length);
assert.equal(lengthsFromEvents(events), 225); // source-event accounting

function lengthsFromEvents(sourceEvents) {
  let run = 0;
  let sum = 0;
  for (const e of sourceEvents) {
    if (e.kind === 0) { sum += run; run = 0; }
    else run++;
  }
  return sum + run;
}

// Rows 30 and 29 are the duplicate-overprint and infinity states respectively.
// The duplicate red layer remains state 25; the next unique site is state 27.
function stateForRow(row) {
  if (row === 30) return 25;
  if (row === 29) return null;
  if (row === 31) return undefined;
  return row;
}
const fragmentStates = fragmentRows.slice(0, 28).map(stateForRow);
assert.deepEqual(fragmentStates, [
  24,22,13,4,2,9,12,25,25,27,15,26,19,20,16,21,
  8,23,null,3,18,5,10,6,7,0,11,28
]);

// Build the same held-out-capable GP trigram model used by the projective SFT.
const tokens = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
const reference = [];
for (const word of referenceText.toUpperCase().match(/[A-Z]+/g) || []) {
  let i = 0;
  while (i < word.length) {
    const token = tokens.find(t => word.startsWith(t.s, i));
    if (token) {
      reference.push(token.i);
      i += token.s.length;
    } else {
      i++;
    }
  }
}
const train = reference.slice(0, Math.floor(reference.length * 0.8));
const trigramCounts = new Map();
let trigramTotal = 0;
for (let i = 0; i + 2 < train.length; i++) {
  const k = train[i] * 841 + train[i + 1] * 29 + train[i + 2];
  trigramCounts.set(k, (trigramCounts.get(k) || 0) + 1);
  trigramTotal++;
}
const logp = new Float64Array(29 ** 3);
for (let a = 0; a < 29; a++) {
  for (let b = 0; b < 29; b++) {
    for (let c = 0; c < 29; c++) {
      const k = a * 841 + b * 29 + c;
      logp[k] = Math.log(
        ((trigramCounts.get(k) || 0) + 0.05) /
        (trigramTotal + 0.05 * 29 ** 3)
      );
    }
  }
}
function score(sequence) {
  const freq = new Uint32Array(29);
  let sum = 0;
  for (let i = 0; i < sequence.length; i++) {
    freq[sequence[i]]++;
    if (i > 1) sum += logp[sequence[i - 2] * 841 + sequence[i - 1] * 29 + sequence[i]];
  }
  const n = sequence.length;
  let iocNumerator = 0;
  for (const f of freq) iocNumerator += f * (f - 1);
  const top = Array.from(freq).sort((a, b) => b - a).slice(0, 12).reduce((a, b) => a + b, 0);
  return {
    trigramNatsPerRune: sum / (n - 2),
    ioc: iocNumerator / (n * (n - 1)),
    top12Mass: top / n
  };
}
function decodeRowColumn(rows, columnMode, reduction, sign) {
  const out = new Array(C.length);
  for (let f = 0; f < 28; f++) {
    const row = rows[f];
    const state = fragmentStates[f] === null ? 29 : fragmentStates[f];
    for (let i = bounds[f]; i < bounds[f + 1]; i++) {
      let colValue;
      if (columnMode === 'ciphertext-zero-based') colValue = C[i];
      else if (columnMode === 'ciphertext-one-based') colValue = C[i] + 1;
      else if (columnMode === 'ciphertext-plus-state') colValue = C[i] + state;
      else if (columnMode === 'ciphertext-one-plus-state') colValue = C[i] + 1 + state;
      else throw new Error('unknown column mode');
      const byte = grid.byte_rows[row][mod(colValue, 8)];
      const key = reduction === 'mod29' ? byte % 29 : Math.floor(29 * byte / 256);
      out[i] = mod(C[i] - sign * key, 29);
    }
  }
  return out;
}
const columnModes = [
  'ciphertext-zero-based',
  'ciphertext-one-based',
  'ciphertext-plus-state',
  'ciphertext-one-plus-state'
];
const columnResults = [];
for (const columnMode of columnModes) {
  for (const reduction of ['mod29', 'scale29']) {
    for (const sign of [1, -1]) {
      const decoded = decodeRowColumn(fragmentRows, columnMode, reduction, sign);
      columnResults.push({ columnMode, reduction, sign, ...score(decoded) });
    }
  }
}
columnResults.sort((a, b) => b.trigramNatsPerRune - a.trigramNatsPerRune);
const sourceBest = columnResults[0];

// Repeating 8-symbol row key: 4 source phases × 2 directions × 2 reductions × 2 signs.
const repeatResults = [];
for (const phaseMode of ['zero', 'state', 'next', 'delta']) {
  for (const direction of [1, -1]) {
    for (const reduction of ['mod29', 'scale29']) {
      for (const sign of [1, -1]) {
        const decoded = new Array(C.length);
        for (let f = 0; f < 28; f++) {
          const row = fragmentRows[f];
          const state = fragmentStates[f] === null ? 29 : fragmentStates[f];
          const nextStateRaw = stateForRow(fragmentRows[f + 1]);
          const nextState = nextStateRaw === null ? 29 : nextStateRaw;
          let phase = 0;
          if (phaseMode === 'state') phase = state;
          else if (phaseMode === 'next') phase = nextState;
          else if (phaseMode === 'delta') phase = mod(nextState - state, 8);
          for (let i = bounds[f]; i < bounds[f + 1]; i++) {
            const col = mod(phase + direction * (i - bounds[f]), 8);
            const byte = grid.byte_rows[row][col];
            const key = reduction === 'mod29' ? byte % 29 : Math.floor(29 * byte / 256);
            decoded[i] = mod(C[i] - sign * key, 29);
          }
        }
        repeatResults.push({ phaseMode, direction, reduction, sign, ...score(decoded) });
      }
    }
  }
}
repeatResults.sort((a, b) => b.trigramNatsPerRune - a.trigramNatsPerRune);

// Family-wise null: each random row permutation gets the maximum over all 16
// ciphertext-residue variants. Seed 3301 makes the control exactly reproducible.
let rng = 3301;
function random32() {
  rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
  return rng;
}
const N = 500;
let greaterOrEqual = 0;
let sumBest = 0;
let minBest = Infinity;
let maxBest = -Infinity;
for (let trial = 0; trial < N; trial++) {
  const permutation = Array.from({ length: 32 }, (_, i) => i);
  for (let i = 31; i > 0; i--) {
    const j = random32() % (i + 1);
    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
  }
  const rows = permutation.slice(0, 28);
  let best = -Infinity;
  for (const columnMode of columnModes) {
    for (const reduction of ['mod29', 'scale29']) {
      for (const sign of [1, -1]) {
        const decoded = decodeRowColumn(rows, columnMode, reduction, sign);
        const value = score(decoded).trigramNatsPerRune;
        if (value > best) best = value;
      }
    }
  }
  sumBest += best;
  minBest = Math.min(minBest, best);
  maxBest = Math.max(maxBest, best);
  if (best >= sourceBest.trigramNatsPerRune) greaterOrEqual++;
}

const baseline = score(C);
const result = {
  baseline,
  sourceBest,
  sourceTopFive: columnResults.slice(0, 5),
  repeatRowBest: repeatResults[0],
  randomRowNull: {
    trials: N,
    seed: 3301,
    meanBest: sumBest / N,
    minBest,
    maxBest,
    greaterOrEqual,
    empiricalP: (greaterOrEqual + 1) / (N + 1)
  }
};
console.log(JSON.stringify(result, null, 2));
