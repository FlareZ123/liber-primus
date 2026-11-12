"use strict";
/**
 * Original LP2 all-secret 16-column whole-word transposition gate.
 *
 * The p15 numerical spiral has 16 cells; the manuscript has exactly
 * 2,896 original full words = 181 x 16. This test grants an unknown,
 * fixed 16-column key and optimizes ALL 16! orders by Hamiltonian
 * path dynamic programming, then evaluates the same order on 91
 * held-out manuscript rows. Two genuinely distinct serialization
 * models are covered: row-major and column-major input.
 *
 * All scoring is word-length-only, leaving GP ciphertext untouched.
 * This is a conditional architectural test, not decrypted plaintext.
 *
 * Run from a repository checkout with Node.js 22:
 *   node sims/lp2_p15_allsecret_16column_word_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname, "..");
const WIDTH = 16;
const ROWS = 181;
const TRAIN = 90;
const REPS = 30000;
const SPIRAL = [5, 6, 10, 9, 8, 4, 0, 1, 2, 3, 7, 11, 15, 14, 13, 12];
const IDENTITY = Array.from({length: WIDTH}, (_, i) => i);
const DIGRAPHS = new Set(["TH", "NG", "EO", "OE", "AE", "IA", "EA"]);

/** @param {string} filename @returns {string} */
function read(filename) {
  return fs.readFileSync(path.join(ROOT, filename), "utf8");
}

/** @param {string} word @returns {number} */
function gpLength(word) {
  const source = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  let length = 0;
  for (let i = 0; i < source.length;) {
    if (source.slice(i, i + 3) === "ING") i += 3;
    else if (DIGRAPHS.has(source.slice(i, i + 2))) i += 2;
    else {
      assert.match(source[i], /[A-Z]/u);
      i++;
    }
    length++;
  }
  return length;
}

/** @param {string} source @returns {number[]} */
function normalizeWords(source) {
  return (source.toUpperCase().match(/[A-Z]+/gu) || []).map(gpLength);
}

/** @param {number} value @returns {number} */
function bin(value) {
  assert.ok(Number.isInteger(value) && value > 0);
  return Math.min(value - 1, 6);
}

/**
 * Frozen first-order GP word-length log-odds model.
 * Shakespeare prefix 30k and Gibran prefix 8k train it; plants are
 * from disjoint later portions of these same source documents.
 * @param {number[]} shakespeare
 * @param {number[]} gibran
 * @returns {number[][]}
 */
function trainLanguage(shakespeare, gibran) {
  const counts = Array.from({length: 7}, () => Array(7).fill(2));
  const from = Array(7).fill(14), to = Array(7).fill(14);
  let total = 98;
  for (const [series, begin, end] of [
    [shakespeare, 0, 30000],
    [gibran, 0, 8000]
  ]) {
    for (let i = begin + 1; i < end; i++) {
      const a = bin(series[i - 1]), b = bin(series[i]);
      counts[a][b]++;
      from[a]++;
      to[b]++;
      total++;
    }
  }
  return counts.map((line, i) => line.map((n, j) =>
    Math.log(n / from[i]) - Math.log(to[j] / total)));
}

/**
 * The score of a transition between any ordered pair of columns
 * is summed separately on the source-fixed training or held-out rows.
 * @param {number[]} words
 * @param {"row"|"column"} orientation
 * @param {number} start
 * @param {number} end
 * @param {number[][]} language
 * @returns {Float64Array[]}
 */
function edges(words, orientation, start, end, language) {
  assert.equal(words.length, WIDTH * ROWS);
  const matrix = Array.from({length: WIDTH}, () => new Float64Array(WIDTH));
  for (let r = start; r < end; r++) {
    for (let a = 0; a < WIDTH; a++) {
      for (let b = 0; b < WIDTH; b++) {
        if (a === b) continue;
        const left = orientation === "row" ? words[r * WIDTH + a] :
          words[a * ROWS + r];
        const right = orientation === "row" ? words[r * WIDTH + b] :
          words[b * ROWS + r];
        matrix[a][b] += language[bin(left)][bin(right)];
      }
    }
  }
  return matrix;
}

/**
 * Exact maximum-weight directed Hamiltonian path via Held-Karp DP.
 * This optimizes all 16! source-independent column orders, including
 * arbitrary start and end. Row-end to next-row-start transitions are
 * reserved as an unoptimized cross-row diagnostic.
 * @param {Float64Array[]} edge
 * @returns {{score:number,order:number[]}}
 */
function optimize(edge) {
  const full = (1 << WIDTH) - 1;
  const dp = new Float64Array((full + 1) * WIDTH).fill(-1e100);
  const previous = new Int8Array(dp.length).fill(-1);
  for (let i = 0; i < WIDTH; i++) dp[(1 << i) * WIDTH + i] = 0;
  for (let mask = 1; mask <= full; mask++) {
    const absent = full ^ mask;
    for (let chosen = mask; chosen; chosen &= chosen - 1) {
      const last = 31 - Math.clz32(chosen & -chosen);
      const old = dp[mask * WIDTH + last];
      if (old < -1e90) continue;
      for (let available = absent; available; available &= available - 1) {
        const next = 31 - Math.clz32(available & -available);
        const target = (mask | (1 << next)) * WIDTH + next;
        const candidate = old + edge[last][next];
        if (candidate > dp[target]) {
          dp[target] = candidate;
          previous[target] = last;
        }
      }
    }
  }
  let best = -Infinity, last = -1;
  for (let i = 0; i < WIDTH; i++) {
    if (dp[full * WIDTH + i] > best) {
      best = dp[full * WIDTH + i];
      last = i;
    }
  }
  const backwards = [];
  let remaining = full;
  while (last >= 0) {
    backwards.push(last);
    const predecessor = previous[remaining * WIDTH + last];
    remaining ^= 1 << last;
    last = predecessor;
  }
  const order = backwards.reverse();
  assert.equal(order.length, WIDTH);
  assert.equal(new Set(order).size, WIDTH);
  return {score: best, order};
}

/** @param {Float64Array[]} edge @param {number[]} order @returns {number} */
function score(edge, order) {
  let total = 0;
  for (let i = 1; i < order.length; i++)
    total += edge[order[i - 1]][order[i]];
  return total;
}

/** @param {number} seed @returns {() => number} */
function random32(seed) {
  let state = seed | 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {() => number} random @returns {number[]} */
function randomOrder(random) {
  const permutation = IDENTITY.slice();
  for (let i = WIDTH - 1; i > 0; i--) {
    const j = random() % (i + 1);
    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
  }
  return permutation;
}

/**
 * Rank the frozen, training-selected permutation among random
 * column orders on wholly independent held-out rows.
 * @param {Float64Array[]} test
 * @param {number[]} order
 * @param {number} seed
 */
function heldoutNull(test, order, seed) {
  const random = random32(seed);
  const observed = score(test, order);
  const values = [];
  let greaterOrEqual = 0;
  for (let i = 0; i < REPS; i++) {
    const value = score(test, randomOrder(random));
    values.push(value);
    greaterOrEqual += Number(value >= observed);
  }
  values.sort((a, b) => a - b);
  return {
    observed, comparisonOrders: REPS,
    seed: "0x" + (seed >>> 0).toString(16),
    nullMean: values.reduce((a, b) => a + b, 0) / REPS,
    null95: values[Math.floor(.95 * REPS)],
    null99: values[Math.floor(.99 * REPS)],
    empiricalUpperTail: (greaterOrEqual + 1) / (REPS + 1)
  };
}

/**
 * Exactly reversible fixed secret 16-column transposition.
 * @param {number[]} plaintext
 * @param {"row"|"column"} orientation
 * @param {number[]} secret
 * @returns {number[]}
 */
function encryptWords(plaintext, orientation, secret) {
  assert.equal(plaintext.length, WIDTH * ROWS);
  const result = Array(plaintext.length);
  for (let r = 0; r < ROWS; r++)
    for (let j = 0; j < WIDTH; j++)
      result[orientation === "row" ?
        r * WIDTH + secret[j] : secret[j] * ROWS + r] =
        plaintext[r * WIDTH + j];
  return result;
}

/**
 * @returns {object} One complete source-native original and positive-plant test.
 */
function run() {
  const original = parseSharedCorpus();
  assert.equal(original.words.length, 2896);
  assert.equal(original.runeCount, 12956);
  assert.equal(original.crossPageWords, 32);
  const ciphertextLengths = original.words.map(word => word.length);
  const shakespeare = normalizeWords(read("resources/control/shakespeare_first300k.txt"));
  const gibran = normalizeWords(read("resources/control/gibran_prophet_58585.txt"));
  assert.equal(shakespeare.length, 55407);
  assert.equal(gibran.length, 15733);
  const language = trainLanguage(shakespeare, gibran);
  const outcomes = [];
  for (const orientation of ["row", "column"]) {
    const training = edges(ciphertextLengths, orientation, 0, TRAIN, language);
    const test = edges(ciphertextLengths, orientation, TRAIN, ROWS, language);
    const inferred = optimize(training);
    const full = optimize(edges(ciphertextLengths, orientation, 0, ROWS, language));
    outcomes.push({
      orientation, selectedTrainingPermutation: inferred.order,
      trainingGainOverPrinted: inferred.score - score(training, IDENTITY),
      heldoutGainOverPrinted: score(test, inferred.order) - score(test, IDENTITY),
      fullCorpusUnheldGain: full.score - score(
        edges(ciphertextLengths, orientation, 0, ROWS, language), IDENTITY),
      heldout: heldoutNull(test, inferred.order, 0x71cbdd31)
    });
  }

  const plants = [];
  for (const [name, plaintext] of [
    ["Shakespeare", shakespeare.slice(35000, 35000 + 2896)],
    ["Gibran", gibran.slice(12000, 12000 + 2896)]
  ]) {
    assert.equal(plaintext.length, 2896);
    for (const orientation of ["row", "column"]) {
      const cipher = encryptWords(plaintext, orientation, SPIRAL);
      const inferred = optimize(edges(cipher, orientation, 0, TRAIN, language));
      const full = optimize(edges(cipher, orientation, 0, ROWS, language));
      const test = edges(cipher, orientation, TRAIN, ROWS, language);
      // Confirm the known planted word permutation round trips exactly.
      for (let r = 0; r < ROWS; r++)
        for (let j = 0; j < WIDTH; j++)
          assert.equal(cipher[orientation === "row" ?
            r * WIDTH + SPIRAL[j] : SPIRAL[j] * ROWS + r],
          plaintext[r * WIDTH + j]);
      plants.push({
        text: name, orientation, plantedSecret: SPIRAL,
        exact90RowKey: inferred.order.every((v, i) => v === SPIRAL[i]),
        full181RowKey: full.order.every((v, i) => v === SPIRAL[i]),
        trainingSelected: inferred.order,
        heldoutScore: score(test, inferred.order),
        heldoutNull: heldoutNull(test, inferred.order, 0x71cbdd31)
      });
    }
  }
  assert.equal(plants.filter(x => x.text === "Shakespeare" && x.full181RowKey).length, 2);
  assert.ok(outcomes.every(x => x.heldout.empiricalUpperTail > .05));
  return {
    classification: "Conditional full 16! word-order gate; no unknown plaintext recovered",
    originalWords: 2896, originalRunes: 12956,
    sourceSpiralColumns: SPIRAL, matrixRows: ROWS, columns: WIDTH,
    fittedRows: TRAIN, withheldRows: ROWS - TRAIN,
    trainingText: "Shakespeare first 30000 words + Gibran first 8000, GP-normalized",
    objective: "7-bin adjacent whole-word GP-length log odds, within each 16-word row",
    original: outcomes, nativeWordLengthPlants: plants,
    limitation: "Same hidden column order on every row and natural-source-like length adjacency. Only row-internal edges scored; no punctuation or rune-language fit. Exact key recovery is source dependent."
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {run, optimize, edges, encryptWords};
