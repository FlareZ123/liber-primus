"use strict";
/**
 * Frozen 2013 167/761 cookie -> original LP2 printed base-60 256-byte table
 * key inversion. The 32-byte cookies and table are independent historical
 * source material. There is no authenticated instruction to combine them.
 *
 * Node 22 single-file reproducible gate:
 * node sims/cicada2013_cookie_grid256_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const root=path.join(__dirname,"..");
const grid=JSON.parse(fs.readFileSync(path.join(root,
 "resources/liber-primus/base60-grid.json"),"utf8"));
const b=Buffer.from(grid.byte_rows.flat());
assert.equal(b.length,256);
assert.equal(grid.rows.length,32);
assert(grid.rows.every(r=>r.length===8));
for(let r=0;r<32;r++)for(let c=0;c<8;c++){
 const token=grid.rows[r][c];
 assert.equal(token.length,2);
 assert.equal(grid.byte_rows[r][c],
   grid.alphabet.indexOf(token[0])*60+grid.alphabet.indexOf(token[1]));
}
const k167=Buffer.from(
 "6941f707ff39d259ff71657a79cb6b54c184d2f0455810109c1a960860bde0e6","hex");
const k761=Buffer.from(
 "7bc1e7805ccfa518920f0d94fc4e8f7dbd83287a03b337b89109cd2287befae5","hex");
assert.equal(k167.length,32);
assert.equal(k761.length,32);
const keys=[["167",k167,k761],["761",k761,k167]];
const algos=["aes-256-ctr","aes-256-cbc","aes-256-ofb","aes-256-cfb"];
const plant=Buffer.from(
 ("THE PRIMES ARE SACRED. THE TOTIENT FUNCTION IS SACRED. "+
  "QUESTION ALL THINGS. DISCOVER TRUTH INSIDE YOURSELF. ").repeat(4)
 .slice(0,256),"ascii");
assert.equal(plant.length,256);
/** @param {string} alg @param {Buffer} key @param {Buffer|null} iv @param {Buffer} input @param {boolean} encrypt @returns {Buffer} */
function cipher(alg,key,iv,input,encrypt) {
 const ctx=encrypt?crypto.createCipheriv(alg,key,iv):
  crypto.createDecipheriv(alg,key,iv);
 ctx.setAutoPadding(false);
 return Buffer.concat([ctx.update(input),ctx.final()]);
}
/** @param {Buffer} input @param {Buffer} pad @returns {Buffer} */
function xor(input,pad){
 return Buffer.from(input.map((v,i)=>v^pad[i%pad.length]));
}
/** @param {Buffer} input @returns {{printable:number,ascii:number,zero:number,knownMagic:string|null,prefixHex:string}} */
function measure(input){
 const hex=input.subarray(0,16).toString("hex");
 const prefixes=[
  ["ASCII-armored PGP",Buffer.from("-----BEGIN","ascii")],
  ["ASCII-text signed",Buffer.from("Hello","ascii")],
  ["gzip",Buffer.from("1f8b","hex")],
  ["zlib",Buffer.from("789c","hex")],
  ["PNG",Buffer.from("89504e470d0a1a0a","hex")],
  ["ZIP",Buffer.from("504b0304","hex")],
  ["PDF",Buffer.from("%PDF","ascii")],
  ["bzip2",Buffer.from("BZh","ascii")],
  ["GIF",Buffer.from("GIF8","ascii")],
  ["JPEG",Buffer.from("ffd8ff","hex")]
 ];
 const matches=prefixes.filter(([,m])=>input.subarray(0,m.length).equals(m));
 return {
  printable:input.reduce((s,x)=>s+(x>=32&&x<127),0),
  ascii:input.reduce((s,x)=>s+(x<128),0),
  zero:input.reduce((s,x)=>s+(x===0),0),
  knownMagic:matches.length?matches.map(x=>x[0]).join(","):null,
  prefixHex:hex
 };
}
const results=[];
for(const [name,key,other] of keys) {
 const ivs=[
  ["zero",Buffer.alloc(16)],
  ["other-head",other.subarray(0,16)],
  ["other-tail",other.subarray(16)],
  ["self-head",key.subarray(0,16)],
  ["self-tail",key.subarray(16)]
 ];
 for(const [ivName,iv] of ivs)
 for(const alg of algos) {
  const plaintext=cipher(alg,key,iv,b,false);
  const encryptedPlant=cipher(alg,key,iv,plant,true);
  assert.deepEqual(cipher(alg,key,iv,encryptedPlant,false),plant);
  assert.deepEqual(cipher(alg,key,iv,plaintext,true),b);
  results.push({key:name,iv:ivName,algorithm:alg,...measure(plaintext)});
 }
 const plaintext=cipher("aes-256-ecb",key,null,b,false);
 assert.deepEqual(cipher("aes-256-ecb",key,null,
   cipher("aes-256-ecb",key,null,plant,true),false),plant);
 results.push({key:name,iv:"none",algorithm:"aes-256-ecb",
  ...measure(plaintext)});
}
const pads=[
 ["167",k167],
 ["761",k761],
 ["167-xor-761",Buffer.from(k167.map((v,i)=>v^k761[i]))]
];
for(const [name,pad] of pads) {
 const plaintext=xor(b,pad);
 assert.deepEqual(xor(plaintext,pad),b);
 assert.deepEqual(xor(xor(plant,pad),pad),plant);
 results.push({key:name,iv:"none",algorithm:"periodic-xor",
  ...measure(plaintext)});
}
assert.equal(results.length,45);
const ranked=results.slice().sort((a,b)=>b.printable-a.printable);
assert.equal(results.filter(x=>x.knownMagic).length,0);
console.log(JSON.stringify({
  source:"2013 167/761 cookie bytes vs 2014 printed 32x8 base60 byte table",
  interpretation:"Source-key test only. Neither source mandates 2013 cookie to 2014 table decryption.",
  originalTableBytes:b.length,
  originalTableDistinctBytes:new Set(b).size,
  originalTable:measure(b),
  testedModes:results.length,
  asciiPlantRecovered:plant.length,
  nativeEncryptDecryptExact:true,
  highestPrintable:ranked.slice(0,10),
  leastPrintable:ranked.at(-1),
  knownSignatureCandidates:results.filter(x=>x.knownMagic)
},null,2));
