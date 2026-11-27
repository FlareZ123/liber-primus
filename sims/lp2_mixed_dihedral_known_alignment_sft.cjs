"use strict";
// Known-plaintext/phase controls only; exact original structural transfer.
function run(native,corpus){
 const N=29,Q=8,mod=x=>(x%N+N)%N, inv=x=>{for(let i=1;i<N;i++)if(mod(i*x)===1)return i;throw Error("inverse")};
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const id=Array.from({length:N},(_,i)=>i);
 const words=native.sections.find(s=>s.name==="0_koan_1").source_text.match(/[\u16a0-\u16ff]+/gu).map(w=>Array.from(w,x=>native.runes.indexOf(x)));
 const source=words.flat(),train=source.slice(0,213),test=source.slice(213,299);
 let pos=0;const complete=[];for(let w of words){if(pos+w.length>213)break;complete.push({pos,n:w.length});pos+=w.length}
 const omitted=complete.slice().sort((a,b)=>b.n-a.n||a.pos-b.pos).slice(0,3);const hidden=new Set(omitted.flatMap(x=>Array.from({length:x.n},(_,i)=>x.pos+i)));
 function plant(seed,sign,canonical=false){
  let st=seed;const rng=n=>{st^=st<<13;st^=st>>>17;st^=st<<5;return (st>>>0)%n};
  const pi=id.slice();if(!canonical)for(let i=28;i>1;i--){let j=1+rng(i);[pi[i],pi[j]]=[pi[j],pi[i]]}
  const scale=inv(pi[1]);for(let i=0;i<N;i++)pi[i]=mod(pi[i]*scale);
  const ip=[];pi.forEach((v,i)=>ip[v]=i);const k=Array.from({length:Q},()=>rng(N));k[0]=1;k[1]=9;
  let j=0;const enc=(xs)=>xs.map(p=>{if(p===0)return {p,c:0,j,hold:true};const rec={p,c:ip[mod(sign[j]*pi[p]+k[j])],j,hold:false};j=(j+1)%Q;return rec});
  return {pi,k,sign,train:enc(train),held:enc(test)};
 }
 function infer(rec){
  const maps=Array.from({length:Q},()=>new Map());for(let e of rec)if(!e.hold){let m=maps[e.j];if(m.has(e.p)&&m.get(e.p)!==e.c)return {bad:true};m.set(e.p,e.c)}
  if(maps.some(m=>new Set(m.values()).size!==m.size))return {bad:true};
  const constraints=[];
  function relation(m,a,b){
   let fixed=0,moved=0,two=0,chain=0;
   for(let [x,y] of m){if(x===y){fixed++;continue}moved++;if(m.has(y)){let z=m.get(y);if(z===x)two++;else if(z!==y)chain++}}
   if(fixed>1&&moved)return false;
   if((two||fixed&&moved)&&chain)return false;
   if(two||fixed&&moved)constraints.push([a,b,-1]);
   else if(chain||fixed>1)constraints.push([a,b,1]);
   return true;
  }
  for(let i=0;i<Q;i++)if(!relation(maps[i],i,Q))return {bad:true};
  for(let i=0;i<Q;i++)for(let j=i+1;j<Q;j++){let m=new Map();for(let [p,c] of maps[i])if(maps[j].has(p))m.set(c,maps[j].get(p));if(!relation(m,i,j))return {bad:true}}
  let s=Array(Q+1).fill(0);s[Q]=1;let change=true;while(change){change=false;for(let [a,b,v] of constraints){if(s[a]&&s[b]&&s[a]*s[b]!==v)return {bad:true};if(s[a]&&!s[b]){s[b]=v*s[a];change=true}if(s[b]&&!s[a]){s[a]=v*s[b];change=true}}}
  return {sign:s.slice(0,Q),constraints:constraints.length,known:s.slice(0,Q).filter(Boolean).length,absolute:constraints.filter(x=>x[1]===Q).length};
 }
 function solve(rec,sign){
  const D=N+Q;const rows=[];
  const add=(terms,b=0)=>{let row=Array(D+1).fill(0);for(let [i,v] of terms)row[i]=mod(row[i]+v);row[D]=mod(b);rows.push(row)};
  add([[0,1]],0);add([[1,1]],1);
  for(let e of rec)if(!e.hold)add([[e.c,1],[e.p,-sign[e.j]],[N+e.j,-1]]);
  let rank=0,piv=[];
  for(let col=0;col<D;col++){let t=rows.findIndex((a,i)=>i>=rank&&a[col]!==0);if(t<0)continue;[rows[rank],rows[t]]=[rows[t],rows[rank]];const m=inv(rows[rank][col]);for(let j=col;j<=D;j++)rows[rank][j]=mod(rows[rank][j]*m);for(let i=0;i<rows.length;i++)if(i!==rank&&rows[i][col]){const v=rows[i][col];for(let j=col;j<=D;j++)rows[i][j]=mod(rows[i][j]-v*rows[rank][j])}piv.push(col);rank++}
  if(rows.some(a=>a.slice(0,D).every(x=>x===0)&&a[D]!==0))return {rank,inconsistent:true};
  if(rank!==D)return {rank,under:true};
  const sol=Array(D);piv.forEach((col,i)=>sol[col]=rows[i][D]);const pi=sol.slice(0,N),k=sol.slice(N);return {rank,pi,k,bijection:new Set(pi).size===N};
 }
 function heldPaths(p,i,sol){
  const ip=[];sol.pi.forEach((x,y)=>ip[x]=y);
  let paths=[{j:p.held[0].j,out:[]}];for(let e of p.held){const next=[];for(let s of paths){if(e.c===0)next.push({j:s.j,out:[...s.out,0]});const v=ip[mod(i.sign[s.j]*(sol.pi[e.c]-sol.k[s.j]))];if(v!==0)next.push({j:(s.j+1)%Q,out:[...s.out,v]})}paths=next}
  return {paths:paths.length,trueRetained:paths.some(x=>x.out.every((v,k)=>v===p.held[k].p)),visibleF:p.held.filter(e=>e.c===0).length};
 }
 const results=[];
 for(let x of [{seed:3301,s:[1,-1,1,-1,-1,1,1,-1]},{seed:1033,s:[-1,1,-1,1,1,-1,-1,1]},{seed:2014,s:Array(8).fill(1)},{seed:2016,s:[1,-1,1,-1,-1,1,1,-1],canonical:true}]){
  const p=plant(x.seed,x.s,x.canonical),cases=[];
  for(const drop of [false,true]){
   const rec=p.train.filter((_,i)=>!drop||!hidden.has(i)),i=infer(rec),sol=i.known===8?solve(rec,i.sign):null;
   const hold=sol?.bijection?heldPaths(p,i,sol):null;
   const oracleMask=sol?.bijection?p.held.filter(e=>e.hold||mod(sol.pi[e.c]-i.sign[e.j]*sol.pi[e.p]-sol.k[e.j])===0).length:null;
   cases.push({dropThreeKnownWords:drop,observations:rec.length,consuming:rec.filter(x=>!x.hold).length,inferred:i,rank:sol?.rank,chartRecovered:JSON.stringify(sol?.pi)===JSON.stringify(p.pi),kRecovered:JSON.stringify(sol?.k)===JSON.stringify(p.k),oracleMask,held:hold});
  }
  results.push({seed:x.seed,canonical:!!x.canonical,actual:x.s,cases});
 }
 const key=[19,21,23,27,2,14,10,19],body=corpus.pages[54].indices.slice(9);
 assert(JSON.stringify(corpus.pages[54].indices.slice(1,9))===JSON.stringify(key),"red8 source");
 const failures=[];for(let start=0;start<Q;start++){let states=new Set([start]);let off=-1;for(let n=0;n<body.length;n++){let c=body[n],next=new Set();for(let j of states){if(c===0)next.add(j);if(c!==key[j])next.add((j+1)%Q)}states=next;if(!states.size){off=n;break}}failures.push(off)}
 assert(JSON.stringify(failures)==="[7,1,86,0,77,17,3,10]","structural transfer");
 return {schema:"mixed-dihedral-known-alignment-v1",train:train.length,distinct:new Set(train).size,held:test.length,omitted,results,body:body.length,failures};
}
if(require.main===module){const fs=require("node:fs");const native=JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8"));const corpus=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));console.log(JSON.stringify(run(native,corpus),null,2));}
module.exports={run};
