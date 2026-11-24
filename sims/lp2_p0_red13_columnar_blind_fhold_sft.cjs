#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
function experiment(corpus,gold,restarts=1800){
 const N=29,mod=x=>(x+29)%29,split=358;
 const h=corpus.pages[0].indices.slice(0,13),order=[...h.keys()].sort((i,j)=>h[i]-h[j]||i-j);
 const orig=corpus.pages.slice(0,3).flatMap(p=>p.indices).slice(13);
 if(orig.length!==716)throw Error("source length");
 const decodeColumn=C=>{let r=Array(C.length),off=0;for(const j of order)for(let i=j;i<C.length;i+=13)r[i]=C[off++];return r};
 const encodeColumn=P=>{let r=[];for(const j of order)for(let i=j;i<P.length;i+=13)r.push(P[i]);return r};
 const enc=(P,K,start=0)=>{let j=start;return P.map(p=>p===0?0:(p+K[j++%K.length])%N)};
 const seq=gold.sections.map(s=>[...s.source_text].map(ch=>corpus.runes.indexOf(ch)).filter(x=>x>=0));
 const equal=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const render=p=>p.map(x=>corpus.translit[x]).join("");
 const rng=seed=>()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296};
 function train(exclude){
  let u=new Float64Array(N).fill(.25),b=new Float64Array(N*N).fill(.1),t=new Float64Array(N*N*N).fill(.1);
  for(let s=0;s<seq.length;s++)if(s!==exclude){const p=seq[s];for(let i=0;i<p.length;i++){u[p[i]]++;if(i)b[p[i-1]*N+p[i]]++;if(i>1)t[(p[i-2]*N+p[i-1])*N+p[i]]++}}
  const norm=(a,width)=>{for(let i=0;i<a.length;i+=width){let sum=0;for(let j=0;j<width;j++)sum+=a[i+j];for(let j=0;j<width;j++)a[i+j]=Math.log(a[i+j]/sum)}return a};
  return {u:norm(u,N),b:norm(b,N),t:norm(t,N)};
 }
 function pathUni(C,K,M){
  const L=K.length,back=new Int16Array(C.length*L).fill(-1),pp=new Int8Array(C.length*L);
  let a=new Float64Array(L).fill(-Infinity),b=new Float64Array(L);a[0]=0;
  for(let i=0;i<C.length;i++){
   b.fill(-Infinity);const c=C[i];
   for(let j=0;j<L;j++)if(Number.isFinite(a[j])){
    if(c===0&&a[j]+M.u[0]>b[j]){b[j]=a[j]+M.u[0];back[i*L+j]=j;pp[i*L+j]=0}
    const p=mod(c-K[j]),n=(j+1)%L;
    if(p&&a[j]+M.u[p]>b[n]){b[n]=a[j]+M.u[p];back[i*L+n]=j;pp[i*L+n]=p}
   }[a,b]=[b,a]
  }
  let phase=0;for(let j=1;j<L;j++)if(a[j]>a[phase])phase=j;
  const score=a[phase];if(!Number.isFinite(score))return null;
  const path=new Int16Array(C.length),P=new Int8Array(C.length);
  for(let i=C.length-1;i>=0;i--){const s=i*L+phase;P[i]=pp[s];phase=back[s];path[i]=phase}
  return {score,path,P};
 }
 function estimate(C,L,phases,P,M,random,noise){
  let freq=new Int32Array(L*N);
  for(let i=0;i<C.length;i++)if(P[i]!==0)freq[phases[i]*N+C[i]]++;
  let K=[];
  for(let j=0;j<L;j++){let best=-Infinity,k=-1;
   for(let v=0;v<N;v++){if(freq[j*N+v])continue;
    let score=0;for(let c=0;c<N;c++)score+=freq[j*N+c]*M.u[mod(c-v)];
    if(noise)score+=noise*(-Math.log(-Math.log(Math.max(1e-9,random()))));
    if(score>best){best=score;k=v}
   }if(k<0)return null;K.push(k)
  }return K;
 }
 function trigram(C,K,M,start={phase:0,last:29,prev:29}){
  const L=K.length,base=30,encode=(phase,prev,last)=>phase*900+prev*30+last;
  let states=new Map([[encode(start.phase,start.prev,start.last),{score:0,node:null}]]);
  for(const c of C){
   const next=new Map;
   for(const [id,obj] of states){const phase=Math.floor(id/900),prev=Math.floor(id%900/30),last=id%30;
    const add=(p,n)=>{const id2=encode(n,last,p),sc=obj.score+(last===29?M.u[p]:prev===29?M.b[last*N+p]:M.t[(prev*N+last)*N+p]);
     if(!next.has(id2)||next.get(id2).score<sc)next.set(id2,{score:sc,node:{p,prev:obj.node}})
    };
    if(c===0)add(0,phase);const p=mod(c-K[phase]);if(p)add(p,(phase+1)%L);
   }states=next;if(!states.size)return null;
  }
  let best=null,id=-1;for(const [i,v] of states)if(!best||v.score>best.score){best=v;id=i}
  const P=[];for(let n=best.node;n;n=n.prev)P.push(n.p);P.reverse();
  return {score:best.score,P,end:{phase:Math.floor(id/900),prev:Math.floor(id%900/30),last:id%30}};
 }
 function fit(C,L,M,seed){
  const random=rng(seed),candidates=new Map;let valid=0;
  for(let trial=0;trial<restarts;trial++){
   const phases=new Int16Array(C.length),P=new Int8Array(C.length);let ph=0;
   const prob=[.15,.35,.55,.75,.95][trial%5];
   for(let i=0;i<C.length;i++){phases[i]=ph;const hold=C[i]===0&&random()<prob;P[i]=hold?0:1;if(!hold)ph=(ph+1)%L}
   let K=estimate(C,L,phases,P,M,random,[0,1,2,4][trial%4]);if(!K)continue;
   let d=null;
   for(let sweep=0;sweep<15;sweep++){d=pathUni(C,K,M);if(!d)break;const k=estimate(C,L,d.path,d.P,M,random,0);if(!k||equal(k,K))break;K=k}
   d=pathUni(C,K,M);if(!d)continue;valid++;
   const id=K.join(",");if(!candidates.has(id))candidates.set(id,{K,uni:d.score});
  }
  const pool=[...candidates.values()].sort((a,b)=>b.uni-a.uni).slice(0,128);
  const ranked=pool.map(x=>({...x,d:trigram(C,x.K,M)})).filter(x=>x.d).sort((a,b)=>b.d.score-a.d.score);
  return {valid,distinct:candidates.size,ranked};
 }
 const out={order,split,restarts,results:[]};
 for(const L of [8,13]){
  const native=L===8?3:4,K=L===8?[23,10,1,10,9,10,16,26]:[0,10,4,0,1,19,0,18,4,18,9,0,18];
  for(const name of ["control","original"]){
   const P=name==="control"?seq[native].slice(0,716):null, C0=P?encodeColumn(enc(P,K)):orig,C=decodeColumn(C0),M=train(P?native:-1);
   if(!equal(encodeColumn(C),C0))throw Error("column replay");
   const fit0=fit(C.slice(0,split),L,M,0xc1cad000+L+(P?1:0));
   if(!fit0.ranked.length){out.results.push({L,name,valid:fit0.valid,distinct:fit0.distinct});continue}
   const best=fit0.ranked[0],d=best.d;
   if(!equal(enc(d.P,best.K),C.slice(0,split)))throw Error("prefix replay");
   const tail=trigram(C.slice(split),best.K,M,d.end);
   if(tail&&!equal(encodeColumn(enc(d.P.concat(tail.P),best.K)),C0))throw Error("full replay");
   const full=trigram(C,best.K,M);
   const rankTrue=P?fit0.ranked.findIndex(x=>equal(x.K,K)):null;
   out.results.push({L,name,valid:fit0.valid,distinct:fit0.distinct,pool:fit0.ranked.length,key:render(best.K),keyIndices:best.K,rankTrue,exactKey:P?equal(K,best.K):null,prefixScore:d.score/split,tailScore:tail?tail.score/(C.length-split):null,fullKeyLegal:!!full,runnerGap:fit0.ranked.length>1?d.score-fit0.ranked[1].d.score:null,exactPrefix:P?d.P.filter((x,i)=>x===P[i]).length:null,exactTail:P&&tail?tail.P.filter((x,i)=>x===P[split+i]).length:null,prefix:render(d.P),tail:tail?render(tail.P):null});
  }
 }
 return out;
}
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
console.log(JSON.stringify(experiment(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
