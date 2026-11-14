'use strict';
/**
 * Frozen source-framed GP29 predecessor-excluding base28 + COBS transport.
 * Run: node sims/lp2_antirepeat_cobs_packet_sft.cjs
 * This proposed transport is exploratory, not a creator-authenticated opcode.
 * Original source: resources/liber-primus/lp2-corpus.json
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const SOURCE = path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json');
const CHAPTERS = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
/** @param {readonly number[]} bytes @returns {number[]} */
function cobsEncode(bytes) {
  const out=[0]; let place=0,code=1;
  for (const b of bytes) {
    assert(Number.isInteger(b)&&b>=0&&b<256);
    if (b===0) {out[place]=code;place=out.length;out.push(0);code=1;}
    else {out.push(b);code++;if(code===255){out[place]=255;place=out.length;out.push(0);code=1;}}
  }
  out[place]=code;
  return out;
}
/** @param {readonly number[]} data @returns {number[] | null} */
function cobsDecode(data) {
  const out=[];let i=0;
  while(i<data.length){
    const code=data[i++];
    if(code===0||i+code-1>data.length)return null;
    for(let j=1;j<code;j++)out.push(data[i++]);
    if(code<255&&i<data.length)out.push(0);
  }
  return out;
}
/** @param {readonly number[]} bytes @returns {number[]} */
function bytesToDigits(bytes) {
  let x=0n;
  for(const b of bytes)x=(x<<8n)|BigInt(b);
  if(x===0n)return [0];
  const out=[];while(x>0n){out.push(Number(x%28n));x/=28n;}
  return out.reverse();
}
/** @param {readonly number[]} digits @returns {number[]} */
function digitsToBytes(digits) {
  let x=0n;
  for(const d of digits){assert(Number.isInteger(d)&&d>=0&&d<28);x=x*28n+BigInt(d);}
  const out=[];while(x>0n){out.push(Number(x&255n));x>>=8n;}
  return out.reverse();
}
/**
 * Each equal predecessor/current rune delimits one packet, with initial seed
 * rune having no payload. Every other successor is a 28-choice rank digit.
 * @param {readonly (readonly number[])[]} packets
 * @param {number} seed
 * @returns {number[]}
 */
function encode(packets,seed=0){
  assert(Number.isInteger(seed)&&seed>=0&&seed<29);
  const runes=[seed];let prev=seed;
  for(let i=0;i<packets.length;i++){
    if(i>0)runes.push(prev);
    for(const d of bytesToDigits(cobsEncode(packets[i]))){
      const r=d>=prev?d+1:d;assert(r!==prev&&r>=0&&r<29);
      runes.push(r);prev=r;
    }
  }
  return runes;
}
/** @param {readonly number[]} runes @returns {{frames: number[][], decoded: (number[] | null)[], repeats: number}} */
function decode(runes){
  assert(runes.length>0);
  const frames=[[]];let repeats=0;
  for(let i=1;i<runes.length;i++){
    const prev=runes[i-1],curr=runes[i];
    assert(Number.isInteger(curr)&&curr>=0&&curr<29);
    if(prev===curr){repeats++;frames.push([]);}
    else frames[frames.length-1].push(curr<prev?curr:curr-1);
  }
  return {frames,decoded:frames.map(ds=>cobsDecode(digitsToBytes(ds))),repeats};
}
/** @param {readonly number[]} values @returns {string} */
function hex(values){return Buffer.from(values).toString('hex');}
function main(){
  const corpus=JSON.parse(fs.readFileSync(SOURCE,'utf8'));
  assert.equal(corpus.pages.length,58);
  assert.equal(corpus.runes.length,29);
  const p57=corpus.pages.find(p=>p.page===57);
  assert(p57&&p57.indices.length===95);
  const text=p57.indices.map(i=>corpus.translit[i]).join('');
  const p1=[...zlib.gzipSync(Buffer.from(text,'utf8'))];
  const p2=[...zlib.gzipSync(Buffer.from(text.slice(0,30),'utf8'))];
  const planted=encode([p1,p2]);
  const recovered=decode(planted);
  assert.equal(recovered.repeats,1);
  assert.deepEqual(recovered.decoded,[p1,p2]);
  assert.deepEqual(encode(recovered.decoded),planted);
  assert.equal(zlib.gunzipSync(Buffer.from(recovered.decoded[0])).toString('utf8'),text);
  assert.equal(zlib.gunzipSync(Buffer.from(recovered.decoded[1])).toString('utf8'),text.slice(0,30));
  assert.deepEqual(cobsDecode(cobsEncode([0,1,0,255,0,3])),[0,1,0,255,0,3]);
  assert.equal(cobsDecode([3,65]),null);
  console.log(JSON.stringify({control:'source-native solved p57, compressed then planted as two COBS frames',status:'PASS',sourceRunes:95,gzipSizes:[p1.length,p2.length],plantedRunes:planted.length}));
  let repeats=0,valid=0;
  const results=[];
  for(const [a,b] of CHAPTERS){
    const runes=corpus.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices);
    const dec=decode(runes), count=dec.decoded.filter(v=>v!==null).length;
    repeats+=dec.repeats;valid+=count;
    const digits=dec.frames.flat();
    const pairs=new Set();
    for(let k=0;k+1<digits.length;k+=2)pairs.add(digits[k]*28+digits[k+1]);
    results.push({chapter:'p'+a+'-'+b,runes:runes.length,doublets:dec.repeats,packets:dec.frames.length,validCOBS:count,firstSixBytes:hex(digitsToBytes(dec.frames[0]).slice(0,6)),distinctNonrepeatPairs:pairs.size});
  }
  assert.equal(results.reduce((n,x)=>n+x.runes,0),12956);
  assert.equal(repeats,86);
  assert.equal(valid,0);
  assert.equal(results.reduce((n,x)=>n+x.packets,0),95);
  // A stationary exact two-rank-pair code for 256 bytes cannot use >256
  // distinct pairs, even under an unknown secret 256-entry assignment.
  assert.equal(results.filter(x=>x.distinctNonrepeatPairs>256).length,8);
  console.log(JSON.stringify({original:'56 unknown original pages',chapters:results,totalPackets:95,validCOBSPackets:0,chaptersExceed256TwoRankByteCodebook:8},null,2));
  console.log('PASS: source-native planted transport recovers exact bytes; original frozen COBS model gives 0/95 valid packets. No unknown plaintext.');
}
if(require.main===module)main();
module.exports={cobsEncode,cobsDecode,bytesToDigits,digitsToBytes,encode,decode};
