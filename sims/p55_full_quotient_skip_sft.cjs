#!/usr/bin/env node
"use strict";
/**
 * Director #374 frozen source-table quotient / skip-aware page-55 gate.
 * Reproduces the beam relation of Dukotah/cicada3301 commit f63501d8,
 * campaign18_skip/skipdecode.py, with beam width 400 and max_skip 3.
 * English quadgrams are retained verbatim from the MIT-licensed repository,
 * resources/control/dukotah_english_quadgrams.txt.
 *
 * The original table consists of 10+13+9 rows over physical pages 49-51;
 * it is NOT a 256-cell table printed solely on page 50.
 * Run: node sims/p55_full_quotient_skip_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
/** @param {string} rel @param {string} expected */
function pinned(rel, expected) {
  const bytes = fs.readFileSync(path.join(root, rel));
  const sha = crypto.createHash("sha1").update(Buffer.from("blob " + bytes.length + "\0")).update(bytes).digest("hex");
  assert.equal(sha, expected, rel + " source changed");
  return bytes.toString("utf8");
}
const grid = JSON.parse(pinned("resources/liber-primus/base60-grid.json", "4698c0806e6bab06a39cfbc3c3283b862de58b35"));
const corpus = JSON.parse(pinned("resources/liber-primus/lp2-corpus.json", "054f2a0f780b7d46901acbe3d9bf4f0ac1801165"));
const quad = pinned("resources/control/dukotah_english_quadgrams.txt", "da56c2e11e004ad24454750dba8fbe2e19abbc71");
const gibran = pinned("resources/control/gibran_prophet_58585.txt", "df260a07d56bf5998d40a6360b6132c35c252d10");
assert.deepEqual(grid.page_row_counts, [10, 13, 9]);
assert.equal(grid.byte_rows.length, 32);
const q = grid.byte_rows.flat().map(n => Math.floor(n / 29));
assert.equal(q.length, 256);
assert(q.every(n => n >= 0 && n <= 8));
const key = q.concat(q, q);
const C = corpus.pages.find(p => p.page === 55).indices;
assert.equal(C.length, 76);
const wordLengths = [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(wordLengths.reduce((a,b) => a+b), 76);
const translit = corpus.translit;
const freq = new Map();
let total = 0;
for (const line of quad.trim().split(/\r?\n/)) {
  const [g, v] = line.split(/\s+/);
  assert.equal(g.length, 4);
  freq.set(g, +v);
  total += +v;
}
const logTotal = Math.log10(total);
for (const [g,n] of freq) freq.set(g, Math.log10(n) - logTotal);
const floor = Math.log10(0.01) - logTotal;
const m29 = n => (n % 29 + 29) % 29;
/** @param {string} s */
function score(s) {
  let sum = 0;
  for (let i=3; i<s.length; i++) sum += freq.get(s.slice(i-3,i+1)) ?? floor;
  return sum/(s.length - 3);
}
/**
 * Exact campaign18 beam recurrence; no LP2-tuned skips, offsets, phases,
 * word-clock or invented per-page reset.
 * @param {number[]} ct @param {number[]} ks @param {number} sign
 */
function beam(ct, ks, sign) {
  const first = m29(ct[0] + sign*ks[0]);
  let states = [{score:0, ptr:0, text:translit[first], plain:[first], skips:[]}];
  for (let i=1; i<ct.length; i++) {
    const next = [];
    for (const b of states) for (let d=0; d<=3; d++) {
      const acc = b.ptr+1+d;
      if (acc >= ks.length) break;
      const p = m29(ct[i] + sign*ks[acc]);
      let valid = true;
      for (let j=b.ptr+1; j<acc; j++)
        if (m29(p - sign*ks[j]) !== ct[i-1]) { valid=false; break; }
      if (!valid) continue;
      const text = b.text + translit[p];
      let delta = 0;
      for (let j=Math.max(3,b.text.length); j<text.length; j++)
        delta += freq.get(text.slice(j-3,j+1)) ?? floor;
      next.push({score:b.score+delta,ptr:acc,text,plain:b.plain.concat(p),skips:b.skips.concat(d)});
    }
    assert(next.length > 0, "No skip-compatible path at original rune "+i);
    next.sort((a,b) => b.score-a.score);
    states = next.slice(0,400);
  }
  const out = states[0];
  out.norm = score(out.text);
  out.skipTotal = out.skips.reduce((a,b)=>a+b,0);
  return out;
}
/** Forward check of every chosen consumed and rejected key position. */
function forwardCheck(p, ct, ks, sign, skipList) {
  assert.equal(p.length,ct.length);
  assert.equal(skipList.length,ct.length-1);
  let ptr=0;
  assert.equal(m29(p[0]-sign*ks[ptr]),ct[0]);
  for(let i=1;i<ct.length;i++){
    for(let j=0;j<skipList[i-1];j++){
      ++ptr;
      assert.equal(m29(p[i]-sign*ks[ptr]),ct[i-1]);
    }
    ++ptr;
    assert.equal(m29(p[i]-sign*ks[ptr]),ct[i]);
  }
  return ptr;
}
function rng(seed) {
  return () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t>>>15,t|1);
    t ^= t + Math.imul(t ^ t>>>7,t|61);
    return ((t ^ t>>>14) >>> 0) / 4294967296;
  };
}
/** Deterministic fixed-suppression plant; source beam does not fit suppression. */
function encrypt(plain, ks, sign, seed) {
  const random = rng(seed),ct=[], skips=[];
  let ptr=0;
  for (const p of plain) {
    let s=0, c;
    while(true){
      c=m29(p-sign*ks[ptr]);
      if(ct.length && c===ct[ct.length-1] && random()<0.83) {ptr++;s++;continue;}
      break;
    }
    ct.push(c);skips.push(s);ptr++;
  }
  return {ct,skips};
}
const tokens = translit.map((word,i)=>({word,i})).sort((a,b)=>b.word.length-a.word.length);
const native=[];
for(let word of (gibran.toUpperCase().match(/[A-Z]+/g)||[])){
  word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
  for(let i=0;i<word.length;){
    const tok=tokens.find(t=>word.startsWith(t.word,i));
    assert(tok,"unmapped native word "+word);
    native.push(tok.i);i+=tok.word.length;
  }
}
assert.equal(native.length,62696);
const rendered = a=>a.map(v=>translit[v]).join("");
const plants = [-1,1].map((sign,j)=>{
  const plain=native.slice(1000+j*4000,1076+j*4000);
  const encrypted=encrypt(plain,key,sign,3301+j);
  const decoded=beam(encrypted.ct,key,sign);
  const exact=decoded.plain.every((v,i)=>v===plain[i]);
  const replay=forwardCheck(decoded.plain,encrypted.ct,key,sign,decoded.skips);
  assert(exact,"plant must recover all 76 source-GP symbols");
  return {sign,score:decoded.norm,skipTotal:encrypted.skips.reduce((a,b)=>a+b,0),beamSkipTotal:decoded.skipTotal,matched:decoded.plain.filter((v,i)=>v===plain[i]).length,exact,replayIndex:replay};
});
const original = [-1,1].map(sign=>{
  const b=beam(C,key,sign);
  const replay=forwardCheck(b.plain,C,key,sign,b.skips);
  const words=[];let k=0;
  for(const length of wordLengths){words.push(rendered(b.plain.slice(k,k+length)));k+=length;}
  return {sign,score:b.norm,translit:b.text,words,indices:b.plain,skips:b.skips,skipTotal:b.skipTotal,keyLastIndex:b.ptr,forwardExact:replay===b.ptr,heldoutLast19Score:score(rendered(b.plain.slice(57)))};
});
const wrong=beam(C,key.slice(128).concat(key.slice(0,128)),-1);
const shuffle=(a,random)=>{const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;};
const countRepeats=a=>a.reduce((n,v,i)=>n+(i>0&&v===a[i-1]?1:0),0);
assert.equal(countRepeats(C),1);
const random=rng(0x03742026),nulls=[];
for(let n=0;n<32;n++){
  let ct;
  do{ct=shuffle(C,random);}while(countRepeats(ct)!==1);
  const a=beam(ct,key,-1),b=beam(ct,key,1);
  nulls.push({minus:a.norm,plus:b.norm});
}
const wrongKeys=[];
for(let i=0;i<32;i++){
  const ks=shuffle(q,random).concat(q,q);
  wrongKeys.push({minus:beam(C,ks,-1).norm,plus:beam(C,ks,1).norm});
}
const nativeWindows=[];
for(let i=40000;i+76<=native.length;i+=37)nativeWindows.push(score(rendered(native.slice(i,i+76))));
function summary(a,ref) {
  const sorted=a.slice().sort((x,y)=>x-y);
  return {n:a.length,min:sorted[0],median:sorted[Math.floor(a.length/2)],max:sorted[sorted.length-1],atLeastObserved:a.filter(v=>v>=ref).length,upperTailAddOne:(a.filter(v=>v>=ref).length+1)/(a.length+1)};
}
const data={
  hypothesis:"Full base60 row-major high-digit quotient q=floor(byte/29) period256; phase0 p55 GP29 beam with maxskip3 and width400",
  sourceHashes:{base60:"4698c0806e6bab06a39cfbc3c3283b862de58b35",lp2:"054f2a0f780b7d46901acbe3d9bf4f0ac1801165",quadgram:"da56c2e11e004ad24454750dba8fbe2e19abbc71",gibran:"df260a07d56bf5998d40a6360b6132c35c252d10"},
  p55:{runes:C.length,wordLengths,repeatIndices:C.map((v,i)=>i>0&&v===C[i-1]?i:null).filter(x=>x!==null),rawQuadScore:score(rendered(C))},
  key:{len:q.length,digitsFirst80:q.slice(0,80),hist:Array.from({length:9},(_,i)=>q.filter(v=>v===i).length),tablePhysicalPageRowCounts:grid.page_row_counts},
  plants,original,
  wrongKeyMinusScore:wrong.norm,
  randomCipher:{constraint:"32 independent full-permutations of p55 preserving the complete unigram histogram and exactly one adjacent repeat",minus:summary(nulls.map(x=>x.minus),original[0].score),plus:summary(nulls.map(x=>x.plus),original[1].score)},
  shuffledKey:{constraint:"32 independent full 256-q-digit permutations, same index-0 phase, no parameter tuning",minus:summary(wrongKeys.map(x=>x.minus),original[0].score),plus:summary(wrongKeys.map(x=>x.plus),original[1].score)},
  nativeWindows:summary(nativeWindows,Math.max(...original.map(x=>x.score))),
  conclusion:"Frozen full-table quotient key and previously published skip-aware beam yield no meaningful original English plaintext. The best candidate consumes only cells 0-76 of the 256-cell table: zero physical p50 cells. This is a conditional English-register exclusion, not universal cryptographic impossibility."
};
console.log(JSON.stringify(data,null,2));
