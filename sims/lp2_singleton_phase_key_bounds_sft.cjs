"use strict";
/**
 * Reproducible source-original singleton-word key-period obstruction.
 * Requires Node.js 22 and the two unmodified canonical corpus files.
 * No writes, dependencies, unknown plaintext or fitted key.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const base = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(base,file),"utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const input = read("resources/liber-primus/lp2-transcription.txt");
const alphabet = new Map(gp.runes.map((g,i)=>[g,i]));
const N = 29, unknown = 12956, plain = [24,10,3]; // A I O
const mod = n => (n%N+N)%N;
/** @type {Array<Array<{r:number,c:number}>>} */
const words = [];
let w = [], next = 0;
for (const ch of input) {
  const c = alphabet.get(ch);
  if (c !== undefined) w.push({r:next++,c});
  else if ((ch === "-" || ch === ".") && w.length) {words.push(w);w=[];}
}
if(w.length) words.push(w);
assert.equal(next,13136);
assert.equal(words.length,2941);
assert.equal(words.filter(w=>w[0].r<unknown).length,2896);
assert.deepEqual(words.flatMap(w=>w.map(t=>t.c)),
  gp.pages.flatMap(p=>p.indices));
const pages=gp.pages.slice(0,56), starts=[];
let offset=0;
for (const p of pages){starts.push(offset);offset+=p.indices.length;}
assert.equal(offset,unknown);
const firstWord=starts.map(start =>
  words.findIndex(w=>w[w.length-1].r>=start));
/** @typedef {{r:number,wi:number,c:number,page:number,pr:number,pw:number}} Singleton */
/** @type {Singleton[]} */
const singles=words.flatMap((w,wi)=>{
  if(w.length!==1||w[0].r>=unknown)return [];
  const {r,c}=w[0],page=starts.findLastIndex(x=>x<=r);
  return [{r,wi,c,page,pr:r-starts[page],pw:wi-firstWord[page]}];
});
assert.equal(singles.length,83);
assert.equal(new Set(singles.map(x=>x.c)).size,28);
assert.deepEqual(singles.slice(0,11).map(x=>x.r),
  [176,244,350,530,644,792,967,1025,1062,1250,1316]);
const families=["add+","add-","xor"];
const masks=Object.fromEntries(families.map(f=>[f,Array.from(
  {length:N},(_,c)=>plain.reduce((acc,p)=>{
    const key=f==="xor"?(c^p):mod(c-(f==="add+"?p:-p));
    return (acc|(1<<key))>>>0;
  },0))]));
/** @param {Singleton} s @param {"global"|"page"} clock */
const phase=(s,clock,period,advance)=>((clock==="global"?s.r:s.pr)+
  advance*(clock==="global"?s.wi:s.pw))%period;
/** @param {"global"|"page"} clock @param {string} family
 * @param {number} period @param {number} advance
 * @param {Singleton[]} observations */
function possible(clock,family,period,advance,observations=singles){
  const active=new Uint32Array(period);
  active.fill(family==="xor"?0xffffffff:(1<<N)-1);
  for(const s of observations){
    const i=phase(s,clock,period,advance);
    active[i]&=masks[family][s.c];
    if(active[i]===0)return false;
  }
  return true;
}
function first(clock,family,limit,fixed=null){
  for(let L=1;L<=limit;L++){
    const as=fixed===null?Array.from({length:L},(_,i)=>i):[fixed%L];
    for(const a of as)if(possible(clock,family,L,a))
      return {period:L,advance:a};
  }
  return null;
}
function sourceSite(page,pr,pw){
  const x=singles.filter(s=>s.page===page&&s.pr===pr&&s.pw===pw);
  assert.equal(x.length,1);
  return x[0].c;
}
// Source-visible page-local contradictions, independent of period size.
assert.deepEqual([sourceSite(0,244,54),sourceSite(16,244,54)],[15,10]);
assert.deepEqual([sourceSite(2,2,1),sourceSite(25,2,1),
  sourceSite(39,2,1)],[1,6,2]);
// Planted positives ensure every word position, model and bitmask is usable.
for(const clock of ["global","page"])for(const f of families){
  const plant=singles.map((s,i)=>{
    const p=plain[i%3],t=phase(s,clock,13,1);
    const key=f==="xor"?(t%2)*4:(3*t+7)%N;
    const c=f==="xor"?(p^key):mod(key+(f==="add+"?p:-p));
    assert(c>=0&&c<29);
    return {...s,c};
  });
  assert.equal(possible(clock,f,13,1,plant),true);
  assert.equal(masks[f][15]&masks[f][10],0);
  assert.equal(masks[f][1]&masks[f][6]&masks[f][2],0);
  for(let a=0;a<256;a++){
    assert.equal(possible("global",f,256,a),false);
    assert.equal(possible("page",f,256,a),false);
  }
}
const all=Object.fromEntries(families.map(f=>
  [f,first("global",f,350)]));
const no=Object.fromEntries(families.map(f=>
  [f,first("global",f,700,0)]));
const one=Object.fromEntries(families.map(f=>
  [f,first("global",f,700,1)]));
assert.deepEqual(all,{"add+":{period:276,advance:247},
  "add-":{period:276,advance:247},
  "xor":{period:343,advance:284}});
assert.deepEqual(no,{"add+":{period:377,advance:0},
  "add-":{period:377,advance:0},
  "xor":{period:439,advance:0}});
assert.deepEqual(one,{"add+":{period:589,advance:1},
  "add-":{period:589,advance:1},
  "xor":{period:664,advance:1}});
console.log(JSON.stringify({status:"PASS",originalRunes:next,
  unsolvedRunes:unknown,words:2896,singletons:singles.length,
  differentSingletonGlyphs:28,
  firstPeriodAnyWordAdvance:all,
  firstPeriodNoExtraWordAdvance:no,
  firstPeriodOneExtraWordAdvance:one,
  originalPageResetContradiction:true,
  no256PeriodForEitherClock:true},null,2));


// A finite, deliberately generous escape: a public-page-number linear salt.
// Unlike the all-secret period bounds above, choose a,b after looking at
// singleton glyphs. This post-selection MUST be compared with label nulls.
const table=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"))
  .pages.flatMap(p=>p.bytes);
assert.equal(table.length,256);
const originalGlyphs=singles.map(s=>s.c);
function saltCount(glyphs) {
  let count=0,example=null;
  for(let a=0;a<256;a++)for(let b=0;b<256;b++){
    const km=new Int32Array(256);
    km.fill((1<<N)-1);
    let viable=true;
    for(let i=0;i<singles.length;i++){
      const s=singles[i],j=(s.pr+a*s.pw+b*s.page)%256;
      km[j]&=masks["add+"][glyphs[i]];
      if(km[j]===0){viable=false;break;}
    }
    if(viable){count++;if(example===null)example={a,b};}
  }
  return {count,example};
}
assert.deepEqual(saltCount(originalGlyphs),
  {count:1,example:{a:155,b:46}});
let seed=0x5f3759df;
function nextInt(n) {
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return (seed>>>0)%n;
}
let nullPositive=0;
for(let trial=0;trial<30;trial++){
  const shuffled=originalGlyphs.slice();
  for(let i=shuffled.length-1;i>0;i--){
    const j=nextInt(i+1);
    [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
  }
  if(saltCount(shuffled).count>0)nullPositive++;
}
assert.equal(nullPositive,16); // One admissible pair is not remarkable.
let directHits={};
for(const sign of [1,-1]){
  const count=singles.filter(s=>{
    const phase=(s.pr+155*s.pw+46*s.page)%256;
    const value=mod(s.c-sign*table[phase]);
    return plain.includes(value);
  }).length;
  directHits[sign===1?"plus":"minus"]=count;
}
assert.deepEqual(directHits,{plus:9,minus:8});
console.log(JSON.stringify({
  affine_page_salt_original_survivors:1,
  affine_page_salt_frozen_candidate:{wordAdvance:155,pageMultiplier:46},
  matched_shuffled_positives:16,
  matched_shuffled_trials:30,
  genuine_table_singleton_plaintext_matches:directHits,
  genuine_table_singleton_plaintext_total:83,
  verdict:"no authenticated LP2 key or original plaintext"
},null,2));
