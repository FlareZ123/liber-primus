"use strict";
/**
 * Direct Hill-cipher test of the two 5x5 matrices in the original 2014
 * OpenPuff square set. Node.js 22; read-only, no external dependencies.
 *
 * This tests a simple, human-motivated interpretation of those printed
 * matrices over GP29. It does not claim the historical square was intended
 * as a Hill key.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const mod = (x) => ((x % 29) + 29) % 29;

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const squareBlocks = read("resources/cicada2014-openpuff-magic-squares.txt")
  .trim().split(/\r?\n\s*\r?\n/)
  .map(block => block.trim().split(/\r?\n/)
    .map(line => line.trim().split(/\s+/).map(Number)));

const matrices = [
  { name: "2014-5x5-3301", matrix: squareBlocks[0] },
  { name: "2014-5x5-1033", matrix: squareBlocks[2] }
];
for (const item of matrices) {
  assert.equal(item.matrix.length, 5);
  assert.ok(item.matrix.every(row => row.length === 5));
}

function invScalar(x) {
  for (let i = 1; i < 29; i++) if (mod(x * i) === 1) return i;
  throw new Error("noninvertible scalar " + x);
}
function determinantMod29(input) {
  const a = input.map(row => row.map(mod));
  let det = 1;
  for (let col = 0; col < a.length; col++) {
    let pivot = a.findIndex((row, i) => i >= col && row[col] !== 0);
    if (pivot < 0) return 0;
    if (pivot !== col) {
      [a[pivot], a[col]] = [a[col], a[pivot]];
      det = mod(-det);
    }
    const v = a[col][col];
    det = mod(det * v);
    const iv = invScalar(v);
    for (let row = col + 1; row < a.length; row++) {
      const factor = mod(a[row][col] * iv);
      for (let j = col; j < a.length; j++) {
        a[row][j] = mod(a[row][j] - factor * a[col][j]);
      }
    }
  }
  return det;
}
function invertMatrix(input) {
  const n = input.length;
  const a = input.map((row, i) => row.map(mod).concat(
    Array.from({ length: n }, (_, j) => Number(i === j))
  ));
  for (let col = 0; col < n; col++) {
    const pivot = a.findIndex((row, i) => i >= col && row[col] !== 0);
    if (pivot < 0) throw new Error("singular matrix");
    [a[pivot], a[col]] = [a[col], a[pivot]];
    const scale = invScalar(a[col][col]);
    for (let j = 0; j < 2 * n; j++) a[col][j] = mod(a[col][j] * scale);
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = a[row][col];
      for (let j = 0; j < 2 * n; j++) {
        a[row][j] = mod(a[row][j] - factor * a[col][j]);
      }
    }
  }
  return a.map(row => row.slice(n));
}
function transpose(a) {
  return a[0].map((_, j) => a.map(row => row[j]));
}
function orientations(input) {
  const out = [];
  const seen = new Set();
  for (const t of [false, true]) {
    for (const r of [false, true]) {
      for (const c of [false, true]) {
        let a = input.map(row => row.slice());
        if (t) a = transpose(a);
        if (r) a = a.slice().reverse();
        if (c) a = a.map(row => row.slice().reverse());
        const key = JSON.stringify(a);
        if (!seen.has(key)) {
          seen.add(key);
          out.push({ tag: "transpose=" + t + ",rows=" + r + ",cols=" + c, matrix: a });
        }
      }
    }
  }
  return out;
}
function applyVector(vector, matrix) {
  return matrix.map(row => mod(row.reduce((sum, x, i) => sum + x * vector[i], 0)));
}
function applyBlocks(data, matrix, layout) {
  assert.equal(data.length % 5, 0);
  const n = data.length / 5;
  const out = Array(data.length);
  for (let block = 0; block < n; block++) {
    const vector = Array.from({ length: 5 }, (_, i) =>
      data[layout === "adjacent" ? block * 5 + i : i * n + block]
    );
    const encoded = applyVector(vector, matrix);
    for (let i = 0; i < 5; i++) {
      out[layout === "adjacent" ? block * 5 + i : i * n + block] = encoded[i];
    }
  }
  return out;
}
function applyUnit(input, matrix, phase) {
  const usable = input.slice(phase, phase + Math.floor((input.length - phase) / 5) * 5);
  const out = [];
  for (let i = 0; i < usable.length; i += 5) {
    out.push(...applyVector(usable.slice(i, i + 5), matrix));
  }
  return out;
}
function ioc(data) {
  const counts = Array(29).fill(0);
  for (const x of data) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (data.length * (data.length - 1));
}
function encodeEnglish(text) {
  const glyphs = corpus.translit.map((g, i) => ({ g, i }))
    .sort((a, b) => b.g.length - a.g.length);
  const normalized = text.toUpperCase().replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Q/g, "CU").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    if (normalized[i] < "A" || normalized[i] > "Z") {
      i++;
      continue;
    }
    const match = glyphs.find(x => normalized.startsWith(x.g, i));
    if (match) {
      out.push(match.i);
      i += match.g.length;
    } else {
      i++;
    }
  }
  return out;
}
function makeTrigramScore(training) {
  const bigrams = new Uint32Array(29 * 29);
  const trigrams = new Uint32Array(29 ** 3);
  for (let i = 2; i < training.length; i++) {
    const pair = training[i - 2] * 29 + training[i - 1];
    bigrams[pair]++;
    trigrams[pair * 29 + training[i]]++;
  }
  const logp = Float64Array.from(trigrams, (n, index) =>
    Math.log((n + 0.5) / (bigrams[Math.floor(index / 29)] + 14.5))
  );
  return data => {
    let total = 0;
    for (let i = 2; i < data.length; i++) {
      total += logp[(data[i - 2] * 29 + data[i - 1]) * 29 + data[i]];
    }
    return total / (data.length - 2);
  };
}

const unknownPages = corpus.pages.filter(p => p.page >= 0 && p.page <= 55);
const pageVectors = unknownPages.map(p => p.indices);
const wholeBook = pageVectors.flat();
assert.equal(unknownPages.length, 56);
assert.equal(wholeBook.length, 12956);

const cuneiformPages = corpus.pages.filter(p => p.page >= 33 && p.page <= 39);
const cuneiform = cuneiformPages.flatMap(p =>
  p.page === 33 ? p.indices.slice(91) : p.indices
);
assert.equal(cuneiform.length, 1589);
const cuneiformComplete = cuneiform.slice(0, Math.floor(cuneiform.length / 5) * 5);
assert.equal(cuneiformComplete.length, 1585);

const training = encodeEnglish(read("resources/control/emerson_essays_2944.txt"));
const score = makeTrigramScore(training);
const native = encodeEnglish(read("resources/control/shakespeare_first300k.txt"))
  .slice(10000, 11585);
assert.equal(native.length, 1585);

const wholeResults = [];
const sectionResults = [];
const determinantSummary = [];

for (const item of matrices) {
  const determinant = determinantMod29(item.matrix);
  assert.notEqual(determinant, 0);
  determinantSummary.push({ matrix: item.name, determinantMod29: determinant });
  const variantsSeen = orientations(item.matrix);
  assert.equal(variantsSeen.length, 4);
  for (const orientation of variantsSeen) {
    const m = orientation.matrix.map(row => row.map(mod));
    const inv = invertMatrix(m);
    const variants = [
      ["M", m],
      ["inverse", inv],
      ["transpose", transpose(m)],
      ["inverse-transpose", transpose(inv)]
    ];
    for (const [variant, key] of variants) {
      const inverseKey = invertMatrix(key);
      for (const scope of ["book", "page"]) {
        for (let phase = 0; phase < 5; phase++) {
          const decoded = scope === "book"
            ? applyUnit(wholeBook, key, phase)
            : pageVectors.flatMap(page => applyUnit(page, key, phase));
          // The inverse is checked on a same-shaped native control below.
          wholeResults.push({
            matrix: item.name, orientation: orientation.tag, variant,
            scope, phase, runes: decoded.length,
            ioc: ioc(decoded), score: score(decoded),
            prefix: decoded.slice(0, 60).map(i => corpus.translit[i]).join("")
          });
        }
      }
      for (const layout of ["adjacent", "five-lanes"]) {
        const decoded = applyBlocks(cuneiformComplete, key, layout);
        assert.deepEqual(applyBlocks(decoded, inverseKey, layout), cuneiformComplete);
        const planted = applyBlocks(native, key, layout);
        assert.deepEqual(applyBlocks(planted, inverseKey, layout), native);
        sectionResults.push({
          matrix: item.name, orientation: orientation.tag, variant, layout,
          runes: decoded.length, ioc: ioc(decoded), score: score(decoded),
          prefix: decoded.slice(0, 80).map(i => corpus.translit[i]).join("")
        });
      }
    }
  }
}

assert.equal(wholeResults.length, 320);
assert.equal(sectionResults.length, 64);
wholeResults.sort((a, b) => b.ioc - a.ioc);
sectionResults.sort((a, b) => b.score - a.score);

console.log(JSON.stringify({
  source: {
    unknownPages: unknownPages.length,
    unknownRunes: wholeBook.length,
    cuneiformRunes: cuneiform.length,
    cuneiformScoredRunes: cuneiformComplete.length,
    cuneiformDroppedTrailingRunes: cuneiform.length - cuneiformComplete.length,
    emersonTrainingRunes: training.length,
    nativePositiveControlRunes: native.length,
    matrices: determinantSummary
  },
  wholeBook: {
    models: wholeResults.length,
    rawIoC: ioc(wholeBook),
    bestByIoC: wholeResults.slice(0, 8)
  },
  cuneiform: {
    models: sectionResults.length,
    rawIoC: ioc(cuneiformComplete),
    rawTrigramScore: score(cuneiformComplete),
    nativeControlIoC: ioc(native),
    nativeControlTrigramScore: score(native),
    bestByTrigramScore: sectionResults.slice(0, 8)
  },
  interpretation: "Bounded direct Hill-key test of the two original 2014 5x5 squares; no historical Hill instruction is established."
}, null, 2));
