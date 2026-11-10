'use strict';

/**
 * Compare pointwise lag-five copying with repeated two-rune blocks.
 * Known Phase-25 M3 has an M1 lag-six anti-doublet repair followed
 * by independent copy from five runes earlier at probability eps.
 * This exact-word-length simulation tests whether that model explains
 * the *clustering* of repeats after its total lag-five count is matched.
 *
 * Run: node sims/lag5_burst_copy_probe.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {readWords, T, random32} = require('./lag6_sparse_collision_repair.cjs');

const rawText = fs.readFileSync(path.resolve(__dirname,
  '../resources/lp2-transcription.txt'), 'utf8');
const original = readWords(rawText).words;
const lengths = original.map(w => w.length);
const N = 29;
const REPS = Number(process.env.LP2_BURST_REPS || 12000);
assert.ok(Number.isSafeInteger(REPS) && REPS >= 100);
const P = 1 - N * 86 / 12955;
const EPS = 0.016;
const random = random32(0x33010055);
const r29 = () => random() % N;
const rFloat = () => random() / 4294967296;

/** @param {number[][]} words */
function stats(words) {
  const out = {lag5:0, S5:0, doubles:0, run3:0, multihitWords:0,
    repeatedDigraphWords:0, lag6Affine:0, adjacent:0,
    run2ByLag:Array(9).fill(0), source5:Array(29).fill(0)};
  let prev = -1;
  for (const w of words) {
    let hits = 0, adjacentRun = false;
    const chains = Array(9).fill(0);
    for (let i = 0; i < w.length; i++) {
      const c = w[i];
      if (c === prev) out.adjacent++;
      prev = c;
      if (i >= 6 && c === T(w[i-6])) out.lag6Affine++;
      for (let lag = 2; lag <= 8; lag++) {
        chains[lag] = i >= lag && c === w[i-lag] ? chains[lag] + 1 : 0;
        if (chains[lag] === 2) {
          out.run2ByLag[lag]++;
          if (lag === 5) {out.doubles++;adjacentRun=true}
        }
        if (lag === 5 && chains[lag] === 3) out.run3++;
      }
      if (i >= 5 && c === w[i-5]) {
        out.lag5++; hits++; out.source5[w[i-5]]++;
        if (c === 15) out.S5++;
      }
    }
    if (hits >= 2) out.multihitWords++;
    if (adjacentRun) out.repeatedDigraphWords++;
  }
  return out;
}

/** M3 baseline, with no added word-dependent or block-dependent parameter. */
function simulateM3() {
  const words = [];
  let prev = -1;
  for (const n of lengths) {
    const w = [];
    for (let i = 0; i < n; i++) {
      let c = r29();
      if (c === prev && rFloat() < P) {
        const target = i >= 6 ? T(w[i-6]) : prev;
        c = target === prev ? (prev + 1 + random() % 28) % N : target;
      } else if (i >= 5 && rFloat() < EPS) {
        c = w[i-5];
      }
      w.push(c);
      prev = c;
    }
    words.push(w);
  }
  return stats(words);
}

/**
 * Conditional null for hit *positions* only. Given exactly the observed
 * number of lag-five matches in every word, independently assign each
 * word's hit positions uniformly among its available (i >= 5) slots.
 * This avoids assuming a particular distribution of hit count by word.
 * Its only test statistic is the number of words with an adjacent pair.
 * @param {number[][]} words Real words.
 */
function exactConditionalWords(words) {
  const probabilities = [];
  let observed = 0;
  for (const w of words) {
    if (w.length < 7) continue;
    const m = w.length - 5, hits = [];
    for (let i = 5; i < w.length; i++)
      if (w[i] === w[i-5]) hits.push(i - 5);
    const k = hits.length;
    if (k < 2) continue;
    observed += +hits.some((x, i) => i > 0 && x === hits[i-1] + 1);
    let total = 0, success = 0;
    const picked = [];
    function enumCombinations(start) {
      if (picked.length === k) {
        total++;
        if (picked.some((x, i) => i > 0 && x === picked[i-1] + 1))
          success++;
        return;
      }
      for (let j = start; j <= m-(k-picked.length); j++) {
        picked.push(j);
        enumCombinations(j+1);
        picked.pop();
      }
    }
    enumCombinations(0);
    probabilities.push(success/total);
  }
  const pmf = [1];
  for (const p of probabilities) {
    pmf.push(0);
    for (let i = pmf.length-1; i >= 0; i--)
      pmf[i] = (pmf[i] || 0) * (1-p) + (i ? pmf[i-1]*p : 0);
  }
  return {observed, eligibleWords:probabilities.length,
    expected:probabilities.reduce((s,n)=>s+n,0),
    tailProbability:pmf.slice(observed).reduce((s,n)=>s+n,0),
    probabilities};
}

/** @param {number[]} values @param {number} actual */
function compare(values, actual) {
  const mean = values.reduce((s,x)=>s+x,0)/values.length;
  const sd = Math.sqrt(values.reduce((s,x)=>s+(x-mean)**2,0) /
    values.length);
  return {actual, mean, sd, z:(actual-mean)/sd,
    pUpper:(1+values.filter(x=>x>=actual).length)/(values.length+1)};
}

function main() {
  const actual = stats(original);
  assert.equal(actual.lag5,104);
  assert.equal(actual.S5,11);
  assert.equal(actual.doubles,8);
  assert.equal(actual.run3,1);
  assert.equal(actual.multihitWords,9);
  const keys = ['lag5','S5','doubles','run3','multihitWords',
    'repeatedDigraphWords','lag6Affine','adjacent'];
  const samples = Object.fromEntries(keys.map(k=>[k,[]]));
  const lagSamples = Array.from({length:9},()=>[]);
  const maxSource5 = [], closeTotal = [];
  let joint = 0;
  for (let r = 0; r < REPS; r++) {
    const a = simulateM3();
    for (const key of keys) samples[key].push(a[key]);
    for (let lag = 2; lag <= 8; lag++)
      lagSamples[lag].push(a.run2ByLag[lag]);
    maxSource5.push(Math.max(...a.source5));
    if (a.lag5 >= 100 && a.lag5 <= 108) closeTotal.push(a.doubles);
    joint += +(a.doubles >= actual.doubles && a.S5 >= actual.S5);
  }
  const tests = Object.fromEntries(keys.map(k=>[k,compare(samples[k],
    actual[k])]));
  const lag = [];
  for (let i = 2; i <= 8; i++)
    lag.push({lag:i,...compare(lagSamples[i],actual.run2ByLag[i])});
  const chosenZ = lag.find(x=>x.lag===5).z;
  let exceed = 0;
  for (let i=0;i<REPS;i++) {
    let mx = -Infinity;
    for (const t of lag) {
      const z = (lagSamples[t.lag][i] - t.mean)/t.sd;
      if (z > mx) mx = z;
    }
    if (mx >= chosenZ) exceed++;
  }
  const report = {
    model:'Published M3: M1 anti-doublet + independent lag5 rune copies',
    input:{runes:12956,words:original.length,lag5Eligible:2105},
    params:{antiDoublet:P,independentCopy:EPS,seed:'0x33010055',
      replicates:REPS},
    actual,
    estimated:tests,
    longLagRepeatedBlocks:lag,
    maxOverLag2To8:{selectedLag5Z:chosenZ,
      familywiseP:(1+exceed)/(1+REPS)},
    S5Across29RuneSources:{observed:actual.S5,
      maxSourceInObserved:Math.max(...actual.source5),
      empiricalP:(1+maxSource5.filter(x=>x>=Math.max(...actual.source5)).length)/(1+REPS)},
    jointSAndBlock:{events:joint,pUpper:(joint+1)/(REPS+1)},
    conditionalSimilarLag5Totals:{
      min:100,max:108,n:closeTotal.length,
      mean:closeTotal.reduce((s,n)=>s+n,0)/closeTotal.length,
      pUpper:(1+closeTotal.filter(x=>x>=actual.doubles).length) /
        (1+closeTotal.length)},
    exactConditionalHitPositionNull:exactConditionalWords(original)
  };
  assert.ok(tests.lag5.mean > 99 && tests.lag5.mean < 110);
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
}
if (require.main===module) main();
module.exports={stats,simulateM3,exactConditionalWords};
