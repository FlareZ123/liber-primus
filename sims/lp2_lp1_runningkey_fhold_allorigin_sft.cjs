'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp1_wulfic_canonical.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function study(gp,lp1,gold,original=false){
 const assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x+29)%29,ix=new Map(gp.runes.map((r,i)=>[r,i])),extract=s=>[...s].filter(r=>ix.has(r)).map(r=>ix.get(r));
 const ss=gold.sections.slice(0,7).map(s=>extract(s.source_text)),edited=ss.flat(),printed=extract(lp1),corrected=ss.map((s,i)=>i===3?extract(lp1.split('%').slice(4,8).join('')).map(c=>mod(31-c)):s).flat();
 assert(edited.length===2799&&printed.length===2797&&corrected.length===2797,'source lengths');
 const streams=[["edited LP1",edited],["source-corrected LP1",corrected],["printed LP1",printed]].flatMap(([n,S])=>[[n+" index",S],[n+" prime",S.map(x=>gp.prime[x]%29)]]);
 function encrypt(P,K,start,sign){
  let k=start;const C=[];
  for(const p of P){if(p===0)C.push(0);else{C.push(mod(p+sign*K[k]));k=(k+1)%K.length}}
  return{C,end:k}
 }
 // One Boolean per next-key position. Initial all-origin union is exact
 // because the future depends on only the current cursor, not its origin.
 function reach(C,K,sign,start=null){
  const L=K.length,ks=Int8Array.from(K,k=>mod(sign*k));let a=new Uint8Array(L),b=new Uint8Array(L),count=start===null?L:1;
  if(start===null)a.fill(1);else a[start]=1;
  let peak=count;
  for(let i=0;i<C.length;i++){
   b.fill(0);const c=C[i];let n=0;
   for(let k=0;k<L;k++)if(a[k]){
    if(c===0&&!b[k]){b[k]=1;n++}
    if(c!==ks[k]){const t=k+1===L?0:k+1;if(!b[t]){b[t]=1;n++}}
   }
   if(n===0)return{legal:false,firstImpossible:i,peak,endCount:0};
   [a,b]=[b,a];count=n;peak=Math.max(peak,count);
  }
  return{legal:true,firstImpossible:null,peak,endCount:count,endStates:[...a].flatMap((x,i)=>x?[i]:[])}
 }
 function naive(C,K,sign,start){
  let a=new Set(start===null?K.map((_,i)=>i):[start]);
  for(let i=0;i<C.length;i++){
   const b=new Set();
   for(const k of a){
    if(C[i]===0)b.add(k);
    if(mod(C[i]-sign*K[k])!==0)b.add((k+1)%K.length)
   }
   if(b.size===0)return{legal:false,firstImpossible:i,endStates:[]};
   a=b
  }
  return{legal:true,firstImpossible:null,endStates:[...a].sort((a,b)=>a-b)}
 }
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
 const random=rng(0x77de1991),rand=()=>Math.floor(random()*29);
 for(let i=0;i<120;i++){
  const K=Array.from({length:1+i%20},rand),C=Array.from({length:30+i%15},()=>random()<.4?0:rand()),s=i%2?1:-1,start=i%3?null:i%K.length;
  const a=reach(C,K,s,start),b=naive(C,K,s,start);
  assert(a.legal===b.legal&&a.firstImpossible===b.firstImpossible&&JSON.stringify(a.endStates||[])===JSON.stringify(b.endStates),'naive mismatch')
 }
 const hist=[{name:"WELCOME",P:ss[1],C:extract(lp1.split('%').slice(1,3).join('%')),K:[23,10,1,10,9,10,16,26]}, {name:"KOAN",P:ss[5],C:extract(lp1.split('$')[5]),K:[0,10,4,0,1,19,0,18,4,18,9,0,18]}];
 const authentic=hist.map(h=>{
  const e=encrypt(h.P,h.K,0,1);assert(e.C.join()===h.C.join(),h.name+' source replay');
  const r=reach(h.C,h.K,1,0);assert(r.legal&&r.endStates.includes(e.end),h.name+' end cursor');
  return{name:h.name,n:h.C.length,endCount:r.endCount,trueEnd:e.end}
 });
 const plants=[];
 for(let id=0;id<12;id++){
  const [name,K]=streams[id>>1],sign=id%2?1:-1,start=K.length-50-Math.floor(random()*100),at=100+Math.floor(random()*1500),P=corrected.slice(at,at+729),e=encrypt(P,K,start,sign),r=reach(e.C,K,sign);
  assert(P.length===729,'plant length');
  plants.push({name,sign,start,end:e.end,correct:r.legal&&r.endStates.includes(e.end),endCount:r.endCount,plainF:P.filter(x=>x===0).length,cipherF:e.C.filter(x=>x===0).length})
 }
 const gate=plants.every(x=>x.correct);
 let target=null;
 if(gate&&original){
  const C=gp.pages.slice(0,56).flatMap(p=>p.indices),starts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956];assert(C.length===12956,'original count');
  target=[];
  for(const [name,K] of streams)for(const sign of [1,-1]){
   const chapters=[];
   for(let j=0;j<9;j++){
    const S=C.slice(starts[j],starts[j+1]),r=reach(S,K,sign);
    chapters.push({j,n:S.length,legal:r.legal,firstImpossible:r.firstImpossible,endCount:r.endCount})
   }
   target.push({name,sign,chapters})
  }
 }
 return{method:{streams:streams.map(([name,K])=>({name,n:K.length})),clock:"all cyclic origins, genuine plaintext-F transparent, exact union reachability, chapter-private origin"},naiveChecks:120,authentic,plants,gate,target}
}
const d=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(study(JSON.parse(d[0]),d[1],JSON.parse(d[2]),process.argv.includes('--original')),null,2));
