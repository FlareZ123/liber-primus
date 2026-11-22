#!/usr/bin/env node
"use strict";

// Bounded nonlinear composition test on the source-derived M7 remainder.
// Hypothesis: the p50 256-cell table supplies a period-256 GP29 key and the
// p32/p33-selected M7 projective map supplies a nonlinear layer. M7's
// projective infinity state is provisionally rendered as a word boundary.
// This is a finite 16-model family, not a phase/key/order search.

const fs = require("node:fs");
const read = p => JSON.parse(fs.readFileSync(p, "utf8"));
const grid = read("resources/liber-primus/lp2-grid-256.json");
const corpus = read("resources/liber-primus/lp2-corpus.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const control = fs.readFileSync("resources/control/gibran_prophet_58585.txt", "utf8");

const pages = [];
let offset = 0;
const all = [];
for (const p of corpus.pages) {
  pages.push({ page: p.page, start: offset, end: offset + p.indices.length });
  all.push(...p.indices);
  offset += p.indices.length;
}
const marks = [];
for (const p of ink.pages) {
  const page = pages.find(x => x.page === p.page);
  for (const e of (p.large_punctuation || [])) {
    if (e[1] === 13) marks.push(page.start + e[0]);
  }
}
marks.sort((a, b) => a - b);
const bounds = [0, ...marks, all.length];
const fragments = bounds.slice(0, -1).map((start, i) => ({
  id: i + 1, start, end: bounds[i + 1], length: bounds[i + 1] - start,
  seq: all.slice(start, bounds[i + 1])
}));
const ranked = fragments.filter(f => f.length > 0).map(f => ({
  ...f, byte: grid.bytes[(f.id - 1) * 8 + 1]
})).sort((a, b) => a.byte - b.byte);

const mod = n => ((n % 29) + 29) % 29;
const inv = n => {
  for (let i = 1; i < 29; i++) if (mod(n * i) === 1) return i;
  throw new Error("no inverse");
};
const m7 = x => {
  if (x === 29) return mod(14 * inv(25));
  const d = mod(25 * x + 28);
  return d === 0 ? 29 : mod((14 * x + 25) * inv(d));
};
const inverseM7 = Array(30);
for (let x = 0; x < 30; x++) inverseM7[m7(x)] = x;
if (new Set(Array.from({length:30}, (_,x)=>m7(x))).size !== 30 ||
    m7(7) !== 29 || m7(29) !== 11) throw new Error("M7 map changed");

const orbits = [];
const seen = new Set();
for (let x = 0; x < 30; x++) {
  if (seen.has(x)) continue;
  const cycle = [];
  let y = x;
  while (!seen.has(y)) {
    seen.add(y);
    cycle.push(y);
    y = m7(y);
  }
  orbits.push(cycle);
}
const poleCycle = orbits.find(c => c.includes(7));
const poleIds = new Set(poleCycle.map(rank => ranked[rank].id));
const rankRest = ranked.filter(f => !poleIds.has(f.id));
const orbitRest = orbits.filter(c => c !== poleCycle)
  .flatMap(c => c.map(rank => ranked[rank]));
const flatten = fs => fs.flatMap(f => f.seq);
const targets = [
  ["rank-order", flatten(rankRest)],
  ["orbit-order", flatten(orbitRest)]
];
const makeKeyOrders = bytes => [
  ["table-order", bytes.slice()],
  ["ranked-row-order",
    Array.from({length:32}, (_,r)=>r)
      .sort((a,b)=>bytes[a*8+1]-bytes[b*8+1])
      .flatMap(r=>bytes.slice(r*8,r*8+8))]
];

const tokens = corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
const controlWords = [];
for (let word of (control.toUpperCase().match(/[A-Z]+/g) || [])) {
  word = word.replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
  const seq = [];
  for (let j=0;j<word.length;) {
    const token=tokens.find(t=>word.startsWith(t.s,j));
    if(!token) throw new Error("unmapped Gibran control text");
    seq.push(token.i);
    j+=token.s.length;
  }
  if(seq.length) controlWords.push(seq);
}
const wordSet = new Set(controlWords.map(w=>w.map(x=>corpus.translit[x]).join("")));
const wordTri = new Map();
const allTrain = [];
for(const w of controlWords){
  allTrain.push(...w);
  for(let i=2;i<w.length;i++){
    const k=w[i-2]*841+w[i-1]*29+w[i];
    wordTri.set(k,(wordTri.get(k)||0)+1);
  }
}
const triDenom = allTrain.length + 0.1*29**3;
function scoreText(seq, includeDetails=false) {
  if (!includeDetails) {
    let score=0, nTri=0, a=-1, b=-1;
    for (const x of seq) {
      if (x===29) { a=-1; b=-1; continue; }
      if (a>=0 && b>=0) {
        const k=a*841+b*29+x;
        score+=Math.log(((wordTri.get(k)||0)+0.1)/triDenom);
        nTri++;
      }
      a=b; b=x;
    }
    return nTri ? score/nTri : -Infinity;
  }
  let score=0, nTri=0, run=[], words=[], freq=Array(29).fill(0), symbols=0;
  const finish=()=>{
    if(!run.length) return;
    words.push(run.slice());
    for(let i=2;i<run.length;i++){
      const k=run[i-2]*841+run[i-1]*29+run[i];
      score+=Math.log(((wordTri.get(k)||0)+0.1)/triDenom);
      nTri++;
    }
    run=[];
  };
  for(const x of seq){
    if(x===29){finish();continue;}
    if(!Number.isInteger(x)||x<0||x>29) throw new Error("invalid decoded state");
    run.push(x);freq[x]++;symbols++;
  }
  finish();
  const lengths=words.map(w=>w.length).sort((a,b)=>a-b);
  const outputWords=words.map(w=>w.map(x=>corpus.translit[x]).join(""));
  const common=outputWords.filter(w=>wordSet.has(w)).length;
  const ioc=freq.reduce((s,n)=>s+n*(n-1),0)/(symbols*(symbols-1));
  const details={
    trigram:nTri?score/nTri:-Infinity,
    trigram_count:nTri,
    ioc,
    space_rate:(seq.length-symbols)/seq.length,
    word_count:words.length,
    mean_word_runes:lengths.reduce((a,b)=>a+b,0)/Math.max(1,lengths.length),
    median_word_runes:lengths.length?lengths[Math.floor(lengths.length/2)]:0,
    common_word_rate:common/Math.max(1,outputWords.length),
    top_words:Object.entries(outputWords.reduce((o,w)=>(o[w]=(o[w]||0)+1,o),{}))
      .sort((a,b)=>b[1]-a[1]).slice(0,12)
  };
  if(!includeDetails) return details.trigram;
  let prefix="";
  for(const x of seq.slice(0,300)) prefix+=x===29?" ":corpus.translit[x];
  return {...details,prefix};
}
function decode(seq,key,sign,direction){
  return seq.map((c,i)=>{
    const x=mod(c+sign*key[i%256]);
    return direction==="forward"?m7(x):inverseM7[x];
  });
}
function roundTripCheck(){
  for(const direction of ["forward","inverse"]) for(const sign of [-1,1])
    for(let k=0;k<29;k++) for(let c=0;c<29;c++){
      const x=mod(c+sign*k);
      const p=direction==="forward"?m7(x):inverseM7[x];
      const back=direction==="forward"?mod(inverseM7[p]-sign*k):mod(m7(p)-sign*k);
      if(back!==c) throw new Error("composition inverse round-trip failed");
    }
}
roundTripCheck();

const keyOrders=makeKeyOrders(grid.bytes);
const models=[];
const additive=[];
const noKey=[];
for(const [targetOrder,target] of targets){
  for(const [keyOrder,keyBytes] of keyOrders){
    const key=keyBytes.map(mod);
    for(const sign of [-1,1]){
      const addOnly=target.map((c,i)=>mod(c+sign*key[i%256]));
      additive.push({targetOrder,keyOrder,sign,...scoreText(addOnly,true)});
      for(const direction of ["forward","inverse"]){
        const decoded=decode(target,key,sign,direction);
        models.push({targetOrder,keyOrder,sign,direction,...scoreText(decoded,true)});
      }
    }
  }
  for(const direction of ["forward","inverse"]){
    noKey.push({targetOrder,direction,...scoreText(target.map(x=>direction==="forward"?m7(x):inverseM7[x]),true)});
  }
}
models.sort((a,b)=>b.trigram-a.trigram);
additive.sort((a,b)=>b.trigram-a.trigram);
noKey.sort((a,b)=>b.trigram-a.trigram);

// Matched null: shuffle the 256 original table bytes, preserve their multiset,
// rebuild both natural key orders, and take the maximum over the same 16 models.
let seed=0x3301;
function rand(){
  seed^=seed<<13; seed^=seed>>>17; seed^=seed<<5;
  return (seed>>>0)/4294967296;
}
function shuffle(a){
  const out=a.slice();
  for(let i=out.length-1;i>0;i--){
    const j=Math.floor(rand()*(i+1));
    [out[i],out[j]]=[out[j],out[i]];
  }
  return out;
}
const NULL_N=512;
const nullMax=[];
for(let n=0;n<NULL_N;n++){
  const orders=makeKeyOrders(shuffle(grid.bytes));
  let best=-Infinity;
  for(const [,target] of targets){
    for(const [,keyBytes] of orders){
      const key=keyBytes.map(mod);
      for(const sign of [-1,1]){
        for(const direction of ["forward","inverse"]){
          const decoded=decode(target,key,sign,direction);
          const s=scoreText(decoded,false);
          if(s>best) best=s;
        }
      }
    }
  }
  nullMax.push(best);
}
const actualMax=models[0].trigram;
const exceed=nullMax.filter(x=>x>=actualMax).length;
const sortedNull=nullMax.slice().sort((a,b)=>a-b);
const percentile=sortedNull.filter(x=>x<actualMax).length/NULL_N;

const tableUnique=new Set(grid.bytes).size;
const modUnique=new Set(grid.bytes.map(mod)).size;
const remainder=targets[0][1].length;
if(marks.length!==31||fragments.length!==32||
   fragments.filter(f=>f.length===0).map(f=>f.id).join(",")!=="9,12"||
   ranked.length!==30||poleCycle.length!==7||
   poleCycle.reduce((n,r)=>n+ranked[r].length,0)!==2896||
   remainder!==10240||grid.bytes.length!==256||tableUnique!==161){
  throw new Error("source structure changed; inspect inputs");
}
if(targets[1][1].length!==10240||remainder/grid.bytes.length!==40)
  throw new Error("40×256 remainder condition changed");

console.log(JSON.stringify({
  hypothesis:"decode = M7^{±1}(ciphertext ± (p50_table mod29)[i mod256]); projective infinity is provisionally rendered as a word boundary",
  structure:{
    dot_marks:marks.length,fragments:fragments.length,ranked_fragments:ranked.length,
    pole_cycle:poleCycle,pole_cycle_runes:2896,remainder_runes:remainder,
    key_bytes:grid.bytes.length,key_period:256,key_repeats:remainder/256,
    table_unique_bytes:tableUnique,table_unique_mod29:modUnique
  },
  exact_inverse_roundtrip:"PASS for every ciphertext state, all 29 key residues, both signs and both M7 directions",
  control:{gibran_words:controlWords.length,gp_runes:allTrain.length,known_word_count:wordSet.size},
  raw_baselines:{
    no_key_M7:noKey,
    additive_only_top_five:additive.slice(0,5)
  },
  actual_model_family_count:models.length,
  actual_top_models:models.slice(0,16),
  matched_key_permutation_null:{
    permutations:NULL_N,seed:"0x3301",max_over_same_16_models:true,
    exceedances:exceed,p_value:(1+exceed)/(NULL_N+1),
    actual_max:actualMax,null_median:sortedNull[Math.floor(NULL_N/2)],
    null_p95:sortedNull[Math.floor(NULL_N*.95)],null_max:sortedNull[NULL_N-1],
    actual_percentile:percentile
  }
},null,2));
