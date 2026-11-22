"use strict";

/**
 * Original LP2 long-word key-free GF29 recurrence test.
 *
 * A word cipher C_i = P_i + K_i (mod 29) uses an arbitrary per-word seed
 * and an unknown homogeneous order-3, -4, or -5 linear recurrence for K.
 * At most one K output after the initial seed may be redrawn without
 * changing the underlying recurrence state. All coefficients and seeds
 * are recovered algebraically from each independently supplied plaintext
 * word; neither is searched with a guessed page-wide key.
 *
 * Node.js 22, Windows compatible, read-only single-file test.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus, physicalLP2Page} = require("./lp2_word_pages.cjs");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const dictionary = fs.readFileSync(path.join(root,
  "resources/control/dwyl-english-alpha-gp13-14-only.txt"), "utf8")
  .trim().split(/\r?\n/);
const mod = value => ((value % 29) + 29) % 29;
const inv = Array(29).fill(0);
for (let x = 1; x < 29; x++) {
  for (let y = 1; y < 29; y++) {
    if (x * y % 29 === 1) inv[x] = y;
  }
}
assert(inv.slice(1).every(Boolean));
assert.equal(dictionary.length, 29229);

const byLength = new Map([[13, []], [14, []]]);
for (const word of dictionary) {
  const plain = encodeSourceNativeGP(word);
  assert(byLength.has(plain.length), "word-list GP length");
  byLength.get(plain.length).push({word, plain});
}
assert.deepEqual([byLength.get(13).length, byLength.get(14).length],
  [17772, 11457]);

const runeToIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const originals = parseSharedCorpus().words
  .filter(word => word.length >= 13)
  .map(word => ({
    page: physicalLP2Page(word.startPage),
    cipher: [...word.runes].map(rune => {
      const value = runeToIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  }));
assert.deepEqual(originals.map(word => [word.page, word.cipher.length]), [
  [11, 13], [13, 14], [16, 13], [25, 14], [43, 14],
  [52, 13], [55, 13]
]);

/**
 * Solve K[i] = sum_j a[j]*K[i-j-1] mod29 from all eligible equations.
 * When redraw is non-null, equations affected by the single corrupted
 * observed K[redraw] are omitted before Gaussian elimination.
 *
 * @param {number[]} key
 * @param {number} order
 * @param {number|null} redraw
 * @returns {number[]|null}
 */
function recoverCoefficients(key, order, redraw) {
  /** @type {(number[]|null)[]} */
  const pivots = Array(order).fill(null);
  let rank = 0;
  for (let i = order; i < key.length; i++) {
    if (redraw !== null && i >= redraw && i <= redraw + order) continue;
    const row = [
      ...Array.from({length: order}, (_, j) => key[i - j - 1]),
      key[i]
    ];
    let installedPivot = false;
    for (let column = 0; column < order; column++) {
      if (row[column] === 0) continue;
      const existing = pivots[column];
      if (existing === null) {
        const scale = inv[row[column]];
        for (let j = column; j <= order; j++)
          row[j] = mod(row[j] * scale);
        pivots[column] = row;
        rank++;
        installedPivot = true;
        break;
      }
      const factor = row[column];
      for (let j = column; j <= order; j++)
        row[j] = mod(row[j] - factor * existing[j]);
    }
    if (!installedPivot && row[order] !== 0) return null;
  }
  if (rank !== order) return null;
  const solved = Array(order).fill(0);
  for (let i = order - 1; i >= 0; i--) {
    let value = pivots[i][order];
    for (let j = i + 1; j < order; j++)
      value -= pivots[i][j] * solved[j];
    solved[i] = mod(value);
  }
  return solved;
}

/**
 * @param {number[]} seed
 * @param {number[]} coefficients
 * @param {number} count
 * @returns {number[]}
 */
function generateKey(seed, coefficients, count) {
  const key = seed.slice();
  for (let i = coefficients.length; i < count; i++) {
    const value = coefficients.reduce(
      (sum, coefficient, j) => sum + coefficient * key[i - j - 1], 0);
    key.push(mod(value));
  }
  return key;
}

/**
 * The exact replay check is essential after removing contaminated
 * equations: it rejects algebraic artifacts that have additional errors.
 * @param {number[]} observed
 * @param {number[]} coefficients
 * @param {number|null} redraw
 */
function exactReplay(observed, coefficients, redraw) {
  const predicted = generateKey(
    observed.slice(0, coefficients.length), coefficients, observed.length);
  const mismatches = observed.flatMap(
    (value, i) => value === predicted[i] ? [] : [i]);
  return redraw === null ? mismatches.length === 0
    : mismatches.length === 1 && mismatches[0] === redraw;
}

/** @param {number[]} plain @param {number[]} key */
function encipher(plain, key) {
  return plain.map((value, i) => mod(value + key[i]));
}

/**
 * A planted source-native word must recover the exact full secret
 * coefficients even after an isolated output-only redraw.
 */
for (const [order, coefficients, seed] of [
  [3, [27, 5, 15], [2, 6, 19]],
  [4, [23, 26, 14, 17], [2, 6, 19, 8]],
  [5, [11, 26, 8, 15, 2], [2, 6, 19, 8, 13]]
]) {
  const plain = encodeSourceNativeGP("CIRCUMFERENCES");
  assert.equal(plain.length, 14);
  const originalP57 = corpus.pages.find(page => page.page === 57).indices;
  assert(originalP57.join(",").includes(plain.join(",")));
  const trueKey = generateKey(seed, coefficients, plain.length);
  const planted = encipher(plain, trueKey);
  const observedKey = planted.map((value, i) => mod(value - plain[i]));
  const answer = recoverCoefficients(observedKey, order, null);
  assert.deepEqual(answer, coefficients);
  assert(exactReplay(observedKey, answer, null));
  if (order <= 4) {
    const redrawn = planted.slice();
    redrawn[7] = mod(redrawn[7] + 4);
    const noisyKey = redrawn.map((value, i) => mod(value - plain[i]));
    const noisyAnswer = recoverCoefficients(noisyKey, order, 7);
    assert.deepEqual(noisyAnswer, coefficients);
    assert(exactReplay(noisyKey, noisyAnswer, 7));
  }
}

const output = {};
for (const order of [3, 4, 5]) {
  /** @type {{page:number,word:string,redraw:number|null,coefficients:number[]}[]} */
  const hits = [];
  const counts = [];
  for (const {page, cipher} of originals) {
    let localCount = 0;
    for (const {word, plain} of byLength.get(cipher.length)) {
      const key = cipher.map((value, i) => mod(value - plain[i]));
      const exact = recoverCoefficients(key, order, null);
      if (exact !== null && exactReplay(key, exact, null)) {
        hits.push({page, word, redraw: null, coefficients: exact});
        localCount++;
      }
      // The first order seed symbols are all unknown; this model allows
      // one output-only redraw after the initial seed.
      for (let redraw = order; redraw < key.length; redraw++) {
        const recovered = recoverCoefficients(key, order, redraw);
        if (recovered !== null && exactReplay(key, recovered, redraw)) {
          hits.push({page, word, redraw, coefficients: recovered});
          localCount++;
        }
      }
    }
    counts.push({page, count: localCount});
  }
  const signatures = new Map();
  for (const hit of hits) {
    const signature = hit.coefficients.join(",");
    const group = signatures.get(signature) || [];
    group.push(hit);
    signatures.set(signature, group);
  }
  const crossPageKeys = [...signatures.values()]
    .filter(group => new Set(group.map(hit => hit.page)).size >= 2);
  output[order] = {count: hits.length, counts, crossPageKeys};
  if (order === 4) output[order].candidate = hits;
}
assert.deepEqual([3, 4, 5].map(order => output[order].count), [0, 1, 240]);
assert.deepEqual([3, 4, 5].map(order => output[order].counts.map(x => x.count)), [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0],
  [50, 0, 55, 1, 0, 65, 69]
]);
assert([3, 4, 5].every(order => output[order].crossPageKeys.length === 0));
assert.deepEqual(output[4].candidate, [{
  page: 52, word: "oversensitize", redraw: 7,
  coefficients: [23, 26, 14, 17]
}]);

// Frozen cross-word holdout for the sole four-lag candidate.
// The original word starts at physical p52 local rune offset 78.
// No heldout rune is allowed to change the recovered coefficients or seed.
const page52 = corpus.pages.find(page => page.page === 52).indices;
assert.equal(page52.length, 263);
const word52 = originals.find(word => word.page === 52).cipher;
assert.deepEqual(page52.slice(78, 91), word52);
const guessed = encodeSourceNativeGP("oversensitize");
const observedKey = word52.map((value, i) => mod(value - guessed[i]));
const taps = output[4].candidate[0].coefficients;
const wordKey = generateKey(observedKey.slice(0, 4), taps, 13);
assert.deepEqual(wordKey.filter((value, i) => value !== observedKey[i]), [wordKey[7]]);
const fullKey = Array(page52.length).fill(0);
for (let i = 0; i < wordKey.length; i++) fullKey[78 + i] = wordKey[i];
for (let i = 91; i < fullKey.length; i++)
  fullKey[i] = mod(taps.reduce(
    (sum, tap, j) => sum + tap * fullKey[i - j - 1], 0));
const invLast = inv[taps[3]];
assert.equal(invLast, 12);
for (let i = 77; i >= 0; i--)
  fullKey[i] = mod(invLast *
    (fullKey[i + 4] - taps[0] * fullKey[i + 3]
      - taps[1] * fullKey[i + 2] - taps[2] * fullKey[i + 1]));

const reconstructed = page52.map((value, i) => mod(value - fullKey[i]));
const holdout = reconstructed.filter((_, i) => i < 78 || i >= 91);
/** @param {number[]} symbols */
function ioc(symbols) {
  const freq = Array(29).fill(0);
  for (const value of symbols) freq[value]++;
  return freq.reduce((sum, n) => sum + n * (n - 1), 0) /
    (symbols.length * (symbols.length - 1));
}
const sourceIoC = ioc(page52);
const holdoutIoC = ioc(holdout);
assert.equal(holdout.length, 250);
assert(Math.abs(sourceIoC - 0.033320755812265984) < 1e-12);
assert(Math.abs(holdoutIoC - 0.033542168674698794) < 1e-12);
assert(Math.abs(ioc(reconstructed) - 0.03393028183322207) < 1e-12);

/**
 * Two stronger interpretations of an occasional anti-doublet correction:
 * "skip": the generator consumes one extra key symbol at one word position.
 * "shock": one key symbol changes and becomes part of future recurrence state.
 * Both are exact, source-agnostic and allow arbitrary unknown taps and seeds.
 *
 * @param {number[]} observed
 * @param {number} order
 * @param {number} errorIndex
 * @param {"skip"|"shock"} kind
 * @returns {number[]|null}
 */
function recoverIrregular(observed, order, errorIndex, kind) {
  /** @type {(number[]|null)[]} */
  const pivots = Array(order).fill(null);
  let rank = 0;
  for (let i = order; i < observed.length; i++) {
    const affected = kind === "shock" ? i === errorIndex
      : i >= errorIndex && i < errorIndex + order;
    if (affected) continue;
    const row = [
      ...Array.from({length: order}, (_, j) => observed[i - j - 1]),
      observed[i]
    ];
    let installed = false;
    for (let column = 0; column < order; column++) {
      if (row[column] === 0) continue;
      const pivot = pivots[column];
      if (pivot === null) {
        const scale = inv[row[column]];
        for (let j = column; j <= order; j++)
          row[j] = mod(row[j] * scale);
        pivots[column] = row;
        rank++;
        installed = true;
        break;
      }
      const factor = row[column];
      for (let j = column; j <= order; j++)
        row[j] = mod(row[j] - factor * pivot[j]);
    }
    if (!installed && row[order] !== 0) return null;
  }
  if (rank !== order) return null;
  const solution = Array(order).fill(0);
  for (let i = order - 1; i >= 0; i--) {
    let value = pivots[i][order];
    for (let j = i + 1; j < order; j++)
      value -= pivots[i][j] * solution[j];
    solution[i] = mod(value);
  }
  return solution;
}

/**
 * @param {number[]} observed
 * @param {number[]} taps
 * @param {number} errorIndex
 * @param {"skip"|"shock"} kind
 */
function replayIrregular(observed, taps, errorIndex, kind) {
  const order = taps.length;
  if (kind === "skip") {
    const generated = generateKey(
      observed.slice(0, order), taps, observed.length + 1);
    return generated[errorIndex] !== generated[errorIndex + 1]
      && observed.every((value, i) =>
        value === generated[i + Number(i >= errorIndex)]);
  }
  const mismatches = [];
  for (let i = order; i < observed.length; i++) {
    const expected = mod(taps.reduce(
      (sum, tap, j) => sum + tap * observed[i - j - 1], 0));
    if (expected !== observed[i]) mismatches.push(i);
  }
  return mismatches.length === 1 && mismatches[0] === errorIndex;
}

// Synthetic source-native positives: secret order-3/4 taps and seeds,
// followed by one genuinely consumed-extra key or one state-changing shock.
for (const [order, taps, seed] of [
  [3, [27, 5, 15], [2, 6, 19]],
  [4, [23, 26, 14, 17], [2, 6, 19, 8]]
]) {
  const plain = encodeSourceNativeGP("CIRCUMFERENCES");
  const generated = generateKey(seed, taps, plain.length + 1);
  const index = 7;
  const skipped = plain.map((p, i) =>
    mod(p + generated[i + Number(i >= index)]));
  const skippedObserved = skipped.map((c, i) => mod(c - plain[i]));
  const skipTaps = recoverIrregular(skippedObserved, order, index, "skip");
  assert.deepEqual(skipTaps, taps);
  assert(replayIrregular(skippedObserved, skipTaps, index, "skip"));
  const shockedKey = generated.slice(0, plain.length);
  shockedKey[index] = mod(shockedKey[index] + 4);
  for (let i = index + 1; i < shockedKey.length; i++)
    shockedKey[i] = mod(taps.reduce(
      (sum, tap, j) => sum + tap * shockedKey[i - j - 1], 0));
  const shocked = encipher(plain, shockedKey);
  const shockedObserved = shocked.map((c, i) => mod(c - plain[i]));
  const shockTaps = recoverIrregular(shockedObserved, order, index, "shock");
  assert.deepEqual(shockTaps, taps);
  assert(replayIrregular(shockedObserved, shockTaps, index, "shock"));
}

const irregularResults = {};
for (const kind of ["skip", "shock"]) {
  irregularResults[kind] = {};
  for (const order of [3, 4, 5]) {
    const hits = [];
    const counts = [];
    for (const {page, cipher} of originals) {
      let count = 0;
      for (const {word, plain} of byLength.get(cipher.length)) {
        const key = cipher.map((value, i) => mod(value - plain[i]));
        const lastAllowed = kind === "shock" ? key.length - 1
          : key.length;
        for (let index = order; index < lastAllowed; index++) {
          const taps = recoverIrregular(key, order, index, kind);
          if (taps === null || !replayIrregular(key, taps, index, kind))
            continue;
          hits.push({page, word, index, taps});
          count++;
        }
      }
      counts.push({page, count});
    }
    const byTaps = new Map();
    for (const hit of hits) {
      const signature = hit.taps.join(",");
      const group = byTaps.get(signature) || [];
      group.push(hit);
      byTaps.set(signature, group);
    }
    const shared = [...byTaps.values()].filter(group =>
      new Set(group.map(hit => hit.page)).size >= 2);
    irregularResults[kind][order] = {
      count: hits.length,
      counts, crossPageSharedKeys: shared.length,
      fourTapCandidates: order === 4 ? hits : undefined
    };
  }
}
assert.deepEqual([3, 4, 5].map(m => irregularResults.skip[m].count),
  [0, 0, 4]);
assert.deepEqual([3, 4, 5].map(m => irregularResults.shock[m].count),
  [0, 1, 593]);
assert.deepEqual(irregularResults.shock[4].fourTapCandidates, [{
  page: 52, word: "nonluminously", index: 5,
  taps: [27, 25, 11, 28]
}]);
assert(["skip", "shock"].every(kind =>
  [3, 4, 5].every(m =>
    irregularResults[kind][m].crossPageSharedKeys === 0)));

// The second independent p52 candidate changes the future key register.
// Propagate its original observed word keys directly, with a fixed
// back-step inverse of its last tap, across every untouched page rune.
const shockCandidate = irregularResults.shock[4].fourTapCandidates[0];
const shockPlain = encodeSourceNativeGP(shockCandidate.word);
const shockKey = word52.map((c, i) => mod(c - shockPlain[i]));
const shockTaps = shockCandidate.taps;
assert.equal(inv[shockTaps[3]], 28);
const expanded = Array(page52.length).fill(0);
for (let i = 0; i < shockKey.length; i++) expanded[78 + i] = shockKey[i];
for (let i = 91; i < expanded.length; i++)
  expanded[i] = mod(shockTaps.reduce(
    (sum, a, j) => sum + a * expanded[i - j - 1], 0));
for (let i = 77; i >= 0; i--)
  expanded[i] = mod(inv[shockTaps[3]] *
    (expanded[i + 4] - shockTaps[0] * expanded[i + 3]
      - shockTaps[1] * expanded[i + 2] - shockTaps[2] * expanded[i + 1]));
const shockDecoded = page52.map((c, i) => mod(c - expanded[i]));
const shockHoldout = shockDecoded.filter((_, i) => i < 78 || i >= 91);
assert.equal(shockHoldout.length, 250);
assert(Math.abs(ioc(shockHoldout) - 0.03469879518072289) < 1e-12);
assert(Math.abs(ioc(shockDecoded) - 0.03433663251385946) < 1e-12);

console.log(JSON.stringify({
  source: "all seven original long GP words; 29,229 source-native independent dictionary candidates",
  model: "arbitrary homogeneous GF29 order3/4/5 key and per-word seed; at most one output-only redraw after seed",
  exactP57PositiveWord: "CIRCUMFERENCES",
  positiveCleanRecovers: 3,
  positiveOneRedrawRecovers: 2,
  results: output,
  stateIrregularResults: irregularResults,
  stateShockP52HoldoutIoC: ioc(shockHoldout),
  p52CandidateHoldout: {
    word: "OVERSENSITIZE",
    originalWordStart: 78,
    originalPageRunes: page52.length,
    heldoutRunes: holdout.length,
    originalIoC: sourceIoC,
    decryptedFullPageIoC: ioc(reconstructed),
    decryptedHoldoutIoC: holdoutIoC
  },
  interpretation: "one m4 coincidental word fit fails 250-symbol independent page holdout; no authenticated plaintext or key"
}, null, 2));
console.log("PASS: original long-word GF29 LFSR3-5 exact/one-redraw candidate and holdout gate");
