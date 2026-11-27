"use strict";
/** Exact GF29 scalar public-state capacity; node sims/lp2_bilinear_cipherstate_anyalphabet_sft.cjs. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {encodeSourceNativeGP}=require("./lp2_native_gp_source_orthography_sft.cjs");
const read=f=>fs.readFileSync(path.join(__dirname,"..",f),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const seq=gp.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
assert.equal(seq.length,3008);
const mod=x=>((x%29)+29)%29;
const maps={index:gp.prime.map((_,i)=>i),prime:gp.prime.map(mod)};
/** @param {number[]} seq @param {Uint8Array} T @param {number} s */
function cap(seq,T,s){
 const h=new Uint16Array(841);
 for(const c of seq){const v=s*29+c;h[v]++;s=T[v]}
 let one=0,two=0,distinct=0;
 for(let i=0;i<841;i+=29){
  let m=0,n=0,d=0;
  for(let j=i;j<i+29;j++){const v=h[j];if(v)d++;if(v>=m){n=m;m=v}else if(v>n)n=v}
  one+=m;two+=m+n;distinct=Math.max(distinct,d);
 }
 return [one,two,distinct];
}
function enumerate(map,product){
 let best=[0,0],args=[null,null],minDistinct=29,cases=0;
 function record(T,s,params){
  const v=cap(seq,T,s);cases++;minDistinct=Math.min(minDistinct,v[2]);
  for(let z=0;z<2;z++)if(v[z]>best[z]){best[z]=v[z];args[z]=params}
 }
 if(product){
  for(let b=1;b<29;b++)for(let a=0;a<29;a++)for(const e of [0,1]){
   const T=Uint8Array.from({length:841},(_,i)=>mod((a+b*map[i%29])*Math.floor(i/29)+e));
   for(let s=0;s<(e?29:2);s++)record(T,s,[a,b,e,s]);
  }
 }else{
  for(let a=0;a<29;a++)for(let k=0;k<29;k++){
   const e=a===1?k:0,s=a===1?0:k;
   const T=Uint8Array.from({length:841},(_,i)=>mod(a*Math.floor(i/29)+map[i%29]+e));
   record(T,s,[a,e,s]);
  }
 }
 return {cases,best,args,minDistinct};
}
const results={};
for(const [name,map] of Object.entries(maps)){
 results[name]={additive:enumerate(map,false),product:enumerate(map,true)};
}
assert.deepEqual(results.index.additive.best,[252,459]);
assert.deepEqual(results.prime.additive.best,[253,461]);
assert.deepEqual(results.index.product.best,[252,460]);
assert.deepEqual(results.prime.product.best,[251,461]);
for(const v of Object.values(results)){assert.equal(v.additive.cases,841);assert.equal(v.product.cases,25172);assert.equal(v.additive.minDistinct,29);assert.equal(v.product.minDistinct,29)}
const autonomous=[1,2,4,7,14,28,29].map(p=>[p,cap(seq,Uint8Array.from({length:841},(_,i)=>(Math.floor(i/29)+1)%p),0)]);
assert.deepEqual(autonomous.map(x=>x[1]),[[125,246,29],[136,269,29],[142,280,29],[165,312,29],[184,355,29],[234,428,29],[238,441,29]]);
const controls=[];
for(const f of ["gibran_prophet_58585.txt","shakespeare_first300k.txt","emerson_essays_2944.txt"]){
 const x=encodeSourceNativeGP(read("resources/control/"+f));
 const counts=[0,0],min=[Infinity,Infinity],off=[-1,-1];
 const is=(c,z)=>+(c===18||(z===1&&c===3));
 for(let i=0;i<x.length;i++)for(let z=0;z<2;z++){
  counts[z]+=is(x[i],z);if(i>=seq.length)counts[z]-=is(x[i-seq.length],z);
  if(i>=seq.length-1&&counts[z]<min[z]){min[z]=counts[z];off[z]=i-seq.length+1}
 }
 controls.push({f,n:x.length,windows:x.length-seq.length+1,min,off});
}
assert.deepEqual(controls.map(x=>x.min),[[304,530],[254,518],[301,530]]);
const plain=encodeSourceNativeGP(read("resources/control/gibran_prophet_58585.txt")).slice(0,3008);
const plants=[];
for(const [a,b,d,e,start] of [[7,0,3,11,17],[12,5,9,8,23],[3,8,4,0,11],[1,0,0,1,22]]){
 const T=Uint8Array.from({length:841},(_,i)=>{const f=maps.prime[i%29];return mod((a+b*f)*Math.floor(i/29)+d*f+e)});
 let s=start;const cipher=plain.map(p=>{const c=mod(11*p+7*s+3);s=T[s*29+c];return c});
 s=start;const recovered=cipher.map(c=>{const p=mod(8*(c-7*s-3));s=T[s*29+c];return p});
 assert.deepEqual(recovered,plain);
 const capacity=cap(cipher,T,start);
 const plainE=plain.filter(x=>x===18).length,plainEO=plain.filter(x=>x===18||x===3).length;
 assert(capacity[0]>=plainE&&capacity[1]>=plainEO);
 plants.push({coeff:[a,b,d,e,start],correct:recovered.length,plainE,plainEO,capacity});
}
console.log(JSON.stringify({runes:seq.length,results,autonomous,controls,plants},null,2));
