"use strict";
/**
 * Direct AES-256 decryption of the original 256-byte LP2 p49-51 sexagesimal
 * field using a 32-byte key packed from the sixteen visible p15 numbers.
 * Four key serialization candidates (row/spiral x uint16 BE/LE) and three
 * ordinary cipher modes under zero IV: ECB, CBC, CTR. The original text does
 * not instruct this byte cipher or packing rule. No arbitrary key search.
 *
 * Node 22 Windows SFT:
 * node sims/lp2_p15_aes256_grid256_direct_sft.cjs
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const {candidates}=require("./fibonacci_spiral_key_derivation.cjs");
const data=require("../resources/liber-primus/lp2-grid-256.json");
const source=Buffer.from(data.bytes);
assert.equal(source.length,256);
const keys=candidates().filter(x=>
  /^absolute-(spiral|row-major):(BE|LE)$/.test(x.name));
assert.equal(keys.length,4);
const modes=["aes-256-ecb","aes-256-cbc","aes-256-ctr"];
const ivFor=mode=>mode.endsWith("ecb")?null:Buffer.alloc(16);
const crypt=(data,key,mode,decode)=>{
  const c=decode?
    crypto.createDecipheriv(mode,key,ivFor(mode)):
    crypto.createCipheriv(mode,key,ivFor(mode));
  if(!mode.endsWith("ctr")) c.setAutoPadding(false);
  return Buffer.concat([c.update(data),c.final()]);
};
const knownHeaders=new Map([
  ["gzip","1f8b08"],["bzip2","425a68"],["xz","fd377a585a00"],
  ["PNG","89504e470d0a1a0a"],["ZIP","504b0304"],
  ["PDF","255044462d"],["7z","377abcaf271c"],["ELF","7f454c46"],
  ["OpenSSL salted","53616c7465645f5f"],["SQLite","53514c69746520666f726d6174203300"]
]);
const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
const output=[];
for(const {name,key} of keys)
  for(const mode of modes){
    assert.equal(key.length,32);
    const plain=crypt(source,key,mode,true);
    assert.deepEqual(crypt(plain,key,mode,false),source);
    // Independent source-fixed 256-byte plaintext plant, same cipher modes.
    const planted=Buffer.from(Array.from({length:256},(_,i)=>
      ("LIBER PRIMUS ORIGINAL BINARY POSITIVE ").charCodeAt(i%37)));
    assert.deepEqual(crypt(crypt(planted,key,mode,false),key,mode,true),
      planted);
    const signature=Array.from(knownHeaders.entries())
      .filter(([,hex])=>plain.toString("hex").startsWith(hex))
      .map(([name])=>name);
    const printable=[...plain].filter(v=>
      (v>=32&&v<=126)||v===9||v===10||v===13).length;
    const gp=[...plain].filter(v=>v<29).length;
    const validUtf8=(()=>{
      try{new TextDecoder("utf-8",{fatal:true}).decode(plain);return true;}
      catch{return false;}
    })();
    output.push({
      key:name,mode,signature,printableAscii:printable,
      gp29Bytes:gp,validUtf8,
      first32Hex:plain.subarray(0,32).toString("hex")
    });
  }
assert.equal(output.length,12);
const max=output.reduce((a,b)=>
  b.printableAscii>a.printableAscii?b:a);
console.log(JSON.stringify({
  title:"Direct AES-256 from original 16xuint16 p15 square to p50 bytes",
  originalSha256:sha(source),sourceBytes:source.length,
  keys:4,modes:3,programs:12,
  positives:"All 12 original byte encodings exact; 12 independent 256/256 planted binary recoveries",
  clearMagicHits:output.flatMap(x=>x.signature),
  validUtf8:output.filter(x=>x.validUtf8).length,
  bestPrintable:{mode:max.mode,key:max.key,count:max.printableAscii},
  all:output,
  interpretation:"Only the fixed direct zero-IV source grammar is tested; no authenticated unknown plaintext."
},null,2));
