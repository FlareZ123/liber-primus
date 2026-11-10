'use strict';
/**
 * Retrospective LP2 page-edge GP29 modulo difference diagnostic.
 * Source-exact full-page order shuffle and page-disjoint crossfit.
 * Run: node sims/page_turn_mod29_holdout.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname,
  '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
assert.equal(pages.length, 55);
const flat = pages.flatMap(p => p.indices);
assert.equal(flat.length, 12956);
const first = pages.map(p => p.indices[0]);
const last = pages.map(p => p.indices.at(-1));
const mod = n => (n % 29 + 29) % 29;
const difference = (i, j) => mod(first[j] - last[i]);
const ids = pages.map((_, i) => i);
const trainIds = ids.slice(0, 28);
const holdIds = ids.slice(28);
const boundaries = [];
let offset = 0;
for (const p of pages) {
  if (offset > 0) boundaries.push(offset);
  offset += p.indices.length;
}
assert.equal(boundaries.length, 54);
const steps = order => order.slice(1).map((j, i) => difference(order[i], j));
function marginal(indices) {
  const p = Array(29).fill(0);
  for (const i of indices) for (const j of indices)
    p[difference(i, j)] += 1 / (indices.length * indices.length);
  return p;
}
const arcs = [];
for (let length = 2; length <= 14; length++)
  for (let start = 0; start < 29; start++)
    arcs.push({start, length});
function probability(p, arc) {
  let value = 0;
  for (let i = 0; i < arc.length; i++)
    value += p[(arc.start + i) % 29];
  return value;
}
function hits(data, arc) {
  return data.filter(v => (v - arc.start + 29) % 29 < arc.length).length;
}
function score(data, arc, p) {
  const q = probability(p, arc), e = q * data.length;
  return (hits(data, arc) - e) / Math.sqrt(e * (1 - q));
}
function select(data, p) {
  let best = {z: -Infinity};
  for (const arc of arcs) {
    const z = score(data, arc, p);
    if (z > best.z) best = {...arc, z, hits: hits(data, arc)};
  }
  return best;
}
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}
function shuffle(items, rand) {
  const result = items.slice();
  for (let j = result.length - 1; j > 0; j--) {
    const k = rand() % (j + 1);
    [result[j], result[k]] = [result[k], result[j]];
  }
  return result;
}
const qTrain = marginal(trainIds);
const qHold = marginal(holdIds);
const train = steps(trainIds);
const hold = steps(holdIds);
const selected = select(train, qTrain);
const observed = score(hold, selected, qHold);
assert.deepEqual([selected.start, selected.length, selected.hits,
  hold.length, hits(hold, selected)], [12, 6, 10, 26, 12]);

const random = rng(0x79151341);
const draws = 60000;
let extreme = 0, noZero = 0, noZeroExtreme = 0;
for (let trial = 0; trial < draws; trial++) {
  const t = steps(shuffle(trainIds, random));
  const h = steps(shuffle(holdIds, random));
  const candidate = select(t, qTrain);
  const z = score(h, candidate, qHold);
  extreme += Number(z >= observed);
  if (!t.includes(0) && !h.includes(0)) {
    noZero++;
    noZeroExtreme += Number(z >= observed);
  }
}
assert.deepEqual([extreme, noZero, noZeroExtreme], [279, 10770, 61]);

/**
 * Exact Poisson-binomial null: independently choose ±10-rune
 * displacements around each fixed original page edge.
 * @param {number[]} sites Zero-based rune boundary sites
 * @param {{start:number,length:number}} arc
 */
function localJitter(sites, arc) {
  const probabilities = sites.map(site => {
    let count = 0;
    for (let delta = -10; delta <= 10; delta++) {
      const position = site + delta;
      const d = mod(flat[position] - flat[position - 1]);
      count += Number((d - arc.start + 29) % 29 < arc.length);
    }
    return count / 21;
  });
  let dp = [1];
  for (const p of probabilities) {
    const next = Array(dp.length + 1).fill(0);
    for (let j = 0; j < dp.length; j++) {
      next[j] += dp[j] * (1 - p);
      next[j + 1] += dp[j] * p;
    }
    dp = next;
  }
  const actual = sites.filter(pos => {
    const d = mod(flat[pos] - flat[pos - 1]);
    return (d - arc.start + 29) % 29 < arc.length;
  }).length;
  return {sites: sites.length, actual,
    expected: probabilities.reduce((a, b) => a + b, 0),
    exactUpperTail: dp.slice(actual).reduce((a, b) => a + b, 0)};
}
const jitter = localJitter(boundaries.slice(28), selected);
assert.equal(jitter.actual, 12);
assert.ok(Math.abs(jitter.exactUpperTail - 0.002980129076079538) < 1e-12);

const all = steps(ids);
const qAll = marginal(ids);
const bestAll = select(all, qAll);
const randomAll = rng(0x23151279);
let fullExtreme = 0;
for (let trial = 0; trial < 30000; trial++)
  fullExtreme += Number(select(steps(shuffle(ids, randomAll)),
    qAll).z >= bestAll.z);
assert.deepEqual([bestAll.start, bestAll.length,
  bestAll.hits, fullExtreme], [12, 3, 15, 681]);
const result = {
  classification: 'retrospective ciphertext layout anomaly, not decryption',
  physicalPages: 55, runeCount: flat.length, pageTransitions: 54,
  selectedFull: {...bestAll, extreme: fullExtreme,
    permutations: 30000, upperTail: (fullExtreme + 1) / 30001},
  crossfit: {trainPages: [0, 27], holdoutPages: [28, 55],
    omittedTransition: 'p27 -> p28', trainArc: selected,
    heldoutHits: hits(hold, selected),
    heldoutExpectation: hold.length * probability(qHold, selected),
    heldoutZ: observed, permutations: draws, extreme,
    upperTail: (extreme + 1) / (draws + 1),
    zeroStepConstrained: {draws: noZero, extreme: noZeroExtreme,
      upperTail: (noZeroExtreme + 1) / (noZero + 1)},
    localBoundaryDisplacements: jitter}
};
console.log(JSON.stringify(result, null, 2));
module.exports = {difference, select, localJitter};
