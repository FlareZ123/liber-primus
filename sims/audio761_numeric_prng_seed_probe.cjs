"use strict";
/** 2013 Cicada AUDIO/761.MP3 Parable ID3 numeric seed inverse.
 * Explicit bounded source-seed, common 32-bit PRNG and reversible GP model
 * search on all 12,956 ORIGINAL LP2 runes. No external source downloaded.
 * Run node sims/audio761_numeric_prng_seed_probe.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const co=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=co.pages.filter(p=>p.status==="unsolved"&&p.indices.length).map(p=>p.indices);
const N=pages.flat().length;
assert.equal(pages.length,55);assert.equal(N,12956);
const seeds=[1595277641,1259,1031,1229,761,167,3301,1033];
assert.equal(seeds[1]*seeds[2]*seeds[3],seeds[0]);
const kinds=["xorshift","lcgA","lcgB","lehmer","lcgLow","mt"];
const modes=["direct29","delta29","field28","rankCyclic","rankSorted"];
const clocks=["book","page"], signs=[-1,1];
const mod=(x,n)=>(x%n+n)%n;
function src(){
 const ref=read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split(/\r?\n/).filter(z=>!z.trim().startsWith("#")&&!z.trim().startsWith("[")&&!/^[0-9a-f]{25,}$/i.test(z.trim()))
  .join(" ").match(/[A-Za-z]+/g)||[];
 const tokens=new Map(co.translit.map((v,i)=>[v,i]));
 const words=ref.map(raw=>{
  const s=raw.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
  const o=[];for(let i=0;i<s.length;){const p=tokens.get(s.slice(i,i+2));if(p!==undefined){o.push(p);i+=2}else{const v=tokens.get(s[i]);assert.notEqual(v,undefined);o.push(v);i++}}return o;
 });
 const arr=words.flat(),freq=Array(29).fill(0);arr.forEach(v=>freq[v]++);
 const lp=freq.map(x=>Math.log((x+.5)/(arr.length+14.5)));
 assert.equal(words.length,796);assert.equal(arr.length,3248);
 return {words,freq,lp,score:arr.reduce((s,v)=>s+lp[v],0)/arr.length};
}
/** @param {string} kind @param {number} seed */
function generator(kind,seed){
 let x=seed>>>0,mt=Array(624).fill(0),pos=624;
 if(kind==="mt"){mt[0]=x;for(let i=1;i<624;i++){const p=mt[i-1];mt[i]=(Math.imul(1812433253,p^(p>>>30))+i)>>>0}}
 return ()=>{
  if(kind==="xorshift"){x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}
  if(kind==="lcgA"){x=(Math.imul(x,1664525)+1013904223)>>>0;return x}
  if(kind==="lcgB"){x=(Math.imul(x,1103515245)+12345)>>>0;return(x>>>16)&32767}
  if(kind==="lehmer"){x=(x*48271)%2147483647;return x}
  if(kind==="lcgLow"){x=(Math.imul(x,1103515245)+12345)>>>0;return x&255}
  if(kind==="mt"){
   if(pos===624){for(let i=0;i<624;i++){const y=(mt[i]&0x80000000)|(mt[(i+1)%624]&0x7fffffff);mt[i]=mt[(i+397)%624]^(y>>>1)^((y&1)?0x9908b0df:0)}pos=0}
   let y=mt[pos++];y^=y>>>11;y^=(y<<7)&0x9d2c5680;y^=(y<<15)&0xefc60000;y^=y>>>18;return y>>>0;
  }
  throw Error("Unknown PRNG");
 }
}
let x=1;const powers=[],lg=new Map();
for(let i=0;i<28;i++){powers.push(x);lg.set(x,i);x=x*15%29}
assert.equal(x,1);assert.equal(lg.size,28);
function pad(kind,seed,clock){
 let draw=generator(kind,seed);
 return pages.map(p=>{if(clock==="page")draw=generator(kind,seed);return p.map(()=>draw())});
}
function inverse(book,key,mode,sign){
 return book.map((page,j)=>page.map((v,i)=>{
  const k=key[j][i],prev=page[i-1];
  if(mode==="direct29")return mod(v+sign*(k%29),29);
  if(mode==="delta29")return mod(v-(i?prev:0)+sign*(k%29),29);
  if(i===0||v===prev)return 28;
  const rank=mode==="field28"?lg.get(mod(v-prev,29)):mode==="rankCyclic"?mod(v-prev,29)-1:v-Number(v>prev);
  return mod(rank+sign*(k%28),28);
 }));
}
function score(book,source){
 let total=0,n=0,E=0,heldout=0,heldn=0;
 for(const page of book)for(const v of page){
  const log=source.lp[v];total+=log;E+=Number(v===18);
  if(n>=Math.floor(N/2)){heldout+=log;heldn++}n++;
 }
 assert.equal(n,N);
 return {E,score:total/N,heldoutScore:heldout/heldn};
}
function control(source){
 let z=0x7613301>>>0;const next=()=>{z^=z<<13;z^=z>>>17;z^=z<<5;return z>>>0};
 const pools=new Map();
 for(const w of source.words){if(!pools.has(w.length))pools.set(w.length,[]);pools.get(w.length).push(w)}
 const lens=require("./lp2_word_pages.cjs").parseSharedCorpus().words.map(w=>w.length);
 const plain=lens.flatMap(n=>{const pool=pools.get(n);assert.ok(pool);return pool[next()%pool.length]});
 assert.equal(plain.length,N);
 const p=pad("mt",1595277641,"book"),synthetic=[];
 let offset=0;
 for(let j=0;j<pages.length;j++){
  const length=pages[j].length,local=plain.slice(offset,offset+length),out=[local[0]];
  for(let i=1;i<length;i++){
   const v=local[i],k=p[j][i]%28;
   out.push(v===28?out[i-1]:mod(out[i-1]+powers[mod(v+k,28)],29));
  }
  synthetic.push(out);offset+=length;
 }
 const back=inverse(synthetic,p,"field28",-1);
 let recovered=0,base=0;
 for(let j=0;j<pages.length;j++){
  for(let i=1;i<pages[j].length;i++){
   assert.equal(back[j][i],plain[base+i]);
   recovered++;
  }
  base+=pages[j].length;
 }
 assert.equal(recovered,12901);
 return {synthetic,back,recovered};
}
function main(){
 const source=src(),all=[];
 for(const seed of seeds)for(const kind of kinds)for(const clock of clocks){
  const key=pad(kind,seed,clock);
  for(const mode of modes)for(const sign of signs)all.push({seed,kind,clock,mode,sign,...score(inverse(pages,key,mode,sign),source)});
 }
 assert.equal(all.length,960);
 all.sort((a,b)=>b.score-a.score);
 assert.equal(all[0].seed,761);assert.equal(all[0].kind,"lcgA");assert.equal(all[0].mode,"rankCyclic");
 assert.ok(Math.abs(all[0].score+4.229309191095873)<1e-10);
 const controlResult=control(source);
 return {historicalKey:"Parable 1,595,277,641 in Cicada 2013 761.MP3 metadata",
  factorization:[1259,1031,1229],tested:all.length,
  seeds,algorithms:kinds,clocks,models:modes,signs,
  solvedSource:{runes:3248,selfScore:source.score,ERate:source.freq[18]/3248},
  originalTopTen:all.slice(0,10),
  originalBestByMode:modes.map(mode=>all.find(x=>x.mode===mode)),
  positive:{recoveredAll12901Transitions:true,decodedScore:score(controlResult.back,source)},
  status:"No authentic unknown LP2 plaintext; bounded raw seeded-integer 32-bit PRNG families only."};
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={main,generator,inverse,pad,score,src};
