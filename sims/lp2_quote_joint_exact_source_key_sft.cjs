'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp1_wulfic_canonical.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
function followup(gp,lp1,gold,raw,allowOriginal=false){
  const assert=(x,m)=>{if(!x)throw Error(m)},N=160,B=41;
 const ix=new Map(gp.runes.map((v,i)=>[v,i])),extract=s=>[...s].filter(x=>ix.has(x)).map(x=>ix.get(x));
 const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function nativeWord(w){const out=[];w=w.toUpperCase().replace(/['’]/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));assert(t,w);out.push(t.i);w=w.slice(t.s.length)}return out}
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
 function encrypt(P,K){let j=0;return P.map(v=>v===0?0:(v+K[j++%K.length])%29)}
 const hist=[{name:"WELCOME",C:extract(lp1.split("%").slice(1,3).join("%")),P:extract(gold.sections.find(s=>s.name==="0_welcome").source_text),K:[23,10,1,10,9,10,16,26]},{name:"KOAN",C:extract(lp1.split("$")[5]),P:extract(gold.sections.find(s=>s.name==="jpg107-167").source_text),K:[0,10,4,0,1,19,0,18,4,18,9,0,18]}];
 const authentic=hist.map(({name,C,P,K})=>{assert(encrypt(P,K).join()===C.join(),name+" exact replay");assert(P.every((x,i)=>x!==0||C[i]===0),"F necessary");return {name,n:P.length,plainF:P.filter(v=>v===0).length,cipherF:C.filter(v=>v===0).length}})
 function parse(text,name){
  const P=[],boundaries=[];let last=0;
  for(const m of text.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)){
   if(/[.!?]/.test(text.slice(last,m.index))&&P.length)boundaries.push(P.length);
   P.push(...nativeWord(m[0]));last=m.index+m[0].length
  }
  const b=[...new Set(boundaries)],candidates=[];
  for(let i=0;i<b.length;i++){const start=b[i]-B,end=start+N;if(start<0||end>P.length||(i>0&&b[i-1]>start)||(i+1<b.length&&b[i+1]<end))continue;
   const Fs=[];for(let j=0;j<N;j++)if(P[start+j]===0)Fs.push(j);
   candidates.push({name,start,Fs})
  }
  return {name,P,candidates,sentenceStops:b.length}
 }
 const names=["Shakespeare","Emerson","Gibran"],sources=raw.map((s,i)=>parse(s,names[i])),all=sources.flatMap(s=>s.candidates);

 const split=80;
 const mod=x=>(x+29)%29;
 function derive(C,P,end){const k=[];for(let i=0;i<end;i++){if(P[i]===0){if(C[i]!==0)return null}else k.push(mod(C[i]-P[i]))}return k}
 const keyWindow=10;
 const hash=a=>a.slice(0,keyWindow).join(",");
 const index=new Map();
 function indexAdd(key,location){const id=hash(key);if(!index.has(id))index.set(id,[]);index.get(id).push(location)}
 // All positions in the frozen source registers; no key-space pruning by language model.
 for(let j=0;j<sources.length;j++)for(let i=0;i+N<=sources[j].P.length;i++)indexAdd(sources[j].P.slice(i,i+keyWindow),{kind:"source",j,i});
 const primes=[];for(let n=2;primes.length<3301+N;n++){let prime=true;for(const p of primes){if(p*p>n)break;if(n%p===0){prime=false;break}}if(prime)primes.push(n)}
 const pk=primes.map(p=>(p-1)%29);
 for(let i=0;i<=3300;i++)indexAdd(pk.slice(i,i+keyWindow),{kind:"prime",i});
 function exactPrefix(C){
  const out=[];let fCompatible=0;
  for(const c of all){
   const source=sources.find(s=>s.name===c.name),P=source.P.slice(c.start,c.start+N);
   const d=derive(C,P,split);if(!d)continue;fCompatible++;
   for(const q of [8,13]){
    if(d.length<2*q||d.some((x,i)=>x!==d[i%q]))continue;
    const K=d.slice(0,q),full=encrypt(P,K);
    out.push({source:c.name,start:c.start,kind:"period",q,key:K,full,P});
   }
   if(d.length>=keyWindow)for(const k of index.get(hash(d))||[]){
    const stream=k.kind==="prime"?pk:sources[k.j].P;
    if(k.i+N>stream.length||d.some((x,i)=>x!==stream[k.i+i]))continue;
    const K=stream.slice(k.i,k.i+N),full=encrypt(P,K);
    out.push({source:c.name,start:c.start,kind:k.kind,keySource:k.kind==="source"?sources[k.j].name:null,keyStart:k.i,full,P});
   }
  }
  return {fCompatible,out};
 }
 function test(C,truth){
  const {fCompatible,out}=exactPrefix(C.slice(0,split));
  const summary=out.map(o=>({source:o.source,start:o.start,kind:o.kind,q:o.q,key:o.key,keySource:o.keySource,keyStart:o.keyStart,fullCipher:o.full,plain:o.P}));
  // Entire prefix candidate set frozen before checking the remaining 80 ciphertext runes.
  const unique=new Map(out.map(o=>[o.source+":"+o.start+":"+o.full.join(","),o]));
  const selected=unique.size===1?[...unique.values()][0]:null;
  const continuationMatches=selected?selected.full.slice(split).every((x,i)=>x===C[split+i]):false;
  const correct=!!(selected&&truth&&selected.source===truth.name&&selected.start===truth.start&&continuationMatches);
  return {fCompatible,prefixCandidates:summary.length,distinctPredictions:unique.size,selected:selected?{source:selected.source,start:selected.start,kind:selected.kind,q:selected.q,key:selected.key,keySource:selected.keySource,keyStart:selected.keyStart}:null,continuationMatches,correct,all:summary};
 }
 const controls=[],nulls=[];
 for(let j=0;j<3;j++)for(let quartile=0;quartile<4;quartile++){
  const s=sources[j],lo=Math.floor(quartile*s.P.length/4)+N,hi=Math.floor((quartile+1)*s.P.length/4)-N,opts=s.candidates.filter(c=>c.start>=lo&&c.start<hi);assert(opts.length,"plant candidates");
  const id=j*4+quartile,random=rng((0x7af53911^Math.imul(id+1,0x9e3779b9))>>>0),c=opts[Math.floor(random()*opts.length)],P=s.P.slice(c.start,c.start+N);
  const other=sources[(j+1)%3],keyStart=Math.floor(random()*(other.P.length-N)),primeStart=Math.floor(random()*3301),q=id%2?8:13;
  const K=Array.from({length:q},()=>Math.floor(random()*29));
  const scenarios=[["period",K],["prime",pk.slice(primeStart,primeStart+N)],["source",other.P.slice(keyStart,keyStart+N)]];
  for(const [kind,key] of scenarios){const r=test(encrypt(P,key),c);controls.push({id,kind,truth:{name:c.name,start:c.start},q:kind==="period"?q:null,keySource:kind==="source"?other.name:null,keyStart:kind==="source"?keyStart:kind==="prime"?primeStart:null,...r});}
  const pad=Array.from({length:N},()=>Math.floor(random()*29));nulls.push({id,...test(encrypt(P,pad),null)});
 }
 const gate={correct:controls.filter(x=>x.correct).length,selected:controls.filter(x=>x.selected).length,falsePrefix:nulls.filter(x=>x.selected).length,falseFull:nulls.filter(x=>x.continuationMatches).length};
 gate.pass=gate.correct===controls.length&&gate.selected===controls.length&&gate.falsePrefix===0;
 let original=null;if(gate.pass&&allowOriginal){
  const U=gp.pages.filter(p=>p.page<=55).sort((a,b)=>a.page-b.page).flatMap(p=>p.indices);assert(U.length===12956,"LP2 size");const C=U.slice(10279,10439);assert(C.length===N,"quote length");original=test(C,null);
 }
 return {method:{target:"p42–43 quote [10279,10439), stop at 41",prefix:80,suffix:80,periods:[8,13],primeOrigins:[0,3300],keySources:names,sourceCandidates:all.length,keyIndexEntries:index.size},authentic,controls,nulls,gate,original};
}
const d=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(followup(JSON.parse(d[0]),d[1],JSON.parse(d[2]),d.slice(3),process.argv.includes('--original')),null,2));
