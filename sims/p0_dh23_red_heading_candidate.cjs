#!/usr/bin/env node
"use strict";

// Reproduce the exploratory p0 BASE29 / 2013 DH23 candidate.
// Run from the repository root:
//   node sims/p0_dh23_red_heading_candidate.cjs
//
// This tests a source-motivated key derivation, not a recovered LP2 cipher.

const fs = require("node:fs");
const assert = require("node:assert/strict");

const read = (p) => fs.readFileSync(p, "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const annotations = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));

function base29(digits) {
  return digits.reduce((n, d) => n * 29n + BigInt(d), 0n);
}
function modPow(a, e, m) {
  let out = 1n;
  while (e > 0n) {
    if (e & 1n) out = out * a % m;
    a = a * a % m;
    e >>= 1n;
  }
  return out;
}
function phi(n) {
  let out = n;
  for (let p = 2; p * p <= n; p++) {
    if (n % p === 0) {
      while (n % p === 0) n /= p;
      out -= out / p;
    }
  }
  if (n > 1) out -= out / n;
  return out;
}
function multiplicativeOrder(g, p) {
  let x = 1n;
  for (let k = 1; k <= p - 1; k++) {
    x = x * g % p;
    if (x === 1n) return k;
  }
  return null;
}
function discreteLog(g, target, p) {
  let x = 1n;
  for (let k = 0; k < p - 1; k++) {
    if (x === target) return k;
    x = x * g % p;
  }
  return null;
}
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const translit = (indices) => indices.map((i) => corpus.translit[i]).join("-");

assert.equal(corpus.pages.length, 58);
const p0Red = annotations.pages.find((p) => p.page === 0).red_spans
  .find((s) => s.start === 0 && s.length === 13);
assert(p0Red, "expected 13-rune red p0 heading at offset 0");

const heading = corpus.pages[0].indices.slice(p0Red.start, p0Red.start + p0Red.length);
const firstBlackLine = corpus.pages[0].indices.slice(13, 20);
assert.equal(heading.length, 13);
assert.equal(firstBlackLine.length, 7);

const N = base29(heading);
const M = base29(firstBlackLine);
const p = 23n;
const g = 5n;
const exponent = Number(N % (p - 1n));
const serverPublic = modPow(g, BigInt(exponent), p);
const clientPublic = M % p;
assert.notEqual(clientPublic, 0n, "DH public share must be nonzero");
const shared = modPow(clientPublic, BigInt(exponent), p);
const p0GroupOrder = multiplicativeOrder(g, p);
const clientExponent = discreteLog(g, clientPublic, p);

assert.equal(N.toString(), "5412445423142629857");
assert.equal(M.toString(), "1420123033");
assert.equal(N % 23n, 0n); // additional residue, not required by DH
assert.equal(exponent, 7);
assert.equal(heading.at(-1), 5); // matches the source DH base
assert.equal(clientPublic, 16n);
assert.equal(serverPublic, 17n);
assert.equal(shared, 18n);
assert.equal(p0GroupOrder, 22);
assert.equal(clientExponent, 8); // 16 = 5^8 mod 23

// Finite control: search every page-local 13-rune window on LP2 pages 0–55.
let scannedWindows = 0;
const selectorHits = [];
for (const page of corpus.pages.filter((p) => p.page <= 55)) {
  for (let start = 0; start + 13 <= page.indices.length; start++) {
    scannedWindows++;
    const digits = page.indices.slice(start, start + 13);
    const value = base29(digits);
    if (value % 23n === 0n && value % 22n === 7n && digits.at(-1) === 5) {
      selectorHits.push({ page: page.page, start });
    }
  }
}
assert.deepEqual(selectorHits, [{ page: 0, start: 0 }]);

const redSpanDivisibleBy23 = [];
for (const page of annotations.pages) {
  for (const span of page.red_spans || []) {
    const digits = corpus.pages[page.page].indices.slice(span.start, span.start + span.length);
    const value = base29(digits);
    if (value % 23n === 0n) {
      redSpanDivisibleBy23.push({
        page: page.page, start: span.start, length: span.length,
        mod22: Number(value % 22n), finalDigit: digits.at(-1)
      });
    }
  }
}

// Use the same canonical printed-word parser as the provisional 2016 map.
const printedSource = read("resources/lp2-transcription.txt").split("%");
assert.equal(printedSource.length, 57);
function printedWords(page) {
  const source = page.replaceAll("/", "").replaceAll("\n", "").replaceAll("\r", "");
  return source.split(/[-.&$§,:!?]/u)
    .map((piece) => (piece.match(/[ᚠ-᛿]+/gu) || []).join(""))
    .filter(Boolean);
}
const wordsByPage = Array.from({ length: 58 }, (_, page) =>
  page === 50 ? [] : printedWords(printedSource[page > 50 ? page - 1 : page])
);
assert.equal(wordsByPage.reduce((n, page) => n + page.length, 0), 2973);
function wordInfo(page, wordIndex) {
  const runes = wordsByPage[page][wordIndex];
  const indices = [...runes].map((r) => runeIndex.get(r));
  assert(indices.every(Number.isInteger));
  const primeWeights = indices.map((i) => corpus.prime[i]);
  return {
    page, wordIndex, wordNumber: wordIndex + 1, runes,
    transliteration: translit(indices), length: indices.length,
    primeWeights, primeSum: primeWeights.reduce((a, b) => a + b, 0)
  };
}
const p18w7 = wordInfo(18, 6);
assert.equal(p18w7.transliteration, "G-A-H-EA-L-G-O");
assert.equal(p18w7.length, 7);
assert.equal(p18w7.primeSum, 343);
const sum343Words = [];
for (let page = 0; page < wordsByPage.length; page++) {
  for (let wordIndex = 0; wordIndex < wordsByPage[page].length; wordIndex++) {
    const info = wordInfo(page, wordIndex);
    if (info.primeSum === 343) sum343Words.push(info);
  }
}
assert.equal(sum343Words.length, 5);
assert.deepEqual(sum343Words.filter((x) => x.length === 7).map((x) => [x.page, x.wordNumber]), [[18, 7]]);

// The other red spans divisible by 23 are negative DH controls under the same reading.
const p15Red = annotations.pages.find((p) => p.page === 15).red_spans
  .find((s) => s.start === 0);
const p15Digits = corpus.pages[15].indices.slice(p15Red.start, p15Red.start + p15Red.length);
const p15Base = BigInt(p15Digits.at(-1)) % p;
const p15Order = multiplicativeOrder(p15Base, p);

const p33Red = annotations.pages.find((p) => p.page === 33).red_spans
  .find((s) => s.start === 0);
const p33Digits = corpus.pages[33].indices.slice(p33Red.start, p33Red.start + p33Red.length);
const p33Value = base29(p33Digits);
const p33Base = BigInt(p33Digits.at(-1)) % p;
const p33Exponent = p33Value % 22n;
const p33Raw = printedSource[33];
const p33FirstBlackLineText = (p33Raw.split(".")[1] || "").split("/")[0] || "";
const p33FirstBlackLine = [...(p33FirstBlackLineText.match(/[ᚠ-᛿]/gu) || [])]
  .map((r) => runeIndex.get(r));
assert.equal(p33FirstBlackLine.length, 8);
const p33M = base29(p33FirstBlackLine);
const p33ClientPublic = p33M % p;
const p33Order = multiplicativeOrder(p33Base, p);
const p33Subgroup = new Set();
let subgroupValue = 1n;
for (let k = 0; k < Number(p33Order); k++) {
  p33Subgroup.add(subgroupValue.toString());
  subgroupValue = subgroupValue * p33Base % p;
}
assert.equal(p15Base, 1n);
assert.equal(p15Order, 1);
assert.equal(p33Base, 6n);
assert.equal(p33Exponent, 21n);
assert.equal(p33M.toString(), "220096403606");
assert.equal(p33ClientPublic, 10n);
assert.equal(p33Order, 11);
assert.equal(p33Subgroup.has("10"), false);

// Conditional use of the provisional 2016 base-58 word-pointer rule.
const p53w6 = wordInfo(343 % 58, Math.floor(343 / 58));
const p53Next = {
  page: p53w6.primeSum % 58,
  wordIndex: Math.floor(p53w6.primeSum / 58)
};
const p18w5 = wordInfo(p53Next.page, p53Next.wordIndex);
assert.equal(p53w6.transliteration, "D-OE-E-R");
assert.equal(p53w6.primeSum, 250);
assert.equal(p18w5.transliteration, "I-D-J");

// Frozen DH→27×27 continuation test: (shared, exponent) as row18/column7.
const opening = corpus.pages.slice(0, 3).flatMap((page) => page.indices);
const center = (18 - 1) * 27 + (7 - 1); // zero-based center cell, row 18 col 7
const node = opening.slice(center - 1, center + 2);
const key = node.slice();
key[1] = phi(node[1]);
const predictedStart = center + 13; // same +13 center-to-block displacement as opening block
const ciphertextBlock = opening.slice(predictedStart, predictedStart + 7);
const decryptedBlock = ciphertextBlock.map((v, i) => (v - key[i % 3] + 29) % 29);
assert.deepEqual(node, [26, 14, 23]); // Y-X-D
assert.deepEqual(key, [26, 6, 23]); // Y-G-D
assert.equal(predictedStart, 478);
assert.equal(translit(ciphertextBlock), "N-P-A-Y-P-C-Y");
assert.equal(translit(decryptedBlock), "EO-W-U-F-W-J-F");

console.log(JSON.stringify({
  heading: { indices: heading, transliteration: translit(heading), base29: N.toString(),
    mod23: Number(N % 23n), mod22: exponent, finalDigit: heading.at(-1) },
  firstBlackLine: { indices: firstBlackLine, transliteration: translit(firstBlackLine),
    base29: M.toString(), mod23: Number(clientPublic), length: firstBlackLine.length },
  dh23: { p: 23, base: 5, serverExponent: exponent, serverPublic: Number(serverPublic),
    clientPublic: Number(clientPublic), clientExponent, sharedSecret: Number(shared),
    groupOrder: p0GroupOrder },
  selectorControl: { scannedWindows, hits: selectorHits, redSpanDivisibleBy23 },
  alternateRedSpanControls: {
    p15: { base: Number(p15Base), groupOrder: p15Order },
    p33: { base: Number(p33Base), exponent: Number(p33Exponent),
      firstBlackLine: translit(p33FirstBlackLine), firstBlackLineLength: p33FirstBlackLine.length,
      publicShare: Number(p33ClientPublic), groupOrder: p33Order,
      generatedSubgroup: [...p33Subgroup], shareInSubgroup: p33Subgroup.has(p33ClientPublic.toString()) }
  },
  conditionalWordMap: { p18w7, sum343WordCount: sum343Words.length,
    onlySevenRuneSum343: sum343Words.filter((x) => x.length === 7).map((x) => [x.page, x.wordNumber]),
    p53w6, next: p18w5 },
  dhTo27x27: { center, node: translit(node), key: translit(key), predictedStart,
    ciphertext: translit(ciphertextBlock), decrypted: translit(decryptedBlock) },
  conclusion: "candidate DH key derivation only; no symmetric LP2 cipher or plaintext recovered"
}, null, 2));
