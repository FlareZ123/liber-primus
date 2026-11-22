'use strict';
/**
 * Original-input source-clock gate: does the physical p50 256-byte parity
 * clock select the p15 red 3299 / 3301 six-back affine echo?
 *
 * Node 22, Windows 11, CommonJS, read-only.
 * node sims/lp2_p50_bit0_red3299_lag6_gate_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const path=require('node:path');
const {parseSharedCorpus}=require('./lp2_word_pages.cjs');
const root=path.resolve(__dirname,'..');
/** @param {string} f */
const load=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const gp=load('resources/liber-primus/lp2-corpus.json');
const grid=load('resources/liber-primus/lp2-grid-256.json');
const bytes=grid.bytes;
assert.equal(bytes.length,256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
 '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const c=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(c.length,12956);
const src=parseSharedCorpus();
assert.equal(src.crossPageWords,32);
assert.equal(src.words.length,2896);
const rmap=new Map(gp.runes.map((r,i)=>[r,i]));
const words=src.words.map(w=>Array.from(w.runes,r=>{
 assert(rmap.has(r));return rmap.get(r);
}));
assert.deepEqual(words.flat(),c);
const starts=new Map();
let pos=0;
for(const p of gp.pages.filter(p=>p.page<=55)){
 starts.set(p.page,pos);pos+=p.indices.length;
}
const bounds=[0,3,8,15,23,27,33,40,54].map(p=>starts.get(p));
bounds.push(c.length);
/** @param {number} i */
const chapterOf=i=>bounds.findIndex((v,j)=>j<9&&v<=i&&i<bounds[j+1]);
/** @typedef {{i:number,chapter:number,hit:number}} Event */
/** @type {Event[]} */
const events=[];
pos=0;
for(const w of words){
 for(let j=6;j<w.length;j++){
  const i=pos+j;
  const target=((3301-2*w[j-6])%29+29)%29;
  events.push({i,chapter:chapterOf(i),hit:Number(w[j]===target)});
 }
 pos+=w.length;
}
assert.equal(pos,12956);
assert.equal(events.length,1290);
assert.equal(events.reduce((n,e)=>n+e.hit,0),80);
/**
 * Nine independently illustrated-chapter leave-one-out predictive log
 * gain against a pooled Bernoulli event probability. Jeffreys smoothing.
 * @param {Event[]} sample
 * @param {number} phase
 */
function evaluate(sample,phase){
 const cells=Array.from({length:9},()=>[[0,0],[0,0]]);
 for(const {i,chapter,hit} of sample){
  assert(chapter>=0&&chapter<9);
  const bit=bytes[(i-1+phase+256)&255]&1;
  cells[chapter][bit][0]++;cells[chapter][bit][1]+=hit;
 }
 const n=[0,0],h=[0,0];
 for(const row of cells)for(let b=0;b<2;b++){
  n[b]+=row[b][0];h[b]+=row[b][1];
 }
 let cv=0;
 const chapters=[];
 for(const row of cells){
  const nn=[0,1].map(b=>n[b]-row[b][0]);
  const hh=[0,1].map(b=>h[b]-row[b][1]);
  const prob=[0,1].map(b=>(hh[b]+0.5)/(nn[b]+1));
  const pooled=(hh[0]+hh[1]+1)/(nn[0]+nn[1]+2);
  let gain=0;
  for(let b=0;b<2;b++){
   const [count,hits]=row[b];
   gain+=hits*Math.log(prob[b]/pooled)
    +(count-hits)*Math.log((1-prob[b])/(1-pooled));
  }
  cv+=gain;chapters.push(gain);
 }
 return {phase,n,h,cv,chapters};
}
/** @param {Event[]} sample */
function census(sample){
 const scores=Array.from({length:256},(_,i)=>evaluate(sample,i));
 const source=scores[0];
 const rank=1+scores.filter(s=>s.cv>source.cv).length;
 const best=scores.reduce((a,b)=>b.cv>a.cv?b:a);
 return {source,rank,best};
}
const original=census(events);
assert.deepEqual(original.source.n,[671,619]);
assert.deepEqual(original.source.h,[40,40]);
assert(Math.abs(original.source.cv+0.47049802493402976)<1e-12);
assert.equal(original.rank,104);
assert.equal(original.best.phase,236);
// A genuine same-site synthetic positive freezes the source phase and makes
// the hit probabilities 14% for even cells and 1% for odd cells.
let seed=0x33013299;
function random(){
 seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
 return(seed>>>0)/4294967296;
}
const plant=events.map(e=>({...e,hit:Number(
 random()<(bytes[(e.i-1+256)&255]&1?0.01:0.14))}));
const control=census(plant);
assert(control.source.cv>15);
assert.equal(control.rank,1);
console.log(JSON.stringify({
 source:'original LP2 12956 runes, 2896 printed words, p50 table parity',
 sixBack:{opportunities:events.length,exact3299AffineEchoes:80},
 p50Phase0:{even:{hits:40,sites:671},odd:{hits:40,sites:619},
  leaveOneChapterOutLogGain:original.source.cv,
  rankAmong256Phases:original.rank,chapterGains:original.source.chapters},
 otherPhaseBest:{phase:original.best.phase,logGain:original.best.cv},
 syntheticSourceClockControl:{even:control.source.h[0],
  odd:control.source.h[1],logGain:control.source.cv,rank:control.rank},
 conclusion:'Source p50 parity does not distinguish six-back red3299 echoes; no original unknown plaintext or source-authenticated decoder recovered.'
},null,2));
