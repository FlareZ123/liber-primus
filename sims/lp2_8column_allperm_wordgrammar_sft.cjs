"use strict";

/**
 * Exhaustive source-shaped eight-column word-order investigation.
 * Node.js 22 CommonJS; run from repository root:
 * node sims/lp2_8column_allperm_wordgrammar_sft.cjs
 *
 * The original 2896 complete rune words fill eight contiguous source columns
 * of 362 words. Test every one of 8! column read orders. Scores depend only
 * on printed word lengths and preserve every original word/rune identity.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {nativeLengths, rankMatch, stats} =
  require("./lp2_wordlength_order_grammar_sft.cjs");

const ROOT = path.join(__dirname, "..");
const WORDS = 2896;
const COLUMNS = 8;
const ROWS = WORDS / COLUMNS;
const CLASSES = 9;
const CHI_SEED = 0x3301c043;
const LANGUAGE_SEED = 0x3301c044;
const FIXED_PLANT_KEY = [6, 1, 7, 0, 4, 3, 5, 2];

/** @param {string} name @returns {string} */
function readControl(name) {
  return fs.readFileSync(path.join(ROOT, "resources", "control", name), "utf8");
}

/** @param {number[]} lengths @returns {Uint8Array} */
function categories(lengths) {
  return Uint8Array.from(lengths, value => Math.min(value, 9) - 1);
}

/**
 * Train a nine-class word-length adjacency log-likelihood ratio on
 * histogram-matched, complete Shakespeare control windows only.
 * @param {number[]} originalLengths
 * @returns {{weights:Float64Array,windows:number}}
 */
function trainWeights(originalLengths) {
  const target = originalLengths.slice().sort((a, b) => a - b);
  const native = nativeLengths(readControl("shakespeare_first300k.txt"));
  const pairs = new Float64Array(CLASSES * CLASSES);
  const row = new Float64Array(CLASSES);
  const col = new Float64Array(CLASSES);
  let count = 0;
  let windows = 0;
  for (let start = 0; start + WORDS <= native.length; start += WORDS) {
    const matched = categories(rankMatch(native.slice(start, start + WORDS),
      target));
    windows++;
    for (let i = 1; i < WORDS; i++) {
      pairs[matched[i - 1] * CLASSES + matched[i]]++;
      row[matched[i - 1]]++;
      col[matched[i]]++;
      count++;
    }
  }
  const alpha = 0.5;
  const denominator = count + CLASSES * CLASSES * alpha;
  const weights = new Float64Array(CLASSES * CLASSES);
  for (let i = 0; i < CLASSES; i++) {
    for (let j = 0; j < CLASSES; j++) {
      const a = (pairs[i * CLASSES + j] + alpha) / denominator;
      const b = (row[i] + CLASSES * alpha) / denominator;
      const c = (col[j] + CLASSES * alpha) / denominator;
      weights[i * CLASSES + j] = Math.log(a / (b * c));
    }
  }
  return {weights, windows};
}

/**
 * Score all 40320 permutations efficiently with precomputed within-row
 * and row-wrap adjacency tables. The original is stored down 362-word
 * columns, then read horizontally in the trial column order.
 * @param {Uint8Array} input
 * @param {Float64Array} weights
 * @returns {{score:number,perm:string,evaluated:number}}
 */
function bestLanguageOrder(input, weights) {
  assert.equal(input.length, WORDS);
  const edges = new Float64Array(COLUMNS * COLUMNS);
  const wraps = new Float64Array(COLUMNS * COLUMNS);
  for (let a = 0; a < COLUMNS; a++) {
    for (let b = 0; b < COLUMNS; b++) {
      let edge = 0;
      let wrap = 0;
      for (let r = 0; r < ROWS; r++) {
        edge += weights[input[a * ROWS + r] * CLASSES +
          input[b * ROWS + r]];
        if (r < ROWS - 1) {
          wrap += weights[input[a * ROWS + r] * CLASSES +
            input[b * ROWS + r + 1]];
        }
      }
      edges[a * COLUMNS + b] = edge;
      wraps[a * COLUMNS + b] = wrap;
    }
  }
  const permutation = new Int8Array(COLUMNS);
  let best = -Infinity;
  let key = "";
  let evaluated = 0;
  /** @param {number} depth @param {number} used @param {number} score */
  function visit(depth, used, score) {
    if (depth === COLUMNS) {
      const candidate = score +
        wraps[permutation[COLUMNS - 1] * COLUMNS + permutation[0]];
      evaluated++;
      if (candidate > best) {
        best = candidate;
        key = Array.from(permutation).join(",");
      }
      return;
    }
    for (let c = 0; c < COLUMNS; c++) {
      if ((used & (1 << c)) !== 0) continue;
      permutation[depth] = c;
      const extra = depth === 0 ? 0 :
        edges[permutation[depth - 1] * COLUMNS + c];
      visit(depth + 1, used | (1 << c), score + extra);
    }
  }
  visit(0, 0, 0);
  assert.equal(evaluated, 40320);
  return {score: best, perm: key, evaluated};
}

/**
 * Exhaustively optimize the original 9-by-9 Pearson word-length adjacency
 * statistic, including the single row-wrap transition.
 * @param {Uint8Array} input
 * @returns {{score:number,perm:string,evaluated:number}}
 */
function bestChiOrder(input) {
  assert.equal(input.length, WORDS);
  const cells = CLASSES * CLASSES;
  const edges = Array.from({length: COLUMNS * COLUMNS},
    () => new Int16Array(cells));
  const wraps = Array.from({length: COLUMNS * COLUMNS},
    () => new Int16Array(cells));
  const total = new Float64Array(CLASSES);
  for (const v of input) total[v]++;
  for (let a = 0; a < COLUMNS; a++) {
    for (let b = 0; b < COLUMNS; b++) {
      const e = edges[a * COLUMNS + b];
      const w = wraps[a * COLUMNS + b];
      for (let r = 0; r < ROWS; r++) {
        e[input[a * ROWS + r] * CLASSES + input[b * ROWS + r]]++;
        if (r < ROWS - 1) {
          w[input[a * ROWS + r] * CLASSES +
            input[b * ROWS + r + 1]]++;
        }
      }
    }
  }
  const observed = new Int16Array(cells);
  const permutation = new Int8Array(COLUMNS);
  let best = -Infinity;
  let key = "";
  let evaluated = 0;
  /** @param {number} depth @param {number} used */
  function visit(depth, used) {
    if (depth === COLUMNS) {
      const wrap = wraps[permutation[COLUMNS - 1] * COLUMNS +
        permutation[0]];
      for (let z = 0; z < cells; z++) observed[z] += wrap[z];
      const row = total.slice();
      const col = total.slice();
      row[input[permutation[COLUMNS - 1] * ROWS + ROWS - 1]]--;
      col[input[permutation[0] * ROWS]]--;
      let chi = 0;
      for (let i = 0; i < CLASSES; i++) {
        for (let j = 0; j < CLASSES; j++) {
          const expected = row[i] * col[j] / (WORDS - 1);
          if (expected <= 0) continue;
          const delta = observed[i * CLASSES + j] - expected;
          chi += delta * delta / expected;
        }
      }
      for (let z = 0; z < cells; z++) observed[z] -= wrap[z];
      evaluated++;
      if (chi > best) {
        best = chi;
        key = Array.from(permutation).join(",");
      }
      return;
    }
    for (let c = 0; c < COLUMNS; c++) {
      if ((used & (1 << c)) !== 0) continue;
      permutation[depth] = c;
      const edge = depth === 0 ? null :
        edges[permutation[depth - 1] * COLUMNS + c];
      if (edge) for (let z = 0; z < cells; z++) observed[z] += edge[z];
      visit(depth + 1, used | (1 << c));
      if (edge) for (let z = 0; z < cells; z++) observed[z] -= edge[z];
    }
  }
  visit(0, 0);
  assert.equal(evaluated, 40320);
  return {score: best, perm: key, evaluated};
}

/** @param {number} seed @returns {() => number} */
function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {Uint8Array} input @param {() => number} next */
function shuffle(input, next) {
  for (let i = input.length - 1; i > 0; i--) {
    const j = next() % (i + 1);
    [input[i], input[j]] = [input[j], input[i]];
  }
}

/**
 * @param {Uint8Array} original
 * @param {number} seed
 * @param {number} draws
 * @param {(input:Uint8Array)=>{score:number}} optimizer
 * @param {number} originalScore
 */
function calibrate(original, seed, draws, optimizer, originalScore) {
  const next = seededRandom(seed);
  const shuffled = original.slice();
  let exceeds = 0;
  let sum = 0;
  const values = [];
  for (let trial = 0; trial < draws; trial++) {
    shuffle(shuffled, next);
    const candidate = optimizer(shuffled).score;
    values.push(candidate);
    exceeds += candidate >= originalScore ? 1 : 0;
    sum += candidate;
  }
  values.sort((a, b) => a - b);
  return {seed, draws, exceeds, upperTail: (exceeds + 1) / (draws + 1),
    mean: sum / draws, median: values[Math.floor(draws / 2)],
    q95: values[Math.floor(draws * 0.95)]};
}

/** @param {number[]} lengths @param {Float64Array} weights */
function heldoutPlants(lengths, weights) {
  const target = lengths.slice().sort((a, b) => a - b);
  let total = 0;
  let exact = 0;
  let stronger = 0;
  let minimumScore = Infinity;
  let maximumScore = -Infinity;
  const originalScore = bestLanguageOrder(categories(lengths), weights).score;
  const byAuthor = {};
  for (const name of ["gibran_prophet_58585.txt",
    "emerson_essays_2944.txt"]) {
    const native = nativeLengths(readControl(name));
    let authorTotal = 0;
    let authorExact = 0;
    for (let start = 0; start + WORDS <= native.length; start += WORDS) {
      const plaintext = categories(rankMatch(
        native.slice(start, start + WORDS), target));
      const planted = new Uint8Array(WORDS);
      for (let r = 0; r < ROWS; r++) {
        for (let j = 0; j < COLUMNS; j++) {
          planted[FIXED_PLANT_KEY[j] * ROWS + r] =
            plaintext[r * COLUMNS + j];
        }
      }
      for (let r = 0; r < ROWS; r++) {
        for (let j = 0; j < COLUMNS; j++) {
          assert.equal(planted[FIXED_PLANT_KEY[j] * ROWS + r],
            plaintext[r * COLUMNS + j]);
        }
      }
      const result = bestLanguageOrder(planted, weights);
      const keyRecovered = result.perm === FIXED_PLANT_KEY.join(",");
      authorExact += keyRecovered ? 1 : 0;
      exact += keyRecovered ? 1 : 0;
      stronger += result.score > originalScore ? 1 : 0;
      minimumScore = Math.min(minimumScore, result.score);
      maximumScore = Math.max(maximumScore, result.score);
      total++;
      authorTotal++;
    }
    byAuthor[name] = {total: authorTotal, recoveredKey: authorExact};
  }
  return {total, recoveredKey: exact, aboveOriginal: stronger,
    minimumScore, maximumScore, byAuthor};
}

function main() {
  const corpus = parseSharedCorpus();
  assert.equal(corpus.runeCount, 12956);
  assert.equal(corpus.words.length, WORDS);
  assert.equal(corpus.crossPageWords, 32);
  const lengths = corpus.words.map(word => word.length);
  const original = categories(lengths);
  assert.ok(Math.abs(stats(lengths).chi - 68.27318638192133) < 1e-9);
  const chi = bestChiOrder(original);
  assert.ok(Math.abs(chi.score - 116.15558931020888) < 1e-8);
  assert.equal(chi.perm, "6,1,7,0,4,3,5,2");
  const chiNull = calibrate(original, CHI_SEED, 100,
    bestChiOrder, chi.score);
  assert.equal(chiNull.exceeds, 56);

  const model = trainWeights(lengths);
  assert.equal(model.windows, 19);
  const language = bestLanguageOrder(original, model.weights);
  assert.ok(Math.abs(language.score - (-8.168226595438814)) < 1e-8);
  assert.equal(language.perm, "1,2,5,4,0,3,7,6");
  const plants = heldoutPlants(lengths, model.weights);
  assert.equal(plants.total, 31);
  assert.equal(plants.recoveredKey, 16);
  assert.equal(plants.aboveOriginal, 31);
  const languageNull = calibrate(original, LANGUAGE_SEED, 500,
    input => bestLanguageOrder(input, model.weights), language.score);
  assert.equal(languageNull.exceeds, 405);

  console.log(JSON.stringify({input: {runes: corpus.runeCount,
    words: WORDS, columns: COLUMNS, rows: ROWS,
    originalChi: stats(lengths).chi}, chi, chiNull,
  trainedModelWindows: model.windows, language, plants, languageNull}, null, 2));
}

if (require.main === module) main();

module.exports = {trainWeights, bestChiOrder, bestLanguageOrder, calibrate};
