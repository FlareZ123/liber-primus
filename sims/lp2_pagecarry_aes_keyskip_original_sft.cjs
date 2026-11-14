"use strict";
/**
 * Source-addressed 32-byte AES256 GP29 anti-repeat-key gate.
 * Node 22 CJS SFT: node sims/lp2_pagecarry_aes_keyskip_original_sft.cjs
 *
 * Frozen input: 32 authentic page-carried words => 32 numeric-table cells.
 * Frozen model: AES256 CTR zero IV, byte%29 or floor(29*byte/256);
 * independent GP word-symbol prior, plaintext held constant during
 * probabilistic ciphertext-repeat rejection (probability 0.81).
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createCipheriv} = require("node:crypto");
const {logLikelihood, encrypt} = require("./keyskip_transducer.cjs");
const root = path.resolve(__dirname,"..");
/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const bytes=grid.pages.flatMap(p=>p.bytes);
const runeId=new Map(corpus.runes.map((r,i)=>[r,i]));
const words=[];
let page=0,start=0,buffer="",fragments=[];
function flush(){if(buffer)words.push({start,word:buffer,fragments:fragments.slice()});buffer="";fragments=[];}
for(const ch of read("resources/liber-primus/lp2-transcription.txt")){
  if(runeId.has(ch)){
    if(!buffer){start=page;fragments=[0];}
    buffer+=ch;fragments[fragments.length-1]++;
  }else if(ch==="%"){page++;if(buffer)fragments.push(0);}
  else if(ch!=="/"&&!/\s/u.test(ch)){flush();}
}
flush();
const candidates=words.filter(x=>x.start<55 && x.fragments.length>1);
assert.equal(candidates.length,34);
const carries=candidates.filter(x=>x.fragments.at(-1)>0);
assert.equal(carries.length,32);
assert.ok(carries.every(x=>x.fragments.at(-1)>=1 && x.fragments.at(-1)<=7));
const sourceKey=Buffer.from(carries.map((word,row)=>
  bytes[row*8+(word.fragments.at(-1)-1)]));
assert.equal(sourceKey.toString("hex"),
 "61f9cac6505456feff728edc483f49ed780ad221c0f0839c007f063b446a1671");
const unknown=corpus.pages.filter(p=>p.page<=2 && p.page>=0)
  .flatMap(p=>p.indices);
assert.equal(unknown.length,729);
const lp1=read("resources/transcriptions/lp1_wulfic_canonical.txt").split("%");
const native=[3,8,9,10,11,14].flatMap(i=>
  [...lp1[i]].map(r=>runeId.get(r)).filter(x=>x!==undefined));
assert.ok(native.length>=729);
const counts=Array(29).fill(1);
for(const i of native)counts[i]++;
for(const p of corpus.pages.filter(p=>p.status==="solved"))
  for(const i of p.indices)counts[i]++;
const total=counts.reduce((s,v)=>s+v,0);
const q=counts.map(v=>v/total);
const identity=Array.from({length:29},(_,i)=>i);
const MAX_SKIPS=80;
const R=0.81;
const KLEN=unknown.length+MAX_SKIPS+20;
/** @param {Buffer} key @param {"mod"|"scaled"} mapping @returns {number[]} */
function stream(key,mapping){
  const enc=createCipheriv("aes-256-ctr",key,Buffer.alloc(16));
  const b=Buffer.concat([enc.update(Buffer.alloc(KLEN)),enc.final()]);
  return [...b].map(v=>mapping==="mod"?v%29:Math.floor(29*v/256));
}
/** @param {number[]} key */
function model(key){return {key,q,inverseSigma:identity,offset:0,
  rejectRepeat:R,maxTotalSkips:MAX_SKIPS,maxSkippedPerOutput:4};}
/** @param {number} seed @returns {()=>number} */
function rng(seed){let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};}
/** @param {Buffer} key @param {number} seed @returns {Buffer} */
function shuffleKey(key,seed){const a=Buffer.from(key),rand=rng(seed);
  for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
/** @param {number[]} data @returns {number} */
function repeatCount(data){return data.reduce((sum,c,i)=>sum+(i>0&&c===data[i-1]?1:0),0);}
const out={originalSource:{unknownFirstThreeRunes:unknown.length,originalDoublets:repeatCount(unknown),
  nativePlantRunePool:native.length,sourceKeyHex:sourceKey.toString("hex"),
  keyBytes:sourceKey.length},hypothesis:{r:R,maxTotalSkips:MAX_SKIPS,
    maxPerOutput:4,keystream:"AES-256-CTR, zero IV, page0 phase0"},tests:[]};
for(const mapping of ["mod","scaled"]){
  const authenticStream=stream(sourceKey,mapping);
  const actual=logLikelihood(unknown,model(authenticStream));
  const controlScores=Array.from({length:16},(_,i)=>
    logLikelihood(unknown,model(stream(shuffleKey(sourceKey,
      0x33012340+i*4099),mapping))));
  const nullMean=controlScores.reduce((s,v)=>s+v,0)/controlScores.length;
  const nullSD=Math.sqrt(controlScores.reduce((s,v)=>
    s+(v-nullMean)**2,0)/controlScores.length);
  const positive=encrypt(native.slice(0,729),authenticStream,identity,
    rng(0x33013301),{rejectRepeat:R});
  assert.ok(positive.skips<=MAX_SKIPS);
  const plantScore=logLikelihood(positive.cipher,model(authenticStream));
  const wrongPlantScores=Array.from({length:16},(_,i)=>
    logLikelihood(positive.cipher,model(stream(shuffleKey(sourceKey,
      0x33012340+i*4099),mapping))));
  const rankPlant=1+wrongPlantScores.filter(x=>x>=plantScore).length;
  assert.ok(rankPlant<=2, "planted native score fails to select source key");
  out.tests.push({mapping,originalSourceScore:actual,
    shuffledKeysMean:nullMean,shuffledKeysSD:nullSD,
    originalRankAmong17:1+controlScores.filter(x=>x>=actual).length,
    originalZ:(actual-nullMean)/nullSD,shuffledKeyScores:controlScores,
    positiveNative:{runes:729,generatedDoublets:repeatCount(positive.cipher),
      skips:positive.skips,exactSourceKeyRankAmong17:rankPlant,
      authenticLogLikelihood:plantScore,
      bestWrongLogLikelihood:Math.max(...wrongPlantScores)}});
}
console.log(JSON.stringify(out,null,2));
console.log("PASS: original AES-key repeat-skip gate evaluated with genuine native blind controls");
