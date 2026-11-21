"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildSourceNativeTrigramModel } = require("./lp1_source_native_trigram_model.cjs");

/**
 * Exact source-first Cicada 2016 p50 11-cycle -> tree p32 11x11
 * cyclic convolution inverse. The original codeword and key are immutable.
 */
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const tokens = table.pages.flatMap(page => page.tokens);
assert.equal(tokens.length, 256);
const base60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const bytes = tokens.map(pair => 60 * base60.indexOf(pair[0]) + base60.indexOf(pair[1]));
assert(bytes.every(n => n >= 0 && n < 256));
const cycle = [0, 203, 68, 199, 47, 76, 114, 197, 115, 247, 192];
assert(cycle.every((state, i) => bytes[state] === cycle[(i + 1) % cycle.length]));
const phase = cycle.indexOf(114); // GP0(SEEK)=27 uniquely on the 11-cycle
const orbit = cycle.slice(phase).concat(cycle.slice(0, phase));
assert.deepEqual(orbit, [114, 197, 115, 247, 192, 0, 203, 68, 199, 47, 76]);
const key = orbit.map(v => v % 29);
assert.deepEqual(key, [27, 23, 28, 15, 18, 0, 0, 10, 25, 18, 18]);

const m = x => ((x % 29) + 29) % 29;
function invmod(x) {
  for (let k = 1; k < 29; k++) if (m(x * k) === 1) return k;
  throw new Error("singular original convolution kernel");
}
function inverse(A) {
  const n = A.length;
  const a = A.map((r, i) => r.concat(Array.from({ length: n }, (_, j) => +(i === j))));
  for (let c = 0; c < n; c++) {
    let p = c;
    while (p < n && a[p][c] === 0) p++;
    assert(p < n, "original convolution operator must be invertible");
    [a[p], a[c]] = [a[c], a[p]];
    const iv = invmod(a[c][c]);
    a[c] = a[c].map(x => m(x * iv));
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const factor = a[r][c];
      a[r] = a[r].map((v, j) => m(v - factor * a[c][j]));
    }
  }
  return a.map(r => r.slice(n));
}
function multiply(A, B) {
  assert(A[0].length === B.length);
  return A.map(row => Array.from({ length: B[0].length }, (_, col) =>
    m(row.reduce((sum, x, k) => sum + x * B[k][col], 0))));
}
const trans = A => A[0].map((_, col) => A.map(row => row[col]));
const dim = 11;
const H = Array.from({ length: dim }, (_, i) =>
  Array.from({ length: dim }, (_, j) => key[(i - j + dim) % dim]));
const Hi = inverse(H);
const I = multiply(H, Hi);
assert(I.every((row, i) => row.every((v, j) => v === +(i === j))));
const p32 = corpus.pages.find(page => page.page === 32).indices;
assert.equal(p32.length, 121);
const A = Array.from({ length: 11 }, (_, i) => p32.slice(11 * i, 11 * (i + 1)));
const model = buildSourceNativeTrigramModel({
  corpus, referenceText: read("resources/liber-primus/lp1-plaintext-reference.txt")
});
const plant = Array.from({ length: dim }, (_, i) =>
  Array.from({ length: dim }, (_, j) => model.training[(11 * i + j) % model.training.length]));
for (const [name, encrypt, decrypt] of [
  ["row-cyclic", P => multiply(P, trans(H)), C => multiply(C, trans(Hi))],
  ["column-cyclic", P => multiply(H, P), C => multiply(Hi, C)],
  ["separable-2d", P => multiply(multiply(H, P), trans(H)),
    C => multiply(multiply(Hi, C), trans(Hi))]
]) {
  assert.deepEqual(decrypt(encrypt(plant)), plant, "native GP planted 121-rune inverse");
}
function ioc(x) {
  const freq = new Array(29).fill(0);
  for (const v of x) freq[v]++;
  return freq.reduce((s, n) => s + n * (n - 1), 0) / (x.length * (x.length - 1));
}
const source = p32.slice();
const results = [
  ["row-cyclic", multiply(A, trans(Hi)).flat()],
  ["column-cyclic", multiply(Hi, A).flat()],
  ["separable-2d", multiply(multiply(Hi, A), trans(Hi)).flat()]
].map(([operator, output]) => ({
  operator,
  ioc: ioc(output),
  meanNativeTrigram: model.scoreStream(output).mean,
  plaintextCandidate: model.spell(output)
}));
console.log(JSON.stringify({
  originalPage: 32,
  n: source.length,
  sourceCycle: cycle, selectedPhase: 114, key, inverseExists: true,
  sourceIoc: ioc(source),
  sourceMeanNativeTrigram: model.scoreStream(source).mean,
  modelSolvedP57Mean: model.p57Score,
  results
}, null, 2));
assert(results.every(x => x.ioc < 0.045));
assert(results.every(x => x.meanNativeTrigram < -2.9));
console.log("PASS: original p50-cycle p32 GF29 circular deconvolution offers no native plaintext");
