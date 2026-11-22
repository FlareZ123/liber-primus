'use strict';
/**
 * Source-led LP2 GP28 packets -> original 2013 MP3 / own-book p50 256-byte XOR test.
 * The packet hypothesis is conjectural; only raw MP3 byte-zero XOR is historical.
 * Node 22, run from repository root with pinned 761.MP3 filename as argv[2].
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
/** @param {Buffer} b @returns {string} */
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
/** @param {readonly number[]} ds @returns {Buffer} */
function toBytes(ds) {
  if (!ds.length) return Buffer.alloc(0);
  let x=0n;
  for(const d of ds) {assert(d>=0&&d<28);x=x*28n+BigInt(d);}
  if(x===0n)return Buffer.from([0]);
  const a=[];while(x>0n){a.push(Number(x&255n));x>>=8n;}
  return Buffer.from(a.reverse());
}
/** @param {Buffer} data @param {number} width @returns {number[]} */
function toDigits(data,width) {
  let x=0n;for(const b of data)x=(x<<8n)|BigInt(b);
  const a=[];while(x>0n){a.push(Number(x%28n));x/=28n;}
  a.reverse();
  assert(a.length<=width);
  return Array(width-a.length).fill(0).concat(a);
}
/** @param {readonly number[]} runes @returns {{seed:number,packets:number[][],repeats:number}} */
function decode(runes) {
  assert(runes.length>0);
  const packets=[[]];let repeats=0;
  for(let i=1;i<runes.length;i++){
    const d=(runes[i]-runes[i-1]+29)%29;
    if(d===0){packets.push([]);repeats++;}
    else packets[packets.length-1].push(d-1);
  }
  return {seed:runes[0],packets,repeats};
}
/** @param {{seed:number,packets:number[][]}} decoded @returns {number[]} */
function encode(decoded) {
  const out=[decoded.seed];let prev=decoded.seed;
  decoded.packets.forEach((digits,i)=>{
    if(i>0)out.push(prev);
    digits.forEach(d=>{prev=(prev+d+1)%29;out.push(prev);});
  });
  return out;
}
/** @param {Buffer} bytes @param {Buffer} pad @returns {Buffer} */
function xor(bytes,pad) {
  assert(bytes.length<=pad.length);
  const out=Buffer.alloc(bytes.length);
  for(let i=0;i<bytes.length;i++)out[i]=bytes[i]^pad[i];
  return out;
}
/** @param {Buffer} b @returns {object} */
function describe(b){
  const count=Array(256).fill(0);
  for(const x of b)count[x]++;
  const n=b.length;
  let entropy=0,printable=0,maxrun=0,run=0;
  for(const c of count)if(c){const f=c/n;entropy-=f*Math.log2(f);}
  for(const x of b){
    if(x===9||x===10||x===13||(x>=32&&x<=126)){printable++;run++;maxrun=Math.max(run,maxrun);}
    else run=0;
  }
  const head=b.subarray(0,32).toString('hex');
  const magic=[['JPEG','ffd8ff'],['PNG','89504e470d0a1a0a'],['ZIP','504b0304'],['GZIP','1f8b'],['PDF','25504446']].find(v=>head.startsWith(v[1]));
  return {bytes:n,sha256:sha(b),first32hex:head,first120ascii:b.subarray(0,120).toString('latin1').replace(/[^\x20-\x7e]/g,'.'),asciiRate:+(printable/n).toFixed(6),entropyBits:+entropy.toFixed(6),maxPrintableRun:maxrun,magic:magic?.[0]??null};
}
const corpus=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const mp3=fs.readFileSync(process.argv[2]);
assert.equal(mp3.length,4010732);
assert.equal(sha(mp3),'83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460');
assert.equal(mp3.toString('latin1',0,3),'ID3');
const pages=corpus.pages.filter(p=>p.page<56&&p.runic_count>0);
assert.equal(pages.length,55);
assert.equal(pages.reduce((n,p)=>n+p.indices.length,0),12956);
const serialized=[];
let repeats=0,packetCount=0,leading0=0;
const spans=[];
for(const p of pages){
  const dec=decode(p.indices);
  assert.deepEqual(encode(dec),p.indices,'source rune round-trip');
  const parts=[];
  for(const digits of dec.packets){
    const packed=toBytes(digits);
    assert.deepEqual(toDigits(packed,digits.length),digits);
    if(digits[0]===0)leading0++;
    parts.push(packed);serialized.push(packed);
  }
  repeats+=dec.repeats;packetCount+=dec.packets.length;
  spans.push({page:p.page,runes:p.indices.length,packets:dec.packets.length,repeats:dec.repeats,bytes:Buffer.concat(parts).length});
}
assert.equal(repeats,86);
assert.equal(packetCount,141);
const raw=Buffer.concat(serialized);
const grid=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-grid-256.json','utf8'));
const table=Buffer.from(grid.bytes);
assert.equal(table.length,256);
const tableXor=bytes=>Buffer.from(bytes.map((b,i)=>b^table[i%table.length]));
const p50Global=tableXor(raw);
const pageBuffers=[];
let nextOffset=0;
for(const span of spans) {
  const slice=raw.subarray(nextOffset,nextOffset+span.bytes);
  pageBuffers.push(tableXor(slice));
  nextOffset+=span.bytes;
}
assert.equal(nextOffset,raw.length);
const p50PageReset=Buffer.concat(pageBuffers);
const candidate=xor(raw,mp3);
const solved=corpus.pages[57].indices.map(i=>corpus.translit[i]).join('');
const p57=Buffer.from(solved,'ascii');
const encrypted=xor(p57,mp3);
const width=Math.ceil(encrypted.length*8/Math.log2(28))+1;
const digits=toDigits(encrypted,width);
while(digits[0]===0)digits.shift();
const artificial=encode({seed:0,packets:[digits]});
const restored=toBytes(decode(artificial).packets[0]);
assert.deepEqual(restored,encrypted);
assert.deepEqual(xor(restored,mp3),p57);
const p50Plant=tableXor(p57);
const p50Digits=toDigits(p50Plant,Math.ceil(p50Plant.length*8/Math.log2(28))+1);
while(p50Digits[0]===0)p50Digits.shift();
const p50Artificial=encode({seed:0,packets:[p50Digits]});
assert.deepEqual(tableXor(toBytes(decode(p50Artificial).packets[0])),p57);
console.log(JSON.stringify({
  status:'PASS',source:{runeBearingPages:55,runes:12956,repeats,packetCount,leadingZeroPacketDigits:leading0,discardedPageSeedRunes:55,page0:spans[0],page55:spans.at(-1)},
  operation:'cyclic GP29 differences 1..28 mapped to digits 0..27; equality splits packet; per-physical-page rune0 seeds; packet big-endian integer -> minimal bytes; concatenated bytes XOR MP3 byte offset0',
  originalTransport:describe(raw),candidate:describe(candidate),
  p50OriginalTable:{source:'unchanged printed LP2 32x8 base60 numeric table',bytes:256,sha256:sha(table),
    consumer:'same base28 packets XOR repeated original 256 table bytes from row-major offset0; global and physical-page-reset clocks only',
    global:describe(p50Global),perPageReset:describe(p50PageReset),
    p57NativePositiveRecovered:true},
  plantedControl:{genuineP57RuneCount:95,plaintextByteCount:p57.length,artificialRuneCount:artificial.length,exactOriginalTextRecovered:true}
},null,2));
