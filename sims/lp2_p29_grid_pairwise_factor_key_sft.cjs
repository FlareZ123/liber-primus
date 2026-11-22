"use strict";

/**
 * All-original GF29 page-pair polynomial gcd and the p29/grid quotient key.
 * Source inputs: 55 unsolved rune-bearing pages, p50 256 cells and red p39.
 * A shared factor is a candidate coding clue, not an authentic decryptor.
 * Reproduce with Node.js 22: node sims/lp2_p29_grid_pairwise_factor_key_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} name @returns {unknown} */
function read(name) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, name), "utf8"));
}
const corpus = read("resources/liber-primus/lp2-corpus.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const table = read("resources/liber-primus/lp2-grid-256.json");
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), 12956);
assert.equal(table.bytes.length, 256);
const PAGE29 = pages.find(p => p.page === 29).indices;
const GRID = table.bytes.map(n => n % 29);
const RED = ink.pages.find(p => p.page === 39).red_spans
  .find(s => s.start === 119 && s.length === 3);
assert.deepEqual(corpus.pages.find(p => p.page === 39).indices
  .slice(RED.start, RED.start + RED.length), [27, 5, 15]);

const M = 29;
/** @param {number} n @returns {number} */
const mod = n => (n % M + M) % M;
const inv = Array(M).fill(0);
for (let a = 1; a < M; a++)
  for (let b = 1; b < M; b++) if (a * b % M === 1) inv[a] = b;
assert.ok(inv.slice(1).every(n => n !== 0));

/** @param {number[]} a @returns {number[]} */
function trim(a) {
  let n = 0;
  while (n < a.length - 1 && a[n] === 0) n++;
  return a.slice(n);
}

/**
 * High-degree-first GF29 division. Both quotient and remainder are exact.
 * @param {number[]} source
 * @param {number[]} divisor
 * @returns {{q:number[],r:number[]}}
 */
function divmod(source, divisor) {
  // Retain leading GP F=0 coefficients, including grid cell zero.
  // They are genuine symbols in the source's fixed-length register.
  const a = source.slice(), d = trim(divisor);
  assert.ok(d.some(Boolean), "Zero polynomial divisor");
  if (a.length < d.length)
    return {q: [0], r: a};
  const q = Array(a.length - d.length + 1).fill(0);
  for (let i = 0; i < q.length; i++) {
    const factor = mod(a[i] * inv[d[0]]);
    q[i] = factor;
    for (let j = 0; j < d.length; j++)
      a[i + j] = mod(a[i + j] - factor * d[j]);
  }
  return {q, r: trim(a.slice(q.length))};
}

/**
 * Euclidean monic polynomial gcd over GF29.
 * @param {number[]} left
 * @param {number[]} right
 * @returns {number[]}
 */
function gcd(left, right) {
  let a = trim(left), b = trim(right);
  while (b.some(Boolean)) {
    const r = divmod(a, b).r;
    a = b;
    b = r;
  }
  return a.map(x => mod(x * inv[a[0]]));
}

/** @param {number[]} source @param {number[]} divisor */
function divideExactly(source, divisor) {
  const {q, r} = divmod(source, divisor);
  assert.ok(r.every(x => x === 0), "Nonzero original-source remainder");
  return q;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(M).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((n, x) => n + x * (x - 1), 0) /
    (values.length * (values.length - 1));
}

const all = pages.map(p => ({name: "p" + p.page, poly: p.indices}));
all.push({name: "p50-grid", poly: GRID});
const degreeCounts = {};
const higher = [];
for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
  const divisor = gcd(all[i].poly, all[j].poly);
  const degree = divisor.length - 1;
  degreeCounts[degree] = (degreeCounts[degree] || 0) + 1;
  if (degree >= 2) higher.push({
    a: all[i].name, b: all[j].name, degree, monic: divisor
  });
}
assert.deepEqual(degreeCounts, {"0": 1450, "1": 88, "2": 2});
assert.deepEqual(higher, [
  {a: "p27", b: "p48", degree: 2, monic: [1, 6, 0]},
  {a: "p29", b: "p50-grid", degree: 2, monic: [1, 10, 25]}
]);

// The visibly printed red p39 runes are [27,5,15] in low-first
// order. The high-first divisor is G=15X^2+5X+27. H descends
// from the historically signed 2013 BASE29=3QO digits [3,26,24].
const G = [15, 5, 27], H = [24, 26, 3];
const F = [12, 17, 11, 21, 23];
const product = Array(5).fill(0);
for (let i = 0; i < H.length; i++)
  for (let j = 0; j < G.length; j++)
    product[i + j] = mod(product[i + j] + H[i] * G[j]);
assert.deepEqual(product, F);
const Q29 = divideExactly(PAGE29, G);
const Q50G = divideExactly(GRID, G);
const Q50HG = divideExactly(GRID, F);
assert.deepEqual([Q29.length, Q50G.length, Q50HG.length], [275, 254, 252]);
assert.deepEqual(gcd(PAGE29, GRID), [1, 10, 25]);

const known = corpus.pages.find(p => p.page === 57).indices;
assert.equal(known.length, 95);
const inverses = [];
for (const [source, key] of [["grid-over-G", Q50G], ["grid-over-HG", Q50HG]])
  for (const align of ["beginning", "ending"])
    for (const sign of [-1, 1]) {
      const input = align === "beginning" ?
        Q29.slice(0, key.length) : Q29.slice(-key.length);
      const decoded = input.map((x, i) => mod(x + sign * key[i]));
      const reencryption = decoded.map((x, i) => mod(x - sign * key[i]));
      assert.deepEqual(reencryption, input);
      const plain = Array.from({length: key.length},
        (_, i) => known[i % known.length]);
      const planted = plain.map((p, i) => mod(p - sign * key[i]));
      assert.deepEqual(planted.map((x, i) => mod(x + sign * key[i])), plain);
      inverses.push({
        source, align, sign, originalRunes: input.length, ioc29: ioc(decoded)
      });
    }

// The p50 quotient has 252=9*28 GP29 coefficients. Nine physical visual
// chapters and 28 nonzero field elements suggest a direct 28-period key
// register per chapter. The source supplies all 252 symbols unmodified.
const chapterCuts = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];
const chapters = chapterCuts.slice(0, -1).map((first, i) =>
  pages.filter(p => p.page >= first && p.page < chapterCuts[i + 1])
    .flatMap(p => p.indices));
const rowKeys = Array.from({length: 9}, (_, i) =>
  Q50HG.slice(28 * i, 28 * (i + 1)));
assert.deepEqual(chapters.map(x => x.length),
  [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);
assert.deepEqual(rowKeys.map(r => new Set(r).size),
  [16, 19, 21, 16, 19, 16, 18, 17, 22]);
const chapterKeyTests = [];
for (const sign of [-1, 1]) for (const transparentF of [false, true]) {
  const decrypted = [];
  for (let chapter = 0; chapter < chapters.length; chapter++) {
    let step = 0;
    const input = chapters[chapter], key = rowKeys[chapter];
    const decoded = input.map(x => {
      if (transparentF && x === 0) return 0;
      return mod(x + sign * key[step++ % 28]);
    });
    let rekey = 0;
    const roundtrip = decoded.map((x, i) => {
      if (transparentF && input[i] === 0) return 0;
      return mod(x - sign * key[rekey++ % 28]);
    });
    assert.deepEqual(roundtrip, input);
    if (!transparentF) {
      const plant = Array.from({length: input.length},
        (_, i) => known[i % known.length]);
      const ciphertext = plant.map((x, i) =>
        mod(x - sign * key[i % 28]));
      const recovered = ciphertext.map((x, i) =>
        mod(x + sign * key[i % 28]));
      assert.deepEqual(recovered, plant);
    }
    decrypted.push(...decoded);
  }
  chapterKeyTests.push({sign, transparentF, keyLength: 28,
    totalRunes: decrypted.length, ioc29: ioc(decrypted)});
}
assert.deepEqual(chapterKeyTests.map(x => x.totalRunes),
  [12956, 12956, 12956, 12956]);
const expectedChapterIoC = [
  .034493197234734096, .0357939331876354,
  .03444821525195451, .035859529430072916
];
for (let i = 0; i < chapterKeyTests.length; i++)
  assert.ok(Math.abs(chapterKeyTests[i].ioc29 - expectedChapterIoC[i]) < 1e-14);


// Stronger than the natural row order: any of the 9! row assignments and
// either sign for each chapter must choose one of these 9*2*2 direct inverses.
// Their per-chapter maximum IoC is a key-independent necessary upper bound
// for the entire family, without searching actual row permutations.
const independentRowBounds = chapters.map(source => {
  const candidates = [];
  for (let j = 0; j < rowKeys.length; j++)
    for (const sign of [-1, 1])
      for (const transparentF of [false, true]) {
        let cursor = 0;
        const output = source.map(x => {
          if (transparentF && x === 0) return 0;
          return mod(x + sign * rowKeys[j][cursor++ % 28]);
        });
        candidates.push({row: j + 1, sign, transparentF,
          ioc29: ioc(output)});
      }
  const best = candidates.reduce((a, b) => a.ioc29 >= b.ioc29 ? a : b);
  const bestOrdinary = candidates.filter(x => !x.transparentF)
    .reduce((a, b) => a.ioc29 >= b.ioc29 ? a : b);
  return {runes: source.length, maxIOC29: best.ioc29,
    bestRow: best.row, bestSign: best.sign,
    maxOrdinaryIOC29: bestOrdinary.ioc29};
});
const expectedBounds = [
  .039271770753252236, .03554676764283751,
  .036709696249169935, .036655830933834614,
  .03633500412897774, .036423957240932996,
  .035598003346663264, .03652979041810244,
  .035767164431659546
];
for (let i = 0; i < independentRowBounds.length; i++)
  assert.ok(Math.abs(independentRowBounds[i].maxIOC29 - expectedBounds[i]) <
    1e-14);
assert.ok(independentRowBounds.every(x => x.maxIOC29 < .04));


// If the GF29 quotient rows are actually multiplication keys, the original
// chapter must be *exactly divisible* by its chosen 28-rune polynomial.
// Check all nine rows, both printed orientations and all nine chapters.
// This is key-independent even when the row assignment is fully secret.
const rowPolynomialGates = [];
for (let c = 0; c < chapters.length; c++)
  for (let j = 0; j < rowKeys.length; j++)
    for (const orientation of ["printed", "reversed"]) {
      const divisor = orientation === "printed" ?
        rowKeys[j] : rowKeys[j].slice().reverse();
      const remainder = divmod(chapters[c], divisor).r;
      rowPolynomialGates.push({
        chapter: c + 1, row: j + 1, orientation,
        zeros: remainder.filter(x => x === 0).length,
        coefficients: remainder.length,
        exact: remainder.every(x => x === 0)
      });
    }
assert.equal(rowPolynomialGates.length, 162);
assert.equal(rowPolynomialGates.filter(x => x.exact).length, 0);
assert.equal(Math.max(...rowPolynomialGates.map(x => x.zeros)), 4);

const expected = [
  .03317668295415642, .03650680028632784,
  .03597771622420715, .03345678628116149,
  .03629924745462594, .03430721558211598,
  .034402074242711696, .035571997723392146
];
for (let i = 0; i < inverses.length; i++)
  assert.ok(Math.abs(inverses[i].ioc29 - expected[i]) < 1e-14);
assert.ok(inverses.every(x => x.ioc29 < 0.037));
console.log(JSON.stringify({
  decision: "Sole repeated-root shared factor; direct shared-quotient pads do not decrypt",
  pairwise: {objects: all.length, unorderedPairs: 1540, degreeCounts, higher},
  exactSource: {p39LowFirst: [27, 5, 15], signed2013HighFirst: H,
    commonMonic: [1, 10, 25], quotientRunes: [275, 254, 252]},
  candidateInverses: inverses, chapterKeyTests, rowDistinct: rowKeys.map(r => new Set(r).size), independentRowBounds, polynomialRowGates: {tested: rowPolynomialGates.length, exact: 0, maxZeroResidues: 4}, positiveControl: "95 original solved GP p57 glyphs, repeated and recovered at each full key length",
  plaintextStatus: "No previously unknown original GP29 plaintext"
}, null, 2));
