"use strict";
/**
 * Candidate p0 message "EAST OF THE MAP" -> printed p50 map rightmost
 * physical column 32 bytes -> one AES-256 key, left seven columns 224
 * encrypted bytes (14 complete AES blocks). Tests only immediate ECB
 * and zero-IV CBC modes under original row/column-major ciphertext order.
 * Base60 byte interpretation is derived from original glyph tokens and
 * the unresolved base59 alternative remains outside this bounded test.
 * Run: node sims/lp2_p50_eastmost_aes256_original_gate_sft.cjs
 * @module lp2_p50_eastmost_aes256_original_gate_sft
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const data=JSON.parse(fs.readFileSync(
 path.join(__dirname,"..","resources","liber-primus","base60-grid.json"),"utf8"));
/** @param {Buffer} key @param {Buffer} block @param {string} kind */
function crypt(key,block,kind) {
 const mode=kind==="ecb"?"aes-256-ecb":"aes-256-cbc";
 const iv=kind==="ecb"?null:Buffer.alloc(16);
 const cipher=crypto.createDecipheriv(mode,key,iv);
 cipher.setAutoPadding(false);
 return Buffer.concat([cipher.update(block),cipher.final()]);
}
/** @param {Buffer} key @param {Buffer} block @param {string} kind */
function encrypt(key,block,kind) {
 const mode=kind==="ecb"?"aes-256-ecb":"aes-256-cbc";
 const iv=kind==="ecb"?null:Buffer.alloc(16);
 const cipher=crypto.createCipheriv(mode,key,iv);
 cipher.setAutoPadding(false);
 return Buffer.concat([cipher.update(block),cipher.final()]);
}
/** Perform original binary gate and known-clear positive controls. */
function run() {
 const rows=data.byte_rows;
 assert.equal(rows.length,32);
 assert.ok(rows.every(row=>row.length===8&&row.every(v=>Number.isInteger(v)&&v>=0&&v<256)));
 const key=Buffer.from(rows.map(row=>row[7]));
 assert.equal(key.length,32);
 const arrangements={
  "row-major":Buffer.from(rows.flatMap(row=>row.slice(0,7))),
  "column-major":Buffer.from(Array.from({length:7},(_,col)=>rows.map(row=>row[col])).flat())
 };
 const outcomes=[];
 const knownClear=Buffer.from("THE KEY IS ALL AROUND YOU ".repeat(9).slice(0,224),"ascii");
 assert.equal(knownClear.length,224);
 for(const [reading,ciphertext] of Object.entries(arrangements)) {
  assert.equal(ciphertext.length,224);
  for(const kind of ["ecb","cbc0"]) {
   const actualKind=kind==="ecb"?"ecb":"cbc";
   const observed=crypt(key,ciphertext,actualKind);
   assert.equal(observed.length,224);
   assert.deepEqual(crypt(key,encrypt(key,knownClear,actualKind),actualKind),knownClear);
   const printable=Array.from(observed).filter(v=>v>=32&&v<127).length;
   assert.ok(printable<112);
   outcomes.push({cipherOrder:reading,cipherMode:kind,
    printableFraction:printable/224,
    first32Hex:observed.subarray(0,32).toString("hex"),
    legibleOriginal:false,plantedEnglishControl:true});
  }
 }
 const output={source:"p50 original 32x8 base60-derived byte grid",
  upstreamPhrase:"THE KEY IS TO GO TO THE EAST OF THE MAP (unverified candidate)",
  keySource:"rightmost one physical column, 32 bytes",
  keyHex:key.toString("hex"),cipherSource:"other seven columns, 224 bytes",
  output:outcomes,
  originalPlaintext:"none",status:"four source-bounded direct AES-256 consumers rejected"};
 console.log(JSON.stringify(output,null,2));return output;
}
if(require.main===module)run();
module.exports={run};
