"use strict";

/**
 * Original 256-byte LP2 grid plus 76 unknown p55 + 85 solved p56 +
 * 95 printed-clear p57. The 2013 Cicada Twitter stage demonstrates
 * bytewise XOR, so directly test an unknown GF(256) linear XOR-pad
 * generator against all 180 source-known terminal symbols. No private
 * key, guessed seed, language scorer, or page transcription edits.
 *
 * Run on Windows 11: node sims/lp2_terminal256_byte_xor_known180_lfsr_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
/** @param {string} p */
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const table = read("resources/liber-primus/lp2-grid-256.json");
const bytes = table.pages.flatMap(page => page.bytes);
assert.equal(bytes.length, 256);
assert.equal(
  crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);
const p55Cipher = corpus.pages[55].indices;
const p56Cipher = corpus.pages[56].indices;
const p57Plain = corpus.pages[57].indices;
assert.deepEqual([p55Cipher.length, p56Cipher.length, p57Plain.length], [76, 85, 95]);

const tokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} text @returns {number[]} */
function gpEncode(text) {
  const out = [];
  for (const word of text.split(" ")) {
    for (let offset = 0; offset < word.length;) {
      const token = tokens.find(t => word.startsWith(t.s, offset));
      assert(token, `Non-GP source token in ${word} at ${offset}`);
      out.push(token.i);
      offset += token.s.length;
    }
  }
  return out;
}
// Source-authentic p56 spelling is GP "EUERY" and "SEEC", not modern English V/K.
const p56Plain = gpEncode(
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO " +
  "IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE"
);
assert.equal(p56Plain.length, 85);
const primeKeys = [];
for (let candidate = 2; primeKeys.length < 85; candidate++) {
  if (primeKeys.every(prime => prime * prime > candidate || candidate % prime !== 0))
    primeKeys.push(candidate);
}
let primeClock = 0;
const replay = p56Plain.map((value, i) => {
  if (i === 56) {
    assert.equal(value, 0, "One source-authentic F interrupter");
    return 0;
  }
  return (value + primeKeys[primeClock++] - 1) % 29;
});
assert.equal(primeClock, 84);
assert.deepEqual(replay, p56Cipher, "Actual p56 85/85 known-rune regression");

/** GF(2^8) multiplication using the standard irreducible 0x11B polynomial.
 * @param {number} a @param {number} b @returns {number}
 */
function multiply(a, b) {
  let result = 0;
  while (b) {
    if (b & 1) result ^= a;
    b >>>= 1;
    a <<= 1;
    if (a & 256) a ^= 0x11b;
  }
  return result;
}
/** @param {number} a @param {number} exponent @returns {number} */
function power(a, exponent) {
  let result = 1;
  for (; exponent; exponent >>>= 1, a = multiply(a, a))
    if (exponent & 1) result = multiply(result, a);
  return result;
}
/** @param {number} a */
function inverse(a) {
  assert(a > 0 && a < 256, "GF256 division by zero");
  return power(a, 254);
}
/**
 * Return the minimum-degree homogeneous GF256 linear recurrence for input.
 * Coefficients C obey C0=1 and XOR_j Cj*K[n-j]=0 at all n>=degree.
 * @param {number[]} sequence
 * @returns {{degree:number,poly:number[]}}
 */
function berlekampMassey(sequence) {
  let current = [1], previous = [1], degree = 0, gap = 1, lastNonzero = 1;
  for (let n = 0; n < sequence.length; n++) {
    let discrepancy = sequence[n];
    for (let j = 1; j <= degree; j++)
      discrepancy ^= multiply(current[j] || 0, sequence[n-j]);
    if (!discrepancy) {
      gap++;
      continue;
    }
    const saved = current.slice();
    const scale = multiply(discrepancy, inverse(lastNonzero));
    while (current.length < previous.length + gap) current.push(0);
    for (let j = 0; j < previous.length; j++)
      current[j+gap] ^= multiply(scale, previous[j]);
    if (2 * degree <= n) {
      degree = n + 1 - degree;
      previous = saved;
      lastNonzero = discrepancy;
      gap = 1;
    } else {
      gap++;
    }
  }
  return {degree, poly: current.slice(0, degree + 1)};
}
/** @param {number[]} sequence @param {number[]} poly */
function predictHoldout(sequence, poly) {
  const order = poly.length - 1;
  let matches = 0, firstMismatch = null;
  for (let n = 90; n < sequence.length; n++) {
    let prediction = 0;
    for (let j = 1; j <= order; j++)
      prediction ^= multiply(poly[j], sequence[n-j]);
    if (prediction === sequence[n]) matches++;
    else if (firstMismatch === null) firstMismatch = n;
  }
  return {matches, total: sequence.length - 90, firstMismatch};
}
/** @param {number[]} terminalKnown */
function analyze(terminalKnown) {
  const knownKey = terminalKnown.map((plaintext, j) => bytes[76+j] ^ plaintext);
  const train = berlekampMassey(knownKey.slice(0, 90));
  const complete = berlekampMassey(knownKey);
  return {
    trainingDegree: train.degree,
    fullDegree: complete.degree,
    withheld: predictHoldout(knownKey, train.poly),
    canHaveOrderAtMost8: complete.degree <= 8,
    canHaveOrderAtMost32: complete.degree <= 32
  };
}
const solved = analyze([...p56Plain, ...p57Plain]);
const printed = analyze([...p56Cipher, ...p57Plain]);
assert.deepEqual([solved.trainingDegree, solved.fullDegree, solved.withheld.matches,
  solved.withheld.firstMismatch], [45, 90, 0, 90]);
assert.deepEqual([printed.trainingDegree, printed.fullDegree, printed.withheld.matches,
  printed.withheld.firstMismatch], [45, 90, 0, 90]);
assert(!solved.canHaveOrderAtMost32 && !printed.canHaveOrderAtMost32);

/** Positive: recover 76 unknown runes using only the 180 known terminal runes. */
const knownPlain = [...p56Plain, ...p57Plain];
const plantedPlain = [...p57Plain.slice(0, 76), ...knownPlain];
const plantedPoly = [1, 5, 8, 11, 17];
const plantedPad = [7, 11, 13, 17];
for (let i = 4; i < 256; i++) {
  let next = 0;
  for (let j = 1; j <= 4; j++)
    next ^= multiply(plantedPoly[j], plantedPad[i-j]);
  plantedPad.push(next);
}
const plantedTable = plantedPlain.map((value, i) => value ^ plantedPad[i]);
const observedPad = knownPlain.map((value, j) => plantedTable[j+76] ^ value);
const inferred = berlekampMassey(observedPad);
assert.equal(inferred.degree, 4);
assert.deepEqual(inferred.poly, plantedPoly);
const recovered = Array(256).fill(null);
for (let i = 0; i < 180; i++) recovered[76+i] = observedPad[i];
const lastInverse = inverse(inferred.poly[inferred.degree]);
for (let n = 75 + inferred.degree; n >= inferred.degree; n--) {
  let value = recovered[n];
  for (let j = 1; j < inferred.degree; j++)
    value ^= multiply(inferred.poly[j], recovered[n-j]);
  recovered[n-inferred.degree] = multiply(value, lastInverse);
}
assert.deepEqual(recovered, plantedPad);
const recoveredPlain = plantedTable.slice(0, 76).map((v, i) => v ^ recovered[i]);
assert.deepEqual(recoveredPlain, plantedPlain.slice(0, 76));
assert.equal(
  predictHoldout(observedPad, berlekampMassey(observedPad.slice(0, 90)).poly).matches,
  90
);
const result = {
  classification: "Exact original negative for every row-major byte-XOR GF(2^8,0x11B) LFSR of order <=32",
  sourceGeometry: {tableBytes: 256, unknownP55: 76, knownP56: 85, knownP57: 95},
  sourceP56CipherReplay: "85/85",
  solvedP56Plaintext: solved,
  literalPrintedP56: printed,
  sourceNativePlant: {
    inferredOrder: inferred.degree,
    heldoutExactPredictions: "90/90",
    hiddenP55RuneReconstruction: "76/76"
  },
  originalUnknownPlaintextRecovered: false
};
if (require.main === module) console.log(JSON.stringify(result, null, 2));
module.exports = {multiply, berlekampMassey, predictHoldout};
