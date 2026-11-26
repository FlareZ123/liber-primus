#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/external/2013-book-of-law-I.txt","resources/external/2013-book-of-law-II.txt","resources/external/2013-book-of-law-III.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
function core(data){
 const corpus=JSON.parse(data[0]), native=JSON.parse(data[1]), N=29;
 const assert=(v,m)=>{if(!v)throw Error(m)};
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const runeMap=new Map(corpus.runes.map((c,i)=>[c,i]));
 const toGP=t=>{const out=[];for(const m of t.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").matchAll(/[A-Z]+/g)){const w=m[0].replace(/ING/g,"NG").replace(/IO/g,"IA");for(let i=0;i<w.length;){const tok=tokens.find(x=>w.startsWith(x.s,i));assert(tok,"GP token");out.push(tok.i);i+=tok.s.length}}return out};
 const gpNative=t=>Array.from(t,c=>runeMap.get(c)).filter(x=>x!==undefined);
 const verses=data.slice(2,5).flatMap(t=>{const a=[];for(const line of t.split(/\r?\n/)){const m=line.match(/^\s*\d+\.\s*(.*)$/);if(m)a.push(m[1]);else if(a.length)a[a.length-1]+=" "+line}return a.map(toGP)});
 const lp1=native.sections.slice(0,7).flatMap(s=>s.source_text.split(/\r?\n/).map(gpNative).filter(a=>a.length));
 assert(verses.length===220,"220 historical verse units");
 const unknown=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
 assert(unknown.length===12956,"original rune count");
 const scope=[0,3,8,15,23,27,33,40,54,56];
 const targets=[{name:"continuous-p0-55",t:unknown},...scope.slice(0,-1).map((start,i)=>({name:`p${start}-${scope[i+1]-1}`,t:corpus.pages.slice(start,scope[i+1]).flatMap(p=>p.indices)})),{name:"p0-2-black-body",t:corpus.pages.slice(0,3).flatMap(p=>p.indices).slice(13)}];
 const C=targets.at(-1).t,fit=corpus.pages[0].indices.length-13;
 assert(C.length===716&&fit===249,"opening physical framing");
 const train=toGP(data[5]),h1=new Float64Array(N),h2=new Float64Array(N*N);
 for(let i=0;i<train.length;i++){h1[train[i]]++;if(i)h2[train[i-1]*N+train[i]]++}
 const uni=Array.from(h1,x=>(x+.5)/(train.length+N*.5)),logUni=uni.map(Math.log),log2=new Float64Array(N*N);
 for(let p=0;p<N;p++){let sum=0;for(let q=0;q<N;q++)sum+=h2[p*N+q];for(let q=0;q<N;q++)log2[p*N+q]=Math.log((h2[p*N+q]+10*uni[q])/(sum+10))}
 const modes=["rank","absolute","character","verse-distance","relative-rune-distance"];
 const sources=[{name:"LP1-native-lines",units:lp1},{name:"2013-law-verses",units:verses}];
 function makeModel(units,mode){
  const n=units.length,offset=[0];for(const u of units)offset.push(offset.at(-1)+u.length);
  const first=units.map(u=>{const a=Array(N).fill(-1);u.forEach((p,i)=>{if(a[p]<0)a[p]=i});return a});
  const present=Array.from({length:N},(_,p)=>p).filter(p=>first.some(a=>a[p]>=0)),presentSet=new Set(present);
  const absent=Array.from({length:N},(_,p)=>p).filter(p=>!presentSet.has(p));
  const rows=[],inv=[];
  for(let s=0;s<n;s++){
   const entries=Array(N).fill(null);let rem=present.length;
   for(let d=0;d<n&&rem;d++){
    const u=(s+d)%n;
    for(const p of present){if(!entries[p]&&first[u][p]>=0){entries[p]={p,d,u,pos:first[u][p],next:(u+1)%n};rem--}}
   }
   const ordered=present.map(p=>entries[p]).sort((a,b)=>a.d-b.d||a.pos-b.pos);
   for(let k=0;k<ordered.length;k++){
    const e=ordered[k];
    const vals={rank:present[k],absolute:(offset[e.u]+e.pos+1)%N,character:(e.pos+1)%N,"verse-distance":(e.d+1)%N,"relative-rune-distance":((offset[e.u]+e.pos-offset[s]+offset[n])%offset[n]+1)%N};
    e.c=vals[mode];
   }
   for(const p of absent)entries[p]={p,c:p,next:0,absent:true};
   assert(entries.every(Boolean),"total forward map");
   const ir=Array.from({length:N},()=>[]);
   for(const e of entries)ir[e.c].push(e);
   if(mode==="rank")assert(ir.every(a=>a.length===1),"rank bijective");
   rows.push(entries);inv.push(ir);
  }
  function enc(plain,start){let s=start;const out=[];for(const p of plain){const e=rows[s][p];out.push(e.c);s=e.next}return {out,end:s}}
  return {n,mode,rows,inv,present,absent,enc};
 }
 function reach(model,t){
  let active=Array.from({length:model.n},(_,i)=>i),max=active.length,total=0;
  for(let i=0;i<t.length;i++){
   const mask=new Uint8Array(model.n),next=[];
   for(const s of active)for(const e of model.inv[s][t[i]])if(!mask[e.next]){mask[e.next]=1;next.push(e.next)}
   if(!next.length)return {legal:i,ends:0,max,total};
   active=next;max=Math.max(max,active.length);total+=active.length;
  }
  return {legal:t.length,ends:active.length,max,total};
 }
 /** Exact maximum-likelihood decoder for a bigram model. All starts are searched;
  *  a frozen continuation accepts exactly the trained terminal state/last rune. */
 function decode(model,t,prior=null){
  const S=model.n*N, neg=-Infinity;
  let scores=new Float64Array(S).fill(neg),origins=new Int32Array(S).fill(-1),active=[],trace=[];
  for(let i=0;i<t.length;i++){
   const out=new Float64Array(S).fill(neg),o2=new Int32Array(S).fill(-1),prev=new Int32Array(S).fill(-1),next=[];
   const upd=(s,e,score,origin,back)=>{const id=e.next*N+e.p;if(score>out[id]){if(out[id]===neg)next.push(id);out[id]=score;o2[id]=origin;prev[id]=back}};
   if(i===0){
    if(prior){for(const e of model.inv[prior.cursor][t[0]])upd(prior.cursor,e,log2[prior.last*N+e.p],prior.cursor,-1)}
    else for(let s=0;s<model.n;s++)for(const e of model.inv[s][t[0]])upd(s,e,logUni[e.p],s,-1);
   }else for(const id of active){const s=Math.floor(id/N),p=id%N;for(const e of model.inv[s][t[i]])upd(s,e,scores[id]+log2[p*N+e.p],origins[id],id)}
   if(!next.length)return {legal:i};
   trace.push(prev);scores=out;origins=o2;active=next;
  }
  let best=active[0];for(const id of active)if(scores[id]>scores[best])best=id;
  const p=new Array(t.length);let id=best;
  for(let i=t.length-1;i>=0;i--){p[i]=id%N;id=trace[i][id]}
  const cursor=Math.floor(best/N),origin=origins[best],last=best%N;
  const replay=model.enc(p,origin);
  assert(replay.end===cursor&&replay.out.every((x,i)=>x===t[i]),"exact replay");
  return {legal:t.length,p,origin,cursor,last,score:scores[best]/t.length,terminalStates:active.length};
 }
 const match=(a,b)=>a.filter((x,i)=>x===b[i]).length;
 const stats=t=>{const h=Array(N).fill(0);for(const p of t)h[p]++;return {ioc:h.reduce((s,x)=>s+x*(x-1),0)/(t.length*(t.length-1)),repeat:t.slice(1).filter((x,i)=>x===t[i]).length/(t.length-1),maxFreq:Math.max(...h)/t.length}};
 const preview=p=>p.slice(0,80).map(x=>corpus.translit[x]).join(" ");
 function fitTest(model,t,truth=null){
  const a=decode(model,t.slice(0,fit));
  if(!a.p)return {fitLegal:a.legal,heldLegal:0};
  const b=decode(model,t.slice(fit),{cursor:a.cursor,last:a.last});
  const r={fitLegal:a.legal,fitScore:a.score,origin:a.origin,fitEnd:a.cursor,fitTerminalStates:a.terminalStates,fitExcerpt:preview(a.p),heldLegal:b.legal};
  if(truth)r.fitExact=match(a.p,truth.slice(0,fit));
  if(b.p){r.heldScore=b.score;r.heldExcerpt=preview(b.p);r.heldStats=stats(b.p);r.heldEnd=b.cursor;if(truth)r.heldExact=match(b.p,truth.slice(fit));const replay=model.enc(a.p.concat(b.p),a.origin);assert(replay.out.every((x,i)=>x===t[i]),"whole frozen replay")}
  return r;
 }
 const donors=[toGP(data[6]).slice(4200,4200+C.length),toGP(data[7]).slice(6000,6000+C.length)];
 assert(donors.every(p=>p.length===C.length),"plant lengths");
 const output={originalLength:unknown.length,openingLength:C.length,fit,held:C.length-fit,originalStats:stats(unknown),openingStats:stats(C),trainLength:train.length,models:[]};
 for(const src of sources)for(const mode of modes){
  const model=makeModel(src.units,mode),reachability=targets.map(q=>({scope:q.name,n:q.t.length,...reach(model,q.t)}));
  const original=fitTest(model,C),controls=[];
  for(let i=0;i<donors.length;i++){
   const p=donors[i],origin=(i?83:17)%model.n,c=model.enc(p,origin).out,exact=reach(model,c);
   assert(exact.legal===c.length,"plant reachability");
   controls.push({donor:i?"Emerson":"Gibran",plantOrigin:origin,cipherStats:stats(c),plainStats:stats(p),...fitTest(model,c,p)});
  }
  const rankScopes=mode==="rank"?targets.map(({name,t})=>{
   let best=null;
   for(let origin=0;origin<model.n;origin++){
    let s=origin,prev=-1,score=0;const p=[];
    for(const c of t){const e=model.inv[s][c][0];score+=prev<0?logUni[e.p]:log2[prev*N+e.p];p.push(e.p);s=e.next;prev=e.p}
    if(!best||score>best.score)best={origin,score,p,end:s};
   }
   const replay=model.enc(best.p,best.origin);assert(replay.end===best.end&&replay.out.every((x,i)=>x===t[i]),"rank scope replay");
   return {scope:name,n:t.length,score:best.score/t.length,origin:best.origin,end:best.end,stats:stats(best.p),excerpt:preview(best.p)};
  }):null;
  output.models.push({carrier:src.name,mode,units:model.n,carrierRunes:src.units.reduce((a,u)=>a+u.length,0),absent:model.absent,reachability,original,controls,rankScopes});
 }
 return output;
}
console.log(JSON.stringify(core(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
