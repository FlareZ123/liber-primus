"use strict";

/**
 * Key-independent LP2 within-word collision invariant.
 *
 * Every secret GP29 bijection chosen separately for each word, followed by
 * every secret permutation of that word's rune positions, preserves its
 * number of matching unordered rune pairs. This test grants far more key
 * freedom than fixed word-shape, page, or section substitution models.
 *
 * Reproduce: node sims/lp2_wordprivate_pair_collision_allkey_sft.cjs
 * Original source: resources/liber-primus/lp2-transcription.txt.
 * Native controls: four independent text sources plus solved LP1 excerpts.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ROOT = path.resolve(__dirname, "..");

/** @param {string} name */
function read(name) {
  return fs.readFileSync(path.join(ROOT, name), "utf8");
}
/** @param {string} text */
function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}
const sourceName = "resources/liber-primus/lp2-transcription.txt";
const corpusName = "resources/liber-primus/lp2-corpus.json";
const source = read(sourceName);
const corpus = JSON.parse(read(corpusName));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const unknownPages = source.split("%").slice(0, 55).join("%");

/** @param {string} s */
function cipherWords(s) {
  /** @type {number[][]} */
  const result = [];
  let word = [];
  for (const ch of s) {
    if (runeIndex.has(ch)) {
      word.push(runeIndex.get(ch));
    } else if (ch === "%" || ch === "/" || /\s/u.test(ch)) {
      // Physical page and printed line wraps never finish a word.
    } else if (word.length) {
      result.push(word);
      word = [];
    }
  }
  if (word.length) result.push(word);
  return result;
}
const original = cipherWords(unknownPages);
assert.equal(original.length, 2896);
assert.equal(original.reduce((n, w) => n + w.length, 0), 12956);
assert.deepEqual(original.flat(), corpus.pages
  .filter(p => p.page <= 55).flatMap(p => p.indices));

/** @param {number[]} word */
function equalPairs(word) {
  let n = 0;
  for (let i = 0; i < word.length; i++) {
    for (let j = i + 1; j < word.length; j++) {
      if (word[i] === word[j]) n++;
    }
  }
  return n;
}
/** @param {number[][]} words */
function count(words) {
  let pairs = 0, wordsWithRepeat = 0, adjacent = 0;
  for (const w of words) {
    const n = equalPairs(w);
    pairs += n;
    if (n) wordsWithRepeat++;
    for (let j = 1; j < w.length; j++) {
      if (w[j] === w[j - 1]) adjacent++;
    }
  }
  return { pairs, wordsWithRepeat, adjacent };
}
const observed = count(original);
assert.deepEqual(observed, {
  pairs: 811, wordsWithRepeat: 621, adjacent: 63
});
const lengths = original.map(w => w.length);
const alphabet = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} raw */
function gpPlainWord(raw) {
  const normalized = raw.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C")
    .replace(/Z/g, "S").replace(/ING/g, "NG");
  const out = [];
  for (let p = 0; p < normalized.length;) {
    const match = alphabet.find(t => normalized.startsWith(t.s, p));
    if (!match) return null;
    out.push(match.i);
    p += match.s.length;
  }
  return out;
}
/** @param {string} text */
function englishWords(text) {
  return (text.toUpperCase().match(/[A-Z]+/g) || [])
    .map(gpPlainWord).filter(w => w && w.length);
}
/** @param {string} source */
function latinWords(source) {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
  return source.split(/\r?\n/g).map(s => s.trim())
    .filter(s => /^[0-9A-S]+$/.test(s))
    .map(s => [...s].map(ch => alphabet.indexOf(ch)));
}
/** @param {string} source */
function solvedLP1Words(source) {
  return englishWords(source.split(/\r?\n/g)
    .filter(line => !line.startsWith("#") &&
      !line.startsWith("[") && !/^\s*\d+\s*/.test(line))
    .join(" "));
}
/** @param {number[][]} words */
function byLength(words) {
  const out = new Map();
  for (const word of words) {
    if (!out.has(word.length)) out.set(word.length, []);
    out.get(word.length).push(word);
  }
  for (const length of new Set(lengths)) {
    assert(out.has(length), "Control missing rune length " + length);
  }
  return out;
}
let seed = 3301;
/** @returns {number} */
function nextUint() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed;
}
/** @param {number} limit */
function pick(limit) {
  return Math.floor(nextUint() / 4294967296 * limit);
}
/** @param {number[]} arr */
function shuffled(arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = pick(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
/** @param {Map<number,number[][]>} pool */
function plant(pool) {
  return lengths.map(L => {
    const words = pool.get(L);
    return words[pick(words.length)];
  });
}
/** @param {number[]} w */
function randomPrivateEncryption(w) {
  const alphabet = shuffled(Array.from({length: 29}, (_, i) => i));
  const order = shuffled(Array.from({length: w.length}, (_, i) => i));
  const enc = order.map(pos => alphabet[w[pos]]);
  const inv = Array(29);
  alphabet.forEach((v, i) => {inv[v] = i;});
  const dec = Array(w.length);
  order.forEach((pos, j) => {dec[pos] = inv[enc[j]];});
  assert.deepEqual(dec, w);
  assert.equal(equalPairs(enc), equalPairs(w));
  return enc;
}
/** @param {number[]} values */
function describe(values) {
  const s = values.slice().sort((a, b) => a - b);
  return { min: s[0], median: s[Math.floor(s.length / 2)],
    max: s.at(-1),
    mean: values.reduce((a, b) => a + b, 0) / values.length };
}
const sources = [
  ["Shakespeare English", "resources/control/shakespeare_first300k.txt", englishWords],
  ["Gibran English", "resources/control/gibran_prophet_58585.txt", englishWords],
  ["Emerson English", "resources/control/emerson_essays_2944.txt", englishWords],
  ["Latin Vulgate word GP", "resources/control/latin-vulgate-gp-wholewords.txt", latinWords],
  ["Solved LP1 native English", "resources/liber-primus/lp1-plaintext-reference.txt", solvedLP1Words]
];
const results = [], inputs = { [sourceName]: sha256(source),
  [corpusName]: sha256(read(corpusName)) };
for (const [name, filename, parse] of sources) {
  const text = read(filename);
  inputs[filename] = sha256(text);
  const corpusWords = parse(text);
  const pool = byLength(corpusWords);
  const samples = [];
  for (let trial = 0; trial < 256; trial++) {
    samples.push(count(plant(pool)));
  }
  const totals = samples.map(row => row.pairs);
  const repeated = samples.map(row => row.wordsWithRepeat);
  assert(totals.every(n => n > observed.pairs),
    "Whole-word arbitrary-private-alphabet invariant contradicted by " + name);
  const row = {source: name, referenceWords: corpusWords.length,
    lengthMatchedSamples: 256,
    equalPairs: describe(totals),
    wordsWithRepeat: describe(repeated),
    observedPairs: observed.pairs,
    addOneEmpiricalLowerTail: 1 / (totals.length + 1)};
  results.push(row);
  console.log("CONTROL", JSON.stringify(row));
}
// Full-length positive proves that each independently secret word alphabet
// and each independent word-specific positional shuffle preserve exactly
// the pair statistic, despite changing every word's actual rune values.
const native = byLength(englishWords(read(sources[1][1])));
const planted = plant(native);
const privateCipher = planted.map(randomPrivateEncryption);
const before = count(planted), after = count(privateCipher);
assert.equal(before.pairs, after.pairs);
assert.equal(before.wordsWithRepeat, after.wordsWithRepeat);
console.log("POSITIVE", JSON.stringify({ words: planted.length,
  runes: planted.flat().length, before, after,
  recoveredRunes: planted.flat().length }));
// Stronger all-secret one-sided theorem, even allowing *non-injective*
// deterministic 29->29 maps independently for every original word:
// equal plaintext runes always map to equal ciphertext runes.
// Such maps may merge distinct runes, never split an equal-rune pair.
// This excludes more mechanisms than alphabet bijections alone.
const lossyCipher = planted.map(word => {
  const secretMap = Array.from({length: 29}, () => pick(19));
  const order = shuffled(Array.from({length: word.length}, (_, i) => i));
  const encoded = order.map(pos => secretMap[word[pos]]);
  assert(equalPairs(encoded) >= equalPairs(word),
    "deterministic secret symbol mapping cannot remove equal-rune pairs");
  return encoded;
});
const lossyStats = count(lossyCipher);
assert(lossyStats.pairs >= before.pairs);
assert(lossyStats.wordsWithRepeat >= before.wordsWithRepeat);
console.log("NONINJECTIVE_POSITIVE", JSON.stringify({
  alphabetOutputs: 19, originalRunes: planted.flat().length,
  extraCollisions: lossyStats.pairs - before.pairs,
  input: before, output: lossyStats,
  all2896WordsPassedOneSidedBound: true,
  note: "A lossy word map needs additional hidden information for an injective complete cipher"
}));
// Author-authentic control from already-solved LP2 physical page 56.
// Its actual prime-totient moving-key cipher does NOT conserve the
// word-private monoalphabetic pair count, despite exact word lengths.
const p56Full = read("resources/liber-primus/lp1-plaintext-reference.txt");
const p56PlainLines = p56Full.split("### 56")[1].split("### 57")[0]
  .split(/\r?\n/g)
  .filter(line => !/[a-f0-9]{32,}/i.test(line)).join(" ");
const p56Plain = englishWords(p56PlainLines);
const p56Cipher = cipherWords(source.split("%")[55]);
assert.equal(p56Plain.length, 25);
assert.equal(p56Cipher.length, 25);
assert.equal(p56Plain.flat().length, 85);
assert.equal(p56Cipher.flat().length, 85);
assert.deepEqual(p56Cipher.flat(), corpus.pages[56].indices);
assert.deepEqual(p56Cipher.map(w => w.length), p56Plain.map(w => w.length));
const p56KnownPlain = count(p56Plain);
const p56KnownCipher = count(p56Cipher);
assert.equal(p56KnownPlain.pairs, 9);
assert.equal(p56KnownCipher.pairs, 1);
console.log("SOLVED_LP2_DYNAMIC_CONTROL", JSON.stringify({
  page: 56, words: 25, runes: 85,
  printedWordLengthsExactlyPreserved: true,
  knownMechanism: "published prime-totient per-rune moving key",
  plaintext: p56KnownPlain, ciphertext: p56KnownCipher,
  wordsWithDifferentPairCount: p56Plain.filter((w,i) =>
    equalPairs(w) !== equalPairs(p56Cipher[i])).length
}));
console.log("DECISION", JSON.stringify({
  originalWords: original.length, originalRunes: 12956,
  original: observed, samplesPerSource: 256,
  totalNativeSamples: results.length * 256,
  inputs, inference: "Incompatible with within-word private arbitrary GP29 bijections and private positional shuffles for tested length-matched native English and Latin controls",
  caveat: "Requires original word segmentation, length preservation, native-like plaintext; permits evolving per-rune maps, insertion/deletion and cross-word mixing",
  recoveredUnknownPlaintext: false
}));
