"use strict";

/**
 * Exact original-input causal word-prime-sum cipher gate.
 *
 * This tests two fixed possible player operations (uniform and within-word
 * progressive shifting) in both signs, with the previous CIPHER word
 * GP-prime sum as the next word's key. The original word breaks are fixed.
 * The C-to-P mapping is fully reversible with zero prior-word seed.
 *
 * Run: node sims/lp2_previous_cipher_wordprime_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const root = path.join(__dirname, "..");
const json = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const corpus = json("resources/liber-primus/lp2-corpus.json");
const native = parseSharedCorpus();
const index = new Map(corpus.runes.map((r, i) => [r, i]));
const mod = (n) => ((n % 29) + 29) % 29;

/** @param {string} runes @returns {number[]} */
function ordinals(runes) {
  return [...runes].map((r) => {
    const value = index.get(r);
    assert.notEqual(value, undefined);
    return value;
  });
}

/** @param {number[]} word @returns {number} */
function priorKey(word) {
  return mod(word.reduce((sum, v) => sum + corpus.prime[v], 0));
}

/**
 * @param {number[][]} words Original ciphertext or planted native plaintext.
 * @param {number} sign Either +1 or -1.
 * @param {boolean} progressive Multiply by 1-based in-word position if true.
 * @param {boolean} decrypt Decryption uses previous cipher word.
 * @returns {number[][]}
 */
function transform(words, sign, progressive, decrypt) {
  const output = [];
  let priorCipherSum = 0;
  for (const word of words) {
    const converted = word.map((v, i) =>
      mod(v + (decrypt ? 1 : -1) * sign *
        (progressive ? i + 1 : 1) * priorCipherSum));
    output.push(converted);
    priorCipherSum = priorKey(decrypt ? word : converted);
  }
  return output;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const v of values) counts[v]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

/** @param {number[][]} words */
function repeatCount(words) {
  let repeated = 0;
  let pairs = 0;
  for (const word of words) {
    for (let i = 1; i < word.length; i++) {
      pairs++;
      if (word[i] === word[i - 1]) repeated++;
    }
  }
  return {repeated, pairs};
}

/**
 * A native GP-reference stream from already archived Gibran, matched to the
 * original LP2 2,896 word-length boundaries. Altered word boundaries are
 * deliberate so the cipher's input capacity and segmentation are identical.
 * @param {number[]} originalWordLengths
 * @returns {number[][]}
 */
function nativePlant(originalWordLengths) {
  const raw = fs.readFileSync(
    path.join(root, "resources", "control", "gibran_prophet_58585.txt"), "utf8");
  const tokens = corpus.translit.map((t, i) => ({t, i}))
    .sort((a, b) => b.t.length - a.t.length);
  const stream = [];
  const normalized = raw.toUpperCase().replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let offset = 0; offset < word.length;) {
      const token = tokens.find(({t}) => word.startsWith(t, offset));
      assert.ok(token, "Unmapped normalized GP token");
      stream.push(token.i);
      offset += token.t.length;
    }
  }
  const count = originalWordLengths.reduce((sum, n) => sum + n, 0);
  assert(stream.length >= count);
  const output = [];
  let at = 0;
  for (const length of originalWordLengths) {
    output.push(stream.slice(at, at + length));
    at += length;
  }
  assert.equal(at, count);
  return output;
}

const original = native.words.map((w) => ordinals(w.runes));
const N = original.flat().length;
assert.equal(original.length, 2896);
assert.equal(N, 12956);
const planted = nativePlant(original.map((w) => w.length));
const english = planted.flat();
const source = {
  originalUnsolvedRunes: N,
  originalWords: original.length,
  originalWithinWordRepeat: repeatCount(original),
  originalIoC: ioc(original.flat()),
  nativeGpReferenceIoC: ioc(english),
  nativeGpReferenceWithinWordRepeat: repeatCount(planted),
};

const outcomes = [];
for (const sign of [-1, +1]) {
  for (const progressive of [false, true]) {
    const generated = transform(planted, sign, progressive, false);
    const plantRecovered = transform(generated, sign, progressive, true);
    assert.deepEqual(plantRecovered, planted,
      "causal cipher failed exact native GP recovery");
    const decoded = transform(original, sign, progressive, true);
    assert.deepEqual(transform(decoded, sign, progressive, false), original,
      "original re-encryption failed");

    // A wrong key-source must fail the planted plaintext recovery.
    const wrongKeySource = generated.map((word) => word.map((v) => v));
    let priorWrong = 0;
    const incorrect = [];
    for (const word of wrongKeySource) {
      incorrect.push(word.map((v, i) =>
        mod(v + sign * (progressive ? i + 1 : 1) * priorWrong)));
      priorWrong = mod(word.reduce((sum, v) => sum + v, 0));
    }
    assert.notDeepEqual(incorrect, planted,
      "wrong-source ordinal word key somehow matched prime source");

    const result = {
      sign, progressive,
      plantCipherIoC: ioc(generated.flat()),
      plantCipherWithinWordRepeat: repeatCount(generated),
      originalDecodedIoC: ioc(decoded.flat()),
      originalDecodedWithinWordRepeat: repeatCount(decoded),
      exactPlantedRecoveryRunes: N,
      exactOriginalReencryptRunes: N,
    };
    outcomes.push(result);
  }
}

assert(Math.abs(source.originalIoC - 0.03447839786450569) < 1e-12);
assert(Math.abs(source.nativeGpReferenceIoC - 0.06042070486707437) < 1e-12);
assert.deepEqual(source.originalWithinWordRepeat, {repeated: 63, pairs: 10060});
assert.deepEqual(source.nativeGpReferenceWithinWordRepeat, {repeated: 308, pairs: 10060});
assert.deepEqual(outcomes.map((v) => v.originalDecodedWithinWordRepeat.repeated),
  [63, 359, 63, 333]);
assert.deepEqual(outcomes.map((v) => v.plantCipherWithinWordRepeat.repeated),
  [308, 385, 308, 369]);
assert(outcomes.every((v) => v.originalDecodedIoC < 0.03451));
assert(outcomes.every((v) => v.plantCipherIoC < 0.03452));
console.log(JSON.stringify({
  test: "PASS",
  hypothesis: "previous-ciphertext-word GP-prime sum controls a per-word GP29 shift",
  source, outcomes,
  decision: "All four source-motivated direct mappings yield non-native GP indices on original; no plaintext recovered",
}, null, 2));
