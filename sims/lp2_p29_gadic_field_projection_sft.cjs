"use strict";
/**
 * Field-trace/norm projection of the exact original p29/p50/G-adic residual.
 * Run: node sims/lp2_p29_gadic_field_projection_sft.cjs
 * Original source, 44 fixed 2013 DH-field readouts, native positive plants.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const p29 = corpus.pages.find(p => p.page === 29).indices;
const p57 = corpus.pages.find(p => p.page === 57).indices;
const s50 = grid.bytes.map(x => x % 29);
assert.deepEqual([p29.length, s50.length, p57.length], [277, 256, 95]);
const mod = x => (x % 29 + 29) % 29;
/** @param {number[]} x @param {number[]} y */
function mul(x, y) {
  const out = Array(x.length + y.length - 1).fill(0);
  for (let i = 0; i < x.length; i++)
    for (let j = 0; j < y.length; j++) out[i + j] = mod(out[i + j] + x[i] * y[j]);
  return out;
}
/** @param {number[]} x @param {number[]} y */
function sub(x, y) {
  const n = Math.max(x.length, y.length);
  const a = Array(n - x.length).fill(0).concat(x);
  const b = Array(n - y.length).fill(0).concat(y);
  return a.map((v, i) => mod(v - b[i]));
}
/** @param {number[]} x @param {number[]} y */
function divide(x, y) {
  assert(x.length >= y.length && y[0]);
  const out = x.slice(), q = [];
  const inverse = Array.from({length: 28}, (_, i) => i + 1)
    .find(v => mod(v * y[0]) === 1);
  assert.notEqual(inverse, undefined);
  for (let i = 0; i <= x.length - y.length; i++) {
    const c = mod(out[i] * inverse);
    q.push(c);
    for (let j = 0; j < y.length; j++) out[i + j] = mod(out[i + j] - c * y[j]);
  }
  return {quotient: q, remainder: out.slice(q.length)};
}
const G = [15, 5, 27]; // 2014 p39 original red triple
const R = divide(sub(sub(p29, s50), mul([2], G)), mul(G, G));
assert.equal(R.quotient.length, 273);
assert.deepEqual(R.remainder, [0, 0, 0, 0]);
const q = R.quotient;
// In GF(29)[X]/(X^2+18X+11), source H=24X^2+26X+3.
/** @param {number[]} u @param {number[]} v */
const fieldMul = ([a, b], [c, d]) => [
  mod(a * d + b * c - 18 * a * c), mod(b * d - 11 * a * c)
];
/** @param {number[]} u */
const trace = ([a, b]) => mod(2 * b - 18 * a);
/** @param {number[]} u */
const norm = ([a, b]) => mod(b * b - 18 * a * b + 11 * a * a);
/** @param {number[]} u @param {number[]} v */
const diff = (u, v) => [mod(u[0] - v[0]), mod(u[1] - v[1])];
const elements = {unit:[0,1], A:[19,16], B:[6,5], beta:[24,15], K:[7,1]};
assert.deepEqual(fieldMul(elements.A, elements.B), elements.beta);
assert.deepEqual([trace(elements.beta), norm(elements.beta)], [4, 23]);
assert.deepEqual([trace(elements.A), norm(elements.A)], [9, 2]);
// Native positive: independently solved original p57 rune stream carried as
// the trace of synthetic source-field pairs, with unconstrained other coordinate.
const plantedTracePairs = p57.map((v, i) => {
  const a = i % 29;
  return [a, mod((v + 18 * a) * 15)]; // inverse of 2 is 15 in GF29
});
assert.deepEqual(plantedTracePairs.map(trace), p57);
// Native positive for a nonlinear norm consumer; the field norm is surjective.
const normWitnesses = new Map();
for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
  const value = norm([a, b]);
  if (!normWitnesses.has(value)) normWitnesses.set(value, [a, b]);
}
assert.equal(normWitnesses.size, 29);
assert.deepEqual(p57.map(x => norm(normWitnesses.get(x))), p57);
const lex = corpus.translit.map((v, i) => ({v, i}))
  .sort((a, b) => b.v.length - a.v.length);
const raw = read("resources/control/shakespeare_first300k.txt");
const normalized = raw.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
  .replace(/K/g, "C").replace(/Z/g, "S").replace(/Q/g, "C");
const native = [];
for (const word of normalized.match(/[A-Z]+/g) || []) {
  for (let i = 0; i < word.length;) {
    const match = lex.find(x => word.startsWith(x.v, i));
    if (match) { native.push(match.i); i += match.v.length; }
    else i++;
  }
}
assert.equal(native.length, 218800);
const cutoff = Math.floor(native.length * .75);
const three = new Float64Array(29 ** 3).fill(.005);
const two = new Float64Array(29 ** 2).fill(.145);
for (let i = 2; i < cutoff; i++) {
  const k = 841 * native[i-2] + 29 * native[i-1] + native[i];
  three[k]++;
  two[Math.floor(k/29)]++;
}
/** @param {number[]} values */
function trigramScore(values) {
  let sum = 0;
  for (let i = 2; i < values.length; i++) {
    const k = 841 * values[i-2] + 29 * values[i-1] + values[i];
    sum += Math.log(three[k] / two[Math.floor(k/29)]);
  }
  return sum / (values.length - 2);
}
/** @param {number[]} values */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const v of values) counts[v]++;
  return counts.reduce((s, n) => s + n * (n-1), 0) / (values.length * (values.length-1));
}
const heldout = [];
for (let i = cutoff; i + 136 < native.length; i += 137)
  heldout.push(trigramScore(native.slice(i, i + 136)));
assert.equal(heldout.length, 399);
const minNative = Math.min(...heldout);
const cases = [];
for (const boundary of ["first", "last"]) {
  const stream = boundary === "first" ? q.slice(1) : q.slice(0, -1);
  for (const order of ["AB", "BA"]) {
    const pairs = [];
    for (let i = 0; i < stream.length; i += 2)
      pairs.push(order === "AB" ? [stream[i], stream[i+1]] : [stream[i+1], stream[i]]);
    assert.equal(pairs.length, 136);
    for (const [name, element] of Object.entries(elements)) {
      for (const [form, output] of [
        ["trace", pairs.map(p => trace(fieldMul(element, p)))],
        ["normCentered", pairs.map(p => norm(diff(p, element)))] ] ) {
        cases.push({boundary, order, name, form, ioc: ioc(output), score: trigramScore(output)});
      }
    }
    const joined = pairs.flatMap(p => [trace(p), norm(p)]);
    cases.push({boundary, order, name:"unit", form:"trace-norm-interleaved",
      ioc: ioc(joined), score: trigramScore(joined)});
  }
}
assert.equal(cases.length, 44);
cases.sort((a, b) => b.score - a.score);
assert(cases.every(x => x.score < minNative));
assert(cases.every(x => x.ioc < .04));
assert.deepEqual([cases[0].boundary, cases[0].order, cases[0].name, cases[0].form],
  ["last", "BA", "unit", "trace"]);
assert(Math.abs(cases[0].score - (-5.4198108293557485)) < 1e-10);
console.log(JSON.stringify({source:{p29:277,table:256,G,R:273,GP_R_ioc:ioc(q)},
  sourceField:{A:elements.A,B:elements.B,beta:elements.beta,K:elements.K},
  nativePlants:{trace:p57.length,norm:p57.length},
  testedCases:cases.length,best:cases[0],highestIoc:Math.max(...cases.map(x=>x.ioc)),
  nativeControls:{windows:heldout.length,min:minNative,
    median:heldout.sort((a,b)=>a-b)[Math.floor(heldout.length/2)]},
  decision:"All fixed source-field trace/norm projections fail native-GP language control; no plaintext or key recovered."},null,2));
