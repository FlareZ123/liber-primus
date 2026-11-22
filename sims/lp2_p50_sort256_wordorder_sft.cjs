"use strict";

/**
 * Original LP2 word-order test using the rank permutation of the source
 * 256-cell numerical table. Standalone test: node
 * sims/lp2_p50_sort256_wordorder_sft.cjs
 *
 * Every readout is reversible, and no ciphertext rune is edited.
 * The table rank is a proposed operation, not an authenticated author key.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const table = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const originalWords = parseSharedCorpus();
const lengths = originalWords.words.map(word => word.length);

assert.equal(lengths.length, 2896);
assert.equal(originalWords.runeCount, 12956);
assert.equal(originalWords.crossPageWords, 32);
assert.equal(table.bytes.length, 256);
assert.equal(lengths.length % 256, 80);
assert.equal(table.pages[0].bytes.length, 80);

const sourceRank = size => Array.from({length: size}, (_, i) => i)
  .sort((a, b) => table.bytes[a] - table.bytes[b] || a - b);

/**
 * Rank a successive 256-word block by the original numeric cells.
 * @param {number[]} source Source GP word lengths.
 * @param {"rank"|"inverse"} direction Which rank permutation to apply.
 * @param {"keep"|"first80"} tail How to handle the final 80 words.
 * @returns {number[]} Exact reversible word-length permutation.
 */
function permute(source, direction, tail) {
  const result = source.slice();
  for (let start = 0; start < source.length; start += 256) {
    const size = Math.min(256, source.length - start);
    if (size < 256 && tail === "keep") continue;
    const rank = sourceRank(size);
    for (let i = 0; i < size; i++) {
      if (direction === "rank") result[start + i] = source[start + rank[i]];
      else result[start + rank[i]] = source[start + i];
    }
  }
  return result;
}

/** Pearson chi-square for 9×9 adjacent GP-word length classes 1..8, 9+. */
function adjacentChiSquared(wordLengths) {
  const n = wordLengths.length - 1;
  const cells = Array.from({length: 9}, () => new Uint32Array(9));
  const rows = new Uint32Array(9), cols = new Uint32Array(9);
  for (let i = 0; i < n; i++) {
    const a = Math.min(wordLengths[i], 9) - 1;
    const b = Math.min(wordLengths[i + 1], 9) - 1;
    cells[a][b]++; rows[a]++; cols[b]++;
  }
  let score = 0;
  for (let a = 0; a < 9; a++) {
    for (let b = 0; b < 9; b++) {
      const expected = rows[a] * cols[b] / n;
      if (expected > 0) score += (cells[a][b] - expected) ** 2 / expected;
    }
  }
  return score;
}

/** Conventional source-native GP contraction for English control words. */
function gpLength(rawWord) {
  const word = rawWord.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const doubles = ["TH", "NG", "EO", "OE", "AE", "IA", "EA"];
  let count = 0;
  for (let i = 0; i < word.length; ) {
    if (word.startsWith("ING", i)) i += 3;
    else if (doubles.some(part => word.startsWith(part, i))) i += 2;
    else i++;
    count++;
  }
  return count;
}

function main() {
  const directions = ["rank", "inverse"];
  const tailPolicies = ["keep", "first80"];
  const candidates = [];
  const originalScore = adjacentChiSquared(lengths);
  assert(Math.abs(originalScore - 68.27318638192133) < 1e-9);
  for (const direction of directions) {
    for (const tail of tailPolicies) {
      const decoded = permute(lengths, direction, tail);
      const inverse = direction === "rank" ? "inverse" : "rank";
      assert.deepEqual(permute(decoded, inverse, tail), lengths);
      candidates.push({
        direction, tail, chiSquared: adjacentChiSquared(decoded),
        scoreChange: adjacentChiSquared(decoded) - originalScore
      });
    }
  }
  const fixedExpected = [62.02848183128263, 62.12061020238355,
    58.4707174312505, 56.936471785693456];
  for (let i = 0; i < 4; i++) {
    assert(Math.abs(candidates[i].chiSquared - fixedExpected[i]) < 1e-9);
  }

  // Source-native positive: undo every alternative permutation of an
  // independently sampled, normally ordered 2896-word English passage.
  const sourceWords = read("resources/control/shakespeare_first300k.txt")
    .match(/[A-Za-z]+/g).map(gpLength);
  const planted = [];
  for (const start of [1000, 12000, 24000]) {
    const plain = sourceWords.slice(start, start + lengths.length);
    assert.equal(plain.length, lengths.length);
    for (const direction of directions) {
      for (const tail of tailPolicies) {
        const inverse = direction === "rank" ? "inverse" : "rank";
        const syntheticCipher = permute(plain, inverse, tail);
        const recovered = permute(syntheticCipher, direction, tail);
        assert.deepEqual(recovered, plain);
        planted.push({
          start, direction, tail, recoveredWords: recovered.length,
          plainChiSquared: adjacentChiSquared(plain),
          scrambledChiSquared: adjacentChiSquared(syntheticCipher)
        });
      }
    }
  }

  // Every null sample selects its strongest of all four source rankings and
  // the unchanged printed order, so model selection is fairly accounted for.
  let state = 0x33011676;
  function random32() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  }
  const originalBest = Math.max(originalScore, ...candidates.map(x => x.chiSquared));
  let exceedances = 0, nullSum = 0;
  const samples = 1000;
  for (let t = 0; t < samples; t++) {
    const shuffle = lengths.slice();
    for (let i = shuffle.length - 1; i > 0; i--) {
      const j = random32() % (i + 1);
      [shuffle[i], shuffle[j]] = [shuffle[j], shuffle[i]];
    }
    let best = adjacentChiSquared(shuffle);
    for (const direction of directions) {
      for (const tail of tailPolicies) {
        best = Math.max(best,
          adjacentChiSquared(permute(shuffle, direction, tail)));
      }
    }
    nullSum += best;
    if (best >= originalBest) exceedances++;
  }
  assert.equal(exceedances, 739);

  const result = {
    source: "unchanged 256 original printed base60 bytes; stable ascending rank with source-index tie break",
    original: {words: lengths.length, runes: originalWords.runeCount,
      printedAdjacentLengthChiSquared: originalScore},
    candidates, positivePlants: planted,
    modelSelectionNull: {samples, exceedances,
      plusOneUpperTail: (exceedances + 1) / (samples + 1),
      optimizedNullMean: nullSum / samples},
    decision: "Neither source-rank permutation restores English-like printed word ordering. No original plaintext, key, or decoding instruction identified."
  };
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) main();
module.exports = {permute, adjacentChiSquared, gpLength};
