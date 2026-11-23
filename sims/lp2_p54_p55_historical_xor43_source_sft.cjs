"use strict";
/**
 * Original LP2 p54->p55 43+43 balanced-register test of the documented
 * 2013 Cicada Instar/Twitter bytewise-XOR operation. A bounded hypothesis:
 * the page-local 43+43 split is not the literal complete-word 52+34 split.
 *
 * Run: node sims/lp2_p54_p55_historical_xor43_source_sft.cjs
 * Uses only Node 22 built-ins and repository-native primary inputs.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const data = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript = read("resources/liber-primus/lp2-transcription.txt").split("%");
const runeIndex = new Map(data.runes.map((r, i) => [r, i]));
const page = n => data.pages.find(p => p.page === n);

/** @param {number} n */
function segments(n) {
  const source = transcript[n < 50 ? n : n - 1];
  const words = source.split(/[-.]/g).map(part =>
    [...part].map(ch => runeIndex.get(ch)).filter(x => x !== undefined))
    .filter(w => w.length);
  assert.deepEqual(words.flat(), page(n).indices, "original page transcription");
  return words;
}
const p54 = page(54).indices;
const p55 = page(55).indices;
const p57 = page(57).indices;
assert.equal(p54.length, 232);
assert.equal(p55.length, 76);
assert.equal(p57.length, 95);
const w54 = segments(54);
const w55 = segments(55);
assert.deepEqual(w55.map(w => w.length),
  [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
assert.equal(w54.at(-1).length, 10);
assert.equal(w55[0][0], 21);
const tail = w54.at(-1);
assert.deepEqual(tail, p54.slice(-10));
const innerPositions = [];
const outerPositions = [];
for (let offset = 0, w = 0; w < w55.length; w++) {
  const length = w55[w].length;
  for (let j = 0; j < length; j++) {
    (j > 0 && j < length - 1 ? innerPositions : outerPositions)
      .push(offset + j);
  }
  offset += length;
}
const inner = innerPositions.map(i => p55[i]);
const outside = tail.concat(outerPositions.map(i => p55[i]));
assert.equal(inner.length, 43);
assert.equal(outside.length, 43);

/** @param {number[]} a @param {number[]} b */
const xor = (a, b) => a.map((x, i) => x ^ b[i]);

/** @param {number[]} values */
const readableGP = values => values
  .map(x => data.translit[x] === undefined ? "[" + x + "]" : data.translit[x])
  .join("");

/** @param {number[]} bytes */
const readableASCII = bytes => bytes
  .map(x => x >= 32 && x <= 126 ? String.fromCharCode(x) : ".").join("");

const comparisons = [];
for (const reversed of [false, true]) {
  const operand = reversed ? [...outside].reverse() : outside;
  const indices = xor(inner, operand);
  const bytes = xor(inner.map(i => data.prime[i]),
    operand.map(i => data.prime[i]));
  // XOR needs to retain a complete second tape to stay reversible.
  assert.deepEqual(xor(indices, operand), inner);
  assert.deepEqual(xor(bytes, operand.map(i => data.prime[i])),
    inner.map(i => data.prime[i]));
  const reconstructed = Array(76);
  innerPositions.forEach((pos, i) => {
    reconstructed[pos] = indices[i] ^ operand[i];
  });
  outerPositions.forEach((pos, i) => {
    reconstructed[pos] = p55[pos];
  });
  assert.deepEqual(reconstructed, p55);
  assert.deepEqual(tail.concat(reconstructed),
    page(54).indices.slice(-10).concat(p55));
  comparisons.push({
    outerTape: reversed ? "reversed" : "chronological",
    indexXor: {
      unrepresentableGP29Values: indices.filter(v => v >= 29),
      transcriptionWithEscapes: readableGP(indices),
      all43SourceIndicesRecovered: true
    },
    primeByteXor: {
      printableASCII: bytes.filter(v => v >= 32 && v <= 126).length,
      ASCIIEnglishLetters: bytes.filter(v =>
        v >= 65 && v <= 90 || v >= 97 && v <= 122).length,
      ASCIIspace: bytes.filter(v => v === 32).length,
      transcriptionWithEscapes: readableASCII(bytes),
      all43SourcePrimeValuesRecovered: true
    },
    all86OriginalRunesRestored: true
  });
}

// Exact source-alphabet support: every possible XOR output of two
// genuine GP29 prime-valued runes. No choice of input tape or orientation
// can represent an ASCII 'S' or 's' in this byte serialization.
const support = new Set(data.prime.flatMap(x => data.prime.map(y => x ^ y)));
assert.equal(support.has("S".charCodeAt(0)), false);
assert.equal(support.has("s".charCodeAt(0)), false);
assert.equal(support.size, 92);

// Genuine clear p57 GP43 positive under two valid 29-symbol XOR tapes.
// This proves that the index-XOR interpreter can recover real native
// language when it is present and its output fits the source alphabet.
const known = p57.slice(0, 43);
const lhs = [], rhs = [];
for (let i = 0; i < known.length; i++) {
  const admissible = Array.from({length: 29}, (_, x) => x)
    .filter(x => (x ^ known[i]) < 29);
  assert.ok(admissible.length);
  const x = admissible[(i * 17 + 3301) % admissible.length];
  lhs.push(x);
  rhs.push(x ^ known[i]);
}
assert.deepEqual(xor(lhs, rhs), known);
assert.deepEqual(xor(known, lhs), rhs);
assert.deepEqual(xor(known, rhs), lhs);
assert.equal(known.length, 43);

const result = {
  classification: "Bounded source-led negative, no authentic unknown plaintext",
  original: {
    completeWordSplit: {interiors: 52, exteriors: 34},
    conditionalPageLocalSplit: {interiors: 43, outsideWithP54Tail: 43},
    sourceReregister: "p54 final 10 || p55 all 76",
    correctFullOriginalReplay: true
  },
  historicalOperator: "2013 Instar/Twitter bytewise XOR",
  comparisons,
  primeByteAlphabet: {
    possibleValues: support.size,
    uppercaseSRepresentable: support.has(83),
    lowercaseSRepresentable: support.has(115)
  },
  clearSourcePositive: {
    source: "p57 first 43 genuine clear runes",
    recovered: known.length,
    exact: true
  }
};
if (require.main === module) console.log(JSON.stringify(result, null, 2));
module.exports = {result};
