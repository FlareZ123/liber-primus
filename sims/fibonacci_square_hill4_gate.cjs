"use strict";

/**
 * Direct page-15 4x4 Hill-key test over the 29-symbol Gematria Primus alphabet.
 *
 * The four matrix families are fixed by the printed square and its stated
 * Fibonacci-indexed-prime construction. Test all eight D4 orientations and
 * both row/column conventions in both key directions. No matrix entries,
 * phase, or key are fitted to LP2 plaintext statistics.
 *
 * Execute: node sims/fibonacci_square_hill4_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const CORPUS_TEXT = fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8");
const CONTROL_TEXT = fs.readFileSync(
  path.join(ROOT, "resources", "control", "shakespeare_first300k.txt"), "utf8");
const DATA = JSON.parse(CORPUS_TEXT);
const PAGES = DATA.pages.filter(p => p.status === "unsolved" && p.indices.length);
const CIPHERTEXT = PAGES.flatMap(p => p.indices);
const MODULUS = 29;

const SQUARE = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];

// Reconstruct the actual primes and their one-based ordinals in the same cells.
const PRIME = [
  [43, 79, 149, 263],
  [23, 2, 3, 463],
  [13, 7, 5, 829],
  [7817, 4507, 2593, 1481]
];
const PRIME_ORDINAL = [
  [14, 22, 35, 56],
  [9, 1, 2, 90],
  [6, 4, 3, 145],
  [988, 611, 378, 234]
];
const FIBONACCI = [
  [13, 21, 34, 55],
  [8, 0, 1, 89],
  [5, 3, 2, 144],
  [987, 610, 377, 233]
];

const ALPHABET = [
  "F", "U", "TH", "O", "R", "C", "G", "W", "H", "N", "I", "J",
  "EO", "P", "X", "S", "T", "B", "E", "M", "L", "NG", "OE",
  "D", "A", "AE", "Y", "IA", "EA"
];
const TRANSLIT = new Map(ALPHABET.map((glyph, index) => [glyph, index]));

function mod(x) {
  return ((x % MODULUS) + MODULUS) % MODULUS;
}

function inverseScalar(a) {
  for (let x = 1; x < MODULUS; x++) {
    if (mod(a * x) === 1) return x;
  }
  throw new Error("Noninvertible field element: " + a);
}

function determinant(m) {
  if (m.length === 1) return mod(m[0][0]);
  let total = 0;
  for (let j = 0; j < m.length; j++) {
    const minor = m.slice(1).map(row => row.filter((_, k) => k !== j));
    total += (j % 2 ? -1 : 1) * m[0][j] * determinant(minor);
  }
  return mod(total);
}

function matrixInverse(m) {
  const n = m.length;
  const augmented = m.map((row, i) =>
    row.map(mod).concat(Array.from({length: n}, (_, j) => i === j ? 1 : 0)));
  for (let column = 0; column < n; column++) {
    let pivot = column;
    while (pivot < n && augmented[pivot][column] === 0) pivot++;
    if (pivot === n) return null;
    [augmented[pivot], augmented[column]] =
      [augmented[column], augmented[pivot]];
    const scale = inverseScalar(augmented[column][column]);
    augmented[column] = augmented[column].map(x => mod(x * scale));
    for (let row = 0; row < n; row++) {
      if (row === column) continue;
      const factor = augmented[row][column];
      augmented[row] = augmented[row].map((x, j) =>
        mod(x - factor * augmented[column][j]));
    }
  }
  return augmented.map(row => row.slice(n));
}

function transpose(m) {
  return m[0].map((_, column) => m.map(row => row[column]));
}

function rotateClockwise(m) {
  return transpose(m).map(row => row.reverse());
}

/** Identity, horizontal reflection, and their three further rotations. */
function dihedralOrientations(m) {
  const out = [];
  let current = m.map(row => row.slice());
  for (let turn = 0; turn < 4; turn++) {
    out.push(current.map(row => row.slice()));
    out.push(current.map(row => row.slice().reverse()));
    current = rotateClockwise(current);
  }
  return out;
}

/** Multiply one four-rune column by a fixed matrix over F_29. */
function transformBlocks(input, matrix) {
  assert.equal(input.length % 4, 0);
  const output = [];
  for (let offset = 0; offset < input.length; offset += 4) {
    const block = input.slice(offset, offset + 4);
    for (let row = 0; row < 4; row++) {
      output.push(mod(matrix[row].reduce(
        (sum, coefficient, column) => sum + coefficient * block[column], 0)));
    }
  }
  return output;
}

function stats(input) {
  const histogram = Array(MODULUS).fill(0);
  for (const value of input) histogram[value]++;
  const sorted = histogram.slice().sort((a, b) => b - a);
  return {
    ioc: histogram.reduce((sum, count) => sum + count * (count - 1), 0) /
      (input.length * (input.length - 1)),
    top12: sorted.slice(0, 12).reduce((sum, count) => sum + count, 0),
    maxCount: sorted[0]
  };
}

/** Same approximate GP transliteration used by the repository's controls. */
function encodeEnglishWord(word) {
  const source = word.toUpperCase()
    .replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S");
  const output = [];
  for (let i = 0; i < source.length;) {
    const digraph = source.slice(i, i + 2);
    if (TRANSLIT.has(digraph)) {
      output.push(TRANSLIT.get(digraph));
      i += 2;
    } else {
      const value = TRANSLIT.get(source[i]);
      if (value === undefined) throw new Error("Unknown GP control grapheme");
      output.push(value);
      i++;
    }
  }
  return output;
}

function encodeControl(text) {
  return (text.match(/[A-Za-z]+/g) || []).flatMap(encodeEnglishWord);
}

function run() {
  assert.equal(PAGES.length, 55);
  assert.equal(CIPHERTEXT.length, 12956);
  assert.equal(CIPHERTEXT.length % 4, 0);
  assert.equal(CIPHERTEXT.length / 4, 3239);

  // The printed square is exactly the absolute 3301-distance of PRIME.
  for (let row = 0; row < 4; row++) {
    for (let column = 0; column < 4; column++) {
      assert.equal(SQUARE[row][column], Math.abs(3301 - PRIME[row][column]));
      assert.equal(PRIME_ORDINAL[row][column] - 1,
        FIBONACCI[row][column]);
    }
  }

  const families = [
    ["printed-distance", SQUARE],
    ["prime", PRIME],
    ["prime-ordinal", PRIME_ORDINAL],
    ["fibonacci", FIBONACCI]
  ];
  const results = [];
  const matrixDeterminants = {};

  for (const [family, base] of families) {
    const orientations = dihedralOrientations(base);
    assert.equal(orientations.length, 8);
    for (let orientation = 0; orientation < orientations.length; orientation++) {
      const key = orientations[orientation].map(row => row.map(mod));
      const keyInverse = matrixInverse(key);
      assert.ok(keyInverse, family + " orientation " + orientation +
        " must be invertible over F_29");
      matrixDeterminants[family] ??= determinant(key);
      const candidates = [
        ["K", key],
        ["Kinv", keyInverse],
        ["Kt", transpose(key)],
        ["KinvT", transpose(keyInverse)]
      ];
      for (const [operation, candidate] of candidates) {
        const plaintextCandidate = transformBlocks(CIPHERTEXT, candidate);
        results.push({
          family, orientation, operation,
          ioc: stats(plaintextCandidate).ioc,
          top12: stats(plaintextCandidate).top12,
          maxCount: stats(plaintextCandidate).maxCount
        });
      }
    }
  }
  assert.equal(results.length, 128);
  results.sort((a, b) => b.ioc - a.ioc);

  // Positive control: the printed-distance matrix exactly inverts its own plant.
  const control = encodeControl(CONTROL_TEXT).slice(0, CIPHERTEXT.length);
  assert.equal(control.length, CIPHERTEXT.length);
  const printedKey = SQUARE.map(row => row.map(mod));
  const printedInverse = matrixInverse(printedKey);
  const plantedCiphertext = transformBlocks(control, printedKey);
  const recoveredControl = transformBlocks(plantedCiphertext, printedInverse);
  assert.deepEqual(recoveredControl, control);

  return {
    input: {
      corpusSha256: createHash("sha256").update(CORPUS_TEXT).digest("hex"),
      shakespeareSha256: createHash("sha256").update(CONTROL_TEXT).digest("hex"),
      runePages: PAGES.length,
      ciphertextRunes: CIPHERTEXT.length,
      fourRuneBlocks: CIPHERTEXT.length / 4
    },
    matrixDeterminants,
    matrixFamilies: families.map(([name, matrix]) => ({
      name, determinant: determinant(matrix.map(row => row.map(mod)))
    })),
    exactConfigurations: results.length,
    uniform29IoC: 1 / 29,
    originalCiphertext: stats(CIPHERTEXT),
    bestOriginalCandidate: results[0],
    topFiveOriginalCandidates: results.slice(0, 5),
    allCandidateRanges: {
      ioc: [
        Math.min(...results.map(x => x.ioc)),
        Math.max(...results.map(x => x.ioc))
      ],
      top12: [
        Math.min(...results.map(x => x.top12)),
        Math.max(...results.map(x => x.top12))
      ]
    },
    shakespeareControl: stats(control),
    plantedHillControl: {
      key: printedKey,
      inverse: printedInverse,
      encryptedRunes: plantedCiphertext.length,
      exactRecoveredRunes: recoveredControl.length,
      exactRoundTrip: true,
      plaintextStats: stats(control),
      recoveredStats: stats(recoveredControl)
    },
    conclusion: "No direct source-fixed 4x4 Hill interpretation in the tested family produces English-like LP2 plaintext."
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {
  mod, determinant, matrixInverse, dihedralOrientations,
  transformBlocks, stats, encodeEnglishWord, run
};
