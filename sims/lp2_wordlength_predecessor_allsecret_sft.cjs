"use strict";

/**
 * SFT: all-secret GP29 ciphertext-predecessor substitution keyed by the
 * original complete printed word length. This is a bounded original-cipher
 * obstruction, not a claimed historical Cicada decoder.
 *
 * Run on Windows 11, Node.js 22:
 *   node sims/lp2_wordlength_predecessor_allsecret_sft.cjs
 *
 * Reads only pinned repository sources; no network or file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");
const { encodeSourceNativeGP } =
  require("./lp2_native_gp_source_orthography_sft.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const originalLayout = parseSharedCorpus();
const glyph = new Map(gp.runes.map((r, i) => [r, i]));
const words = originalLayout.words.map(word =>
  [...word.runes].map(r => {
    assert(glyph.has(r));
    return glyph.get(r);
  }));
const original = words.flat();
assert.equal(originalLayout.runeCount, 12956);
assert.equal(originalLayout.crossPageWords, 32);
assert.equal(words.length, 2896);
assert.deepEqual(original, gp.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices));

const LENGTH = words.flatMap(word => word.map(() => word.length));
assert.equal(LENGTH.length, 12956);
const pageStarts = new Set();
let offset = 0;
for (const page of gp.pages.filter(p => p.page <= 55 && p.indices.length)) {
  pageStarts.add(offset);
  offset += page.indices.length;
}
assert.equal(pageStarts.size, 55);
assert.equal(offset, original.length);
const K = [1, 2, 3, 5, 9, 14];

/**
 * Cipher family: for every noninitial physical-page position,
 * C[i] = pi[LENGTH[i], C[i-1]](P[i]), with an independently unknown
 * permutation pi of all 29 runes for each (word length, predecessor).
 * The 55 page initials are free, and no printed-word reset is assumed.
 *
 * @param {number[]} cipher
 */
function bound(cipher) {
  assert.equal(cipher.length, original.length);
  const rows = new Map();
  for (let i = 0; i < cipher.length; i++) {
    if (pageStarts.has(i)) continue;
    const state = LENGTH[i] * 29 + cipher[i - 1];
    let histogram = rows.get(state);
    if (!histogram) {
      histogram = new Uint32Array(29);
      rows.set(state, histogram);
    }
    histogram[cipher[i]]++;
  }
  const rank = new Map();
  const capacity = K.map(() => pageStarts.size);
  for (const [state, histogram] of rows) {
    const ordered = Array.from({ length: 29 }, (_, i) => i)
      .sort((a, b) => histogram[b] - histogram[a] || a - b);
    const inverse = new Uint8Array(29);
    ordered.forEach((cipherValue, decodedRank) => {
      inverse[cipherValue] = decodedRank;
    });
    rank.set(state, inverse);
    K.forEach((k, j) => {
      for (let index = 0; index < k; index++)
        capacity[j] += histogram[ordered[index]];
    });
  }
  assert.equal([...rows.values()].reduce((n, histogram) =>
    n + histogram.reduce((a, b) => a + b, 0), 0), cipher.length - 55);
  return { capacity, rank, groups: rows.size };
}

/** @param {number[]} runes @param {number} top */
function concentration(runes, top) {
  const counts = new Uint32Array(29);
  for (const rune of runes) counts[rune]++;
  return [...counts].sort((a, b) => b - a).slice(0, top)
    .reduce((a, b) => a + b, 0);
}

/**
 * Show that the original capacities are attained simultaneously under
 * a single (massive, artificial) secret substitution table.
 * @param {number[]} cipher
 * @param {Map<number,Uint8Array>} rank
 */
function maximizingInverse(cipher, rank) {
  return cipher.map((value, i) => {
    if (pageStarts.has(i)) return 0;
    return rank.get(LENGTH[i] * 29 + cipher[i - 1])[value];
  });
}

const originalBound = bound(original);
assert.equal(originalBound.groups, 394);
assert.deepEqual(originalBound.capacity, [1477, 2606, 3589, 5281, 7908, 10314]);
const strongest = maximizingInverse(original, originalBound.rank);
K.forEach((k, i) => assert.equal(
  concentration(strongest, k), originalBound.capacity[i],
  "attainable source-original top-" + k + " capacity"));

/** @param {number} seed */
function xorshift32(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

/** @param {string} source */
function sourcePools(source) {
  const pools = new Map();
  for (const token of source.match(/[A-Za-z]+/g) || []) {
    const nums = encodeSourceNativeGP(token);
    const candidates = pools.get(nums.length) || [];
    candidates.push(nums);
    pools.set(nums.length, candidates);
  }
  for (const word of words)
    assert(pools.has(word.length), "missing length " + word.length);
  return pools;
}

/** @param {Map<number,number[][]>} pools @param {() => number} random */
function sampleBook(pools, random) {
  return words.flatMap(word => {
    const candidates = pools.get(word.length);
    return candidates[Math.floor(random() * candidates.length)];
  });
}

const references = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 8170, 8501],
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 8256, 8564],
  ["Emerson", "resources/control/emerson_essays_2944.txt", 8365, 8630],
];

let plantedPlain = null;
for (let index = 0; index < references.length; index++) {
  const [name, file, expectedMin, expectedMax] = references[index];
  const pools = sourcePools(read(file));
  const random = xorshift32(0x536a9dab + (index + 2) * 12345);
  let smallest = Infinity;
  let largest = -Infinity;
  for (let trial = 0; trial < 500; trial++) {
    const plaintext = sampleBook(pools, random);
    assert.equal(plaintext.length, original.length);
    if (index === 0 && trial === 0) plantedPlain = plaintext;
    const topNine = concentration(plaintext, 9);
    assert(topNine > originalBound.capacity[4],
      "unanticipated native-source compatible book: " + name + "/" + trial);
    smallest = Math.min(smallest, topNine);
    largest = Math.max(largest, topNine);
  }
  assert.deepEqual([smallest, largest], [expectedMin, expectedMax]);
  console.log(name + ": 500/500 native GP books exceed original top-nine " +
    originalBound.capacity[4] + "; observed range " + smallest + ".." + largest);
}

/**
 * A source-native positive: bijective state-dependent alphabet, with first
 * physical page symbols transmitted under the same affine key's zero state.
 * 7 is invertible modulo 29, with inverse 25.
 */
function affineEncrypt(plain) {
  const cipher = new Array(plain.length);
  for (let i = 0; i < plain.length; i++) {
    const previous = pageStarts.has(i) ? 0 : cipher[i - 1];
    cipher[i] = (7 * plain[i] + 11 * previous + 3 * LENGTH[i] + 5) % 29;
  }
  return cipher;
}
function affineDecrypt(cipher) {
  return cipher.map((value, i) => {
    const previous = pageStarts.has(i) ? 0 : cipher[i - 1];
    return (25 * ((value - 11 * previous - 3 * LENGTH[i] - 5) % 29 + 29)) % 29;
  });
}
assert(plantedPlain);
const plantedCipher = affineEncrypt(plantedPlain);
assert.deepEqual(affineDecrypt(plantedCipher), plantedPlain);
assert.deepEqual(affineEncrypt(affineDecrypt(plantedCipher)), plantedCipher);
const positiveBound = bound(plantedCipher);
for (let j = 0; j < K.length; j++)
  assert(concentration(plantedPlain, K[j]) <= positiveBound.capacity[j],
    "real source-native plaintext must pass its own correct-key bound");

console.log("SOURCE original 12956 runes, 55 free page initials, 394 keyed rows");
console.log("SOURCE exact all-secret top-k bounds: " +
  K.map((k, i) => k + "=" + originalBound.capacity[i]).join(" "));
console.log("CONTROL all 1500 matched-length native-GP books excluded");
console.log("CONTROL exact affine encrypt/decrypt: 12956/12956");
console.log("PASS word-length and prior-cipher-state all-secret original gate");
