'use strict';
/**
 * Agent 40: exact forward-sum likelihood for an LP2 candidate two-time pad.
 *
 * Hypothesis: C28[i]-C42[i] = 4*(P28[i]-P42[i]) mod 29.
 * P28 and P42 independently follow one word-boundary-aware GP trigram model.
 * Unlike Viterbi decoding, this sums over every admissible plaintext path.
 *
 * One-file deterministic regression:
 *   node sims/relative_key_exact_marginal.cjs
 * Requires only existing repo files. Node 22, no third-party packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = require('./relative_key_english_probe.cjs');
const trigram = require('./relative_key_trigram_probe.cjs');

const root = path.resolve(__dirname, '..');
const MOD = 29;
const ALPHABET = 31;
const START = 29;
const END = 30;
const mod = n => ((n % MOD) + MOD) % MOD;
const index = (a, b, c) => (a * ALPHABET + b) * ALPHABET + c;
const source = fs.readFileSync(path.join(root, 'resources/control/shakespeare_first300k.txt'), 'utf8');
const trainWords = base.corpusWords(source.slice(0, 240000));
const heldoutWords = base.corpusWords(source.slice(240000));
const probs = Float64Array.from(trigram.trainTrigram(trainWords), Math.exp);

/**
 * Exact marginal log probability of the observed scaled difference sequence.
 * Word boundaries are tied to physical positions and do not rotate.
 * @param {{xs:number[],start:boolean[],end:boolean[]}} a
 * @param {{xs:number[],start:boolean[],end:boolean[]}} b
 * @param {number} shift
 * @param {number} scale
 * @returns {number}
 */
function likelihood(a, b, shift = 0, scale = 4) {
  const n = Math.min(a.xs.length, b.xs.length);
  assert.ok(n >= 2);
  assert.ok(Number.isInteger(shift) && shift >= 0 && shift < b.xs.length);
  const inverse = Array.from({length: 28}, (_, i) => i + 1).find(x => mod(x * scale) === 1);
  assert.notEqual(inverse, undefined);
  const difference = new Uint8Array(n);
  const qTable = new Uint8Array(n * MOD);
  for (let i = 0; i < n; i++) {
    difference[i] = mod(inverse * (a.xs[i] - b.xs[(i + shift) % b.xs.length]));
    for (let p = 0; p < MOD; p++) qTable[i * MOD + p] = mod(p - difference[i]);
  }
  const head = new Float64Array(MOD);
  let dp = new Float64Array(MOD * MOD);
  let next = new Float64Array(MOD * MOD);
  let norm = 0;
  let logLikelihood = 0;
  for (let p = 0; p < MOD; p++) {
    const q = qTable[p];
    let value = probs[index(START, START, p)] * probs[index(START, START, q)];
    if (a.end[0]) value *= probs[index(START, p, END)];
    if (b.end[0]) value *= probs[index(START, q, END)];
    head[p] = value;
    norm += value;
  }
  logLikelihood += Math.log(norm);
  for (let p = 0; p < MOD; p++) head[p] /= norm;
  norm = 0;
  for (let p = 0; p < MOD; p++) {
    const q = qTable[p];
    for (let k = 0; k < MOD; k++) {
      const r = qTable[MOD + k];
      let value = head[p] *
        probs[index(START, a.start[1] ? START : p, k)] *
        probs[index(START, b.start[1] ? START : q, r)];
      if (a.end[1]) value *= probs[index(a.start[1] ? START : p, k, END)];
      if (b.end[1]) value *= probs[index(b.start[1] ? START : q, r, END)];
      dp[p * MOD + k] = value;
      norm += value;
    }
  }
  logLikelihood += Math.log(norm);
  for (let i = 0; i < dp.length; i++) dp[i] /= norm;
  for (let i = 2; i < n; i++) {
    next.fill(0);
    norm = 0;
    for (let u = 0; u < MOD; u++) {
      const qu = qTable[(i - 2) * MOD + u];
      for (let v = 0; v < MOD; v++) {
        const qv = qTable[(i - 1) * MOD + v];
        const previous = dp[u * MOD + v];
        const p0 = a.start[i] ? START : (a.start[i - 1] ? START : u);
        const p1 = a.start[i] ? START : v;
        const q0 = b.start[i] ? START : (b.start[i - 1] ? START : qu);
        const q1 = b.start[i] ? START : qv;
        for (let k = 0; k < MOD; k++) {
          const qk = qTable[i * MOD + k];
          let weight = probs[index(p0, p1, k)] * probs[index(q0, q1, qk)];
          if (a.end[i]) weight *= probs[index(p1, k, END)];
          if (b.end[i]) weight *= probs[index(q1, qk, END)];
          next[v * MOD + k] += previous * weight;
        }
      }
    }
    for (let j = 0; j < next.length; j++) norm += next[j];
    assert.ok(norm > 0);
    logLikelihood += Math.log(norm);
    for (let j = 0; j < next.length; j++) next[j] /= norm;
    [dp, next] = [next, dp];
  }
  return logLikelihood;
}

/**
 * Independent brute-force comparison on a three-rune miniature.
 * @param {{xs:number[],start:boolean[],end:boolean[]}} a
 * @param {{xs:number[],start:boolean[],end:boolean[]}} b
 * @returns {number}
 */
function bruteThree(a, b) {
  const differences = a.xs.map((x, i) => mod(22 * (x - b.xs[i])));
  let total = 0;
  for (let p0 = 0; p0 < MOD; p0++) for (let p1 = 0; p1 < MOD; p1++)
    for (let p2 = 0; p2 < MOD; p2++) {
      const p = [p0, p1, p2];
      const q = p.map((x, i) => mod(x - differences[i]));
      let weight = 1;
      for (let i = 0; i < 3; i++) {
        const c = p[i], d = q[i];
        const aa = a.start[i] ? START : (i < 2 || a.start[i - 1] ? START : p[i - 2]);
        const ab = a.start[i] ? START : (i < 1 ? START : p[i - 1]);
        const ba = b.start[i] ? START : (i < 2 || b.start[i - 1] ? START : q[i - 2]);
        const bb = b.start[i] ? START : (i < 1 ? START : q[i - 1]);
        weight *= probs[index(aa, ab, c)] * probs[index(ba, bb, d)];
        if (a.end[i]) weight *= probs[index(ab, c, END)];
        if (b.end[i]) weight *= probs[index(bb, d, END)];
      }
      total += weight;
    }
  return Math.log(total);
}

/** @param {number[][]} words @param {number} size */
function stream(words, size) {
  const result = {xs: [], start: [], end: []};
  for (const word of words) {
    for (let i = 0; i < word.length && result.xs.length < size; i++) {
      result.xs.push(word[i]);
      result.start.push(i === 0);
      result.end.push(i === word.length - 1);
    }
    if (result.xs.length === size) break;
  }
  return result;
}

/** @param {number} seed */
function rng(seed) {
  let x = seed >>> 0;
  return () => {
    x = (Math.imul(1664525, x) + 1013904223) >>> 0;
    return x / 4294967296;
  };
}

function study() {
  const a = base.lp2Page(28);
  const b = base.lp2Page(42);
  assert.equal(a.xs.length, 269);
  assert.equal(b.xs.length, 272);
  const cut = x => ({xs: x.xs.slice(0, 3), start: x.start.slice(0, 3), end: x.end.slice(0, 3)});
  const marginalThree = likelihood(cut(a), cut(b));
  const enumeratedThree = bruteThree(cut(a), cut(b));
  assert.ok(Math.abs(marginalThree - enumeratedThree) < 1e-10);
  const actualShifts = Array.from({length: b.xs.length}, (_, shift) => shift);
  const actual = actualShifts.map(shift => ({shift, score: likelihood(a, b, shift)}))
    .sort((x, y) => y.score - x.score);

  const p = stream(heldoutWords.slice(0, 400), 269);
  const q = stream(heldoutWords.slice(500, 900), 269);
  assert.equal(p.xs.length, 269);
  assert.equal(q.xs.length, 269);
  const random = rng(3301);
  const key = p.xs.map(() => Math.floor(29 * random()));
  const ca = {...p, xs: p.xs.map((v, i) => mod(4 * v + key[i]))};
  const cb = {...q, xs: q.xs.map((v, i) => mod(4 * v + key[i]))};
  const plantShifts = Array.from({length: q.xs.length}, (_, shift) => shift);
  const planted = plantShifts.map(shift => ({shift, score: likelihood(ca, cb, shift)}))
    .sort((x, y) => y.score - x.score);
  return {
    model: 'word-aware GP trigram; exact sum over all 29-symbol paired paths; scale 4',
    knownReference: 'Shakespeare first 240000 characters training, remaining 60000 characters held out',
    targetPages: [28, 42],
    checked: {miniatureThreeRuneLogLikelihood: marginalThree, bruteForceLogLikelihood: enumeratedThree},
    actualShiftCount: actualShifts.length,
    actualTop10: actual.slice(0, 10),
    actualObserved: actual.find(x => x.shift === 0),
    actualMedian: actual[Math.floor(actual.length / 2)],
    actualZeroRankWithinTested: actual.findIndex(x => x.shift === 0) + 1,
    plantedShiftCount: plantShifts.length,
    plantedTop10: planted.slice(0, 10),
    plantedObserved: planted.find(x => x.shift === 0),
    plantedMedian: planted[Math.floor(planted.length / 2)],
    plantedZeroRankWithinTested: planted.findIndex(x => x.shift === 0) + 1,
    caveat: 'The page pair and scale are post-selected; rotation ranks are conditional, not global null p-values or a confirmed cipher.'
  };
}

if (require.main === module) process.stdout.write(JSON.stringify(study(), null, 2) + '\n');
module.exports = {likelihood, study, bruteThree};
