'use strict';
/**
 * Original LP2 p7 red polynomial: full seven-cycle continuation and
 * source-fixed GP29 rune-clock decoder.
 *
 * Read-only Windows 11 / Node.js 22 SFT:
 * node sims/lp2_p7_red_polynomial_seven_cycle_original_sft.cjs
 *
 * The five source coefficients and p8 red fixed-point values come from
 * unaltered original ciphertext and source-backed ink annotations.
 * The full-cycle hypothesis is provisional; no plaintext is claimed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
/** @param {string} name @returns {string} */
const load = name => fs.readFileSync(path.join(root, name), 'utf8');
const gp = JSON.parse(load('lp2-corpus.json'));
const ink = JSON.parse(load('lp2-ink-annotations.json'));
const parts = load('lp2-transcription.txt').split('%');
const index = new Map(gp.runes.map((r, i) => [r, i]));
const red = new Map(ink.pages.map(page =>
  [page.page, new Set((page.red_spans || []).flatMap(span =>
    Array.from({ length: span.length }, (_, j) => span.start + j)))]));
const mod = x => (x % 29 + 29) % 29;

/** @typedef {{page:number,offset:number,value:number,red:boolean}} RuneCell */
/** @type {RuneCell[][]} */
const words = [];
/** @type {RuneCell[]} */
let pending = [];
for (let page = 0; page <= 55; page++) {
  if (page === 50) continue; // original p50 has numeric cells, no runes.
  let offset = 0;
  for (const ch of parts[page > 50 ? page - 1 : page]) {
    if (index.has(ch)) {
      pending.push({ page, offset, value: index.get(ch),
        red: red.get(page)?.has(offset) || false });
      offset++;
    } else if ((ch === '-' || ch === '.') && pending.length) {
      words.push(pending);
      pending = [];
    }
  }
  assert.equal(offset, gp.pages[page].indices.length);
}
if (pending.length) words.push(pending);
assert.equal(words.length, 2896);
const allRunes = words.flat().map(c => c.value);
assert.deepEqual(allRunes, gp.pages.slice(0, 56).flatMap(p => p.indices));
/** @param {number} p @returns {RuneCell[][]} */
const redWords = p => words.filter(w =>
  w[0].page === p && w.every(c => c.page === p && c.red));
/** @param {RuneCell[]} w @returns {number} */
const product = w => w.reduce((v, c) => mod(v * c.value), 1);
const p7 = redWords(7), p8 = redWords(8);
assert.deepEqual(p7.map(w => w.length), [2, 4, 3, 2, 3]);
assert.deepEqual(p8.map(w => w.length), [4, 8]);
assert.deepEqual(p7.flat().map(c => c.value),
  gp.pages[7].indices.slice(194));
assert.deepEqual(p8.flat().map(c => c.value),
  gp.pages[8].indices.slice(0, 12));
const sourceCoefficients = p7.map(product);
const targetRoots = p8.map(product);
assert.deepEqual(sourceCoefficients, [11, 26, 8, 15, 2]);
assert.deepEqual(targetRoots, [4, 3]);
assert.equal(p8[1].at(-1).value, 17);

/** @param {number[]} c @param {number} x @returns {number} */
const evalPoly = (c, x) => c.reduceRight((v, a) => mod(v * x + a), 0);
/** @param {number[]} c @param {number} x @returns {number} */
const deriv = (c, x) => mod(c.reduce((s, a, k) =>
  k ? s + k * a * x ** (k - 1) : s, 0));
const f = x => evalPoly(sourceCoefficients, x);
assert.deepEqual([f(3), f(4), deriv(sourceCoefficients, 4)],
  [3, 4, 17]);

/** @param {number[]} c @returns {{graph:number[],cycles:number[][]}} */
function functionalGraph(c) {
  const graph = Array.from({ length: 29 }, (_, i) => evalPoly(c, i));
  const seen = new Set();
  const cycles = [];
  for (let i = 0; i < 29; i++) {
    if (seen.has(i)) continue;
    const location = new Map(), route = [];
    let x = i;
    while (!seen.has(x) && !location.has(x)) {
      location.set(x, route.length);
      route.push(x);
      x = graph[x];
    }
    if (location.has(x)) cycles.push(route.slice(location.get(x)));
    for (const n of route) seen.add(n);
  }
  return { graph, cycles };
}
const { graph, cycles } = functionalGraph(sourceCoefficients);
assert.deepEqual(cycles, [
  [5, 15, 28, 9, 10, 24, 7], [4], [3]
]);
assert.equal(new Set(graph).size, 19);
const basins = cycles.map(cycle => {
  let count = 0;
  for (let x = 0; x < 29; x++) {
    let state = x;
    for (let j = 0; j < 29; j++) {
      if (cycle.includes(state)) {
        count++;
        break;
      }
      state = graph[state];
    }
  }
  return count;
});
assert.deepEqual(basins, [26, 2, 1]);

const transient = [];
let state = 0;
for (let j = 0; j < 5; j++) {
  transient.push(state);
  state = f(state);
}
assert.deepEqual(transient, [0, 11, 23, 17, 18]);
assert.equal(state, 5); // P applied five times to index zero.
const cycle = [];
for (let j = 0; j < 7; j++) {
  cycle.push(state);
  state = f(state);
}
assert.deepEqual(cycle, [5, 15, 28, 9, 10, 24, 7]);
assert.equal(state, 5);

// The earlier source analysis fixed the three output conditions:
// P(3)=3, P(4)=4, P'(4)=17, and only roots {3,4}. Without choosing any
// input coefficient from language, enumerate all 29^2 remaining
// degree<=4 coefficient polynomials satisfying those linear constraints.
// Inverse of [[1,3,9],[1,4,16],[0,1,8]] modulo29.
const inverseMatrix = [[16, 14, 12], [21, 8, 22], [1, 28, 1]];
const counts = {
  linearConstraints: 0,
  exactlyTwoFixedRoots: 0,
  hasSevenCycle: 0,
  entersAtFiveAfterFiveIterations: 0,
  bothSevenCycleAndFiveEntry: 0,
  hasExactlyCycles_1_1_7: 0
};
/** @type {number[][]} */
const jointMatches = [];
for (let c3 = 0; c3 < 29; c3++) {
  for (let c4 = 0; c4 < 29; c4++) {
    const rhs = [
      mod(3 - 27 * c3 - 81 * c4),
      mod(4 - 64 * c3 - 256 * c4),
      mod(17 - 48 * c3 - 256 * c4)
    ];
    const a = inverseMatrix.map(row =>
      mod(row.reduce((sum, x, i) => sum + x * rhs[i], 0)));
    const c = [...a, c3, c4];
    assert.deepEqual([evalPoly(c, 3), evalPoly(c, 4), deriv(c, 4)],
      [3, 4, 17]);
    counts.linearConstraints++;
    const fixed = Array.from({ length: 29 }, (_, i) => i)
      .filter(x => evalPoly(c, x) === x);
    if (fixed.length !== 2 || fixed[0] !== 3 || fixed[1] !== 4)
      continue;
    counts.exactlyTwoFixedRoots++;
    const { graph: candidateGraph, cycles: candidateCycles } =
      functionalGraph(c);
    const hasSeven = candidateCycles.some(t => t.length === 7);
    let s = 0;
    for (let j = 0; j < 5; j++) s = candidateGraph[s];
    const entersFive = s === 5;
    if (hasSeven) counts.hasSevenCycle++;
    if (entersFive) counts.entersAtFiveAfterFiveIterations++;
    if (candidateCycles.map(t => t.length).sort((a, b) => a - b)
      .join(',') === '1,1,7') counts.hasExactlyCycles_1_1_7++;
    if (hasSeven && entersFive) {
      counts.bothSevenCycleAndFiveEntry++;
      jointMatches.push(c);
    }
  }
}
assert.deepEqual(counts, {
  linearConstraints: 841,
  exactlyTwoFixedRoots: 409,
  hasSevenCycle: 11,
  entersAtFiveAfterFiveIterations: 12,
  bothSevenCycleAndFiveEntry: 1,
  hasExactlyCycles_1_1_7: 9
});
assert.deepEqual(jointMatches, [sourceCoefficients]);

// Original adjacent tree chapter p8..p14 is exactly seven physical pages.
// This does NOT prove that cycle values are page or rune cipher keys.
const chapterPages = gp.pages.slice(8, 15);
assert.deepEqual(chapterPages.map(p => p.indices.length),
  [255, 268, 263, 273, 261, 272, 137]);
assert.equal(chapterPages.length, cycle.length);
const body = gp.pages[8].indices.slice(12)
  .concat(gp.pages.slice(9, 15).flatMap(p => p.indices));
assert.equal(body.length, 1717);
/** @param {number[]} tape @returns {number} */
function ioc(tape) {
  const frequency = Array(29).fill(0);
  for (const x of tape) frequency[x]++;
  return frequency.reduce((sum, n) => sum + n * (n - 1), 0) /
    (tape.length * (tape.length - 1));
}
const readouts = [];
for (const sign of [-1, 1]) {
  // Hypothetical GP29 additive cipher, first cycle key at first black
  // p8 rune, one polynomial step per rune, no page resets or fitted key.
  const decoded = body.map((x, i) => mod(x + sign * cycle[i % 7]));
  const returned = decoded.map((x, i) => mod(x - sign * cycle[i % 7]));
  assert.deepEqual(returned, body);
  readouts.push({ sign, ioc: ioc(decoded) });
}
assert(Math.abs(ioc(body) - 0.03443217624929914) < 1e-13);
assert.deepEqual(readouts.map(r => Number(r.ioc.toFixed(12))),
  [0.034553681613, 0.034451182675]);
assert(readouts.every(r => r.ioc < 0.04));

// A genuine solved native-GP positive. Every decoder here is fully
// reversible, and correctly recovers p57 when its declared cipher is used.
const clear = gp.pages[57].indices;
assert.equal(clear.length, 95);
assert(ioc(clear) > 0.06);
for (const sign of [-1, 1]) {
  const encrypted = clear.map((x, i) =>
    mod(x - sign * cycle[i % 7]));
  const recovered = encrypted.map((x, i) =>
    mod(x + sign * cycle[i % 7]));
  assert.deepEqual(recovered, clear);
}
console.log('LP2_P7_RED_POLYNOMIAL_SEVEN_CYCLE ' +
  JSON.stringify({
    sourceCoefficients, p8RedWordProducts: targetRoots,
    p8LastRedRune: p8[1].at(-1).value,
    polynomialNext: graph,
    cycles, basins, transientZeroSeed: transient,
    P5ofZero: 5, sevenRuneCycle: cycle,
    sourceSevenPages: chapterPages.map(p => p.indices.length),
    frozenConditional841Polynomials: counts,
    uniqueJoint: jointMatches,
    originalCipherRunesTested: body.length,
    originalUnshiftedIoC: ioc(body),
    originalSourceFixedOneRuneClockInverse: readouts,
    solvedP57PlantRecovered: clear.length,
    previouslyUnknownPlaintextRecovered: false
  }, null, 2));
console.log('PASS: exact original red polynomial seven-cycle and no prose GP29 key inverse.');
