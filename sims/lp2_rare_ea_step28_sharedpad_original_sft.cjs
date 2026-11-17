'use strict';

/**
 * Corrected source-native calibration for the rare-EA / rank-28 chain model.
 *
 * Candidate operator (still an analyst hypothesis, not an authenticated
 * Cicada instruction):
 *   D[p,j] = (C[p,j] - C[p,j-1]) mod 29
 *   D[p,j] = 0                              if P[p,j] = EA
 *   D[p,j] = 1 + ((P[p,j] + K[j] + S[p]) mod 28), otherwise.
 *
 * The earlier version greedily re-encoded editor-normalized Latin prose and
 * used the same reference stream both to fit the GP prior and to plant every
 * positive control. This version never reads that Latin file. It parses exact
 * GP rune indices from original solved-page transcription segments, trains
 * on one set of source pages, and plants only disjoint source pages.
 *
 * The two reciprocal page splits are sensitivity checks, not independent
 * language samples. Three seeds vary secret keys/salts over the same held-out
 * source pages; they are not three independent texts or a significance test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const data = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(
  path.join(root, '..', 'transcriptions', 'lp1_wulfic_canonical.txt'), 'utf8');
const M = 29;
const N = 28;
const EX = 28;
assert.equal(data.translit[EX], 'EA');

const runeIndex = new Map(data.runes.map((rune, i) => [rune, i]));
const segments = transcription.split('%');
assert.equal(segments.length, 16);

function sourcePage(segmentIndex, expectedRunes, pageNumber) {
  const page = Array.from(segments[segmentIndex])
    .filter(symbol => runeIndex.has(symbol))
    .map(symbol => runeIndex.get(symbol));
  assert.equal(page.length, expectedRunes,
    'Unexpected exact-rune count for LP1 page ' + pageNumber);
  return page;
}

// These are direct, clear GP plaintext pages in the original transcription.
// Segment indices are pinned by the canonical source file's page separators.
const source = {
  p5: sourcePage(3, 157, 5),
  p10: sourcePage(8, 187, 10),
  p11: sourcePage(9, 207, 11),
  p12: sourcePage(10, 192, 12),
  p13: sourcePage(11, 169, 13),
  p16: sourcePage(14, 89, 16),
  p57: data.pages.find(page => page.page === 57).indices
};
assert.equal(source.p57.length, 95);

// Reciprocal, non-overlapping splits: neither prior sees its plant pages.
const splits = [
  {
    id: 'A',
    trainingNames: ['p5', 'p16', 'p57'],
    plantNames: ['p10', 'p11', 'p12', 'p13']
  },
  {
    id: 'B',
    trainingNames: ['p10', 'p11', 'p12', 'p13'],
    plantNames: ['p5', 'p16', 'p57']
  }
];

const pages = data.pages
  .filter(page => page.page <= 55 && page.indices.length)
  .map(page => page.indices);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((sum, page) => sum + page.length, 0), 12956);

function steps(rows) {
  return rows.map(row => row.slice(1).map((value, j) =>
    (value - row[j] + M) % M));
}
const originalSteps = steps(pages);
const originalStepCount = originalSteps.reduce((sum, row) => sum + row.length, 0);
const originalZeroSteps = originalSteps.reduce((sum, row) =>
  sum + row.filter(value => value === 0).length, 0);
assert.equal(originalStepCount, 12901);
assert.equal(originalZeroSteps, 86);

function makePrior(trainingPages) {
  const counts = Array(M).fill(0.5);
  for (const page of trainingPages)
    for (const rune of page) counts[rune]++;
  const total = counts.reduce((sum, value) => sum + value, 0);
  const logPlain = counts.map(value => Math.log(value / total));
  const nonEa = counts.slice(0, N);
  const nonEaTotal = nonEa.reduce((sum, value) => sum + value, 0);
  const probability = nonEa.map(value => value / nonEaTotal);
  const difference = Array(N).fill(0);
  for (let x = 0; x < N; x++)
    for (let y = 0; y < N; y++)
      difference[(x - y + N) % N] += probability[x] * probability[y];
  return {
    logPlain,
    logDifference: difference.map(Math.log),
    eaProbability: counts[EX] / total,
    trainingRunes: trainingPages.reduce((sum, page) => sum + page.length, 0)
  };
}

/** Fit each K[j] only on other physical pages, then score the held-out page. */
function heldout(rows, logPlain) {
  const foldCount = Math.min(5, rows.length);
  const maxLength = Math.max(...rows.map(page => page.length));
  let totalScore = 0;
  let totalLength = 0;
  const folds = [];
  for (let fold = 0; fold < foldCount; fold++) {
    const key = Array(maxLength).fill(0);
    for (let j = 0; j < maxLength; j++) {
      let bestScore = -Infinity;
      for (let candidate = 0; candidate < N; candidate++) {
        let score = 0;
        for (let p = 0; p < rows.length; p++) {
          if (p % foldCount === fold || j >= rows[p].length) continue;
          const delta = rows[p][j];
          if (delta)
            score += logPlain[(delta - 1 - candidate + N) % N];
        }
        if (score > bestScore) {
          bestScore = score;
          key[j] = candidate;
        }
      }
    }
    let score = 0;
    let length = 0;
    let zeros = 0;
    for (let p = 0; p < rows.length; p++) {
      if (p % foldCount !== fold) continue;
      for (let j = 0; j < rows[p].length; j++) {
        const delta = rows[p][j];
        if (delta) score += logPlain[(delta - 1 - key[j] + N) % N];
        else {
          score += logPlain[EX];
          zeros++;
        }
        length++;
      }
    }
    folds.push({fold, length, zeros, mean: score / length});
    totalScore += score;
    totalLength += length;
  }
  return {mean: totalScore / totalLength, length: totalLength, folds};
}

/**
 * Cancel every common K[j]. Each page pair receives its own best relative
 * salt among all 28 shifts, more permissive than coherent page-salt fitting.
 */
function pairwise(rows, logDifference) {
  let totalScore = 0;
  let totalPairs = 0;
  let pairs = 0;
  for (let p = 0; p < rows.length; p++) {
    for (let q = p + 1; q < rows.length; q++) {
      const bins = Array(N).fill(0);
      const length = Math.min(rows[p].length, rows[q].length);
      for (let j = 0; j < length; j++) {
        const a = rows[p][j];
        const b = rows[q][j];
        if (!a || !b) continue;
        bins[(a - b + N) % N]++;
        totalPairs++;
      }
      let best = -Infinity;
      for (let shift = 0; shift < N; shift++) {
        let score = 0;
        for (let delta = 0; delta < N; delta++)
          score += bins[delta] * logDifference[(delta - shift + N) % N];
        if (score > best) best = score;
      }
      totalScore += best;
      pairs++;
    }
  }
  return {mean: totalScore / totalPairs, pairedRunes: totalPairs, pairs};
}

function random(seed) {
  let state = seed >>> 0;
  return () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0)
    / 4294967296);
}

function encrypt(plaintext, key, salt, start) {
  const chain = [start];
  for (let j = 0; j < plaintext.length; j++) {
    const rune = plaintext[j];
    const delta = rune === EX ? 0 : 1 + ((rune + key[j] + salt) % N);
    chain.push((chain[j] + delta) % M);
  }
  return chain;
}

function decrypt(chain, key, salt) {
  const plaintext = [];
  for (let j = 1; j < chain.length; j++) {
    const delta = (chain[j] - chain[j - 1] + M) % M;
    plaintext.push(delta === 0 ? EX :
      (delta - 1 - key[j - 1] - salt + 2 * N) % N);
  }
  return plaintext;
}

function plant(plantPages, seed) {
  const rng = random(2014 + 3301 * seed);
  const maxLength = Math.max(...plantPages.map(page => page.length));
  const key = Array.from({length: maxLength}, () => Math.floor(rng() * N));
  const salts = plantPages.map(() => Math.floor(rng() * N));
  const plaintext = plantPages.map(page => page.slice());
  const common = plaintext.map((page, i) => encrypt(page, key, 0, i % M));
  const salted = plaintext.map((page, i) =>
    encrypt(page, key, salts[i], i % M));
  for (let i = 0; i < plaintext.length; i++) {
    assert.deepEqual(decrypt(common[i], key, 0), plaintext[i]);
    assert.deepEqual(decrypt(salted[i], key, salts[i]), plaintext[i]);
  }
  const independent = plaintext.map(page => {
    const chain = [Math.floor(rng() * M)];
    for (const rune of page) {
      const delta = rune === EX ? 0 : 1 + Math.floor(rng() * N);
      chain.push((chain[chain.length - 1] + delta) % M);
    }
    return chain;
  });
  return {
    common: steps(common),
    salted: steps(salted),
    independent: steps(independent),
    roundtrip: true
  };
}

function threshold(positiveScores, nullScores) {
  const worstPositive = Math.min(...positiveScores);
  const bestNull = Math.max(...nullScores);
  if (bestNull >= worstPositive)
    return {separated: false, threshold: null, worstPositive, bestNull};
  return {
    separated: true,
    threshold: (worstPositive + bestNull) / 2,
    worstPositive,
    bestNull
  };
}

function evaluateSplit(split) {
  const trainingPages = split.trainingNames.map(name => source[name]);
  const plantPages = split.plantNames.map(name => source[name]);
  const prior = makePrior(trainingPages);
  const original = {
    m1: heldout(originalSteps, prior.logPlain),
    m2: pairwise(originalSteps, prior.logDifference)
  };
  const controls = [];
  for (let seed = 1; seed <= 3; seed++) {
    const generated = plant(plantPages, seed);
    controls.push({
      seed,
      roundtrip: generated.roundtrip,
      m1Positive: heldout(generated.common, prior.logPlain).mean,
      m1Null: heldout(generated.independent, prior.logPlain).mean,
      m2Positive: pairwise(generated.salted, prior.logDifference).mean,
      m2Null: pairwise(generated.independent, prior.logDifference).mean
    });
  }
  const m1Threshold = threshold(
    controls.map(control => control.m1Positive),
    controls.map(control => control.m1Null));
  const m2Threshold = threshold(
    controls.map(control => control.m2Positive),
    controls.map(control => control.m2Null));
  assert(controls.every(control => control.roundtrip));
  assert(original.m1.mean < Math.min(...controls.map(c => c.m1Positive)));
  assert(original.m2.mean < Math.min(...controls.map(c => c.m2Positive)));
  if (m1Threshold.separated) assert(original.m1.mean < m1Threshold.threshold);
  if (m2Threshold.separated) assert(original.m2.mean < m2Threshold.threshold);
  return {
    id: split.id,
    trainingPages: split.trainingNames,
    plantPages: split.plantNames,
    trainingRunes: prior.trainingRunes,
    plantRunes: plantPages.reduce((sum, page) => sum + page.length, 0),
    trainingEaProbability: prior.eaProbability,
    original,
    controls,
    m1Threshold,
    m2Threshold
  };
}

const results = splits.map(evaluateSplit);
console.log(JSON.stringify({
  originalRunes: pages.reduce((sum, page) => sum + page.length, 0),
  originalSteps: originalStepCount,
  originalZeroSteps: originalZeroSteps,
  originalZeroStepRate: originalZeroSteps / originalStepCount,
  sourcePageRunes: Object.fromEntries(
    Object.entries(source).map(([name, page]) => [name, page.length])),
  results
}, null, 2));
console.log('PASS: exact source-page parsing, disjoint source-native plants, and reversible controls');
