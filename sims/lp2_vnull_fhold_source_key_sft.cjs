"use strict";
const fs=require("node:fs");
const {train,decode,edges,encode,makeRng,words,primes,paths,mod,names}=require("./lp2_vnull_fhold_joint_clock_sft.cjs");
function reach(C,K,supp=1-.664/3.448){
 const R=Array.from({length:C.length+1},()=>new Set());R[0].add(0);let longest=0,peak=1;
 for(let i=0;i<C.length;i++)if(R[i].size){for(const j of R[i])for(const e of edges(C,K,i,j,supp)){R[e.i].add(e.j);longest=Math.max(longest,e.i)}peak=Math.max(peak,R[i].size)}
 return {possible:R[C.length].size>0,longest,peak,terminal:R[C.length].size};
}
function run(raw){
 const c=JSON.parse(raw[0]),seq=raw.slice(1,4).map(t=>words(t).flat()),lp=train(seq.map(a=>a.slice(0,Math.floor(a.length*.7)))),native=JSON.parse(raw[4]),rm=new Map(native.runes.map((r,i)=>[r,i])),donor=native.sections.flatMap(s=>[...s.source_text].filter(r=>rm.has(r)).map(r=>rm.get(r))),rng=makeRng(0x473301);
 const pages=(a,b)=>c.pages.slice(a,b+1).flatMap(p=>p.indices),p0=pages(0,2).slice(13),p15=pages(15,22).slice(20),spiral=[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516],fib=[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987],prime=primes(35000).map(p=>mod(p-1)),cases=[];
 const add=(name,C,k)=>cases.push({name,C,K:Array.from({length:C.length+100},(_,i)=>mod(k(i)))});
 for(const sign of [1,-1]){
  add("p0 printed title "+sign,p0,i=>sign*c.pages[0].indices[i%13]);
  add("p15 literal spiral "+sign,p15,i=>sign*spiral[i%16]);
  for(let j=0;j<16;j++)add("p"+(16+j)+" paired Fibonacci prime "+sign,c.pages[16+j].indices,i=>sign*prime[fib[j]+i]);
  for(let j=0;j<16;j++)add("p16-22 decimated lane "+j+" "+sign,pages(16,22),i=>sign*prime[16*i+j]);
 }
 // The established LP1 keywords, only on the two source-delimited opening units.
 for(const key of ["WELCOME","DIUINITY","FIRFUMFERENFE"]){const k=words(key).flat();for(const [n,C] of [["p0-2 black",p0],["p15-22 black",p15]])for(const sign of [1,-1])add(n+" "+key+" "+sign,C,i=>sign*k[i%k.length])}
 const results=[];
 for(const {name,C,K} of cases){
  const z=reach(C,K);let score=null;if(z.possible){const d=decode(C,K,lp);score={bf:d.bf,ll:d.ll,P:d.P,plain:d.P.map(x=>names[x]).join(""),holds:d.holds,nulls:d.nulls}}
  const P=donor.slice(0,C.length-100),plant=encode(P,K,rng),test=reach(plant.C,K);
  if(!test.possible)throw Error("positive lost "+name);
  results.push({name,n:C.length,...z,score,controlN:plant.C.length});
 }
 return {seed:"0x473301",cases:results,feasible:results.filter(x=>x.possible).length,controls:results.length};
}
if(require.main===module)console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
module.exports={reach,run};
