"use strict";
/**
 * Held-out affine two-tap tests for LP2 rune ciphertext, modulo 29.
 *
 * Searches c[j] = a*c[j-d1] + b*c[j-d2] + k (mod 29)
 * inside intact, punctuation-delimited rune words. The independent
 * test set is odd-indexed words, even-indexed words train the model.
 *
 * Usage: node sims/two_tap_heldout.cjs
 * Dependencies: Node.js built-ins only.
 *
 * The fixed 27*c[j-6] lane tests whether the established lag-6
 * c[j] = 24-2*c[j-6] echo conceals a nonzero second tap. The full
 * lane searches all 28 lag pairs <= 8 and nonzero coefficient pairs.
 *
 * Note: binomial z is a descriptive screening statistic; ciphertext
 * dependencies need not be binomial. Independent held-out prediction
 * and planted data are the stronger controls.
 */
const fs = require("node:fs");
const path = require("node:path");

const RUNES = [..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
const INDEX = new Map(RUNES.map((ch, idx) => [ch, idx]));
const FIRST_LP2 = "ᛋᚻᛖᚩᚷᛗᛡᚠ";
const MOD_BASE = 1653;

/** @param {string} master
 * @returns {number[][]}
 */
function parseUnsolvedWords(master) {
  const start = master.indexOf(FIRST_LP2);
  if (start < 0) throw new Error("LP2 incipit missing");
  const pages = master.slice(start).split("%").slice(0, 56).join("%");
  const words = pages.split(/[-.&$§]/)
    .map(segment => [...segment].filter(ch => INDEX.has(ch)).map(ch => INDEX.get(ch)))
    .filter(word => word.length > 0);
  const runeCount = words.reduce((n, word) => n + word.length, 0);
  if (runeCount !== 12956 || words.length !== 2896) {
    throw new Error("Unexpected LP2 input boundaries: " + JSON.stringify({ runeCount, words: words.length }));
  }
  return words;
}

/** @param {number} n @param {number} count */
function scoreZ(n, count) {
  return (count - n / 29) / Math.sqrt(n * 28 / (29 * 29));
}

/** @typedef {{d1:number,d2:number,a:number,b:number,k:number,n:number,count:number,z:number}} Candidate */

/** @param {Candidate[]} candidates @param {Candidate} candidate @param {number} limit */
function addTop(candidates, candidate, limit) {
  if (candidates.length === limit && candidate.z <= candidates[candidates.length - 1].z) return;
  candidates.push(candidate);
  candidates.sort((x, y) => y.z - x.z ||
    x.d2 - y.d2 || x.d1 - y.d1 || x.a - y.a || x.b - y.b || x.k - y.k);
  if (candidates.length > limit) candidates.pop();
}

/**
 * @param {number[][]} words
 * @param {"full"|"six"} family
 * @param {0|1} trainParity
 * @param {number} limit
 * @returns {Candidate[]}
 */
function findCandidates(words, family, trainParity = 0, limit = 10) {
  const top = [];
  const lagPairs = [];
  if (family === "six") {
    for (let d = 1; d <= 5; d++) lagPairs.push([d, 6]);
  } else {
    for (let d1 = 1; d1 < 8; d1++) {
      for (let d2 = d1 + 1; d2 <= 8; d2++) lagPairs.push([d1, d2]);
    }
  }

  for (const [d1, d2] of lagPairs) {
    const triples = [];
    for (let i = trainParity; i < words.length; i += 2) {
      const word = words[i];
      for (let j = d2; j < word.length; j++) {
        triples.push([word[j], word[j - d1], word[j - d2]]);
      }
    }
    const n = triples.length;
    for (let a = family === "six" ? 27 : 1; a <= (family === "six" ? 27 : 28); a++) {
      for (let b = 1; b < 29; b++) {
        const histogram = new Uint16Array(29);
        for (const [target, x, y] of triples) {
          histogram[(target + MOD_BASE - a * x - b * y) % 29]++;
        }
        for (let k = 0; k < 29; k++) {
          addTop(top, { d1, d2, a, b, k, n, count: histogram[k], z: scoreZ(n, histogram[k]) }, limit);
        }
      }
    }
  }
  return top;
}

/**
 * @param {number[][]} words
 * @param {Candidate} model
 * @param {0|1} testParity
 */
function evaluate(words, model, testParity = 1) {
  let n = 0;
  let count = 0;
  const { d1, d2, a, b, k } = model;
  for (let i = testParity; i < words.length; i += 2) {
    const word = words[i];
    for (let j = d2; j < word.length; j++) {
      n++;
      if ((word[j] + MOD_BASE - a * word[j - d1] - b * word[j - d2] - k) % 29 === 0) count++;
    }
  }
  return { n, count, expected: n / 29, z: scoreZ(n, count) };
}

/** @param {number} seed */
function xorshift32(seed) {
  let state = seed | 0;
  return function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * Controlled injection of a word-internal two-tap recurrence, without
 * otherwise changing the source corpus. Changes can propagate forward
 * when a later implanted cell references an earlier implanted cell.
 *
 * @param {number[][]} words
 * @param {number} rate
 * @param {{d1:number,d2:number,a:number,b:number,k:number}} model
 * @param {number} seed
 */
function plant(words, rate, model, seed) {
  const random = xorshift32(seed);
  const altered = words.map(word => word.slice());
  let injected = 0;
  let eligible = 0;
  for (const word of altered) {
    for (let j = model.d2; j < word.length; j++) {
      eligible++;
      if (random() < rate) {
        word[j] = (model.a * word[j - model.d1] + model.b * word[j - model.d2] + model.k) % 29;
        injected++;
      }
    }
  }
  return { altered, injected, eligible };
}

/** @param {number[][]} words @param {"full"|"six"} family */
function probe(words, family) {
  const selected = findCandidates(words, family, 0, 10);
  const selectedReverse = findCandidates(words, family, 1, 1);
  return {
    topTrain: selected.slice(0, 5),
    topTrainHoldout: selected.slice(0, 5).map(candidate => ({
      model: { d1: candidate.d1, d2: candidate.d2, a: candidate.a, b: candidate.b, k: candidate.k },
      validation: evaluate(words, candidate, 1)
    })),
    reverseChampion: selectedReverse[0],
    reverseHoldout: evaluate(words, selectedReverse[0], 0)
  };
}

function main() {
  const master = fs.readFileSync(path.join(__dirname, "..", "resources", "transcriptions", "liber_primus_master.txt"), "utf8");
  const words = parseUnsolvedWords(master);
  const full = probe(words, "full");
  const six = probe(words, "six");
  const seed = 0x289fab71;
  const sixModel = { d1: 2, d2: 6, a: 7, b: 27, k: 5 };
  const fullModel = { d1: 2, d2: 6, a: 11, b: 7, k: 5 };
  // In the fixed-six family "a" multiplies the nearer tap d1.
  // Therefore plant a=7, b=27 when d1=2 and d2=6.
  const plantedSix = plant(words, 0.04, sixModel, seed);
  const plantedFull = plant(words, 0.08, fullModel, seed);
  const sixControl = findCandidates(plantedSix.altered, "six", 0, 1)[0];
  const fullControl = findCandidates(plantedFull.altered, "full", 0, 1)[0];
  console.log(JSON.stringify({
    input: { unsolvedWords: words.length, runes: words.reduce((s, w) => s + w.length, 0) },
    familySize: { six: 5 * 28 * 29, full: 28 * 28 * 28 * 29 },
    training: "even word indices", validation: "odd word indices",
    full, six,
    planted: [
      { family: "six", rate: 0.04, seed, model: sixModel,
        injected: plantedSix.injected, eligible: plantedSix.eligible, selected: sixControl,
        validation: evaluate(plantedSix.altered, sixControl, 1) },
      { family: "full", rate: 0.08, seed, model: fullModel,
        injected: plantedFull.injected, eligible: plantedFull.eligible, selected: fullControl,
        validation: evaluate(plantedFull.altered, fullControl, 1) }
    ]
  }, null, 2));
}

if (require.main === module) main();
module.exports = { parseUnsolvedWords, findCandidates, evaluate, plant, probe };
