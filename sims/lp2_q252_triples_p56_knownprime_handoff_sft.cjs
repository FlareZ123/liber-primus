'use strict';

/**
 * H/G exact 252-coefficient table quotient versus the independently solved
 * p56 84-prime totient-key sequence. Entire GP29 source, native Node22.
 * Run: node sims/lp2_q252_triples_p56_knownprime_handoff_sft.cjs
 *
 * Alignment is printed source order. No p55 ciphertext is fitted.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const source=read('resources/liber-primus/lp2-grid-256.json');
const corpus=read('resources/liber-primus/lp2-corpus.json');
const bytes=source.bytes;
assert.equal(bytes.length,256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const mod=n=>((n%29)+29)%29;
const H=[3,26,24],G=[27,5,15];
const HG=Array(5).fill(0);
for(let i=0;i<3;i++)for(let j=0;j<3;j++)
  HG[i+j]=mod(HG[i+j]+H[i]*G[j]);
assert.deepEqual(HG,[23,21,11,17,12]);
/** @param {number[]} sourceCoefficients Descending GF29 coefficients, length256
 * @returns {number[]} Descending quotient, length252
 */
function quotient(sourceCoefficients){
  assert.equal(sourceCoefficients.length,256);
  const work=sourceCoefficients.slice(),out=[];
  for(let i=0;i<252;i++){
    const q=mod(work[i]*17); // 17 = inverse of leading coefficient 12
    out.push(q);
    for(let j=0;j<5;j++)work[i+j]=mod(work[i+j]-q*HG[4-j]);
  }
  assert.deepEqual(work.slice(-4),[0,0,0,0],'H*G must divide');
  return out;
}
const Q=quotient(bytes.map(b=>b%29));
assert.deepEqual(Q.slice(0,20),[0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21,7,21,18,7]);
const prime=[];
for(let p=2;prime.length<84;p++){
  let isPrime=true;
  for(let d=2;d*d<=p;d++)if(p%d===0){isPrime=false;break;}
  if(isPrime)prime.push(p);
}
const key=prime.map(p=>mod(p-1));
assert.equal(corpus.pages[56].indices.length,85);
assert.equal(corpus.pages[56].indices[56],0);
let clock=0;
const recovered=corpus.pages[56].indices.map((cipher,i)=>
  i===56?0:mod(cipher-key[clock++]));
assert.equal(clock,84);
assert.equal(recovered.length,85);
const grouped=Array.from({length:84},(_,i)=>mod(Q[3*i]+Q[3*i+1]+Q[3*i+2]));
const matchPositions=grouped.map((v,i)=>v===key[i]?i:-1).filter(i=>i>=0);
assert.deepEqual(matchPositions,[2,15,21,29,31,38,42,43,57,80]);
const rotations=Array.from({length:84},(_,shift)=>
  grouped.reduce((sum,v,i)=>sum+Number(v===key[(i+shift)%84]),0));
assert.equal(rotations[0],10);
assert.equal(Math.max(...rotations.slice(1)),7);
assert.equal(rotations.filter(v=>v>=10).length,1);
const block=[Q.slice(0,84),Q.slice(84,168),Q.slice(168)];
const stride=Array.from({length:3},(_,a)=>Q.filter((_,i)=>i%3===a));
function compare(rows){
  const [a,b,c]=rows;
  const candidates={
    xor:a.map((v,i)=>v^b[i]^c[i]),
    shamir:a.map((v,i)=>mod(3*v-3*b[i]+c[i])),
    sum:a.map((v,i)=>mod(v+b[i]+c[i]))
  };
  return Object.fromEntries(Object.entries(candidates).map(([name,v])=>[
    name,{matches:v.reduce((n,x,i)=>n+Number(x===key[i]),0),
      outOfAlphabet:v.filter(x=>x>28).length}]));
}
const alternatives={threeContiguousBlocks:compare(block),
  threeInterleavedColumns:compare(stride)};
assert.deepEqual(alternatives,{
  threeContiguousBlocks:{
    xor:{matches:1,outOfAlphabet:7},
    shamir:{matches:3,outOfAlphabet:0},
    sum:{matches:3,outOfAlphabet:0}},
  threeInterleavedColumns:{
    xor:{matches:2,outOfAlphabet:6},
    shamir:{matches:1,outOfAlphabet:0},
    sum:{matches:10,outOfAlphabet:0}}});
// Full positive synthetic 256-coefficient table: 84 desired prime-pad
// triples, then multiply by H*G. The identical quotient extraction and
// three-column sum reproduces the whole 84/84 planted key.
const seed=key.flatMap(v=>[v,0,0]),plant=Array(256).fill(0);
for(let i=0;i<seed.length;i++)for(let j=0;j<5;j++)
  plant[i+j]=mod(plant[i+j]+seed[i]*HG[4-j]);
const recoveredSeed=quotient(plant);
assert.deepEqual(recoveredSeed,seed);
assert.deepEqual(
  Array.from({length:84},(_,i)=>mod(recoveredSeed[3*i]+recoveredSeed[3*i+1]+recoveredSeed[3*i+2])),
  key);
console.log(JSON.stringify({
  knownPrimePad:84,
  sourceFactor:'H=[3,26,24] signed 2013; G=[27,5,15] original p39',
  originalQuotient:252,
  printedAlignmentMatches:matchPositions.length,
  matchPositions,
  all84CyclicPhaseMaximum:10,
  zeroPhaseMaxTieCount:rotations.filter(v=>v>=10).length,
  secondBestPhaseCount:Math.max(...rotations.slice(1)),
  alternatives,syntheticKeyRecovery:84,
  recoveredOriginalUnknownPlaintext:0,
  conclusion:'10 exact source key matches is a provisional correlation; 74 disagree'
},null,2));
