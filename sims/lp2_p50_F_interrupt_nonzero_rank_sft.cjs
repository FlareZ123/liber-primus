"use strict";
/**
 * Bounded original LP2 inverse: p50 eight original 256-bit column keys,
 * source-supported F interrupt and near-forbidden zero GP29 steps.
 * Rank the 28 possible nonzero cipher transitions; use original F=0 as
 * the 29th zero-step interrupt. Advance or skip keystream on F, as bounded
 * alternatives motivated by the known solved Cicada F-interrupt tradition.
 *
 * WARNING: zero-step=plaintext F is a newly defined reversible hypothesis,
 * NOT an authenticated Cicada rule. Zero IV is likewise unselected by source.
 * Windows Node.js22, no npm dependencies.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const GP=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const GRID=JSON.parse(read("resources/liber-primus/base60-grid.json"));
const {parseLP2Words}=require("./lp2_word_pages.cjs");
const {encodeSourceNativeGP}=
  require("./lp2_native_gp_source_orthography_sft.cjs");
const source=parseLP2Words(read("resources/liber-primus/lp2-transcription.txt"));
assert.equal(source.runeCount,12956);
assert.equal(source.words.length,2896);
assert.equal(source.crossPageWords,32);
assert.equal(GRID.byte_rows.length,32);
assert(GRID.byte_rows.every(row=>row.length===8));
const keys=Array.from({length:8},(_,col)=>
  Buffer.from(GRID.byte_rows.map(row=>row[col])));
assert(keys.every(x=>x.length===32));
const gpIndex=new Map(GP.runes.map((r,i)=>[r,i]));
const parsed=source.words.map(word=>({start:word.startPage,end:word.endPage,
  nums:[...word.runes].map(r=>{
    const n=gpIndex.get(r);assert.notEqual(n,undefined);return n;
  })}));
assert.deepEqual(parsed.flatMap(w=>w.nums),GP.pages.filter(p=>
  p.page<56&&p.indices.length).flatMap(p=>p.indices));
const physical=p=>p>=50?p+1:p;
const boundaries=[[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];
const sections=boundaries.map(([from,to],id)=>{
  const wordList=parsed.filter(w=>{
    const f=physical(w.start),t=physical(w.end);
    assert.equal(f>=from&&f<=to,t>=from&&t<=to,
      "Original word must not cross proposed visual-section boundary");
    return f>=from&&f<=to;
  });
  const raw=wordList.flatMap(w=>w.nums),direct=GP.pages.filter(p=>
    p.page>=from&&p.page<=to).flatMap(p=>p.indices);
  assert.deepEqual(raw,direct);
  return {id,from,to,raw,wordLengths:wordList.map(w=>w.nums.length)};
});
const dictionary=new Set((read("resources/control/gibran_prophet_58585.txt")
  .match(/[A-Za-z]+/g)||[]).map(w=>encodeSourceNativeGP(w).join(",")));
assert.equal(dictionary.size,2482);
for(const name of ["aes-256-ctr","chacha20"])
  assert(crypto.getCiphers().includes(name));
const mod29=x=>((x%29)+29)%29;
const mod28=x=>((x%28)+28)%28;
function stream(cipher,key,n){
  const context=crypto.createCipheriv(cipher,key,Buffer.alloc(16));
  return Buffer.concat([context.update(Buffer.alloc(n)),context.final()]);
}
/** @param {number[]} cipher @param {Buffer} pad
 * @param {-1|1} sign @param {boolean} interruptSkips */
function decrypt(cipher,pad,sign,interruptSkips){
  let previous=0,cursor=0;
  return cipher.map(c=>{
    const d=mod29(c-previous);
    const plaintext=d===0?0:1+mod28(d-1+sign*(pad[cursor]%28));
    previous=c;
    if(d!==0||!interruptSkips)cursor++;
    return plaintext;
  });
}
function encrypt(plaintext,pad,sign,interruptSkips){
  let previous=0,cursor=0;
  return plaintext.map(p=>{
    const d=p===0?0:1+mod28(p-1-sign*(pad[cursor]%28));
    previous=mod29(previous+d);
    if(p!==0||!interruptSkips)cursor++;
    return previous;
  });
}
function score(runes,wordLengths){
  let offset=0,wordHits=0,runeHits=0,longHits=0,run=0,longestRun=0;
  for(const length of wordLengths){
    const hit=dictionary.has(runes.slice(offset,offset+length).join(","));
    if(hit){wordHits++;runeHits+=length;longHits+=Number(length>=4);
      run++;longestRun=Math.max(longestRun,run);}
    else run=0;
    offset+=length;
  }
  assert.equal(offset,runes.length);
  const c=Array(29).fill(0);for(const x of runes)c[x]++;
  const ioc=c.reduce((a,n)=>a+n*(n-1),0)/(runes.length*(runes.length-1));
  return {wordHits,runeHits,longHits,longestRun,
    coverage:runeHits/runes.length,ioc,FInterrupts:c[0]};
}
const clear=GP.pages[57].indices;
assert.equal(clear.length,95);
let positives=0;
for(const name of ["aes-256-ctr","chacha20"])
for(const key of keys)
for(const sign of [-1,1])
for(const interruptSkips of [false,true]){
  const pad=stream(name,key,clear.length);
  const x=encrypt(clear,pad,sign,interruptSkips);
  assert.deepEqual(decrypt(x,pad,sign,interruptSkips),clear);
  assert.deepEqual(encrypt(decrypt(x,pad,sign,interruptSkips),
    pad,sign,interruptSkips),x);
  positives++;
}
const records=[];
for(const original of sections)
for(let col=0;col<8;col++)
for(const name of ["aes-256-ctr","chacha20"]){
  const pad=stream(name,keys[col],original.raw.length);
  for(const sign of [-1,1])
  for(const interruptSkips of [false,true]){
    const decoded=decrypt(original.raw,pad,sign,interruptSkips);
    const stats=score(decoded,original.wordLengths);
    records.push({section:original.id,pages:original.from+"-"+original.to,
      length:original.raw.length,keyColumn:col,primitive:name,sign,
      interruptSkips,...stats,
      first72GP:decoded.slice(0,72).map(x=>GP.translit[x]).join("")});
  }
}
assert.equal(records.length,9*8*2*2*2);
assert.equal(positives,64);
const selected=sections.map(section=>records.filter(r=>r.section===section.id)
  .sort((a,b)=>b.coverage-a.coverage||b.longHits-a.longHits)[0]);
const lexical=records.slice().sort((a,b)=>b.coverage-a.coverage)
  .slice(0,12);
const highIOC=records.slice().sort((a,b)=>b.ioc-a.ioc).slice(0,7);
const progress=records.filter(r=>r.length>=200&&r.longHits>=5&&
  r.coverage>.12&&r.longestRun>=3);
console.log(JSON.stringify({
  result:progress.length?
    "Original candidate may deserve source-typed scrutiny":
    "No coherent original GP English under source p50 AES/ChaCha 28-nonzero transition ranks with F interrupt",
  source:{
    table:"p50 32x8 bytes, eight raw 32byte column keys",
    pages:sections.map(s=>({range:s.from+"-"+s.to,runes:s.raw.length})),
    Fvalue:0,uniqueNativeGPWords:dictionary.size},
  model:{
    transition:"d=(C_i−C_(i−1)) mod29; d=0→P_i=F(0); otherwise P_i=1+((d−1±byte%28) mod28)",
    cipher:"aes-256-ctr/chacha20",iv:"16 all-zero bytes",
    interrupt:"consume stream byte or skip on F",
    sourceColumnAssignments:"each key tested independently on all 9 original source sections",
    exactOriginalTrials:records.length,plantedOriginalClearP57Controls:positives},
  bestOriginalPerSection:selected,
  topOriginalLexical:lexical,
  topOriginalIoC:highIOC,
  potentialLeads:progress,
  limitation:"The rank conversion and zero-step F are conjectures; this excludes only the named fully specified source-column AES/ChaCha zero-IV forms. No novel plaintext or actual key recovered."
},null,2));
