"use strict";

/**
 * Source-frozen red title 3x5x7 tensor Hill inverse on physical LP2 pp33–39.
 *
 * Candidate clue: the 225 original red runes are 2*(3*5*7)+3+5+7;
 * proposed, not authenticated footer "MIX AN END PARABLE" yields three
 * candidate GP29 key vectors of dimensions 3, 5 and 7.
 *
 * Original visual p33–39 chapter has 1,680 = 16*105 GP runes.
 * Test the literal three separable cyclic-convolution matrices,
 * no fitted key/IV/phase, a single chapter-start reset and no skips.
 * This tests a particular mathematically invertible MIX reading.
 *
 * Run from anywhere: node sims/lp2_red357_tensor_p33_39_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(ROOT, name), "utf8");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
/** @param {number} x @returns {number} */
function mod(x) {
  return ((x % 29) + 29) % 29;
}
/** @param {number} x @returns {number} */
function inverseUnit(x) {
  for (let y = 1; y < 29; y++) {
    if (mod(x * y) === 1) return y;
  }
  throw new Error("singular pivot " + x);
}
/**
 * @param {number[][]} matrix
 * @returns {number[][]}
 */
function inverseMatrix(matrix) {
  const n = matrix.length;
  const a = matrix.map((row, i) =>
    row.map(mod).concat(Array.from({ length: n }, (_, j) => Number(i === j))));
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && a[pivot][col] === 0) pivot++;
    assert.ok(pivot < n, "noninvertible title-key kernel");
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const inv = inverseUnit(a[col][col]);
    a[col] = a[col].map(x => mod(x * inv));
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const scale = a[row][col];
      a[row] = a[row].map((x, j) => mod(x - scale * a[col][j]));
    }
  }
  const result = a.map(row => row.slice(n));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const value = matrix[i].reduce((sum, x, k) => sum + x * result[k][j], 0);
      assert.equal(mod(value), Number(i === j));
    }
  }
  return result;
}
const keyWords = ["MIX", "ANEND", "PARABLE"];
const keys = keyWords.map(w =>
  [...w].map(ch => corpus.translit.indexOf(ch)));
assert.deepEqual(keys, [
  [19, 10, 14],
  [24, 9, 18, 9, 23],
  [13, 24, 4, 24, 17, 20, 18]
]);
const sizes = [3, 5, 7];
const forward = keys.map(k =>
  k.map((_, r) => k.map((__, col) => k[(r - col + k.length) % k.length])));
const inverse = forward.map(inverseMatrix);
/**
 * 105 cells at row-major coordinates (x,y,z) in 3×5×7.
 * @param {number[]} values
 * @param {number[][]} matrix
 * @param {number} axis
 * @returns {number[]}
 */
function axisMap(values, matrix, axis) {
  assert.equal(values.length, 105);
  const output = [];
  const n = sizes[axis];
  for (let i = 0; i < 105; i++) {
    const at = [Math.floor(i / 35), Math.floor((i % 35) / 7), i % 7];
    let sum = 0;
    for (let j = 0; j < n; j++) {
      const index = at.slice();
      index[axis] = j;
      sum += matrix[at[axis]][j] *
        values[35 * index[0] + 7 * index[1] + index[2]];
    }
    output.push(mod(sum));
  }
  return output;
}
/** @param {number[]} values @returns {number[]} */
function encodeBlock(values) {
  let out = values;
  for (let axis = 0; axis < 3; axis++) {
    out = axisMap(out, forward[axis], axis);
  }
  return out;
}
/** @param {number[]} values @returns {number[]} */
function decodeBlock(values) {
  let out = values;
  for (let axis = 2; axis >= 0; axis--) {
    out = axisMap(out, inverse[axis], axis);
  }
  return out;
}
/**
 * @param {number[]} source
 * @param {(a:number[])=>number[]} fn
 * @returns {number[]}
 */
function blocks(source, fn) {
  assert.equal(source.length % 105, 0);
  const out = [];
  for (let i = 0; i < source.length; i += 105) {
    out.push(...fn(source.slice(i, i + 105)));
  }
  return out;
}
const cipher = corpus.pages.filter(p => p.page >= 33 && p.page <= 39)
  .flatMap(p => p.indices);
assert.equal(cipher.length, 1680);
assert.equal(cipher.length / 105, 16);
const plain = blocks(cipher, decodeBlock);
assert.deepEqual(blocks(plain, encodeBlock), cipher);
const tokens = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} text @returns {number[]} */
function gpEncode(text) {
  const clean = text.toUpperCase().replace(/ING/g, "NG")
    .replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const t = tokens.find(tok => word.startsWith(tok.s, i));
      assert.ok(t, "no GP token " + word.slice(i));
      result.push(t.i);
      i += t.s.length;
    }
  }
  return result;
}
const english = gpEncode(read("resources/control/shakespeare_first300k.txt"));
const training = english.slice(0, Math.floor(english.length * 0.75));
const holdout = english.slice(Math.floor(english.length * 0.75));
const n = 29, f1 = Array(n).fill(0), f2 = Array(n * n).fill(0),
  f3 = Array(n * n * n).fill(0);
for (let i = 0; i < training.length; i++) {
  f1[training[i]]++;
  if (i > 0) f2[n * training[i - 1] + training[i]]++;
  if (i > 1) f3[n * n * training[i - 2] + n * training[i - 1] + training[i]]++;
}
/** @param {number[]} a @returns {number} */
function score(a) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    let p = (f1[x] + 1) / (training.length + 29);
    if (i) p = (f2[29 * a[i - 1] + x] + 8 * p) /
      (f1[a[i - 1]] + 8);
    if (i > 1) {
      p = (f3[841 * a[i - 2] + 29 * a[i - 1] + x] + 8 * p) /
        (f2[29 * a[i - 2] + a[i - 1]] + 8);
    }
    sum += Math.log(p);
  }
  return sum / a.length;
}
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const f = Array(29).fill(0);
  a.forEach(x => f[x]++);
  return f.reduce((sum, x) => sum + x * (x - 1), 0) /
    (a.length * (a.length - 1));
}
const planted = holdout.slice(1000, 2680);
assert.equal(planted.length, 1680);
assert.deepEqual(blocks(blocks(planted, encodeBlock), decodeBlock), planted);
let nativeMin = Infinity;
let windows = 0;
for (let i = 0; i + 1680 <= holdout.length; i += 105) {
  windows++;
  nativeMin = Math.min(nativeMin, score(holdout.slice(i, i + 1680)));
}
const raw = score(cipher), decoded = score(plain);
assert.ok(Math.abs(raw - (-6.554559989320459)) < 1e-10);
assert.ok(Math.abs(decoded - (-6.416158207387343)) < 1e-10);
assert.ok(Math.abs(nativeMin - (-2.552265428304256)) < 1e-10);
assert.ok(decoded < nativeMin);
console.log(JSON.stringify({
  research: "Original visual LP2 p33-39 (1,680 runes), 3x5x7 title-key convolution",
  titleKeys: keys, matrixOrders: sizes,
  sourceBlocks: cipher.length / 105, sourceLength: cipher.length,
  cipherTrigram: raw, decodedTrigram: decoded,
  cipherIoC: ioc(cipher), decodedIoC: ioc(plain),
  nativeHeldoutWindows: windows, worstNativeTrigram: nativeMin,
  originalReencryption: "PASS", independentNativePlant: "PASS",
  proposedPlaintextOpening: plain.slice(0, 42).map(x => corpus.translit[x]).join(""),
  result: "No source-native GP29 prose recovered"
}, null, 2));
