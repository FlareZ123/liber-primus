"use strict";
const fs=require("node:fs"),path=require("node:path");
function experiment(gp,native){
 const assert=(v,m)=>{if(!v)throw Error(m)},A=29,maxOrigin=3301,mod=x=>(x%29+29)%29;
 const primes=[];for(let x=2;primes.length<7000;x++)if(!primes.some(p=>p*p<=x&&x%p===0))primes.push(x);
 const shifts=primes.map(p=>(p-1)%A),eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 function mtf(a,inv=false){const list=Array.from({length:A},(_,i)=>i);return a.map(x=>{const j=inv?x:list.indexOf(x);assert(j>=0&&j<A,"MTF rank");const v=list.splice(j,1)[0];list.unshift(v);return inv?v:j})}
 function primeEncode(p,origin){let s=origin;const c=p.map(x=>x===0?0:mod(x+shifts[s++]));return {c,end:s}}
 const encode=(p,s)=>mtf(primeEncode(p,s).c);
 const allOrigins=Array.from({length:maxOrigin+1},(_,i)=>i);
 function reach(c,origins=allOrigins,store=false){
  let m=new Map(origins.map(s=>[s,1n])),L=store?[m]:null,history=[];
  for(let i=0;i<c.length;i++){const x=c[i],n=new Map(),inc=(k,v)=>n.set(k,(n.get(k)||0n)+v);for(const [s,num] of m){if(x===0)inc(s,num);if(x!==shifts[s])inc(s+1,num)}
   m=n;if(store)L.push(m);if(!m.size)return {prefix:i,deadAt:i,states:0,paths:"0",history,L};
   if(i<4||[99,199,231,299,527,c.length-1].includes(i))history.push([i+1,m.size,[...m.values()].reduce((a,b)=>a+b,0n).toString()]);
  }
  return {prefix:c.length,deadAt:null,states:m.size,paths:[...m.values()].reduce((a,b)=>a+b,0n).toString(),history,L};
 }
 function enumerate(c,R,limit=10000){
  assert(R.L,"layer history");assert(BigInt(R.paths)<=BigInt(limit),"enumeration cap");
  const result=[],p=Array(c.length);
  function walk(i,s,end){
   if(i===0){result.push({origin:s,end,p:p.slice()});return}
   const x=c[i-1],prior=R.L[i-1];if(x===0&&prior.has(s)){p[i-1]=0;walk(i-1,s,end)}
   if(prior.has(s-1)&&x!==shifts[s-1]){p[i-1]=mod(x-shifts[s-1]);walk(i-1,s-1,end)}
  }
  for(const s of R.L.at(-1).keys())walk(c.length,s,s);
  assert(BigInt(result.length)===BigInt(R.paths),"exact path count");
  for(const v of result){const e=primeEncode(v.p,v.origin);assert(eq(e.c,c)&&e.end===v.end,"enumeration replay")}
  return result;
 }
 const ix=new Map(gp.runes.map((x,i)=>[x,i])),sections=native.sections.map(s=>({name:s.name,p:[...s.source_text].filter(x=>ix.has(x)).map(x=>ix.get(x))}));
 function model(ds){
  const n1=new Uint32Array(A),n2=new Uint32Array(A*A),n3=new Uint32Array(A*A*A),t1=new Uint32Array(A),t2=new Uint32Array(A*A);let n=0;
  for(const {p} of ds)for(let i=0;i<p.length;i++){const x=p[i];n1[x]++;n++;if(i){const a=p[i-1];n2[a*A+x]++;t1[a]++}if(i>1){const ab=p[i-2]*A+p[i-1];n3[ab*A+x]++;t2[ab]++}}
  const uni=new Float64Array(A),bi=new Float64Array(A*A),tri=new Float64Array(A*A*A);
  for(let x=0;x<A;x++)uni[x]=Math.log((n1[x]+1)/(n+A));
  for(let a=0;a<A;a++)for(let x=0;x<A;x++)bi[a*A+x]=Math.log((n2[a*A+x]+10*Math.exp(uni[x]))/(t1[a]+10));
  for(let a=0;a<A;a++)for(let b=0;b<A;b++)for(let x=0;x<A;x++)tri[(a*A+b)*A+x]=Math.log((n3[(a*A+b)*A+x]+10*Math.exp(bi[b*A+x]))/(t2[a*A+b]+10));
  const incr=(a,b,x)=>b===29?uni[x]:a===29?bi[b*A+x]:tri[(a*A+b)*A+x];
  const score=(p,lo=0,hi=p.length)=>{let sum=0;for(let i=lo;i<hi;i++)sum+=incr(i>1?p[i-2]:29,i?p[i-1]:29,p[i]);return sum/(hi-lo)};
  return {incr,score};
 }
 // Exact fixed-score DP with the sufficient state (prime cursor, two previous
 // plaintext runes). For suffix calibration only the fitted state survives.
 function bestPath(c,M,start=null){
  const key=(s,a,b)=>s*900+a*30+b;
  let m=new Map();
  for(const s of start?[start.cursor]:allOrigins){const a=start?start.a:29,b=start?start.b:29;m.set(key(s,a,b),{s,a,b,score:0,origin:start?start.origin:s,prev:null})}
  for(const x of c){
   const n=new Map();
   for(const v of m.values()){
    const push=(s,p)=>{const k=key(s,v.b,p),score=v.score+M.incr(v.a,v.b,p),old=n.get(k);if(!old||score>old.score+1e-12||Math.abs(score-old.score)<=1e-12&&v.origin<old.origin)n.set(k,{s,a:v.b,b:p,score,origin:v.origin,prev:v})};
    if(x===0)push(v.s,0);
    if(x!==shifts[v.s])push(v.s+1,mod(x-shifts[v.s]));
   }
   m=n;if(!m.size)return null;
  }
  let best=null;for(const v of m.values())if(!best||v.score>best.score+1e-12||Math.abs(v.score-best.score)<=1e-12&&v.origin<best.origin)best=v;
  const p=[];for(let v=best;v.prev;v=v.prev)p.push(v.b);p.reverse();
  const actualStart=start?start.cursor:best.origin;
  assert(eq(primeEncode(p,actualStart).c,c),"viterbi replay");
  return {origin:best.origin,cursor:best.s,a:best.a,b:best.b,score:best.score/c.length,p};
 }
 const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]],tape=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
 const frame=(rank,label)=>{const c=mtf(rank,true);assert(eq(mtf(c),rank),"original MTF replay");const R=reach(c);return {label,runes:rank.length,zeros:c.filter(x=>x===0).length,...R,L:undefined}};
 const original=ranges.map(([a,b])=>frame(gp.pages.slice(a,b+1).flatMap(p=>p.indices),`p${a}-${b}`));
 const markerAlternatives=[frame(tape.slice(1874,3612),"p8–14 + p15 isolated rubric"),frame(tape.slice(3612,5506),"p15 after rubric–22")];
 assert(original.slice(0,8).every(x=>x.paths==="0")&&original[8].paths==="16","original path gate");
 const terminalRank=tape.slice(12648),terminalC=mtf(terminalRank,true),fit=gp.pages[54].indices.length,M=model(sections);
 const fullReach=reach(terminalC,allOrigins,true),prefixReach=reach(terminalC.slice(0,fit),allOrigins,true);
 const full=enumerate(terminalC,fullReach).map(v=>{
  assert(eq(encode(v.p,v.origin),terminalRank),"full original replay");
  const counts=Array(A).fill(0);for(const x of v.p)counts[x]++;
  return {...v,fitScore:M.score(v.p,0,fit),holdScore:M.score(v.p,fit),rare:counts[12]+counts[22],ioc:counts.reduce((s,x)=>s+x*(x-1),0)/(v.p.length*(v.p.length-1)),runes:v.p.map(x=>gp.runes[x]).join(""),translit:v.p.map(x=>gp.translit[x]).join(" ")};
 });
 const prefix=enumerate(terminalC.slice(0,fit),prefixReach).map(v=>({...v,score:M.score(v.p)})).sort((a,b)=>b.score-a.score||a.origin-b.origin);
 const pBest=prefix[0],suffix=bestPath(terminalC.slice(fit),M,{cursor:pBest.end,a:pBest.p.at(-2),b:pBest.p.at(-1),origin:pBest.origin});
 const best=bestPath(terminalC.slice(0,fit),M);
 assert(Math.abs(best.score-pBest.score)<1e-10,"terminal Viterbi vs enumeration");
 const p56=sections.find(s=>s.name==="p56_an_end").p,p57=sections.find(s=>s.name==="p57_parable").p;
 assert(eq(primeEncode(p56,0).c,gp.pages[56].indices)&&eq(p57,gp.pages[57].indices),"authentic source controls");
 let state=0x2786cafe;function rand(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0}function draw(n){const lim=Math.floor(4294967296/n)*n;let v;do{v=rand()}while(v>=lim);return v%n}
 const origins=[0,23,133,331,761,1033,3299,3301,17];
 const plants=[],negatives=[];
 for(let i=0;i<sections.length;i++){
  const s=sections[i],o=origins[i],rank=encode(s.p,o),inner=mtf(rank,true),f=Math.floor(s.p.length*528/729),m=model(sections.filter(x=>x!==s)),R=reach(inner);
  assert(R.paths!=="0"&&eq(inner,primeEncode(s.p,o).c),"native true path");
  const b=bestPath(inner.slice(0,f),m);assert(b,"native prefix path");
  const h=bestPath(inner.slice(f),m,b);
  const correctFit=b.p.filter((x,j)=>x===s.p[j]).length,holdCorrect=h?h.p.filter((x,j)=>x===s.p[f+j]).length:0;
  if(h)assert(eq(encode([...b.p,...h.p],b.origin),rank),"planted selected replay");
  plants.push({name:s.name,origin:o,n:s.p.length,fit:f,legalPaths:R.paths,selectedOrigin:b.origin,correctFit,holdLength:s.p.length-f,holdCorrect,heldoutLegal:!!h,holdScore:h?h.score:null,trueHoldScore:m.score(s.p,f)});
  for(const [type,bad] of [["raw-prime",primeEncode(s.p,o).c],["independent-pad",s.p.map(()=>draw(A))]]){const badR=reach(mtf(bad,true));negatives.push({name:s.name,type,n:s.p.length,legalPaths:badR.paths,maxPrefix:badR.prefix})}
 }
 return {original,markerAlternatives,terminal:{prefixPaths:prefixReach.paths,prefixStates:prefixReach.states,fullPaths:fullReach.paths,fullStates:fullReach.states,bestPrefix:{origin:pBest.origin,cursor:pBest.end,score:pBest.score},frozenSuffix:suffix?{score:suffix.score,origin:suffix.origin,p:suffix.p,runes:suffix.p.map(x=>gp.runes[x]).join("")}:null,minimumRare:Math.min(...full.map(x=>x.rare)),maxFullHoldScore:Math.max(...full.map(x=>x.holdScore)),allFullCandidates:full},plants,negatives,authenticReplay:{p56:p56.length,p57:p57.length}};
}
const root=path.join(__dirname,"..");
const inputs=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(experiment(...inputs.map(p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8")))),null,2));
