'use strict';
/**
 * Source-shaped direct QR-style Reed–Solomon codeword gate for the original
 * LP2 32×8 number table. Run: node sims/lp2_p50_rs255_source_sft.cjs
 * Original GP plaintext is never fitted; all source inputs are read-only.
 * @module lp2_p50_rs255_source_sft
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const grid=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../resources/liber-primus/lp2-grid-256.json'),'utf8'));
const tokens=grid.pages.flatMap(p=>p.tokens);
const a60='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx',a59=a60.replace('f','');
const sha=x=>createHash('sha256').update(Buffer.from(x)).digest('hex');
const expected='3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290';
assert.equal(tokens.length,256);
assert.equal(grid.bytes.length,256);
assert.equal(grid.alphabet,a60);
assert.equal(sha(grid.bytes),expected);
assert.ok(tokens.every(x=>x.length===2&&!x.includes('f')));
/** @param {string} token @param {string} alphabet */
function decode(token,alphabet){
 const i=alphabet.indexOf(token[0]),j=alphabet.indexOf(token[1]);
 assert.ok(i>=0&&j>=0);
 const v=alphabet.length*i+j;
 assert.ok(v>=0&&v<=255);
 return v;
}
const v60=tokens.map(x=>decode(x,a60)),v59=tokens.map(x=>decode(x,a59));
assert.deepEqual(v60,grid.bytes);
/** @param {number} a @param {number} b */
function mul(a,b){
 let out=0;
 while(b){if(b&1)out^=a;b>>=1;a<<=1;if(a&256)a^=0x11d;}
 return out;
}
const exp=[];let alpha=1;
for(let i=0;i<255;i++){exp.push(alpha);alpha=mul(alpha,2);}
assert.equal(alpha,1);
assert.equal(new Set(exp).size,255);
/** @param {number[]} coefficients @param {number} x */
function evalAt(coefficients,x){
 let sum=0;
 for(const c of coefficients)sum=mul(sum,x)^c;
 return sum;
}
/** @param {number[]} codeword @param {number} firstRoot */
function syndromes(codeword,firstRoot){
 return Array.from({length:32},(_,i)=>evalAt(codeword,exp[firstRoot+i]));
}
/** @param {number[]} message @param {number} firstRoot */
function encode(message,firstRoot,parityCount=32){
 let generator=[1];
 for(let i=0;i<parityCount;i++){
  const previous=generator,x=exp[firstRoot+i];
  generator=new Array(previous.length+1).fill(0);
  for(let j=0;j<previous.length;j++){
   generator[j]^=previous[j];
   generator[j+1]^=mul(previous[j],x);
  }
 }
 const work=[...message,...new Array(parityCount).fill(0)];
 for(let i=0;i<message.length;i++){
  const coefficient=work[i];
  for(let j=0;j<generator.length;j++)work[i+j]^=mul(coefficient,generator[j]);
 }
 return [...message,...work.slice(message.length)];
}
for(const root of [0,1]){
 const message=Array.from({length:223},(_,i)=>(73*i+19)%256);
 const code=encode(message,root);
 assert.equal(code.length,255);
 assert.ok(syndromes(code,root).every(v=>v===0));
 code[91]^=0xa5;
 assert.ok(syndromes(code,root).some(v=>v!==0));
}
const cases=[];
for(const [radix,bytes] of [[60,v60],[59,v59]]){
 for(const reading of ['row-major','column-major']){
  const ordered=reading==='row-major'?bytes:
   Array.from({length:256},(_,i)=>bytes[(i%32)*8+Math.floor(i/32)]);
  for(const direction of ['forward','reverse']){
   const oriented=direction==='forward'?ordered:[...ordered].reverse();
   for(const omitted of ['last','first']){
    const code=omitted==='last'?oriented.slice(0,255):oriented.slice(1);
    for(const firstRoot of [0,1]){
     const syndrome=syndromes(code,firstRoot);
     cases.push({radix,reading,direction,omitted,firstRoot,
      firstSyndrome:syndrome[0],
      nonzeroAmong32:syndrome.filter(v=>v!==0).length});
    }
   }
  }
 }
}
assert.equal(cases.length,32);
assert.ok(cases.every(c=>c.firstSyndrome!==0));
/**
 * QR-style interleaved alternative: 8 complete 32-byte blocks (grid
 * columns), or 32 complete eight-byte blocks (grid rows). Standard QR
 * RS GF256 generator, with fixed roots alpha^0 or alpha^1. No fitted key.
 * @param {number[]} bytes
 * @param {"columns32"|"rows8"} shape
 * @returns {number[][]}
 */
function splitBlocks(bytes,shape){
 return shape==='columns32'
  ?Array.from({length:8},(_,j)=>Array.from({length:32},(_,i)=>bytes[8*i+j]))
  :Array.from({length:32},(_,i)=>bytes.slice(i*8,i*8+8));
}
const blockCodewordCases=[];
for(const [radix,bytes] of [[60,v60],[59,v59]]){
 for(const shape of ['columns32','rows8']){
  for(const direction of ['forward','reverse']){
   for(const firstRoot of [0,1]){
    const blocks=splitBlocks(bytes,shape)
      .map(b=>direction==='forward'?b:[...b].reverse());
    const firstSyndromes=blocks.map(b=>evalAt(b,exp[firstRoot]));
    blockCodewordCases.push({
     radix,shape,direction,firstRoot,
     blockCount:blocks.length,
     firstRootZeroCount:firstSyndromes.filter(v=>v===0).length,
     firstSyndromes
    });
   }
  }
 }
}
assert.equal(blockCodewordCases.length,16);
assert.ok(blockCodewordCases.every(c=>c.firstRootZeroCount===0));
/** Genuine short RS plants validate each interleaved matrix orientation. */
for(const shape of ['columns32','rows8']){
 for(const root of [0,1]){
  const blockCount=shape==='columns32'?8:32;
  const blockSize=shape==='columns32'?32:8;
  const parityCount=shape==='columns32'?8:4;
  const blocks=Array.from({length:blockCount},(_,b)=>
   encode(Array.from({length:blockSize-parityCount},
    (_,i)=>(31*b+73*i+19)%256),root,parityCount));
  const interleaved=shape==='columns32'
   ?Array.from({length:256},(_,i)=>blocks[i%8][Math.floor(i/8)])
   :blocks.flat();
  const parsed=splitBlocks(interleaved,shape);
  assert.deepEqual(parsed,blocks);
  assert.ok(parsed.every(b=>evalAt(b,exp[root])===0));
  interleaved[shape==='columns32'?8:1]^=0x5a;
  assert.ok(splitBlocks(interleaved,shape).some(b=>evalAt(b,exp[root])!==0));
 }
}
console.log(JSON.stringify({
 sourceSHA256:expected,
 sourceCounts:{bytes:grid.bytes.length,tokens:tokens.length},
 originalCandidateCount:cases.length,
 firstSyndromeZero:cases.filter(c=>c.firstSyndrome===0).length,
 minimumNonzeroAmong32:Math.min(...cases.map(c=>c.nonzeroAmong32)),
 syntheticRS255223AndSingleByteCorruption:'PASS for roots 0 and 1',
 syntheticRSInterleavedShortBlocks:'PASS for columns32 and rows8, roots 0 and 1, each with corruption control',
 originalInterleavedCandidateCount:blockCodewordCases.length,
 originalInterleavedCasesWithAllFirstSyndromesZero:blockCodewordCases.filter(c=>c.firstRootZeroCount===c.blockCount).length,
 blockCodewordCases,
 interpretation:'No standard direct GF256 RS codeword at either conventional first root under the declared 256→255 source-shaped serializations; no new plaintext.',
 cases
},null,2));
