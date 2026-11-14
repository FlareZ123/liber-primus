"use strict";
/**
 * Source-order Trifid/Polybius 3x3x3, with exactly two unchanged GP29
 * symbols, one fixed to historical F, the other allowed to be any other GP
 * symbol. This is a bounded original-cipher candidate test, NOT an
 * all-secret-key exclusion and NOT evidence of an authentic skip rule.
 *
 * The 27 remaining GP symbols fill the cube in native index order.
 * Variants: 28 possible additional bypass symbols; page/book clocks;
 * periods 3, 5, 27; six coordinate-axis permutations; both transform
 * directions (28*2*3*6*2 = 2016).
 *
 * Trifid splits a block into its three cube coordinates, concatenates
 * the coordinate streams, and regroups consecutive triples. This code
 * tests both the exact encryption and inverse with untouched bypasses.
 *
 * Read-only, built-in Node 22, CommonJS:
 *   node sims/lp2_trifid27_transparent2_sourceorder_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const source = (relative) => fs.readFileSync(
  path.join(ROOT, relative), "utf8");
const corpus = JSON.parse(source("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter((p) => p.page < 56 && p.indices.length);
const ciphertext = pages.flatMap((p) => p.indices);
assert.equal(pages.length, 55);
assert.equal(ciphertext.length, 12956);
assert.deepEqual(ciphertext.slice(0, 8), [15, 8, 18, 3, 6, 19, 27, 0]);

const lexical = new Map(corpus.translit.map((value, i) => [value, i]));
const AXES = [
  [0, 1, 2], [0, 2, 1], [1, 0, 2],
  [1, 2, 0], [2, 0, 1], [2, 1, 0]
];

/** @param {string} text @returns {number[]} */
function gp(text) {
  const words = text.toUpperCase()
    .replace(/QU/g, "CW").replace(/[KQ]/g, "C")
    .replace(/V/g, "U").replace(/Z/g, "S")
    .replace(/[^A-Z]/g, " ").split(" ");
  const out = [];
  for (const word of words) {
    for (let i = 0; i < word.length;) {
      const pair = lexical.get(word.slice(i, i + 2));
      if (pair !== undefined) {
        out.push(pair);
        i += 2;
      } else {
        const one = lexical.get(word[i]);
        assert.notEqual(one, undefined);
        out.push(one);
        i++;
      }
    }
  }
  return out;
}

/**
 * @param {number[]} values
 * @returns {{score:(values:number[])=>number}}
 */
function model(values) {
  const bins = Array.from({length: 29}, () => Array(29).fill(0.5));
  const totals = Array(29).fill(29 * 0.5);
  for (let i = 1; i < values.length; i++) {
    bins[values[i-1]][values[i]]++;
    totals[values[i-1]]++;
  }
  const log = bins.map((row, i) =>
    row.map((count) => Math.log(count / totals[i])));
  return {
    score: (sequence) => {
      let value = 0;
      for (let i = 1; i < sequence.length; i++) {
        value += log[sequence[i-1]][sequence[i]];
      }
      return value / (sequence.length - 1);
    }
  };
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const hist = Array(29).fill(0);
  for (const x of values) hist[x]++;
  return hist.reduce((sum, n) => sum + n * (n-1), 0) /
    (values.length * (values.length - 1));
}

/**
 * One deterministic, reversible 27-rune 3x3x3 Trifid transform.
 * @param {number[]} sourceRunes
 * @param {number} otherBypass second literal bypass (F is fixed at 0)
 * @param {number} period core-rune clock, bypasses do not consume steps
 * @param {number[]} axes coordinate permutation
 * @param {boolean} inverse if true, undo original forward fractionation
 * @returns {number[]}
 */
function trifid(sourceRunes, otherBypass, period, axes, inverse) {
  const core = Array.from({length: 29}, (_, i) => i)
    .filter((i) => i !== 0 && i !== otherBypass);
  assert.equal(core.length, 27);
  const index = Array(29).fill(-1);
  core.forEach((rune, i) => { index[rune] = i; });
  const output = sourceRunes.slice();
  const positions = [];
  for (let i = 0; i < sourceRunes.length; i++) {
    if (index[sourceRunes[i]] >= 0) positions.push(i);
  }
  for (let offset = 0; offset < positions.length; offset += period) {
    const n = Math.min(period, positions.length - offset);
    const stream = Array(3*n);
    if (!inverse) {
      for (let j = 0; j < n; j++) {
        const x = index[sourceRunes[positions[offset+j]]];
        const digits = [Math.floor(x/9), Math.floor(x/3)%3, x%3];
        for (let axis = 0; axis < 3; axis++) {
          stream[axis*n+j] = digits[axes[axis]];
        }
      }
      for (let j = 0; j < n; j++) {
        const digits = [0,0,0];
        for (let axis = 0; axis < 3; axis++) {
          digits[axes[axis]] = stream[3*j+axis];
        }
        output[positions[offset+j]] =
          core[9*digits[0] + 3*digits[1] + digits[2]];
      }
    } else {
      for (let j = 0; j < n; j++) {
        const x = index[sourceRunes[positions[offset+j]]];
        const digits = [Math.floor(x/9), Math.floor(x/3)%3, x%3];
        for (let axis = 0; axis < 3; axis++) {
          stream[3*j+axis] = digits[axes[axis]];
        }
      }
      for (let j = 0; j < n; j++) {
        const digits = [0,0,0];
        for (let axis = 0; axis < 3; axis++) {
          digits[axes[axis]] = stream[axis*n+j];
        }
        output[positions[offset+j]] =
          core[9*digits[0] + 3*digits[1] + digits[2]];
      }
    }
  }
  return output;
}

/** @param {number[][]} chunks @param {number} bypass @param {number} period
 * @param {number[]} axes @param {boolean} inverse */
function transform(chunks, bypass, period, axes, inverse) {
  return chunks.map((chunk) =>
    trifid(chunk, bypass, period, axes, inverse)).flat();
}

/** @returns {object} */
function main() {
  const language = gp(source("resources/control/gibran_prophet_58585.txt"));
  assert.ok(language.length > 50000);
  const fit = model(language.slice(0, 20000));
  const heldout = language.slice(20000);
  const windowScores = [];
  for (let start = 0; start + 12956 <= heldout.length; start += 251) {
    windowScores.push(fit.score(heldout.slice(start, start + 12956)));
  }
  assert.ok(windowScores.length > 100);
  const nativeFloor = Math.min(...windowScores);
  const p57 = corpus.pages.find((p) => p.page === 57).indices;
  const originalScore = fit.score(ciphertext);
  const originalIoC = ioc(ciphertext);
  const results = [];
  let plantsRecovered = 0;
  for (let other = 1; other < 29; other++) {
    for (const period of [3, 5, 27]) {
      for (const axes of AXES) {
        const planted = language.slice(100, 500);
        const coded = trifid(planted, other, period, axes, false);
        const decoded = trifid(coded, other, period, axes, true);
        assert.deepEqual(decoded, planted);
        assert.deepEqual(trifid(decoded, other, period, axes, false), coded);
        plantsRecovered++;
        for (const clock of ["book", "pages"]) {
          for (const inverse of [false, true]) {
            const chunks = clock === "book" ? [ciphertext] :
              pages.map((p) => p.indices);
            const candidate = transform(chunks, other, period, axes, inverse);
            const record = {
              bypass: other,
              period,
              axes: axes.join(""),
              clock,
              direction: inverse ? "inverse" : "forward",
              originalScore: fit.score(candidate),
              first729Score: fit.score(candidate.slice(0,729)),
              heldoutScore: fit.score(candidate.slice(8000)),
              originalIoC: ioc(candidate)
            };
            results.push(record);
          }
        }
      }
    }
  }
  assert.equal(plantsRecovered, 504);
  assert.equal(results.length, 2016);
  results.sort((a,b) => b.originalScore - a.originalScore);
  const bestOpening = results.slice().sort(
    (a,b) => b.first729Score - a.first729Score)[0];
  const best = results[0];
  assert.ok(best.originalScore < nativeFloor - 1,
    "No direct source-order variant should be mistaken for native prose");
  assert.ok(best.originalIoC < 0.045);
  return {
    classification: "Negative only for fixed native-order 27-cube Trifid with two literal bypass symbols",
    ciphertext: {runes: ciphertext.length, pages: pages.length,
      baselineBigram: originalScore, baselineIoC: originalIoC},
    native: {
      independentGibranWindows: windowScores.length,
      independentWindowScoreMin: nativeFloor,
      independentWindowScoreMax: Math.max(...windowScores),
      independentWindowScoreMedian:
        windowScores.slice().sort((a,b) => a-b)[Math.floor(windowScores.length/2)],
      authenticP57Score: fit.score(p57),
      authenticP57IoC: ioc(p57)
    },
    variants: results.length,
    exactRoundTripPlants: plantsRecovered,
    bestOriginal: best,
    bestFirst729: bestOpening,
    topFive: results.slice(0,5),
    limitation: "No arbitrary secret permutation of the 27 cube cells, non-identity state, other reset clocks, altered segmentation, ciphertext-F ambiguity or an authentic authorial operator is excluded."
  };
}
if (require.main === module) console.log(JSON.stringify(main(), null, 2));
module.exports = {trifid, gp, model, ioc, main};
