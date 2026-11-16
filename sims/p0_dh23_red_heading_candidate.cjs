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
const physicalOverride = JSON.parse(read("resources/liber-primus/lp2-p0-physical-ink-override.json"));

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
const physical = physicalOverride.physical_zero_based;
assert.equal(physical.red_runes[0].length, 8);
assert.equal(physical.large_punctuation[0].after_runes, 8);
assert.equal(physical.black_following_runes[0].length, 5);

const opening = corpus.pages[0].indices.slice(0, 13);
const postPeriodSeven = corpus.pages[0].indices.slice(13, 20);
assert.equal(opening.length, 13);
assert.equal(postPeriodSeven.length, 7);

const N = base29(opening);
const M = base29(postPeriodSeven);
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
assert.equal(opening.at(-1), 5); // matches the source DH base
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


// Conditional transfer gate: reuse the solved p56 prime-totient subtractor,
// with the p0 DH shared secret 18 interpreted as a prime-sequence start.
// This is a hypothesis test, not an assertion that p56's cipher applies to p0.
function firstPrimes(count) {
  const out = [];
  for (let candidate = 2; out.length < count; candidate++) {
    let isPrime = true;
    for (const p of out) {
      if (p * p > candidate) break;
      if (candidate % p === 0) { isPrime = false; break; }
    }
    if (isPrime) out.push(candidate);
  }
  return out;
}
function indexOfCoincidence(indices) {
  const counts = Array(29).fill(0);
  for (const value of indices) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (indices.length * (indices.length - 1));
}
const primeSequence = firstPrimes(400);
const p0BodyStart = opening.length + postPeriodSeven.length;
const p0Body = corpus.pages[0].indices.slice(p0BodyStart);
assert.equal(p0BodyStart, 20);
assert.equal(p0Body.length, 242);
assert.equal(primeSequence[17], 61);
assert.equal(primeSequence[18], 67);
function decodeP0WithTotientStart(startOrdinal) {
  return p0Body.map((cipher, i) => {
    const shift = (primeSequence[startOrdinal - 1 + i] - 1) % 29;
    return (cipher - shift + 29) % 29;
  });
}
function encodeP0WithTotientStart(plain, startOrdinal) {
  return plain.map((value, i) => {
    const shift = (primeSequence[startOrdinal - 1 + i] - 1) % 29;
    return (value + shift) % 29;
  });
}
const p0TotientVariants = [18, 19].map((startOrdinal) => {
  const decoded = decodeP0WithTotientStart(startOrdinal);
  assert.deepEqual(encodeP0WithTotientStart(decoded, startOrdinal), p0Body);
  return {
    startPrimeOrdinal: startOrdinal,
    firstPrime: primeSequence[startOrdinal - 1],
    firstShift: (primeSequence[startOrdinal - 1] - 1) % 29,
    ioc: indexOfCoincidence(decoded),
    output: translit(decoded)
  };
});
const p56CipherForControl = corpus.pages.find((page) => page.page === 56).indices;
let p56ClockForControl = 0;
const p56PlainForControl = p56CipherForControl.map((cipher, i) => {
  if (i === 56) return cipher;
  const shift = (primeSequence[p56ClockForControl++] - 1) % 29;
  return (cipher - shift + 29) % 29;
});
assert.equal(p56ClockForControl, 84);
const p57PlainForControl = corpus.pages.find((page) => page.page === 57).indices;
const p0TotientTransfer = {
  operation: "plain[i] = cipher[i] - (prime[startOrdinal+i]-1) mod 29",
  keyInterpretation: "DH shared secret 18 as one-based prime ordinal; adjacent zero-based offset convention tested",
  p0BodyStart,
  p0BodyLength: p0Body.length,
  rawIoc: indexOfCoincidence(p0Body),
  variants: p0TotientVariants,
  solvedControls: {
    p56PlainLength: p56PlainForControl.length,
    p56PlainIoc: indexOfCoincidence(p56PlainForControl),
    p57PlainLength: p57PlainForControl.length,
    p57PlainIoc: indexOfCoincidence(p57PlainForControl)
  },
  roundTripsExact: true,
  conclusion: "No readable p0 plaintext; this rejects only direct p56-clock transfer, not the provisional DH key derivation."
};

console.log(JSON.stringify({
  openingPhrase: { indices: opening, transliteration: translit(opening), base29: N.toString(),
    mod23: Number(N % 23n), mod22: exponent, finalDigit: opening.at(-1) },
  postPeriodSeven: { indices: postPeriodSeven, transliteration: translit(postPeriodSeven),
    base29: M.toString(), mod23: Number(clientPublic), length: postPeriodSeven.length },
  dh23: { p: 23, base: 5, serverExponent: exponent, serverPublic: Number(serverPublic),
    clientPublic: Number(clientPublic), clientExponent, sharedSecret: Number(shared),
    groupOrder: p0GroupOrder },
  selectorControl: { scannedWindows, hits: selectorHits, selectorWasPostselected: true },
  conditionalWordMap: { p18w7, sum343WordCount: sum343Words.length,
    onlySevenRuneSum343: sum343Words.filter((x) => x.length === 7).map((x) => [x.page, x.wordNumber]),
    p53w6, next: p18w5 },
  dhTo27x27: { center, node: translit(node), key: translit(key), predictedStart,
    ciphertext: translit(ciphertextBlock), decrypted: translit(decryptedBlock) },
  p0TotientTransfer,
  conclusion: "candidate DH key derivation only; no symmetric LP2 cipher or plaintext recovered"
}, null, 2));
