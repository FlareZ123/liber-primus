"use strict";
/**
 * LP2 third visual chapter 1033-byte BASE28 successor transport:
 * test its source-fixed byte serialization against the known p56 512-bit hash.
 *
 * The coincident 2014 seven-by-seven magic sum 1033 motivates this one
 * diagnostic, without asserting a historical instruction or key recovery.
 * Run: node sims/lp2_base28_1033_hash_sft.cjs (Node.js 22, Windows 11)
 *
 * @typedef {{first:number, flags:boolean[], rank:number[]}} Frame
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const {spawnSync} = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname,"..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const ranges = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const target = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
assert.match(target,/^[0-9a-f]{128}$/u);
/** @param {number[]} cipher @returns {Frame} */
function frame(cipher){
  assert.ok(cipher.length>0);
  const flags=[],rank=[];
  for(let i=1;i<cipher.length;i++){
    const step=(cipher[i]-cipher[i-1]+29)%29;
    flags.push(step===0);
    if(step!==0)rank.push(step-1);
  }
  return {first:cipher[0],flags,rank};
}
/** @param {number[]} rank @returns {Buffer} */
function toBytes(rank){
  let integer=0n;
  for(const digit of rank){
    assert.ok(Number.isInteger(digit)&&digit>=0&&digit<28);
    integer=integer*28n+BigInt(digit);
  }
  let hex=integer.toString(16);
  if(hex.length%2)hex="0"+hex;
  return Buffer.from(hex,"hex");
}
/** @param {Buffer} bytes @param {number} count @returns {number[]} */
function fromBytes(bytes,count){
  let integer=BigInt("0x"+bytes.toString("hex"));
  const rank=Array(count).fill(0);
  for(let i=count-1;i>=0;i--){
    rank[i]=Number(integer%28n);
    integer/=28n;
  }
  assert.equal(integer,0n);
  return rank;
}
/** @param {Frame} f @returns {number[]} */
function rebuild(f){
  const out=[f.first];
  let j=0;
  for(const isZero of f.flags){
    const step=isZero?0:1+f.rank[j++];
    out.push((out[out.length-1]+step)%29);
  }
  assert.equal(j,f.rank.length);
  return out;
}
const hashes=["sha512","sha3-512","blake2b512","whirlpool"];
const supported=new Set(crypto.getHashes());
const whirlpoolProbe=spawnSync("openssl",["dgst","-whirlpool","-provider","legacy","-binary"],{input:Buffer.from("test")});
const hasWhirlpool=whirlpoolProbe.status===0&&whirlpoolProbe.stdout.length===64;
const used=hashes.filter(x=>supported.has(x)||(x==="whirlpool"&&hasWhirlpool));
assert.ok(used.includes("sha512")&&used.includes("sha3-512")&&used.includes("blake2b512"));
const sources=ranges.map(([a,b])=>corpus.pages
  .filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices));
assert.equal(sources.reduce((s,a)=>s+a.length,0),12956);
const records=[];
for(let k=0;k<sources.length;k++){
  const f=frame(sources[k]),bytes=toBytes(f.rank);
  assert.deepEqual(fromBytes(bytes,f.rank.length),f.rank);
  assert.deepEqual(rebuild(f),sources[k]);
  const actual=Object.fromEntries(used.map(h=>{
    if(h!=="whirlpool")return [h,crypto.createHash(h).update(bytes).digest("hex")];
    const r=spawnSync("openssl",["dgst","-whirlpool","-provider","legacy","-binary"],{input:bytes});
    assert.equal(r.status,0);
    assert.equal(r.stdout.length,64);
    return [h,r.stdout.toString("hex")];
  }));
  records.push({
    chapter:k+1,pages:ranges[k],runes:sources[k].length,
    equalSteps:f.flags.filter(Boolean).length,
    radix28Digits:f.rank.length,bytes:bytes.length,
    firstEightBytes:bytes.subarray(0,8).toString("hex"),
    digests:actual,
    match:Object.entries(actual).filter(([,v])=>v===target).map(([h])=>h)
  });
}
assert.deepEqual(records.map(r=>r.equalSteps),[4,6,9,10,11,13,12,18,3]);
assert.deepEqual(records.map(r=>r.bytes),[436,684,1033,1137,607,853,1002,1796,183]);
assert.equal(records[2].runes,1729);
const src=frame(sources[2]);
const plant=Buffer.alloc(1031);
for(let i=0;i<plant.length;i++)plant[i]=(i*31+17)%256;
const plantFrame={...src,rank:fromBytes(plant,src.rank.length)};
const plantedCipher=rebuild(plantFrame);
const recovered=toBytes(frame(plantedCipher).rank);
assert.deepEqual(recovered,plant);
const good=crypto.createHash("sha512").update(recovered).digest("hex");
assert.equal(good,crypto.createHash("sha512").update(plant).digest("hex"));
const altered=Buffer.from(plant);
altered[0]^=1;
assert.notEqual(good,crypto.createHash("sha512").update(altered).digest("hex"));
const matches=records.flatMap(r=>r.match.map(h=>[r.chapter,h]));
console.log(JSON.stringify({
  status:"PASS",result:matches.length?"EXACT ORIGINAL P56 HASH MATCH":"NO P56 HASH MATCH",
  method:"Original nine chapter GP29 differences, omit zero steps, successor 1..28 as base28 digits, one minimal bigendian integer per chapter",
  p56Hash:target, hashAlgorithms:used, unsupported:hashes.filter(x=>!used.includes(x)),
  thirdChapter:{pages:ranges[2],runes:records[2].runes,bytes:records[2].bytes,
    coincidence:"1033 also equals 2014 seven-by-seven magic sum; independently selected transport unproven"},
  originalExactRoundtrip:true,native1031BytePlantRecovered:true,
  exactMatches:matches,
  chapters:records.map(({digests,...r})=>({
    ...r,digestPrefixes:Object.fromEntries(Object.entries(digests).map(([h,d])=>[h,d.slice(0,16)]))
  }))
},null,2));