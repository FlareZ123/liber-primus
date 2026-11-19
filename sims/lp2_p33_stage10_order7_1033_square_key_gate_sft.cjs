"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildSourceNativeTrigramModel } = require("./lp1_source_native_trigram_model.cjs");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8").replace(/\r/g, "");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const model = buildSourceNativeTrigramModel({
  corpus: gp,
  referenceText: read("resources/liber-primus/lp1-plaintext-reference.txt")
});
const mod = x => ((x % 29) + 29) % 29;
const best = xs => xs.slice().sort((a, b) => b.score - a.score)[0];

function invMod(a, m = 29) {
  let t = 0, nt = 1, r = m, nr = mod(a);
  while (nr) {
    const q = Math.floor(r / nr);
    [t, nt] = [nt, t - q * nt];
    [r, nr] = [nr, r - q * nr];
  }
  assert.equal(r, 1);
  return ((t % m) + m) % m;
}
function invert(A) {
  const n = A.length, m = 29;
  const a = A.map((row, i) => row.map(mod).concat(
    Array.from({ length: n }, (_, j) => Number(i === j))
  ));
  let det = 1;
  for (let c = 0; c < n; c++) {
    let p = c;
    while (p < n && !a[p][c]) p++;
    if (p === n) return { det: 0, inverse: null };
    if (p !== c) { [a[p], a[c]] = [a[c], a[p]]; det = mod(-det); }
    const v = a[c][c];
    det = mod(det * v);
    const vi = invMod(v);
    for (let j = 0; j < 2 * n; j++) a[c][j] = mod(a[c][j] * vi);
    for (let r = 0; r < n; r++) if (r !== c) {
      const f = a[r][c];
      for (let j = 0; j < 2 * n; j++) a[r][j] = mod(a[r][j] - f * a[c][j]);
    }
  }
  return { det, inverse: a.map(row => row.slice(n)) };
}
const transpose = A => A[0].map((_, c) => A.map(row => row[c]));
function hill(A, values, rowVector) {
  assert.equal(values.length % 7, 0);
  const out = [];
  for (let k = 0; k < values.length; k += 7) {
    const b = values.slice(k, k + 7);
    for (let j = 0; j < 7; j++) {
      let s = 0;
      for (let i = 0; i < 7; i++) s += rowVector ? b[i] * A[i][j] : A[j][i] * b[i];
      out.push(mod(s));
    }
  }
  return out;
}
function mm(A, B) {
  return A.map(row => B[0].map((_, c) => {
    let s = 0;
    for (let k = 0; k < B.length; k++) s += row[k] * B[k][c];
    return mod(s);
  }));
}
function twoD(A, B, values) {
  assert.equal(values.length % 49, 0);
  const out = [];
  for (let k = 0; k < values.length; k += 49) {
    const X = Array.from({ length: 7 }, (_, r) => values.slice(k + 7*r, k + 7*r + 7));
    out.push(...mm(mm(A, X), B).flat());
  }
  return out;
}
const score = (x, split) => model.scoreChapters([x.slice(0, split), x.slice(split)]).mean;
const p33 = gp.pages.find(p => p.page === 33);
const ann = ink.pages.find(p => p.page === 33);
assert.equal(p33.indices.length, 214);
assert.deepEqual(ann.red_spans.map(s => [s.start, s.length]), [[0, 10], [91, 8]]);
const upper = p33.indices.slice(10, 91), lower = p33.indices.slice(99);
const body = upper.concat(lower);
assert.deepEqual([upper.length, lower.length, body.length], [81, 115, 196]);
assert.equal(body.length, 4 * 49);
assert.equal(body.length, 28 * 7);

const squareText = read("resources/cicada2014-openpuff-magic-squares.txt");
const squares = squareText.trim().split(/\n\s*\n/).map(block =>
  block.trim().split(/\n/).map(line => line.trim().split(/\s+/).map(Number))
);
assert.deepEqual(squares.map(s => s.length), [5, 7, 5]);
const square = squares[1];
const rows = square.map(r => r.reduce((a, b) => a + b, 0));
const cols = Array.from({ length: 7 }, (_, c) => square.reduce((s, r) => s + r[c], 0));
const diags = [
  square.reduce((s, r, i) => s + r[i], 0),
  square.reduce((s, r, i) => s + r[6-i], 0)
];
assert([...rows, ...cols, ...diags].every(x => x === 1033));
const K = square.map(r => r.map(mod));
const { det, inverse: Ki } = invert(K);
assert.equal(det, 2);
const Kt = transpose(K), Kit = transpose(Ki);

const inkByPage = new Map(ink.pages.map(p => [p.page, p]));
const aligned = gp.pages.filter(p => p.page < 56).map(p => {
  const red = (inkByPage.get(p.page)?.red_spans || []).reduce((s, x) => s + x.length, 0);
  return { page: p.page, count: p.indices.length - red };
}).filter(x => x.count > 0 && x.count % 49 === 0);
assert.deepEqual(aligned, [{ page: 33, count: 196 }]);

const rawScore = score(body, upper.length);
const p57Score = model.p57Score;
const hillVariants = [];
for (const [op, A] of [["K", K], ["Kinv", Ki]]) for (const row of [false, true]) {
  const y = hill(A, body, row);
  hillVariants.push({ op, orientation: row ? "row" : "column", score: score(y, upper.length),
    preview: model.spell(y.slice(0, 60)) });
}
const twoDVariants = [
  ["K X K^T", K, Kt], ["K^T X K", Kt, K],
  ["K^-1 X K^-T", Ki, Kit], ["K^-T X K^-1", Kit, Ki]
].map(([op, A, B]) => {
  const y = twoD(A, B, body);
  return { op, score: score(y, upper.length), preview: model.spell(y.slice(0, 60)) };
});

const rowFlat = square.flat();
const colFlat = Array.from({ length: 7 }, (_, c) => square.map(r => r[c])).flat();
const add = (xs, key, sign, offset) => xs.map((v, i) => mod(v + sign * key[(i + offset) % 49]));
const addVariants = [];
for (const [order, flat] of [["row-major", rowFlat], ["column-major", colFlat]]) {
  for (const shift of [0, -1]) {
    const key = flat.map(v => mod(v + shift));
    for (const sign of [-1, 1]) for (const reset of [false, true]) {
      const a = add(upper, key, sign, 0);
      const b = add(lower, key, sign, reset ? 0 : upper.length);
      addVariants.push({ order, shift, sign, reset, score: model.scoreChapters([a, b]).mean,
        preview: model.spell(a.concat(b).slice(0, 60)) });
    }
  }
}

// Every candidate family has an exact synthetic native-GP inverse control.
const plant = model.training.slice(0, 196);
for (const row of [false, true]) assert.deepEqual(hill(Ki, hill(K, plant, row), row), plant);
assert.deepEqual(twoD(Ki, Kit, twoD(K, Kt, plant)), plant);
assert.deepEqual(twoD(Kit, Ki, twoD(Kt, K, plant)), plant);
for (const flat of [rowFlat, colFlat]) for (const shift of [0, -1]) {
  const key = flat.map(v => mod(v + shift));
  for (const sign of [-1, 1]) for (const reset of [false, true]) {
    const a = add(plant.slice(0, 81), key, sign, 0);
    const b = add(plant.slice(81), key, sign, reset ? 0 : 81);
    assert.deepEqual(add(a, key, -sign, 0), plant.slice(0, 81));
    assert.deepEqual(add(b, key, -sign, reset ? 0 : 81), plant.slice(81));
  }
}

const bestHill = best(hillVariants), best2D = best(twoDVariants), bestAdd = best(addVariants);
assert(Math.abs(rawScore - (-3.4439765253728107)) < 1e-10);
assert(Math.abs(bestHill.score - (-3.411076246233633)) < 1e-10);
assert(Math.abs(best2D.score - (-3.4089491515002455)) < 1e-10);
assert(Math.abs(bestAdd.score - (-3.4034618259439253)) < 1e-10);
console.log(JSON.stringify({
  classification: "bounded negative; no unknown LP2 plaintext or key",
  square: { rows, columns: cols, diagonals: diags, determinantModulo29: det },
  p33: { redSpans: [[0,10],[91,8]], upper: 81, lower: 115, nonRubricRunes: 196,
    blocks49: 4, blocks7: 28, uniquePageWithNonemptyNonRubricCountDivisibleBy49: aligned },
  scores: { rawP33: rawScore, solvedP57: p57Score,
    hill7: hillVariants, twoDimensional7x7: twoDVariants,
    repeated49CellAdditive: { familySize: addVariants.length, best: bestAdd,
      min: Math.min(...addVariants.map(x => x.score)),
      max: Math.max(...addVariants.map(x => x.score)) } },
  positiveControls: "All 1D, 2D, and 16 additive variants recover planted native-GP input exactly.",
  decision: "Retire direct mod-29 Hill-7, 2D Hill-7, and repeated 49-cell additive uses of this square on p33."
}, null, 2));
