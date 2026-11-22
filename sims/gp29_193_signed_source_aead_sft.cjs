#!/usr/bin/env node
"use strict";

// Original signed 2016 "lies" -> LP2 byte193 source-selected 44-byte
// AES-256-GCM / ChaCha20-Poly1305 authentication probe. Node.js 22 CJS.
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const read = p => JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
const grid = read("resources/liber-primus/lp2-grid-256.json").bytes;
const corpus = read("resources/liber-primus/lp2-corpus.json");
const digits=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(digits.length,12956);
assert.equal(grid.length,256);
assert.deepEqual(grid.flatMap((b,i)=>b===193?[i]:[]),[83,127]);
assert.deepEqual(grid.flatMap((b,i)=>b===201?[i]:[]),[82,128]);

/** @param {number[]} symbols The original 29-ary GP digits. */
function toBytes(symbols) {
 let n=0n;
 for(const d of symbols){assert(Number.isInteger(d)&&d>=0&&d<29);n=29n*n+BigInt(d);}
 let h=n.toString(16);if(h.length%2)h="0"+h;
 return Buffer.from(h,"hex");
}
/**
 * @param {string} algorithm Authenticated 256-bit cipher.
 * @param {Buffer} key Source-selected 32-byte key.
 * @param {Buffer} nonce Twelve-byte nonce.
 * @param {Buffer} ciphertext Ciphertext bytes.
 * @param {Buffer} tag Sixteen-byte tag.
 * @returns {Buffer|null} Authenticated plaintext only.
 */
function decrypt(algorithm,key,nonce,ciphertext,tag){
 try{
  const d=crypto.createDecipheriv(algorithm,key,nonce,{authTagLength:16});
  d.setAuthTag(tag);
  return Buffer.concat([d.update(ciphertext),d.final()]);
 }catch(_){return null;}
}
const original=toBytes(digits);
const variants=[
 ["forward",original],
 ["reverse-runes",toBytes([...digits].reverse())],
 ["atbash",toBytes(digits.map(d=>28-d))],
 ["reverse-atbash",toBytes([...digits].reverse().map(d=>28-d))],
 ["reverse-output-bytes",Buffer.from(original).reverse()]
];
assert(variants.every(([,v])=>v.length===7868));
assert.equal(original.subarray(0,12).toString("hex"),"08734843a55193dcbb7231b5");

// Two original contiguous 44-byte ranges, each including exactly one of the
// selected 193 endpoint cells. 44=32-byte secret key+12-byte public nonce.
const candidates=[];
for(const [name,window] of [
 ["first193",Buffer.from(grid.slice(83,127))],
 ["last193",Buffer.from(grid.slice(84,128))]
]){
 assert.equal(window.length,44);
 for(const [direction,b] of [
  ["as-printed",window],["reversed",Buffer.from(window).reverse()]
 ]){
  candidates.push({name:name+"/"+direction+"/key-first",
    key:b.subarray(0,32),nonce:b.subarray(32)});
  candidates.push({name:name+"/"+direction+"/nonce-first",
    key:b.subarray(12),nonce:b.subarray(0,12)});
 }
}
assert.equal(candidates.length,8);
const algorithms=["aes-256-gcm","chacha20-poly1305"];
// Full-length independent source-key positive controls and modified-tag tests.
const known=Buffer.alloc(7852);
for(let i=0;i<known.length;i++)known[i]=(7+19*i)&255;
for(const algorithm of algorithms){
 const {key,nonce}=candidates[0];
 const e=crypto.createCipheriv(algorithm,key,nonce,{authTagLength:16});
 const ciphertext=Buffer.concat([e.update(known),e.final()]);
 const tag=e.getAuthTag();
 assert(decrypt(algorithm,key,nonce,ciphertext,tag)?.equals(known));
 const bad=Buffer.from(tag);bad[0]^=1;
 assert.equal(decrypt(algorithm,key,nonce,ciphertext,bad),null);
}
const hits=[];let attempts=0;
for(const [variant,payload] of variants) {
 const tag=payload.subarray(-16);
 for(const c of candidates) {
  for(const framing of ["source-nonce","embedded-prefix-nonce"]) {
   const nonce=framing==="source-nonce"?c.nonce:payload.subarray(0,12);
   const ciphertext=framing==="source-nonce"?
     payload.subarray(0,-16):payload.subarray(12,-16);
   for(const algorithm of algorithms) {
    attempts++;
    const plaintext=decrypt(algorithm,c.key,nonce,ciphertext,tag);
    if(plaintext)hits.push({variant,key:c.name,framing,algorithm,
      sha256:crypto.createHash("sha256").update(plaintext).digest("hex"),
      first80Hex:plaintext.subarray(0,80).toString("hex")});
   }
  }
 }
}
assert.equal(attempts,160);
console.log(JSON.stringify({
 status:hits.length?"AUTHENTICATED LP2 PLAINTEXT":"SOURCE-LOCKED NEGATIVE",
 source:"signed lies sum224 -> p50 token3 3D=193, table offsets83/127",
 windows:2,readDirections:2,keyNonceOrders:2,payloadOrientations:5,
 nonceFramings:2,algorithms,attempts,hits,
 controls:"PASS: full length exact source-key decryption and tampered-tag rejection",
 scope:"single GP29 whole-stream integer with final 16-byte authentication tag and empty AAD"
},null,2));
