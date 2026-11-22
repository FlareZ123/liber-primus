"use strict";
/**
 * Original p53 red GP29 integer / p49-51 256-byte table Euclidean split.
 * Node.js 22 SFT, run from any directory:
 *   node sims/lp2_p53_red_division_22531_original_sft.cjs
 *
 * All inputs are original-source pinned derived transcriptions. Read-only.
 * The 225+31 byte alignment is an exploratory size relation, not a key.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} name */
function load(name) {
  return JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", name), "utf8"));
}
const grid = load("base60-grid.json");
const corpus = load("lp2-corpus.json");
const ink = load("lp2-ink-annotations.json");
const sourceBytes = Buffer.from(grid.byte_rows.flat());
assert.equal(sourceBytes.length, 256);
assert.equal(crypto.createHash("sha256").update(sourceBytes).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const N = BigInt("0x" + sourceBytes.toString("hex"));
const originalP53 = corpus.pages.find((p) => p.page === 53);
const annotatedP53 = ink.pages.find((p) => p.page === 53);
assert(originalP53 && annotatedP53);
assert.equal(originalP53.indices.length, 179);
const redNumeral = annotatedP53.red_spans[0];
assert.equal(redNumeral.start, 128);
assert.equal(redNumeral.length, 51);
const sourceDigits = originalP53.indices.slice(redNumeral.start,
  redNumeral.start + redNumeral.length);
assert.equal(sourceDigits.map((v) => corpus.runes[v]).join(""), redNumeral.runes);
const R = sourceDigits.reduce((n, v) => 29n * n + BigInt(v), 0n);
const Q = N / R;
const M = N % R;
assert.equal(N.toString(2).length, 2048);
assert.equal(R.toString(2).length, 247);
assert.equal(Q.toString(2).length, 1801);
assert.equal(M.toString(2).length, 247);
assert.equal(R * Q + M, N);
assert(M > 0n && M < R);

/** @param {bigint} n @param {number} count */
function byteArray(n, count) {
  const out = new Array(count).fill(0);
  let v = n;
  for (let i = count - 1; i >= 0; i--) {
    out[i] = Number(v & 255n);
    v >>= 8n;
  }
  assert.equal(v, 0n);
  return out;
}
const qBytes = byteArray(Q, 226);
const mBytes = byteArray(M, 31);
assert.equal(qBytes[0], 1);
const redKeyBytes = qBytes.slice(1);
assert.equal(redKeyBytes.length, 225);
assert.equal(mBytes.length, 31);

const allRed = ink.pages.flatMap((p) => (p.red_spans || []).flatMap(
  (span) => [...span.runes].map((rune) => ({
    page: p.page, value: corpus.runes.indexOf(rune)
  }))
));
const dots = ink.pages.flatMap((p) => (p.large_punctuation || [])
  .filter((punct) => punct[1] === 13)
  .map((punct) => ({page: p.page, offset: punct[0]})));
assert.equal(allRed.length, 225);
assert.equal(dots.length, 31);
assert(allRed.every((e) => e.value >= 0 && e.value < 29));
assert.equal(allRed.filter((e) => e.page <= 55).length, 213);
assert.equal(allRed.filter((e) => e.page > 55).length, 12);
assert.equal(225 + 31, sourceBytes.length);

/** @param {number[]} indices */
function transliterate(indices) {
  return indices.map((i) => corpus.translit[i]).join("");
}
/** @param {number[]} indices */
function indexOfCoincidence(indices) {
  const hist = Array(29).fill(0);
  for (const i of indices) hist[i]++;
  return hist.reduce((s, n) => s + n * (n - 1), 0) /
    (indices.length * (indices.length - 1));
}
const unknownRed = allRed.filter((e) => e.page <= 55).map((e) => e.value);
const wholeRed = allRed.map((e) => e.value);
const key = redKeyBytes.map((b) => b % 29);
assert.equal(unknownRed.length, 213);

let disagreements = 0;
let matchingCipherPairs = 0;
let matchingKeyPairs = 0;
let matchingBothPairs = 0;
let matchingPositions = 0;
let firstContradiction = null;
for (let i = 0; i < unknownRed.length; i++) {
  matchingPositions += Number(unknownRed[i] === key[i]);
  for (let j = i + 1; j < unknownRed.length; j++) {
    const eqCipher = unknownRed[i] === unknownRed[j];
    const eqKey = key[i] === key[j];
    matchingCipherPairs += Number(eqCipher);
    matchingKeyPairs += Number(eqKey);
    matchingBothPairs += Number(eqCipher && eqKey);
    if (eqCipher !== eqKey) {
      disagreements++;
      if (firstContradiction === null) {
        firstContradiction = {
          i, j, original: [unknownRed[i], unknownRed[j]],
          quotientResidues: [key[i], key[j]]
        };
      }
    }
  }
}
assert.equal(matchingPositions, 7);
assert.equal(disagreements, 1467);
assert.equal(matchingCipherPairs, 764);
assert.equal(matchingKeyPairs, 745);
assert.equal(matchingBothPairs, 21);
assert(firstContradiction);

// A fixed arbitrary bijection must preserve pairwise equalities.
// The original unknown-red stream is incompatible with this exact
// quotient-to-rune source order under every stationary bijection.
const variants = [];
for (const sign of [-1, 1]) {
  const decoded = wholeRed.map((c, i) => (c + 29 + sign * key[i]) % 29);
  const reen = decoded.map((p, i) => (p + 29 - sign * key[i]) % 29);
  assert.deepEqual(reen, wholeRed);
  variants.push({
    sign,
    first13: transliterate(decoded.slice(0, 13)),
    last12: transliterate(decoded.slice(-12)),
    ioc225: indexOfCoincidence(decoded),
    unchanged: decoded.reduce((count, value, i) =>
      count + Number(value === wholeRed[i]), 0)
  });
}
assert.equal(variants[0].first13, "LIGNYPDFLXWLTH");
assert.equal(variants[1].first13, "IGUYSAETHFINFOEH");

// Empirical original-source window baseline. Alternative 51-rune integers
// keep every window, including the actual p53 red numeral.
let sourceWindows = 0;
let matchingByteFrames = 0;
for (const page of corpus.pages.filter((p) => p.page <= 55)) {
  for (let at = 0; at + 51 <= page.indices.length; at++) {
    const candidate = page.indices.slice(at, at + 51)
      .reduce((number, digit) => 29n * number + BigInt(digit), 0n);
    assert(candidate > 0n);
    sourceWindows++;
    if ((N / candidate).toString(2).length === 1801 &&
        (N % candidate).toString(2).length >= 241) matchingByteFrames++;
  }
}
assert.equal(sourceWindows, 10206);
assert.equal(matchingByteFrames, 4846);

// Independent source-native plant: use real solved p57 GP29 text as
// a 213-rune plaintext; the fixed 225-byte quotient pad must invert it.
const clear = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(clear.length, 95);
const plantedPlain = Array.from({length: 213}, (_, i) => clear[i % 95]);
const plantCipher = plantedPlain.map((v, i) => (v + key[i]) % 29);
assert.deepEqual(plantCipher.map((c, i) => (c + 29 - key[i]) % 29),
  plantedPlain);

console.log(JSON.stringify({
  source: "p49-51 256 table bytes; physical p53 51 red GP29 digits",
  operation: "N = R*Q + M, exact unsigned big-endian integers",
  bits: {N: 2048, R: 247, Q: 1801, M: 247},
  lengths: {table: 256, quotient: 226, leadingQuotientByte: qBytes[0],
    quotientTail: redKeyBytes.length, remainder: mBytes.length,
    originalRedRunes: allRed.length, original13DotMarks: dots.length,
    unsolvedRedRunes: unknownRed.length},
  quotientPrefixHex: Buffer.from(qBytes.slice(0, 16)).toString("hex"),
  remainderPrefixHex: Buffer.from(mBytes.slice(0, 16)).toString("hex"),
  directResidueMatches: matchingPositions,
  substitutionInvariant: {
    cipherEqualPairs: matchingCipherPairs, quotientEqualPairs: matchingKeyPairs,
    agreeingEqualPairs: matchingBothPairs, contradictions: disagreements,
    firstContradiction
  },
  sourceRedIoc225: indexOfCoincidence(wholeRed),
  sourceSizeBaseline: {sourceWindows, matchingByteFrames, share: matchingByteFrames / sourceWindows},
  additiveVariants: variants,
  positive: "213/213 genuine GP29 p57-runic source plant recovered",
  decision: "Size alignment is arithmetically induced; direct key and bijection readings do not recover plaintext. No author-selected operation."
}, null, 2));
