"use strict";
/**
 * Exact original p55 minimum rune-identity change budgets.
 *
 * A position-only permutation, optionally after a free global GP29 alphabet
 * bijection, can match any target inventory with
 *     N - max_bijection(sum_i min(source[i], target[bijection(i)]))
 * changes. Sorted one-gram histograms solve the unrestricted case.
 * Preserving 16 physical p55 body-word boundaries instead yields a 29x29
 * maximum-weight assignment whose weight is the sum of wordwise intersections.
 *
 * Original ciphertext remains unchanged. This is a finite, necessary-symbol-
 * change test against frozen native GP29 text controls, not a decoder.
 *
 * Run: node sims/p55_fullbody_min_symbol_changes_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { plaintextWords } = require("./authentic_decryption_regression.cjs");

const ROOT = path.resolve(__dirname, "..");
const GP = 29;
const BODY_WORD_LENGTHS = [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8");
}
/** @param {number[]} input @param {number} offset @param {number} size @returns {number[]} */
function histogram(input, offset, size) {
  const counts = Array(GP).fill(0);
  for (let k = 0; k < size; k++) counts[input[offset + k]]++;
  return counts;
}
/**
 * @param {number[]} input @param {number} offset @param {number[]} lengths
 * @returns {number[][]}
 */
function wordHistograms(input, offset, lengths) {
  const result = [];
  let at = offset;
  for (const size of lengths) {
    result.push(histogram(input, at, size));
    at += size;
  }
  return result;
}
/**
 * Exact minimal changes with any position permutation and one free global
 * alphabet bijection; sorted matching minimizes L1 on histograms.
 * @param {number[]} source @param {number[]} target @returns {number}
 */
function wholeChanges(source, target) {
  const a = [...source].sort((x, y) => x - y);
  const b = [...target].sort((x, y) => x - y);
  return a.reduce((sum, x, i) => sum + Math.abs(x - b[i]), 0) / 2;
}
/**
 * @param {number[][]} sourceWords @param {number[][]} targetWords
 * @returns {number[][]}
 */
function matchingWeights(sourceWords, targetWords) {
  const weights = Array.from({ length: GP }, () => Array(GP).fill(0));
  for (let w = 0; w < sourceWords.length; w++) {
    const a = sourceWords[w];
    const b = targetWords[w];
    for (let x = 0; x < GP; x++) {
      if (!a[x]) continue;
      for (let y = 0; y < GP; y++) {
        if (b[y]) weights[x][y] += Math.min(a[x], b[y]);
      }
    }
  }
  return weights;
}
/**
 * Upper bound on any bijective matching weight.
 * Used only for sound pruning; every unpruned candidate gets an exact solve.
 * @param {number[][]} weights @returns {number}
 */
function relaxedUpperBound(weights) {
  let row = 0, column = 0;
  for (let x = 0; x < GP; x++) row += Math.max(...weights[x]);
  for (let y = 0; y < GP; y++) {
    let largest = 0;
    for (let x = 0; x < GP; x++) largest = Math.max(largest, weights[x][y]);
    column += largest;
  }
  return Math.min(row, column);
}
/**
 * Exact O(29^3) maximum-weight perfect assignment (Hungarian potentials).
 * @param {number[][]} weights @returns {number}
 */
function maximumAssignment(weights) {
  const n = weights.length;
  const u = Array(n + 1).fill(0), v = Array(n + 1).fill(0);
  const p = Array(n + 1).fill(0), way = Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minimum = Array(n + 1).fill(Infinity);
    const used = Array(n + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity, j1 = 0;
      for (let j = 1; j <= n; j++) {
        if (used[j]) continue;
        const candidate = -weights[i0 - 1][j - 1] - u[i0] - v[j];
        if (candidate < minimum[j]) {
          minimum[j] = candidate;
          way[j] = j0;
        }
        if (minimum[j] < delta) {
          delta = minimum[j];
          j1 = j;
        }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          minimum[j] -= delta;
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
  let matched = 0;
  for (let j = 1; j <= n; j++) matched += weights[p[j] - 1][j - 1];
  return matched;
}
/**
 * @param {number[]} source @param {number[]} target @param {number[]} lengths
 * @returns {number}
 */
function wordwiseChanges(source, target, lengths) {
  const a = wordHistograms(source, 0, lengths);
  const b = wordHistograms(target, 0, lengths);
  return source.length - maximumAssignment(matchingWeights(a, b));
}
/**
 * Involution that reverses each fixed word, used to build exact plants.
 * @param {number[]} input @param {number[]} lengths @returns {number[]}
 */
function reverseInsideWords(input, lengths) {
  const output = [];
  let at = 0;
  for (const n of lengths) {
    output.push(...input.slice(at, at + n).reverse());
    at += n;
  }
  return output;
}
/**
 * The first source rune is the p54 NG carry. The 75 body runes are 16
 * complete words. Target controls use the same partition positions as an
 * optimistic original-word-shape bound; they need not have English word
 * boundaries in those positions.
 * @returns {object}
 */
function run() {
  const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const p55 = corpus.pages.find(page => page.page === 55).indices;
  assert.equal(p55.length, 76);
  assert.equal(p55[0], 21);
  assert.equal(BODY_WORD_LENGTHS.reduce((x, y) => x + y, 0), 75);
  const cases = [
    { name: "body75", runes: p55.slice(1), words: BODY_WORD_LENGTHS },
    { name: "pageLocal76", runes: p55, words: [1, ...BODY_WORD_LENGTHS] }
  ];
  const sources = [
    { name: "LP1", text: read("resources/liber-primus/lp1-plaintext-reference.txt").replace(/^#.*$/gm, "") },
    { name: "Shakespeare", text: read("resources/control/shakespeare_first300k.txt") },
    { name: "Gibran", text: read("resources/control/gibran_prophet_58585.txt") },
    { name: "Emerson", text: read("resources/control/emerson_essays_2944.txt") }
  ].map(source => ({
    name: source.name, indices: plaintextWords(source.text).flat()
  }));
  const expectedLengths = [3536, 217644, 62696, 323083];
  sources.forEach((source, i) => assert.equal(source.indices.length, expectedLengths[i]));
  const expected = {
    "LP1/body75": [4, 27], "LP1/pageLocal76": [5, 28],
    "Shakespeare/body75": [1, 25], "Shakespeare/pageLocal76": [2, 26],
    "Gibran/body75": [3, 25], "Gibran/pageLocal76": [3, 26],
    "Emerson/body75": [3, 23], "Emerson/pageLocal76": [3, 23]
  };
  const outcomes = [];
  for (const input of cases) {
    const n = input.runes.length;
    const sourceTotals = histogram(input.runes, 0, n);
    const sourceByWord = wordHistograms(input.runes, 0, input.words);
    for (const control of sources) {
      let minWhole = n, minWordwise = n;
      let wholeAt = null, wordwiseAt = null;
      let exactAssigns = 0, pruned = 0;
      const seq = control.indices;
      for (let at = 0; at + n <= seq.length; at++) {
        const total = wholeChanges(sourceTotals, histogram(seq, at, n));
        if (total < minWhole) { minWhole = total; wholeAt = at; }
        const weights = matchingWeights(
          sourceByWord, wordHistograms(seq, at, input.words));
        if (n - relaxedUpperBound(weights) > minWordwise) { pruned++; continue; }
        exactAssigns++;
        const edited = n - maximumAssignment(weights);
        if (edited < minWordwise) { minWordwise = edited; wordwiseAt = at; }
      }
      assert.deepEqual([minWhole, minWordwise], expected[control.name + "/" + input.name]);
      assert.ok(minWordwise >= minWhole);
      assert.equal(exactAssigns + pruned, seq.length - n + 1);
      outcomes.push({
        input: input.name, corpus: control.name, windows: seq.length - n + 1,
        minimumChangesAnyPermutation: minWhole, witnessOffsetAny: wholeAt,
        minimumChangesWordwise: minWordwise, witnessOffsetWordwise: wordwiseAt,
        exactAssignments: exactAssigns, safelyPruned: pruned
      });
    }
  }

  const positivePlants = cases.map(test => {
    const n = test.runes.length;
    const plaintext = sources[0].indices.slice(400, 400 + n);
    const alphabet = Array.from({ length: GP }, (_, i) => (11 * i + 7) % GP);
    const inverse = Array(GP);
    for (let i = 0; i < GP; i++) inverse[alphabet[i]] = i;
    const encoded = reverseInsideWords(plaintext.map(v => inverse[v]), test.words);
    const reconstructed = reverseInsideWords(encoded, test.words).map(v => alphabet[v]);
    assert.deepEqual(reconstructed, plaintext);
    assert.equal(wordwiseChanges(encoded, plaintext, test.words), 0);
    assert.equal(wholeChanges(
      histogram(encoded, 0, n), histogram(plaintext, 0, n)), 0);
    return { input: test.name, sourceNativePlant: true,
      nontrivialGlobalAlphabetAndWordPermutation: true, exactRecoveredRunes: n };
  });
  const body = cases[0].runes;
  const collapsed = Array(75).fill(0);
  const adversarial = {
    sourceLength: body.length, targetUsesOneRune: true,
    anyPermutationMinimum: wholeChanges(
      histogram(body, 0, 75), histogram(collapsed, 0, 75)),
    wordwiseMinimum: wordwiseChanges(body, collapsed, BODY_WORD_LENGTHS)
  };
  assert.equal(adversarial.anyPermutationMinimum, 69);
  assert.equal(adversarial.wordwiseMinimum, 69);
  return {
    classification: "Finite-control exact minimum change budgets; no LP2 plaintext recovered",
    original: { body75: 75, pageLocal76: 76, inheritedP54NG: true,
      printedBodyWordLengths: BODY_WORD_LENGTHS },
    outcomes, positivePlants, adversarial,
    interpretation: "Window positions are optimistic surrogate GP word partitions; matching actual English printed-word grammar can only tighten the bound. An arbitrary source-native GP phrase outside these corpora is not excluded."
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = { run, wholeChanges, wordwiseChanges, maximumAssignment };
