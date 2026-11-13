"use strict";

/**
 * P15 signed Fibonacci-prime matrix and P39 red-triad common factor.
 *
 * Source: original p15 4x4 abs(3301-prime(F_n+1)) spiral; its two
 * negative differences are restored BEFORE reduction to GF(29).
 * Independently the original p39 red triad at rune offsets 119..121
 * supplies the ascending quadratic 27+5x+15x^2.
 *
 * A recovered eigenspace is only prospective key material. The two
 * source-anchored direct pad signs are tested on the untouched p40..p53
 * body and checked with a solved p57 source-native positive plant.
 *
 * Node.js 22, CommonJS; read-only and self-contained within the repo.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const gp = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, "..", "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const mod = x => (x % 29 + 29) % 29;
const I = Array.from({length: 4}, (_, i) =>
  Array.from({length: 4}, (_, j) => +(i === j)));
const literal = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
const originalM = literal.map(row => row.map(mod));
const signed = literal.map(row => row.slice());
signed[3][0] = -signed[3][0];
signed[3][1] = -signed[3][1];
const M = signed.map(row => row.map(mod));
assert.deepEqual(M, [
  [10, 3, 20, 22],
  [1, 22, 21, 25],
  [11, 17, 19, 7],
  [8, 12, 12, 22]
]);
assert.deepEqual(gp.pages[3].indices.slice(119, 122), [13, 23, 2]);
assert.deepEqual(gp.pages[39].indices.slice(119, 122), [27, 5, 15]);

/** @param {number[][]} A @param {number[][]} B */
const mmul = (A, B) => A.map(row =>
  B[0].map((_,j) => mod(row.reduce((sum,a,k) => sum+a*B[k][j],0))));
/** @param {number[][]} A @param {number[]} v */
const mv = (A,v) => A.map(row =>
  mod(row.reduce((sum,a,k) => sum+a*v[k],0)));
/** @param {number[][]} A @param {number} n */
function powMatrix(A,n) {
  let result=I;
  let base=A;
  for(let p=n;p>0;p=Math.floor(p/2)) {
    if(p%2) result=mmul(result,base);
    base=mmul(base,base);
  }
  return result;
}
/** @param {number[][]} A */
const trace = A => mod(A.reduce((s,row,i)=>s+row[i],0));
/** Compute monic characteristic polynomial in descending order, GF29. */
function charpoly(A) {
  const T1=trace(A), A2=mmul(A,A), T2=trace(A2),
    T3=trace(mmul(A2,A)), T4=trace(mmul(A2,A2));
  const s1=T1;
  const s2=mod(15*(s1*T1-T2));
  const s3=mod(10*(s2*T1-s1*T2+T3));
  const s4=mod(22*(s3*T1-s2*T2+s1*T3-T4));
  return [1,mod(-s1),s2,mod(-s3),s4];
}
/** Multiply ascending-order polynomials over GF29. */
function pmul(a,b) {
  const out=Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)
    out[i+j]=mod(out[i+j]+a[i]*b[j]);
  return out;
}
/** @param {number[][]} matrix */
function rank(matrix) {
  const a=matrix.map(row=>row.map(mod));
  let r=0;
  for(let col=0;col<a[0].length;col++) {
    let pivot=r;
    while(pivot<a.length && !a[pivot][col]) pivot++;
    if(pivot===a.length) continue;
    [a[r],a[pivot]]=[a[pivot],a[r]];
    const inv=Array.from({length:29},(_,v)=>v).find(x=>mod(x*a[r][col])===1);
    a[r]=a[r].map(x=>mod(x*inv));
    for(let q=0;q<a.length;q++)if(q!==r){
      const f=a[q][col];
      for(let j=0;j<a[0].length;j++) a[q][j]=mod(a[q][j]-f*a[r][j]);
    }
    r++;
    if(r===a.length)break;
  }
  return r;
}
/** Extract the unique eigenline at lambda=24, normalizing last coordinate=1. */
function eigenvector24(A) {
  const B=A.map((row,i)=>row.map((x,j)=>mod(x-24*+(i===j))));
  assert.equal(rank(B),3);
  const aug=B.map(row=>row.slice());
  for(let k=0;k<3;k++){
    const pivot=aug.findIndex((row,i)=>i>=k&&row[k]!==0);
    assert(pivot>=0);
    [aug[k],aug[pivot]]=[aug[pivot],aug[k]];
    const inv=Array.from({length:29},(_,v)=>v).find(x=>mod(x*aug[k][k])===1);
    aug[k]=aug[k].map(x=>mod(x*inv));
    for(let q=0;q<4;q++)if(q!==k) {
      const f=aug[q][k];
      aug[q]=aug[q].map((x,j)=>mod(x-f*aug[k][j]));
    }
  }
  return [mod(-aug[0][3]),mod(-aug[1][3]),mod(-aug[2][3]),1];
}
const c1=charpoly(originalM),c2=charpoly(M);
assert.deepEqual(c1,[1,14,22,5,17]);
assert.deepEqual(c2,[1,14,27,10,7]);
const factors=pmul(pmul(pmul([mod(-8),1],[mod(-17),1]),
  [mod(-24),1]),[mod(-24),1]);
assert.deepEqual(c2,factors.slice().reverse());
const p39=[27,5,15];
assert.deepEqual(p39, pmul([mod(-24),1],[mod(-24),1])
  .map(x=>mod(15*x)));
const M2=mmul(M,M);
const quadratic=(coefs)=>I.map((row,i)=>row.map((one,j)=>
  mod(coefs[0]*one+coefs[1]*M[i][j]+coefs[2]*M2[i][j])));
assert.equal(rank(quadratic(p39)),2);
assert.equal(rank(quadratic([13,23,2])),4);
assert.deepEqual(powMatrix(M,812),I);
for(const prime of [2,7,29])
  assert.notDeepEqual(powMatrix(M,812/prime),I);
const seed=eigenvector24(M);
assert.deepEqual(seed,[27,3,13,1]);
assert.deepEqual(mv(M,seed),seed.map(x=>mod(24*x)));
assert.equal(mod(24**7),1);

// The black body after the eight-rune red p40 heading comprises 3000
// original runes, an integral number of 750 matrix-state blocks.
const body=gp.pages.slice(40,54).flatMap(p=>p.indices).slice(8);
assert.equal(body.length,3000);
const known=gp.pages[57].indices.slice(0,92);
/** @param {number[]} symbols */
function ioc(symbols) {
  const counts=new Uint32Array(29);
  for(const x of symbols)counts[x]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/
    (symbols.length*(symbols.length-1));
}
/**
 * @param {number[]} input
 * @param {-1|1} sign
 * @param {boolean} encrypt
 */
function transform(input,sign,encrypt) {
  assert.equal(input.length%4,0);
  let state=seed.slice();
  const out=[];
  for(let i=0;i<input.length;i+=4){
    state=mv(M,state);
    for(let j=0;j<4;j++)
      out.push(mod(input[i+j]+(encrypt?-sign:sign)*state[j]));
  }
  return out;
}
const scored=[];
for(const sign of [-1,1]){
  const decoded=transform(body,sign,false);
  assert.deepEqual(transform(decoded,sign,true),body);
  const plant=transform(known,sign,true);
  assert.deepEqual(transform(plant,sign,false),known);
  scored.push({sign,originalIoC:ioc(decoded),
    first24Gp:decoded.slice(0,24).map(x=>gp.translit[x]).join("-")});
}
assert(Math.abs(scored[0].originalIoC-0.03448949649883294)<1e-12);
assert(Math.abs(scored[1].originalIoC-0.0345026119817717)<1e-12);
assert(ioc(known)>0.06);

/**
 * Exhaustive source-row-preserving null. The 16 signed entries are fixed
 * exactly; independently permute the four cells within each original
 * physical row (24^4 arrangements, counting equal-value swaps).
 * A repeated x=24 characteristic root requires both det(24I-A)=0
 * and the derivative, sum of the four principal 3x3 minors, to vanish.
 */
function permutations(elements) {
  if(elements.length===0)return [[]];
  return elements.flatMap((element,i)=>
    permutations(elements.filter((_,j)=>j!==i)).map(t=>[element,...t]));
}
const order4=permutations([0,1,2,3]);
const order3=permutations([0,1,2]);
function permutationSign(perm) {
  let inversions=0;
  for(let i=0;i<perm.length;i++)
    for(let j=i+1;j<perm.length;j++)
      if(perm[i]>perm[j])inversions++;
  return inversions%2?-1:1;
}
const signedTerms4=order4.map(p=>[p,permutationSign(p)]);
const signedTerms3=order3.map(p=>[p,permutationSign(p)]);
/** @param {number[][]} A */
function det(A) {
  let sum=0;
  const terms=A.length===4?signedTerms4:signedTerms3;
  for(const [perm,sgn] of terms) {
    let term=sgn;
    for(let j=0;j<perm.length;j++)term*=A[j][perm[j]];
    sum+=term;
  }
  return mod(sum);
}
function hasDouble24(A) {
  const B=A.map((row,i)=>row.map((x,j)=>
    mod(24*+(i===j)-x)));
  if(det(B)!==0)return false;
  let derivative=0;
  for(let k=0;k<4;k++) {
    const minor=B.filter((_,i)=>i!==k)
      .map(row=>row.filter((_,j)=>j!==k));
    derivative+=det(minor);
  }
  return mod(derivative)===0;
}
assert(hasDouble24(M));
assert(!hasDouble24(originalM));
const rows=M.map(row=>order4.map(permutation=>
  permutation.map(j=>row[j])));
let rowNullCount=0;
for(const r0 of rows[0]) for(const r1 of rows[1])
  for(const r2 of rows[2]) for(const r3 of rows[3])
    rowNullCount+=+hasDouble24([r0,r1,r2,r3]);
assert.equal(rowNullCount,378);

console.log(JSON.stringify({
  p15PrintedCharpoly:c1,
  p15SignedCharpoly:c2,
  signedFactorRoots:[8,17,24,24],
  p39Polynomial:p39,
  p39MatrixRank:rank(quadratic(p39)),
  p3MatrixRank:rank(quadratic([13,23,2])),
  signedMatrixOrder:812,
  rowPreservingExhaustiveNull:{successes:rowNullCount,total:24**4},
  uniqueNormalizedEigenvector24:seed,
  originalTargetRunes:body.length,
  originalInputIoC:ioc(body),
  solvedSourcePositivePlant:known.length,
  directDecoded:scored
},null,2));
