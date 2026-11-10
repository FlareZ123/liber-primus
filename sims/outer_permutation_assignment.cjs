"use strict";
/**
 * Exact maximum-likelihood recovery of an unknown outer 29-rune permutation
 * from a proposed, ALIGNED additive keystream.
 *
 * Hypothesis: C_i = sigma((P_i + K_i) mod 29), for an unknown bijective sigma.
 * An arbitrary permutation has 29! possibilities, but unigram log likelihood
 * is a linear assignment: optimize 29 x 29 weights by Hungarian's algorithm.
 * The optimum is global for the stated independent-unigram likelihood only.
 *
 * This probe does not resolve key-pointer drift caused by LP2's anti-doublet
 * filter. Skips must be independently aligned; see the positive control.
 *
 * Run from the repository root with Node.js >= 20:
 *   node sims/outer_permutation_assignment.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const M = 29;
const MAX_N = 3000;

function mod29(value) {
  return ((value % M) + M) % M;
}

/**
 * Maximum-weight perfect matching on an n x n score matrix.
 * @param {number[][]} weights
 * @returns {{assignment:number[],score:number}}
 */
function assignmentMax(weights) {
  const n = weights.length;
  assert(n > 0 && weights.every(row => row.length === n));
  const u = Array(n + 1).fill(0);
  const v = Array(n + 1).fill(0);
  const p = Array(n + 1).fill(0);
  const way = Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = Array(n + 1).fill(Infinity);
    const used = Array(n + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity;
      let j1 = 0;
      for (let j = 1; j <= n; j++) {
        if (used[j]) continue;
        const cur = -weights[i0 - 1][j - 1] - u[i0] - v[j];
        if (cur < minv[j]) {
          minv[j] = cur;
          way[j] = j0;
        }
        if (minv[j] < delta) {
          delta = minv[j];
          j1 = j;
        }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          minv[j] -= delta;
        }
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0 !== 0);
  }
  const permutation = Array(n);
  for (let j = 1; j <= n; j++) permutation[p[j] - 1] = j - 1;
  return {
    assignment: permutation,
    score: permutation.reduce((sum, column, row) =>
      sum + weights[row][column], 0)
  };
}

/**
 * Infer g[c] = sigma^-1(c) given ciphertext and actual key draw indices.
 * @param {number[]} ciphertext
 * @param {number[]} keystream
 * @param {number[]} prior - strictly positive GP plaintext probabilities
 * @param {number[]} [keyIndices] - index of key draw used for each output rune
 * @returns {{inverse:number[],score:number}}
 */
function inferAlphabet(ciphertext, keystream, prior, keyIndices) {
  assert.equal(prior.length, M);
  assert(prior.every(value => value > 0 && Number.isFinite(value)));
  const logp = prior.map(value => Math.log(value));
  const scores = Array.from({length: M}, () => Array(M).fill(0));
  ciphertext.forEach((c, i) => {
    const ki = keyIndices ? keyIndices[i] : i;
    const k = keystream[ki];
    assert(Number.isInteger(c) && c >= 0 && c < M);
    assert(Number.isInteger(k) && k >= 0 && k < M);
    for (let g = 0; g < M; g++) scores[c][g] += logp[mod29(g - k)];
  });
  const {assignment, score} = assignmentMax(scores);
  return {inverse: assignment, score};
}

/** @param {number[]} c @param {number[]} key @param {number[]} inverse */
function decipher(c, key, inverse) {
  return c.map((symbol, i) => mod29(inverse[symbol] - key[i]));
}

/** @param {number} seed @returns {()=>number} */
function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    let z = (s += 0x6d2b79f5);
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), 61 | z);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

const SYMBOL = {
  F:0,U:1,TH:2,O:3,R:4,C:5,G:6,W:7,H:8,N:9,I:10,J:11,
  EO:12,P:13,X:14,S:15,T:16,B:17,E:18,M:19,L:20,NG:21,
  OE:22,D:23,A:24,AE:25,Y:26,IA:27,EA:28
};

/**
 * Deterministic English to GP encoder for controlled, *synthetic* text.
 * A spelling convention, not an assertion about the unknown LP2 plaintext.
 * @param {string} text
 * @returns {number[]}
 */
function encodeEnglish(text) {
  const source = text.toUpperCase().replace(/V/g, "U").replace(/K/g, "C")
    .replace(/Q/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < source.length; i++) {
    if (!/[A-Z]/.test(source[i])) continue;
    let token = source[i], advance = 1;
    if (source.slice(i, i + 3) === "ING") {
      token = "NG";
      advance = 3;
    } else if (Object.hasOwn(SYMBOL, source.slice(i, i + 2))) {
      token = source.slice(i, i + 2);
      advance = 2;
    }
    if (Object.hasOwn(SYMBOL, token)) out.push(SYMBOL[token]);
    i += advance - 1;
  }
  return out;
}

/** @param {number[]} source @param {()=>number} random */
function shuffledPermutation(source, random) {
  const out = source.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Plant a cipher using a fixed arbitrary sigma.
 * Rejection test compares the latest candidate ciphertext with previous
 * emitted symbol; a rejected draw advances the key without plaintext advance.
 * @param {number[]} plaintext
 * @param {number[]} key
 * @param {number[]} sigma
 * @param {()=>number} random
 * @param {number} suppress - probability of rejecting an equal candidate
 */
function encrypt(plaintext, key, sigma, random, suppress) {
  const ciphertext = [], keyIndices = [];
  let pointer = 0;
  for (const symbol of plaintext) {
    let next;
    while (true) {
      const index = pointer++;
      assert(index < key.length, "Synthetic key exhausted");
      next = sigma[mod29(symbol + key[index])];
      if (ciphertext.length && ciphertext.at(-1) === next &&
          random() < suppress) continue;
      keyIndices.push(index);
      ciphertext.push(next);
      break;
    }
  }
  return {ciphertext, keyIndices, extraDraws: pointer - plaintext.length};
}

function study({replicates = 100, seed = 4403} = {}) {
  const source = fs.readFileSync(path.join(__dirname, "..", "resources",
    "control", "shakespeare_first300k.txt"), "utf8");
  const runes = encodeEnglish(source);
  assert(runes.length > 190000);
  const counts = Array(M).fill(0.5);
  for (const value of runes.slice(5000, 190000)) counts[value]++;
  const total = counts.reduce((sum, value) => sum + value, 0);
  const prior = counts.map(value => value / total);
  const random = seededRandom(seed);
  const sigma = shuffledPermutation(Array.from({length:M}, (_, i) => i), random);
  const key = Array.from({length:MAX_N + 200}, () => Math.floor(random() * M));
  const noFilter = encrypt(runes.slice(0, MAX_N), key, sigma, random, 0);
  const filtered = encrypt(runes.slice(0, MAX_N), key, sigma, random, 0.81);
  const report = {
    hypothesis: "C=sigma(P+K mod29), arbitrary unknown sigma",
    optimizer: "exact 29x29 Hungarian assignment for aligned key draws",
    corpus: "300 KB Shakespeare control text, GP spelling encoder",
    seed, random: "mulberry32", nullReplicates: replicates,
    permutationSize: M, extraDraws: filtered.extraDraws,
    results: {}
  };
  for (const length of [100, 300, 1000, MAX_N]) {
    const cases = {};
    for (const [name, planted] of [
      ["unaltered", noFilter], ["filtered-aligned", filtered]
    ]) {
      const c = planted.ciphertext.slice(0, length);
      const kIndex = name === "filtered-aligned" ?
        planted.keyIndices.slice(0, length) : undefined;
      const matched = inferAlphabet(c, key, prior, kIndex);
      const recovered = matched.inverse.filter((g, cvalue) =>
        sigma[g] === cvalue).length;
      cases[name] = {score: matched.score, recoveredRuneLabels: recovered};
    }
    const naive = inferAlphabet(filtered.ciphertext.slice(0, length),
      key, prior);
    const nullScores = [];
    for (let j = 0; j < replicates; j++) {
      const fake = Array.from({length}, () => Math.floor(random() * M));
      nullScores.push(inferAlphabet(
        filtered.ciphertext.slice(0, length), fake, prior).score);
    }
    nullScores.sort((a, b) => a - b);
    cases["filtered-unaligned"] = {
      score: naive.score,
      recoveredRuneLabels: naive.inverse.filter((g, cvalue) =>
        sigma[g] === cvalue).length,
      nullMedian: nullScores[Math.floor(replicates / 2)],
      nullMax: nullScores.at(-1),
      nullUpperTailP: (1 + nullScores.filter(x => x >= naive.score).length) /
        (replicates + 1)
    };
    report.results[length] = cases;
  }
  return report;
}

if (require.main === module) {
  console.log(JSON.stringify(study(), null, 2));
}

module.exports = {
  mod29, assignmentMax, inferAlphabet, decipher, encodeEnglish, encrypt,
  seededRandom, shuffledPermutation, study
};
