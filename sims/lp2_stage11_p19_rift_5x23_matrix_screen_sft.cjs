"use strict";
/**
 * Source-gated LP2 p19 RIFT 5x23 matrix original-cipher null.
 * The 2014 signed Stage11 prime-width whitespace omits 19, and p19
 * has printed RIFT at zero-based rune152; after removing 37 leading
 * runes the flanks are each 115=5x23 runes. This operation is
 * exploratory and retrospectively motivated, not Cicada-authenticated.
 * Windows Node22 SFT. Read-only; exact source-shaped shuffled controls.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
/** @param {string} p */
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const book=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const page=book.pages[19].indices;
const L=page.slice(37,152),R=page.slice(156);
assert.equal(page.length,271);
assert.deepEqual(page.slice(152,156).map(x=>book.translit[x]),["R","I","F","T"]);
assert.equal(L.length,115); assert.equal(R.length,115);
const GP=book.translit.map((s,v)=>({s,v})).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} raw */
function tokenize(raw){
 const w=raw.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
  .replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
 const out=[];
 for(let i=0;i<w.length;){
  const t=GP.find(x=>w.startsWith(x.s,i));
  if(!t)return [];
  out.push(t.v);i+=t.s.length;
 }
 return out;
}
const native=[...read("resources/control/shakespeare_first300k.txt")
  .matchAll(/[A-Za-z]+/g)].flatMap(m=>tokenize(m[0]));
assert.equal(native.length,217644);
const pair=new Uint32Array(841),tri=new Uint32Array(24389);
for(let i=2;i<native.length;i++){
 pair[native[i-2]*29+native[i-1]]++;
 tri[native[i-2]*841+native[i-1]*29+native[i]]++;
}
const log=new Float64Array(24389);
for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++){
 const k=a*841+b*29+c;
 log[k]=Math.log((tri[k]+.2)/(pair[a*29+b]+5.8));
}
/** @param {number[]} xs */
function score(xs){
 let z=0;
 for(let i=2;i<xs.length;i++)z+=log[xs[i-2]*841+xs[i-1]*29+xs[i]];
 return z/(xs.length-2);
}
/** @param {number[]} a */
function layouts(a){
 assert.equal(a.length,115);const out=[];
 for(const [h,w] of [[5,23],[23,5]])
 for(const t of [false,true])
 for(const rr of [false,true])
 for(const cc of [false,true]){
  const grid=Array.from({length:h},(_,i)=>a.slice(i*w,(i+1)*w));
  const symbols=Array.from({length:115},(_,i)=>{
   const row=t?i%h:Math.floor(i/w),col=t?Math.floor(i/h):i%w;
   return grid[rr?h-1-row:row][cc?w-1-col:col];
  });
  out.push({name:`${h}x${w}${t?"T":""}${rr?"R":""}${cc?"C":""}`,symbols});
 }
 assert.equal(out.length,16);
 return out;
}
const left=layouts(L);
/** @param {Array<{name:string,symbols:number[]}>} right */
function best(right){
 let top={score:-Infinity};
 for(const a of left)for(const b of right)for(const sign of [-1,1]){
  const p=a.symbols.map((x,i)=>(x+sign*b.symbols[i]+29)%29);
  const s=score(p);
  if(s>top.score)top={score:s,a:a.name,b:b.name,sign,p};
 }
 return top;
}
const observed=best(layouts(R));
assert.deepEqual([observed.a,observed.b,observed.sign],
 ["5x23R","5x23TC",-1]);
assert(Math.abs(observed.score+4.08564616191648)<1e-12);
let seed=0x33011937;
/** @returns {number} */
function random(){
 seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
 return(seed>>>0)/4294967296;
}
const shuffledScores=[];
for(let t=0;t<100;t++){
 const a=R.slice();
 for(let i=114;i>0;i--){
  const k=Math.floor(random()*(i+1));
  [a[i],a[k]]=[a[k],a[i]];
 }
 shuffledScores.push(best(layouts(a)).score);
}
const exceed=shuffledScores.filter(x=>x>=observed.score).length;
assert.equal(exceed,54);
const plant=native.slice(2000,2115);
const encrypted=plant.map((x,i)=>(x+R[i])%29);
assert.deepEqual(encrypted.map((c,i)=>(c-R[i]+29)%29),plant);
assert(score(plant)-observed.score>1.9);
console.log(JSON.stringify({
 source:{page:19,length:271,marker:"RIFT",at:152,headDiscarded:37,
   panelLength:115,grid:[5,23]},
 variants:512,
 observed:{score:observed.score,left:observed.a,right:observed.b,
   sign:observed.sign,plaintextStart:observed.p.slice(0,70)
   .map(i=>book.translit[i]).join("")},
 null:{seed:"0x33011937",count:100,exceed,
   addOneP:(1+exceed)/101,mean:shuffledScores.reduce((a,b)=>a+b,0)/100,
   best:Math.max(...shuffledScores)},
 positive:{nativeSymbols:115,roundtrip:true,score:score(plant)},
 conclusion:"Original 5x23 matrix fold is no stronger than rearrangement controls; no plaintext."
},null,2));
