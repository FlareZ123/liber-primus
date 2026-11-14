"use strict";
/**
 * Literal-F transparent H/G causal convolution: exact no-escape test.
 * All zero ciphertext runes are assumed to be plaintext F, consume no
 * convolution state, and every non-F plaintext must emit a nonzero rune.
 * This is more restrictive than an F mask which can mark encrypted Fs.
 * Deterministic Node.js 22 CommonJS SFT.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const c=JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources",
  "liber-primus","lp2-corpus.json"),"utf8"));
const pages=c.pages.filter(p=>p.page<56&&p.indices.length);
const original=pages.flatMap(p=>p.indices);
assert.equal(pages.length,55);
assert.equal(original.length,12956);
const bounds=[0,729,1874,3603,5506,6527,7960,9640,12648,12956];
const chapters=bounds.slice(0,-1).map((k,i)=>original.slice(k,bounds[i+1]));
const known=c.pages.find(p=>p.page===57).indices;
assert.equal(known.length,95);
const mod=x=>(x%29+29)%29;
const keys=[
  ["H",[3,26,24]],["Hr",[24,26,3]],
  ["G",[27,5,15]],["Gr",[15,5,27]],
  ["HG",[23,21,11,17,12]],["HGr",[12,17,11,21,23]]
];
/** @param {number[]} source @param {number[]} k */
function decode(source,k){
  const inv=Array.from({length:28},(_,i)=>i+1)
    .find(x=>mod(x*k[0])===1);
  assert(inv);
  const history=[],out=[];
  let illegal=0;
  for(const symbol of source){
    if(symbol===0){out.push(0);continue;}
    let n=symbol;
    for(let j=1;j<k.length&&j<=history.length;j++)
      n-=k[j]*history[history.length-j];
    const p=mod(n*inv);
    if(p===0)illegal++;
    out.push(p);
    history.push(p);
  }
  return {out,illegal};
}
/** @param {number[]} plain @param {number[]} k */
function encode(plain,k){
  const history=[],out=[];
  for(const p of plain){
    if(p===0){out.push(0);continue;}
    let n=k[0]*p;
    for(let j=1;j<k.length&&j<=history.length;j++)
      n+=k[j]*history[history.length-j];
    out.push(mod(n));
    history.push(p);
  }
  return out;
}
const originalCount=original.filter(x=>x===0).length;
assert.equal(originalCount,458);
const result=[];
for(const [key,k] of keys){
  const all=decode(original,k).illegal;
  const chapter=chapters.reduce((s,section)=>s+decode(section,k).illegal,0);
  const page=pages.reduce((s,p)=>s+decode(p.indices,k).illegal,0);
  assert([all,chapter,page].every(n=>n>0));
  let nativeStart=-1;
  for(let i=0;i<=known.length-20;i++){
    const fragment=known.slice(i,i+20);
    const encrypted=encode(fragment,k);
    if(encrypted.some((x,j)=>x===0&&fragment[j]!==0))continue;
    assert.deepEqual(decode(encrypted,k).out,fragment);
    assert.equal(decode(encrypted,k).illegal,0);
    nativeStart=i;break;
  }
  assert(nativeStart>=0);
  result.push({key,originalDecodesFOutsideCipherF:
    {whole:all,sourceChapters:chapter,physicalPages:page},
    authenticP57Plant:{start:nativeStart,length:20,exactRecovered:20}});
}
assert.deepEqual(result.map(r=>r.originalDecodesFOutsideCipherF.whole),
 [426,426,447,447,436,454]);
assert.deepEqual(result.map(r=>r.originalDecodesFOutsideCipherF.sourceChapters),
 [428,421,439,438,400,400]);
assert.deepEqual(result.map(r=>r.originalDecodesFOutsideCipherF.physicalPages),
 [414,474,402,415,422,403]);
console.log(JSON.stringify({
  model:"source 2013 H and LP2 p39 G causal convolution; all ciphertext F literal",
  originalRunes:original.length,originalCipherF:originalCount,
  originalModels:18,
  authNativePositivePlants:6,
  strictTransparencyViolatedInEveryOriginalModel:true,
  result,
  recoveredUnknownPlaintext:false
},null,2));
