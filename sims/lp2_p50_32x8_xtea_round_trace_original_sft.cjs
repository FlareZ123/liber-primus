'use strict';
/**
 * Direct XTEA 32-round/8-byte original p49–51 grid trace test.
 *
 * The p50 32x8 numeric table can be read as 32 64-bit block states:
 * a very specific period-design hypothesis for XTEA (32 full cycles).
 * Every pair of consecutive states uniquely fixes the indexed 32-bit
 * secret word for each of XTEA's two update half-steps. A real trace
 * must give the SAME word at every reused key index. Key search is
 * unnecessary and would only weaken this test.
 *
 * Two natural byte orders, two block-half orders, and both legitimate
 * trace origins (first displayed row is the initial state or after
 * one cycle) exhaust this **source-frozen 8-case trace hypothesis**.
 * No page-specific resets, shifted rows or arbitrary byte rotations.
 *
 * Windows Node.js 22:
 *   node sims/lp2_p50_32x8_xtea_round_trace_original_sft.cjs
 *
 * XTEA published algorithm: Needham/Wheeler; standard 32-cycle
 * version with delta 0x9e3779b9, key index (sum & 3) and
 * ((sum >>> 11) & 3) for the two half-cycles.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'
));
const bytes = grid.pages.flatMap(x => x.bytes);
assert.deepEqual(grid.pages.map(x => x.page), [49, 50, 51]);
assert.equal(bytes.length, 256);
assert(bytes.every(x => Number.isInteger(x) && x>=0 && x<=255));
const packet = Buffer.from(bytes);
const DELTA = 0x9E3779B9;
const schedule = [];
let running = 0;
for (let j=0;j<=32;j++) {
  schedule.push(running);
  running = (running + DELTA)>>>0;
}
/** @param {number} v @returns {number} */
const mix = v => ((((v<<4)^(v>>>5))+v)>>>0);
/**
 * @param {number} v0 @param {number} v1
 * @param {number} sum @param {number[]} key
 * @returns {[number,number]}
 */
function nextCycle(v0,v1,sum,key) {
  const left = (v0 + (mix(v1) ^ ((sum+key[sum&3])>>>0)))>>>0;
  const sumAfter = (sum+DELTA)>>>0;
  const right = (v1 + (mix(left) ^ ((sumAfter+key[(sumAfter>>>11)&3])>>>0)))>>>0;
  return [left,right];
}
/**
 * @param {[number,number]} previous
 * @param {[number,number]} next
 * @param {number} sumBefore
 * @returns {[[number,number],[number,number]]}
 */
function inferWords(previous,next,sumBefore) {
  const [v0,v1] = previous, [w0,w1] = next;
  const sumAfter = (sumBefore+DELTA)>>>0;
  const key0 = (((((w0-v0)>>>0)^mix(v1))-sumBefore)>>>0);
  const key1 = (((((w1-v1)>>>0)^mix(w0))-sumAfter)>>>0);
  return [
    [sumBefore & 3,key0],
    [(sumAfter>>>11)&3,key1]
  ];
}
/**
 * @param {[number,number][]} states
 * @param {number} startRound 0 if first displayed state precedes
 *                          cycle0, 1 if it follows cycle0
 */
function assess(states,startRound) {
  assert.equal(states.length, 32);
  const recovered = [[],[],[],[]];
  for (let j=0;j<31;j++) {
    for(const [index,value] of inferWords(states[j],states[j+1],schedule[startRound+j])) {
      recovered[index].push(value);
    }
  }
  const distinct = recovered.map(arr => new Set(arr).size);
  const maxRepeated = recovered.map(arr => {
    const counts=new Map();
    for(const v of arr)counts.set(v,(counts.get(v)||0)+1);
    return Math.max(...counts.values());
  });
  const uniqueConsistent = recovered.every(arr => new Set(arr).size === 1);
  return {sourceObservations:recovered.map(x=>x.length),
    distinctKeyCandidates:distinct,
    maxRepeatedByKeySlot:maxRepeated,
    uniquelyConsistentAcross31Transitions:uniqueConsistent,
    hypothesizedKey:uniqueConsistent?recovered.map(x=>x[0]):null};
}
/**
 * @param {Buffer} raw @param {boolean} little
 * @param {boolean} swapHalves
 * @returns {[number,number][]}
 */
function readStates(raw,little,swapHalves) {
  return Array.from({length:32},(_,row)=>{
    const off=row*8;
    const a=little?raw.readUInt32LE(off):raw.readUInt32BE(off);
    const b=little?raw.readUInt32LE(off+4):raw.readUInt32BE(off+4);
    return swapHalves?[b,a]:[a,b];
  });
}
const results=[];
for(const littleEndian of [true,false]) {
  for(const swapHalves of [false,true]) {
    const original=readStates(packet,littleEndian,swapHalves);
    for (const startRound of [0,1]) {
      const result=assess(original,startRound);
      assert.equal(result.uniquelyConsistentAcross31Transitions,false);
      assert.deepEqual(result.maxRepeatedByKeySlot,[1,1,1,1]);
      assert.deepEqual(result.distinctKeyCandidates,result.sourceObservations);
      results.push({littleEndian,swapHalves,startRound,...result});
    }
  }
}
assert.equal(results.length,8);
// Genuine XTEA-positive: create 32 successive full states with a fixed
// 128-bit native key, verify the round equation and recover all four
// original 32-bit key words exactly from only the printed state stream.
const secret=[257,38,48,3301],planted=[];
let prev=[0xA5A5A5A5,0x5A5A5A5A],sum=0;
for(let i=0;i<32;i++) {
  planted.push(prev);
  prev=nextCycle(...prev,sum,secret);
  sum=(sum+DELTA)>>>0;
}
const plantedResult=assess(planted,0);
assert(plantedResult.uniquelyConsistentAcross31Transitions);
assert.deepEqual(plantedResult.hypothesizedKey,secret);
// First displayed state after cycle0 is also a legal source origin;
// a separately planted chain with 33 intermediate states is required.
let first=nextCycle(0xDAB0AC47,0x16A993DE,0,secret);
const plantedOne=[];
sum=DELTA;
for(let i=0;i<32;i++){
  plantedOne.push(first);
  first=nextCycle(...first,sum,secret);
  sum=(sum+DELTA)>>>0;
}
const shifted=assess(plantedOne,1);
assert(shifted.uniquelyConsistentAcross31Transitions);
assert.deepEqual(shifted.hypothesizedKey,secret);
// Byte-order round-trip plant for all natural readout variants.
for(const little of [true,false]){
  for(const swapped of [false,true]){
    const buf=Buffer.alloc(256);
    for(let i=0;i<32;i++){
      const [a,b]=swapped?planted[i].slice().reverse():planted[i];
      little?buf.writeUInt32LE(a,i*8):buf.writeUInt32BE(a,i*8);
      little?buf.writeUInt32LE(b,i*8+4):buf.writeUInt32BE(b,i*8+4);
    }
    assert.deepEqual(readStates(buf,little,swapped),planted);
    assert(assess(readStates(buf,little,swapped),0).uniquelyConsistentAcross31Transitions);
  }
}

// Separate complete 256-byte original data consumer, motivated by
// 32 printed eight-byte rows as 32 independently XTEA-enciphered blocks.
// Key A is an exact 4-word p0 source tuple p,g,x,g^x from the FFF
// GF257 corridor (257,38,48,225). Key B replaces the fourth word
// with original p39's visibly marked leading coefficient 15.
// Neither candidate is called a verified key; no secret is searched.
// A full row is the standard 64-bit block; no hidden IV/tail/nonce.
const tupleKeys=[[257,38,48,225],[257,38,48,15]];
/** @param {number} v0 @param {number} v1 @param {number[]} key @returns {[number,number]} */
function encryptBlock(v0,v1,key){
 let sum=0;
 for(let j=0;j<32;j++){
  [v0,v1]=nextCycle(v0,v1,sum,key);
  sum=(sum+DELTA)>>>0;
 }
 return [v0,v1];
}
/** @param {number} v0 @param {number} v1 @param {number[]} key @returns {[number,number]} */
function decryptBlock(v0,v1,key){
 let sum=0xC6EF3720;
 for(let j=0;j<32;j++){
  v1=(v1-(mix(v0)^((sum+key[(sum>>>11)&3])>>>0)))>>>0;
  sum=(sum-DELTA)>>>0;
  v0=(v0-(mix(v1)^((sum+key[sum&3])>>>0)))>>>0;
 }
 return [v0,v1];
}
const appendWord=(buffer,offset,value,little)=>{
 if(little)buffer.writeUInt32LE(value,offset);
 else buffer.writeUInt32BE(value,offset);
};
/**
 * @param {Buffer} bytes @param {number[]} key
 * @param {boolean} little @param {boolean} swap
 * @param {boolean} encryption
 * @returns {Buffer}
 */
function applyXtea32(bytes,key,little,swap,encryption){
 const out=Buffer.alloc(256);
 for(let row=0;row<32;row++){
  let a=little?bytes.readUInt32LE(row*8):bytes.readUInt32BE(row*8);
  let b=little?bytes.readUInt32LE(row*8+4):bytes.readUInt32BE(row*8+4);
  if(swap)[a,b]=[b,a];
  let [u,v]=encryption?encryptBlock(a,b,key):decryptBlock(a,b,key);
  if(swap)[u,v]=[v,u];
  appendWord(out,row*8,u,little);
  appendWord(out,row*8+4,v,little);
 }
 return out;
}
const solved = JSON.parse(fs.readFileSync(
 path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'
)).pages.find(p=>p.page===57).indices;
assert.equal(solved.length,95);
const nativePlant=Buffer.from(Array.from({length:256},(_,i)=>solved[i%solved.length]));
const blockResults=[];
for(const key of tupleKeys){
 for(const littleEndian of [true,false]){
  for(const swapHalves of [false,true]){
   const clear=applyXtea32(packet,key,littleEndian,swapHalves,false);
   const actual={key,littleEndian,swapHalves,
    asciiPrintable:[...clear].filter(b=>b>=32&&b<=126).length,
    asciiLetters:[...clear].filter(b=>(b>=65&&b<=90)||(b>=97&&b<=122)).length,
    nativeGP29:[...clear].filter(b=>b<29).length,
    first8Bytes:[...clear.subarray(0,8)]};
   assert(actual.nativeGP29<50);
   assert(actual.asciiPrintable<125);
   const plantedCipher=applyXtea32(nativePlant,key,littleEndian,swapHalves,true);
   const roundtrip=applyXtea32(plantedCipher,key,littleEndian,swapHalves,false);
   assert.deepEqual(roundtrip,nativePlant);
   blockResults.push(actual);
  }
 }
}
assert.equal(blockResults.length,8);

console.log(JSON.stringify({
  status:'PASS: original 32x8 grid is not an ordered 32-cycle XTEA block-state trace',
  originalRows:32,bytes:256,transitions:31,cases:results,
  plantedOriginalRecovered32BitWords:plantedResult.hypothesizedKey,
  plantedOneCycleShiftedRecoveredWords:shifted.hypothesizedKey,
  independentlyEncryptedXteaBlockTests:blockResults,
  nativePositive256BytesRecovered:true,
  caution:'Does not reject XTEA encryption of some other byte payload or a differently keyed/ordered layout; no first-party text selects XTEA.'
},null,2));
