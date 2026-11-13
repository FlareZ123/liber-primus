"use strict";
/**
 * Original LP2 p40–53 adjacency gate for source-keyed 8/7-column layers.
 *
 * The original printed ciphertext almost avoids adjacent equal GP runes.
 * Classical column inverses break that suppression and move it to lag8/7.
 * This checks cipher-layer order, not an authenticated decoder.
 *
 * Run: node sims/lp2_p40_columnar_antirepeat_order_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} rel */
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const chapter = corpus.pages.filter(p => p.page >= 40 && p.page <= 53)
  .flatMap(p => p.indices);
assert.equal(chapter.length, 3008);
const heading = chapter.slice(0, 8);
assert.deepEqual(heading, [0, 9, 19, 26, 6, 23, 25, 8]);
const body = chapter.slice(8);
assert.equal(body.length, 3000);

/** @param {number[]} key */
function makeColumnar(key) {
  const width = key.length;
  assert.equal(new Set(key).size, width);
  const order = key.map((_, i) => i).sort((a, b) => key[a] - key[b]);
  /** @template T @param {T[]} plain @returns {T[]} */
  function encode(plain) {
    const cols = Array.from({length: width}, () => []);
    plain.forEach((x, i) => cols[i % width].push(x));
    return order.flatMap(c => cols[c]);
  }
  /** @template T @param {T[]} cipher @returns {T[]} */
  function decode(cipher) {
    const n = cipher.length;
    const sizes = Array.from({length: width}, (_, i) =>
      Math.floor(n / width) + (i < n % width ? 1 : 0));
    let at = 0;
    const cols = Array(width);
    for (const c of order) {
      cols[c] = cipher.slice(at, at + sizes[c]);
      at += sizes[c];
    }
    assert.equal(at, n);
    const result = [];
    for (let row = 0; row < Math.ceil(n / width); row++)
      for (let c = 0; c < width; c++)
        if (row < cols[c].length) result.push(cols[c][row]);
    return result;
  }
  return {width, key, order, encode, decode};
}

/** @param {number[]} a @param {number} lag */
function equalPairs(a, lag) {
  let n = 0;
  for (let i = lag; i < a.length; i++) n += Number(a[i] === a[i-lag]);
  return n;
}

/**
 * Map each GP28 digit into one of the 28 GP29 runes other than the
 * immediately preceding rune. This 28-to-29 operation is exactly invertible.
 * @param {number[]} digits @param {number} initial
 */
function avoidPredecessor(digits, initial) {
  let prev = initial;
  return digits.map(digit => {
    assert(digit >= 0 && digit < 28);
    const rune = digit >= prev ? digit + 1 : digit;
    assert(rune !== prev && rune < 29);
    prev = rune;
    return rune;
  });
}
/** @param {number[]} runes @param {number} initial */
function invertAvoidance(runes, initial) {
  let prev = initial;
  return runes.map(rune => {
    assert(rune !== prev);
    const digit = rune > prev ? rune - 1 : rune;
    assert(digit >= 0 && digit < 28);
    prev = rune;
    return digit;
  });
}

const eight = makeColumnar(heading);
const seven = makeColumnar(heading.slice(1));
assert.deepEqual(eight.order, [0, 4, 7, 1, 2, 5, 6, 3]);
assert.deepEqual(seven.order, [3, 6, 0, 1, 4, 5, 2]);
const invert8 = eight.decode(body);
const invert7 = seven.decode(body);
assert.deepEqual(eight.encode(invert8), body);
assert.deepEqual(seven.encode(invert7), body);
assert.equal(equalPairs(body, 1), 18);
assert.equal(equalPairs(body, 7), 99);
assert.equal(equalPairs(body, 8), 88);
assert.equal(equalPairs(invert8, 1), 101);
assert.equal(equalPairs(invert8, 8), 18);
assert.equal(equalPairs(invert7, 1), 109);
assert.equal(equalPairs(invert7, 7), 18);


// Exhaustive null for the claimed red8-restored equality count. The
// visible key fixes column identities; these 8! hypothetical readout orders
// compare the same original 375-symbol column blocks without changing bytes.
function columnOrderRepeatNull() {
  const width = 8, rows = 375;
  /** @type {number[][]} */
  const columns = Array.from({length: width}, (_, c) =>
    Array.from({length: rows}, (_, r) => invert8[width * r + c]));
  /** @type {number[][]} */
  const within = Array.from({length: width}, (_, a) =>
    Array.from({length: width}, (_, b) => {
      let matches = 0;
      for (let r = 0; r < rows; r++)
        matches += Number(columns[a][r] === columns[b][r]);
      return matches;
    }));
  /** @type {number[][]} */
  const across = Array.from({length: width}, (_, a) =>
    Array.from({length: width}, (_, b) => {
      let matches = 0;
      for (let r = 0; r + 1 < rows; r++)
        matches += Number(columns[a][r] === columns[b][r + 1]);
      return matches;
    }));
  /** @param {number[]} p */
  const count = p => p.slice(0, -1)
    .reduce((s, col, i) => s + within[col][p[i + 1]], 0)
    + across[p[width - 1]][p[0]];
  const observed = count([0, 1, 2, 3, 4, 5, 6, 7]);
  assert.equal(observed, equalPairs(invert8, 1));
  /** @type {number[]} */
  const all = [];
  /** @param {number[]} partial @param {number[]} remaining */
  function enumerate(partial, remaining) {
    if (!remaining.length) {
      all.push(count(partial));
      return;
    }
    for (let k = 0; k < remaining.length; k++)
      enumerate([...partial, remaining[k]],
        remaining.filter((_, j) => j !== k));
  }
  enumerate([], [0, 1, 2, 3, 4, 5, 6, 7]);
  all.sort((a, b) => a - b);
  const mean = all.reduce((a, b) => a + b, 0) / all.length;
  const variance = all.reduce((a, b) => a + (b - mean) ** 2, 0) / all.length;
  const result = {
    columnOrders: all.length, sourceRed8Restored: observed,
    minimum: all[0], median: all[Math.floor(all.length / 2)],
    fifthPercentile: all[Math.floor(all.length * 0.05)],
    ninetyFifthPercentile: all[Math.floor(all.length * 0.95)],
    maximum: all[all.length - 1],
    mean, standardDeviation: Math.sqrt(variance),
    numberAtMostObserved: all.filter(n => n <= observed).length,
    numberAtLeastObserved: all.filter(n => n >= observed).length,
    exactTies: all.filter(n => n === observed).length
  };
  assert.equal(result.columnOrders, 40320);
  assert.equal(result.numberAtMostObserved, 11424);
  assert.equal(result.numberAtLeastObserved, 30194);
  assert.equal(result.minimum, 71);
  assert.equal(result.maximum, 145);
  return result;
}
const exhaustiveColumnOrderNull = columnOrderRepeatNull();

// Genuine Gibran source: original content, GP transliteration and a declared
// reduction to the 28-way successor register, with no original-data fitting.
const source = read("resources/control/gibran_prophet_58585.txt").toUpperCase();
const tokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
const native = [];
for (const text of source.match(/[A-Z]+/g) || []) {
  const word = text.replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S")
    .replace(/ING/g, "NG");
  for (let i = 0; i < word.length;) {
    const match = tokens.find(x => word.startsWith(x.s, i));
    assert(match, "unknown GP transliteration token");
    native.push(match.i % 28);
    i += match.s.length;
  }
  if (native.length >= body.length) break;
}
native.length = body.length;
assert.equal(native.length, 3000);
const sourceAvoided = avoidPredecessor(native, 0);
assert.deepEqual(invertAvoidance(sourceAvoided, 0), native);
assert.equal(equalPairs(sourceAvoided, 1), 0);

// Model 1: final columnar layer after anti-repeat, the natural inference if
// transposition is taken as the last ciphertext operation.
const finalColumnar = eight.encode(sourceAvoided);
assert.deepEqual(eight.decode(finalColumnar), sourceAvoided);
assert.equal(equalPairs(finalColumnar, 1), 160);
assert.equal(equalPairs(finalColumnar, 8), 157);

// Model 1b: first split into eight *independently* predecessor-constrained
// columns, with the source red key symbols as each column's fixed IV.
// Reading whole columns afterward does retain lag-1 suppression. This
// counterexample prevents the observed statistics from determining whether
// predecessor exclusion was before or after columnar transposition.
const columnDigits = Array.from({length: eight.width}, () => []);
native.forEach((digit, i) => columnDigits[i % eight.width].push(digit));
const localConstrainedColumns = columnDigits.map((digits, i) =>
  avoidPredecessor(digits, heading[i]));
const locallyConstrainedThenColumnar =
  eight.order.flatMap(c => localConstrainedColumns[c]);
assert.equal(locallyConstrainedThenColumnar.length, native.length);
const originalColumnBoundaries = Array.from({length: 7}, (_, i) => (i + 1) * 375);
assert.equal(originalColumnBoundaries.filter(
  i => body[i] === body[i - 1]).length, 0);
assert.equal(equalPairs(locallyConstrainedThenColumnar, 1), 0);
const recoveredColumns = eight.decode(locallyConstrainedThenColumnar);
const recoveredNative = recoveredColumns.map((rune, i) => rune);
const recoveredColumnDigits = Array.from({length: eight.width}, () => []);
recoveredNative.forEach((rune, i) =>
  recoveredColumnDigits[i % eight.width].push(rune));
const decodedDigits = recoveredColumnDigits.map((runes, i) =>
  invertAvoidance(runes, heading[i]));
const rejoinedDigits = Array.from({length: native.length}, (_, i) =>
  decodedDigits[i % eight.width][Math.floor(i / eight.width)]);
assert.deepEqual(rejoinedDigits, native);

// Model 2: final anti-repeat layer after columnar. The observed original
// low-lag1 / near-random decoded-lag1 profile has the direction of Model 2.
const finalAvoidance = avoidPredecessor(eight.encode(native), 0);
assert.equal(equalPairs(finalAvoidance, 1), 0);
assert.deepEqual(eight.decode(invertAvoidance(finalAvoidance, 0)), native);

console.log(JSON.stringify({
  source: "original 3000 runes, physical LP2 pp40–53 after red heading",
  original: {lag1: 18, lag7: 99, lag8: 88},
  eightColumnInverse: {order: eight.order, lag1: 101, lag8: 18},
  exhaustiveColumnOrderNull,
  sevenColumnInverse: {order: seven.order, lag1: 109, lag7: 18},
  nativeGP28Positive: {
    beforeFinalColumnar: {lag1: equalPairs(finalColumnar, 1), lag8: equalPairs(finalColumnar, 8)},
    perColumnPreConstraint: {
      lag1: equalPairs(locallyConstrainedThenColumnar, 1),
      originalColumnBoundaries: originalColumnBoundaries.length,
      recovered: rejoinedDigits.length
    },
    afterFinalAntiRepeat: {lag1: equalPairs(finalAvoidance, 1), lag8: equalPairs(finalAvoidance, 8)},
    sourceDigitsRecovered: native.length
  },
  decision: "layer order remains ambiguous: either final anti-repeat or source-column-local anti-repeat before final columnar is consistent"
}, null, 2));
