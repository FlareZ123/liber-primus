"use strict";
/**
 * Exact source-linked 76-p55 GP29 decoding trial:
 * original p49–51 32x8 table outer ring -> Euler totients -> p55 rune inverse.
 * Usage: node sims/p50_outer76_totient_p55_sft.cjs
 *
 * The zero byte on the perimeter has no Euler totient. Explicitly detect
 * that source obstruction; the separate extended 0->0 experiment is labeled
 * hypothetical and does not invent an authenticated extension.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const bytes = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/base60-grid.json"), "utf8"
)).byte_rows.flat();
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const p55 = corpus.pages.find(page => page.page === 55).indices;
const solvedP57 = corpus.pages.find(page => page.page === 57).indices.slice(0, 76);
assert.deepEqual([bytes.length,p55.length,solvedP57.length], [256,76,76]);
assert.deepEqual(bytes.slice(0,8), [203,231,167,186,97,237,126,183]);

/** @param {number} value @returns {number} */
const mod = value => (value % 29 + 29) % 29;
/** @param {number} n Positive integer; Euler totient. @returns {number} */
function phi(n) {
  assert.ok(Number.isSafeInteger(n) && n > 0, "Euler totient defined for n>=1");
  let out = n, factorized = n;
  for (let divisor = 2; divisor * divisor <= factorized; divisor++) {
    if (factorized % divisor === 0) {
      while (factorized % divisor === 0) factorized /= divisor;
      out -= out / divisor;
    }
  }
  if (factorized > 1) out -= out / factorized;
  return out;
}
// Zero-based row-major indices of the *physical printed* 32x8 table,
// clockwise from top-left. The p55 page has exactly 76 source runes.
const ring = [];
for (let col = 0; col < 8; col++) ring.push(col);
for (let row = 1; row < 32; row++) ring.push(row * 8 + 7);
for (let col = 6; col >= 0; col--) ring.push(31 * 8 + col);
for (let row = 30; row >= 1; row--) ring.push(row * 8);
assert.equal(ring.length, 76);
assert.equal(new Set(ring).size, 76);
assert.equal(ring[0], 0);
const perimeter = ring.map(index => bytes[index]);
const zeroPositions = ring.flatMap((cell, i) => bytes[cell] === 0 ? [{position:i,cellIndex:cell}] : []);
assert.deepEqual(zeroPositions, [{position:52,cellIndex:192}]);
assert.equal(corpus.translit[p55[52]], "X");

/**
 * Hypothetical phi(0)=0 extension only. The positive entries use the actual
 * Euler totient and source-solved p56 GP29 subtraction.
 * @param {number[]} input Exactly 76 GP29 indices
 * @param {1|-1} sign +1 encrypts; -1 decrypts
 * @returns {number[]}
 */
function transform(input, sign) {
  assert.equal(input.length, 76);
  return input.map((digit, i) => {
    const byte = perimeter[i];
    const step = byte === 0 ? 0 : phi(byte);
    return mod(digit + sign * step);
  });
}
/** @param {number[]} input */
function ioc(input) {
  const frequencies = Array(29).fill(0);
  for (const symbol of input) frequencies[symbol]++;
  return frequencies.reduce((sum, n) => sum + n * (n - 1), 0) /
    (input.length * (input.length - 1));
}
/** @param {number[]} input */
function renderWords(input) {
  const lengths = [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
  let at = 0;
  return lengths.map(length => {
    const word = input.slice(at, at+length).map(index => corpus.translit[index]).join("");
    at += length;
    return word;
  });
}
const p55Candidate = transform(p55, -1);
assert.deepEqual(transform(p55Candidate, +1), p55);
const cipherPlant = transform(solvedP57, +1);
assert.deepEqual(transform(cipherPlant, -1), solvedP57);
assert.equal(ioc(p55Candidate), 0.03333333333333333);
const output = renderWords(p55Candidate).join(" ");
assert.equal(output, "IA NGIAHIA RI ITH BLTHTEAOE OETCOEMF GS AEXHIGPCXAEAEYSH NGNLGUI TJNGN OEA AEGOAXFC EOSHEIATHO BL LNGIAYOR GHF AEAA");
console.log(JSON.stringify({
  source:"Original p49–51 32x8 printed grid clockwise outside boundary",
  proposedConsumer:"P55 76 runes and solved-p56 Euler prime-totient GP29 subtraction",
  ringLength:ring.length,
  naturalEulerTotientUndefinedAt:zeroPositions,
  originalP55SymbolAtZeroRingPosition:"X",
  extensionTested:"Non-Euler convention phi(0)=0",
  exactCiphertextRoundtrip:true,
  nativeSolvedPlantRecovered:solvedP57.length,
  rawP55Ioc:ioc(p55),
  extendedDecoderIoc:ioc(p55Candidate),
  extendedDecoderWords:renderWords(p55Candidate),
  authenticUnknownPlaintextRecovered:false,
  outcome:"Literal totient decoder obstructed by source zero. Explicit zero-passthrough extension remains nonlinguistic."
},null,2));
