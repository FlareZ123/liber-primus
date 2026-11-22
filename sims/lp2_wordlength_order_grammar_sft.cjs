"use strict";

/**
 * Original LP2 printed-word order diagnostic.
 *
 * The experiment asks whether the observed ordered word lengths carry the
 * short/long adjacency structure found in independently GP-normalized prose.
 * It does not assert a plaintext, identify an encryption method, or assume
 * that visible word separators are authentic plaintext separators.
 *
 * Run: node sims/lp2_wordlength_order_grammar_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..");
const N = 2896;
const SEED = 0x33014545;

/** @param {string} name */
function readControl(name) {
  return fs.readFileSync(path.join(ROOT, "resources", "control", name), "utf8");
}

/**
 * GP29 native spelling used by the existing English reference models.
 * QU is rendered CW, V=U, K/Q=C, Z=S, and the seven digraphs are greedy.
 * @param {string} text
 * @returns {number[]}
 */
function nativeLengths(text, includeIng = false) {
  const words = text.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[VKZQ]/g, ch => ({V: "U", K: "C", Z: "S", Q: "C"})[ch])
    .match(/[A-Z]+/g) || [];
  return words.map(word => (word.match(includeIng
    ? /ING|TH|EO|NG|OE|AE|IA|EA|./g : /TH|EO|NG|OE|AE|IA|EA|./g) || []).length);
}

/**
 * Input word classes are lengths 1,2,...,8,9+.
 * @param {number[]} a
 * @returns {{chi:number,mi:number,rho:number,followingSingletonLong:number}}
 */
function stats(a) {
  const n = a.length;
  const joint = Array.from({length: 10}, () => Array(10).fill(0));
  const row = Array(10).fill(0);
  const col = Array(10).fill(0);
  let sum = 0;
  let squares = 0;
  let products = 0;
  for (let i = 0; i < n; i++) {
    sum += a[i];
    squares += a[i] * a[i];
    if (i > 0) {
      products += a[i - 1] * a[i];
      const x = Math.min(a[i - 1], 9);
      const y = Math.min(a[i], 9);
      joint[x][y]++;
      row[x]++;
      col[y]++;
    }
  }
  const mean = sum / n;
  const rho = (products / (n - 1) - mean * mean) /
    (squares / n - mean * mean);
  let chi = 0;
  let mi = 0;
  for (let i = 1; i <= 9; i++) {
    for (let j = 1; j <= 9; j++) {
      const v = joint[i][j];
      const expected = row[i] * col[j] / (n - 1);
      if (expected > 0) {
        chi += (v - expected) ** 2 / expected;
        if (v) mi += v / (n - 1) * Math.log(v / expected);
      }
    }
  }
  return {chi, mi, rho,
    followingSingletonLong: row[1]
      ? joint[1].slice(4).reduce((a, b) => a + b, 0) / row[1] : null};
}

/** @param {number} value @returns {number} */
function mixHash(value) {
  let v = Math.imul(value ^ (value >>> 16), 0x7feb352d);
  v = Math.imul(v ^ (v >>> 15), 0x846ca68b);
  return (v ^ (v >>> 16)) >>> 0;
}

/**
 * Match every native-control word histogram exactly to the original manuscript
 * without looking at ciphertext adjacency. Stable, source-independent tie
 * hashes do not use the observed original ordering.
 * @param {number[]} a
 * @param {number[]} targetSorted
 * @returns {number[]}
 */
function rankMatch(a, targetSorted, tieSeed = 0x3301) {
  const indices = Array.from({length: a.length}, (_, i) => i);
  indices.sort((i, j) =>
    a[i] - a[j] ||
    mixHash(i + tieSeed) - mixHash(j + tieSeed));
  const out = Array(a.length);
  for (let rank = 0; rank < indices.length; rank++) {
    out[indices[rank]] = targetSorted[rank];
  }
  return out;
}

/** @param {number} initial */
function random(initial) {
  let state = initial >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {number[]} values @param {()=>number} next */
function shuffle(values, next) {
  for (let j = values.length - 1; j > 0; j--) {
    const k = next() % (j + 1);
    [values[j], values[k]] = [values[k], values[j]];
  }
}

function main() {
  const corpus = parseSharedCorpus();
  assert.equal(corpus.runeCount, 12956);
  assert.equal(corpus.crossPageWords, 32);
  assert.equal(corpus.words.length, N);
  const original = corpus.words.map(word => word.length);
  const observed = stats(original);
  assert.ok(Math.abs(observed.chi - 68.27318638192133) < 1e-9);
  assert.ok(Math.abs(observed.mi - 0.01229969288099125) < 1e-10);
  const sorted = original.slice().sort((a, b) => a - b);

  const samples = [
    ["Shakespeare", nativeLengths(readControl("shakespeare_first300k.txt"))],
    ["Gibran", nativeLengths(readControl("gibran_prophet_58585.txt"))],
    ["Emerson", nativeLengths(readControl("emerson_essays_2944.txt"))],
    ["Latin Vulgate", readControl("latin-vulgate-gp-wholewords.txt")
      .split(/\r?\n/u).filter(line => /^[0-9A-S]+$/u.test(line))
      .map(line => line.length)]
  ];

  const controls = samples.map(([author, input]) => {
    let count = 0;
    let belowOriginal = 0;
    let rankMatchedBelowOriginal = 0;
    let rankMatchedBelowMI = 0;
    let minimumChi = Infinity;
    let minimumMatchedChi = Infinity;
    let minimumMatchedMI = Infinity;
    for (let offset = 0; offset + N <= input.length; offset += N) {
      const wordWindow = input.slice(offset, offset + N);
      const native = stats(wordWindow);
      const adjusted = stats(rankMatch(wordWindow, sorted));
      count++;
      belowOriginal += native.chi <= observed.chi;
      rankMatchedBelowOriginal += adjusted.chi <= observed.chi;
      rankMatchedBelowMI += adjusted.mi <= observed.mi;
      minimumChi = Math.min(minimumChi, native.chi);
      minimumMatchedChi = Math.min(minimumMatchedChi, adjusted.chi);
      minimumMatchedMI = Math.min(minimumMatchedMI, adjusted.mi);
    }
    return {author, windows: count, belowOriginal, rankMatchedBelowOriginal,
      rankMatchedBelowMI, minimumChi, minimumMatchedChi, minimumMatchedMI};
  });
  assert.deepEqual(controls.map(c => c.windows), [19, 5, 26, 13]);
  assert.equal(controls.reduce((s, c) => s + c.rankMatchedBelowOriginal, 0), 0);

  // Adversarial sensitivity: preserve the original histogram exactly,
  // independently vary all tie handling, and allow the GP ING ligature.
  const seeds = [0x3301, 0x2014, 0x2016, 0xDEAD, 0x7A35];
  let sensitivityCases = 0;
  let sensitivityViolations = 0;
  let sensitivityMinimumChi = Infinity;
  for (const ing of [false, true]) {
    const variedControls = [
      nativeLengths(readControl("shakespeare_first300k.txt"), ing),
      nativeLengths(readControl("gibran_prophet_58585.txt"), ing),
      nativeLengths(readControl("emerson_essays_2944.txt"), ing),
      samples[3][1]
    ];
    for (const seed of seeds) {
      for (const input of variedControls) {
        for (let start = 0; start + N <= input.length; start += N) {
          const adjusted = stats(rankMatch(input.slice(start, start + N),
            sorted, seed));
          sensitivityCases++;
          sensitivityViolations += adjusted.chi <= observed.chi;
          sensitivityMinimumChi = Math.min(sensitivityMinimumChi, adjusted.chi);
        }
      }
    }
  }
  assert.equal(sensitivityCases, 630);
  assert.equal(sensitivityViolations, 0);
  assert.ok(Math.abs(sensitivityMinimumChi - 85.63966793443952) < 1e-8);

  // An exact-inventory positional null, independent of language models.
  const draws = 20000;
  const next = random(SEED);
  const permuted = original.slice();
  let chiExceed = 0;
  let chiTotal = 0;
  let miBelow = 0;
  let miTotal = 0;
  for (let sample = 0; sample < draws; sample++) {
    shuffle(permuted, next);
    const val = stats(permuted);
    chiExceed += val.chi >= observed.chi;
    miBelow += val.mi <= observed.mi;
    chiTotal += val.chi;
    miTotal += val.mi;
  }
  const nullResult = {draws, seed: SEED,
    meanChi: chiTotal / draws,
    chiUpperTail: (chiExceed + 1) / (draws + 1),
    meanMI: miTotal / draws,
    miLowerTail: (miBelow + 1) / (draws + 1)};
  assert.ok(Math.abs(nullResult.meanChi - 64.01881443577327) < 1e-8);
  assert.ok(Math.abs(nullResult.chiUpperTail - 0.3319834008299585) < 1e-10);

  console.log(JSON.stringify({source: {words: N, runes: corpus.runeCount,
    crossPageWords: corpus.crossPageWords, ...observed},
  controls, sensitivity: {cases: sensitivityCases, violations: sensitivityViolations,
    minimumChi: sensitivityMinimumChi},
  exactHistogramShuffleNull: nullResult}, null, 2));
}

if (require.main === module) main();
module.exports = {nativeLengths, stats, rankMatch};
