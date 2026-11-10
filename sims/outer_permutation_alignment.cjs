"use strict";
/**
 * Exploratory joint-alignment experiment for unknown outer alphabets.
 *
 * Given sigma, a Viterbi decoder exactly models zero/one rejected key draws,
 * optionally requiring that the rejected candidate equal the previous rune.
 * Alternating Viterbi with the globally optimal alphabet assignment is a
 * concrete baseline for future joint sigma/key-pointer optimizers.
 *
 * This program supplies an independent positive control with KNOWN sigma.
 * The alternating algorithm is exploratory; failure does not exclude sigma.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  inferAlphabet, encodeEnglish, encrypt, shuffledPermutation, seededRandom
} = require("./outer_permutation_assignment.cjs");

const M = 29;

/**
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {number[]} prior
 * @param {number[]} inverse
 * @param {{strict:boolean,maxDrift:number,suppress:number}} config
 * @returns {{drift:Int16Array,score:number,finalDrift:number}}
 */
function viterbi(ciphertext, key, prior, inverse, config) {
  const {strict, maxDrift, suppress} = config;
  const n = ciphertext.length;
  const neg = -1e50;
  const logPrior = prior.map(x => Math.log(x));
  const decision = Array.from({length:n}, () => new Uint8Array(maxDrift+1));
  let dp = Float64Array.from({length:maxDrift+1}, (_, d) =>
    d === 0 ? 0 : neg);
  const jumpCost = strict ? Math.log(suppress) :
    Math.log(suppress / 29);
  const stayCost = strict ? 0 : Math.log(1-suppress / 29);
  for (let i = 0; i < n; i++) {
    const next = new Float64Array(maxDrift + 1).fill(neg);
    const c = ciphertext[i], prev = i > 0 ? ciphertext[i - 1] : -1;
    for (let d = 0; d <= Math.min(i, maxDrift); d++) {
      const currentIndex = i + d;
      assert(currentIndex < key.length);
      const k = key[currentIndex];
      const rune = inverse[c];
      const x = ((rune - k) % M + M) % M;
      const emission = logPrior[x];
      const repeatPenalty = strict && c === prev ? Math.log(1-suppress) : 0;
      next[d] = dp[d] + emission + stayCost + repeatPenalty;
      if (i > 0 && d > 0) {
        const before = key[currentIndex-1];
        const target = ((inverse[prev] - rune) % M + M) % M;
        const difference = ((before - k) % M + M) % M;
        const permitted = !strict || target === difference;
        if (permitted) {
          const score = dp[d - 1] + emission + jumpCost + repeatPenalty;
          if (score > next[d]) {
            next[d] = score;
            decision[i][d] = 1;
          }
        }
      }
    }
    dp = next;
  }
  let end = 0;
  for (let d = 1; d <= maxDrift; d++)
    if (dp[d] > dp[end]) end = d;
  const score = dp[end], drift = new Int16Array(n);
  for (let i = n - 1; i >= 0; i--) {
    drift[i] = end;
    end -= decision[i][end];
  }
  return {drift, score, finalDrift:drift[n-1]};
}

/**
 * Coordinate ascent using global assignment to update alphabet and Viterbi
 * to update key positions. It is not guaranteed to find the joint optimum.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number[]} prior
 * @param {object} config
 * @param {number} iterations
 * @param {number[]} oracleInverse - used for evaluation only
 */
function alternate(cipher, key, prior, config, iterations, oracleInverse) {
  let inverse = inferAlphabet(cipher, key, prior).inverse;
  const records = [];
  for (let i = 0; i < iterations; i++) {
    const path = viterbi(cipher, key, prior, inverse, config);
    const keyIndices = [...path.drift].map((offset, at) => at+offset);
    const next = inferAlphabet(cipher, key, prior, keyIndices).inverse;
    const matched = inverse.filter((value, glyph) =>
      value === oracleInverse[glyph]).length;
    records.push({iteration:i, matchedLabels:matched,
      score:path.score, finalDrift:path.finalDrift});
    if (next.every((value, glyph) => inverse[glyph] === value)) break;
    inverse = next;
  }
  return records;
}

function study() {
  const source = fs.readFileSync(path.join(__dirname, "..", "resources",
    "control", "shakespeare_first300k.txt"), "utf8");
  const text = encodeEnglish(source);
  const N = 1200, counts = Array(M).fill(0.5);
  for (const symbol of text.slice(5000, 190000)) counts[symbol]++;
  const sum = counts.reduce((total, count) => total + count, 0);
  const prior = counts.map(count => count / sum);
  const random = seededRandom(3301);
  const sigma = shuffledPermutation(Array.from({length:M}, (_, i)=>i), random);
  const oracleInverse = Array.from({length:M},(_,c)=>sigma.indexOf(c));
  const key = Array.from({length:1700},()=>Math.floor(random()*M));
  const planted = encrypt(text.slice(0, N), key, sigma, random, .81);
  const report = {
    hypothesis: "joint unknown outer sigma and key-pointer drift under rejection filtering",
    seed:3301, suppress:.81, plaintextRunes:N,
    syntheticExtraKeyDraws:planted.extraDraws, rows:[]
  };
  for (const n of [300, 1000]) {
    const ciphertext = planted.ciphertext.slice(0,n);
    const trueDrift = planted.keyIndices.slice(0,n).map((j,i)=>j-i);
    for (const strict of [false,true]) {
      const config = {strict,maxDrift:70,suppress:.81};
      const oracle = viterbi(ciphertext,key,prior,oracleInverse,config);
      const correct = [...oracle.drift].filter((d,i)=>d===trueDrift[i]).length;
      report.rows.push({
        n, strict, oracleScore:oracle.score,
        oracleAlignedPositions:correct,
        oracleEndDrift:oracle.finalDrift,
        actualEndDrift:trueDrift.at(-1),
        alternating:alternate(ciphertext,key,prior,config,10,oracleInverse)
      });
      assert(correct > n*.75, "Known outer alphabet should recover planted drift");
    }
  }
  return report;
}

if (require.main === module) console.log(JSON.stringify(study(),null,2));
module.exports={viterbi,alternate,study};
