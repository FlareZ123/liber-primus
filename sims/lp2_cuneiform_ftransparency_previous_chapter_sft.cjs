"use strict";
/**
 * One-file original LP2 p27..32 / marked p33..39 F-transparent pairing gate.
 *
 * Source-selected candidate: use the preceding 1,433-rune visual chapter as
 * a GP29 additive key for the exactly 1,433 non-F rune positions in the
 * later cuneiform-bracketed 1,468-rune passage. This is a HYPOTHESIS,
 * NOT an authenticated Cicada cipher operation.
 *
 * Run with Node.js 22 from repository root, without dependencies or writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");

/** @param {string} relative */
const read = relative => fs.readFileSync(path.join(__dirname, "..", relative), "utf8");
const data = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const page = index => {
  const found = data.pages.find(value => value.page === index);
  assert.ok(found,"missing original page "+index);
  return found.indices;
};
const mod = n => (n % 29 + 29) % 29;
const parse = a => a.map(value => data.translit[value]).join("");
const hash = a => createHash("sha256").update(Buffer.from(a)).digest("hex");
const ioc = a => {
  const counts = Array(29).fill(0);
  for (const n of a) counts[n]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
};

/** @type {number[]} Exact original physical p27..32 full visual chapter. */
const key = data.pages.filter(p=>p.page>=27 && p.page<=32)
  .flatMap(p=>p.indices);
/**
 * Exact original 13-dot/heading bracket: p33 local91 through p39 local119.
 * Excludes the 91-rune p33 prelude and the 121-rune p39 red-triad/tail.
 * @type {number[]}
 */
const marked = [
  ...page(33).slice(91),
  ...data.pages.filter(p=>p.page>=34 && p.page<=38).flatMap(p=>p.indices),
  ...page(39).slice(0,119)
];
const keyLocations=[];
const skipped=[];
marked.forEach((value,i)=>{
  (value===0?skipped:keyLocations).push(i);
});
const payload = keyLocations.map(i=>marked[i]);
assert.equal(key.length,1433);
assert.equal(marked.length,1468);
assert.equal(skipped.length,35);
assert.equal(payload.length,1433);
assert.ok(payload.every(value=>value!==0));
assert.equal(page(33).length,214);
assert.equal(page(39).length,240);
console.log("SOURCE",JSON.stringify({
  keyPageRange:[27,32],keyLength:key.length,
  markedStart:{page:33,local:91},markedEnd:{page:39,local:119},
  markedLength:marked.length,originalTransparentF:skipped.length,
  transmittedLength:payload.length,
  keySha256:hash(key),markedSha256:hash(marked),filteredSha256:hash(payload),
  rawKeyIoc:ioc(key),rawMarkedIoc:ioc(marked),rawFilteredIoc:ioc(payload)
}));

/** Reconstitute the marked 1,468-runic layout from its 1,433 consumed slots.
 * @param {number[]} active values at non-F slots
 */
function insertTransparentF(active) {
  assert.equal(active.length,keyLocations.length);
  const output=marked.map(() => 0);
  keyLocations.forEach((original,i)=>{output[original]=active[i];});
  return output;
}
/** Extract originally fixed nontransparent slots. */
function extract(source) {
  assert.equal(source.length,marked.length);
  assert.ok(skipped.every(i=>source[i]===0));
  return keyLocations.map(i=>source[i]);
}
assert.deepEqual(extract(marked),payload);
assert.deepEqual(insertTransparentF(payload),marked);

for(const sign of [-1,+1]){
  const plaintext=payload.map((v,i)=>mod(v+sign*key[i]));
  const reencryption=plaintext.map((v,i)=>mod(v-sign*key[i]));
  assert.deepEqual(reencryption,payload);
  assert.deepEqual(insertTransparentF(reencryption),marked);
  console.log("ORIGINAL-INVERSE",JSON.stringify({
    sign,length:plaintext.length,ioc:ioc(plaintext),
    first90Gp:parse(plaintext.slice(0,90)),
    first90Indices:plaintext.slice(0,90)
  }));
}

const native=page(57);
assert.equal(native.length,95);
const plant=Array.from({length:key.length},(_,i)=>native[i%native.length]);
for(const sign of [-1,+1]){
  const ciphertext=plant.map((v,i)=>mod(v-sign*key[i]));
  const markedCarrier=insertTransparentF(ciphertext);
  const decrypted=extract(markedCarrier).map((v,i)=>mod(v+sign*key[i]));
  assert.deepEqual(decrypted,plant);
  assert.deepEqual(extract(markedCarrier),ciphertext);
  assert.deepEqual(skipped.map(i=>markedCarrier[i]),Array(skipped.length).fill(0));
}
console.log("NATIVE-PLANT",JSON.stringify({
  originalSolvedPage:57,sourceNativeLength:95,
  plantedConsumed:plant.length,plantedPlaintextIoc:ioc(plant),
  exactRecoveredInBothDirections:plant.length,
  positiveIsFixedHoleModel:true
}));
assert.ok(ioc(plant)>0.055);
console.log("DECISION: full original source alignment, original GP29 additive pair does not recover readable text; source-position plant passes; no authentic key or unknown plaintext.");
