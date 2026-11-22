"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @param {number} x @param {number} n */
const rotr = (x,n) => ((x >>> n) | (x << (32-n))) >>> 0;
/** @param {number} x @param {number} n */
const rotl = (x,n) => ((x << n) | (x >>> (32-n))) >>> 0;

/** @param {number[]} bytes @returns {number[]} */
const words32 = (bytes) => Array.from({length:bytes.length/4},(_,i) =>
  ((bytes[4*i]<<24)|(bytes[4*i+1]<<16)|(bytes[4*i+2]<<8)|bytes[4*i+3])>>>0);

/** @param {number} a @param {number} b */
function gfMul(a,b) {
  let v=0;
  for(let i=0;i<8;i++) {
    if(b&1)v^=a;
    a=(a<<1)^((a&128)?0x11b:0);
    b>>=1;
  }
  return v&255;
}
/** @param {number} b @param {number} n */
const rotl8=(b,n)=>((b<<n)|(b>>>(8-n)))&255;
const sbox=Array.from({length:256},(_,b)=>{
  const inv=b===0?0:Array.from({length:255},(_,k)=>k+1).find(x=>gfMul(x,b)===1);
  assert.notEqual(inv,undefined);
  return (inv^rotl8(inv,1)^rotl8(inv,2)^rotl8(inv,3)^rotl8(inv,4)^0x63)&255;
});

/** @param {number[]} previous @param {number} round @param {boolean} subOnly */
function aesTransform(previous,round,subOnly) {
  const rotated=subOnly?previous:[previous[1],previous[2],previous[3],previous[0]];
  const out=rotated.map(x=>sbox[x]);
  if(!subOnly) {
    let rcon=1;
    for(let i=1;i<round;i++)rcon=gfMul(rcon,2);
    out[0]^=rcon;
  }
  return out;
}

/** @param {number[]} key AES key of 16,24,32 bytes */
function expandAES(key) {
  const nk=key.length/4;
  assert([4,6,8].includes(nk));
  const out=key.slice();
  for(let i=nk;i<({4:44,6:52,8:60})[nk];i++) {
    const previous=out.slice(4*(i-1),4*i);
    const g=i%nk===0?aesTransform(previous,i/nk,false):
      nk===8&&i%nk===4?aesTransform(previous,0,true):previous;
    for(let j=0;j<4;j++)out.push(out[(i-nk)*4+j]^g[j]);
  }
  return out;
}

/**
 * Count exact matched 4-byte AES words after the key words.
 * @param {number[]} bytes @param {number} nk
 */
function aesMatches(bytes,nk) {
  let matched=0;
  const end=({4:44,6:52,8:60})[nk];
  for(let i=nk;i<end;i++){
    const previous=bytes.slice((i-1)*4,i*4);
    const g=i%nk===0?aesTransform(previous,i/nk,false):
      nk===8&&i%nk===4?aesTransform(previous,0,true):previous;
    if(g.every((x,j)=>(x^bytes[(i-nk)*4+j])===bytes[i*4+j]))matched++;
  }
  return matched;
}

/** @param {number[]} words @param {"sha1"|"sha256"} alg */
function sha32Matches(words,alg) {
  let matched=0;
  for(let i=16;i<64;i++) {
    const expected=alg==="sha1"?rotl(
      words[i-3]^words[i-8]^words[i-14]^words[i-16],1):
      (words[i-16]+(rotr(words[i-15],7)^rotr(words[i-15],18)^(words[i-15]>>>3))+
        words[i-7]+(rotr(words[i-2],17)^rotr(words[i-2],19)^(words[i-2]>>>10)))>>>0;
    if(words[i]===expected)matched++;
  }
  return matched;
}

const MASK64=(1n<<64n)-1n;
/** @param {bigint} x @param {bigint} n */
const rotr64=(x,n)=>((x>>n)|(x<<(64n-n)))&MASK64;
/** @param {bigint[]} w @param {number} i */
function next512(w,i) {
  const s0=rotr64(w[i-15],1n)^rotr64(w[i-15],8n)^(w[i-15]>>7n);
  const s1=rotr64(w[i-2],19n)^rotr64(w[i-2],61n)^(w[i-2]>>6n);
  return (w[i-16]+s0+w[i-7]+s1)&MASK64;
}
/** @param {number[]} bytes */
function sha512PrefixMatches(bytes) {
  const w=Array.from({length:32},(_,i)=>
    bytes.slice(8*i,8*i+8).reduce((n,b)=>(n<<8n)|BigInt(b),0n));
  let matched=0;
  for(let i=16;i<32;i++)if(w[i]===next512(w,i))matched++;
  return matched;
}

/** @param {number[][]} rows */
function traversals(rows){
  assert.equal(rows.length,32);
  rows.forEach(r=>assert.equal(r.length,8));
  const columns=Array.from({length:8},(_,c)=>rows.map(r=>r[c])).flat();
  return {
    row:rows.flat(),
    row_reverse:rows.flat().reverse(),
    column:columns,
    column_reverse:columns.slice().reverse(),
    row_flipped_columns:rows.flatMap(r=>r.slice().reverse()),
    row_flipped_rows:rows.slice().reverse().flat(),
    column_flipped_rows:Array.from({length:8},(_,c)=>rows.slice().reverse().map(r=>r[c])).flat()
  };
}

function run() {
  assert.equal(sbox[0x53],0xed);
  const k=Array.from({length:32},(_,i)=>i);
  assert.deepEqual(expandAES(k.slice(0,16)).slice(16,20),[0xd6,0xaa,0x74,0xfd]);
  assert.deepEqual(expandAES(k).slice(32,36),[0xa5,0x73,0xc2,0x9f]);
  for(const nk of [4,6,8])
    assert.equal(aesMatches(expandAES(k.slice(0,nk*4)),nk),
      ({4:40,6:46,8:52})[nk]);

  for(const alg of ["sha1","sha256"]){
    const w=Array.from({length:16},(_,i)=>(0xdeadbeef^(i*1337))>>>0);
    for(let i=16;i<64;i++)
      w.push(alg==="sha1"?rotl(w[i-3]^w[i-8]^w[i-14]^w[i-16],1):
        (w[i-16]+(rotr(w[i-15],7)^rotr(w[i-15],18)^(w[i-15]>>>3))+
          w[i-7]+(rotr(w[i-2],17)^rotr(w[i-2],19)^(w[i-2]>>>10)))>>>0);
    assert.equal(sha32Matches(w,alg),48);
  }
  const w64=Array.from({length:16},(_,i)=>BigInt(i*733+7));
  for(let i=16;i<32;i++)w64.push(next512(w64,i));
  const sample64=w64.flatMap(w=>Array.from({length:8},(_,j)=>
    Number((w>>BigInt(56-8*j))&255n)));
  assert.equal(sha512PrefixMatches(sample64),16);

  const data=JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources",
    "liber-primus","base60-grid.json"),"utf8"));
  const variants=traversals(data.byte_rows);
  const stats=Object.fromEntries(["sha1","sha256","sha512prefix",
    "aes128","aes192","aes256"].map(name=>[name,{max:0,total:0}]));
  /** @param {string} name @param {number} count */
  const record=(name,count)=>{
    stats[name].max=Math.max(stats[name].max,count);
    stats[name].total+=count;
  };
  let candidateCount=0;
  for(const bytes of Object.values(variants)) {
    for(let rotation=0;rotation<256;rotation++) {
      const rolled=bytes.slice(rotation).concat(bytes.slice(0,rotation));
      for(const reverseWords of [false,true]) {
        const serial=reverseWords?Array.from({length:64},(_,i)=>
          rolled.slice(4*i,4*i+4).reverse()).flat():rolled;
        const words=words32(serial);
        record("sha1",sha32Matches(words,"sha1"));
        record("sha256",sha32Matches(words,"sha256"));
        record("sha512prefix",sha512PrefixMatches(serial));
        for(const nk of [4,6,8])
          record(({4:"aes128",6:"aes192",8:"aes256"})[nk],aesMatches(serial,nk));
        candidateCount++;
      }
    }
  }
  const answer={source:"resources/liber-primus/base60-grid.json",
    bytes:256,distinctBytes:new Set(data.byte_rows.flat()).size,
    traversals:Object.keys(variants),candidateCount,stats,
    positiveControls:"AES128,192,256 SHA1,256 and SHA512 all passed"};
  console.log(JSON.stringify(answer,null,2));
}
if(require.main===module)run();
module.exports={expandAES,aesMatches,sha32Matches,sha512PrefixMatches,traversals};
