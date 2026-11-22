"use strict";

/**
 * Source-original differential homophonic necessary-condition test.
 *
 * Hypothesis: within each printed word, the cipher encodes the GP29
 * plaintext suffix by a deterministic map of adjacent ciphertext differences.
 * The secret map may be arbitrary, noninjective, and separately chosen for
 * every position modulo a fixed word-local period.
 *
 * Data-processing inequality:
 *   I(f_j(D_j);f_(j+1)(D_(j+1)) | j mod m)
 *     <= I(D_j;D_(j+1) | j mod m).
 * This inequality holds exactly on the observed empirical pair table.
 *
 * Positive control: a genuinely source-native, word-length-matched planted
 * chain cipher with an independently secret GP29 permutation.
 *
 * Windows 11 / Node.js 22:
 *   node sims/lp2_diff_wordphase_homophonic_information_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} relativePath @returns {string} */
const load = (relativePath) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const corpus = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const transcription = load("resources/liber-primus/lp2-transcription.txt");
const shakespeare = load("resources/control/shakespeare_first300k.txt");
const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const WORD_PHASE_PERIODS = [1, 2, 3, 4, 5, 8, 13];
const TRIALS = 1000;
const INITIAL_SEED = 0x3301a3b6;

const original = transcription.split("%").slice(0, 55).join("%")
  .split(/[-.&$§]/u)
  .map((part) => [...part]
    .filter((rune) => runeToIndex.has(rune))
    .map((rune) => runeToIndex.get(rune)))
  .filter((word) => word.length > 0);
assert.equal(original.length, 2896);
assert.equal(original.reduce((sum, word) => sum + word.length, 0), 12956);
assert.equal(corpus.runes.length, 29);

const nativeTokens = corpus.translit.map((text, index) => ({text, index}))
  .sort((a, b) => b.text.length - a.text.length);

/**
 * The canonical historical GP normalization already used by the repository:
 * V=>U, K/Q=>C, Z=>S, and the ING/IO ligatures are one rune each.
 * @param {string} word
 * @returns {number[]}
 */
function nativeGP(word) {
  const source = word.toUpperCase()
    .replaceAll("QU", "CW")
    .replaceAll("V", "U")
    .replaceAll("K", "C")
    .replaceAll("Q", "C")
    .replaceAll("Z", "S");
  const result = [];
  for (let i = 0; i < source.length;) {
    if (source.startsWith("ING", i)) {
      result.push(21);
      i += 3;
    } else if (source.startsWith("IO", i)) {
      result.push(27);
      i += 2;
    } else {
      const token = nativeTokens.find(({text}) => source.startsWith(text, i));
      assert.ok(token, "Unsupported Shakespeare GP token " + source.slice(i));
      result.push(token.index);
      i += token.text.length;
    }
  }
  return result;
}

const buckets = Array.from({length: 16}, () => []);
for (const item of shakespeare.match(/[A-Za-z]+/g) || []) {
  const word = nativeGP(item);
  if (word.length < buckets.length) buckets[word.length].push(word);
}
for (const word of original) {
  assert.ok(buckets[word.length].length > 0,
    "No native-GP source word of length " + word.length);
}

/**
 * A deterministic 32-bit xorshift stream, used only for controls.
 * @param {number} seed
 * @returns {() => number}
 */
function prng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {number[][]} words @returns {number[][]} */
function differences(words) {
  return words.map((word) => word.slice(1)
    .map((value, i) => (value - word[i] + 29) % 29));
}

/**
 * Conditional adjacent MI of word suffixes or difference words.
 * Each pair is assigned the previous symbol's word-local phase.
 * No pair is allowed to cross a printed word boundary.
 *
 * @param {number[][]} words
 * @param {number} period
 * @returns {{pairs:number,bits:number}}
 */
function conditionalMI(words, period) {
  const cells = Array.from({length: period}, () => ({
    joint: new Uint32Array(29 * 29),
    left: new Uint32Array(29),
    right: new Uint32Array(29),
    n: 0
  }));
  let pairs = 0;
  for (const word of words) {
    for (let i = 1; i < word.length; i++) {
      const a = word[i - 1];
      const b = word[i];
      const cell = cells[(i - 1) % period];
      cell.joint[a * 29 + b]++;
      cell.left[a]++;
      cell.right[b]++;
      cell.n++;
      pairs++;
    }
  }
  assert.ok(pairs > 0);
  let bits = 0;
  for (const cell of cells) {
    if (!cell.n) continue;
    for (let a = 0; a < 29; a++) {
      for (let b = 0; b < 29; b++) {
        const n = cell.joint[a * 29 + b];
        if (!n) continue;
        const ratio = (n * cell.n) / (cell.left[a] * cell.right[b]);
        bits += (n / pairs) * Math.log2(ratio);
      }
    }
  }
  return {pairs, bits};
}

/**
 * Resample entire source-native words with exactly the observed word lengths.
 * @param {() => number} next
 * @returns {number[][]}
 */
function matchedSource(next) {
  return original.map((word) => {
    const source = buckets[word.length];
    return source[next() % source.length];
  });
}

const actualDiffs = differences(original);
const observed = WORD_PHASE_PERIODS.map((period) => ({
  period,
  ...conditionalMI(actualDiffs, period),
  minControl: Infinity,
  maxControl: -Infinity,
  controlValues: [],
  countNotLarger: 0
}));

assert.equal(actualDiffs.reduce((sum, word) => sum + word.length, 0), 10060);
for (const item of observed) assert.equal(item.pairs, 7247);
assert.ok(Math.abs(observed[0].bits - 0.07951847226397325) < 1e-10);

const next = prng(INITIAL_SEED);

/**
 * A source-native known-key plant: first rune of every word may have an
 * independently chosen initial ciphertext symbol, while every other rune
 * is encoded reversibly as a first-difference under one secret permutation.
 * This demonstrates that the test accepts its modeled cipher if the input
 * really contains GP-like English.
 */
const key = Array.from({length: 29}, (_, i) => i);
for (let i = 28; i > 0; i--) {
  const j = next() % (i + 1);
  [key[i], key[j]] = [key[j], key[i]];
}
const inverse = new Array(29);
for (let i = 0; i < 29; i++) inverse[key[i]] = i;
const plantPlain = matchedSource(next);
const plantCipher = plantPlain.map((plain) => {
  let state = next() % 29;
  const output = [state];
  for (let i = 1; i < plain.length; i++) {
    state = (state + key[plain[i]]) % 29;
    output.push(state);
  }
  return output;
});
const plantDiff = differences(plantCipher);
assert.deepEqual(plantDiff.map((word) => word.map((delta) => inverse[delta])),
  plantPlain.map((word) => word.slice(1)));
for (const period of WORD_PHASE_PERIODS) {
  const a = conditionalMI(plantDiff, period);
  const b = conditionalMI(plantPlain.map((word) => word.slice(1)), period);
  assert.ok(Math.abs(a.bits - b.bits) < 1e-10);
}

/** @type {Array<{period:number,pairs:number,bits:number,minControl:number,maxControl:number,controlValues:number[],countNotLarger:number}>} */
for (let trial = 0; trial < TRIALS; trial++) {
  const sample = matchedSource(next).map((word) => word.slice(1));
  for (const cell of observed) {
    const control = conditionalMI(sample, cell.period);
    assert.equal(control.pairs, 7247);
    cell.minControl = Math.min(cell.minControl, control.bits);
    cell.maxControl = Math.max(cell.maxControl, control.bits);
    cell.controlValues.push(control.bits);
    cell.countNotLarger += Number(control.bits <= cell.bits);
  }
}


/**
 * Entirely independent codebooks may also be keyed by the *length* of a
 * printed word. The 720 actual three-rune words supply 720 paired suffix
 * differences, with two arbitrary independent codebooks for positions 1,2.
 * The fixed length=3 class must satisfy its own data-processing inequality.
 * This isolates an otherwise underpowered pooled (length,phase) MI bound.
 * @param {number[][]} twoSymbolPairs
 * @returns {number}
 */
function pairedMI(twoSymbolPairs) {
  const joint = new Uint16Array(841);
  const left = new Uint16Array(29);
  const right = new Uint16Array(29);
  const count = twoSymbolPairs.length;
  assert.ok(count > 0);
  for (const pair of twoSymbolPairs) {
    assert.equal(pair.length, 2);
    const [a, b] = pair;
    joint[29 * a + b]++;
    left[a]++;
    right[b]++;
  }
  let bits = 0;
  for (let a = 0; a < 29; a++) {
    for (let b = 0; b < 29; b++) {
      const n = joint[29 * a + b];
      if (n) bits += n / count * Math.log2(n * count / (left[a] * right[b]));
    }
  }
  return bits;
}
const threeRuneDiffs = actualDiffs.filter((word) => word.length === 2);
assert.equal(threeRuneDiffs.length, 720);
const threeRuneOriginalBits = pairedMI(threeRuneDiffs);
assert.ok(Math.abs(threeRuneOriginalBits - 0.8960592839082184) < 1e-10);
const threeRunePlantPlain = plantPlain.filter((word) => word.length === 3)
  .map((word) => word.slice(1));
const threeRunePlantDiff = plantDiff.filter((word) => word.length === 2);
assert.ok(Math.abs(pairedMI(threeRunePlantPlain) -
  pairedMI(threeRunePlantDiff)) < 1e-10);
let threeRuneMinControl = Infinity;
let threeRuneMaxControl = -Infinity;
const threeRuneControlValues = [];
for (let trial = 0; trial < TRIALS; trial++) {
  const sample = Array.from({length: 720},
    () => buckets[3][next() % buckets[3].length].slice(1));
  const bits = pairedMI(sample);
  threeRuneMinControl = Math.min(threeRuneMinControl, bits);
  threeRuneMaxControl = Math.max(threeRuneMaxControl, bits);
  threeRuneControlValues.push(bits);
}
assert.ok(threeRuneMinControl > threeRuneOriginalBits);
threeRuneControlValues.sort((a, b) => a - b);
const threeRuneLengthPhase = {
  originalWords: 720,
  secretCodebooksAllowed: "independent arbitrary maps for length3 positions1 and2",
  observedUpperBoundBits: +threeRuneOriginalBits.toFixed(9),
  sourceControlMinBits: +threeRuneMinControl.toFixed(9),
  sourceControlMedianBits: +threeRuneControlValues[Math.floor(TRIALS / 2)].toFixed(9),
  sourceControlMaxBits: +threeRuneMaxControl.toFixed(9),
  controlsAtOrBelowOriginal: 0
};

const summary = observed.map((item) => {
  const sorted = item.controlValues.sort((a, b) => a - b);
  const result = {
    period: item.period,
    observedBits: +item.bits.toFixed(9),
    eligiblePairs: item.pairs,
    controlMinBits: +item.minControl.toFixed(9),
    controlMedianBits: +sorted[Math.floor(TRIALS / 2)].toFixed(9),
    controlMaxBits: +item.maxControl.toFixed(9),
    controlAtOrBelowObserved: item.countNotLarger
  };
  assert.equal(item.countNotLarger, 0);
  assert.ok(item.minControl > item.bits,
    "A length-matched native-source control falls below ciphertext bound");
  return result;
});

console.log(JSON.stringify({
  model: "deterministic fixed or word-phase-dependent decoder of GP29 first differences",
  source: {
    originalWords: original.length,
    originalRunes: 12956,
    differentialRunes: 10060,
    eligibleWithinWordAdjacentPairs: 7247,
    sourceNativeWords: buckets.reduce((n, b) => n + b.length, 0),
    trials: TRIALS,
    seed: INITIAL_SEED
  },
  summary,
  threeRuneLengthPhase,
  plantedKnownKeyRecovery: "PASS for all 10060 suffix runes",
  decision: "Fixed, word-local phase, and word-length-dependent phase codebooks fail source-like GP English under the specified original-input necessary conditions. Stateful or external-key decoders remain open."
}, null, 2));
console.log("PASS: source-original differential necessary-condition test");
