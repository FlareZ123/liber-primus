"use strict";
/**
 * Label-free test for a shared page-aligned LP2 keystream.
 *
 * If C_page,t = sigma_page(P_page,t + K_t mod 29), where sigma_page
 * can be an arbitrary, independently selected permutation, within-page
 * equality C_page,t === C_page,u survives sigma_page unchanged.
 * A reused K_t can therefore cause coincidences in these equality
 * patterns across pages, even when no rune labels match between pages.
 *
 * Null: independently circularly rotate each page. This preserves its
 * symbol frequencies, repeats, and short-range serial dependencies.
 *
 * The statistic is sum_(t,u) choose(sum_page [C_page,t=C_page,u],2),
 * restricting to |u-t| >= 8 and page pairs with both positions present.
 * Positive control: one synthetic common 29-symbol pad, page-specific
 * random alphabet permutations, English-like rune unigram sampling from
 * the two solved LP2 pages, and 81% anti-repeat repair.
 *
 * Run: node sims/label_free_reuse.js
 */
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
  "utf8"
));

/** @param {number} seed */
function xorshift(seed) {
  let state = seed | 0;
  return function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * @param {Uint8Array[]} arrays
 * @param {number} minGap
 * @returns {{sets:number[][], T:number}}
 */
function buildWindow(arrays, minGap) {
  const T = Math.max(...arrays.map(a => a.length));
  const sets = Array.from({ length: T }, (_, u) =>
    arrays.map((a, i) => a.length > u ? i : -1).filter(i => i >= 0)
  );
  return { sets, T };
}

/**
 * @param {Uint8Array[]} arrays
 * @param {Int16Array} offsets
 * @param {{sets:number[][],T:number}} window
 * @param {number} minGap
 * @returns {{score:number,within:number,positionPairs:number}}
 */
function score(arrays, offsets, window, minGap) {
  const { sets, T } = window;
  let total = 0;
  let within = 0;
  let positionPairs = 0;
  for (let t = 0; t < T - minGap; ++t) {
    for (let u = t + minGap; u < T; ++u) {
      const ids = sets[u];
      if (ids.length < 10) continue;
      let matches = 0;
      for (const i of ids) {
        const a = arrays[i];
        matches += Number(a[(offsets[i] + t) % a.length] === a[(offsets[i] + u) % a.length]);
      }
      total += matches * (matches - 1) / 2;
      within += matches;
      positionPairs++;
    }
  }
  return { score: total, within, positionPairs };
}

/**
 * @param {Uint8Array[]} arrays
 * @param {{sets:number[][],T:number}} window
 * @param {number} minGap
 * @param {number} n
 * @param {number} seed
 */
function experiment(arrays, window, minGap, n, seed) {
  const random = xorshift(seed);
  const offsets = new Int16Array(arrays.length);
  const observed = score(arrays, offsets, window, minGap);
  const nullScores = [];
  for (let rep = 0; rep < n; ++rep) {
    for (let i = 0; i < arrays.length; ++i) {
      offsets[i] = Math.floor(random() * arrays[i].length);
    }
    nullScores.push(score(arrays, offsets, window, minGap).score);
  }
  const mean = nullScores.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(nullScores.reduce((s, x) => s + (x - mean) ** 2, 0) / (n - 1));
  return {
    observed,
    nullMean: mean,
    nullSd: sd,
    z: (observed.score - mean) / sd,
    upperTailP: (1 + nullScores.filter(v => v >= observed.score).length) / (n + 1),
    nullMax: Math.max(...nullScores)
  };
}

/**
 * @param {number} numberPages
 * @param {number} T
 * @param {number[]} solved
 * @param {number} seed
 * @returns {Uint8Array[]}
 */
function planted(numberPages, T, solved, seed) {
  const random = xorshift(seed);
  const freq = Array(29).fill(0);
  for (const value of solved) freq[value]++;
  const cumulative = [];
  let sum = 0;
  for (const count of freq) {
    sum += count / solved.length;
    cumulative.push(sum);
  }
  const plaintextRune = () => {
    const r = random();
    return Math.max(0, cumulative.findIndex(p => r <= p));
  };
  const key = Array.from({ length: T }, () => Math.floor(random() * 29));
  const arrays = [];
  for (let i = 0; i < numberPages; ++i) {
    const sigma = Array.from({ length: 29 }, (_, j) => j);
    for (let j = 28; j > 0; --j) {
      const k = Math.floor(random() * (j + 1));
      [sigma[k], sigma[j]] = [sigma[j], sigma[k]];
    }
    const values = new Uint8Array(T);
    for (let t = 0; t < T; ++t) {
      let value = sigma[(plaintextRune() + key[t]) % 29];
      if (t > 0 && value === values[t - 1] && random() < 0.81) {
        value = (value + 1 + Math.floor(random() * 28)) % 29;
      }
      values[t] = value;
    }
    arrays.push(values);
  }
  return arrays;
}

const minGap = 8;
const pages = corpus.pages.filter(p => p.status === "unsolved" && p.indices.length >= 40);
const arrays = pages.map(p => Uint8Array.from(p.indices));
const main = experiment(arrays, buildWindow(arrays, minGap), minGap, 250, 0x71de219e);
const solved = corpus.pages.filter(p => p.status === "solved").flatMap(p => p.indices);
const plantPages = corpus.pages.filter(p => p.status === "unsolved" && p.indices.length >= 200);
const control = planted(plantPages.length, 200, solved, 0x72f4a321);
const positive = experiment(control, buildWindow(control, minGap), minGap, 120, 0x5a3182fe);
console.log(JSON.stringify({
  hypothesis: "one common page-aligned 29-symbol pad under independent arbitrary page-wise rune substitutions",
  pages: pages.map(p => p.page),
  minGap,
  rotations: 250,
  seed: "0x71de219e",
  main,
  positiveControl: {
    pages: plantPages.length,
    runesPerPage: 200,
    plaintextModel: "empirical distribution of the two solved LP2 pages",
    antiRepeatReplacementProbability: 0.81,
    seed: "0x72f4a321",
    rotationSeed: "0x5a3182fe",
    rotations: 120,
    ...positive
  }
}, null, 2));
