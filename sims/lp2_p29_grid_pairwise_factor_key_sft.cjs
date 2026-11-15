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
  const a = trim(source), d = trim(divisor);
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
  candidateInverses: inverses, positiveControl: "95 original solved GP p57 glyphs, repeated and recovered at each full key length",
  plaintextStatus: "No previously unknown original GP29 plaintext"
}, null, 2));
