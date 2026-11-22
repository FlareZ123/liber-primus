#!/usr/bin/env node
"use strict";
/**
 * Original LP2 p2 versus five p23–26 strands through historical ssss 0.5.
 * Node.js 22 CommonJS; single-file test; no dependencies or network traffic.
 *
 * Interprets five 201-digit GP29 strands as share y-values in GF(2^984),
 * evaluates ssss's monic degree-five polynomial at decimal IDs 1..10, and
 * checks p2 as either the encoded constant or its XTEA-undiffused plaintext.
 * No plaintext or share ID is inferred from the ciphertext.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const pages = corpus.pages;
const p2 = pages.find(p => p.page === 2).indices;
const targetWitness = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources", "cicada2014-anend-binary-witness.json"), "utf8"));
const p56TargetHex = targetWitness.target_hex; // 2014 archived 56.bin witness is the same 64-byte digest printed on LP2 p56.
const p56TargetBytes = Buffer.from(p56TargetHex, "hex");
assert.equal(p56TargetBytes.length, 64);
assert.equal(crypto.createHash("sha256").update(p56TargetBytes).digest("hex"),
  targetWitness.source_sha256);
const fivePages = pages.filter(p => p.page >= 23 && p.page <= 26);
assert.deepEqual(fivePages.map(p => p.indices.length), [213,270,273,265]);
const all = fivePages.flatMap(p => p.indices);
assert.deepEqual(all.slice(0,16), [1,24,7,21,6,14,23,6,10,17,10,12,16,17,10,26]);
const body = all.slice(16);
assert.equal(body.length,1005);
assert.equal(p2.length,201);
const degree = 984n, top = 1n << degree, polynomial =
  top | (1n << 24n) | (1n << 9n) | (1n << 3n) | 1n;
const limit201 = 29n ** 201n;

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function multiply(a,b) {
  let out=0n;
  while(b!==0n) {
    if(b&1n)out ^= a;
    b >>= 1n;
    a <<= 1n;
    if(a&top)a ^= polynomial;
  }
  return out;
}
/** @param {bigint} a @returns {bigint} */
function inverse(a) {
  assert.notEqual(a,0n);
  let u=a,v=polynomial,g=1n,h=0n;
  while(u!==1n) {
    assert.notEqual(u,0n);
    let shift=u.toString(2).length-v.toString(2).length;
    if(shift<0) {
      [u,v]=[v,u];[g,h]=[h,g];
      shift=-shift;
    }
    u ^= v<<BigInt(shift);
    g ^= h<<BigInt(shift);
  }
  while(g>=top)g ^= polynomial<<BigInt(g.toString(2).length-985);
  return g;
}
/** @param {bigint} x @param {number} n @returns {bigint} */
function power(x,n) {
  let y=1n;
  for(let i=0;i<n;i++)y=multiply(y,x);
  return y;
}
/** @param {number[]} runes @returns {bigint} */
function numeric(runes) {
  return runes.reduce((v,r)=>v*29n+BigInt(r),0n);
}
/** @param {bigint} v @param {number[]} runes @returns {number} */
function countMatchingRunes(v,runes) {
  let equal=0;
  for(let i=200;i>=0;i--) {
    if(v%29n===BigInt(runes[i]))equal++;
    v/=29n;
  }
  assert.equal(v,0n);
  return equal;
}
/** ssss 0.5 block transform, with precise unsigned 32-bit arithmetic. */
function xtea(a,b,reverse) {
  let sum=reverse ? 0xC6EF3720 : 0;
  const delta=0x9E3779B9;
  for(let i=0;i<32;i++) {
    if(reverse) {
      b=(b-((((((a<<4)^(a>>>5))+a)>>>0)^sum)))>>>0;
      sum=(sum-delta)>>>0;
      a=(a-((((((b<<4)^(b>>>5))+b)>>>0)^sum)))>>>0;
    } else {
      a=(a+((((((b<<4)^(b>>>5))+b)>>>0)^sum)))>>>0;
      sum=(sum+delta)>>>0;
      b=(b+((((((a<<4)^(a>>>5))+a)>>>0)^sum)))>>>0;
    }
  }
  return [a,b];
}
/**
 * Reproduce ssss's 16-bit little-word, big-byte-endian XTEA diffusion.
 * @param {bigint} secret
 * @param {number} bits
 * @param {boolean} reverse
 */
function diffuse(secret,bits,reverse) {
  const len=bits/8,sz=Math.ceil(len/2)*2,data=new Uint8Array(sz);
  let x=secret;
  for(let i=0;i<sz;i+=2) {
    const word=Number(x&65535n);
    data[i]=word>>>8;data[i+1]=word&255;
    x >>= 16n;
  }
  assert.equal(x,0n);
  if(bits%16===8)data[len-1]=data[len];
  function slice(index) {
    const words=[0,0];
    for(let j=0;j<2;j++) {
      const k=(index+4*j)%len;
      words[j]=(data[k]<<24 | data[(k+1)%len]<<16 |
        data[(k+2)%len]<<8 | data[(k+3)%len])>>>0;
    }
    const result=xtea(words[0],words[1],reverse);
    for(let j=0;j<2;j++) {
      const k=(index+4*j)%len;
      for(let h=0;h<4;h++)data[(k+h)%len]=(result[j]>>>(24-8*h))&255;
    }
  }
  const turns=40*len;
  if(reverse)for(let i=turns-2;i>=0;i-=2)slice(i);
  else for(let i=0;i<turns;i+=2)slice(i);
  if(bits%16===8) {
    data[len]=data[len-1];
    data[len-1]=0;
  }
  let output=0n;
  for(let i=sz-2;i>=0;i-=2) {
    output=(output<<16n)|BigInt((data[i]<<8)|data[i+1]);
  }
  assert.ok(output<(1n<<BigInt(bits)));
  return output;
}
const historicalEncoded =
  0x65b9c4065cc47a4a48e01d17de166a94252dfbb44e69n;
const historicalRaw=diffuse(historicalEncoded,176,true);
assert.equal(Buffer.from(historicalRaw.toString(16),"hex").toString("ascii"),
  "p7amjopgric7dfdi.onion");
assert.equal(diffuse(historicalRaw,176,false),historicalEncoded);
const originalTarget=numeric(p2),reversed=[...p2].reverse();
const backwardTarget=numeric(reversed);
const encodedTargets=[originalTarget,backwardTarget,
  diffuse(originalTarget,984,false),diffuse(backwardTarget,984,false)];
for(const v of [originalTarget,backwardTarget]) {
  assert.equal(diffuse(diffuse(v,984,false),984,true),v);
}
const formations={
  columns:Array.from({length:5},(_,j)=>body.filter((_,i)=>i%5===j)),
  blocks:Array.from({length:5},(_,j)=>body.slice(201*j,201*(j+1)))
};
const views=Object.entries(formations).flatMap(([name,lanes])=>[
  {label:name+"-forward",ys:lanes.map(numeric)},
  {label:name+"-reverse",ys:lanes.map(a=>numeric([...a].reverse()))}
]);
const permutations=[];
function permute(left,out) {
  if(!left.length){permutations.push(out);return;}
  for(let i=0;i<left.length;i++) {
    permute(left.filter((_,j)=>j!==i),[...out,left[i]]);
  }
}
permute([0,1,2,3,4],[]);
assert.equal(permutations.length,120);
const sets=[];
function choose(previous,next) {
  if(previous.length===5){sets.push(previous);return;}
  for(let i=next;i<10;i++)choose([...previous,BigInt(i+1)],i+1);
}
choose([],0);
assert.equal(sets.length,252);
const cachedInverses=Array.from({length:16},(_,i)=>i?inverse(BigInt(i)):0n);
for(let i=1;i<16;i++) {
  assert.equal(multiply(BigInt(i),cachedInverses[i]),1n);
}
const stats=views.map(v=>({
  layout:v.label,trials:0,legal201:0,maxAgreement:0,exactTargetMatches:0,
  naturalReadableBytes:null,naturalDecodedPrefix:null,naturalSecretHex:null,naturalByteEntropy:null,naturalSecretHashes:null,p56HashMatches:null
}));
for(const ids of sets) {
  const weights=ids.map((xi,i)=>ids.reduce((q,xj,j)=>
    i===j?q:multiply(q,multiply(xj,cachedInverses[Number(xi^xj)])),1n));
  const monicCorrection=ids.reduce((q,xi,i)=>
    q^multiply(weights[i],power(xi,5)),0n);
  if(ids.every((x,i)=>x===BigInt(i+1))) {
    // Synthetic positive with actual p2 as its 984-bit secret and ssss Horner.
    const coeff=[originalTarget,1n,2n,3n,4n];
    const shareY=ids.map(x=>{
      let y=x;
      for(let j=4;j>=1;j--)y=multiply(y^coeff[j],x);
      return y^coeff[0];
    });
    const restored=monicCorrection^shareY.reduce(
      (s,y,i)=>s^multiply(weights[i],y),0n);
    assert.equal(restored,originalTarget);
  }
  for(let k=0;k<views.length;k++) {
    const view=views[k],stat=stats[k];
    const pre=weights.map(w=>view.ys.map(y=>multiply(w,y)));
    for(const assignment of permutations) {
      const recovered=monicCorrection^assignment.reduce(
        (v,which,i)=>v^pre[i][which],0n);
      stat.trials++;
      if(encodedTargets.includes(recovered))stat.exactTargetMatches++;
      if(recovered<limit201) {
        stat.legal201++;
        stat.maxAgreement=Math.max(stat.maxAgreement,
          countMatchingRunes(recovered,p2),
          countMatchingRunes(recovered,reversed));
      }
      if(ids.every((x,i)=>x===BigInt(i+1)) &&
         assignment.every((v,i)=>v===i)) {
        const raw=diffuse(recovered,984,true);
        const bytes=Buffer.from(raw.toString(16).padStart(246,"0"),"hex");
        stat.naturalReadableBytes=[...bytes]
          .filter(n=>n>=32 && n<127).length;
        stat.naturalDecodedPrefix=bytes.toString("latin1")
          .replace(/[^ -~]/g,".").slice(0,35);
        stat.naturalSecretHex=bytes.toString("hex");
        const counts=Array(256).fill(0);
        for(const byte of bytes)counts[byte]++;
        stat.naturalByteEntropy=-counts.reduce((sum,count)=>count
          ?sum+(count/bytes.length)*Math.log2(count/bytes.length):sum,0);
        stat.naturalSecretHashes={
          "SHA-512":crypto.createHash("sha512").update(bytes).digest("hex"),
          "SHA3-512":crypto.createHash("sha3-512").update(bytes).digest("hex"),
          "BLAKE2b-512":crypto.createHash("blake2b512").update(bytes).digest("hex"),
          "SHAKE256-64":crypto.createHash("shake256",{outputLength:64}).update(bytes).digest("hex")
        };
        stat.p56HashMatches=Object.entries(stat.naturalSecretHashes)
          .filter(([,digest])=>digest===p56TargetHex).map(([name])=>name);
      }
    }
  }
}
assert.deepEqual(stats.map(s=>s.trials),[30240,30240,30240,30240]);
assert.deepEqual(stats.map(s=>s.legal201),[489,726,274,689]);
assert.deepEqual(stats.map(s=>s.maxAgreement),[14,17,14,17]);
assert.deepEqual(stats.map(s=>s.naturalReadableBytes),[44,54,48,47]);
assert.ok(stats.every(s=>s.exactTargetMatches===0));
assert.ok(stats.every(s=>s.naturalSecretHex.length===246));
assert.ok(stats.every(s=>s.p56HashMatches.length===0));
console.log(JSON.stringify({
  status:"PASS",date:"2026-11-12",unknownPage2Runes:201,
  unknownFiveDotChapterRunes:1005,degreeBits:984,
  fieldPolynomial:"x^984+x^24+x^9+x^3+1",
  historicalSSSSSecret:"p7amjopgric7dfdi.onion",
  syntheticOriginalP2SharePlant:"exact full 984-bit recovery",
  shareIdentifierAssignments:30240,
  totalOriginalReconstructionTests:120960,
  targetReadings:["page2-original","page2-reversed",
    "XTEA(page2-original)","XTEA(page2-reversed)"],
  p56Target:{bytes:64,hex:p56TargetHex,digestFamilies:["SHA-512","SHA3-512","BLAKE2b-512","SHAKE256-64"]},
  stats,decision:"Natural IDs01..05 123-byte outputs miss LP2 p56's printed 64-byte target under four common 512-bit digest families (0/16). The complete 5-of-10 SHA-512 assignment search is independently covered by sims/lp2_p23_26_ssss984_p56_sha512_preimage_sft.cpp."
},null,2));
