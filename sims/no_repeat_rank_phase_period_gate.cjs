"use strict";
/**
 * Periodic within-word phase-permutation gate for the LP2 no-repeat rank model.
 *
 * For each word and each phase (position - 1 mod period), allow an independent
 * arbitrary 28-symbol permutation of the predecessor-exclusion rank alphabet.
 * Same-phase within-word collision counts are invariant under those keys.
 *
 * The scan covers periods 1..8, uses exact word-length/erasure-matched GP
 * English controls, calibrates the best-period statistic with seeded Monte
 * Carlo manuscripts, and checks synthetic per-word/per-phase hidden-key plants.
 *
 * Run from repository root with Node >=20:
 *   node sims/no_repeat_rank_phase_period_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {encodeEnglish, seededRandom} = require("./outer_permutation_assignment.cjs");

const ROOT = path.resolve(__dirname, "..");
const M = 29;
const RANKS = 28;
const MAX_PERIOD = 8;
const REPLICATES = 2000;
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const parsed = parseSharedCorpus();
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.crossPageWords, 32);

const words = parsed.words.map((word, index) => {
  const x = [...word.runes].map(r => runeIndex.get(r));
  assert(x.every(v => Number.isInteger(v) && v >= 0 && v < M));
  return {index, x, length: x.length,
    startPage: word.startPage, endPage: word.endPage};
});
const targets = words.map((word, i) => {
  const internalErasures = new Set();
  for (let j = 1; j < word.length; j++) {
    if (word.x[j] === word.x[j - 1]) internalErasures.add(j);
  }
  const startErasure = i > 0 &&
    words[i - 1].endPage === word.startPage &&
    words[i - 1].x[words[i - 1].length - 1] === word.x[0];
  return {...word, internalErasures, startErasure};
});
const internalRepeatCount = targets.reduce(
  (n, w) => n + w.internalErasures.size, 0);
const wordStartRepeatCount = targets.reduce(
  (n, w) => n + (w.startErasure ? 1 : 0), 0);
assert.equal(internalRepeatCount, 63);
assert.equal(wordStartRepeatCount, 23);
assert.equal(internalRepeatCount + wordStartRepeatCount, 86);

function rankFromCipher(c, previous, kind) {
  assert.notEqual(c, previous);
  const rank = kind === "sorted"
    ? c - (c > previous ? 1 : 0)
    : ((c - previous + M) % M) - 1;
  assert(rank >= 0 && rank < RANKS);
  return rank;
}
function cipherFromRank(rank, previous, kind) {
  assert(rank >= 0 && rank < RANKS);
  return kind === "sorted"
    ? (rank >= previous ? rank + 1 : rank)
    : (previous + rank + 1) % M;
}
function phaseCollisionVector(values, length, mask) {
  const counts = Array.from({length: MAX_PERIOD}, (_, m) =>
    Array.from({length: m + 1}, () => Array(RANKS).fill(0)));
  for (let j = 1; j < length; j++) {
    if (mask.has(j)) continue;
    const value = values[j];
    for (let period = 1; period <= MAX_PERIOD; period++) {
      counts[period - 1][(j - 1) % period][value]++;
    }
  }
  const result = Array(MAX_PERIOD).fill(0);
  for (let period = 1; period <= MAX_PERIOD; period++) {
    for (let phase = 0; phase < period; phase++) {
      for (let symbol = 0; symbol < RANKS; symbol++) {
        const n = counts[period - 1][phase][symbol];
        result[period - 1] += n * (n - 1);
      }
    }
  }
  return result;
}
const pairs = Array(MAX_PERIOD).fill(0);
for (const word of targets) {
  const phaseSizes = Array.from({length: MAX_PERIOD}, (_, m) =>
    Array(m + 1).fill(0));
  for (let j = 1; j < word.length; j++) {
    if (word.internalErasures.has(j)) continue;
    for (let period = 1; period <= MAX_PERIOD; period++) {
      phaseSizes[period - 1][(j - 1) % period]++;
    }
  }
  for (let period = 1; period <= MAX_PERIOD; period++) {
    for (let phase = 0; phase < period; phase++) {
      const n = phaseSizes[period - 1][phase];
      pairs[period - 1] += n * (n - 1);
    }
  }
}
assert.deepEqual(pairs, [39930, 15720, 8026, 4560, 2616, 1454, 766, 396]);

const actual = {sorted: Array(MAX_PERIOD).fill(0),
  cyclic: Array(MAX_PERIOD).fill(0)};
for (const word of targets) {
  for (const kind of ["sorted", "cyclic"]) {
    const values = Array(word.length).fill(0);
    for (let j = 1; j < word.length; j++) {
      if (word.internalErasures.has(j)) continue;
      values[j] = rankFromCipher(word.x[j], word.x[j - 1], kind);
    }
    const scores = phaseCollisionVector(values, word.length,
      word.internalErasures);
    for (let period = 0; period < MAX_PERIOD; period++) {
      actual[kind][period] += scores[period];
    }
  }
}
assert.deepEqual(actual.sorted, [1438, 536, 308, 174, 132, 38, 28, 12]);
assert.deepEqual(actual.cyclic, [1486, 524, 322, 156, 110, 46, 40, 16]);

function foldTo28(symbol) {
  return symbol === 27 ? 10 : symbol === 28 ? 27 : symbol;
}
function sourceWords(file) {
  const text = fs.readFileSync(path.join(ROOT, "resources/control", file), "utf8");
  const normalized = text.toUpperCase()
    .replace(/V/g, "U").replace(/K/g, "C")
    .replace(/Q/g, "C").replace(/Z/g, "S");
  return normalized.split(/[^A-Z]+/).filter(Boolean)
    .map(word => encodeEnglish(word).map(foldTo28))
    .filter(word => word.length > 0);
}
const references = [
  {name: "Shakespeare", file: "shakespeare_first300k.txt", seed: 0x49a44001},
  {name: "Gibran", file: "gibran_prophet_58585.txt", seed: 0x49a45e10},
  {name: "Emerson", file: "emerson_essays_2944.txt", seed: 0x49a47c1f}
];
const patterns = new Map();
for (const word of targets) {
  const mask = [...word.internalErasures].sort((a, b) => a - b);
  const signature = word.length + "|" + mask.join(",");
  if (!patterns.has(signature)) {
    patterns.set(signature, {signature, length: word.length, mask, count: 0});
  }
  patterns.get(signature).count++;
}

function summarizeReference(reference) {
  const words = sourceWords(reference.file);
  const pools = Object.create(null);
  for (const word of words) (pools[word.length] ||= []).push(word);
  const scoreDistributions = new Map();
  const patternMoments = new Map();

  for (const pattern of patterns.values()) {
    const pool = pools[pattern.length];
    assert(pool && pool.length > 0,
      "No source words for length " + pattern.length);
    const mask = new Set(pattern.mask);
    const scores = pool.map(word =>
      phaseCollisionVector(word, pattern.length, mask));
    scoreDistributions.set(pattern.signature, scores);

    const mean = Array(MAX_PERIOD).fill(0);
    const secondMoment = Array(MAX_PERIOD).fill(0);
    for (const score of scores) {
      for (let period = 0; period < MAX_PERIOD; period++) {
        mean[period] += score[period];
        secondMoment[period] += score[period] * score[period];
      }
    }
    for (let period = 0; period < MAX_PERIOD; period++) {
      mean[period] /= scores.length;
      secondMoment[period] =
        Math.max(0, secondMoment[period] / scores.length -
          mean[period] * mean[period]);
    }
    patternMoments.set(pattern.signature,
      {mean, variance: secondMoment});
  }

  // Exact mean and variance of the independent, with-replacement word draws.
  const totalMean = Array(MAX_PERIOD).fill(0);
  const totalVariance = Array(MAX_PERIOD).fill(0);
  for (const pattern of patterns.values()) {
    const moment = patternMoments.get(pattern.signature);
    for (let period = 0; period < MAX_PERIOD; period++) {
      totalMean[period] += pattern.count * moment.mean[period];
      totalVariance[period] += pattern.count * moment.variance[period];
    }
  }
  const totalSD = totalVariance.map(Math.sqrt);
  assert(totalSD.every(x => x > 0));

  // Calibrate the maximum standardized score across all eight periods.
  const rng = seededRandom(reference.seed);
  const samples = new Float64Array(REPLICATES * MAX_PERIOD);
  for (let rep = 0; rep < REPLICATES; rep++) {
    const base = rep * MAX_PERIOD;
    for (const pattern of patterns.values()) {
      const distribution = scoreDistributions.get(pattern.signature);
      for (let n = 0; n < pattern.count; n++) {
        const score = distribution[
          Math.floor(rng() * distribution.length)];
        for (let period = 0; period < MAX_PERIOD; period++) {
          samples[base + period] += score[period];
        }
      }
    }
  }
  const nullMaxZ = new Float64Array(REPLICATES);
  for (let rep = 0; rep < REPLICATES; rep++) {
    let maxZ = -Infinity;
    for (let period = 0; period < MAX_PERIOD; period++) {
      const z = (samples[rep * MAX_PERIOD + period] - totalMean[period]) /
        totalSD[period];
      if (z > maxZ) maxZ = z;
    }
    nullMaxZ[rep] = maxZ;
  }

  const periodRows = [];
  for (let period = 0; period < MAX_PERIOD; period++) {
    periodRows.push({
      period: period + 1,
      orderedPairs: pairs[period],
      controlMeanIoC: totalMean[period] / pairs[period],
      controlSDIoC: totalSD[period] / pairs[period],
      actualSortedIoC: actual.sorted[period] / pairs[period],
      actualCyclicIoC: actual.cyclic[period] / pairs[period],
      sortedZ: (actual.sorted[period] - totalMean[period]) /
        totalSD[period],
      cyclicZ: (actual.cyclic[period] - totalMean[period]) /
        totalSD[period]
    });
  }

  const best = {};
  for (const kind of ["sorted", "cyclic"]) {
    const zValues = periodRows.map(row => row[kind + "Z"]);
    const maxZ = Math.max(...zValues);
    const bestPeriod = zValues.indexOf(maxZ) + 1;
    const lowerTailPlusOne = (1 + Array.from(nullMaxZ)
      .filter(x => x <= maxZ).length) / (REPLICATES + 1);
    best[kind] = {maxZ, bestPeriod, scanLowerTailPlusOne: lowerTailPlusOne};
  }
  return {sourceWords: words.length, matchedTargetWords: targets.length,
    replicates: REPLICATES, seed: "0x" + reference.seed.toString(16),
    periods: periodRows, best};
}

const controls = {};
for (const reference of references) {
  controls[reference.name] = summarizeReference(reference);
}
const allScanP = Object.values(controls).flatMap(control =>
  [control.best.sorted.scanLowerTailPlusOne,
   control.best.cyclic.scanLowerTailPlusOne]);
const maxScanP = Math.max(...allScanP);

function randomPermutation(n, rng) {
  const p = Array.from({length: n}, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  return p;
}
function inversePermutation(p) {
  const inverse = Array(p.length);
  p.forEach((value, i) => { inverse[value] = i; });
  return inverse;
}
function positivePlant(kind, period, seed, sourcePools) {
  const rng = seededRandom(seed);
  let previousCipher = null;
  let recovered = 0, leaderRecovered = 0, rankRecovered = 0;
  let markers = 0, forwardRunes = 0;
  for (let wi = 0; wi < targets.length; wi++) {
    const target = targets[wi];
    const boundaryReset = wi === 0 ||
      targets[wi - 1].endPage !== target.startPage;
    if (boundaryReset) previousCipher = null;
    const previousAtStart = previousCipher;
    const pool = sourcePools[target.length];
    assert(pool && pool.length > 0);
    const plaintext = pool[Math.floor(rng() * pool.length)];
    const leader = randomPermutation(M, rng);
    const leaderInverse = inversePermutation(leader);
    const phasePermutations = Array.from({length: period}, () =>
      randomPermutation(RANKS, rng));
    const phaseInverses = phasePermutations.map(inversePermutation);

    const ciphertext = [];
    if (target.startErasure) {
      assert.notEqual(previousAtStart, null);
      ciphertext.push(previousAtStart);
      markers++;
    } else {
      ciphertext.push(leader[plaintext[0]]);
      assert.equal(leaderInverse[ciphertext[0]], plaintext[0]);
      recovered++;
      leaderRecovered++;
    }
    for (let j = 1; j < target.length; j++) {
      const phase = (j - 1) % period;
      let value = cipherFromRank(
        phasePermutations[phase][plaintext[j]], ciphertext[j - 1], kind);
      if (target.internalErasures.has(j)) {
        value = ciphertext[j - 1];
        markers++;
      }
      ciphertext.push(value);
    }

    for (let j = 1; j < target.length; j++) {
      if (target.internalErasures.has(j)) continue;
      const phase = (j - 1) % period;
      const rank = rankFromCipher(ciphertext[j], ciphertext[j - 1], kind);
      assert.equal(phaseInverses[phase][rank], plaintext[j]);
      recovered++;
      rankRecovered++;
    }

    const recipher = [target.startErasure
      ? previousAtStart
      : leader[plaintext[0]]];
    for (let j = 1; j < target.length; j++) {
      const phase = (j - 1) % period;
      let value = cipherFromRank(
        phasePermutations[phase][plaintext[j]], recipher[j - 1], kind);
      if (target.internalErasures.has(j)) value = recipher[j - 1];
      recipher.push(value);
    }
    assert.deepEqual(recipher, ciphertext);
    forwardRunes += ciphertext.length;
    previousCipher = ciphertext[ciphertext.length - 1];
  }
  assert.equal(markers, 86);
  assert.equal(recovered, 12870);
  assert.equal(forwardRunes, 12956);
  return {period, rankConvention: kind, markerErasures: markers,
    recoveredNonMarkerSymbols: recovered, leaderSymbolsRecovered: leaderRecovered,
    rankSymbolsRecovered: rankRecovered, forwardCiphertextRunes: forwardRunes,
    exactForwardRoundTrip: true};
}
const shakespeareWords = sourceWords("shakespeare_first300k.txt");
const shakespearePools = Object.create(null);
for (const word of shakespeareWords) {
  (shakespearePools[word.length] ||= []).push(word);
}
const planted = [];
for (let period = 1; period <= MAX_PERIOD; period++) {
  for (const kind of ["sorted", "cyclic"]) {
    const seed = (0x51515151 + period * 17 +
      (kind === "cyclic" ? 1 : 0)) >>> 0;
    planted.push(positivePlant(kind, period, seed, shakespearePools));
  }
}

const output = {
  model: "word-reset predecessor-exclusion rank with an independent 28-symbol permutation for each word and each within-word phase",
  input: {
    runeBearingPages: 55,
    words: words.length,
    runes: parsed.runeCount,
    crossPageWords: parsed.crossPageWords,
    internalRepeatErasures: internalRepeatCount,
    wordStartRepeatErasures: wordStartRepeatCount,
    totalRepeatMarkers: internalRepeatCount + wordStartRepeatCount,
    eligibleRankSymbols: 9997,
    periodsScanned: Array.from({length: MAX_PERIOD}, (_, i) => i + 1),
    orderedPairsByPeriod: pairs
  },
  originalCollisionPairs: {
    sorted: actual.sorted,
    cyclic: actual.cyclic
  },
  controls,
  familywiseBonferroniUpperBoundAcrossSixSourceConventionComparisons:
    Math.min(1, 6 * maxScanP),
  planted,
  interpretation: "After selecting the best period among 1..8, both natural rank conventions remain below exact word-length/erasure-matched English-GP controls for all three references. The phase-specific permutations are independent per word and phase. Periods above 8, nonperiodic position-specific keys, alternative 29-symbol orders, other plaintext registers and altered segmentation remain open."
};
console.log(JSON.stringify(output, null, 2));
