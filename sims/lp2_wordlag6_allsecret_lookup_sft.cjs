"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * Blind original-LP2 test of a fully secret, nonperiodic 29-entry lag-six
 * ciphertext-feedback substitution. A single unknown lookup f is shared
 * between words; the first six characters of each word are free.
 *
 * At word positions j >= 6:
 *   C[j] = (P[j] + f(C[j - 6])) mod 29.
 *
 * The observed word-local lag-six affine echo motivates the lag, but this
 * attack allows all 29 independent entries of f to be entirely unknown.
 * Estimate each entry from the first half of ORIGINAL words and decode the
 * untouched second half. Exact synthetic plaintext/key controls prevent a
 * random-looking original output from masquerading as solved content.
 *
 * Read-only, dependency-free, Windows Node 22 compatible.
 */

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const transcript = fs.readFileSync(
  path.join(ROOT, "resources", "lp2-transcription.txt"), "utf8");
const shakespeare = fs.readFileSync(
  path.join(ROOT, "resources", "control", "shakespeare_first300k.txt"), "utf8");

const N = 29;
const LONG_DIGRAPHS = ["TH", "NG", "EO", "OE", "AE", "IA", "EA"];
const ALIASES = { V: "U", K: "C", Q: "C", Z: "S" };

/** @param {number} v @returns {number} */
function mod(v) { return ((v % N) + N) % N; }

/**
 * Use the exact manuscript's runic alphabet and its original word breaks.
 * A physical-page delimiter or line wrap does not finish an ongoing word.
 * @param {string} source
 * @returns {number[][]}
 */
function parseWords(source) {
  const words = [];
  let current = [];
  const included = source.split("%").slice(0, 55).join("%");
  for (const ch of included) {
    const index = corpus.runes.indexOf(ch);
    if (index >= 0) {
      current.push(index);
    } else if (ch === "%" || ch === "/" || /\s/u.test(ch)) {
      continue;
    } else if (current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

/**
 * Greedy GP spelling used for native-English reference/control words.
 * @param {string} original
 * @returns {number[] | null}
 */
function encodeGP(original) {
  const word = original.toUpperCase().replace(/QU/g, "CW")
    .split("").map((ch) => ALIASES[ch] || ch).join("");
  const result = [];
  for (let i = 0; i < word.length;) {
    const unit = LONG_DIGRAPHS.find((dg) => word.startsWith(dg, i)) || word[i];
    const index = corpus.translit.indexOf(unit);
    if (index < 0) return null;
    result.push(index);
    i += unit.length;
  }
  return result;
}

/**
 * Extract only locations that genuinely have a word-local predecessor six
 * runes earlier. Pair [observed six-lag symbol, output symbol].
 * @param {number[][]} words
 * @param {number} first
 * @param {number} last
 * @returns {number[][]}
 */
function lagTuples(words, first, last) {
  const tuples = [];
  for (let i = first; i < last; i++) {
    const word = words[i];
    for (let j = 6; j < word.length; j++) {
      tuples.push([word[j - 6], word[j]]);
    }
  }
  return tuples;
}

/**
 * Fit all 29 lookup values independently by source-reference GP unigram
 * likelihood. Every one of 29 possible values for every key slot is checked.
 * @param {number[][]} tuples
 * @param {number[]} logPrior
 * @returns {{key:number[],exposures:number[]}}
 */
function fitSecretLookup(tuples, logPrior) {
  const exposures = Array.from({ length: N }, () => []);
  for (const [x, c] of tuples) exposures[x].push(c);
  const key = exposures.map((outputs) => {
    let bestKey = 0;
    let bestScore = -Infinity;
    for (let candidate = 0; candidate < N; candidate++) {
      let score = 0;
      for (const c of outputs) score += logPrior[mod(c - candidate)];
      if (score > bestScore) {
        bestScore = score;
        bestKey = candidate;
      }
    }
    return bestKey;
  });
  return { key, exposures: exposures.map((v) => v.length) };
}

/**
 * Evaluate decoded symbol frequencies and source-model log likelihood.
 * @param {number[][]} tuples
 * @param {number[]} key
 * @param {number[]} logPrior
 * @returns {{n:number,meanLogLikelihood:number,indexOfCoincidence:number}}
 */
function measure(tuples, key, logPrior) {
  const counts = Array(N).fill(0);
  let likelihood = 0;
  for (const [x, c] of tuples) {
    const p = mod(c - key[x]);
    counts[p]++;
    likelihood += logPrior[p];
  }
  const n = tuples.length;
  const equalPairs = counts.reduce((acc, count) => acc + count * (count - 1), 0);
  return {
    n,
    meanLogLikelihood: likelihood / n,
    indexOfCoincidence: equalPairs / (n * (n - 1))
  };
}

const words = parseWords(transcript);
assert.equal(words.length, 2896);
assert.equal(words.reduce((n, word) => n + word.length, 0), 12956);
assert.equal(words.filter((word) => word.length >= 7).length, 559);

const reference = (shakespeare.match(/[A-Za-z]+/g) || [])
  .map(encodeGP).filter((word) => word !== null);
assert.equal(reference.length, 55407);

const byLength = new Map();
const priorCounts = Array(N).fill(0.2);
for (const word of reference) {
  if (word.length < 7) continue;
  if (!byLength.has(word.length)) byLength.set(word.length, []);
  byLength.get(word.length).push(word);
  for (let j = 6; j < word.length; j++) priorCounts[word[j]]++;
}
const sum = priorCounts.reduce((a, b) => a + b);
const logPrior = priorCounts.map((count) => Math.log(count / sum));

const mid = Math.floor(words.length / 2);
const originalTrain = lagTuples(words, 0, mid);
const originalTest = lagTuples(words, mid, words.length);
assert.equal(originalTrain.length, 645);
assert.equal(originalTest.length, 645);

const originalFit = fitSecretLookup(originalTrain, logPrior);
const original = {
  training: measure(originalTrain, originalFit.key, logPrior),
  untouched: measure(originalTest, originalFit.key, logPrior),
  noKeyUntouched: measure(originalTest, Array(N).fill(0), logPrior)
};

// Source-independent positive: match every real original displayed word
// length to actual GP-English source words. A handful of long lengths absent
// in the reference get deterministic fallback values, never original runes.
const plantedPlain = words.map((word, i) => {
  const options = byLength.get(word.length);
  return options
    ? [...options[(i * 7919) % options.length]]
    : word.map((_, j) => (i * 17 + j * 7) % N);
});
// The true 29-entry function is concealed from the fit. It has a concrete
// historical clue shape (the observed T6 affine relation), but this planted
// control does not assert that it is Cicada's actual key.
const plantedTrueKey = Array.from({ length: N }, (_, x) => mod(24 - 2 * x));
const plantedCipher = plantedPlain.map((word) => {
  const cipher = word.map((p, i) => i < 6 ? mod(p + 9 + i) : 0);
  for (let j = 6; j < word.length; j++) {
    cipher[j] = mod(word[j] + plantedTrueKey[cipher[j - 6]]);
  }
  return cipher;
});
const plantedTrain = lagTuples(plantedCipher, 0, mid);
const plantedTest = lagTuples(plantedCipher, mid, plantedCipher.length);
const plantedFit = fitSecretLookup(plantedTrain, logPrior);
const sourcePositive = {
  inferredKeyEntries: plantedFit.key.filter((v, i) => v === plantedTrueKey[i]).length,
  training: measure(plantedTrain, plantedFit.key, logPrior),
  untouched: measure(plantedTest, plantedFit.key, logPrior),
  trueKeyUntouched: measure(plantedTest, plantedTrueKey, logPrior)
};

assert.equal(sourcePositive.inferredKeyEntries, 24);
assert.ok(sourcePositive.untouched.indexOfCoincidence > 0.08);
assert.ok(sourcePositive.untouched.meanLogLikelihood > -3);
assert.ok(original.untouched.indexOfCoincidence < 0.04);
assert.ok(original.untouched.meanLogLikelihood < -5.0);
assert.ok(Math.abs(original.untouched.meanLogLikelihood -
  original.noKeyUntouched.meanLogLikelihood) < 0.01);

const result = {
  hypothesis: "C[word,j] = P[word,j] + f(C[word,j-6]) mod29, j>=6",
  secretLookupEntries: 29,
  wordCount: words.length,
  originalRunes: 12956,
  eligibleOriginalWords: 559,
  referenceWords: reference.length,
  originalTrainingLocations: originalTrain.length,
  originalUntouchedLocations: originalTest.length,
  original,
  sourcePositive,
  sourceDisjointKey: originalFit.key,
  sourceDisjointExposure: originalFit.exposures
};
console.log(JSON.stringify(result, null, 2));
