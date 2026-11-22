"use strict";

/**
 * Direct original LP2 Hill4 candidate from the ORIGINAL full p50
 * table quotient by the p39 red quadratic, evaluated on p15's
 * Fibonacci-sign-corrected 4×4 numeric matrix.
 *
 * Test both directions on the complete p40-p53 floral receiver
 * (3,008 runes / 752 four-rune blocks, including p40's red heading;
 * p50's numerical table has no rune clock), then retain p54/p55 as
 * separate terminal-chapter original checks.
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
const transcription=read("resources/liber-primus/lp2-transcription.txt");
const lp1Reference=read("resources/liber-primus/lp1-plaintext-reference.txt");
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

function encodeGP(text){
  const tokens=c.translit.map((token,index)=>({token,index})).sort((a,b)=>b.token.length-a.token.length);
  const out=[];
  for(const word of text.trim().split(/\s+/u)){
    for(let i=0;i<word.length;){
      const found=tokens.find(x=>word.startsWith(x.token,i));
      if(!found)throw new Error("No GP token at "+word.slice(i));
      out.push(found.index);
      i+=found.token.length;
    }
  }
  return out;
}
function firstPrimes(n){
  const out=[];
  for(let x=2;out.length<n;x++){
    let prime=true;
    for(let d=2;d*d<=x;d++)if(x%d===0){prime=false;break;}
    if(prime)out.push(x);
  }
  return out;
}
const p56Plain=encodeGP("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
assert.equal(p56Plain.length,85);
assert.equal(p56Plain[56],0);
const p56Cipher=c.pages[56].indices;
const p56Totients=firstPrimes(90).map(p=>p-1);
let p56Clock=0;
const p56Recreated=p56Plain.map(v=>v===0?0:mod(v+p56Totients[p56Clock++]));
assert.deepEqual(p56Recreated,p56Cipher);
assert.equal(p56Clock,84);

const lp1Only=lp1Reference.split(/^### 56\s*$/m)[0];
const reference=lp1Only.split(/\r?\n/).filter(x=>x.trim()&&!x.trim().startsWith("#")&&!x.trim().startsWith("[")&&!/^\d/.test(x.trim())).join(" ").toUpperCase().replace(/[^A-Z]/g,"");
const bigramCounts=Array.from({length:26},()=>Array(26).fill(0));
const bigramTotals=Array(26).fill(0);
for(let i=1;i<reference.length;i++){
  const a=reference.charCodeAt(i-1)-65,b=reference.charCodeAt(i)-65;
  bigramCounts[a][b]++;
  bigramTotals[a]++;
}
function bigramLogScore(seq){
  const text=seq.map(i=>c.translit[i]).join("").toUpperCase().replace(/[^A-Z]/g,"");
  if(text.length<2)return null;
  let sum=0;
  for(let i=1;i<text.length;i++){
    const a=text.charCodeAt(i-1)-65,b=text.charCodeAt(i)-65;
    sum+=Math.log((bigramCounts[a][b]+1)/(bigramTotals[a]+26));
  }
  return sum/(text.length-1);
}

const floralPages=c.pages.filter(p=>p.page>=40&&p.page<=53);
const floralSource=floralPages.flatMap(p=>p.indices);
assert.equal(floralSource.length,3008);
assert.equal(floralSource.length%4,0);
const runeIndex=new Map(c.runes.map((r,i)=>[r,i]));
const transcriptionBlocks=transcription.split(/^\s*%\s*$/m);
assert.equal(transcriptionBlocks.length,57);
const floralTextPages=floralPages.filter(p=>p.page!==50).map(p=>{
  const blockIndex=p.page<50?p.page:p.page-1;
  const block=transcriptionBlocks[blockIndex];
  const parsed=Array.from(block).filter(ch=>runeIndex.has(ch)).map(ch=>runeIndex.get(ch));
  assert.deepEqual(parsed,p.indices);
  return {page:p.page,block};
});
assert.equal(floralTextPages.length,13);

const floralR=transform(floralSource,sourceMatrix);
const floralInverse=transform(floralSource,sourceInverse);
assert.deepEqual(transform(floralR,sourceInverse),floralSource);
assert.deepEqual(transform(floralInverse,sourceMatrix),floralSource);

function renderFloral(values){
  let cursor=0;
  const pages=floralTextPages.map(({page,block})=>{
    let out="";
    for(const ch of block){
      if(runeIndex.has(ch))out+=c.translit[values[cursor++]];
      else if(ch==="-")out+=" ";
      else if(ch===".")out+=". ";
      else if(ch==="/")out+="\n";
      else if(ch==="\r"||ch==="\n")out+=ch;
      else out+=ch;
    }
    return {page,text:out};
  });
  assert.equal(cursor,values.length);
  return pages;
}
const floralRenderedR=renderFloral(floralR);
const floralRenderedInverse=renderFloral(floralInverse);

function plantedControl(plain){
  const planted=Array.from({length:floralSource.length},(_,i)=>plain[i%plain.length]);
  const encryptedR=transform(planted,sourceMatrix);
  const recoveredR=transform(encryptedR,sourceInverse);
  assert.deepEqual(recoveredR,planted);
  const encryptedInverse=transform(planted,sourceInverse);
  const recoveredInverse=transform(encryptedInverse,sourceMatrix);
  assert.deepEqual(recoveredInverse,planted);
  return {
    plainRunes:plain.length,
    plantedRunes:planted.length,
    RThenInverse:true,
    inverseThenR:true,
    plainBigramLogScore:bigramLogScore(plain)
  };
}
const p56Planted=plantedControl(p56Plain);
const p57Planted=plantedControl(solved);

let pageOffset=0;
const floralPageScores=floralPages.map(p=>{
  const start=pageOffset,end=start+p.indices.length;
  pageOffset=end;
  return {
    page:p.page,
    runes:p.indices.length,
    source:bigramLogScore(floralSource.slice(start,end)),
    R:bigramLogScore(floralR.slice(start,end)),
    inverse:bigramLogScore(floralInverse.slice(start,end))
  };
});
const floralResult={
  pages:floralPages.map(p=>({page:p.page,runes:p.indices.length})),
  transcriptionPagesMatched:floralTextPages.length,
  runes:floralSource.length,
  fourRuneBlocks:floralSource.length/4,
  ioc:{
    source:ioc(floralSource),
    R:ioc(floralR),
    inverse:ioc(floralInverse)
  },
  lp1OnlyBigramLogScore:{
    source:bigramLogScore(floralSource),
    R:bigramLogScore(floralR),
    inverse:bigramLogScore(floralInverse),
    p56HeldOutControl:bigramLogScore(p56Plain),
    p57HeldOutControl:bigramLogScore(solved)
  },
  exactOriginalReconstruction:{RThenInverse:true,inverseThenR:true},
  p56SourcePlaintextControl:{
    runes:p56Plain.length,
    literalFPosition:56,
    primeMinusOneRecreatesOriginal:true,
    keyValuesConsumed:p56Clock
  },
  plantedControls:{p56:p56Planted,p57:p57Planted},
  wordBoundaryPreservingPreview:{
    R:floralRenderedR.slice(0,3).map(p=>({page:p.page,text:p.text.slice(0,320)})),
    inverse:floralRenderedInverse.slice(0,3).map(p=>({page:p.page,text:p.text.slice(0,320)}))
  },
  pageScores:floralPageScores
};

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
  assert(ioc(nativePlant)>0.05);
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
  conclusion:"source-only direct Hill4 quotient matrix negative on original p40-p53 floral and p54-p55 terminal receivers",
  rawTableBytes:256,exactFactor:"(x-24)^2",
  quotientCoefficients:quotient.length,
  operator:sourceMatrix,inverse:sourceInverse,
  wrongUnsignedMatrixDifferent:true,
  scope:"no author's instruction selects Hill4; no original LP2 plaintext",
  floral:floralResult,
  pages:result
},null,2));
