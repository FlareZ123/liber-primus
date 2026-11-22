"use strict";
/**
 * Candidate source-derived byte payload from a conditional integer checksum,
 * frozen direct GP29 receiver on the two 2014 physical surrounding paragraphs
 * and an independent original page p53. This is not an author-specified cipher.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname,"..");
const read = name => fs.readFileSync(path.join(root,name),"utf8");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const originalBytes=grid.bytes;
assert.equal(originalBytes.length,256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(originalBytes))
  .digest("hex"),"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const N=originalBytes.reduce((acc,x)=>acc*256n+BigInt(x),0n);
assert.equal(N%1031n,512n);
let q=(N-512n)/1031n;
const quotientBytes=[];
while(q>0n){quotientBytes.unshift(Number(q%256n));q/=256n;}
assert.equal(quotientBytes.length,255);
assert.equal(quotientBytes[0],50);
const reconstructed=quotientBytes.reduce((acc,x)=>acc*256n+BigInt(x),0n)*1031n+512n;
assert.equal(reconstructed,N);
const originalBody49=corpus.pages.find(p=>p.page===49).indices;
const originalBody51=corpus.pages.find(p=>p.page===51).indices;
const originalPage53=corpus.pages.find(p=>p.page===53).indices;
const receivers=[
  {name:"p49+51 around 256 numeric cells",cipher:originalBody49.concat(originalBody51)},
  {name:"independent p53",cipher:originalPage53}
];
assert.deepEqual(receivers.map(x=>x.cipher.length),[158,179]);
const ioc=seq=>{
  const freq=Array(29).fill(0);
  for(const n of seq)freq[n]++;
  return freq.reduce((acc,n)=>acc+n*(n-1),0)/(seq.length*(seq.length-1));
};
const mod29=x=>(x%29+29)%29;
const key=quotientBytes.map(x=>x%29);
const decode=(cipher,sign)=>cipher.map((x,i)=>mod29(x+sign*key[i]));
const encode=(plain,sign)=>plain.map((x,i)=>mod29(x-sign*key[i]));
const gp=seq=>seq.map(i=>corpus.translit[i]).join("");
const native=corpus.pages.find(p=>p.page===57).indices;
assert.equal(native.length,95);
const outputs=[];
for(const {name,cipher} of receivers){
  for(const sign of [-1,+1]){
    const plain=decode(cipher,sign);
    assert.deepEqual(encode(plain,sign),cipher);
    const planted=Array.from({length:cipher.length},(_,i)=>native[i%native.length]);
    assert.deepEqual(decode(encode(planted,sign),sign),planted);
    outputs.push({
      receiver:name,length:cipher.length,sign,
      originalIoC:ioc(cipher),decodedIoC:ioc(plain),
      first60:gp(plain.slice(0,60))
    });
  }
}
const printable=quotientBytes.filter(x=>x>=32&&x<=126).length;
const longestPrintable=quotientBytes.reduce((s,x)=>{
  const n=x>=32&&x<=126?s.n+1:0;
  return {n,max:Math.max(s.max,n)};
},{n:0,max:0}).max;
assert.equal(printable,88);
assert.equal(longestPrintable,4);
assert(Math.max(...outputs.map(x=>x.decodedIoC))<0.04);
console.log(JSON.stringify({
  sourceIntBytes:256,integerModulus:1031,integerRemainder:512,
  quotientBytes:quotientBytes.length,quotientASCIIPrintable:printable,
  quotientLongestPrintable:longestPrintable,
  quotientFirst20:quotientBytes.slice(0,20),
  originalReceiverOutputs:outputs,
  originalInverseAndNativePlantsPass:true,
  decision:"Euclidean quotient and direct GP29 modulation reveal neither byte-text payload nor page prose; source does not specify quotient or recipient."
},null,2));
