"use strict";

/**
 * LP2 printed-word-order grammar and authentic 2014 seven-slot operation gate.
 * The eight text sections, 2,896 canonical word lengths and original rune
 * positions are fixed. A fixed 2014 Stage5 seven-symbol row permutation is
 * tested without fitting a key, word offset, source order or further variants.
 *
 * Standalone SFT: node sims/lp2_wordlength_order_native_control_sft.cjs
 * Interim structural evidence only; no unknown plaintext/key is recovered.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} filename */
const read = filename => fs.readFileSync(path.join(ROOT, filename), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const RUNE = new Set(corpus.runes);
const originalRaw = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");

/** @typedef {{length:number, section:number, page:number}} Word */
/** @returns {Word[]} */
function manuscriptWords() {
  /** @type {Word[]} */
  const words = [];
  let length = 0;
  let page = 0;
  let section = 0;
  let startPage = 0;
  let startSection = 0;
  function finish() {
    if (length) words.push({length, section: startSection, page: startPage});
    length = 0;
  }
  for (const ch of originalRaw) {
    if (RUNE.has(ch)) {
      if (!length) {
        startPage = page;
        startSection = section;
      }
      length++;
    } else if (ch === "%") {
      page++;
    } else if (ch === "$") {
      finish();
      section++;
    } else if (ch !== "/" && !/\s/u.test(ch)) {
      finish();
    }
  }
  finish();
  assert.equal(words.length, 2896);
  assert.equal(words.reduce((n, word) => n + word.length, 0), 12956);
  assert.equal(section, 8);
  return words;
}
const words = manuscriptWords();
const original = words.map(w => w.length);
const TOKENS = corpus.translit.slice().sort((a, b) => b.length - a.length);

/** @param {string} text @returns {number[]} */
function gpLengths(text) {
  return (text.toUpperCase().match(/[A-Z]+/g) || []).map(raw => {
    const word = raw.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/[KQ]/g, "C").replace(/Z/g, "S")
      .replace(/ING/g, "NG");
    let n = 0;
    for (let i = 0; i < word.length;) {
      const token = TOKENS.find(t => word.startsWith(t, i));
      assert(token, "unmapped GP word " + word);
      i += token.length;
      n++;
    }
    return n;
  });
}
const sources = {
  LP1: gpLengths(read("resources/liber-primus/lp1-plaintext-reference.txt")),
  Shakespeare: gpLengths(read("resources/control/shakespeare_first300k.txt")),
  Gibran: gpLengths(read("resources/control/gibran_prophet_58585.txt")),
  Emerson: gpLengths(read("resources/control/emerson_essays_2944.txt"))
};
assert.deepEqual(Object.fromEntries(Object.entries(sources)
  .map(([name, value]) => [name, value.length])),
{LP1: 904, Shakespeare: 55407, Gibran: 15733, Emerson: 77932});
const CLASSES = 7;
/** @param {number} n */
const category = n => n <= 4 ? n - 1 : n <= 6 ? 4 : n <= 8 ? 5 : 6;

/** @param {number[]} sequence @returns {number[][]} */
function grammarModel(sequence) {
  const pairs = Array.from({length: CLASSES},
    () => Array(CLASSES).fill(1));
  const row = Array(CLASSES).fill(CLASSES);
  const col = Array(CLASSES).fill(CLASSES);
  let total = CLASSES * CLASSES;
  for (let i = 1; i < sequence.length; i++) {
    const x = category(sequence[i - 1]);
    const y = category(sequence[i]);
    pairs[x][y]++;
    row[x]++;
    col[y]++;
    total++;
  }
  return pairs.map((a, x) => a.map((v, y) =>
    Math.log2((v / row[x]) / (col[y] / total))));
}

/** @param {number[]} sequence @param {number[][]} model */
function score(sequence, model) {
  let sum = 0;
  for (let i = 1; i < sequence.length; i++) {
    sum += model[category(sequence[i - 1])][category(sequence[i])];
  }
  return sum / (sequence.length - 1);
}

const models = Object.fromEntries(Object.entries(sources)
  .map(([name, values]) => [name, grammarModel(values)]));
let seed = 0x33012026;
/** @param {number} n */
function randomIndex(n) {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) % n;
}

/**
 * Permutation control conditional on the exact observed word-length multiset.
 * @param {number[]} values
 * @param {number[][]} model
 * @param {number} [trials=600]
 */
function permutationCheck(values, model, trials = 600) {
  const actual = score(values, model);
  const observedNull = [];
  for (let trial = 0; trial < trials; trial++) {
    const shuffled = values.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = randomIndex(i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    observedNull.push(score(shuffled, model));
  }
  const mean = observedNull.reduce((a, b) => a + b, 0) / trials;
  const sd = Math.sqrt(observedNull.reduce(
    (a, b) => a + (b - mean) ** 2, 0) / trials);
  return {scoreBitsPerPair: actual, shuffleMean: mean,
    z: (actual - mean) / sd,
    upperTail: (1 + observedNull.filter(x => x >= actual).length) /
      (trials + 1)};
}

const originalChecks = {};
for (const name of ["Shakespeare", "Gibran", "Emerson", "LP1"]) {
  const check = permutationCheck(original, models[name]);
  assert(Math.abs(check.z) < 2.5,
    "Original word order unexpectedly resembles " + name);
  originalChecks[name] = check;
}
const languageControls = {
  gibranAgainstAuthor: permutationCheck(sources.Gibran, models.LP1),
  emersonAgainstAuthor: permutationCheck(sources.Emerson, models.LP1),
  gibranAgainstShakespeare: permutationCheck(
    sources.Gibran, models.Shakespeare)
};
for (const result of Object.values(languageControls)) {
  assert(result.z > 5, "The source-language calibration failed");
}

/** @param {number[]} sequence @param {number[]} indices @param {number[]} permutation */
function transformGroup(sequence, indices, permutation) {
  for (let base = 0; base + 7 <= indices.length; base += 7) {
    for (let k = 0; k < 7; k++) {
      sequence[indices[base + k]] =
        original[indices[base + permutation[k]]];
    }
  }
}
const HISTORICAL = [0, 6, 2, 5, 1, 4, 3];
const INVERSE = Array(7);
HISTORICAL.forEach((v, k) => { INVERSE[v] = k; });
/** @param {number[]} permutation @param {"global"|"section"|"page"} mode */
function reorder(permutation, mode) {
  const result = original.slice();
  let indices = [];
  function flush() {
    transformGroup(result, indices, permutation);
    indices = [];
  }
  for (let i = 0; i < words.length; i++) {
    if (indices.length && mode !== "global") {
      const last = words[indices[indices.length - 1]];
      const next = words[i];
      const changed = mode === "section" ?
        last.section !== next.section : last.page !== next.page;
      if (changed) flush();
    }
    indices.push(i);
  }
  flush();
  return result;
}
const operations = {};
for (const mode of ["global", "section", "page"]) {
  operations[mode] = {};
  for (const [direction, permutation] of [
    ["historical", HISTORICAL], ["inverse", INVERSE]
  ]) {
    const transformed = reorder(permutation, mode);
    operations[mode][direction] = {
      authorGrammar: score(transformed, models.LP1),
      shakespeareGrammar: score(transformed, models.Shakespeare)
    };
    assert(operations[mode][direction].authorGrammar < -0.04);
    assert(operations[mode][direction].shakespeareGrammar < 0);
  }
}

// A native prose plant is permuted in seven-word rows and recovered exactly.
const sample = sources.Gibran.slice(0, original.length);
const synthetic = [];
for (let base = 0; base < sample.length; base += 7) {
  const block = sample.slice(base, base + 7);
  synthetic.push(...(block.length === 7 ?
    INVERSE.map(k => block[k]) : block));
}
const inverseRecovered = [];
for (let base = 0; base < synthetic.length; base += 7) {
  const block = synthetic.slice(base, base + 7);
  inverseRecovered.push(...(block.length === 7 ?
    HISTORICAL.map(k => block[k]) : block));
}
assert.deepEqual(inverseRecovered, sample);
assert(score(inverseRecovered, models.Shakespeare) >
  score(synthetic, models.Shakespeare));

const sections = [];
for (let i = 0; i < 8; i++) {
  const group = words.filter(w => w.section === i);
  const lengths = group.map(w => w.length);
  const check = permutationCheck(lengths, models.LP1, 300);
  assert(Math.abs(check.z) < 2.5);
  sections.push({id: i, words: group.length,
    firstPage: group[0].page,
    lastPage: group[group.length - 1].page, check});
}
console.log(JSON.stringify({
  original: {words: words.length, runeCount: 12956,
    sections: sections.length, adjacentPairs: 2895},
  originalChecks, languageControls, operations, sections,
  syntheticSevenWordPlant: {recovered: sample.length,
    originalGrammar: score(sample, models.Shakespeare),
    encryptedGrammar: score(synthetic, models.Shakespeare)},
  conclusion: "Original printed word-length order does not show tested " +
    "English GP-native bigram associations. The authentic 2014 Stage5 " +
    "7-item row permutation does not recover that signal in any of " +
    "three original fixed reset modes. This does not decipher LP2."
}, null, 2));
