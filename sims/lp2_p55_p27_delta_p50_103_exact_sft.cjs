"use strict";

/**
 * Source-locked p55 terminal-footer navigation, p27 following-rune differences,
 * and the 103rd original p50 cell as two concrete candidate key consumers.
 * No plaintext or authentic decipherment key is claimed.
 *
 * SFT (Windows 11, Node.js 22): node sims/lp2_p55_p27_delta_p50_103_exact_sft.cjs
 * Read-only source and controls. This script does not fetch or write files.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} =
  require("./lp2_native_gp_source_orthography_sft.cjs");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const page = n => corpus.pages.find(p => p.page === n).indices;
const wing = page(27), moth = page(55), clear = page(57);
const mod = x => (x % 29 + 29) % 29;
assert.equal(wing.length, 234);
assert.equal(moth.length, 76);
assert.equal(clear.length, 95);
assert.deepEqual(moth.slice(-6), wing.slice(28, 34));
assert.deepEqual(wing.slice(34, 36), [25, 0]);
assert.equal(corpus.prime[25] + corpus.prime[0], 103);
assert.equal(page(55).length - 6, 70);
const tableCells = table.rows.flat(), tableBytes = table.byte_rows.flat();
assert.equal(tableCells.length, 256);
assert.deepEqual(tableCells.slice(102, 104), ["0W", "3Q"]);
assert.deepEqual(tableBytes.slice(102, 104), [32, 206]);
const original = moth.slice(0, 70);
const deltaKey = wing.slice(34, 104).map((r, i) =>
  mod(r - wing[33 + i]));
const grid103Key = tableBytes.slice(102, 172).map(x => x % 29);
assert.equal(deltaKey.length, 70);
assert.equal(grid103Key.length, 70);
const Fpositions = original.flatMap((x, i) => x === 0 ? [i] : []);
assert.deepEqual(Fpositions, [15, 25, 41]);

/** @param {number[]} x */
function ioc(x) {
  const count = Array(29).fill(0);
  x.forEach(n => { count[n]++; });
  return count.reduce((sum, n) => sum + n * (n - 1), 0) /
    (x.length * (x.length - 1));
}

/**
 * The source-authenticated LP1/p56 plaintext-F bypass, conditionally
 * transplanted to an unknown LP2 page. Returns the first contradiction.
 * For each ciphertext F, an independently chosen mask can bypass without
 * consuming a key value; no other ciphertext symbol can contain plaintext F.
 *
 * @param {number[]} key
 * @param {number} sign
 * @param {number} mask
 */
function strictF(key, sign, mask) {
  let ki = 0;
  for (let i = 0; i < original.length; i++) {
    const bit = Fpositions.indexOf(i);
    if (bit >= 0 && (mask & (1 << bit))) continue;
    const deciphered = mod(original[i] + sign * key[ki++]);
    if (deciphered === 0) return i;
  }
  return null;
}
const results = [];
for (const [name, key] of [["wing-delta", deltaKey], ["table-103-byte", grid103Key]]) {
  for (const sign of [-1, 1]) {
    const decoded = original.map((c, i) => mod(c + sign * key[i]));
    const firstFailurePerFmask = Array.from({length: 8}, (_, mask) =>
      strictF(key, sign, mask));
    assert(firstFailurePerFmask.every(n => n !== null));
    const plant = clear.slice(0, 70);
    const encrypted = plant.map((p, i) => mod(p - sign * key[i]));
    assert.deepEqual(encrypted.map((c, i) =>
      mod(c + sign * key[i])), plant);
    results.push({name, sign, initial: corpus.translit[decoded[0]],
      ioc: ioc(decoded), firstFailurePerFmask,
      word13: decoded.slice(23, 36),
      word13Latin: decoded.slice(23, 36).map(i => corpus.translit[i]).join("-")});
  }
}
const lookup = (name, sign) =>
  results.find(r => r.name === name && r.sign === sign);
assert.deepEqual(lookup("wing-delta", -1).firstFailurePerFmask, Array(8).fill(10));
assert.deepEqual(lookup("wing-delta", 1).firstFailurePerFmask, Array(8).fill(1));
assert.deepEqual(lookup("table-103-byte", -1).firstFailurePerFmask, Array(8).fill(5));
assert.deepEqual(lookup("table-103-byte", 1).firstFailurePerFmask,
  [20, 22, 20, 22, 20, 22, 20, 22]);
assert(Math.abs(lookup("wing-delta", 1).ioc - 0.0463768115942029) < 1e-13);
assert(Math.abs(lookup("wing-delta", -1).ioc - 0.02857142857142857) < 1e-13);
assert(Math.abs(lookup("table-103-byte", 1).ioc - 0.03436853002070393) < 1e-13);
assert(Math.abs(lookup("table-103-byte", -1).ioc - 0.036853002070393374) < 1e-13);
assert.equal(lookup("table-103-byte", 1).initial, "A");
assert.equal(lookup("table-103-byte", -1).initial, "E");

// The two page27 keys are frozen at the first whole word after the
// repeated terminal pointer. Check their unrelated intact cyclic phases;
// the source phase is ranked for context, never optimized for a decoder.
const phases = [];
for (let start = 0; start < wing.length; start++) {
  const key = original.map((_, i) =>
    mod(wing[(start + i) % wing.length] -
      wing[(start + i - 1 + wing.length) % wing.length]));
  phases.push({phase: start,
    positive: ioc(original.map((c, i) => mod(c + key[i]))),
    negative: ioc(original.map((c, i) => mod(c - key[i])))});
}
function phaseRank(field) {
  return phases.slice().sort((a, b) =>
    b[field] - a[field] || a.phase - b.phase)
    .findIndex(p => p.phase === 34) + 1;
}
assert.equal(phaseRank("positive"), 2);
assert.equal(phaseRank("negative"), 227);

// Even granting arbitrary unknown shared alphabet on one 13-rune word,
// the original word's exact equality pattern has no match in this
// fixed source-native English lexicon under either wing-delta sign.
function pattern(a) {
  const map = new Map();
  return a.map(x => {
    if (!map.has(x)) map.set(x, map.size);
    return map.get(x).toString(36);
  }).join("");
}
const dictionaryLines = read("resources/control/english_wordfreq_textblob.txt")
  .split(/\r?\n/).filter(line => /^[a-z]+ \d+$/.test(line));
assert.equal(dictionaryLines.length, 29157);
const word13Patterns = new Set(dictionaryLines.map(line =>
  encodeSourceNativeGP(line.split(" ")[0])).filter(w => w.length === 13)
  .map(pattern));
for (const sign of [-1, 1])
  assert(!word13Patterns.has(pattern(lookup("wing-delta", sign).word13)));
console.log(JSON.stringify({
  status: "scoped source-key negatives; no recovered original plaintext",
  anchor: {fromPage: 55, toPage: 27, toRuneOffset: 28,
    followerPrimeSum: 103, gridCellsOneBased: [103, 104],
    cells: tableCells.slice(102, 104)},
  originalFpositions: Fpositions,
  wingDeltaPhaseRanks: {positive: phaseRank("positive"),
    negative: phaseRank("negative"), total: phases.length},
  nativeEnglishDictionary: dictionaryLines.length,
  nativeEnglish13RunePatterns: word13Patterns.size,
  results
}, null, 2));
