'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
function main(corpus,native){
 const N=29,START=29,mod=x=>(x%N+N)%N,prime=corpus.prime.map(x=>x%29||1),map=new Map(native.runes.map((x,i)=>[x,i]));
 if(native.runes.join("")!==corpus.runes.join("")||prime[9]!==1)throw Error("GP chart mismatch");
 const seq=native.sections.map(s=>({name:s.name,p:[...s.source_text].filter(x=>map.has(x)).map(x=>map.get(x))}));
 const encode=(p,key)=>{let k=key;const c=[];for(const x of p){if(x===0)c.push(0);else{c.push(mod(x+k));k=mod(k*prime[x]);}}return {c,end:k}};
 const edges=(c,k)=>{const p=mod(c-k),out=[];if(c===0)out.push([0,k]);if(p!==0)out.push([p,mod(k*prime[p])]);return out};
 function reach(c,start=Array.from({length:28},(_,i)=>i+1)){
  let d=Array(N).fill(0n);for(const k of start)d[k]=1n;let peak=start.length,dead=-1;
  for(let i=0;i<c.length;i++){const next=Array(N).fill(0n);for(let k=1;k<N;k++)if(d[k])for(const [,nk] of edges(c[i],k))next[nk]+=d[k];d=next;const n=d.filter(x=>x>0n).length;peak=Math.max(peak,n);if(!n){dead=i;break}}
  return {deadAt0:dead,consumed:dead<0?c.length:dead+1,peak,terminalStates:d.map((v,k)=>v?{k,count:v.toString()}:null).filter(Boolean),count:d.reduce((s,x)=>s+x,0n).toString()};
 }
 // Exact trigram LM with fixed hierarchical smoothing.
 function lm(sources){
  const uni=new Float64Array(N).fill(1),bi=new Float64Array(30*N),tri=new Float64Array(30*30*N);
  for(const {p} of sources){let a=START,b=START;for(const c of p){uni[c]++;bi[b*N+c]++;tri[(a*30+b)*N+c]++;a=b;b=c}}
  const sum=uni.reduce((s,x)=>s+x,0);for(let i=0;i<N;i++)uni[i]/=sum;
  for(let b=0;b<30;b++){let tot=0;for(let c=0;c<N;c++){bi[b*N+c]+=10*uni[c];tot+=bi[b*N+c]}for(let c=0;c<N;c++)bi[b*N+c]/=tot}
  for(let a=0;a<30;a++)for(let b=0;b<30;b++){let tot=0;for(let c=0;c<N;c++){tri[(a*30+b)*N+c]+=10*bi[b*N+c];tot+=tri[(a*30+b)*N+c]}for(let c=0;c<N;c++)tri[(a*30+b)*N+c]=Math.log(tri[(a*30+b)*N+c]/tot)}
  return tri;
 }
 const sid=(k,a,b)=>(k*30+a)*30+b;
 const parts=i=>[Math.floor(i/900),Math.floor(i/30)%30,i%30];
 function decode(c,model,initials,context=[START,START]){
  let d=new Map(initials.map(k=>[sid(k,...context),{s:0,start:k}]));
  const back=[];
  for(let i=0;i<c.length;i++){
   const next=new Map(),prev=new Map();
   for(const [id,v] of d){const [k,a,b]=parts(id);for(const [p,nk] of edges(c[i],k)){const j=sid(nk,b,p),score=v.s+model[(a*30+b)*N+p],old=next.get(j);
    if(!old||score>old.s){next.set(j,{s:score,start:v.start});prev.set(j,{id,p})}
   }}
   if(!next.size)return null;
   d=next;back.push(prev);
  }
  const terminal=[...d.entries()].sort((a,b)=>b[1].s-a[1].s||a[0]-b[0]);const [end,value]=terminal[0];const p=new Array(c.length);let id=end;
  for(let i=c.length-1;i>=0;i--){const x=back[i].get(id);p[i]=x.p;id=x.id}
  return {p,score:value.s,start:value.start,end:parts(end)[0],context:parts(end).slice(1),terminalCandidates:terminal.length,terminalMargin:terminal.length>1?value.s-terminal[1][1].s:null};
 }
 const matches=(a,b)=>a.reduce((s,x,i)=>s+(x===b[i]),0);
 const score=(p,m)=>{let s=0,a=START,b=START;for(const c of p){s+=m[(a*30+b)*N+c];a=b;b=c}return s/p.length};
 const initials=Array.from({length:28},(_,i)=>i+1);
 const controls=[];
 for(const [name,k] of [["0_welcome",2],["0_koan_1",17],["0_loss_of_divinity",28],["jpg107-167",11]]){
  const p=seq.find(x=>x.name===name).p,model=lm(seq.filter(x=>x.name!==name)),{c}=encode(p,k),cut=Math.floor(2*p.length/3),fit=decode(c.slice(0,cut),model,initials);
  if(!fit)throw Error("native plant lost");
  const held=decode(c.slice(cut),model,[fit.end],fit.context),truthEnd=encode(p.slice(0,cut),k).end;
  if(!held)throw Error("frozen continuation lost");
  const replay=encode([...fit.p,...held.p],fit.start);
  if(matches(replay.c,c)!==c.length)throw Error("replay failed");
  const fitHit=matches(fit.p,p.slice(0,cut)),heldHit=matches(held.p,p.slice(cut));
  controls.push({name,k,zeroResidueRunes:p.filter(x=>x===9).length,n:p.length,cut,fitInitial:fit.start,fitTerminal:fit.end,truthTerminal:truthEnd,fitHit,heldHit,heldN:p.length-cut,exact:fit.start===k&&fitHit===cut&&heldHit===p.length-cut,meanTrue:score(p,model),meanPred:score([...fit.p,...held.p],model),reach:reach(c)});
 }
 // Structural legality is exact independently of language model or plant score.
 const original=corpus.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
 if(original.length!==3008)throw Error("chapter scope");
 const structural=reach(original);
 const gate=controls.every(x=>x.exact);
 let candidate=null;
 if(gate&&structural.deadAt0<0){
  const model=lm(seq),cut=2005,fit=decode(original.slice(0,cut),model,initials),held=fit&&decode(original.slice(cut),model,[fit.end],fit.context);
  if(fit&&held){const p=[...fit.p,...held.p],replay=encode(p,fit.start);if(matches(replay.c,original)!==original.length)throw Error("original replay failed");candidate={initial:fit.start,stateAtCut:fit.end,cut,fitMean:fit.score/cut,heldMean:held.score/(original.length-cut),text:p.map(x=>corpus.translit[x]).join(""),indices:p}}
 }
 return {model:"C=P+k mod29, k_next=k*(prime(P)%29 || 1) mod29; transparent plaintext F leaves k unchanged, all 28 initial nonzero k",controls,controlGate:gate,original:{n:original.length,visibleF:original.filter(x=>x===0).length,...structural,candidate},scope:"One frozen chapter and recurrence; structural dead end is exact, language gate requires all four controls exact, no alternative residue map."};
}
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
console.log(JSON.stringify(main(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
