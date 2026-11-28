#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'),
  'utf8',
));
const ink = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'),
  'utf8',
));

const MOD = 29;
const mod = (x) => ((x % MOD) + MOD) % MOD;

/** @param {[number,number]} x @param {[number,number]} y @returns {[number,number]} */
function mul(x, y) {
  return [
    mod(x[0] * y[0] + 8 * x[1] * y[1]),
    mod(x[0] * y[1] + x[1] * y[0] + 3 * x[1] * y[1]),
  ];
}

/** @param {number[]} coefficients @returns {[number,number]} */
function evaluate(coefficients) {
  let acc = [0, 0];
  let power = [1, 0];
  for (const coefficient of coefficients) {
    acc = [
      mod(acc[0] + coefficient * power[0]),
      mod(acc[1] + coefficient * power[1]),
    ];
    power = mul(power, [0, 1]);
  }
  return acc;
}

const Q = [5, 5, 14, 9, 10, 4, 27, 17, 25];
const EQ = evaluate(Q);
assert.deepEqual(EQ, [17, 24]);

const dlog = new Map();
let state = [1, 0];
for (let k = 0; k < 840; k += 1) {
  assert.ok(!dlog.has(state.join(',')));
  dlog.set(state.join(','), k);
  state = mul(state, EQ);
}
assert.deepEqual(state, [1, 0]);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const edges = [];
for (const page of ink.pages) {
  for (const span of page.red_spans || []) {
    const values = [...span.runes].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    });
    const residue = evaluate(values);
    const k = dlog.get(residue.join(','));
    if (k === undefined) continue;
    edges.push({
      page: page.page,
      start: span.start,
      length: span.length,
      k,
      coord: [Math.floor(k / 29), k % 29],
    });
  }
}
assert.equal(edges.length, 17);

const twoCycles = [];
for (let i = 0; i < edges.length; i += 1) {
  for (let j = i + 1; j < edges.length; j += 1) {
    const a = edges[i];
    const b = edges[j];
    if (a.coord[0] === b.coord[1] && a.coord[1] === b.coord[0]) {
      twoCycles.push([a, b]);
    }
  }
}
assert.deepEqual(twoCycles, []);

const threeCycles = [];
for (let i = 0; i < edges.length; i += 1) {
  for (let j = 0; j < edges.length; j += 1) {
    for (let k = 0; k < edges.length; k += 1) {
      if (new Set([i, j, k]).size !== 3) continue;
      const a = edges[i];
      const b = edges[j];
      const c = edges[k];
      if (
        a.coord[1] === b.coord[0] &&
        b.coord[1] === c.coord[0] &&
        c.coord[1] === a.coord[0]
      ) {
        // Canonicalize by smallest edge index so each directed cycle is counted once.
        if (i === Math.min(i, j, k)) threeCycles.push([a, b, c]);
      }
    }
  }
}

assert.equal(threeCycles.length, 1);
assert.deepEqual(
  threeCycles[0].map((edge) => ({
    page: edge.page,
    start: edge.start,
    length: edge.length,
    k: edge.k,
    coord: edge.coord,
  })),
  [
    { page: 15, start: 0, length: 9, k: 236, coord: [8, 4] },
    { page: 56, start: 0, length: 5, k: 121, coord: [4, 5] },
    { page: 40, start: 0, length: 8, k: 153, coord: [5, 8] },
  ],
);

// Independently fixed numeric readings.
const stateNames = new Map([[4, 'q'], [5, 'g'], [8, 'A']]);
const sourceNames = new Map([[4, 'EMPTY'], [5, 'EPIPHANY'], [8, 'DEVOTED']]);

const cycle = threeCycles[0];
const stateEdges = cycle.map((edge) => [
  stateNames.get(edge.coord[0]),
  stateNames.get(edge.coord[1]),
]);
const sourceEdges = cycle.map((edge) => [
  sourceNames.get(edge.coord[0]),
  sourceNames.get(edge.coord[1]),
]);

assert.deepEqual(stateEdges, [
  ['A', 'q'],
  ['q', 'g'],
  ['g', 'A'],
]);
assert.deepEqual(sourceEdges, [
  ['DEVOTED', 'EMPTY'],
  ['EMPTY', 'EPIPHANY'],
  ['EPIPHANY', 'DEVOTED'],
]);

console.log(JSON.stringify({
  status: 'PASS',
  qElement: EQ,
  nonzeroRedSpanCount: edges.length,
  twoCycles: twoCycles.length,
  threeCycles: threeCycles.map((items) => items.map((edge) => ({
    page: edge.page,
    start: edge.start,
    length: edge.length,
    k: edge.k,
    coord: edge.coord,
  }))),
  uniqueCycleStateReading: stateEdges,
  uniqueCycleSignedSourceReading: sourceEdges,
  classification:
    'Exact finite Q-coordinate graph discovery: among all 17 nonzero complete red spans there is no directed 2-cycle and exactly one directed 3-cycle, p15 [8,4] -> p56 [4,5] -> p40 [5,8]. Vertices are independently q/g/A and EMPTY/EPIPHANY/DEVOTED. No unknown body plaintext or cipher opcode is claimed.',
}, null, 2));
