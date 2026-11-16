'use strict';

/**
 * Agent 8 original-cipher six-back relation and invertibility SFT.
 * Run: node sims/lp2_sixback_original_inverse_sft.cjs
 *
 * Uses unchanged canonical LP2 runes and authentic printed word boundaries.
 * The 812-map family is frozen to every invertible affine map mod 29.
 * Null permutations preserve each complete word's rune multiset, length and
 * number of adjacent equal pairs, including 32 words spanning physical pages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8');
const alphabet = new Map(corpus.runes.map((rune, i) => [rune, i]));
const chunks = transcription.split('%').slice(0, 55);
const words = [];
let values = [];
let pages = [];
for (let chunk = 0; chunk < chunks.length; chunk++) {
  for (const rune of chunks[chunk].replace(/[\/\s]/g, '')) {
    if (alphabet.has(rune)) {
      values.push(alphabet.get(rune));
      pages.push(chunk < 50 ? chunk : chunk + 1);
    } else if (values.length > 0) {
      words.push({values, pages});
      values = [];
      pages = [];
    }
  }
}
if (values.length > 0) words.push({values, pages});

const original = words.flatMap(word => word.values);
const control = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(words.length, 2896);
assert.equal(original.length, 12956);
assert.deepEqual(original, control);
const carries = words.filter(word => word.pages[0] !== word.pages.at(-1));
assert.equal(carries.length, 32);

/** @param {number} a GP29 index six positions earlier */
function target(a) {
  return (24 - 2 * a + 58) % 29;
}
assert.equal(3301 % 29, 24);
assert.equal(target(8), 8);

const CHAPTER_LENGTHS = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
const boundaries = [0];
for (const length of CHAPTER_LENGTHS) boundaries.push(boundaries.at(-1) + length);
assert.equal(boundaries.at(-1), original.length);

const chapters = CHAPTER_LENGTHS.map((runes, id) => ({
  id, runes, eligible: 0, relation: 0, previousEqualsTarget: 0
}));
let absolute = 0;
let eligible = 0;
let equalTarget = 0;
let coincidentTarget = 0;
let previousEqualsTarget = 0;
let repeatWhenDistinct = 0;
let repeatWhenCoincident = 0;
let carryEligible = 0;
let carryTarget = 0;
let carryAfterEligible = 0;
let carryAfterTarget = 0;
const ambiguitySites = [];
const completeWords = words.map(word => word.values);
for (let wi = 0; wi < words.length; wi++) {
  const word = words[wi];
  const crossing = word.pages[0] !== word.pages.at(-1);
  const pageChange = crossing ? word.pages.findIndex(pg => pg !== word.pages[0]) : -1;
  for (let j = 0; j < word.values.length; j++) {
    while (absolute >= boundaries[chapters.findIndex(c => absolute < boundaries[c.id + 1]) + 1]) {
      // Unreachable given the 12,956-position chapter inventory.
      throw new Error('Invalid chapter boundaries');
    }
    if (j >= 6) {
      const chapter = chapters.find(c => absolute < boundaries[c.id + 1]);
      const prior = word.values[j - 1];
      const image = target(word.values[j - 6]);
      const observed = word.values[j];
      const hit = observed === image;
      eligible++;
      chapter.eligible++;
      if (hit) {
        equalTarget++;
        chapter.relation++;
      }
      if (prior === image) {
        previousEqualsTarget++;
        chapter.previousEqualsTarget++;
        if (hit) {
          coincidentTarget++;
          repeatWhenCoincident++;
        }
      } else {
        if (observed === prior) repeatWhenDistinct++;
        if (hit) ambiguitySites.push({wi, j, absolute, prior, image, crossing});
      }
      if (crossing) {
        carryEligible++;
        if (hit) carryTarget++;
        if (j >= pageChange) {
          carryAfterEligible++;
          if (hit) carryAfterTarget++;
        }
      }
    }
    absolute++;
  }
}
assert.equal(eligible, 1290);
assert.equal(equalTarget, 80);
assert.equal(previousEqualsTarget, 33);
assert.equal(coincidentTarget, 1);
assert.equal(repeatWhenDistinct, 8);
assert.equal(ambiguitySites.length, 79);
assert.deepEqual([carryEligible, carryTarget, carryAfterEligible, carryAfterTarget], [43, 3, 24, 3]);
assert.deepEqual(chapters.map(c => [c.eligible, c.relation]),
  [[79, 6], [106, 6], [184, 10], [178, 13], [100, 5], [144, 11],
    [162, 9], [302, 20], [35, 0]]);

// Original M1 writes T(cipher[-6]) only when the proposed base equals
// previous emitted cipher and a hidden repair decision is true.
// With no extra pointer drift, the 79 nondegenerate original echo positions
// admit two different base symbols yielding the SAME emitted source stream.
let baseTape = [];
let repairedTape = [];
let pointer = 0;
for (let wi = 0; wi < words.length; wi++) {
  const w = words[wi].values;
  for (let j = 0; j < w.length; j++) {
    const image = j >= 6 ? target(w[j - 6]) : -1;
    const ambiguous = j >= 6 && w[j] === image && w[j] !== w[j - 1];
    const normalBase = w[j];
    const repairBase = ambiguous ? w[j - 1] : w[j];
    const normalFlag = false;
    const repairFlag = ambiguous;
    const emit = (base, flag) =>
      j >= 6 && flag && base === w[j - 1] ? image : base;
    assert.equal(emit(normalBase, normalFlag), w[j]);
    assert.equal(emit(repairBase, repairFlag), w[j]);
    const key = (7 + 11 * pointer) % 29;
    baseTape.push((normalBase - key + 29) % 29);
    repairedTape.push((repairBase - key + 29) % 29);
    pointer++;
  }
}
assert.equal(baseTape.length, 12956);
assert.equal(baseTape.filter((p, i) => p !== repairedTape[i]).length, 79);

// Full 29-symbol affine family, including the externally selected map
// T(x) = 27*x + 24 mod 29.  No additional maps selected after observation.
const maps = [];
for (let a = 1; a < 29; a++) for (let b = 0; b < 29; b++) {
  const output = new Uint8Array(29);
  for (let x = 0; x < 29; x++) output[x] = (a * x + b) % 29;
  maps.push({a, b, output});
}
assert.equal(maps.length, 812);
const targetIndex = maps.findIndex(m => m.a === 27 && m.b === 24);
assert.equal(targetIndex, 778);

/** @param {number[][]} strings words of GP29 numeric values */
function matrix(strings) {
  const counts = new Uint16Array(29 * 29);
  for (const w of strings) for (let i = 6; i < w.length; i++) {
    counts[29 * w[i - 6] + w[i]]++;
  }
  return counts;
}
/** @param {Uint16Array} counts */
function score(counts) {
  const out = new Uint16Array(maps.length);
  for (let j = 0; j < maps.length; j++) {
    let total = 0;
    const image = maps[j].output;
    for (let x = 0; x < 29; x++) total += counts[29 * x + image[x]];
    out[j] = total;
  }
  return out;
}
const observedScores = score(matrix(completeWords));
assert.equal(observedScores[targetIndex], 80);

// Repeatable xorshift32 Monte Carlo. Conditional on each word's
// adjacent-equality count, including the 63 original intra-word doublets.
const SEED = 0x6b31a250;
let rng = SEED >>> 0;
/** @returns {number} a random unsigned 32-bit integer */
function nextUint32() {
  rng ^= rng << 13;
  rng ^= rng >>> 17;
  rng ^= rng << 5;
  return rng >>> 0;
}
const nullRepetitions = Number(process.env.SIXBACK_NULL_REPS || 5000);
assert.ok(Number.isInteger(nullRepetitions) && nullRepetitions >= 100);
const adjacent = completeWords.map(w => w.reduce((n, x, i) => n + Number(i > 0 && x === w[i - 1]), 0));
const records = new Array(nullRepetitions);
const sums = new Float64Array(maps.length);
const sums2 = new Float64Array(maps.length);
for (let rep = 0; rep < nullRepetitions; rep++) {
  const shuffled = completeWords.map((word, wi) => {
    if (word.length < 7) return word;
    let attempt;
    let doublets;
    do {
      attempt = word.slice();
      for (let j = attempt.length - 1; j > 0; j--) {
        const k = nextUint32() % (j + 1);
        [attempt[k], attempt[j]] = [attempt[j], attempt[k]];
      }
      doublets = 0;
      for (let j = 1; j < attempt.length; j++) doublets += Number(attempt[j] === attempt[j - 1]);
    } while (doublets !== adjacent[wi]);
    return attempt;
  });
  const row = score(matrix(shuffled));
  records[rep] = row;
  for (let j = 0; j < maps.length; j++) {
    const v = row[j];
    sums[j] += v;
    sums2[j] += v * v;
  }
}
const means = Array.from(sums, x => x / nullRepetitions);
const sd = Array.from(sums, (s, j) => Math.sqrt(Math.max(1e-10,
  sums2[j] / nullRepetitions - means[j] * means[j])));
const observedZ = Array.from(observedScores, (x, j) => (x - means[j]) / sd[j]);
const selectedZ = observedZ[targetIndex];
const rank = 1 + observedZ.filter(z => z > selectedZ).length;
const simpleTail = records.filter(row => row[targetIndex] >= observedScores[targetIndex]).length;
let familyTail = 0;
for (const row of records) {
  let largest = -Infinity;
  for (let j = 0; j < maps.length; j++) largest = Math.max(largest, (row[j] - means[j]) / sd[j]);
  if (largest >= selectedZ) familyTail++;
}
const topMaps = observedZ.map((z, j) => ({
  a: maps[j].a, b: maps[j].b, hits: observedScores[j],
  nullMean: Number(means[j].toFixed(3)),
  z: Number(z.toFixed(3))
})).sort((a, b) => b.z - a.z).slice(0, 5);

const qFromRepeat = 1 - 29 * repeatWhenDistinct / (eligible - previousEqualsTarget);
const qFromEcho = 29 * (equalTarget - coincidentTarget) /
  (eligible - previousEqualsTarget) - 1;
const q = 0.81;
const posterior = q / (1 + q);
const binaryEntropy = -posterior * Math.log2(posterior) -
  (1 - posterior) * Math.log2(1 - posterior);

console.log(JSON.stringify({
  input: {
    source: 'resources/liber-primus/lp2-transcription.txt',
    corpusMatch: true, runes: original.length,
    printedWords: words.length, pageCarryWords: carries.length
  },
  original: {
    eligible, relationHits: equalTarget,
    competingOutputEqualsPrevious: previousEqualsTarget,
    nondegenerateRelationHits: ambiguitySites.length,
    degenerateRelationHits: coincidentTarget,
    repeatWhenDistinct, repeatWhenCoincident,
    carryEligible, carryTarget, carryAfterEligible, carryAfterTarget,
    chapter: chapters
  },
  inverse: {
    twoDistinctOriginalLengthInputTapesEmitIdenticalCiphertext: true,
    differingInputRunePositions: 79,
    numberOfAdmissibleInputTapesWithoutRepairFlags: '2^79',
    bitsToIdentifyOneOfTheCandidateTapes: 79,
    modelDependentShannonBitsAtObservedEchoes: 79 * binaryEntropy,
    qEstimatedOnlyFromEligibleDoublets: qFromRepeat,
    qEstimatedOnlyFromEligibleT6Hits: qFromEcho,
    predictedT6HitsFromDoublets: (eligible - previousEqualsTarget) * (1 + qFromRepeat) / 29
  },
  affineFamilyNull: {
    seed: '0x6b31a250', repetitions: nullRepetitions,
    maps: maps.length, target: {a: 27, b: 24},
    observedZ: selectedZ, affineRank: rank,
    targetNullMean: means[targetIndex], targetNullSd: sd[targetIndex],
    fixedMapTail: simpleTail, maxFamilyTail: familyTail,
    fixedMapMonteCarloP: (simpleTail + 1) / (nullRepetitions + 1),
    familywiseMonteCarloP: (familyTail + 1) / (nullRepetitions + 1),
    fiveLargestMaps: topMaps
  }
}, null, 2));
