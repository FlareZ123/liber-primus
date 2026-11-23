"use strict";

/**
 * GP29 four-rune two-round page-private Feistel necessary-condition SFT.
 *
 * A four-rune packet consists of two two-rune GF(29)^2 halves. Encryption is
 *   A = L + F1(R)
 *   B = R + F2(A),
 * with entirely secret, unrelated functions F1 and F2 on each physical page.
 * Neither function is assumed invertible, linear, keyed by p15, or known.
 * The full four-rune Feistel transformation is always invertible:
 *   R = B - F2(A); L = A - F1(R).
 *
 * For any proposed plaintext/ciphertext aligned packet pair, the unknown
 * functions exist iff both observed relations are functions:
 *   F1(R) = A-L; F2(A) = B-R.
 * Reject only when a repeated function input requires unequal outputs.
 * This is an exact all-secret feasibility theorem, not a solved LP2 cipher.
 *
 * Native controls use actual solved-Cicada-calibrated GP orthography,
 * all 2,896 original printed word lengths and 55 source page lengths,
 * 96 independently sampled source books per fixed literary donor, seed
 * 0x33012026. Every page may privately choose the most favorable phase.
 *
 * SFT: node sims/lp2_gp29_fourblock_two_round_feistel_allkey_sft.cjs
 * Node 22, CommonJS; no external packages, no file writes, no network.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = gp.pages.filter(p => p.page <= 55 && p.indices.length);
const source = pages.flatMap(p => p.indices);
const {parseLP2Words} = require("./lp2_word_pages.cjs");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const parsed = parseLP2Words(read("resources/liber-primus/lp2-transcription.txt"));
const lengths = parsed.words.map(w => w.length);
assert.equal(pages.length, 55);
assert.equal(source.length, 12956);
assert.equal(lengths.length, 2896);
assert.equal(lengths.reduce((a, b) => a + b, 0), source.length);
assert.equal(parsed.crossPageWords, 32);

/** @param {number} x @returns {number} */
function mod29(x) {
  return (x % 29 + 29) % 29;
}
/** @param {number} x @param {number} y @returns {number} */
function pair(x, y) {
  return x * 29 + y;
}
/**
 * An arbitrary, fixed, deliberately NONLINEAR positive-control F1.
 * No invertibility of the inner function is necessary.
 * @param {number} x @param {number} y @param {number} page
 * @returns {[number,number]}
 */
function f1(x, y, page) {
  return [mod29(x * x + 3 * x * y + y + page),
    mod29(y * y + x + 2 * page)];
}
/**
 * A different nonlinear per-page positive-control F2.
 * @param {number} x @param {number} y @param {number} page
 * @returns {[number,number]}
 */
function f2(x, y, page) {
  return [mod29(x * y + 3 * x + 5 * page),
    mod29(x * x + y * y + 7 * page)];
}
/**
 * Actual two-round GP29 Feistel, copying partial fringe symbols verbatim.
 * @param {number[]} plain @param {number} page @param {number} phase
 * @returns {number[]}
 */
function encryptPage(plain, page, phase) {
  const result = plain.slice();
  for (let at = phase; at + 4 <= plain.length; at += 4) {
    const u = f1(plain[at + 2], plain[at + 3], page);
    const a = mod29(plain[at] + u[0]);
    const b = mod29(plain[at + 1] + u[1]);
    const v = f2(a, b, page);
    result[at] = a;
    result[at + 1] = b;
    result[at + 2] = mod29(plain[at + 2] + v[0]);
    result[at + 3] = mod29(plain[at + 3] + v[1]);
  }
  return result;
}
/**
 * Exact Feistel inverse, valid despite nonlinear/noninjective F1/F2.
 * @param {number[]} cipher @param {number} page @param {number} phase
 * @returns {number[]}
 */
function decryptPage(cipher, page, phase) {
  const result = cipher.slice();
  for (let at = phase; at + 4 <= cipher.length; at += 4) {
    const v = f2(cipher[at], cipher[at + 1], page);
    const r0 = mod29(cipher[at + 2] - v[0]);
    const r1 = mod29(cipher[at + 3] - v[1]);
    const u = f1(r0, r1, page);
    result[at] = mod29(cipher[at] - u[0]);
    result[at + 1] = mod29(cipher[at + 1] - u[1]);
    result[at + 2] = r0;
    result[at + 3] = r1;
  }
  return result;
}
/**
 * Necessary AND sufficient existence test for two wholly arbitrary secret
 * page-private F1/F2 maps. A duplicate input must have identical outputs.
 * No fitting, dictionary, external key or secret-table enumeration occurs.
 * @param {number[]} plain @param {number[]} cipher @param {number} phase
 * @returns {{first:number,second:number,firstRepeats:number,secondRepeats:number,packets:number}}
 */
function feasibility(plain, cipher, phase) {
  assert.equal(plain.length, cipher.length);
  const first = new Map(), second = new Map();
  let bad1 = 0, bad2 = 0, reps1 = 0, reps2 = 0, n = 0;
  for (let at = phase; at + 4 <= cipher.length; at += 4) {
    const r = pair(plain[at + 2], plain[at + 3]);
    const a = pair(cipher[at], cipher[at + 1]);
    const val1 = pair(mod29(cipher[at] - plain[at]),
      mod29(cipher[at + 1] - plain[at + 1]));
    const val2 = pair(mod29(cipher[at + 2] - plain[at + 2]),
      mod29(cipher[at + 3] - plain[at + 3]));
    if (first.has(r)) {
      reps1++;
      if (first.get(r) !== val1) bad1++;
    } else first.set(r, val1);
    if (second.has(a)) {
      reps2++;
      if (second.get(a) !== val2) bad2++;
    } else second.set(a, val2);
    n++;
  }
  return {first:bad1, second:bad2, firstRepeats:reps1,
    secondRepeats:reps2, packets:n};
}

const controls = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
const pools = controls.map(([, file]) => {
  /** @type {number[][][]} */
  const indexed = Array.from({length:30}, () => []);
  for (const word of read(file).match(/[A-Za-z]+/g) || []) {
    const native = encodeSourceNativeGP(word);
    indexed[native.length].push(native);
  }
  for (const n of lengths) assert(indexed[n].length,
    "Every actual original word length must have source-native donor support: " + n);
  return indexed;
});
let seed = 0x33012026;
/** @returns {number} */
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
/** @param {number[][][]} indexed @returns {number[]} */
function sample(indexed) {
  const out = [];
  for (const n of lengths) {
    const pool = indexed[n];
    out.push(...pool[random() % pool.length]);
  }
  assert.equal(out.length, source.length);
  return out;
}
/**
 * Source-calibrated native text -> original physical-page layout.
 * @param {number[]} runes @returns {number[][]}
 */
function splitPages(runes) {
  assert.equal(runes.length, source.length);
  const result = [];
  let at = 0;
  for (const p of pages) {
    result.push(runes.slice(at, at + p.indices.length));
    at += p.indices.length;
  }
  assert.equal(at, runes.length);
  return result;
}

const result = {model:"Two-round GP29×GP29 additive Feistel",
  pages:pages.length, printedWords:lengths.length, runes:source.length,
  claimedOriginalPlaintextRunes:0, seed:"0x33012026",
  trialPerDonor:96, allFourPagePrivatePhases:true, donors:{}};
let firstSample = null;
let positiveNative = null;
for (let donorIndex = 0; donorIndex < controls.length; donorIndex++) {
  const [name] = controls[donorIndex];
  let survivors = 0, minViolations = Infinity, plausiblePages = 0;
  const pageFeasibility = Array.from({length:pages.length}, () => 0);
  for (let trial = 0; trial < 96; trial++) {
    const native = sample(pools[donorIndex]);
    const aligned = splitPages(native);
    if (donorIndex === 0 && trial === 0) positiveNative = aligned;
    let validBook = true, total = 0, possiblePages = 0;
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const original = pages[pageIndex].indices;
      const candidate = aligned[pageIndex];
      const alternatives = [0,1,2,3].map(phase =>
        feasibility(candidate, original, phase));
      const least = Math.min(...alternatives.map(v => v.first + v.second));
      total += least;
      if (alternatives.some(v => v.first === 0 && v.second === 0)) {
        pageFeasibility[pageIndex]++;
        possiblePages++;
      } else validBook = false;
    }
    if (donorIndex === 0 && trial === 0) {
      firstSample = {donor:name, trial, minimumTotalViolations:total,
        feasiblePages:possiblePages};
    }
    survivors += Number(validBook);
    plausiblePages += possiblePages;
    minViolations = Math.min(minViolations, total);
  }
  result.donors[name] = {survivingBooks:survivors,
    minimumTotalViolations:minViolations,
    meanFeasiblePages:plausiblePages / 96,
    neverFeasiblePages:pageFeasibility.filter(n => n === 0).length};
}
assert.deepEqual(Object.fromEntries(Object.entries(result.donors)
  .map(([name, value]) => [name, value.survivingBooks])),
  {Gibran:0, Shakespeare:0, Emerson:0});
assert.deepEqual(Object.fromEntries(Object.entries(result.donors)
  .map(([name, value]) => [name, value.minimumTotalViolations])),
  {Gibran:398, Shakespeare:384, Emerson:383});
assert.deepEqual(firstSample,
  {donor:"Gibran", trial:0, minimumTotalViolations:447, feasiblePages:2});

// Nonlinear all-secret Feistel positives on the EXACT 55-page physical
// structure, including odd fringes and every printed source word slot.
assert(positiveNative);
const originalPositive = [];
let covered = 0;
let wrongPhaseViolations = 0;
for (let index = 0; index < pages.length; index++) {
  const p = positiveNative[index];
  const pg = pages[index].page;
  const enc = encryptPage(p, pg, 0);
  assert.deepEqual(decryptPage(enc, pg, 0), p);
  assert.deepEqual(encryptPage(decryptPage(enc, pg, 0), pg, 0), enc);
  const seen = feasibility(p, enc, 0);
  assert.equal(seen.first + seen.second, 0);
  const wrong = feasibility(p, enc, 1);
  wrongPhaseViolations += wrong.first + wrong.second;
  covered += seen.packets * 4;
  originalPositive.push(...enc);
}
assert.equal(originalPositive.length, source.length);
assert(covered > 12800 && covered <= source.length);
assert(wrongPhaseViolations > 0);
// Independently solved p57 genuinely originated as 95 readable GP runes.
// The same key-independent checker recognizes a known-control Feistel plant.
const solved = gp.pages.find(p => p.page === 57).indices;
assert.equal(solved.length, 95);
const solvedEnc = encryptPage(solved, 57, 0);
assert.deepEqual(decryptPage(solvedEnc, 57, 0), solved);
assert.equal(feasibility(solved, solvedEnc, 0).first, 0);
assert.equal(feasibility(solved, solvedEnc, 0).second, 0);
result.originalLengthNativePlant = {runes:originalPositive.length,
  completePacketRunes:covered, exactRoundTrip:true,
  plaintextCiphertextConstraintsHold:true, wrongPhaseViolations};
result.independentSolvedP57Positive = {runes:solved.length,
  exactRoundTrip:true};
result.firstGibranSourceControl = firstSample;
result.decision =
  "0/288 exact-original-layout source-native English books are compatible " +
  "with any page-private two-round additive GP29 half-block Feistel at any " +
  "independent phase. This is a finite plaintext-register exclusion, " +
  "NOT evidence for an authored four-rune cipher or unknown plaintext.";
console.log(JSON.stringify(result, null, 2));
