"use strict";

/**
 * Source-locked original-cipher test: the signed 2016 tree's 563x569
 * dimensions select the row and column GP-prime sums of the natural
 * 11x11 layout of physical LP2 page32. Exactly two unknown printed
 * words sum to those dimensions, on physical pages 0 and 1.
 *
 * This tests the reverse of the existing two-word->p32 key direction:
 * p32's full top row/left column as cyclic GP29 Vigenere keys on the
 * complete original p0/p1 ciphertext, with a clock reset at page start.
 * The 2014 "let the text guide you" onion is the historical precedent
 * for a source-supplied GP29 key; no original clue authenticates this
 * particular row/column-to-page transfer or a secret key.
 *
 * SFT: node sims/lp2_dim563_569_p32_rowcol_p0p1_inverse_sft.cjs
 * @module lp2_dim563_569_p32_rowcol_p0p1_inverse_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const text = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");

const index = new Map(corpus.runes.map((r, i) => [r, i]));
const runePages = text.split(/\s*%\s*/);
assert.equal(runePages.length, 57);

/** @param {string} source */
function parseWords(source) {
  const tokens = source.replace(/\s/g, "").replaceAll("/", "")
    .match(/\p{Script=Runic}+/gu) || [];
  return tokens.map(token => [...token].map(rune => {
    assert.ok(index.has(rune));
    return index.get(rune);
  }));
}
const pages = runePages.map(parseWords);
const widthWord = pages[0][5];
const heightWord = pages[1][32];
const primeSum = digits => digits.reduce(
  (sum, digit) => sum + corpus.prime[digit], 0);
const translit = digits => digits.map(d => corpus.translit[d]).join("");
assert.deepEqual([primeSum(widthWord), primeSum(heightWord)], [563, 569]);
assert.deepEqual([widthWord.length, heightWord.length], [11, 10]);
assert.equal(translit(widthWord), "NEWBASOEEOINGU");
assert.equal(translit(heightWord), "JFINIACYEAIIA");

const p32 = corpus.pages.find(page => page.page === 32).indices;
assert.equal(p32.length, 121);
const widthKey = p32.slice(0, 11);
const heightKey = Array.from({length: 11}, (_, r) => p32[11 * r]);
assert.deepEqual([primeSum(widthKey), primeSum(heightKey)], [563, 569]);
assert.deepEqual([widthKey[0], heightKey[0]], [20, 20]);
assert.equal(corpus.prime[20] - corpus.prime[5], 60);
assert.equal(primeSum(widthKey) - 60, 503);
assert.equal(primeSum(heightKey) - 60, 509);

const mod29 = n => ((n % 29) + 29) % 29;
/** @param {number[]} values @param {number[]} key @param {-1|1} sign */
function transform(values, key, sign) {
  return values.map((digit, i) => mod29(digit + sign * key[i % key.length]));
}
/** @param {number[]} values */
function ioc(values) {
  const frequencies = Array(29).fill(0);
  for (const v of values) frequencies[v]++;
  return frequencies.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

const native = corpus.pages.find(page => page.page === 57).indices;
assert.equal(native.length, 95);
assert.ok(ioc(native) > 0.06);
const output = [];
for (const [pageNumber, expectedKey] of [[0, "width"], [1, "height"]]) {
  const cipher = corpus.pages[pageNumber].indices;
  assert.equal(cipher.length, pageNumber === 0 ? 262 : 266);
  for (const [keyName, key] of [["width", widthKey], ["height", heightKey]])
    for (const sign of [-1, 1]) {
      const plain = transform(cipher, key, sign);
      assert.deepEqual(transform(plain, key, -sign), cipher);
      const planted = Array.from({length: cipher.length},
        (_, i) => native[i % native.length]);
      assert.deepEqual(
        transform(transform(planted, key, -sign), key, sign), planted);
      output.push({
        page: pageNumber,
        key: keyName,
        sourceSelected: keyName === expectedKey,
        sign,
        ciphertextIoC: ioc(cipher),
        recoveredIoC: ioc(plain),
        plantedNativeIoC: ioc(planted),
        preview: translit(plain.slice(0, 45))
      });
    }
}
// These exact original-source results are numerical regression checks.
// Invertibility of every variant is an implementation test, not proof
// that the creator supplied the corresponding transformation.
const selected = output.filter(candidate => candidate.sourceSelected);
const expectedIoCs = [
  0.03381006697668977, 0.03383931443947237,
  0.03518229536104412, 0.03535253227408143
];
assert.equal(selected.length, 4);
selected.forEach((entry, i) =>
  assert.ok(Math.abs(entry.recoveredIoC - expectedIoCs[i]) < 1e-12));
assert.ok(selected.every(x => x.recoveredIoC < 0.04));

console.log(JSON.stringify({
  sources: {
    firstImage2012: [509, 503],
    signedTreeImage2016: [563, 569],
    sourceWordSumSelectors: [563, 569],
    p32DimensionKeys: [translit(widthKey), translit(heightKey)],
    singleCornerPrime73To13: {originalRune: "L", replacementRune: "C",
      originalPrime: 73, replacementPrime: 13, difference: 60}
  },
  originalCandidates: output,
  result: "No original p0/p1 native-GP prose or authenticated key"
}, null, 2));
