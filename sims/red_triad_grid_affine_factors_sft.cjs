"use strict";

/**
 * Source-exact LP2 grid polynomial factors, red-triad affine link, and
 * field-norm impossibility. Original source, mathematical fact; NO plaintext.
 *
 * Run: node sims/red_triad_grid_affine_factors_sft.cjs
 *
 * The grid's first base-60 byte is 203 = 7*29; hence its row-major descending
 * GP29 coefficient polynomial is degree 254, not degree 255.
 * The two red source triads are p3 [13,23,2], p39 [27,5,15], offset119.
 *
 * The p39 polynomial is 15(X-24)^2. The p3 polynomial F is irreducible;
 * the source JPEG page-number offset is 17, and the conjectural source
 * substitution G(X)=2 F((X-17)/2) yields the exact grid factor [11,18,1].
 * The source does not explicitly instruct this substitution; it is a test.
 *
 * An additional monic irreducible cubic H=X^3+14X^2+16X+24 divides the grid
 * polynomial exactly once. For any polynomial Z over GF(29^2), Norm(Z)=Z*Z^29
 * has EVEN multiplicity of each odd-degree irreducible over GF29. Thus no
 * whole-source or quotient polynomial with this single cubic can be such
 * a norm. This excludes all hidden 128-symbol field polynomial factors under
 * the *norm* mechanism, not other field operations.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ROOT = path.join(__dirname, "..");

/** @param {string} p @returns {any} */
function json(p) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
}

/** @param {number} n @returns {number} */
function mod(n) {
  return ((n % 29) + 29) % 29;
}

/** @param {number} n @returns {number} */
function inverse(n) {
  assert.notEqual(mod(n), 0);
  for (let value = 1; value < 29; value++) {
    if (mod(value * n) === 1) return value;
  }
  throw Error("no field inverse");
}

/** @param {number[]} a @returns {number[]} */
function trim(a) {
  let k = a.length;
  while (k > 0 && a[k - 1] === 0) k--;
  return a.slice(0, k);
}

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function add(a, b) {
  return trim(Array.from({length: Math.max(a.length, b.length)}, (_, j) =>
    mod((a[j] || 0) + (b[j] || 0))));
}

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function mul(a, b) {
  if (!a.length || !b.length) return [];
  const c = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      c[i + j] = mod(c[i + j] + a[i] * b[j]);
    }
  }
  return trim(c);
}

/** @param {number[]} a @param {number} s @returns {number[]} */
function scale(a, s) {
  return trim(a.map(n => mod(n * s)));
}

/**
 * Polynomials have ascending-power coefficients and GF29 arithmetic.
 * @param {number[]} dividend
 * @param {number[]} divisor
 * @returns {{quotient: number[], remainder: number[]}}
 */
function divide(dividend, divisor) {
  const a = trim(dividend.slice());
  const b = trim(divisor.slice());
  assert.ok(b.length);
  const n = Math.max(0, a.length - b.length + 1);
  const q = Array(n).fill(0);
  const inv = inverse(b[b.length - 1]);
  while (a.length >= b.length) {
    const offset = a.length - b.length;
    const coeff = mod(a[a.length - 1] * inv);
    q[offset] = coeff;
    for (let i = 0; i < b.length; i++) {
      a[offset + i] = mod(a[offset + i] - coeff * b[i]);
    }
    while (a.length && a[a.length - 1] === 0) a.pop();
  }
  return {quotient: trim(q), remainder: a};
}

/** @param {number[]} f @param {number} x @returns {number} */
function evaluate(f, x) {
  return f.reduceRight((v, c) => mod(v * x + c), 0);
}

/**
 * Compute f(g(X)) directly; only a quadratic f is needed.
 * @param {number[]} f
 * @param {number[]} g
 * @returns {number[]}
 */
function compose(f, g) {
  let y = [];
  for (let i = f.length - 1; i >= 0; i--) y = add(mul(y, g), [f[i]]);
  return y;
}

function main() {
  const corpus = json("resources/liber-primus/lp2-corpus.json");
  const ink = json("resources/liber-primus/lp2-ink-annotations.json");
  const grid = json("resources/liber-primus/lp2-grid-256.json");
  const bytes = grid.pages.flatMap(p => p.bytes);
  assert.equal(bytes.length, 256);
  const sha = crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex");
  assert.equal(sha, "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
  const P = trim(bytes.slice().reverse().map(mod));
  assert.equal(P.length - 1, 254);
  assert.equal(P[P.length - 1], 28);

  /** @param {number} physical @returns {number[]} */
  function redTriple(physical) {
    const page = ink.pages.find(p => p.page === physical);
    const span = page.red_spans.find(s => s.start === 119 && s.length === 3);
    return [...span.runes].map(rune => corpus.runes.indexOf(rune));
  }
  const p3 = redTriple(3);
  const p39 = redTriple(39);
  assert.deepEqual(p3, [13, 23, 2]);
  assert.deepEqual(p39, [27, 5, 15]);

  const root24 = [mod(-24), 1]; // X - 24
  assert.deepEqual(p39, scale(mul(root24, root24), 15));
  assert.deepEqual(divide(P, p39).remainder, []);
  assert.notDeepEqual(divide(P, p3).remainder, []);

  // 17 is the archival JPEG filename offset: LP2 p0 = 17.jpg.
  // The leading coefficient 2 of p3 is used as this affine scale.
  // 2*p3((X-17)/2) = X^2-11X+11, whose coefficients are [11,18,1].
  const linear = [mod(-17 * inverse(2)), inverse(2)];
  const affineQuadratic = scale(compose(p3, linear), 2);
  assert.deepEqual(affineQuadratic, [11, 18, 1]);
  assert.deepEqual(divide(P, affineQuadratic).remainder, []);
  assert.notDeepEqual(divide(divide(P, affineQuadratic).quotient,
    affineQuadratic).remainder, []);

  const cubic = [24, 16, 14, 1];
  assert.ok(Array.from({length: 29}, (_, x) => evaluate(cubic, x))
    .every(v => v !== 0), "cubic has no GF29 roots, hence irreducible");
  assert.deepEqual(divide(P, cubic).remainder, []);
  assert.deepEqual(divide(divide(P, cubic).quotient, cubic).remainder,
    [9, 3], "cubic factor has exponent exactly one");

  const degreeNine = [11, 15, 0, 9, 1, 5, 10, 20, 12, 1];
  const firstFactor = mul(mul(root24, root24), affineQuadratic);
  const secondFactor = mul(firstFactor, mul(cubic, degreeNine));
  const quotient = divide(P, secondFactor);
  assert.deepEqual(quotient.remainder, []);
  assert.equal(quotient.quotient.length - 1, 238);
  const degree238 = scale(quotient.quotient, inverse(28));
  assert.equal(degree238[238], 1);
  assert.deepEqual(scale(mul(secondFactor, degree238), 28), P);
  // SymPy 1.14 factor_list in the separately documented source report
  // confirms degree-nine and degree-238 cofactors are irreducible.
  const firstOriginal = corpus.pages.find(p => p.page === 53).indices;
  const a128 = firstOriginal.slice(0, 128);
  const b128 = firstOriginal.slice(128).concat(
    [corpus.pages.find(p => p.page === 54).indices[0]],
    corpus.pages.find(p => p.page === 55).indices);
  assert.equal(a128.length, 128);
  assert.equal(b128.length, 128);
  const fieldNorm = (a, b) => add(add(mul(a, a), scale(mul(a, b), 3)),
    scale(mul(b, b), 21));
  const normAt24 = evaluate(fieldNorm(a128, b128), 24);
  assert.notEqual(normAt24, 0);
  // Stronger key-independent gate: any GF841 norm would have even
  // multiplicity at the irreducible cubic, but P has exactly one copy.

  const counts = Array(29).fill(0);
  degree238.forEach(n => { counts[n]++; });
  const ioc = counts.reduce((s, n) => s + n * (n - 1), 0) /
    (degree238.length * (degree238.length - 1));
  process.stdout.write(JSON.stringify({
    originalGridSha256: sha,
    originalGridPolynomialDegree: P.length - 1,
    sourceRedP3Quadratic: p3,
    sourceRedP39Quadratic: p39,
    p3AffineImageJPEGOffset: 17,
    exactAdditionalGridQuadratic: affineQuadratic,
    irreducibleCubic: cubic,
    cubicRootCountGF29: 0,
    cubicMultiplicityInGrid: 1,
    fullDegreeDecomposition: [[1, 2], [2, 1], [3, 1], [9, 1], [238, 1]],
    largeFactorCoefficientCount: degree238.length,
    largeFactorIoC: ioc,
    terminal128x128RawNormAt24: normAt24,
    normOfAnyGF841Polynomial: "mathematically impossible under raw-grid polynomial and exact root/cubic obstruction",
    plainTextRecovered: false,
    caveat: "Only exact polynomial-norm and stated affine-factor relationships are resolved. Other field, byte and original cipher architectures remain open."
  }, null, 2) + "\n");
}

if (require.main === module) main();
module.exports = {mod, add, mul, divide, compose, evaluate};
