"use strict";
function primesUpTo(n){const composite=new Uint8Array(n+1);const P=[];for(let p=2;p<=n;p++){if(composite[p])continue;P.push(p);if(p*p<=n)for(let k=p*p;k<=n;k+=p)composite[k]=1}return P}
function solve(C,K){let states=new Map([[0,1n]]),counts=[1];let peak=1;for(let i=0;i<C.length;i++){const c=C[i],next=new Map();const add=(j,w)=>next.set(j,(next.get(j)??0n)+w);
 for(const [j,w] of states){if(c===0)add(j,w);if((c+29-K[j])%29!==0)add(j+1,w)}
 states=next;counts.push(states.size);peak=Math.max(peak,states.size);if(!states.size)return {survived:i,peak,paths:"0",terminal:[],counts}}
 return {survived:C.length,peak,paths:[...states.values()].reduce((a,b)=>a+b,0n).toString(),terminal:[...states.keys()],counts};
}
function encrypt(P,K){let j=0;const C=P.map(p=>p===0?0:(p+K[j++])%29);return {C,j}}
function experiment(corpus,native){
 const C=corpus.pages.filter(p=>p.page>=15&&p.page<=22).flatMap(p=>p.indices).slice(9);
 if(C.length!==1894||C.slice(0,11).join(",")!=="20,1,21,9,5,1,17,9,16,0,21")throw Error("source body mismatch");
 const originalGrid=[[3258,3222,3152,3038],[3278,3299,3298,2838],[3288,3294,3296,2472],[4516,1206,708,1820]];
 const fib=[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];
 const path=[[1,1],[1,2],[2,2],[2,1],[2,0],[1,0],[0,0],[0,1],[0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0]];
 const primes=primesUpTo(500000);
 for(let i=0;i<16;i++){const [r,c]=path[i];if(Math.abs(3301-primes[fib[i]])!==originalGrid[r][c])throw Error("grid mismatch")}
 if(primes[89]!==463||primes[462]!==3299||primes[463]!==3301||primes[88]!==461)throw Error("nested prime mismatch");
 // one-based q_i = prime_(prime_i); q_90=3299. No offsets or signs searched.
 const Q=Array.from({length:C.length},(_,j)=>primes[primes[89+j]-1]);if(Q.some(x=>x===undefined))throw Error("sieve too short");
 const K=Q.map(p=>(p-1)%29);
 const result=solve(C,K);
 // Native p57 and p56 authenticated controls; verify their true branch.
 const map=new Map(corpus.runes.map((r,i)=>[r,i]));const toGP=s=>[...s].filter(r=>map.has(r)).map(r=>map.get(r));
 const controls=native.sections.map(s=>{const P=toGP(s.source_text);const {C,j}=encrypt(P,K);const r=solve(C,K);if(r.survived!==C.length||!r.terminal.includes(j))throw Error("native control lost");return {name:s.name,n:P.length,consumes:j,paths:r.paths}});
 const p56=corpus.pages.find(p=>p.page===56).indices;
 const native56=native.sections.find(s=>/end/i.test(s.name));
 const pp=toGP(native56.source_text);
 const key56=primes.slice(0,pp.length).map(p=>(p-1)%29);
 const actual=encrypt(pp,key56);
 if(actual.C.join(",")!==p56.join(","))throw Error("p56 authenticated receiver mismatch: "+native56.name);
 return {source:{startPage:15,startOffset:9,trainRunes:150,holdoutPages:"16–22",total:C.length},firstQ:Q.slice(0,16),firstK:K.slice(0,16),result,controls,p56:{length:p56.length,consumes:actual.j,exact:true}};
}
module.exports={experiment};
if(require.main===module){const fs=require("node:fs"),path=require("node:path");const r=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));console.log(JSON.stringify(experiment(r("resources/liber-primus/lp2-corpus.json"),r("resources/external/relikd-solved-gp29-native-v1.json")),null,2))}
