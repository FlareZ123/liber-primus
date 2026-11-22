"use strict";

/**
 * Word-local period-five affine invariants on authentic LP2 ciphertext.
 * Single runnable test file: node sims/lp2_wordlocal_five_affine_fingerprint_sft.cjs
 * Windows 11, Node.js 22, CommonJS. No network or third-party packages.
 *
 * A source-original five-position echo suggests checking whether every
 * printed word was transformed by C[j] = a * P[j] + b[j % 5] (mod 29).
 * The 28 possible nonzero multipliers and all 29^5 phase masks are granted
 * independently for EACH printed word. Difference at lag five eliminates
 * the five unknown masks; normalizing by the first nonzero difference
 * eliminates the multiplier. The resulting fingerprint is key-independent.
 * A negative lexical result cannot rule out invented vocabulary, non-GP
 * intermediate plaintext or different state/reset mechanics.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8")
  .replace(/\r\n/g, "\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const alphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
const inv = new Uint8Array(29);
for (let x = 1; x < 29; x++)
  for (let y = 1; y < 29; y++)
    if (x * y % 29 === 1) inv[x] = y;

/** Preserve words over line and physical-page wraps. */
function originalWords() {
  const raw = read("resources/lp2-transcription.txt");
  const stream = raw.split("%").slice(0, 55).join("%");
  const words = [];
  let buffer = "";
  function finish() {
    if (buffer) {
      words.push(Array.from(buffer, (r) => runeIndex.get(r)));
      buffer = "";
    }
  }
  for (const ch of stream) {
    if (/[\u16A0-\u16FF]/u.test(ch)) buffer += ch;
    else if (ch === "%" || ch === "/" || /\s/u.test(ch)) {}
    else finish();
  }
  finish();
  const fromCorpus = gp.pages.filter((p) => p.page <= 55)
    .flatMap((p) => p.indices);
  assert.equal(words.length, 2896);
  assert.equal(fromCorpus.length, 12956);
  assert.deepEqual(words.flat(), fromCorpus, "exact word-to-page source alignment");
  return words;
}

/**
 * Authenticated LP1 and LP2 spelling calibrations:
 * ING is one NG rune, IO is one IA rune, QU becomes CW.
 * @param {string} word
 * @returns {number[]}
 */
function encodeNativeGP(word) {
  const s = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith("ING", i)) {
      result.push(21);
      i += 3;
    } else if (s.startsWith("IO", i)) {
      result.push(27);
      i += 2;
    } else {
      const token = tokens.find((t) => s.startsWith(t.s, i));
      assert.ok(token, "source word must encode");
      result.push(token.i);
      i += token.s.length;
    }
  }
  return result;
}

/** @param {number[]} word @returns {string|null} */
function fingerprint(word) {
  if (word.length < 6) return null;
  const differences = word.slice(5).map((x, i) =>
    (x - word[i] + 29) % 29);
  const pivot = differences.find((x) => x !== 0);
  if (pivot !== undefined)
    for (let j = 0; j < differences.length; j++)
      differences[j] = differences[j] * inv[pivot] % 29;
  return word.length + ":" + differences.join(",");
}

function lexicons() {
  const english = read("resources/control/english_wordfreq_textblob.txt")
    .split("\n").filter((x) => /^[a-z]+\s+\d+$/.test(x))
    .map((line) => encodeNativeGP(line.split(/\s+/)[0]));
  const latin = read("resources/control/latin-vulgate-gp-wholewords.txt")
    .split("\n").filter((x) => /^[0-9A-S]+$/.test(x))
    .map((line) => Array.from(line, (x) => alphabet.indexOf(x)));
  assert.equal(english.length, 29157);
  assert.equal(latin.filter((w) => w.length >= 6).length, 15075);
  const make = (words) => new Set(words.map(fingerprint).filter(Boolean));
  return {english: make(english), latin: make(latin)};
}

/** @param {number[][]} words @param {Set<string>} dictionary */
function score(words, dictionary) {
  const lengths = {};
  for (const w of words) {
    if (w.length < 6) continue;
    const row = lengths[w.length] || {n: 0, matched: 0};
    row.n++;
    if (dictionary.has(fingerprint(w))) row.matched++;
    lengths[w.length] = row;
  }
  let long = {n: 0, matched: 0};
  for (const [l, row] of Object.entries(lengths)) {
    if (Number(l) >= 10) {
      long.n += row.n;
      long.matched += row.matched;
    }
  }
  return {long, lengths};
}

/**
 * Predecessor-feedback model: C[i] = C[i-1] + a * P[i] + b[wordPosition % 5]
 * with the same independent five-phase mask and nonzero word multiplier.
 * The ciphertext first difference is an ordinary five-phase affine word;
 * no secret key or initial state is required to compute that difference.
 * @param {number[][]} words
 */
function predecessorDifferences(words) {
  let predecessor = 0;
  return words.map((word) => word.map((x) => {
    const delta = (x - predecessor + 29) % 29;
    predecessor = x;
    return delta;
  }));
}

/** Verify a continuous, lossless ciphertext-feedback positive control. */
function feedbackPlant(plain, multiplier, mask) {
  let prev = 0;
  const encrypted = plain.map((word) => word.map((x, j) => {
    prev = (prev + multiplier * x + mask[j % 5]) % 29;
    return prev;
  }));
  assert.deepEqual(predecessorDifferences(encrypted).map(fingerprint),
    plain.map(fingerprint), "feedback preserves difference fingerprints");
  prev = 0;
  const decrypted = encrypted.map((word) => word.map((x, j) => {
    const delta = (x - prev + 29) % 29;
    prev = x;
    return inv[multiplier] * ((delta - mask[j % 5] + 29) % 29) % 29;
  }));
  assert.deepEqual(decrypted, plain, "feedback cipher inverse");
  return {ciphertextRunes: encrypted.flat().length,
    exactInverse: true, sourceWordBoundariesPreserved: true};
}

function checkPositiveControl() {
  const solved = read("resources/liber-primus/lp1-plaintext-reference.txt")
    .split("### 57\n")[1].trim();
  const source = solved.match(/[A-Z]+/g).map(encodeNativeGP);
  assert.deepEqual(source.flat(), gp.pages.find((p) => p.page === 57).indices,
    "independently solved LP2 p57 source spelling");
  const multiplier = 5, mask = [3, 1, 4, 1, 5];
  const ciphertext = source.map((word) =>
    word.map((v, j) => (multiplier * v + mask[j % 5]) % 29));
  const recovered = ciphertext.map((word) =>
    word.map((v, j) => inv[multiplier] *
      ((v - mask[j % 5] + 29) % 29) % 29));
  assert.deepEqual(recovered, source, "all 95 GP runes recovered");
  assert.deepEqual(ciphertext.map(fingerprint), source.map(fingerprint),
    "every word preserves its normalized five-back fingerprint");
  return {runes: 95, keyPerWordAllowed: true, exactInverse: true,
    exactForwardReproduction: true,
    feedback: feedbackPlant(source, multiplier, mask)};
}

function main() {
  const {english, latin} = lexicons();
  const original = originalWords();
  const originalFeedbackDeltas = predecessorDifferences(original);
  const sourceTexts = [
    ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
    ["Gibran", "resources/control/gibran_prophet_58585.txt"],
    ["Emerson", "resources/control/emerson_essays_2944.txt"]
  ];
  const controls = {};
  for (const [name, filename] of sourceTexts) {
    const words = (read(filename).match(/[A-Za-z]+/g) || [])
      .map(encodeNativeGP);
    controls[name] = score(words, english).long;
  }
  const result = {
    hypothesis: "Each printed word has any independent nonzero GP29 affine multiplier and five arbitrary additive phase masks, repeated within that word",
    selection: "five-back enrichment is observed source data, not an authenticated authorial opcode",
    original: {english: score(original, english),
      latin: score(original, latin)},
    feedbackOriginal: {english: score(originalFeedbackDeltas, english),
      latin: score(originalFeedbackDeltas, latin)},
    referenceEnglishLongWords: controls,
    lexiconFingerprintCounts: {english: english.size, latin: latin.size},
    nativePositive: checkPositiveControl()
  };
  assert.deepEqual(result.original.english.long, {n: 109, matched: 0});
  assert.deepEqual(result.original.latin.long, {n: 109, matched: 0});
  assert.deepEqual(result.feedbackOriginal.english.long, {n: 109, matched: 0});
  assert.deepEqual(result.feedbackOriginal.latin.long, {n: 109, matched: 0});
  assert.deepEqual(controls.Shakespeare, {n: 778, matched: 591});
  assert.deepEqual(controls.Gibran, {n: 306, matched: 262});
  assert.equal(result.nativePositive.exactInverse, true);
  console.log(JSON.stringify(result, null, 2));
  console.log("PASS: exact source alignment, whole-word affine fingerprint, solved-page plant, and matched native references");
}
if (require.main === module) main();
module.exports = {originalWords, encodeNativeGP, fingerprint,
  predecessorDifferences, score, main};
