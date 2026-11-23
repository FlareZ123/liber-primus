'use strict';
/**
 * One exact p15->p50-derived AES-128 key on the intact whole LP2 binary.
 * The original 12,956 GP29 runes serialize to 7,868 big-endian base29 bytes:
 * nonce12 | ciphertext7840 | authenticated tag16. No phase/IV/key search.
 * This tests a possible whole-book cipher; no evidence the creator chose GCM.
 * Node.js 22, CommonJS, read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {original, minimalBigEndianBase29, authenticate, plantControl} =
  require('./lp2_p15_fullstream_aes128_gcm_sft.cjs');
const {sourceUnits} = require('./lp2_p15_nineunit_gcm_sft.cjs');
const ROOT=path.resolve(__dirname,'..');
const panel=JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp2-grid-256.json'),'utf8'));
const spiral=[3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516];
const key=Buffer.from(spiral.map(n=>panel.bytes[n%256]));
assert.equal(key.toString('hex'),'f94944338e7f13998e333bf096b0a769');
const binary=original(); // verifies original-runic count, length and sha256
assert.equal(binary.length,7868);
const nonce=binary.subarray(0,12);
const ciphertext=binary.subarray(12,-16);
const tag=binary.subarray(-16);
assert.equal(ciphertext.length,7840);
assert.equal(tag.toString('hex'),'2303cce245abaae21697704a791e02ea');
const plant=plantControl(key);
assert.deepEqual(plant,{source:'solved LP1 reference bytes',
  recovered:256,exact:true,alteredTagRejected:true});
let authentication=false;
let unexpected=null;
try{
  const candidate=authenticate(key,nonce,ciphertext,tag);
  authentication=true;
  unexpected={length:candidate.length,
    prefixHex:candidate.subarray(0,96).toString('hex')};
}catch(error){
  const message=String(error.message);
  if(!/authenticat|decrypt|bad decrypt|unable/i.test(message))
    throw error;
}
assert.equal(authentication,false,
  'Unexpected genuine GCM tag; stop and investigate true candidate plaintext.');
// A second source-defined receiver has nine independently red-titled units.
// No alternative key, serialization, nonce, tag length, or phase is admitted.
const nine=sourceUnits().map((runes,i)=>{
  const encoded=minimalBigEndianBase29(runes);
  const iv=encoded.subarray(0,12),body=encoded.subarray(12,-16),
    authenticator=encoded.subarray(-16);
  let accepted=false;
  try{
    authenticate(key,iv,body,authenticator);
    accepted=true;
  }catch(error){
    if(!/authenticat|decrypt|bad decrypt|unable/i.test(String(error.message)))
      throw error;
  }
  return {unit:i,runes:runes.length,bytes:encoded.length,
    tag:authenticator.toString('hex'),authenticated:accepted};
});
assert.deepEqual(nine.map(x=>x.bytes),
  [443,696,1056,1151,620,871,56,965,2013]);
assert(nine.every(x=>!x.authenticated),'Unexpected authentic chapter GCM tag');

console.log(JSON.stringify({
  classification:'one original whole-LP2 AES128-GCM key authentication gate',
  sourceKey:key.toString('hex'),
  derivedFrom:'p15 original 16-number red-first spiral, zero-based mod256 p50 table addresses, conventional base60 bytes',
  sourceOriginalRunes:12956,originalBinaryBytes:binary.length,
  envelope:'nonce12|body7840|tag16',
  nonce:nonce.toString('hex'),tag:tag.toString('hex'),
  nineRedTitleUnits:nine,
  verifiedPlant:plant,authenticated:authentication,
  unexpected,
  decision:'This exact source-derived 16-byte key authenticates neither the whole 12,956-rune AES128-GCM envelope nor any of nine original red-title chapter envelopes. No plaintext recovered.'
},null,2));
