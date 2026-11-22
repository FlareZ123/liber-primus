"use strict";
/**
 * An exact source-derived block-cipher consumer, with a material block-size
 * rationale: the original numerical table is 32 x 8 bytes; the Onion7 LCG
 * reveals an eleven-character Base64 span decoding to an 8-byte DES key.
 *
 * Two frozen table serializations (physical row-major, source LCG traversal),
 * conventional DES ECB/CBC/CFB/OFB, both directions, IV=all zero. No padding.
 * Requires Node22 with NODE_OPTIONS=--openssl-legacy-provider.
 * @module lp2_onion7_133331_des8_table_sft
 */
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {sourceAndReadout}=require("./lp2_onion7_133331_lcg256_carrier_sft.cjs");
const ROOT=path.resolve(__dirname,"..");
const table=JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-grid-256.json"),"utf8"));
const original=Buffer.from(table.bytes);
const walked=Buffer.from(sourceAndReadout(table.bytes).readout);
const key=Buffer.from("Q8rI6/I6PiT=","base64");
assert.equal(key.toString("hex"),"43cac8ebf23a3e24");
assert.equal(original.length,256);
assert.equal(walked.length,256);
assert.equal(key.length,8);
for(const cipherName of ["des-ecb","des-cbc","des-cfb","des-ofb"])
  assert.ok(crypto.getCiphers().includes(cipherName),
    "Run Node22 with NODE_OPTIONS=--openssl-legacy-provider");
/**
 * @param {string} name @param {Buffer} value
 * @param {"encrypt"|"decrypt"} direction
 */
function apply(name,value,direction) {
  const iv=name==="des-ecb"?null:Buffer.alloc(8);
  const ctx=direction==="encrypt"
    ? crypto.createCipheriv(name,key,iv)
    : crypto.createDecipheriv(name,key,iv);
  ctx.setAutoPadding(false);
  return Buffer.concat([ctx.update(value),ctx.final()]);
}
/** @param {Buffer} value */
function stats(value) {
  let printable=0,maxRun=0,run=0;
  for(const b of value){
    if((b>=32&&b<=126)||b===9||b===10||b===13) printable++;
    run=(b>=32&&b<=126)?run+1:0;
    maxRun=Math.max(maxRun,run);
  }
  return {
    printable,outOf:value.length,longestAsciiRun:maxRun,
    first16Hex:value.subarray(0,16).toString("hex"),
    first16Ascii:value.subarray(0,16)
      .toString("latin1").replace(/[^\x20-\x7e]/g,".")
  };
}
function run() {
  const rows=[];
  const planted=Buffer.from("CICADA33".repeat(32),"ascii");
  assert.equal(planted.length,256);
  for(const mode of ["des-ecb","des-cbc","des-cfb","des-ofb"]) {
    assert.deepEqual(apply(mode,apply(mode,planted,"encrypt"),"decrypt"),planted);
    for(const [source,input] of Object.entries(
      {physicalRowMajor:original,lcg133331:walked})) {
      for(const direction of ["decrypt","encrypt"]) {
        const result=apply(mode,input,direction);
        const record=stats(result);
        assert.ok(record.printable<125);
        rows.push({mode,source,direction,...record});
      }
    }
  }
  return {
    inputByteHash:crypto.createHash("sha256").update(original).digest("hex"),
    sourceKey8Hex:key.toString("hex"),
    rows,
    outcome:"No direct DES 64-bit eight-byte-key consumer yields plaintext-looking ASCII or a recognized header. All modes pass native 256-byte exact roundtrip plants; this is only a bounded first decoder."
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,apply,stats};
