"use strict";

/**
 * Original-p27/p55 terminal-marker three-tape test.
 *
 * The six final ciphertext runes on p55 occur verbatim at original p27
 * offsets 28..33. Deleting that copy leaves 228 = 3 * 76 runes, and
 * p55 has 76 runes. Read the surviving p27 ciphertext cyclically from
 * the first rune after the matched source marker, in original order,
 * and partition into exactly three 76-rune tapes.
 *
 * Test the historical Cicada three-share byte-XOR primitive strictly
 * as five-bit GP index arithmetic, and one fully reversible GF(29)
 * triple-additive interpretation. Neither operation is selected by a
 * first-party LP2 instruction; the length/motif candidate is exploratory.
 *
 * Standalone Node 22 from repository root:
 * node sims/lp2_p27_p55_three_tape_terminal_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
/** @param {number} n @returns {number[]} */
const page = n => corpus.pages.find(p => p.page === n).indices;
const p27 = page(27);
const p55 = page(55);
const p57 = page(57);
const markerStart = 28;
const markerLength = 6;
assert.equal(corpus.translit.length, 29);
assert.equal(p27.length, 234);
assert.equal(p55.length, 76);
assert.equal(p57.length, 95);
assert.deepEqual(p27.slice(markerStart, markerStart + markerLength),
  p55.slice(-markerLength));
assert.equal(p55.slice(-6).map(i => corpus.translit[i]).join(""),
  "DJUBEI");

// This reader choice comes from the matched marker itself, rather
// than selecting an additive-key starting phase for language score.
const run = p27.slice(markerStart + markerLength)
  .concat(p27.slice(0, markerStart));
assert.equal(run.length, 3 * p55.length);
const tapes = Array.from({length: 3},
  (_, k) => run.slice(k * p55.length, (k + 1) * p55.length));
assert.deepEqual(tapes.flat(), run);
const mod29 = x => (x % 29 + 29) % 29;
/** @param {number[]} data @returns {number} */
function ioc(data) {
  const hist = Array(29).fill(0);
  for (const n of data) {
    assert(n >= 0 && n < 29);
    hist[n]++;
  }
  return hist.reduce((s, n) => s + n * (n - 1), 0) /
    (data.length * (data.length - 1));
}
const xor3 = tapes[0].map((_, i) =>
  tapes[0][i] ^ tapes[1][i] ^ tapes[2][i]);
const xor4 = p55.map((v, i) => v ^ xor3[i]);
const invalid3 = xor3.flatMap((n, i) => n >= 29 ? [i] : []);
const invalid4 = xor4.flatMap((n, i) => n >= 29 ? [i] : []);
assert.deepEqual(invalid3, [2, 25, 50, 57]);
assert.deepEqual(invalid4, [0, 3, 8, 24, 25, 26, 32, 49]);
const threeTapeXorMatches = xor3.filter((v, i) => v === p55[i]).length;
assert.equal(threeTapeXorMatches, 3);
// The literal 2014 three-XOR operation does not produce only GP29 digits.
// It could still be interpreted as five-bit data; the source gives no
// byte framing/transport instruction for this distinct proposed context.
const bits = xor4.map(n => n.toString(2).padStart(5, "0")).join("");
assert.equal(bits.length, 380);
const packed = Array.from({length: Math.floor(bits.length / 8)}, (_, i) =>
  parseInt(bits.slice(i * 8, i * 8 + 8), 2));
assert.equal(packed.length, 47);
assert.equal(bits.slice(376), "1011");
assert.equal(Buffer.from(packed).toString("hex").slice(0, 32),
  "fed9f91300f988f69957c4c8a7bb91f7");

// A separate fully invertible GP29 arithmetic analog of combining the
// three source tapes; this uses no fitted phase, scale or word boundary.
const key = tapes[0].map((_, i) => mod29(
  tapes[0][i] + tapes[1][i] + tapes[2][i]));
const candidate = p55.map((v, i) => mod29(v - key[i]));
assert.deepEqual(candidate.map((v, i) => mod29(v + key[i])), p55);
assert.equal(key.filter((v, i) => v === p55[i]).length, 2);
assert(Math.abs(ioc(candidate) - 0.034736842105263156) < 1e-14);
assert(Math.abs(ioc(p57.slice(0, 76)) - 0.05964912280701754) < 1e-14);
// Native positive-plant shows the arithmetic model is reversible,
// without treating the plant as evidence for the original ciphertext.
const knownNative = p57.slice(0, 76);
const planted = knownNative.map((v, i) => mod29(v + key[i]));
assert.deepEqual(planted.map((v, i) => mod29(v - key[i])),
  knownNative);

console.log(JSON.stringify({
  classification: "source-length candidate with negative literal consumers; no plaintext",
  originalPages: [27, 55],
  p27RuneLength: p27.length,
  p55RuneLength: p55.length,
  marker: "DJU BEI",
  markerStart,
  markerLength,
  strippedLength: run.length,
  threeTapeLengths: tapes.map(a => a.length),
  tapeStartIndices: [34, 110, 186].map(i => i % 234),
  literalXorThreeInvalidGP29Offsets: invalid3,
  literalXorFourInvalidGP29Offsets: invalid4,
  tripleXorEqualP55: threeTapeXorMatches,
  fiveBitPack: {
    byteLength: packed.length,
    leading16BytesHex: Buffer.from(packed).toString("hex").slice(0, 32),
    remainingBits: bits.slice(376)
  },
  additiveKeyMatchesP55: key.filter((v, i) => v === p55[i]).length,
  candidateAdditiveIoC: ioc(candidate),
  sourceP55IoC: ioc(p55),
  knownP57First76IoC: ioc(knownNative),
  additiveCandidateHead: candidate.slice(0, 40)
    .map(i => corpus.translit[i]).join("."),
  nativePlantExact: true,
  missingSourceRule: "No Cicada instruction specifies p27 triplication, XOR bit framing or an LP2 GF29 three-tape pad"
}, null, 2));
