"use strict";
/**
 * Cross-page ML scoring for a common additive mod-29 keystream.
 *
 * Null model: independently circularly rotate each page; preserve page
 * histograms, exact rune sequences, and local dependence.
 * Positive controls: synthetic GP-English plaintext encrypted under
 * a common keystream, with and without 81% immediate-doublet repair.
 *
 * This tests zero-drift same-offset additive key reuse. It is distinct
 * from tests allowing arbitrary page-specific alphabet permutations
 * or unknown key offsets/drifts.
 *
 * Run: node sims/latent_page_pad.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const CORPUS = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const SHAKESPEARE = fs.readFileSync(
  path.join(ROOT, "resources", "control", "shakespeare_first300k.txt"), "utf8"
);

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

/** @param {string} source */
function shakespeareRunes(source) {
  const mp = new Map(CORPUS.translit.map((item, i) => [item, i]));
  const words = source.toUpperCase().match(/[A-Z]+/g) || [];
  const runes = [];
  for (let word of words) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
    for (let at = 0; at < word.length;) {
      const pair = word.slice(at, at + 2);
      const single = word[at];
      if (mp.has(pair)) {
        runes.push(mp.get(pair));
        at += 2;
      } else if (mp.has(single)) {
        runes.push(mp.get(single));
        at += 1;
      } else {
        at++;
      }
    }
  }
  return runes;
}

/** @param {number[]} encoded @param {number} uniformMix */
function modelDistribution(encoded, uniformMix = 0.1) {
  const histogram = Array(29).fill(1);
  for (const val of encoded) histogram[val]++;
  const total = histogram.reduce((s, x) => s + x, 0);
  return histogram.map(h => (1 - uniformMix) * h / total + uniformMix / 29);
}

/** @param {number[][]} pages @param {number} minimumSupport */
function scoringWindow(pages, minimumSupport = 10) {
  const maxLength = Math.max(...pages.map(p => p.length));
  return Array.from({ length: maxLength }, (_, pos) =>
    pages.map((p, i) => p.length > pos ? i : -1).filter(i => i >= 0)
  ).filter(ids => ids.length >= minimumSupport);
}

/**
 * @param {number[][]} pages
 * @param {number[]} keyLogP
 * @param {number[][]} window
 * @param {number[]} offsets
 */
function score(pages, keyLogP, window, offsets) {
  let total = 0;
  let stable = 0;
  let nPositions = 0;
  const bestKey = [];
  for (const ids of window) {
    const ll = new Float64Array(29);
    for (const i of ids) {
      const v = pages[i][(nPositions + offsets[i]) % pages[i].length];
      for (let k = 0; k < 29; k++) ll[k] += keyLogP[(v - k + 29) % 29];
    }
    let winner = 0;
    for (let k = 1; k < 29; k++) if (ll[k] > ll[winner]) winner = k;
    total += ll[winner];
    bestKey.push(winner);
    if (ll[winner] - Math.max(...Array.from(ll).filter((_, k) => k !== winner)) > 3) stable++;
    nPositions++;
  }
  return { total, positions: nPositions, strongKeyFraction: stable / nPositions, bestKey };
}

/**
 * Note: because window is a prefix of time positions passing the
 * minimum-support test, nPositions maps exactly to the original t.
 *
 * @param {number[][]} pages @param {number[]} logp
 * @param {number[][]} window @param {number} n @param {number} seed
 */
function nullRotations(pages, logp, window, n, seed) {
  const random = xorshift(seed);
  const actual = score(pages, logp, window, pages.map(() => 0));
  const nullScores = [];
  for (let repeat = 0; repeat < n; repeat++) {
    const offsets = pages.map(a => Math.floor(random() * a.length));
    nullScores.push(score(pages, logp, window, offsets).total);
  }
  const mean = nullScores.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(nullScores.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1));
  return {
    observed: { total: actual.total, positions: actual.positions, strongKeyFraction: actual.strongKeyFraction },
    nullMean: mean, nullSD: sd, z: (actual.total - mean) / sd,
    upperTail: (1 + nullScores.filter(s => s >= actual.total).length) / (n + 1),
    nullRepetitions: n
  };
}

/**
 * Synthetic common-pad pages matching actual corpus lengths.
 * One fixed key index per text position. Each synthetic rune may
 * undergo a repair if it equals its immediate predecessor.
 *
 * @param {number[][]} real
 * @param {number[]} prior
 * @param {number} repairProb
 * @param {number} seed
 */
function plant(real, prior, repairProb, seed) {
  const rand = xorshift(seed);
  const kmax = Math.max(...real.map(a => a.length));
  const key = Array.from({ length: kmax }, () => Math.floor(rand() * 29));
  const cumulative = [];
  let s = 0;
  for (const x of prior) { s += x; cumulative.push(s); }
  const pick = () => {
    const r = rand();
    const i = cumulative.findIndex(v => r < v);
    return i < 0 ? 28 : i;
  };
  let repairs = 0;
  const pages = real.map(realPage => {
    const out = [];
    for (let t = 0; t < realPage.length; t++) {
      let value = (pick() + key[t]) % 29;
      if (t > 0 && out[t - 1] === value && rand() < repairProb) {
        value = (value + 1 + Math.floor(rand() * 28)) % 29;
        repairs++;
      }
      out.push(value);
    }
    return out;
  });
  return { pages, key, repairs };
}

function main() {
  const encoded = shakespeareRunes(SHAKESPEARE);
  const sourceDistribution = modelDistribution(encoded, 0);
  const testingDistribution = modelDistribution(encoded, 0.1);
  const logp = testingDistribution.map(p => Math.log(29 * p));
  const real = CORPUS.pages.filter(p => p.status === "unsolved" && p.indices.length > 0)
    .map(p => p.indices);
  const window = scoringWindow(real, 10);
  const repetitions = 250;
  const result = nullRotations(real, logp, window, repetitions, 0x71de219e);
  const controls = [0, 0.81].map((repairProb, i) => {
    const plantSeed = 0x111a77e3 + i;
    const synthetic = plant(real, sourceDistribution, repairProb, plantSeed);
    const actual = score(synthetic.pages, logp, window, synthetic.pages.map(() => 0));
    const expected = synthetic.key.slice(0, window.length);
    const correct = actual.bestKey.filter((v, j) => v === expected[j]).length;
    const nullResult = nullRotations(synthetic.pages, logp, window, 80, 0x56bd992a + i);
    return {
      repairProbability: repairProb,
      plantSeed,
      repairs: synthetic.repairs,
      estimatedKeyAccuracy: correct / expected.length,
      ...nullResult
    };
  });
  console.log(JSON.stringify({
    model: "shared page-aligned additive GP key with Shakespeare-trained rune-unigram likelihood",
    pageCount: real.length,
    sourceRuneCount: encoded.length,
    sourceDistribution,
    uniformMix: 0.1,
    nullSeed: "0x71de219e",
    pagesWithMinimumSupport: 10,
    real: result,
    controls
  }, null, 2));
}

if (require.main === module) main();
module.exports = { shakespeareRunes, modelDistribution, scoringWindow, score, nullRotations, plant };
