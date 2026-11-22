"use strict";
/**
 * Source-locked all-secret per-page progressive affine gate for original LP2.
 * Single-file test: node sims/lp2_progressive_affine_perpage_allsecret_sft.cjs
 *
 * Cipher family: C[p,i] = a[p]*P[p,i] + b[p]*i + c[p] (mod 29).
 * Every physical page may choose entirely secret a!=0,b,c. A nonzero
 * multiplier and constant do not change collision counts. Exhausting the
 * 29 slopes independently for each page is therefore an EXACT upper bound
 * on all (28*29*29)^55 possible independent per-page secret affine keys,
 * without fitting or attempting plaintext reconstruction.
 *
 * The Gibran native controls preserve EVERY original printed GP word length,
 * the full 2,896-word order, and all 55 physical page lengths. Original
 * page-split words remain split at their original rune offsets.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const prose = fs.readFileSync(path.join(root,
  "resources/control/gibran_prophet_58585.txt"), "utf8");
const parsed = parseSharedCorpus();
const physicalPages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const lengths = physicalPages.map(p => p.indices.length);
const observed = physicalPages.flatMap(p => p.indices);
const totalLength = lengths.reduce((a, b) => a + b, 0);
const denom = lengths.reduce((a, n) => a + n * (n - 1), 0);
assert.equal(physicalPages.length, 55);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.runeCount, 12956);
assert.equal(totalLength, 12956);
assert.deepEqual(parsed.words.flatMap(w => [...w.runes]),
  observed.map(i => corpus.runes[i]));

const runeIndex = new Map(corpus.translit.map((s, i) => [s, i]));
runeIndex.set("ING", runeIndex.get("NG"));
runeIndex.set("IO", runeIndex.get("EO"));
const multigraphs = ["ING", "TH", "NG", "EO", "OE", "AE", "IA", "EA", "IO"];
const mod = x => ((x % 29) + 29) % 29;

/** @param {string} word @returns {number[]} */
function gpWord(word) {
  const text = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < text.length;) {
    const multigraph = multigraphs.find(s => text.startsWith(s, i));
    const key = multigraph === undefined ? text[i] : multigraph;
    const index = runeIndex.get(key);
    assert.notEqual(index, undefined, "Unencodable GP symbol: " + key);
    result.push(index);
    i += key.length;
  }
  return result;
}
const bins = Array.from({ length: 16 }, () => []);
for (const word of prose.match(/[A-Za-z]+/g) || []) {
  const codes = gpWord(word);
  if (codes.length < bins.length) bins[codes.length].push(codes);
}
for (const word of parsed.words) {
  assert(bins[word.length].length > 0,
    "Native source has no word of GP length " + word.length);
}

/** @param {number[]} vals @param {number} start
 * @param {number} size @param {number} slope
 * @returns {number} ordered matching-symbol pairs */
function equalPairCount(vals, start, size, slope) {
  const hist = Array(29).fill(0);
  for (let i = 0; i < size; i++) hist[mod(vals[start + i] - slope * i)]++;
  return hist.reduce((sum, n) => sum + n * (n - 1), 0);
}
/** @param {number[]} vals @param {boolean} maximize
 * @returns {number} */
function stratifiedIoc(vals, maximize) {
  assert.equal(vals.length, totalLength);
  let start = 0, count = 0;
  for (const size of lengths) {
    let best = equalPairCount(vals, start, size, 0);
    if (maximize) for (let b = 1; b < 29; b++) {
      best = Math.max(best, equalPairCount(vals, start, size, b));
    }
    count += best;
    start += size;
  }
  assert.equal(start, vals.length);
  return count / denom;
}
const originalRaw = stratifiedIoc(observed, false);
const originalUpper = stratifiedIoc(observed, true);
assert(Math.abs(originalRaw - 0.034039152716604265) < 1e-12);
assert(Math.abs(originalUpper - 0.03704926479231852) < 1e-12);

let seed = 0x15e2026;
/** @returns {number} deterministic xorshift32 */
function random32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const controlIocs = [];
let firstControl = [];
for (let trial = 0; trial < 1000; trial++) {
  const native = [];
  for (const w of parsed.words) {
    const pool = bins[w.length];
    native.push(...pool[random32() % pool.length]);
  }
  assert.equal(native.length, totalLength);
  if (trial === 0) firstControl = native;
  controlIocs.push(stratifiedIoc(native, false));
}
controlIocs.sort((a, b) => a - b);
assert(Math.abs(controlIocs[0] - 0.057895572746667866) < 1e-12);
assert(Math.abs(controlIocs[499] - 0.05933810049047194) < 1e-12);
assert(Math.abs(controlIocs[999] - 0.060836903698923764) < 1e-12);
assert(originalUpper < controlIocs[0],
  "Original cannot reach the native GP-English reference register");

/** Positive encryption plants random independent (a,b,c) on every page.
 * The exact maximized inverse must recover at least the native IoC,
 * although the investigator knows none of the random keys.
 */
const encrypted = [];
let start = 0;
for (const n of lengths) {
  const a = 1 + random32() % 28;
  const b = random32() % 29;
  const c = random32() % 29;
  for (let i = 0; i < n; i++) {
    encrypted.push(mod(a * firstControl[start + i] + b * i + c));
  }
  start += n;
}
assert.equal(start, totalLength);
const plantedPlainIoc = stratifiedIoc(firstControl, false);
const plantedRecoveredUpper = stratifiedIoc(encrypted, true);
assert(Math.abs(plantedPlainIoc - 0.05893791940853236) < 1e-12);
assert(Math.abs(plantedRecoveredUpper - plantedPlainIoc) < 1e-12);
console.log(JSON.stringify({
  scope: { pages: physicalPages.length, words: parsed.words.length,
    runes: totalLength, candidateSlopesPerPage: 29,
    secretAffineKeysPerPage: 28 * 29 * 29, nativeSamples: 1000 },
  original: { rawPageStratifiedIoc: originalRaw,
    exactAllSecretPerPageUpperBound: originalUpper },
  wordLengthMatchedGibran: { minimum: controlIocs[0],
    median: controlIocs[499], maximum: controlIocs[999] },
  positivePlant: { rawEncryptedIoc: stratifiedIoc(encrypted, false),
    nativeIoc: plantedPlainIoc, maxUnknownKeyRecovery: plantedRecoveredUpper,
    verdict: "PASS" },
  verdict: "NO ORIGINAL PLAINTEXT; DIRECT PAGEWISE PROGRESSIVE AFFINE EXCLUDED"
}, null, 2));
