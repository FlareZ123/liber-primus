"use strict";
const fs=require("node:fs");
const path=require("node:path");
const run=function run(corpus,transcription,wordfreq,native,config={}){
 const Q=29,key=Array.from("a2e7j6ic78h0j7eiejd0120",x=>parseInt(x,20)),mod=x=>((x%Q)+Q)%Q;
 const assert=(v,m)=>{if(!v)throw Error(m)};
 const gp=new Map(corpus.runes.map((x,i)=>[x,i]));
 const MASK=(1<<29)-1,rot=(v,t)=>t?((v<<t)|(v>>>(29-t)))&MASK:v;
 const rng=seed=>{let s=seed>>>0;return n=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)%n}};
 const pages=transcription.trim().split("%").map((raw,i)=>({page:i<50?i:i+1,raw}));
 const lines=[],groups=[];let w=[],global=0;
 function flush(){if(w.length){groups.push(w);w=[]}}
 for(const {page,raw} of pages){
  const vals=[];for(const line of raw.split("\n")){
   let phase=0,l=[];for(const c of line){
    if(gp.has(c)){const x=gp.get(c);const e={c:x,k:key[phase++%key.length],page,global:global++};vals.push(x);l.push(x);w.push(e)}
    else if(c!=="/"&&!/\s/u.test(c))flush()
   }
   if(l.length)lines.push({page,c:l})
  }
  assert(vals.join(",")===corpus.pages[page].indices.join(","),"source page "+page)
 }flush();
 const training=groups.filter(w=>w[0].global>=13&&w.every(e=>e.page<=2)),held=groups.filter(w=>w.every(e=>e.page>=3&&e.page<=5));
 const shape=w=>({n:w.length,ks:w.map(e=>e.k),cs:w.map(e=>e.c)});
 const stats={training:training.length,trainingRunes:training.flat().length,held:held.length,heldRunes:held.flat().length,lines:lines.filter(x=>x.page<56).length};
 function hall(ls){
  const mask=Array.from({length:Q},(_,i)=>i===0?1:MASK^1),witness=Array.from({length:Q},()=>Array(Q).fill(null));
  let positions=0;for(let li=0;li<ls.length;li++){
   const {page,c}=ls[li];for(let j=0;j<c.length&&c[j]!==0;j++){
    const k=key[j%key.length],x=c[j];mask[x]&=~(1<<k);positions++;witness[x][k]??={page,line:li,offset:j};
   }
  }
  const mate=Array(Q).fill(-1);
  function aug(x,seen){for(let k=0;k<Q;k++)if((mask[x]>>k&1)&&!seen[k]){seen[k]=true;if(mate[k]<0||aug(mate[k],seen)){mate[k]=x;return true}}return false}
  let matching=0;for(let i=0;i<Q;i++)matching+=+aug(i,Array(Q).fill(false));
  const matched=new Set(mate.filter(x=>x>=0)),left=new Set(Array.from({length:Q},(_,i)=>i).filter(i=>!matched.has(i))),right=new Set();
  let changed=true;while(changed){changed=false;for(const i of [...left])for(let k=0;k<Q;k++)if(mask[i]>>k&1&&!right.has(k)){right.add(k);changed=true;if(mate[k]>=0)left.add(mate[k]);}}
  if(matching<Q)assert(left.size>right.size,"Hall witness invalid");
  return {matching,positions,allowed:mask.map(m=>Array.from({length:Q},(_,i)=>i).filter(i=>m>>i&1)),hallWitness:{symbols:[...left],ranks:[...right]},mate,witness}
 }
 function permutation(seed){const rand=rng(seed),pi=Array.from({length:Q},(_,i)=>i);for(let i=Q-1;i>1;i--){let j=1+rand(i);[pi[i],pi[j]]=[pi[j],pi[i]]}return pi}
 function inv(pi){const a=[];pi.forEach((v,i)=>a[v]=i);return a}
 const sourceLines=lines.filter(x=>x.page<56);
 const hallResults={full:hall(sourceLines),opening:hall(sourceLines.filter(x=>x.page<=2)),controls:[]};
 for(let i=0;i<2;i++){
  const pi=permutation(0x9ce2911+i),ip=inv(pi);
  const pls=native.sections.flatMap(s=>s.source_text.split("\n").map(l=>Array.from(l).filter(x=>gp.has(x)).map(x=>gp.get(x))).filter(x=>x.length));
  const c=pls.map((l,j)=>{let k=0;return {page:j,c:l.map(x=>x===0?0:ip[mod(pi[x]+key[k++%key.length])])}});
  const h=hall(c);assert(h.matching===Q&&h.allowed.every((a,x)=>a.includes(pi[x])),"true rank removed");hallResults.controls.push({matching:h.matching,positions:h.positions});
 }
 // Full Hall witness is recorded even when the ordinary variant is studied.
 if(config.hallOnly)return {key,stats,hallResults};
 const D=Array.from({length:40},()=>new Map());
 const spell=new Map(corpus.translit.map((s,i)=>[s,i]));spell.set("ING",21);
 function add(w,weight){if(w.length&&w.length<D.length){const k=w.join(",");const prev=D[w.length].get(k);if(!prev||prev.weight<weight)D[w.length].set(k,{w,weight})}}
 for(const l of wordfreq.split(/\r?\n/)){
  const m=/^([a-z]+)\s+([0-9]+)$/.exec(l.trim());if(!m)continue;
  const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const walk=(i,w)=>{if(i===s.length){add(w,+m[2]);return}for(let n=1;n<=3&&i+n<=s.length;n++){const t=spell.get(s.slice(i,i+n));if(t!==undefined)walk(i+n,[...w,t])}};walk(0,[])
 }
 assert(D.reduce((n,x)=>n+x.size,0)===38910,"base register");
 const V=D.map(d=>[...d.values()]);
 function graph(){return {r:Array.from({length:Q},(_,i)=>i),d:Array(Q).fill(0),m:Array.from({length:Q},()=>1),size:Array(Q).fill(1),comps:Q}}
 function copy(g){return {r:g.r.slice(),d:g.d.slice(),m:g.m.slice(),size:g.size.slice(),comps:g.comps}}
 function allowed(g,c,p,k){const a=g.r[c],b=g.r[p],t=mod(g.d[p]+k-g.d[c]);return a===b?t===0:!(rot(g.m[a],t)&g.m[b])}
 function edge(g,c,p,k){
  const a=g.r[c],b=g.r[p],t=mod(g.d[p]+k-g.d[c]);if(a===b)return !t;
  if(rot(g.m[a],t)&g.m[b])return false;
  if(g.size[a]<=g.size[b]){
   for(let i=0;i<Q;i++)if(g.r[i]===a){g.r[i]=b;g.d[i]=mod(g.d[i]+t)}
   g.m[b]|=rot(g.m[a],t);g.size[b]+=g.size[a];g.size[a]=g.m[a]=0;
  }else{
   for(let i=0;i<Q;i++)if(g.r[i]===b){g.r[i]=a;g.d[i]=mod(g.d[i]-t)}
   g.m[a]|=rot(g.m[b],mod(-t));g.size[a]+=g.size[b];g.size[b]=g.m[b]=0;
  }g.comps--;return true
 }
 function extend(g,o){const h=copy(g);for(const [c,p,k] of o)if(!edge(h,c,p,k))return null;return h}
 function signature(g){let s="";const first=new Map();for(let i=0;i<Q;i++){let r=g.r[i];if(!first.has(r))first.set(r,i);let f=first.get(r);s+=String.fromCharCode(65+f,65+mod(g.d[i]-g.d[f]))}return s}
 function options(g){
  const out=[],seen=new Set();for(const {w,weight} of V[g.n]||[]){
   let valid=true;const edges=[];
   for(let i=0;i<g.n;i++){const c=g.cs[i],p=w[i],k=g.ks[i];if((c===p)!==(k===0)){valid=false;break}if(k)edges.push([c,p,k])}
   if(!valid)continue;
   const h=extend(graph(),edges);if(!h)continue;const sig=signature(h);if(seen.has(sig))continue;seen.add(sig);out.push({edges,w,weight,dim:h.comps});
  }
  out.sort((a,b)=>a.dim-b.dim||b.weight-a.weight);return out
 }
 function solve(train,hold,budget,truth,ms){
  const ds=train.map(options),forced=ds.map((x,i)=>x.length?null:i).filter(x=>x!==null);
  const order=train.map((_,i)=>i).filter(i=>ds[i].length).sort((a,b)=>Math.log(Math.max(1,ds[a].length))/train[a].n-Math.log(Math.max(1,ds[b].length))/train[b].n||train[b].n-train[a].n||a-b);
  let nodes=0,joins=0,perms=0,cap=false,answer=null,omissions=0,forcedEmpty=0,deadline=Date.now()+ms;
  const stop=()=>{if(Date.now()>deadline)cap=true;return cap||!!answer};
  function decode(g,pi){const ip=inv(pi);return g.cs.map((x,i)=>ip[mod(pi[x]-g.ks[i])])}
  function check(pi){perms++;let misses=0;
   for(const i of order){if(!D[train[i].n]?.has(decode(train[i],pi).join(","))&&++misses+forced.length>budget)return}
   answer={pi,misses:misses+forced.length,train:train.map(g=>decode(g,pi)),held:hold.map(g=>decode(g,pi))};
  }
  function pack(g){
   const shift=Array(Q).fill(0),root=g.r[0];shift[root]=mod(-g.d[0]);const left=[];for(let i=0;i<Q;i++)if(g.size[i]&&i!==root)left.push(i);
   function rec(used,rem){if(stop())return;if(!rem.length){check(g.r.map((r,i)=>mod(g.d[i]+shift[r])));return}
    let pick=-1,best=null;for(let i=0;i<rem.length;i++){const x=rem[i],opts=[];for(let t=0;t<Q;t++)if(!(used&rot(g.m[x],t)))opts.push(t);if(!opts.length)return;if(!best||opts.length<best.length){pick=i;best=opts}}
    const x=rem[pick],next=rem.filter((_,i)=>i!==pick);for(const t of best){shift[x]=t;rec(used|rot(g.m[x],t),next);if(stop())return}
   }rec(rot(g.m[root],shift[root]),left)
  }
  function dfs(g,rem,b){
   if(stop())return;nodes++;
   if(g.comps<=3||rem.length<=b){pack(g);return}
   let best=null,pick=-1,nextRem=[],empty=[];
   // Select from all high-information groups first. An exact empty domain
   // consumes one omission. Cap only at current MRV count, preserving all
   // untested candidates for subsequent nodes.
   for(const id of rem){
    const out=[],seen=new Set();let redundant=false;
    for(const o of ds[id]){
     if(!o.edges.every(([c,p,k])=>allowed(g,c,p,k)))continue;
     joins++;const h=extend(g,o.edges);if(!h)continue;
     if(h.comps===g.comps){redundant=true;break}
     const sig=signature(h);if(!seen.has(sig)){seen.add(sig);out.push(h)}
     if(best&&out.length>=best.length)break;
    }
    if(redundant)continue;
    if(!out.length){empty.push(id);forcedEmpty++;if(empty.length>b)return;continue}
    nextRem.push(id);
    if(!best||out.length<best.length){best=out;pick=id}
    // The root can scan all groups. In deeper nodes, the small domain
    // choice is sufficient; unexamined groups are retained unchanged.
    if(best&&best.length===1){const idx=rem.indexOf(id);for(let j=idx+1;j<rem.length;j++)nextRem.push(rem[j]);break}
    if(stop())return;
   }
   b-=empty.length;
   if(pick<0){pack(g);return}
   const rest=nextRem.filter(i=>i!==pick);best.sort((a,b)=>a.comps-b.comps);
   for(const h of best){dfs(h,rest,b);if(stop())return}
   if(b){omissions++;dfs(g,rest,b-1)}
  }
  if(forced.length<=budget)dfs(graph(),order,budget-forced.length);
  let result={budget,groups:train.length,forcedOov:forced,smallDomains:order.slice(0,20).map(i=>({i,n:train[i].n,options:ds[i].length})),nodes,joins,perms,cap,found:!!answer,forcedEmpty,omissions};
  if(answer){
   result.answer={pi:answer.pi,misses:answer.misses,heldSupported:answer.held.filter(w=>D[w.length].has(w.join(","))).length,heldTotal:hold.length};
   if(truth){result.answer.exactAction=answer.pi.join(",")===truth.pi.join(",");result.answer.trainCorrect=answer.train.flat().filter((x,i)=>x===truth.train.flat()[i]).length;result.answer.heldCorrect=answer.held.flat().filter((x,i)=>x===truth.held.flat()[i]).length;}
   else {result.answer.train=answer.train.map(w=>w.map(i=>corpus.translit[i]).join(""));result.answer.held=answer.held.map(w=>w.map(i=>corpus.translit[i]).join(""))}
  }
  return result
 }
 const train=training.map(shape),hold=held.map(shape);
 const budget=Math.floor(train.length*0.05);
 const controls=[];
 if(config.control!==false)for(const seed of config.seeds??[0x1a1b2c3d,0x9d2e3f4a]){
  const rand=rng(seed),pi=permutation(seed^0x4fe3461),ip=inv(pi);
  const plant=(gs)=>gs.map(g=>{const a=V[g.n];assert(a?.length,"empty control length "+g.n);return a[rand(a.length)].w});
  const pt=plant(train),ph=plant(hold);
  // Two deliberately OOV words at frozen positions (if length permits).
  for(const i of [12,43]){if(i<pt.length){let w;do{w=Array.from({length:train[i].n},()=>rand(Q))}while(D[w.length].has(w.join(",")));pt[i]=w}}
  const enc=(gs,ws)=>gs.map((g,i)=>({...g,cs:ws[i].map((p,j)=>ip[mod(pi[p]+g.ks[j])])}));
  controls.push({seed,truthOov:2,...solve(enc(train,pt),enc(hold,ph),budget,{pi,train:pt,held:ph},config.ms??10000)});
 }
 const original=config.original?solve(train,hold,budget,null,config.ms??10000):null;
 return {key,stats,hallResults:{full:hallResults.full,opening:hallResults.opening,controls:hallResults.controls},register:D.reduce((n,x)=>n+x.size,0),controls,original};
};
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const result=run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt"),read("resources/control/english_wordfreq_textblob.txt"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),{original:process.argv.includes("--original"),ms:Number(process.argv.find(x=>/^\d+$/.test(x))||10000)});
const out=JSON.stringify(result,null,2);console.log(out);if(process.env.SFT_OUTPUT)fs.writeFileSync(process.env.SFT_OUTPUT,out);
