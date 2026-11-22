#!/usr/bin/env node
'use strict';

/**
 * Exact five-doublet key-recovery certificate for source-linked H*G LFSR.
 * Run: node sims/lp2_hg_doublet_fmarker_state_recovery_sft.cjs
 *
 * Candidate only: hypothesize that an adjacent repeated cipher rune means
 * GP29 plaintext F (index 0) in C[i] = P[i] + K[i] mod29. Then at such a
 * site K[i] must equal the repeated printed C[i]. Solve all four starting
 * key elements from the first four original marker positions, with no
 * English scoring or guessed starting state; predict a held-out fifth.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const file = path.join(__dirname, '..', 'resources/liber-primus/lp2-corpus.json');
const corpus = JSON.parse(fs.readFileSync(file, 'utf8'));
const originalPages = corpus.pages.filter((p) => p.page < 56 && p.indices.length);
const mod = (n) => ((n % 29) + 29) % 29;

/** @param {number} n @returns {number} */
function inv(n) {
  for (let x = 1; x < 29; x++) if (mod(x * n) === 1) return x;
  throw Error('Nonunit in GF29: ' + n);
}

/**
 * Express every recursively generated key position as an GF29-linear
 * combination of the unknown initial four symbols.
 * @param {number} n Length of the intended key segment.
 * @param {number[]} tap Four source-polynomial recurrence taps.
 * @returns {number[][]}
 */
function stateRows(n, tap) {
  const v = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
  for (let k = 4; k < n; k++) {
    const row = Array.from({length: 4}, (_, j) =>
      mod(tap.reduce((sum, t, l) => sum + t * v[k - 4 + l][j], 0)));
    v.push(row);
  }
  return v;
}

/**
 * GF29 elimination on known-key constraints, with unrestricted four-symbol
 * initial state. Returns rank and a (possibly arbitrary free-zero) solution.
 * @param {number[][]} rows Arrays of [a,b,c,d,target].
 */
function solve(rows) {
  const a = rows.map((r) => r.slice());
  const pivots = [];
  let k = 0;
  for (let col = 0; col < 4 && k < a.length; col++) {
    let next = k;
    while (next < a.length && !a[next][col]) next++;
    if (next === a.length) continue;
    [a[k], a[next]] = [a[next], a[k]];
    const scale = inv(a[k][col]);
    for (let j = col; j <= 4; j++) a[k][j] = mod(a[k][j] * scale);
    for (let r = 0; r < a.length; r++) {
      if (r === k) continue;
      const factor = a[r][col];
      for (let j = col; j <= 4; j++)
        a[r][j] = mod(a[r][j] - factor * a[k][j]);
    }
    pivots.push(col);
    k++;
  }
  const inconsistent = a.some((r) => r.slice(0, 4).every((x) => x === 0)
    && r[4] !== 0);
  const state = [0, 0, 0, 0];
  for (let i = 0; i < pivots.length; i++) state[pivots[i]] = a[i][4];
  return { rank: pivots.length, consistent: !inconsistent, state };
}

/**
 * Gather adjacent equal rune events within each literal physical LP2 page.
 * Every event is indexed in a contiguous stream without cross-page tests.
 * @param {object[]} pages Source-visible pages in their canonical order.
 */
function doublets(pages) {
  const events = [];
  let offset = 0;
  for (const p of pages) {
    for (let i = 1; i < p.indices.length; i++)
      if (p.indices[i] === p.indices[i - 1])
        events.push({page: p.page, i, absolute: offset + i,
          value: p.indices[i]});
    offset += p.indices.length;
  }
  return {events, length: offset};
}

const {events, length} = doublets(originalPages);
assert.equal(length, 12956);
assert.equal(events.length, 86);
assert.deepEqual(events.slice(0, 5).map((e) => e.absolute),
  [122, 207, 456, 653, 782]);
assert.deepEqual(events.slice(0, 5).map((e) => e.value),
  [2, 14, 28, 11, 20]);

const tappairs = [
  {name: 'H*G forward', tap: [15, 20, 16, 1], expected: [10, 20, 22, 1],
    predictedFifth: 2},
  {name: 'H*G reciprocal', tap: [2, 27, 26, 18],
    expected: [16, 20, 25, 25], predictedFifth: 6},
];
const chapters = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],
  [33,39],[40,53],[54,55]];
const result = [];
for (const {name, tap, expected, predictedFifth} of tappairs) {
  const basis = stateRows(length, tap);
  const equations = events.slice(0, 4).map((e) =>
    [...basis[e.absolute], e.value]);
  const fit = solve(equations);
  assert.equal(fit.rank, 4);
  assert.equal(fit.consistent, true);
  assert.deepEqual(fit.state, expected);
  const predict = (i, seed) =>
    mod(basis[i].reduce((sum, v, j) => sum + v * seed[j], 0));
  for (let j = 0; j < 4; j++)
    assert.equal(predict(events[j].absolute, fit.state), events[j].value);
  const fifth = predict(events[4].absolute, fit.state);
  assert.equal(fifth, predictedFifth);
  assert.notEqual(fifth, events[4].value);

  // The same source-side generator could reset at each manuscript chapter.
  // Grant all four freely secret states per chapter; no language evidence.
  const chapterResults = chapters.map(([start, end]) => {
    const pp = originalPages.filter((p) => p.page >= start && p.page <= end);
    const sub = doublets(pp);
    const b = stateRows(sub.length, tap);
    const candidate = solve(sub.events.map((e) =>
      [...b[e.absolute], e.value]));
    return {pages: [start, end], doublets: sub.events.length,
      rank: candidate.rank, consistent: candidate.consistent};
  });
  assert.equal(chapterResults.filter((z) => !z.consistent).length, 7);

  // Source-shaped positive: a nonzero seeded LFSR permits five genuine
  // adjacent-equal ciphertext markers if the plaintext marker is F=0.
  const plantSeed = [1, 5, 11, 24];
  const planted = Array.from({length: 800}, (_, i) => mod(7 * i + 3));
  const plantedPositions = [122, 207, 456, 653, 782];
  for (const i of plantedPositions) {
    planted[i - 1] = planted[i] = predict(i, plantSeed);
    assert.equal(planted[i], planted[i - 1]);
    assert.equal(mod(planted[i] - predict(i, plantSeed)), 0);
  }
  const plantFit = solve(plantedPositions.slice(0, 4).map((i) =>
    [...basis[i], planted[i]]));
  assert.deepEqual(plantFit.state, plantSeed);
  assert.equal(predict(plantedPositions[4], plantFit.state),
    planted[plantedPositions[4]]);

  result.push({name, firstFourSourceEvents: events.slice(0, 4),
    recoveredFourRuneState: fit.state, withheldFifth:
    {event: events[4], forecast: fifth, passes: false},
    chapterResults, contradictoryChapters:
      chapterResults.filter((z) => !z.consistent).length});
}
console.log(JSON.stringify({sourceRunes: length, sourceDoublets: events.length,
  hypothesis: 'repeated ciphertext rune means plaintext F index0, additive H*G key',
  sourceLinkedRecurrences: result,
  syntheticPositive: 'five exact planted markers reconstruct the original secret',
  decision: 'source doublets fail a held-out fifth key prediction in both orientations'},
  null, 2));
