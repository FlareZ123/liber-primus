"use strict";

/**
 * Exact, source-gated original LP2 DH23 packet bridge.
 *
 * Source premises (all retained as conditional, not decipherment):
 *   2014 Stage10 real response: /107.jpg, /167.jpg, /229.jpg;
 *   LP2 physical p39's only red three-rune object and its GP-prime sum;
 *   the originally printed 32x8 grid and its literal first and addressed tokens.
 *
 * The following "pack under p" relations are a tested interpretation,
 * NOT a Cicada-authenticated decoding instruction. This test never guesses
 * plaintext, fixes no English language output and does not assert a solve.
 *
 * Windows Node.js 22 / CJS:
 *   node sims/lp2_stage10_p39_p50_dh23_packet_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} relative @returns {string} */
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
/** @param {number} n @returns {number} */
function prime(n) {
  let count = 0;
  for (let x = 2; ; x++) if (isPrime(x) && ++count === n) return x;
}
/** @param {number} base @param {number} exp @param {number} mod @returns {number} */
function power(base, exp, mod) {
  let out = 1;
  let x = base % mod;
  for (let k = exp; k > 0; k = Math.floor(k / 2)) {
    if (k % 2) out = (out * x) % mod;
    x = (x * x) % mod;
  }
  return out;
}
/** @param {string} token @param {string} alphabet @returns {number} */
function radix(token, alphabet) {
  assert.equal(token.length, 2);
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  return hi * alphabet.length + lo;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const firstParty = read("resources/external/2014-stage10-post-square-response.html");
const book = read("resources/liber-primus/lp2-transcription.txt");
const runes = new Map(corpus.runes.map((r, i) => [r, i]));
const allTokens = grid.pages.flatMap((p) => p.tokens);
assert.equal(allTokens.length, 256);
assert.ok(grid.pages.every((p) => p.cols === 8));
assert.equal(grid.alphabet.length, 60);

const images = [...firstParty.matchAll(/\/([0-9]+)\.jpg/g)].map((m) => Number(m[1]));
assert.deepEqual(images, [107, 167, 229]);
const ordinals = images.map((n) => {
  let i = 1;
  while (prime(i) < n) i++;
  assert.equal(prime(i), n);
  return i;
});
assert.deepEqual(ordinals, [28, 39, 50]);
const step = ordinals[1] - ordinals[0];
assert.equal(step, ordinals[2] - ordinals[1]);
assert.equal(step, 11);

const primes29 = Array.from({length: 29}, (_, i) => prime(i + 1));
const red = ink.pages.find((p) => p.page === 39).red_spans;
assert.equal(red.length, 1);
assert.deepEqual([red[0].start, red[0].length, red[0].runes],
  [119, 3, "ᛡᚳᛋ"]);
const wordIndexes = [...red[0].runes].map((glyph) => {
  const i = runes.get(glyph);
  assert.notEqual(i, undefined);
  return i;
});
assert.deepEqual(wordIndexes, [27, 5, 15]);
// The SAME three source runes also select the original full p55 rune count
// under their GP ordinal rather than prime-value weights.
const ordinalAddress = wordIndexes.reduce((sum, value) => sum + value, 0);
assert.equal(ordinalAddress, 47);
const receiverToken = allTokens[ordinalAddress];
assert.equal(receiverToken, "1G");
const receiverLength = radix(receiverToken, grid.alphabet);
assert.equal(receiverLength, 76);
assert.equal(ink.pages.find((page) => page.page === 55).rune_count, receiverLength);
assert.equal(corpus.pages.find((page) => page.page === 55).indices.length, receiverLength);
const address = wordIndexes.reduce((sum, i) => sum + primes29[i], 0);
assert.equal(address, 173);

const indexed = allTokens[address];
const first = allTokens[0];
assert.equal(indexed, "1v");
assert.equal(first, "3N");
const literal = radix(indexed, grid.alphabet);
const firstValue = radix(first, grid.alphabet);
assert.deepEqual({literal, firstValue}, {literal: 117, firstValue: 203});

const cols = 8;
const row = Math.floor(address / cols);
const col = address % cols;
// Candidate 2014-executable packing: index = (p-K)*cols+g,
// and indexed value = p*g+K. Invert the two equations.
const g = col;
const numerator = literal + row;
assert.equal(numerator % (g + 1), 0, "source packet must determine integral modulus");
const p = numerator / (g + 1);
assert.ok(isPrime(p));
const K = p - row;
assert.ok(K > 0 && K < p && g > 0 && g < p);
assert.equal(address, (p - K) * cols + g);
assert.equal(literal, p * g + K);

// Literal FIRST p50 table cell is interpreted under the same p.
// It is the packed pair of two DH public values, A and B.
const A = Math.floor(firstValue / p);
const B = firstValue % p;
assert.equal(firstValue, p * A + B);
assert.ok(A > 0 && A < p && B > 0 && B < p);

// Independent 2014 image-file prime-index gap fixes a = 11 - g.
const a = step - g;
assert.ok(a > 0 && a < p);
const bCandidates = [];
for (let exponent = 1; exponent < p; exponent++) {
  if (power(g, exponent, p) === B) bCandidates.push(exponent);
}
assert.deepEqual(bCandidates, [15]);
const b = bCandidates[0];
assert.equal(power(g, a, p), A);
assert.equal(power(B, a, p), K);
assert.equal(power(A, b, p), K);

const recovered = {p, g, a, B, A, b, K};
assert.deepEqual(recovered, {p: 23, g: 5, a: 6, B: 19, A: 8, b: 15, K: 2});

// Independently derive physical p28 DH tuple from its frozen original layout.
const physicalPages = book.split(/^\s*%\s*$/m);
const p28 = physicalPages[28].trim();
const p28Lines = p28.split("/").filter((line) => line.trim());
assert.equal(p28Lines.length, 12);
const runeValues = (s) => [...s].filter((c) => runes.has(c)).map((c) => runes.get(c));
const words = (p28.replace(/\/\s*/g, "").match(/[\u16A0-\u16FF]+/gu) || []).map(runeValues);
assert.equal(words.length, 59);
assert.deepEqual(words[27], [28, 24, 10, 1, 20]);
const selectedLine = runeValues(p28Lines[5]);
const priorLines = p28Lines.slice(0, 5).reduce((s, x) => s + runeValues(x).length, 0);
const priorWords = words.slice(0, 27).reduce((s, w) => s + w.length, 0);
const lineFirstWordPosition = priorWords - priorLines + 1;
const independentlyPrinted = {
  p: selectedLine.length,
  g: words[27].length,
  a: 6,
  B: lineFirstWordPosition,
};
assert.deepEqual(independentlyPrinted, {p: 23, g: 5, a: 6, B: 19});
assert.equal(recovered.p, independentlyPrinted.p);
assert.equal(recovered.g, independentlyPrinted.g);
assert.equal(recovered.a, independentlyPrinted.a);
assert.equal(recovered.B, independentlyPrinted.B);

// Explicit competing radix59 (skip unused printed "f") is inconsistent
// with the same packet grammar. No adaptation is permitted.
const base59 = grid.alphabet.replace("f", "");
const v59 = radix(indexed, base59);
const f59 = radix(first, base59);
assert.deepEqual({v59, f59}, {v59: 115, f59: 200});
assert.notEqual((v59 + row) % (col + 1), 0);
assert.equal(Math.floor(f59 / p), A);
assert.notEqual(f59 % p, B);
assert.notEqual(f59 % p, B);

// Expose the original input multiplicities to avoid claiming exclusivity.
const allBytes = allTokens.map((t) => radix(t, grid.alphabet));
assert.equal(allBytes.filter((b0) => b0 === firstValue).length, 1);
assert.equal(allBytes.filter((b0) => b0 === literal).length, 2);
const redAddresses = ink.pages.flatMap((page) => (page.red_spans || []).map((span) => {
  return {page: page.page, address: [...span.runes].reduce((s, r) =>
    s + primes29[runes.get(r)], 0)};
}));
assert.deepEqual(redAddresses.filter((x) => x.address === address),
  [{page: 39, address: 173}]);

console.log(JSON.stringify({
  classification: "Conditional original-source DH23 transcript, not plaintext",
  originalStage10Filenames: images,
  primeOrdinals: ordinals,
  redGPOrdinalSum: ordinalAddress,
  selectedRecipient: {page: 55, tableToken: receiverToken, originalRuneCount: receiverLength},
  redGPPrimeSum: address,
  selectedGridCell: {row, col, token: indexed, base60: literal},
  firstGridCell: {token: first, base60: firstValue},
  recovered,
  independentP28: independentlyPrinted,
  base59Control: {indexed: v59, first: f59, invalidPrime: true},
  byteMultiplicity: {
    firstPackedValueOccurrences: 1,
    secondPackedValueOccurrences: 2,
    redOriginalSpanCount: redAddresses.length
  },
  result: "PASS: exact self-consistent source packet; no LP2 cipher consumer identified"
}, null, 2));