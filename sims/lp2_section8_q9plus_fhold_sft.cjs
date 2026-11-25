"use strict";
const fs=require("node:fs"),path=require("node:path"),{spawnSync}=require("node:child_process");
const assert=require("node:assert/strict");
const root=path.join(__dirname,"..");
const gp=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const native=JSON.parse(fs.readFileSync(path.join(root,"resources/external/relikd-solved-gp29-native-v1.json"),"utf8"));
const C=gp.pages.filter(p=>p.page>=40&&p.page<=55).flatMap(p=>p.indices);
let hash=14695981039346656037n;for(const c of C)hash=BigInt.asUintN(64,(hash^BigInt(c))*1099511628211n);
assert.equal(C.length,3316);assert.equal(hash.toString(16),"be6c056ed7b1bd0a");
const exe=process.argv[2];if(!exe)throw Error("Usage: node sims/lp2_section8_q9plus_fhold_sft.cjs path-to-compiled-cpp-executable");
const mod=x=>(x+29)%29;
function call(c,q,lo=0,hi=28,key=null){
 const args=[String(q),"180",String(lo),String(hi)];if(key)args.push(key.map(k=>k.toString(29)).join(""));
 const run=spawnSync(exe,args,{input:c.map(x=>x.toString(29)).join(""),encoding:"utf8",timeout:200000});
 if(run.error||run.status!==0)throw Error(String(run.error||run.stderr));
 const v=Object.fromEntries(run.stdout.trim().split(/\s+/).map(x=>x.split("=")));
 for(const k of ["q","complete","leaves","nodes","tests","E","any","target","elapsed"])v[k]=Number(v[k]);
 for(const k of ["keyE","keyAny"])v[k]=v[k].split(",").filter(Boolean).map(Number);
 assert.equal(v.complete,1);return v;
}
function encode(p,K){let s=0;return p.map(x=>x?mod(x+K[s++%K.length]):0);}
function witness(c,K,target){
 const q=K.length;let a=Array(q).fill(-1);a[0]=0;const trace=[];
 for(const x of c){const b=Array(q).fill(-1),prev=Array(q),p=Array(q);
  const set=(s,t,y)=>{const v=a[s]+Number(y===target);if(v>b[t]){b[t]=v;prev[t]=s;p[t]=y}};
  for(let s=0;s<q;s++)if(a[s]>=0){if(x===0)set(s,s,0);const y=mod(x-K[s]);if(y)set(s,(s+1)%q,y);}
  a=b;trace.push({prev,p});
 }
 const count=Math.max(...a);if(count<0)return null;let s=a.indexOf(count);const P=[];
 for(let i=c.length-1;i>=0;i--){P.push(trace[i].p[s]);s=trace[i].prev[s];}P.reverse();
 assert.deepEqual(encode(P,K),c);assert.equal(P.filter(x=>x===target).length,count);return {count,holds:P.filter(x=>x===0).length,P};
}
const result=[];
for(const q of [9,10,11,12]){
 const parts=(q===12?[[0,6],[7,13],[14,20],[21,28]]:[[0,28]]).map(([lo,hi])=>call(C,q,lo,hi));
 const bestE=parts.reduce((a,b)=>a.E>=b.E?a:b),bestAny=parts.reduce((a,b)=>a.any>=b.any?a:b);
 const E=witness(C,bestE.keyE,18),any=witness(C,bestAny.keyAny,bestAny.target);
 assert.equal(E.count,bestE.E);assert.equal(any.count,bestAny.any);
 result.push({q,leaves:parts.reduce((s,p)=>s+p.leaves,0),bestE:bestE.E,bestAny:bestAny.any,parts,E,any});
}
assert.deepEqual(result.map(x=>[x.leaves,x.bestE,x.bestAny]),[[5,133,141],[31,155,155],[50,137,151],[244,150,153]]);
const ix=new Map(gp.runes.map((c,i)=>[c,i]));const gold=["p56_an_end","p57_parable"].flatMap(name=>[...native.sections.find(s=>s.name===name).source_text].filter(c=>ix.has(c)).map(c=>ix.get(c)));
assert.equal(gold.length,180);const plant=Array.from({length:3316},(_,i)=>gold[i%gold.length]);
const keys=[[27,0,10,14,17,7,1,16,12],[5,21,15,24,3,9,19,14,26,24],[1,27,19,28,27,20,24,9,27,20,27],[23,1,0,19,9,23,20,18,5,19,2,7]];
const controls=keys.map(k=>{const ct=encode(plant,k),v=call(ct,k.length,0,28,k);assert.equal(v.leaves,1);assert.equal(v.E,witness(ct,k,18).count);assert.equal(v.any,Math.max(...Array.from({length:28},(_,j)=>witness(ct,k,j+1).count)));assert.equal(v.E,573);return v;});
console.log(JSON.stringify({source:"pp40-55",hash:hash.toString(16),benchmark:Math.ceil(C.length*349/2797),result,controls},null,2));
