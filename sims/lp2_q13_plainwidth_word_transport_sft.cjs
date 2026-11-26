'use strict';
const fs=require('node:fs');
const {core,paths}=require('./lp2_q8_latent_independent_phase_sft.cjs');
const N=12956;
const canon=k=>Array.from({length:k.length},(_,i)=>k.slice(i)+k.slice(0,i)).sort()[0];
function check({donors},bank,rows){
 const words=new Map(bank.map((w,i)=>[w,i])),keys=new Map();
 for(const [id,ch,at,key] of rows){if(ch!==8)throw Error('early survivor');const k=canon(key);if(!keys.has(k))keys.set(k,new Map());const m=keys.get(k);if(!m.has(id))m.set(id,new Set());m.get(id).add(at);}
 const caps=[...keys.values()].map(m=>new Map([...m].map(([j,s])=>[j,s.size])));
 const data=donors.map((ws,d)=>{
  const n=ws.reduce((a,b)=>a+b.length,0)-N+1,E=new Map();
  const add=(i,j,delta)=>{if(!E.has(i))E.set(i,[]);E.get(i).push([j,delta]);};
  let pos=0;for(const w of ws){const start=pos;pos+=w.length;const j=words.get(w.map(x=>x.toString(36)).join(''));if(j===undefined)continue;const lo=Math.max(0,pos-N),hi=Math.min(n,start+1);if(lo<hi){add(lo,j,1);add(hi,j,-1);}}
  const counts=Array(bank.length).fill(0),points=[...new Set([0,n,...E.keys()])].sort((a,b)=>a-b);let typeSurvivors=0,countSurvivors=0,min=Infinity;const residual=[];
  for(let i=0;i<points.length-1;i++){const st=points[i],en=points[i+1];for(const [j,delta] of E.get(st)??[])counts[j]+=delta;
   const need=counts.flatMap((v,j)=>v?[[j,v]]:[]);min=Math.min(min,need.length);
   const type=caps.filter(k=>need.every(([j])=>k.has(j)));if(!type.length)continue;
   typeSurvivors+=en-st;const count=type.filter(k=>need.every(([j,v])=>k.get(j)>=v));countSurvivors+=count.length?en-st:0;
   residual.push({st,en,need,typeKeys:type.length,maxCaps:need.map(([j])=>[j,Math.max(...type.map(k=>k.get(j)))]),countKeys:count.length});
  }
  if(!min)throw Error('empty cover');return {d,n,min,typeSurvivors,countSurvivors,residual};
 });
 return {N,bankSize:bank.length,rows:rows.length,keys:keys.size,data};
}
module.exports={check};
if(require.main===module){const a=JSON.parse(fs.readFileSync('im-results/lp2-q13-plainwidth-cover-bank.json','utf8')),b=JSON.parse(fs.readFileSync('im-results/lp2-q13-plainwidth-cover-reachability.json','utf8')),e=JSON.parse(fs.readFileSync('im-results/lp2-q13-plainwidth-early-chapter-cover.json','utf8'));console.log(JSON.stringify(core(paths.map(p=>fs.readFileSync(p,'utf8')),x=>check(x,[...a.chosen.map(z=>z.p),e.added.p],[...b.candidates,...e.originalExtension.candidates])),null,2));}
