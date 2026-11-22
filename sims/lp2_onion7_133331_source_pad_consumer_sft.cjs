"use strict";
/**
 * A direct original-cipher decision for the two source-derived 133/331
 * numerical-grid candidates: a 256-byte table traversal and the unpadded
 * 11-character Base64 run's eight decoded bytes. Both are interpreted as
 * repeating GP29 additive shifts on the unchanged 12,956 unknown runes.
 *
 * The decoded 8-byte key is provisional; output-type and cipher instructions
 * do not survive. This is a bounded first consumer, not a verified decryption.
 * @module lp2_onion7_133331_source_pad_consumer_sft
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
/** @param {string} p */
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const {sourceAndReadout}=require("./lp2_onion7_133331_lcg256_carrier_sft.cjs");
const mod=x=>(x%29+29)%29;
/** @param {number[]} values */
function inventory(values) {
  const f=Array(29).fill(0);
  for(const x of values)f[x]++;
  const ordered=f.slice().sort((a,b)=>b-a);
  return {
    ioc:f.reduce((a,x)=>a+x*(x-1),0)/(values.length*(values.length-1)),
    top1:ordered[0],top12:ordered.slice(0,12).reduce((a,b)=>a+b,0)
  };
}
/** @param {number[]} cipher @param {number[]} key @param {number} sign */
function decode(cipher,key,sign) {
  return cipher.map((x,i)=>mod(x+sign*key[i%key.length]));
}
/**
 * Source-clue-motivated no-repeat transport. Equal neighboring ciphertext
 * characters encode GP index 28, otherwise the observed next symbol's
 * successor-rank encodes a GP28 index, before source-byte pad removal.
 * @param {number[]} cipher @param {number[]} key @param {number} sign
 * @param {"cyclic"|"sorted"} mode
 */
function decodeRank28(cipher,key,sign,mode) {
  const out=[cipher[0]];
  for(let i=1;i<cipher.length;i++) {
    const prev=cipher[i-1], next=cipher[i];
    if(prev===next) {out.push(28);continue;}
    const rank=mode==="cyclic" ? mod(next-prev-1) :
      next-(next>prev ? 1:0);
    out.push((rank+sign*(key[i%key.length]%28)+56)%28);
  }
  return out;
}
/**
 * @param {number[]} plain @param {number[]} key
 * @param {"cyclic"|"sorted"} mode
 */
function encodeRank28(plain,key,mode) {
  const out=[plain[0]];
  for(let i=1;i<plain.length;i++) {
    const prev=out[i-1],p=plain[i];
    if(p===28){out.push(prev);continue;}
    const rank=(p+key[i%key.length])%28;
    out.push(mode==="cyclic" ? mod(prev+rank+1) :
      rank+(rank>=prev ? 1:0));
  }
  return out;
}
function run() {
  const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
  const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length);
  const cipher=pages.flatMap(p=>p.indices);
  assert.equal(cipher.length,12956);
  const readout=sourceAndReadout(grid.bytes).readout;
  assert.equal(readout.length,256);
  assert.equal(Buffer.from(readout.slice(173,184)).toString("latin1"),
    "Q8rI6/I6PiT");
  const keys={
    entire256:readout.map(x=>x%29),
    base64Eight:Array.from(Buffer.from("Q8rI6/I6PiT=","base64")).map(x=>x%29)
  };
  assert.equal(keys.base64Eight.length,8);
  assert.deepEqual(keys.base64Eight,[9,28,26,3,10,0,4,7]);
  const solved=corpus.pages[57].indices;
  assert.equal(solved.length,95);
  const rows=[];
  for(const [name,key] of Object.entries(keys)) {
    // Positive control: the actual 95-symbol known GP paragraph can be
    // encrypted and exactly recovered with this fixed source-key consumer.
    const encrypted=decode(solved,key,+1);
    const recovered=decode(encrypted,key,-1);
    assert.deepEqual(recovered,solved);
    for(const sign of [-1,+1]) {
      const plain=decode(cipher,key,sign), inv=inventory(plain);
      const p0=corpus.pages[0].indices.length;
      rows.push({
        key:name,sign,period:key.length,stats:inv,
        originalPage0Ioc:inventory(plain.slice(0,p0)).ioc,
        originalPage0First72:plain.slice(0,72).map(x=>corpus.translit[x]).join("")
      });
    }
  }
  const max= Math.max(...rows.map(x=>x.stats.ioc));
  assert.ok(max<0.035);
  const rankRows=[];
  for(const [name,key] of Object.entries(keys)) for(const mode of
    ["cyclic","sorted"]) {
    const rankKey=key.map(x=>x%28);
    const recovered=decodeRank28(encodeRank28(solved,rankKey,mode),
      rankKey,-1,mode);
    assert.deepEqual(recovered,solved);
    for(const sign of [-1,+1]) {
      const v=decodeRank28(cipher,rankKey,sign,mode);
      rankRows.push({key:name,mode,sign,stats:inventory(v),
        originalPage0Ioc:inventory(v.slice(0,corpus.pages[0].indices.length)).ioc,
        originalPage0First72:v.slice(0,72)
          .map(x=>corpus.translit[x]).join("")});
    }
  }
  assert.ok(Math.max(...rankRows.map(r=>r.stats.ioc))<0.036);
  return {
    originalRuneCount:cipher.length,
    originalCipher:inventory(cipher),
    solved95RuneParable:inventory(solved),
    keys,rows,rankRows,
    positiveControls:"Both candidate keys exactly recover the 95 authentic solved-p57 GP runes after encryption.",
    conclusion:"All four direct-GP29 and eight no-repeat successor-rank GP28 consumers of both original-source keys remain random-like. No original unknown plaintext."
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,decode,inventory};
