"use strict";

/**
 * Frozen original-cipher GF(29^2) [256,180] interpolation/parity gate.
 * Run with Node.js 22 from any working directory:
 *   node sims/lp2_terminal256_gf841_rs180_parity_sft.cjs
 *
 * Motivated but unproven route: original 32x8 grid => nested clockwise
 * rings [76,68,60,52]. Original final p55/p56/p57 rune counts [76,85,95]
 * split as an outer 76-symbol unknown ring plus 180 solved inner symbols.
 * The primitive GF841 g = 19+13u is the source-grid p39/p3 quotient
 * reported in im-results/p50-p39-p3-field-remainder.md.
 *
 * Frozen interpolation model: x[j]=g^j, j=0..255 (source ring order).
 * Fit unique polynomial degree<180 to the 180 solved y[76..255] and
 * predict y[0..75]. All 256 code symbols must be direct GP29 subfield values.
 * Trace, norm and both source-basis coordinates are separate fixed natural
 * projection checks. No search over phases, lengths, permutations, or keys.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const mod = n => ((n % 29) + 29) % 29;
const add = (x, y) => [mod(x[0] + y[0]), mod(x[1] + y[1])];
const sub = (x, y) => [mod(x[0] - y[0]), mod(x[1] - y[1])];
// u^2 = 3u + 8 in the irreducible p3 source-defined quadratic.
const mul = (x, y) => [
  mod(x[0] * y[0] + 8 * x[1] * y[1]),
  mod(x[0] * y[1] + x[1] * y[0] + 3 * x[1] * y[1])
];
function inv29(n) {
  for (let j = 1; j < 29; j++) if (mod(n * j) === 1) return j;
  throw new Error("Noninvertible GF29 scalar");
}
function inv(x) {
  const [a, b] = x;
  const z = inv29(mod(a * a + 3 * a * b - 8 * b * b));
  return [mod((a + 3 * b) * z), mod(-b * z)];
}
const div = (x, y) => mul(x, inv(y));
const same = (x, y) => x[0] === y[0] && x[1] === y[1];

/** Standard 32x8 outer-to-inner rectangular clockwise ring traversal. */
function rings() {
  const output = [];
  for (let margin = 0; margin < 4; margin++) {
    const top = margin, bottom = 31 - margin;
    const left = margin, right = 7 - margin, ring = [];
    for (let c = left; c <= right; c++) ring.push([top, c]);
    for (let r = top + 1; r <= bottom; r++) ring.push([r, right]);
    for (let c = right - 1; c >= left; c--) ring.push([bottom, c]);
    for (let r = bottom - 1; r > top; r--) ring.push([r, left]);
    output.push(ring);
  }
  assert.deepEqual(output.map(a => a.length), [76, 68, 60, 52]);
  assert.equal(new Set(output.flat().map(a => a.join(","))).size, 256);
  return output;
}

/**
 * Newton divided differences fitted to all supplied distinct points.
 * @param {number[][]} x
 * @param {number[][]} y
 */
function interpolator(x, y) {
  const n = x.length;
  assert.equal(y.length, n);
  const coefficients = y.map(v => v.slice());
  for (let d = 1; d < n; d++) {
    for (let j = n - 1; j >= d; j--) {
      coefficients[j] = div(sub(coefficients[j], coefficients[j - 1]),
        sub(x[j], x[j - d]));
    }
  }
  return function evaluate(t) {
    let value = coefficients[n - 1];
    for (let j = n - 2; j >= 0; j--)
      value = add(coefficients[j], mul(sub(t, x[j]), value));
    return value;
  };
}

const ringGeometry = rings().map(a => a.length);
const p55 = corpus.pages.find(p => p.page === 55).indices;
const p56 = corpus.pages.find(p => p.page === 56).indices;
const p57 = corpus.pages.find(p => p.page === 57).indices;
assert.deepEqual([p55.length, p56.length, p57.length], [76,85,95]);
const known = [...p56, ...p57].map(n => [n, 0]);
assert.equal(known.length, 180);

// The grid-derived g has exact order 840, so 256 successive points are unique.
const g = [19, 13];
const points = [[1, 0]];
for (let j = 1; j < 256; j++) points.push(mul(points[j - 1], g));
assert.equal(new Set(points.map(z => z.join(","))).size, 256);
const f = interpolator(points.slice(76), known);
for (let j = 76; j < 256; j++)
  assert(same(f(points[j]), known[j - 76]), "Known-data fit failed");
const outer = points.slice(0, 76).map(f);
const inGP29 = outer.filter(([a,b]) => b === 0).length;
const exact = outer.filter((v, j) => same(v, [p55[j], 0])).length;

const projections = {
  basisA: ([a,b]) => a,
  basisB: ([a,b]) => b,
  trace: ([a,b]) => mod(2 * a + 3 * b),
  norm: ([a,b]) => mod(a * a + 3 * a * b - 8 * b * b)
};
const projectionResults = Object.fromEntries(Object.entries(projections).map(
  ([name, fn]) => {
    const values = outer.map(fn);
    const matches = values.filter((v,j) => v === p55[j]).length;
    const counts = Array(29).fill(0);
    values.forEach(n => { counts[n]++; });
    return [name, {matches,
      ioc: counts.reduce((s,n) => s + n * (n - 1),0) / (76 * 75)}];
  }));

// One frozen direct inverse: subtract the field trace as a GP29 pad,
// following the existing solved p56 subtraction convention.
const tracePad = outer.map(projections.trace);
const inverse = p55.map((value, j) => mod(value - tracePad[j]));
const ioc = values => {
  const bins = Array(29).fill(0);
  for (const value of values) bins[value]++;
  return bins.reduce((sum,n) => sum + n * (n-1),0) /
    (values.length * (values.length - 1));
};
const originalIoc = ioc(p55);
const inverseIoc = ioc(inverse);
assert.equal(originalIoc, 0.037894736842105266);
assert.equal(inverseIoc, 0.037894736842105266);

// Exact positive plant: a full [256,180] GF841 evaluation codeword.
const coeff = Array.from({length:180},(_,j) =>
  [mod(11*j+7),mod(17*j+5)]);
function polynomial(t) {
  let value = [0, 0];
  for (let j = coeff.length - 1; j >= 0; j--)
    value = add(mul(value,t),coeff[j]);
  return value;
}
const planted = points.map(polynomial);
const plantFit = interpolator(points.slice(76), planted.slice(76));
const plantRecovered = points.slice(0,76).filter((t,j) =>
  same(plantFit(t),planted[j])).length;
assert.equal(plantRecovered, 76);
assert.equal(inGP29, 2);
assert.equal(exact, 0);
assert.deepEqual(Object.fromEntries(Object.entries(projectionResults)
  .map(([k,v]) => [k,v.matches])),
  {basisA:6,basisB:5,trace:4,norm:0});

console.log(JSON.stringify({
  field:"GF29[u]/(u^2-3u-8)", sourceGenerator:g,ringGeometry,
  original:{unknown:76,known:180,directSubfieldPredictions:inGP29,
    directOriginalMatches:exact,projections:projectionResults,
    fixedTraceSubtraction:{ioc:inverseIoc,rawIoc:originalIoc,
      transliteration:inverse.map(i => corpus.translit[i]).join("")}},
  control:{plantedRecovered,of:76},
  conclusion:"The fixed GF841 [256,180] ring-order evaluation-code model cannot reproduce GP29 p55 ciphertext directly or through the four natural field projections. The evidence does not identify a historical decoder, and arbitrary ECC/hidden projections remain open."
},null,2));
