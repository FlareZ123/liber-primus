"use strict";

/**
 * Source-aligned known-plaintext inverse: 32x8 printed numeric grid, 30x6
 * known middle matched to solved LP2 p56+p57, row-wise Möbius transforms
 * over GF(29), and 60 unknown side-border cells corresponding to p55.
 *
 * An arbitrary independent projective key [a,b,c,d] is allowed on each row:
 * y=(a*x+b)/(c*x+d) mod 29, ad-bc != 0.
 * Only 180 AUTHENTIC KNOWN runes are used in the negative test.
 *
 * Reproduce: node sims/lp2_terminal256_rowmobius_known180_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = filename => JSON.parse(fs.readFileSync(path.join(root, filename), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/lp2-grid-256.json");
const mod = n => ((n % 29) + 29) % 29;
const inverse = n => {
  const k = mod(n);
  assert.notEqual(k, 0);
  for (let i = 1; i < 29; i++) if (mod(k * i) === 1) return i;
  throw new Error("No GF(29) inverse");
};

assert.equal(grid.bytes.length, 256);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(corpus.pages[56].indices.length, 85);
assert.equal(corpus.pages[57].indices.length, 95);

// Exact already-decoded GP spelling, not a conjectural unknown-page crib.
const p56Text = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO " +
  "IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const tokens = corpus.translit.map((name, index) => ({ name, index }))
  .sort((a, b) => b.name.length - a.name.length);
const known56 = [];
for (const word of p56Text.split(" ")) {
  for (let i = 0; i < word.length;) {
    const token = tokens.find(t => word.startsWith(t.name, i));
    assert.ok(token, "Known p56 text must encode under source GP29 alphabet");
    known56.push(token.index);
    i += token.name.length;
  }
}
assert.equal(known56.length, 85);
const known = known56.concat(corpus.pages[57].indices);
assert.equal(known.length, 180);
const residue = (row, col) => grid.bytes[row * 8 + col] % 29;
const pairs = row => Array.from({ length: 6 }, (_, k) => ({
  x: residue(row, k + 1),
  y: known[(row - 1) * 6 + k]
}));

/** @param {{x:number,y:number}[]} observations */
function equations(observations) {
  return observations.map(({ x, y }) => [x, 1, -x * y, -y].map(mod));
}

/**
 * Reduced row echelon form over GF(29), with coefficient columns only.
 * @param {number[][]} rows
 */
function rref(rows) {
  const a = rows.map(r => r.map(mod));
  let rank = 0;
  const pivots = [];
  for (let col = 0; col < 4; col++) {
    let source = rank;
    while (source < a.length && a[source][col] === 0) source++;
    if (source === a.length) continue;
    [a[rank], a[source]] = [a[source], a[rank]];
    const scale = inverse(a[rank][col]);
    for (let j = 0; j < 4; j++) a[rank][j] = mod(a[rank][j] * scale);
    for (let i = 0; i < a.length; i++) {
      if (i === rank || a[i][col] === 0) continue;
      const factor = a[i][col];
      for (let j = 0; j < 4; j++) a[i][j] = mod(a[i][j] - factor * a[rank][j]);
    }
    pivots.push(col);
    rank++;
  }
  return { rank, pivots, matrix: a };
}

/** @param {{rank:number,pivots:number[],matrix:number[][]}} system */
function projectiveNullVector(system) {
  assert.equal(system.rank, 3);
  const free = [0, 1, 2, 3].find(col => !system.pivots.includes(col));
  assert.notEqual(free, undefined);
  const key = [0, 0, 0, 0];
  key[free] = 1;
  for (let i = system.rank - 1; i >= 0; i--) {
    key[system.pivots[i]] = mod(-system.matrix[i][free]);
  }
  assert.notEqual(mod(key[0] * key[3] - key[1] * key[2]), 0);
  return key;
}

/** @param {number} x @param {number[]} key */
function mobius(x, key) {
  const [a, b, c, d] = key;
  return mod((a * x + b) * inverse(mod(c * x + d)));
}

// Exact original-key obstruction: every source interior row independently
// fixes FOUR linearly independent homogeneous constraints, leaving no nonzero
// projective key. Arbitrary row-specific alphabets cannot rescue this model.
const ranks = [];
for (let row = 1; row <= 30; row++) {
  const result = rref(equations(pairs(row)));
  ranks.push(result.rank);
  assert.equal(result.rank, 4, "Original interior must reject all row keys");
}
assert.deepEqual(ranks, Array(30).fill(4));

// Explicit first-row four-equation rank certificate, independent of the
// other 176 source-known positions. Its 4x4 determinant is 22 (mod 29).
const first = pairs(1).slice(0, 4);
assert.deepEqual(first, [
  { x: 17, y: 24 }, { x: 11, y: 9 },
  { x: 19, y: 18 }, { x: 15, y: 9 }
]);
assert.equal(rref(equations(first)).rank, 4);

// Source-shaped positive inverse: synthesize a genuinely nonlinear,
// separately keyed Möbius mapping for each row using the actual grid bytes.
// The SAME inference algorithm must recover the transformation from six
// inner outputs and predict BOTH hidden side-border symbols per row.
let innerRecovered = 0;
let outerRecovered = 0;
for (let row = 1; row <= 30; row++) {
  const xs = Array.from({ length: 8 }, (_, col) => residue(row, col));
  const c = Array.from({ length: 28 }, (_, k) => k + 1)
    .find(s => xs.every(x => mod(s * x + 1) !== 0));
  assert.notEqual(c, undefined);
  const secret = [1, 0, c, 1];
  const planted = xs.map(x => mobius(x, secret));
  const observations = xs.slice(1, 7).map((x, k) => ({ x, y: planted[k + 1] }));
  const system = rref(equations(observations));
  const recovered = projectiveNullVector(system);
  for (let col = 1; col <= 6; col++) {
    assert.equal(mobius(xs[col], recovered), planted[col]);
    innerRecovered++;
  }
  for (const col of [0, 7]) {
    assert.equal(mobius(xs[col], recovered), planted[col]);
    outerRecovered++;
  }
}
assert.equal(innerRecovered, 180);
assert.equal(outerRecovered, 60);

console.log(JSON.stringify({
  source: "LP2 p50 256-byte table; solved p56+p57 authentic 180 GP runes",
  experiment: "30 independent row-local GF29 Mobius (projective) mappings",
  originalRank: { rank4: ranks.length, rank3OrLess: 0 },
  firstRowFourConstraintDeterminantMod29: 22,
  syntheticPlant: { knownRecovered: innerRecovered, hiddenRimRecovered: outerRecovered },
  conclusion: "Original p55 not recovered: no row-specific Mobius map can fit the known interior"
}, null, 2));
