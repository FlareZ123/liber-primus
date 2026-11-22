"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildSourceNativeTrigramModel } = require("./lp1_source_native_trigram_model.cjs");

/**
 * Original-rune, source-shaped test of the two p6/p7 red spans as a Hill-5 key.
 * No guessed plaintext, unknown secret or output-fitted permutation is used.
 */
const root = path.resolve(__dirname, "..");
const load = name => fs.readFileSync(path.join(root, name), "utf8").replace(/\r\n/g, "\n");
const corpus = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(load("resources/liber-primus/lp2-ink-annotations.json"));
const byPage = new Map(corpus.pages.map(page => [page.page, page.indices]));
const inks = new Map(ink.pages.map(page => [page.page, page]));
const mod = value => ((value % 29) + 29) % 29;
const inverse29 = value => {
  for (let i = 1; i < 29; i++) if (mod(value * i) === 1) return i;
  throw new Error("singular pivot");
};

function redIndices(pageNumber, expectedStart, expectedLength) {
  const span = inks.get(pageNumber).red_spans[0];
  assert.equal(span.start, expectedStart);
  assert.equal(span.length, expectedLength);
  return byPage.get(pageNumber).slice(span.start, span.start + span.length);
}

const key = redIndices(6, 71, 11).concat(redIndices(7, 194, 14));
assert.equal(key.length, 25);
assert.deepEqual(key, [
  24, 16, 14, 17, 19, 6, 27, 15, 17, 14, 12, 23, 3,
  22, 16, 2, 25, 5, 7, 11, 14, 28, 6, 28, 19
]);
const K = Array.from({ length: 5 }, (_, i) => key.slice(5 * i, 5 * i + 5));

function determinant(A) {
  A = A.map(row => row.slice());
  let out = 1;
  for (let col = 0; col < 5; col++) {
    let pivot = col;
    while (pivot < 5 && A[pivot][col] === 0) pivot++;
    if (pivot === 5) return 0;
    if (pivot !== col) {
      [A[pivot], A[col]] = [A[col], A[pivot]];
      out = mod(-out);
    }
    const v = A[col][col];
    out = mod(out * v);
    const iv = inverse29(v);
    for (let row = col + 1; row < 5; row++) {
      const factor = mod(A[row][col] * iv);
      for (let j = col; j < 5; j++) A[row][j] = mod(A[row][j] - factor * A[col][j]);
    }
  }
  return out;
}

function inverseMatrix(A) {
  const n = 5;
  const a = A.map((row, i) => row.concat(Array.from({ length: n }, (_, j) => +(i === j))));
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && a[pivot][col] === 0) pivot++;
    assert(pivot < n);
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const iv = inverse29(a[col][col]);
    a[col] = a[col].map(x => mod(x * iv));
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = a[row][col];
      a[row] = a[row].map((v, j) => mod(v - factor * a[col][j]));
    }
  }
  return a.map(row => row.slice(n));
}

function hill(A, stream) {
  assert.equal(stream.length % 5, 0);
  const out = [];
  for (let i = 0; i < stream.length; i += 5) {
    const x = stream.slice(i, i + 5);
    for (const row of A) out.push(mod(row.reduce((s, v, j) => s + v * x[j], 0)));
  }
  return out;
}

function ioc(x) {
  const f = new Array(29).fill(0);
  for (const i of x) f[i]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (x.length * (x.length - 1));
}

assert.equal(determinant(K), 12);
const Ki = inverseMatrix(K);
const Kt = K.map((_, i) => K.map(row => row[i]));
const Kti = inverseMatrix(Kt);
const product = hill(Ki, hill(K, Array.from({ length: 95 }, (_, i) => i % 29)));
assert.deepEqual(product, Array.from({ length: 95 }, (_, i) => i % 29));

const chapterPages = [8, 9, 10, 11, 12, 13, 14];
assert.deepEqual(chapterPages.map(i => byPage.get(i).length), [255, 268, 263, 273, 261, 272, 137]);
const raw = chapterPages.flatMap(i => byPage.get(i));
assert.equal(raw.length, 1729);
raw.splice(692, 0, 7); // The printed Arabic numeral on p10, treated literally as GP index 7.
assert.equal(raw.length, 1730);
const order = [2, 4, 0, 3, 1], height = 346;
const colIn = Array.from({ length: height }, (_, row) =>
  order.map(col => raw[col * height + row])).flat();
const colOut = order.flatMap(col => raw.filter((_, i) => i % 5 === col));
assert.equal(colIn[0], 7);
const starts = [
  ["original", raw],
  ["five-dot-column-interleave", colIn],
  ["five-dot-column-deinterleave", colOut]
];
const model = buildSourceNativeTrigramModel({
  corpus,
  referenceText: load("resources/liber-primus/lp1-plaintext-reference.txt")
});
assert(model.p57Score > -2.5);
assert(model.trainingScore > -2.3);
const results = [];
for (const [read, x] of starts) {
  for (const [matrix, enc, dec] of [["row-major", K, Ki], ["transposed", Kt, Kti]]) {
    const planted = Array.from({ length: x.length }, (_, i) => model.training[i % model.training.length]);
    assert.deepEqual(hill(dec, hill(enc, planted)), planted);
    for (const [operation, M] of [["decrypt", dec], ["direct", enc]]) {
      const y = hill(M, x);
      results.push({
        read, matrix, operation,
        meanTrigramLog: +model.scoreStream(y).mean.toFixed(8),
        ioc: +ioc(y).toFixed(8),
        first60: model.spell(y.slice(0, 60))
      });
    }
  }
}
results.sort((a, b) => b.meanTrigramLog - a.meanTrigramLog);
const baseline = model.scoreStream(raw).mean;
console.log(JSON.stringify({
  source: "unaltered LP2 red p6:71+11, p7:194+14, p8..14 original with literal 7",
  key, determinant: determinant(K),
  n: raw.length,
  nativeLP1: model.trainingScore,
  nativeP57: model.p57Score,
  originalBaseline: baseline,
  originalIoc: ioc(raw),
  variants: results
}, null, 2));
assert.equal(results.length, 12);
assert(results[0].meanTrigramLog < -2.8, "An authentic language candidate must be inspected");
assert(results[0].ioc < 0.04, "Potential letter-frequency recovery must be inspected");
console.log("PASS: source-original finite red25/Hill5 family has no native-language receiver");
