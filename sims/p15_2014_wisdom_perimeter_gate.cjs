"use strict";
/**
 * Frozen source-first p15 -> 2014 Wisdom perimeter gate.
 * Run from repository root: node sims/p15_2014_wisdom_perimeter_gate.cjs
 *
 * This tests only the cheapest motivated extension:
 * cell 6 start + p15 clockwise orientation + phi(cell) mod 29 + GP29 subtraction.
 * The p15 prime/Fibonacci values do not enter the derived key; that limitation
 * is central to the negative result, not something to repair by adding variants.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");

// Source-native positive controls: exact p15 number-grid reconstruction and
// authentic solved p56 phi-prime GP29 cipher regression.
require("./lp2_p15_fibonacci_prime_spiral_sft.cjs");
require("./authentic_lp2_p56_totient_regression.cjs");

const blocks = read("resources/cicada2014-openpuff-magic-squares.txt")
  .trim().split(/\r?\n\s*\r?\n/)
  .map((block) => block.trim().split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/).map(Number)));
assert.deepEqual(blocks.map((matrix) => matrix.length), [5, 7, 5]);
const square = blocks[2];
assert.deepEqual(square, [
  [272, 138, 341, 131, 151],
  [366, 199, 130, 320, 18],
  [226, 245, 91, 245, 226],
  [18, 320, 130, 199, 366],
  [151, 131, 341, 138, 272]
]);

// 2014 stage03 “Patience is a virtue”: GP sum 761; phi(761) mod 29 = 6.
// Cell 6 is row 2, column 1 (one-based), on the 5x5 perimeter.
const startCell = { row: 2, column: 1, value: square[1][0] };
assert.equal(startCell.value, 366);
function phi(n) {
  let result = n;
  let rest = n;
  for (let p = 2; p * p <= rest; p++) {
    if (rest % p !== 0) continue;
    while (rest % p === 0) rest /= p;
    result -= result / p;
  }
  if (rest > 1) result -= result / rest;
  return result;
}
assert.equal(phi(761) % 29, 6);

// Clockwise perimeter coordinates, with cell 6 as the source-motivated start.
const perimeter = [
  [0, 0], [0, 1], [0, 2], [0, 3], [0, 4],
  [1, 4], [2, 4], [3, 4], [4, 4], [4, 3], [4, 2], [4, 1],
  [4, 0], [3, 0], [2, 0], [1, 0]
];
const startIndex = perimeter.findIndex(([r, c]) => r === 1 && c === 0);
assert.equal(startIndex, 15);
const clockwiseCoords = Array.from({ length: 16 },
  (_, i) => perimeter[(startIndex + i) % 16]);
const counterclockwiseCoords = Array.from({ length: 16 },
  (_, i) => perimeter[(startIndex - i + 16) % 16]);
const valuesAt = (coords) => coords.map(([r, c]) => square[r][c]);
const ringCW = valuesAt(clockwiseCoords);
const ringCCW = valuesAt(counterclockwiseCoords);
assert.deepEqual(ringCW,
  [366, 272, 138, 341, 131, 151, 18, 226, 366, 272, 138, 341, 131, 151, 18, 226]);
assert.equal(new Set(ringCW).size, 8);
assert.ok(ringCW.every((v, i) => v === ringCW[(i + 8) % 16]));

const keyCW = ringCW.map((v) => phi(v) % 29);
const keyCCW = ringCCW.map((v) => phi(v) % 29);
assert.deepEqual(keyCW, [4, 12, 15, 10, 14, 5, 6, 25, 4, 12, 15, 10, 14, 5, 6, 25]);
assert.equal(new Set(keyCW).size, 8);

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const pages = read("resources/lp2-transcription.txt").split("%");
assert.equal(pages.length, 57);
const page15 = Array.from(pages[15]).filter((rune) => runeIndex.has(rune))
  .map((rune) => runeIndex.get(rune));
assert.equal(page15.length, 159);
const cipher = page15.slice(9); // original red arrow selects body after 9-rune heading
assert.equal(cipher.length, 150);
const mod = (n) => ((n % 29) + 29) % 29;
const decrypt = (ct, key) => ct.map((c, i) => mod(c - key[i % key.length]));
const encrypt = (pt, key) => pt.map((p, i) => mod(p + key[i % key.length]));
const plainCW = decrypt(cipher, keyCW);
const plainCCW = decrypt(cipher, keyCCW);
assert.deepEqual(encrypt(plainCW, keyCW), cipher);
assert.deepEqual(encrypt(plainCCW, keyCCW), cipher);

function ioc(values) {
  const counts = new Uint32Array(29);
  for (const value of values) counts[value]++;
  let numerator = 0;
  for (const count of counts) numerator += count * (count - 1);
  return numerator / (values.length * (values.length - 1));
}

// Exact GP orthography and smoothed trigram scorer reused from the repository's
// original grid_keyskip_viterbi.cjs language-scoring implementation.
const MOD = 29;
const digraphs = { TH: 2, NG: 21, EO: 12, OE: 22, AE: 25, IA: 27, EA: 28 };
const letters = {
  A: 24, B: 17, C: 5, D: 23, E: 18, F: 0, G: 6, H: 8, I: 10, J: 11,
  K: 5, L: 20, M: 19, N: 9, O: 3, P: 13, Q: 5, R: 4, S: 15, T: 16,
  U: 1, V: 1, W: 7, X: 14, Y: 26, Z: 15
};
function encode(text) {
  const source = text.toUpperCase().replace(/[^A-Z]/g, "");
  const output = [];
  for (let i = 0; i < source.length; i++) {
    const digraph = digraphs[source.slice(i, i + 2)];
    if (digraph !== undefined) {
      output.push(digraph);
      i++;
    } else {
      output.push(letters[source[i]]);
    }
  }
  return output;
}
function train(text) {
  const symbols = encode(text);
  const unigramCounts = new Uint32Array(MOD);
  const bigramCounts = new Uint32Array(MOD * MOD);
  const trigramCounts = new Uint32Array(MOD * MOD * MOD);
  for (let i = 0; i < symbols.length; i++) {
    unigramCounts[symbols[i]]++;
    if (i) bigramCounts[symbols[i - 1] * MOD + symbols[i]]++;
    if (i > 1) trigramCounts[(symbols[i - 2] * MOD + symbols[i - 1]) * MOD + symbols[i]]++;
  }
  const unigram = new Float64Array(MOD);
  const bigram = new Float64Array(MOD * MOD);
  const trigram = new Float64Array(MOD * MOD * MOD);
  for (let c = 0; c < MOD; c++) {
    unigram[c] = Math.log((unigramCounts[c] + 1) / (symbols.length + MOD));
  }
  for (let a = 0; a < MOD; a++) {
    for (let c = 0; c < MOD; c++) {
      const p = (bigramCounts[a * MOD + c] + 12 * Math.exp(unigram[c])) /
        (unigramCounts[a] + 12);
      bigram[a * MOD + c] = Math.log(p);
    }
  }
  for (let a = 0; a < MOD; a++) for (let b = 0; b < MOD; b++) {
    for (let c = 0; c < MOD; c++) {
      const index = (a * MOD + b) * MOD + c;
      const p = (trigramCounts[index] + 9 * Math.exp(bigram[b * MOD + c])) /
        (bigramCounts[a * MOD + b] + 9);
      trigram[index] = Math.log(p);
    }
  }
  return { trigram };
}
function trigramScore(values, model) {
  let total = 0;
  for (let i = 2; i < values.length; i++) {
    total += model.trigram[(values[i - 2] * MOD + values[i - 1]) * MOD + values[i]];
  }
  return total / (values.length - 2);
}
const model = train(read("resources/control/shakespeare_first300k.txt"));
const lp1 = read("resources/liber-primus/lp1-plaintext-reference.txt");
const lp1Start = lp1.indexOf("### 3");
const lp1End = lp1.indexOf("### 5");
assert.ok(lp1Start >= 0 && lp1End > lp1Start);
const englishControl = encode(lp1.slice(lp1Start, lp1End)).slice(0, 150);
assert.equal(englishControl.length, 150);

const output = {
  classification: "BOUNDED NEGATIVE FOR THE FROZEN CELL-6 / CLOCKWISE TOTIENT-RING GP29 MODEL",
  sourceNativeControls: {
    p15FibonacciPrimeSpiral: "PASS (existing original-image SFT)",
    p56TotientPrimeCipher: "PASS (existing authentic solved-page regression)"
  },
  startCell,
  clockwisePerimeter: ringCW,
  counterclockwisePerimeter: ringCCW,
  uniquePerimeterValues: new Set(ringCW).size,
  antipodalPeriod8: ringCW.every((v, i) => v === ringCW[(i + 8) % 16]),
  keyRule: "phi(perimeterCellValue) mod 29",
  clockwiseKey: keyCW,
  clockwiseKeyPeriod: 8,
  target: { physicalPage: 15, pageRunes: page15.length, bodyOffset: 9, bodyRunes: cipher.length },
  exactReencryption: {
    clockwise: JSON.stringify(encrypt(plainCW, keyCW)) === JSON.stringify(cipher),
    counterclockwise: JSON.stringify(encrypt(plainCCW, keyCCW)) === JSON.stringify(cipher)
  },
  metrics: {
    raw: { ioc: ioc(cipher), trigram: trigramScore(cipher, model) },
    clockwiseSubtract: { ioc: ioc(plainCW), trigram: trigramScore(plainCW, model) },
    counterclockwiseSubtract: { ioc: ioc(plainCCW), trigram: trigramScore(plainCCW, model) },
    sourceKnownLP1EnglishControl: { trigram: trigramScore(englishControl, model) }
  },
  clockwisePlaintext: plainCW.map((i) => corpus.runes[i]).join(""),
  counterclockwisePlaintext: plainCCW.map((i) => corpus.runes[i]).join(""),
  limitation: "The p15 Fibonacci/prime values do not enter this key. The test checks only a natural ring traversal; no source-authenticated p15-value-to-perimeter-cell operator was found."
};
console.log(JSON.stringify(output, null, 2));
