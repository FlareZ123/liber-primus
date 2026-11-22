"use strict";

/**
 * A single source-constrained GF(29^2) Diffie-Hellman trace gate.
 * Source: authenticated 2013 BASE29 3301 -> 3QO and worked DH protocol;
 * LP2 p39 red triple G; canonical original p29 and p50 table.
 * The field interpretation and applying a DH-derived mask to p29 are
 * hypotheses, not authenticated Cicada 3301 cipher instructions.
 *
 * Run from the repository root: node sims/p29_signed2013_field_dh_trace_sft.cjs
 */
const assert = require("node:assert/strict");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const table = require("../resources/liber-primus/lp2-grid-256.json");

const M = 29;
const H = [24, 26, 3];
const G = [15, 5, 27];
const mod = x => (x % M + M) % M;
const original = corpus.pages.find(p => p.page === 29).indices;
const sourceTable = table.bytes.map(mod);

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function mulPoly(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
  return out;
}

/** Descending coefficients, over GF(29).
 * @param {number[]} a @param {number[]} b
 * @returns {{q:number[],r:number[]}}
 */
function divide(a, b) {
  const r = a.map(mod);
  const inverse = Array.from({length:28}, (_, i) => i + 1)
    .find(v => mod(v * b[0]) === 1);
  assert.notEqual(inverse, undefined);
  const q = [];
  for (let i = 0; i <= a.length - b.length; i++) {
    const v = mod(r[i] * inverse);
    q.push(v);
    for (let j = 0; j < b.length; j++)
      r[i+j] = mod(r[i+j] - v*b[j]);
  }
  return {q, r:r.slice(q.length)};
}

/**
 * [a,b] represents a*alpha+b where alpha^2+18alpha+11=0 in GF(29^2).
 * @param {[number,number]} u @param {[number,number]} v
 * @returns {[number,number]}
 */
function multiply([a,b],[c,d]) {
  return [mod(a*d+b*c-18*a*c), mod(b*d-11*a*c)];
}

/** @param {[number,number]} u @param {number} n
 * @returns {[number,number]}
 */
function power(u, n) {
  let result = /** @type {[number,number]} */([0,1]);
  while (n > 0) {
    if (n % 2) result = multiply(result, u);
    u = multiply(u, u);
    n = Math.floor(n/2);
  }
  return result;
}

/** @param {[number,number]} u @returns {number} */
function trace([a,b]) { return mod(2*b-18*a); }
/** @param {[number,number]} u @returns {number} */
function norm([a,b]) { return mod(b*b-18*a*b+11*a*a); }
/** @param {number[]} x @returns {number} */
function ioc(x) {
  const counts = Array(M).fill(0);
  for (const v of x) counts[v]++;
  return counts.reduce((s,n) => s+n*(n-1),0)/(x.length*(x.length-1));
}

assert.equal(original.length,277);
assert.equal(sourceTable.length,256);
assert.deepEqual(mulPoly(H,G),[12,17,11,21,23]);
const pageG = divide(original,G);
const gridHG = divide(sourceTable,mulPoly(H,G));
assert.deepEqual(pageG.r,[0,0]);
assert.deepEqual(gridHG.r,[0,0,0,0]);
const a = divide(pageG.q,H).r;
const b = divide(gridHG.q,H).r;
assert.deepEqual(a,[19,16]);
assert.deepEqual(b,[6,5]);

// The BASE29-digit polynomial is primitive: alpha has exact order 840.
const alpha = /** @type {[number,number]} */([1,0]);
const log = new Map();
let element = /** @type {[number,number]} */([0,1]);
for (let i = 0; i < 840; i++) {
  const name = element.join(",");
  assert.equal(log.has(name),false);
  log.set(name,i);
  element = multiply(element,alpha);
}
assert.deepEqual(element,[0,1]);
assert.equal(log.size,840);
const exponentA = log.get(a.join(","));
const exponentB = log.get(b.join(","));
assert.equal(exponentA,261);
assert.equal(exponentB,423);
const secret = power(alpha,exponentA*exponentB);
assert.deepEqual(secret,[7,1]);
assert.equal(norm(secret),8);

// Fixed direct interpretation: use successive powers of the derived secret,
// projected to GF29 by either canonical field trace or field norm. No phase
// search, page scanning, substitutions, Viterbi or manuscript-fitted key.
const streams = { trace: [], norm: [] };
let state = /** @type {[number,number]} */([0,1]);
for (let i = 0; i < 280; i++) {
  streams.trace.push(trace(state));
  streams.norm.push(norm(state));
  state = multiply(state,secret);
}
assert.deepEqual(state,[0,1]);
assert.notDeepEqual(power(secret,140),[0,1]);

const results = {};
for (const [name, stream] of Object.entries(streams)) {
  const plain = original.map((v,i) => mod(v-stream[i]));
  assert.deepEqual(plain.map((v,i)=>mod(v+stream[i])), original);
  // A genuine native-GP plant detects the predeclared additive transport;
  // it says nothing about whether Cicada used this field construction.
  const native = corpus.pages.find(p=>p.page===57).indices;
  const planted = native.map((v,i)=>mod(v+stream[i]));
  assert.deepEqual(planted.map((v,i)=>mod(v-stream[i])),native);
  results[name] = {
    decodedIoC:ioc(plain),
    decodedPreview:plain.slice(0,85).map(i=>corpus.translit[i]).join(""),
    plantedSymbolsRecovered:native.length
  };
}
assert.ok(Math.abs(results.trace.decodedIoC-0.033327905)<0.000001);
assert.ok(Math.abs(results.norm.decodedIoC-0.0336680)<0.000001);
assert.ok(results.trace.decodedIoC<0.036 && results.norm.decodedIoC<0.036);
const altered=original.slice();
altered[0]=mod(altered[0]+1);
assert.notDeepEqual(divide(altered,G).r,[0,0]);

console.log(JSON.stringify({
  signedSourceBase29:"3301 -> 3QO",
  field:"GF(29)[x]/(x^2+18x+11)",
  generatorOrder:840,
  originalP29Runes:original.length,
  gridBytes:sourceTable.length,
  sourceResidues:{p29OverG:a,gridOverHG:b},
  discreteLogs:{p29:exponentA,grid:exponentB},
  speculativeSharedElement:secret,
  sharedElementOrder:280,
  sharedElementNorm:norm(secret),
  originalIoC:ioc(original),
  nativeP57IoC:ioc(corpus.pages.find(p=>p.page===57).indices),
  fixedInverseTests:results,
  recoveredOriginalLP2Plaintext:false
},null,2));
