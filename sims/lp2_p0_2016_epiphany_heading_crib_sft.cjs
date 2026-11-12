"use strict";

/**
 * SFT: 2016 verified "epiphany seeks" matched to p0's source-red 8-5 heading.
 *
 * A later signed Cicada message gives the words "epiphany seeks" in that
 * order; the original LP2 p0 heading independently has two red words with
 * exactly 8 and 5 GP runes. This freezes ONE possible crib, not an accepted
 * plaintext or a source-defined cipher. Infer the additive Vigenere pad
 * from those 13 runes; test its direct/Atbash 13-rune repetition on complete
 * original p0-p2 material, without fitting any additional secret or phase.
 *
 * Original message: resources/historical/cicada2016-4gq25-outguess.asc
 * Original rune text: resources/liber-primus/lp2-corpus.json
 * Printed first-line register: resources/lp2-transcription.txt
 *
 * Run: node sims/lp2_p0_2016_epiphany_heading_crib_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const source2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
assert.ok(source2016.includes("The path lies empty; epiphany seeks the devoted."));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const first = read("resources/lp2-transcription.txt").split("\n")[0];
const title = first.split(".")[0].split("-").map((s) => [...s]);
assert.deepEqual(title.map((w) => w.length), [8, 5]);
assert.deepEqual(corpus.pages.slice(0, 3).map((p) => p.indices.length),
  [262, 266, 201]);
const total = corpus.pages.slice(0, 3).reduce((n, p) => n + p.indices.length, 0);
assert.equal(total, 729);

const tokens = corpus.translit.map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);
const mod = (n) => ((n % 29) + 29) % 29;

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase().replace(/K/g, "C")
    .replace(/V/g, "U").replace(/Q/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const selected = tokens.find((t) => normalized.startsWith(t.symbol, i));
    assert.ok(selected, "Unmapped GP29 letter at " + i);
    out.push(selected.value);
    i += selected.symbol.length;
  }
  return out;
}

/** @param {number[]} indices @returns {string} */
const latin = (indices) => indices.map((i) => corpus.translit[i]).join("");
/** @param {number[]} arr @returns {number} */
function pairs(arr) {
  const freq = new Uint16Array(29);
  for (const i of arr) freq[i]++;
  return freq.reduce((sum, n) => sum + n * (n - 1), 0);
}
/** @param {number[]} arr @returns {number} */
const ioc = (arr) => pairs(arr) / (arr.length * (arr.length - 1));

const plaintext = [...gp("EPIPHANY"), ...gp("SEEKS")];
assert.equal(plaintext.length, 13);
assert.deepEqual([gp("EPIPHANY").length, gp("SEEKS").length], [8, 5]);
const ciphertext = corpus.pages[0].indices.slice(0, 13);
const key = ciphertext.map((v, i) => mod(v - plaintext[i]));
const atbashKey = ciphertext.map((v, i) => mod(28 - v - plaintext[i]));
assert.deepEqual(key, [26, 24, 8, 19, 27, 24, 18, 3, 0, 8, 0, 16, 19]);
const keyPrimeSum = key.reduce((sum, v) => sum + corpus.prime[v], 0);
assert.equal(keyPrimeSum, total);

/** @param {number[]} src @param {number[]} pad @param {boolean} atbash */
function decrypt(src, pad, atbash) {
  return src.map((v, i) => mod((atbash ? 28 - v : v) - pad[i % pad.length]));
}
assert.deepEqual(decrypt(ciphertext, key, false), plaintext);
assert.deepEqual(decrypt(ciphertext, atbashKey, true), plaintext);
assert.equal(latin(plaintext), "EPIPHANYSEECS");

const results = [];
for (const [model, pad, atbash] of [
  ["additive", key, false],
  ["atbash-additive", atbashKey, true]
]) {
  const starts = corpus.pages.slice(0, 3).map((p, i) =>
    i === 0 ? p.indices.slice(13) : p.indices);
  let globalOffset = 0;
  for (let page = 0; page < 3; page++) {
    const source = starts[page];
    for (const phase of [...new Set([0, globalOffset % 13])]) {
      const rotated = pad.map((_, i) => pad[(i + phase) % 13]);
      const out = decrypt(source, rotated, atbash);
      const n = ioc(out);
      assert.ok(n < 0.04);
      results.push({
        page, model, phase, runes: out.length, ioc: n,
        first60: latin(out.slice(0, 60))
      });
    }
    globalOffset += source.length;
  }
}

// Observe exactness of the prime-sum coincidence without claiming a target
// number selected in advance: scan every 13-symbol window on the complete
// original unknown ciphertext with this fixed external-source phrase.
const book = corpus.pages.slice(0, 56).flatMap((p) => p.indices);
const matchOffsets = [];
for (let start = 0; start + 13 <= book.length; start++) {
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += corpus.prime[mod(book[start + i] - plaintext[i])];
  }
  if (sum === 729) matchOffsets.push(start);
}
assert.equal(book.length, 12956);
assert.equal(matchOffsets.length, 51);
assert.equal(matchOffsets[0], 0);
assert.equal(matchOffsets[1], 178);

// Second independent source comparison: three distinct red-title word-shapes
// are each found exactly once as a contiguous phrase in the signed 2016 note.
// This is an exploratory POST-selection pattern, so compare with pinned
// ordinary prose controls. No claimed plaintext or title is inferred here.
const messageWords = source2016.split("Hello.")[1]
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .match(/[A-Za-z]+/g) || [];
assert.equal(messageWords.length, 44);
const shape = (words) => words.map((word) => gp(word).length);
const shapePatterns = [[8, 5], [4, 2, 5], [3, 5]];

/** @param {string[]} words @param {number[]} pattern @returns {string[]} */
function phraseMatches(words, pattern) {
  const lengths = shape(words);
  const out = [];
  for (let i = 0; i + pattern.length <= words.length; i++) {
    if (pattern.every((n, j) => lengths[i + j] === n)) {
      out.push(words.slice(i, i + pattern.length)
        .join(" ").toLowerCase());
    }
  }
  return out;
}
const signedShapeMatches = shapePatterns.map((pattern) =>
  phraseMatches(messageWords, pattern));
assert.deepEqual(signedShapeMatches,
  [["epiphany seeks"], ["will be found"], ["its words"]]);

const candidateTitles = [
  {page: 0, start: 0, words: ["EPIPHANY", "SEEKS"]},
  {page: 15, start: 9, words: ["WILL", "BE", "FOUND"]},
  {page: 33, start: 91, words: ["ITS", "WORDS"]},
  {page: 40, start: 0, words: ["ITS", "WORDS"]}
];
const pagePrefix = corpus.pages.map((page, i) =>
  corpus.pages.slice(0, i).reduce((sum, p) => sum + p.indices.length, 0));
const anchorKeys = [];
for (const item of candidateTitles) {
  const decoded = item.words.flatMap(gp);
  const ctext = corpus.pages[item.page].indices.slice(item.start,
    item.start + decoded.length);
  assert.equal(ctext.length, decoded.length);
  decoded.forEach((value, i) => anchorKeys.push({
    page: item.page,
    global: pagePrefix[item.page] + item.start + i,
    key: mod(ctext[i] - value)
  }));
}
assert.equal(anchorKeys.length, 40);

/** @param {number} period */
function bestGlobalPeriodAgreement(period) {
  const bins = new Map();
  for (const item of anchorKeys) {
    const rem = item.global % period;
    if (!bins.has(rem)) bins.set(rem, new Map());
    const counts = bins.get(rem);
    counts.set(item.key, (counts.get(item.key) || 0) + 1);
  }
  const matches = [...bins.values()].reduce((sum, m) =>
    sum + Math.max(...m.values()), 0);
  return {period, matches, occupied: bins.size};
}
const phaseTests = [8, 13, 14, 16, 27, 29]
  .map(bestGlobalPeriodAgreement);
assert.deepEqual(phaseTests.map((t) => t.matches),
  [11, 15, 14, 17, 20, 28]);
assert.deepEqual(phaseTests.map((t) => t.occupied),
  [8, 13, 14, 16, 19, 27]);

/** @param {string[]} words */
function countFullShapeMatches(words) {
  const length = 44;
  const ls = shape(words);
  const windows = Math.max(0, ls.length - length + 1);
  const mask = shapePatterns.map((p) =>
    Uint8Array.from(ls, (_, i) =>
      Number(p.every((value, k) => ls[i + k] === value))));
  let matching = 0;
  for (let i = 0; i < windows; i++) {
    let complete = true;
    for (let k = 0; k < mask.length; k++) {
      let found = false;
      for (let j = i; j < i + length - shapePatterns[k].length + 1; j++) {
        if (mask[k][j]) { found = true; break; }
      }
      if (!found) { complete = false; break; }
    }
    if (complete) matching++;
  }
  return {words: ls.length, windows, matching};
}
const controls = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 190],
  ["Emerson", "resources/control/emerson_essays_2944.txt", 276],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 624]
].map(([name, file, expected]) => {
  const words = (read(file).match(/[A-Za-z]+/g) || []).slice(0, 35000);
  const result = countFullShapeMatches(words);
  assert.equal(result.matching, expected);
  return {name, ...result};
});
assert.equal(countFullShapeMatches(messageWords).matching, 1);

console.log(JSON.stringify({
  sourcePhrase: "EPIPHANY SEEKS",
  signedShapeMatches,
  sourceTitleCandidateCount: candidateTitles.length,
  crossTitleGlobalPeriodChecks: phaseTests,
  baseline44WordShapeWindowCounts: controls,
  firstHeadingGpLengths: [8, 5],
  originalHeading: latin(ciphertext),
  hypothesizedPlainHeading: latin(plaintext),
  impliedAdditiveKey: latin(key),
  impliedKeyPrimeSum: keyPrimeSum,
  firstThreePageRuneCount: total,
  originalWindowsWithSameKeyPrimeSum: matchOffsets.length,
  originalWindowsScanned: book.length - 12,
  originalBodyTests: results,
  conclusion: "Bounded source-phrase candidate. Repeating either inferred 13-rune " +
    "additive or Atbash key does not recover native GP29 prose on p0-p2; " +
    "729 is a non-unique source-number coincidence, not an authenticated key."
}, null, 2));
