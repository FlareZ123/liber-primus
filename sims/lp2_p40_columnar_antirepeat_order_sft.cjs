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

// Model 2: final anti-repeat layer after columnar. The observed original
// low-lag1 / near-random decoded-lag1 profile has the direction of Model 2.
const finalAvoidance = avoidPredecessor(eight.encode(native), 0);
assert.equal(equalPairs(finalAvoidance, 1), 0);
assert.deepEqual(eight.decode(invertAvoidance(finalAvoidance, 0)), native);

console.log(JSON.stringify({
  source: "original 3000 runes, physical LP2 pp40–53 after red heading",
  original: {lag1: 18, lag7: 99, lag8: 88},
  eightColumnInverse: {order: eight.order, lag1: 101, lag8: 18},
  sevenColumnInverse: {order: seven.order, lag1: 109, lag7: 18},
  nativeGP28Positive: {
    beforeFinalColumnar: {lag1: equalPairs(finalColumnar, 1), lag8: equalPairs(finalColumnar, 8)},
    afterFinalAntiRepeat: {lag1: equalPairs(finalAvoidance, 1), lag8: equalPairs(finalAvoidance, 8)},
    sourceDigitsRecovered: native.length
  },
  decision: "anti-repeat last is structurally consistent; last-columnar does not preserve original suppression"
}, null, 2));
