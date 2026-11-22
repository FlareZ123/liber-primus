"use strict";

/**
 * Source-frozen 8 independent ChaCha20/256 column streams for the 3000-rune
 * LP2 p40–53 black body. Source 32x8 numeral table has 8 columns of 32 bytes,
 * which are the natural 256-bit ChaCha keys; p40 red8 are an 8-byte IV.
 * No arbitrary key, offset, phase, IV, page reset or skipped symbol.
 * Windows 11, Node.js22, read-only SFT.
 *
 * Distinct from the previously published eight tests that each applied
 * one table column key to the ENTIRE 3000-rune body sequentially.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname,"..");
const read = file => JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
const corpus=read("resources/liber-primus/lp2-corpus.json");
const grid=read("resources/liber-primus/lp2-grid-256.json");
const headingAndText=corpus.pages.filter(p=>p.page>=40&&p.page<=53)
  .flatMap(p=>p.indices);
assert.equal(headingAndText.length,3008);
const heading=headingAndText.slice(0,8);
assert.deepEqual(heading,[0,9,19,26,6,23,25,8]);
const text=headingAndText.slice(8);
assert.equal(text.length,3000);
assert.equal(grid.bytes.length,256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(grid.bytes))
  .digest("hex"),"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
assert(crypto.getCiphers().includes("chacha20"),"Node/OpenSSL chacha20 unavailable");
const info=crypto.getCipherInfo("chacha20");
assert.equal(info.keyLength,32);
assert.equal(info.ivLength,16);
// 64-bit counter0 and red8 as 64-bit nonce, original 2008 ChaCha20 layout.
// This matches OpenSSL's 32-bit counter0 and zero-high 32-bit nonce prefix.
const iv=Buffer.alloc(16);
Buffer.from(heading).copy(iv,8);
const masks=Array.from({length:8},(_,col)=>{
  const key=Buffer.from(Array.from({length:32},(_,row)=>
    grid.bytes[8*row+col]));
  const stream=crypto.createCipheriv("chacha20",key,iv);
  const out=Buffer.concat([stream.update(Buffer.alloc(375)),stream.final()]);
  assert.equal(out.length,375);
  return out;
});
const mod=v=>(v%29+29)%29;
/**
 * GP29 standard additive key inverse/forward for eight uninterrupted
 * 375-symbol lanes: t=8*row+col, mask=ks_col[row] mod29.
 * @param {number[]} input
 * @param {1|-1} sign
 * @returns {number[]}
 */
function transform(input,sign){
  assert.equal(input.length,3000);
  return input.map((r,i)=>mod(r+sign*(masks[i%8][Math.floor(i/8)]%29)));
}
/** @param {number[]} xs */
function ioc(xs){
  const bins=new Uint32Array(29);
  for(const v of xs)bins[v]++;
  const pairs=[...bins].reduce((s,v)=>s+v*(v-1),0);
  return pairs/(xs.length*(xs.length-1));
}
const originalIoC=ioc(text);
const firstBlack=corpus.pages[40].indices.length-8;
const p45start=corpus.pages.slice(40,45).reduce((s,p)=>s+p.indices.length,0)-8;
const p46end=corpus.pages.slice(40,47).reduce((s,p)=>s+p.indices.length,0)-8;
const p52start=corpus.pages.slice(40,52).reduce((s,p)=>s+p.indices.length,0)-8;
const lateEnd=3000;
assert.equal(firstBlack,223);
assert.deepEqual([p45start,p46end,p52start,lateEnd],[1315,1855,2558,3000]);
const solved=corpus.pages[57].indices;
assert.equal(solved.length,95);
const planted=Array.from({length:3000},(_,i)=>solved[i%95]);
const results=[];
for(const sign of [-1,1]){
  const proposed=transform(text,sign);
  assert.deepEqual(transform(proposed,-sign),text);
  const syntheticCipher=transform(planted,-sign);
  assert.deepEqual(transform(syntheticCipher,sign),planted);
  results.push({sign,originalIoC,
    decodedIoC:ioc(proposed),
    openingIoC:ioc(proposed.slice(0,firstBlack)),
    untouchedMiddleIoC:ioc(proposed.slice(p45start,p46end)),
    untouchedLateIoC:ioc(proposed.slice(p52start,lateEnd)),
    first64Tokens:proposed.slice(0,64).map(v=>corpus.translit[v]).join(" "),
    originalRoundtrip:proposed.length,
    plantedRecovered:planted.length});
}
console.log(JSON.stringify({
  scope:"p40 red8 excluded; p40-53 black 3000; original 32x8 table eight ChaCha20/256 column keys with one red8 nonce",
  table256SHA256:"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290",
  heading,nonceHex:iv.toString("hex"),
  lanes:8,laneRunes:375,originPhase:0,initialCounter:0,
  sourceProvidedKeyBytesPerLane:32,
  results,
  claim:"Tests this exact source-derived 8-lane stream construction only; original ciphertext roundtrip is never proof of the historical key."
},null,2));