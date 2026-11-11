"use strict";
/**
 * SFT: a fixed, deterministic reversible word-local cipher preserves the
 * equality partition of complete words of every length. Test that invariant
 * against the authentic LP2 word stream and native-GP literary controls.
 *
 * The source manuscript's printed word breaks are hypothesized to be
 * plaintext word breaks; this assumption is explicitly conditional.
 *
 * Run: node sims/lp2_fixed_wordcipher_repeat_sft.cjs
 * Node.js 22; built-in modules only; no network or file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const RUNIC = /[\u16A0-\u16FF]/u;
const texts = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"],
  ["Solved LP1", "resources/liber-primus/lp1-plaintext-reference.txt"]
];
const tokens = corpus.translit.map((s, i) => ({s, rune: corpus.runes[i]}))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} text */
function lp2Words(text) {
  const stream = text.split("%").slice(0, 55).join("%");
  const words = [];
  let current = "";
  for (const ch of stream) {
    if (RUNIC.test(ch)) current += ch;
    else if (ch !== "%" && ch !== "/" && !/\s/u.test(ch)) {
      if (current) words.push(current);
      current = "";
    }
  }
  if (current) words.push(current);
  return words;
}

/** @param {string} original */
function encodeNative(original) {
  const word = original.replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S");
  let encoded = "";
  for (let i = 0; i < word.length;) {
    const match = tokens.find(t => word.startsWith(t.s, i));
    if (!match) return null;
    encoded += match.rune;
    i += match.s.length;
  }
  return encoded;
}

/** @param {string} raw */
function sourceWords(raw) {
  return (raw.toUpperCase().match(/[A-Z]+/g) || [])
    .map(encodeNative).filter(Boolean);
}

/** @param {string[]} words */
function groupLengths(words) {
  const groups = new Map();
  for (const word of words) {
    const n = [...word].length;
    if (!groups.has(n)) groups.set(n, []);
    groups.get(n).push(word);
  }
  return groups;
}

/** @param {string[]} words */
function equalPairCount(words) {
  const hist = new Map();
  for (const w of words) hist.set(w, (hist.get(w) || 0) + 1);
  let pairs = 0;
  for (const n of hist.values()) pairs += n * (n - 1) / 2;
  return {pairs, distinct: hist.size};
}

/** @param {number} seed */
function rng(seed) {
  let v = seed >>> 0;
  return () => {
    v ^= v << 13;
    v ^= v >>> 17;
    v ^= v << 5;
    return (v >>> 0) / 4294967296;
  };
}

/** @param {Map<number,string[]>} slots @param {Map<number,string[]>} pools @param {()=>number} random */
function sampleMatched(slots, pools, random) {
  const selected = [];
  for (const [n, words] of slots) {
    const pool = pools.get(n);
    assert(pool && pool.length > 0, "Missing reference word length " + n);
    for (let i = 0; i < words.length; i++)
      selected.push(pool[Math.floor(random() * pool.length)]);
  }
  return selected;
}

/**
 * A bijective, length-dependent word transform. Its secret could be any
 * bijection of the 29^n words; this concrete plant checks the invariant.
 * @param {string} word @param {boolean} inverse
 */
function wordCipher(word, inverse = false) {
  const n = [...word].length, k = (7 * n + 11) % 29;
  const indices = [...word].map(ch => {
    const index = corpus.runes.indexOf(ch);
    assert(index >= 0);
    return index;
  });
  if (inverse) return indices.map(x => corpus.runes[(x - k + 29) % 29])
    .reverse().join("");
  return indices.reverse().map(x => corpus.runes[(x + k) % 29]).join("");
}

const words = lp2Words(read("resources/lp2-transcription.txt"));
assert.equal(words.length, 2896);
assert.equal(words.reduce((n, w) => n + [...w].length, 0), 12956);
const slots = groupLengths(words);
const counts = Object.fromEntries([...slots].map(([n, x]) =>
  [n, {tokens: x.length, ...equalPairCount(x)}]));
assert.equal(counts[3].tokens, 720);
assert.equal(counts[3].distinct, 704);
assert.equal(counts[3].pairs, 17);
const actualPairs = equalPairCount(words).pairs;
assert.equal(actualPairs, 230);
assert([...slots].every(([n, v]) => n <= 3 || equalPairCount(v).pairs === 0));

const uniformExpectation = [...slots].reduce(
  (sum, [n, x]) => sum + x.length * (x.length - 1) / (2 * 29 ** n), 0);
const uniformVariance = [...slots].reduce((sum, [n, x]) => {
  const p = 1 / (29 ** n);
  return sum + x.length * (x.length - 1) / 2 * p * (1 - p);
}, 0);
assert(Math.abs(uniformExpectation - 247.20425104548048) < 1e-8);

const reference = texts.map(([name, file]) => ({
  name, groups: groupLengths(sourceWords(read(file)))
}));
const union3 = new Set(reference.flatMap(x => x.groups.get(3) || []));
assert.equal(union3.size, 411);
const dictionaryDeficit = counts[3].distinct - union3.size;
assert.equal(dictionaryDeficit, 293);

const trials = 500;
const tests = [];
for (let j = 0; j < 3; j++) {
  const {name, groups} = reference[j];
  let expected = 0;
  for (const [len, slot] of slots) {
    const pool = groups.get(len);
    assert(pool && pool.length);
    const freq = new Map();
    for (const v of pool) freq.set(v, (freq.get(v) || 0) + 1);
    const pMatch = [...freq.values()].reduce((s, n) =>
      s + (n / pool.length) ** 2, 0);
    expected += slot.length * (slot.length - 1) / 2 * pMatch;
  }
  const random = rng(0x3301aabb + j + 2);
  const values = [];
  for (let i = 0; i < trials; i++)
    values.push(equalPairCount(sampleMatched(slots, groups, random)).pairs);

  // Positive control: an artificial fixed bijection, reset at each word.
  const planted = sampleMatched(slots, groups, rng(0x3301c0de + j));
  const ciphertext = planted.map(w => wordCipher(w));
  const recovered = ciphertext.map(w => wordCipher(w, true));
  assert.deepEqual(recovered, planted);
  assert.equal(equalPairCount(ciphertext).pairs,
    equalPairCount(planted).pairs);
  assert.equal(recovered.reduce((n, w) => n + w.length, 0), 12956);

  tests.push({source: name, referenceTokens: [...groups.values()]
    .reduce((n, a) => n + a.length, 0),
  gp3Distinct: new Set(groups.get(3)).size,
  expectedPairs: expected,
  simulated: {trials, min: Math.min(...values),
    max: Math.max(...values),
    mean: values.reduce((a, b) => a + b, 0) / trials,
    equalOrBelowOriginal: values.filter(x => x <= actualPairs).length},
  planted: {runesRecovered: 12956,
    identicalWordPairInvariant: true}});
}
console.log(JSON.stringify({
  model: "same deterministic reversible word-local map for each GP word length",
  caveat: "conditional on printed ciphertext words being plaintext words",
  original: {words: words.length, runes: 12956, repeatedPairs: actualPairs,
    length3: counts[3], byLength: counts},
  uniformGP29: {expectedPairs: uniformExpectation,
    standardDeviation: Math.sqrt(uniformVariance),
    z: (actualPairs - uniformExpectation) / Math.sqrt(uniformVariance)},
  finiteVocabulary: {source: "union of four original GP-encoded reference corpora",
    uniqueReferenceLength3: union3.size,
    originalLength3Distinct: counts[3].distinct,
    requiredNewLength3TypesBeyondUnion: dictionaryDeficit},
  referenceControls: tests
}, null, 2));
