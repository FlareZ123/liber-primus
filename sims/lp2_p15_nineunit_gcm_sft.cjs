"use strict";
/**
 * Source-delimited nine-unit AES-128-GCM gate. Original red-title positions
 * select the nine boundaries; p15 square supplies forty fixed AES-128 keys.
 * Each GP29 source-ordered unit uses minimal big-endian integer serialization
 * and a frozen nonce12|body|tag16 authenticated envelope.
 *
 * Run: node sims/lp2_p15_nineunit_gcm_sft.cjs
 * @module lp2_p15_nineunit_gcm_sft
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {createHash}=require("node:crypto");
const {deriveKeys}=require("./fibonacci_aes128_grid_key.cjs");
const {minimalBigEndianBase29,authenticate,plantControl}=
  require("./lp2_p15_fullstream_aes128_gcm_sft.cjs");
const ROOT=path.resolve(__dirname,"..");

/** Nine externally marked original text units, without invented padding. */
function sourceUnits() {
  const c=JSON.parse(fs.readFileSync(path.join(ROOT,
    "resources/liber-primus/lp2-corpus.json"),"utf8"));
  const stream=c.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
  assert.equal(stream.length,12956);
  const starts=[0,729,1874,3612,5506,6527,7960,8051,9640];
  const units=starts.map((at,i)=>stream.slice(at,starts[i+1]??stream.length));
  assert.deepEqual(units.map(u=>u.length),
    [729,1145,1738,1894,1021,1433,91,1589,3316]);
  return units;
}

/** Test only the natural source-delimited independent-message interpretation. */
function main() {
  const keys=deriveKeys().keys;
  assert.equal(keys.length,40);
  const positiveControl=plantControl(keys[0].key);
  const units=sourceUnits();
  const accepted=[];
  const lengths=[];
  let attempts=0,rejected=0;
  for(let i=0;i<units.length;i++){
    const bytes=minimalBigEndianBase29(units[i]);
    assert.ok(bytes.length>=29,"unit cannot contain authenticated envelope");
    const nonce=bytes.subarray(0,12);
    const body=bytes.subarray(12,-16);
    const tag=bytes.subarray(-16);
    lengths.push(bytes.length);
    for(const {name,key} of keys) {
      attempts++;
      try{
        const plain=authenticate(key,nonce,body,tag);
        accepted.push({unit:i,key:name,bytes:plain.length,
          sha256:createHash("sha256").update(plain).digest("hex"),
          prefix:plain.subarray(0,128).toString("utf8")});
      }catch(error){
        if(!/authenticat|decrypt|bad decrypt|unable/i.test(String(error.message)))
          throw error;
        rejected++;
      }
    }
  }
  assert.equal(attempts,360);
  assert.equal(attempts,rejected+accepted.length);
  const result={source:"Nine original red-title-delimited LP2 units",
    lengths,keys:keys.length,envelope:"per-unit nonce12/body/tag16",
    tested:attempts,rejected,accepted,positiveControl};
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module) main();
module.exports={sourceUnits,main};
