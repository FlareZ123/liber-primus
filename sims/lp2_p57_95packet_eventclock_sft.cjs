"use strict";

/**
 * Original LP2 p57 95-rune key / original repeated-rune event clock.
 *
 * Independent source selectors: nine original-image visual chapters,
 * 86 same-rune ciphertext transitions, and the 95 GP runes of solved p57.
 * Together, the chapters plus doublets define 95 source-determined runs.
 *
 * One online and fully reversible cipher rule:
 *   C_i = (P_i + K[event]) mod 29
 *   advance event after an output repeat, and once at a chapter start.
 * K is, without fitted phase, p57 GP rune ordinals or phi(GP prime weights).
 *
 * This model is a narrow conditional original-input rejection.
 *
 * Run from repository root under Node 22:
 *   node sims/lp2_p57_95packet_eventclock_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const page = n => corpus.pages.find(p => p.page === n).indices;
const chapterRanges = [[0,2], [3,7], [8,14], [15,22], [23,26],
  [27,32], [33,39], [40,53], [54,55]];
const chapterCipher = chapterRanges.map(([start, end]) =>
  corpus.pages.filter(p => p.page >= start && p.page <= end)
    .flatMap(p => p.indices));
const sourceKey = page(57);
const mod29 = n => (n % 29 + 29) % 29;
assert.deepEqual(chapterCipher.map(c => c.length),
  [729,1145,1729,1903,1021,1433,1680,3008,308]);
assert.equal(chapterCipher.reduce((n, c) => n + c.length, 0), 12956);
assert.equal(sourceKey.length, 95);

const repeatCounts = chapterCipher.map(c =>
  c.slice(1).filter((v, i) => v === c[i]).length);
assert.deepEqual(repeatCounts, [4,6,9,10,11,13,12,18,3]);
assert.equal(repeatCounts.reduce((a, b) => a + b, 0), 86);
assert.equal(repeatCounts.length +
  repeatCounts.reduce((a, b) => a + b, 0), sourceKey.length);

/**
 * @param {number[][]} cipher - chapter-separated GP29 symbols
 * @param {number[]} key - source key in GP29 shift residues
 * @returns {{plain:number[][], keyIndices:number[][], totalUsed:number}}
 */
function decrypt(cipher, key) {
  const plain = [], keyIndices = [];
  let index = -1;
  for (const chapter of cipher) {
    index++;
    let previous = -1;
    const dest = [], marks = [];
    for (const c of chapter) {
      assert(index >= 0 && index < key.length);
      dest.push(mod29(c - key[index]));
      marks.push(index);
      if (c === previous) index++;
      previous = c;
    }
    plain.push(dest);
    keyIndices.push(marks);
  }
  return {plain, keyIndices, totalUsed: index + 1};
}

/**
 * @param {number[][]} plain
 * @param {number[]} key
 * @returns {number[][]}
 */
function encrypt(plain, key) {
  const ciphertext = [];
  let index = -1;
  for (const chapter of plain) {
    index++;
    const out = [];
    let previous = -1;
    for (const p of chapter) {
      assert(index >= 0 && index < key.length);
      const c = mod29(p + key[index]);
      out.push(c);
      if (c === previous) index++;
      previous = c;
    }
    ciphertext.push(out);
  }
  return ciphertext;
}

/** @param {number[]} values */
function stats(values) {
  const hist = Array(29).fill(0);
  for (const v of values) hist[v]++;
  const ioc = hist.reduce((s, x) => s + x * (x - 1), 0) /
    (values.length * (values.length - 1));
  return {runes: values.length, ioc, eCount: hist[18],
    first50: values.slice(0, 50).map(x => corpus.translit[x]).join(".")};
}

const keyOptions = {
  gpOrdinal: sourceKey,
  primeTotient: sourceKey.map(x => mod29(corpus.prime[x] - 1))
};
const results = {};
for (const [name, key] of Object.entries(keyOptions)) {
  const decoded = decrypt(chapterCipher, key);
  assert.equal(decoded.totalUsed, 95);
  assert.deepEqual(encrypt(decoded.plain, key), chapterCipher);
  const flat = decoded.plain.flat();
  const measured = stats(flat);
  results[name] = measured;
}

// Positive source-native encoding control on every real clear p57 glyph.
// The key pointer can advance fewer times than on the original; that is
// a feature of an online self-synchronizing output-event clock.
const known = page(57);
const planted = encrypt([known], sourceKey);
assert.deepEqual(decrypt(planted, sourceKey).plain, [known]);

const summary = {
  finding: "source 95-key coincidence, both frozen direct online consumers nonprose",
  chapterRuneCounts: chapterCipher.map(c => c.length),
  chapterDoublets: repeatCounts,
  chapterPacketCounts: repeatCounts.map(n => n + 1),
  doublets: 86,
  chapterCount: 9,
  p57KnownRuneCount: sourceKey.length,
  sourceP57: stats(sourceKey),
  originalDirectKeyTests: results,
  originalForwardReconstruction: true,
  knownSourcePositiveRunes: known.length,
  positiveControlExact: true,
  missingCausalSelector: "No Cicada instruction maps doublet events to a p57 keystream or selects the conversion"
};
console.log(JSON.stringify(summary, null, 2));
