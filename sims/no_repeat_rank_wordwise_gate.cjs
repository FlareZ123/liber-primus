"use strict";
/**
 * Word-reset extension of the 29-to-28 predecessor-exclusion rank inverse.
 *
 * Hypothesis: each canonical word has an independent secret 28-symbol
 * permutation of the sorted or cyclic rank stream. The first rune is a
 * separate 29-symbol leader code. Repeated ciphertext outputs are treated as
 * erasures at their exact original positions.
 *
 * A per-word bijection cannot change the within-word rank collision count.
 * This program tests that necessary condition against exact word-length and
 * erasure-matched GP-English source controls, then checks a fully reversible
 * synthetic per-word-key plant.
 *
 * Run from repository root with Node >=20:
 *   node sims/no_repeat_rank_wordwise_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {encodeEnglish, seededRandom} = require("./outer_permutation_assignment.cjs");

const ROOT = path.resolve(__dirname, "..");
const M = 29;
const RANKS = 28;
const REPLICATES = 5000;
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
function collisionCount(values, length, mask) {
  const counts = Array(RANKS).fill(0);
  for (let j = 1; j < length; j++) {
    if (!mask.includes(j)) counts[values[j]]++;
  }
  return counts.reduce((sum, n) => sum + n * (n - 1), 0);
}
function actualStats(kind) {
  let collisions = 0, pairs = 0, valid = 0, wordsWithPairs = 0;
  let zeroCollisionWords = 0;
  for (const word of targets) {
    const counts = Array(RANKS).fill(0);
    let n = 0;
    for (let j = 1; j < word.length; j++) {
      if (word.internalErasures.has(j)) continue;
      counts[rankFromCipher(word.x[j], word.x[j - 1], kind)]++;
      n++;
    }
    const c = counts.reduce((sum, x) => sum + x * (x - 1), 0);
    const p = n * (n - 1);
    collisions += c;
    pairs += p;
    valid += n;
    if (p) wordsWithPairs++;
    if (!c) zeroCollisionWords++;
  }
  return {collisions, pairs, ioc: collisions / pairs,
    validRankSymbols: valid, wordsWithPairs, zeroCollisionWords};
}
const actual = {
  sorted: actualStats("sorted"),
  cyclic: actualStats("cyclic")
};
assert.equal(actual.sorted.validRankSymbols, 9997);
assert.equal(actual.cyclic.validRankSymbols, 9997);
assert.equal(actual.sorted.pairs, 39930);
assert.equal(actual.cyclic.pairs, 39930);
assert.equal(actual.sorted.collisions, 1438);
assert.equal(actual.cyclic.collisions, 1486);

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
  {name: "Shakespeare", file: "shakespeare_first300k.txt", seed: 0x49a33031},
  {name: "Gibran", file: "gibran_prophet_58585.txt", seed: 0x49a34f20},
  {name: "Emerson", file: "emerson_essays_2944.txt", seed: 0x49a36e0f}
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
const pairsTotal = targets.reduce((sum, word) => {
  const n = word.length - 1 - word.internalErasures.size;
  return sum + n * (n - 1);
}, 0);
assert.equal(pairsTotal, 39930);

function summarizeControl(reference) {
  const words = sourceWords(reference.file);
  const pools = Object.create(null);
  for (const word of words) {
    (pools[word.length] ||= []).push(word);
  }
  const scoreDistributions = new Map();
  for (const pattern of patterns.values()) {
    const pool = pools[pattern.length];
    assert(pool && pool.length > 0, "No source words for length " + pattern.length);
    scoreDistributions.set(pattern.signature,
      pool.map(word => collisionCount(word, pattern.length, pattern.mask)));
  }
  const rng = seededRandom(reference.seed);
  const samples = new Float64Array(REPLICATES);
  for (let rep = 0; rep < REPLICATES; rep++) {
    let collisions = 0;
    for (const pattern of patterns.values()) {
      const distribution = scoreDistributions.get(pattern.signature);
      for (let i = 0; i < pattern.count; i++) {
        collisions += distribution[Math.floor(rng() * distribution.length)];
      }
    }
    samples[rep] = collisions;
  }
  let mean = 0;
  for (const x of samples) mean += x;
  mean /= REPLICATES;
  let variance = 0;
  for (const x of samples) variance += (x - mean) ** 2;
  const sd = Math.sqrt(variance / (REPLICATES - 1));
  const lowerTail = observed =>
    (1 + Array.from(samples).filter(x => x <= observed).length) /
      (REPLICATES + 1);
  return {
    sourceWords: words.length,
    matchedTargetWords: targets.length,
    replicates: REPLICATES,
    seed: "0x" + reference.seed.toString(16),
    meanCollisions: mean,
    sdCollisions: sd,
    meanIoC: mean / pairsTotal,
    sdIoC: sd / pairsTotal,
    sortedZ: (actual.sorted.collisions - mean) / sd,
    cyclicZ: (actual.cyclic.collisions - mean) / sd,
    sortedControlsAtOrBelow: Array.from(samples)
      .filter(x => x <= actual.sorted.collisions).length,
    cyclicControlsAtOrBelow: Array.from(samples)
      .filter(x => x <= actual.cyclic.collisions).length,
    sortedLowerTailPlusOne: lowerTail(actual.sorted.collisions),
    cyclicLowerTailPlusOne: lowerTail(actual.cyclic.collisions)
  };
}
const controls = {};
for (const reference of references) {
  controls[reference.name] = summarizeControl(reference);
}

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
function positivePlant(kind, seed) {
  const rng = seededRandom(seed);
  const source = sourceWords("shakespeare_first300k.txt");
  const pools = Object.create(null);
  for (const word of source) (pools[word.length] ||= []).push(word);
  let previousCipher = null;
  let recovered = 0, firstRecovered = 0, rankRecovered = 0;
  let markers = 0, reciphered = 0, pageBoundaryWordStarts = 0;
  for (let wi = 0; wi < targets.length; wi++) {
    const target = targets[wi];
    const pageReset = wi === 0 ||
      targets[wi - 1].endPage !== target.startPage;
    if (pageReset) {
      previousCipher = null;
      pageBoundaryWordStarts++;
    }
    const previousAtStart = previousCipher;
    const pool = pools[target.length];
    assert(pool && pool.length > 0);
    const plaintext = pool[Math.floor(rng() * pool.length)];
    const leader = randomPermutation(M, rng);
    const leaderInverse = inversePermutation(leader);
    const sigma = randomPermutation(RANKS, rng);
    const sigmaInverse = inversePermutation(sigma);

    const ciphertext = [];
    if (target.startErasure) {
      assert.notEqual(previousAtStart, null);
      ciphertext.push(previousAtStart);
      markers++;
    } else {
      ciphertext.push(leader[plaintext[0]]);
      assert.equal(leaderInverse[ciphertext[0]], plaintext[0]);
      recovered++;
      firstRecovered++;
    }
    for (let j = 1; j < target.length; j++) {
      let value = cipherFromRank(sigma[plaintext[j]], ciphertext[j - 1], kind);
      if (target.internalErasures.has(j)) {
        value = ciphertext[j - 1];
        markers++;
      }
      ciphertext.push(value);
    }

    for (let j = 1; j < target.length; j++) {
      if (target.internalErasures.has(j)) continue;
      const rank = rankFromCipher(ciphertext[j], ciphertext[j - 1], kind);
      assert.equal(sigmaInverse[rank], plaintext[j]);
      recovered++;
      rankRecovered++;
    }

    const recipher = [target.startErasure
      ? previousAtStart
      : leader[plaintext[0]]];
    for (let j = 1; j < target.length; j++) {
      let value = cipherFromRank(sigma[plaintext[j]], recipher[j - 1], kind);
      if (target.internalErasures.has(j)) value = recipher[j - 1];
      recipher.push(value);
    }
    assert.deepEqual(recipher, ciphertext);
    reciphered += ciphertext.length;
    previousCipher = ciphertext[ciphertext.length - 1];
  }
  assert.equal(markers, 86);
  assert.equal(recovered, 12870);
  assert.equal(reciphered, 12956);
  return {rankConvention: kind, recovered, firstRecovered, rankRecovered,
    markerErasures: markers, forwardCiphertextRunes: reciphered,
    exactForwardRoundTrip: true, pageBoundaryWordStarts};
}
const planted = {
  sorted: positivePlant("sorted", 0x51515151),
  cyclic: positivePlant("cyclic", 0x51515152)
};
const output = {
  model: "word-reset predecessor-exclusion 29-to-28 rank followed by an independent fixed 28-symbol permutation per word",
  input: {
    runeBearingPages: 55,
    physicalPage50HasNoRunes: true,
    words: words.length,
    runes: parsed.runeCount,
    crossPageWords: parsed.crossPageWords,
    internalRepeatErasures: internalRepeatCount,
    wordStartRepeatErasures: wordStartRepeatCount,
    totalRepeatMarkers: internalRepeatCount + wordStartRepeatCount,
    eligibleRankSymbols: actual.sorted.validRankSymbols,
    withinWordOrderedPairs: pairsTotal,
    rankMaskPatterns: patterns.size
  },
  original: actual,
  controls,
  familywiseBonferroniUpperBoundAcrossSixComparisons:
    Math.min(1, 6 / (REPLICATES + 1)),
  planted,
  interpretation: "A per-word bijection cannot change within-word rank collisions. Both natural sorted/cyclic rank conventions fail exact word-length/erasure-matched English-GP controls. This does not test a rank ordering that changes by word, a permutation evolving within a word, other plaintext registers, or altered segmentation."
};
console.log(JSON.stringify(output, null, 2));
