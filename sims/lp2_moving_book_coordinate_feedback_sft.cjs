#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/external/2013-book-of-law-I.txt","resources/external/2013-book-of-law-II.txt","resources/external/2013-book-of-law-III.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
function core(data){
 const corpus=JSON.parse(data[0]),native=JSON.parse(data[1]),N=29;
 const assert=(v,m)=>{if(!v)throw Error(m)},mod=x=>(x%N+N)%N;
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const runeMap=new Map(corpus.runes.map((c,i)=>[c,i]));
 const toGP=t=>{const out=[];for(const m of t.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").matchAll(/[A-Z]+/g)){const w=m[0].replace(/ING/g,"NG").replace(/IO/g,"IA");for(let i=0;i<w.length;){const tok=tokens.find(x=>w.startsWith(x.s,i));assert(tok,"GP token");out.push(tok.i);i+=tok.s.length}}return out};
 const gpNative=t=>Array.from(t,c=>runeMap.get(c)).filter(x=>x!==undefined);
 const verses=data.slice(2,5).flatMap(t=>{const a=[];for(const line of t.split(/\r?\n/)){const m=line.match(/^\s*\d+\.\s*(.*)$/);if(m)a.push(m[1]);else if(a.length)a[a.length-1]+=" "+line}return a.map(toGP)});
 const lp1=native.sections.slice(0,7).flatMap(s=>s.source_text.split(/\r?\n/).map(gpNative).filter(a=>a.length));
 assert(verses.length===220&&lp1.length===95,"carrier unit counts");
 const C=corpus.pages.slice(0,3).flatMap(p=>p.indices).slice(13),fit=corpus.pages[0].indices.length-13;
 assert(C.length===716&&fit===249,"opening physical framing");
 const train=toGP(data[5]),h1=new Float64Array(N),h2=new Float64Array(N*N);
 for(let i=0;i<train.length;i++){h1[train[i]]++;if(i)h2[train[i-1]*N+train[i]]++}
 const uni=Array.from(h1,x=>(x+.5)/(train.length+N*.5)),logUni=uni.map(Math.log),log2=new Float64Array(N*N);
 for(let p=0;p<N;p++){let sum=0;for(let q=0;q<N;q++)sum+=h2[p*N+q];for(let q=0;q<N;q++)log2[p*N+q]=Math.log((h2[p*N+q]+10*uni[q])/(sum+10))}
 const donors=[toGP(data[6]).slice(4200,4200+C.length),toGP(data[7]).slice(6000,6000+C.length)];
 const sources=[{name:"LP1-native-lines",units:lp1},{name:"2013-law-verses",units:verses}];
 /** The historical-style moving unit cursor is a plaintext-dependent update.
  *  The previous coordinate's reduced component is the next additive key. */
 function model(units,mode,sign,hold){
  const n=units.length,offset=[0];for(const u of units)offset.push(offset.at(-1)+u.length);
  const first=units.map(u=>{const a=Array(N).fill(-1);u.forEach((p,i)=>{if(a[p]<0)a[p]=i});return a});
  const next=Array.from({length:n},()=>new Int32Array(N));
  for(let s=0;s<n;s++)for(let p=0;p<N;p++){
   for(let d=0;d<n;d++){const u=(s+d)%n,pos=first[u][p];if(pos<0)continue;
    const k=mode==="character"?pos+1:mode==="verse"?u+1:offset[u]+pos+1;
    next[s][p]=((u+1)%n)*N+mod(k);break;
   }
  }
  function transitions(state,c,callback){
   const s=Math.floor(state/N),k=state%N,p=mod(c-sign*k);
   if(hold&&c===0)callback(0,state);
   if(!hold||p!==0)callback(p,next[s][p]);
  }
  function enc(p,start){let state=start;const out=[];for(const x of p){if(hold&&x===0){out.push(0);continue}out.push(mod(x+sign*(state%N)));state=next[Math.floor(state/N)][x]}return {out,end:state}}
  return {n,mode,sign,hold,transitions,enc};
 }
 /** Sparse exact Viterbi over (source cursor,key,last plaintext).
  *  Initial cursor and key are unconstrained; optional traced rerun starts
  *  at the selected single origin and ends at the selected training state. */
 function decode(m,t,prior=null,wanted=null,trace=false){
  let active=new Map(),peak=0,total=0;const neg=-Infinity;
  for(let i=0;i<t.length;i++){
   const next=new Map(),c=t[i];
   const upd=(p,state,score,start,prev)=>{const id=state*N+p,old=next.get(id);if(!old||score>old.score)next.set(id,{score,start,node:trace?{p,prev}:null})};
   if(i===0){
    if(prior){
     m.transitions(prior.state,c,(p,s)=>upd(p,s,prior.last==null?logUni[p]:log2[prior.last*N+p],prior.state,null));
    }else for(let st=0;st<m.n*N;st++)m.transitions(st,c,(p,s)=>upd(p,s,logUni[p],st,null));
   }else for(const [id,v] of active){
    const st=Math.floor(id/N),last=id%N;
    m.transitions(st,c,(p,s)=>upd(p,s,v.score+log2[last*N+p],v.start,v.node));
   }
   if(!next.size)return {legal:i,peak,total};
   active=next;peak=Math.max(peak,active.size);total+=active.size;
  }
  let id=wanted,v=id===null?null:active.get(id);
  if(id===null)for(const [j,w] of active)if(!v||w.score>v.score){id=j;v=w}
  assert(v,"requested end reachable");
  const result={legal:t.length,score:v.score/t.length,start:v.start,state:Math.floor(id/N),last:id%N,id,peak,total,terminal:active.size};
  if(trace){let node=v.node;const p=[];while(node){p.push(node.p);node=node.prev}p.reverse();assert(p.length===t.length,"trace length");result.p=p;
   const check=m.enc(p,v.start);assert(check.end===result.state&&check.out.every((x,i)=>x===t[i]),"trace replay")}
  return result;
 }
 const match=(a,b)=>a.filter((x,i)=>x===b[i]).length;
 const stats=t=>{const h=Array(N).fill(0);for(const p of t)h[p]++;return {ioc:h.reduce((s,x)=>s+x*(x-1),0)/(t.length*(t.length-1)),repeat:t.slice(1).filter((x,i)=>x===t[i]).length/(t.length-1),maxFreq:Math.max(...h)/t.length}};
 const preview=p=>p.slice(0,80).map(x=>corpus.translit[x]).join(" ");
 function fitTest(m,t,truth=null){
  const a=decode(m,t.slice(0,fit));
  if(a.legal!==fit)return {fitLegal:a.legal,peak:a.peak,total:a.total};
  const ar=decode(m,t.slice(0,fit),{state:a.start,last:null},a.id,true);
  assert(Math.abs(ar.score-a.score)<1e-9,"exact all-origin optimum recovered");
  const b=decode(m,t.slice(fit),{state:a.state,last:a.last},null,true);
  const r={fitLegal:a.legal,fitScore:a.score,origin:[Math.floor(a.start/N),a.start%N],fitState:[Math.floor(a.state/N),a.state%N],fitTerminal:a.terminal,peak:a.peak,total:a.total,fitExcerpt:preview(ar.p),heldLegal:b.legal,heldPeak:b.peak};
  if(truth)r.fitExact=match(ar.p,truth.slice(0,fit));
  if(b.p){r.heldScore=b.score;r.heldStats=stats(b.p);r.heldExcerpt=preview(b.p);r.heldEnd=[Math.floor(b.state/N),b.state%N];if(truth)r.heldExact=match(b.p,truth.slice(fit));const replay=m.enc(ar.p.concat(b.p),a.start);assert(replay.out.every((x,i)=>x===t[i]),"whole frozen replay")}
  return r;
 }
 // Authentic AN END verifies the GP additive sign and transparent-F
 // implementation convention; it is not a positive for this new state law.
 const end=gpNative(native.sections[7].source_text);
 const primes=[];for(let x=2;primes.length<85;x++){let p=true;for(const y of primes){if(y*y>x)break;if(x%y===0){p=false;break}}if(p)primes.push(x)}
 let cur=0;const an=end.map(p=>p===0?0:mod(p+primes[cur++]-1));
 assert(an.length===85&&cur===84&&an.every((x,i)=>x===corpus.pages[56].indices[i]),"authentic AN END replay");
 const result={length:C.length,fit,held:C.length-fit,originalStats:stats(C),models:[]};
 for(const src of sources)for(const mode of ["character","verse","absolute"])for(const sign of [1,-1])for(const hold of [false,true]){
  const m=model(src.units,mode,sign,hold),original=fitTest(m,C),controls=[];
  for(let i=0;i<donors.length;i++){const p=donors[i],start=(i?83:17)%m.n*N+(i?21:13),c=m.enc(p,start).out;
   const r=fitTest(m,c,p);assert(r.fitLegal===fit,"positive fit reachable");
   controls.push({donor:i?"Emerson":"Gibran",plantOrigin:[Math.floor(start/N),start%N],cipherStats:stats(c),...r});
  }
  result.models.push({carrier:src.name,mode,sign,hold,units:m.n,original,controls});
 }
 return result;
}
console.log(JSON.stringify(core(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
