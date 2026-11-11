"use strict";

/**
 * Self-contained test: the degree-238 irreducible factor of LP2's printed
 * 256-cell polynomial splits into two degree-119 Frobenius-conjugate factors
 * over the p3-red-inscription field GF(29^2). The two factors are an unordered,
 * exact pair. Their coefficients are screened in three historically referenced
 * field bases. There is no secret key or original-LP2 plaintext claim.
 *
 * Run: node sims/lp2_grid_q238_gf841_split_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const grid = JSON.parse(fs.readFileSync(path.join(__dirname, "../resources/liber-primus/base60-grid.json"), "utf8"));
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"), "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

/** @param {number} x @returns {number} */
const mod = (x) => ((x % 29) + 29) % 29;
/** @param {number} x @returns {number} */
function inv29(x) {
  assert.notEqual(mod(x), 0);
  for (let k = 1; k < 29; k++) if (mod(x * k) === 1) return k;
  throw Error("Nonzero GF29 element not invertible");
}
/** @param {number[]} p @returns {number[]} */
function trim(p) {
  while (p.length > 1 && p[p.length - 1] === 0) p.pop();
  return p;
}
/** Divide GF29 polynomials in ascending coefficient order. */
function divide29(p, d) {
  const r = [...p];
  const quotient = Array(Math.max(1, r.length - d.length + 1)).fill(0);
  const inv = inv29(d[d.length - 1]);
  for (let i = r.length - 1; i >= d.length - 1; i--) {
    const v = mod(r[i] * inv);
    quotient[i - d.length + 1] = v;
    for (let j = 0; j < d.length; j++) r[i - d.length + 1 + j] = mod(r[i - d.length + 1 + j] - v * d[j]);
  }
  assert(trim(r).every(v => v === 0), "Original polynomial does not have source-known factor");
  return trim(quotient);
}

// The first printed byte 203 reduces to zero; normalize the degree-254
// polynomial's leading coefficient 28 = -1 to one. The four independently
// documented, exact factors have total degree 16.
let q = trim(bytes.slice().reverse().map(b => mod(28 * b)));
for (const factor of [
  [5, 1], [5, 1], [11, 18, 1], [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1],
]) q = divide29(q, factor);
assert.equal(q.length, 239);
assert.equal(q[238], 1);

// Encode a+bu as a+29*b, with the original p3-red-triad relation u^2=3u+8.
/** @param {number} x @param {number} y @returns {number} */
function mulK(x, y) {
  const a=x%29, b=Math.floor(x/29), c=y%29, d=Math.floor(y/29);
  return mod(a*c+8*b*d) + 29*mod(a*d+b*c+3*b*d);
}
/** @param {number} x @returns {number} */
function invK(x) {
  const a=x%29, b=Math.floor(x/29);
  const n=mod(a*a+3*a*b-8*b*b), inv=inv29(n);
  return mod((a+3*b)*inv)+29*mod(-b*inv);
}
/** @param {number[]} p @returns {number[]} */
function monicK(p) {
  p=trim([...p]);
  const lc=invK(p[p.length-1]);
  return p.map(v=>mulK(v,lc));
}
/** @param {number[]} p @param {number[]} d @returns {number[]} */
function remainderK(p,d) {
  const r=[...p];
  const n=d.length-1, inverse=invK(d[n]);
  for(let i=r.length-1;i>=n;i--){
    const a=mulK(r[i],inverse);
    if(a) for(let j=0;j<=n;j++) {
      const v=mulK(a,d[j]);
      r[i-n+j]=mod((r[i-n+j]%29)-(v%29))+29*mod(Math.floor(r[i-n+j]/29)-Math.floor(v/29));
    }
  }
  return trim(r);
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function gcdK(a,b) {
  while(b.length>1 || b[0]!==0) [a,b]=[b,remainderK(a,b)];
  return monicK(a);
}
/** Multiply K-polynomials without reducing by q. */
function fullMultiplyK(a,b) {
  const c=Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++) for(let j=0;j<b.length;j++) {
    const v=mulK(a[i],b[j]);
    const k=i+j;
    c[k]=mod(c[k]%29+v%29)+29*mod(Math.floor(c[k]/29)+Math.floor(v/29));
  }
  return trim(c);
}
/** Multiply elements modulo q, with four GF29 polynomial convolutions. */
function multiplyMod(a,b) {
  const n=a.length+b.length-1;
  const lo=Array(n).fill(0), hi=Array(n).fill(0);
  for(let i=0;i<a.length;i++) {
    const x=a[i]%29, y=Math.floor(a[i]/29);
    for(let j=0;j<b.length;j++) {
      const v=b[j]%29, w=Math.floor(b[j]/29), k=i+j;
      lo[k]+=x*v+8*y*w;
      hi[k]+=x*w+y*v+3*y*w;
    }
  }
  for(let i=n-1;i>=238;i--){
    const x=mod(lo[i]), y=mod(hi[i]);
    if(x||y) for(let j=0;j<238;j++) {
      lo[i-238+j]-=x*q[j];
      hi[i-238+j]-=y*q[j];
    }
  }
  const out=Array(Math.min(n,238));
  for(let i=0;i<out.length;i++) out[i]=mod(lo[i])+29*mod(hi[i]);
  return trim(out);
}
/** @param {number[]} a @param {bigint} e @returns {number[]} */
function powerMod(a,e) {
  let v=[1];
  while(e>0n){
    if(e&1n) v=multiplyMod(v,a);
    e>>=1n;
    if(e>0n) a=multiplyMod(a,a);
  }
  return v;
}

// Deterministic Cantor–Zassenhaus: q's degree 238 splits into two 119s
// over K. The fixed auxiliary polynomial X+(2+u) is solely a computational
// splitter; it provides no historically intended decryption key.
const quadraticCharacter=powerMod([2+29,1],(841n**119n-1n)/2n);
const characterMinusOne=[...quadraticCharacter];
characterMinusOne[0]=mod(characterMinusOne[0]%29-1)+29*Math.floor(characterMinusOne[0]/29);
const f=monicK(gcdK(q,characterMinusOne));
assert.equal(f.length,120);
assert.equal(f[119],1);
// Frobenius conjugation sends u->3-u, preserving every element of F29.
const conjugate=f.map(v=>mod((v%29)+3*Math.floor(v/29))+29*mod(-Math.floor(v/29)));
assert.deepEqual(fullMultiplyK(f,conjugate),q);

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const n=a.length, counts=Array(29).fill(0);
  for(const v of a) counts[v]++;
  return counts.reduce((s,k)=>s+k*(k-1),0)/(n*(n-1));
}
/** @param {number[]} c @param {number} a0 @param {number} b0 */
function inspectBasis(c,a0,b0) {
  const inv=inv29(b0), A=[],B=[];
  for (const v of c.slice(0,-1)) {
    const b=Math.floor(v/29), a=v%29, bb=mod(b*inv);
    A.push(mod(a-a0*bb));B.push(bb);
  }
  return {a:ioc(A),b:ioc(B),combined:ioc(A.flatMap((v,i)=>[v,B[i]])),zeroPairs:A.filter((v,i)=>v===0&&B[i]===0).length};
}
const bases={p3_u:[0,1],base29_2013_root:[23,-2],magic7_eigen:[14,2]};
const screens={};
for(const [name,coords] of Object.entries(bases)) {
  screens[name]=[inspectBasis(f,...coords),inspectBasis(conjugate,...coords)];
}

/**
 * The two unique original red triples on physical pages 3 and 39 both start
 * immediately after 119 printed runes. The preceding 119-rune prefixes form
 * an original-source 119-pair comparison lane with no fitted parameters.
 * Equalities within the 119 field pairs survive EVERY fixed injective
 * substitution, affine or nonlinear, and every input/output reordering.
 * This tests that one tempting alignment without assuming a GP plaintext.
 */
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, "../resources/liber-primus/lp2-corpus.json"), "utf8"));
const p3 = corpus.pages[3].indices.slice(0,119);
const p39 = corpus.pages[39].indices.slice(0,119);
assert.equal(p3.length,119);
assert.equal(p39.length,119);
/** @param {number[][]} pairs @returns {Record<string,number>} */
function duplicateSpectrum(pairs) {
  const counts=new Map();
  for (const pair of pairs) {
    const key=pair.join(",");
    counts.set(key,(counts.get(key)||0)+1);
  }
  const spectrum={};
  for (const count of counts.values()) spectrum[count]=(spectrum[count]||0)+1;
  return spectrum;
}
const prefixPairs=p3.map((r,i)=>[r,p39[i]]);
const prefixSpectrum=duplicateSpectrum(prefixPairs);
const factorSpectrum=duplicateSpectrum(f.slice(0,-1).map(v=>[v%29,Math.floor(v/29)]));
const conjugateSpectrum=duplicateSpectrum(conjugate.slice(0,-1).map(v=>[v%29,Math.floor(v/29)]));
assert.deepEqual(prefixSpectrum,{"1":99,"2":10});
assert.deepEqual(factorSpectrum,{"1":96,"2":10,"3":1});
assert.deepEqual(conjugateSpectrum,factorSpectrum);
// An arbitrary bijection of 841 field symbols preserves this spectrum.
// The source prefixes and the two source-derived factors cannot be related
// by ANY stationary one-to-one GP29² substitution, regardless of pair order.
assert.notDeepEqual(prefixSpectrum,factorSpectrum);

console.log(JSON.stringify({
  originalGridBytes:bytes.length, sourcePolynomialDegree:254,
  irreducibleSourceResidualDegree:q.length-1,
  extensionField:"GF(29)[u]/(u^2-3u-8)",
  splitDegrees:[f.length-1,conjugate.length-1],
  factorCoefficientsFirst12:f.slice(0,12),
  exactFrobeniusNorm:true,
  marked119PrefixDuplicateSpectra:{p3p39:prefixSpectrum,factor:factorSpectrum},
  fixedBijectionToBothMarkedPrefixes:false,
  sourceBasisScreens:screens,
  interpretation:"Exact source-factor split, no unknown LP2 plaintext or key."
},null,2));
