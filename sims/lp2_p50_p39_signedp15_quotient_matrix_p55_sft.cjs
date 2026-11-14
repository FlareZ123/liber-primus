"use strict";

/**
 * Direct original LP2 p55 Hill4 candidate from the ORIGINAL full p50
 * table quotient by the p39 red quadratic, evaluated on p15's
 * Fibonacci-sign-corrected 4×4 numeric matrix.
 *
 * This is a fixed, full-rank, cross-artifact operator with no searched
 * phase, key, alphabet, text offset or tuned seed. Test both directions
 * on all 76 original p55 GP runes (19 complete printed-order blocks).
 * p54 232 runes supply a separate terminal-chapter original check.
 *
 * Unlike P(M), the quotient operator (P/G)(M) is full rank.
 * P(M)=G(M)(12M+15I) alone DOES NOT specify (P/G)(M) because G(M)
 * is singular; the full original 254-coefficient quotient must be used.
 * Complete exact original re-encryption and source-native positive plants.
 *
 * This is a source-constrained hypothesis without an author's instruction
 * to use polynomial-matrix Hill encryption. No plaintext recovered.
 * Read-only Node.js 22 CJS single-file test; no outside dependencies.
 */

const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const c=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const B=table.bytes;
assert.equal(B.length,256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(B)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const mod=x=>(x%29+29)%29;
const div=[1,10,25]; // monic (X-24)^2, from p39's red [27,5,15].
const P=B.map(x=>x%29);

/**
 * High-first GF29 long division; monic G.
 * @param {number[]} input
 * @returns {{quotient:number[],remainder:number[]}}
 */
function divideG(input){
  const residue=input.slice(),n=div.length;
  const quotient=[];
  for(let i=0;i<=input.length-n;i++){
    const z=residue[i];quotient.push(z);
    for(let j=0;j<n;j++)
      residue[i+j]=mod(residue[i+j]-z*div[j]);
  }
  return {quotient,remainder:residue.slice(-n+1)};
}
const {quotient,remainder}=divideG(P);
assert.equal(quotient.length,254);
assert.deepEqual(quotient.slice(0,6),[0,28,3,7,10,20]);
assert.deepEqual(remainder,[0,0]);
const expand=[];
for(const q of quotient){
  if(expand.length===0)expand.push(0,0,0);
  // Expansion is also tested by direct convolution below.
}
const convolution=Array(P.length).fill(0);
for(let i=0;i<quotient.length;i++)
  for(let j=0;j<div.length;j++)
    convolution[i+j]=mod(convolution[i+j]+quotient[i]*div[j]);
assert.deepEqual(convolution,P);

const I=Array.from({length:4},(_,r)=>
  Array.from({length:4},(_,j)=>Number(r===j)));
const zero=()=>I.map(row=>row.map(()=>0));
const M=[
  [10,3,20,22],
  [1,22,21,25],
  [11,17,19,7],
  [8,12,12,22]
];
const unsigned=[
  [10,3,20,22],
  [1,22,21,25],
  [11,17,19,7],
  [21,17,12,22]
];
const matrixAdd=(a,b)=>a.map((r,i)=>r.map((x,j)=>mod(x+b[i][j])));
const matrixScale=(a,s)=>a.map(r=>r.map(x=>mod(x*s)));
const matrixMultiply=(a,b)=>a.map(r=>
  Array.from({length:4},(_,j)=>mod(r.reduce((s,x,k)=>s+x*b[k][j],0))));
/**
 * @param {number[]} coeffs
 * @param {number[][]} m
 */
function evaluate(coeffs,m){
  let out=zero();
  for(const k of coeffs)
    out=matrixAdd(matrixMultiply(out,m),matrixScale(I,k));
  return out;
}
/**
 * @param {number[][]} a
 * @returns {number[][]}
 */
function inverse(a){
  const x=a.map((row,i)=>row.concat(I[i]));
  for(let j=0;j<4;j++){
    const pivot=x.findIndex((row,i)=>i>=j&&row[j]!==0);
    assert.notEqual(pivot,-1,"matrix invertible");
    [x[j],x[pivot]]=[x[pivot],x[j]];
    let scalar=1;
    while(mod(x[j][j]*scalar)!==1)scalar++;
    x[j]=x[j].map(v=>mod(v*scalar));
    for(let i=0;i<4;i++)if(i!==j){
      const multiplier=x[i][j];
      x[i]=x[i].map((v,k)=>mod(v-multiplier*x[j][k]));
    }
  }
  return x.map(r=>r.slice(4));
}
const sourceMatrix=evaluate(quotient,M);
assert.deepEqual(sourceMatrix,[
  [21,27,22,0],
  [28,10,13,22],
  [12,0,9,13],
  [12,24,7,3]
]);
const sourceInverse=inverse(sourceMatrix);
assert.deepEqual(sourceInverse,[
  [10,15,11,26],
  [28,16,11,9],
  [26,28,5,5],
  [4,27,11,6]
]);
assert.deepEqual(matrixMultiply(sourceMatrix,sourceInverse),I);
assert.deepEqual(matrixMultiply(sourceInverse,sourceMatrix),I);
const pOfM=evaluate(P,M);
assert.deepEqual(pOfM,matrixMultiply(evaluate(div,M),sourceMatrix));
assert.notDeepEqual(sourceMatrix,
  matrixAdd(matrixScale(M,12),matrixScale(I,15)),
  "singular P(M) identity does not determine complete quotient");
const wrongMatrix=evaluate(quotient,unsigned);
assert.notDeepEqual(sourceMatrix,wrongMatrix);
const mulVector=(matrix,v)=>matrix.map(row=>
  mod(row.reduce((s,x,j)=>s+x*v[j],0)));
/** @param {number[]} input @param {number[][]} matrix */
function transform(input,matrix){
  assert.equal(input.length%4,0);
  const out=[];
  for(let i=0;i<input.length;i+=4)
    out.push(...mulVector(matrix,input.slice(i,i+4)));
  return out;
}
/** @param {number[]} seq */
function ioc(seq){
  const counts=Array(29).fill(0);
  for(const x of seq)counts[x]++;
  return counts.reduce((s,x)=>s+x*(x-1),0)/(seq.length*(seq.length-1));
}
const solved=c.pages[57].indices;
assert.equal(solved.length,95);
const result=[];
for(const number of [54,55]){
  const original=c.pages[number].indices;
  assert.equal(original.length,number===54?232:76);
  const a=transform(original,sourceMatrix);
  const b=transform(original,sourceInverse);
  assert.deepEqual(transform(a,sourceInverse),original);
  assert.deepEqual(transform(b,sourceMatrix),original);

  const nativePlant=Array.from({length:original.length},(_,i)=>solved[i%solved.length]);
  const encrypted=transform(nativePlant,sourceMatrix);
  const recovered=transform(encrypted,sourceInverse);
  assert.deepEqual(recovered,nativePlant);
  assert.deepEqual(transform(recovered,sourceMatrix),encrypted);
  assert(ioc(nativePlant)>0.06);
  assert(ioc(a)<0.045&&ioc(b)<0.045,"original lacks GP-native letter concentration");
  result.push({
    page:number,runicLength:original.length,blocks:original.length/4,
    sourceCipherIoC:ioc(original),
    decodeWithMatrixIoC:ioc(a),decodeWithInverseIoC:ioc(b),
    first76Forward:a.slice(0,76).map(i=>c.translit[i]).join(""),
    first76Inverse:b.slice(0,76).map(i=>c.translit[i]).join(""),
    originalReencryptedBothDirections:original.length,
    fullNativePositive:recovered.length
  });
}
if(require.main===module)console.log(JSON.stringify({
  conclusion:"source-only direct Hill4 quotient matrix negative on original terminal pages",
  rawTableBytes:256,exactFactor:"(x-24)^2",
  quotientCoefficients:quotient.length,
  operator:sourceMatrix,inverse:sourceInverse,
  wrongUnsignedMatrixDifferent:true,
  scope:"no author's instruction selects Hill4; no original LP2 plaintext",
  pages:result
},null,2));
