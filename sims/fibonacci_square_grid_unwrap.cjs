"use strict";
/**
 * Source-only key chaining: interpret the sixteen authentic p15 Fibonacci
 * square values as 32-byte keys, try to unwrap the 256-byte LP2 numeric grid.
 * This does not use any unknown LP2 plaintext to select keys.
 * Run: node sims/fibonacci_square_grid_unwrap.cjs
 */
const assert=require("node:assert/strict");
const {createCipheriv,createDecipheriv,createHash}=require("node:crypto");
const {candidates}=require("./fibonacci_spiral_key_derivation.cjs");
const grid=require("../resources/liber-primus/lp2-grid-256.json");
const original=Buffer.from(grid.bytes);
assert.equal(original.length,256);
const repaired=Buffer.from(original);
for(const [position,value] of [[45,81],[50,21],[165,47],[172,174],[246,224]])repaired[position]=value;
const MAGIC=[
  ["PNG","89504e470d0a1a0a"],["JPEG","ffd8ff"],["ZIP","504b0304"],
  ["GZIP","1f8b"],["BZIP2","425a68"],["PDF","25504446"],
  ["ELF","7f454c46"],["PE-MZ","4d5a"],["SQLite","53514c69746520666f726d6174203300"]
];

/** @param {Buffer} bytes */
function quality(bytes){
  let ascii=0, printable=0, letters=0, maxRun=0,run=0,zero=0;
  for(const b of bytes){
    if(b<128)ascii++;
    if((b>=32&&b<=126)||b===9||b===10||b===13){
      printable++;run++;maxRun=Math.max(maxRun,run);
    }else run=0;
    if((b>=65&&b<=90)||(b>=97&&b<=122))letters++;
    if(b===0)zero++;
  }
  const hex=bytes.toString("hex");
  return {ascii,printable,letters,maxRun,zero,
    magic:MAGIC.filter(([,h])=>hex.startsWith(h)).map(([s])=>s)};
}
/** @param {string} cipher @param {Buffer} key @param {Buffer} source */
function decipher(cipher,key,source){
  const iv=cipher==="aes-256-ecb"?null:Buffer.alloc(16);
  const d=createDecipheriv(cipher,key,iv);
  d.setAutoPadding(false);
  return Buffer.concat([d.update(source),d.final()]);
}
/** Source-derived 32-key set, two transcription versions and four modes. */
function run(){
  const keys=candidates();
  assert.equal(keys.length,32);
  const entries=[];
  for(const source of [{name:"transcribed",bytes:original},{name:"five-cells-image-corrected",bytes:repaired}]){
    for(const k of keys){
      for(const cipher of ["aes-256-ecb","aes-256-cbc","aes-256-ctr","chacha20"]){
        const decrypted=decipher(cipher,k.key,source.bytes);
        entries.push({source:source.name,key:k.name,cipher,...quality(decrypted),
          decodedHeadHex:decrypted.subarray(0,16).toString("hex"),
          decodedHeadLatin1:decrypted.subarray(0,48).toString("latin1")
            .replace(/[^\x20-\x7e]/g,".")});
      }
    }
  }
  entries.sort((a,b)=>b.printable-a.printable||b.maxRun-a.maxRun);
  const positiveKey=keys[0];
  const plaintext=Buffer.alloc(256,0x20);
  Buffer.from("FIBONACCI-GRID SOURCE-ONLY POSITIVE CONTROL.").copy(plaintext);
  const c=createCipheriv("aes-256-cbc",positiveKey.key,Buffer.alloc(16));
  c.setAutoPadding(false);
  const ciphertext=Buffer.concat([c.update(plaintext),c.final()]);
  const recovered=decipher("aes-256-cbc",positiveKey.key,ciphertext);
  assert.deepEqual(recovered,plaintext);
  const positive=quality(recovered);
  assert.equal(positive.printable,256);
  return {
    source:"16 uint16 square elements / 32 exact keys / 256 original grid bytes",
    sourceKeyCount:keys.length,
    originalGridSha256:createHash("sha256").update(original).digest("hex"),
    correctedGridSha256:createHash("sha256").update(repaired).digest("hex"),
    tested:entries.length,
    best:entries.slice(0,12),
    above192Printable:entries.filter(x=>x.printable>=192).length,
    sourceVariantBest:Object.fromEntries(["transcribed","five-cells-image-corrected"].map(s=>
      [s,entries.find(x=>x.source===s)])),
    positive:{key:positiveKey.name,cipher:"aes-256-cbc",exactRecovered:true,printable:positive.printable},
    note:"Uniform-byte output is inconsistent with direct human-readable grid contents under these exact key and stream modes. Binary/compressed intermediates remain open."
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={quality,decipher,run};
