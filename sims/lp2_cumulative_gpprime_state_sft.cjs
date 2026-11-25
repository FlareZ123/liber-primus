'use strict';
const fs = require('node:fs');
const path = require('node:path');
function experiment(corpus,native){
 const assert=(v,m)=>{if(!v)throw Error(m)};
 const mod=x=>((x%29)+29)%29, q=corpus.prime, idx=new Map(corpus.runes.map((x,i)=>[x,i]));
 assert(q.length===29&&q[24]===97&&q[21]===79,"chart");
 const sections=native.sections.map(s=>({name:s.name,p:[...s.source_text].filter(c=>/[\u16a0-\u16ff]/u.test(c)).map(c=>{assert(idx.has(c),"unexpected rune");return idx.get(c)})}));
 const encode=(p,s)=>p.map(x=>{const c=mod(x+s);s=mod(s+q[x]);return c});
 const decode=(c,s)=>{const p=[],states=[s];for(const x of c){const y=mod(x-s);p.push(y);s=mod(s+q[y]);states.push(s)}return {p,states}};
 const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const all=(c)=>Array.from({length:29},(_,s)=>{const d=decode(c,s);assert(eq(encode(d.p,s),c),"replay");return {s,...d}});
 function model(ds){
  const n1=new Uint32Array(29),n2=new Uint32Array(841),n3=new Uint32Array(24389),t1=new Uint32Array(29),t2=new Uint32Array(841);let n=0;
  for(const {p} of ds)for(let i=0;i<p.length;i++){let x=p[i];n1[x]++;n++;if(i){let a=p[i-1];n2[a*29+x]++;t1[a]++;}if(i>1){let a=p[i-2]*29+p[i-1];n3[a*29+x]++;t2[a]++;}}
  return (p,start,end)=>{let sum=0;for(let i=start;i<end;i++){let x=p[i],u=(n1[x]+1)/(n+29);if(i){let a=p[i-1];u=(n2[a*29+x]+10*u)/(t1[a]+10);}if(i>1){let a=p[i-2]*29+p[i-1];u=(n3[a*29+x]+10*u)/(t2[a]+10);}sum+=Math.log(u);}return sum/(end-start)};
 }
 const fmt=p=>p.map(x=>corpus.translit[x]).join(" ");
 const stats=p=>{let counts=Array(29).fill(0),equal=0;for(let i=0;i<p.length;i++){counts[p[i]]++;if(i&&p[i]===p[i-1])equal++}return {ioc:counts.reduce((s,x)=>s+x*(x-1),0)/(p.length*(p.length-1)),equal,counts}};
 function select(paths,score,fit){return paths.map(a=>({...a,fit:score(a.p,0,fit)})).sort((a,b)=>b.fit-a.fit||a.s-b.s)[0]}
 function history(paths){let h=[];for(let i=0;i<paths[0].states.length;i++){let n=new Set(paths.map(a=>a.states[i])).size;if(!h.length||h.at(-1)[1]!==n)h.push([i,n]);}return h}
 const c=corpus.pages.slice(40,54).flatMap(p=>p.indices),fit=corpus.pages.slice(40,47).flatMap(p=>p.indices).length;
 assert(c.length===3008&&fit===1863&&corpus.pages[50].indices.length===0,"original page boundaries");
 const score=model(sections),paths=all(c),winner=select(paths,score,fit),hist=history(paths);
 const merge=hist.find(x=>x[1]===1)?.[0]??null;
 assert(merge===36&&paths.every(a=>eq(a.p.slice(merge),winner.p.slice(merge))),"original synchrony");
 const original={fit,holdout:c.length-fit,merge,hist,winner:winner.s,fitScore:winner.fit,holdScore:score(winner.p,fit,c.length),forcedScore:score(winner.p,merge,c.length),stats:stats(winner.p.slice(merge)),fitPreview:fmt(winner.p.slice(merge,merge+100)),holdPreview:fmt(winner.p.slice(fit,fit+100)),allFitScores:paths.map(a=>score(a.p,0,fit)),forcedRunes:winner.p.slice(merge).map(x=>corpus.runes[x]).join("")};
 const plants=[];
 for(const section of sections){
  const sc=model(sections.filter(s=>s!==section)), f=Math.floor(section.p.length*fit/c.length);
  for(const seed of [0,7,19]){
   const ct=encode(section.p,seed),pa=all(ct),w=select(pa,sc,f),h=history(pa),m=h.find(x=>x[1]===1)?.[0]??null;
   assert(eq(pa[seed].p,section.p),"known-key plant");
   plants.push({name:section.name,seed,n:ct.length,fit:f,selected:w.s,merge:m,fitScore:w.fit,holdScore:sc(w.p,f,ct.length),trueHoldScore:sc(section.p,f,ct.length),holdCorrect:w.p.slice(f).filter((x,i)=>x===section.p[f+i]).length,holdLength:ct.length-f});
  }
 }
 let seed=0x2774cafe;
 const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
 const nulls=[];
 for(let j=0;j<200;j++){
  const ct=j<100?c.map(()=>rand()%29):c.slice();
  if(j>=100)for(let i=ct.length-1;i>0;i--){let k=rand()%(i+1);[ct[i],ct[k]]=[ct[k],ct[i]]}
  const pa=all(ct),w=select(pa,score,fit);nulls.push({type:j<100?"uniform":"permuted",fitScore:w.fit,holdScore:score(w.p,fit,ct.length),merge:history(pa).find(x=>x[1]===1)?.[0]??null});
 }
 const p56=sections.find(s=>s.name==="p56_an_end").p;
 let ord=0,pr=[];for(let x=2;pr.length<p56.length;x++){if(!pr.some(p=>p*p<=x&&x%p===0))pr.push(x)}
 const p56enc=p56.map(x=>x===0?0:mod(x+pr[ord++]-1));
 const controls={p56Matches:p56enc.filter((x,i)=>x===corpus.pages[56].indices[i]).length,p56Length:p56.length,p56Consumed:ord,p57Matches:sections.find(s=>s.name==="p57_parable").p.filter((x,i)=>x===corpus.pages[57].indices[i]).length};
 const summary={original:{...original,forcedRunes:undefined},controls,plants: {n:plants.length,exactHeldouts:plants.filter(x=>x.holdCorrect===x.holdLength).length,correct:plants.reduce((s,x)=>s+x.holdCorrect,0),total:plants.reduce((s,x)=>s+x.holdLength,0),seedCorrect:plants.filter(x=>x.seed===x.selected).length,minHoldScore:Math.min(...plants.map(x=>x.holdScore)),maxHoldScore:Math.max(...plants.map(x=>x.holdScore)),nativeStats:sections.map(s=>({name:s.name,...stats(s.p),counts:undefined}))},nulls:["uniform","permuted"].map(type=>{const a=nulls.filter(x=>x.type===type),sc=a.map(x=>x.holdScore).sort((a,b)=>a-b);return {type,min:sc[0],median:sc[50],max:sc[99],atLeastOriginal:sc.filter(x=>x>=original.holdScore).length}})};
 return {summary,original,plants,nulls};
}
const root=path.join(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const result=experiment(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json'));
console.log(JSON.stringify(result,null,2));
