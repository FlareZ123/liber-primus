'use strict';
/**
 * Director #2309: GF(29^2) sqrt(8) 56-state direct page-pair clock no-go.
 * Reproducible Windows/Node22 original-source mathematics and planted controls.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=JSON.parse(fs.readFileSync(
  path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
const mod=x=>(x%29+29)%29;
/** @param {number} x @param {number} n @returns {number} */
function pow29(x,n) {
  let z=1,a=mod(x),k=n;
  while(k){if(k%2)z=mod(z*a);a=mod(a*a);k=Math.floor(k/2);}
  return z;
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function mul(a,b) {
  return [
    mod(a[0]*b[0]+a[1]*b[2]),mod(a[0]*b[1]+a[1]*b[3]),
    mod(a[2]*b[0]+a[3]*b[2]),mod(a[2]*b[1]+a[3]*b[3])
  ];
}
const I=[1,0,0,1];
/** @param {number[]} a @param {number} n @returns {number[]} */
function power(a,n) {
  let z=I,b=a,k=n;
  while(k){if(k%2)z=mul(z,b);b=mul(b,b);k=Math.floor(k/2);}
  return z;
}
/** @param {number[]} a @returns {number[]} */
function inverse(a){
  const det=mod(a[0]*a[3]-a[1]*a[2]);
  assert.notEqual(det,0);
  const k=pow29(det,27);
  return [mod(k*a[3]),mod(-k*a[1]),mod(-k*a[2]),mod(k*a[0])];
}
/** @param {number[]} a @returns {number} */
function collisionPairs(a){
  const freq=Array(29).fill(0);
  for(const x of a)freq[x]++;
  return freq.reduce((v,n)=>v+n*(n-1),0);
}
/** @param {number[]} a @returns {number} */
function ioc(a){
  return collisionPairs(a)/(a.length*(a.length-1));
}
const M=[0,8,1,0];
const minusM=M.map(x=>mod(-x));
assert.deepEqual(mul(M,M),[8,0,0,8]);
assert.deepEqual(power(M,28),[28,0,0,28]);
assert.deepEqual(power(M,56),I);
assert.deepEqual(power(minusM,56),I);
for(let n=1;n<56;n++)assert.notDeepEqual(power(M,n),I);
assert.equal(pow29(8,14),28);
assert.equal(pow29(8,28),1);
const bases=[I,[1,1,0,1],[1,2,3,7],[5,4,3,2]];
for(const B of bases){
  const Binv=inverse(B);
  const changed=mul(mul(B,M),Binv);
  assert.deepEqual(mul(changed,changed),[8,0,0,8]);
  for(let j=0;j<56;j+=2)
    assert.deepEqual(power(changed,j),[pow29(8,j/2),0,0,pow29(8,j/2)]);
}
// Stronger theorem: ANY exact-order-56 field multiplier is pure alpha.
// A field element beta=(a,b) of order56 has beta^28=-1, so beta^29=-beta.
// Frobenius in GF29[alpha]/(alpha^2-8) maps a+b*alpha -> a-b*alpha.
// Comparing forces a=0, independent of which element was selected.
const fieldMul=(a,b)=>[mod(a[0]*b[0]+8*a[1]*b[1]),
  mod(a[0]*b[1]+a[1]*b[0])];
/** @param {number[]} base @param {number} exponent @returns {number[]} */
function fieldPow(base, exponent){
  let z=[1,0],b=base,k=exponent;
  while(k){if(k%2)z=fieldMul(z,b);b=fieldMul(b,b);k=Math.floor(k/2);}
  return z;
}
let exactOrder56=[];
for(let a=0;a<29;a++)for(let b=0;b<29;b++){
  if(a===0 && b===0)continue;
  const beta=[a,b];
  if(fieldPow(beta,56).join(',')!=='1,0')continue;
  if(fieldPow(beta,28).join(',')==='1,0'
    ||fieldPow(beta,8).join(',')==='1,0')continue;
  // For divisors 56/2=28 and 56/7=8, these two checks
  // exactly certify order56, because 56=2^3*7.
  assert.equal(a,0, 'No order56 field element has nonzero scalar coefficient');
  assert.deepEqual(fieldPow(beta,28),[28,0]);
  assert.deepEqual(fieldPow(beta,29),[0,mod(-b)]);
  assert.equal(fieldPow(beta,2)[1],0);
  exactOrder56.push(beta);
}
assert.equal(exactOrder56.length,24);
assert.deepEqual(exactOrder56.map(v=>v[1]),[1,2,3,5,6,7,8,9,11,12,13,14,15,16,17,18,20,21,22,23,24,26,27,28]);
assert.deepEqual(fieldPow([4,3],3),[0,12]);
assert.deepEqual(fieldPow([3,4],15),[0,24]);
assert(exactOrder56.some(v=>v[1]===12));
assert(exactOrder56.some(v=>v[1]===24));
for(const beta of exactOrder56){
  for(const B of bases){
    const Binv=inverse(B);
    const betaM=[beta[0],mod(8*beta[1]),beta[1],beta[0]];
    const conjugate=mul(mul(B,betaM),Binv);
    const sq=mod(8*beta[1]*beta[1]);
    assert.deepEqual(power(conjugate,2),[sq,0,0,sq]);
    for(let e=0;e<56;e+=2)
      assert.deepEqual(power(conjugate,e),[pow29(sq,e/2),0,0,pow29(sq,e/2)]);
  }
}

const lengths=source.pages.slice(0,56).map(x=>x.indices.length);
assert.equal(lengths.length,56);
assert.equal(lengths.reduce((a,b)=>a+b,0),12956);
assert.equal(lengths[50],0);
assert.equal(lengths.filter(n=>n%2).length,32);
let cursor=0;
const seams=[];
for(let p=0;p<55;p++){cursor+=lengths[p];if(cursor%2)seams.push(p+'|'+(p+1));}
assert.equal(seams.length,22);
const candidates=[0,43].map(page=>{
  const original=source.pages[page].indices;
  const globalRuneOffset=lengths.slice(0,page).reduce((a,n)=>a+n,0);
  assert.equal(globalRuneOffset%2,0, 'Page begins on an exact global rune-pair boundary');
  assert.equal(original.length%2,0);
  assert(original.length>=200);
  const collisions=collisionPairs(original);
  // Every nonzero field scalar is a permutation on GP29 glyphs.
  for(let scalar=1;scalar<29;scalar++){
    const shifted=original.map(v=>mod(scalar*v));
    assert.equal(collisionPairs(shifted),collisions);
    const inv=pow29(scalar,27);
    assert.deepEqual(shifted.map(v=>mod(inv*v)),original);
  }
  return {page,globalRuneOffset,runes:original.length,collisionPairs:collisions,ioc:ioc(original)};
});
assert.equal(candidates[0].page%2,0);
assert.equal(candidates[1].page%2,1);
const phaseProof=[];
for(let phase=0;phase<56;phase++){
  const selected=candidates.find(x=>(x.page+phase)%2===0);
  assert(selected);
  const exponent=(selected.page+phase)%56;
  const scalar=pow29(8,exponent/2);
  assert.deepEqual(power(M,exponent),[scalar,0,0,scalar]);
  phaseProof.push({phase,protectedPage:selected.page,scalar});
}
const solved=source.pages[57].indices;
assert.equal(solved.length,95);
assert(ioc(solved)>0.06);
for(let scalar=1;scalar<29;scalar++){
  const cipher=solved.map(v=>mod(scalar*v));
  const inverseScalar=pow29(scalar,27);
  assert.deepEqual(cipher.map(x=>mod(inverseScalar*x)),solved);
  assert.equal(collisionPairs(cipher),collisionPairs(solved));
}
console.log(JSON.stringify({
  source:'Original p7 residual X^2-8 in GF(29); 56 physical LP2 unknown pages',
  exactField:'alpha^2=8; alpha order56; M^2=8I; M^28=-I; M^56=I',
  all56PhasesPlusMinusRootAndEveryFixedBasis:'At least one of p0/p43 has even exponent and a scalar-only rune permutation',
  directPairCipherAllPageOriginalPlaintext:'EXCLUDED for standard native GP29 prose',
  witnessOriginalPageEvenCount:candidates,
  longDistanceHoldouts:[0,43],
  fieldOrientationBasisControl:bases.length,
  originalOddLengthPages:32,
  ambiguousGlobalPairPageCrossings:seams.length,
  pageCrossingExamples:seams.slice(0,8),
  solvedP57CleartextControlIoC:ioc(solved),
  solvedP57ScalarEncryptedInverse:'PASS',
  all56PhaseChecks:phaseProof.length,
  allExactOrder56FieldMultipliers:exactOrder56.length,
  fieldOrder56AllPureAlpha:true,
  sourceTitleCubeOrder56:fieldPow([4,3],3),
  sourceReverseTitle15Order56:fieldPow([3,4],15)
},null,2));
console.log('PASS: source-root 56-state bare field multiplier cannot recover manuscript-wide GP plaintext');
