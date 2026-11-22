"use strict";
/**
 * Source-motivated original GP29 word-integer modular-addition cipher:
 * a complete ALL-SECRET high-digit bound including every possible carry.
 *
 * For each *printed complete* GP29 word w of length L, interpret GP digits
 * as N(w) in [0, 29^L), and consider ANY constant secret K_L:
 *
 *   C(w) = (P(w) + K_L) mod 29^L.
 *
 * Every word-length receives its OWN unrelated unknown K_L, a strict
 * superset of a single shared key. Width L stays printed: leading F=0
 * digits are retained. Only the original manuscript and existing native
 * public-domain controls are read. No external modules or file writes.
 *
 * Windows 11 Node.js 22 single-file test. Reproducer:
 *   node sims/lp2_base29_wordinteger_additive_allsecret_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");

const read = name =>
  fs.readFileSync(path.join(__dirname, "..", name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const gpIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const transcribed = parseLP2Words(read("resources/lp2-transcription.txt"), 55);
const words = transcribed.words.map(word =>
  [...word.runes].map(rune => {
    const value = gpIndex.get(rune);
    assert.notEqual(value, undefined, "unrecognized original rune");
    return value;
  }));
assert.equal(words.length, 2896);
assert.equal(transcribed.runeCount, 12956);
assert.equal(transcribed.crossPageWords, 32);
assert.deepEqual(words.flat(),
  corpus.pages.filter(page => page.page <= 55).flatMap(page => page.indices));

/** @param {number[]} word @returns {bigint} */
function integer(word) {
  return word.reduce((n, v) => n * 29n + BigInt(v), 0n);
}

/**
 * Exact fixed-width GP29 digits, including leading zero=F.
 * @param {bigint} n
 * @param {number} width
 * @returns {number[]}
 */
function digits(n, width) {
  const mod = 29n ** BigInt(width);
  n = ((n % mod) + mod) % mod;
  const result = Array(width).fill(0);
  for (let i = width - 1; i >= 0; i--) {
    result[i] = Number(n % 29n);
    n /= 29n;
  }
  assert.equal(n, 0n);
  return result;
}

/** @param {number[]} word @param {bigint} key @param {number} sign */
function transform(word, key, sign) {
  assert(sign === 1 || sign === -1);
  return digits(integer(word) + BigInt(sign) * key, word.length);
}

/**
 * Sum of counts of the four most common initial GP29 labels.
 * @param {number[][]} fields
 */
function initialTop4(fields) {
  const bins = Array(29).fill(0);
  for (const field of fields) bins[field[0]]++;
  return bins.sort((a, b) => b - a)
    .slice(0, 4).reduce((s, n) => s + n, 0);
}

/**
 * EXACT per-L largest possible four-label initial concentration across
 * ALL K_L ∈ [0,29^L), for a full-precision word-integer addition inverse.
 *
 * Write C = c0 * 29^(L-1) + suffix. For K = a * 29^(L-1) + t:
 *
 *   P0 = (c0 - a - borrow) mod 29,
 *   borrow = 1 if suffix < t, else 0.
 *
 * The integer a only ROTATES the first-rune histogram; a rotation cannot
 * change the sum of the four largest bins. Thus enumerate t exactly by
 * sweeping the finitely many actual suffix thresholds (plus zero), moving
 * one word's initial from c0 to c0-1 when its suffix becomes < t.
 *
 * A length-L group of n words takes O(n log n + 29n), even though there
 * are up to 29^14 possible literal keys. The independent per-L maxima
 * SUM to a valid upper bound for ANY fixed 4 initial plaintext labels
 * across all lengths, since the four labels cannot be reoptimized per L.
 *
 * @param {number[][]} source
 */
function allSecretWordLengthBound(source) {
  const perLength = [];
  let total = 0;
  const maxLength = Math.max(...source.map(word => word.length));

  for (let length = 1; length <= maxLength; length++) {
    const rows = source.filter(word => word.length === length).map(word => ({
      top: word[0], tail: integer(word.slice(1))
    }));
    if (!rows.length) continue;
    rows.sort((a, b) => a.tail < b.tail ? -1 : a.tail > b.tail ? 1 : 0);
    const bins = Array(29).fill(0);
    for (const row of rows) bins[row.top]++;
    const top4 = () => bins.slice().sort((a, b) => b - a)
      .slice(0, 4).reduce((sum, n) => sum + n, 0);
    let maximum = top4();
    let threshold = 0n;
    let considered = 1;
    const largestAllowedTail = 29n ** BigInt(length - 1) - 1n;

    for (let i = 0; i < rows.length;) {
      const tail = rows[i].tail;
      let j = i;
      // All equal-tail words flip at the same feasible threshold t = tail+1.
      while (j < rows.length && rows[j].tail === tail) {
        const top = rows[j].top;
        bins[top]--;
        bins[(top + 28) % 29]++;
        j++;
      }
      const t = tail + 1n;
      if (t <= largestAllowedTail) {
        considered++;
        const score = top4();
        if (score > maximum) {
          maximum = score;
          threshold = t;
        }
      }
      i = j;
    }

    total += maximum;
    perLength.push({
      width: length,
      words: rows.length,
      maxTop4: maximum,
      illustrativeOptimalLowKey: threshold.toString(),
      candidates: considered
    });
  }
  return {total, perLength};
}

const original = allSecretWordLengthBound(words);
assert.equal(original.total, 648);
assert.deepEqual(original.perLength.map(row => row.words),
  [83, 448, 720, 513, 317, 256, 216, 156, 78, 52, 32, 18, 4, 3]);
assert.deepEqual(original.perLength.map(row => row.maxTop4),
  [20, 90, 145, 94, 66, 59, 54, 43, 31, 17, 12, 10, 4, 3]);

// Independent positive source material: source-attested GP29 spelling as
// implemented in prior source-native SFTs. No inferred original plaintext.
const tokenizer = corpus.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} originalWord @returns {number[]} */
function nativeGPWord(originalWord) {
  const word = originalWord.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith("ING", i)) {out.push(21); i += 3;}
    else if (word.startsWith("IO", i)) {out.push(27); i += 2;}
    else {
      const token = tokenizer.find(entry => word.startsWith(entry.token, i));
      assert.ok(token, "unmapped native GP word: " + word);
      out.push(token.index);
      i += token.token.length;
    }
  }
  return out;
}

/**
 * Source-native original-length matched English word plant; each word is
 * copied exactly from an independent text, after fixed GP transliteration.
 * @param {string} text
 * @returns {number[][]}
 */
function matchedNativeWords(text) {
  const groups = new Map();
  for (const word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    const runes = nativeGPWord(word);
    const group = groups.get(runes.length) || [];
    group.push(runes);
    groups.set(runes.length, group);
  }
  const native = words.map((cipherWord, i) => {
    const group = groups.get(cipherWord.length);
    assert.ok(group && group.length, "missing GP-native word width");
    return group[i % group.length];
  });
  assert.deepEqual(native.map(word => word.length),
    words.map(word => word.length));
  return native;
}

/** @param {number} length */
function secretForLength(length) {
  const m = 29n ** BigInt(length);
  return (3301n ** BigInt(length) + 1033n * BigInt(length)) % m;
}

/** @param {number[][]} native @param {string} name */
function plantedControl(native, name) {
  assert.equal(native.length, 2896);
  const crypt = native.map(word =>
    transform(word, secretForLength(word.length), 1));
  assert.deepEqual(crypt.map(word =>
    transform(word, secretForLength(word.length), -1)), native);
  const nativeInitialTop4 = initialTop4(native);
  const encryptedBound = allSecretWordLengthBound(crypt).total;
  assert(encryptedBound >= nativeInitialTop4,
    "all-secret bound must include planted cipher's true key");
  return {
    source: name,
    words: native.length,
    nativeTop4: nativeInitialTop4,
    encryptedAllSecretUpper: encryptedBound,
    plantedFullDecryption: "2896/2896",
    originalAllSecretUpper: original.total
  };
}

const controls = [
  plantedControl(matchedNativeWords(
    read("resources/control/gibran_prophet_58585.txt")), "Gibran"),
  plantedControl(matchedNativeWords(
    read("resources/control/shakespeare_first300k.txt")), "Shakespeare")
];
assert.deepEqual(controls.map(row => row.nativeTop4), [1002, 963]);
for (const row of controls) assert(original.total < row.nativeTop4);

// Small-group brute-force demonstration, independent of the threshold proof.
// At L=2, max over *all* 29^2=841 keys is the threshold-derived maximum90.
const two = words.filter(w => w.length === 2);
let brute = 0;
for (let k = 0n; k < 841n; k++)
  brute = Math.max(brute,
    initialTop4(two.map(word => transform(word, k, -1))));
assert.equal(brute, original.perLength[1].maxTop4);

// A single shared key K over all lengths is included in the per-length-free
// bound, as is an independent K_L for each of the 14 source lengths.
console.log(JSON.stringify({
  source: {
    words: words.length,
    runes: transcribed.runeCount,
    crossPageWords: transcribed.crossPageWords,
    maxWidth: original.perLength.at(-1).width
  },
  allSecretPerWordLengthIntegerAddition: {
    maximumFourPlaintextInitialLabels: original.total,
    percentage: Number((original.total / words.length * 100).toFixed(3)),
    perLength: original.perLength
  },
  controls,
  independentBruteCheckL2: {allKeys: 841, top4: brute, verified: true},
  decision: "Any width-preserving modular BASE29 integer addition with arbitrary secret K_L per word length cannot produce the two source-shaped GP-native English controls on original input. No unknown LP2 plaintext/key recovered."
}, null, 2));
