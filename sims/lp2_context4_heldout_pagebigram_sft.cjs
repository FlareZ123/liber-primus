"use strict";

/**
 * Frozen cross-chapter GP29 next-rune prediction test.
 * Issue #1483. Windows 11 / Node.js 22 CommonJS. No network or writes.
 *
 * Train ONLY physical pp0–32 (7,960 runes); pp33–55 (4,996 runes)
 * are untouched evaluation data. All training counts are frozen.
 * Model: hierarchical Dirichlet context orders 0..4, with uniform
 * one-count root and 29 parent pseudo-observations at every other order.
 * Baselines: frozen order-zero and order-one from the same training data.
 * Exact page-bigram null: independently uniform labeled-edge Euler
 * trails on all original test pages; genuine page starts/ends retained.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const trainPages = corpus.pages.filter((p) =>
  p.page <= 32 && p.indices.length > 0);
const testPages = corpus.pages.filter((p) =>
  p.page >= 33 && p.page <= 55 && p.indices.length > 0);
const train = trainPages.flatMap((p) => p.indices);
const test = testPages.map((p) => p.indices);
assert.equal(train.length, 7960);
assert.equal(test.flat().length, 4996);
assert.equal(corpus.pages[50].runic_count, 0);
assert.equal(corpus.runes.length, 29);

const ALPHABET = 29;
const MAX_ORDER = 4;
const PSEUDO = 29;
const TRIALS = 400;

/**
 * Freeze context frequencies. Cross-page context is continuous, mirroring
 * the original rune stream and including 32 preserved word carries.
 * @param {number[]} seq
 * @returns {Map<string,{n:number,v:Uint32Array}>[]}
 */
function trainModel(seq) {
  const model = Array.from({ length: MAX_ORDER + 1 }, () => new Map());
  for (let i = 0; i < seq.length; i++) {
    for (let k = 0; k <= MAX_ORDER && k <= i; k++) {
      const key = k ? seq.slice(i - k, i).join(",") : "";
      let row = model[k].get(key);
      if (!row) {
        row = { n: 0, v: new Uint32Array(ALPHABET) };
        model[k].set(key, row);
      }
      row.n++;
      row.v[seq[i]]++;
    }
  }
  return model;
}

/**
 * Return P(next=y | frozen training counts, recent source runes).
 * @param {Map<string,{n:number,v:Uint32Array}>[]} model
 * @param {number[]} ctx
 * @param {number} y
 * @param {number} maxOrder
 * @returns {number}
 */
function prob(model, ctx, y, maxOrder) {
  let row = model[0].get("");
  let p = (row.v[y] + 1) / (row.n + ALPHABET);
  for (let k = 1; k <= maxOrder; k++) {
    row = model[k].get(ctx.slice(-k).join(","));
    if (row) p = (row.v[y] + PSEUDO * p) / (row.n + PSEUDO);
  }
  return p;
}

/**
 * Compute frozen-model bits loss, accurate one-step top-1 hits, and
 * incremental gain over first-order baseline, with NO test refitting.
 * @param {Map<string,{n:number,v:Uint32Array}>[]} model
 * @param {number[]} contextHead
 * @param {number[][]} pages
 * @returns {{runes:number,loss0:number,loss1:number,loss4:number,top1:number,top4:number,gain:number}}
 */
function score(model, contextHead, pages) {
  const context = contextHead.slice(-MAX_ORDER);
  const r = { runes: 0, loss0: 0, loss1: 0, loss4: 0,
    top1: 0, top4: 0, gain: 0 };
  for (const page of pages) {
    for (const y of page) {
      const a = prob(model, context, y, 0);
      const b = prob(model, context, y, 1);
      const c = prob(model, context, y, 4);
      r.loss0 -= Math.log2(a);
      r.loss1 -= Math.log2(b);
      r.loss4 -= Math.log2(c);
      r.gain += Math.log2(c / b);
      let guess1 = 0;
      let guess4 = 0;
      let best1 = prob(model, context, 0, 1);
      let best4 = prob(model, context, 0, 4);
      for (let z = 1; z < ALPHABET; z++) {
        const q1 = prob(model, context, z, 1);
        const q4 = prob(model, context, z, 4);
        if (q1 > best1) { best1 = q1; guess1 = z; }
        if (q4 > best4) { best4 = q4; guess4 = z; }
      }
      r.top1 += Number(guess1 === y);
      r.top4 += Number(guess4 === y);
      r.runes++;
      context.push(y);
      if (context.length > MAX_ORDER) context.shift();
    }
  }
  return r;
}

/**
 * Seeded xorshift32 generator. Returns [0,1).
 * @param {number} seed
 * @returns {() => number}
 */
function generator(seed) {
  let state = seed | 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * Preserve a page as a directed labeled multigraph.
 * @param {number[]} indices
 * @returns {{symbols:number[],outgoing:number[][],root:number}}
 */
function graph(indices) {
  const outgoing = Array.from({ length: ALPHABET }, () => []);
  for (let i = 1; i < indices.length; i++)
    outgoing[indices[i - 1]].push(indices[i]);
  return { symbols: indices, outgoing, root: indices[indices.length - 1] };
}

/**
 * Uniform Euler-trail sample by directed cycle popping and
 * independently randomizing outgoing edges with final tree edge last.
 * Adopted from the repository's independently established original
 * page-bigram Euler sampler; identical endpoint parallel edges remain
 * individually labeled.
 * @param {{symbols:number[],outgoing:number[][],root:number}} g
 * @param {() => number} random
 * @returns {number[]}
 */
function euler(g, random) {
  const { symbols, outgoing, root } = g;
  const randomIndex = (n) => Math.floor(random() * n);
  const last = new Int16Array(ALPHABET).fill(-1);
  for (let v = 0; v < ALPHABET; v++) {
    if (v !== root && outgoing[v].length)
      last[v] = randomIndex(outgoing[v].length);
  }
  let again = true;
  while (again) {
    again = false;
    for (let v = 0; v < ALPHABET && !again; v++) {
      if (v === root || !outgoing[v].length) continue;
      const seen = new Int16Array(ALPHABET).fill(-1);
      const chain = [];
      let state = v;
      while (state !== root && seen[state] < 0) {
        assert.ok(last[state] >= 0, "Graph must reach terminal vertex");
        seen[state] = chain.length;
        chain.push(state);
        state = outgoing[state][last[state]];
      }
      if (state !== root) {
        again = true;
        for (const vertex of chain.slice(seen[state]))
          last[vertex] = randomIndex(outgoing[vertex].length);
      }
    }
  }
  const shuffled = outgoing.map((dest, vertex) => {
    const edges = dest.map((next, label) => ({ next, label }));
    for (let j = edges.length - 1; j > 0; j--) {
      const other = randomIndex(j + 1);
      [edges[j], edges[other]] = [edges[other], edges[j]];
    }
    if (vertex !== root && last[vertex] >= 0) {
      const at = edges.findIndex((edge) => edge.label === last[vertex]);
      assert.ok(at >= 0);
      edges.push(edges.splice(at, 1)[0]);
    }
    return edges;
  });
  const cursor = new Uint16Array(ALPHABET);
  const result = [symbols[0]];
  let current = symbols[0];
  for (let i = 1; i < symbols.length; i++) {
    const edge = shuffled[current][cursor[current]++];
    assert.ok(edge, "Euler walk exhausted an outgoing edge");
    result.push(current = edge.next);
  }
  assert.equal(current, root);
  for (let v = 0; v < ALPHABET; v++)
    assert.equal(cursor[v], shuffled[v].length);
  return result;
}

/**
 * Verify every original page bigram and original endpoints exactly.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {void}
 */
function verifyEdges(a, b) {
  assert.equal(a.length, b.length);
  assert.equal(a[0], b[0]);
  assert.equal(a[a.length - 1], b[b.length - 1]);
  const diff = new Int32Array(ALPHABET * ALPHABET);
  for (let i = 1; i < a.length; i++) {
    diff[ALPHABET * a[i - 1] + a[i]]++;
    diff[ALPHABET * b[i - 1] + b[i]]--;
  }
  assert.ok(diff.every((z) => z === 0), "Exact bigram matrix mismatch");
}

/**
 * Deliberately low-state second-order positive control.
 * The next rune is (prev1 + prev2) mod29 with 94% probability;
 * otherwise uniformly random GP29. Can be learned without a source key.
 * @param {number} seed
 * @param {number} count
 * @returns {number[]}
 */
function planted(seed, count) {
  const random = generator(seed);
  const out = [4, 11];
  while (out.length < count) {
    const natural = (out[out.length - 1] + out[out.length - 2]) % ALPHABET;
    out.push(random() < 0.94 ?
      natural : Math.floor(random() * ALPHABET));
  }
  return out;
}

const trained = trainModel(train);
const observed = score(trained, train.slice(-MAX_ORDER), test);
assert.equal(observed.runes, 4996);
assert.ok(Math.abs(observed.gain - (-598.21721857616)) < 1e-6);
assert.equal(observed.top1, 179);
assert.equal(observed.top4, 162);

const random = generator(0x610e527f);
const graphs = test.map(graph);
let sum = 0;
let sumSquares = 0;
let min = Infinity;
let max = -Infinity;
let lower = 0;
for (let run = 0; run < TRIALS; run++) {
  const candidate = graphs.map((g) => euler(g, random));
  if (run === 0)
    for (let i = 0; i < candidate.length; i++)
      verifyEdges(test[i], candidate[i]);
  const r = score(trained, train.slice(-MAX_ORDER), candidate);
  sum += r.gain;
  sumSquares += r.gain * r.gain;
  min = Math.min(min, r.gain);
  max = Math.max(max, r.gain);
  if (r.gain <= observed.gain) lower++;
}

// Authentic clear LP2 p57 GP29 source-language out-of-domain check.
const nativeClear = score(trained, train.slice(-MAX_ORDER),
  [corpus.pages[57].indices]);
assert.equal(corpus.pages[57].status, "solved");
assert.equal(nativeClear.runes, 95);

const wholePlant = planted(0x243f6a88, 12956);
const modelPlant = trainModel(wholePlant.slice(0, 7960));
const positive = score(modelPlant, wholePlant.slice(7956, 7960),
  [wholePlant.slice(7960)]);
assert.ok(positive.gain > 1000,
  "The frozen context predictor must detect a genuine low-state plant");

// Uniform PRNG negative control with authentic train/test lengths.
const rng = generator(0x9e3779b9);
const randomTape = Array.from({ length: 12956 }, () =>
  Math.floor(rng() * ALPHABET));
const randomModel = trainModel(randomTape.slice(0, 7960));
const negative = score(randomModel, randomTape.slice(7956, 7960),
  [randomTape.slice(7960)]);
assert.ok(negative.gain < 0);

const mean = sum / TRIALS;
const sd = Math.sqrt(sumSquares / TRIALS - mean * mean);
const answer = {
  model: "frozen hierarchical 0..4 context, 29 root and parent pseudocounts",
  source: { trainPages: "p0–32", trainRunes: train.length,
    testPages: "p33–55", testRunes: observed.runes, original: observed },
  exactBigramConditional: {
    method: "uniform directed page Euler trails; identical original page edge multiset and endpoints",
    seed: "0x610e527f", simulations: TRIALS,
    meanGainBits: mean, sdGainBits: sd, minGainBits: min, maxGainBits: max,
    lowerTailHits: lower, lowerTailPlusOne: (lower + 1) / (TRIALS + 1)
  },
  controls: { solvedClearP57: nativeClear, plantedSecondOrder: positive, uniformRandom: negative }
};
console.log(JSON.stringify(answer, null, 2));
console.log("PASS: frozen original holdout, exact-bigram null, low-state plant, uniform noise");
