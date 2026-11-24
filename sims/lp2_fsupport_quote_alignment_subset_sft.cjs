"use strict";
/** #2604: transparent-F one-sided quotation retrieval, monotone subset calibration only. */
const fs=require('node:fs'),path=require('node:path');
function experiment(gp,lp1,gold,raw){
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
 function rank(mask){
  let best=-1,winners=[],compatible=0;
  for(const c of all){if(!c.Fs.every(i=>mask[i]))continue;compatible++;const k=c.Fs.length;if(k>best){best=k;winners=[c]}else if(k===best)winners.push(c)}
  return {best,winners,compatible}
 }
 function randomMask(k,random){const a=Array.from({length:N},(_,i)=>i),m=new Uint8Array(N);for(let i=0;i<k;i++){const j=i+Math.floor(random()*(N-i));[a[i],a[j]]=[a[j],a[i]];m[a[i]]=1}return m}
 function test(mask,truth,seed){
  const r=rank(mask),k=mask.reduce((a,b)=>a+b,0),random=rng(seed),maxima=[];
  for(let i=0;i<99;i++)maxima.push(rank(randomMask(k,random)).best);
  const maxNull=Math.max(...maxima),p=(1+maxima.filter(x=>x>=r.best).length)/100;
  const winner=r.winners.length===1&&r.best>maxNull?r.winners[0]:null;
  const truthCompatible=truth?truth.Fs.every(i=>mask[i]):null;
  return {truth:truth?{name:truth.name,start:truth.start,plainF:truth.Fs.length}:null,cipherF:k,truthCompatible,compatible:r.compatible,best:r.best,bestTies:r.winners.length,top:r.winners.slice(0,4).map(c=>({name:c.name,start:c.start,plainF:c.Fs.length})),maxNull,pValue:p,selected:winner?{name:winner.name,start:winner.start,plainF:winner.Fs.length}:null,correct:truth&&winner?truth.name===winner.name&&truth.start===winner.start:null}
 }
 const plants=[],nulls=[];
 for(let i=0;i<3;i++)for(let q=0;q<4;q++){
  const s=sources[i],lo=Math.floor(q*s.P.length/4)+N,hi=Math.floor((q+1)*s.P.length/4)-N,options=s.candidates.filter(c=>c.start>=lo&&c.start<hi);
  assert(options.length>0,"empty quartile "+s.name+" "+q);
  const id=i*4+q,random=rng((0x2604d00d^Math.imul(id+1,0x9e3779b9))>>>0),c=options[Math.floor(random()*options.length)],P=s.P.slice(c.start,c.start+N);
  const C=encrypt(P,hist[id%2].K),mask=Uint8Array.from(C,v=>v===0?1:0);
  const plant=test(mask,c,(0x2604e00d^Math.imul(id+1,0x85ebca6b))>>>0);
  assert(plant.truthCompatible,"true source eliminated");
  plants.push({...plant,quartile:q,authenticKey:hist[id%2].name});
  nulls.push({...test(randomMask(plant.cipherF,random),null,(0x2604f00d^Math.imul(id+1,0xc2b2ae35))>>>0),matchedTo:id})
 }
 const gate={correct:plants.filter(x=>x.correct).length,wrong:plants.filter(x=>x.selected&&!x.correct).length,falseSelections:nulls.filter(x=>x.selected).length};
 gate.pass=gate.correct>=9&&gate.wrong===0&&gate.falseSelections<=1;
 return {method:{N,B,orthography:"native ING→NG, IO→IA, QU→CW, V→U, K/Q→C, Z→S, apostrophes internal",sourceSentenceMarks:".!?",target:"p42–43 [10279,10439), relative full stop 41; no original rune values scored in subset calibration",nulls:99},authentic,sourceCounts:sources.map(s=>({name:s.name,runes:s.P.length,sentenceStops:s.sentenceStops,placements:s.candidates.length,plainFHistogram:s.candidates.reduce((h,c)=>(h[c.Fs.length]=(h[c.Fs.length]||0)+1,h),{})})),totalCandidates:all.length,plants,nulls,gate}
}
const files=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/transcriptions/lp1_wulfic_canonical.txt",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/gibran_prophet_58585.txt"
];
const d=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(d[0]),d[1],JSON.parse(d[2]),d.slice(3)),null,2));
