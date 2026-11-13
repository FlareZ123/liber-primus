"use strict";

/**
 * Original-source eight-column whole-word transpose gate.
 * Windows Node.js 22 / CommonJS; no packages or network required.
 *
 * Reproduce: node sims/lp2_8column_wholeword_transpose_sft.cjs
 *
 * Complete original GP29 words are the transport units. The two natural
 * 362x8 row-major/column-major readings are exact inverse permutations.
 * Rune identities and word lengths remain unchanged, so this tests word
 * ordering even with an unknown letterwise encryption inside each word.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {nativeLengths, rankMatch, stats} =
  require("./lp2_wordlength_order_grammar_sft.cjs");

const ROOT = path.join(__dirname, "..");
const N = 2896;
const COLUMNS = 8;
const ROWS = N / COLUMNS;
const SHUFFLE_SEED = 0x33014308;
const DRAWS = 5000;

/** @param {string} name @returns {string} */
function readControl(name) {
  return fs.readFileSync(path.join(ROOT, "resources", "control", name), "utf8");
}

/** @param {number[]} input @returns {number[]} */
function readColumns(input) {
  assert.equal(input.length, N);
  const output = new Array(N);
  let index = 0;
  for (let col = 0; col < COLUMNS; col++) {
    for (let row = 0; row < ROWS; row++) {
      output[index++] = input[row * COLUMNS + col];
    }
  }
  return output;
}

/** @param {number[]} input @returns {number[]} */
function readRows(input) {
  assert.equal(input.length, N);
  const output = new Array(N);
  let index = 0;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      output[index++] = input[col * ROWS + row];
    }
  }
  return output;
}

/** @param {number[]} input @returns {number} */
function lengthChi(input) {
  return stats(input).chi;
}

/** @returns {()=>number} */
function seededRandom() {
  let state = SHUFFLE_SEED >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {number[]} values @param {()=>number} next @returns {void} */
function shuffle(values, next) {
  for (let j = values.length - 1; j > 0; j--) {
    const i = next() % (j + 1);
    [values[i], values[j]] = [values[j], values[i]];
  }
}

function main() {
  const source = parseSharedCorpus();
  assert.equal(source.runeCount, 12956);
  assert.equal(source.words.length, N);
  assert.equal(source.crossPageWords, 32);
  const original = source.words.map(word => word.length);
  const raw = lengthChi(original);
  const rowToColumn = lengthChi(readColumns(original));
  const columnToRow = lengthChi(readRows(original));
  assert.ok(Math.abs(raw - 68.27318638192133) < 1e-9);
  assert.ok(Math.abs(rowToColumn - 71.7270328710425) < 1e-9);
  assert.ok(Math.abs(columnToRow - 70.1398601887302) < 1e-9);
  assert.deepEqual(readColumns(readRows(original)), original);
  assert.deepEqual(readRows(readColumns(original)), original);

  const target = original.slice().sort((a, b) => a - b);
  const nativeSamples = [
    ["Shakespeare", nativeLengths(readControl("shakespeare_first300k.txt"))],
    ["Gibran", nativeLengths(readControl("gibran_prophet_58585.txt"))],
    ["Emerson", nativeLengths(readControl("emerson_essays_2944.txt"))],
    ["Latin Vulgate", readControl("latin-vulgate-gp-wholewords.txt")
      .split(/\r?\n/u).filter(line => /^[0-9A-S]+$/u.test(line))
      .map(line => line.length)]
  ];
  let plantRoundTrips = 0;
  let comparedWindows = 0;
  let minimumNative = Infinity;
  const controls = [];
  const originalBest = Math.max(rowToColumn, columnToRow);
  for (const [name, input] of nativeSamples) {
    let count = 0;
    let minChi = Infinity;
    let maxScrambledChi = -Infinity;
    for (let offset = 0; offset + N <= input.length; offset += N) {
      const native = rankMatch(input.slice(offset, offset + N), target);
      const nativeChi = lengthChi(native);
      const rowScramble = readRows(native);
      const colScramble = readColumns(native);
      assert.deepEqual(readColumns(rowScramble), native);
      assert.deepEqual(readRows(colScramble), native);
      const rowChi = lengthChi(rowScramble);
      const colChi = lengthChi(colScramble);
      assert.ok(nativeChi > rowChi);
      assert.ok(nativeChi > colChi);
      assert.ok(nativeChi > originalBest);
      minChi = Math.min(minChi, nativeChi);
      maxScrambledChi = Math.max(maxScrambledChi, rowChi, colChi);
      plantRoundTrips += 2;
      count++;
    }
    controls.push({name, count, minimumMatchedChi: minChi,
      maximumPlantedScrambleChi: maxScrambledChi});
    comparedWindows += count;
    minimumNative = Math.min(minimumNative, minChi);
  }
  assert.deepEqual(controls.map(x => x.count), [19, 5, 26, 13]);
  assert.equal(comparedWindows, 63);
  assert.equal(plantRoundTrips, 126);
  assert.ok(Math.abs(minimumNative - 95.38561910562353) < 1e-8);

  // Familywise null: both predeclared read directions are tested together.
  // Each draw preserves every original rune-word length and its multiplicity.
  const next = seededRandom();
  const randomized = original.slice();
  let exceeds = 0;
  let sumMax = 0;
  for (let trial = 0; trial < DRAWS; trial++) {
    shuffle(randomized, next);
    const best = Math.max(lengthChi(readColumns(randomized)),
      lengthChi(readRows(randomized)));
    sumMax += best;
    if (best >= originalBest) exceeds++;
  }
  const nullResult = {seed: SHUFFLE_SEED, draws: DRAWS, exceeds,
    meanMaximum: sumMax / DRAWS, upperTail: (exceeds + 1) / (DRAWS + 1)};
  assert.equal(exceeds, 2032);
  assert.ok(Math.abs(nullResult.meanMaximum - 70.10230403778273) < 1e-8);
  assert.ok(Math.abs(nullResult.upperTail - 0.4065186962607478) < 1e-12);
  console.log(JSON.stringify({input: {words: N, runes: source.runeCount,
    crossPageWords: source.crossPageWords, columns: COLUMNS, rows: ROWS},
  original: {raw, rowToColumn, columnToRow},
  controls, comparedWindows, minimumNative, plantRoundTrips,
  exactHistogramNull: nullResult}, null, 2));
}

if (require.main === module) main();
module.exports = {readColumns, readRows, lengthChi};
