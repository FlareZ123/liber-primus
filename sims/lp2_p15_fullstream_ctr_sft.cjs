"use strict";
/**
 * Original GP29 whole-integer AES-128-CTR direct-plaintext gate. A source-fixed
 * 12-byte nonce followed by 7856 bytes naturally leaves 491 AES blocks;
 * test counter=0 or 1 with the 40 source p15 Fibonacci-square AES128 keys.
 * This has no authentication, so only exact readable/native-byte results
 * could support the proposed source key; header fragments are only leads.
 *
 * Run: node sims/lp2_p15_fullstream_ctr_sft.cjs
 * @module lp2_p15_fullstream_ctr_sft
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {createCipheriv,createDecipheriv}=require("node:crypto");
const {TextDecoder}=require("node:util");
const {deriveKeys}=require("./fibonacci_aes128_grid_key.cjs");
const {original}=require("./lp2_p15_fullstream_aes128_gcm_sft.cjs");
const ROOT=path.resolve(__dirname,"..");

/** @param {Buffer} key @param {Buffer} nonce @param {number} startCounter
 * @param {Buffer} encrypted */
function decode(key,nonce,startCounter,encrypted) {
  const iv=Buffer.alloc(16);
  nonce.copy(iv);
  iv.writeUInt32BE(startCounter,12);
  const d=createDecipheriv("aes-128-ctr",key,iv);
  return Buffer.concat([d.update(encrypted),d.final()]);
}

/** Readable, native-GP-byte and file-signature diagnostics without tuning. */
function inspect(plain) {
  const printable=plain.reduce((n,x)=>n+Number((x>=32&&x<=126)||
    x===9||x===10||x===13),0);
  const gp=plain.reduce((n,x)=>n+Number(x<29),0);
  const starts=[
    ["gzip","1f8b08"],["bzip2","425a68"],["xz","fd377a585a00"],
    ["zip","504b0304"],["png","89504e470d0a1a0a"],
    ["pdf","255044462d"],["7zip","377abcaf271c"],["lz4","04224d18"],
    ["sqlite","53514c69746520666f726d6174203300"]
  ].filter(([,hex])=>plain.subarray(0,hex.length/2).toString("hex")===hex)
    .map(([name])=>name);
  if(plain[0]===0x78&&[0x01,0x5e,0x9c,0xda].includes(plain[1]))
    starts.push("possible-zlib");
  let nativeUtf8=true;
  try {new TextDecoder("utf-8",{fatal:true}).decode(plain);}
  catch {nativeUtf8=false;}
  return {printable, gp, allPrintable:printable===plain.length,
    allNativeGpBytes:gp===plain.length,validUtf8:nativeUtf8,
    headers:starts,first32Hex:plain.subarray(0,32).toString("hex")};
}

/** Exact decryption control with source solved LP1 bytes. */
function positive(key) {
  const originalPlain=fs.readFileSync(path.join(ROOT,
    "resources/liber-primus/lp1-plaintext-reference.txt")).subarray(0,256);
  const nonce=Buffer.from("000102030405060708090a0b","hex");
  const iv=Buffer.concat([nonce,Buffer.from("00000001","hex")]);
  const e=createCipheriv("aes-128-ctr",key,iv);
  const encrypted=Buffer.concat([e.update(originalPlain),e.final()]);
  const recovered=decode(key,nonce,1,encrypted);
  assert.deepEqual(recovered,originalPlain);
  return {bytes:256,exactlyRecovered:true};
}

/** Perform the finite original-source direct-byte challenge. */
function main() {
  const input=original();
  const nonce=input.subarray(0,12);
  const encrypted=input.subarray(12);
  assert.equal(encrypted.length,7856);
  const keys=deriveKeys().keys;
  assert.equal(keys.length,40);
  const control=positive(keys[0].key);
  const candidates=[];
  for(const {name,key} of keys)for(const startCounter of [0,1]){
    const result=inspect(decode(key,nonce,startCounter,encrypted));
    candidates.push({name,startCounter,...result});
  }
  assert.equal(candidates.length,80);
  const top=candidates.slice().sort((a,b)=>b.printable-a.printable).slice(0,5);
  const pass=candidates.filter(x=>x.allPrintable||x.allNativeGpBytes||
    x.validUtf8||x.headers.length);
  const output={source:"original all-LP2 GP29 as one integer",
    nonceBytes:12,ciphertextBytes:7856,sourceKeys:40,counterStarts:[0,1],
    tested:candidates.length,recognized:pass,bestPrintable:top,
    positiveControl:control};
  console.log(JSON.stringify(output,null,2));
  return output;
}
if(require.main===module) main();
module.exports={decode,inspect,positive,main};
