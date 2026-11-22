"use strict";

/**
 * Source-fixed direct Taylor-coordinate plaintext gate on two ORIGINAL
 * artifact polynomials sharing the printed p39 factor (X-24)^2.
 *
 * Distinct from p29/table quotient equality, formal series division, and
 * using table Taylor coefficients as a stream pad: this asks whether the
 * literal coefficients of P(X+24), *with the two forced zero jets removed*,
 * are themselves native-GP plaintext.
 *
 * All coefficients are source-order descending. Taylor coefficients are
 * read in ascending exponent order, the only endpoint consistent with
 * removing the first two zero-derivative slots at X=24.
 *
 * Node22 CommonJS, read-only. Source inputs canonical and immutable.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildSourceNativeTrigramModel } =
  require("./lp1_source_native_trigram_model.cjs");
const root = path.resolve(__dirname,"..");
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const p29=corpus.pages[29].indices;
assert.equal(p29.length,277);
assert.equal(grid.bytes.length,256);
const p50=grid.bytes.map(x=>x%29);
const mod=x=>((x%29)+29)%29;

/**
 * Given descending polynomial coefficients, return ascending Taylor
 * coefficients of P(X+r) in GF29 via exact Horner, no rounding/fit.
 * @param {number[]} descending
 * @param {number} r
 * @returns {number[]}
 */
function shift(descending,r){
  let out=[];
  for(const c of descending){
    const next=Array(out.length+1).fill(0);
    for(let i=0;i<out.length;i++){
      next[i]=mod(next[i]+r*out[i]);
      next[i+1]=mod(next[i+1]+out[i]);
    }
    next[0]=mod(next[0]+c);
    out=next;
  }
  return out;
}

/**
 * Reverse the same known coordinate shift exactly: take ascending jet
 * plaintext, substitute X-24, then write the resulting polynomial high-first.
 * @param {number[]} ascending
 * @returns {number[]}
 */
function encode(ascending){
  return shift(ascending.slice().reverse(),-24).reverse();
}

/** @param {number[]} a @returns {number} */
function ioc(a){
  let counts=Array(29).fill(0);
  for(const x of a)counts[x]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}

const a=shift(p29,24),b=shift(p50,24);
assert.deepEqual(a.slice(0,4),[0,0,27,6]);
assert.deepEqual(b.slice(0,4),[0,0,26,6]);
assert.equal(a.length-2,275);
assert.equal(b.length-2,254);
assert.deepEqual(encode(a),p29);
assert.deepEqual(encode(b),p50);
const nativeA=a.slice(2),nativeB=b.slice(2);
const model=buildSourceNativeTrigramModel({
  corpus,referenceText:read("resources/liber-primus/lp1-plaintext-reference.txt")
});
const stats=[
  {input:"original p29",length:nativeA.length,ioc:ioc(nativeA),trigram:model.scoreStream(nativeA).mean,first100:model.spell(nativeA.slice(0,100))},
  {input:"original p50",length:nativeB.length,ioc:ioc(nativeB),trigram:model.scoreStream(nativeB).mean,first100:model.spell(nativeB.slice(0,100))}
];
assert(Math.abs(stats[0].ioc-0.03429329794293298)<1e-12);
assert(Math.abs(stats[1].ioc-0.03336341850549314)<1e-12);
assert(stats.every(s=>s.ioc<0.045&&s.trigram<model.p57Score-0.4));

// Verified solved p57 native GP29, independently chosen before constructing
// either ciphertext. Repeat only to fill fixed 275/254 original source spans;
// positive controls test invertibility, not source-authorship of this cipher.
const p57=corpus.pages[57].indices;
assert.equal(p57.length,95);
for(const n of [275,254]){
  const plant=Array.from({length:n},(_,i)=>p57[i%95]);
  const transformed=[0,0,...plant];
  const cipher=encode(transformed);
  const recovered=shift(cipher,24).slice(2);
  assert.deepEqual(recovered,plant);
  assert.deepEqual(shift(cipher,24).slice(0,2),[0,0]);
}
console.log(JSON.stringify({
  status:"PASS",
  classification:"root24 direct Taylor-coordinate plaintext negative, without quotient fit",
  source:"p39 red quadratic and original p29 GP29/p50 256-byte polynomials",
  root:24,forcedTaylorJets:[a.slice(0,2),b.slice(0,2)],
  nativeReference:{p57IoC:ioc(p57),p57Trigram:model.p57Score},
  original:stats,
  directOriginalReencodes:{p29:277,p50:256},
  nativeP57PlantsRecovered:{p29:275,p50:254},
  verdict:"Both original direct Taylor readouts are GP29-uniform nonprose. No authentic plaintext/key."
},null,2));
