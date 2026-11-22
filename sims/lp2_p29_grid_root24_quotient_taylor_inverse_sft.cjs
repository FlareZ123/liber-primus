"use strict";

/**
 * Source-anchored *direct inversion* of the LP2 256-byte original grid's
 * P39 doubled polynomial root, plus the independent p29/table common-root
 * rational-series readout.
 *
 * Motivation: the red p39 polynomial is exactly 15*(X-24)^2 in GF29,
 * and both the 256-byte grid polynomial and original p29 polynomial have
 * this exact factor. Removing the visible factor before Taylor expansion
 * restores a nonzero, invertible first tap. The full quotient, not a
 * tuned seed or subset of coefficients, supplies every direct candidate.
 *
 * Negative original-cipher diagnostics do not establish this as intended.
 * Full native-GP reversible convolution plants are mandatory controls.
 * Node.js 22 CommonJS. No third-party modules or writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {nativeGP} = require("./ink256_grid256_lfsr_inversion.cjs");

const root = path.resolve(__dirname, "..");
const load = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const grid = load("resources/liber-primus/base60-grid.json");
const gp = load("resources/liber-primus/lp2-corpus.json");
const mod = n => ((n % 29) + 29) % 29;
const original = gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(original.length, 12956);
const originalPages = gp.pages.filter(p => p.page <= 55).map(p => p.indices.length);
const chapterSizes = [729,1145,1729,1903,1021,1433,1680,3008,308];
assert.equal(originalPages.reduce((a,b)=>a+b,0),12956);
assert.equal(chapterSizes.reduce((a,b)=>a+b,0),12956);
const p29 = gp.pages.find(p => p.page === 29).indices;
assert.equal(p29.length,277);
const P = grid.byte_rows.flat().map(mod);
assert.equal(P.length,256);
const fullGridBytes = grid.byte_rows.flat();
const sha = crypto.createHash("sha256").update(Buffer.from(fullGridBytes)).digest("hex");
assert.equal(sha,"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

/** Descending polynomial division by X-root in GF29. */
function divideRoot(a, rootValue) {
  const quotient = [mod(a[0])];
  for(let i=1;i<a.length-1;i++)quotient.push(mod(a[i]+rootValue*quotient[i-1]));
  return {quotient,remainder:mod(a.at(-1)+rootValue*quotient.at(-1))};
}

/** Exact Horner shift: descending P(X) => ascending P(root+X). */
function shift(desc, rootValue) {
  let result=[];
  for(const coefficient of desc) {
    const next=Array(result.length+1).fill(0);
    for(let j=0;j<result.length;j++) {
      next[j]=mod(next[j]+rootValue*result[j]);
      next[j+1]=mod(next[j+1]+result[j]);
    }
    next[0]=mod(next[0]+coefficient);
    result=next;
  }
  return result;
}

const gridDiv1=divideRoot(P,24);
const gridDiv2=divideRoot(gridDiv1.quotient,24);
assert.deepEqual([gridDiv1.remainder,gridDiv2.remainder],[0,0]);
const quotientByF39=gridDiv2.quotient.map(x=>mod(x*2));
const originalTaps=shift(quotientByF39,24);
const taps=originalTaps.slice();
while(taps.at(-1)===0)taps.pop();
assert.equal(taps.length,253);
assert.deepEqual(taps.slice(0,12),[23,12,14,14,7,4,1,24,11,4,12,11]);
assert.deepEqual(taps.slice(-6),[28,22,9,7,3,27]);

const p29Jets=shift(p29,24);
const tableJets=shift(P,24);
assert.deepEqual(p29Jets.slice(0,4),[0,0,27,6]);
assert.deepEqual(tableJets.slice(0,4),[0,0,26,6]);

/** Modular inverse among the nonzero field elements. */
function inv29(x) {
  for(let k=1;k<29;k++)if(mod(k*x)===1)return k;
  throw Error("zero key tap");
}

/**
 * Formal GF29 convolution applied or inverted independently in each
 * source-visible clock interval.
 *
 * @param {number[]} values
 * @param {number[]} key
 * @param {number[]} lengths
 * @param {boolean} inverse
 */
function convolution(values,key,lengths,inverse) {
  assert.notEqual(key[0],0);
  assert.equal(lengths.reduce((a,b)=>a+b,0),values.length);
  const out=new Array(values.length).fill(0);
  const a0inv=inv29(key[0]);
  let start=0;
  for(const length of lengths) {
    for(let i=0;i<length;i++) {
      if(inverse) {
        let v=values[start+i];
        for(let j=1;j<key.length&&j<=i;j++)v-=key[j]*out[start+i-j];
        out[start+i]=mod(v*a0inv);
      } else {
        let v=0;
        for(let j=0;j<key.length&&j<=i;j++)v+=key[j]*values[start+i-j];
        out[start+i]=mod(v);
      }
    }
    start+=length;
  }
  return out;
}

/** @param {number[]} a */
function ioc(a) {
  const counts=Array(29).fill(0);
  for(const x of a)counts[x]++;
  return counts.reduce((sum,n)=>sum+n*(n-1),0)/(a.length*(a.length-1));
}

const native=nativeGP();
assert.equal(native.length,12956);
const clocks=[["book",[12956]],["pages",originalPages],["chapters",chapterSizes]];
const directions=[["Taylor-low-first",taps],["Taylor-high-first",taps.slice().reverse()]];
const results=[];
for(const [direction,key]of directions)for(const [clock,lengths]of clocks)for(const decryptOriginal of [true,false]) {
  const decoded=convolution(original,key,lengths,decryptOriginal);
  const generated=convolution(native,key,lengths,!decryptOriginal);
  const recovered=convolution(generated,key,lengths,decryptOriginal);
  assert.deepEqual(recovered,native);
  results.push({
    direction,clock,originalDirection:decryptOriginal?"deconvolve":"convolve",
    firstTap:key[0],
    ioc:ioc(decoded),
    firstRunes:decoded.slice(0,35).map(i=>gp.translit[i]).join(""),
    originalRoundtrip:decoded.length,
    positiveRecovered:recovered.length
  });
}
assert.equal(results.length,12);
assert(results.every(r=>r.ioc<0.045),
  "No direct original-cipher full-stream/native-GP-like IoC result");

const p29Inverse=[];
for(const [direction,key]of directions)for(const inv of [true,false]){
  const decoded=convolution(p29,key,[p29.length],inv);
  p29Inverse.push({direction,operation:inv?"deconvolve":"convolve",
    ioc:ioc(decoded),firstRunes:decoded.slice(0,30).map(i=>gp.translit[i]).join("")});
}
assert(p29Inverse.every(x=>x.ioc<0.06));

/** Formal power series quotient A(X)/B(X), truncated at source length. */
function formalDivide(a,b,length) {
  const inv=inv29(b[0]);
  const out=[];
  for(let i=0;i<length;i++) {
    let v=a[i]||0;
    for(let j=1;j<=i&&j<b.length;j++)v-=b[j]*out[i-j];
    out.push(mod(v*inv));
  }
  return out;
}
/** Formal convolution truncation to verify exactly. */
function formalMultiply(a,b,n) {
  const out=Array(n).fill(0);
  for(let i=0;i<n;i++)
    for(let j=0;j<=i&&j<b.length;j++)
      if(i-j<a.length)out[i]=mod(out[i]+a[i-j]*b[j]);
  return out;
}
const A=p29Jets.slice(2),B=tableJets.slice(2);
const AoverB=formalDivide(A,B,A.length),BoverA=formalDivide(B,A,B.length);
assert.deepEqual(formalMultiply(AoverB,B,A.length),A);
assert.deepEqual(formalMultiply(BoverA,A,B.length),B);
assert.equal(AoverB[0],20);
assert.equal(BoverA[0],16);
assert(Math.abs(ioc(AoverB)-0.034372926343729265)<1e-13);
assert(Math.abs(ioc(BoverA)-0.034950670691855215)<1e-13);

console.log(JSON.stringify({
  result:"root24 printed-factor direct reversible candidate; original text still random-like",
  inputGridSha256:sha,
  sourceP39Factor:"15*(X-24)^2 in GF29",
  exactRemainders:[gridDiv1.remainder,gridDiv2.remainder],
  transformedFullQuotientTaps:taps.length,
  root24FirstTaps:taps.slice(0,12),
  originalFullCipherIoC:ioc(original),
  nativeControlIoC:ioc(native),
  directFullStream:results,
  originalP29Only:p29Inverse,
  commonRootP29TableSeries:{
    p29Root24Jets:p29Jets.slice(0,6),
    tableRoot24Jets:tableJets.slice(0,6),
    quotientP29OverTable:{length:AoverB.length,first:AoverB.slice(0,12),ioc:ioc(AoverB)},
    quotientTableOverP29:{length:BoverA.length,first:BoverA.slice(0,12),ioc:ioc(BoverA)},
    algebraicRoundtrips:true
  },
  authenticUnknownPlaintext:false
},null,2));
