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

/**
 * The historical 2013 Cicada share scheme motivates a stronger, exact
 * test: could p55 be a fourth GF(29) share predicted by the three p27
 * 76-rune tapes? Every fixed-degree <=2 Shamir relation would require
 * one common linear combination of the three source shares. Grant
 * an arbitrary intercept as well, and test both natural strip layouts.
 * This is a source-shaped conditional gate, not proof of a cipher.
 *
 * @param {number[][]} rows
 * @returns {number}
 */
function gf29Rank(rows) {
  const a = rows.map(row => row.map(mod29));
  let r = 0;
  for (let col = 0; col < a[0].length && r < a.length; col++) {
    let pivot = r;
    while (pivot < a.length && a[pivot][col] === 0) pivot++;
    if (pivot === a.length) continue;
    [a[r], a[pivot]] = [a[pivot], a[r]];
    let inverse = 0;
    for (let i = 1; i < 29; i++) {
      if (mod29(i * a[r][col]) === 1) {
        inverse = i;
        break;
      }
    }
    assert.notEqual(inverse, 0);
    for (let j = col; j < a[r].length; j++) {
      a[r][j] = mod29(a[r][j] * inverse);
    }
    for (let i = 0; i < a.length; i++) {
      if (i === r) continue;
      const factor = a[i][col];
      for (let j = col; j < a[i].length; j++) {
        a[i][j] = mod29(a[i][j] - factor * a[r][j]);
      }
    }
    r++;
  }
  return r;
}
const shamirAffineGate = {};
for (const layout of ["contiguous", "interleaved"]) {
  const shares = layout === "contiguous"
    ? tapes
    : Array.from({length: 3}, (_, j) =>
      Array.from({length: 76}, (_, i) => run[3 * i + j]));
  const predictor = Array.from({length: 76}, (_, i) =>
    [1, shares[0][i], shares[1][i], shares[2][i]]);
  const augmented = predictor.map((x, i) => [...x, p55[i]]);
  const rank = gf29Rank(predictor);
  const augmentedRank = gf29Rank(augmented);
  // A five-row contradiction is independently reproducible from the
  // original first five glyphs; no language scoring or fitted key.
  assert.equal(gf29Rank(predictor.slice(0, 4)), 4);
  assert.equal(gf29Rank(augmented.slice(0, 5)), 5);
  assert.equal(rank, 4);
  assert.equal(augmentedRank, 5);
  shamirAffineGate[layout] = {
    sourceTapeArrangement: layout,
    rank,
    augmentedRank,
    contradictionAtRuneOffset: 4,
    sourceShareRows: predictor.slice(0, 5),
    p55RuneValues: p55.slice(0, 5)
  };
}
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

// Original GP prime weights, unlike the ordinal indices, fit directly
// in a byte. Test the literal historical three-share XOR on those
// printed-chart numerical operands as a separate fixed byte register.
const primeTape = tapes.map(tape => tape.map(v => corpus.prime[v]));
const primeCipher = p55.map(v => corpus.prime[v]);
const primeXor3 = primeTape[0].map((_, i) =>
  primeTape[0][i] ^ primeTape[1][i] ^ primeTape[2][i]);
const primeXor4 = primeCipher.map((v, i) => v ^ primeXor3[i]);
const printable = bytes => bytes.filter(v => v >= 32 && v <= 126).length;
assert.equal(printable(primeXor3), 54);
assert.equal(printable(primeXor4), 59);
assert.equal(primeXor4.filter(v => v < 32).length, 17);
assert.equal(Buffer.from(primeXor4).toString("hex").slice(0, 32),
  "6e6034485e0c6678526e4c0c3e0e2037");
// Full source-prescribed 2013 BASE29 numeral interpretation before the
// historical 2014 bytewise three-share XOR. Every 76-rune source tape
// becomes a single 47-byte big-endian number (zero-padded to the common
// minimum fixed width), with all source rune values preserved.
const base29 = 29n ** BigInt(p55.length);
const toInt29 = word => word.reduce((a, v) => a * 29n + BigInt(v), 0n);
const toBytes47 = number => {
  const out = Array(47).fill(0);
  let v = number;
  for (let i = 46; i >= 0; i--) {
    out[i] = Number(v & 255n);
    v >>= 8n;
  }
  assert.equal(v, 0n);
  return out;
};
const fromBytes = bytes => bytes.reduce(
  (a, v) => 256n * a + BigInt(v), 0n);
const sourceByteTapes = tapes.map(w => toBytes47(toInt29(w)));
const nativeP55Bytes = toBytes47(toInt29(p55));
const base29KeyBytes = sourceByteTapes[0].map((_, i) =>
  sourceByteTapes[0][i] ^ sourceByteTapes[1][i] ^
  sourceByteTapes[2][i]);
const base29RecoveredBytes = nativeP55Bytes.map(
  (v, i) => v ^ base29KeyBytes[i]);
assert.equal(base29RecoveredBytes.length, 47);
assert.equal(Buffer.from(base29RecoveredBytes).toString("hex").slice(0, 32),
  "014a6d1c45acd1cb103cd8a33373c912");
assert.equal(printable(base29RecoveredBytes), 17);
assert.equal(base29RecoveredBytes.filter(v => v < 32).length, 8);
const recoveredNumber = fromBytes(base29RecoveredBytes);
assert(recoveredNumber < base29);
const nativePlantBytes = toBytes47(toInt29(p57.slice(0, 76)));
const plantedCipherBytes = nativePlantBytes.map(
  (v, i) => v ^ base29KeyBytes[i]);
assert(fromBytes(plantedCipherBytes) < base29);
assert.deepEqual(plantedCipherBytes.map(
  (v, i) => v ^ base29KeyBytes[i]), nativePlantBytes);
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

// Cross-chapter five-of-ten hypothesis, deliberately narrow: the 2013
// Cicada Shamir threshold was five, and exactly five 76-symbol source
// lanes can be laid out from 3 p27 tapes + p50's 32x8 perimeter + p55.
// The original p50 perimeter is 76 *bytes*, not a GP29 share; byte
// modulo 29 is an explicitly hypothesized, unauthenticated transport.
const grid = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-grid-256.json"), "utf8"));
assert.equal(grid.bytes.length, 256);
const rows = Array.from({length: 32},
  (_, r) => grid.bytes.slice(8 * r, 8 * r + 8));
const outer76 = [...rows[0], ...rows.slice(1, 31).map(row => row[7]),
  ...rows[31].slice().reverse(),
  ...rows.slice(1, 31).reverse().map(row => row[0])];
assert.equal(outer76.length, 76);
const fiveSourceLanes = [...tapes, outer76.map(v => v % 29), p55];
const shamir5Coeffs = [5, -10, 10, -5, 1];
/** @param {number[][]} lanes */
function interpolateFive(lanes) {
  return Array.from({length: 76}, (_, i) => mod29(
    shamir5Coeffs.reduce((sum, weight, j) =>
      sum + weight * lanes[j][i], 0)));
}
const shamir5Recovered = interpolateFive(fiveSourceLanes);
assert(Math.abs(ioc(shamir5Recovered) - 0.030526315789473683) < 1e-14);
assert.equal(shamir5Recovered.filter(v => v === 18).length, 3);
assert.equal(shamir5Recovered.slice(0, 16)
  .map(i => corpus.translit[i]).join("."),
"S.NG.H.P.U.EO.OE.W.N.S.S.I.C.NG.E.F");
// Positive with authentic clear p57 as the degree-0 polynomial term.
// Arbitrary fixed degree 1..4 coefs generate five true GP29 shares.
const plantedFive = Array.from({length: 5}, (_, k) =>
  Array.from({length: 76}, (_, i) => {
    const x = k + 1;
    return mod29(knownNative[i] +
      (i + 1) * x + (2 * i + 3) * x ** 2 +
      (3 * i + 5) * x ** 3 + (4 * i + 7) * x ** 4);
  }));
assert.deepEqual(interpolateFive(plantedFive), knownNative);
// Distinct authenticated earlier source operation: 2014 bytewise XOR.
// Convert four GP rune lanes to their printed prime weights and XOR
// those byte values with the original p50 byte perimeter.
const fiveLaneByteXor = outer76.map((value, i) => value ^
  primeTape[0][i] ^ primeTape[1][i] ^ primeTape[2][i] ^ primeCipher[i]);
assert.equal(printable(fiveLaneByteXor), 28);
assert.equal(fiveLaneByteXor.filter(v => v < 32).length, 9);
assert.equal(fiveLaneByteXor.filter(v => v >= 128).length, 39);
assert.equal(Buffer.from(fiveLaneByteXor).toString("hex").slice(0, 32),
  "a58793f23fe118cf8639c909725e135b");
const fiveLaneRimShamir = {
  originalSourceLengths: fiveSourceLanes.map(v => v.length),
  sourceRimWidth: 32, sourceRimHeight: 8,
  p50RimByteToGP: "byte mod 29 is hypothesized, not source-authorized",
  interpolatedPlaintextIoC: ioc(shamir5Recovered),
  interpolatedPlaintextECount: 3,
  opening16: shamir5Recovered.slice(0, 16)
    .map(i => corpus.translit[i]).join("."),
  genuineP57First76PositiveExact: true
};

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
  primeWeightByteXor: {
    threeSharePrintableBytes: printable(primeXor3),
    fourSharePrintableBytes: printable(primeXor4),
    fourShareControlBytes: primeXor4.filter(v => v < 32).length,
    fourShareLeading16Hex: Buffer.from(primeXor4).toString("hex").slice(0, 32)
  },
  tripleXorEqualP55: threeTapeXorMatches,
  fiveBitPack: {
    byteLength: packed.length,
    leading16BytesHex: Buffer.from(packed).toString("hex").slice(0, 32),
    remainingBits: bits.slice(376)
  },
  fixedShamirAffineFourthShare: shamirAffineGate,
  fiveLaneRimShamir,
  fiveLaneHistoricalByteXor: {
    printableAscii: printable(fiveLaneByteXor),
    controlBytes: fiveLaneByteXor.filter(v => v < 32).length,
    highBytes: fiveLaneByteXor.filter(v => v >= 128).length,
    first16BytesHex: Buffer.from(fiveLaneByteXor).toString("hex").slice(0, 32)
  },
  historicalBase29XorByte: {
    width: 47,
    printableBytes: printable(base29RecoveredBytes),
    asciiControlBytes: base29RecoveredBytes.filter(v => v < 32).length,
    leading16Hex: Buffer.from(base29RecoveredBytes).toString("hex").slice(0, 32),
    originalRecoveredIntegerFitsGp29: recoveredNumber < base29,
    nativeP57PlantExact: true
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
