'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp1_wulfic_canonical.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function study(gp,lp1,gold,original=false){
 const assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x+29)%29;
 const ix=new Map(gp.runes.map((r,i)=>[r,i])),extract=s=>[...s].filter(r=>ix.has(r)).map(r=>ix.get(r));
 const source=gold.sections.slice(0,7).map(s=>({name:s.name,P:extract(s.source_text)}));
 source[3].P=extract(lp1.split('%').slice(4,8).join('')).map(c=>mod(31-c));
 assert(source[3].P.length===778,'corrected LP1 KOAN');
 const P=source.flatMap(s=>s.P);assert(P.length===2797,'source count');
 function encrypt(P,K,sign){let j=0;return P.map(p=>p===0?0:mod(sign*p+K[j++%K.length]))}
 function derive(P,C,q,sign){
  const K=new Array(q).fill(-1);let j=0;
  for(let i=0;i<P.length;i++){
   if(P[i]===0){if(C[i]!==0)return null;continue}
   const a=j++%q,v=mod(C[i]-sign*P[i]);if(K[a]>=0&&K[a]!==v)return null;K[a]=v
  }
  return K;
 }
 function continuation(P,C,s,t,q,sign){
  const K=derive(P.slice(s,s+32),C.slice(t,t+32),q,sign);
  if(!K||K.includes(-1)||s+64>P.length||t+64>C.length)return false;
  return encrypt(P.slice(s,s+64),K,sign).every((v,i)=>v===C[t+i])
 }
 // Invariant: after each position, left is the earliest source index of any
 // suffix consistent with all F constraints and one arbitrary q-key.
 function scan(P,C,q,sign,collect=true){
  const phases=new Int8Array(P.length);let j=0;
  for(let i=0;i<P.length;i++)if(P[i]!==0)phases[i]=j++%q;
  const last=new Int32Array(q),val=new Int8Array(q);
  let max=0,best=null,prefixCount=0;const hits=[];
  for(let d=1-P.length;d<C.length;d++){
   const a=Math.max(0,-d),b=Math.min(P.length,C.length-d);let left=a;
   last.fill(-1);
   for(let i=a;i<b;i++){
    const p=P[i],c=C[i+d];
    if(p===0){if(c!==0)left=i+1}
    else{
     const ph=phases[i],k=mod(c-sign*p);
     if(last[ph]>=left&&val[ph]!==k)left=last[ph]+1;
     last[ph]=i;val[ph]=k;
    }
    const n=i-left+1;
    if(n>max){max=n;best={s:left,t:left+d}}
    if(collect&&n>=32){
     prefixCount++;const s=i-31,t=s+d;
     if(continuation(P,C,s,t,q,sign))hits.push({s,t,key:derive(P.slice(s,s+32),C.slice(t,t+32),q,sign)})
    }
   }
  }
  return{q,sign,max,best,prefixCount,hits}
 }
 function brute(P,C,q,sign){
  let max=0;for(let s=0;s<P.length;s++)for(let t=0;t<C.length;t++)
   for(let n=1;n<=Math.min(P.length-s,C.length-t);n++){
    if(!derive(P.slice(s,s+n),C.slice(t,t+n),q,sign))break;
    if(n>max)max=n;
   }
  return max
 }
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
 const random=rng(0x17a19bcd),rand=()=>Math.floor(random()*29);
 let exhaustive=0;
 for(let id=0;id<50;id++){
  // Deliberately F-rich small controls, for exact diagonal/naive equality.
  const a=Array.from({length:8+id%8},()=>random()<.3?0:rand()),b=Array.from({length:12+id%7},()=>random()<.3?0:rand());
  for(const q of [2,3,8,13])for(const sign of [1,-1]){
   assert(scan(a,b,q,sign,false).max===brute(a,b,q,sign),'diagonal mismatch');exhaustive++;
  }
 }
 const hist=[{name:"WELCOME",P:source[1].P,C:extract(lp1.split('%').slice(1,3).join('%')),K:[23,10,1,10,9,10,16,26]}, {name:"KOAN",P:source[5].P,C:extract(lp1.split('$')[5]),K:[0,10,4,0,1,19,0,18,4,18,9,0,18]}];
 const authentic=hist.map(h=>{
  assert(encrypt(h.P,h.K,1).join()===h.C.join(),h.name+' exact replay');
  const s=scan(h.P,h.C,h.K.length,1);assert(s.max===h.P.length&&s.best.s===0&&s.best.t===0,h.name+' maximum');
  assert(s.hits.some(x=>x.s===0&&x.t===0&&x.key.join()===h.K.join()),h.name+' key');
  return{name:h.name,n:h.P.length,max:s.max,keyExact:true}
 });
 const plants=[],nulls=[];
 for(let id=0;id<12;id++){
  const q=id%2?13:8,sign=id%4<2?1:-1;
  const s=70+Math.floor(random()*(P.length-220)),t=100+Math.floor(random()*700);
  const K=Array.from({length:q},rand),C=Array.from({length:1000},rand),pl=P.slice(s,s+80),encoded=encrypt(pl,K,sign);
  C.splice(t,80,...encoded);const r=scan(P,C,q,sign);
  const hit=r.hits.find(x=>x.s===s&&x.t===t);
  plants.push({id,q,sign,s,t,max:r.max,matched:!!hit,keyExact:!!hit&&hit.key.join()===K.join(),plainF:pl.filter(x=>x===0).length,cipherF:encoded.filter(x=>x===0).length});
  const n=scan(P,Array.from({length:1000},rand),q,sign);
  nulls.push({id,max:n.max,prefixCount:n.prefixCount,hits:n.hits.length})
 }
 const gate=plants.every(x=>x.matched&&x.keyExact)&&nulls.every(x=>x.hits===0);
 let target=null;
 if(gate&&original){
  const C=gp.pages.slice(0,56).flatMap(p=>p.indices);assert(C.length===12956,'original count');
  target=[];
  for(const q of [8,13])for(const sign of [1,-1])target.push(scan(P,C,q,sign))
 }
 return{source:source.map(s=>({name:s.name,n:s.P.length})),sourceRunes:P.length,exhaustive,authentic,plants,nulls,gate,target}
}
const d=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(study(JSON.parse(d[0]),d[1],JSON.parse(d[2]),process.argv.includes('--original')),null,2));
