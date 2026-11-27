"use strict";
const fs = require("node:fs");
const path = require("node:path");
function phaseFeasibility(c,key,sign,hold,fitLength){
 const mod=x=>(x%29+29)%29;
 let phases=new Set([0]), phasesAfterFit=null;
 for(let i=0;i<c.length;i++){
  const next=new Set();
  for(const q of phases){
   if(hold&&c[i]===0)next.add(q);
   if(!hold||mod(c[i]-sign*key[q])!==0)next.add((q+1)%key.length);
  }
  if(!next.size)return {firstImpossibleChapterOffset:i,phasesBefore:[...phases].sort((a,b)=>a-b),phasesAfterFit};
  phases=next;
  if(i===fitLength-1)phasesAfterFit=[...phases].sort((a,b)=>a-b);
 }
 return {firstImpossibleChapterOffset:null,finalPhases:[...phases].sort((a,b)=>a-b),phasesAfterFit};
}
function experiment(data,reference){
 const A=data.translit, mod=x=>(x%29+29)%29;
 const table={thickness_tenths:[152,123,145,102,108,138,108,134,115,128,146,125,131,153,152],modulus_hundredths:[372,385,383,378,375,359,366,356,363,357,379,355,356,382,377],hardness_hundredths:[21,23,23,22,19,17,18,17,18,17,21,18,17,23,19]};
 const train=reference.split("### 56")[0].split("\n").filter(x=>!x.startsWith("#")&&!x.startsWith("[")&&!x.startsWith("(")&&/[A-Z]/.test(x)).join(" ");
 const encodeText=s=>s.toUpperCase().match(/[A-Z]+/g).flatMap(w=>{w=w.replace(/ING/g,"NG").replace(/QU/g,"CW").replace(/K/g,"C").replace(/V/g,"U").replace(/Z/g,"S");const a=[];for(let i=0;i<w.length;){const candidates=A.map((s,j)=>[s,j]).filter(([s])=>w.startsWith(s,i)).sort((a,b)=>b[0].length-a[0].length);if(candidates.length){a.push(candidates[0][1]);i+=candidates[0][0].length}else i++;}return a;});
 const T=encodeText(train), counts=new Float64Array(30*30*29), den=new Float64Array(900);
 let a=29,b=29;for(const x of T){let k=a*30+b;counts[k*29+x]++;den[k]++;a=b;b=x;}
 const log=Array.from(counts,(v,i)=>Math.log((v+0.2)/(den[Math.floor(i/29)]+5.8)));
 const score=(x,a,b)=>log[(a*30+b)*29+x];
 function decode(c,key,sign,hold,initial={phase:0,a:29,b:29}) {
   let layer=new Map([[initial.phase*900+initial.a*30+initial.b,{...initial,s:0,path:""}]]);
   for(let i=0;i<c.length;i++){const x=c[i],next=new Map();for(const q of layer.values()){
     function emit(p,phase){const s=q.s+score(p,q.a,q.b),k=phase*900+q.b*30+p;const old=next.get(k);if(!old||old.s<s)next.set(k,{phase,a:q.b,b:p,s,path:q.path+String.fromCharCode(65+p)});}
     if(hold&&x===0)emit(0,q.phase);
     const p=mod(x-sign*key[q.phase]);if(!hold||p!==0)emit(p,(q.phase+1)%key.length);
   }if(!next.size)return {dead:i};layer=next;}
   const q=[...layer.values()].reduce((p,q)=>p.s>=q.s?p:q);return {...q,indices:[...q.path].map(x=>x.charCodeAt(0)-65),mean:q.s/c.length};
 }
 function encrypt(p,key,sign,hold){let phase=0;return p.map(x=>{if(hold&&x===0)return 0;const c=mod(x+sign*key[phase]);phase=(phase+1)%key.length;return c;});}
 const render=p=>p.map(i=>A[i]).join(" ");
 const primes=[];for(let n=2;primes.length<85;n++)if(!primes.some(p=>p*p<=n&&n%p===0))primes.push(n);
 let j=0;const p56=data.pages[56].indices.map((c,i)=>i===56?0:mod(c-(primes[j++]-1))),p57=data.pages[57].indices;
 const fit=data.pages[27].indices,held=data.pages.slice(28,33).flatMap(p=>p.indices);
 const eq=(p,q)=>p.length===q.length&&p.every((x,i)=>x===q[i]);
 const results=[];
 for(const [name,row] of Object.entries(table)){const key=row.map(mod);for(const sign of [-1,1])for(const hold of [false,true]){
   const control=[p56,p57].map((p,i)=>{const c=encrypt(p,key,sign,hold),u=decode(c.slice(0,50),key,sign,hold),v=u.indices?decode(c.slice(50),key,sign,hold,u):null;const q=u.indices&&v?.indices?[...u.indices,...v.indices]:null;return {page:56+i,fitScore:u.mean??null,heldScore:v?.mean??null,fitMatches:u.indices?.filter((x,k)=>x===p[k]).length??null,heldMatches:v?.indices?.filter((x,k)=>x===p[k+50]).length??null,heldLength:p.length-50,replay:q&&eq(encrypt(q,key,sign,hold),c)};});
   const u=decode(fit,key,sign,hold),v=u.indices?decode(held,key,sign,hold,u):null;
   const q=u.indices&&v?.indices?[...u.indices,...v.indices]:null;
   results.push({name,key,sign,hold,control,original:{fullFeasibility:phaseFeasibility([...fit,...held],key,sign,hold,fit.length),fitScore:u.mean??null,heldScore:v?.mean??null,fitDead:u.dead??null,heldDead:v?.dead??null,fitText:u.indices&&render(u.indices),heldText:v?.indices&&render(v.indices),replay:q&&eq(encrypt(q,key,sign,hold),[...fit,...held])}});
 }}
 return {source:"Song et al. 2004 DOI 10.1242/jeb.01122 Table 2; published mean rows, exact printed decimal integers; not authenticated artwork attribution",table,trainingRunes:T.length,fitRunes:fit.length,heldRunes:held.length,results};
}
const root=path.resolve(__dirname,"..");
const data=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const reference=fs.readFileSync(path.join(root,"resources/liber-primus/lp1-plaintext-reference.txt"),"utf8");
console.log(JSON.stringify(experiment(data,reference),null,2));
