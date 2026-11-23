#!/usr/bin/env node
"use strict";
/**
 * Original LP2 p49-p51 256 token table: fixed SHA1/SHA256/SHA512
 * message-schedule and AES128/192/256 expanded-key fingerprint.
 * Each full schedule has an exact algebraic check; no plaintext search,
 * secret key or fitted IV. The source does not prescribe these algorithms.
 *
 * node sims/lp2_p50_hash_aes_expanded_schedule_original_sft.cjs
 */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const grid=JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources","liber-primus","lp2-grid-256.json"),"utf8"));
const tokens=grid.pages.flatMap(p=>p.tokens);
assert.equal(tokens.length,256);
function serializations(){
 const out={};
 for(const [name,alpha] of Object.entries({base60:grid.alphabet,base59:grid.alphabet.replace("f","")})){
  assert.equal(alpha.length,Number(name.slice(4)));
  const row=tokens.map(t=>{const a=alpha.indexOf(t[0]),b=alpha.indexOf(t[1]);assert(a>=0&&b>=0);const v=alpha.length*a+b;assert(v>=0&&v<256);return v;});
  const col=[];for(let c=0;c<8;c++)for(let r=0;r<32;r++)col.push(row[r*8+c]);
  out[name+"-row-major"]=row;out[name+"-column-major"]=col;
 }
 return out;
}
const ROR32=(x,n)=>(x>>>n)|(x<<(32-n)),ROL32=(x,n)=>(x<<n)|(x>>>(32-n));
const sigma0256=x=>ROR32(x,7)^ROR32(x,18)^(x>>>3);
const sigma1256=x=>ROR32(x,17)^ROR32(x,19)^(x>>>10);
function shaWordSchedule(kind,init,n){
 const a=init.slice(),z=kind==="SHA512";
 const M=(1n<<64n)-1n;
 const rotr=(x,k)=>((x>>BigInt(k))|(x<<(64n-BigInt(k))))&M;
 for(let i=16;i<n;i++){
  if(kind==="SHA1")a.push(ROL32(a[i-3]^a[i-8]^a[i-14]^a[i-16],1)>>>0);
  else if(kind==="SHA256")a.push((sigma1256(a[i-2])+a[i-7]+sigma0256(a[i-15])+a[i-16])>>>0);
  else if(z)a.push(((rotr(a[i-2],19)^rotr(a[i-2],61)^(a[i-2]>>6n))+a[i-7]+(rotr(a[i-15],1)^rotr(a[i-15],8)^(a[i-15]>>7n))+a[i-16])&M);
  else throw Error("kind");
 }
 return a;
}
function takeWord(a,o,bytes,little){
 let v=0n;for(let j=0;j<bytes;j++)v=(v<<8n)|BigInt(a[o+(little?bytes-1-j:j)]);
 return bytes===4?Number(v):v;
}
function checkSHA(kind,bytes,little){
 const size=kind==="SHA512"?8:4, n=bytes.length/size;
 const ws=Array.from({length:n},(_,i)=>takeWord(bytes,i*size,size,little));
 const expanded=shaWordSchedule(kind,ws.slice(0,16),n);
 let exact=0,firstMismatch=null;
 for(let i=16;i<n;i++){
  if(expanded[i]===ws[i])exact++;
  else if(firstMismatch===null)firstMismatch={word:i,expected:expanded[i].toString(16),actual:ws[i].toString(16)};
 }
 return {matchingWords:exact,requiredWords:n-16,firstMismatch};
}
function gmul(a,b){let v=0;for(let i=0;i<8;i++){if(b&1)v^=a;const hi=a&0x80;a=(a<<1)&255;if(hi)a^=0x1b;b>>=1}return v;}
function gpow(a,n){let v=1;while(n){if(n&1)v=gmul(v,a);a=gmul(a,a);n>>=1}return v}
const rot8=(v,n)=>((v<<n)|(v>>>(8-n)))&255;
const sbox=Array.from({length:256},(_,v)=>{const r=v?gpow(v,254):0;return(r^rot8(r,1)^rot8(r,2)^rot8(r,3)^rot8(r,4)^0x63)&255});
assert.equal(sbox[0],0x63);assert.equal(sbox[0x53],0xed);assert.equal(sbox[255],0x16);
const sw=x=>((sbox[x>>>24]<<24)|(sbox[(x>>>16)&255]<<16)|(sbox[(x>>>8)&255]<<8)|sbox[x&255])>>>0;
const rw=x=>((x<<8)|(x>>>24))>>>0;
function rc(n){let x=1;for(let j=1;j<n;j++)x=gmul(x,2);return x<<24;}
function expandAES(Nk,keyWords,n){const w=keyWords.slice();for(let i=Nk;i<n;i++){
 let t=w[i-1];if(i%Nk===0)t=sw(rw(t))^rc(i/Nk);
 else if(Nk>6&&i%Nk===4)t=sw(t);
 w.push((w[i-Nk]^t)>>>0);
 }return w;}
function checkAES(Nk,bytes,little){
 const n=Nk===4?44:Nk===6?52:60;
 const words=Array.from({length:n},(_,i)=>takeWord(bytes,i*4,4,little));
 const expanded=expandAES(Nk,words.slice(0,Nk),n);
 let exact=0,firstMismatch=null;
 for(let i=Nk;i<n;i++){
  if(words[i]===expanded[i])exact++;
  else if(firstMismatch===null)firstMismatch={word:i,expected:expanded[i].toString(16),actual:words[i].toString(16)};
 }
 return {matchingWords:exact,requiredWords:n-Nk,firstMismatch};
}
// Self-test with independent known AES key-schedule examples + planted SHA expansions.
const key128=Array.from({length:4},(_,i)=>((i*4<<24)|((i*4+1)<<16)|((i*4+2)<<8)|(i*4+3))>>>0);
const key256=Array.from({length:8},(_,i)=>((i*4<<24)|((i*4+1)<<16)|((i*4+2)<<8)|(i*4+3))>>>0);
assert.equal(expandAES(4,key128,44)[4],0xd6aa74fd);
assert.equal(expandAES(8,key256,60)[8],0xa573c29f);
const pos={};
for(const kind of ["SHA1","SHA256","SHA512"]){
 const init=Array.from({length:16},(_,i)=>kind==="SHA512"?BigInt(i+1):i+1);
 const words=shaWordSchedule(kind,init,kind==="SHA512"?32:64);
 const size=kind==="SHA512"?8:4, b=[];
 for(const x of words)for(let j=size-1;j>=0;j--)b.push(Number((BigInt(x)>>BigInt(8*j))&255n));
 const q=checkSHA(kind,b,false);
 assert.equal(q.matchingWords,q.requiredWords);pos[kind]=q.matchingWords;
}
const out=[],codec=serializations();
for(const [name,bytes] of Object.entries(codec))for(const little of [false,true]){
 for(const kind of ["SHA1","SHA256","SHA512"]){
  const q=checkSHA(kind,bytes,little);
  out.push({codebook:name,endian:little?"little":"big",kind,...q});
 }
 for(const Nk of [4,6,8]){
  const q=checkAES(Nk,bytes,little);
  out.push({codebook:name,endian:little?"little":"big",kind:"AES-"+Nk*32,...q});
 }
}
assert.equal(out.length,48);
assert.equal(new Set(codec["base60-row-major"]).size,161);
assert.equal(new Set(codec["base59-row-major"]).size,161);
assert(out.every(x=>x.matchingWords===0));
assert(out.every(x=>x.firstMismatch?.word===(x.kind.startsWith("AES")?Number(x.kind.slice(4))/32:16)));
console.log(JSON.stringify({
 premise:"Original 32x8 p50 printed table might encode expanded standard cryptographic words",
 source:{cells:256,rows:32,cols:8,uniqueByteValues:161,codebooks:["base59","base60"]},
 scope:{layouts:["row-major","column-major"],endianness:["big","little"],hashSchedules:["SHA1-first64-words","SHA256-full64-words","SHA512-first32-words"],aesSchedules:["AES-128-first44-words","AES-192-first52-words","AES-256-first60-words"]},
 positiveControls:{SHAPlanted:pos,AES128KnownW4:"d6aa74fd",AES256KnownW8:"a573c29f"},
 variants:out.length,exactWordRecurrencesMatched:out.reduce((s,x)=>s+x.matchingWords,0),
 modelsWithFirstRecurrenceSatisfied:out.filter(x=>x.firstMismatch?.word>(x.kind.startsWith("AES")?Number(x.kind.slice(4))/32:16)).length,
 exampleOriginal:{
  base60SHA256:out.find(x=>x.codebook==="base60-row-major"&&x.endian==="big"&&x.kind==="SHA256"),
  base60SHA512:out.find(x=>x.codebook==="base60-row-major"&&x.endian==="big"&&x.kind==="SHA512"),
  base60AES256:out.find(x=>x.codebook==="base60-row-major"&&x.endian==="big"&&x.kind==="AES-256")
 },
 conclusion:"Every direct original-table expanded-key/message-schedule model fails at its first derived word. No authentic key, hash input, or plaintext found."
},null,2));
