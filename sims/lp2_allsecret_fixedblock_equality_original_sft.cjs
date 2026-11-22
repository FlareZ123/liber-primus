"use strict";
/**
 * All-secret original fixed-block equality gate: 3,4,5,7 GP29 runes.
 * Node.js 22 on Windows, CommonJS, read-only.
 * Usage: node sims/lp2_allsecret_fixedblock_equality_original_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=s=>fs.readFileSync(path.join(root,s),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ps=gp.pages.filter(p=>p.page<=55&&p.indices.length);
const sizes=ps.map(p=>p.indices.length),cipher=ps.flatMap(p=>p.indices);
const N=cipher.length,ks=[3,4,5,7];
assert.equal(ps.length,55);
assert.equal(N,12956);
assert.equal(gp.pages.find(p=>p.page===50).indices.length,0);
const {parseLP2Words}=require("./lp2_word_pages.cjs");
const words=parseLP2Words(read("resources/liber-primus/lp2-transcription.txt"));
const lens=words.words.map(w=>w.length);
assert.equal(lens.length,2896);
assert.equal(lens.reduce((s,x)=>s+x,0),N);
assert.equal(words.crossPageWords,32);
const {encodeSourceNativeGP}=require("./lp2_native_gp_source_orthography_sft.cjs");
/**
 * A fixed pagewise bijection on k-rune blocks preserves this count exactly.
 * @param {number[]} data Original or simulated full-length text
 * @param {number} k Block width
 * @param {number} phase Offset in each page or global tape
 * @param {boolean} pagewise Whether to restart at physical page boundaries
 */
function collision(data,k,phase,pagewise){
  assert.equal(data.length,N);
  let pairs=0,blocks=0;
  function section(start,end){
    const m=new Map();
    for(let at=start+phase;at+k<=end;at+=k){
      let v=0;
      for(let j=0;j<k;j++)v=29*v+data[at+j];
      const old=m.get(v)||0;
      pairs+=old;blocks++;m.set(v,old+1);
    }
  }
  if(pagewise){let offset=0;for(const n of sizes){section(offset,offset+n);offset+=n;}assert.equal(offset,N);}
  else section(0,N);
  return {pairs,blocks};
}
const original={};
for(const k of ks) original[k]={
  perPage:Array.from({length:k},(_,p)=>collision(cipher,k,p,true)),
  global:Array.from({length:k},(_,p)=>collision(cipher,k,p,false))
};
assert.deepEqual(original[3].perPage.map(x=>x.pairs),[4,9,4]);
assert.deepEqual(original[4].perPage.map(x=>x.pairs),[0,0,0,0]);
assert.deepEqual(original[5].perPage.map(x=>x.pairs),[0,0,0,0,0]);
assert.deepEqual(original[7].perPage.map(x=>x.pairs),[0,0,0,0,0,0,0]);
assert.deepEqual(original[3].global.map(x=>x.pairs),[412,376,405]);
assert.deepEqual(original[4].global.map(x=>x.pairs),[5,6,10,11]);
assert.deepEqual(original[5].global.map(x=>x.pairs),[1,1,0,0,0]);
assert.deepEqual(original[7].global.map(x=>x.pairs),[0,0,0,0,0,0,0]);
/** A genuine secret pagewise invertible triangular Hill-like k-block plant. */
function plant(plaintext,k,phase){
  const out=plaintext.slice(),back=plaintext.slice();
  const mod=x=>(x%29+29)%29;
  let start=0;
  for(let page=0;page<sizes.length;page++){
    const end=start+sizes[page];
    const a=(7*page+13)%28+1,b=(17*page+3)%29;
    let ai=0;for(let j=1;j<29;j++)if(a*j%29===1)ai=j;
    assert(ai>0);
    for(let at=start+phase;at+k<=end;at+=k){
      for(let j=0;j<k;j++)out[at+j]=mod(a*plaintext[at+j]+b+(j?7*plaintext[at+j-1]:0));
      for(let j=0;j<k;j++)back[at+j]=mod(ai*(out[at+j]-b-(j?7*back[at+j-1]:0)));
    }
    start=end;
  }
  assert.deepEqual(back,plaintext);
  assert.equal(collision(plaintext,k,phase,true).pairs,collision(out,k,phase,true).pairs);
}
function counts(a,includeGlobal){
  const result={};
  for(const k of ks){
    const item={perPage:Array.from({length:k},(_,p)=>collision(a,k,p,true).pairs)};
    if(includeGlobal)item.global=Array.from({length:k},(_,p)=>collision(a,k,p,false).pairs);
    result[k]=item;
  }
  return result;
}
function summarize(samples,kind){
  return Object.fromEntries(ks.map(k=>[k,Array.from({length:k},(_,phase)=>{
    const arr=samples.map(c=>c[k][kind][phase]),observed=original[k][kind][phase].pairs;
    return {min:Math.min(...arr),max:Math.max(...arr),
      mean:Math.round(1000*arr.reduce((a,b)=>a+b,0)/arr.length)/1000,
      atMostOriginal:arr.filter(x=>x<=observed).length,total:arr.length};
  })]));
}
const sources=[
  ["Gibran","resources/control/gibran_prophet_58585.txt",8],
  ["Shakespeare","resources/control/shakespeare_first300k.txt",32],
  ["Emerson","resources/control/emerson_essays_2944.txt",48]
];
const controls=[];
let plants=0;
for(const [name,file,expected] of sources){
  const raw=read(file),native=encodeSourceNativeGP(raw),samples=[];
  for(let i=0;i+N<=native.length;i+=Math.floor(N/2)){
    const window=native.slice(i,i+N);
    samples.push(counts(window,true));
    if(i===0)for(const k of ks)for(let p=0;p<k;p++){plant(window,k,p);plants++;}
  }
  assert.equal(samples.length,expected);
  controls.push({name,raw,samples,contiguous:{
    perPage:summarize(samples,"perPage"),global:summarize(samples,"global")
  }});
}
assert.equal(plants,57);
assert(controls.every(c=>[3,4,5].every(k=>c.contiguous.perPage[k].every(s=>s.atMostOriginal===0))));
assert(controls.every(c=>ks.every(k=>c.contiguous.global[k].every(s=>s.atMostOriginal===0))));
let seed=0x33012026;
function random(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
const trials=96;
const matched=[];
for(const c of controls){
  const pools=Array.from({length:30},()=>[]);
  for(const word of c.raw.match(/[A-Za-z]+/g)||[]){
    const vals=encodeSourceNativeGP(word);
    pools[vals.length].push(vals);
  }
  assert(lens.every(n=>pools[n].length>0));
  const samples=[];
  for(let t=0;t<trials;t++){
    const sample=[];
    for(const n of lens){const bucket=pools[n];sample.push(...bucket[random()%bucket.length]);}
    assert.equal(sample.length,N);
    samples.push(counts(sample,false));
  }
  matched.push({name:c.name,trials,perPage:summarize(samples,"perPage")});
}
assert(matched.every(c=>[3,4].every(k=>c.perPage[k].every(s=>s.atMostOriginal===0))));
assert(matched.some(c=>c.perPage[5].some(s=>s.atMostOriginal>0)));
assert(matched.every(c=>c.perPage[7].some(s=>s.atMostOriginal>0)));
process.stdout.write(JSON.stringify({
  originalPages:ps.length,originalRunes:N,wholeWords:lens.length,crossPageWords:words.crossPageWords,
  original,sourceContinuousWindows:controls.map(c=>({name:c.name,n:c.samples.length,...c.contiguous})),
  lengthMatchedControls:{seed:"0x33012026",trialsPerSource:trials,
    mechanism:"Each fixed original word-length slot sampled with replacement from that corpus's actual native GP words of matching rune length",
    results:matched},pageSpecificSecretInvertiblePlants:plants,
  decision:"Excludes static page-key k=3 and k=4 transformations for source-native English register as calibrated; k=5 evidence weaker under source-shape controls; k=7 unresolved. No unknown plaintext."
},null,2)+"\n");
