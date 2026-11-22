"use strict";
/**
 * Blind relative-offset search for two-time-pad-like shared GP keys.
 *
 * A common additive stream K[t] masked by unknown page-specific offsets
 * cancels in C_i[t]-C_j[t+delta] when delta=offset_i-offset_j.
 *
 * Fit relative shifts on even t; evaluate *untouched odd t* with the
 * same shift, rather than claiming the largest training peak.
 *
 * Only compares pages with >=150 symbols, with relative shifts ±20.
 * CJS, Node 22+, built-in dependencies only.
 */
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname, "..");
const CORPUS = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const SHAKESPEARE = fs.readFileSync(path.join(ROOT, "resources/control/shakespeare_first300k.txt"), "utf8");

/** @param {number} seed */
function xorshift(seed) {
  let s = seed | 0;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/** @param {string} text */
function getPrior(text) {
  const mapping = new Map(CORPUS.translit.map((x, i) => [x, i]));
  const hist = Array(29).fill(1);
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < word.length;) {
      const pair = word.slice(i, i + 2);
      if (mapping.has(pair)) { hist[mapping.get(pair)]++; i += 2; }
      else if (mapping.has(word[i])) { hist[mapping.get(word[i])]++; i++; }
      else i++;
    }
  }
  const sum = hist.reduce((x, y) => x + y);
  return hist.map(v => 0.9 * v / sum + 0.1 / 29);
}

/** @param {number[]} p */
function differenceWeights(p) {
  const q = Array.from({ length: 29 }, (_, d) => p.reduce((sum, x, a) =>
    sum + x * p[(a - d + 29) % 29], 0));
  const logp = q.map(v => Math.log(29 * v));
  const mean = logp.reduce((a, b) => a + b) / 29;
  const sd = Math.sqrt(logp.reduce((a, v) => a + (v - mean) ** 2, 0) / 29);
  return { weights: logp.map(v => (v - mean) / sd), q, mean, sd };
}

/**
 * @param {number[]} a @param {number[]} b
 * @param {number} delta @param {number[]} weights
 * @param {0|1} parity
 */
function measure(a, b, delta, weights, parity) {
  let sum = 0, n = 0;
  const lo = Math.max(0, -delta);
  const hi = Math.min(a.length, b.length - delta);
  let t = lo + ((parity - lo % 2 + 2) % 2);
  for (; t < hi; t += 2) {
    sum += weights[(a[t] - b[t + delta] + 29) % 29]; n++;
  }
  return { sum, n, z: sum / Math.sqrt(n) };
}

/**
 * Returns per-pair validation score for the training-optimal delta.
 * @param {number[][]} pages
 * @param {number[]} weights
 * @param {number} maxDelta
 * @param {number[]} [truth]
 */
function test(pages, weights, maxDelta, truth = []) {
  let totalZ = 0, pairs = 0, exact = 0, rawSum = 0, validationSamples = 0;
  const selected = [];
  for (let i = 0; i < pages.length; i++) for (let j = i + 1; j < pages.length; j++) {
    const a = pages[i], b = pages[j];
    let bestDelta = 0, bestZ = -Infinity;
    for (let delta = -maxDelta; delta <= maxDelta; delta++) {
      const { n, z } = measure(a, b, delta, weights, 0);
      if (n >= 40 && z > bestZ) { bestZ = z; bestDelta = delta; }
    }
    const v = measure(a, b, bestDelta, weights, 1);
    totalZ += v.z;
    rawSum += v.sum;
    validationSamples += v.n;
    pairs++;
    if (truth.length && bestDelta === truth[i] - truth[j]) exact++;
    selected.push({ i, j, bestDelta, trainZ: bestZ, validationZ: v.z });
  }
  return {
    pairCount: pairs, totalHeldoutZ: totalZ,
    meanHeldoutZ: totalZ / pairs,
    validationSamples, rawSum, exactOffsetRate: truth.length ? exact / pairs : null,
    highestHeldout: selected.sort((a, b) => b.validationZ - a.validationZ).slice(0, 3)
  };
}

/** @param {number[][]} original @param {number} offsetRange @param {number} repairProb @param {number[]} p @param {number} seed */
function plant(original, offsetRange, repairProb, p, seed) {
  const random = xorshift(seed);
  const shifts = original.map(() => Math.floor(random() * (offsetRange + 1)));
  const fullLength = Math.max(...original.map((a, i) => a.length + shifts[i]));
  const key = Array.from({ length: fullLength }, () => Math.floor(random() * 29));
  const cum = []; let acc = 0;
  for (const v of p) { acc += v; cum.push(acc); }
  const pick = () => {
    const r = random(), i = cum.findIndex(v => v > r);
    return i < 0 ? 28 : i;
  };
  let repairs = 0;
  const pages = original.map((a, i) => {
    const out = [];
    for (let t = 0; t < a.length; t++) {
      let val = (pick() + key[t + shifts[i]]) % 29;
      if (t && val === out[t - 1] && random() < repairProb) {
        val = (val + 1 + Math.floor(28 * random())) % 29;
        repairs++;
      }
      out.push(val);
    }
    return out;
  });
  return { pages, shifts, repairs };
}

/** @param {number[][]} pages @param {number[]} weights @param {number} maxDelta @param {number} n @param {number} seed */
function nullRotations(pages, weights, maxDelta, n, seed) {
  const random = xorshift(seed), scores = [];
  for (let r = 0; r < n; r++) {
    const rotated = pages.map(a => {
      const offset = Math.floor(random() * a.length);
      return a.slice(offset).concat(a.slice(0, offset));
    });
    scores.push(test(rotated, weights, maxDelta).meanHeldoutZ);
  }
  const mean = scores.reduce((a, b) => a + b) / n;
  const sd = Math.sqrt(scores.reduce((s, x) => s + (x - mean) ** 2, 0) / (n - 1));
  return { mean, sd, values: scores };
}

function main() {
  const p = getPrior(SHAKESPEARE);
  const w = differenceWeights(p);
  const real = CORPUS.pages.filter(p => p.status === "unsolved" && p.indices.length >= 150)
    .map(p => p.indices);
  const maxDelta = 20;
  const observed = test(real, w.weights, maxDelta);
  const nulls = nullRotations(real, w.weights, maxDelta, 80, 0x63b171a1);
  const control = plant(real, maxDelta, 0.81, p, 0x712d8892);
  const planted = test(control.pages, w.weights, maxDelta, control.shifts);
  const controlNull = nullRotations(control.pages, w.weights, maxDelta, 30, 0x5172e2fe);
  console.log(JSON.stringify({
    model: "unknown ±20 relative page offsets, shared additive pad under English GP prior",
    pageCount: real.length,
    priorDifferenceKLbits: w.q.reduce((s, x) => s + x * Math.log2(29 * x), 0),
    selectedOn: "even positions, pair-wise",
    validatedOn: "odd positions, pair-wise",
    real: { ...observed, rotatedMean: nulls.mean, rotatedSD: nulls.sd,
      z: (observed.meanHeldoutZ - nulls.mean) / nulls.sd,
      upperTail: (1 + nulls.values.filter(v => v >= observed.meanHeldoutZ).length) / (nulls.values.length + 1),
      nullReps: nulls.values.length },
    synthetic: { seed: "0x712d8892", repairProbability: 0.81, repairs: control.repairs,
      ...planted, rotatedMean: controlNull.mean, rotatedSD: controlNull.sd,
      z: (planted.meanHeldoutZ - controlNull.mean) / controlNull.sd,
      upperTail: (1 + controlNull.values.filter(v => v >= planted.meanHeldoutZ).length) / (controlNull.values.length + 1),
      nullReps: controlNull.values.length }
  }, null, 2));
}
if (require.main === module) main();
module.exports = { getPrior, differenceWeights, measure, test, plant, nullRotations };
