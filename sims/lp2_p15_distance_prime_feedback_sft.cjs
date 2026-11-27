'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const a=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const s=JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8'));
const M=3301,N=40000,sieve=new Uint8Array(N+1),primes=[];
for(let p=2;p<=N;p++)if(!sieve[p]){primes.push(p);if(p*p<=N)for(let i=p*p;i<=N;i+=p)sieve[i]=1}
assert(primes.length>=M);
const mod=(x,m)=>(x%m+m)%m,k=primes.slice(0,M).map(p=>mod(p-1,29));
const next=(j,p)=>mod(Math.abs(M-primes[j])+a.prime[p],M);
/** @param {number[]} plain @param {number} seed */
const enc=(plain,seed)=>{let j=seed;return plain.map(p=>{if(!p)return 0;const c=mod(p+k[j],29);j=next(j,p);return c})};
const runes=new Map(a.runes.map((r,i)=>[r,i]));
const native=s.sections.map(x=>({name:x.name,p:[...x.source_text].filter(r=>runes.has(r)).map(r=>runes.get(r))}));
const train=native.filter(x=>x.name!=='p57_parable'),mono=new Float64Array(29).fill(.5),bi=Array.from({length:29},()=>new Float64Array(29).fill(.5));
for(const n of train)for(let i=0;i<n.p.length;i++){mono[n.p[i]]++;if(i)bi[n.p[i-1]][n.p[i]]++}
const total=mono.reduce((x,y)=>x+y,0);
const log=(p,q)=>q===-1?Math.log(mono[p]/total):Math.log((bi[q][p]+8*mono[p]/total)/(bi[q].reduce((x,y)=>x+y,0)+8));
/** @param {number[]} C */
const exact=C=>{let states=new Uint8Array(M).fill(1),count=M;for(let i=0;i<C.length;i++){const c=C[i],ns=new Uint8Array(M);for(let j=0;j<M;j++)if(states[j]){if(!c)ns[j]=1;const p=mod(c-k[j],29);if(p)ns[next(j,p)]=1}count=ns.reduce((x,y)=>x+y,0);if(!count)return {legalPrefix:i,states:0};states=ns}return {legalPrefix:C.length,states:count}};
/** @param {number[]} C @param {number} fit */
const solve=(C,fit)=>{let states=new Map(Array.from({length:M},(_,j)=>[j*30+29,{j,last:-1,score:0,seed:j,trace:[]}]));
for(let i=0;i<C.length;i++){const c=C[i],ns=new Map();for(const t of states.values()){const add=(p,j)=>{const id=j*30+p,score=t.score+log(p,t.last),old=ns.get(id);if(!old||score>old.score)ns.set(id,{j,last:p,score,seed:t.seed,trace:[...t.trace,p]})};if(c===0)add(0,t.j);const p=mod(c-k[t.j],29);if(p)add(p,next(t.j,p))}states=ns;if(!ns.size)return {complete:false,legalPrefix:i};if(i===fit-1&&fit<C.length){const best=[...states.values()].sort((x,y)=>y.score-x.score)[0];states=new Map([[best.j*30+best.last,best]])}}
const best=[...states.values()].sort((x,y)=>y.score-x.score)[0];return {complete:true,seed:best.seed,score:best.score/C.length,trace:best.trace}};
const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const results=ranges.map(([lo,hi])=>{const C=a.pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices);return {lo,hi,length:C.length,...exact(C)}});
assert.equal(results.reduce((sum,r)=>sum+r.length,0),12956);
assert.deepEqual(results.map(r=>r.legalPrefix),[553,366,275,254,672,536,342,144,227]);
assert(results.every(r=>r.states===0));
const P=native.find(x=>x.name==='p57_parable').p;
const controls=[73,167,987].map(seed=>{const C=enc(P,seed),e=exact(C),v=solve(C,65);return {seed,...e,recoveredSeed:v.seed,correct:v.trace?.filter((p,i)=>p===P[i]).length,holdoutCorrect:v.trace?.slice(65).filter((p,i)=>p===P[i+65]).length,complete:v.complete,replay:v.complete&&enc(v.trace,v.seed).every((c,i)=>c===C[i]),score:v.score}});
assert(controls.every(r=>r.complete&&r.replay&&r.holdoutCorrect===30));
console.log(JSON.stringify({lastPrime:primes[M-1],results,controls},null,2));
