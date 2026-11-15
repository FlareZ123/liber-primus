"use strict";
/**
 * Complete mixed-radix five-rune Bifid candidate for original LP2.
 * GP29 indices occupy cells 0..28 of 5x6; cell29 is spare.
 * Five cell rows (radix5) and five columns (radix6) are concatenated
 * and represented as five radix30 cells. Iterate while cell29 appears.
 * Cycle-walking a bijection on a subset yields a complete bijection.
 * Node.js 22 CommonJS SFT, read-only:
 * node sims/lp2_fivedot_5x6_cyclewalk_bifid_original_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=gp.pages.filter(p=>p.page<=55&&p.indices.length);
assert.equal(pages.length,55);
assert.equal(pages.reduce((s,p)=>s+p.indices.length,0),12956);
/** @param {number} n @param {number} base @param {number} count */
function digits(n,base,count){const d=Array(count);for(let i=count-1;i>=0;i--){d[i]=n%base;n=Math.floor(n/base);}assert.equal(n,0);return d;}
/** @param {number[]} x @param {number} sign */
function permute(x,sign){
 if(sign===1){let r=0,c=0;for(const q of x){r=5*r+Math.floor(q/6);c=6*c+q%6;}return digits(7776*r+c,30,5);}
 let n=0;for(const q of x)n=30*n+q;
 const r=digits(Math.floor(n/7776),5,5),c=digits(n%7776,6,5);
 return r.map((v,i)=>6*v+c[i]);
}
/** @param {number} x @param {string} layout */
const toCell=(x,layout)=>layout==="row"?x:6*(x%5)+Math.floor(x/5);
/** @param {number} x @param {string} layout */
const toRune=(x,layout)=>layout==="row"?x:5*(x%6)+Math.floor(x/6);
/** @param {number[]} data @param {number} sign @param {string} layout */
function transform(data,sign,layout){
 assert.equal(data.length%5,0);
 const out=[];let iterations=0,maximum=0;
 for(let i=0;i<data.length;i+=5){
  let x=data.slice(i,i+5).map(v=>toCell(v,layout)),steps=0;
  do{x=permute(x,sign);steps++;assert(steps<10000);}while(x.includes(29));
  out.push(...x.map(v=>toRune(v,layout)));
  iterations+=steps;maximum=Math.max(maximum,steps);
 }
 return {data:out,iterations,maximum};
}
/** @param {number[]} x */
function ioc(x){const f=new Uint32Array(29);for(const v of x){assert(v>=0&&v<29);f[v]++;}return [...f].reduce((s,n)=>s+n*(n-1),0)/(x.length*(x.length-1));}
/** @param {string} raw */
function nativeGP(raw){
 const tokens=gp.translit.map((s,i)=>({s,i}))
  .concat([{s:"ING",i:21},{s:"IO",i:27}]).sort((a,b)=>b.s.length-a.s.length);
 const clean=raw.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
  .replace(/[KQ]/g,"C").replace(/Z/g,"S");
 const out=[];
 for(const w of clean.match(/[A-Z]+/g)||[]){
  for(let j=0;j<w.length;){const t=tokens.find(q=>w.startsWith(q.s,j));
   assert(t);out.push(t.i);j+=t.s.length;}
 }return out;
}
assert.deepEqual(nativeGP("FUNCTION"),[0,1,9,5,16,27,9]);
assert.deepEqual(nativeGP("FOLLOWING"),[0,3,20,20,3,7,21]);
for(let i=0;i<30;i++){
 const a=[i,(i+1)%30,(i+5)%30,(i+13)%30,(i+21)%30];
 assert.deepEqual(permute(permute(a,1),-1),a);
 assert.deepEqual(permute(permute(a,-1),1),a);
}
const regions=[
 {id:"p23-26",first:23,last:26,heading:16,full:1021,n:1005,
  expected:[0.034284751541099286,0.03446908881885394,0.034889298527283896,0.034362054270480266]},
 {id:"p40-53",first:40,last:53,heading:8,full:3008,n:3000,
  expected:[0.034449038568411694,0.03441858397243525,0.03447193508947427,0.03450616872290763]}
];
const results=[];
for(const region of regions){
 const full=pages.filter(p=>p.page>=region.first&&p.page<=region.last).flatMap(p=>p.indices);
 assert.equal(full.length,region.full);const ciphertext=full.slice(region.heading);
 assert.equal(ciphertext.length,region.n);
 const variants=[];
 for(const layout of ["row","column"])for(const sign of [-1,1]){
  const reading=transform(ciphertext,sign,layout);
  assert.deepEqual(transform(reading.data,-sign,layout).data,ciphertext);
  const value=ioc(reading.data);
  assert(Math.abs(value-region.expected[variants.length])<1e-12);
  variants.push({layout,sign,ioc:value,iterations:reading.iterations,
    maxCycles:reading.maximum,prefix:reading.data.slice(0,25).map(i=>gp.translit[i]).join(" ")});
 }
 results.push({region:region.id,bodyRunes:region.n,headingRunes:region.heading,
   inputIoC:ioc(ciphertext),variants});
}
const controls=[];
for(const [name,file] of [
 ["Shakespeare","resources/control/shakespeare_first300k.txt"],
 ["Gibran","resources/control/gibran_prophet_58585.txt"],
 ["Emerson","resources/control/emerson_essays_2944.txt"]
]){
 const source=nativeGP(read(file)),sections=[];
 for(const region of regions){
  let count=0,min=Infinity;
  for(let start=0;start+region.n<=source.length;start+=Math.floor(region.n/2)){
   const plant=source.slice(start,start+region.n);
   min=Math.min(min,ioc(plant));count++;
   if(count===1)for(const layout of ["row","column"])for(const sign of [-1,1]){
    const encoded=transform(plant,sign,layout).data;
    assert.deepEqual(transform(encoded,-sign,layout).data,plant);
   }
  }
  assert(count>0&&min>0.05);
  assert(results.find(r=>r.region===region.id).variants.every(v=>v.ioc<min));
  sections.push({region:region.id,windows:count,minimumNativeEnglishIoC:min});
 }
 controls.push({source:name,length:source.length,sections});
}
console.log(JSON.stringify({
 decision:"All four canonical 5x6 cycle-walked five-rune inverses remain near-uniform on original LP2",
 original:results,sourceNativeControls:controls,
 syntheticRecoveredRunes:4*(1005+3000)*3,
 originalReconstructedRunes:4*(1005+3000),unknownPlaintextRecovered:0,
 scope:"Source-fixed five positions, canonical GP29, two board orders, both directions; not arbitrary keyed Bifid."
},null,2));
