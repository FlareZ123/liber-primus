'use strict';

/**
 * Falsifiable sparse-collision-repair model of the LP2 lag-six affine echo.
 *
 * Independent unencoded runes are uniform on 0..28. Whenever an emission
 * repeats the preceding ciphertext rune, it is repaired with probability p.
 * At local word index >=6, the repair target is T(C[i-6]) where
 * T(x)=(24-2*x) mod29, unless it collides with the preceding rune.
 * At all other sites, choose a uniformly distributed nonrepeating target.
 *
 * p is estimated solely from the independently measurable observed global
 * adjacent-repeat rate: p = 1-29*(observed repeats)/(12956-1).
 * The published T and lag six were historically selected on LP2; matching
 * lag-six counts here is explanatory fit, not independent discovery.
 *
 * The test *independently predicts* a range of untouched observables,
 * especially the lag-five identity and index-15 repetition patterns.
 *
 * Reproduce: node sims/lag6_sparse_collision_repair.cjs
 * Optional 1000 runs: LP2_SPARSE_REPS=1000 node sims/lag6_sparse_collision_repair.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');

const MOD = 29;
const REPS = Number(process.env.LP2_SPARSE_REPS || 5000);
assert.ok(Number.isSafeInteger(REPS) && REPS >= 100);
const ROOT = path.resolve(__dirname, '..');
const ALPHABET = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const INDEX = new Map(ALPHABET.map((v, i) => [v, i]));
const KEY_STATS = ['lag6Affine', 'lag5Equal', 'lag5S', 'lag4Equal',
  'lag6Equal', 'adjacentWithin', 'adjacentAcross', 'nonadjacentPairs',
  'wordsWithAffine', 'additionalAffinePerWord', 'maxSourceAffine'];
const T = x => ((24 - 2 * x) % MOD + MOD) % MOD;

/** @param {string} raw Original LP2 rune transcription. */
function readWords(raw) {
  const full = raw.split('%').slice(0, 55).join('')
    .replace(/\/\s*\n/g, '');
  const sections = full.split('$').map(str => str.split(/[-.&\s]+/)
    .map(token => [...token].filter(c => INDEX.has(c))
      .map(c => INDEX.get(c)))
    .filter(w => w.length));
  const words = sections.flat();
  assert.equal(words.length, 2896);
  assert.equal(words.reduce((s, w) => s + w.length, 0), 12956);
  assert.equal(sections.length, 8);
  return {words, sections};
}

/**
 * @param {number[][]} words Rune words in manuscript order.
 * @returns {Record<string, number>}
 */
function metrics(words) {
  const result = Object.fromEntries(KEY_STATS.map(k => [k, 0]));
  const source = new Uint16Array(MOD);
  let preceding = -1;
  for (const word of words) {
    let wordAffine = 0;
    for (let i = 0; i < word.length; i++) {
      const symbol = word[i];
      if (preceding === symbol) {
        result[i ? 'adjacentWithin' : 'adjacentAcross']++;
      }
      preceding = symbol;
      if (i >= 4 && symbol === word[i-4]) result.lag4Equal++;
      if (i >= 5 && symbol === word[i-5]) result.lag5Equal++;
      if (i >= 5 && symbol === 15 && word[i-5] === 15) result.lag5S++;
      if (i >= 6 && symbol === word[i-6]) result.lag6Equal++;
      if (i >= 6 && symbol === T(word[i-6])) {
        result.lag6Affine++;
        source[word[i-6]]++;
        wordAffine++;
      }
    }
    if (wordAffine) result.wordsWithAffine++;
    if (wordAffine > 1) result.additionalAffinePerWord += wordAffine - 1;
    if (word.length >= 4 && word.length <= 9) {
      for (let i = 0; i < word.length; i++) {
        for (let j = i + 2; j < word.length; j++) {
          result.nonadjacentPairs += +(word[i] === word[j]);
        }
      }
    }
  }
  result.maxSourceAffine = Math.max(...source);
  return result;
}

/** @param {number} seed Nonzero 32-bit xorshift initial state. */
function random32(seed) {
  let x = seed >>> 0;
  assert.ok(x);
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}

/**
 * @param {number[]} lengths Exactly the observed word lengths.
 * @param {number} repairProbability Doublet repair probability from LP2.
 * @param {boolean} targetLag6 True for T(c[i-6]), false for uniform repair.
 * @param {() => number} rand xorshift32.
 */
function simulate(lengths, repairProbability, targetLag6, rand) {
  const words = [];
  let preceding = -1;
  for (const n of lengths) {
    const word = [];
    for (let i = 0; i < n; i++) {
      let c = rand() % MOD;
      if (c === preceding && rand() / 4294967296 < repairProbability) {
        const target = targetLag6 && i >= 6 ? T(word[i-6]) : preceding;
        c = target === preceding
          ? (preceding + 1 + rand() % 28) % MOD : target;
      }
      word.push(c);
      preceding = c;
    }
    words.push(word);
  }
  return words;
}

/** @param {number} observed Observed integer statistic.
 *  @param {number[]} values Simulated integer statistics. */
function comparison(observed, values) {
  const mean = values.reduce((s, x) => s + x, 0) / values.length;
  const sd = Math.sqrt(values.reduce((s, x) => s + (x - mean)**2, 0) /
    values.length);
  return {
    observed,
    mean,
    sd,
    z:sd > 0 ? (observed - mean) / sd : null,
    pUpper:(1 + values.filter(x => x >= observed).length) /
      (1 + values.length),
    pLower:(1 + values.filter(x => x <= observed).length) /
      (1 + values.length)
  };
}

function main() {
  const raw = fs.readFileSync(path.join(ROOT,
    'resources/lp2-transcription.txt'), 'utf8');
  const {words} = readWords(raw);
  const observed = metrics(words);
  const n = words.reduce((s, w) => s + w.length, 0);
  const doublets = observed.adjacentWithin + observed.adjacentAcross;
  const repairProbability = 1 - MOD * doublets / (n - 1);
  assert.ok(repairProbability > 0 && repairProbability < 1);
  const lengths = words.map(w => w.length);
  const report = {
    status:'hypothesis test; no LP2 decryption or recovered key',
    inputSha256:createHash('sha256').update(raw).digest('hex'),
    model: {
      modulus:MOD,
      affineTarget:'T(x) = (24 - 2*x) mod29, only within a word at lag6',
      generator:'uniform GP runes; stochastic repair of adjacent duplicates',
      repairProbability,
      repairCalibration:{observedDoublets:doublets,
        observedTransitions:n - 1},
      replicatesPerModel:REPS,
      seed:'0x31033019',
      note:'Affine rule preselected from real LP2; success on lag6 is in-sample'
    },
    observables:{}
  };
  const rng = random32(0x31033019);
  const modes = {uniformRepair:{},lag6TargetedRepair:{}};
  for (const [name, targeted] of [['uniformRepair', false],
    ['lag6TargetedRepair', true]]) {
    const generated = Object.fromEntries(KEY_STATS.map(k => [k, []]));
    for (let trial = 0; trial < REPS; trial++) {
      const sample = metrics(simulate(lengths, repairProbability, targeted,
        rng));
      for (const key of KEY_STATS) generated[key].push(sample[key]);
    }
    for (const key of KEY_STATS)
      modes[name][key] = comparison(observed[key], generated[key]);
  }
  report.observables = modes;
  assert.ok(modes.lag6TargetedRepair.lag6Affine.mean > 70);
  assert.ok(modes.uniformRepair.lag6Affine.mean < 50);
  assert.ok(modes.lag6TargetedRepair.lag5S.mean < 5);
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
}

if (require.main === module) main();
module.exports = {readWords, T, metrics, simulate, comparison, random32};
