"use strict";

/**
 * Original LP2 word-length/word-position GP28 all-secret alphabet gate.
 * Run on Windows 11: node sims/lp2_gp28_wordshape_allkey_sft.cjs
 * Read-only CommonJS single-file test; no third-party packages.
 *
 * Every secret permutation indexed by printed (word length, within-word
 * position) preserves equality between symbols in one such group.
 * The test checks that invariant, rather than fitting permutations.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @param {string} file
 * @returns {string}
 */
function read(file) {
  return fs.readFileSync(path.join(__dirname, "..", file), "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = read("resources/liber-primus/lp2-transcription.txt").split("%");
assert.equal(pages.length, 57);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const gp = new Map(corpus.translit.map((r, i) => [r, i]));
assert.equal(runeIndex.size, 29);

/** @type {number[][]} */
const original = pages.slice(0, 55).join("").replace(/[\s/]/g, "")
  .split(/[-.&$§]/g)
  .map((s) => [...s].filter((r) => runeIndex.has(r)).map((r) => runeIndex.get(r)))
  .filter((word) => word.length > 0);
assert.equal(original.length, 2896);
assert.equal(original.flat().length, 12956);
assert.deepEqual(
  original.flat(),
  corpus.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices)
);

/**
 * Solved-Cicada GP29 normalizations on an external, public-language control.
 * ING is represented as I + NG; all 29 source runes are recognized,
 * but for the explicit 28-input architecture we filter words containing EA.
 * @param {string} input
 * @returns {number[][]}
 */
function gpWords(input) {
  const words = [];
  for (const raw of input.match(/[A-Za-z]+/g) || []) {
    const s = raw.toUpperCase().replaceAll("QU", "CW")
      .replaceAll("K", "C").replaceAll("Q", "C")
      .replaceAll("V", "U").replaceAll("Z", "S");
    const units = [];
    let i = 0;
    while (i < s.length) {
      const chunk = s.startsWith("ING", i) ? "ING" :
        (["TH", "NG", "EO", "OE", "AE", "IA", "EA"]
          .find((x) => s.startsWith(x, i)) || s[i]);
      if (chunk === "ING") {
        units.push(gp.get("I"), gp.get("NG"));
      } else {
        const index = gp.get(chunk);
        if (index === undefined) {
          units.length = 0;
          break;
        }
        units.push(index);
      }
      i += chunk.length;
    }
    if (units.length && !units.includes(28)) words.push(units);
  }
  return words;
}

/**
 * Select source words in their source order, matching the original
 * length of each printed word (3 through 9 only), without replacement.
 * Positions of the 55 actual within-word equal ciphertext transitions
 * are masked identically on the reference and original.
 * @param {number[][]} available
 * @returns {number[][]}
 */
function lengthMatched(available) {
  const banks = Array.from({ length: 10 }, () => []);
  for (const word of available) {
    if (word.length >= 3 && word.length <= 9) banks[word.length].push(word);
  }
  const next = Array(10).fill(0);
  return original.map((word) => {
    if (word.length < 3 || word.length > 9) return word;
    const selected = banks[word.length][next[word.length]++];
    assert.ok(selected && selected.length === word.length,
      "The frozen source must supply enough native words of each length");
    return selected;
  });
}

/**
 * Compute secret-permutation-invariant equality counts.
 * A GP28 successor rank is undefined at an equal ciphertext transition.
 * @param {number[][]} words
 * @param {"cyclic"|"sorted"|"plain"} mode
 * @returns {{ numerator:number, denominator:number, ioc:number,
 *           groups:number, positions:number, perGroup:Map<number,number[]> }}
 */
function statistic(words, mode) {
  const groups = new Map();
  let positions = 0;
  for (let i = 0; i < original.length; i++) {
    const observed = original[i];
    const candidate = words[i];
    assert.equal(observed.length, candidate.length);
    if (observed.length < 3 || observed.length > 9) continue;
    for (let j = 1; j < observed.length; j++) {
      const prev = observed[j - 1];
      const cur = observed[j];
      if (cur === prev) continue;
      const value = mode === "plain" ? candidate[j] :
        mode === "cyclic" ? (cur - prev + 28) % 29 :
        cur - (cur > prev ? 1 : 0);
      assert.ok(value >= 0 && value < 28);
      const state = 20 * observed.length + j;
      if (!groups.has(state)) groups.set(state, []);
      groups.get(state).push(value);
      positions++;
    }
  }
  let numerator = 0;
  let denominator = 0;
  for (const values of groups.values()) {
    const count = Array(28).fill(0);
    for (const value of values) count[value]++;
    numerator += count.reduce((s, n) => s + n * (n - 1), 0);
    denominator += values.length * (values.length - 1);
  }
  return {
    numerator, denominator, ioc: numerator / denominator,
    groups: groups.size, positions, perGroup: groups,
  };
}

/**
 * Lower bound on changed group-symbol positions needed to transform
 * source native within-state equalities to the original within-state
 * equality counts. One edit alters at most 2*(group_size-1) ordered pairs.
 * @param {Map<number,number[]>} source
 * @param {Map<number,number[]>} target
 * @returns {number}
 */
function minimumEditsBound(source, target) {
  let count = 0;
  for (const [state, values] of source) {
    const originalValues = target.get(state);
    assert.equal(originalValues.length, values.length);
    const pairCount = (v) => {
      const counts = Array(28).fill(0);
      for (const item of v) counts[item]++;
      return counts.reduce((s, n) => s + n * (n - 1), 0);
    };
    const excess = pairCount(values) - pairCount(originalValues);
    if (excess > 0) count += Math.ceil(excess / (2 * (values.length - 1)));
  }
  return count;
}

const cyclic = statistic(original, "cyclic");
const sorted = statistic(original, "sorted");
assert.deepEqual(
  [cyclic.positions, cyclic.groups, cyclic.numerator, cyclic.denominator],
  [8484, 35, 107316, 3005534]
);
assert.deepEqual(
  [sorted.positions, sorted.groups, sorted.numerator, sorted.denominator],
  [8484, 35, 107174, 3005534]
);
const references = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 377438, 366],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 368666, 395],
  ["Emerson", "resources/control/emerson_essays_2944.txt", 346624, 315],
];
const checks = [];
for (const [name, file, expectedPairs, expectedBound] of references) {
  const words = lengthMatched(gpWords(read(file)));
  const stat = statistic(words, "plain");
  assert.equal(stat.numerator, expectedPairs);
  assert.equal(stat.denominator, cyclic.denominator);
  const bound = minimumEditsBound(stat.perGroup, cyclic.perGroup);
  assert.equal(bound, expectedBound);
  assert.ok(stat.ioc > 0.11);
  checks.push({
    reference: name,
    orderedEqualPairs: stat.numerator,
    withinStateIoC: stat.ioc,
    minimumSymbolChangesLowerBound: bound,
  });
}

// A secret per-(word length, position) invertible affine permutation
// preserves each group's equal-pair count, even though every key differs.
const native = lengthMatched(gpWords(read(references[0][1])));
const multipliers = [1, 3, 5, 9, 11, 13, 15, 17, 19, 23, 25, 27];
let recovered = 0;
let special = 0;
for (let wi = 0; wi < original.length; wi++) {
  const observed = original[wi];
  if (observed.length < 3 || observed.length > 9) continue;
  const plain = native[wi];
  let previous = (wi + observed.length) % 29;
  for (let j = 1; j < plain.length; j++) {
    const isOriginalRepeat = observed[j] === observed[j - 1];
    const message = isOriginalRepeat ? 28 : plain[j];
    const a = multipliers[(observed.length + j) % multipliers.length];
    const b = (7 * observed.length + 11 * j) % 28;
    const forward = message === 28 ? previous :
      (previous + 1 + (a * message + b) % 28) % 29;
    const inverse = message === 28 ? 28 : (() => {
      const rank = (forward - previous + 28) % 29;
      let inv = 1;
      while ((inv * a) % 28 !== 1) inv++;
      return (inv * ((rank - b + 28) % 28)) % 28;
    })();
    assert.equal(inverse, message);
    if (message === 28) special++;
    recovered++;
    previous = forward;
  }
}
assert.equal(recovered, 8539);
assert.equal(special, 55);
console.log(JSON.stringify({
  source: "Original GP29 p0–55, 2,896 printed words, 12,956 runes",
  model: "Unknown independent 28! cyclic/sorted successor-rank permutations per printed word length and within-word position, with 55 exceptional same-rune transitions excluded",
  observed: {
    cyclic: { orderedEqualPairs: cyclic.numerator, denominator: cyclic.denominator, ioc: cyclic.ioc },
    sorted: { orderedEqualPairs: sorted.numerator, denominator: sorted.denominator, ioc: sorted.ioc },
    affectedPositions: cyclic.positions, positionGroups: cyclic.groups,
  },
  sourceNativeComparisons: checks,
  positivePlant: { recovered, special, note: "GP28 source characters plus one EA repeat-bypass marker, all 8,539/8,539 decrypted" },
  recoveredUnknownPlaintext: false,
}, null, 2));
