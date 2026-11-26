"use strict";
// Run from the checkout: node sims/lp2_fixed_composition_source_frame_gate_sft.cjs
const fs=require("node:fs"),path=require("node:path");
function run(book,punct,ink,solved){
 const assert=(v,m)=>{if(!v)throw Error(m)};
 const hist=x=>{const h=Array(29).fill(0);x.forEach(v=>h[v]++);return h};
 const pages=book.pages.filter(p=>p.page<=55),tape=pages.flatMap(p=>p.indices), N=tape.length;
 assert(N===12956,"original tape");
 const pstart=[];let offset=0;for(const p of pages){pstart[p.page]=offset;offset+=p.indices.length;}
 const boundaries=[0,...new Set(punct.events.filter(e=>e.symbol==="⁜").map(e=>e.rune_offset)),N].sort((a,b)=>a-b).filter((x,i,a)=>!i||x!==a[i-1]);
 const inkBoundaries=[...new Set([0,...ink.pages.filter(p=>p.page<56).flatMap(p=>(p.large_punctuation||[]).map(m=>pstart[p.page]+m[0])),N])].sort((a,b)=>a-b);
 assert(JSON.stringify(inkBoundaries)===JSON.stringify(boundaries),"large mark cross match");
 const frames={book:[{id:"p0–55",x:tape}],page:pages.filter(p=>p.indices.length).map(p=>({id:"p"+p.page,x:p.indices})),section:[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]].map(([a,b])=>({id:`p${a}–${b}`,x:pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices)})),largeMark:boundaries.slice(1).map((e,i)=>({id:`${boundaries[i]}–${e}`,x:tape.slice(boundaries[i],e)}))};
 for(const [name,fs] of Object.entries(frames))assert(fs.reduce((n,f)=>n+f.x.length,0)===N,name+" frames partition");
 const logfact=[0];for(let i=1;i<=N;i++)logfact[i]=logfact[i-1]+Math.log(i);
 const lf=i=>logfact[i];
 function summary(id,x){
  const n=x.length,h=hist(x),q=Math.floor(n/29),r=n%29,quota=Array.from({length:29},(_,i)=>q+Number(i<r));
  const min=Math.min(...h),max=Math.max(...h);
  const relaxed=max-min<=1,exact=h.every((v,i)=>v===quota[i]);
  const minEditsAny=h.map(v=>Math.max(0,v-q-1)).reduce((a,b)=>a+b,0); // lower bound only; exact below
  const sorted=h.slice().sort((a,b)=>b-a), minEdits=sorted.reduce((s,v,i)=>s+Math.max(0,v-quota[i]),0);
  const exactEdits=h.reduce((s,v,i)=>s+Math.max(0,v-quota[i]),0);
  const log2AnyBalancedProbability=(lf(29)-lf(r)-lf(29-r)+lf(n)-(29-r)*lf(q)-r*lf(q+1)-n*Math.log(29))/Math.log(2);
  return {id,n,h,min,max,exact,relaxed,minEdits,exactEdits,log2AnyBalancedProbability,capacityBits:(lf(n)-(29-r)*lf(q)-r*lf(q+1))/Math.log(2)};
 }
 function sharedQuotaContradiction(rows){
  // For every symbol there must exist a fixed probability p with |count - n*p| < 1.
  // Use exact cross-products to find non-overlapping intervals.
  const contradictions=[];
  for(let k=0;k<29;k++){
    let low=rows[0],high=rows[0];
    for(const r of rows){
      if((r.h[k]-1)*low.n>(low.h[k]-1)*r.n)low=r;
      if((r.h[k]+1)*high.n<(high.h[k]+1)*r.n)high=r;
    }
    if((low.h[k]-1)*high.n>=(high.h[k]+1)*low.n)contradictions.push({symbol:k,lower:{id:low.id,count:low.h[k],n:low.n},upper:{id:high.id,count:high.h[k],n:high.n}});
  }
  return contradictions;
 }
 const result={};
 for(const [name,fs] of Object.entries(frames)){
   const rows=fs.map(f=>summary(f.id,f.x));
   const long=rows.filter(r=>r.n>=29);
   const sameLength=[];for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++)if(rows[i].n===rows[j].n&&rows[i].h.some((v,k)=>v!==rows[j].h[k]))sameLength.push([rows[i].id,rows[j].id,rows[i].n]);
   result[name]={rows,summary:{count:rows.length,long:long.length,exact:rows.filter(r=>r.exact).length,relaxed:rows.filter(r=>r.relaxed).length,longRelaxed:long.filter(r=>r.relaxed).length,minEdits:rows.reduce((a,b)=>a+b.minEdits,0),exactEdits:rows.reduce((a,b)=>a+b.exactEdits,0),relaxedIds:rows.filter(r=>r.relaxed).map(r=>r.id),sameLengthConflicts:sameLength,sharedProbabilityContradictions:sharedQuotaContradiction(rows),longSharedProbabilityContradictions:long.length?sharedQuotaContradiction(long):[]}};
 }
 const idx=new Map(book.runes.map((r,i)=>[r,i]));
 const native=solved.sections.map(s=>({id:s.name,x:[...s.source_text].filter(c=>idx.has(c)).map(c=>idx.get(c))}));
 const controls=native.map(s=>summary(s.id,s.x));
 // Deterministic equal composition codeword positive (permuted fixed counts, including repeats).
 const plants=[29,85,135,270,729].map(n=>{
   const x=Array.from({length:n},(_,i)=>i%29).sort((a,b)=>a-b);
   const s=summary("fixed-"+n,x);
   assert(s.exact&&s.relaxed&&s.minEdits===0,"planted quota");return s;
 });
 return {N,frames:result,controls,plants};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-punctuation-identity.json","resources/liber-primus/lp2-ink-annotations.json","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(run(...paths.map(p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8")))),null,2));
