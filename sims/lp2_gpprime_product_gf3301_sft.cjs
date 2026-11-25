"use strict";
const fs=require("node:fs"),path=require("node:path");
function experiment(corpus,native,trialCount=100){
 const assert=(v,m)=>{if(!v)throw Error(m)};
 const N=3301,A=29,g=corpus.prime,mod=x=>(x%29+29)%29,ix=new Map(corpus.runes.map((x,i)=>[x,i]));
 assert(Array.from({length:Math.floor(Math.sqrt(N))-1},(_,i)=>i+2).every(x=>N%x!==0),"field not prime");
 assert(g.length===29&&g[0]===2&&g[24]===97&&g[28]===109,"chart");
 const sections=native.sections.map(s=>({name:s.name,p:[...s.source_text].filter(c=>/[\u16a0-\u16ff]/u.test(c)).map(c=>{assert(ix.has(c),"unexpected rune");return ix.get(c)})}));
 const next=Array.from({length:A},()=>new Uint16Array(N)),out=Array.from({length:A},()=>new Uint8Array(N));
 for(let c=0;c<A;c++)for(let s=1;s<N;s++){const p=mod(c-s);out[c][s]=p;next[c][s]=s*g[p]%N;assert(next[c][s]>0,"zero state")}
 const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 function encode(p,s){return Array.from(p,x=>{const c=mod(x+s);s=s*g[x]%N;return c})}
 function decode(c,s){const p=new Uint8Array(c.length),states=new Uint16Array(c.length+1);states[0]=s;for(let i=0;i<c.length;i++){p[i]=out[c[i]][s];s=next[c[i]][s];states[i+1]=s}return {p,states}}
 function model(ds){
  const n1=new Uint32Array(A),n2=new Uint32Array(A*A),n3=new Uint32Array(A*A*A),t1=new Uint32Array(A),t2=new Uint32Array(A*A);let n=0;
  for(const {p} of ds)for(let i=0;i<p.length;i++){const x=p[i];n1[x]++;n++;if(i){const a=p[i-1];n2[a*A+x]++;t1[a]++}if(i>1){const ab=p[i-2]*A+p[i-1];n3[ab*A+x]++;t2[ab]++}}
  const uni=new Float64Array(A),bi=new Float64Array(A*A),tri=new Float64Array(A*A*A);
  for(let x=0;x<A;x++)uni[x]=Math.log((n1[x]+1)/(n+A));
  for(let a=0;a<A;a++)for(let x=0;x<A;x++)bi[a*A+x]=Math.log((n2[a*A+x]+10*Math.exp(uni[x]))/(t1[a]+10));
  for(let a=0;a<A;a++)for(let b=0;b<A;b++)for(let x=0;x<A;x++)tri[(a*A+b)*A+x]=Math.log((n3[(a*A+b)*A+x]+10*Math.exp(bi[b*A+x]))/(t2[a*A+b]+10));
  const score=(p,lo,hi)=>{let sum=0;for(let i=lo;i<hi;i++)sum+=i===0?uni[p[i]]:i===1?bi[p[i-1]*A+p[i]]:tri[(p[i-2]*A+p[i-1])*A+p[i]];return sum/(hi-lo)};
  return {uni,bi,tri,score};
 }
 const initial=Uint16Array.from({length:N-1},(_,i)=>i+1);
 function layers(c){
  const L=[initial];for(const x of c){const seen=new Uint8Array(N),q=[];for(const s of L.at(-1)){const t=next[x][s];if(!seen[t]){seen[t]=1;q.push(t)}}L.push(Uint16Array.from(q))}return L;
 }
 // Exact all-IV prefix likelihood via reachable-state backward DP. Score the
 // trigram at i+2 using state at i; past context never crosses unmodelled joins.
 function fitAll(c,M,fit){
  const L=layers(c.slice(0,fit));let tail=new Float64Array(N),buf=new Float64Array(N);
  for(let i=fit-3;i>=0;i--){const a=c[i],b=c[i+1],d=c[i+2];for(const s of L[i]){const x=out[a][s],s1=next[a][s],y=out[b][s1],s2=next[b][s1],z=out[d][s2];buf[s]=M.tri[(x*A+y)*A+z]+tail[s1]}[buf,tail]=[tail,buf]}
  const scores=new Float64Array(N);let winner=1,best=-Infinity;
  for(const s of initial){const x=out[c[0]][s],s1=next[c[0]][s],y=out[c[1]][s1];const v=(M.uni[x]+M.bi[x*A+y]+tail[s])/fit;scores[s]=v;if(v>best+1e-12){best=v;winner=s}}
  return {winner,best,scores,trainingTies:initial.filter(s=>Math.abs(scores[s]-best)<1e-12).length,fitStates:L.at(-1).length};
 }
 function summarize(c,M,fit,full=false){
  const f=fitAll(c,M,fit),d=decode(c,f.winner);
  assert(eq(encode(d.p,f.winner),c),"selected replay");
  assert(Math.abs(M.score(d.p,0,fit)-f.best)<1e-10,"DP scorer");
  const {p,states}=d,holdScore=M.score(p,fit,p.length);
  const q={winner:f.winner,trainingTies:f.trainingTies,fitStates:f.fitStates,fitScore:f.best,holdScore,endState:states.at(-1)};
  if(!full)return q;
  const L=layers(c),hist=L.map(x=>x.length),finalMass=new Uint16Array(N),boundaryMass=new Uint16Array(N);
  let bestHold=-Infinity,bestHoldIV=null,minRare=Infinity,minRareHold=Infinity,minRareFit=Infinity,rareFree=0,rareFreeFit=0;
  for(const s of initial){const a=decode(c,s),P=a.p;
   assert(eq(encode(P,s),c),"all original replays");
   assert(Math.abs(M.score(P,0,fit)-f.scores[s])<1e-10,"all original DP validation");
   const h=M.score(P,fit,P.length);if(h>bestHold){bestHold=h;bestHoldIV=s}
   let count=0,countFit=0;for(let i=0;i<P.length;i++)if(P[i]===12||P[i]===22){count++;if(i<fit)countFit++}
   minRare=Math.min(minRare,count);minRareFit=Math.min(minRareFit,countFit);minRareHold=Math.min(minRareHold,count-countFit);rareFree+=Number(count===0);rareFreeFit+=Number(countFit===0);
   finalMass[a.states.at(-1)]++;boundaryMass[a.states[fit]]++;
  }
  const counts=Array(A).fill(0);for(const x of p)counts[x]++;
  return {...q,fullReplayIVs:N-1,distinctStatesAtEnd:hist.at(-1),firstMerge:hist.findIndex(x=>x<N-1),fullCoalescence:hist.indexOf(1),stateCounts:hist,fitStateClasses:Array.from(boundaryMass).filter(Boolean).sort((a,b)=>b-a),endStateClasses:Array.from(finalMass).filter(Boolean).sort((a,b)=>b-a),allIVBestHoldScore:bestHold,allIVBestHoldIV:bestHoldIV,minRare,minRareFit,minRareHold,rareFree,rareFreeFit,counts,ioc:counts.reduce((s,x)=>s+x*(x-1),0)/(p.length*(p.length-1)),plaintextRunes:Array.from(p,x=>corpus.runes[x]).join(""),preview:Array.from(p.slice(0,100),x=>corpus.translit[x]).join(" "),holdPreview:Array.from(p.slice(fit,fit+100),x=>corpus.translit[x]).join(" ")};
 }
 const c=corpus.pages.slice(33,40).flatMap(p=>p.indices),fit=corpus.pages.slice(33,37).reduce((s,p)=>s+p.indices.length,0);
 assert(c.length===1680&&fit===984,"physical chapter boundaries");
 const M=model(sections),original=summarize(c,M,fit,true);
 let z=0x2784cafe;function rand(){z^=z<<13;z^=z>>>17;z^=z<<5;return z>>>0}
 function draw(n){const lim=Math.floor(4294967296/n)*n;let v;do{v=rand()}while(v>=lim);return v%n}
 const plants=[];
 for(const section of sections){const m=model(sections.filter(s=>s!==section)),f=Math.floor(section.p.length*fit/c.length);
  for(let k=0;k<3;k++){const iv=1+draw(N-1),ct=encode(section.p,iv),s=summarize(ct,m,f),d=decode(ct,s.winner);
   assert(eq(decode(ct,iv).p,section.p),"native exact known-IV plant");
   plants.push({name:section.name,iv,n:ct.length,fit:f,...s,correctHold:d.p.slice(f).filter((x,i)=>x===section.p[f+i]).length,holdLength:ct.length-f,trueHoldScore:m.score(section.p,f,ct.length),correctFit:d.p.slice(0,f).filter((x,i)=>x===section.p[i]).length});
  }
 }
 const nulls=[];for(const type of ["independent-pad","permuted-ciphertext"])for(let k=0;k<trialCount;k++){
  const ct=type==="independent-pad"?c.map(()=>draw(A)):c.slice();
  if(type==="permuted-ciphertext")for(let i=ct.length-1;i>0;i--){const j=draw(i+1);[ct[i],ct[j]]=[ct[j],ct[i]]}
  nulls.push({type,...summarize(ct,M,fit)});
 }
 const p56=sections.find(s=>s.name==="p56_an_end").p,p57=sections.find(s=>s.name==="p57_parable").p,pr=[];for(let x=2;pr.length<p56.length;x++){if(!pr.some(p=>p*p<=x&&x%p===0))pr.push(x)}
 let ord=0;const p56enc=p56.map(x=>x===0?0:mod(x+pr[ord++]-1));
 assert(eq(p56enc,corpus.pages[56].indices)&&eq(p57,corpus.pages[57].indices),"authentic controls");
 const nativeStats=sections.map(s=>({name:s.name,length:s.p.length,rare:s.p.filter(x=>x===12||x===22).length}));
 const changes=original.stateCounts.map((n,i)=>[i,n]).filter(([i,n])=>[0,1,2,3,5,10,20,50,100,200,400,fit,1200,c.length].includes(i));
 const summary={fit,holdout:c.length-fit,original:{...original,stateCounts:undefined,plaintextRunes:undefined,fitStateClasses:original.fitStateClasses.slice(0,15),endStateClasses:original.endStateClasses.slice(0,15),changes},plants:{n:plants.length,correctIV:plants.filter(p=>p.iv===p.winner).length,exactFit:plants.filter(p=>p.correctFit===p.fit).length,exactHeldouts:plants.filter(p=>p.correctHold===p.holdLength).length,correct:plants.reduce((s,x)=>s+x.correctHold,0),total:plants.reduce((s,x)=>s+x.holdLength,0),minHoldScore:Math.min(...plants.map(x=>x.holdScore)),maxHoldScore:Math.max(...plants.map(x=>x.holdScore)),nativeStats},nulls:["independent-pad","permuted-ciphertext"].map(type=>{const a=nulls.filter(x=>x.type===type),h=a.map(x=>x.holdScore).sort((a,b)=>a-b);return {type,n:h.length,min:h[0],median:h[Math.floor(h.length/2)],max:h.at(-1),atLeastOriginal:h.filter(x=>x>=original.holdScore).length}}),nativeReplay:{p56:p56.length,p57:p57.length}};
 return {summary,original,plants,nulls};
}
const root=path.join(__dirname,"..");
const inputs=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(experiment(...inputs.map(p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8")))),null,2));
