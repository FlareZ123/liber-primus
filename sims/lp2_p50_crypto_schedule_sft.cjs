/**
 * Single-file original-source test: SHA-256 and AES-256 expansion schedules.
 * Node.js >=18; read-only; execute from any working directory.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

/** @param {number} a @param {number} b @returns {number} */
function gfMul(a,b) {
  let out=0;
  for(let i=0;i<8;i++) {
    if(b&1) out^=a;
    a=((a<<1)&255)^((a&128)?27:0);
    b>>>=1;
  }
  return out;
}
/** @param {number} v @returns {number} */
function sBox(v) {
  let inv=0;
  if(v) for(let x=1;x<256;x++) if(gfMul(v,x)===1){inv=x;break;}
  let out=0x63;
  for(let i=0;i<8;i++){
    const bit=((inv>>>i)^(inv>>>((i+4)%8))^(inv>>>((i+5)%8))^
      (inv>>>((i+6)%8))^(inv>>>((i+7)%8)))&1;
    out^=bit<<i;
  }
  return out;
}
const S=Array.from({length:256},(_,i)=>sBox(i));
assert.equal(S[0],0x63);
assert.equal(S[0x53],0xed);

/** AES-256: eight 32-bit initial words, extend through table's 64 words.
 * @param {number[]} first32 @returns {number[]}
 */
function aesExpand(first32) {
  assert.equal(first32.length,32);
  /** @type {number[][]} */
  const w=[];
  for(let i=0;i<8;i++) w.push(first32.slice(4*i,4*i+4));
  let rc=1;
  for(let i=8;i<64;i++){
    let t=w[i-1].slice();
    if(i%8===0){
      t=[t[1],t[2],t[3],t[0]].map(x=>S[x]);
      t[0]^=rc; rc=gfMul(rc,2);
    } else if(i%8===4) t=t.map(x=>S[x]);
    w.push(w[i-8].map((x,j)=>x^t[j]));
  }
  return w.flat();
}
/** @param {number} n @param {number} s @returns {number} */
function rr(n,s){return (n>>>s)|(n<<(32-s));}
/** @param {number} n @returns {number} */
function sigma0(n){return rr(n,7)^rr(n,18)^(n>>>3);}
/** @param {number} n @returns {number} */
function sigma1(n){return rr(n,17)^rr(n,19)^(n>>>10);}
/** Standard SHA-256 16-word 512-bit message schedule extension.
 * @param {number[]} seed @returns {number[]}
 */
function shaExpand(seed) {
  assert.equal(seed.length,16);
  const w=seed.slice();
  for(let i=16;i<64;i++)
    w.push((sigma1(w[i-2])+w[i-7]+sigma0(w[i-15])+w[i-16])>>>0);
  return w;
}
/** @param {number[]} bytes @param {boolean} le @returns {number[]} */
function toWords(bytes,le) {
  assert.equal(bytes.length,256);
  return Array.from({length:64},(_,i)=>{
    const b=bytes.slice(4*i,4*i+4);
    if(le)b.reverse();
    return ((b[0]<<24)|(b[1]<<16)|(b[2]<<8)|b[3])>>>0;
  });
}
/** @param {number[]} words @param {boolean} le @returns {number[]} */
function fromWords(words,le) {
  return words.flatMap(w=>{
    const b=[w>>>24,(w>>>16)&255,(w>>>8)&255,w&255];
    if(le)b.reverse();
    return b;
  });
}
/** @param {number[]} original @param {number[]} predicted @param {number} start */
function matches(original,predicted,start){
  let matchedBytes=0,matchedWords=0;
  assert.equal(original.length,256);
  assert.equal(predicted.length,256);
  for(let i=start;i<256;i++) matchedBytes+=+(original[i]===predicted[i]);
  for(let i=start;i<256;i+=4){
    matchedWords+=+original.slice(i,i+4).every((v,j)=>v===predicted[i+j]);
  }
  return {matchedBytes,matchedWords,testedBytes:256-start};
}

// Known AES-256 FIPS-197 first 16 expanded words, with exact concrete bytes.
const testKey=Array.from({length:32},(_,i)=>i);
const aesTest=aesExpand(testKey);
assert.equal(Buffer.from(aesTest.slice(32,64)).toString('hex'),
  'a573c29fa176c498a97fce93a572c09c1651a8cd0244beda1a5da4c10640bade');
assert.deepEqual(aesExpand(aesTest.slice(0,32)),aesTest);

// SHA-256 official padded "abc" word W0 and W16 check.
const abc=Array(16).fill(0);
abc[0]=0x61626380;abc[15]=24;
assert.equal(shaExpand(abc)[16],0x61626380);

const resource=path.join(__dirname,'..','resources','liber-primus','base60-grid.json');
const rows=JSON.parse(fs.readFileSync(resource,'utf8')).byte_rows;
assert.equal(rows.length,32);
assert.ok(rows.every(r=>r.length===8&&r.every(x=>Number.isInteger(x)&&x>=0&&x<256)));
const bytes=rows.flat();
assert.equal(createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const layouts={
  rowMajor:bytes,
  columnMajor:Array.from({length:256},(_,i)=>rows[i%32][Math.floor(i/32)]),
  mirroredRow:rows.map(r=>r.slice().reverse()).flat(),
  reverseRow:rows.slice().reverse().flat()
};
for(const [layout,source] of Object.entries(layouts)){
  for(const le of [false,true]){
    const aes=matches(source,aesExpand(source.slice(0,32)),32);
    const sha=matches(source,fromWords(shaExpand(toWords(source,le).slice(0,16)),le),64);
    console.log(JSON.stringify({layout,endian:le?'LE':'BE',aes,sha}));
    assert.ok(aes.matchedBytes<16&&aes.matchedWords===0);
    assert.ok(sha.matchedBytes<16&&sha.matchedWords===0);
  }
}
console.log('PASS: neither direct expansion matches the original 256-byte table.');
