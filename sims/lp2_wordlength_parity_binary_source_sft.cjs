"use strict";
/**
 * Freeze the 2016 "Its words are the map; ... their numbers are the
 * direction" word-length parity conjecture on original LP2. The 2,896
 * complete GP words exactly fill 181 x 16 positions. Use source p15's
 * 4x4 spiral and source pp49-51's 256 table cells as geometric and key
 * cues. These source clues DO NOT authenticate a parity/AES cipher.
 * Node.js 22 CommonJS: node sims/lp2_wordlength_parity_binary_source_sft.cjs
 * Original inputs read-only, no external modules.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table=JSON.parse(read("resources/liber-primus/lp2-grid-256.json")).bytes;
const hash=Buffer.from(JSON.parse(read("resources/cicada2014-archive-hash-manifest.json")).targetHex,"hex");
const order16=[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12];
const inverse16=Array(16);order16.forEach((x,i)=>inverse16[x]=i);
const W=2896,R=181,C=16;
assert.equal(table.length,256);

/** @param {string} text @returns {number[]} */
function sourceLengths(text) {
  const gp=new Set(corpus.runes);
  const out=[];let count=0;
  const finish=()=>{if(count){out.push(count);count=0;}};
  for(const ch of text.split("%").slice(0,55).join("%")) {
    if(gp.has(ch))count++;
    else if(ch==="%"||ch==="/"||/\s/u.test(ch))continue;
    else finish();
  }
  finish();return out;
}

/** @param {number[]} lengths @param {number[]} order @returns {Buffer} */
function parity(lengths,order) {
  assert.equal(lengths.length,order.length);
  assert.equal(order.length%8,0);
  const buf=Buffer.alloc(order.length/8);
  for(let i=0;i<order.length;i++)
    buf[i>>3]|=(lengths[order[i]]&1)<<(7-(i&7));
  return buf;
}

/** @param {string} mode @returns {number[]} */
function reading(mode) {
  assert.equal(W,R*C);
  const key=mode.includes("inverse")?inverse16:order16;
  if(mode==="printed")return Array.from({length:W},(_,i)=>i);
  if(mode==="spiral"||mode==="inverse")
    return Array.from({length:W},(_,i)=>Math.floor(i/C)*C+key[i%C]);
  return Array.from({length:W},(_,i)=>(i%R)*C+
    (mode==="column"?Math.floor(i/R):key[Math.floor(i/R)]));
}

/** @param {Buffer} a */
function printable(a) {
  const num=Array.from(a).filter(x=>x===10||x===13||(x>=32&&x<=126)).length;
  return {bytes:a.length,printable:num,ratio:num/a.length,first16:a.subarray(0,16).toString("hex")};
}

/** @returns {{name:string,key:Buffer}[]} */
function keyList() {
  const buf=Buffer.from(table),out=[];
  for(let i=0;i<8;i++) {
    out.push({name:"col"+i,key:Buffer.from(Array.from({length:32},(_,j)=>buf[8*j+i]))});
    out.push({name:"row"+i,key:buf.subarray(i*32,i*32+32)});
  }
  return out;
}

/** @param {Buffer} source @param {Buffer} key @param {string} algorithm @param {Buffer|null} iv */
function decrypt(source,key,algorithm,iv) {
  const size=algorithm==="ctr"?source.length:Math.floor(source.length/16)*16;
  const dec=crypto.createDecipheriv("aes-256-"+algorithm,key,iv);
  dec.setAutoPadding(false);
  return Buffer.concat([dec.update(source.subarray(0,size)),dec.final()]);
}

/** @param {Buffer} key @param {Buffer} iv */
function positiveControl(key,iv) {
  const source=Buffer.from("LIBER PRIMUS: SOURCE-NATIVE WORD-PARITY PLANT");
  const enc=crypto.createCipheriv("aes-256-ctr",key,iv);
  const cipher=Buffer.concat([enc.update(source),enc.final()]);
  // The real words I (one GP rune) and OF (two GP runes) carry bits.
  const synthetic=[];
  for(const x of cipher)for(let bit=7;bit>=0;bit--)
    synthetic.push(((x>>bit)&1)?1:2);
  const packed=parity(synthetic,synthetic.map((_,i)=>i));
  assert.deepEqual(packed,cipher);
  assert.deepEqual(decrypt(packed,key,"ctr",iv),source);
  return {nativeWords:"I (1 GP rune) / OF (2 GP runes)",bits:synthetic.length,
    bytes:source.length,exactRecovered:true};
}

function main() {
  const words=sourceLengths(read("resources/lp2-transcription.txt"));
  assert.equal(words.length,W);
  assert.equal(words.reduce((s,n)=>s+n,0),12956);
  const odd=words.filter(n=>n%2).length;
  assert.equal(odd,1450);
  const modes=["printed","spiral","inverse","column","column-spiral","column-inverse"];
  const keys=keyList();
  const ivs=[{name:"zero",value:Buffer.alloc(16)},
    {name:"p56-digest",value:hash.subarray(0,16)}];
  const raw={},rank=[];
  for(const name of modes) {
    const source=parity(words,reading(name));
    raw[name]=printable(source);
    for(const {name:keyName,key} of keys)
      for(const cipher of ["ctr","cbc","ecb"])
        for(const iv of cipher==="ecb"?[{name:"none",value:null}]:ivs)
          rank.push({readout:name,key:keyName,cipher,iv:iv.name,
            ...printable(decrypt(source,key,cipher,iv.value))});
  }
  rank.sort((a,b)=>b.ratio-a.ratio);
  assert.equal(rank.length,480);
  assert.ok(rank[0].ratio<.6);
  const result={
    source:"Original 2,896 complete words; 16-cell p15 spiral; 32x8 p50 byte table",
    words:W,runes:12956,odd,even:W-odd,bytes:W/8,
    direct:raw,modelCount:rank.length,bestAES:rank.slice(0,10),
    nativePlant:positiveControl(keys[0].key,ivs[1].value),
    decision:"No recognizable binary/plaintext among the frozen parity readouts and AES source-table keys",
    limits:"No authored parity/AES instruction. Other binary encodings, unknown keys, stream clocks and hidden sources remain open."
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)main();
module.exports={sourceLengths,parity,reading,printable,keyList,decrypt,positiveControl,main};
