"use strict";

/**
 * Frozen standard Hill-cipher test using the source-derived 2014 Stage04
 * 5x5 magic square as a key over the 29-symbol Gematria Primus alphabet.
 *
 * Convention: ciphertext column block C = K * plaintext column block mod 29.
 * Decrypt the 12,955-rune prefix (2,591 complete blocks); leave the final
 * one-rune tail untouched rather than inventing a padding convention.
 *
 * Run from repository root with Node.js 22:
 *   node sims/2014_magic_square_hill_lp2_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const MOD = 29;
const mod = (n) => ((n % MOD) + MOD) % MOD;

// Exact Stage04 magic square reconstructed from the 2013 0_wisdom word-prime
// sums. Reducing the numeric cells modulo the GP alphabet is the only radix
// operation used here.
const sourceSquare = [
  [272, 138, 341, 131, 151],
  [366, 199, 130, 320, 18],
  [226, 245, 91, 245, 226],
  [18, 320, 130, 199, 366],
  [151, 131, 341, 138, 272]
];
const K = sourceSquare.map((row) => row.map(mod));

function inverse(a) {
  for (let i = 1; i < MOD; i++) if (mod(a * i) === 1) return i;
  throw new Error("non-invertible field element");
}

function determinantMod(matrix) {
  const a = matrix.map((row) => row.map(mod));
  let determinant = 1;
  for (let col = 0; col < a.length; col++) {
    let pivot = col;
    while (pivot < a.length && a[pivot][col] === 0) pivot++;
    if (pivot === a.length) return 0;
    if (pivot !== col) {
      [a[pivot], a[col]] = [a[col], a[pivot]];
      determinant = mod(-determinant);
    }
    const value = a[col][col];
    determinant = mod(determinant * value);
    const scale = inverse(value);
    for (let j = col; j < a.length; j++) a[col][j] = mod(a[col][j] * scale);
    for (let row = col + 1; row < a.length; row++) {
      const factor = a[row][col];
      if (factor === 0) continue;
      for (let j = col; j < a.length; j++) {
        a[row][j] = mod(a[row][j] - factor * a[col][j]);
      }
    }
  }
  return determinant;
}

function matrixInverse(matrix) {
  const n = matrix.length;
  const a = matrix.map((row, i) =>
    row.map(mod).concat(Array.from({ length: n }, (_, j) => i === j ? 1 : 0))
  );
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && a[pivot][col] === 0) pivot++;
    if (pivot === n) throw new Error("singular Hill key");
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const scale = inverse(a[col][col]);
    a[col] = a[col].map((x) => mod(x * scale));
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = a[row][col];
      if (factor !== 0) {
        a[row] = a[row].map((x, j) => mod(x - factor * a[col][j]));
      }
    }
  }
  return a.map((row) => row.slice(n));
}

function multiplyVector(matrix, vector) {
  assert.equal(matrix.length, 5);
  assert.equal(vector.length, 5);
  return matrix.map((row) => mod(row.reduce((sum, x, j) => sum + x * vector[j], 0)));
}

function transformBlocks(data, matrix) {
  assert.equal(data.length % 5, 0);
  const out = [];
  for (let i = 0; i < data.length; i += 5) {
    out.push(...multiplyVector(matrix, data.slice(i, i + 5)));
  }
  return out;
}

function ioc(data) {
  const counts = Array(MOD).fill(0);
  for (const x of data) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (data.length * (data.length - 1));
}

const translitIndex = new Map(corpus.translit.map((r, i) => [r, i]));
function englishGp(text) {
  return (text.toUpperCase().match(/[A-Z]+/g) || []).flatMap((word) => {
    const normalized = word.replace(/V/g, "U").replace(/K/g, "C")
      .replace(/Z/g, "S").replace(/Q/g, "C");
    const parts = normalized.match(/TH|NG|EO|OE|AE|IA|EA|[A-Z]/g) || [];
    return parts.map((part) => {
      const index = translitIndex.get(part);
      assert(index !== undefined, "unmapped GP token " + part);
      return index;
    });
  });
}

function trigramModel(data, alpha = 0.1) {
  const triples = new Map();
  const pairs = new Map();
  for (let i = 2; i < data.length; i++) {
    const prefix = data[i - 2] * MOD + data[i - 1];
    const triple = prefix * MOD + data[i];
    triples.set(triple, (triples.get(triple) || 0) + 1);
    pairs.set(prefix, (pairs.get(prefix) || 0) + 1);
  }
  return { triples, pairs, alpha };
}

function trigramScore(data, model) {
  let total = 0;
  let n = 0;
  for (let i = 2; i < data.length; i++) {
    const prefix = data[i - 2] * MOD + data[i - 1];
    const triple = prefix * MOD + data[i];
    total += Math.log(
      ((model.triples.get(triple) || 0) + model.alpha) /
      ((model.pairs.get(prefix) || 0) + MOD * model.alpha)
    );
    n++;
  }
  return total / n;
}

const original = corpus.pages.slice(0, 56).flatMap((page) => page.indices);
assert.equal(original.length, 12956);
assert.equal(original.length % 5, 1);
const tail = original.at(-1);
const usable = original.slice(0, -1);
assert.equal(usable.length, 12955);
assert.equal(usable.length % 5, 0);

const determinant = determinantMod(K);
assert.equal(determinant, 3);
const Kinv = matrixInverse(K);
const decoded = transformBlocks(usable, Kinv);

// Implementation positive: a native-English GP stream survives this exact
// 5x5 key, block convention, and inverse.
const shakespeare = englishGp(read("resources/control/shakespeare_first300k.txt"));
const gibran = englishGp(read("resources/control/gibran_prophet_58585.txt"));
const plant = shakespeare.slice(0, usable.length);
assert.equal(plant.length, usable.length);
const encryptedPlant = transformBlocks(plant, K);
assert.deepEqual(transformBlocks(encryptedPlant, Kinv), plant);

const shakespeareModel = trigramModel(shakespeare);
const gibranModel = trigramModel(gibran);
const scores = {
  raw: {
    shakespeare: trigramScore(original, shakespeareModel),
    gibran: trigramScore(original, gibranModel)
  },
  decoded: {
    shakespeare: trigramScore(decoded, shakespeareModel),
    gibran: trigramScore(decoded, gibranModel)
  },
  native: {
    shakespeare: trigramScore(shakespeare, shakespeareModel),
    gibran: trigramScore(gibran, gibranModel)
  }
};

const output = {
  classification: "single source-motivated Hill-key hypothesis; no LP2 plaintext recovered",
  sourceSquare,
  keyMod29: K,
  determinantMod29: determinant,
  inverseMod29: Kinv,
  convention: "C = K*P for column vectors; decrypt P = K^-1*C",
  framing: {
    totalRunes: original.length,
    processedRunes: usable.length,
    blockSize: 5,
    blocks: usable.length / 5,
    untouchedTerminalRune: corpus.translit[tail],
    untouchedTerminalIndex: tail,
    rationale: "largest prefix divisible by the source-selected 5x5 block size; no padding or phase search"
  },
  output: {
    rawIoC: ioc(original),
    decodedIoC: ioc(decoded),
    trigramScores: scores,
    smoothingAlpha: 0.1,
    first120Decoded: decoded.slice(0, 120).map((x) => corpus.translit[x]).join("")
  },
  positiveControl: {
    source: "first 12,955 Shakespeare GP symbols",
    runes: plant.length,
    exactRecovered: transformBlocks(encryptedPlant, Kinv).length,
    exact: true
  },
  scope: "This rejects only the printed Stage04 square as a standard column-vector Hill key over the 12,955-rune prefix. It does not test transposed matrices, alternative padding, other block modes, or other uses of the square."
};

assert(Math.abs(ioc(original) - 0.03447839786450569) < 1e-12);
assert(Math.abs(ioc(decoded) - 0.03448528227453531) < 1e-12);
assert(Math.abs(scores.raw.shakespeare - (-4.679396311885891)) < 1e-9);
assert(Math.abs(scores.decoded.shakespeare - (-4.711838551070626)) < 1e-9);
assert(Math.abs(scores.raw.gibran - (-4.349374190815645)) < 1e-9);
assert(Math.abs(scores.decoded.gibran - (-4.396985285663181)) < 1e-9);

console.log(JSON.stringify(output, null, 2));
